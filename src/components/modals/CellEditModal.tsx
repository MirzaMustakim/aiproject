import React, { useState } from 'react';
import { X, Calendar, User, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { ShiftStatus } from '../../types/roster';
import { DAY_NAMES, getDayOfWeek, getHolidayOnDay, isProcessOperating } from '../../utils/calendarUtils';

interface CellEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
  day: number | null;
}

export const CellEditModal: React.FC<CellEditModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  day,
}) => {
  const {
    month,
    year,
    employees,
    brands,
    processes,
    holidays,
    roster,
    updateCellStatus,
    getBackupsForProcessAndDay,
    assignBackupToDeficit,
  } = useRoster();

  if (!isOpen || !employeeId || !day) return null;

  const currentEmp = employees.find(e => e.id === employeeId);
  const cell = roster[employeeId]?.[day] || { status: 'W' };

  const [status, setStatus] = useState<ShiftStatus>(cell.status);
  const [note, setNote] = useState<string>(cell.note || '');

  const dow = getDayOfWeek(year, month, day);
  const holiday = getHolidayOnDay(year, month, day, holidays);

  // Check if marking this employee non-working creates a gap
  const myProcs = processes.filter(p => p.assignedEmployeeIds.includes(employeeId));
  const willCauseGap = status !== 'W' && myProcs.some(p => {
    if (!isProcessOperating(year, month, day, p, holidays)) return false;
    const workingPeers = p.assignedEmployeeIds.filter(id => id !== employeeId && roster[id]?.[day]?.status === 'W').length;
    return workingPeers < p.minStaff;
  });

  const handleSave = () => {
    updateCellStatus(employeeId, day, status, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Edit Shift Assignment
            </h3>
            <p className="text-xs text-slate-500">
              {currentEmp?.name} · {DAY_NAMES[dow]}, Nov {day}, {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Shift Status:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'W', label: 'Working (W)', desc: 'Standard operating shift', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                { val: 'O', label: 'Weekly Off (O)', desc: 'Mandatory rest day', color: 'border-slate-400 bg-slate-50 text-slate-800' },
                { val: 'L', label: 'Approved Leave (L)', desc: 'Planned / annual leave', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                { val: 'C', label: 'Comp-Off (C)', desc: 'Compensatory off', color: 'border-indigo-500 bg-indigo-50 text-indigo-800' },
              ].map(opt => {
                const isSelected = status === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setStatus(opt.val as ShiftStatus)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? `${opt.color} ring-2 ring-teal-500 font-bold`
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="shift-note" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Shift Note / Reason:
            </label>
            <input
              id="shift-note"
              type="text"
              placeholder="e.g. Swapped with Kabir, Client requested overtime"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Live Conflict Warning */}
          {willCauseGap && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold">Coverage Deficit Alert:</span> Changing {currentEmp?.name} to {status} will leave their assigned brand process short on coverage! You can assign an automated backup in the Conflicts tab after saving.
              </div>
            </div>
          )}

          {holiday && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              Note: This date is {holiday.name}. Non-365 processes are closed by default.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition"
          >
            Save Shift
          </button>
        </div>

      </div>
    </div>
  );
};
