import React, { useEffect, useState } from 'react';
import {
  Share2,
  Filter,
  Search,
  Route,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Activity,
  CheckCircle2,
  Folder,
  Phone,
  Landmark,
  MapPin,
  MessageSquare,
  User,
  X,
  ShieldCheck
} from 'lucide-react';
import { GraphNetwork, EntityNode, RelationshipEdge, ShortestPathResponse, CaseDetail } from '../types/api';
import { fetchNetwork, fetchShortestPath, fetchCases } from '../services/api';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';

interface NetworkExplorerPageProps {
  onSelectEntity: (entityId: string) => void;
  onSelectEdge: (edge: RelationshipEdge) => void;
  initialCaseId?: string;
  initialHighlightedNodes?: string[];
  initialHighlightedEdgeIds?: string[];
  onOpenAssistant?: (query?: string) => void;
}

export const NetworkExplorerPage: React.FC<NetworkExplorerPageProps> = ({
  onSelectEntity,
  onSelectEdge,
  initialCaseId = 'ALL',
  initialHighlightedNodes = [],
  initialHighlightedEdgeIds = [],
  onOpenAssistant
}) => {
  const [network, setNetwork] = useState<GraphNetwork>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseDetail[]>([]);
  
  // Filters
  const [selectedCase, setSelectedCase] = useState<string>(initialCaseId);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0.0);

  // Highlighting
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>(initialHighlightedNodes);
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<string[]>(initialHighlightedEdgeIds);

  // Sync with prop changes (e.g. when coming from AI Assistant)
  useEffect(() => {
    if (initialCaseId && initialCaseId !== selectedCase) {
      setSelectedCase(initialCaseId);
    }
  }, [initialCaseId]);

  useEffect(() => {
    if (initialHighlightedNodes.length > 0) {
      setHighlightedNodeIds(initialHighlightedNodes);
    }
  }, [initialHighlightedNodes]);

  useEffect(() => {
    if (initialHighlightedEdgeIds.length > 0) {
      setHighlightedEdgeIds(initialHighlightedEdgeIds);
    }
  }, [initialHighlightedEdgeIds]);

  useEffect(() => {
    fetchCases()
      .then((data) => setCases(data))
      .catch((err) => console.error('Failed to load cases in NetworkExplorer:', err));
  }, []);

  // Selection for right panel
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(null);

  const loadNetworkData = () => {
    setLoading(true);
    fetchNetwork({
      case_id: selectedCase === 'ALL' ? undefined : selectedCase,
      entity_type: selectedType === 'ALL' ? undefined : selectedType,
      min_confidence: minConfidence > 0 ? minConfidence : undefined
    })
      .then((data) => setNetwork(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNetworkData();
  }, [selectedCase, selectedType, minConfidence]);

  const handleClearHighlights = () => {
    setHighlightedNodeIds([]);
    setHighlightedEdgeIds([]);
    setSelectedCase('ALL');
    setSelectedType('ALL');
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto text-slate-800 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Network Explorer</h2>
            {selectedCase !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200">
                Active Case: {selectedCase}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Explore connections, multi-hop conduits, and suspect syndicate graphs in Neo4j.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedNode && (
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
              <span className="text-slate-400 font-mono">{selectedNode.id}</span>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
          )}
          <button 
            onClick={() => onOpenAssistant?.(selectedCase !== 'ALL' ? `explain ${selectedCase}` : "Explain the network connections and major suspect conduits")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center shadow-sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Explain Network
          </button>
        </div>
      </div>

      {/* Interactive Case & Entity Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Case Selector Dropdown */}
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Case Filter:</span>
            <select
              value={selectedCase}
              onChange={(e) => {
                setSelectedCase(e.target.value);
                setHighlightedNodeIds([]);
                setHighlightedEdgeIds([]);
              }}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Cases (Global Network)</option>
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id}>
                  {c.case_id} - {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Entity Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Entity Types</option>
              <option value="Person">Person / Suspects</option>
              <option value="Vehicle">Vehicles</option>
              <option value="Phone">Phone Numbers (CDR)</option>
              <option value="Location">Locations & Warehouses</option>
              <option value="Organization">Organizations / Shells</option>
              <option value="BankAccount">Bank Accounts</option>
            </select>
          </div>
        </div>

        {/* Stats & Reset */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700 font-mono font-semibold border border-slate-200">
            {loading ? 'Querying Neo4j...' : `${network.nodes.length} Nodes • ${network.edges.length} Relationships`}
          </div>

          {(highlightedNodeIds.length > 0 || selectedCase !== 'ALL' || selectedType !== 'ALL') && (
            <button
              onClick={handleClearHighlights}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`grid gap-6 ${selectedNode ? 'grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* Graph Canvas */}
        <div className={`${selectedNode ? 'col-span-8' : 'col-span-12'} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[700px] relative`}>
          <CytoscapeGraph
            nodes={network.nodes}
            edges={network.edges}
            highlightedNodeIds={highlightedNodeIds}
            highlightedEdgeIds={highlightedEdgeIds}
            height="100%"
            onNodeSelect={(node) => {
              setSelectedNode(node);
              onSelectEntity(node.id);
            }}
            onEdgeSelect={onSelectEdge}
          />
        </div>

        {/* Inline Intelligence Panel (Only visible if a node is selected) */}
        {selectedNode && (
          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              {/* Header */}
              <div>
                <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-[10px] uppercase rounded-full tracking-wide">High</span>
                <h3 className="text-lg font-bold text-slate-900 mt-4">{selectedNode.label || selectedNode.id} - {selectedNode.is_bridge ? 'Bridge Individual' : 'Entity'}</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Associated with cases: {selectedNode.cases?.join(', ') || 'Unknown'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 py-4 border-y border-slate-100">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-medium">Connections</div>
                  <div className="text-lg font-bold text-blue-600 leading-tight">{selectedNode.degree || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-medium">Cases</div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">{selectedNode.cases?.length || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-medium">Centrality</div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedNode.betweenness ? selectedNode.betweenness.toFixed(3) : '0.000'}
                  </div>
                </div>
              </div>

              {/* Why this matters */}
              <div>
                <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Why this matters</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedNode.label} {selectedNode.is_bridge ? 'links two otherwise separate case clusters through various relationships.' : 'provides a structural link in the case data.'}
                </p>
              </div>

              {/* View Full Details Button */}
              <button onClick={() => onSelectEntity(selectedNode.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-sm mt-4">
                View Full Details →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
