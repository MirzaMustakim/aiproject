import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldAlert, Star, User, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { getDaysInMonth, getDayOfWeek, getHolidayOnDay, DAY_INITIALS } from '../../utils/calendarUtils';
import { DailyScheduleCell, ShiftStatus } from '../../types/roster';

interface CompanyViewProps {
  onCellClick: (empId: string, day: number) => void;
}

export const CompanyView: React.FC<CompanyViewProps> = ({ onCellClick }) => {
  const {
    month,
    year,
    pods,
    employees,
    brands,
    processes,
    holidays,
    roster,
    updateCellStatus,
    conflicts,
  } = useRoster();

  const totalDays = getDaysInMonth(year, month);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPodFilter, setSelectedPodFilter] = useState('ALL');
  const [collapsedPods, setCollapsedPods] = useState<Record<string, boolean>>({});

  const togglePodCollapse = (podId: string) => {
    setCollapsedPods(prev => ({ ...prev, [podId]: !prev[podId] }));
  };

  // Pre-calculate brands for each employee
  const empBrandsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    employees.forEach(emp => {
      const myProcs = processes.filter(p => p.assignedEmployeeIds.includes(emp.id));
      const myBrandIds = [...new Set(myProcs.map(p => p.brandId))];
      map[emp.id] = myBrandIds.map(bid => brands.find(b => b.id === bid)?.name || bid);
    });
    return map;
  }, [employees, processes, brands]);

  // Conflict days map: empId -> day -> boolean
  const employeeConflictDays = useMemo(() => {
    const map: Record<string, Record<number, boolean>> = {};
    conflicts.forEach(c => {
      if (c.employeeId && c.day) {
        if (!map[c.employeeId]) map[c.employeeId] = {};
        map[c.employeeId][c.day] = true;
      }
    });
    return map;
  }, [conflicts]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesPod = selectedPodFilter === 'ALL' || emp.podId === selectedPodFilter;
      const assignedBrands = (empBrandsMap[emp.id] || []).join(' ').toLowerCase();
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignedBrands.includes(searchTerm.toLowerCase()) ||
        emp.crossTrainedProcesses.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesPod && matchesSearch;
    });
  }, [employees, selectedPodFilter, searchTerm, empBrandsMap]);

  // Group by pod
  const employeesByPod = useMemo(() => {
    const grouped: Record<string, typeof employees> = {};
    pods.forEach(p => {
      grouped[p.id] = [];
    });
    filteredEmployees.forEach(emp => {
      if (!grouped[emp.podId]) grouped[emp.podId] = [];
      grouped[emp.podId].push(emp);
    });
    return grouped;
  }, [pods, filteredEmployees]);

  // Cycle status on double click or right click (W -> O -> L -> C)
  const handleQuickCycle = (e: React.MouseEvent, empId: string, day: number) => {
    e.stopPropagation();
    const current = roster[empId]?.[day]?.status || 'W';
    const cycleMap: Record<ShiftStatus, ShiftStatus> = {
      W: 'O',
      O: 'L',
      L: 'C',
      C: 'W',
      H: 'W',
    };
    updateCellStatus(empId, day, cycleMap[current]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee, brand, or skill..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
            />
          </div>

          {/* Pod Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setSelectedPodFilter('ALL')}
              className={`px-2.5 py-1 font-semibold rounded-md transition ${
                selectedPodFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Pods ({employees.length})
            </button>
            {pods.map(pod => (
              <button
                key={pod.id}
                onClick={() => setSelectedPodFilter(pod.id)}
                className={`px-2.5 py-1 font-semibold rounded-md transition ${
                  selectedPodFilter === pod.id
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {pod.name}
              </button>
            ))}
          </div>

        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-[9px]">W</span>
            Working
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-[9px]">O</span>
            Weekly Off
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-[9px]">L</span>
            Leave
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-indigo-100 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold text-[9px]">C</span>
            Comp-off
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center justify-center font-bold text-[9px]">H</span>
            Holiday
          </span>
          <span className="text-slate-400 dark:text-slate-600">· (Click cell to edit)</span>
        </div>

      </div>

      {/* Main Heatmap Grid */}
      <div className="overflow-x-auto flex-1 max-h-[720px] relative">
        <table className="w-full border-collapse text-xs select-none">
          
          {/* Header Row */}
          <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <tr>
              <th className="sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 text-left py-2.5 px-3 min-w-[220px] max-w-[260px] font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                Employee & Brands
              </th>
              {Array.from({ length: totalDays }, (_, i) => {
                const day = i + 1;
                const dow = getDayOfWeek(year, month, day);
                const holiday = getHolidayOnDay(year, month, day, holidays);
                const isSunday = dow === 0;

                return (
                  <th
                    key={day}
                    title={holiday ? `${holiday.name} (${holiday.date})` : undefined}
                    className={`text-center py-1.5 px-0 min-w-[32px] max-w-[34px] font-medium border-r border-slate-200/80 dark:border-slate-700/60 ${
                      holiday
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold'
                        : isSunday
                        ? 'bg-slate-200/50 dark:bg-slate-800/80 text-slate-500'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-none">{day}</div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase mt-0.5">
                      {DAY_INITIALS[dow]}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody>
            {pods.map(pod => {
              const podEmployees = employeesByPod[pod.id] || [];
              if (podEmployees.length === 0) return null;
              const isCollapsed = collapsedPods[pod.id];

              return (
                <React.Fragment key={pod.id}>
                  
                  {/* Pod Divider Header */}
                  <tr className="bg-slate-50 dark:bg-slate-800/40 border-y border-slate-200/80 dark:border-slate-700/80">
                    <td
                      colSpan={totalDays + 1}
                      className="py-1.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => togglePodCollapse(pod.id)}
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        <span className="uppercase tracking-wider text-[11px] font-extrabold text-teal-700 dark:text-teal-400">
                          {pod.name}
                        </span>
                        <span className="text-[11px] font-normal text-slate-400">
                          ({podEmployees.length} members · Lead: {employees.find(e => e.id === pod.leadId)?.name || 'Unassigned'})
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Employees in this Pod */}
                  {!isCollapsed && podEmployees.map(emp => {
                    const brandsList = empBrandsMap[emp.id] || [];
                    const isPodLead = emp.isLead;

                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 transition-colors"
                      >
                        {/* Sticky Name Column */}
                        <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 py-1.5 px-3 border-r border-slate-200 dark:border-slate-700 shadow-xs">
                          <div className="flex items-center justify-between gap-1">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100 truncate text-xs">
                                {emp.name}
                                {isPodLead && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-bold" title="Pod Lead">
                                    <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                    Lead
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate" title={brandsList.join(', ')}>
                                {brandsList.length > 0 ? brandsList.join(', ') : 'Cross-pod Floating'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 30 Day Cells */}
                        {Array.from({ length: totalDays }, (_, i) => {
                          const day = i + 1;
                          const cell: DailyScheduleCell = roster[emp.id]?.[day] || { status: 'W' };
                          const hasConflict = employeeConflictDays[emp.id]?.[day];
                          const isCoveringBackup = !!cell.backupForEmployeeId;

                          let bgClass = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
                          if (cell.status === 'O') bgClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-400 font-medium';
                          if (cell.status === 'L') bgClass = 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold';
                          if (cell.status === 'C') bgClass = 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold';
                          if (cell.status === 'H') bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';

                          return (
                            <td
                              key={day}
                              onClick={() => onCellClick(emp.id, day)}
                              onContextMenu={e => handleQuickCycle(e, emp.id, day)}
                              title={`${emp.name} - Day ${day}: ${cell.status} ${cell.note ? `(${cell.note})` : ''} - Click to edit`}
                              className={`text-center p-0 cursor-pointer border-r border-slate-100 dark:border-slate-800/70 transition-all hover:scale-105 hover:z-10 relative ${bgClass}`}
                            >
                              <div className="h-7 flex items-center justify-center font-semibold text-[11px] relative">
                                {cell.status}
                                {isCoveringBackup && (
                                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-teal-500" title="Cross-coverage backup" />
                                )}
                                {hasConflict && (
                                  <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" title="Scheduling issue on this day" />
                                )}
                              </div>
                            </td>
                          );
                        })}

                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* Summary Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
          <span>Tip: Click any cell to customize shift, or right-click to quick-cycle status.</span>
        </div>
        <div className="font-semibold text-slate-700 dark:text-slate-300">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

    </div>
  );
};
