import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileJson, Upload, Check } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { getDaysInMonth, getDayOfWeek, formatDateStr } from '../../utils/calendarUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const {
    month,
    year,
    employees,
    pods,
    brands,
    processes,
    holidays,
    plannedLeaves,
    roster,
    metadata,
  } = useRoster();

  const [copied, setCopied] = useState(false);
  const totalDays = getDaysInMonth(year, month);

  if (!isOpen) return null;

  // Generate CSV Content
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Pod', 'Role', 'Pref Off'];
    for (let d = 1; d <= totalDays; d++) {
      headers.push(`Day ${d}`);
    }
    headers.push('Total Working', 'Total Off', 'Total Leave', 'Total CompOff');

    const rows: string[] = [headers.join(',')];

    employees.forEach(emp => {
      const pod = pods.find(p => p.id === emp.podId);
      let workCount = 0;
      let offCount = 0;
      let leaveCount = 0;
      let compCount = 0;

      const row: string[] = [
        `"${emp.id}"`,
        `"${emp.name}"`,
        `"${pod?.name || emp.podId}"`,
        `"${emp.role}"`,
        `"${emp.preferredOffDay}"`,
      ];

      for (let d = 1; d <= totalDays; d++) {
        const cell = roster[emp.id]?.[d];
        const status = cell?.status || 'W';
        row.push(`"${status}"`);

        if (status === 'W') workCount++;
        else if (status === 'O') offCount++;
        else if (status === 'L') leaveCount++;
        else if (status === 'C') compCount++;
      }

      row.push(String(workCount), String(offCount), String(leaveCount), String(compCount));
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RosterDesk_${year}_${month}_Schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate JSON Content
  const handleExportJSON = () => {
    const exportBundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      month,
      year,
      pods,
      employees,
      brands,
      processes,
      holidays,
      plannedLeaves,
      metadata,
      roster,
    };

    const jsonString = JSON.stringify(exportBundle, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RosterDesk_${year}_${month}_Database.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Export Roster & Reports
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-3">
          
          {/* CSV Export Option */}
          <div
            onClick={handleExportCSV}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 cursor-pointer transition flex items-center gap-3"
          >
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Export to CSV (Excel / Google Sheets)
              </h4>
              <p className="text-[11px] text-slate-500">
                Complete monthly matrix with all 32 employee schedules, pod tags, and shift totals.
              </p>
            </div>
          </div>

          {/* JSON Database Export */}
          <div
            onClick={handleExportJSON}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 cursor-pointer transition flex items-center gap-3"
          >
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <FileJson className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Full Database JSON Backup
              </h4>
              <p className="text-[11px] text-slate-500">
                Comprehensive backup of brands, pods, operating rules, employees, and roster matrix.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
