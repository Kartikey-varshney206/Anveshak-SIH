import {
  DashboardSummary,
  CaseDetail,
  GraphNetwork,
  ShortestPathResponse,
  InvestigationLead,
  SuspiciousPattern,
  EvidenceDetail,
  WhatIfRequest,
  WhatIfResponse,
  EntityDetail,
  AuditLogEntry
} from '../types/api';

const API_BASE = '/api';

export async function fetchDashboard(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to load dashboard summary');
  return res.json();
}

export async function fetchCases(): Promise<CaseDetail[]> {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error('Failed to load cases list');
  return res.json();
}

export async function fetchCase(caseId: string): Promise<CaseDetail> {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) throw new Error(`Failed to load case ${caseId}`);
  return res.json();
}

export async function analyzeCase(caseId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/analyze`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to execute analysis for case ${caseId}`);
  return res.json();
}

export async function investigateQuery(query: string, contextCaseId?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, context_case_id: contextCaseId }),
  });
  if (!res.ok) throw new Error('Failed to run investigation query');
  return res.json();
}

export async function fetchNetwork(params?: {
  case_id?: string;
  entity_type?: string;
  min_confidence?: number;
}): Promise<GraphNetwork> {
  const query = new URLSearchParams();
  if (params?.case_id) query.set('case_id', params.case_id);
  if (params?.entity_type) query.set('entity_type', params.entity_type);
  if (params?.min_confidence !== undefined) query.set('min_confidence', params.min_confidence.toString());

  const res = await fetch(`${API_BASE}/network?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load graph network');
  return res.json();
}

export async function fetchEntityNetwork(entityId: string, hops: number = 1): Promise<GraphNetwork> {
  const res = await fetch(`${API_BASE}/network/entity/${entityId}?hops=${hops}`);
  if (!res.ok) throw new Error(`Failed to load network for entity ${entityId}`);
  return res.json();
}

export async function fetchShortestPath(sourceId: string, targetId: string): Promise<ShortestPathResponse> {
  const res = await fetch(`${API_BASE}/network/path?source_id=${sourceId}&target_id=${targetId}`);
  if (!res.ok) throw new Error('Failed to calculate shortest path');
  return res.json();
}

export async function fetchBridgeNodes(): Promise<{ bridge_nodes_count: number; bridge_nodes: any[] }> {
  const res = await fetch(`${API_BASE}/network/bridges`);
  if (!res.ok) throw new Error('Failed to fetch bridge nodes');
  return res.json();
}

export async function fetchEntityDetails(entityId: string): Promise<EntityDetail> {
  const res = await fetch(`${API_BASE}/entities/${entityId}`);
  if (!res.ok) throw new Error(`Failed to load details for entity ${entityId}`);
  return res.json();
}

export async function fetchInvestigationLeads(caseId?: string): Promise<InvestigationLead[]> {
  const query = caseId ? `?case_id=${caseId}` : '';
  const res = await fetch(`${API_BASE}/investigation-leads${query}`);
  if (!res.ok) throw new Error('Failed to load investigation leads');
  return res.json();
}

export async function updateLeadStatus(leadId: string, status: string): Promise<any> {
  const res = await fetch(`${API_BASE}/investigation-leads/${leadId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update lead status');
  return res.json();
}

export async function fetchSuspiciousPatterns(caseId?: string): Promise<SuspiciousPattern[]> {
  const query = caseId ? `?case_id=${caseId}` : '';
  const res = await fetch(`${API_BASE}/patterns${query}`);
  if (!res.ok) throw new Error('Failed to load suspicious patterns');
  return res.json();
}

export async function fetchEvidence(evidenceId: string): Promise<EvidenceDetail> {
  const res = await fetch(`${API_BASE}/evidence/${evidenceId}`);
  if (!res.ok) throw new Error(`Failed to load evidence ${evidenceId}`);
  return res.json();
}

export async function runWhatIfSimulator(req: WhatIfRequest): Promise<WhatIfResponse> {
  const res = await fetch(`${API_BASE}/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Failed to run What-If simulation query');
  return res.json();
}

export async function fetchLakehouseStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/databricks/pipeline`);
  if (!res.ok) throw new Error('Failed to fetch Lakehouse status');
  return res.json();
}

export async function triggerLakehouseSync(): Promise<any> {
  const res = await fetch(`${API_BASE}/databricks/sync`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to trigger Lakehouse sync');
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/audit`);
  if (!res.ok) throw new Error('Failed to load audit logs');
  return res.json();
}

export async function searchEntities(query: string): Promise<any> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Failed to search entities');
  return res.json();
}
