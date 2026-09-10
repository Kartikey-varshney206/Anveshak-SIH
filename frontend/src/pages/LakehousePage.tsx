import React, { useEffect, useState } from 'react';
import {
  Database,
  Layers,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Activity,
  Shield,
  FileCheck,
  Server,
  AlertTriangle
} from 'lucide-react';
import { fetchLakehouseStatus, triggerLakehouseSync } from '../services/api';

export const LakehousePage: React.FC = () => {
  const [statusData, setStatusData] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>('');

  const loadStatus = () => {
    fetchLakehouseStatus()
      .then((data) => setStatusData(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Running Bronze -> Silver -> Gold Medallion pipeline transformations...');
    try {
      const res = await triggerLakehouseSync();
      setStatusData((prev: any) => ({
        ...prev,
        last_run: res.metrics?.last_run || new Date().toISOString(),
        bronze_tables: res.metrics?.bronze_records || prev.bronze_tables,
        silver_tables: res.metrics?.silver_records || prev.silver_tables,
        gold_tables: res.metrics?.gold_records || prev.gold_tables
      }));
      setSyncMessage('Lakehouse Medallion pipeline and Knowledge Graph updated successfully!');
    } catch (err) {
      console.error(err);
      setSyncMessage('Failed to synchronize Lakehouse.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto text-slate-800 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Generate Report</h2>
        <p className="text-sm text-slate-500 mt-1">Compile investigation findings, network graphs, and leads into a formal dossier.</p>
      </div>

      {/* Global Disclaimer */}
      <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
        <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Notice</h4>
          <p className="text-xs text-blue-800 mt-0.5">
            This report is generated from available data and serves as an investigative aid. It does not establish guilt or criminal responsibility.
          </p>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Report Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Report Details</h3>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Case ID</label>
                <select className="w-full bg-slate-50 text-sm font-semibold text-slate-800 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 shadow-sm">
                  <option>FIR-1024</option>
                  <option>FIR-1098</option>
                  <option>FIR-1105</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Report Type</label>
                <select className="w-full bg-slate-50 text-sm font-semibold text-slate-800 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 shadow-sm">
                  <option>Comprehensive Dossier</option>
                  <option>Network Summary</option>
                  <option>Leads Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Summary / Objective</label>
              <textarea 
                className="w-full bg-slate-50 text-sm text-slate-800 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 shadow-sm h-24 resize-none"
                defaultValue="Detailed overview of maritime smuggling operations connected to FIR-1024, including key bridge individuals and financial conduits."
              />
            </div>
          </div>

          {/* Select Sections */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Select Sections to Include</h3>
            
            <div className="space-y-3">
              {[
                'Executive Summary',
                'Network Graph Visualization',
                'Entity Profiles & Extracted Data',
                'Activity Timeline',
                'AI-Synthesized Leads'
              ].map((section, idx) => (
                <label key={idx} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-800">{section}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Export Format */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Export Format</h3>
            
            <div className="space-y-3 flex-1">
              <label className="flex items-start space-x-3 p-4 rounded-xl border-2 border-blue-600 bg-blue-50 cursor-pointer transition-all">
                <input type="radio" name="format" defaultChecked className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-blue-900">PDF Document</div>
                  <div className="text-xs text-blue-700 mt-1 leading-relaxed">Standard format for court submissions and sharing.</div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50 cursor-pointer transition-all">
                <input type="radio" name="format" className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Export for Evidence Storage (Lakehouse)</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">Raw JSON & GraphML for downstream analysis.</div>
                </div>
              </label>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-bold transition-colors shadow-md mt-auto flex items-center justify-center space-x-2">
              <FileCheck className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
