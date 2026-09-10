import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, PageTab } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { CaseInvestigationPage } from './pages/CaseInvestigationPage';
import { NetworkExplorerPage } from './pages/NetworkExplorerPage';
import { InvestigationLeadsPage } from './pages/InvestigationLeadsPage';
import { SuspiciousPatternsPage } from './pages/SuspiciousPatternsPage';
import { EvidenceExplorerPage } from './pages/EvidenceExplorerPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { LakehousePage } from './pages/LakehousePage';
import { AuditPage } from './pages/AuditPage';
import { EntityDetailDrawer } from './components/graph/EntityDetailDrawer';
import { EdgeDetailModal } from './components/graph/EdgeDetailModal';
import { RelationshipEdge } from './types/api';
import { fetchDashboard } from './services/api';
import { AssistantChat } from './components/panel/AssistantChat';

export function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<string>('Investigator');
  const [dataMasked, setDataMasked] = useState<boolean>(true);

  // Global Inspectors & Deep-Link State
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<RelationshipEdge | null>(null);
  const [targetCaseId, setTargetCaseId] = useState<string>('FIR-1024');
  const [whatIfPrompt, setWhatIfPrompt] = useState<string>('');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<string[]>([]);
  const [networkCaseId, setNetworkCaseId] = useState<string>('ALL');
  const [assistantPendingQuery, setAssistantPendingQuery] = useState<string | null>(null);
  const [badgeCounts, setBadgeCounts] = useState<{ leads?: number; patterns?: number; cases?: number }>({
    leads: 4,
    patterns: 5,
    cases: 25
  });

  useEffect(() => {
    fetchDashboard()
      .then((dash) => {
        setBadgeCounts({
          leads: dash.investigation_leads_count,
          patterns: dash.detected_patterns_count,
          cases: dash.total_cases
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleNavigate = (tab: PageTab, params?: any) => {
    if (params?.caseId) {
      setTargetCaseId(params.caseId);
    }
    if (params?.prompt) {
      setWhatIfPrompt(params.prompt);
    }
    setActiveTab(tab);
  };

  const handleRunWhatIfForEntity = (entityId: string) => {
    setWhatIfPrompt(`What happens if ${entityId} is removed from the network?`);
    setSelectedEntityId(null);
    setActiveTab('what-if');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F8] text-slate-800 antialiased font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Top Application Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        dataMasked={dataMasked}
        onToggleDataMask={() => setDataMasked(!dataMasked)}
        onSelectEntity={(id) => setSelectedEntityId(id)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          badgeCounts={badgeCounts}
        />

        {/* Dynamic Center Page Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#F0F4F8] relative">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onSelectEntity={(id) => setSelectedEntityId(id)}
            />
          )}

          {activeTab === 'cases' && (
            <CaseInvestigationPage
              initialCaseId={targetCaseId}
              onSelectEntity={(id) => setSelectedEntityId(id)}
              onOpenEvidence={(evId) => {
                setActiveTab('evidence');
              }}
              onNavigateWhatIf={(prompt) => {
                setWhatIfPrompt(prompt);
                setActiveTab('what-if');
              }}
            />
          )}

          {activeTab === 'network' && (
            <NetworkExplorerPage
              initialCaseId={networkCaseId}
              initialHighlightedNodes={highlightedNodes}
              initialHighlightedEdgeIds={highlightedEdgeIds}
              onSelectEntity={(id) => setSelectedEntityId(id)}
              onSelectEdge={(edge) => setSelectedEdge(edge)}
              onOpenAssistant={(query) => setAssistantPendingQuery(query || "Explain the active network")}
            />
          )}

          {activeTab === 'leads' && (
            <InvestigationLeadsPage
              onSelectEntity={(id) => setSelectedEntityId(id)}
              onOpenEvidence={(evId) => {
                setActiveTab('evidence');
              }}
            />
          )}

          {activeTab === 'patterns' && (
            <SuspiciousPatternsPage
              onSelectEntity={(id) => setSelectedEntityId(id)}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceExplorerPage
              dataMasked={dataMasked}
              onToggleDataMask={() => setDataMasked(!dataMasked)}
              onSelectEntity={(id) => setSelectedEntityId(id)}
            />
          )}

          {activeTab === 'what-if' && (
            <WhatIfSimulatorPage
              initialPrompt={whatIfPrompt}
              onSelectEntity={(id) => setSelectedEntityId(id)}
              onOpenEvidence={(evId) => {
                setActiveTab('evidence');
              }}
            />
          )}

          {activeTab === 'lakehouse' && <LakehousePage />}

          {activeTab === 'audit' && <AuditPage currentRole={currentRole} />}
        </main>
      </div>

      {/* Footer Bar */}
      <footer className="h-9 bg-white border-t border-slate-200/80 px-6 flex items-center justify-between text-[11px] text-slate-500 select-none z-30">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-blue-600">CrimeGraph AI</span>
          <span>|</span>
          <span>Powered by <span className="font-medium text-slate-700">Databricks</span> • <span className="font-medium text-slate-700">Neo4j</span> • <span className="font-medium text-slate-700">Entire</span></span>
          <span>|</span>
          <span className="hidden md:inline">Building safer communities through data intelligence.</span>
        </div>
        <div className="font-mono text-slate-400">
          v1.0.0
        </div>
      </footer>

      {/* Slide-over 360° Entity Inspector Drawer */}
      <EntityDetailDrawer
        entityId={selectedEntityId}
        onClose={() => setSelectedEntityId(null)}
        onSelectConnectedEntity={(id) => setSelectedEntityId(id)}
        onRunWhatIf={handleRunWhatIfForEntity}
        dataMasked={dataMasked}
      />

      {/* Edge Evidence Modal */}
      <EdgeDetailModal
        edge={selectedEdge}
        onClose={() => setSelectedEdge(null)}
        onOpenEvidence={(evId) => {
          setSelectedEdge(null);
          setActiveTab('evidence');
        }}
      />

      {/* Global AI Assistant */}
      <AssistantChat 
        pendingQuery={assistantPendingQuery}
        onClearPendingQuery={() => setAssistantPendingQuery(null)}
        onOpenPath={(nodes, caseId, edgeIds) => {
          setHighlightedNodes(nodes || []);
          setHighlightedEdgeIds(edgeIds || []);
          if (caseId) {
            setNetworkCaseId(caseId);
            setTargetCaseId(caseId);
          } else {
            setNetworkCaseId('ALL');
          }
          setActiveTab('network');
        }} 
      />
    </div>
  );
}

export default App;
