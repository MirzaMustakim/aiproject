import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, UserCheck, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { SchedulingConflict, BackupCandidate } from '../../types/roster';

interface ConflictDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  focusedProcessId?: string;
  focusedDay?: number;
}

export const ConflictDrawer: React.FC<ConflictDrawerProps> = ({
  isOpen,
  onClose,
  focusedProcessId,
  focusedDay,
}) => {
  const {
    conflicts,
    getBackupsForProcessAndDay,
    assignBackupToDeficit,
  } = useRoster();

  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  if (!isOpen) return null;

  const filteredConflicts = conflicts.filter(c => {
    if (severityFilter === 'ALL') return true;
    return c.severity === severityFilter;
  });

  const criticalCount = conflicts.filter(c => c.severity === 'CRITICAL').length;
  const warningCount = conflicts.filter(c => c.severity === 'WARNING').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-all">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${
              criticalCount > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Conflicts & Coverage Health
              </h2>
              <p className="text-xs text-slate-500">
                {criticalCount} critical gaps · {warningCount} rule warnings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-semibold ${
              severityFilter === 'ALL'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({conflicts.length})
          </button>
          <button
            onClick={() => setSeverityFilter('CRITICAL')}
            className={`px-2.5 py-1 rounded-md font-semibold ${
              severityFilter === 'CRITICAL'
                ? 'bg-rose-600 text-white'
                : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950'
            }`}
          >
            Critical Gaps ({criticalCount})
          </button>
          <button
            onClick={() => setSeverityFilter('WARNING')}
            className={`px-2.5 py-1 rounded-md font-semibold ${
              severityFilter === 'WARNING'
                ? 'bg-amber-600 text-white'
                : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950'
            }`}
          >
            Warnings ({warningCount})
          </button>
        </div>

        {/* Conflicts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredConflicts.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                All Coverage Requirements Satisfied!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Every operating brand and process meets client SLAs with zero critical deficits.
              </p>
            </div>
          ) : (
            filteredConflicts.map(conflict => {
              const isSelected = selectedConflictId === conflict.id;
              const isGap = conflict.severity === 'CRITICAL' && conflict.processId && conflict.day;
              const backups: BackupCandidate[] = isGap
                ? getBackupsForProcessAndDay(conflict.processId!, conflict.day!)
                : [];

              return (
                <div
                  key={conflict.id}
                  className={`p-3.5 rounded-xl border transition ${
                    conflict.severity === 'CRITICAL'
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                      : conflict.severity === 'WARNING'
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        conflict.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {conflict.type.replace(/_/g, ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {conflict.brandName ? `${conflict.brandName} · ${conflict.processName}` : conflict.employeeName}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {conflict.description}
                      </p>
                    </div>
                  </div>

                  {/* Backup Recommendations section for Coverage Gaps */}
                  {isGap && (
                    <div className="mt-3 pt-3 border-t border-rose-100 dark:border-rose-900/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Recommended Cross-Coverage Backups:
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {backups.length} candidates evaluated
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {backups.slice(0, 3).map((candidate, idx) => (
                          <div
                            key={candidate.employee.id}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                  {candidate.employee.name}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                                  {candidate.score}% Match
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {candidate.reason}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                assignBackupToDeficit(conflict.processId!, conflict.day!, candidate.employee.id);
                              }}
                              className="shrink-0 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] flex items-center gap-1 transition"
                            >
                              <UserCheck className="h-3 w-3" />
                              Assign
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 flex justify-between items-center">
          <span>Constraint Solver Diagnostics</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
