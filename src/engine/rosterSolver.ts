import { Employee, Process, Holiday, PlannedLeave, MonthlyRoster, DailyScheduleCell, ShiftStatus } from '../types/roster';
import { getDaysInMonth, getDayOfWeek, formatDateStr, isProcessOperating } from '../utils/calendarUtils';

export interface SolverOptions {
  month: number;
  year: number;
  employees: Employee[];
  processes: Process[];
  holidays: Holiday[];
  plannedLeaves: PlannedLeave[];
  preserveManualOverrides?: boolean;
  existingRoster?: MonthlyRoster;
  autoAssignPodBackups?: boolean;
}

export function generateSmartRoster(options: SolverOptions): MonthlyRoster {
  const {
    month,
    year,
    employees,
    processes,
    holidays,
    plannedLeaves,
    preserveManualOverrides = true,
    existingRoster,
    autoAssignPodBackups = true,
  } = options;

  const totalDays = getDaysInMonth(year, month);
  const roster: MonthlyRoster = {};

  // 1. Initialize roster for all employees
  employees.forEach(emp => {
    roster[emp.id] = {};
    for (let day = 1; day <= totalDays; day++) {
      // Default initial state is Working
      roster[emp.id][day] = {
        status: 'W',
        assignedProcessIds: [],
      };
    }
  });

  // 2. Apply Planned Leaves & Comp-offs (Hard constraints)
  plannedLeaves.forEach(leave => {
    const leaveDate = new Date(leave.date);
    if (leaveDate.getFullYear() === year && leaveDate.getMonth() + 1 === month) {
      const day = leaveDate.getDate();
      if (roster[leave.employeeId] && roster[leave.employeeId][day]) {
        roster[leave.employeeId][day] = {
          status: leave.type, // 'L' or 'C'
          note: leave.reason || (leave.type === 'L' ? 'Approved Leave' : 'Comp-off'),
          isOverride: false,
        };
      }
    }
  });

  // 3. Associate employees with their primary processes
  const empProcessesMap: Record<string, Process[]> = {};
  employees.forEach(e => {
    empProcessesMap[e.id] = processes.filter(p => p.assignedEmployeeIds.includes(e.id));
  });

  // 4. Handle natural non-operating days for employees whose processes are closed
  // E.g., if ALL processes an employee manages have SUNDAYS_AND_HOLIDAYS_OFF, Sunday & Holidays are non-working
  employees.forEach(emp => {
    const myProcs = empProcessesMap[emp.id] || [];
    if (myProcs.length === 0) return;

    for (let day = 1; day <= totalDays; day++) {
      // Skip if already marked as Leave or Comp-off
      if (['L', 'C'].includes(roster[emp.id][day].status)) continue;

      const anyOperating = myProcs.some(p => isProcessOperating(year, month, day, p, holidays));
      if (!anyOperating) {
        // If not operating, mark as Holiday/Closed or Off
        const dow = getDayOfWeek(year, month, day);
        roster[emp.id][day] = {
          status: dow === 0 ? 'O' : 'H',
          note: dow === 0 ? 'Sunday (Process Closed)' : 'Public Holiday (Process Closed)',
        };
      }
    }
  });

  // 5. Intelligent Weekly-Off Scheduling with Preference Balancing
  // We divide the month into standard 7-day work cycles (weeks 1..5)
  // For each employee, determine their best weekly off day per week.
  // Prioritize their preferredOffDay unless that would violate minimum coverage.
  const weekBuckets: number[][] = [];
  for (let d = 1; d <= totalDays; d += 7) {
    const bucket: number[] = [];
    for (let w = d; w < Math.min(d + 7, totalDays + 1); w++) {
      bucket.push(w);
    }
    weekBuckets.push(bucket);
  }

  // Count offs per weekday across pod to ensure fair staggered coverage
  const podOffCount: Record<string, number[]> = {};

  // Sort employees: multi-resource first to anchor shared coverage, single-resource next
  const sortedEmployees = [...employees].sort((a, b) => {
    const aCount = empProcessesMap[a.id]?.length || 0;
    const bCount = empProcessesMap[b.id]?.length || 0;
    return bCount - aCount;
  });

  sortedEmployees.forEach(emp => {
    if (!podOffCount[emp.podId]) {
      podOffCount[emp.podId] = Array(7).fill(0);
    }

    const myProcs = empProcessesMap[emp.id] || [];

    weekBuckets.forEach(bucket => {
      // Check if employee already has an off/leave day in this bucket
      const existingRestDay = bucket.find(d => ['O', 'L', 'C', 'H'].includes(roster[emp.id][d].status));
      if (existingRestDay) {
        // Already has rest day in this week (e.g. Sunday or Leave)
        return;
      }

      // Evaluate best candidate day in this bucket for off
      let bestDay = bucket[0];
      let lowestPenalty = Infinity;

      bucket.forEach(day => {
        const dow = getDayOfWeek(year, month, day);
        let penalty = 0;

        // Preference bonus: if this day matches preferredOffDay, strong preference reduction
        if (dow === emp.preferredOffDay) {
          penalty -= 10;
        }

        // Pod off balance: avoid everyone taking the same weekday off
        penalty += (podOffCount[emp.podId][dow] || 0) * 2;

        // Process coverage impact check:
        // How many other available employees can cover my processes on this day?
        myProcs.forEach(proc => {
          if (!isProcessOperating(year, month, day, proc, holidays)) return;

          const activePeers = proc.assignedEmployeeIds.filter(peerId => {
            if (peerId === emp.id) return false;
            return roster[peerId] && roster[peerId][day]?.status === 'W';
          }).length;

          if (activePeers < proc.minStaff) {
            // Deficit created if this employee is given Off on this day!
            // Large penalty for single-resource brands or when below minStaff
            penalty += 50;
          }
        });

        if (penalty < lowestPenalty) {
          lowestPenalty = penalty;
          bestDay = day;
        }
      });

      // Assign Weekly Off to bestDay
      const bestDow = getDayOfWeek(year, month, bestDay);
      podOffCount[emp.podId][bestDow]++;
      roster[emp.id][bestDay] = {
        status: 'O',
        note: `Weekly Off (${bestDow === emp.preferredOffDay ? 'Preferred' : 'Staggered'})`,
      };
    });
  });

  // 6. Automated Smart Cross-Coverage / Backup Assignment for Pod Slack
  // If autoAssignPodBackups is enabled, check any process that has a coverage deficit
  // and see if an idle/free team member in the same pod (cross-trained) can cover it!
  if (autoAssignPodBackups) {
    processes.forEach(proc => {
      for (let day = 1; day <= totalDays; day++) {
        if (!isProcessOperating(year, month, day, proc, holidays)) continue;

        // Count assigned available staff
        const workingStaff = proc.assignedEmployeeIds.filter(id => roster[id] && roster[id][day]?.status === 'W');
        const deficit = proc.minStaff - workingStaff.length;

        if (deficit > 0) {
          // Find candidates in the same pod who are working but their own brand is off or has surplus staff
          const brandProcessPod = employees.find(e => proc.assignedEmployeeIds.includes(e.id))?.podId;
          const candidates = employees.filter(cand => {
            if (proc.assignedEmployeeIds.includes(cand.id)) return false;
            if (roster[cand.id][day]?.status !== 'W') return false; // candidate must be working today
            if (roster[cand.id][day]?.backupForEmployeeId) return false; // already backing someone up

            // Cross-trained in this process?
            const matchesSkill = cand.crossTrainedProcesses.some(skill => proc.name.includes(skill));
            if (!matchesSkill) return false;

            // Check if candidate's primary processes have surplus staff today
            const candProcs = empProcessesMap[cand.id] || [];
            const hasFreeCapacity = candProcs.every(cp => {
              if (!isProcessOperating(year, month, day, cp, holidays)) return true;
              const cpWorking = cp.assignedEmployeeIds.filter(pid => roster[pid] && roster[pid][day]?.status === 'W').length;
              return cpWorking > cp.minStaff; // has surplus
            });

            return hasFreeCapacity;
          });

          // Sort candidates: same pod first
          candidates.sort((a, b) => (b.podId === brandProcessPod ? 1 : 0) - (a.podId === brandProcessPod ? 1 : 0));

          if (candidates.length > 0) {
            const chosenBackup = candidates[0];
            roster[chosenBackup.id][day].backupForEmployeeId = proc.assignedEmployeeIds[0];
            roster[chosenBackup.id][day].note = `Cross-coverage for ${proc.name}`;
          }
        }
      }
    });
  }

  // 7. Preserve Manual Overrides if requested
  if (preserveManualOverrides && existingRoster) {
    Object.keys(existingRoster).forEach(empId => {
      if (!roster[empId]) return;
      Object.keys(existingRoster[empId]).forEach(dStr => {
        const d = Number(dStr);
        const cell = existingRoster[empId][d];
        if (cell && cell.isOverride) {
          roster[empId][d] = { ...cell };
        }
      });
    });
  }

  return roster;
}
