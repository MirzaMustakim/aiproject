import React, { useState, useMemo } from 'react';
import { User, Calendar, Award, CheckCircle2, AlertCircle, Clock, HeartHandshake } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { getDaysInMonth, getDayOfWeek, getHolidayOnDay, DAY_NAMES, DAY_INITIALS } from '../../utils/calendarUtils';

export const EmployeeView: React.FC<{ onCellClick: (empId: string, day: number) => void }> = ({ onCellClick }) => {
  const {
    month,
    year,
    employees,
    pods,
    brands,
    processes,
    holidays,
    roster,
  } = useRoster();

  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || 'emp-1');
  const totalDays = getDaysInMonth(year, month);

  const currentEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const empPod = pods.find(p => p.id === currentEmp?.podId);
  const podLead = employees.find(e => e.id === empPod?.leadId);

  // Assigned processes & brands
  const myProcs = useMemo(() => {
    if (!currentEmp) return [];
    return processes.filter(p => p.assignedEmployeeIds.includes(currentEmp.id));
  }, [processes, currentEmp]);

  const myBrands = useMemo(() => {
    return [...new Set(myProcs.map(p => brands.find(b => b.id === p.brandId)?.name).filter(Boolean))];
  }, [myProcs, brands]);

  // Calculate monthly stats for this employee
  const stats = useMemo(() => {
    if (!currentEmp) return { workDays: 0, offs: 0, leaves: 0, compOffs: 0, holidays: 0, preferredGranted: 0, preferredTotal: 0 };
    let workDays = 0;
    let offs = 0;
    let leaves = 0;
    let compOffs = 0;
    let holDays = 0;
    let preferredGranted = 0;
    let preferredTotal = 0;

    for (let day = 1; day <= totalDays; day++) {
      const cell = roster[currentEmp.id]?.[day];
      const dow = getDayOfWeek(year, month, day);

      if (dow === currentEmp.preferredOffDay) {
        preferredTotal++;
        if (cell && ['O', 'L', 'C', 'H'].includes(cell.status)) {
          preferredGranted++;
        }
      }

      if (cell) {
        if (cell.status === 'W') workDays++;
        else if (cell.status === 'O') offs++;
        else if (cell.status === 'L') leaves++;
        else if (cell.status === 'C') compOffs++;
        else if (cell.status === 'H') holDays++;
      }
    }

    return {
      workDays,
      offs,
      leaves,
      compOffs,
      holidays: holDays,
      preferredGranted,
      preferredTotal,
    };
  }, [currentEmp, roster, totalDays, year, month]);

  return (
    <div className="space-y-4">
      
      {/* Top Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Individual Employee Schedule & Welfare</h2>
            <p className="text-xs text-slate-500">
              Personal shift calendar, weekly-off preference tracking, and cross-skills
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="emp-select" className="text-xs text-slate-500 font-medium">Select Employee:</label>
          <select
            id="emp-select"
            value={selectedEmpId}
            onChange={e => setSelectedEmpId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role} · Pod {emp.podId.replace('pod-', '')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Profile & KPI Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Profile Details */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              {currentEmp?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {currentEmp?.name}
                {currentEmp?.isLead && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    Pod Lead
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">{currentEmp?.role}</p>
              <p className="text-[11px] text-teal-600 font-mono mt-0.5">{currentEmp?.email}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Pod:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {empPod?.name} (Lead: {podLead?.name})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Preferred Off Day:</span>
              <span className="font-semibold text-teal-700 dark:text-teal-400">
                {DAY_NAMES[currentEmp?.preferredOffDay || 0]}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Accounts:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                {myBrands.join(', ') || 'Floating Specialist'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cross-Trained Skills:</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {currentEmp?.crossTrainedProcesses.map(skill => (
                  <span key={skill} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Breakdown Metrics */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Shift Summary</span>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-2 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800">
              <span className="block text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.workDays}</span>
              <span className="text-[11px] text-emerald-800/80 dark:text-emerald-400 font-medium">Work Days</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="block text-2xl font-bold text-slate-700 dark:text-slate-200">{stats.offs}</span>
              <span className="text-[11px] text-slate-500 font-medium">Weekly Offs</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="block text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.leaves}</span>
              <span className="text-[11px] text-amber-800/80 dark:text-amber-400 font-medium">Leaves</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <span className="block text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.compOffs}</span>
              <span className="text-[11px] text-indigo-800/80 dark:text-indigo-400 font-medium">Comp-Offs</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="block text-2xl font-bold text-rose-700 dark:text-rose-300">{stats.holidays}</span>
              <span className="text-[11px] text-rose-800/80 dark:text-rose-400 font-medium">Holidays</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-teal-600" />
              Off-Day Preference Match:
            </span>
            <span className="font-bold text-teal-700 dark:text-teal-400">
              {stats.preferredGranted} / {stats.preferredTotal} ({Math.round((stats.preferredGranted / (stats.preferredTotal || 1)) * 100)}%) preferred {DAY_NAMES[currentEmp?.preferredOffDay || 0]}s honored
            </span>
          </div>
        </div>

      </div>

      {/* Calendar Month Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          November 2026 Monthly Calendar for {currentEmp?.name}
        </h4>

        <div className="grid grid-cols-7 gap-2">
          {DAY_NAMES.map(dName => (
            <div key={dName} className="text-center py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
              {dName}
            </div>
          ))}

          {/* Blank padding for the first day of November 2026 (Nov 1, 2026 is a Sunday, so 0 padding) */}
          {Array.from({ length: getDayOfWeek(year, month, 1) }, (_, i) => (
            <div key={`blank-${i}`} className="min-h-[70px] rounded-lg bg-slate-50/50 dark:bg-slate-900/40" />
          ))}

          {Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1;
            const dow = getDayOfWeek(year, month, day);
            const holiday = getHolidayOnDay(year, month, day, holidays);
            const cell = roster[currentEmp?.id || '']?.[day] || { status: 'W' };
            const isPreferred = dow === currentEmp?.preferredOffDay;
            const isBackingUp = !!cell.backupForEmployeeId;

            let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
            if (cell.status === 'O') badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300';
            if (cell.status === 'L') badgeColor = 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
            if (cell.status === 'C') badgeColor = 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300';
            if (cell.status === 'H') badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';

            return (
              <div
                key={day}
                onClick={() => onCellClick(currentEmp?.id || '', day)}
                className={`min-h-[72px] p-2 rounded-xl border cursor-pointer transition hover:shadow-md hover:border-teal-500 relative flex flex-col justify-between ${
                  isPreferred ? 'border-dashed border-teal-300 dark:border-teal-800' : 'border-slate-200 dark:border-slate-800'
                } bg-white dark:bg-slate-900`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{day}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeColor}`}>
                    {cell.status}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 truncate mt-1">
                  {holiday ? (
                    <span className="text-rose-600 font-semibold">{holiday.name}</span>
                  ) : isBackingUp ? (
                    <span className="text-teal-600 font-semibold">Cross-Coverage ★</span>
                  ) : (
                    <span>{cell.note || (cell.status === 'W' ? 'Regular Shift' : 'Rest Day')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
