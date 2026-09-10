import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import {
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  Share2
} from 'lucide-react';
import { EntityNode, RelationshipEdge } from '../../types/api';

interface CytoscapeGraphProps {
  nodes: EntityNode[];
  edges: RelationshipEdge[];
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  onNodeSelect?: (node: EntityNode) => void;
  onEdgeSelect?: (edge: RelationshipEdge) => void;
  height?: string;
  showControls?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  Person: '#2563EB',      // Blue
  Phone: '#10B981',       // Green
  Vehicle: '#8B5CF6',     // Purple
  Location: '#EF4444',    // Red
  Organization: '#F97316',// Orange
  Case: '#0284C7',        // Sky Blue
  BankAccount: '#EAB308', // Gold
  Event: '#EC4899',       // Pink
  Unknown: '#94A3B8'      // Slate
};

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  nodes,
  edges,
  highlightedNodeIds = [],
  highlightedEdgeIds = [],
  onNodeSelect,
  onEdgeSelect,
  height = '380px',
  showControls = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [activeView, setActiveView] = useState<'network' | 'map' | 'timeline'>('network');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert nodes to cytoscape format with custom labels matching the design
    const cyNodes = nodes.map((n) => {
      const isHighlighted = highlightedNodeIds.includes(n.id);
      const isBridge = n.is_bridge;
      const color = isBridge ? '#1E3A8A' : (TYPE_COLORS[n.type] || '#2563EB');
      
      const primaryText = n.label && n.label !== n.id ? n.label : n.id;
      let displayLabel = primaryText;
      
      if (isBridge) displayLabel = `${primaryText}\n(Bridge)`;
      else if (n.type === 'Person') displayLabel = `${primaryText}\n(Contact)`;
      else if (n.type === 'Phone') displayLabel = `${primaryText}\n(Phone)`;
      else if (n.type === 'Vehicle') displayLabel = `${primaryText}\n(Vehicle)`;
      else if (n.type === 'Location') displayLabel = `${primaryText}\n(Location)`;
      else if (n.type === 'Organization') displayLabel = `${primaryText}\n(Organization)`;
      else if (n.type === 'Case') displayLabel = `${primaryText}\n(Case)`;

      return {
        data: {
          id: n.id,
          label: displayLabel,
          type: n.type,
          color: color,
          isBridge: isBridge,
          isHighlighted: isHighlighted,
          degree: n.degree || 1,
          rawNode: n
        }
      };
    });

    // Convert edges to cytoscape format
    const cyEdges = edges.map((e) => {
      const isHighlighted = highlightedEdgeIds.includes(e.id);
      let edgeColor = '#CBD5E1';
      if (e.type === 'CONTACTED' || e.type === 'COMMUNICATED_WITH') edgeColor = '#93C5FD';
      else if (e.type === 'TRANSFERRED_TO' || e.type === 'FINANCIAL_LINK') edgeColor = '#FDE68A';
      else if (e.type === 'VISITED') edgeColor = '#FCA5A5';
      else if (e.type === 'OWNED' || e.type === 'USED') edgeColor = '#DDD6FE';
      else if (e.type === 'WORKED_WITH') edgeColor = '#FED7AA';

      return {
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: '',
          type: e.type,
          lineColor: edgeColor,
          weight: e.weight || 1,
          isHighlighted: isHighlighted,
          rawEdge: e
        }
      };
    });

    // Initialize Cytoscape with clean white canvas styles
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#334155',
            'font-size': '9px',
            'font-weight': 600,
            'font-family': 'Inter, sans-serif',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'width': 34,
            'height': 34,
            'border-width': 2,
            'border-color': '#FFFFFF',
            'overlay-opacity': 0,
            'underlay-color': '#E2E8F0',
            'underlay-padding': '3px',
            'underlay-opacity': 0.8
          }
        },
        {
          selector: 'node[?isBridge]',
          style: {
            'width': 44,
            'height': 44,
            'background-color': '#1E3A8A',
            'border-width': 3,
            'border-color': '#FFFFFF',
            'underlay-color': '#93C5FD',
            'underlay-padding': '6px',
            'underlay-opacity': 0.8
          }
        },
        {
          selector: 'node[?isHighlighted]',
          style: {
            'width': 48,
            'height': 48,
            'border-width': 3,
            'border-color': '#2563EB',
            'underlay-color': '#BFDBFE',
            'underlay-padding': '8px',
            'underlay-opacity': 1.0
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': 'data(lineColor)',
            'target-arrow-color': 'data(lineColor)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.7,
            'opacity': 0.85
          }
        },
        {
          selector: 'edge[?isHighlighted]',
          style: {
            'width': 3,
            'line-color': '#2563EB',
            'target-arrow-color': '#2563EB',
            'opacity': 1.0
          }
        }
      ] as any[],
      layout: {
        name: 'cose',
        animate: false,
        fit: true,
        padding: 40,
        nodeOverlap: 20,
        componentSpacing: 60
      }
    });

    cy.on('tap', 'node', (evt: EventObject) => {
      const nodeData = evt.target.data('rawNode');
      if (onNodeSelect && nodeData) onNodeSelect(nodeData);
    });

    cy.on('tap', 'edge', (evt: EventObject) => {
      const edgeData = evt.target.data('rawEdge');
      if (onEdgeSelect && edgeData) onEdgeSelect(edgeData);
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, highlightedNodeIds, highlightedEdgeIds]);

  const handleZoomIn = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    cyRef.current?.fit(undefined, 40);
  };

  return (
    <div className={`relative w-full h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Top Header Controls Overlay */}
      {showControls && (
        <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-sm z-10 relative">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Crime Network Graph</h3>
            <p className="text-[11px] text-slate-400">
              <span className="text-brand-600 font-semibold cursor-pointer">Visualize relationships</span> between people, cases, locations and more.
            </p>
          </div>

          {/* View Toggles (Network | Map | Timeline) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveView('network')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeView === 'network'
                  ? 'bg-brand-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Network
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeView === 'map'
                  ? 'bg-brand-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeView === 'timeline'
                  ? 'bg-brand-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>
      )}

      {/* Floating Legend Box on the Top Left */}
      <div className="absolute top-16 left-4 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 shadow-sm space-y-1.5 text-[11px] font-medium text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span>Person</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>Phone</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          <span>Vehicle</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span>Location</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
          <span>Organization</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
          <span>Case</span>
        </div>
      </div>

      {/* Floating Zoom / Expand Controls on the Right */}
      <div className="absolute top-16 right-4 z-20 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-sm flex flex-col p-1 space-y-1">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleFit}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Fit to Canvas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Cytoscape Canvas */}
      <div
        ref={containerRef}
        style={{ height: isFullscreen ? '100vh' : height }}
        className="w-full bg-white cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
