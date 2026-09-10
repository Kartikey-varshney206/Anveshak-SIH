import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Send,
  Route,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { WhatIfResponse, EntityNode, RelationshipEdge } from '../types/api';
import { runWhatIfSimulator } from '../services/api';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';

interface WhatIfSimulatorPageProps {
  initialPrompt?: string;
  onSelectEntity: (entityId: string) => void;
  onOpenEvidence?: (evidenceId: string) => void;
}

export const WhatIfSimulatorPage: React.FC<WhatIfSimulatorPageProps> = ({
  initialPrompt = '',
  onSelectEntity,
  onOpenEvidence
}) => {
  const [queryText, setQueryText] = useState<string>(
    initialPrompt || 'What entities connect FIR-1024 and FIR-1098?'
  );
  const [response, setResponse] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const presetQueries = [
    {
      title: 'Cross-Case Syndicate Bridge',
      query: 'What entities connect FIR-1024 and FIR-1098?',
      desc: 'Discovers how the gold smuggling ring coordinates with the cyber extortion syndicate.'
    },
    {
      title: 'Node Neutralization Impact',
      query: 'What happens if P017 is removed from the network?',
      desc: 'Simulates network fragmentation, severed communication channels, and residual bridges.'
    },
    {
      title: 'Multi-Hop Entity Linkage',
      query: 'How is Ravi connected to Zenith Global Solutions?',
      desc: 'Traces the 4-hop chain between the logistics controller and shell company.'
    },
    {
      title: 'Key Topological Connector',
      query: 'Which person connects the most cases?',
      desc: 'Identifies the individual with highest betweenness bridging disparate FIRs.'
    }
  ];

  const handleRunQuery = async (customQuery?: string) => {
    const q = customQuery || queryText;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await runWhatIfSimulator({ query: q });
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto text-slate-800">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            GRAPH-BACKED WHAT-IF INVESTIGATION SIMULATOR
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Simulate Hypotheses, Disruption Impacts & Multi-Hop Entity Pathways
        </h2>
        <p className="text-xs text-slate-500">
          Queries the real NetworkX knowledge graph and Lakehouse provenance. Not a generic chatbot.
        </p>
      </div>

      {/* Preset Query Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {presetQueries.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              setQueryText(item.query);
              handleRunQuery(item.query);
            }}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all space-y-1.5 shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 uppercase">{item.title}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.query}</h4>
            <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Interactive Query Input Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery();
          }}
          className="flex items-center space-x-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Ask a scenario (e.g. 'What entities connect FIR-1024 and FIR-1098?' or 'What happens if P017 is removed?')"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{loading ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </form>
      </div>

      {/* Simulation Result Presentation */}
      {response && (
        <div className="space-y-4 animate-fadeIn">
          {/* Natural Language Finding Banner */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Simulation Outcome & Investigative Synthesis
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Type: {response.scenario_type}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200">
              {response.natural_answer}
            </p>

            {/* Metrics Chips */}
            {response.impact_metrics && Object.keys(response.impact_metrics).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
                {Object.entries(response.impact_metrics).map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-400 capitalize">{k.replace(/_/g, ' ')}</div>
                    <div className="text-sm font-bold text-blue-600">{String(v)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subgraph Visualization */}
          {response.affected_entities && response.affected_entities.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-2 p-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Targeted Investigative Subgraph Slice ({response.affected_entities.length} Nodes, {response.highlighted_edges?.length || 0} Edges)
                </span>
                <span className="text-[10px] text-slate-400">Click any entity to inspect</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <CytoscapeGraph
                  nodes={response.affected_entities}
                  edges={response.highlighted_edges || []}
                  height="450px"
                  onNodeSelect={(n) => onSelectEntity(n.id)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
