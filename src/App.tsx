import React, { useState, useEffect } from 'react';
import { RosterProvider } from './context/RosterContext';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { CompanyView } from './components/views/CompanyView';
import { PodView } from './components/views/PodView';
import { BrandView } from './components/views/BrandView';
import { ProcessView } from './components/views/ProcessView';
import { EmployeeView } from './components/views/EmployeeView';
import { ConflictDrawer } from './components/modals/ConflictDrawer';
import { ChangeSimulatorModal } from './components/modals/ChangeSimulatorModal';
import { ManageDataModal } from './components/modals/ManageDataModal';
import { ApprovalModal } from './components/modals/ApprovalModal';
import { ExportModal } from './components/modals/ExportModal';
import { CellEditModal } from './components/modals/CellEditModal';

function RosterAppContent() {
  const [currentView, setCurrentView] = useState<string>('company');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modal visibility states
  const [isConflictDrawerOpen, setIsConflictDrawerOpen] = useState(false);
  const [isChangeSimulatorOpen, setIsChangeSimulatorOpen] = useState(false);
  const [isManageDataOpen, setIsManageDataOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Cell Edit Modal state
  const [cellEditState, setCellEditState] = useState<{ empId: string; day: number } | null>(null);

  // Focused gap for conflict drawer
  const [focusedGap, setFocusedGap] = useState<{ procId: string; day: number } | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleCellClick = (empId: string, day: number) => {
    setCellEditState({ empId, day });
  };

  const handleResolveGap = (procId: string, day: number) => {
    setFocusedGap({ procId, day });
    setIsConflictDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenConflicts={() => setIsConflictDrawerOpen(true)}
        onOpenSimulator={() => setIsChangeSimulatorOpen(true)}
        onOpenManage={() => setIsManageDataOpen(true)}
        onOpenApprovals={() => setIsApprovalModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        
        {/* KPI Summary Cards */}
        <StatsOverview
          onOpenConflicts={() => setIsConflictDrawerOpen(true)}
          onOpenApprovals={() => setIsApprovalModalOpen(true)}
        />

        {/* Dynamic View Selection */}
        {currentView === 'company' && (
          <CompanyView onCellClick={handleCellClick} />
        )}

        {currentView === 'pod' && (
          <PodView onCellClick={handleCellClick} />
        )}

        {currentView === 'brand' && (
          <BrandView onResolveGap={handleResolveGap} />
        )}

        {currentView === 'process' && (
          <ProcessView onResolveGap={handleResolveGap} />
        )}

        {currentView === 'employee' && (
          <EmployeeView onCellClick={handleCellClick} />
        )}

      </main>

      {/* Modals & Slide-overs */}
      <ConflictDrawer
        isOpen={isConflictDrawerOpen}
        onClose={() => {
          setIsConflictDrawerOpen(false);
          setFocusedGap(null);
        }}
        focusedProcessId={focusedGap?.procId}
        focusedDay={focusedGap?.day}
      />

      <ChangeSimulatorModal
        isOpen={isChangeSimulatorOpen}
        onClose={() => setIsChangeSimulatorOpen(false)}
      />

      <ManageDataModal
        isOpen={isManageDataOpen}
        onClose={() => setIsManageDataOpen(false)}
      />

      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <CellEditModal
        isOpen={!!cellEditState}
        onClose={() => setCellEditState(null)}
        employeeId={cellEditState?.empId || null}
        day={cellEditState?.day || null}
      />

    </div>
  );
}

export default function App() {
  return (
    <RosterProvider>
      <RosterAppContent />
    </RosterProvider>
  );
}
