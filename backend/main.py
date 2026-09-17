from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, Project
from detection.anomaly import analyze_projects
from detection.ml_anomaly import detect_ml_anomalies
from detection.duplicate import detect_duplicates
from detection.inefficiency import analyze_inefficiency

app = FastAPI(title="MPLADS AI Monitoring API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    # 1. Fetch all projects from the SQLite database
    db_projects = db.query(Project).all()
    
    # 2. Convert SQLAlchemy objects to standard dictionaries for the AI modules
    projects_data = []
    for p in db_projects:
        projects_data.append({
            "project_id": p.project_id,
            "district": p.district,
            "state": p.state,
            "work_type": p.work_type,
            "sanctioned_amount": p.sanctioned_amount,
            "spent_amount": p.spent_amount,
            "physical_progress": p.physical_progress,
            "planned_days": p.planned_days,
            "actual_days": p.actual_days,
            "inspection_count": p.inspection_count,
            "latitude": p.latitude,
            "longitude": p.longitude
        })

    # 3. Run detection algorithms directly on the live database records
    rule_results = analyze_projects(projects_data)
    ml_results = detect_ml_anomalies(projects_data)
    duplicate_results = detect_duplicates(projects_data)
    inefficiency_results = analyze_inefficiency(projects_data)

    ml_lookup = {item["project_id"]: item for item in ml_results}
    inefficiency_lookup = {item["project_id"]: item for item in inefficiency_results}

    duplicate_lookup = {}
    for duplicate in duplicate_results:
        p1 = duplicate["project_1"]
        p2 = duplicate["project_2"]
        duplicate_lookup.setdefault(p1, []).append(p2)
        duplicate_lookup.setdefault(p2, []).append(p1)

    # 4. Merge results for the frontend payload
    for project in rule_results:
        project_id = project["project_id"]
        
        # Merge ML data safely
        ml_data = ml_lookup.get(project_id, {"ml_anomaly": False, "spending_ratio": 0.0, "progress_gap": 0})
        project["ml_anomaly"] = ml_data["ml_anomaly"]
        ml_score = 100 if ml_data["ml_anomaly"] else 0
        combined_score = (project["risk_score"] * 0.70) + (ml_score * 0.30)
        project["combined_risk_score"] = round(combined_score)

        if project["combined_risk_score"] >= 70:
            project["combined_risk_level"] = "HIGH"
        elif project["combined_risk_score"] >= 40:
            project["combined_risk_level"] = "MEDIUM"
        else:
            project["combined_risk_level"] = "LOW"

        project["spending_ratio"] = round(ml_data["spending_ratio"], 2)
        project["progress_gap"] = ml_data["progress_gap"]
        project["potential_duplicates"] = duplicate_lookup.get(project_id, [])

        # Merge inefficiency data safely
        efficiency_data = inefficiency_lookup.get(project_id, {
            "delay_days": 0, "delay_ratio": 1.0, "progress_per_day": 0, 
            "efficiency_flag": "LOW", "efficiency_reasons": []
        })
        project["delay_days"] = efficiency_data["delay_days"]
        project["delay_ratio"] = efficiency_data["delay_ratio"]
        project["progress_per_day"] = efficiency_data["progress_per_day"]
        project["efficiency_flag"] = efficiency_data["efficiency_flag"]
        project["efficiency_reasons"] = efficiency_data["efficiency_reasons"]

    return rule_results