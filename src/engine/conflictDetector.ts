import { Employee, Process, Brand, Holiday, MonthlyRoster, SchedulingConflict } from '../types/roster';
import { getDaysInMonth, getDayOfWeek, formatDateStr, isProcessOperating, DAY_NAMES } from '../utils/calendarUtils';

export interface ConflictDetectorInput {
  month: number;
  year: number;
  employees: Employee[];
  brands: Brand[];
  processes: Process[];
  holidays: Holiday[];
  roster: MonthlyRoster;
}

export function detectAllConflicts(input: ConflictDetectorInput): SchedulingConflict[] {
  const { month, year, employees, brands, processes, holidays, roster } = input;
  const conflicts: SchedulingConflict[] = [];
  const totalDays = getDaysInMonth(year, month);

  const empMap = new Map(employees.map(e => [e.id, e]));
  const brandMap = new Map(brands.map(b => [b.id, b]));

  // 1. Process Coverage Deficit Checks
  processes.forEach(proc => {
    const brand = brandMap.get(proc.brandId);
    const assignedEmps = proc.assignedEmployeeIds.map(id => empMap.get(id)).filter(Boolean) as Employee[];

    for (let day = 1; day <= totalDays; day++) {
      const isOperating = isProcessOperating(year, month, day, proc, holidays);
      if (!isOperating) continue;

      // Count actively working assigned employees
      const workingPrimary = assignedEmps.filter(e => {
        const cell = roster[e.id]?.[day];
        return cell && cell.status === 'W';
      });

      // Also count any cross-coverage backups assigned to this process/brand today
      const activeBackups = employees.filter(e => {
        const cell = roster[e.id]?.[day];
        return cell && cell.status === 'W' && proc.assignedEmployeeIds.includes(cell.backupForEmployeeId || '');
      });

      const totalAvailable = workingPrimary.length + activeBackups.length;
      const dateStr = formatDateStr(year, month, day);

      if (totalAvailable < proc.minStaff) {
        const isSingleResource = proc.assignedEmployeeIds.length === 1;
        const absentLead = assignedEmps[0];
        const absentReason = absentLead ? roster[absentLead.id]?.[day]?.status : 'N/A';

        conflicts.push({
          id: `cov-gap-${proc.id}-${day}`,
          severity: 'CRITICAL',
          type: isSingleResource ? 'SINGLE_RESOURCE_OFF' : 'COVERAGE_GAP',
          day,
          dateStr,
          brandId: brand?.id,
          brandName: brand?.name,
          processId: proc.id,
          processName: proc.name,
          employeeId: absentLead?.id,
          employeeName: absentLead?.name,
          podId: brand?.podId,
          requiredCount: proc.minStaff,
          availableCount: totalAvailable,
          description: isSingleResource
            ? `Dedicated single-resource ${absentLead?.name || 'staff'} is ${absentReason === 'L' ? 'on Leave' : absentReason === 'O' ? 'on Weekly Off' : absentReason === 'C' ? 'on Comp-off' : 'unavailable'} on ${DAY_NAMES[getDayOfWeek(year, month, day)]}, Nov ${day}. Brand "${brand?.name}" has zero coverage for ${proc.name}.`
            : `Process "${proc.name}" on brand "${brand?.name}" requires ${proc.minStaff} staff, but only ${totalAvailable} available on Nov ${day}.`,
          suggestedAction: `Assign a cross-trained backup from Pod ${brand?.podId?.replace('pod-', '').toUpperCase()} or adjust schedule.`,
        });
      }
    }
  });

  // 2. Employee Well-Being & Consecutive Working Days Checks
  employees.forEach(emp => {
    let consecutiveWorkDays = 0;
    const maxAllowed = emp.maxConsecutiveDays || 6;

    for (let day = 1; day <= totalDays; day++) {
      const cell = roster[emp.id]?.[day];
      const isWorking = cell && cell.status === 'W';

      if (isWorking) {
        consecutiveWorkDays++;
        if (consecutiveWorkDays > maxAllowed) {
          const dateStr = formatDateStr(year, month, day);
          conflicts.push({
            id: `fatigue-${emp.id}-${day}`,
            severity: 'WARNING',
            type: 'MAX_CONSECUTIVE_DAYS',
            day,
            dateStr,
            employeeId: emp.id,
            employeeName: emp.name,
            podId: emp.podId,
            description: `${emp.name} is scheduled to work ${consecutiveWorkDays} consecutive days (violates ${maxAllowed}-day rest cycle) up to Nov ${day}.`,
            suggestedAction: `Schedule a rest day (Weekly Off) around Nov ${day} to prevent burnout and ensure compliance.`,
          });
        }
      } else {
        consecutiveWorkDays = 0;
      }
    }
  });

  // 3. Employee Preference Alignment Checks (Informational)
  employees.forEach(emp => {
    let preferredOffGranted = 0;
    let preferredOffOpportunities = 0;

    for (let day = 1; day <= totalDays; day++) {
      const dow = getDayOfWeek(year, month, day);
      if (dow === emp.preferredOffDay) {
        preferredOffOpportunities++;
        const cell = roster[emp.id]?.[day];
        if (cell && ['O', 'L', 'C', 'H'].includes(cell.status)) {
          preferredOffGranted++;
        }
      }
    }

    // If less than 50% of preferred off days granted, raise informational note
    if (preferredOffOpportunities > 0 && (preferredOffGranted / preferredOffOpportunities) < 0.5) {
      conflicts.push({
        id: `pref-${emp.id}`,
        severity: 'INFO',
        type: 'PREFERENCE_UNMET',
        day: 1,
        dateStr: formatDateStr(year, month, 1),
        employeeId: emp.id,
        employeeName: emp.name,
        podId: emp.podId,
        description: `${emp.name} prefers ${DAY_NAMES[emp.preferredOffDay]}s off, but was only granted ${preferredOffGranted} out of ${preferredOffOpportunities} ${DAY_NAMES[emp.preferredOffDay]}s this month due to client coverage priorities.`,
        suggestedAction: 'Consider rotating off-day preferences in next month’s roster planning for team satisfaction.',
      });
    }
  });

  return conflicts;
}
