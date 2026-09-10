import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ArrowRight,
  FileSearch,
  UserCheck,
  Flag,
  Share2,
  Folder,
  Phone,
  Landmark,
  MapPin
} from 'lucide-react';
import { InvestigationLead } from '../types/api';
import { fetchInvestigationLeads, updateLeadStatus } from '../services/api';

interface InvestigationLeadsPageProps {
  onSelectEntity: (entityId: string) => void;
  onOpenEvidence?: (evidenceId: string) => void;
}

export const InvestigationLeadsPage: React.FC<InvestigationLeadsPageProps> = ({
  onSelectEntity,
  onOpenEvidence
}) => {
  const [leads, setLeads] = useState<InvestigationLead[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvestigationLeads()
      .then((data) => setLeads(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.lead_id === leadId ? { ...l, status: newStatus as any } : l))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (selectedCategory !== 'ALL' && l.lead_category !== selectedCategory) return false;
    if (selectedSeverity !== 'ALL' && l.severity !== selectedSeverity) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto text-slate-800 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Investigation Leads</h2>
          <p className="text-sm text-slate-500 mt-1">AI-powered insights to help you focus on what matters most.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-white text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
          >
            <option value="ALL">All Lead Types</option>
            <option value="POTENTIAL_BRIDGE_INDIVIDUAL">Bridge Individual</option>
            <option value="SHARED_INFRASTRUCTURE_ANOMALY">Shared Infrastructure</option>
            <option value="CO_TRAVEL_CONVERGENCE">Co-Travel Overlap</option>
            <option value="FINANCIAL_CONDUIT_ACTIVITY">Financial Conduit</option>
          </select>
        </div>
      </div>

      {/* Global Disclaimer */}
      <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-xs font-medium text-amber-800">
          INVESTIGATIVE LEAD: These algorithmic findings require human review and do not establish guilt or legal liability.
        </p>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {filteredLeads.map((lead) => {
          let badgeColor = 'bg-slate-100 text-slate-700';
          let severityLabel = 'Low';
          if (lead.severity === 'CRITICAL' || lead.severity === 'HIGH') {
            badgeColor = 'bg-red-100 text-red-700';
            severityLabel = 'High';
          } else if (lead.severity === 'MEDIUM') {
            badgeColor = 'bg-amber-100 text-amber-700';
            severityLabel = 'Medium';
          }

          return (
            <div
              key={lead.lead_id}
              className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:border-blue-300"
            >
              <div className="flex items-start space-x-5">
                <span className={`px-3 py-1 ${badgeColor} font-bold text-[10px] uppercase rounded-full tracking-wide shrink-0 mt-0.5`}>
                  {severityLabel}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {lead.primary_entity_name || lead.primary_entity_id} - {lead.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{lead.why_it_matters}</p>
                  
                  {/* Connection Icons */}
                  <div className="flex items-center space-x-5 mt-3 text-[11px] font-semibold text-blue-600">
                    <span className="flex items-center"><Folder className="w-3.5 h-3.5 mr-1.5"/> {lead.associated_cases.length} Cases</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-slate-400 font-medium">Confidence</div>
                  <div className="text-xl font-bold text-blue-600 leading-tight">{Math.round(lead.confidence * 100)}%</div>
                </div>
                <button
                  onClick={() => onSelectEntity(lead.primary_entity_id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center shadow-sm whitespace-nowrap"
                >
                  View <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
