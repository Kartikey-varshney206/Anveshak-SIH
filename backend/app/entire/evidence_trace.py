"""
Entire Integration: Evidence Trace Engine
Reconstructs complete provenance and chain-of-custody from graph relationships
back to Bronze/Silver datasets and raw document records.
"""

from typing import List, Dict, Any, Optional
from backend.app.models.schemas import EvidenceDetail

class EvidenceTraceEngine:
    def __init__(self):
        # In-memory evidence cache index
        self.evidence_index: Dict[str, Dict[str, Any]] = {}
        self._initialize_evidence_records()

    def _initialize_evidence_records(self):
        records = [
            {
                "evidence_id": "EVD-CDR-020",
                "evidence_type": "Telecom CDR Intercept",
                "title": "Bilateral Inter-State Call Series between PH-9876 and PH-3301",
                "summary": "Multiple long-duration calls between Priya Sharma (Mumbai cell tower) and Sameer Khan (Gurugram cell tower).",
                "source_document": "telecom_cdr_extract_may2026.csv",
                "source_record_id": "C-020",
                "case_id": "FIR-1024 / FIR-1098",
                "timestamp": "2026-05-18 21:10:45",
                "confidence": 0.98,
                "raw_payload": {
                    "caller_phone": "+91-98765-43210 (Priya Sharma / PH-9876)",
                    "receiver_phone": "+91-99330-14920 (Sameer Khan / PH-3301)",
                    "cell_tower": "TWR-MUM-104 -> TWR-GGN-201",
                    "duration_seconds": 640,
                    "intercept_officer": "Sub-Insp. A. Shinde",
                    "court_warrant_ref": "WNT-2026-MAH-4410"
                },
                "chain_of_custody": [
                    {"step": "1", "actor": "Telecom Service Provider", "action": "CDR Export under Sec 91 CrPC", "time": "2026-05-19 10:00:00"},
                    {"step": "2", "actor": "Cyber Forensics Cell", "action": "SHA-256 Hash Verification", "time": "2026-05-19 14:30:00"},
                    {"step": "3", "actor": "CrimeGraph Databricks Ingestion", "action": "Bronze Ingestion into Lakehouse", "time": "2026-05-19 15:00:00"}
                ]
            },
            {
                "evidence_id": "EVD-TX-004",
                "evidence_type": "Banking Wire Record",
                "title": "Inter-Entity Wire Transfer of Rs 24,00,000",
                "summary": "RTGS wire from Apex FinTech (ACC-9921) to Zenith Global Solutions (ACC-2005).",
                "source_document": "fiu_bank_transactions_q2.csv",
                "source_record_id": "TX-004",
                "case_id": "FIR-1024 / FIR-1098",
                "timestamp": "2026-05-20 14:40:00",
                "confidence": 0.96,
                "raw_payload": {
                    "source_account": "551920394817 (Axis Bank, Apex FinTech)",
                    "destination_account": "881920394820 (ICICI Bank, Zenith Global Solutions)",
                    "amount_inr": "24,00,000.00",
                    "payment_mode": "RTGS Real-Time Gross Settlement",
                    "utr_number": "AXISRTGS2026052000492819",
                    "suspicion_notes": "No prior trade invoice on record between parties."
                },
                "chain_of_custody": [
                    {"step": "1", "actor": "Axis Bank Compliance Desk", "action": "STR Filing to FIU-IND", "time": "2026-05-21 09:15:00"},
                    {"step": "2", "actor": "FIU Analyst Desk", "action": "Forwarded to Special Investigation Team", "time": "2026-05-22 11:00:00"}
                ]
            },
            {
                "evidence_id": "EVD-SURV-002",
                "evidence_type": "Field Tactical Surveillance",
                "title": "Tactical Sighting Log: Subject P017 at Warehouse 4",
                "summary": "Observation log of Priya Sharma arriving at Dockland Logistics in vehicle MH-02-EF-9921.",
                "source_document": "surveillance_logbook_may2026.csv",
                "source_record_id": "SURV-002",
                "case_id": "FIR-1024",
                "timestamp": "2026-05-13 22:15:00",
                "confidence": 0.92,
                "raw_payload": {
                    "target_entity": "P017 (Priya Sharma)",
                    "vehicle": "MH-02-EF-9921 (Hyundai Creta)",
                    "location": "Warehouse 4, Dockland Industrial Estate (LOC-004)",
                    "observing_officer": "Officer V. Shinde",
                    "notes": "Delivered sealed storage case to unidentified contact in freight area."
                },
                "chain_of_custody": [
                    {"step": "1", "actor": "Field Surveillance Unit 4", "action": "Signed Logbook Entry", "time": "2026-05-13 23:30:00"},
                    {"step": "2", "actor": "Special Branch Registry", "action": "Digitized Case Annexure", "time": "2026-05-14 08:00:00"}
                ]
            },
            {
                "evidence_id": "EVD-SURV-004",
                "evidence_type": "Field Tactical Surveillance",
                "title": "Tactical Sighting Log: Subject P023 at Warehouse 4",
                "summary": "Observation log of Sameer Khan arriving at Warehouse 4 in vehicle DL-04-XY-8811.",
                "source_document": "surveillance_logbook_june2026.csv",
                "source_record_id": "SURV-004",
                "case_id": "FIR-1098",
                "timestamp": "2026-06-21 23:45:00",
                "confidence": 0.94,
                "raw_payload": {
                    "target_entity": "P023 (Sameer Khan)",
                    "vehicle": "DL-04-XY-8811 (Honda City)",
                    "location": "Warehouse 4, Dockland Industrial Estate (LOC-004)",
                    "observing_officer": "Officer V. Shinde",
                    "notes": "Arrived late night, collected parcel from Bay 4 manager."
                },
                "chain_of_custody": [
                    {"step": "1", "actor": "Field Surveillance Unit 4", "action": "Signed Logbook Entry", "time": "2026-06-22 01:00:00"}
                ]
            }
        ]
        for r in records:
            self.evidence_index[r["evidence_id"]] = r

    def get_evidence(self, evidence_id: str) -> Optional[EvidenceDetail]:
        rec = self.evidence_index.get(evidence_id)
        if not rec:
            return None
        return EvidenceDetail(
            evidence_id=rec["evidence_id"],
            evidence_type=rec["evidence_type"],
            title=rec["title"],
            summary=rec["summary"],
            source_document=rec["source_document"],
            source_record_id=rec["source_record_id"],
            case_id=rec["case_id"],
            timestamp=rec["timestamp"],
            confidence=rec["confidence"],
            raw_payload=rec.get("raw_payload", {}),
            chain_of_custody=rec.get("chain_of_custody", [])
        )

    def search_evidence_for_entity(self, entity_id: str) -> List[EvidenceDetail]:
        results = []
        for rec in self.evidence_index.values():
            raw_str = str(rec)
            if entity_id in raw_str:
                results.append(self.get_evidence(rec["evidence_id"]))
        return results

evidence_trace_engine = EvidenceTraceEngine()
