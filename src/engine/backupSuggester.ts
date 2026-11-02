import { Employee, Process, Brand, Holiday, MonthlyRoster, BackupCandidate } from '../types/roster';
import { isProcessOperating } from '../utils/calendarUtils';

export interface BackupSuggesterInput {
  month: number;
  year: number;
  day: number;
  process: Process;
  brand: Brand;
  employees: Employee[];
  allProcesses: Process[];
  holidays: Holiday[];
  roster: MonthlyRoster;
}

export function findBackupRecommendations(input: BackupSuggesterInput): BackupCandidate[] {
  const { day, year, month, process, brand, employees, allProcesses, holidays, roster } = input;

  const empProcessesMap: Record<string, Process[]> = {};
  employees.forEach(e => {
    empProcessesMap[e.id] = allProcesses.filter(p => p.assignedEmployeeIds.includes(e.id));
  });

  const candidates: BackupCandidate[] = [];

  employees.forEach(emp => {
    // Cannot backup own process
    if (process.assignedEmployeeIds.includes(emp.id)) return;

    const cell = roster[emp.id]?.[day];
    // Candidate cannot be on leave or comp-off
    if (cell && ['L', 'C'].includes(cell.status)) return;

    let score = 0;
    const reasons: string[] = [];

    // 1. Skill & Cross-Training Match (up to 40 pts)
    const procTag = process.name.includes('CS') ? 'CS' :
                    process.name.includes('ACC') ? 'ACC' :
                    process.name.includes('NDR') ? 'NDR' :
                    process.name.includes('Retention') ? 'Retention' : '';

    const isCrossTrained = procTag ? emp.crossTrainedProcesses.includes(procTag) : false;
    if (isCrossTrained) {
      score += 40;
      reasons.push(`Cross-trained in ${procTag}`);
    } else {
      score += 15; // general operational capability
      reasons.push('General CX/Ops capability');
    }

    // 2. Pod Affinity (up to 30 pts)
    const isSamePod = emp.podId === brand.podId;
    if (isSamePod) {
      score += 30;
      reasons.push(`Same Pod (${brand.podId.replace('pod-', '').toUpperCase()})`);
    } else {
      score += 10;
      reasons.push('Cross-pod resource');
    }

    // 3. Operational Availability & Slack (up to 25 pts)
    const myProcs = empProcessesMap[emp.id] || [];
    let isAvailableWithoutImpact = true;
    let slackReason = '';

    if (cell?.status === 'O') {
      // Currently on weekly off
      score += 5;
      slackReason = 'Currently on Weekly Off (would require rescheduling rest day)';
      isAvailableWithoutImpact = false;
    } else {
      // Currently working (status === 'W')
      // Check if candidate's brand is active today
      const activeProcs = myProcs.filter(p => isProcessOperating(year, month, day, p, holidays));
      if (activeProcs.length === 0) {
        score += 25;
        slackReason = 'Primary brand closed today (100% free slack)';
      } else {
        // Check if all active procs have surplus
        const allHaveSurplus = activeProcs.every(ap => {
          const peersWorking = ap.assignedEmployeeIds.filter(pid => pid !== emp.id && roster[pid]?.[day]?.status === 'W').length;
          return peersWorking >= ap.minStaff;
        });

        if (allHaveSurplus) {
          score += 20;
          slackReason = 'Primary brand has surplus staffing today';
        } else {
          score += 5;
          slackReason = 'Has active primary commitments (split attention)';
          isAvailableWithoutImpact = false;
        }
      }
    }
    reasons.push(slackReason);

    // 4. Role Seniority & Readiness (up to 5 pts)
    if (emp.isLead) {
      score += 5;
      reasons.push('Pod Lead oversight');
    } else {
      score += 3;
    }

    candidates.push({
      employee: emp,
      score: Math.min(score, 100),
      reason: reasons.join(' · '),
      isSamePod,
      isCrossTrained,
      isAvailableWithoutImpact,
    });
  });

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}
