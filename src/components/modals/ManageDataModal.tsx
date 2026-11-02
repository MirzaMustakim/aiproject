import React, { useState } from 'react';
import { X, Users, Building2, Settings, Calendar, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { Employee, Brand, Process, Holiday, OperatingCalendarType } from '../../types/roster';
import { DAY_NAMES } from '../../utils/calendarUtils';

interface ManageDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageDataModal: React.FC<ManageDataModalProps> = ({ isOpen, onClose }) => {
  const {
    pods,
    employees,
    brands,
    processes,
    holidays,
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
  } = useRoster();

  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'BRANDS' | 'PROCESSES' | 'HOLIDAYS'>('EMPLOYEES');

  // Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPod, setNewEmpPod] = useState(pods[0]?.id || 'pod-alpha');
  const [newEmpRole, setNewEmpRole] = useState('CX Operations Associate');
  const [newEmpPrefOff, setNewEmpPrefOff] = useState(0);
  const [newEmpSkills, setNewEmpSkills] = useState('CS, ACC');

  // Brand Form State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandPod, setNewBrandPod] = useState(pods[0]?.id || 'pod-alpha');
  const [newBrandCategory, setNewBrandCategory] = useState('Lifestyle D2C');

  // Process Form State
  const [newProcBrandId, setNewProcBrandId] = useState(brands[0]?.id || '');
  const [newProcName, setNewProcName] = useState('Customer Support (CS)');
  const [newProcCal, setNewProcCal] = useState<OperatingCalendarType>('365_DAYS');
  const [newProcMin, setNewProcMin] = useState(1);
  const [newProcEmpIds, setNewProcEmpIds] = useState<string[]>([employees[0]?.id || '']);

  // Holiday Form State
  const [newHolDate, setNewHolDate] = useState('2026-11-15');
  const [newHolName, setNewHolName] = useState('');

  if (!isOpen) return null;

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName) return;

    addEmployee({
      name: newEmpName,
      email: newEmpEmail || `${newEmpName.toLowerCase().replace(/\s+/g, '.')}@datastraw.ops`,
      podId: newEmpPod,
      role: newEmpRole,
      preferredOffDay: Number(newEmpPrefOff),
      maxConsecutiveDays: 6,
      crossTrainedProcesses: newEmpSkills.split(',').map(s => s.trim()).filter(Boolean),
    });

    setNewEmpName('');
    setNewEmpEmail('');
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;

    addBrand({
      name: newBrandName,
      podId: newBrandPod,
      category: newBrandCategory,
    });

    setNewBrandName('');
  };

  const handleCreateProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcBrandId || !newProcName) return;

    addProcess({
      brandId: newProcBrandId,
      name: newProcName,
      calendarType: newProcCal,
      minStaff: Number(newProcMin),
      assignedEmployeeIds: newProcEmpIds,
    });

    setNewProcName('Customer Support (CS)');
  };

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolDate || !newHolName) return;

    addHoliday({
      date: newHolDate,
      name: newHolName,
      isMandatoryOffForNon365: true,
    });

    setNewHolName('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Central Roster Database Management
            </h2>
            <p className="text-xs text-slate-500">
              Add, edit, or configure employees, brands, processes, and rules dynamically without code changes
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/40 text-xs font-semibold">
          {[
            { id: 'EMPLOYEES', label: `Employees (${employees.length})`, icon: Users },
            { id: 'BRANDS', label: `Brands (${brands.length})`, icon: Building2 },
            { id: 'PROCESSES', label: `Processes (${processes.length})`, icon: Settings },
            { id: 'HOLIDAYS', label: `Holidays (${holidays.length})`, icon: Calendar },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {/* TAB 1: EMPLOYEES */}
          {activeTab === 'EMPLOYEES' && (
            <div className="space-y-4">
              
              {/* Add Employee Form */}
              <form onSubmit={handleCreateEmployee} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-2 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-teal-600" />
                  Add New Team Member
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Maya Patel)"
                    value={newEmpName}
                    onChange={e => setNewEmpName(e.target.value)}
                    required
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <select
                    value={newEmpPod}
                    onChange={e => setNewEmpPod(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {pods.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <select
                    value={newEmpPrefOff}
                    onChange={e => setNewEmpPrefOff(Number(e.target.value))}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {DAY_NAMES.map((name, i) => (
                      <option key={name} value={i}>Pref Off: {name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Role (e.g. CX Associate)"
                    value={newEmpRole}
                    onChange={e => setNewEmpRole(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Cross-Skills (comma separated: CS, ACC, NDR)"
                    value={newEmpSkills}
                    onChange={e => setNewEmpSkills(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Add Employee
                  </button>
                </div>
              </form>

              {/* Employees List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">Name & Email</th>
                      <th className="text-left py-2 px-2 font-semibold">Pod</th>
                      <th className="text-left py-2 px-2 font-semibold">Role</th>
                      <th className="text-left py-2 px-2 font-semibold">Pref Off</th>
                      <th className="text-left py-2 px-2 font-semibold">Cross-Skills</th>
                      <th className="text-center py-2 px-2 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {emp.name}
                            {emp.isLead && <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 font-bold">Lead</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{emp.email}</div>
                        </td>
                        <td className="py-2 px-2 uppercase text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {emp.podId.replace('pod-', '')}
                        </td>
                        <td className="py-2 px-2 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                          {emp.role}
                        </td>
                        <td className="py-2 px-2 text-teal-700 dark:text-teal-400 font-semibold">
                          {DAY_NAMES[emp.preferredOffDay]}
                        </td>
                        <td className="py-2 px-2 text-slate-500">
                          {emp.crossTrainedProcesses.join(', ')}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete employee ${emp.name}?`)) {
                                deleteEmployee(emp.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: BRANDS */}
          {activeTab === 'BRANDS' && (
            <div className="space-y-4">
              
              {/* Add Brand Form */}
              <form onSubmit={handleCreateBrand} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-2 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-teal-600" />
                  Add New D2C Brand Account
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Brand Name (e.g. Aura Botanics)"
                    value={newBrandName}
                    onChange={e => setNewBrandName(e.target.value)}
                    required
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <select
                    value={newBrandPod}
                    onChange={e => setNewBrandPod(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {pods.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Category (e.g. Organic Skincare)"
                    value={newBrandCategory}
                    onChange={e => setNewBrandCategory(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Add Brand
                  </button>
                </div>
              </form>

              {/* Brands Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {brands.map(brand => {
                  const brandProcs = processes.filter(p => p.brandId === brand.id);
                  const assignedCount = new Set(brandProcs.flatMap(p => p.assignedEmployeeIds)).size;

                  return (
                    <div key={brand.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{brand.name}</div>
                        <div className="text-[10px] text-slate-400">{brand.category} · Pod {brand.podId.replace('pod-', '')}</div>
                        <div className="text-[10px] text-teal-600 mt-0.5">
                          {brandProcs.length} process(es) · {assignedCount === 1 ? '1 Dedicated Agent (80% rule)' : `${assignedCount} Assigned Staff`}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete brand ${brand.name}?`)) {
                            deleteBrand(brand.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: PROCESSES */}
          {activeTab === 'PROCESSES' && (
            <div className="space-y-4">
              
              {/* Add Process Form */}
              <form onSubmit={handleCreateProcess} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-2 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-teal-600" />
                  Configure Operational Process & Calendar Rule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <select
                    value={newProcBrandId}
                    onChange={e => setNewProcBrandId(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Process Name (e.g. Customer Support (CS))"
                    value={newProcName}
                    onChange={e => setNewProcName(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <select
                    value={newProcCal}
                    onChange={e => setNewProcCal(e.target.value as OperatingCalendarType)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="365_DAYS">365 Days (Incl. Sun & Hol)</option>
                    <option value="DAILY_EXCEPT_HOLIDAYS">Daily except Holidays</option>
                    <option value="SUNDAYS_AND_HOLIDAYS_OFF">Sundays & Holidays Off</option>
                  </select>
                  <button
                    type="submit"
                    className="py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Add Process Rule
                  </button>
                </div>
              </form>

              {/* Processes List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">Brand</th>
                      <th className="text-left py-2 px-2 font-semibold">Process Name</th>
                      <th className="text-left py-2 px-2 font-semibold">Operating Calendar Rule</th>
                      <th className="text-center py-2 px-2 font-semibold">Min Staff</th>
                      <th className="text-left py-2 px-2 font-semibold">Assigned Team</th>
                      <th className="text-center py-2 px-2 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map(proc => {
                      const brand = brands.find(b => b.id === proc.brandId);
                      const assignedNames = proc.assignedEmployeeIds.map(id => employees.find(e => e.id === id)?.name).filter(Boolean).join(', ');

                      return (
                        <tr key={proc.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {brand?.name}
                          </td>
                          <td className="py-2 px-2 text-teal-700 dark:text-teal-400 font-semibold">
                            {proc.name}
                          </td>
                          <td className="py-2 px-2 text-slate-600 dark:text-slate-400 text-[11px]">
                            {proc.calendarType}
                          </td>
                          <td className="py-2 px-2 text-center font-bold">
                            {proc.minStaff}
                          </td>
                          <td className="py-2 px-2 text-slate-500 truncate max-w-[150px]">
                            {assignedNames}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete process ${proc.name}?`)) {
                                  deleteProcess(proc.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: HOLIDAYS */}
          {activeTab === 'HOLIDAYS' && (
            <div className="space-y-4">
              
              {/* Add Holiday Form */}
              <form onSubmit={handleCreateHoliday} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-2 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-teal-600" />
                  Add Official Public Holiday
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={newHolDate}
                    onChange={e => setNewHolDate(e.target.value)}
                    required
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Holiday Name (e.g. Christmas Day)"
                    value={newHolName}
                    onChange={e => setNewHolName(e.target.value)}
                    required
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Add Holiday
                  </button>
                </div>
              </form>

              {/* Holidays List */}
              <div className="space-y-2">
                {holidays.map(h => (
                  <div key={h.date} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{h.name}</span>
                      <div className="text-[10px] text-teal-600 font-mono">{h.date}</div>
                    </div>
                    <button
                      onClick={() => deleteHoliday(h.date)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
