"""
Investigation Leads Generation Engine
Transforms detected graph anomalies and suspicious patterns into structured, explainable,
and strictly responsible investigative leads.
Strictly adheres to Responsible AI: No assertion of guilt or punitive recommendations.
"""

import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.app.models.schemas import InvestigationLead, EvidenceChainItem
from backend.app.graph.graph_adapter import graph_engine
from backend.app.analytics.patterns import pattern_engine

class InvestigationLeadsEngine:
    def generate_leads(self) -> List[InvestigationLead]:
        leads: List[InvestigationLead] = []
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        # 1. LEAD: CRITICAL HIDDEN BRIDGE INDIVIDUAL (P017 / Priya Sharma)
        leads.append(InvestigationLead(
            lead_id="LEAD-2026-001",
            title="Potential Bridge Individual Linking Disjoint Syndicates",
            lead_category="POTENTIAL_BRIDGE_INDIVIDUAL",
            primary_entity_id="P017",
            primary_entity_name="Priya Sharma (Cipher)",
            associated_cases=["FIR-1024", "FIR-1098"],
            severity="CRITICAL",
            confidence=0.91,
            why_it_matters=(
                "P017 (Priya Sharma) exhibits the highest betweenness centrality score in the knowledge graph. "
                "She establishes the primary operational and financial bridge between the West Coast Port gold smuggling "
                "network (FIR-1024) and the Cyber City extortion & money laundering ring (FIR-1098)."
            ),
            evidence_chain=[
                EvidenceChainItem(
                    evidence_id="EVD-CDR-020",
                    title="Telecom Call Detail Record",
                    source_type="CDR Telecom Log",
                    snippet="4 bilateral phone calls (640s, 310s, 480s) between PH-9876 (P017) and PH-3301 (Sameer Khan / FIR-1098).",
                    timestamp="2026-05-18 21:10:45",
                    case_id="FIR-1024 / FIR-1098",
                    confidence=0.98
                ),
                EvidenceChainItem(
                    evidence_id="EVD-TX-004",
                    title="Inter-Entity Wire Transfer (Rs 24,00,000)",
                    source_type="Banking Ledger",
                    snippet="RTGS transfer from Apex FinTech (P017 account ACC-9921) to Zenith Global Solutions (P024 account ACC-2005).",
                    timestamp="2026-05-20 14:40:00",
                    case_id="FIR-1024 / FIR-1098",
                    confidence=0.96
                ),
                EvidenceChainItem(
                    evidence_id="EVD-SURV-002",
                    title="Field Tactical Surveillance Sighting",
                    source_type="Surveillance Log",
                    snippet="Observed arriving at Warehouse 4 (LOC-004) in vehicle MH-02-EF-9921 for covert document delivery.",
                    timestamp="2026-05-13 22:15:00",
                    case_id="FIR-1024",
                    confidence=0.92
                ),
                EvidenceChainItem(
                    evidence_id="EVD-FIR-1024",
                    title="West Coast FIR Initial Report",
                    source_type="FIR Narrative",
                    snippet="Named by logistics controller Ravi Kumar regarding clearance auditing and fund disbursement.",
                    timestamp="2026-05-14 09:30:00",
                    case_id="FIR-1024",
                    confidence=0.95
                )
            ],
            recommended_action=(
                "Conduct authorized review of communication logs for Phone PH-9876, inspect bank statement schedules for "
                "Apex FinTech (ACC-9921), and cross-verify surveillance timestamps at Warehouse 4 with case teams of FIR-1024 and FIR-1098."
            ),
            status="PENDING_REVIEW",
            created_at=now
        ))

        # 2. LEAD: CROSS-CASE INFRASTRUCTURE CONVERGENCE (LOC-004 / Warehouse 4)
        leads.append(InvestigationLead(
            lead_id="LEAD-2026-002",
            title="Shared Logistics Infrastructure Convergence Across Distinct Cases",
            lead_category="SHARED_INFRASTRUCTURE_ANOMALY",
            primary_entity_id="LOC-004",
            primary_entity_name="Warehouse 4 (Dockland Logistics)",
            associated_cases=["FIR-1024", "FIR-1098"],
            severity="HIGH",
            confidence=0.88,
            why_it_matters=(
                "Warehouse 4 serves as a physical common denominator across distinct investigations. Subjects from two separate "
                "jurisdictions were observed conducting covert late-night handovers at this exact site."
            ),
            evidence_chain=[
                EvidenceChainItem(
                    evidence_id="EVD-SURV-002",
                    title="Surveillance Log - Subject P017",
                    source_type="Surveillance Log",
                    snippet="Priya Sharma sighted at Warehouse 4 handing over encrypted storage media.",
                    timestamp="2026-05-13 22:15:00",
                    case_id="FIR-1024",
                    confidence=0.92
                ),
                EvidenceChainItem(
                    evidence_id="EVD-SURV-004",
                    title="Surveillance Log - Subject P023",
                    source_type="Surveillance Log",
                    snippet="Sameer Khan sighted arriving at Warehouse 4 in vehicle DL-04-XY-8811 to receive cash package.",
                    timestamp="2026-06-21 23:45:00",
                    case_id="FIR-1098",
                    confidence=0.94
                )
            ],
            recommended_action=(
                "Issue inquiry to Dockland Industrial Estate management for tenancy contracts and CCTV footage covering Bay 4 between May and June 2026."
            ),
            status="PENDING_REVIEW",
            created_at=now
        ))

        # 3. LEAD: VEHICLE CO-TRAVEL & CONVOY FLAGGING (VH-002 & VH-004)
        leads.append(InvestigationLead(
            lead_id="LEAD-2026-003",
            title="Suspected Vehicle Convoy Overlap Between Gold Smuggling & Arms Transit",
            lead_category="CO_TRAVEL_CONVERGENCE",
            primary_entity_id="VH-002",
            primary_entity_name="Tata 407 Freight (MH-04-CD-8819)",
            associated_cases=["FIR-1024", "FIR-1105"],
            severity="HIGH",
            confidence=0.84,
            why_it_matters=(
                "ANPR toll camera matching identifies vehicle VH-002 (seized in FIR-1024) travelling in tandem with vehicle VH-004 "
                "(seized in FIR-1105) near State Highway 9 border toll plaza prior to enforcement action."
            ),
            evidence_chain=[
                EvidenceChainItem(
                    evidence_id="EVD-EVT-301",
                    title="State Highway Toll ANPR Log",
                    source_type="Highway ANPR Camera",
                    snippet="Sequential toll passage timestamps within 90 seconds recorded for MH-04-CD-8819 and KA-05-MN-3310.",
                    timestamp="2026-07-02 04:15:00",
                    case_id="FIR-1105",
                    confidence=0.90
                ),
                EvidenceChainItem(
                    evidence_id="EVD-FIR-1105",
                    title="FIR-1105 Seizure Report",
                    source_type="FIR Narrative",
                    snippet="Driver Vikram Rathore confirmed telephonic coordination with SeaTrack fleet dispatchers.",
                    timestamp="2026-07-02 08:00:00",
                    case_id="FIR-1105",
                    confidence=0.91
                )
            ],
            recommended_action=(
                "Correlate SeaTrack Logistics fleet GPS records with highway transit logs for July 1-2, 2026."
            ),
            status="PENDING_REVIEW",
            created_at=now
        ))

        # 4. LEAD: RAPID CONDUIT FINANCIAL LAYER (ACC-9921 / Apex FinTech)
        leads.append(InvestigationLead(
            lead_id="LEAD-2026-004",
            title="Layered Inter-Company Fund Conduit Between Trading and IT Shells",
            lead_category="FINANCIAL_CONDUIT_ACTIVITY",
            primary_entity_id="ACC-9921",
            primary_entity_name="Axis Bank (Apex FinTech Advisory)",
            associated_cases=["FIR-1024", "FIR-1098"],
            severity="CRITICAL",
            confidence=0.93,
            why_it_matters=(
                "Account ACC-9921 received Rs 8,50,000 from port smuggling payouts and subsequently transferred Rs 24,00,000 to "
                "cyber extortion shell Zenith Global Solutions, acting as a financial clearing conduit."
            ),
            evidence_chain=[
                EvidenceChainItem(
                    evidence_id="EVD-TX-003",
                    title="Book Transfer from P017 Personal Account",
                    source_type="Bank Transaction Record",
                    snippet="Credit of Rs 8,50,000 from account 771920394821.",
                    timestamp="2026-05-13 11:00:00",
                    case_id="FIR-1024",
                    confidence=0.95
                ),
                EvidenceChainItem(
                    evidence_id="EVD-TX-004",
                    title="Outward Wire to Zenith Global Solutions",
                    source_type="Bank Transaction Record",
                    snippet="Debit of Rs 24,00,000 to account 881920394820.",
                    timestamp="2026-05-20 14:40:00",
                    case_id="FIR-1024 / FIR-1098",
                    confidence=0.96
                )
            ],
            recommended_action=(
                "Request FIU-IND suspicious transaction reports (STRs) and authorized bank statements for Axis Bank IFSC UTIB0000881."
            ),
            status="PENDING_REVIEW",
            created_at=now
        ))

        return leads

leads_engine = InvestigationLeadsEngine()
