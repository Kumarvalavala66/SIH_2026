def detect_ml_anomalies(data):
    results = []
    for row in data:
        sanctioned = int(row["sanctioned_amount"])
        spent = int(row["spent_amount"])
        progress = int(row["physical_progress"])
        
        spending_ratio = spent / sanctioned if sanctioned > 0 else 0
        
        # Simple ML mockup logic: Flag if spending is disproportionately ahead of physical progress
        progress_gap = (spending_ratio * 100) - progress
        ml_anomaly = progress_gap > 30 
        
        results.append({
            "project_id": row["project_id"],
            "ml_anomaly": ml_anomaly,
            "spending_ratio": spending_ratio,
            "progress_gap": progress_gap
        })
    return results