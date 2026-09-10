"""
CrimeGraph AI — Synthetic Crime Dataset Generator
Generates 13 comprehensive, highly correlated criminal investigation datasets
spanning 25 cases, 60+ individuals, telecoms, financial wires, vehicle movements,
tactical surveillance, and FIR narratives.
"""

import os
import csv
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "synthetic")
os.makedirs(DATA_DIR, exist_ok=True)

random.seed(42)

def generate_all_datasets():
    print(f"Generating synthetic crime datasets in {DATA_DIR}...")

    # 1. PERSONS
    persons = [
        {"person_id": "P001", "full_name": "Ravi Kumar", "alias": "The Handler", "risk_category": "High Risk", "occupation": "Logistics Broker", "dob": "1982-04-12", "national_id": "NAT-99281", "notes": "Primary coordinator for maritime contraband."},
        {"person_id": "P002", "full_name": "Arjun Singh", "alias": "Driver", "risk_category": "Medium Risk", "occupation": "Transport Driver", "dob": "1989-11-23", "national_id": "NAT-44102", "notes": "Intercepted driving carrier vehicle MH-04-CD-8819."},
        {"person_id": "P003", "full_name": "Deepak Verma", "alias": "Courier", "risk_category": "Medium Risk", "occupation": "Dockworker", "dob": "1991-02-15", "national_id": "NAT-88319", "notes": "Assists in offloading container shipments."},
        {"person_id": "P004", "full_name": "Manish Gupta", "alias": "Cashier", "risk_category": "Medium Risk", "occupation": "Hawala Agent", "dob": "1978-08-30", "national_id": "NAT-11029", "notes": "Distributes cash disbursements at dockside."},
        {"person_id": "P005", "full_name": "Suresh Nair", "alias": "Customs Clerk", "risk_category": "High Risk", "occupation": "Port Inspector", "dob": "1975-06-19", "national_id": "NAT-55291", "notes": "Facilitates clearance stamps without physical inspection."},
        {"person_id": "P017", "full_name": "Priya Sharma", "alias": "Cipher", "risk_category": "Critical Risk", "occupation": "FinTech Consultant", "dob": "1988-09-14", "national_id": "NAT-77182", "notes": "CRITICAL BRIDGE: Links maritime smuggling (FIR-1024) to cyber extortion & money laundering (FIR-1098)."},
        {"person_id": "P023", "full_name": "Sameer Khan", "alias": "Ghost", "risk_category": "High Risk", "occupation": "Software Developer", "dob": "1993-01-08", "national_id": "NAT-33019", "notes": "Lead technical operator for ransomware extortion campaign."},
        {"person_id": "P024", "full_name": "John Mathew", "alias": "Director", "risk_category": "High Risk", "occupation": "Corporate Director", "dob": "1980-07-21", "national_id": "NAT-66291", "notes": "Manages shell entities including Zenith Global Solutions."},
        {"person_id": "P025", "full_name": "Rohit Deshmukh", "alias": "Crypto Mule", "risk_category": "Medium Risk", "occupation": "Accountant", "dob": "1994-05-18", "national_id": "NAT-22910", "notes": "Converts extortion proceeds into shell banking accounts."},
        {"person_id": "P031", "full_name": "Vikram Rathore", "alias": "Captain", "risk_category": "High Risk", "occupation": "Vessel Master", "dob": "1972-12-05", "national_id": "NAT-99014", "notes": "Navigates coastal dhow routes for gold deliveries."},
        {"person_id": "P040", "full_name": "Karan Patel", "alias": "Fixer", "risk_category": "Medium Risk", "occupation": "Real Estate Agent", "dob": "1985-03-29", "national_id": "NAT-88192", "notes": "Leases tactical safehouses and storage units."}
    ]
    # Add filler persons up to 60
    for i in range(12, 61):
        pid = f"P{i:03d}"
        if pid not in [p["person_id"] for p in persons]:
            persons.append({
                "person_id": pid,
                "full_name": f"Operative {pid}",
                "alias": f"Alias_{pid}",
                "risk_category": random.choice(["Low Risk", "Medium Risk", "Standard"]),
                "occupation": random.choice(["Driver", "Trader", "Technician", "Consultant", "Clerk"]),
                "dob": f"198{random.randint(0,9)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                "national_id": f"NAT-{random.randint(10000, 99999)}",
                "notes": f"Network operative recorded under regional surveillance."
            })

    # 2. PHONES
    phones = [
        {"phone_id": "PH-9811", "phone_number": "+91-98112-90124", "registered_owner_id": "P001", "carrier": "Airtel", "imei": "358920194819201", "device_model": "Samsung S22"},
        {"phone_id": "PH-9876", "phone_number": "+91-98765-43210", "registered_owner_id": "P017", "carrier": "Jio", "imei": "862910492819402", "device_model": "iPhone 14 Pro"},
        {"phone_id": "PH-3301", "phone_number": "+91-99330-14920", "registered_owner_id": "P023", "carrier": "Vodafone", "imei": "359182049182041", "device_model": "Google Pixel 7"},
        {"phone_id": "PH-4410", "phone_number": "+91-98441-02918", "registered_owner_id": "P002", "carrier": "Airtel", "imei": "351029481920491", "device_model": "Redmi Note 11"},
        {"phone_id": "PH-6629", "phone_number": "+91-98662-91024", "registered_owner_id": "P024", "carrier": "Jio", "imei": "861920491820391", "device_model": "OnePlus 11"}
    ]
    for p in persons[5:]:
        phones.append({
            "phone_id": f"PH-{random.randint(1000,9999)}",
            "phone_number": f"+91-98{random.randint(10,99)}-{random.randint(10000,99999)}",
            "registered_owner_id": p["person_id"],
            "carrier": random.choice(["Airtel", "Jio", "Vodafone", "BSNL"]),
            "imei": f"{random.randint(350000000000000, 869999999999999)}",
            "device_model": random.choice(["Samsung M33", "Vivo V27", "Oppo Reno", "Redmi 12"])
        })

    # 3. VEHICLES
    vehicles = [
        {"vehicle_id": "VEH-001", "registration_number": "MH-04-CD-8819", "make_model": "Mahindra Bolero Pickup", "vehicle_type": "Commercial Carrier", "color": "White", "registered_owner_id": "P002"},
        {"vehicle_id": "VEH-002", "registration_number": "MH-02-EF-9921", "make_model": "Hyundai Creta", "vehicle_type": "SUV", "color": "Phantom Black", "registered_owner_id": "P017"},
        {"vehicle_id": "VEH-003", "registration_number": "DL-01-AB-3301", "make_model": "Honda City", "vehicle_type": "Sedan", "color": "Silver", "registered_owner_id": "P023"},
        {"vehicle_id": "VEH-004", "registration_number": "MH-01-XY-5529", "make_model": "Tata Ace", "vehicle_type": "Light Commercial", "color": "Blue", "registered_owner_id": "P003"},
        {"vehicle_id": "VEH-005", "registration_number": "HR-26-ZZ-6629", "make_model": "Toyota Fortuner", "vehicle_type": "SUV", "color": "Pearl White", "registered_owner_id": "P024"}
    ]
    for i in range(6, 25):
        vid = f"VEH-{i:03d}"
        vehicles.append({
            "vehicle_id": vid,
            "registration_number": f"MH-{random.randint(1,12):02d}-AZ-{random.randint(1000,9999)}",
            "make_model": random.choice(["Maruti Swift", "Tata Nexon", "Kia Seltos", "Mahindra Scorpio"]),
            "vehicle_type": "Automobile",
            "color": random.choice(["White", "Silver", "Grey", "Black"]),
            "registered_owner_id": f"P{random.randint(1, len(persons)):03d}"
        })

    # 4. LOCATIONS
    locations = [
        {"location_id": "LOC-001", "name": "West Port Container Terminal B", "location_type": "Port Facility", "address": "Dock 4, JNPT Corridor, Navi Mumbai", "city": "Navi Mumbai", "latitude": "18.9498", "longitude": "72.9511", "risk_level": "High"},
        {"location_id": "LOC-004", "name": "Warehouse 4 (Dockland Industrial Estate)", "location_type": "Storage Facility", "address": "Plot 18, Dockland Estate, Cotton Green", "city": "Mumbai", "latitude": "18.9872", "longitude": "72.8519", "risk_level": "Critical"},
        {"location_id": "LOC-012", "name": "MG Road Safehouse", "location_type": "Residential Unit", "address": "Flat 402, Royal Palms, 104 MG Road", "city": "Pune", "latitude": "18.5204", "longitude": "73.8567", "risk_level": "High"},
        {"location_id": "LOC-019", "name": "Cyber City Tech Park Tower C", "location_type": "Commercial Office", "address": "8th Floor, DLF Cyber City Tower C", "city": "Gurugram", "latitude": "28.4950", "longitude": "77.0895", "risk_level": "High"},
        {"location_id": "LOC-025", "name": "State Highway 9 Checkpoint", "location_type": "Transit Checkpoint", "address": "Toll Plaza Km 42, State Highway 9", "city": "Alibaug", "latitude": "18.6582", "longitude": "72.8710", "risk_level": "Medium"},
        {"location_id": "LOC-030", "name": "South Coast Cargo Anchorage", "location_type": "Maritime Anchorage", "address": "Outer Anchorage Sector 3", "city": "Ratnagiri", "latitude": "16.9902", "longitude": "73.2810", "risk_level": "High"}
    ]

    # 5. ORGANIZATIONS
    organizations = [
        {"organization_id": "ORG-001", "name": "Golden Horizon Trading Pvt Ltd", "org_type": "Import / Export Shell", "registration_number": "U51909MH2021PTC361029", "status": "Active (Suspect)", "key_controller_id": "P001"},
        {"organization_id": "ORG-002", "name": "SeaTrack Logistics & Freight", "org_type": "Freight Forwarder", "registration_number": "U63030MH2019PTC320194", "status": "Active", "key_controller_id": "P001"},
        {"organization_id": "ORG-005", "name": "Zenith Global Solutions Ltd", "org_type": "IT Services Shell", "registration_number": "U72200DL2022PLC391024", "status": "Active (Suspect)", "key_controller_id": "P024"},
        {"organization_id": "ORG-008", "name": "Apex FinTech Advisory LLP", "org_type": "Financial Consultancy", "registration_number": "AAT-4419", "status": "Active (Suspect)", "key_controller_id": "P017"},
        {"organization_id": "ORG-010", "name": "Falcon Secure Transit Logistics", "org_type": "Armored Transport", "registration_number": "U60231MH2020PTC341029", "status": "Active", "key_controller_id": "P040"}
    ]

    # 6. BANK ACCOUNTS
    bank_accounts = [
        {"account_id": "ACC-9921", "account_number": "551920394817", "bank_name": "Axis Bank", "ifsc": "UTIB0001042", "holder_id": "ORG-008", "account_holder_type": "Organization", "current_balance_inr": "8420000.00"},
        {"account_id": "ACC-2005", "account_number": "881920394820", "bank_name": "ICICI Bank", "ifsc": "ICIC0000921", "holder_id": "ORG-005", "account_holder_type": "Organization", "current_balance_inr": "14900000.00"},
        {"account_id": "ACC-1001", "account_number": "002910492819", "bank_name": "HDFC Bank", "ifsc": "HDFC0000128", "holder_id": "ORG-001", "account_holder_type": "Organization", "current_balance_inr": "3210000.00"},
        {"account_id": "ACC-5001", "account_number": "910294810294", "bank_name": "State Bank of India", "ifsc": "SBIN0004410", "holder_id": "P001", "account_holder_type": "Person", "current_balance_inr": "780000.00"},
        {"account_id": "ACC-5017", "account_number": "771829401928", "bank_name": "Kotak Mahindra Bank", "ifsc": "KKBK0000419", "holder_id": "P017", "account_holder_type": "Person", "current_balance_inr": "5400000.00"}
    ]

    # 7. CASES
    cases = [
        {"case_id": "FIR-1024", "case_number": "CR-2026-MH-1024", "title": "West Coast Maritime Gold Smuggling & Hawala Conduit", "crime_type": "Contraband Smuggling & Customs Fraud", "jurisdiction": "Mumbai Port Zone / Maharashtra", "filing_date": "2026-05-14", "status": "Under Investigation", "lead_investigator": "Insp. Vikramaditya Salunkhe", "summary": "Intercept of 48kg smuggled bullion arriving via container terminal concealed in industrial machinery consignment."},
        {"case_id": "FIR-1098", "case_number": "CR-2026-DL-1098", "title": "Cyber City Corporate Extortion & Crypto Laundering Ring", "crime_type": "Cyber Extortion & Money Laundering", "jurisdiction": "Cyber Crime Special Cell / Delhi-NCR", "filing_date": "2026-05-22", "status": "Under Investigation", "lead_investigator": "ACP Neha Rathore", "summary": "Multi-crore ransomware extortion demanding payment laundered through shell corporate entities and layered wire transfers."},
        {"case_id": "FIR-1055", "case_number": "CR-2026-MH-1055", "title": "Illicit Armored Transport & Hawala Cash Transit", "crime_type": "Illegal Financial Courier", "jurisdiction": "Pune Crime Branch", "filing_date": "2026-04-10", "status": "Active", "lead_investigator": "Insp. R. Kulkarni", "summary": "Interception of cash courier transit vehicles along State Highway corridors."},
        {"case_id": "FIR-1102", "case_number": "CR-2026-KA-1102", "title": "Coastal Dhow Narcotics Anchorage Network", "crime_type": "Narcotics Trafficking", "jurisdiction": "Coastal Security Group / Mangalore", "filing_date": "2026-06-01", "status": "Active", "lead_investigator": "DSP B. Shetty", "summary": "Unregistered maritime dhow intercepts exchanging satellite-coordinated cargo packages."}
    ]
    # Add cases up to 25
    for i in range(5, 26):
        cid = f"FIR-{1000 + i*7}"
        cases.append({
            "case_id": cid,
            "case_number": f"CR-2026-IND-{cid}",
            "title": f"Regional Organized Syndicate Case #{i}",
            "crime_type": random.choice(["Financial Fraud", "Cargo Theft", "Identity Forgery", "Smuggling Conduit", "Extortion"]),
            "jurisdiction": random.choice(["Mumbai Central", "Delhi Cyber Cell", "Gujarat Maritime", "Bengaluru Cyber", "Kolkata Port"]),
            "filing_date": f"2026-0{random.randint(1,6)}-{random.randint(10,28)}",
            "status": "Under Review",
            "lead_investigator": f"Insp. Officer_{i}",
            "summary": f"Investigation into organized criminal activity recorded under case {cid}."
        })

    # 8. FIR REPORTS
    fir_reports = [
        {
            "report_id": "REP-FIR-1024-01",
            "case_id": "FIR-1024",
            "full_narrative_text": (
                "On 14 May 2026, intelligence operatives intercepted vehicle MH-04-CD-8819 operated by Arjun Singh (P002) near West Port. "
                "The carrier transported concealed gold bullion billets. During questioning, Arjun Singh disclosed operating under instructions from Ravi Kumar (P001, phone +91-98112-90124) "
                "of Golden Horizon Trading Pvt Ltd. Ravi coordinated logistics with Priya Sharma (P017, phone +91-98765-43210), who frequently visited Warehouse 4 at Dockland Industrial Estate."
            ),
            "recording_officer": "Sub-Insp. A. Shinde",
            "filing_station": "Yellow Gate Marine Police Station",
            "evidence_items_count": 8
        },
        {
            "report_id": "REP-FIR-1098-01",
            "case_id": "FIR-1098",
            "full_narrative_text": (
                "Cyber Crime Special Cell received complaint regarding targeted ransomware attack against healthtech conglomerate. "
                "Technical attribution traced communication to Sameer Khan (P023, phone +91-99330-14920) operating from Cyber City Tech Park Tower C. "
                "Ransom proceeds totaling Rs 24,00,000 were wired from account ACC-9921 (Apex FinTech Advisory LLP) to account ACC-2005 (Zenith Global Solutions Ltd, directed by John Mathew P024). "
                "Phone subscriber records establish that Priya Sharma (P017) conducted multiple bilateral encrypted calls with Sameer Khan."
            ),
            "recording_officer": "Insp. M. Tanwar",
            "filing_station": "Cyber Crime Special Cell, Mandir Marg",
            "evidence_items_count": 12
        }
    ]

    # 9. CASE EVENTS
    case_events = [
        {"event_id": "EVT-1024-01", "case_id": "FIR-1024", "event_title": "Intercept of Carrier Vehicle MH-04-CD-8819", "timestamp": "2026-05-14 04:30:00", "location_id": "LOC-001", "description": "Vehicle intercepted carrying 48kg concealed bullion."},
        {"event_id": "EVT-1024-02", "case_id": "FIR-1024", "event_title": "Raid on Warehouse 4 Storage Unit", "timestamp": "2026-05-14 11:00:00", "location_id": "LOC-004", "description": "Found custom machinery packing crates matching shipping manifest."},
        {"event_id": "EVT-1098-01", "case_id": "FIR-1098", "event_title": "Extortion Demand Notice Received", "timestamp": "2026-05-17 09:15:00", "location_id": "LOC-019", "description": "Ransomware encryption key offer sent from ProtonMail domain."},
        {"event_id": "EVT-1098-02", "case_id": "FIR-1098", "event_title": "Inter-Bank Wire Transfer TX-004 Executed", "timestamp": "2026-05-20 14:40:00", "location_id": "LOC-019", "description": "RTGS wire of Rs 24,00,000 from ACC-9921 to ACC-2005."}
    ]

    # 10. COMMUNICATIONS (CDRs)
    communications = [
        {"comm_id": "C-001", "caller_phone_id": "PH-9811", "receiver_phone_id": "PH-4410", "timestamp": "2026-05-14 03:15:00", "duration_seconds": 180, "cell_tower_source": "TWR-JNPT-01", "call_type": "VOICE", "case_id": "FIR-1024"},
        {"comm_id": "C-002", "caller_phone_id": "PH-9811", "receiver_phone_id": "PH-9876", "timestamp": "2026-05-13 18:40:00", "duration_seconds": 420, "cell_tower_source": "TWR-MUM-104", "call_type": "VOICE", "case_id": "FIR-1024"},
        {"comm_id": "C-020", "caller_phone_id": "PH-9876", "receiver_phone_id": "PH-3301", "timestamp": "2026-05-18 21:10:45", "duration_seconds": 640, "cell_tower_source": "TWR-MUM-104", "call_type": "VOICE", "case_id": "FIR-1024 / FIR-1098"},
        {"comm_id": "C-021", "caller_phone_id": "PH-9876", "receiver_phone_id": "PH-3301", "timestamp": "2026-05-19 14:20:00", "duration_seconds": 310, "cell_tower_source": "TWR-MUM-104", "call_type": "VOICE", "case_id": "FIR-1024 / FIR-1098"},
        {"comm_id": "C-030", "caller_phone_id": "PH-3301", "receiver_phone_id": "PH-6629", "timestamp": "2026-05-20 11:05:00", "duration_seconds": 240, "cell_tower_source": "TWR-GGN-201", "call_type": "VOICE", "case_id": "FIR-1098"}
    ]

    # 11. FINANCIAL TRANSACTIONS
    financial_transactions = [
        {"transaction_id": "TX-001", "source_account_id": "ACC-1001", "destination_account_id": "ACC-5001", "amount_inr": "500000.00", "transaction_type": "NEFT", "timestamp": "2026-05-10 11:30:00", "utr_number": "HDFCN20260510001", "case_id": "FIR-1024"},
        {"transaction_id": "TX-004", "source_account_id": "ACC-9921", "destination_account_id": "ACC-2005", "amount_inr": "2400000.00", "transaction_type": "RTGS", "timestamp": "2026-05-20 14:40:00", "utr_number": "AXISRTGS2026052000492819", "case_id": "FIR-1024 / FIR-1098"},
        {"transaction_id": "TX-005", "source_account_id": "ACC-2005", "destination_account_id": "ACC-5017", "amount_inr": "850000.00", "transaction_type": "RTGS", "timestamp": "2026-05-21 16:15:00", "utr_number": "ICICIRTGS2026052100812", "case_id": "FIR-1098"}
    ]

    # 12. SURVEILLANCE RECORDS
    surveillance_records = [
        {"surveillance_id": "SURV-001", "target_entity_id": "P001", "location_id": "LOC-004", "vehicle_id": "VEH-001", "timestamp": "2026-05-12 20:30:00", "officer_notes": "P001 observed supervising crate unloading at Warehouse 4.", "case_id": "FIR-1024"},
        {"surveillance_id": "SURV-002", "target_entity_id": "P017", "location_id": "LOC-004", "vehicle_id": "VEH-002", "timestamp": "2026-05-13 22:15:00", "officer_notes": "P017 arrived in black Creta MH-02-EF-9921, handed sealed briefcase to P001.", "case_id": "FIR-1024 / FIR-1098"},
        {"surveillance_id": "SURV-003", "target_entity_id": "P023", "location_id": "LOC-019", "vehicle_id": "VEH-003", "timestamp": "2026-05-18 18:00:00", "officer_notes": "P023 accessed server room in Cyber City Tower C.", "case_id": "FIR-1098"}
    ]

    # 13. CRIMINAL HISTORY
    criminal_history = [
        {"record_id": "CRIM-001", "person_id": "P001", "offense_type": "Customs Smuggling", "sections": "Sec 135 Customs Act", "court_status": "Bail Granted", "year": "2021"},
        {"record_id": "CRIM-002", "person_id": "P002", "offense_type": "Contraband Transportation", "sections": "Sec 132 Customs Act", "court_status": "Convicted", "year": "2019"},
        {"record_id": "CRIM-003", "person_id": "P031", "offense_type": "Maritime Maritime Violations", "sections": "Merchant Shipping Act Sec 334", "court_status": "Charge-sheeted", "year": "2023"}
    ]

    # Write all CSV files
    table_map = {
        "persons.csv": persons,
        "phones.csv": phones,
        "vehicles.csv": vehicles,
        "locations.csv": locations,
        "organizations.csv": organizations,
        "bank_accounts.csv": bank_accounts,
        "cases.csv": cases,
        "fir_reports.csv": fir_reports,
        "case_events.csv": case_events,
        "communications.csv": communications,
        "financial_transactions.csv": financial_transactions,
        "surveillance_records.csv": surveillance_records,
        "criminal_history.csv": criminal_history
    }

    for filename, data in table_map.items():
        filepath = os.path.join(DATA_DIR, filename)
        if data:
            keys = data[0].keys()
            with open(filepath, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(data)
            print(f"  - {filename}: {len(data)} records")

    print(f"[Done] Generated {len(table_map)} synthetic CSV datasets successfully!")

if __name__ == "__main__":
    generate_all_datasets()
