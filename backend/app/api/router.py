"""
FastAPI REST API Routes for CrimeGraph AI
Provides comprehensive endpoints for Dashboard, Cases, Graph Network,
Investigation Leads, Suspicious Patterns, Evidence, What-If Simulator,
Lakehouse Pipeline, and Security/Audit logs.
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
from backend.app.models.schemas import (
    DashboardSummary, CaseDetail, EntityNode, EntityDetail,
    GraphNetwork, ShortestPathResponse, InvestigationLead,
    SuspiciousPattern, EvidenceDetail, WhatIfRequest, WhatIfResponse,
    AuditLogEntry
)
from backend.app.services.case_service import case_service
from backend.app.graph.graph_adapter import graph_engine
from backend.app.analytics.patterns import pattern_engine
from backend.app.analytics.leads import leads_engine
from backend.app.entire.evidence_trace import evidence_trace_engine
from backend.app.services.what_if_simulator import what_if_simulator
from backend.app.ai.ai_investigator import analyze_query

router = APIRouter(prefix="/api")

# ==========================================
# 1. DASHBOARD & SEARCH
# ==========================================
@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard():
    return case_service.get_dashboard_summary()

@router.post("/search")
def search_entities(query: str = Body(..., embed=True)):
    q = query.lower().strip()
    graph_engine.calculate_metrics()
    full = graph_engine.get_full_graph()
    
    matched_nodes = []
    for n in full.nodes:
        if q in n.id.lower() or q in n.label.lower() or q in n.type.lower() or any(q in c.lower() for c in n.cases):
            matched_nodes.append(n)

    case_service.log_audit("Investigator", f"Executed search query: '{query}'", "EntityRegistry", {"matches_count": len(matched_nodes)})
    return {
        "query": query,
        "results_count": len(matched_nodes),
        "results": matched_nodes[:20]
    }

# ==========================================
# 2. CASES & LIVE ANALYSIS
# ==========================================
@router.get("/cases", response_model=List[CaseDetail])
def list_cases():
    return case_service.list_cases()

@router.get("/cases/{case_id}", response_model=CaseDetail)
def get_case(case_id: str):
    case = case_service.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    case_service.log_audit("Investigator", f"Viewed case details for {case_id}", case_id, {})
    return case

@router.post("/cases/{case_id}/analyze")
def analyze_case(case_id: str):
    if case_id not in case_service.cached_cases:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found in intelligence registry")
    return case_service.analyze_case(case_id)

@router.post("/investigate")
def investigate(payload: Dict[str, Any] = Body(...)):
    query = payload.get("query", "")
    context_case_id = payload.get("context_case_id")
    if not query:
        raise HTTPException(status_code=400, detail="Query string is required")
    return analyze_query(query, context_case_id)

# ==========================================
# 3. KNOWLEDGE GRAPH & NETWORK EXPLORER
# ==========================================
@router.get("/network", response_model=GraphNetwork)
def get_network(
    case_id: Optional[str] = Query(None, description="Filter by case ID (e.g. FIR-1024)"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type (Person, Phone, etc.)"),
    min_confidence: float = Query(0.0, description="Filter by minimum edge confidence")
):
    if case_id and case_id != "ALL":
        sub = graph_engine.get_subgraph_for_case(case_id)
    else:
        sub = graph_engine.get_full_graph()

    # Filter by entity type if specified
    if entity_type and entity_type != "ALL":
        allowed_ids = {n.id for n in sub.nodes if n.type.lower() == entity_type.lower()}
        filtered_nodes = [n for n in sub.nodes if n.id in allowed_ids]
        filtered_edges = [e for e in sub.edges if e.source in allowed_ids and e.target in allowed_ids]
        return GraphNetwork(nodes=filtered_nodes, edges=filtered_edges, stats={"filter": entity_type, "node_count": len(filtered_nodes), "edge_count": len(filtered_edges)})

    # Filter edges by confidence
    if min_confidence > 0.0:
        filtered_edges = [e for e in sub.edges if e.confidence >= min_confidence]
        active_nodes = {e.source for e in filtered_edges} | {e.target for e in filtered_edges}
        filtered_nodes = [n for n in sub.nodes if n.id in active_nodes]
        return GraphNetwork(nodes=filtered_nodes, edges=filtered_edges, stats={"min_confidence": min_confidence, "node_count": len(filtered_nodes), "edge_count": len(filtered_edges)})

    return sub

@router.get("/network/entity/{entity_id}", response_model=GraphNetwork)
def get_entity_network(entity_id: str, hops: int = Query(1, ge=1, le=3)):
    return graph_engine.get_entity_neighborhood(entity_id, hops=hops)

@router.get("/network/path", response_model=ShortestPathResponse)
def get_shortest_path(source_id: str = Query(...), target_id: str = Query(...)):
    res = graph_engine.find_shortest_path(source_id, target_id)
    case_service.log_audit("Investigator", f"Queried shortest path: {source_id} -> {target_id}", f"{source_id}-{target_id}", {"hops": res.length})
    return res

@router.get("/network/bridges")
def get_bridge_nodes():
    graph_engine.calculate_metrics()
    full = graph_engine.get_full_graph()
    bridges = [n for n in full.nodes if n.is_bridge]
    bridges.sort(key=lambda x: x.betweenness or 0.0, reverse=True)
    return {
        "bridge_nodes_count": len(bridges),
        "bridge_nodes": bridges
    }

@router.get("/network/clusters")
def get_network_clusters():
    graph_engine.calculate_metrics()
    full = graph_engine.get_full_graph()
    clusters: Dict[int, List[EntityNode]] = {}
    for n in full.nodes:
        c_id = n.community or 0
        if c_id not in clusters:
            clusters[c_id] = []
        clusters[c_id].append(n)
    
    return {
        "clusters_count": len(clusters),
        "clusters": [
            {"community_id": cid, "size": len(members), "sample_nodes": [m.label for m in members[:4]]}
            for cid, members in sorted(clusters.items())
        ]
    }

# ==========================================
# 4. ENTITY 360-DEGREE DETAILS
# ==========================================
@router.get("/entities/{entity_id}", response_model=EntityDetail)
def get_entity_details(entity_id: str):
    if not graph_engine.graph.has_node(entity_id):
        raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found in knowledge graph")

    data = graph_engine.graph.nodes[entity_id]
    node = EntityNode(
        id=entity_id,
        label=data.get("label", entity_id),
        type=data.get("type", "Unknown"),
        category=data.get("category"),
        properties=data.get("properties", {}),
        degree=data.get("degree", 0),
        betweenness=data.get("betweenness", 0.0),
        community=data.get("community", 0),
        is_bridge=data.get("is_bridge", False),
        cases=data.get("cases", [])
    )

    # Connected cases
    connected_cases = []
    for cid in node.cases:
        if cid in case_service.cached_cases:
            c = case_service.cached_cases[cid]
            connected_cases.append({"case_id": cid, "title": c["title"], "crime_type": c["crime_type"], "status": c["status"]})

    # Direct relationships
    rels = []
    for u, v, k, e_data in graph_engine.graph.edges(keys=True, data=True):
        if u == entity_id or v == entity_id:
            other_id = v if u == entity_id else u
            rels.append({
                "edge_id": e_data.get("id"),
                "relation_type": e_data.get("type"),
                "direction": "OUTGOING" if u == entity_id else "INCOMING",
                "connected_entity_id": other_id,
                "connected_entity_label": graph_engine.graph.nodes.get(other_id, {}).get("label", other_id),
                "confidence": e_data.get("confidence", 0.9),
                "case_id": e_data.get("case_id"),
                "source_record_id": e_data.get("source_record_id")
            })

    # Evidence records
    evidence = [e.dict() for e in evidence_trace_engine.search_evidence_for_entity(entity_id)]

    # Dossiers
    dossiers = []
    raw_history = case_service.lakehouse._read_csv("criminal_history.csv")
    for d in raw_history:
        if d.get("person_id") == entity_id:
            dossiers.append(d)

    return EntityDetail(
        entity=node,
        connected_cases=connected_cases,
        relationships=rels,
        evidence_records=evidence,
        timeline_events=[],
        prior_dossiers=dossiers,
        centrality_metrics={"degree": float(node.degree or 0), "betweenness": float(node.betweenness or 0.0)}
    )

# ==========================================
# 5. INVESTIGATION LEADS & PATTERNS
# ==========================================
@router.get("/investigation-leads", response_model=List[InvestigationLead])
def get_investigation_leads(case_id: Optional[str] = None):
    all_leads = leads_engine.generate_leads()
    if case_id and case_id != "ALL":
        return [l for l in all_leads if case_id in l.associated_cases or not l.associated_cases]
    return all_leads

@router.post("/investigation-leads/{lead_id}/status")
def update_lead_status(lead_id: str, status: str = Body(..., embed=True)):
    case_service.log_audit("Investigator", f"Updated lead status for {lead_id} to '{status}'", lead_id, {"new_status": status})
    return {"lead_id": lead_id, "status": status, "updated_at": "Now"}

@router.get("/patterns", response_model=List[SuspiciousPattern])
def get_suspicious_patterns(case_id: Optional[str] = None):
    all_patterns = pattern_engine.detect_patterns()
    if case_id and case_id != "ALL":
        return [p for p in all_patterns if case_id in p.associated_cases or not p.associated_cases]
    return all_patterns

# ==========================================
# 6. EVIDENCE EXPLORER & CHAIN OF CUSTODY
# ==========================================
@router.get("/evidence/{evidence_id}", response_model=EvidenceDetail)
def get_evidence_detail(evidence_id: str):
    ev = evidence_trace_engine.get_evidence(evidence_id)
    if not ev:
        raise HTTPException(status_code=404, detail=f"Evidence record {evidence_id} not found in chain of custody index")
    case_service.log_audit("Investigator", f"Accessed evidence document {evidence_id}", evidence_id, {})
    return ev

# ==========================================
# 7. WHAT-IF INVESTIGATION SIMULATOR
# ==========================================
@router.post("/what-if", response_model=WhatIfResponse)
def run_what_if_query(req: WhatIfRequest):
    case_service.log_audit("Investigator", f"Ran What-If simulation query: '{req.query}'", "WhatIfEngine", {})
    return what_if_simulator.process_query(req)

# ==========================================
# 8. DATABRICKS LAKEHOUSE & AUDIT
# ==========================================
@router.get("/databricks/pipeline")
def get_databricks_status():
    return {
        "status": case_service.lakehouse.metrics.get("status", "READY"),
        "last_run": case_service.lakehouse.metrics.get("last_run"),
        "bronze_tables": case_service.lakehouse.metrics.get("bronze_records", {}),
        "silver_tables": case_service.lakehouse.metrics.get("silver_records", {}),
        "gold_tables": case_service.lakehouse.metrics.get("gold_records", {}),
        "lakehouse_mode": "Local Delta Lake Simulation (Ready for Databricks Lakehouse SQL Connection)"
    }

@router.post("/databricks/sync")
def trigger_databricks_sync():
    metrics = case_service.lakehouse.run_full_pipeline()
    case_service._populate_graph_from_gold()
    case_service.log_audit("Administrator", "Manually triggered full Lakehouse Medallion pipeline sync", "LakehouseEngine", metrics)
    return {"status": "SUCCESS", "message": "Lakehouse pipeline and knowledge graph refreshed.", "metrics": metrics}

@router.get("/audit", response_model=List[AuditLogEntry])
def get_audit_logs():
    return [
        AuditLogEntry(
            log_id=a["log_id"],
            timestamp=a["timestamp"],
            user_role=a["user_role"],
            action=a["action"],
            target_resource=a["target_resource"],
            details=a.get("details", {})
        )
        for a in reversed(case_service.audit_logs[-50:])
    ]
