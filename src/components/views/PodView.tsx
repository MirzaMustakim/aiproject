import React, { useState } from 'react';
import { Shield, Users, CalendarCheck, AlertTriangle, CheckCircle2, Star } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { getDaysInMonth, getDayOfWeek, getHolidayOnDay, DAY_INITIALS, DAY_NAMES } from '../../utils/calendarUtils';

export const PodView: React.FC<{ onCellClick: (empId: string, day: number) => void }> = ({ onCellClick }) => {
  const {
    month,
    year,
    pods,
    employees,
    brands,
    processes,
    holidays,
    roster,
    conflicts,
    metadata,
    togglePodApproval,
  } = useRoster();

  const [activePodId, setActivePodId] = useState<string>(pods[0]?.id || 'pod-alpha');
  const totalDays = getDaysInMonth(year, month);

  const currentPod = pods.find(p => p.id === activePodId) || pods[0];
  const podLead = employees.find(e => e.id === currentPod.leadId);
  const podMembers = employees.filter(e => e.podId === currentPod.id);
  const podBrands = brands.filter(b => b.podId === currentPod.id);
  const isPodApproved = !!metadata.approvedByPodLeads[currentPod.id];

  const podConflicts = conflicts.filter(c => c.podId === currentPod.id);
  const criticalGaps = podConflicts.filter(c => c.severity === 'CRITICAL');

  return (
    <div className="space-y-4">
      
      {/* Pod Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        {pods.map(pod => {
          const lead = employees.find(e => e.id === pod.leadId);
          const isApproved = !!metadata.approvedByPodLeads[pod.id];
          const hasGaps = conflicts.some(c => c.podId === pod.id && c.severity === 'CRITICAL');
          const isSelected = activePodId === pod.id;

          return (
            <button
              key={pod.id}
              onClick={() => setActivePodId(pod.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{pod.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isSelected
                  ? 'bg-teal-700 text-teal-100'
                  : hasGaps
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : isApproved
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {lead?.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pod Lead & Overview Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pod Lead Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pod Lead</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              Lead Oversight
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
              {podLead ? podLead.name.split(' ').map(n => n[0]).join('') : 'PL'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{podLead?.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{podLead?.role}</p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-mono mt-0.5">{podLead?.email}</p>
            </div>
          </div>
        </div>

        {/* Pod Metrics */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Coverage & Assets</span>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="block text-lg font-bold text-slate-800 dark:text-slate-100">{podMembers.length}</span>
              <span className="text-[10px] text-slate-500">Members</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="block text-lg font-bold text-slate-800 dark:text-slate-100">{podBrands.length}</span>
              <span className="text-[10px] text-slate-500">Brands</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className={`block text-lg font-bold ${criticalGaps.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {criticalGaps.length}
              </span>
              <span className="text-[10px] text-slate-500">Gaps</span>
            </div>
          </div>
        </div>

        {/* Pod Sign-off Action */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pod Lead Approval</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Pod leads review staffing distribution and confirm coverage for assigned client accounts.
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => togglePodApproval(currentPod.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                isPodApproved
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isPodApproved ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <CalendarCheck className="h-4 w-4 text-slate-500" />}
              <span>{isPodApproved ? 'Approved by Pod Lead' : 'Click to Sign-off'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              {isPodApproved ? 'Ready for ops manager' : 'Pending review'}
            </span>
          </div>
        </div>

      </div>

      {/* Pod Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {currentPod.name} Staff Schedule Matrix
          </span>
          <span className="text-xs text-slate-500">
            Click any cell to edit schedule
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 text-left py-2 px-3 min-w-[200px] font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                  Team Member
                </th>
                <th className="text-center py-2 px-2 min-w-[65px] font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                  Pref. Off
                </th>
                {Array.from({ length: totalDays }, (_, i) => {
                  const day = i + 1;
                  const dow = getDayOfWeek(year, month, day);
                  const isSunday = dow === 0;
                  const holiday = getHolidayOnDay(year, month, day, holidays);

                  return (
                    <th
                      key={day}
                      className={`text-center py-1.5 px-0 min-w-[30px] font-medium border-r border-slate-200/60 dark:border-slate-700/60 ${
                        holiday
                          ? 'bg-rose-50 text-rose-600 font-bold'
                          : isSunday
                          ? 'bg-slate-200/50 text-slate-500'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{day}</div>
                      <div className="text-[9px] text-slate-400 uppercase">{DAY_INITIALS[dow]}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {podMembers.map(emp => {
                const myProcs = processes.filter(p => p.assignedEmployeeIds.includes(emp.id));
                const myBrands = [...new Set(myProcs.map(p => brands.find(b => b.id === p.brandId)?.name).filter(Boolean))];

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 py-1.5 px-3 border-r border-slate-200 dark:border-slate-700">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {emp.name}
                        {emp.isLead && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">Lead</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {myBrands.join(', ') || 'Floating Ops'}
                      </div>
                    </td>

                    <td className="text-center py-1.5 px-2 border-r border-slate-200 dark:border-slate-700 text-slate-500 text-[11px]">
                      {DAY_NAMES[emp.preferredOffDay]}
                    </td>

                    {Array.from({ length: totalDays }, (_, i) => {
                      const day = i + 1;
                      const cell = roster[emp.id]?.[day] || { status: 'W' };

                      let bgClass = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
                      if (cell.status === 'O') bgClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                      if (cell.status === 'L') bgClass = 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold';
                      if (cell.status === 'C') bgClass = 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 font-bold';
                      if (cell.status === 'H') bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';

                      return (
                        <td
                          key={day}
                          onClick={() => onCellClick(emp.id, day)}
                          className={`text-center p-0 cursor-pointer border-r border-slate-100 dark:border-slate-800/80 transition hover:scale-105 ${bgClass}`}
                        >
                          <div className="h-7 flex items-center justify-center font-semibold text-[11px]">
                            {cell.status}
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
