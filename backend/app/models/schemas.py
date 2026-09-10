"""
Pydantic Schemas for CrimeGraph AI
Defines strict data models for Entities, Relationships, Knowledge Graph,
Investigation Leads, Suspicious Patterns, Evidence, What-If Simulator, and Audit Logs.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# ==========================================
# 1. ENTITY & NODE MODELS
# ==========================================
class EntityNode(BaseModel):
    id: str = Field(..., description="Unique entity identifier (e.g. P001, PH-9876, LOC-004)")
    label: str = Field(..., description="Human-readable display name")
    type: str = Field(..., description="Entity type: Person, Phone, Vehicle, Location, Organization, BankAccount, Case, Event")
    category: Optional[str] = Field(None, description="Risk or classification category")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary entity metadata")
    degree: Optional[int] = Field(0, description="Network degree")
    betweenness: Optional[float] = Field(0.0, description="Betweenness centrality score")
    community: Optional[int] = Field(0, description="Detected community cluster ID")
    is_bridge: Optional[bool] = Field(False, description="Flag indicating if entity bridges distinct subgraphs")
    cases: List[str] = Field(default_factory=list, description="Associated FIR case IDs")

class EntityDetail(BaseModel):
    entity: EntityNode
    connected_cases: List[Dict[str, Any]] = Field(default_factory=list)
    relationships: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_records: List[Dict[str, Any]] = Field(default_factory=list)
    timeline_events: List[Dict[str, Any]] = Field(default_factory=list)
    prior_dossiers: List[Dict[str, Any]] = Field(default_factory=list)
    centrality_metrics: Dict[str, float] = Field(default_factory=dict)

# ==========================================
# 2. RELATIONSHIP & EDGE MODELS
# ==========================================
class RelationshipEdge(BaseModel):
    id: str = Field(..., description="Unique edge identifier (e.g. EDGE-000101)")
    source: str = Field(..., description="Source entity ID")
    target: str = Field(..., description="Target entity ID")
    type: str = Field(..., description="Relationship type: CONTACTED, USED, VISITED, TRANSFERRED_TO, WORKED_WITH, OWNED, MENTIONED_IN, PARTICIPATED_IN, CONNECTED_TO")
    label: Optional[str] = Field(None, description="Edge display label")
    weight: float = Field(1.0, description="Edge weight / frequency / intensity")
    confidence: float = Field(..., ge=0.0, le=1.0, description="AI/Extraction confidence (0.0 to 1.0)")
    case_id: Optional[str] = Field(None, description="Associated case or cross-case reference")
    timestamp: Optional[str] = Field(None, description="Timestamp of relationship or latest activity")
    source_record_id: Optional[str] = Field(None, description="Underlying evidence ID (CDR-*, TX-*, SURV-*, FIR-*)")
    source_type_label: Optional[str] = Field(None, description="Evidence source type (e.g. CDR Telecom Log, Wire Transfer)")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Additional relationship attributes")

# ==========================================
# 3. KNOWLEDGE GRAPH MODELS
# ==========================================
class GraphNetwork(BaseModel):
    nodes: List[EntityNode]
    edges: List[RelationshipEdge]
    stats: Dict[str, Any] = Field(default_factory=dict)

class ShortestPathRequest(BaseModel):
    source_id: str
    target_id: str

class ShortestPathResponse(BaseModel):
    found: bool
    path: List[str] = Field(default_factory=list)
    length: int = 0
    nodes: List[EntityNode] = Field(default_factory=list)
    edges: List[RelationshipEdge] = Field(default_factory=list)
    explanation: str = ""

# ==========================================
# 4. INVESTIGATION LEADS & SUSPICIOUS PATTERNS
# ==========================================
class EvidenceChainItem(BaseModel):
    evidence_id: str
    title: str
    source_type: str
    snippet: str
    timestamp: Optional[str] = None
    case_id: Optional[str] = None
    confidence: float

class InvestigationLead(BaseModel):
    lead_id: str
    title: str
    lead_category: str = Field(..., description="POTENTIAL_BRIDGE_INDIVIDUAL, CROSS_CASE_SYNDICATE_LINK, SHARED_INFRASTRUCTURE_ANOMALY, CO_TRAVEL_CONVERGENCE, FINANCIAL_CONDUIT_ACTIVITY")
    primary_entity_id: str
    primary_entity_name: str
    associated_cases: List[str]
    severity: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    confidence: float = Field(..., ge=0.0, le=1.0)
    why_it_matters: str
    evidence_chain: List[EvidenceChainItem]
    recommended_action: str = Field(..., description="Human-reviewable investigative next step")
    status: str = Field("PENDING_REVIEW", description="PENDING_REVIEW, UNDER_REVIEW, VERIFIED, DISMISSED")
    created_at: str

class SuspiciousPattern(BaseModel):
    pattern_id: str
    pattern_type: str
    severity: str
    confidence: float
    entities: List[str]
    reason: str
    evidence: str
    time_period: str
    associated_cases: List[str] = Field(default_factory=list)

# ==========================================
# 5. EVIDENCE & AUDIT MODELS
# ==========================================
class EvidenceDetail(BaseModel):
    evidence_id: str
    evidence_type: str
    title: str
    summary: str
    source_document: str
    source_record_id: str
    case_id: str
    timestamp: str
    confidence: float
    raw_payload: Dict[str, Any] = Field(default_factory=dict)
    chain_of_custody: List[Dict[str, str]] = Field(default_factory=list)

class AuditLogEntry(BaseModel):
    log_id: str
    timestamp: str
    user_role: str = Field(..., description="Investigator, Analyst, Administrator")
    action: str
    target_resource: str
    details: Dict[str, Any] = Field(default_factory=dict)

# ==========================================
# 6. WHAT-IF INVESTIGATION SIMULATOR
# ==========================================
class WhatIfRequest(BaseModel):
    query: str
    scenario_type: Optional[str] = Field("AUTO", description="AUTO, CROSS_CASE_PATH, ENTITY_CONNECTION, NODE_REMOVAL_IMPACT, CENTRAL_BRIDGE")
    target_entity: Optional[str] = None
    source_case: Optional[str] = None
    target_case: Optional[str] = None

class WhatIfResponse(BaseModel):
    query: str
    scenario_type: str
    natural_answer: str
    reasoning_steps: List[str]
    affected_entities: List[EntityNode] = Field(default_factory=list)
    highlighted_edges: List[RelationshipEdge] = Field(default_factory=list)
    impact_metrics: Dict[str, Any] = Field(default_factory=dict)
    supporting_evidence: List[EvidenceChainItem] = Field(default_factory=list)
    confidence: float

# ==========================================
# 7. NLP EXTRACTION MODELS
# ==========================================
class ExtractedEntity(BaseModel):
    text: str
    type: str
    confidence: float
    start_char: Optional[int] = None
    end_char: Optional[int] = None
    normalized_id: Optional[str] = None

class ExtractedRelationship(BaseModel):
    source_text: str
    target_text: str
    relationship_type: str
    confidence: float
    evidence_snippet: str

class NLPExtractionResult(BaseModel):
    document_id: str
    entities: List[ExtractedEntity]
    relationships: List[ExtractedRelationship]
    engine_used: str = "Deterministic Rule & Regex Engine"
    processing_time_ms: float

# ==========================================
# 8. CASE & DASHBOARD MODELS
# ==========================================
class CaseDetail(BaseModel):
    case_id: str
    case_number: str
    title: str
    crime_type: str
    jurisdiction: str
    filing_date: str
    status: str
    lead_investigator: str
    summary: str
    entities_count: int = 0
    relationships_count: int = 0
    leads_count: int = 0
    patterns_count: int = 0
    fir_reports: List[Dict[str, Any]] = Field(default_factory=list)
    timeline_events: List[Dict[str, Any]] = Field(default_factory=list)
    surveillance_sightings: List[Dict[str, Any]] = Field(default_factory=list)

class DashboardSummary(BaseModel):
    total_cases: int
    total_persons_analyzed: int
    active_networks_count: int
    detected_patterns_count: int
    investigation_leads_count: int
    cross_case_connections_count: int
    top_leads: List[InvestigationLead] = Field(default_factory=list)
    recent_patterns: List[SuspiciousPattern] = Field(default_factory=list)
    high_connectivity_nodes: List[EntityNode] = Field(default_factory=list)
    lakehouse_status: Dict[str, Any] = Field(default_factory=dict)
