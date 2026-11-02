import React from 'react';
import { Users, Building2, ShieldCheck, AlertCircle, CalendarClock, CheckCheck } from 'lucide-react';
import { useRoster } from '../context/RosterContext';
import { getDaysInMonth, isProcessOperating } from '../utils/calendarUtils';

export const StatsOverview: React.FC<{ onOpenConflicts: () => void; onOpenApprovals: () => void }> = ({
  onOpenConflicts,
  onOpenApprovals,
}) => {
  const {
    employees,
    brands,
    processes,
    holidays,
    roster,
    conflicts,
    plannedLeaves,
    metadata,
    month,
    year,
    pods,
  } = useRoster();

  const totalDays = getDaysInMonth(year, month);

  // Calculate total operating demand days
  let totalRequiredShiftSlots = 0;
  let fulfilledShiftSlots = 0;

  processes.forEach(proc => {
    for (let day = 1; day <= totalDays; day++) {
      if (isProcessOperating(year, month, day, proc, holidays)) {
        totalRequiredShiftSlots += proc.minStaff;

        const workingStaff = proc.assignedEmployeeIds.filter(
          id => roster[id] && roster[id][day]?.status === 'W'
        ).length;

        const backupStaff = employees.filter(
          e => roster[e.id] && roster[e.id][day]?.status === 'W' && proc.assignedEmployeeIds.includes(roster[e.id][day]?.backupForEmployeeId || '')
        ).length;

        fulfilledShiftSlots += Math.min(proc.minStaff, workingStaff + backupStaff);
      }
    }
  });

  const coverageHealth = totalRequiredShiftSlots > 0
    ? Math.round((fulfilledShiftSlots / totalRequiredShiftSlots) * 100)
    : 100;

  const criticalGaps = conflicts.filter(c => c.severity === 'CRITICAL');
  const singleResourceBrandsCount = brands.filter(b => {
    const brandProcs = processes.filter(p => p.brandId === b.id);
    const assignedEmpIds = new Set(brandProcs.flatMap(p => p.assignedEmployeeIds));
    return assignedEmpIds.size <= 1;
  }).length;

  const approvedPodsCount = Object.values(metadata.approvedByPodLeads).filter(Boolean).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      
      {/* 1. Staff Headcount */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Team</span>
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {employees.length}
          </span>
          <span className="text-xs text-slate-500 font-medium">in {pods.length} pods</span>
        </div>
        <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
          4 Pod Leads active
        </p>
      </div>

      {/* 2. Brands & Portfolio */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">D2C Accounts</span>
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {brands.length}
          </span>
          <span className="text-xs text-slate-500 font-medium">brands</span>
        </div>
        <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
          {singleResourceBrandsCount} single-agent (80%)
        </p>
      </div>

      {/* 3. Coverage Health */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Coverage Health</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {coverageHealth}%
          </span>
          <span className="text-xs text-slate-500 font-medium">slots met</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {fulfilledShiftSlots} / {totalRequiredShiftSlots} slots
        </p>
      </div>

      {/* 4. Critical Conflicts */}
      <div
        onClick={onOpenConflicts}
        className={`bg-white dark:bg-slate-900 p-3.5 rounded-xl border cursor-pointer transition shadow-sm hover:border-slate-300 dark:hover:border-slate-700 ${
          criticalGaps.length > 0
            ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Gaps</span>
          <div className={`p-1.5 rounded-lg ${
            criticalGaps.length > 0
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${
            criticalGaps.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
          }`}>
            {criticalGaps.length}
          </span>
          <span className="text-xs text-slate-500 font-medium">deficits</span>
        </div>
        <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
          {criticalGaps.length > 0 ? 'Click to resolve with backup' : 'Zero gaps detected'}
        </p>
      </div>

      {/* 5. Approved Leaves */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Leaves & Offs</span>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <CalendarClock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {plannedLeaves.length}
          </span>
          <span className="text-xs text-slate-500 font-medium">approved</span>
        </div>
        <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          {holidays.length} official holidays
        </p>
      </div>

      {/* 6. Pod Approvals */}
      <div
        onClick={onOpenApprovals}
        className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lead Sign-offs</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <CheckCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            {approvedPodsCount} / {pods.length}
          </span>
          <span className="text-xs text-slate-500 font-medium">pods</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Status: {metadata.status}
        </p>
      </div>

    </div>
  );
};
