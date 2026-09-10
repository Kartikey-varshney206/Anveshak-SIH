import React, { useEffect, useState } from 'react';
import {
  X,
  Shield,
  Phone,
  Truck,
  MapPin,
  Building2,
  Landmark,
  FileText,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  FileSearch,
  History,
  Sparkles,
  Link,
  Cpu
} from 'lucide-react';
import { EntityNode, EntityDetail } from '../../types/api';
import { fetchEntityDetails } from '../../services/api';

interface EntityDetailDrawerProps {
  entityId: string | null;
  onClose: () => void;
  onSelectConnectedEntity?: (entityId: string) => void;
  onRunWhatIf?: (entityId: string) => void;
  dataMasked?: boolean;
}

export const EntityDetailDrawer: React.FC<EntityDetailDrawerProps> = ({
  entityId,
  onClose,
  onSelectConnectedEntity,
  onRunWhatIf,
  dataMasked = false
}) => {
  const [details, setDetails] = useState<EntityDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entityId) {
      setDetails(null);
      return;
    }
    setLoading(true);
    fetchEntityDetails(entityId)
      .then((data) => setDetails(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [entityId]);

  if (!entityId) return null;

  const maskPhone = (phone?: string) => {
    if (!phone) return 'N/A';
    if (!dataMasked) return phone;
    return phone.replace(/(\+?91[\-\s]?)?(\d{2})\d{5}(\d{3})/, '$1$2*****$3');
  };

  const maskAccount = (acc?: string) => {
    if (!acc) return 'N/A';
    if (!dataMasked) return acc;
    if (acc.length <= 4) return '****';
    return acc.slice(0, 2) + '******' + acc.slice(-4);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            ENTITY 360° INTELLIGENCE PROFILE
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
        {loading ? (
          <div className="flex items-center justify-center h-48 space-x-2 text-xs text-blue-600 font-medium">
            <Activity className="w-4 h-4 animate-spin" />
            <span>Resolving Graph Dossier...</span>
          </div>
        ) : details ? (
          <>
            {/* Primary Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono text-blue-600 font-bold">{details.entity.id}</div>
                  <h3 className="text-base font-bold text-slate-900">{details.entity.label}</h3>
                  {details.entity.properties?.alias && (
                    <div className="text-xs text-slate-500 italic">Alias: "{details.entity.properties.alias}"</div>
                  )}
                </div>
                <span className="text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {details.entity.type}
                </span>
              </div>

              {/* Badges & Flags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {details.entity.is_bridge && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>CRITICAL BRIDGE NODE</span>
                  </span>
                )}
                {details.entity.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                    {details.entity.category}
                  </span>
                )}
              </div>

              {/* Key Attributes */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                {details.entity.properties?.dob && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">DOB:</span> <span className="font-semibold text-slate-700">{details.entity.properties.dob}</span>
                  </div>
                )}
                {details.entity.properties?.occupation && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Role:</span> <span className="font-semibold text-slate-700">{details.entity.properties.occupation}</span>
                  </div>
                )}
                {details.entity.properties?.phone_number && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Phone:</span> <span className="font-semibold text-slate-700 font-mono">{maskPhone(details.entity.properties.phone_number)}</span>
                  </div>
                )}
                {details.entity.properties?.registration_number && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Reg No:</span> <span className="font-semibold text-slate-700 font-mono">{details.entity.properties.registration_number}</span>
                  </div>
                )}
                {details.entity.properties?.account_number && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Account:</span> <span className="font-semibold text-slate-700 font-mono">{maskAccount(details.entity.properties.account_number)}</span>
                  </div>
                )}
                {details.entity.properties?.address && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Address:</span> <span className="font-semibold text-slate-700">{details.entity.properties.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Centrality Metrics */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Graph Centrality Metrics</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px]">DEGREE (EDGES)</div>
                  <div className="text-sm font-bold text-blue-600">{details.entity.degree || 0}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px]">BETWEENNESS</div>
                  <div className="text-sm font-bold text-amber-600">{details.entity.betweenness?.toFixed(4) || '0.0000'}</div>
                </div>
              </div>
            </div>

            {/* Connected Cases */}
            {details.connected_cases.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Associated Cases ({details.connected_cases.length})
                </div>
                <div className="space-y-1.5">
                  {details.connected_cases.map((c, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-mono text-blue-600 font-bold">{c.case_id}</div>
                      <div className="text-slate-900 font-semibold">{c.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{c.crime_type} • {c.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Relationships */}
            {details.relationships.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Direct Connections ({details.relationships.length})
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {details.relationships.map((r, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectConnectedEntity && onSelectConnectedEntity(r.connected_entity_id)}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        {r.direction === 'OUTGOING' ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <div>
                          <div className="text-slate-800 font-bold">{r.connected_entity_label}</div>
                          <div className="text-[10px] text-slate-500">{r.relation_type} ({Math.round(r.confidence * 100)}%)</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{r.connected_entity_id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Criminal Dossiers */}
            {details.prior_dossiers && details.prior_dossiers.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white border border-red-200 space-y-2 shadow-sm">
                <div className="flex items-center space-x-1.5 text-[10px] text-red-600 uppercase font-bold">
                  <History className="w-3.5 h-3.5" />
                  <span>Prior Judicial Dossiers ({details.prior_dossiers.length})</span>
                </div>
                <div className="space-y-1.5">
                  {details.prior_dossiers.map((d, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-red-50/50 border border-red-100 text-xs">
                      <div className="text-slate-900 font-semibold">{d.prior_charge}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{d.charge_date} • {d.verdict_status} ({d.court_reference})</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tactical Action Buttons */}
            <div className="pt-2 space-y-2">
              {onRunWhatIf && (
                <button
                  onClick={() => onRunWhatIf(details.entity.id)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Simulate Node Removal Impact</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-500 p-4">Failed to load entity details.</div>
        )}
      </div>
    </div>
  );
};
