# EC-07 : Reports — Deep Dive (UI + UX Reference)

> **Source**: ManageEngine Endpoint Central Help — `/products/desktop-central/help/reports/*`, `/help/user_logon_tracking/*`, `/help/inventory/viewing_inventory_reports.html`, plus GDPR/HIPAA compliance docs
> **Scope**: 9 report categories (User-defined, Active Directory, Security, SSP, Configuration, Task, Power Mgmt, USB, Inventory, User-Logon, MDM); Schedule Reports; Custom Reports (Wizard + Query); Custom Dashboards; PII Masking; Export Settings; Audit
> **Purpose**: Single source of truth for UI + UX design of the Reports module — covering 100+ canned reports, custom report authoring, scheduling pipeline, PII compliance controls, and dashboard composition

---

## 1. Module Overview

### 1.1 What this module is

**Reports** is the **read-only knowledge surface** of Endpoint Central. While every other module *configures* and *acts*, Reports *summarizes + audits + presents*. It's the single endpoint where:
- IT auditors download compliance reports
- Managers review weekly status
- Help-desk leads spot trends
- CISOs check security posture
- Compliance officers prove HIPAA / GDPR / SOX adherence

Mental model:

```
                ┌──────────────────────────────────────────────────────────────┐
                │  Every other module RECORDS data continuously                  │
                │  (Patch installs, Software deploys, Inventory scans,           │
                │   Remote sessions, USB plugs, User logons, Power events)       │
                └────────────────────────┬─────────────────────────────────────┘
                                         │
                                         ▼
                ┌──────────────────────────────────────────────────────────────┐
                │  REPORTS MODULE — turn data into deliverables                 │
                │                                                                │
                │  ┌─ CANNED (100+ pre-built)                                    │
                │  ├─ USER-DEFINED (custom + query + dashboards)                 │
                │  └─ ON-DEMAND vs SCHEDULED (email/URL delivery)                │
                │                                                                │
                │       │                                                        │
                │       ├── EXPORT — PDF / CSV / XLSX                             │
                │       └── PII MASKING — mask/remove/retain personal data        │
                └──────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
                ┌──────────────────────────────────────────────────────────────┐
                │  AUDIENCES                                                     │
                │   • IT admins (operational)                                    │
                │   • Auditors (compliance proof)                                │
                │   • Managers (executive summary)                               │
                │   • End users (rarely — only some self-service reports)        │
                └──────────────────────────────────────────────────────────────┘
```

### 1.2 Personas
- **Primary**: IT Administrator (daily user — runs canned reports, schedules weekly emails)
- **Secondary**: Compliance Officer / Auditor (consumer of PII-masked exports for HIPAA/GDPR/SOX evidence)
- **Tertiary**: Manager / CISO (consumer of executive dashboards + summary KPIs)
- **Quaternary**: Help-desk Technician (drills into specific computer/user logon history)
- **Power-user persona**: Data analyst writing Query Reports against EC database

### 1.3 Module signature

**Heaviest *data-display* module in Endpoint Central.** UX patterns:
- **Massive canned report catalog** (100+ pre-built) organized in a multi-level taxonomy
- **Wizard-based custom report builder** with formula columns + filters
- **SQL Query Report builder** for power users
- **Drag-drop dashboard composer** with up to 20 widgets per dashboard
- **Scheduling pipeline** with email/URL delivery
- **Compliance-grade PII control** layered on top of every export

The dominant tensions:
1. **Discoverability** of 100+ canned reports (search vs hierarchical navigation)
2. **Custom report power vs simplicity** (Wizard for most, Query for advanced)
3. **PII as default** vs **PII as choice** (admin trust vs compliance default)
4. **Schedule complexity** (frequency, recipients, format, size limits)
5. **Cloud vs On-prem report parity** (most parity, but some divergence)

### 1.4 OS coverage in reports

| Report category | Windows | Mac | Linux | Mobile (MDM) |
|---|---|---|---|---|
| Inventory | ✅ | ✅ | ✅ | ✅ |
| Patch Management | ✅ | ✅ | ✅ | — |
| Active Directory | ✅ | — | — | — |
| User Logon | ✅ | ✅ | ✅ | — |
| Configuration | ✅ | ✅ | ✅ | — |
| Power Management | ✅ | ✅ | ✅ | — |
| USB Audit | ✅ | ❌ | ❌ | — |
| Software Deployment | ✅ | ✅ | ✅ | ✅ (MAM) |
| Security (App Control / BitLocker / etc.) | ✅ | partial | ❌ | — |
| MDM Reports | — | — | — | ✅ |

### 1.5 Cloud vs On-prem caveats

| | Cloud | On-prem |
|---|---|---|
| Most canned reports | ✅ | ✅ |
| Custom Reports (Wizard) | ✅ | ✅ |
| Query Reports (SQL) | ✅ | ✅ |
| Custom Dashboards | ✅ (UEM/Security Edition) | ✅ (UEM/Security Edition) |
| Schedule Reports | ✅ | ✅ |
| PII Masking | ✅ | ✅ |
| Active Directory Reports | ✅ | ✅ |
| User Logon Reports | ✅ | ✅ |
| Power Management Reports | ✅ | ✅ |
| USB Reports | ✅ | ✅ |

> **UX ask**: Edition gating is most visible for **Custom Dashboards** — UEM Edition or Security Edition only. Lower editions should see the option but with "Upgrade to unlock" message.

---

## 2. Concepts & Vocabulary

| Term | Definition | UI/UX treatment |
|---|---|---|
| **Canned Report** | Pre-built report shipped with EC (100+) | Discoverable via category navigation + search |
| **User-defined Report** | Admin-built custom report | Lives in "Custom Reports" + "Query Reports" + "Custom Dashboards" sections |
| **Custom Report** | Wizard-built; Table OR Chart type | Reusable, schedulable (Table only) |
| **Query Report** | SQL-based custom report | Power-user feature; needs DB knowledge |
| **Custom Dashboard** | Composed view of multiple custom reports as widgets | UEM/Security edition; up to 20 widgets |
| **Scheduled Report** | A canned/custom report set to auto-generate and email/URL deliver at a frequency | Lives in Schedule Reports section |
| **Formula Column** | Rule-based derived column in Custom Report | Per-technician, per-sub-module scope |
| **Derived Value** | Output label of a Formula Column condition | Up to 5 per formula column; 30 criteria total |
| **Sub Module** | Custom Report scope: Computer / Hardware / Software | Drives available columns + filters |
| **Group By** | Custom Report grouping field | Determines row organization |
| **Filter Condition** | Custom Report criteria with criteria pattern (AND/OR logic) | Multi-condition with pattern editor |
| **PII (Personally Identifiable Information)** | Data that identifies an individual | 7 fields explicitly listed by EC |
| **PII Mask** | Replace PII with `*` or anonymized value | Mode option |
| **PII Remove** | Strip PII column entirely from export | Mode option |
| **PII Retain** | Keep PII as-is | Mode option |
| **Technician Decides** | Per-export PII choice prompt for the running technician | Mode option |
| **Export Format** | PDF / CSV / XLSX | Picker per export |
| **Delivery Format** | Attachment / Zipped file / URL | Email delivery mode |
| **Size Limit** | Mail server message size cap | Triggers URL delivery when exceeded |
| **AD Report Scheduler** | Schedules AD report data sync interval | Per-domain configuration |
| **User Logon Reports** | Tracks who logged in where/when, computers without logons | Agent-based, requires SoM |
| **Logon History Retention** | Days to retain user logon history | Configurable |
| **System Uptime Report** | Per-device hours running — used for utility rebate claims | Power Management category |
| **USB Audit** | Audit log of USB device plugs | Win-only, configurable retention |
| **Action Log Viewer** | Admin > Audit > Action Log — consolidated audit trail across modules | Cross-module audit |
| **Report Settings** | Admin-level config for logon/power/AD report schedulers + retention | Admin section |
| **Export Settings** | Admin-level config for default PII behavior + format defaults | Admin section |
| **Dashboard Status** | Active / Error state | Reflects validity of underlying reports |

### 2.1 Critical concept: PII fields explicitly cataloged

EC lists **7 fields** as PII for masking/removal:

1. **Computer Name**
2. **Domain Name**
3. **UserName**
4. **Email Address**
5. **Mobile Number**
6. **IP Address**
7. **Address**

These are the universally-treated PII fields. Configuration applies wherever they appear across canned + custom reports.

### 2.2 Critical concept: 4 PII handling modes

```
Mask     → Computer "DESKTOP-AB12CD" becomes "DESKTOP-****"
Remove   → Entire column dropped from output
Retain   → Original values kept (default for trusted admin scenarios)
Let technician decide → Prompt the running technician at export time
```

> **UX ask**: Default to **Mask** at install, with a one-click "I trust my technicians — Retain" override. Show the active mode prominently in every export confirmation dialog so admin knows what's leaving the building.

### 2.3 Critical concept: 3 delivery formats for scheduled reports

| Delivery | When to use | Notes |
|---|---|---|
| **Attachment** | Small report, mail-friendly | Direct email attachment |
| **Zipped file** | Multiple selected reports | Bundled zip |
| **URL** | Report too large for mail server limit | Published on Central Server; recipient gets code+URL to download |

> **UX ask**: Don't make admin choose — auto-pick based on size with a "smart delivery" toggle. Show preview: *"Estimated size 12 MB → will be sent as Zipped file"* or *"Estimated 250 MB → will be delivered as download URL (your mail limit: 25 MB)."*

---

## 3. Navigation & IA — Reports Tab

### 3.1 Top-level Reports tab (9 main categories + sub-categories)

```
REPORTS (tab)
├── Dashboard / Reports Home (cards summarizing each category, recent reports)
│
├── User-defined Reports                  ← Author your own
│   ├── Custom Reports
│   │   ├── Wizard-based (Table / Chart)
│   │   └── Formula Columns
│   ├── Query Reports (SQL)
│   └── Custom Dashboards (UEM/Security edition)
│
├── Active Directory Reports              ← 100+ AD reports
│   ├── User Reports
│   │   ├── General User Reports
│   │   └── Account Status Reports (Active / Inactive / Disabled / Locked / Expired)
│   ├── Computer Reports
│   ├── Group Reports
│   ├── OU Reports
│   ├── Domain Reports
│   ├── GPO Reports
│   └── Server Reports (Windows servers / Member servers / Domain controllers)
│
├── Security Reports
│   ├── Application Control Reports
│   ├── BitLocker Reports
│   ├── Browser Reports
│   ├── Device Control Reports
│   ├── Vulnerability Reports
│   ├── Vulnerable Patches Reports
│   ├── Patch Reports
│   └── Supported Patches Reports
│
├── Self-Service Portal Reports           ← SSP usage + ROI
│
├── Configuration Reports                 ← Cross-module config status
│
├── Task Reports                          ← Patch / Deploy task statuses
│
├── Power Management Reports              ← Uptime, power events
│   └── System Uptime Report (utility rebate claims!)
│
├── USB Reports                           ← USB audit + usage
│
├── Inventory Reports                     ← (cross-link to EC-03)
│
├── User Log-on Reports                   ← General / Usage / History
│
├── MDM Reports                           ← Mobile device reports
│
├── Schedule Reports                      ← Recurring email delivery
│   ├── List of scheduled reports
│   ├── Add Schedule Report
│   └── Execute Now action
│
└── Settings
    ├── Report Settings
    │   ├── AD Reports Settings (scheduler + domains)
    │   ├── User Logon Settings (retention days)
    │   ├── Power Management Settings
    │   └── USB Audit Settings (retention + alerts)
    └── Export Settings
        ├── Default PII Mode (Mask / Remove / Retain / Let technician decide)
        ├── Default Format (PDF / CSV / XLSX)
        └── Default Delivery (Attachment / Zipped / URL)
```

### 3.2 Cross-module entry points

- **Inventory module → Inventory Reports** — same data, different surface
- **Patch Management → Patch Reports** — deep-link from CVE detail
- **Software Deployment → SSP Reports** — ROI tracking
- **Configuration module → Configuration Reports**
- **Admin → Audit → Action Log Viewer** — cross-module audit (separate from Reports tab)
- **DEX module → Dashboards** — Custom Dashboards from Reports surface here too

### 3.3 IA tension: where do "X Reports" live?

Many modules have their own "Reports" sub-tab AND the Reports module aggregates them. Example: Patch Reports lives under:
1. Patch Management → Patch Reports (in-module)
2. Reports → Security Reports → Patch Reports (in Reports tab)

> **UX ask**: Pick one as the source of truth. Consolidated approach: in-module shows "key 3-5 reports" with "View all in Reports tab" link; Reports tab is full catalog. Don't duplicate the full surface in both places.

---

## 4. Sub-Features — Deep Dive

### 4.1 Canned Reports (100+ pre-built)

EC ships with **over 100 pre-built reports** covering everything from patch compliance to hardware inventory to AD anomalies. These are the daily-driver reports.

#### 4.1.1 Discoverability challenge

100+ reports = needle-in-haystack problem.

**UX patterns required**:
- **Category navigation** (left sidebar with 9 categories + sub-categories)
- **Search by report name** (autocomplete + fuzzy match)
- **"Popular reports" / "Recently viewed"** quick access
- **Tag-based filtering** (compliance / inventory / security / audit)
- **Favorites / Bookmarks** per user
- **"Suggested reports"** based on user role / recent module activity

> **UX ask**: Build a "Reports starter pack" landing page for first-time users: "If you're an auditor, start with these 5. If you're an IT manager, start with these 5." Reduces overwhelm.

#### 4.1.2 Common report viewing pattern

```
Click Report from category nav OR search
        │
        ▼
Filter panel appears (left or top)
   ├── Date range
   ├── Computer / User selection
   ├── Custom Group filter
   ├── Remote Office filter
   └── Module-specific filters
        │
        ▼
Apply filters → table renders with data
        │
        ▼
Actions:
   ├── Sort columns
   ├── Search within table
   ├── Show/hide columns
   ├── Pagination
   ├── Drill-down (click row → detail view)
   ├── Export (PDF / CSV / XLSX)
   ├── Schedule (set up recurring delivery)
   └── Share URL (deep-link to filtered view)
```

> **UX ask**: Standardize the table-report pattern across all 100+ reports. Same filter panel position, same export button location, same drill-down behavior. Don't reinvent per-report.

---

### 4.2 Schedule Reports

Path: `Reports > Schedule Reports > Add Schedule Report`

#### 4.2.1 Purpose
- Auto-deliver routine reports without manual export
- Weekly / monthly compliance reports to auditors
- Daily ops summary to manager
- Recipients don't need EC console access

#### 4.2.2 Full workflow

```
Reports > Schedule Reports > Add Schedule Report
        │
        ▼
1. Scheduler Identity
   ├── Scheduler Name
   └── Description
        │
        ▼
2. Select Reports
   ├── Pick from canned reports OR custom (Table-based only — Charts can't schedule)
   ├── Pick from query reports
   └── Multi-select allowed
        │
        ▼
3. Report Format
   ◯ PDF
   ◯ CSV
   ◯ XLSX
        │
        ▼
4. Delivery Format
   ◯ Send each report as Attachment
   ◯ Send as Zipped file
   ◯ Send as URL (if size exceeds limit)
        │
        ▼
5. Size Limit Configuration
   ├── Specify max attachment size
   └── If total exceeds limit → auto-falls back to URL delivery
        │
        ▼
6. Recipients
   ├── Email IDs (comma-separated)
   └── Multiple supported
        │
        ▼
7. Scheduler
   ├── Frequency: Daily / Weekly / Monthly / Custom
   ├── Time of day
   └── Day of week / Day of month (per frequency)
        │
        ▼
8. Configure Export Settings (PII!)
   ├── Mask PII
   ├── Remove PII
   ├── Retain PII
   └── Let technician decide
        │
        ▼
Save
        │
        ▼
Scheduler entry appears in list
   ├── [Execute Now] — generate immediately (in addition to scheduled time)
   ├── [Modify] — edit scheduler
   ├── [Suspend] — pause without deleting
   └── [Delete] — remove
```

#### 4.2.3 URL delivery deep-dive

When total report size exceeds the mail server's permissible size:
- Endpoint Central publishes reports on the Central Server
- A **code mapped to the file path** + **download URL** are sent via email
- Recipient enters the code → downloads the report securely

> **UX ask**: Show recipients a friendly URL landing page when they click the link: branded with the org logo, with a clear "Enter code to download" step and a code-paste field. Don't redirect to a raw download.

#### 4.2.4 Failure scenarios + remediation

| Failure | Cause | UX response |
|---|---|---|
| Email bounced | Wrong recipient address | Notification to scheduler creator |
| Mail server rejected — too large | Size exceeded limit + URL fallback failed | Notify with fallback URL link |
| Report data missing | Source data deleted / module disabled | Skip with note in log |
| Scheduler not running | Server downtime | Catch-up run on resume |
| Recipient can't access URL | URL expired / code wrong | Re-send with new code |

> **UX ask**: Show "Last run status" per scheduler with timestamp + delivery confirmation. Bell icon for failures.

---

### 4.3 Custom Reports — Wizard-based

Path: `Reports > User-defined Reports > Custom Reports > New Custom Report`

#### 4.3.1 Why custom reports
100+ canned reports cover 80% of needs. Custom reports for the remaining 20%:
- Slice data by org-specific dimensions
- Combine fields across canned reports
- Apply complex filter logic
- Build executive-friendly visualizations

#### 4.3.2 Two custom report types

##### 4.3.2.1 Table-based Custom Report

```
New Custom Report > Type: Table
        │
        ▼
1. Name
2. Sub Module
   ├── Computer
   ├── Hardware
   └── Software
        │
        ▼
3. Type: Table
        │
        ▼
4. Select Columns
   ├── From available columns for that Sub Module
   ├── Drag-drop to reorder
   └── Add Formula Columns (optional)
        │
        ▼
5. Group By
   ├── Select column(s) to group by
   └── Grouped columns appear at start of report; rows organized by group
        │
        ▼
6. Filter Tab
   ├── Add Filter Condition (multiple supported)
   ├── Criteria Pattern editor (AND/OR logic, parentheses)
   │   Click pencil icon to customize pattern: "(1 AND 2) OR (3 AND 4)"
        │
        ▼
7. Preview Table
   ├── Live preview of matching devices
   └── Verify before saving
        │
        ▼
Save
```

> **UX ask**: Show real-time row count in preview: *"Matching 1,247 of 5,000 computers"*. Helps admin validate filters didn't accidentally narrow to zero.

##### 4.3.2.2 Chart-based Custom Report

```
New Custom Report > Type: Chart
        │
        ▼
1. Name
2. Sub Module (Computer / Hardware / Software)
        │
        ▼
3. Chart Type (7 supported):
   ◯ Bar
   ◯ Line
   ◯ Area
   ◯ Pie
   ◯ Dial
   ◯ Pyramid
   ◯ Funnel
        │
        ▼
4. X-axis column
        │
        ▼
5. Y-axis column
        │
        ▼
6. Preview Chart
        │
        ▼
Save
```

⚠️ **Chart-based limitations**:
- **Cannot be scheduled** (only Table-based)
- **Cannot be exported** (display-only)

> **UX ask**: Show these limitations upfront when admin selects Chart type. Avoid surprise later: *"Charts are for dashboards only — won't be schedulable or exportable. For exports, choose Table."*

#### 4.3.3 Formula Columns

##### Purpose
Create derived columns with rule-based logic. Example use cases:
- Classify computers by naming convention (e.g. "ADF-*" → "Finance Dept")
- Bucket devices by domain
- Apply multi-condition labels (legacy / current / unsupported)

##### Configuration

```
While selecting columns > Add Formula Columns
        │
        ▼
1. Formula Column Name
        │
        ▼
2. Define Derived Values (up to 5)
   For each derived value:
   ├── Derived Value Name (label, e.g. "ADF_Computers")
   ├── Criteria to match (e.g. Computer Name starts with "ADF")
   └── Multiple criteria possible
        │
        ▼
3. Total criteria across all derived values: max 30
        │
        ▼
4. Name for Unmatched Value
   ├── Label for records not matching any criteria
   └── (e.g. "Other_Computers" or "Unclassified")
        │
        ▼
Save → formula column appears in column picker
```

##### Scope limitations
- **Per-technician scope**: Formula columns created by Tech A NOT visible to Tech B
- **Per-sub-module scope**: Formula column in Computer sub-module NOT available in Hardware sub-module

> **UX ask**: When a tech tries to share a custom report containing formula columns with another tech, surface this clearly: *"This report uses formula columns visible only to you. To share, [user] would need to recreate them."*

#### 4.3.4 Custom Report lifecycle

| Action | Effect |
|---|---|
| Edit | Modify the report; existing scheduled reports use updated version |
| Export | PDF / XLSX / CSV with PII mask/remove/retain choice |
| Schedule | Add to Scheduled Reports (Table-based only) |
| Delete | Remove permanently (linked dashboards auto-handled) |
| Duplicate | Clone as new |

---

### 4.4 Query Reports (SQL-based)

Path: `Reports > User-defined Reports > Query Report`

#### 4.4.1 When to use
When Canned + Custom Reports can't get you what you need — you write SQL directly against the EC database.

> **UX ask**: This is a power-user feature. Hide behind an explicit "Advanced" toggle so casual admins don't accidentally land here.

#### 4.4.2 Getting a query

EC docs explicitly say: *"Contact endpointcentral-support@manageengine.com with the details of your requirement"*. Or submit request online via the Custom Query Request form.

> **UX ask**: In-app "Ask EC team for a custom query" button that pre-fills the support request form with the admin's identifying info. Faster turnaround than email.

#### 4.4.3 Two built-in date functions

Date is stored in EC database as a **long integer** (epoch-style). Two helper functions:

##### LONG_TO_DATE() — display long as date

```sql
-- Without helper:
SELECT SOFTWARE_NAME, DETECTED_TIME FROM invsoftware
-- Returns: 1234558984892 (unreadable)

-- With helper:
SELECT SOFTWARE_NAME, LONG_TO_DATE(DETECTED_TIME) FROM invsoftware
-- Returns: 09/12/2009 15:35 (readable)
```

##### DATE_TO_LONG() — use date in WHERE clauses

```sql
SELECT * FROM invsoftware 
WHERE DETECTED_TIME BETWEEN 
    DATE_TO_LONG(08/01/2009 00:00:00) AND 
    DATE_TO_LONG(08/31/2009 00:00:00)
```

Date format: `mm/dd/yyyy hh:mm:ss`

#### 4.4.4 8 Date Templates (saves admin from typing dates)

| Template | Range |
|---|---|
| `<from_today>` - `<to_today>` | Today |
| `<from_yesterday>` - `<to_yesterday>` | Yesterday |
| `<from_thisweek>` - `<to_thisweek>` | This week |
| `<from_lastweek>` - `<to_lastweek>` | Last week |
| `<from_thismonth>` - `<to_thismonth>` | This month |
| `<from_lastmonth>` - `<to_lastmonth>` | Last month |
| `<from_thisquarter>` - `<to_thisquarter>` | This quarter |
| `<from_lastquarter>` - `<to_lastquarter>` | Last quarter |

These tokens get substituted at runtime — perfect for scheduled queries.

#### 4.4.5 Query Report builder UX

```
Reports > User-defined > Query Report > Add New Query
        │
        ▼
1. Query Name
2. Description
3. SQL Query input (large text area with syntax hint)
4. Date helper insert buttons (click → inserts <from_today> at cursor)
5. Validate (test query without saving)
6. Run (execute + show results in table)
7. Save (for future reuse)
8. Export (CSV — primary format for query results)
```

> **UX ask**: SQL editor with:
> - Syntax highlighting
> - Schema-aware autocomplete (table + column names)
> - Date function autocomplete + template insertion
> - "Try sample queries" pre-loaded library
> - Read-only DB connection (no destructive SQL allowed — only SELECT)

#### 4.4.6 Schema risks
- Admins writing arbitrary SQL = risk of bad queries that lock tables
- EC mitigates: read-only access + query timeout

> **UX ask**: Add query timeout warning before save: *"Long-running queries may impact server performance. Estimated runtime: [auto-detect]. Maximum allowed: 60 seconds."*

---

### 4.5 Custom Dashboards

Path: `Reports > Custom Dashboards > Create Dashboard`

⚠️ **Available only for UEM Edition or Security Edition**

#### 4.5.1 Purpose
Compose multiple custom reports into a single visual dashboard. Use cases:
- Executive weekly summary
- Operational health overview
- Compliance posture snapshot

#### 4.5.2 Prerequisite
Must have **at least one Custom Report** created — Dashboards consume custom reports as widgets.

#### 4.5.3 Workflow

```
Reports > Custom Dashboards > Create Dashboard
        │
        ▼
1. Dashboard Name
2. Description
        │
        ▼
3. Drag-drop custom reports into layout
   ├── Up to 20 reports per dashboard
   └── Reports become "widgets"
        │
        ▼
4. Resize + rearrange widgets
   ├── Grid layout with snap-to-grid
   └── Resize handles per widget
        │
        ▼
5. Save → published
        │
        ▼
Dashboard appears in list + accessible via DEX > Dashboards too
```

#### 4.5.4 Dashboard Status states

| State | When |
|---|---|
| **Active** | All associated custom reports valid + available |
| **Error** | A custom report's formula column was deleted (report becomes invalid) → dashboard goes to Error |

#### 4.5.5 Handling deleted custom reports

| Scenario | Behavior |
|---|---|
| Custom report used in dashboard is deleted | Dashboard auto-removes that report widget; stays Active |
| Dashboard's ONLY custom report is deleted | Dashboard auto-deletes itself |

> **UX ask**: When a custom report is about to be deleted, surface impact preview: *"This report is used in 3 dashboards: [list]. Deleting will remove the widget from those dashboards. Dashboard X will auto-delete (only widget)."*

#### 4.5.6 DEX integration

Custom Dashboards from Reports module are also visible in **DEX module → Dashboards**. DEX adds:
- Custom Dashboards using Custom Reports (same as Reports)
- **Custom Dashboards using DEX Extensions** — predefined templates (e.g., "Sustainable IT Dashboard", "Windows 11 Readiness Dashboards")

> **UX ask**: Cross-link clearly. Dashboard created in Reports → "View in DEX" button. Dashboard from DEX Extensions → indicate it's NOT editable from Reports surface.

---

### 4.6 Active Directory Reports (100+ AD reports)

Path: `Reports > Active Directory Reports`

#### 4.6.1 Overview
Endpoint Central provides **100+ out-of-the-box AD reports**. Script-free; works on Active Directory infrastructure.

#### 4.6.2 Category hierarchy

```
Active Directory Reports
├── User Reports
│   ├── General User Reports (all users + creation time + contact + last login)
│   └── Account Status Reports
│       ├── Active user accounts (logged in past 30/60/90/180 days)
│       ├── Inactive user accounts
│       ├── Disabled user accounts (userAccountControl AD attribute)
│       ├── Locked user accounts (lockoutTime AD attribute)
│       └── Expired user accounts (accountExpires AD attribute)
│
├── Computer Reports
│
├── Group Reports
│
├── OU (Organizational Unit) Reports
│
├── Domain Reports
│
├── GPO Reports
│
└── Server Reports
    ├── Windows Servers
    ├── Member Servers
    └── Domain Controllers
```

#### 4.6.3 Configuration: AD Reports Settings

Path: `Admin > Reports Settings > AD Reports Settings`

```
☑ Enable AD Report Scheduler
Select Domains for which reports should be generated
   (If no domains selected → scheduler is disabled)
Schedule update interval (e.g., daily, weekly)
        │
        ▼
Save → AD data syncs on schedule for fresh reports
```

#### 4.6.4 Active vs Inactive logic — non-obvious

The active/inactive classification uses the AD `lastLogon` attribute. Filter by past 30/60/90/180 days. Custom thresholds may need Query Report.

#### 4.6.5 Locked vs Disabled — different attributes

| Status | AD Attribute | Recovery |
|---|---|---|
| **Locked** | `lockoutTime` | Auto-unlocks after Account Lockout Policy duration |
| **Disabled** | `userAccountControl` | Admin must manually re-enable |
| **Expired** | `accountExpires` | Admin must extend expiry |

> **UX ask**: Differentiate these in the UI clearly — they're often conflated. Locked = temporary, auto-recovers. Disabled = permanent (admin intent). Expired = scheduled.

---

### 4.7 User Logon Reports

Path: `Reports > User Logon Reports`

#### 4.7.1 Prerequisites
1. **Scope of Management** must include the target computers
2. Agent must be installed
3. **Admin > Reports Settings > User Logon Settings**: enable User Logon Reports + specify retention days

#### 4.7.2 Three sub-categories

##### 4.7.2.1 General Reports
- Per-user logon details (logon time, computer, domain controller)
- Per-computer logon history
- Logon/logoff timestamps

##### 4.7.2.2 Usage Reports
**Six predefined reports**:
1. Users frequently logged on to the domain (avg user logon > 1.5x normal)
2. Users rarely logged on to the domain
3. Inactive users
4. Computers with frequent user logon
5. Computers with rare user logon
6. Computers with no user logon (potential dead assets)

##### 4.7.2.3 History Reports
- Detailed timeline of user sessions per computer / per user

#### 4.7.3 Configuration

Path: `Admin > Reports Settings > User Logon Settings`

```
☑ Enable User Logon Reports
History retention: [____ days]
   (How long to keep logon history before purging)
Save Changes
```

> **UX ask**: User logon data is PII-sensitive. Default retention to compliance-friendly value (e.g., 90 days), with a "extend retention" override that triggers a compliance disclaimer modal.

---

### 4.8 Power Management Reports

Path: `Reports > Power Management Reports`

#### 4.8.1 Headline report: System Uptime
**The killer report**: System Uptime is used for **utility rebate claims** in some regions (US, EU). Organizations claim energy savings rebates by proving they shut down machines after hours.

#### 4.8.2 Report scope
- Per-computer uptime hours
- Aggregated org-wide energy consumption (kWh estimation)
- Power events: shutdown, restart, sleep, wake
- Idle time tracking

#### 4.8.3 Use cases
- **Utility rebate claims** — submit to power company
- **Sustainability reporting** — ESG metrics
- **Asset utilization** — find under-used machines
- **Capacity planning** — peak hours analysis

> **UX ask**: For utility rebate use case, provide a "Generate Utility Rebate Pack" CTA that bundles: Uptime Report + Power Savings Estimate + Methodology Statement (HOW EC calculates) as a single PDF ready for submission.

---

### 4.9 Configuration Reports

Path: `Reports > Configuration Reports`

#### 4.9.1 What it tracks
Status of all configurations deployed across the fleet:
- Patch Management configurations
- Software Deployment configurations
- Configuration module (Windows / Mac / Linux configs)
- Per-target apply success/fail status

#### 4.9.2 Common queries answered
- "Which machines failed my latest patch deployment?"
- "Show all Configurations in error state"
- "Per-Custom-Group configuration compliance"

---

### 4.10 USB Reports

Path: `Reports > USB Reports` (also called Other Reports > USB usage reports)

⚠️ **Windows only**.

#### 4.10.1 Two functional areas

##### USB Audit Settings (data collection)

Path: `Admin > Configurations Settings > USB Audit Settings > Audit Settings`

```
☑ Enable USB Audit Settings
Specify number of days to maintain USB usage history: [___ days]
Specify how often the report should be generated
Save Changes
```

##### USB Alert Settings (real-time blocking notification)

Path: `Admin > Configurations Settings > USB Audit Settings > Alert Settings`

```
☑ Enable USB Audit Settings (for alerts)
Title of message box: [text]
Message body: [text — shown to user when restricted USB plugged]
Display options:
   ◯ Just once when user tries restricted USB
   ◯ Every time user proceeds to use restricted USB
```

#### 4.10.2 USB usage reports
- Per-device USB plug log (date, time, device VID/PID, computer, user)
- Per-user USB usage history
- Restricted USB attempt log
- Approved USB usage log

#### 4.10.3 Cross-link to EC-18 Device Control
USB Audit is a *read-only* layer. **EC-18 Device Control** is the *enforcement* layer that decides which USB is allowed/blocked. UI should cross-link bi-directionally.

---

### 4.11 Inventory Reports

Path: `Reports > Inventory Reports` (also accessible from Inventory module)

This is mostly a thin wrapper over the EC-03 Inventory Reports — full deep dive in EC-03. Key reports:
- Hardware Inventory
- Software Inventory
- Software Compliance
- Prohibited Software detected
- Software metering reports
- Custom field reports
- Warranty Expiry reports

---

### 4.12 Security Reports

Path: `Reports > Security Reports`

#### 4.12.1 Sub-categories

1. **Application Control Reports** (EC-16) — Audit vs Strict mode actions
2. **BitLocker Reports** (EC-14) — Encryption status, recovery key access
3. **Browser Reports** (EC-15) — Browser security policy compliance
4. **Device Control Reports** (EC-18) — USB/peripheral control logs
5. **Vulnerability Reports** (EC-02) — CVE exposure
6. **Vulnerable Patches Reports** — patches that fix known CVEs
7. **Patch Reports** (EC-01) — patch deployment status
8. **Supported Patches Reports** — vendor support timelines

> Each cross-links to its source module's deep dive.

---

### 4.13 Self-Service Portal Reports

Path: `Reports > Self-Service Portal Reports`

#### 4.13.1 Purpose
Track SSP usage + calculate ROI of self-service software installs (vs. manual deploys).

#### 4.13.2 Key reports
- Per-package install count
- Average install time
- Tickets avoided (ROI)
- Top user / top app

Configure ROI Settings (baseline cost per manual deploy) under `Software Deployment > Settings > SSP Settings > ROI Settings`. See EC-04 for deep dive.

---

### 4.14 Task Reports

Path: `Reports > Task Reports`

#### 4.14.1 Scope
- Patch task status
- Configuration task status
- Software deployment task status
- OS deployment task status
- Per-task per-target drill-down

> Essentially a unified status feed across all "task-creating" modules.

---

### 4.15 MDM Reports

Path: `Reports > MDM Reports`

#### 4.15.1 Mobile-specific reports
- Device enrollment status (iOS / Android / tvOS / ChromeOS)
- App distribution status (MAM)
- Compliance status (passcode / encryption / jailbreak)
- Geo-fence alerts (EC-11)
- Lost / wiped devices

> Deep dive in MDM-specific module docs.

---

### 4.16 Export Settings (org-wide PII control)

Path: `Admin > Reports Settings > Export Settings` (also accessible from any export action)

#### 4.16.1 Configuration

```
Default Export Format:
   ◯ PDF
   ◯ CSV
   ◯ XLSX

Default Delivery Method (for Scheduled):
   ◯ Attachment
   ◯ Zipped
   ◯ URL

PII Handling (applies to all 7 PII fields):
   ◯ Mask    — replace with anonymized values
   ◯ Remove  — strip PII columns entirely
   ◯ Retain  — keep PII as-is
   ◯ Let technician decide — prompt at export time

PII Fields covered (read-only display):
   • Computer Name
   • Domain Name
   • UserName
   • Email Address
   • Mobile Number
   • IP Address
   • Address
```

> **UX ask**: Show the 7 PII fields as a visible list with current handling per field. Allow per-field overrides if needed: *"Mask UserName but Retain Computer Name"* — for nuanced compliance scenarios.

#### 4.16.2 HIPAA / GDPR positioning

EC's marketing positions PII masking as a **HIPAA + GDPR compliance feature**:
- HIPAA: protect patient health information when generating reports for audit
- GDPR: provide users right to anonymization in shared reports
- SOX: prove only authorized data leaves the system

> **UX ask**: When an admin selects "Retain" globally, surface a compliance warning: *"Retaining PII may not meet GDPR Article 17 (Right to Erasure) requirements when reports are shared externally. Consider Mask or Remove for shared reports."* Don't block — just inform.

---

## 5. Field-Level Inventory — Records & Settings

### 5.1 Custom Report record

- Report ID / Name / Description
- Type (Table / Chart)
- Sub Module (Computer / Hardware / Software)
- Selected columns (ordered list)
- Formula columns (per-tech, per-sub-module)
- Group By columns
- Filter conditions (with criteria pattern)
- Chart type (if Chart)
- X-axis column (if Chart)
- Y-axis column (if Chart)
- Created by / Created date / Last modified
- Schedule association (if scheduled)
- Dashboard association (if used in dashboards)

### 5.2 Query Report record

- Query ID / Name / Description
- SQL text
- Date function uses (LONG_TO_DATE / DATE_TO_LONG references)
- Date template tokens used
- Created by
- Validated date
- Last run date / last run duration
- Export format

### 5.3 Custom Dashboard record

- Dashboard ID / Name / Description
- Edition required (UEM / Security)
- Widget list (up to 20 custom reports, with size + position)
- Status (Active / Error)
- Created by / Created date
- DEX visible (bool)

### 5.4 Scheduled Report record

- Scheduler ID / Name / Description
- Reports included (canned + custom + query)
- Format (PDF / CSV / XLSX)
- Delivery (Attachment / Zipped / URL)
- Size limit
- Recipients (email list)
- Frequency (Daily / Weekly / Monthly / Custom)
- Schedule time
- Next run / Last run
- Last run status (Success / Failed)
- PII mode for this scheduler (overrides org default)

### 5.5 Export Settings (org config)

- Default format
- Default delivery
- PII mode (4 options)
- Per-field PII override (if supported)
- Size limit default

### 5.6 AD Reports Settings

- Scheduler enabled (bool)
- Domains selected (list)
- Update interval (frequency)

### 5.7 User Logon Settings

- Enabled (bool)
- History retention (days)
- Computers in scope (via SoM)

### 5.8 USB Audit Settings

- Audit enabled (bool)
- History retention (days)
- Report frequency
- Alert enabled (bool)
- Alert title / message
- Display mode (Once / Every time)

---

## 6. Workflows — Common admin journeys

### W1. Weekly compliance email to auditors
```
1. Reports > Schedule Reports > Add Schedule Report
2. Name: "Weekly Compliance Pack for Auditors"
3. Select reports: Patch Compliance + Vulnerability Summary + BitLocker Status
4. Format: PDF (presentation-friendly)
5. Delivery: Zipped file
6. Recipients: auditor1@firm.com, auditor2@firm.com, compliance-officer@corp.com
7. Schedule: Weekly Monday 8 AM
8. PII: Mask (auditors don't need real user names)
9. Save
10. Auditors receive zipped PDFs every Monday morning
```

### W2. Custom report for HR — laptops by department
```
1. Reports > Custom Reports > New Custom Report
2. Name: "Laptops by Department (HR view)"
3. Sub Module: Computer
4. Type: Table
5. Columns: Computer Name, User, OU, Department (formula), Last Logon Date
6. Formula Column "Department":
   - Derived value "Finance" if OU contains "Finance"
   - Derived value "HR" if OU contains "HR"
   - Derived value "Engineering" if OU contains "Eng"
   - Unmatched: "Other"
7. Group By: Department
8. Filter: Last Logon < 90 days (active only)
9. Preview Table → 1,247 computers across 4 departments
10. Save
11. Schedule monthly delivery to HR director
```

### W3. SQL query for unusual software
```
1. Reports > User-defined > Query Report > Add New
2. Name: "Computers with crypto-miner detection"
3. SQL:
     SELECT COMPUTER_NAME, LONG_TO_DATE(DETECTED_TIME), SOFTWARE_NAME
     FROM invsoftware
     WHERE SOFTWARE_NAME LIKE '%miner%' OR SOFTWARE_NAME LIKE '%crypto%'
       AND DETECTED_TIME > DATE_TO_LONG(01/01/2026 00:00:00)
4. Validate → no syntax errors
5. Run → 12 computers flagged
6. Save → schedule daily delivery to security team
```

### W4. Executive dashboard composition
```
1. (Prerequisite) Build 4 Custom Reports:
   - "Top 10 Vulnerable Computers"
   - "Patch Deployment Trend (last 30 days)"
   - "Software License Compliance"
   - "Mobile Device Enrollment Status"
2. Reports > Custom Dashboards > Create Dashboard
3. Name: "Executive Weekly Summary"
4. Drag all 4 reports into layout
5. Resize: Top-left big tile (Vulnerability) + 3 smaller tiles
6. Save
7. Verify CEO can access (RBAC permitting)
```

### W5. PII-compliant export for third-party audit
```
1. Admin > Reports Settings > Export Settings
2. PII Handling: Mask (default)
3. Save
4. Auditor requests Patch Compliance Report → export PDF
5. EC auto-masks Computer Name (DESKTOP-A***-***) + UserName (J***)
6. PDF delivered → auditor sees compliance without identifying individuals
7. (For internal use, export with PII: Retain — admin one-time override)
```

### W6. AD audit — find stale accounts
```
1. Reports > AD Reports > User Reports > Account Status Reports
2. Click "Inactive User Accounts"
3. Filter: not logged in past 180 days
4. Result: 47 stale accounts
5. Export CSV → send to AD admin for cleanup
6. Schedule monthly to catch new staleness
```

### W7. Utility rebate claim — annual energy report
```
1. Reports > Power Management Reports > System Uptime Report
2. Date range: Last year (1 Jan - 31 Dec)
3. Compute total kWh saved (uptime hours × est. power)
4. "Generate Utility Rebate Pack" → PDF with methodology
5. Submit to utility company for rebate
```

### W8. USB device incident investigation
```
1. Security incident: data exfiltration suspected
2. Reports > USB Reports > USB usage reports
3. Filter: specific user / computer / date range
4. See all USB plugs with VID/PID + timestamp
5. Cross-reference with EC-18 Device Control logs
6. Cross-reference with EC-19 DLP logs
7. Build incident timeline
```

### W9. Scheduled report failure recovery
```
1. Manager: "I didn't get the report this morning"
2. Reports > Schedule Reports > [scheduler row]
3. Last run status: Failed (mail server rejected — too large)
4. Modify: increase size limit threshold OR switch to URL delivery
5. [Execute Now] → re-send
6. Manager confirms receipt
```

### W10. Build a "Computer Name suspicious patterns" formula column
```
1. New Custom Report > Sub Module: Computer
2. Type: Table
3. Add Formula Column "Suspicious Naming"
4. Derived value "Default name unchanged" if Computer Name LIKE "DESKTOP-%" with 8 random chars
5. Derived value "Possible BYOD" if Computer Name contains user's personal name
6. Derived value "Server" if Computer Name starts with "SRV-"
7. Unmatched: "Standard Pattern"
8. Filter on "Suspicious Naming" = "Default name unchanged" → list all
9. IT team can rename / domain-join these properly
```

---

## 7. Error States & Troubleshooting

### 7.1 Schedule Report errors

| Error | Cause | Remediation |
|---|---|---|
| "Recipient bounced" | Wrong email / mailbox full | Update email; notify scheduler creator |
| "Mail server rejected (size)" | Report exceeds attachment limit | Fallback to URL delivery (auto) OR reduce report scope |
| "Report data missing" | Source module disabled | Skip with log note |
| "Scheduler skipped (server down)" | EC server downtime | Catch-up run on resume |
| "URL expired" | Old scheduled run, link expired | Configure longer URL retention; re-deliver |

### 7.2 Custom Report errors

| Error | Cause | Remediation |
|---|---|---|
| "Preview shows 0 rows" | Filter too narrow | Widen filter; check criteria pattern |
| "Formula column conflict" | Same formula name in another sub-module | Rename; formula columns are sub-module-scoped |
| "Chart can't render — non-numeric Y-axis" | Picked categorical column for Y | Choose count/sum aggregation OR change to bar chart with categorical Y |
| "Save failed — name exists" | Duplicate report name | Choose unique name |

### 7.3 Query Report errors

| Error | Cause | Remediation |
|---|---|---|
| "Query timeout" | SQL too complex / table too large | Add indexes (DBA task) OR simplify query |
| "Permission denied" | Tried INSERT / UPDATE / DELETE | Only SELECT allowed |
| "Unknown column" | Column name typo OR table schema changed | Verify column in EC schema docs |
| "Date conversion failed" | Wrong date format in DATE_TO_LONG | Use mm/dd/yyyy hh:mm:ss format |
| "Date template not substituted" | Typo in token name | Use exact token names from list |

### 7.4 Dashboard errors

| Error | Cause | Remediation |
|---|---|---|
| "Dashboard in Error state" | Underlying custom report has invalid formula column | Edit formula column OR remove report from dashboard |
| "Widget renders empty" | Custom report returns 0 rows | Adjust report filters OR data backfill |
| "Edition restriction" | Lower edition trying to access | Upgrade to UEM or Security |

### 7.5 PII / Export errors

| Error | Cause | Remediation |
|---|---|---|
| "Conflicting PII modes" | Scheduler has different mode from global default | Schedule's mode wins; surface in scheduler UI |
| "Retain mode + GDPR jurisdiction" | Org in EU + Retain selected | Surface GDPR advisory; don't block but inform |
| "Mask applied — but data still identifiable" | Mask leaves last 4 chars; not enough anonymity | Use Remove instead for high-sensitivity exports |

---

## 8. Edge Cases & Gotchas

1. **Chart-based Custom Reports CAN'T be scheduled or exported.** Only viewable in console. Many admins assume parity with Tables.

2. **Formula columns are per-technician, per-sub-module.** Tech A's formula column NOT visible to Tech B. Surface this when sharing reports.

3. **Up to 5 derived values + 30 total criteria** per Formula Column. Beyond this, build multiple formula columns.

4. **Query Reports are SELECT-only.** No write access. Don't suggest schema changes from this surface.

5. **Long format date in DB is unreadable** without LONG_TO_DATE(). Easy admin mistake.

6. **Date format `mm/dd/yyyy hh:mm:ss`** for DATE_TO_LONG() is US-style. Non-US admins forget. Surface format hint.

7. **Date templates `<from_today>` / `<to_today>` etc.** are tokens — must be exact. Easy to typo.

8. **Custom Dashboard requires UEM or Security Edition.** Lower editions show "Upgrade required".

9. **Dashboard with all-deleted underlying reports auto-deletes itself.** Notify the owner.

10. **PII Mask example: "DESKTOP-AB12CD" → "DESKTOP-****" — last 4 chars NOT shown** (full mask, not partial). Different from some other systems (OTCnet shows last 4).

11. **7 PII fields specifically**: Computer Name, Domain Name, UserName, Email Address, Mobile Number, IP Address, Address. Other fields aren't auto-masked.

12. **"Let technician decide"** prompts at export time. Slows down bulk exports. Use sparingly.

13. **AD Reports require domains selected in Settings.** If none selected, scheduler is disabled — silently. Surface this.

14. **User Logon Reports require SoM scope + agent + Settings enabled.** Three layers can fail.

15. **Active vs Inactive thresholds (30/60/90/180 days)** are based on AD `lastLogon`. Custom thresholds need Query Report.

16. **Locked vs Disabled vs Expired** are 3 different AD attributes. Don't conflate in UI labels.

17. **USB Audit is Windows-only.** Mac / Linux USB events not captured here (separate DLP module for some scenarios).

18. **System Uptime → utility rebate** is a niche but lucrative use case. Highlight if region supports.

19. **Schedule Reports' "Execute Now" runs in addition to scheduled time.** Doesn't replace next run.

20. **Suspend a scheduler vs Delete** — suspend pauses; delete removes permanently. Easy to confuse.

21. **URL delivery code** for large reports must be entered to download. Code is in email body, not URL. Recipients miss this often.

22. **Cloud edition has all the same reports** as on-prem (with same caveats per module).

23. **Configuration Reports overlap with Task Reports.** Configuration = the "what was deployed"; Task = the "execution status". Both have value; UI should clarify.

24. **Custom Reports limited to Computer / Hardware / Software sub-modules.** Other domains (Patch / Security / etc.) only via canned reports + Query.

25. **Group By in Custom Reports affects ALL columns**, not just leading. Easy to misuse and get confusing layouts.

26. **Criteria Pattern** in filter conditions is text-based (`(1 AND 2) OR (3 AND 4)`). Easy to mis-pattern. Visual editor recommended.

27. **Scheduled reports run in EC server's time zone**, not recipient's. Send time may be off-hours for some recipients.

28. **Inactive User Account reports based on AD lastLogon** which may be domain-controller-cached. Up to 14 days stale on some setups.

29. **Disabled vs Inactive** — disabled is intentional admin action; inactive is just no recent logon. Different remediation.

30. **USB Audit history retention** affects forensic capability. Configure based on regulatory requirements.

31. **Custom Dashboard widget count limit: 20.** Hit it on busy executive dashboards. Split into multiple dashboards.

32. **DEX integration of Custom Dashboards** means changes in Reports auto-reflect in DEX. Don't edit in both.

33. **Power Management Report data needs Power Management feature enabled in Configurations module.** Without it, reports are empty.

34. **PII Mask + CSV export = "*" characters in cells** — may break downstream parsers expecting names. Use Remove for cleaner CSVs.

35. **Formula columns can't reference other formula columns.** Each is independent of the others.

36. **Recreating a deleted Custom Report doesn't restore dashboard widget association.** Manual re-add to dashboard required.

37. **Query Reports running long may time out.** No auto-pause; just fails. Plan for timeouts.

38. **Schedule "Daily" can include weekends.** Specify days of week if business-day-only reports needed.

39. **PII mode at export time can override scheduler mode** if "Let technician decide" is set for the scheduler.

40. **Audit Log Viewer (Admin > Audit) is SEPARATE from Reports module.** Don't conflate — Audit is action history; Reports is data presentation.

---

## 9. UI / UX Screens Needed (deliverable list)

### 9.1 Reports landing / navigation (5)
1. Reports Dashboard (cards for each category + recent reports + favorites)
2. Reports Category Navigation (sidebar with 9 categories + sub-categories)
3. Reports Search (autocomplete, fuzzy match, tag filter)
4. Starter Pack onboarding ("If you're an auditor / manager / IT admin")
5. Favorites / Bookmarks management

### 9.2 Canned Report viewing (4)
6. Report Table View (universal pattern: filters + columns + pagination + export)
7. Report Filter Panel (date range + computer + user + custom group + remote office)
8. Drill-down Detail View (per-row click into details)
9. Report Toolbar (export / schedule / share URL / favorite)

### 9.3 Custom Reports (8)
10. Custom Reports list
11. New Custom Report wizard — Type picker (Table / Chart)
12. Custom Report Table builder (Sub Module + Columns + Group By + Filter)
13. Custom Report Chart builder (Chart Type + X-axis + Y-axis)
14. Formula Column builder (Name + Derived Values up to 5 + Unmatched + Save)
15. Filter Condition builder (criteria + criteria pattern editor)
16. Preview Table / Preview Chart
17. Save / Schedule action

### 9.4 Query Reports (4)
18. Query Reports list
19. New Query Report editor (SQL textarea + syntax highlight + autocomplete)
20. Date function helper panel (LONG_TO_DATE / DATE_TO_LONG + 8 date templates with insert buttons)
21. Query Validation + Results preview

### 9.5 Custom Dashboards (4)
22. Dashboards list (with Active / Error status)
23. Create Dashboard wizard (drag-drop layout)
24. Dashboard View (rendered widgets + status indicator)
25. Dashboard Status Error remediation flow

### 9.6 Scheduled Reports (5)
26. Scheduled Reports list (with last run status + next run)
27. Add Schedule Report wizard (8-step)
28. Scheduler detail view + Execute Now action
29. Delivery configuration panel (Format + Delivery + Size Limit + URL fallback preview)
30. PII mode picker (4 options + per-field overrides)

### 9.7 Settings (4)
31. AD Reports Settings (scheduler enable + domains + interval)
32. User Logon Settings (enable + retention days)
33. USB Audit Settings (audit + alert sub-tabs)
34. Export Settings (org-default PII + format + delivery)

### 9.8 Cross-cutting (3)
35. Recent Reports panel (per user)
36. Export Confirmation modal (shows PII mode + format + size estimate)
37. Compliance disclaimer (PII Retain warning for GDPR jurisdictions)

---

## 10. Component Library — Reports-specific

### 10.1 Browse / list
- **`ReportsDashboardCard`** — category card with count + recent
- **`ReportsCategoryNav`** — multi-level sidebar
- **`ReportsSearch`** — autocomplete + fuzzy
- **`ReportRowCard`** — name + description + last viewed + favorite
- **`FavoritesPanel`** — per-user pinned reports
- **`StarterPackPersonaCard`** — onboarding for new admins

### 10.2 Report viewer
- **`ReportTableView`** — standardized table with sort/search/columns
- **`ReportFilterPanel`** — universal filters (date / computer / user / custom group)
- **`ReportToolbar`** — export / schedule / share / favorite buttons
- **`ReportDrilldownPanel`** — slide-out detail per row
- **`ReportShareURL`** — deep-link with filter state
- **`RowCountIndicator`** — "X matching of Y total"

### 10.3 Custom Report builder
- **`CustomReportTypePicker`** — Table vs Chart with limitation hints
- **`SubModulePicker`** — Computer / Hardware / Software
- **`ColumnPicker`** — drag-drop reorder
- **`FormulaColumnBuilder`** — Name + derived values + unmatched
- **`DerivedValueCard`** — per-derived-value condition card
- **`FilterConditionBuilder`** — multi-condition with pattern editor
- **`CriteriaPatternEditor`** — visual `(1 AND 2) OR 3` editor with pencil-edit mode
- **`GroupByPicker`** — multi-column grouping selector
- **`ChartTypePicker`** — 7 chart types with previews
- **`AxisPicker`** — X-axis + Y-axis with type compatibility check
- **`PreviewPanel`** — live preview with row count

### 10.4 Query Report editor
- **`SQLEditor`** — syntax highlight + autocomplete + schema-aware
- **`DateFunctionHelper`** — LONG_TO_DATE / DATE_TO_LONG insert buttons
- **`DateTemplateInsertChips`** — 8 token chips (today / yesterday / etc.)
- **`QueryValidator`** — pre-save syntax check
- **`QueryResultsTable`** — render SELECT results
- **`QueryTimeoutWarning`** — long-running query advisory

### 10.5 Dashboard composer
- **`DashboardCanvas`** — drag-drop grid
- **`WidgetPalette`** — list of available custom reports
- **`WidgetResizeHandle`** — corner-drag resize
- **`DashboardStatusBadge`** — Active / Error
- **`WidgetCountIndicator`** — "X / 20 widgets used"
- **`DashboardDeletionImpactModal`** — which dashboards affected when deleting a custom report

### 10.6 Schedule + delivery
- **`SchedulerWizard`** — 8-step
- **`ReportSelector`** — pick canned + custom + query reports
- **`FormatPicker`** — PDF / CSV / XLSX
- **`DeliveryPicker`** — Attachment / Zipped / URL with smart auto-select
- **`SizeLimitField`** — with URL fallback preview
- **`RecipientField`** — comma-separated email validation
- **`FrequencyPicker`** — Daily / Weekly / Monthly / Custom with day picker
- **`PIIModePicker`** — 4 options with examples
- **`PerFieldPIIOverride`** — per-field mask/remove/retain (advanced)

### 10.7 Compliance / PII
- **`PIIFieldsList`** — read-only display of 7 fields covered
- **`PIIModeBadge`** — current mode shown on every export confirmation
- **`PIIMaskExamplePreview`** — show before/after mask sample
- **`GDPRRetainWarning`** — compliance advisory when Retain selected in EU
- **`ExportConfirmationModal`** — final check before export with PII mode visible
- **`AuditTrailLinker`** — link to Action Log Viewer

### 10.8 Errors / status
- **`SchedulerLastRunBadge`** — Success / Failed / Skipped
- **`URLExpiryWarning`** — for downloadable URLs nearing expiry
- **`MailServerSizeRejectBanner`** — for failed deliveries with auto-fallback to URL
- **`DashboardErrorStateBanner`** — Active / Error explanation

---

## 11. Cross-Module Dependencies

| Module | Relationship |
|---|---|
| **EC-01 Patch Management** | Patch Reports + Vulnerable Patches Reports sourced here |
| **EC-02 Vulnerability Management** | Vulnerability Reports |
| **EC-03 Inventory** | Inventory Reports + Software / Hardware data feeds Custom Reports |
| **EC-04 Software Deployment** | SSP Reports + Software Deployment Task Reports |
| **EC-05 Remote Tools** | Remote Control session history in Audit Log Viewer |
| **EC-06 OS Imaging** | OS Deployment Task Reports |
| **EC-14 BitLocker** | BitLocker Reports |
| **EC-15 Browser Security** | Browser Reports |
| **EC-16 Application Control** | App Control Reports |
| **EC-18 Device Control** | Device Control Reports + USB Audit cross-link |
| **EC-19 DLP** | DLP audit log integrations |
| **EC-20 DEX** | Custom Dashboards visible in DEX too with DEX-specific extensions |
| **EC-CROSS Audit Log Viewer** | Action audit trail (Admin > Audit) — separate from Reports tab |
| **EC-CROSS RBAC** | Report access gated by role; report ownership tracked |
| **EC-CROSS SoM** | Computer/user scope of all reports |
| **EC-CROSS Helpdesk Integration** | SDP tickets can be created from report drill-downs |

---

## 12. Reference URLs

### Help docs — primary
- Reports overview: https://www.manageengine.com/products/desktop-central/help/reports/desktop-central-reports.html
- Schedule Reports: https://www.manageengine.com/products/desktop-central/help/reports/scheduled_reports.html
- Custom Reports: https://www.manageengine.com/products/desktop-central/help/reports/custom_reports.html
- Creating Custom Reports (wizard): https://www.manageengine.com/products/desktop-central/help/reports/creating_custom_reports.html
- Custom Query Reports: https://www.manageengine.com/products/desktop-central/help/reports/custom_query_report.html
- Customized Dashboards: https://www.manageengine.com/products/desktop-central/help/reports/customized-dashboards.html
- Active Directory Reports: https://www.manageengine.com/products/desktop-central/help/reports/viewing_active_directory_reports.html
- AD User Account Status Reports: https://www.manageengine.com/products/desktop-central/help/reports/active_directory_account_status_user_reports.html
- AD Server Reports: https://www.manageengine.com/products/desktop-central/help/reports/active_directory_server_reports.html
- AD Reports Settings: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configuring_active_directory_update_interval.html
- User Logon Reports overview: https://www.manageengine.com/products/desktop-central/help/user_logon_tracking/viewing_user_logon_reports.html
- User Logon Usage Reports: https://www.manageengine.com/products/desktop-central/help/user_logon_tracking/user_logon_usage_reports.html
- Setting Up User Logon Reports: https://www.manageengine.com/products/desktop-central/help/user_logon_tracking/setting_up_user_logon_reports.html
- Power Management / System Uptime Report: https://www.manageengine.com/products/desktop-central/help/reports/power_management/system_uptime_report.html
- Configuration Reports: https://www.manageengine.com/products/desktop-central/help/reports/viewing_configuration_reports.html
- USB Reports: https://www.manageengine.com/products/desktop-central/help/reports/usb_audit/usb_audit.html
- Inventory Reports: https://www.manageengine.com/products/desktop-central/help/inventory/viewing_inventory_reports.html
- Task Reports: https://www.manageengine.com/products/desktop-central/help/reports/viewing_task_status_report.html
- Self-Service Portal Reports: https://www.manageengine.com/products/desktop-central/help/reports/self-service-portal-reports.html
- Patch Reports: https://www.manageengine.com/products/desktop-central/help/reports/viewing_patch_reports.html
- Vulnerability Reports: https://www.manageengine.com/products/desktop-central/help/reports/viewing_patch_vulnerability_report.html
- Application Control Reports: https://www.manageengine.com/products/desktop-central/help/reports/app-control-reports.html
- BitLocker Reports: https://www.manageengine.com/products/desktop-central/help/reports/bitlocker-reports.html
- Browser Reports: https://www.manageengine.com/products/desktop-central/help/reports/browser-reports.html
- Device Control Reports: https://www.manageengine.com/products/desktop-central/help/reports/device-control-reports.html

### Feature pages (marketing)
- Desktop Management Reports: https://www.manageengine.com/products/desktop-central/desktop-management-reports.html
- Active Directory Reports feature: https://www.manageengine.com/products/desktop-central/windows-active-directory-reports.html
- HIPAA Compliance: https://www.manageengine.com/products/desktop-central/hipaa_for_desktop_central.html
- GDPR Compliance: https://www.manageengine.com/products/desktop-central/gdpr-compliance.html
- Custom Query Request form: https://www.manageengine.com/products/desktop-central/custom-query-request.html

### Compliance reference
- GDPR features general: https://www.manageengine.com/gdpr/
- HIPAA features general: https://www.manageengine.com/products/desktop-central/hipaa_for_desktop_central.html

---

## 13. Critical UX Tensions

1. **100+ canned reports — discoverability vs hierarchy.** Search alone isn't enough; need persona-driven Starter Packs + favorites + recently viewed.

2. **Custom Reports (Wizard) vs Custom Query Reports.** Power-user feature gap. UI must softly steer non-SQL admins to Wizard; surface Query Report as "Advanced".

3. **Chart-based custom reports CAN'T be scheduled or exported.** Surprise factor. Show limitations upfront.

4. **Formula columns are per-tech, per-sub-module.** Sharing reports breaks this. Need explicit warning.

5. **PII handling default** — Mask is safe but admin trust says Retain. Default to Mask + easy override.

6. **"Let technician decide" PII mode** slows bulk exports. Use sparingly; not as default.

7. **GDPR jurisdiction detection** — should the UI auto-mask for EU users? Risky to assume; advisory instead.

8. **URL delivery for large reports requires code entry.** Recipients miss the code in email. Better landing page.

9. **Custom Dashboards — UEM / Security edition only.** Lower editions still see the option — gated with upgrade CTA.

10. **Dashboard widget cap: 20.** Power users hit this on executive dashboards. Split flow needed.

11. **DEX dashboards vs Reports dashboards** — same surface, two paths. Clarify ownership.

12. **AD Reports require domains selected.** No domains = scheduler silently disabled. Surface error.

13. **User Logon Reports need 3-layer enablement** (SoM + agent + settings). Pre-flight checklist on first visit.

14. **Active vs Inactive vs Disabled vs Locked vs Expired user accounts** — 5 statuses, 3 AD attributes. Labels matter.

15. **System Uptime Report for utility rebates** — niche but lucrative. Surface regionally.

16. **Schedule "Execute Now" runs IN ADDITION to scheduled run.** Doesn't replace. Easy to confuse.

17. **Suspend vs Delete scheduler.** Affects history retention. Need distinct iconography.

18. **Criteria Pattern editor** — text `(1 AND 2) OR 3` is error-prone. Visual editor needed.

19. **Date format `mm/dd/yyyy hh:mm:ss`** is US-style — global admins forget. Show format example.

20. **Date templates `<from_today>`** are tokens; case-sensitive. Easy typo. Use insert buttons.

21. **Scheduler runs in EC server timezone.** Mismatch with recipient timezone causes off-hours delivery. Show recipient TZ preview.

22. **PII mode at export overrides scheduler mode if "Let technician decide" is set.** Order of precedence non-obvious.

23. **Report data missing when source module disabled.** Empty report instead of "Module X disabled — enable to populate". UX gap.

24. **Custom Dashboards in Error state from deleted formula columns** — manual fix required. Show fix path.

25. **Configuration Reports vs Task Reports** overlap. Distinguish:
    - **Configuration Report** = what was deployed (the policy)
    - **Task Report** = how it executed (success / fail per target)

26. **Inactive user thresholds (30/60/90/180 days)** are hard-coded. Custom = Query Report. Surface this.

27. **CSV exports with PII Mask have `*` characters** — may break downstream parsers. Recommend Remove for CSV when shared.

28. **Email size limits vary per recipient** — hardcoded scheduler size limit may not match. Auto-detect via SMTP test.

29. **AD lastLogon attribute is per-domain-controller** — may be stale up to 14 days. Surface staleness caveat.

30. **No native Excel pivot in EC export** — admins re-create pivots in Excel. Consider native pivot in PDF export.

31. **Sub-Module limitation in Custom Reports (Computer / Hardware / Software only)** — Patch, Vuln, etc. only via canned + Query.

32. **Report search must index report names + descriptions + maybe column names** — without it, finding "the report with VID/PID" is hard.

33. **PII Mask format**: EC fully masks (no last 4 chars visible). Some compliance frameworks expect partial mask. Configurable mask depth would help.

34. **Per-field PII override (Mask UserName + Retain Computer Name)** — advanced. Show only when admin enables advanced mode.

35. **Recurring schedule failure handling** — does next scheduled run try again? Catch-up logic needed.

---

## 14. Status Lifecycle Summary

### Custom Report
```
Draft → Saved → (Used in Schedules / Dashboards)
        │
        ├── Modified → updates flow to schedules + dashboards
        ├── Duplicated → new independent report
        └── Deleted → blocked if in active schedules; dashboards auto-handle
```

### Custom Dashboard
```
Created → Active (all widgets valid)
        │
        ├── Underlying report invalid (formula column deleted) → Error
        │     └── Fix formula column OR remove widget → Active
        │
        ├── Underlying report deleted → widget auto-removed
        └── ALL widgets removed → Dashboard auto-deletes
```

### Scheduled Report
```
Created → Saved → Scheduled
        │
        ├── [Execute Now] → Generated → Delivered (Attachment | Zipped | URL)
        │
        ├── At scheduled time → Generated → Delivered
        │     ├── Success → log Success
        │     ├── Mail server reject (size) → fallback to URL → Success | Failed
        │     ├── Recipient bounce → Partial Success
        │     └── EC server down → Skipped (catch-up next available)
        │
        ├── Suspended → no runs, retains history
        ├── Resumed → next scheduled run fires
        └── Deleted → removed
```

### URL Delivery
```
Report generated → published on Central Server
        │
        ▼
Email sent with: code + download URL
        │
        ▼
Recipient clicks URL → landing page → enters code → downloads
        │
        ▼
URL expires after configured retention
```

### PII Mode at runtime
```
Scheduler / Export action triggered
        │
        ▼
Check effective PII mode:
   1. Scheduler-level mode (if set)
   2. Else: org-default Export Settings
   3. If "Let technician decide" → prompt at export
        │
        ▼
Apply mode to 7 PII fields in output
   ├── Mask → replace with anonymized
   ├── Remove → strip columns
   └── Retain → as-is
        │
        ▼
Generate report → deliver
```

---

## 15. Module signature — one-paragraph mental model

> **Reports** is Endpoint Central's **read-only knowledge surface** — the only module where data is *consumed* and *presented* rather than *configured* or *enforced*. The seven jobs an admin must accomplish without friction are: (1) **discover the right canned report from 100+** via category nav + search + favorites + persona-driven Starter Packs, (2) **build custom reports** with wizard-based column selection + filtering + formula columns + grouping, optionally as charts with 7 chart types, (3) **write SQL Query Reports** for power use cases with built-in date helpers + date templates, (4) **compose Custom Dashboards** by dragging custom reports as widgets (up to 20, UEM/Security edition only), (5) **schedule recurring delivery** via PDF/CSV/XLSX as attachment/zipped/URL to email recipients with size-aware fallback, (6) **protect PII compliance** via mask/remove/retain controls on 7 explicitly-cataloged fields (Computer Name, Domain Name, UserName, Email Address, Mobile Number, IP Address, Address), and (7) **prove audit/compliance posture** to HIPAA/GDPR/SOX auditors via Active Directory Reports (User/Computer/Group/OU/Domain/GPO/Server with 30/60/90/180-day account status filters), User Logon Reports (General/Usage/History with retention controls), Power Management Reports (System Uptime for utility rebates), USB Audit Reports, and Configuration Reports. The core UX commitments are: **discoverability first** (search + favorites + Starter Packs) for 100+ canned catalog, **graceful degradation** (Chart reports can't schedule/export — show upfront), **compliance defaults** (Mask PII by default, with override for trusted teams), **smart delivery** (auto-pick attachment/zipped/URL based on size), and **clear status visibility** (Dashboard Active/Error, Scheduler Last Run, URL expiry). Every report is auditable; every export records who/what/when; every scheduled delivery is logged.

---

**File**: EC-07 — Reports (Deep Dive)
**Companion files**: EC-00 (Master), EC-01 (Patch Mgmt), EC-02 (Vuln Mgmt), EC-03 (Inventory), EC-04 (Software Deployment), EC-05 (Remote Tools), EC-06 (OS Imaging)
**Next**: EC-08 — Conditional Access (MDM — Allow/Block/Quarantine) — say `next` for sequential, or specify priority module (e.g. "EDR first" / "BitLocker first")
