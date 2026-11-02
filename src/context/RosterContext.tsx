import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Pod,
  Employee,
  Brand,
  Process,
  Holiday,
  PlannedLeave,
  MonthlyRoster,
  DailyScheduleCell,
  SchedulingConflict,
  RosterMetadata,
  BackupCandidate,
} from '../types/roster';
import {
  INITIAL_PODS,
  INITIAL_EMPLOYEES,
  INITIAL_BRANDS,
  INITIAL_PROCESSES,
  INITIAL_HOLIDAYS,
  INITIAL_PLANNED_LEAVES,
  INITIAL_METADATA,
} from '../data/initialData';
import { generateSmartRoster } from '../engine/rosterSolver';
import { detectAllConflicts } from '../engine/conflictDetector';
import { findBackupRecommendations } from '../engine/backupSuggester';

const STORAGE_KEY = 'datastraw_smart_roster_v1';

interface RosterContextType {
  // Core State
  month: number;
  year: number;
  setMonth: (m: number) => void;
  setYear: (y: number) => void;

  pods: Pod[];
  employees: Employee[];
  brands: Brand[];
  processes: Process[];
  holidays: Holiday[];
  plannedLeaves: PlannedLeave[];
  roster: MonthlyRoster;
  metadata: RosterMetadata;
  conflicts: SchedulingConflict[];

  // Actions
  regenerateRoster: (autoAssignBackups?: boolean) => void;
  updateCellStatus: (empId: string, day: number, status: DailyScheduleCell['status'], note?: string) => void;
  assignBackupToDeficit: (processId: string, day: number, backupEmployeeId: string) => void;
  getBackupsForProcessAndDay: (processId: string, day: number) => BackupCandidate[];
  
  // Leave Management
  requestLeave: (employeeId: string, day: number, type: 'L' | 'C', reason: string) => void;
  cancelLeave: (leaveId: string) => void;

  // Management CRUD
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;

  addBrand: (brand: Omit<Brand, 'id'>) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (id: string) => void;

  addProcess: (proc: Omit<Process, 'id'>) => void;
  updateProcess: (proc: Process) => void;
  deleteProcess: (id: string) => void;

  addHoliday: (holiday: Holiday) => void;
  deleteHoliday: (date: string) => void;

  // Publishing & Approval
  togglePodApproval: (podId: string) => void;
  publishRoster: () => void;
  unpublishRoster: () => void;

  // Utilities
  resetToDefaults: () => void;
}

const RosterContext = createContext<RosterContextType | undefined>(undefined);

export const RosterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [month, setMonth] = useState<number>(INITIAL_METADATA.month);
  const [year, setYear] = useState<number>(INITIAL_METADATA.year);

  const [pods, setPods] = useState<Pod[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pods`);
    return saved ? JSON.parse(saved) : INITIAL_PODS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_employees`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_brands`);
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });

  const [processes, setProcesses] = useState<Process[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_processes`);
    return saved ? JSON.parse(saved) : INITIAL_PROCESSES;
  });

  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_holidays`);
    return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS;
  });

  const [plannedLeaves, setPlannedLeaves] = useState<PlannedLeave[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_leaves`);
    return saved ? JSON.parse(saved) : INITIAL_PLANNED_LEAVES;
  });

  const [metadata, setMetadata] = useState<RosterMetadata>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_metadata`);
    return saved ? JSON.parse(saved) : INITIAL_METADATA;
  });

  const [roster, setRoster] = useState<MonthlyRoster>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_roster`);
    if (saved) return JSON.parse(saved);
    return generateSmartRoster({
      month: INITIAL_METADATA.month,
      year: INITIAL_METADATA.year,
      employees: INITIAL_EMPLOYEES,
      processes: INITIAL_PROCESSES,
      holidays: INITIAL_HOLIDAYS,
      plannedLeaves: INITIAL_PLANNED_LEAVES,
    });
  });

  // Automatically save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_pods`, JSON.stringify(pods));
      localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
      localStorage.setItem(`${STORAGE_KEY}_brands`, JSON.stringify(brands));
      localStorage.setItem(`${STORAGE_KEY}_processes`, JSON.stringify(processes));
      localStorage.setItem(`${STORAGE_KEY}_holidays`, JSON.stringify(holidays));
      localStorage.setItem(`${STORAGE_KEY}_leaves`, JSON.stringify(plannedLeaves));
      localStorage.setItem(`${STORAGE_KEY}_metadata`, JSON.stringify(metadata));
      localStorage.setItem(`${STORAGE_KEY}_roster`, JSON.stringify(roster));
    } catch (e) {
      console.warn('Failed to persist to localStorage:', e);
    }
  }, [pods, employees, brands, processes, holidays, plannedLeaves, metadata, roster]);

  // Compute Conflicts in Real-Time
  const conflicts = useMemo(() => {
    return detectAllConflicts({
      month,
      year,
      employees,
      brands,
      processes,
      holidays,
      roster,
    });
  }, [month, year, employees, brands, processes, holidays, roster]);

  // Regenerate Roster
  const regenerateRoster = useCallback((autoAssignBackups: boolean = true) => {
    const freshRoster = generateSmartRoster({
      month,
      year,
      employees,
      processes,
      holidays,
      plannedLeaves,
      autoAssignPodBackups: autoAssignBackups,
      preserveManualOverrides: false,
    });
    setRoster(freshRoster);
    setMetadata(prev => ({
      ...prev,
      lastGeneratedAt: new Date().toISOString(),
      status: 'DRAFT',
    }));
  }, [month, year, employees, processes, holidays, plannedLeaves]);

  // Update a single cell directly (interactive roster edit)
  const updateCellStatus = useCallback((empId: string, day: number, status: DailyScheduleCell['status'], note?: string) => {
    setRoster(prev => {
      const copy = { ...prev };
      if (!copy[empId]) copy[empId] = {};
      copy[empId] = {
        ...copy[empId],
        [day]: {
          status,
          isOverride: true,
          note: note || (status === 'W' ? 'Manual Work' : status === 'O' ? 'Manual Weekly Off' : status === 'L' ? 'Manual Leave' : 'Manual Edit'),
        },
      };
      return copy;
    });
  }, []);

  // Intelligent Backup Assignment
  const assignBackupToDeficit = useCallback((processId: string, day: number, backupEmployeeId: string) => {
    const proc = processes.find(p => p.id === processId);
    if (!proc) return;

    setRoster(prev => {
      const copy = { ...prev };
      if (!copy[backupEmployeeId]) copy[backupEmployeeId] = {};

      copy[backupEmployeeId] = {
        ...copy[backupEmployeeId],
        [day]: {
          status: 'W',
          isOverride: true,
          backupForEmployeeId: proc.assignedEmployeeIds[0] || 'primary',
          note: `Covering ${proc.name}`,
        },
      };
      return copy;
    });
  }, [processes]);

  // Query backup recommendations for a specific process deficit
  const getBackupsForProcessAndDay = useCallback((processId: string, day: number): BackupCandidate[] => {
    const proc = processes.find(p => p.id === processId);
    if (!proc) return [];
    const brand = brands.find(b => b.id === proc.brandId);
    if (!brand) return [];

    return findBackupRecommendations({
      month,
      year,
      day,
      process: proc,
      brand,
      employees,
      allProcesses: processes,
      holidays,
      roster,
    });
  }, [month, year, processes, brands, employees, holidays, roster]);

  // Request Leave Action (Change simulator)
  const requestLeave = useCallback((employeeId: string, day: number, type: 'L' | 'C', reason: string) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${year}-${m}-${d}`;

    const newLeave: PlannedLeave = {
      id: `leave-${Date.now()}`,
      employeeId,
      date: dateStr,
      type,
      reason,
    };

    setPlannedLeaves(prev => [...prev.filter(l => !(l.employeeId === employeeId && l.date === dateStr)), newLeave]);

    // Update cell
    setRoster(prev => {
      const copy = { ...prev };
      if (!copy[employeeId]) copy[employeeId] = {};
      copy[employeeId] = {
        ...copy[employeeId],
        [day]: {
          status: type,
          isOverride: true,
          note: reason,
        },
      };
      return copy;
    });
  }, [month, year]);

  const cancelLeave = useCallback((leaveId: string) => {
    const leave = plannedLeaves.find(l => l.id === leaveId);
    if (!leave) return;

    const leaveDate = new Date(leave.date);
    const day = leaveDate.getDate();

    setPlannedLeaves(prev => prev.filter(l => l.id !== leaveId));

    // Reset cell to Working
    setRoster(prev => {
      const copy = { ...prev };
      if (copy[leave.employeeId]?.[day]) {
        copy[leave.employeeId] = {
          ...copy[leave.employeeId],
          [day]: {
            status: 'W',
            isOverride: true,
            note: 'Leave cancelled',
          },
        };
      }
      return copy;
    });
  }, [plannedLeaves]);

  // CRUD for Employees
  const addEmployee = useCallback((newEmpData: Omit<Employee, 'id'>) => {
    const newId = `emp-${Date.now()}`;
    const newEmp: Employee = { ...newEmpData, id: newId };
    setEmployees(prev => [...prev, newEmp]);
  }, []);

  const updateEmployee = useCallback((updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => (e.id === updatedEmp.id ? updatedEmp : e)));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    // Remove from assigned processes
    setProcesses(prev =>
      prev.map(p => ({
        ...p,
        assignedEmployeeIds: p.assignedEmployeeIds.filter(eId => eId !== id),
      }))
    );
  }, []);

  // CRUD for Brands
  const addBrand = useCallback((brandData: Omit<Brand, 'id'>) => {
    const newId = `brand-${Date.now()}`;
    const newBrand: Brand = { ...brandData, id: newId };
    setBrands(prev => [...prev, newBrand]);
  }, []);

  const updateBrand = useCallback((updatedBrand: Brand) => {
    setBrands(prev => prev.map(b => (b.id === updatedBrand.id ? updatedBrand : b)));
  }, []);

  const deleteBrand = useCallback((id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id));
    setProcesses(prev => prev.filter(p => p.brandId !== id));
  }, []);

  // CRUD for Processes
  const addProcess = useCallback((procData: Omit<Process, 'id'>) => {
    const newId = `proc-${Date.now()}`;
    const newProc: Process = { ...procData, id: newId };
    setProcesses(prev => [...prev, newProc]);
  }, []);

  const updateProcess = useCallback((updatedProc: Process) => {
    setProcesses(prev => prev.map(p => (p.id === updatedProc.id ? updatedProc : p)));
  }, []);

  const deleteProcess = useCallback((id: string) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  }, []);

  // CRUD for Holidays
  const addHoliday = useCallback((holiday: Holiday) => {
    setHolidays(prev => [...prev.filter(h => h.date !== holiday.date), holiday]);
  }, []);

  const deleteHoliday = useCallback((date: string) => {
    setHolidays(prev => prev.filter(h => h.date !== date));
  }, []);

  // Approvals & Publishing
  const togglePodApproval = useCallback((podId: string) => {
    setMetadata(prev => ({
      ...prev,
      approvedByPodLeads: {
        ...prev.approvedByPodLeads,
        [podId]: !prev.approvedByPodLeads[podId],
      },
    }));
  }, []);

  const publishRoster = useCallback(() => {
    setMetadata(prev => ({
      ...prev,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
    }));
  }, []);

  const unpublishRoster = useCallback(() => {
    setMetadata(prev => ({
      ...prev,
      status: 'DRAFT',
    }));
  }, []);

  // Reset to Defaults
  const resetToDefaults = useCallback(() => {
    localStorage.clear();
    setPods(INITIAL_PODS);
    setEmployees(INITIAL_EMPLOYEES);
    setBrands(INITIAL_BRANDS);
    setProcesses(INITIAL_PROCESSES);
    setHolidays(INITIAL_HOLIDAYS);
    setPlannedLeaves(INITIAL_PLANNED_LEAVES);
    setMetadata(INITIAL_METADATA);
    setMonth(INITIAL_METADATA.month);
    setYear(INITIAL_METADATA.year);

    const freshRoster = generateSmartRoster({
      month: INITIAL_METADATA.month,
      year: INITIAL_METADATA.year,
      employees: INITIAL_EMPLOYEES,
      processes: INITIAL_PROCESSES,
      holidays: INITIAL_HOLIDAYS,
      plannedLeaves: INITIAL_PLANNED_LEAVES,
      autoAssignPodBackups: true,
    });
    setRoster(freshRoster);
  }, []);

  return (
    <RosterContext.Provider
      value={{
        month,
        year,
        setMonth,
        setYear,
        pods,
        employees,
        brands,
        processes,
        holidays,
        plannedLeaves,
        roster,
        metadata,
        conflicts,
        regenerateRoster,
        updateCellStatus,
        assignBackupToDeficit,
        getBackupsForProcessAndDay,
        requestLeave,
        cancelLeave,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addBrand,
        updateBrand,
        deleteBrand,
        addProcess,
        updateProcess,
        deleteProcess,
        addHoliday,
        deleteHoliday,
        togglePodApproval,
        publishRoster,
        unpublishRoster,
        resetToDefaults,
      }}
    >
      {children}
    </RosterContext.Provider>
  );
};

export const useRoster = () => {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error('useRoster must be used within a RosterProvider');
  }
  return context;
};
