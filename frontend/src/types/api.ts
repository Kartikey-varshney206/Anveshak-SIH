export type EntityType =
  | 'Person'
  | 'Phone'
  | 'Vehicle'
  | 'Location'
  | 'Organization'
  | 'BankAccount'
  | 'Case'
  | 'Event'
  | 'Unknown';

export interface EntityNode {
  id: string;
  label: string;
  type: EntityType | string;
  category?: string;
  properties?: Record<string, any>;
  degree?: number;
  betweenness?: number;
  community?: number;
  is_bridge?: boolean;
  cases: string[];
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  weight: number;
  confidence: number;
  case_id?: string;
  timestamp?: string;
  source_record_id?: string;
  source_type_label?: string;
  properties?: Record<string, any>;
}

export interface GraphNetwork {
  nodes: EntityNode[];
  edges: RelationshipEdge[];
  stats?: Record<string, any>;
}

export interface ShortestPathResponse {
  found: boolean;
  path: string[];
  length: number;
  nodes: EntityNode[];
  edges: RelationshipEdge[];
  explanation: string;
}

export interface EvidenceChainItem {
  evidence_id: string;
  title: string;
  source_type: string;
  snippet: string;
  timestamp?: string;
  case_id?: string;
  confidence: number;
}

export interface InvestigationLead {
  lead_id: string;
  title: string;
  lead_category: string;
  primary_entity_id: string;
  primary_entity_name: string;
  associated_cases: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  why_it_matters: string;
  evidence_chain: EvidenceChainItem[];
  recommended_action: string;
  status: 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISMISSED';
  created_at: string;
}

export interface SuspiciousPattern {
  pattern_id: string;
  pattern_type: string;
  severity: string;
  confidence: number;
  entities: string[];
  reason: string;
  evidence: string;
  time_period: string;
  associated_cases?: string[];
}

export interface EvidenceDetail {
  evidence_id: string;
  evidence_type: string;
  title: string;
  summary: string;
  source_document: string;
  source_record_id: string;
  case_id: string;
  timestamp: string;
  confidence: number;
  raw_payload?: Record<string, any>;
  chain_of_custody?: Array<{ step: string; actor: string; action: string; time: string }>;
}

export interface WhatIfRequest {
  query: string;
  scenario_type?: string;
  target_entity?: string;
  source_case?: string;
  target_case?: string;
}

export interface WhatIfResponse {
  query: string;
  scenario_type: string;
  natural_answer: string;
  reasoning_steps: string[];
  affected_entities: EntityNode[];
  highlighted_edges: RelationshipEdge[];
  impact_metrics: Record<string, any>;
  supporting_evidence: EvidenceChainItem[];
  confidence: number;
}

export interface ExtractedEntity {
  text: string;
  type: string;
  confidence: number;
  start_char?: number;
  end_char?: number;
  normalized_id?: string;
}

export interface ExtractedRelationship {
  source_text: string;
  target_text: string;
  relationship_type: string;
  confidence: number;
  evidence_snippet: string;
}

export interface NLPExtractionResult {
  document_id: string;
  entities: ExtractedEntity[];
  relationships: ExtractedRelationship[];
  engine_used: string;
  processing_time_ms: number;
}

export interface CaseDetail {
  case_id: string;
  case_number: string;
  title: string;
  crime_type: string;
  jurisdiction: string;
  filing_date: string;
  status: string;
  lead_investigator: string;
  summary: string;
  entities_count: number;
  relationships_count: number;
  leads_count: number;
  patterns_count: number;
  fir_reports: Array<Record<string, any>>;
  timeline_events: Array<Record<string, any>>;
  surveillance_sightings: Array<Record<string, any>>;
}

export interface DashboardSummary {
  total_cases: number;
  total_persons_analyzed: number;
  active_networks_count: number;
  detected_patterns_count: number;
  investigation_leads_count: number;
  cross_case_connections_count: number;
  top_leads: InvestigationLead[];
  recent_patterns: SuspiciousPattern[];
  high_connectivity_nodes: EntityNode[];
  lakehouse_status: Record<string, any>;
}

export interface EntityDetail {
  entity: EntityNode;
  connected_cases: Array<Record<string, any>>;
  relationships: Array<Record<string, any>>;
  evidence_records: Array<Record<string, any>>;
  timeline_events: Array<Record<string, any>>;
  prior_dossiers: Array<Record<string, any>>;
  centrality_metrics: Record<string, number>;
}

export interface AuditLogEntry {
  log_id: string;
  timestamp: string;
  user_role: string;
  action: string;
  target_resource: string;
  details: Record<string, any>;
}
