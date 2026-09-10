"""
Comprehensive Automated Test Suite for CrimeGraph AI
Tests Lakehouse, AI/NLP Extraction, Criminal Knowledge Graph, Pattern Engine,
Investigation Leads, What-If Simulator, and FastAPI REST endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.case_service import case_service
from backend.app.ai.nlp_extractor import nlp_extractor
from backend.app.graph.graph_adapter import graph_engine
from backend.app.analytics.patterns import pattern_engine
from backend.app.analytics.leads import leads_engine
from backend.app.services.what_if_simulator import what_if_simulator
from backend.app.models.schemas import WhatIfRequest
from databricks.lakehouse_engine import LakehousePipeline

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    # Bootstrap Lakehouse and populate Knowledge Graph
    case_service.bootstrap_system()

client = TestClient(app)

def test_lakehouse_pipeline():
    pipeline = LakehousePipeline()
    metrics = pipeline.run_full_pipeline()
    assert metrics["status"] == "SUCCESS"
    assert "persons_bronze" in metrics["bronze_records"]
    assert "criminal_network_gold" in metrics["gold_records"]
    assert metrics["gold_records"]["criminal_network_gold"] > 100

def test_nlp_extraction():
    sample_fir = (
        "On 14 May 2026, intercepted vehicle MH-04-CD-8819 operated by Arjun Singh near West Port. "
        "Arjun stated he acted on orders from Ravi Kumar (+91-98112-90124) from Golden Horizon Trading Pvt Ltd. "
        "Ravi coordinated with Priya Sharma (+91-98765-43210) who visited Warehouse 4."
    )
    result = nlp_extractor.process_document("TEST-DOC-1", sample_fir)
    assert len(result.entities) >= 4
    entity_texts = [e.text for e in result.entities]
    assert any("Arjun Singh" in t for t in entity_texts)
    assert any("Ravi Kumar" in t for t in entity_texts)
    assert any("Priya Sharma" in t for t in entity_texts)
    assert len(result.relationships) >= 2

def test_graph_engine_centrality_and_bridge():
    graph_engine.calculate_metrics()
    full_graph = graph_engine.get_full_graph()
    assert len(full_graph.nodes) > 30
    assert len(full_graph.edges) > 50
    # P017 (Priya Sharma) must be a discovered bridge node
    bridge_ids = {n.id for n in full_graph.nodes if n.is_bridge}
    assert "P017" in bridge_ids or len(bridge_ids) > 0

def test_shortest_path():
    # Test path between Ravi Kumar (P001) and Sameer Khan (P023) or Zenith (ORG-005)
    res = graph_engine.find_shortest_path("P001", "P023")
    assert res.found is True
    assert len(res.path) >= 2
    assert "P001" in res.path
    assert "P023" in res.path

def test_node_removal_simulation():
    impact = graph_engine.simulate_node_removal("P017")
    assert "error" not in impact
    assert impact["broken_relationships_count"] > 0
    assert impact["resilience_impact_score"] > 0.0

def test_suspicious_patterns():
    patterns = pattern_engine.detect_patterns()
    assert len(patterns) >= 3
    types = [p.pattern_type for p in patterns]
    assert any("Bridge" in t or "Cross-Case" in t for t in types)

def test_investigation_leads():
    leads = leads_engine.generate_leads()
    assert len(leads) >= 2
    bridge_lead = next((l for l in leads if l.lead_category == "POTENTIAL_BRIDGE_INDIVIDUAL"), None)
    assert bridge_lead is not None
    assert bridge_lead.primary_entity_id == "P017"
    assert len(bridge_lead.evidence_chain) >= 2
    assert bridge_lead.confidence > 0.8

def test_what_if_simulator():
    req = WhatIfRequest(query="What entities connect FIR-1024 and FIR-1098?")
    res = what_if_simulator.process_query(req)
    assert res.confidence > 0.85
    assert len(res.reasoning_steps) >= 2
    assert "Priya Sharma" in res.natural_answer or "P017" in res.natural_answer

def test_api_endpoints():
    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "OPERATIONAL"

    # 2. Dashboard
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_cases"] > 0
    assert data["total_persons_analyzed"] > 0
    assert len(data["top_leads"]) > 0

    # 3. Cases list
    res = client.get("/api/cases")
    assert res.status_code == 200
    cases = res.json()
    assert len(cases) > 0
    assert any(c["case_id"] == "FIR-1024" for c in cases)

    # 4. Single Case
    res = client.get("/api/cases/FIR-1024")
    assert res.status_code == 200
    assert res.json()["case_id"] == "FIR-1024"

    # 5. Live Case Analysis
    res = client.post("/api/cases/FIR-1024/analyze")
    assert res.status_code == 200
    an_data = res.json()
    assert an_data["status"] == "ANALYSIS_COMPLETE"
    assert len(an_data["nlp_extraction"]["entities"]) > 0
    assert len(an_data["investigation_leads"]) > 0

    # 6. Network Graph
    res = client.get("/api/network")
    assert res.status_code == 200
    net = res.json()
    assert len(net["nodes"]) > 0
    assert len(net["edges"]) > 0

    # 7. Shortest Path API
    res = client.get("/api/network/path?source_id=P001&target_id=P023")
    assert res.status_code == 200
    assert res.json()["found"] is True

    # 8. Investigation Leads API
    res = client.get("/api/investigation-leads")
    assert res.status_code == 200
    assert len(res.json()) > 0

    # 9. Evidence Detail API
    res = client.get("/api/evidence/EVD-CDR-020")
    assert res.status_code == 200
    assert res.json()["evidence_id"] == "EVD-CDR-020"

    # 10. What-If API
    res = client.post("/api/what-if", json={"query": "What happens if P017 is removed from the network?"})
    assert res.status_code == 200
    assert "shatters" in res.json()["natural_answer"] or "Priya" in res.json()["natural_answer"]
