from difflib import SequenceMatcher

def detect_duplicates(data):
    duplicates = []
    
    for i in range(len(data)):
        for j in range(i + 1, len(data)):
            p1 = data[i]
            p2 = data[j]
            
            if p1["district"] == p2["district"]:
                similarity = SequenceMatcher(None, p1["work_type"].lower(), p2["work_type"].lower()).ratio()
                
                amt1 = int(p1["sanctioned_amount"])
                amt2 = int(p2["sanctioned_amount"])
                
                max_amt = max(amt1, amt2)
                amt_diff = abs(amt1 - amt2) / max_amt if max_amt > 0 else 0

                if similarity > 0.8 or (similarity > 0.6 and amt_diff < 0.05):
                    duplicates.append({
                        "project_1": p1["project_id"],
                        "project_2": p2["project_id"],
                        "reason": f"{int(similarity*100)}% match on '{p1['work_type']}'"
                    })
                    
    return duplicates