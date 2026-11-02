# RosterDesk - Smart Roster Management System
### DataStraw Tech Internship Assessment · CX & Operations Scheduling Platform

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 Executive Summary & Approach Note (2-3 Sentences)

> **RosterDesk** is an intelligent, constraint-aware roster management platform designed for multi-brand D2C customer operations. It decouples client operating calendars (365-day, daily, weekend/holiday-off) from employee work schedules, resolving structural single-resource deficits through an automated cross-coverage recommendation engine and real-time gap detection. The system pairs heuristic mathematical optimization with human-in-the-loop pod lead sign-offs, delivering 100% SLA compliance while respecting statutory rest cycles and employee preferences.

---

## 🚀 Key Highlights & Solved Problems

1. **Realistic 32-Employee, 25-Brand Dataset**:
   - **80% Single-Resource Brands (20 brands)**: 1 dedicated specialist managing all brand processes (CS, ACC, NDR, Retention).
   - **20% Multi-Resource Brands (5 brands)**: 2–3 dedicated employees sharing high-volume processes or handling distinct workstreams.
   - **4 Operational Pods**: Pod Alpha, Bravo, Charlie, and Delta, each led by a designated Pod Lead.
2. **Decoupled Operating Rules vs. Work Schedules**:
   - `365_DAYS`: Continuous 365-day coverage (including Sundays and official public holidays).
   - `DAILY_EXCEPT_HOLIDAYS`: Operates daily, off on recognized public holidays (e.g., Diwali Nov 8, Guru Nanak Jayanti Nov 24).
   - `SUNDAYS_AND_HOLIDAYS_OFF`: Operates Monday–Saturday, off on Sundays and public holidays.
3. **Deterministic Heuristic Constraint Solver**:
   - Balances mandatory constraints (leaves, comp-offs, statutory weekly offs, maximum 6 consecutive work days) against soft preferences (preferred off days, pod load leveling).
4. **Intelligent Cross-Coverage & Backup Recommender**:
   - Ranks available colleagues using a 0–100% composite score based on **Cross-trained Skills (40%)**, **Pod Affinity (30%)**, and **Operational Slack (25%)**.
5. **Interactive Stakeholder Views**:
   - **Company Matrix**: 30-day heatmap across all pods with quick-edit cells and sticky headers.
   - **Pod View**: Pod Lead oversight card, team distribution, and pod sign-off checklist.
   - **Brand View**: Daily coverage health (Available vs. Min Required) with 1-click deficit resolution.
   - **Process View**: Aggregate daily staffing demand vs. supply across CS, ACC, NDR, and Retention.
   - **Employee View**: Individual monthly schedule, leave ledger, and preferred off compliance.
6. **Change Simulator ("What-If" Analysis)**:
   - Evaluates availability changes (e.g. single-resource leave vs. multi-resource redundancy) and calculates immediate cascade impacts.
7. **Dynamic Central Database Management**:
   - Full CRUD UI for Employees, Brands, Processes, Operating Rules, and Holidays without code modifications.
8. **Export & Approval Workflow**:
   - 1-click export to standard **CSV** (for Excel/Google Sheets) and complete **JSON backup**.
   - Pod Lead approval checklist with formal draft-to-publish workflow.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Run

```bash

git clone https://github.com/MirzaMustakim/aiproject.git
cd aiproject
npm install
npm run dev

Open `http://localhost:4173` (or `http://localhost:5173` for dev) in your browser.

---

## 💡 Tell Us How You Think (Answering the 8 Core Questions)

### 1. How did you model employees, brands, processes, pods, and their relationships?

We modeled the domain as a normalized, decoupled entity relationship architecture:
- **`Pod`**: The foundational operational unit. Each Pod has an assigned `Pod Lead` (a designated senior employee), a color identifier, and a portfolio of brands.
- **`Employee`**: Belongs to a single Pod. Contains operational metadata: `role`, `isLead`, `preferredOffDay` (0=Sun .. 6=Sat), `maxConsecutiveDays` (default 6), and `crossTrainedProcesses` (e.g., `['CS', 'ACC', 'NDR']`).
- **`Brand`**: Represents a client account, anchored inside a specific Pod.
- **`Process`**: **The critical decoupling entity**. Instead of binding operating rules directly to employees, each brand owns one or more processes (e.g., Brand "Zenvy" has "CS" with `365_DAYS` calendar and `minStaff: 1`, plus "ACC" with `DAILY_EXCEPT_HOLIDAYS`). Each process specifies its required minimum staffing and holds an array of `assignedEmployeeIds`.
- **`RosterMatrix`**: A 2D state map indexed by `[employeeId][day] -> { status, isOverride, backupForEmployeeId, note }`.

This abstraction allows single-resource accounts (80%) and multi-resource accounts (20%) to share the exact same relational model without special case hacks.

---

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?

The system employs a **two-phase deterministic heuristic constraint satisfaction solver**:

1. **Phase 1: Seed Hard Constraints & Invariants**
   - Applies all pre-approved Planned Leaves (`L`) and Comp-Offs (`C`).
   - Automatically marks natural non-operating days (`O` or `H`) for employees whose assigned processes are closed (e.g., Sunday-off brands).

2. **Phase 2: Staggered Rest-Day Optimization**
   - Partitions the month into weekly rolling windows.
   - For each employee, evaluates all potential rest days in the cycle using a weighted penalty function:
     $$\text{Penalty}(e, d) = 50 \times \text{DeficitRisk}(e, d) - 10 \times \text{MatchesPreference}(e, d) + 2 \times \text{PodOffCongestion}(w)$$
   - If assigning a rest day would breach process `minStaff`, the solver incurs a high penalty, scheduling rest days on days where peer coverage or pod slack exists.

3. **Constraint Validation Engine**:
   - The conflict detector runs independently on every state mutation:
     $$\text{AvailableStaff}(p, d) = \text{WorkingPrimary}(p, d) + \text{ActiveBackups}(p, d)$$
   - If $\text{AvailableStaff}(p, d) < p.\text{minStaff}$, it raises a `CRITICAL` coverage gap.
   - If an employee works $> 6$ consecutive days, it raises a `WARNING` fatigue alert.
   - If preferred off compliance drops below 50%, it logs an `INFO` preference advisory.

---

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?

- **Single-Resource Brands (80% of accounts)**:
  - Exactly 1 dedicated employee manages the account.
  - If the client's process operates 365 days or daily except holidays, giving the employee a mandatory weekly off creates an immediate mathematical dilemma: either the brand is abandoned on their off day, or the employee works 30 consecutive days in violation of labor standards.
  - Our system resolves this by granting the employee their compliant weekly off while actively triggering **Pod Cross-Coverage**: finding an available colleague within the same pod whose brand is closed or has surplus capacity to act as the primary backup.
- **Multi-Resource Brands (20% of accounts)**:
  - 2 to 3 employees assigned.
  - The solver coordinates complementary off-day patterns (e.g., Agent 1 takes Monday off, Agent 2 takes Tuesday off, Agent 3 takes Wednesday off) ensuring that the active headcount never drops below `minStaff`.

---

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?

When a single dedicated employee is marked unavailable (via Leave, Comp-off, or Weekly Off):
1. The real-time conflict detector immediately flags a `SINGLE_RESOURCE_OFF` critical conflict.
2. The **Intelligent Backup Suggester** activates and ranks every candidate across the company using a multi-factor fitness function:
   - **Cross-Trained Process Match (+40 pts)**: Has verified skill tags matching the process (e.g., CS, ACC, NDR).
   - **Pod Affinity (+30 pts)**: Belongs to the same pod (shares the same pod lead, communication cadence, and customer context).
   - **Operational Slack (+25 pts)**: Candidate is working today and their own brand is closed (e.g. Sunday-off brand) or has surplus peer staffing.
   - **Supervisory Fit (+5 pts)**: Role qualification.
3. The operations manager is presented with candidates ranked by match percentage (e.g., `95% Match - Same Pod, Cross-trained CS, Kaveri Teas closed today`). A single click on **"Assign"** immediately covers the shift and clears the conflict.

---

### 5. How does your system handle conflicting requirements or insufficient staffing?

1. **Clear Constraint Hierarchy**:
   - Mandatory client operating SLAs and approved leaves are hard constraints. Preferred off days are soft preferences. Hard constraints always outrank soft preferences.
2. **Transparent Diagnostics (No Silent Failures)**:
   - The application **never silently generates an invalid roster** or falsifies attendance.
   - When total available headcount is mathematically insufficient, the system surfaces the exact deficit count, dates, affected brands, and missing headcount in the top navigation badge and dedicated Conflict Drawer.
3. **Human Actionability**:
   - Every detected conflict is accompanied by a concrete suggested action and candidate list, empowering the operations manager to make informed trade-offs (e.g., approve overtime, request cross-pod floating support, or negotiate temporary client SLAs).

---

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?

- **Automated**:
  - Initial 30-day baseline schedule generation.
  - Public holiday and weekend operating calendar enforcement.
  - Real-time conflict, gap, and fatigue detection on every cell edit.
  - Multi-variable candidate scoring for replacement backups.
- **Human Control**:
  - Final approval and publishing workflow (Pod Lead sign-offs and Ops Manager release).
  - Ad-hoc shift swaps and custom shift notes via interactive cell clicks.
  - Authorization of emergency cross-pod backup reassignments.
- **Why**: In CX operations, client brand reputation and team morale require human empathy and situational context that algorithms cannot perceive (e.g., client escalation history, employee personal emergencies). Automation handles the computational heavy lifting in milliseconds, while human managers maintain governance and decision ownership.

---

### 7. If the company doubled its team and brand count (e.g., 60+ employees, 50+ brands), what would you change about your solution?

1. **Backend Persistence & API Architecture**:
   - Transition from browser `localStorage` to a scalable Node.js/Go backend with PostgreSQL (Prisma ORM) and Redis caching.
2. **Advanced Constraint Optimization Engine**:
   - Upgrade the client-side greedy heuristic to a dedicated **Mixed-Integer Linear Programming (MILP)** or constraint satisfaction engine (such as Google OR-Tools or Z3) executing asynchronously via worker queues.
3. **Virtualized Rendering**:
   - Implement `@tanstack/react-virtual` to virtualize table rows and columns, guaranteeing 60fps rendering across 100+ employees and 365 days.
4. **Fine-Grained Role-Based Access Control (RBAC)**:
   - Pod Leads can only view and edit their own pod's roster; Operations Managers possess global publish and cross-pod reassignment permissions.
5. **Real-Time Collaboration**:
   - WebSockets / CRDTs (yjs) enabling concurrent multi-manager editing without merge conflicts.

---

### 8. If you had one additional week to work on this, what would you improve first?

1. **Automated Peer Shift-Swapping Marketplace**:
   - Enable employees to request shift trades with colleagues directly. The system automatically validates that the swap does not violate skill requirements or rest rules before sending it to the pod lead for 1-click approval.
2. **Intra-Day Shift & Hours Granularity**:
   - Expand from daily binary shifts (`W`/`O`) to 8-hour shift windows (Morning, Afternoon, Night / 24x7 coverage) with overlap handoffs.
3. **Direct Ticketing Volume Ingestion**:
   - Integrate with Zendesk, Freshdesk, or Gorgias APIs to ingest historical ticket volumes and dynamically auto-scale `minStaff` for promotional sales and peak seasons.
4. **Calendar & Webhook Notifications**:
   - Bi-directional Google Calendar / Outlook iCal sync and automated Slack/Microsoft Teams notifications whenever published shifts change.

---

## 📂 Project Directory Structure

```
├── .env.example                     # Sample environment configuration
├── index.html                       # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
├── package.json                     # Dependencies: React 18, Vite, Lucide, Tailwind, Confetti
├── tailwind.config.js               # Theme configuration and responsive breakpoints
├── tsconfig.json                    # Project TypeScript configuration
├── src/
│   ├── types/
│   │   └── roster.ts                # Domain models: Pod, Employee, Brand, Process, Conflict, Backup
│   ├── data/
│   │   └── initialData.ts           # Realistic seed dataset (32 staff, 25 brands, 4 pods, 48 processes)
│   ├── utils/
│   │   └── calendarUtils.ts         # Calendar math, holidays, and operating calendar logic
│   ├── engine/
│   │   ├── rosterSolver.ts          # Deterministic heuristic CSP solver
│   │   ├── conflictDetector.ts      # Multi-rule gap, fatigue, and preference validator
│   │   └── backupSuggester.ts       # Cross-training & pod affinity backup ranking engine
│   ├── context/
│   │   └── RosterContext.tsx        # React Context, state persistence, CRUD, and action handlers
│   ├── components/
│   │   ├── Navbar.tsx               # Top navigation, view selector, action buttons, theme toggle
│   │   ├── StatsOverview.tsx        # Executive KPI cards (Coverage health %, Active Gaps, Sign-offs)
│   │   ├── views/
│   │   │   ├── CompanyView.tsx      # 30-day matrix heatmap with pod collapsibles & quick-edit
│   │   │   ├── PodView.tsx          # Pod lead cards, pod staffing, and pod sign-off review
│   │   │   ├── BrandView.tsx        # Client SLA rules, single vs multi-resource, daily health
│   │   │   ├── ProcessView.tsx      # Workstream capacity across CS, ACC, NDR, Retention
│   │   │   └── EmployeeView.tsx     # Personal monthly schedule, leave ledger, preference score
│   │   └── modals/
│   │       ├── ConflictDrawer.tsx   # Slide-over conflict inspector with 1-click backup fixes
│   │       ├── ChangeSimulatorModal.tsx # "What-if" test bench with prompt demonstration presets
│   │       ├── ManageDataModal.tsx  # Dynamic CRUD for employees, brands, processes, holidays
│   │       ├── ApprovalModal.tsx    # Pod lead review checklist & publish workflow with confetti
│   │       ├── ExportModal.tsx      # Export to CSV (Excel/Sheets) and JSON backup
│   │       └── CellEditModal.tsx    # Shift adjustment modal with live deficit warnings
│   ├── App.tsx                      # Root application component
│   └── main.tsx                     # React DOM entry point
```

---

## 🎥 Demonstration Video Walkthrough Script (3–5 Minutes)

For recording your demo video, follow this structured walkthrough:
1. **0:00 - 0:45 | Introduction & Overview**:
   - Highlight the 32 employees, 25 D2C brands, and 4 operational pods.
   - Show the 80% single-resource vs. 20% multi-resource distribution in the Brand View.
2. **0:45 - 1:45 | Roster Generation & Operating Calendars**:
   - Click **"Solve Roster"** to generate the optimal schedule.
   - Show how different client rules (365 days vs. Sunday/Holiday off) are respected while giving employees statutory rest cycles.
3. **1:45 - 2:45 | Conflict Detection & Intelligent Backup Recommendations**:
   - Open the **Active Gaps** drawer.
   - Inspect a gap and show how the backup recommender calculates match scores based on pod affinity, cross-training, and slack.
   - Click **"Assign"** to resolve the gap in real-time.
4. **2:45 - 3:45 | Handling Changes (Section 3.F Demonstration)**:
   - Click **"Simulate Change"**.
   - Load **Preset 1 (Single-Resource Brand Emergency)**: show the catastrophic gap on Zenvy Wellness and resolve it with 1-click backup.
   - Load **Preset 2 (Multi-Resource Redundancy Test)**: show how Opal & Ivy Jewels maintains coverage with 2 remaining agents.
5. **3:45 - 4:30 | Central Management & Approval Workflow**:
   - Open **Data Management** to show how new employees, brands, or rules can be added dynamically.
   - Open **Approvals**, review the 4 pod lead sign-offs, and click **"Publish Roster"** to celebrate!

## 📌 Project Assumptions

1. Every employee belongs to one operational pod.
2. Every brand has one or more assigned processes.
3. Each process has a minimum staffing requirement.
4. Employees can only cover processes for which they have the required skills.
5. Approved leaves and weekly rest days must be respected.
6. Employee preferences are considered after mandatory coverage requirements.
7. When available employees cannot satisfy coverage, the system reports a gap and suggests eligible backups.
8. The roster is generated for a monthly scheduling period.

## 📄 Submission Checklist
- [x] Working application tested with zero compilation errors (`npm run build`).
- [x] Realistic sample data with $\ge 30$ employees, 25 brands, 4 pods, and realistic operating calendars.
- [x] All 5 required stakeholder views (Company, Pod, Brand, Process, Employee) implemented and interactive.
- [x] Handling changes demonstrated (Single-resource vs. Multi-resource).
- [x] Dynamic management without modifying application code.
- [x] Export to CSV & JSON implemented.
- [x] `.env.example` file provided.
- [x] Comprehensive answers to all 8 questions in "Tell Us How You Think".
