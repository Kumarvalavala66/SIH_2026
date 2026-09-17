import csv
import os
from database import engine, Base, SessionLocal, Project

def migrate_csv_to_sqlite():
    # 1. Create the database tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

    db = SessionLocal()
    
    # 2. Clear out any existing rows so we don't duplicate on multiple runs
    db.query(Project).delete()
    
    # 3. Read the CSV and populate the database
    csv_path = os.path.join(os.path.dirname(__file__), "data", "projects.csv")
    
    with open(csv_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            db_project = Project(
                project_id=row["project_id"],
                district=row["district"],
                state=row["state"],
                work_type=row["work_type"],
                sanctioned_amount=float(row["sanctioned_amount"]),
                spent_amount=float(row["spent_amount"]),
                physical_progress=int(row["physical_progress"]),
                planned_days=int(row["planned_days"]),
                actual_days=int(row["actual_days"]),
                inspection_count=int(row["inspection_count"]),
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"])
            )
            db.add(db_project)
            
    db.commit()
    db.close()
    print("Successfully migrated all CSV data into SQLite database (sih_projects.db)!")

if __name__ == "__main__":
    migrate_csv_to_sqlite()