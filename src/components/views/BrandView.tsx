import React, { useState, useMemo } from 'react';
import { Building2, Calendar, ShieldCheck, AlertCircle, ArrowUpRight, Check, X, Sparkles } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { getDaysInMonth, getDayOfWeek, getHolidayOnDay, isProcessOperating, DAY_INITIALS } from '../../utils/calendarUtils';

const CALENDAR_LABELS: Record<string, string> = {
  '365_DAYS': '365 Days (Incl. Sun & Hol)',
  'DAILY_EXCEPT_HOLIDAYS': 'Daily (Holidays Off)',
  'SUNDAYS_AND_HOLIDAYS_OFF': 'Mon-Sat (Sun & Hol Off)',
};

export const BrandView: React.FC<{ onResolveGap: (procId: string, day: number) => void }> = ({ onResolveGap }) => {
  const {
    month,
    year,
    brands,
    processes,
    employees,
    holidays,
    roster,
  } = useRoster();

  const totalDays = getDaysInMonth(year, month);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('ALL');
  const [searchBrand, setSearchBrand] = useState('');

  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      const matchesSelect = selectedBrandId === 'ALL' || b.id === selectedBrandId;
      const matchesSearch = b.name.toLowerCase().includes(searchBrand.toLowerCase()) ||
                            b.category.toLowerCase().includes(searchBrand.toLowerCase());
      return matchesSelect && matchesSearch;
    });
  }, [brands, selectedBrandId, searchBrand]);

  return (
    <div className="space-y-4">
      
      {/* Brand Header & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Brand Coverage & Operating Requirements</h2>
            <p className="text-xs text-slate-500">
              Validating daily staffing against client SLAs (365-day, Daily, and Weekend/Holiday rules)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter brands..."
            value={searchBrand}
            onChange={e => setSearchBrand(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
          />

          <select
            value={selectedBrandId}
            onChange={e => setSelectedBrandId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All Brands ({brands.length})</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Brand Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBrands.map(brand => {
          const brandProcs = processes.filter(p => p.brandId === brand.id);
          const assignedEmpIds = [...new Set(brandProcs.flatMap(p => p.assignedEmployeeIds))];
          const assignedEmployees = assignedEmpIds.map(id => employees.find(e => e.id === id)).filter(Boolean);
          const isSingleResource = assignedEmpIds.length <= 1;

          return (
            <div
              key={brand.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Brand Top Header */}
              <div className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{brand.name}</span>
                  <span className="text-xs text-slate-400">· {brand.category}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold uppercase">
                    Pod {brand.podId.replace('pod-', '')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isSingleResource
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {isSingleResource ? 'Single Dedicated Resource' : `${assignedEmployees.length} Dedicated Staff`}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Assigned: {assignedEmployees.map(e => e?.name).join(', ')}
                  </span>
                </div>
              </div>

              {/* Processes Daily Coverage Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead className="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[11px]">
                    <tr>
                      <th className="sticky left-0 z-10 bg-slate-100/90 dark:bg-slate-800/90 text-left py-2 px-3 min-w-[200px] font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Process & Operating Rule
                      </th>
                      {Array.from({ length: totalDays }, (_, i) => {
                        const day = i + 1;
                        const dow = getDayOfWeek(year, month, day);
                        const isSunday = dow === 0;
                        const holiday = getHolidayOnDay(year, month, day, holidays);

                        return (
                          <th
                            key={day}
                            className={`text-center py-1 px-0 min-w-[28px] font-medium border-r border-slate-200/50 dark:border-slate-700/50 ${
                              holiday
                                ? 'bg-rose-50 text-rose-600 font-bold'
                                : isSunday
                                ? 'bg-slate-200/40 text-slate-500'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <div>{day}</div>
                            <div className="text-[9px] uppercase">{DAY_INITIALS[dow]}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {brandProcs.map(proc => {
                      return (
                        <tr key={proc.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/40">
                          
                          {/* Process info column */}
                          <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                            <div className="font-semibold text-slate-900 dark:text-white text-xs">{proc.name}</div>
                            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                              Min {proc.minStaff} · {CALENDAR_LABELS[proc.calendarType] || proc.calendarType}
                            </div>
                          </td>

                          {/* 30 Day Coverage slots */}
                          {Array.from({ length: totalDays }, (_, i) => {
                            const day = i + 1;
                            const isOperating = isProcessOperating(year, month, day, proc, holidays);

                            if (!isOperating) {
                              return (
                                <td key={day} className="text-center p-0 border-r border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/50">
                                  <span className="text-[10px] font-mono">–</span>
                                </td>
                              );
                            }

                            // Calculate available staff
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
                                title={
                                  hasGap
                                    ? `Coverage Deficit: Needs ${proc.minStaff}, available ${totalAvailable}. Click to assign backup!`
                                    : `Coverage Met: ${totalAvailable}/${proc.minStaff} available`
                                }
                                className={`text-center p-0 border-r border-slate-100 dark:border-slate-800 transition ${
                                  hasGap
                                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-200 font-bold cursor-pointer animate-pulse'
                                    : 'bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium'
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
          );
        })}
      </div>

    </div>
  );
};
