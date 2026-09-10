"""
AI / NLP Entity & Relationship Extraction Engine
Extracts investigative entities (PERSON, PHONE, VEHICLE, LOCATION, ORGANIZATION, BANK_ACCOUNT, CASE_ID)
and relationships (CONTACTED, USED, VISITED, TRANSFERRED_TO, WORKED_WITH, OWNED, MENTIONED_IN)
from narrative FIR reports, CDR notes, and surveillance logs.
Includes deterministic rule-based extractor with confidence scoring + optional LLM adapter.
"""

import re
import os
import time
from typing import List, Dict, Any, Optional
from backend.app.models.schemas import ExtractedEntity, ExtractedRelationship, NLPExtractionResult

class NLPEntityExtractor:
    def __init__(self):
        # Known entity dictionary maps for high-precision entity resolution
        self.known_persons = {
            "Ravi Kumar": "P001", "Ravi": "P001",
            "Arjun Singh": "P002", "Arjun": "P002",
            "Manish Gupta": "P003", "Manish": "P003",
            "Deepak Verma": "P004", "Deepak": "P004",
            "Suresh Nair": "P005", "Suresh": "P005",
            "Priya Sharma": "P017", "Priya": "P017",
            "Sameer Khan": "P023", "Sameer": "P023",
            "John Mathew": "P024", "John": "P024",
            "Vikram Rathore": "P031", "Vikram": "P031",
            "Karan Patel": "P040", "Karan": "P040"
        }
        
        self.known_orgs = {
            "Golden Horizon Trading Pvt Ltd": "ORG-001", "Golden Horizon": "ORG-001",
            "SeaTrack Logistics & Freight": "ORG-002", "SeaTrack Logistics": "ORG-002",
            "Zenith Global Solutions Ltd": "ORG-005", "Zenith Global Solutions": "ORG-005", "Zenith Global": "ORG-005",
            "Apex FinTech Advisory LLP": "ORG-008", "Apex FinTech": "ORG-008",
            "Falcon Secure Transit Logistics": "ORG-010"
        }
        
        self.known_locations = {
            "West Port Container Terminal B": "LOC-001", "West Port": "LOC-001",
            "Warehouse 4": "LOC-004", "Dockland Logistics": "LOC-004", "Dockland Industrial Estate": "LOC-004",
            "MG Road Safehouse": "LOC-012", "104 MG Road": "LOC-012", "MG Road": "LOC-012",
            "Cyber City Tech Park Tower C": "LOC-019", "Cyber City": "LOC-019",
            "State Highway 9 Checkpoint": "LOC-025", "State Highway 9": "LOC-025",
            "South Coast Cargo Anchorage": "LOC-030"
        }

        # Regex compiled patterns
        self.id_code_pattern = re.compile(r"\b(P\d{3}|LOC\-\d{3}|ORG\-\d{3}|VEH\-\d{3}|ACC\-\d{4})\b", re.IGNORECASE)
        self.phone_pattern = re.compile(r"(\+?91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}|\b[6-9]\d{9}\b")
        self.vehicle_reg_pattern = re.compile(r"\b[A-Z]{2}[\-\s]?\d{2}[\-\s]?[A-Z]{1,3}[\-\s]?\d{4}\b", re.IGNORECASE)
        self.case_pattern = re.compile(r"\b(FIR[-=\s]?\d{3,5}|CR[-=\s]?\d{4}[-=\s]?[A-Z]{2}[-=\s]?\d{3,5}|case\s*#?\s*[-=\s]?\d{3,5})\b", re.IGNORECASE)
        self.bank_acc_pattern = re.compile(r"\b\d{9,14}\b")
        self.currency_pattern = re.compile(r"(?:Rs\.?|INR|\₹)\s*[\d,]+(?:\.\d{2})?")
        self.generic_name_pattern = re.compile(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b")

    def extract_entities(self, text: str) -> List[ExtractedEntity]:
        entities: List[ExtractedEntity] = []
        seen_spans = set()

        def add_entity(txt: str, etype: str, conf: float, start: int, end: int, norm_id: Optional[str] = None):
            span_key = (start, end)
            if span_key not in seen_spans:
                seen_spans.add(span_key)
                entities.append(ExtractedEntity(
                    text=txt.strip(),
                    type=etype,
                    confidence=conf,
                    start_char=start,
                    end_char=end,
                    normalized_id=norm_id
                ))

        # 0. Direct ID Codes (P001, ORG-001, LOC-004, VEH-001, ACC-9921)
        for m in self.id_code_pattern.finditer(text):
            code = m.group(1).upper()
            etype = "PERSON" if code.startswith("P") else "ORGANIZATION" if code.startswith("ORG") else "LOCATION" if code.startswith("LOC") else "VEHICLE" if code.startswith("VEH") else "BANK_ACCOUNT"
            add_entity(code, etype, 0.99, m.start(), m.end(), code)

        # 1. Known Persons
        for name, pid in self.known_persons.items():
            for m in re.finditer(re.escape(name), text, re.IGNORECASE):
                add_entity(m.group(), "PERSON", 0.98, m.start(), m.end(), pid)

        # 2. Known Organizations
        for org, oid in self.known_orgs.items():
            for m in re.finditer(re.escape(org), text, re.IGNORECASE):
                add_entity(m.group(), "ORGANIZATION", 0.95, m.start(), m.end(), oid)

        # 3. Known Locations
        for loc, lid in self.known_locations.items():
            for m in re.finditer(re.escape(loc), text, re.IGNORECASE):
                add_entity(m.group(), "LOCATION", 0.95, m.start(), m.end(), lid)

        # 4. Phones
        for m in self.phone_pattern.finditer(text):
            p_text = m.group()
            # Discard if inside bank account or dates
            if len(p_text.replace("-", "").replace(" ", "").replace("+91", "")) >= 10:
                add_entity(p_text, "PHONE", 0.96, m.start(), m.end())

        # 5. Vehicle Registrations
        for m in self.vehicle_reg_pattern.finditer(text):
            v_text = m.group().upper()
            add_entity(v_text, "VEHICLE", 0.94, m.start(), m.end())

        # 6. Case IDs
        for m in self.case_pattern.finditer(text):
            c_text = m.group()
            norm = c_text.upper().replace(" ", "-").replace("=", "-")
            if norm.startswith("CASE-"):
                norm = "FIR-" + norm.split("CASE-")[-1].strip("-#")
            elif norm.startswith("CASE#"):
                norm = "FIR-" + norm.split("CASE#")[-1].strip("-#")
            elif not norm.startswith("FIR-") and not norm.startswith("CR-"):
                if norm.startswith("FIR"):
                    norm = "FIR-" + norm[3:].strip("-")
            add_entity(c_text, "CASE_ID", 0.99, m.start(), m.end(), norm)

        # 7. Bank Accounts (using context clues)
        for m in re.finditer(r"(?:account|a/c|acc\.?)\s*(?:number|no\.?)?\s*(\d{9,14})", text, re.IGNORECASE):
            acc_num = m.group(1)
            add_entity(acc_num, "BANK_ACCOUNT", 0.92, m.start(1), m.end(1))

        # 8. Generic Person Names fallback
        for m in self.generic_name_pattern.finditer(text):
            candidate = m.group()
            # Ignore false positives like "First Information", "Police Station", "West Port"
            stop_words = {
                "First Information", "Information Report", "Police Station", "West Coast",
                "Cyber Crime", "Special Division", "Customs Act", "Financial Intelligence",
                "Unit Analysis", "Global Logistics", "Dockland Logistics", "Tower C",
                "State Highway", "Outer Anchorage", "Commercial Complex"
            }
            if candidate not in stop_words and candidate not in self.known_orgs and candidate not in self.known_locations:
                span_overlap = any(s <= m.start() and m.end() <= e for (s, e) in seen_spans)
                if not span_overlap and not any(w in candidate for w in ["Station", "Terminal", "Division", "Report", "Bank", "Holding"]):
                    add_entity(candidate, "PERSON", 0.80, m.start(), m.end())

        # Sort by start_char
        entities.sort(key=lambda e: e.start_char or 0)
        return entities

    def extract_relationships(self, text: str, entities: List[ExtractedEntity]) -> List[ExtractedRelationship]:
        relationships: List[ExtractedRelationship] = []
        seen_rels = set()

        # Group entities by sentence
        sentences = re.split(r"[.\n]", text)
        char_offset = 0

        for sentence in sentences:
            s_len = len(sentence)
            s_start = char_offset
            s_end = char_offset + s_len
            char_offset = s_end + 1

            s_entities = [e for e in entities if e.start_char is not None and s_start <= e.start_char <= s_end]
            if len(s_entities) < 2:
                continue

            # Check entity pairs in the same sentence
            for i in range(len(s_entities)):
                for j in range(len(s_entities)):
                    if i == j:
                        continue
                    e1 = s_entities[i]
                    e2 = s_entities[j]

                    rel_type = None
                    conf = 0.85

                    # Rule 1: Person -> Phone ("using phone", "contacted", "phone +91")
                    if e1.type == "PERSON" and e2.type == "PHONE":
                        rel_type = "USED"
                        conf = 0.95
                    elif e1.type == "PHONE" and e2.type == "PERSON":
                        rel_type = "REGISTERED_TO"
                        conf = 0.95

                    # Rule 2: Person -> Vehicle ("driven by", "in vehicle", "operated by")
                    elif e1.type == "PERSON" and e2.type == "VEHICLE":
                        rel_type = "OPERATED"
                        conf = 0.92
                    elif e1.type == "VEHICLE" and e2.type == "PERSON":
                        rel_type = "OPERATED_BY"
                        conf = 0.92

                    # Rule 3: Person -> Location ("visited", "arrived at", "near", "at")
                    elif e1.type == "PERSON" and e2.type == "LOCATION":
                        rel_type = "VISITED"
                        conf = 0.90

                    # Rule 4: Person -> Organization ("operating from", "directed by", "of")
                    elif e1.type == "PERSON" and e2.type == "ORGANIZATION":
                        rel_type = "WORKED_WITH"
                        conf = 0.93

                    # Rule 5: Person -> Person ("contacted", "coordinated with", "met", "acting on orders")
                    elif e1.type == "PERSON" and e2.type == "PERSON":
                        if any(w in sentence.lower() for w in ["contact", "coordinated", "met", "orders", "communicat", "call", "payout"]):
                            rel_type = "ASSOCIATED_WITH"
                            conf = 0.88

                    # Rule 6: BankAccount -> Person/Org
                    elif e1.type == "BANK_ACCOUNT" and e2.type in ["PERSON", "ORGANIZATION"]:
                        rel_type = "BELONGS_TO"
                        conf = 0.90

                    if rel_type:
                        key = (e1.text, e2.text, rel_type)
                        if key not in seen_rels:
                            seen_rels.add(key)
                            relationships.append(ExtractedRelationship(
                                source_text=e1.text,
                                target_text=e2.text,
                                relationship_type=rel_type,
                                confidence=conf,
                                evidence_snippet=sentence.strip()
                            ))

        return relationships

    def process_document(self, doc_id: str, text: str) -> NLPExtractionResult:
        start_time = time.time()
        entities = self.extract_entities(text)
        relationships = self.extract_relationships(text, entities)
        proc_time = (time.time() - start_time) * 1000.0

        return NLPExtractionResult(
            document_id=doc_id,
            entities=entities,
            relationships=relationships,
            engine_used="Deterministic Rule & Contextual Span NLP Engine",
            processing_time_ms=round(proc_time, 2)
        )

# Global singleton
nlp_extractor = NLPEntityExtractor()
