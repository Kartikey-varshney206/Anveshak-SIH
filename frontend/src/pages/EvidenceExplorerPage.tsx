import React, { useState } from 'react';
import {
  FileSearch,
  Filter,
  CheckCircle2,
  Calendar,
  Lock,
  Unlock,
  Shield,
  Layers,
  FileText,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { EvidenceDetail } from '../types/api';

interface EvidenceExplorerPageProps {
  dataMasked: boolean;
  onToggleDataMask: () => void;
  onSelectEntity: (entityId: string) => void;
}

export const EvidenceExplorerPage: React.FC<EvidenceExplorerPageProps> = ({
  dataMasked,
  onToggleDataMask,
  onSelectEntity
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('EVD-CDR-020');

  const sampleEvidenceList: EvidenceDetail[] = [
    {
      evidence_id: 'EVD-CDR-020',
      evidence_type: 'Telecom CDR Intercept',
      title: 'Bilateral Call Series between PH-9876 and PH-3301',
      summary: '4 long-duration bilateral phone calls (640s, 310s, 480s) between Priya Sharma and Sameer Khan coinciding with FIR-1024 seizure events.',
      source_document: 'telecom_cdr_extract_may2026.csv',
      source_record_id: 'C-020',
      case_id: 'FIR-1024 / FIR-1098',
      timestamp: '2026-05-18 21:10:45',
      confidence: 0.98,
      raw_payload: {
        caller_phone: dataMasked ? '+91-98765*****10' : '+91-98765-43210 (P017)',
        receiver_phone: dataMasked ? '+91-99330*****20' : '+91-99330-14920 (P023)',
        cell_tower: 'TWR-MUM-104 -> TWR-GGN-201',
        duration_seconds: 640,
        intercept_officer: 'Sub-Insp. A. Shinde',
        warrant_ref: 'WNT-2026-MAH-4410'
      },
      chain_of_custody: [
        { step: '1', actor: 'Telecom Service Provider', action: 'CDR Log Export under Sec 91 CrPC', time: '2026-05-19 10:00:00' },
        { step: '2', actor: 'Cyber Forensics Cell', action: 'Cryptographic SHA-256 Hash Verified', time: '2026-05-19 14:30:00' },
        { step: '3', actor: 'CrimeGraph Lakehouse', action: 'Bronze -> Silver Ingestion', time: '2026-05-19 15:00:00' }
      ]
    },
    {
      evidence_id: 'EVD-TX-004',
      evidence_type: 'Banking Wire Record',
      title: 'Inter-Entity Wire Transfer of Rs 24,00,000',
      summary: 'RTGS wire from Apex FinTech (ACC-9921) to Zenith Global Solutions (ACC-2005) establishing direct financial conduit.',
      source_document: 'fiu_bank_transactions_q2.csv',
      source_record_id: 'TX-004',
      case_id: 'FIR-1024 / FIR-1098',
      timestamp: '2026-05-20 14:40:00',
      confidence: 0.96,
      raw_payload: {
        source_account: dataMasked ? '5519******17 (Axis Bank)' : '551920394817 (Axis Bank, Apex FinTech)',
        destination_account: dataMasked ? '8819******20 (ICICI Bank)' : '881920394820 (ICICI Bank, Zenith Global)',
        amount_inr: '24,00,000.00',
        payment_mode: 'RTGS',
        utr_number: 'AXISRTGS2026052000492819',
        suspicion_notes: 'No trade invoice recorded.'
      },
      chain_of_custody: [
        { step: '1', actor: 'Axis Bank Compliance Desk', action: 'STR Filing to FIU-IND', time: '2026-05-21 09:15:00' },
        { step: '2', actor: 'FIU-IND Analyst Desk', action: 'Forwarded to Special Investigation Unit', time: '2026-05-22 11:00:00' }
      ]
    },
    {
      evidence_id: 'EVD-SURV-002',
      evidence_type: 'Field Tactical Surveillance',
      title: 'Tactical Sighting Log: Priya Sharma at Warehouse 4',
      summary: 'Observation log of Priya Sharma arriving at Dockland Logistics in vehicle MH-02-EF-9921 for covert document delivery.',
      source_document: 'surveillance_logbook_may2026.csv',
      source_record_id: 'SURV-002',
      case_id: 'FIR-1024',
      timestamp: '2026-05-13 22:15:00',
      confidence: 0.92,
      raw_payload: {
        target_entity: 'P017 (Priya Sharma)',
        vehicle: dataMasked ? 'MH-02-**-9921' : 'MH-02-EF-9921 (Hyundai Creta)',
        location: 'Warehouse 4, Dockland Industrial Estate (LOC-004)',
        observing_officer: 'Officer V. Shinde',
        notes: 'Delivered sealed storage case to warehouse freight contact.'
      },
      chain_of_custody: [
        { step: '1', actor: 'Field Surveillance Unit 4', action: 'Signed Field Observation Log', time: '2026-05-13 23:30:00' },
        { step: '2', actor: 'Special Branch Registry', action: 'Digitized into Case Annexure', time: '2026-05-14 08:00:00' }
      ]
    },
    {
      evidence_id: 'EVD-SURV-004',
      evidence_type: 'Field Tactical Surveillance',
      title: 'Tactical Sighting Log: Sameer Khan at Warehouse 4',
      summary: 'Observation log of Sameer Khan arriving at Warehouse 4 in vehicle DL-04-XY-8811, directly overlapping with Priya Sharma location.',
      source_document: 'surveillance_logbook_june2026.csv',
      source_record_id: 'SURV-004',
      case_id: 'FIR-1098',
      timestamp: '2026-06-21 23:45:00',
      confidence: 0.94,
      raw_payload: {
        target_entity: 'P023 (Sameer Khan)',
        vehicle: dataMasked ? 'DL-04-**-8811' : 'DL-04-XY-8811 (Honda City)',
        location: 'Warehouse 4, Dockland Logistics (LOC-004)',
        observing_officer: 'Officer V. Shinde',
        notes: 'Arrived at night to receive parcel.'
      },
      chain_of_custody: [
        { step: '1', actor: 'Field Surveillance Unit 4', action: 'Signed Observation Entry', time: '2026-06-22 01:00:00' }
      ]
    }
  ];

  const selectedRecord = sampleEvidenceList.find((e) => e.evidence_id === selectedEvidenceId) || sampleEvidenceList[0];

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto text-slate-800">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileSearch className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              EVIDENCE EXPLORER & CHAIN OF CUSTODY
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
            Insight ➔ Relationship ➔ Evidence ➔ Source Record Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically verifiable provenance linking every graph edge to raw CDRs, banking records, and surveillance notes.
          </p>
        </div>

        {/* Data Masking Controller */}
        <button
          onClick={onToggleDataMask}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            dataMasked
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {dataMasked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span>{dataMasked ? 'SENSITIVE DATA MASKED' : 'UNMASKED MODE'}</span>
        </button>
      </div>

      {/* Main Evidence Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Evidence List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Evidence Records ({sampleEvidenceList.length})
            </span>
          </div>

          <div className="space-y-2">
            {sampleEvidenceList.map((ev) => {
              const isSelected = ev.evidence_id === selectedRecord.evidence_id;
              return (
                <div
                  key={ev.evidence_id}
                  onClick={() => setSelectedEvidenceId(ev.evidence_id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-600 font-bold">{ev.evidence_id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {ev.evidence_type}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{ev.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{ev.case_id}</span>
                    <span className="font-semibold text-blue-600">{Math.round(ev.confidence * 100)}% Conf</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Record Detail & Chain of Custody */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-blue-600 font-bold">{selectedRecord.evidence_id}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-600">{selectedRecord.source_document}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedRecord.title}</h3>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-blue-600">{Math.round(selectedRecord.confidence * 100)}%</div>
                <div className="text-[10px] text-slate-400 font-medium">AI CONFIDENCE</div>
              </div>
            </div>

            {/* Narrative Summary */}
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {selectedRecord.summary}
            </p>

            {/* Raw Field Payload */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Source Document Record Payload
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1.5">
                {Object.entries(selectedRecord.raw_payload || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                    <span className="font-semibold text-blue-900">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chain of Custody Steps */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Chain of Custody & Forensic Provenance
              </span>
              <div className="space-y-1.5">
                {selectedRecord.chain_of_custody?.map((c) => (
                  <div
                    key={c.step}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                        {c.step}
                      </span>
                      <div>
                        <div className="text-slate-900 font-semibold">{c.action}</div>
                        <div className="text-[10px] text-slate-500">{c.actor}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{c.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
