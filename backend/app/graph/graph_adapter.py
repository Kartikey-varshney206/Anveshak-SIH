"""
Criminal Knowledge Graph Engine & Pluggable Graph Adapter
Implements in-memory NetworkX MultiDiGraph with graph analytics (Centrality, Shortest Path,
Community Detection, Bridge Identification, Subgraph Extraction, and Node Removal Simulation)
alongside an interface for Neo4j database connection.
"""

import os
import networkx as nx
from typing import List, Dict, Any, Optional, Set, Tuple
from backend.app.models.schemas import (
    EntityNode, RelationshipEdge, GraphNetwork,
    ShortestPathResponse
)

class BaseGraphAdapter:
    def add_node(self, node_id: str, label: str, node_type: str, properties: Optional[Dict[str, Any]] = None):
        raise NotImplementedError

    def add_edge(self, source: str, target: str, rel_type: str, weight: float = 1.0,
                 confidence: float = 0.9, properties: Optional[Dict[str, Any]] = None):
        raise NotImplementedError

    def get_full_graph(self) -> GraphNetwork:
        raise NotImplementedError

class LocalNetworkXAdapter(BaseGraphAdapter):
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.undirected_cache: Optional[nx.Graph] = None
        self.centrality_cache: Dict[str, Dict[str, float]] = {}
        self.community_cache: Dict[str, int] = {}
        self.bridge_cache: Set[str] = set()

    def clear(self):
        self.graph.clear()
        self.undirected_cache = None
        self.centrality_cache.clear()
        self.community_cache.clear()
        self.bridge_cache.clear()

    def add_node(self, node_id: str, label: str, node_type: str, properties: Optional[Dict[str, Any]] = None):
        props = properties or {}
        cases = props.get("cases", [])
        if isinstance(cases, str):
            cases = [c.strip() for c in cases.split(",") if c.strip()]

        existing = self.graph.nodes.get(node_id, {})
        merged_cases = set(existing.get("cases", [])) | set(cases)

        self.graph.add_node(
            node_id,
            id=node_id,
            label=label,
            type=node_type,
            category=props.get("risk_category") or props.get("risk_level") or props.get("status") or "Standard",
            cases=list(merged_cases),
            properties=props
        )
        self._invalidate_cache()

    def add_edge(self, source: str, target: str, rel_type: str, weight: float = 1.0,
                 confidence: float = 0.9, properties: Optional[Dict[str, Any]] = None):
        if not self.graph.has_node(source):
            self.add_node(source, source, "Unknown")
        if not self.graph.has_node(target):
            self.add_node(target, target, "Unknown")

        props = properties or {}
        edge_id = props.get("edge_id") or f"EDGE-{source}-{target}-{rel_type}"

        # Update node case references if edge has case_id
        case_id = props.get("case_id")
        if case_id and case_id != "UNSPECIFIED":
            for nid in [source, target]:
                curr_cases = set(self.graph.nodes[nid].get("cases", []))
                for c in case_id.split(","):
                    c_clean = c.strip()
                    if c_clean and c_clean != "UNSPECIFIED":
                        curr_cases.add(c_clean)
                self.graph.nodes[nid]["cases"] = list(curr_cases)

        self.graph.add_edge(
            source,
            target,
            key=edge_id,
            id=edge_id,
            type=rel_type,
            label=rel_type.replace("_", " ").title(),
            weight=weight,
            confidence=confidence,
            case_id=case_id,
            timestamp=props.get("timestamp"),
            source_record_id=props.get("source_record_id"),
            source_type_label=props.get("source_type_label"),
            properties=props
        )
        self._invalidate_cache()

    def _invalidate_cache(self):
        self.undirected_cache = None
        self.centrality_cache.clear()

    def _get_undirected(self) -> nx.Graph:
        if self.undirected_cache is None:
            # Create a simple undirected graph for centrality & community algorithms
            u_graph = nx.Graph()
            for n, data in self.graph.nodes(data=True):
                u_graph.add_node(n, **data)
            for u, v, data in self.graph.edges(data=True):
                if u_graph.has_edge(u, v):
                    u_graph[u][v]["weight"] += data.get("weight", 1.0)
                else:
                    u_graph.add_edge(u, v, weight=data.get("weight", 1.0))
            self.undirected_cache = u_graph
        return self.undirected_cache

    def calculate_metrics(self, force: bool = False):
        if not force and self.centrality_cache:
            return
        u_graph = self._get_undirected()
        if len(u_graph) == 0:
            return

        # 1. Degree Centrality
        degree_dict = dict(u_graph.degree())
        
        # 2. Betweenness Centrality (Topological unweighted paths)
        betweenness_dict = nx.betweenness_centrality(u_graph, normalized=True)

        # 3. Community Detection (Greedy Modularity)
        try:
            communities = nx.community.greedy_modularity_communities(u_graph)
            comm_map = {}
            for comm_id, comm_nodes in enumerate(communities):
                for node in comm_nodes:
                    comm_map[node] = comm_id
        except Exception:
            comm_map = {n: 0 for n in u_graph.nodes()}

        # 4. Bridge Nodes Detection (high betweenness top 10% or nodes connecting multiple components)
        sorted_betweenness = sorted(betweenness_dict.items(), key=lambda x: x[1], reverse=True)
        threshold = sorted_betweenness[min(5, len(sorted_betweenness)-1)][1] if len(sorted_betweenness) > 5 else 0.05
        bridges = {n for n, b in betweenness_dict.items() if b >= max(threshold, 0.04)}

        self.community_cache = comm_map
        self.bridge_cache = bridges
        self.centrality_cache = {
            "degree": {n: float(d) for n, d in degree_dict.items()},
            "betweenness": betweenness_dict
        }

        # Update node attributes
        for n in self.graph.nodes():
            self.graph.nodes[n]["degree"] = degree_dict.get(n, 0)
            self.graph.nodes[n]["betweenness"] = round(betweenness_dict.get(n, 0.0), 4)
            self.graph.nodes[n]["community"] = comm_map.get(n, 0)
            self.graph.nodes[n]["is_bridge"] = (n in bridges)

    def get_full_graph(self) -> GraphNetwork:
        self.calculate_metrics()
        nodes = []
        for n, data in self.graph.nodes(data=True):
            nodes.append(EntityNode(
                id=n,
                label=data.get("label", n),
                type=data.get("type", "Unknown"),
                category=data.get("category"),
                properties=data.get("properties", {}),
                degree=data.get("degree", 0),
                betweenness=data.get("betweenness", 0.0),
                community=data.get("community", 0),
                is_bridge=data.get("is_bridge", False),
                cases=data.get("cases", [])
            ))

        edges = []
        for u, v, k, data in self.graph.edges(keys=True, data=True):
            edges.append(RelationshipEdge(
                id=data.get("id", f"{u}-{v}-{k}"),
                source=u,
                target=v,
                type=data.get("type", "CONNECTED_TO"),
                label=data.get("label"),
                weight=data.get("weight", 1.0),
                confidence=data.get("confidence", 0.9),
                case_id=data.get("case_id"),
                timestamp=data.get("timestamp"),
                source_record_id=data.get("source_record_id"),
                source_type_label=data.get("source_type_label"),
                properties=data.get("properties", {})
            ))

        stats = {
            "node_count": len(nodes),
            "edge_count": len(edges),
            "bridge_nodes_count": len(self.bridge_cache),
            "communities_count": len(set(self.community_cache.values())) if self.community_cache else 1
        }
        return GraphNetwork(nodes=nodes, edges=edges, stats=stats)

    def get_subgraph_for_case(self, case_id: str) -> GraphNetwork:
        self.calculate_metrics()
        matched_nodes = set()
        matched_edges = []

        for u, v, k, data in self.graph.edges(keys=True, data=True):
            c_val = str(data.get("case_id", ""))
            if case_id in c_val or (case_id == "ALL"):
                matched_nodes.add(u)
                matched_nodes.add(v)
                matched_edges.append(RelationshipEdge(
                    id=data.get("id", f"{u}-{v}-{k}"),
                    source=u,
                    target=v,
                    type=data.get("type", "CONNECTED_TO"),
                    label=data.get("label"),
                    weight=data.get("weight", 1.0),
                    confidence=data.get("confidence", 0.9),
                    case_id=data.get("case_id"),
                    timestamp=data.get("timestamp"),
                    source_record_id=data.get("source_record_id"),
                    source_type_label=data.get("source_type_label"),
                    properties=data.get("properties", {})
                ))

        # Also add nodes explicitly tagged with case
        for n, data in self.graph.nodes(data=True):
            if case_id in data.get("cases", []):
                matched_nodes.add(n)

        nodes = []
        for n in matched_nodes:
            data = self.graph.nodes.get(n, {})
            nodes.append(EntityNode(
                id=n,
                label=data.get("label", n),
                type=data.get("type", "Unknown"),
                category=data.get("category"),
                properties=data.get("properties", {}),
                degree=data.get("degree", 0),
                betweenness=data.get("betweenness", 0.0),
                community=data.get("community", 0),
                is_bridge=data.get("is_bridge", False),
                cases=data.get("cases", [])
            ))

        return GraphNetwork(nodes=nodes, edges=matched_edges, stats={"case_id": case_id, "node_count": len(nodes), "edge_count": len(matched_edges)})

    def get_entity_neighborhood(self, entity_id: str, hops: int = 1) -> GraphNetwork:
        self.calculate_metrics()
        if not self.graph.has_node(entity_id):
            return GraphNetwork(nodes=[], edges=[], stats={"error": "Entity not found"})

        u_graph = self._get_undirected()
        sub_nodes = set([entity_id])
        current_layer = set([entity_id])

        for _ in range(hops):
            next_layer = set()
            for n in current_layer:
                if u_graph.has_node(n):
                    next_layer.update(u_graph.neighbors(n))
            sub_nodes.update(next_layer)
            current_layer = next_layer

        nodes = []
        for n in sub_nodes:
            data = self.graph.nodes.get(n, {})
            nodes.append(EntityNode(
                id=n,
                label=data.get("label", n),
                type=data.get("type", "Unknown"),
                category=data.get("category"),
                properties=data.get("properties", {}),
                degree=data.get("degree", 0),
                betweenness=data.get("betweenness", 0.0),
                community=data.get("community", 0),
                is_bridge=data.get("is_bridge", False),
                cases=data.get("cases", [])
            ))

        edges = []
        for u, v, k, data in self.graph.edges(keys=True, data=True):
            if u in sub_nodes and v in sub_nodes:
                edges.append(RelationshipEdge(
                    id=data.get("id", f"{u}-{v}-{k}"),
                    source=u,
                    target=v,
                    type=data.get("type", "CONNECTED_TO"),
                    label=data.get("label"),
                    weight=data.get("weight", 1.0),
                    confidence=data.get("confidence", 0.9),
                    case_id=data.get("case_id"),
                    timestamp=data.get("timestamp"),
                    source_record_id=data.get("source_record_id"),
                    source_type_label=data.get("source_type_label"),
                    properties=data.get("properties", {})
                ))

        return GraphNetwork(nodes=nodes, edges=edges, stats={"center_entity": entity_id, "hops": hops, "node_count": len(nodes), "edge_count": len(edges)})

    def find_shortest_path(self, source_id: str, target_id: str) -> ShortestPathResponse:
        u_graph = self._get_undirected()
        if not u_graph.has_node(source_id) or not u_graph.has_node(target_id):
            return ShortestPathResponse(found=False, explanation=f"One or both entities ({source_id}, {target_id}) do not exist in the graph.")

        try:
            path_nodes = nx.shortest_path(u_graph, source=source_id, target=target_id)
            
            nodes = []
            for n in path_nodes:
                data = self.graph.nodes.get(n, {})
                nodes.append(EntityNode(
                    id=n,
                    label=data.get("label", n),
                    type=data.get("type", "Unknown"),
                    category=data.get("category"),
                    properties=data.get("properties", {}),
                    degree=data.get("degree", 0),
                    betweenness=data.get("betweenness", 0.0),
                    community=data.get("community", 0),
                    is_bridge=data.get("is_bridge", False),
                    cases=data.get("cases", [])
                ))

            # Gather edges along the path
            edges = []
            for i in range(len(path_nodes) - 1):
                u, v = path_nodes[i], path_nodes[i+1]
                edge_found = False
                for u_e, v_e, k, data in self.graph.edges(keys=True, data=True):
                    if (u_e == u and v_e == v) or (u_e == v and v_e == u):
                        edges.append(RelationshipEdge(
                            id=data.get("id", f"{u_e}-{v_e}-{k}"),
                            source=u_e,
                            target=v_e,
                            type=data.get("type", "CONNECTED_TO"),
                            label=data.get("label"),
                            weight=data.get("weight", 1.0),
                            confidence=data.get("confidence", 0.9),
                            case_id=data.get("case_id"),
                            timestamp=data.get("timestamp"),
                            source_record_id=data.get("source_record_id"),
                            source_type_label=data.get("source_type_label"),
                            properties=data.get("properties", {})
                        ))
                        edge_found = True
                        break

            labels_path = [self.graph.nodes[n].get("label", n) for n in path_nodes]
            explanation = " -> ".join(labels_path)
            return ShortestPathResponse(
                found=True,
                path=path_nodes,
                length=len(path_nodes) - 1,
                nodes=nodes,
                edges=edges,
                explanation=f"Shortest path of {len(path_nodes)-1} hops: {explanation}"
            )
        except nx.NetworkXNoPath:
            return ShortestPathResponse(
                found=False,
                explanation=f"No connected path exists between {source_id} and {target_id} in current intelligence network."
            )

    def simulate_node_removal(self, node_id: str) -> Dict[str, Any]:
        """
        Calculates network resilience and damage if a specific entity (e.g. bridge P017) is neutralized.
        """
        u_graph = self._get_undirected()
        if not u_graph.has_node(node_id):
            return {"error": f"Node {node_id} not found"}

        initial_components = nx.number_connected_components(u_graph)
        initial_edges = u_graph.number_of_edges()

        # Create temporary clone without the node
        clone = u_graph.copy()
        incident_edges = list(clone.edges(node_id))
        clone.remove_node(node_id)

        post_components = nx.number_connected_components(clone)
        broken_edges_count = len(incident_edges)
        
        # Affected cases
        node_cases = self.graph.nodes[node_id].get("cases", [])
        
        # Remaining alternative bridges
        betweenness = nx.betweenness_centrality(clone, normalized=True)
        top_remaining_bridges = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)[:3]
        remaining_bridge_labels = [
            {"id": n, "label": self.graph.nodes[n].get("label", n), "betweenness": round(b, 4)}
            for n, b in top_remaining_bridges if b > 0.03
        ]

        return {
            "target_node": node_id,
            "target_label": self.graph.nodes[node_id].get("label", node_id),
            "broken_relationships_count": broken_edges_count,
            "affected_clusters_created": max(1, post_components - initial_components + 1),
            "cases_affected_count": len(node_cases),
            "affected_cases": node_cases,
            "remaining_bridges": remaining_bridge_labels,
            "resilience_impact_score": round(min(1.0, (broken_edges_count * 0.1) + (post_components - initial_components) * 0.2), 2)
        }

# Global instance
graph_engine = LocalNetworkXAdapter()
