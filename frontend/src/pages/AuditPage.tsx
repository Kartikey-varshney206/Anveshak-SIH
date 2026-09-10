import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Lock,
  Eye,
  FileCheck,
  Clock,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { AuditLogEntry } from '../types/api';
import { fetchAuditLogs } from '../services/api';

interface AuditPageProps {
  currentRole: string;
}

export const AuditPage: React.FC<AuditPageProps> = ({ currentRole }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs()
      .then((data) => setLogs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const rolesMatrix = [
    {
      role: 'Investigator',
      desc: 'Authorized law enforcement agent leading field investigations.',
      perms: ['Read All Cases', 'Trigger Live Network Analysis', 'View Evidence Dossiers', 'Execute What-If Simulations', 'Triage & Verify Leads']
    },
    {
      role: 'Analyst',
      desc: 'Intelligence specialist conducting pattern analysis and cross-case topology studies.',
      perms: ['Read All Cases', 'View Knowledge Graph', 'Run Shortest Path / Bridge Analysis', 'Inspect Anomaly Patterns']
    },
    {
      role: 'Administrator',
      desc: 'System controller managing data pipeline ingestion, audit verification, and RBAC.',
      perms: ['All Investigator & Analyst Permissions', 'Trigger Full Lakehouse Medallion Sync', 'Manage Security Policies', 'Audit Trail Export']
    }
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto text-slate-800">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            SECURITY, RBAC & IMMUTABLE AUDIT REGISTRY
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Role-Based Access Control & Forensic Access Audit Logs
        </h2>
        <p className="text-xs text-slate-500">
          Strict chain of custody and accountability logging for every intelligence search, case analysis, and evidence access.
        </p>
      </div>

      {/* Role Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rolesMatrix.map((item) => {
          const isCurrent = currentRole === item.role;
          return (
            <div
              key={item.role}
              className={`p-4 rounded-2xl border space-y-3 transition-all ${
                isCurrent
                  ? 'bg-blue-50/50 border-blue-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className={`w-4 h-4 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                  <h3 className="text-sm font-bold text-slate-900">{item.role}</h3>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    ACTIVE ROLE
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-snug">{item.desc}</p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                {item.perms.map((p, i) => (
                  <div key={i} className="flex items-center space-x-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Immutable Access Audit Trail
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">{logs.length} Recorded Actions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action Description</th>
                <th className="p-3">Target Resource</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-600">{log.log_id}</td>
                  <td className="p-3 text-slate-600 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {log.user_role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-800 font-medium">{log.action}</td>
                  <td className="p-3 text-blue-700 font-mono text-[11px]">{log.target_resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
