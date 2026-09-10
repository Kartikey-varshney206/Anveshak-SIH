import React from 'react';
import {
  X,
  FileSearch,
  CheckCircle2,
  Calendar,
  Layers,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { RelationshipEdge } from '../../types/api';
import { fetchEntityDetails } from '../../services/api';

interface EdgeDetailModalProps {
  edge: RelationshipEdge | null;
  onClose: () => void;
  onOpenEvidence?: (evidenceId: string) => void;
}

export const EdgeDetailModal: React.FC<EdgeDetailModalProps> = ({
  edge,
  onClose,
  onOpenEvidence
}) => {
  const [sourceName, setSourceName] = React.useState<string>('');
  const [targetName, setTargetName] = React.useState<string>('');

  React.useEffect(() => {
    if (!edge) {
      setSourceName('');
      setTargetName('');
      return;
    }

    setSourceName(edge.source);
    setTargetName(edge.target);

    Promise.all([
      fetchEntityDetails(edge.source).catch(() => null),
      fetchEntityDetails(edge.target).catch(() => null)
    ]).then(([sData, tData]) => {
      if (sData?.entity?.label) setSourceName(sData.entity.label);
      if (tData?.entity?.label) setTargetName(tData.entity.label);
    });
  }, [edge]);

  if (!edge) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <FileSearch className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Relationship Evidence Dossier
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Relationship Overview */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">EDGE ID:</span>
            <span className="text-blue-600 font-mono font-bold">{edge.id}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
            <div className="text-xs font-bold text-slate-800" title={edge.source}>{sourceName}</div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              <span>{edge.type}</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xs font-bold text-slate-800" title={edge.target}>{targetName}</div>
          </div>
        </div>

        {/* Provenance Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">AI Extraction Confidence</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.round(edge.confidence * 100)}%` }}
                />
              </div>
              <span className="font-bold text-blue-600">{Math.round(edge.confidence * 100)}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Associated Case</div>
            <div className="text-slate-800 font-semibold truncate">{edge.case_id || 'Cross-Case / Intelligence'}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Evidence Source Type</div>
            <div className="text-slate-800 font-semibold truncate">{edge.source_type_label || 'Lakehouse Gold Pipeline'}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Source Record Reference</div>
            <div className="text-blue-600 font-mono font-semibold truncate">{edge.source_record_id || 'N/A'}</div>
          </div>
        </div>

        {/* Evidence Snippet / Context */}
        {edge.properties?.evidence_snippet && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Source Report Snippet</div>
            <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
              "{edge.properties.evidence_snippet}"
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Close
          </button>
          {edge.source_record_id && onOpenEvidence && (
            <button
              onClick={() => {
                onOpenEvidence(edge.source_record_id!);
                onClose();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect Raw Evidence</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
