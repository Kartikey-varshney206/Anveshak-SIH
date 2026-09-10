import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  Sparkles,
  Link2,
  MapPin,
  Landmark,
  PhoneCall,
  Activity,
  ArrowRight
} from 'lucide-react';
import { SuspiciousPattern } from '../types/api';
import { fetchSuspiciousPatterns } from '../services/api';

interface SuspiciousPatternsPageProps {
  onSelectEntity: (entityId: string) => void;
}

export const SuspiciousPatternsPage: React.FC<SuspiciousPatternsPageProps> = ({
  onSelectEntity
}) => {
  const [patterns, setPatterns] = useState<SuspiciousPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuspiciousPatterns()
      .then((data) => setPatterns(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto text-slate-800">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-red-600" />
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
            ANOMALY & SUSPICIOUS PATTERN ENGINE
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Automated Pattern Discovery across Multi-Jurisdictional Crime Data
        </h2>
        <p className="text-xs text-slate-500">
          Detects hidden cross-case links, bridge actors, high-frequency call bursts, co-location hotspots, and financial conduits.
        </p>
      </div>

      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((pat) => (
          <div
            key={pat.pattern_id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                    pat.severity === 'CRITICAL'
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {pat.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{pat.pattern_id}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{pat.pattern_type}</h3>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-blue-600">{Math.round(pat.confidence * 100)}%</div>
                <div className="text-[9px] text-slate-400 font-medium">{pat.time_period}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {pat.reason}
            </p>

            {/* Evidence & Cases */}
            <div className="text-xs text-slate-500 space-y-1">
              <div><span className="text-slate-400 font-medium">Evidence:</span> <span className="font-semibold text-slate-700">{pat.evidence}</span></div>
              {pat.associated_cases && pat.associated_cases.length > 0 && (
                <div><span className="text-slate-400 font-medium">Cases:</span> <span className="text-blue-600 font-semibold">{pat.associated_cases.join(', ')}</span></div>
              )}
            </div>

            {/* Involved Entity Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 mr-1">ENTITIES:</span>
              {pat.entities.map((entId) => (
                <button
                  key={entId}
                  onClick={() => onSelectEntity(entId)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-xs font-semibold transition-colors"
                >
                  {entId}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
