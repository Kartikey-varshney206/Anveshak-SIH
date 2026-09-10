import React from 'react';
import { EntityNode, RelationshipEdge } from '../../types/api';
import { 
  X, 
  AlertTriangle, 
  Network, 
  FileText, 
  Link, 
  MapPin, 
  Phone, 
  User, 
  Car, 
  Building,
  Briefcase,
  Clock,
  ArrowRight
} from 'lucide-react';

interface IntelligencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: EntityNode | null;
  selectedEdge: RelationshipEdge | null;
  isNetworkLevel: boolean;
  networkNodes?: EntityNode[];
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Person: <User className="w-4 h-4" />,
  Phone: <Phone className="w-4 h-4" />,
  Vehicle: <Car className="w-4 h-4" />,
  Location: <MapPin className="w-4 h-4" />,
  Organization: <Building className="w-4 h-4" />,
  Case: <Briefcase className="w-4 h-4" />
};

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  isOpen,
  onClose,
  selectedNode,
  selectedEdge,
  isNetworkLevel,
  networkNodes = []
}) => {
  if (!isOpen) return null;

  const getRelationshipExplanation = (type: string) => {
    switch(type) {
      case 'CONTACTED':
      case 'COMMUNICATED_WITH':
        return 'Communication relationship. Entities exchanged calls or messages.';
      case 'FINANCIAL_LINK':
      case 'TRANSFERRED_TO':
        return 'Financial transaction relationship. Money moved between these entities.';
      case 'SHARED_LOCATION':
      case 'VISITED':
        return 'Both entities were observed at the same location, indicating potential physical meeting.';
      case 'OWNS':
      case 'OWNED':
        return 'Person is associated with vehicle or property ownership.';
      case 'WORKED_WITH':
        return 'Professional or syndication association.';
      default:
        return `Connected via ${type.toLowerCase().replace(/_/g, ' ')} relationship.`;
    }
  };

  const getRecommendedAction = (type: string, isBridge: boolean) => {
    if (isBridge) return 'Issue subpoenas for communication and financial records. Place under elevated surveillance.';
    if (type === 'Person') return 'Conduct background check and verify alibis for dates of related cases.';
    if (type === 'Phone') return 'Request Call Detail Records (CDR) and tower dumps for this number.';
    if (type === 'Vehicle') return 'Check toll plaza logs and traffic camera footage (ANPR) for sightings.';
    if (type === 'BankAccount') return 'Freeze account pending investigation and audit transaction history.';
    if (type === 'Organization') return 'Audit corporate filings and beneficial ownership registries.';
    return 'Review associated case files for further context.';
  };

  const renderContent = () => {
    if (isNetworkLevel) {
      const bridgeNodesCount = networkNodes.filter(n => n.is_bridge).length;
      return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Network Intelligence</h3>
            <p className="text-xl font-bold text-slate-900">Overall Network Analysis</p>
          </div>
          
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Network className="w-4 h-4 mr-2" />
              Key Finding
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              This network exhibits high cohesion with {bridgeNodesCount} identified bridge nodes connecting different criminal cells. The topology suggests an organized syndicate rather than isolated incidents.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Why this matters</h4>
            <p className="text-sm text-slate-600">
              Cross-case connections indicate shared resources (burners, bank accounts, vehicles) between seemingly unrelated FIRs. Taking down the bridge nodes will likely fragment the organization.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Recommended Next Step</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-start">
              <ArrowRight className="w-4 h-4 mr-2 text-emerald-600 mt-0.5 shrink-0" />
              <span>Prioritize surveillance on identified bridge nodes. Consolidate evidence from connected FIRs for a unified RICO/syndicate charge.</span>
            </div>
          </div>
        </div>
      );
    }

    if (selectedNode) {
      return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-500 mb-1">
              {TYPE_ICONS[selectedNode.type] || <Network className="w-4 h-4" />}
              <span className="text-xs font-semibold uppercase tracking-wider">{selectedNode.type}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{selectedNode.label}</h3>
            {selectedNode.is_bridge && (
              <span className="inline-block mt-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-md border border-amber-200">
                CRITICAL BRIDGE NODE
              </span>
            )}
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
              Key Finding
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              {selectedNode.is_bridge 
                ? `${selectedNode.label} acts as a crucial bridge between multiple case clusters, indicating a coordination or resourcing role.`
                : `${selectedNode.label} is associated with ${selectedNode.cases?.length || 1} case(s) through ${selectedNode.degree || 1} distinct connections.`}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Why this matters</h4>
            <p className="text-sm text-slate-600">
              {selectedNode.degree && selectedNode.degree > 3 
                ? 'High connectivity (degree centrality) suggests this entity is deeply embedded in the operations.'
                : 'This entity provides a specific functional link in the investigation.'}
              {' '}It appears in the following related cases: {selectedNode.cases?.join(', ') || 'Unknown'}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Total Connections</div>
              <div className="text-lg font-bold text-slate-800">{selectedNode.degree || 0}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Network Centrality</div>
              <div className="text-lg font-bold text-slate-800">
                {selectedNode.betweenness ? selectedNode.betweenness.toFixed(4) : '0.000'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Recommended Next Step</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-start">
              <ArrowRight className="w-4 h-4 mr-2 text-emerald-600 mt-0.5 shrink-0" />
              <span>{getRecommendedAction(selectedNode.type, !!selectedNode.is_bridge)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (selectedEdge) {
      const sourceName = networkNodes.find(n => n.id === selectedEdge.source)?.label || selectedEdge.source;
      const targetName = networkNodes.find(n => n.id === selectedEdge.target)?.label || selectedEdge.target;

      return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Relationship Link</h3>
            <p className="text-xl font-bold text-slate-900">{sourceName} ↔ {targetName}</p>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
              <Link className="w-4 h-4 mr-2" />
              Key Finding: {selectedEdge.type.replace(/_/g, ' ')}
            </h4>
            <p className="text-sm text-indigo-800 leading-relaxed">
              {getRelationshipExplanation(selectedEdge.type)}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Why this matters</h4>
            <p className="text-sm text-slate-600">
              This connection establishes a direct link between two entities of interest. It demonstrates interaction and potential collaboration relevant to Case {selectedEdge.case_id || 'investigations'}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Confidence Score</div>
              <div className="text-lg font-bold text-emerald-600">{(selectedEdge.confidence * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Timestamp</div>
              <div className="text-sm font-medium text-slate-800 mt-1">
                {selectedEdge.timestamp ? new Date(selectedEdge.timestamp).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Evidence</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-start">
              <FileText className="w-4 h-4 mr-2 text-slate-400 mt-0.5 shrink-0" />
              <span className="italic">"Extracted from structured case logs." (Source Record ID: {selectedEdge.source_record_id || 'N/A'})</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center">
          <Network className="w-4 h-4 mr-2 text-blue-600" />
          Explainable Intelligence
        </h2>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </div>

      {/* Permanent Footer Disclaimer */}
      <div className="p-4 bg-amber-50 border-t border-amber-200">
        <div className="flex items-start text-amber-800">
          <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
          <p className="text-[10px] font-medium leading-relaxed">
            INVESTIGATIVE LEAD ONLY. This intelligence is generated algorithmically to assist investigations. It requires human verification and does not establish guilt or legal liability.
          </p>
        </div>
      </div>
    </div>
  );
};
