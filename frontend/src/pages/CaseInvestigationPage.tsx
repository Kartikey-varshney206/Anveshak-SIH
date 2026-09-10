import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Sparkles,
  Share2,
  Calendar,
  AlertTriangle,
  Play,
  CheckCircle2,
  Activity,
  FileText,
  Clock,
  Eye,
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  Folder,
  ChevronDown
} from 'lucide-react';
import { CaseDetail, GraphNetwork, InvestigationLead, SuspiciousPattern, NLPExtractionResult } from '../types/api';
import { fetchCases, fetchCase, analyzeCase, fetchNetwork, fetchInvestigationLeads } from '../services/api';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';

interface CaseInvestigationPageProps {
  initialCaseId?: string;
  onSelectEntity: (entityId: string) => void;
  onOpenEvidence?: (evidenceId: string) => void;
  onNavigateWhatIf?: (prompt: string) => void;
}

export const CaseInvestigationPage: React.FC<CaseInvestigationPageProps> = ({
  initialCaseId = 'FIR-1024',
  onSelectEntity,
  onOpenEvidence,
  onNavigateWhatIf
}) => {
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialCaseId);
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [network, setNetwork] = useState<GraphNetwork>({ nodes: [], edges: [] });
  const [leads, setLeads] = useState<InvestigationLead[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'entities' | 'evidence' | 'timeline' | 'leads'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  useEffect(() => {
    fetchCases()
      .then((data) => setCases(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedCaseId) return;
    Promise.all([
      fetchCase(selectedCaseId), 
      fetchNetwork({ case_id: selectedCaseId }),
      fetchInvestigationLeads(selectedCaseId).catch(() => [])
    ])
      .then(([cData, netData, leadsData]) => {
        setCaseDetail(cData);
        setNetwork(netData);
        setLeads(leadsData);
      })
      .catch((err) => console.error(err));
  }, [selectedCaseId]);

  const handleRunAnalysis = async () => {
    if (!selectedCaseId) return;
    setIsAnalyzing(true);
    setAnalysisStep('1. Reading Lakehouse Bronze Ingestion Records...');
    
    setTimeout(() => {
      setAnalysisStep('2. Running NLP Entity & Relationship Extraction on FIR Text...');
    }, 400);

    setTimeout(() => {
      setAnalysisStep('3. Updating Knowledge Graph & Medallion Gold Layer...');
    }, 800);

    setTimeout(() => {
      setAnalysisStep('4. Computing Centrality, Bridge Nodes & Suspicious Patterns...');
    }, 1200);

    try {
      const res = await analyzeCase(selectedCaseId);
      setAnalysisResult(res);
      setNetwork(res.subgraph);
      // Refresh case details
      const updatedCase = await fetchCase(selectedCaseId);
      setCaseDetail(updatedCase);
      setActiveTab('network');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  if (!caseDetail) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 space-x-3 text-blue-600 font-medium text-sm">
        <Activity className="w-5 h-5 animate-spin" />
        <span>Loading Case Registry Dossier...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto text-slate-800 bg-[#f8fafc] min-h-screen">
      
      {/* Case Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div className="relative flex items-center">
            <select
              className="text-2xl font-bold text-slate-900 tracking-tight bg-transparent border-none outline-none cursor-pointer hover:bg-slate-100 rounded-lg py-1 pl-2 pr-8 appearance-none focus:ring-2 focus:ring-blue-500"
              value={selectedCaseId}
              onChange={(e) => {
                setCaseDetail(null); // Show loading state
                setSelectedCaseId(e.target.value);
              }}
            >
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id} className="text-base font-normal">
                  {c.case_id}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {caseDetail.status || 'Under Investigation'}
          </span>
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-slate-900">{caseDetail.title}</h1>
          <div className="flex items-center space-x-6 mt-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Filed: {caseDetail.filing_date}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Jurisdiction: {caseDetail.jurisdiction}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Lead Investigator: {caseDetail.lead_investigator}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-6 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
          { id: 'network', label: 'Network', icon: <Share2 className="w-4 h-4" /> },
          { id: 'entities', label: 'Entities', icon: <Layers className="w-4 h-4" /> },
          { id: 'evidence', label: 'Evidence', icon: <FileText className="w-4 h-4" /> },
          { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
          { id: 'leads', label: 'Leads', icon: <Sparkles className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column (8 cols) */}
          <div className="col-span-8 space-y-6">
            
            {/* Case Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Case Summary</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {caseDetail.summary || "Intercept of 48kg smuggled bullion arriving via container terminal concealed in industrial machinery consignment."}
              </p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                   <Layers className="w-4 h-4" />
                   <span className="text-xs font-bold">Entities</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 my-1">{network?.nodes?.length || 0}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                   <Share2 className="w-4 h-4" />
                   <span className="text-xs font-bold">Relationships</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 my-1">{network?.edges?.length || 0}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center space-x-2 text-amber-600 mb-2">
                   <Sparkles className="w-4 h-4" />
                   <span className="text-xs font-bold">Investigation Leads</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 my-1">{caseDetail.leads_count || 0}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center space-x-2 text-purple-600 mb-2">
                   <Activity className="w-4 h-4" />
                   <span className="text-xs font-bold">Cross-Case Links</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 my-1">{caseDetail.patterns_count || 0}</div>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols) */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 h-full flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span>Key Connections</span>
              </h3>
              <div className="space-y-3 flex-1">
                {network?.edges?.slice(0, 4).map((edge, idx) => {
                  const sourceNode = network.nodes.find(n => n.id === edge.source);
                  const targetNode = network.nodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  return (
                    <div key={idx} className="flex items-start space-x-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span><strong>{sourceNode.label}</strong> connects to <strong>{targetNode.label}</strong> ({edge.type})</span>
                    </div>
                  );
                })}
                {(!network?.edges || network.edges.length === 0) && (
                  <div className="text-sm text-slate-500">No key connections found.</div>
                )}
              </div>
              <button onClick={() => setActiveTab('network')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors mt-auto">
                Explore Network →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Tab Placeholders */}
      {activeTab === 'network' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <CytoscapeGraph
            nodes={network.nodes}
            edges={network.edges}
            height="600px"
            onNodeSelect={(n) => onSelectEntity(n.id)}
          />
        </div>
      )}

      {activeTab === 'entities' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Entity</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Role / Notes</th>
                  <th className="px-6 py-4 font-semibold text-right">Degree</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {network.nodes.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onSelectEntity(n.id)}>
                    <td className="px-6 py-4 font-semibold text-slate-900">{n.label || n.id}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-xs">
                        {n.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{n.properties?.notes || n.properties?.occupation || n.id}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">{n.degree || 0}</td>
                  </tr>
                ))}
                {(!network.nodes || network.nodes.length === 0) && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No entities found in this case network.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Source FIR Reports</span>
            </h3>
            <div className="space-y-3">
              {(caseDetail.fir_reports || []).map((fir, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{fir.report_id || `FIR Document ${i+1}`}</span>
                    <span className="text-xs text-slate-500">{fir.date || caseDetail.filing_date}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-3">{fir.summary || fir.text || 'No summary available.'}</p>
                </div>
              ))}
              {(!caseDetail.fir_reports || caseDetail.fir_reports.length === 0) && (
                <div className="text-sm text-slate-500">No FIR reports attached.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Surveillance Logs</span>
            </h3>
            <div className="space-y-3">
              {(caseDetail.surveillance_sightings || []).map((log, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{log.location || 'Unknown Location'}</span>
                    <span className="text-xs text-slate-500">{log.timestamp || log.date}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2">{log.notes || log.description || 'No notes.'}</p>
                </div>
              ))}
              {(!caseDetail.surveillance_sightings || caseDetail.surveillance_sightings.length === 0) && (
                <div className="text-sm text-slate-500">No surveillance logs attached.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Case Timeline</h3>
          <div className="relative border-l border-slate-200 ml-4 space-y-8">
            {(caseDetail.timeline_events || []).map((ev, i) => (
              <div key={i} className="pl-6 relative">
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[6.5px] top-1.5 border-2 border-white"></div>
                <div className="text-xs font-bold text-blue-600 mb-1">{ev.date || ev.timestamp}</div>
                <div className="font-bold text-slate-900">{ev.event || ev.title || 'Event Log'}</div>
                <p className="text-sm text-slate-600 mt-1">{ev.description || ev.details || 'No additional details.'}</p>
              </div>
            ))}
            {(!caseDetail.timeline_events || caseDetail.timeline_events.length === 0) && (
              <div className="pl-6 text-sm text-slate-500">No timeline events recorded.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="space-y-4">
          {leads.map(lead => (
            <div key={lead.lead_id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{lead.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{lead.why_it_matters}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${lead.severity === 'HIGH' || lead.severity === 'CRITICAL' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  {lead.severity}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-medium text-slate-500 flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>AI Confidence: {Math.round(lead.confidence * 100)}%</span>
                </div>
                <button onClick={() => onSelectEntity(lead.primary_entity_id)} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Inspect Entity →
                </button>
              </div>
            </div>
          ))}
          {leads.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
              No active leads for this case.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
