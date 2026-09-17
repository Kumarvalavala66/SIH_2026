import csv
import random

random.seed(42)

# Comprehensive district headquarters coordinates (Decimal Degrees)
DISTRICT_COORDS = {
    # Andhra Pradesh
    "Anantapur": (14.6819, 77.6006),
    "Chittoor": (13.2172, 79.1003),
    "East Godavari": (17.0005, 81.8040),
    "Guntur": (16.3067, 80.4365),
    "Krishna": (16.1687, 81.1323),
    "Kurnool": (15.8281, 78.0373),
    "NTR": (16.5062, 80.6480),
    "Sri Potti Sriramulu Nellore": (14.4426, 79.9865),
    "Visakhapatnam": (17.6868, 83.2185),
    "Vizianagaram": (18.1124, 83.3989),
    "YSR Kadapa": (14.4712, 78.8243),
    
    # Assam
    "Kamrup Metropolitan": (26.1445, 91.7362),
    "Dibrugarh": (27.4728, 94.9120),
    "Jorhat": (26.7509, 94.2037),

    # Bihar
    "Patna": (25.5941, 85.1376),
    "Gaya": (24.7955, 85.0004),
    "Muzaffarpur": (26.1209, 85.3647),
    "Bhagalpur": (25.2425, 86.9718),

    # Delhi & NCR
    "New Delhi": (28.6139, 77.2090),
    "North Delhi": (28.8428, 77.0910),

    # Gujarat
    "Ahmedabad": (23.0225, 72.5714),
    "Surat": (21.1702, 72.8311),
    "Vadodara": (22.3072, 73.1812),
    "Rajkot": (22.3039, 70.8022),
    "Kutch": (23.2420, 69.6669),

    # Haryana
    "Gurugram": (28.4595, 77.0266),
    "Faridabad": (28.4089, 77.3178),
    "Ambala": (30.3782, 76.7767),

    # Karnataka
    "Bengaluru Urban": (12.9716, 77.5946),
    "Mysuru": (12.2958, 76.6394),
    "Dharwad": (15.4589, 75.0078),
    "Dakshina Kannada": (12.9141, 74.8560),
    "Belagavi": (15.8497, 74.4977),

    # Kerala
    "Thiruvananthapuram": (8.5241, 76.9366),
    "Ernakulam": (9.9312, 76.2673),
    "Kozhikode": (11.2588, 75.7804),
    "Malappuram": (11.0734, 76.0711),

    # Madhya Pradesh
    "Indore": (22.7196, 75.8577),
    "Bhopal": (23.2599, 77.4126),
    "Jabalpur": (23.1815, 79.9864),
    "Gwalior": (26.2183, 78.1828),

    # Maharashtra
    "Mumbai City": (18.9690, 72.8210),
    "Pune": (18.5204, 73.8567),
    "Nagpur": (21.1458, 79.0882),
    "Thane": (19.2183, 72.9781),
    "Nashik": (19.9975, 73.7898),
    "Aurangabad": (19.8762, 75.3433),

    # Odisha
    "Khurda": (20.2961, 85.8245),
    "Cuttack": (20.4625, 85.8830),
    "Ganjam": (19.3550, 84.9880),

    # Punjab
    "Amritsar": (31.6340, 74.8723),
    "Ludhiana": (30.9010, 75.8573),
    "Jalandhar": (31.3260, 75.5762),

    # Rajasthan
    "Jaipur": (26.9124, 75.7873),
    "Jodhpur": (26.2389, 73.0243),
    "Udaipur": (24.5854, 73.7125),
    "Kota": (25.2138, 75.8648),

    # Tamil Nadu
    "Chennai": (13.0827, 80.2707),
    "Coimbatore": (11.0168, 76.9558),
    "Madurai": (9.9252, 78.1198),
    "Tiruchirappalli": (10.7905, 78.7047),
    "Salem": (11.6643, 78.1460),

    # Telangana
    "Hyderabad": (17.3850, 78.4867),
    "Medchal-Malkajgiri": (17.5256, 78.6838),
    "Rangareddy": (17.2405, 78.4294),
    "Warangal": (17.9689, 79.5941),

    # Uttar Pradesh
    "Lucknow": (26.8467, 80.9462),
    "Kanpur Nagar": (26.4499, 80.3319),
    "Gautam Buddha Nagar": (28.5355, 77.3910),
    "Prayagraj": (25.4358, 81.8463),
    "Varanasi": (25.3176, 82.9739),
    "Agra": (27.1767, 78.0081),
    "Ghaziabad": (28.6692, 77.4538),

    # West Bengal
    "Kolkata": (22.5726, 88.3639),
    "North 24 Parganas": (22.7223, 88.4853),
    "South 24 Parganas": (22.5310, 88.3196),
    "Darjeeling": (27.0410, 88.2627)
}

# Reverse mapping to look up state by district name automatically
DISTRICT_TO_STATE = {
    "Anantapur": "Andhra Pradesh", "Chittoor": "Andhra Pradesh", "East Godavari": "Andhra Pradesh",
    "Guntur": "Andhra Pradesh", "Krishna": "Andhra Pradesh", "Kurnool": "Andhra Pradesh",
    "NTR": "Andhra Pradesh", "Sri Potti Sriramulu Nellore": "Andhra Pradesh", "Visakhapatnam": "Andhra Pradesh",
    "Vizianagaram": "Andhra Pradesh", "YSR Kadapa": "Andhra Pradesh",
    
    "Kamrup Metropolitan": "Assam", "Dibrugarh": "Assam", "Jorhat": "Assam",
    
    "Patna": "Bihar", "Gaya": "Bihar", "Muzaffarpur": "Bihar", "Bhagalpur": "Bihar",
    
    "New Delhi": "Delhi", "North Delhi": "Delhi",
    
    "Ahmedabad": "Gujarat", "Surat": "Gujarat", "Vadodara": "Gujarat", "Rajkot": "Gujarat", "Kutch": "Gujarat",
    
    "Gurugram": "Haryana", "Faridabad": "Haryana", "Ambala": "Haryana",
    
    "Bengaluru Urban": "Karnataka", "Mysuru": "Karnataka", "Dharwad": "Karnataka", "Dakshina Kannada": "Karnataka", "Belagavi": "Karnataka",
    
    "Thiruvananthapuram": "Kerala", "Ernakulam": "Kerala", "Kozhikode": "Kerala", "Malappuram": "Kerala",
    
    "Indore": "Madhya Pradesh", "Bhopal": "Madhya Pradesh", "Jabalpur": "Madhya Pradesh", "Gwalior": "Madhya Pradesh",
    
    "Mumbai City": "Maharashtra", "Pune": "Maharashtra", "Nagpur": "Maharashtra", "Thane": "Maharashtra", "Nashik": "Maharashtra", "Aurangabad": "Maharashtra",
    
    "Khurda": "Odisha", "Cuttack": "Odisha", "Ganjam": "Odisha",
    
    "Amritsar": "Punjab", "Ludhiana": "Punjab", "Jalandhar": "Punjab",
    
    "Jaipur": "Rajasthan", "Jodhpur": "Rajasthan", "Udaipur": "Rajasthan", "Kota": "Rajasthan",
    
    "Chennai": "Tamil Nadu", "Coimbatore": "Tamil Nadu", "Madurai": "Tamil Nadu", "Tiruchirappalli": "Tamil Nadu", "Salem": "Tamil Nadu",
    
    "Hyderabad": "Telangana", "Medchal-Malkajgiri": "Telangana", "Rangareddy": "Telangana", "Warangal": "Telangana",
    
    "Lucknow": "Uttar Pradesh", "Kanpur Nagar": "Uttar Pradesh", "Gautam Buddha Nagar": "Uttar Pradesh", "Prayagraj": "Uttar Pradesh", "Varanasi": "Uttar Pradesh", "Agra": "Uttar Pradesh", "Ghaziabad": "Uttar Pradesh",
    
    "Kolkata": "West Bengal", "North 24 Parganas": "West Bengal", "South 24 Parganas": "West Bengal", "Darjeeling": "West Bengal"
}

districts = list(DISTRICT_COORDS.keys())

work_types = [
    "Road",
    "School Building",
    "Community Hall",
    "Drinking Water",
    "Street Lighting",
    "Drainage",
    "Library",
]

rows = []

for i in range(1, 201):
    sanctioned = random.randint(500000, 5000000)

    # Most projects behave relatively normally
    progress = random.randint(60, 100)
    spending_ratio = random.uniform(0.50, 0.90)

    planned_days = random.randint(90, 360)
    actual_days = int(
        planned_days * random.uniform(0.8, 1.3)
    )

    inspections = random.randint(2, 8)

    # Introduce unusual projects
    if i % 20 == 0:
        progress = random.randint(20, 55)
        spending_ratio = random.uniform(0.92, 1.0)
        actual_days = int(
            planned_days * random.uniform(1.6, 2.5)
        )
        inspections = random.randint(0, 1)

    spent = int(sanctioned * spending_ratio)
    chosen_district = random.choice(districts)
    chosen_state = DISTRICT_TO_STATE.get(chosen_district, "Andhra Pradesh")
    
    # Get base district coordinates and apply an organic scatter offset
    base_lat, base_lon = DISTRICT_COORDS[chosen_district]
    latitude = round(base_lat + random.uniform(-0.25, 0.25), 4)
    longitude = round(base_lon + random.uniform(-0.25, 0.25), 4)

    rows.append([
        f"MPL{i:03d}",
        chosen_district,
        chosen_state,
        random.choice(work_types),
        sanctioned,
        spent,
        progress,
        planned_days,
        actual_days,
        inspections,
        float(latitude),
        float(longitude),
    ])

with open(
    "backend/data/projects.csv",
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.writer(file)

    writer.writerow([
        "project_id",
        "district",
        "state",
        "work_type",
        "sanctioned_amount",
        "spent_amount",
        "physical_progress",
        "planned_days",
        "actual_days",
        "inspection_count",
        "latitude",
        "longitude",
    ])

    writer.writerows(rows)

print("Generated 200 synthetic projects with multi-state backend coordinates.")