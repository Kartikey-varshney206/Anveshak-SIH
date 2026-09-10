"""
Entire Integration: Impact & Resilience Analysis Engine
Evaluates structural impact on criminal networks when specific nodes or channels are removed/neutralized.
"""

from typing import Dict, Any, Optional
from backend.app.graph.graph_adapter import graph_engine

class ImpactAnalysisEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.adapter_mode = "Entire Remote API" if self.api_key else "Entire Local Graph Impact Simulator"

    def analyze_node_removal(self, entity_id: str) -> Dict[str, Any]:
        """
        Simulates network disruption when an entity is removed.
        Returns:
        - Broken relationships
        - Disrupted cases
        - Fragmented clusters created
        - Remaining secondary bridges
        """
        raw_impact = graph_engine.simulate_node_removal(entity_id)
        if "error" in raw_impact:
            return raw_impact

        lbl = raw_impact["target_label"]
        broken = raw_impact["broken_relationships_count"]
        cases_aff = raw_impact["cases_affected_count"]
        clusters = raw_impact["affected_clusters_created"]
        rem_bridges = raw_impact["remaining_bridges"]

        summary = (
            f"If '{lbl}' ({entity_id}) is neutralized, the network experiences significant topological disruption: "
            f"{broken} direct operational relationships are broken, disconnecting {cases_aff} active investigation cases. "
            f"The network fragments into {clusters} separate clusters."
        )

        recommendations = []
        if rem_bridges:
            rem_str = ", ".join([f"{b['label']} (Betweenness: {b['betweenness']})" for b in rem_bridges])
            recommendations.append(
                f"Anticipate communications rerouting through secondary bridge actors: {rem_str}."
            )
        else:
            recommendations.append("No immediate high-centrality fallback bridge exists in the current network.")

        return {
            "entity_id": entity_id,
            "entity_label": lbl,
            "engine_mode": self.adapter_mode,
            "broken_relationships_count": broken,
            "affected_clusters_count": clusters,
            "affected_cases": raw_impact["affected_cases"],
            "remaining_bridges": rem_bridges,
            "resilience_impact_score": raw_impact["resilience_impact_score"],
            "narrative_summary": summary,
            "tactical_recommendations": recommendations
        }

impact_analysis_engine = ImpactAnalysisEngine()
