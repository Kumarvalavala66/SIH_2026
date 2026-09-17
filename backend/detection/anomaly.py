def analyze_projects(data):
    results = []
    for row in data:
        risk_score = 0
        reasons = []

        spending_ratio = int(row["spent_amount"]) / int(row["sanctioned_amount"]) if int(row["sanctioned_amount"]) > 0 else 0
        progress = int(row["physical_progress"])
        
        if spending_ratio > 0.75 and progress < 50:
            risk_score += 40
            reasons.append("High expenditure with low physical progress")

        if int(row["actual_days"]) > int(row["planned_days"]):
            risk_score += 20
            reasons.append("Project timeline exceeded planned days")
            
        if int(row["inspection_count"]) == 0:
            risk_score += 15
            reasons.append("No inspections recorded")

        results.append({
            "project_id": row["project_id"],
            "district": row["district"],
            "state": row.get("state", "Andhra Pradesh"),
            "work_type": row["work_type"],
            "sanctioned_amount": int(row["sanctioned_amount"]),
            "spent_amount": int(row["spent_amount"]),
            "physical_progress": int(row["physical_progress"]),
            "risk_score": risk_score,
            "reasons": reasons,
            "latitude": float(row["latitude"]) if row.get("latitude") else None,
            "longitude": float(row["longitude"]) if row.get("longitude") else None
        })
    return results