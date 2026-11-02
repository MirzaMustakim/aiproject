import { Pod, Employee, Brand, Process, Holiday, PlannedLeave, RosterMetadata } from '../types/roster';

export const INITIAL_PODS: Pod[] = [
  { id: 'pod-alpha', name: 'Pod Alpha', leadId: 'emp-1', description: 'Core eCommerce & Lifestyle Brands', color: 'emerald' },
  { id: 'pod-bravo', name: 'Pod Bravo', leadId: 'emp-2', description: 'Apparel, Footwear & Fashion D2C', color: 'blue' },
  { id: 'pod-charlie', name: 'Pod Charlie', leadId: 'emp-3', description: 'Food & Beverage, Nutraceuticals', color: 'purple' },
  { id: 'pod-delta', name: 'Pod Delta', leadId: 'emp-4', description: 'Tech Accessories & Home Living', color: 'amber' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  // Pod Alpha (8 members)
  { id: 'emp-1', name: 'Aarav Shah', email: 'aarav.s@datastraw.ops', podId: 'pod-alpha', isLead: true, role: 'Pod Lead & CX Strategist', preferredOffDay: 0, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC', 'NDR', 'Retention'] },
  { id: 'emp-5', name: 'Kabir Mehta', email: 'kabir.m@datastraw.ops', podId: 'pod-alpha', isLead: false, role: 'Senior Support Specialist', preferredOffDay: 1, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },
  { id: 'emp-6', name: 'Isha Nair', email: 'isha.n@datastraw.ops', podId: 'pod-alpha', isLead: false, role: 'CX Associate', preferredOffDay: 2, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'NDR'] },
  { id: 'emp-7', name: 'Vikram Das', email: 'vikram.d@datastraw.ops', podId: 'pod-alpha', isLead: false, role: 'Operations Associate', preferredOffDay: 3, maxConsecutiveDays: 6, crossTrainedProcesses: ['ACC', 'NDR'] },
  { id: 'emp-8', name: 'Anaya Khan', email: 'anaya.k@datastraw.ops', podId: 'pod-alpha', isLead: false, role: 'CX Associate', preferredOffDay: 4, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },
  { id: 'emp-9', name: 'Arjun Patil', email: 'arjun.p@datastraw.ops', podId: 'pod-alpha', isLead: false, role: 'Support Specialist', preferredOffDay: 5, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'Retention'] },
  { id: 'emp-10', name: 'Sana Iyer', email: 'sana.i@datastraw.ops', podId: 'pod-alpha', isLead: false, role: 'Operations Associate', preferredOffDay: 6, maxConsecutiveDays: 6, crossTrainedProcesses: ['NDR', 'ACC'] },
  { id: 'emp-11', name: 'Nikhil Rao', email: 'nikhil.r@datastraw.ops', podId: 'pod-alpha', isLead: false, role: 'Junior Associate', preferredOffDay: 0, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS'] },

  // Pod Bravo (8 members)
  { id: 'emp-2', name: 'Diya Rao', email: 'diya.r@datastraw.ops', podId: 'pod-bravo', isLead: true, role: 'Pod Lead & Ops Specialist', preferredOffDay: 0, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC', 'NDR', 'Retention'] },
  { id: 'emp-12', name: 'Priya Mehta', email: 'priya.m@datastraw.ops', podId: 'pod-bravo', isLead: false, role: 'Senior Support Specialist', preferredOffDay: 1, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },
  { id: 'emp-13', name: 'Rahul Nair', email: 'rahul.n@datastraw.ops', podId: 'pod-bravo', isLead: false, role: 'Retention Specialist', preferredOffDay: 2, maxConsecutiveDays: 6, crossTrainedProcesses: ['Retention', 'CS'] },
  { id: 'emp-14', name: 'Tara Das', email: 'tara.d@datastraw.ops', podId: 'pod-bravo', isLead: false, role: 'CX Associate', preferredOffDay: 3, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'NDR'] },
  { id: 'emp-15', name: 'Yash Patil', email: 'yash.p@datastraw.ops', podId: 'pod-bravo', isLead: false, role: 'Operations Associate', preferredOffDay: 4, maxConsecutiveDays: 6, crossTrainedProcesses: ['ACC', 'NDR'] },
  { id: 'emp-16', name: 'Neha Shah', email: 'neha.s@datastraw.ops', podId: 'pod-bravo', isLead: false, role: 'CX Associate', preferredOffDay: 5, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },
  { id: 'emp-17', name: 'Dev Khan', email: 'dev.k@datastraw.ops', podId: 'pod-bravo', isLead: false, role: 'Operations Associate', preferredOffDay: 6, maxConsecutiveDays: 6, crossTrainedProcesses: ['NDR'] },
  { id: 'emp-18', name: 'Kiara Iyer', email: 'kiara.i@datastraw.ops', podId: 'pod-bravo', isLead: false, role: 'Junior Associate', preferredOffDay: 0, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS'] },

  // Pod Charlie (8 members)
  { id: 'emp-3', name: 'Rohan Iyer', email: 'rohan.i@datastraw.ops', podId: 'pod-charlie', isLead: true, role: 'Pod Lead & Delivery Mgr', preferredOffDay: 0, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC', 'NDR', 'Retention'] },
  { id: 'emp-19', name: 'Aditya Patil', email: 'aditya.p@datastraw.ops', podId: 'pod-charlie', isLead: false, role: 'Senior Support Specialist', preferredOffDay: 1, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },
  { id: 'emp-20', name: 'Riya Mehta', email: 'riya.m@datastraw.ops', podId: 'pod-charlie', isLead: false, role: 'CX Associate', preferredOffDay: 2, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'NDR'] },
  { id: 'emp-21', name: 'Samar Nair', email: 'samar.n@datastraw.ops', podId: 'pod-charlie', isLead: false, role: 'Operations Associate', preferredOffDay: 3, maxConsecutiveDays: 6, crossTrainedProcesses: ['ACC', 'NDR'] },
  { id: 'emp-22', name: 'Zoya Das', email: 'zoya.d@datastraw.ops', podId: 'pod-charlie', isLead: false, role: 'Retention Specialist', preferredOffDay: 4, maxConsecutiveDays: 6, crossTrainedProcesses: ['Retention', 'CS'] },
  { id: 'emp-23', name: 'Karan Shah', email: 'karan.s@datastraw.ops', podId: 'pod-charlie', isLead: false, role: 'CX Associate', preferredOffDay: 5, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },
  { id: 'emp-24', name: 'Ira Khan', email: 'ira.k@datastraw.ops', podId: 'pod-charlie', isLead: false, role: 'Operations Associate', preferredOffDay: 6, maxConsecutiveDays: 6, crossTrainedProcesses: ['NDR'] },
  { id: 'emp-25', name: 'Manav Rao', email: 'manav.r@datastraw.ops', podId: 'pod-charlie', isLead: false, role: 'Junior Associate', preferredOffDay: 0, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },

  // Pod Delta (8 members)
  { id: 'emp-4', name: 'Meera Khan', email: 'meera.k@datastraw.ops', podId: 'pod-delta', isLead: true, role: 'Pod Lead & Quality Lead', preferredOffDay: 0, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC', 'NDR', 'Retention'] },
  { id: 'emp-26', name: 'Pooja Patil', email: 'pooja.p@datastraw.ops', podId: 'pod-delta', isLead: false, role: 'Senior Support Specialist', preferredOffDay: 1, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },
  { id: 'emp-27', name: 'Harsh Mehta', email: 'harsh.m@datastraw.ops', podId: 'pod-delta', isLead: false, role: 'CX Associate', preferredOffDay: 2, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'NDR'] },
  { id: 'emp-28', name: 'Naina Nair', email: 'naina.n@datastraw.ops', podId: 'pod-delta', isLead: false, role: 'Operations Associate', preferredOffDay: 3, maxConsecutiveDays: 6, crossTrainedProcesses: ['ACC', 'NDR'] },
  { id: 'emp-29', name: 'Veer Das', email: 'veer.d@datastraw.ops', podId: 'pod-delta', isLead: false, role: 'Support Specialist', preferredOffDay: 4, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'Retention'] },
  { id: 'emp-30', name: 'Anika Shah', email: 'anika.s@datastraw.ops', podId: 'pod-delta', isLead: false, role: 'CX Associate', preferredOffDay: 5, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },
  { id: 'emp-31', name: 'Omkar Rao', email: 'omkar.r@datastraw.ops', podId: 'pod-delta', isLead: false, role: 'Operations Associate', preferredOffDay: 6, maxConsecutiveDays: 6, crossTrainedProcesses: ['NDR'] },
  { id: 'emp-32', name: 'Sneha Iyer', email: 'sneha.i@datastraw.ops', podId: 'pod-delta', isLead: false, role: 'Junior Associate', preferredOffDay: 0, maxConsecutiveDays: 6, crossTrainedProcesses: ['CS', 'ACC'] },
];

export const INITIAL_BRANDS: Brand[] = [
  // 20 Single-Resource Brands (80%)
  { id: 'brand-1', name: 'Zenvy Wellness', podId: 'pod-alpha', category: 'Health & Supplements' },
  { id: 'brand-2', name: 'Lumio Optics', podId: 'pod-alpha', category: 'Eyewear' },
  { id: 'brand-3', name: 'Kaveri Teas', podId: 'pod-alpha', category: 'Artisanal Beverages' },
  { id: 'brand-4', name: 'Orbit Wear', podId: 'pod-alpha', category: 'Smart Apparel' },
  { id: 'brand-5', name: 'Nuvo Skin', podId: 'pod-alpha', category: 'Skincare' },

  { id: 'brand-6', name: 'Tarang Audio', podId: 'pod-bravo', category: 'Consumer Electronics' },
  { id: 'brand-7', name: 'Bloomleaf', podId: 'pod-bravo', category: 'Botanical Goods' },
  { id: 'brand-8', name: 'Pixelpup', podId: 'pod-bravo', category: 'Pet Care & Accessories' },
  { id: 'brand-9', name: 'Urbanroots', podId: 'pod-bravo', category: 'Sustainable Footwear' },
  { id: 'brand-10', name: 'Vela Active', podId: 'pod-bravo', category: 'Activewear' },

  { id: 'brand-11', name: 'Mintly Oral', podId: 'pod-charlie', category: 'Personal Dental Care' },
  { id: 'brand-12', name: 'Cobalt Home', podId: 'pod-charlie', category: 'Modern Furniture' },
  { id: 'brand-13', name: 'Sutra Silk', podId: 'pod-charlie', category: 'Luxury Textiles' },
  { id: 'brand-14', name: 'Fernhill Foods', podId: 'pod-charlie', category: 'Gourmet Pantry' },
  { id: 'brand-15', name: 'Quill Paper', podId: 'pod-charlie', category: 'Stationery & Journals' },

  { id: 'brand-16', name: 'Aarna Ayurveda', podId: 'pod-delta', category: 'Holistic Wellness' },
  { id: 'brand-17', name: 'Drift Luggage', podId: 'pod-delta', category: 'Travel Gear' },
  { id: 'brand-18', name: 'Halo Haircare', podId: 'pod-delta', category: 'Hair Treatments' },
  { id: 'brand-19', name: 'Jaggery Co', podId: 'pod-delta', category: 'Organic Sweeteners' },
  { id: 'brand-20', name: 'Kiko Coffee', podId: 'pod-delta', category: 'Specialty Coffee' },

  // 5 Multi-Resource Brands (20%)
  { id: 'brand-21', name: 'Brewhaus Coffee Roasters', podId: 'pod-alpha', category: 'Coffee & Subscriptions' }, // 3 agents
  { id: 'brand-22', name: 'Opal & Ivy Jewels', podId: 'pod-bravo', category: 'Fine Jewelry' },               // 3 agents
  { id: 'brand-23', name: 'Pebble Smart Home', podId: 'pod-charlie', category: 'IoT Home Automation' },       // 3 agents
  { id: 'brand-24', name: 'Saffron Lane D2C', podId: 'pod-delta', category: 'Ethnic Fashion' },               // 2 agents
  { id: 'brand-25', name: 'Tidal Electric', podId: 'pod-delta', category: 'Urban Mobility' },                 // 2 agents
];

export const INITIAL_PROCESSES: Process[] = [
  // 1-20: Single-Resource Brands (Assigned to dedicated single employee)
  // Brand 1: Zenvy (Assigned to emp-5) - CS operates 365 days
  { id: 'proc-1', brandId: 'brand-1', name: 'Customer Support (CS)', calendarType: '365_DAYS', minStaff: 1, assignedEmployeeIds: ['emp-5'] },
  { id: 'proc-2', brandId: 'brand-1', name: 'Abandoned Cart (ACC)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-5'] },

  // Brand 2: Lumio (Assigned to emp-6) - Daily except holidays
  { id: 'proc-3', brandId: 'brand-2', name: 'Customer Support (CS)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-6'] },
  { id: 'proc-4', brandId: 'brand-2', name: 'Non-Delivery (NDR)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-6'] },

  // Brand 3: Kaveri Teas (Assigned to emp-7) - Sundays and holidays off
  { id: 'proc-5', brandId: 'brand-3', name: 'Customer Support (CS)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-7'] },
  { id: 'proc-6', brandId: 'brand-3', name: 'Abandoned Cart (ACC)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-7'] },

  // Brand 4: Orbit Wear (Assigned to emp-8) - 365 Days
  { id: 'proc-7', brandId: 'brand-4', name: 'Customer Support (CS)', calendarType: '365_DAYS', minStaff: 1, assignedEmployeeIds: ['emp-8'] },
  { id: 'proc-8', brandId: 'brand-4', name: 'Abandoned Cart (ACC)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-8'] },

  // Brand 5: Nuvo Skin (Assigned to emp-9) - Daily except holidays
  { id: 'proc-9', brandId: 'brand-5', name: 'Customer Support (CS)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-9'] },
  { id: 'proc-10', brandId: 'brand-5', name: 'Retention', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-9'] },

  // Brand 6: Tarang Audio (Assigned to emp-12) - Daily except holidays
  { id: 'proc-11', brandId: 'brand-6', name: 'Customer Support (CS)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-12'] },
  { id: 'proc-12', brandId: 'brand-6', name: 'Abandoned Cart (ACC)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-12'] },

  // Brand 7: Bloomleaf (Assigned to emp-13) - Sundays and holidays off
  { id: 'proc-13', brandId: 'brand-7', name: 'Customer Support (CS)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-13'] },
  { id: 'proc-14', brandId: 'brand-7', name: 'Retention', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-13'] },

  // Brand 8: Pixelpup (Assigned to emp-14) - 365 Days
  { id: 'proc-15', brandId: 'brand-8', name: 'Customer Support (CS)', calendarType: '365_DAYS', minStaff: 1, assignedEmployeeIds: ['emp-14'] },
  { id: 'proc-16', brandId: 'brand-8', name: 'Non-Delivery (NDR)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-14'] },

  // Brand 9: Urbanroots (Assigned to emp-15) - Daily except holidays
  { id: 'proc-17', brandId: 'brand-9', name: 'Customer Support (CS)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-15'] },
  { id: 'proc-18', brandId: 'brand-9', name: 'Abandoned Cart (ACC)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-15'] },

  // Brand 10: Vela Active (Assigned to emp-16) - Sundays & holidays off
  { id: 'proc-19', brandId: 'brand-10', name: 'Customer Support (CS)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-16'] },

  // Brand 11: Mintly (Assigned to emp-19) - 365 Days
  { id: 'proc-20', brandId: 'brand-11', name: 'Customer Support (CS)', calendarType: '365_DAYS', minStaff: 1, assignedEmployeeIds: ['emp-19'] },
  { id: 'proc-21', brandId: 'brand-11', name: 'Abandoned Cart (ACC)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-19'] },

  // Brand 12: Cobalt Home (Assigned to emp-20) - Daily except holidays
  { id: 'proc-22', brandId: 'brand-12', name: 'Customer Support (CS)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-20'] },
  { id: 'proc-23', brandId: 'brand-12', name: 'Non-Delivery (NDR)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-20'] },

  // Brand 13: Sutra Silk (Assigned to emp-21) - Sundays & holidays off
  { id: 'proc-24', brandId: 'brand-13', name: 'Customer Support (CS)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-21'] },
  { id: 'proc-25', brandId: 'brand-13', name: 'Abandoned Cart (ACC)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-21'] },

  // Brand 14: Fernhill (Assigned to emp-22) - Daily except holidays
  { id: 'proc-26', brandId: 'brand-14', name: 'Customer Support (CS)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-22'] },
  { id: 'proc-27', brandId: 'brand-14', name: 'Retention', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-22'] },

  // Brand 15: Quill Paper (Assigned to emp-23) - Sundays & holidays off
  { id: 'proc-28', brandId: 'brand-15', name: 'Customer Support (CS)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-23'] },

  // Brand 16: Aarna Ayurveda (Assigned to emp-26) - 365 Days
  { id: 'proc-29', brandId: 'brand-16', name: 'Customer Support (CS)', calendarType: '365_DAYS', minStaff: 1, assignedEmployeeIds: ['emp-26'] },
  { id: 'proc-30', brandId: 'brand-16', name: 'Abandoned Cart (ACC)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-26'] },

  // Brand 17: Drift Luggage (Assigned to emp-27) - Daily except holidays
  { id: 'proc-31', brandId: 'brand-17', name: 'Customer Support (CS)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-27'] },
  { id: 'proc-32', brandId: 'brand-17', name: 'Non-Delivery (NDR)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-27'] },

  // Brand 18: Halo Haircare (Assigned to emp-28) - Sundays & holidays off
  { id: 'proc-33', brandId: 'brand-18', name: 'Customer Support (CS)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-28'] },
  { id: 'proc-34', brandId: 'brand-18', name: 'Abandoned Cart (ACC)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-28'] },

  // Brand 19: Jaggery Co (Assigned to emp-29) - Daily except holidays
  { id: 'proc-35', brandId: 'brand-19', name: 'Customer Support (CS)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-29'] },

  // Brand 20: Kiko Coffee (Assigned to emp-30) - Sundays & holidays off
  { id: 'proc-36', brandId: 'brand-20', name: 'Customer Support (CS)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-30'] },

  // Multi-Resource Brands:
  // Brand 21: Brewhaus Coffee Roasters (3 agents: emp-1, emp-10, emp-11)
  // Demonstrates separate processes assigned to different employees:
  // CS: 365 days, min 1 (emp-1, emp-10)
  // ACC: Sun & Hol off, min 1 (emp-10)
  // NDR: Daily except holidays, min 1 (emp-11)
  { id: 'proc-37', brandId: 'brand-21', name: 'Customer Support (CS)', calendarType: '365_DAYS', minStaff: 1, assignedEmployeeIds: ['emp-1', 'emp-10'] },
  { id: 'proc-38', brandId: 'brand-21', name: 'Abandoned Cart (ACC)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-10'] },
  { id: 'proc-39', brandId: 'brand-21', name: 'Non-Delivery (NDR)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-11'] },

  // Brand 22: Opal & Ivy Jewels (3 agents: emp-2, emp-17, emp-18)
  // Demonstrates overlapping/shared high-volume process:
  // CS requires min 2 staff, operates 365 days! (emp-2, emp-17, emp-18)
  // NDR: min 1 staff, Daily except holidays (emp-17)
  { id: 'proc-40', brandId: 'brand-22', name: 'Customer Support (CS)', calendarType: '365_DAYS', minStaff: 2, assignedEmployeeIds: ['emp-2', 'emp-17', 'emp-18'] },
  { id: 'proc-41', brandId: 'brand-22', name: 'Non-Delivery (NDR)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-17'] },

  // Brand 23: Pebble Smart Home (3 agents: emp-3, emp-24, emp-25)
  // CS: 365 days, min 1 (emp-3, emp-25)
  // ACC: Daily except holidays, min 1 (emp-25)
  // NDR: Sun & Hol off, min 1 (emp-24)
  { id: 'proc-42', brandId: 'brand-23', name: 'Customer Support (CS)', calendarType: '365_DAYS', minStaff: 1, assignedEmployeeIds: ['emp-3', 'emp-25'] },
  { id: 'proc-43', brandId: 'brand-23', name: 'Abandoned Cart (ACC)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-25'] },
  { id: 'proc-44', brandId: 'brand-23', name: 'Non-Delivery (NDR)', calendarType: 'SUNDAYS_AND_HOLIDAYS_OFF', minStaff: 1, assignedEmployeeIds: ['emp-24'] },

  // Brand 24: Saffron Lane D2C (2 agents: emp-4, emp-31)
  // CS: 365 days, min 1 (emp-4, emp-31)
  // NDR: Daily except holidays, min 1 (emp-31)
  { id: 'proc-45', brandId: 'brand-24', name: 'Customer Support (CS)', calendarType: '365_DAYS', minStaff: 1, assignedEmployeeIds: ['emp-4', 'emp-31'] },
  { id: 'proc-46', brandId: 'brand-24', name: 'Non-Delivery (NDR)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-31'] },

  // Brand 25: Tidal Electric (2 agents: emp-31, emp-32)
  // CS: Daily except holidays, min 1 (emp-32)
  // Retention: Daily except holidays, min 1 (emp-32)
  { id: 'proc-47', brandId: 'brand-25', name: 'Customer Support (CS)', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-32'] },
  { id: 'proc-48', brandId: 'brand-25', name: 'Retention', calendarType: 'DAILY_EXCEPT_HOLIDAYS', minStaff: 1, assignedEmployeeIds: ['emp-32'] },
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  { date: '2026-11-08', name: 'Diwali (Deepavali)', isMandatoryOffForNon365: true },
  { date: '2026-11-24', name: 'Guru Nanak Jayanti', isMandatoryOffForNon365: true },
];

export const INITIAL_PLANNED_LEAVES: PlannedLeave[] = [
  { id: 'leave-1', employeeId: 'emp-5', date: '2026-11-12', type: 'L', reason: 'Personal Leave / Medical checkup' },
  { id: 'leave-2', employeeId: 'emp-14', date: '2026-11-18', type: 'L', reason: 'Family celebration' },
  { id: 'leave-3', employeeId: 'emp-20', date: '2026-11-05', type: 'C', reason: 'Compensatory off earned from October festival peak' },
  { id: 'leave-4', employeeId: 'emp-27', date: '2026-11-20', type: 'L', reason: 'Approved annual leave' },
];

export const INITIAL_METADATA: RosterMetadata = {
  month: 11, // November
  year: 2026,
  status: 'DRAFT',
  approvedByPodLeads: {
    'pod-alpha': false,
    'pod-bravo': false,
    'pod-charlie': false,
    'pod-delta': false,
  },
};
