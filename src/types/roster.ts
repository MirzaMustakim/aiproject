export type OperatingCalendarType = 
  | '365_DAYS'                 // Operates every day of the year (incl. Sundays & holidays)
  | 'DAILY_EXCEPT_HOLIDAYS'   // Operates daily except official public holidays
  | 'SUNDAYS_AND_HOLIDAYS_OFF'; // Operates Monday to Saturday, Sundays and holidays off

export type ShiftStatus = 'W' | 'O' | 'L' | 'C' | 'H';
// W = Working
// O = Weekly Off
// L = Planned/Approved Leave
// C = Compensatory Off (Comp-off)
// H = Process Closed / Holiday Off

export interface Pod {
  id: string;
  name: string;
  leadId: string;
  description?: string;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  podId: string;
  isLead?: boolean;
  role: string;
  preferredOffDay: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  maxConsecutiveDays: number; // default 6
  crossTrainedProcesses: string[]; // e.g. ['CS', 'ACC', 'NDR']
}

export interface Brand {
  id: string;
  name: string;
  podId: string;
  category: string;
}

export interface Process {
  id: string;
  brandId: string;
  name: string; // e.g. 'CS', 'ACC', 'NDR', 'Retention'
  calendarType: OperatingCalendarType;
  minStaff: number; // minimum required employees on operating days
  assignedEmployeeIds: string[]; // employees primary for this process
  weekendMinStaff?: number; // optional surge requirement
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  isMandatoryOffForNon365: boolean;
}

export interface PlannedLeave {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  type: 'L' | 'C'; // Leave or Comp-off
  reason?: string;
}

export interface DailyScheduleCell {
  status: ShiftStatus;
  isOverride?: boolean;
  assignedProcessIds?: string[];
  backupForEmployeeId?: string;
  note?: string;
}

// Map employeeId -> day (1..N) -> DailyScheduleCell
export type MonthlyRoster = Record<string, Record<number, DailyScheduleCell>>;

export type ConflictSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface SchedulingConflict {
  id: string;
  severity: ConflictSeverity;
  type: 
    | 'COVERAGE_GAP'
    | 'SINGLE_RESOURCE_OFF'
    | 'MAX_CONSECUTIVE_DAYS'
    | 'PREFERENCE_UNMET'
    | 'UNSTAFFED_PROCESS'
    | 'LEAVE_COLLISION';
  day: number;
  dateStr: string;
  brandId?: string;
  brandName?: string;
  processId?: string;
  processName?: string;
  employeeId?: string;
  employeeName?: string;
  podId?: string;
  description: string;
  requiredCount?: number;
  availableCount?: number;
  suggestedAction?: string;
}

export interface BackupCandidate {
  employee: Employee;
  score: number; // 0 - 100
  reason: string;
  isSamePod: boolean;
  isCrossTrained: boolean;
  isAvailableWithoutImpact: boolean;
}

export interface RosterMetadata {
  month: number; // 1-12 (November = 11)
  year: number;  // 2026
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED';
  publishedAt?: string;
  lastGeneratedAt?: string;
  approvedByPodLeads: Record<string, boolean>; // podId -> true/false
}
