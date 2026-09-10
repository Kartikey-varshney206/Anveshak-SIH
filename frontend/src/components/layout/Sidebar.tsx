import React from 'react';
import {
  LayoutDashboard,
  Lightbulb,
  Share2,
  Folder,
  Users,
  Activity,
  FileText,
  FileSpreadsheet,
  Settings,
  Shield
} from 'lucide-react';

export type PageTab =
  | 'dashboard'
  | 'leads'
  | 'network'
  | 'cases'
  | 'entities'
  | 'patterns'
  | 'evidence'
  | 'what-if'
  | 'lakehouse'
  | 'audit';

interface SidebarProps {
  activeTab: PageTab;
  onTabChange: (tab: PageTab) => void;
  badgeCounts?: {
    leads?: number;
    patterns?: number;
    cases?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  badgeCounts
}) => {
  const navItems: Array<{ id: PageTab; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'cases',
      label: 'Cases',
      icon: <Folder className="w-4 h-4" />,
      badge: badgeCounts?.cases
    },
    {
      id: 'leads',
      label: 'Investigation Leads',
      icon: <Lightbulb className="w-4 h-4" />,
      badge: badgeCounts?.leads
    },
    {
      id: 'network',
      label: 'Network Explorer',
      icon: <Share2 className="w-4 h-4" />
    },
    {
      id: 'evidence',
      label: 'Evidence',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'lakehouse',
      label: 'Reports',
      icon: <FileSpreadsheet className="w-4 h-4" />
    },
    {
      id: 'audit',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-56 bg-white border-r border-slate-200/80 flex flex-col justify-between select-none min-h-[calc(100vh-4rem)] flex-shrink-0">
      {/* Navigation List */}
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'entities' && activeTab === 'network');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id === 'entities' ? 'network' : item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && !isActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Slogan Card (Matching Reference Image) */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-blue-50/20 border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-1.5">
            <h4 className="text-xs font-bold text-blue-900 leading-tight">
              Smarter Investigations.<br />Safer Communities.
            </h4>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
            CrimeGraph AI helps you find the hidden connections.
          </p>
        </div>
        {/* Subtle shield watermark */}
        <div className="mt-3 flex items-center justify-start text-blue-400">
          <Shield className="w-6 h-6 text-blue-400 stroke-1" />
        </div>
      </div>
    </aside>
  );
};

