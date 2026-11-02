import React from 'react';
import {
  Calendar,
  Sparkles,
  AlertTriangle,
  FileCheck2,
  Settings2,
  Download,
  RotateCcw,
  Sun,
  Moon,
  Activity,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useRoster } from '../context/RosterContext';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenConflicts: () => void;
  onOpenSimulator: () => void;
  onOpenManage: () => void;
  onOpenApprovals: () => void;
  onOpenExport: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenConflicts,
  onOpenSimulator,
  onOpenManage,
  onOpenApprovals,
  onOpenExport,
  darkMode,
  toggleDarkMode,
}) => {
  const {
    month,
    year,
    metadata,
    conflicts,
    regenerateRoster,
    resetToDefaults,
  } = useRoster();

  const criticalConflicts = conflicts.filter(c => c.severity === 'CRITICAL');
  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  RosterDesk
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  DataStraw CX Ops
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {monthName} {year} · Smart Multi-Brand Scheduling
              </p>
            </div>
          </div>

          {/* View Mode Navigation Pills */}
          <nav className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            {[
              { id: 'company', label: 'Company Matrix', icon: Activity },
              { id: 'pod', label: 'Pod View', icon: UserCheck },
              { id: 'brand', label: 'Brand Coverage', icon: Calendar },
              { id: 'process', label: 'Process View', icon: Settings2 },
              { id: 'employee', label: 'Employee View', icon: UserCheck },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onViewChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Action Center Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Generate Button */}
            <button
              onClick={() => regenerateRoster(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/30 transition active:scale-95"
              title="Regenerate roster using constraint solver"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Solve Roster</span>
            </button>

            {/* Change Simulator */}
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition"
              title="Simulate leave or unavailability changes"
            >
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Simulate Change</span>
            </button>

            {/* Conflicts Badge Button */}
            <button
              onClick={onOpenConflicts}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                criticalConflicts.length > 0
                  ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}
              title="View conflicts and backup recommendations"
            >
              {criticalConflicts.length > 0 ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{criticalConflicts.length} Gaps</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Covered</span>
                </>
              )}
            </button>

            {/* Publish & Approvals */}
            <button
              onClick={onOpenApprovals}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                metadata.status === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {metadata.status === 'PUBLISHED' ? 'Published' : 'Approvals'}
              </span>
            </button>

            {/* Manage Data (CRUD) */}
            <button
              onClick={onOpenManage}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Manage Central Database (Employees, Brands, Processes, Rules)"
            >
              <Settings2 className="h-4 w-4" />
            </button>

            {/* Export */}
            <button
              onClick={onOpenExport}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Export Roster to CSV / JSON"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                if (window.confirm('Reset all roster data to the original DataStraw sample dataset?')) {
                  resetToDefaults();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Reset to default seed data"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'company', label: 'Company Matrix' },
            { id: 'pod', label: 'Pod View' },
            { id: 'brand', label: 'Brand Coverage' },
            { id: 'process', label: 'Process View' },
            { id: 'employee', label: 'Employee View' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
                currentView === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
