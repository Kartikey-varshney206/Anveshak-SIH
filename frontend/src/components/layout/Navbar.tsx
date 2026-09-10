import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Shield,
  Lock,
  Unlock,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { searchEntities } from '../../services/api';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  dataMasked: boolean;
  onToggleDataMask: () => void;
  onSelectEntity?: (entityId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  dataMasked,
  onToggleDataMask,
  onSelectEntity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await searchEntities(searchQuery);
      setSearchResults(res.results || []);
      setShowResults(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Left: Brand & Tagline */}
      <div className="flex items-center space-x-3 min-w-[220px]">
        <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1.5C4.8 8.8 4 7.5 4 6a4 4 0 0 1 8-4Z"/>
            <path d="M16 16v1a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1"/>
            <path d="M12 13v3"/>
            <circle cx="18" cy="18" r="3"/>
            <circle cx="6" cy="18" r="3"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              CrimeGraph <span className="text-brand-600">AI</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">
            Connect • Analyze • Solve
          </p>
        </div>
      </div>

      {/* Center: Search Bar with Ctrl+K badge */}
      <div className="relative max-w-xl w-full mx-6">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by person, case, vehicle, phone, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-16 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all font-sans"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 text-[10px] font-mono font-medium">
            Ctrl + K
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 max-h-72 overflow-y-auto">
            <div className="flex items-center justify-between pb-1.5 px-2 border-b border-slate-100 text-[10px] text-slate-400 font-mono">
              <span>{searchResults.length} DISCOVERED ENTITIES</span>
              <button
                onClick={() => setShowResults(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>
            <div className="space-y-1 mt-1">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectEntity) onSelectEntity(item.id);
                    setShowResults(false);
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.id} • {item.type}</div>
                    </div>
                  </div>
                  {item.is_bridge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                      Bridge Node
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Notifications, Theme, Masking, Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications Icon */}
        <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User Profile Info */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Inspector Sharma"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-800 leading-tight">Inspector Sharma</div>
            <div className="text-[10px] text-slate-400 font-medium">Senior Investigator</div>
          </div>
        </div>
      </div>
    </header>
  );
};
