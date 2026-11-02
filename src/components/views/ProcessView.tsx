import React, { useState, useMemo } from 'react';
import { Layers, Activity, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { getDaysInMonth, getDayOfWeek, getHolidayOnDay, isProcessOperating, DAY_INITIALS } from '../../utils/calendarUtils';

const PROCESS_TYPES = ['ALL', 'CS', 'ACC', 'NDR', 'Retention'];

export const ProcessView: React.FC<{ onResolveGap: (procId: string, day: number) => void }> = ({ onResolveGap }) => {
  const {
    month,
    year,
    processes,
    brands,
    employees,
    holidays,
    roster,
  } = useRoster();

  const totalDays = getDaysInMonth(year, month);
  const [selectedType, setSelectedType] = useState('ALL');

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      if (selectedType === 'ALL') return true;
      return p.name.includes(selectedType);
    });
  }, [processes, selectedType]);

  // Aggregate daily metrics for selected processes
  const dailyMetrics = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      let required = 0;
      let available = 0;

      filteredProcesses.forEach(proc => {
        if (isProcessOperating(year, month, day, proc, holidays)) {
          required += proc.minStaff;

          const primaryCount = proc.assignedEmployeeIds.filter(
            id => roster[id] && roster[id][day]?.status === 'W'
          ).length;

          const backupCount = employees.filter(
            e => roster[e.id] && roster[e.id][day]?.status === 'W' && proc.assignedEmployeeIds.includes(roster[e.id][day]?.backupForEmployeeId || '')
          ).length;

          available += primaryCount + backupCount;
        }
      });

      return {
        day,
        required,
        available,
        deficit: Math.max(0, required - available),
      };
    });
  }, [filteredProcesses, totalDays, year, month, holidays, roster, employees]);

  return (
    <div className="space-y-4">
      
      {/* Process Type Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Process Staffing & Aggregate Demand</h2>
            <p className="text-xs text-slate-500">
              Cross-brand operational views for Customer Support, Abandoned Cart, NDR, and Retention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          {PROCESS_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-md transition ${
                selectedType === type
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {type === 'ALL' ? 'All Processes' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Daily Health Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Aggregate Daily Headcount vs Demand ({selectedType === 'ALL' ? 'All Workstreams' : selectedType})
          </span>
          <span className="text-xs text-slate-400">
            Green = SLA Met · Red = Total Capacity Deficit
          </span>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1">
          {dailyMetrics.map(m => {
            const hasDeficit = m.deficit > 0;
            const dow = getDayOfWeek(year, month, m.day);

            return (
              <div
                key={m.day}
                className={`p-1.5 rounded-lg border text-center transition ${
                  hasDeficit
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                }`}
                title={`Day ${m.day}: Available ${m.available} / Required ${m.required}`}
              >
                <div className="text-[10px] font-bold">{m.day}</div>
                <div className="text-[9px] uppercase font-mono">{DAY_INITIALS[dow]}</div>
                <div className="text-[10px] font-extrabold mt-1">
                  {m.available}/{m.required}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Process Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Active Accounts for {selectedType} ({filteredProcesses.length} processes)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 text-left py-2 px-3 min-w-[220px] font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                  Brand & Process
                </th>
                <th className="text-center py-2 px-2 min-w-[70px] font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                  Min Req.
                </th>
                {Array.from({ length: totalDays }, (_, i) => (
                  <th key={i + 1} className="text-center py-1.5 px-0 min-w-[28px] font-medium border-r border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400">
                    <div className="text-[11px] font-bold">{i + 1}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredProcesses.map(proc => {
                const brand = brands.find(b => b.id === proc.brandId);
                const assignedStaff = proc.assignedEmployeeIds.map(id => employees.find(e => e.id === id)).filter(Boolean);

                return (
                  <tr key={proc.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">{brand?.name}</div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                        {proc.name} · {assignedStaff.map(e => e?.name).join(', ')}
                      </div>
                    </td>

                    <td className="text-center py-2 px-2 border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                      {proc.minStaff}
                    </td>

                    {Array.from({ length: totalDays }, (_, i) => {
                      const day = i + 1;
                      const isOperating = isProcessOperating(year, month, day, proc, holidays);

                      if (!isOperating) {
                        return (
                          <td key={day} className="text-center p-0 border-r border-slate-100 dark:border-slate-800 text-slate-300 bg-slate-50/40">
                            –
                          </td>
                        );
                      }

                      const workingPrimary = proc.assignedEmployeeIds.filter(id => roster[id] && roster[id][day]?.status === 'W').length;
                      const backupCount = employees.filter(e => roster[e.id] && roster[e.id][day]?.status === 'W' && proc.assignedEmployeeIds.includes(roster[e.id][day]?.backupForEmployeeId || '')).length;
                      const totalAvailable = workingPrimary + backupCount;
                      const hasGap = totalAvailable < proc.minStaff;

                      return (
                        <td
                          key={day}
                          onClick={() => {
                            if (hasGap) onResolveGap(proc.id, day);
                          }}
                          className={`text-center p-0 border-r border-slate-100 dark:border-slate-800 ${
                            hasGap
                              ? 'bg-rose-100 text-rose-800 font-bold cursor-pointer hover:bg-rose-200'
                              : 'bg-emerald-50/60 text-emerald-800 font-medium'
                          }`}
                        >
                          <div className="h-7 flex items-center justify-center text-[10px]">
                            {totalAvailable}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
