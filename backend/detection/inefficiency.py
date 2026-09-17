def analyze_inefficiency(data):
    results = []
    for row in data:
        planned = int(row["planned_days"])
        actual = int(row["actual_days"])
        progress = int(row["physical_progress"])
        
        delay_days = actual - planned
        delay_ratio = actual / planned if planned > 0 else 1.0
        progress_per_day = progress / actual if actual > 0 else 0
        
        efficiency_reasons = []
        if delay_ratio > 1.5:
            efficiency_reasons.append("Severe timeline overrun (>50% delayed)")
        if progress_per_day < 0.2:
            efficiency_reasons.append("Extremely slow daily progress")
            
        if len(efficiency_reasons) > 1:
            efficiency_flag = "LOW"
        elif len(efficiency_reasons) == 1:
            efficiency_flag = "MEDIUM"
        else:
            efficiency_flag = "HIGH"
            
        results.append({
            "project_id": row["project_id"],
            "delay_days": delay_days,
            "delay_ratio": round(delay_ratio, 2),
            "progress_per_day": round(progress_per_day, 2),
            "efficiency_flag": efficiency_flag,
            "efficiency_reasons": efficiency_reasons
        })
    return results