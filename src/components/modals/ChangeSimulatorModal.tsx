import React, { useState, useMemo } from 'react';
import { X, Play, ShieldAlert, CheckCircle2, UserX, AlertTriangle, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { BackupCandidate, Employee, Process, Brand } from '../../types/roster';
import { getDaysInMonth, isProcessOperating } from '../../utils/calendarUtils';

interface ChangeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeSimulatorModal: React.FC<ChangeSimulatorModalProps> = ({ isOpen, onClose }) => {
  const {
    month,
    year,
    employees,
    brands,
    processes,
    holidays,
    roster,
    requestLeave,
    getBackupsForProcessAndDay,
    assignBackupToDeficit,
  } = useRoster();

  const totalDays = getDaysInMonth(year, month);

  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || 'emp-5');
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [leaveType, setLeaveType] = useState<'L' | 'C'>('L');
  const [reason, setReason] = useState<string>('Personal emergency leave request');
  const [simulationRun, setSimulationRun] = useState(false);

  if (!isOpen) return null;

  const currentEmp = employees.find(e => e.id === selectedEmpId);
  const empProcs = processes.filter(p => p.assignedEmployeeIds.includes(selectedEmpId));

  // Run impact simulation on the fly
  const simulationResults = useMemo(() => {
    if (!simulationRun || !currentEmp) return null;

    // Check what happens if currentEmp is unavailable on selectedDay
    const impactedProcesses: {
      process: Process;
      brand: Brand;
      isOperating: boolean;
      prevWorking: number;
      newWorking: number;
      minStaff: number;
      hasDeficit: boolean;
      isSingleResource: boolean;
      suggestedBackups: BackupCandidate[];
    }[] = [];

    empProcs.forEach(proc => {
      const brand = brands.find(b => b.id === proc.brandId);
      if (!brand) return;

      const isOperating = isProcessOperating(year, month, selectedDay, proc, holidays);
      if (!isOperating) {
        impactedProcesses.push({
          process: proc,
          brand,
          isOperating: false,
          prevWorking: 0,
          newWorking: 0,
          minStaff: proc.minStaff,
          hasDeficit: false,
          isSingleResource: proc.assignedEmployeeIds.length === 1,
          suggestedBackups: [],
        });
        return;
      }

      const activePeers = proc.assignedEmployeeIds.filter(id => id !== selectedEmpId && roster[id]?.[selectedDay]?.status === 'W').length;
      const prevWorking = (roster[selectedEmpId]?.[selectedDay]?.status === 'W' ? 1 : 0) + activePeers;
      const newWorking = activePeers; // after currentEmp is removed
      const hasDeficit = newWorking < proc.minStaff;
      const isSingleResource = proc.assignedEmployeeIds.length === 1;

      const backups = hasDeficit
        ? getBackupsForProcessAndDay(proc.id, selectedDay).filter(c => c.employee.id !== selectedEmpId)
        : [];

      impactedProcesses.push({
        process: proc,
        brand,
        isOperating: true,
        prevWorking,
        newWorking,
        minStaff: proc.minStaff,
        hasDeficit,
        isSingleResource,
        suggestedBackups: backups,
      });
    });

    const totalDeficits = impactedProcesses.filter(p => p.hasDeficit).length;

    return {
      impactedProcesses,
      totalDeficits,
      isFullyCovered: totalDeficits === 0,
    };
  }, [simulationRun, currentEmp, empProcs, selectedDay, year, month, holidays, roster, selectedEmpId, brands, getBackupsForProcessAndDay]);

  // Presets from the requirements
  const handleLoadPreset = (presetType: 'SINGLE' | 'MULTI') => {
    if (presetType === 'SINGLE') {
      // Single-resource brand Kabir Mehta (emp-5) on Zenvy Wellness
      setSelectedEmpId('emp-5');
      setSelectedDay(15);
      setLeaveType('L');
      setReason('Unplanned medical leave for single-resource brand');
      setSimulationRun(true);
    } else {
      // Multi-resource brand Diya Rao (emp-2) on Opal & Ivy Jewels (3 agents total)
      setSelectedEmpId('emp-2');
      setSelectedDay(15);
      setLeaveType('L');
      setReason('Leadership conference leave (multi-agent brand)');
      setSimulationRun(true);
    }
  };

  const handleApplyToLiveRoster = () => {
    if (!currentEmp) return;
    requestLeave(currentEmp.id, selectedDay, leaveType, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Play className="h-5 w-5 fill-indigo-600 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Change Impact Simulator & Resilience Engine
              </h2>
              <p className="text-xs text-slate-500">
                Test employee unavailabilities and evaluate automated coverage resolution
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

        {/* Quick Presets Banner (Matches Prompt Requirements Directly) */}
        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-indigo-900 dark:text-indigo-300">
            Quick Demonstration Presets:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleLoadPreset('SINGLE')}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 shadow-xs hover:bg-indigo-50"
            >
              1. Single-Resource Brand Test (Zenvy)
            </button>
            <button
              onClick={() => handleLoadPreset('MULTI')}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 shadow-xs hover:bg-teal-50"
            >
              2. Multi-Resource Redundancy Test (Opal)
            </button>
          </div>
        </div>

        {/* Simulation Configuration Form */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="sim-emp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Employee:
              </label>
              <select
                id="sim-emp"
                value={selectedEmpId}
                onChange={e => {
                  setSelectedEmpId(e.target.value);
                  setSimulationRun(false);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role} · Pod {emp.podId.replace('pod-', '')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sim-day" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Simulation Date:
              </label>
              <select
                id="sim-day"
                value={selectedDay}
                onChange={e => {
                  setSelectedDay(Number(e.target.value));
                  setSimulationRun(false);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {Array.from({ length: totalDays }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    November {i + 1}, 2026
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="sim-type" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Type of Change:
              </label>
              <select
                id="sim-type"
                value={leaveType}
                onChange={e => setLeaveType(e.target.value as 'L' | 'C')}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="L">Planned / Emergency Leave (L)</option>
                <option value="C">Compensatory Off Day (C)</option>
              </select>
            </div>

            <div>
              <label htmlFor="sim-reason" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Notes:
              </label>
              <input
                id="sim-reason"
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={() => setSimulationRun(true)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            Evaluate Change Impact
          </button>

          {/* Simulation Output Card */}
          {simulationResults && (
            <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Simulation Outcome
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  simulationResults.isFullyCovered
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {simulationResults.isFullyCovered ? 'Coverage Resilient (No Gaps)' : `${simulationResults.totalDeficits} Deficit Gaps Created!`}
                </span>
              </div>

              {/* Impact Breakdown */}
              <div className="space-y-2">
                {simulationResults.impactedProcesses.map(item => (
                  <div
                    key={item.process.id}
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.brand.name}
                        </span>
                        <span className="text-slate-400 ml-1">· {item.process.name}</span>
                      </div>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        item.hasDeficit
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {item.hasDeficit ? `Deficit: ${item.newWorking}/${item.minStaff}` : `Covered: ${item.newWorking}/${item.minStaff}`}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      {item.isSingleResource
                        ? 'Single-resource brand: Employee is the sole assigned agent. Marking leave completely halts this process without a backup.'
                        : `Multi-resource brand: ${item.newWorking} assigned team member(s) remain on shift. Capacity threshold satisfied.`}
                    </p>

                    {/* If deficit, show recommended backup */}
                    {item.hasDeficit && item.suggestedBackups.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 block mb-1">
                          Recommended Solution:
                        </span>
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {item.suggestedBackups[0].employee.name}
                            </span>
                            <span className="text-[10px] text-teal-600 ml-1.5 font-bold">
                              ({item.suggestedBackups[0].score}% Match)
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {item.suggestedBackups[0].reason}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              assignBackupToDeficit(item.process.id, selectedDay, item.suggestedBackups[0].employee.id);
                              if (currentEmp) {
                                requestLeave(currentEmp.id, selectedDay, leaveType, reason);
                              }
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] flex items-center gap-1"
                          >
                            <UserCheck className="h-3 w-3" />
                            Apply Leave + Assign Backup
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={handleApplyToLiveRoster}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-lg transition"
                >
                  Apply Leave to Roster
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
