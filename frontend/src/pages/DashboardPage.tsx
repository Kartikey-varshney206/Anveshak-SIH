import React, { useEffect, useState } from 'react';
import {
  Folder,
  Users,
  Share2,
  Lightbulb,
  Calendar,
  PlusCircle,
  UploadCloud,
  FileText,
  ArrowRight,
  ChevronRight,
  Phone,
  Landmark,
  Camera,
  MapPin,
  MessageSquare,
  Sparkles,
  Send,
  HelpCircle,
  Network,
  Activity,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardSummary, CaseDetail, EntityNode, RelationshipEdge } from '../types/api';
import { fetchDashboard, fetchCases, fetchNetwork, runWhatIfSimulator } from '../services/api';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';
import { PageTab } from '../components/layout/Sidebar';
import { IntelligencePanel } from '../components/panel/IntelligencePanel';

interface DashboardPageProps {
  onNavigate: (tab: PageTab, params?: any) => void;
  onSelectEntity: (entityId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectEntity
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [network, setNetwork] = useState<any>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);

  // Sub-tabs in Case Details card
  const [activeCaseTab, setActiveCaseTab] = useState<'entities' | 'timeline' | 'evidence' | 'notes'>('entities');

  // Explainable Intelligence Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelNode, setPanelNode] = useState<EntityNode | null>(null);
  const [panelEdge, setPanelEdge] = useState<RelationshipEdge | null>(null);
  const [isNetworkLevel, setIsNetworkLevel] = useState(false);

  // Ask CrimeGraph AI state
  const [askQuery, setAskQuery] = useState('');
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askThinking, setAskThinking] = useState(false);

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchCases(), fetchNetwork({ case_id: 'FIR-1024' })])
      .then(([dashData, casesData, netData]) => {
        setSummary(dashData);
        setCases(casesData);
        setNetwork(netData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAskSubmit = async (questionText?: string) => {
    const q = questionText || askQuery;
    if (!q.trim()) return;
    setAskThinking(true);
    setAskAnswer(null);

    try {
      const response = await runWhatIfSimulator({ query: q });
      setAskAnswer(response.natural_answer);
    } catch (error) {
      console.error("Error running What-If simulation:", error);
      setAskAnswer("Sorry, I encountered an error while analyzing the criminal network.");
    } finally {
      setAskThinking(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto text-slate-800 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, Inspector</h2>
        <p className="text-sm text-slate-500 mt-1">Here is the latest intelligence from the CrimeGraph AI network.</p>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Total Entities</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary?.total_persons_analyzed || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <Folder className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Active Cases</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary?.total_cases || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-amber-600 mb-2">
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Investigation Leads</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary?.investigation_leads_count || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <Network className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Identified Patterns</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary?.detected_patterns_count || 0}</div>
        </div>
      </div>

      {/* Main Grid: Leads (Left) and Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col (2/3) - Top Leads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Top Investigation Leads</span>
            </h3>
            <button onClick={() => onNavigate('leads')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {summary?.top_leads?.slice(0, 3).map((lead, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
                <span className={`px-2.5 py-1 font-bold text-[10px] uppercase rounded-full shrink-0 ${
                  lead.severity === 'CRITICAL' || lead.severity === 'HIGH' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {lead.severity}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    {lead.primary_entity_name || lead.primary_entity_id} - {lead.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{lead.why_it_matters}</p>
                </div>
                <button onClick={() => onNavigate('leads')} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!summary?.top_leads || summary.top_leads.length === 0) && (
              <div className="text-sm text-slate-500 text-center py-4">No active leads found.</div>
            )}
          </div>
        </div>

        {/* Right Col (1/3) - Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Recent Activity Feed</span>
          </h3>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-800"><span className="font-bold">System</span> ingested 34 new call detail records (CDRs) for FIR-1098.</p>
                <span className="text-[10px] text-slate-400 font-medium">2 hours ago</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 border-t border-slate-100 pt-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-800"><span className="font-bold">CrimeGraph AI</span> generated 2 new leads for FIR-1024.</p>
                <span className="text-[10px] text-slate-400 font-medium">5 hours ago</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 border-t border-slate-100 pt-4">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-800"><span className="font-bold">Investigator</span> manually linked P003 and P045.</p>
                <span className="text-[10px] text-slate-400 font-medium">1 day ago</span>
              </div>
            </div>
            
            <button className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 pt-2 border-t border-slate-100">
              View All Activity
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

