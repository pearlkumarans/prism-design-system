# EC-03 : Inventory & Asset Management — Deep Dive (UI Reference)

> **Source**: ManageEngine Endpoint Central Help — `/products/desktop-central/help/inventory/*` + KB + feature pages
> **Scope**: Hardware inventory, software inventory, license management, software metering, prohibit software, block executable, custom fields, warranty, alerts, reports — Windows / Mac / Linux
> **Purpose**: Single source of truth for UI design (screens, components, fields, states, workflows, error modes, edge cases) for the Asset Management module

---

## 1. Module Overview

### 1.1 What this module is
The **Asset Management** module is Endpoint Central's IT Asset Management (ITAM) workhorse. It periodically discovers, collects, normalizes, and surfaces **hardware** and **software** asset data from every managed endpoint, then layers governance on top — license compliance, usage metering, allow/deny enforcement, warranty tracking, and audit reporting.

Mental model the UI must reinforce:

```
SCAN → DISCOVER → NORMALIZE → STORE → SURFACE (views/reports) → ACT (license, prohibit, block, alert, uninstall) → AUDIT
```

Every other module (Patch, EDR, Vuln, Browser Security, EPM, App Control, etc.) **consumes** this inventory data. If Inventory is wrong/stale, everything downstream is wrong. **This is a foundational module** — UI must convey trust, accuracy, freshness.

### 1.2 Persona
- **Primary**: IT Administrator (procurement-adjacent — interacts with finance/budgeting teams)
- **Secondary**: Procurement / Finance / Auditor (license compliance, warranty cost, audit reports)
- **Tertiary**: Security team (rogue software detection, prohibit/block enforcement crossover with App Control)

### 1.3 Module signature
Unlike Patch/Vuln (which are **lifecycle/remediation-driven**), Inventory is **catalog-driven** — the dominant UI metaphor is **lists + facets + drill-downs** with a strong "single record detail view" (Computer Details, Software Details). Less wizard-heavy than Patch Management. More table-heavy than any other module.

### 1.4 OS coverage
| OS | Hardware scan | Software scan | Metering | Prohibit | Block Exe | Warranty |
|---|---|---|---|---|---|---|
| Windows | ✅ | ✅ | ✅ (only Win + Mac) | ✅ (Desktop Apps only) | ✅ | ✅ (Dell/Toshiba/Lenovo/HP) |
| Mac | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Linux | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

> **UI implication**: OS-aware fields/columns/actions. Disabled actions need tooltips explaining why ("Prohibit Software is available only for Windows Desktop Apps"). Don't just grey out silently.

---

## 2. Concepts & Vocabulary

These are the terms the UI must use exactly. Inconsistency breaks the admin's mental model.

| Term | Definition | UI treatment |
|---|---|---|
| **Inventory Scan** | The process of discovering and collecting HW/SW/system data from an endpoint | Action button + status indicator on every computer row |
| **Asset Scan Settings** | Per-component toggles (Drivers/Services/Shares/Certificates) that control what gets scanned beyond the defaults | Settings page — toggle list with "applies from next scan" disclaimer |
| **Refresh Cycle** | The agent's check-in period (default 90 minutes) | Read-only data freshness indicator ("Last scanned 14 min ago") |
| **On Demand Scan** | Admin-initiated immediate scan | Button. Throttled — see scan-all limits |
| **Schedule Scan** | Periodic admin-defined scan beyond defaults | Cron-like scheduler |
| **Fail-safe Scan** | Automatic retry triggered by the agent when previous scan failed | Background, no UI button — but show in scan history |
| **Software Type** | `Commercial` \| `Non-Commercial` | Badge in software list. Editable via "Move To" |
| **Access Type** | `Allowed` \| `Prohibited` | Badge. Editable. Drives whether the row links to Prohibit Software workflow |
| **Compliance Status** | `In-Compliance` \| `Over Licensed` \| `Under Licensed` \| `Expired` | Color-coded badge: Green / Blue / Red / Grey |
| **Network Installation** | Total count across **all** managed devices | KPI on the software row |
| **Managed Installation** | Count across devices managed by **currently logged in technician** (limited by their custom group / remote office scope) | KPI on the software row — also drives RBAC-aware compliance math |
| **Software Group** | Logical grouping of multiple versions of the same software (e.g. all MS Office versions) | Tree/parent-child component |
| **Software Category** | Functional taxonomy (Accounting/Database/Development/Driver/Game/Graphics/Internet/Multimedia/Others) + custom | Dropdown + chip filter |
| **Prohibited Software** | Software added to the blocklist; agent will detect (and optionally auto-uninstall) | Separate list view + status: `Detected` / `Uninstalled` / `Pending` / `Requested` |
| **Block Executable** | Path-based or hash-based rule to prevent an .exe from running (not the same as Prohibit) | Policy list view |
| **Custom Field** | Admin-defined property attached to Computer or Software records | Configurable column / detail tab |
| **PII Column** | A custom field flagged as Personally Identifiable Information — masked in views/reports | Lock icon, "Show" toggle gated by RBAC |
| **Warranty Status** | `In-Compliance` \| `Soon-to-Expire` \| `Expired` \| `Unidentified` | 4-state badge |
| **Software Compliance Report** | Audit report showing which software is over/under/in-compliance | Stand-alone report page |
| **Metering Rule** | A definition: software + rule name + file name (.exe / .app) that the agent watches for usage | Rules list |
| **Usage Statistics** | Frequently / Occasionally / Rarely Used buckets per software | Tag + sortable column |

### 2.1 The "Prohibit vs Block" confusion — call out in UI

This is the #1 admin confusion point in this module. UI must distinguish clearly.

| | **Prohibit Software** | **Block Executable** |
|---|---|---|
| What it does | Detects installed software, optionally **auto-uninstalls** it | Prevents the .exe from **executing** (doesn't uninstall) |
| Detection mechanism | Inventory scan (installed package list) | Local Group Policy / Software Restriction Policy enforcement at exec time |
| Granularity | Per-software (recognized install) | Per-file (path or hash) — works even for portable .exe without installer |
| Use case | "Remove all installed copies of uTorrent across the fleet" | "Prevent chrome.exe from running on these locked-down kiosks" |
| End-user can request exception | ✅ Yes (request workflow via agent tray) | ❌ No |
| Prerequisites | Just agent | Local GPO enabled + Default security policy = Unrestricted + GPO enabled for Administrator |
| OS support | Windows only (Desktop Apps) | Windows only |

**UI ask**: When admin navigates to either, show a one-liner: *"Want to remove an installed app? → Prohibit. Want to prevent an .exe from running? → Block Executable."*

---

## 3. Navigation & IA — Inventory Tab

### 3.1 Top-level Inventory tab structure
The Inventory tab is one of the heaviest modules in terms of sub-navigation. Recommended IA based on help-doc structure:

```
INVENTORY (tab)
├── Dashboard / Summary  (default landing)
├── Views                ← Read-heavy, browse-first
│   ├── Computers        — All managed devices, OS-aware tabs
│   ├── Hardware         — Hardware components aggregated
│   ├── Software         — Software inventory (the heart of the module)
│   └── Scanned Computers (last scan status per machine)
├── Manage               ← Action-heavy, governance
│   ├── Manage Licenses
│   │   ├── Licenses tab
│   │   ├── Group Software tab
│   │   └── Manage Software Category tab
│   ├── Prohibit Software
│   │   ├── Prohibited SW tab
│   │   ├── Auto-Uninstall Policy tab
│   │   ├── Auto Uninstallation Status tab  (Detailed View drill-down)
│   │   └── User Requests tab
│   ├── Block Executable
│   │   └── Policies list (Path Rule / Hash Rule per policy)
│   └── Software Metering
│       ├── Software Metering Rules
│       └── Software Metering Summary
├── Actions / Settings   ← Operations
│   ├── Scan Systems         (On Demand)
│   ├── Schedule Scan
│   ├── Scan Settings        (per-component toggles)
│   ├── Configure Alerts     (Email / SMS / Mobile)
│   ├── Custom Fields        (also under Admin → Global Settings)
│   ├── Manage Software Category  (alt entry)
│   └── HP Warranty Settings (Admin-adjacent)
├── Inventory Alerts     ← Notifications inbox
└── Reports              ← Cross-link to Reports tab — Inventory section
    ├── Hardware Inventory Reports
    ├── Software Inventory Reports
    ├── Software Compliance Reports
    ├── System Details Reports
    └── Warranty Reports
```

### 3.2 Cross-module entry points
- **Admin → Global Settings → Custom Field** (also reachable from Inventory)
- **Admin → Global Settings → Add Custom Data for Computers** (warranty bulk update, computer location, owner, owner email, search tag, product number, shipping date, expiry date, notes)
- **Admin → Integrations → ServiceDesk Plus** (prohibited software request approval routing)
- **Patch Mgmt / Vuln Mgmt** consume Inventory's software list (any patch applies only to software the inventory already knows about)
- **EDR / App Control** use inventory's file hashes & process metadata for IoCs

### 3.3 Page hierarchy & breadcrumbs

```
Inventory > Software > [Software Name] > Computers using this software > [Computer Name]
Inventory > Computers > [Computer Name] > Summary | System | Hardware | Software | Certificates | File Details | Security | USB Audit | History
Inventory > Manage Licenses > [Software Name] > Associated Computers
Inventory > Prohibit Software > [Software Name] > Exclusions | Detection
```

> **UI ask**: Breadcrumbs must be sticky on long lists. Drill-down deep paths need a "back to all" shortcut.

---

## 4. Sub-Features — Deep Dive (per-page UX specs)

### 4.1 Inventory Scan — 8 scan types

The Endpoint Central agent performs **8 distinct scan types**, each with different triggers. The UI must surface scan history with the type clearly tagged.

| # | Scan Type | Trigger | Initiator | Data flow | UI surface |
|---|---|---|---|---|---|
| 1 | **Agent Initial Scan** | Agent install completes | Agent | Full HW/SW snapshot → server | "First scan" badge on new computer rows |
| 2 | **Automated Software Scan** | Agent detects software install/uninstall | Agent | Delta posted after detection | Scan history entry |
| 3 | **Automated Hardware Scan** | Agent detects HW add/remove | Agent | Posted **after machine restart** | Note: hardware deltas need a reboot — UI tooltip |
| 4 | **Automated Core Properties Scan** | Agent detects change in IP/MAC/OS/Domain/Computer Name/Logged-on User | Agent | Posted **immediately** | Real-time freshness indicator |
| 5 | **On Demand Scan** | Admin clicks "Scan" in console | Admin | Agent kicks off, posts result | Manual button, status pill |
| 6 | **Schedule Scan** | Cron-like schedule defined by admin | Server-pushed | Periodic | Schedule page |
| 7 | **User Initiated Scan** | End-user triggers from agent tray icon | End-user | Agent posts result | "User triggered" tag on scan history |
| 8 | **Fail-safe Scan** | Previous scan failed; agent retries | Agent | Auto-retry | Show retry count + last error |

> **UI ask**: On the Computer detail page, the **History tab** must show every scan with: timestamp, scan type, trigger source, status (Success/Failed/Partial/In Progress), bytes posted, error message if any. Filterable by scan type.

#### 4.1.1 On-Demand Scan workflow

Path: `Inventory > Actions/Settings > Scan Systems`

```
Admin clicks Scan Systems
    │
    ├── (a) Select specific computers → multi-select picker → Scan
    │       └── Scope picker: Domain | Custom Group | Remote Office | Individual computers
    │
    └── (b) Scan All managed computers → confirmation modal
            ⚠️  Hard limit warning: "Scan All Computers" is limited (avoid bulk overwhelm — see Best Practices)
                    │
                    ▼
            Agent receives scan command at next refresh cycle
                    │
                    ▼
            Agent collects data → posts to Central Server
                    │
                    ▼
            Server updates inventory tables → triggers alerts if configured
                    │
                    ▼
            UI: Scan status pill updates per row
                "Pending" → "In Progress" → "Success" | "Failed [reason]"
```

#### 4.1.2 Data fetched in every inventory scan (default)

The UI must communicate to admin what's covered "by default" vs what requires opt-in via Asset Scan Settings.

**Default (always collected):**
- Installed Software details
- Hardware details
- Operating System
- Computer Name
- Logged-in User details
- IP Address (IPv4 + IPv6)
- MAC Address
- Domain details
- Antivirus details
- Encryption details (BitLocker status)
- Firewall status
- Local Users and Groups

**Opt-in via Asset Scan Settings (not enabled by default):**
- Drivers
- Services
- Shares
- Certificates
- File details

> **UI ask**: On Asset Scan Settings page, group toggles into "Default (cannot be disabled)" (read-only display) vs "Optional (off by default — enable per need)". Use info icons with one-line "why you might want this" explanations. *Tradeoff disclaimer*: Enabling all increases data volume and scan duration.

#### 4.1.3 Asset Scan Settings — destructive behavior warning

```
⚠️  If a component is EXCLUDED from scan, all related data is REMOVED from Endpoint Central.
✓   If a component is INCLUDED, data populates from the NEXT scan onward (not immediately).
```

> **UI ask**: When admin toggles off Drivers/Services/Shares/Certificates, show a confirmation modal:
> "Turning this off will delete all currently stored [component] data. Existing reports referencing this data will become incomplete. Continue?"

#### 4.1.4 Prerequisites for scan to succeed

- Target machine is in Scope of Management (SoM)
- Endpoint Central Agent installed and healthy
- DCOM enabled on target (Windows 7+)
- WMI service running
- TCP ports 8020 (agent↔server) + 8027 (on-demand tasks) open in firewall
- Local GPO enabled (for scheduled scans)

> **UI ask**: On every failed scan row, the error message must link to a "Why did this fail?" diagnostic panel that runs through these prereqs as a checklist with status per item.

#### 4.1.5 Best Practices — surface as UI guardrails

- Avoid mass on-demand scans (server overwhelm). UI suggests: "Selecting more than N computers? Consider scheduling instead."
- For large environments, divide endpoints into smaller groups and stagger scans
- Ensure agents are online before initiating scan (check agent status pre-flight)
- Don't repeat scans already in progress — UI must disable the Scan button if a scan is already running for that machine

---

### 4.2 Viewing Inventory Details

Three primary views: Hardware, Computers, System Details.

#### 4.2.1 Hardware View
Path: `Inventory > Hardware`

Aggregated view of HW components across the fleet (not per-machine).

| Column | Type | Notes |
|---|---|---|
| Hardware Name | string | e.g. "Intel(R) Core(TM) i7-1185G7" |
| Hardware Type | enum | processor / keyboard / mouse / port / memory / storage / network / display / etc. |
| Manufacturer | string | Intel / Dell / Realtek / etc. |
| Number of Items | integer (clickable) | Total instances in scanned fleet. Click → drill to list of computers having this HW |

> **UI ask**: Filter by Hardware Type chips at the top. Group-by Manufacturer toggle. "Number of Items" is the primary KPI on each row — make it the visual anchor.

#### 4.2.2 Computer View (per-machine detail)
Path: `Inventory > Computers > [Computer Name]`

**OS-aware tab strip** — the tabs change per OS:

| Tab | Windows | Mac | Linux |
|---|---|---|---|
| Summary | ✅ | ✅ | ✅ |
| System | ✅ | ✅ | ✅ |
| Hardware | ✅ | ✅ | ✅ |
| Software | ✅ | ✅ | ✅ |
| Certificates | ✅ | ❌ | ❌ |
| File Details | ✅ | ❌ | ✅ |
| Security | ✅ | ✅ | ❌ |
| USB Audit | ✅ | ❌ | ❌ |
| History | ✅ | ✅ | ✅ |

> **UI ask**: Hide unavailable tabs entirely per OS — don't show grey-disabled tabs. But on Summary tab, show a "Coverage" footer: "This OS supports: X, Y, Z tabs. Z not applicable on Linux."

#### 4.2.3 System Tab — what's inside
- **Services**: running services list (name, status, startup type, account)
- **Groups**: local groups present on the system
- **Users**: local user accounts (name, status, last logon, admin Y/N)

Windows-specific addition: Windows Defender info and detected threats list.

#### 4.2.4 Hardware Tab — what's inside (per-machine)
- CPU (model, cores, clock)
- RAM (installed, slot details if available)
- Storage (per disk: capacity, free space, type SSD/HDD)
- Network adapters (per NIC: MAC, IPs, type)
- Display adapters (GPU model)
- Peripherals (keyboard, mouse, monitor, USB, audio)
- BIOS / UEFI version
- Battery (laptop — health, cycle count, capacity)
- Motherboard / Chassis

#### 4.2.5 Software Tab — per-machine software list

Columns: Software Name, Version, Install Date, Installed User Account (SYSTEM vs user — drives uninstall behavior), Software Type, Size, Vendor.

> **UI ask**: Make "Installed User Account" prominent — it's how admin decides Computer-based vs User-based uninstall. Show an info chip: `SYSTEM` (computer-wide) or `[username]` (per-user).

---

### 4.3 Software Inventory (the central catalog)

Path: `Inventory > Software`

This is **the most-used screen** in the entire Inventory module. License compliance, prohibit decisions, metering rule creation, uninstall — all flow through here.

#### 4.3.1 Full column inventory (every documented field)

| Column | Type | Default visible | Notes |
|---|---|---|---|
| Software Name | string | ✅ | Primary identifier |
| Version | string | ✅ | Multiple rows per software for different versions (unless Grouped) |
| Vendor | string | ✅ | Software publisher |
| Software Type | enum: Commercial / Non-Commercial | ✅ | Move To action to change |
| Access Type | enum: Allowed / Prohibited | ✅ | Click to add/remove from Prohibit |
| Purchased | integer | optional | License count purchased — from Manage Licenses |
| Installed | integer | ✅ | Number of copies detected |
| Remaining | integer | optional | Purchased − Installed |
| Compliance Status | enum | ✅ | Color badge |
| Managed Installation | integer | ✅ | Count in current technician's RBAC scope |
| Network Installation | integer | ✅ | Total fleet count |
| Licensed To | string | optional | Org/person name |
| Purchased Date | date | optional | |
| License Expiry Date | date | optional | Drives alerts |
| Software Category | enum (custom) | optional | Accounting/Database/Development/Driver/Game/Graphics/Internet/Multimedia/Others/custom |
| Remarks | text | optional | Free text |

> **UI ask**: Column picker — admin selects which columns to show; per-user persisted. Default visible set covers compliance use case; everything else opt-in.

#### 4.3.2 Per-row actions

- **Manage License** (add license details / link to existing license)
- **Move To** (Commercial ↔ Non-Commercial)
- **Add to Prohibited** (Windows Desktop Apps only — gate the action)
- **Add to Software Group**
- **Assign Category**
- **Uninstall** (icon under Actions column)
  - MSI: silent uninstall keys pre-filled
  - EXE: manual keys required, with verification recommendation
  - User-based: doesn't work directly — route to Software Deployment package creation
- **View Computers** (drill to list of machines with this software installed)
- **Add License File / Invoice** (attachment)

#### 4.3.3 Bulk actions

- Mass move to category
- Mass move to Commercial/Non-Commercial
- Mass add to Prohibited (Windows only)
- Export to CSV

#### 4.3.4 Filter sidebar

- By Compliance: In Compliance / Over Licensed / Under Licensed / Expired
- By Software Type: Commercial / Non-Commercial
- By Access Type: Allowed / Prohibited
- By Category (multi-select chip)
- By Vendor (typeahead)
- By Install count range
- By License expiry: Soon-to-expire (configurable window) / Expired / OK
- By OS detection origin: Windows / Mac / Linux

---

### 4.4 Software License Management

Path: `Inventory > Manage Licenses`

#### 4.4.1 What this screen does

- Track license counts, expiry dates, purchase invoices, license files
- Associate licenses to specific computers
- Distinguish Network Installations vs Managed Installations (RBAC-aware count)
- Generate the **Software Compliance Report**

#### 4.4.2 Add License — workflow

```
Click "Add License" button
        │
        ▼
Step 1: Select Software (from inventory list — typeahead)
        ├── If not in list: "Add software not in list" path
        │     ├── Manufacturer (manual)
        │     └── Software Version (manual)
        ├── Else: Manufacturer + Version pre-filled, READ-ONLY
        │
        ▼
Step 2: Fill License Details
        ├── Purchased count
        ├── Licensed To (person/org)
        ├── Purchased Date
        ├── License Expiry Date
        ├── License File (file upload — optional)
        ├── Invoice (file upload — optional)
        └── Remarks (free text — optional)
        │
        ▼
Step 3: Associate Computers
        ├── View toggle:
        │     ├── "Installed Computers" (only machines with this SW)
        │     └── "Managed Computers" (entire fleet)
        ├── Multi-select with shuttle UI (Available → Associated)
        │
        ▼
Click "Save" → license entry created
```

#### 4.4.3 Bulk import via CSV

Path: `Inventory > Actions/Settings > Manage Licenses > Import from CSV`

- Sample CSV format provided in console — UI must show "Download sample" link
- Map columns to fields
- Validation feedback per row (row N: error reason)

> **UI ask**: CSV import is high-friction. Show progress bar with row counter, then a summary screen: X rows imported, Y skipped (reasons listed), Z duplicates (action: skip/overwrite).

#### 4.4.4 Add More — additional license purchases

For an existing software, click `Add More` under Actions column → add additional purchased count. UI rolls up totals.

#### 4.4.5 Compliance Status — visual scheme

| Status | Math | Color | Icon |
|---|---|---|---|
| **In-Compliance** | Purchased == Network Installations | Green | ✓ |
| **Over Licensed** | Purchased > Network Installations | Blue | ↑ |
| **Under Licensed** | Purchased < Network Installations | Red | ⚠️ |
| **Expired** | License Expiry Date < today | Grey | ⏱ |

> **UI ask**: Critical that "Under Licensed" is unmistakable — it's a compliance/legal risk. Red + ⚠️ icon + tooltip with delta count: "You're 12 licenses short. Network Installations: 87, Purchased: 75".

#### 4.4.6 Network vs Managed Installation — explain in UI

This trips up MSPs and large enterprises with RBAC. Show an info popover next to each KPI:

```
Network Installations: 87  ⓘ
  → Total across ALL managed devices

Managed Installations: 23  ⓘ
  → Only devices in YOUR custom group / remote office scope
```

---

### 4.5 Software Groups

Path: `Inventory > Manage Licenses > Group Software`

#### 4.5.1 Purpose
Collapse multiple versions of the same software (e.g. MS Office 2019, 2021, 365) into a single logical entity for:
- Prohibit Software (one rule for all versions)
- Manage Licenses (consolidated count)
- Combined reporting

#### 4.5.2 Create Software Group — workflow

1. Click `Add Software Group`
2. Name the group (e.g. "Microsoft Office — All Versions")
3. List view shows all available software
4. Move selected items to "Grouped Software" list
5. Reorder selected items (arrow buttons) — **position matters**: the **first software** in the selected list dictates Category + Prohibited status for the group
6. Save

> **UI ask**: The "first item determines properties" rule is non-obvious. Show a label on item #1: `"Primary — determines group category & access type"`. Make this draggable to reorder.

#### 4.5.3 Edit / Delete
Standard CRUD via ellipsis icon under Actions.

---

### 4.6 Software Category

Path: `Inventory > Manage Software Category`

#### 4.6.1 Pre-defined categories (9)
1. Accounting
2. Database
3. Development
4. Driver
5. Game
6. Graphics
7. Internet
8. Multimedia
9. Others

#### 4.6.2 Constraint — single category per software
> A software can be in only ONE category at a time. Assigning to a new category auto-removes it from the previous one.

> **UI ask**: When moving software to a new category, show: "Moving 'Visual Studio Code' from 'Development' to 'Custom: Dev Tools'. Continue?"

#### 4.6.3 Custom categories
Create unlimited custom categories. Useful for org-specific taxonomies (e.g. "Approved for Finance Team", "Pilot Software").

---

### 4.7 Prohibit Software

Path: `Inventory > Prohibit Software`

> ⚠️ **Windows Desktop Apps only**. UI must reinforce this constantly (banner, tooltips, filter pre-applied to Windows).

#### 4.7.1 Lifecycle / state machine

```
[Software Added to Prohibited List]
        │
        ▼
[Inventory scan runs on endpoint]
        │
        ▼
[Software detected on endpoint] ──→ State: DETECTED
        │
        ├── (a) Auto-Uninstall enabled?
        │     │
        │     ├── YES → State: PENDING UNINSTALL → State: UNINSTALLING → State: UNINSTALLED | FAILED
        │     │
        │     └── NO  → State: DETECTED (admin sees report, must act manually)
        │
        └── (b) User requests permission to use it (from agent tray)
                    │
                    ▼
              [Request in User Requests tab]
                    │
                    ├── Endpoint Central console
                    │     └── Admin: Approve | Reject
                    │
                    └── ServiceDesk Plus (if integrated)
                          └── Resolved as ticket in SDP (NOT in EC console)
                          │
                          ▼
                    State: APPROVED → user can install/use
                          ↓ or
                    State: REJECTED → software gets removed per auto-uninstall policy
```

#### 4.7.2 Add prohibited software — workflow

1. `Add Prohibited Software` button → opens dialog
2. Dialog lists all software detected in managed computers (must have ≥1 inventory scan done — otherwise empty state)
3. Multi-select → move to "Prohibited List" via shuttle UI
4. Click `Update`

> **Edge case**: If the selection includes a Software Group, **only the parent (first) software of the group gets added**. Show this explicitly — don't surprise the admin.

#### 4.7.3 Auto-Uninstall Policy — fields

| Field | Type | Notes |
|---|---|---|
| Enable Automatic Uninstallation | checkbox | Master toggle |
| Max software to uninstall per refresh cycle | integer | Default? Warn at high values: "High count = high CPU during uninstall" |
| Notify user before uninstalling | checkbox | Requires Notify User Settings configured |
| Custom user notification message | text | Optional custom warning shown to end-user |
| Wait window (days) | integer | "Remove the software N days after detection" — grace period |

> **UI ask**: The "Max software per refresh cycle" + "Wait window" combo can confuse. Show a preview: "With current settings: If 50 prohibited apps are detected on a machine, 5 will be uninstalled per cycle. Full cleanup ~10 cycles (~15 hours at 90-min cycles), starting 3 days after detection."

#### 4.7.4 Uninstall command configuration

- `.msi` → auto-uninstall works by default
- `.exe` → silent switches REQUIRED. Two paths:
  - **Pre-fill Uninstall Command**: Fetches from Add/Remove Programs registry — admin only adds silent switch
  - **I will specify Myself**: Manual command + switch — recommend test before save

> **UI ask**: For `.exe`, show an explicit "Test uninstall command" button before saving — admin enters a test target machine, EC runs it once, returns success/failure with output log. Saves a ton of failed bulk uninstalls.

#### 4.7.5 Exclusions

Two scopes:

| Type | Where | Effect |
|---|---|---|
| **Per-software Exclusion** | On individual prohibited software row → click `Exclusions` link | Specified computers/groups can have THIS specific prohibited software |
| **Global Exclusion** | `Configure Global Exclusion` button | Specified computers/groups bypass ALL prohibited software rules |

> **UI ask**: Global Exclusion is a security exception — make it visually distinct (red banner: "X computers globally excluded from prohibited software enforcement"). RBAC-gate this action.

#### 4.7.6 End-user request flow

EC version 10.0.192+ feature.

```
End-user clicks agent tray icon
    └── "Prohibited Software" tab
        └── Sees list of prohibited apps in their org
            └── "Request to use [App Name]" → enters justification
                └── Request appears in
                    ├── Inventory > Prohibit Software > User Requests tab
                    │   OR
                    └── ServiceDesk Plus ticket queue (if integrated)
                        ├── EC integration setting: Send requests as SDP tickets
                        └── SDP template name configured
```

Admin/Technician approves → user can install. Resolution must happen in SDP if integrated (NOT in EC console).

> **UI ask**: User Requests tab needs request count badge ("3 pending"). Show end-user justification, requested software, requesting user, requested time, status. Action: Approve / Reject + comment.

#### 4.7.7 Auto Uninstallation Status

Path: `Prohibit Software > Auto Uninstallation Status > Detailed View`

Shows per-attempt status: success / failed / pending, with remarks. This is the audit log.

---

### 4.8 Block Executable

Path: `Inventory > Block Executable`

#### 4.8.1 What it does (distinct from Prohibit)
Prevents an .exe from running using either:
- **Path Rule** — block by file path (and optionally file name + extension)
- **Hash Rule** — block by MD5 / SHA256 / AppLocker hash

#### 4.8.2 Prerequisites (must enable on target!)
1. Local Group Policy enabled on target machine
2. Default security Policy = "Unrestricted"
3. Local Group Policy enabled for Administrator

> **UI ask**: On policy creation, show a prereq checklist with status per target machine. Block save if any target fails.

#### 4.8.3 Create Block Executable Policy — workflow

```
Inventory > Block Executable > Add Policy
    │
    ▼
Step 1: Choose target Custom Group
    ├── "All Computers Group" (default — applies to everything)
    │   ⚠️  Confirmation modal: "This blocks the .exe across the ENTIRE fleet"
    │
    └── Specific Custom Group (unique or static)
    │
    ▼
Step 2: Add Executable to block
    │
    ├── Path Rule
    │   └── Specify file path + filename + extension
    │       "Use Path Rule if filename/path stays static.
    │        ⚠️  Renaming/relocating the file breaks the rule."
    │
    └── Hash Rule
        │
        ├── MD5 hash    (use: certutil -hashfile <path> md5)
        ├── SHA256 hash (use: certutil -hashfile <path> sha256)
        └── AppLocker   (use PowerShell: Get-AppLockerFileInformation)
            ⚠️  AppLocker hash only works on
                Windows 10 build 1803+ and Server 2019+
            ⚠️  Files > 200 MB need a special PowerShell snippet
                (show in UI as collapsible code block)
    │
    ▼
Save Policy
```

#### 4.8.4 Hash computation cheat sheet — render inside UI

Show these copy-paste-ready commands inline (collapsible "How to get the hash" panel):

```cmd
:: File size
dir "C:\Program Files\Google\Chrome\Application\chrome.exe"

:: MD5
certutil -hashfile "C:\Program Files\Google\Chrome\Application\chrome.exe" md5

:: SHA256
certutil -hashfile "C:\Program Files\Google\Chrome\Application\chrome.exe" sha256

:: AppLocker (PowerShell only — not CMD)
(Get-AppLockerFileInformation -Path "C:\Program Files\Google\Chrome\Application\chrome.exe").Hash -replace '^SHA256 0x', 'Hash: '
```

> **UI ask**: "Copy command" button per snippet. Help link to AppLocker prereqs.

#### 4.8.5 Limitation — system-initiated executables
> Block Executable does NOT support blocking system-initiated executables. UI tooltip on the executable input: "System-launched processes cannot be blocked here. Use App Control module for system-level allow/deny."

---

### 4.9 Software Metering

Path: `Inventory > Actions/Settings > Software Metering`

> Windows + Mac (NOT Linux). UI must hide Mac options for Windows-only orgs and vice versa.

#### 4.9.1 Concept
Agent watches process activity for specified software, sends usage stats to server. Data buckets:
- **Frequently Used**
- **Occasionally Used**
- **Rarely Used**

These drive decisions on license retention vs revocation.

#### 4.9.2 Metering Rule — fields

| Field | Required | Notes |
|---|---|---|
| Platform | yes | Windows / Mac |
| Software Name | yes | Picked from inventory typeahead — software must have been detected via scan |
| Rule Name | yes | Must be unique + descriptive |
| File Name | yes | The exact executable filename. Windows: `.exe` (e.g. `chrome.exe`). Mac: `.app` (e.g. `Brave Browser.app`) |

> **UI ask**: Inline help with platform-specific instructions for finding the File Name:
> - Windows: Task Manager → Details tab → look under Name column
> - Mac: Activity Monitor → CPU tab → right-click process → "Sample Process" or "Open Files and Ports" → look at path like `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser` — the .app folder name is your value

#### 4.9.3 Constraints
- Rule names are unique — cannot reuse
- Cannot meter software Groups (groups not supported)
- Data collection starts from **next refresh cycle** (~90 min)
- Server posts daily — **data visible from next day**

#### 4.9.4 Reports — 3 types
Path: `Reports > Inventory Reports > Software Metering Reports`

| Report | Content |
|---|---|
| **Software metering rules summary** | Per-rule: Discovered count, Usage count, Usage duration |
| **Computers with metered software** | List of computers running metered SW, per-computer time-range view |
| **Users with metered software** | User-specific usage stats (useful for floating users) |

#### 4.9.5 Data retention
> Last **90 days** of metering data retained. Older data not queryable.

> **UI ask**: When admin filters reports beyond 90 days, show: "Only 90 days of metering data is stored. Showing available data: [date] to [date]." Don't silently return zero.

---

### 4.10 Custom Fields

Path: `Admin > Global Settings > Custom Field > Add Custom Field` (also accessible from Inventory)

#### 4.10.1 Use case
Attach org-specific attributes to assets. Example: Department column on every computer (Engineering / Marketing / Sales / HR).

#### 4.10.2 Field configuration

| Field | Type | Notes |
|---|---|---|
| Field Name | string | Internal + display label |
| To be displayed in | enum | **Computer View** OR **Software View** (single scope) |
| PII Column | checkbox | If checked, data is **masked** in views/reports (privacy compliance) |
| Input Format | enum | Text / Number / Date / Dropdown / Multi-select etc. |
| Size | integer | Char limit for text |
| Default Value | depends on Input Format | |
| Description | text | Shown as tooltip |

#### 4.10.3 Where custom fields surface

- **Scope of Management (SoM) → Computers** view
- **Admin → Global Settings → Custom Group** (can use custom field in group rules)
- **Inventory → Scanned Computers** column
- **Inventory → All Computers** column
- **Inventory → Software Summary** (if Software View custom field)

> **UI ask**: When creating a custom field flagged as PII, show a privacy notice + an "Affected users (roles that CAN see unmasked)" RBAC picker. Don't leave PII masking ambiguous.

---

### 4.11 Warranty Management

Path: `Inventory` (warranty fields surface in Computer detail) + `Admin > Global Settings > HP Developer App Settings`

#### 4.11.1 Auto-fetched vendors

| Vendor | Auto-fetch | Setup needed |
|---|---|---|
| Dell | ✅ | None — works out of the box |
| Toshiba | ✅ | None |
| Lenovo | ✅ | None |
| HP | ✅ | **HP Developer App Settings configuration required** (Client ID + Secret Key from HP Developer Portal) |
| Others | ❌ | Manual entry only |

#### 4.11.2 HP setup workflow — show in UI step-by-step

```
1. Org's HP Account Manager emails warrantyapi.customers@hp.com requesting HP Developer Portal access
        ↓
2. HP grants access to portal + Warranty API
        ↓
3. Admin logs into HP Developer Portal → searches "HP Warranty API"
        ↓
4. Click "Get credentials" → fill:
        - Select API Product: HP Warranty API
        - Credentials Name: (the service that'll consume it, e.g. "Endpoint Central Production")
        - Description: business purpose for HP review
        ↓
5. Submit → request goes to "Pending" → wait for HP approval
        ↓
6. On approval: Client ID + Secret Key visible under My Dashboard > My Credentials
        ↓
7. In Endpoint Central:
        Admin > Global Settings > HP Warranty Settings
        Enter: Client ID, Secret Key, Secret Key created date, Secret Key expiry date
        ↓
8. ⚠️  Credentials valid for 90 days by default. UI must show:
        - Expiry countdown
        - Alert at T-14 / T-7 / T-1 days
        - "Update credentials" link
```

> **UI ask**: Credentials page has a status pill: ✅ Valid until [date] | ⚠️ Expires in N days | ❌ Expired. Auto-fetch pauses on expiry.

#### 4.11.3 Manual warranty entry

Path: `Admin > Global Settings > Add Custom Data for Computers`

Per-computer fields:
- Computer Location
- Owner
- Search Tag
- Owner Email ID
- Product Number
- Shipping Date
- Expiry Date
- Notes

Also bulk: Bulk Update + CSV import.

> ⚠️  **Critical gotcha** — If you manually update Shipping Date AND Expiry Date for a computer, **automatic warranty fetch is DISABLED for that computer**. UI must show this warning explicitly: "Manually entered warranty disables automatic vendor fetch for this device."

#### 4.11.4 Warranty Reports
Path: `Reports > Inventory Reports > Warranty Reports`

Three sub-reports:
- **Soon-to-Expire Warranty**: Filter by Domain, Custom Group, Expiry Period (e.g. 30/60/90 days)
- **Expired Warranty**: Already expired
- **Unidentified Computers**: Warranty info could not be retrieved AND not manually specified

> **UI ask**: Soon-to-Expire is the primary actionable report. Default the expiry period to 90 days. Allow saving as a scheduled report → emailed weekly.

---

### 4.12 Inventory Alerts

Path: `Inventory > Actions/Settings > Configure Alerts`

#### 4.12.1 Alert categories (6)

| Category | Trigger |
|---|---|
| Hardware Changes | HW add/remove (input/output, storage, logical, memory, controller, network, port) |
| Software Modifications | Any install / uninstall on any managed endpoint |
| Prohibited Software Installation | Restricted software detected |
| License Compliance | Non-compliance / nearing expiry / used after expiry / under-utilized |
| Disk Space Management | Low total free / low per-partition free |
| Certificate Expiration | Cert nearing expiry — admin-configurable notification period |

#### 4.12.2 Delivery channels
- **Email** (requires Mail Server configured)
- **SMS** (requires SMS Server configured)
- **Mobile app push** (Endpoint Central mobile app)

#### 4.12.3 Configure workflow

```
Configure Alerts page
    ├── Per category: Enable Email checkbox → Save email recipients
    ├── Per category: Enable SMS checkbox → Save mobile numbers
    └── Per category: Threshold / scope picker
        (e.g. License Compliance — "Notify when usage falls below X%")
```

> **UI ask**: Per-category accordion layout — admin opens only the categories they care about. Show last-triggered timestamp per category as a freshness indicator.

#### 4.12.4 Viewing inventory alerts (the inbox)
Path: `Inventory > Inventory Alerts`

Standard alerts inbox pattern: filterable list, per-row severity badge, ack/dismiss/snooze actions.

---

### 4.13 Inventory Reports

Path: `Reports > Inventory Reports` (cross-link from Inventory tab)

#### 4.13.1 Report families (5)

1. **Hardware Inventory Reports** — by manufacturer / device type / memory / age / etc.
2. **Software Inventory Reports** — by category / vendor / installation count
3. **Software Compliance Reports** — license over/under/in-compliance/expired summary
4. **System Details Reports** — services, users, groups, etc.
5. **Warranty Reports** — soon-to-expire / expired / unidentified

#### 4.13.2 Export formats
- PDF
- CSV
- Scheduled email delivery (configure frequency)

> **UI ask**: All reports support a "Schedule" action — saves the filter set + delivery cadence + recipients. Surface "Scheduled Reports" management view.

---

## 5. Field-Level Inventory — Full Tables

### 5.1 Computer record — full field list (by tab)

#### Summary tab
- Computer Name
- IP Address (IPv4, IPv6)
- MAC Address
- Operating System
- OS Version / Build
- Domain
- Logged-on User
- Last Scan Time
- Scan Status
- Custom Fields (admin-configured)
- Owner / Owner Email / Location / Search Tag / Product Number / Shipping Date / Expiry Date / Notes

#### System tab
- Services (Name, Status, Startup Type, Account)
- Local Groups (Name, Description, Members count)
- Local Users (Name, Full Name, Status, Last Logon, Admin Y/N)
- (Windows-only) Windows Defender status + threats list

#### Hardware tab
- Processor (Model, Cores, Clock)
- RAM (Total Installed, Slot details)
- Storage (per disk: Model, Capacity, Free, Type)
- Network Adapters (Name, MAC, IPv4, IPv6, Type)
- Display Adapters / GPU
- Peripherals (Keyboard, Mouse, Monitor, USB devices)
- BIOS / UEFI Version
- Motherboard / Chassis info
- Battery (laptop)

#### Software tab
- Software Name, Version, Vendor
- Install Date
- Installed User Account (SYSTEM or username)
- Software Type, Access Type
- Size

#### Certificates tab (Windows only)
- Certificate name
- Issuer
- Issued To
- Valid From / To
- Thumbprint
- Status (Valid / Expired / Soon-to-expire)
- Store (Personal / Trusted Root / etc.)

#### File Details tab (Windows + Linux)
- File path, name, size, hash, last modified, owner

#### Security tab (Windows + Mac)
- Antivirus (Name, Version, Status, Signature Last Updated)
- Firewall (Status, Profile, Rules count)
- Encryption / BitLocker Status (Windows)
- FileVault Status (Mac)

#### USB Audit tab (Windows only)
- Device, Type, First Connected, Last Connected, User, Action (Allow/Block)
- Cross-link to Device Control module

#### History tab (all OS)
- Scan history (timestamp, type, status, duration, error if any)
- Inventory change log (what HW/SW changed when)

### 5.2 Software record — full field list
(See 4.3.1 — already enumerated above)

### 5.3 License record — full field list

- Software Name (FK to software record)
- Manufacturer
- Software Version
- Purchased Count
- Installed Count (rolling — from scans)
- Remaining Count
- Compliance Status
- Licensed To
- Purchased Date
- License Expiry Date
- License File (file attachment)
- Invoice (file attachment)
- Remarks
- Associated Computers (M:N relationship)

### 5.4 Prohibited Software record — full field list

- Software Name
- Manufacturer
- Detected on (computer count + drill-down)
- Auto-Uninstall enabled (Y/N)
- Uninstall command (configured / not configured)
- Wait window (days)
- Per-software Exclusions (count + drill-down)
- User Requests pending (count)
- Status per computer: Detected / Pending Uninstall / Uninstalling / Uninstalled / Failed / Excluded / Approved-for-User

### 5.5 Block Executable Policy record — full field list

- Policy Name
- Target Custom Group(s)
- Rule Type (Path | Hash)
- For Path Rule: File path, File name, Extension
- For Hash Rule: Hash type (MD5/SHA256/AppLocker), Hash value, File size
- Created Date / By
- Last Modified
- Enforcement status (Active / Suspended)

### 5.6 Metering Rule record — full field list

- Platform (Windows | Mac)
- Software Name
- Rule Name (unique)
- File Name (.exe or .app)
- Discovered Count (from scans)
- Usage Count (rolling)
- Usage Duration (rolling)
- Created Date
- Last Refresh

---

## 6. Workflows — Common admin journeys (templates)

### W1. New environment — Initial inventory setup
```
1. Define Scope of Management (SoM)
2. Deploy agents to all in-scope machines
3. Wait for Agent Initial Scan to complete (auto)
4. Verify scan status on every machine (Inventory > Scanned Computers)
5. Investigate failures (RBAC of admin acct, DCOM, WMI, ports)
6. Configure Asset Scan Settings (enable Drivers/Services/Shares/Certificates if needed)
7. Configure schedule scan (weekly / nightly)
8. Configure Inventory Alerts (Email + SMS for critical categories)
```

### W2. License audit — quarterly
```
1. Inventory > Manage Licenses
2. Filter: Compliance Status = Under Licensed OR Expired
3. For each: drill to associated computers → reconcile
4. Run Software Compliance Report → schedule weekly to finance team
5. Add additional licenses via "Add More" for under-licensed items
6. Renew expired licenses → update Expiry Date + License File
```

### W3. Prohibited software cleanup
```
1. Define org's prohibited list (gaming, P2P, IRC, social, etc.)
2. Inventory > Prohibit Software > Add Prohibited Software → bulk select from detected list
3. Configure Auto-Uninstall Policy:
     - Set max-per-cycle conservatively (e.g. 3)
     - Set wait window (e.g. 3 days)
     - Enable user notification with custom message
4. For .exe items: configure uninstall command (Pre-fill or Custom)
5. Test on pilot group via Custom Group + Per-software Exclusion for rest
6. Roll out to full fleet by removing exclusion
7. Monitor Auto Uninstallation Status > Detailed View
8. Approve user requests in User Requests tab (or SDP)
```

### W4. Lock down a specific .exe (e.g. compromised utility)
```
1. Compute hash on a known-good source machine
        (certutil -hashfile <path> sha256)
        — or use AppLocker for Win10 1803+
2. Inventory > Block Executable > Add Policy
3. Target: "All Computers Group" (or specific Custom Group)
4. Add Hash Rule with SHA256/AppLocker hash
5. Verify prereqs (Local GPO enabled + Unrestricted policy)
6. Save → rule deploys via next refresh cycle
7. Monitor policy enforcement in audit log
```

### W5. Software usage audit (over-licensed reclaim)
```
1. Inventory > Software Metering > Add Rule (per high-cost software)
        - Platform, Software Name, Rule Name, File Name (.exe/.app)
2. Wait 1+ day for data
3. Reports > Inventory Reports > Software Metering Reports
        - Software metering rules summary → identify Rarely Used
4. Cross-reference with Manage Licenses → reclaim from Rarely Used users
5. Reassign licenses to under-served users
6. Update License records
```

### W6. Warranty proactive renewal
```
1. (HP only) Configure HP Developer App Settings — Client ID + Secret Key
2. Reports > Inventory Reports > Warranty Reports > Soon-to-Expire
        - Filter: 90 days out
3. Export → procurement team
4. Schedule monthly auto-email
5. As renewals come in, update warranty manually if vendor not auto-supported
        (Admin > Global Settings > Add Custom Data for Computers)
```

### W7. Asset onboarding — new department
```
1. Create Custom Group for the new department
2. Create Custom Field "Department" (Computer View, type: Dropdown with enum)
3. Bulk update Custom Field for the new machines (CSV)
4. Run on-demand scan on the group
5. Add to relevant Software Categories
6. Assign warranty / owner info via "Add Custom Data for Computers"
```

### W8. Track shadow IT (unauthorized software)
```
1. Inventory > Software → filter Access Type = Allowed + Software Type = Non-Commercial
        (or filter by Vendor not in approved list)
2. Sort by Network Installation desc (most-installed unknowns first)
3. Investigate top items
4. For each undesirable item → add to Prohibited Software
5. Schedule weekly report → "New software detected" alert via Inventory Alerts
```

---

## 7. Error States & Troubleshooting (from KB)

The KB documents recurring scan failures. Each must have a tailored UI error state with actionable next steps.

### 7.1 Scan failure error catalog

| Error | Root cause | UI remediation copy |
|---|---|---|
| **Access Denied** | Invalid/expired domain admin credentials; DCOM disabled; workgroup machine with simple file sharing | "Check SoM admin credentials. Enable DCOM. If workgroup: turn off 'Use simple file sharing' (Folder Options → View)" |
| **RPC Server Unavailable** | Remote machine offline; Remote Administration disabled in firewall; File & Printer Sharing for MS Networks disabled | "Verify target is online. Enable Remote Administration in firewall. Enable File and Printer Sharing for MS Networks" |
| **Scanning Timed Out** | TCP ports 8020/8027 blocked; ManageEngine Endpoint Central 7-Remote Control service stopped; virtual adapter interference (multi-NIC server) | "Open TCP 8020 + 8027 in firewall. Ensure target is online during scan. Disable virtual adapters on EC server if multi-NIC" |
| **WMI Service Not Running** | WMI service stopped on target | "Start WMI Service on the target. Retry scan." |
| **Asset Scanning is Locked** | Internal lock state | "Contact endpointcentral-support@manageengine.com" |
| **Scheduled scan failed** | Firewall blocking ports; Local GPO not enabled on target | "Verify firewall exceptions for 8020 + 8027. Enable Local GPO on target." |
| **Inventory alerts not received** | Mail Server not configured | "Configure Mail Server Settings (link to mail config page)" |

### 7.2 Per-error UI panel pattern

For every failed scan, render:

```
┌─────────────────────────────────────────────────────────────┐
│ ❌ Scan Failed                                              │
│ Computer: DESKTOP-ABC123                                    │
│ Error: RPC Server Unavailable                               │
│ Last attempted: 14 min ago                                  │
│                                                             │
│ Likely cause:                                               │
│   The target machine is unreachable or has Remote           │
│   Administration disabled.                                  │
│                                                             │
│ Try these (in order):                                       │
│   ☐ Verify target is powered on and on the network          │
│   ☐ Enable Remote Administration in Windows Firewall        │
│   ☐ Enable File and Printer Sharing for MS Networks         │
│                                                             │
│ [Run prereq diagnostic] [Retry Scan] [Open KB article]      │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Edge Cases & Gotchas

Honest list of user pain points discovered from help docs, KB, FAQ. Design must address them:

1. **Software Metering — Windows + Mac only, NOT Linux.** Show platform pill on every metering rule + filter Mac-only orgs accordingly.

2. **Software Metering — data retention is 90 days.** When admin filters older, don't return empty silently — show explicit "Data older than 90 days is not retained" notice.

3. **Software Metering — rule names must be unique forever.** Once used, can't be reused even after deletion. UI should warn on rule name reuse: "Name conflicts with deleted rule 'Adobe Flash usage Q1 2023'. Choose different."

4. **Prohibit Software — Windows Desktop Apps only.** Mac/Linux users will look for this and find nothing. Show an OS-coverage banner. Never silent-disable.

5. **Prohibit Software — Software Group → only parent gets prohibited.** Non-obvious. Explicit dialog: "You selected Software Group 'MS Office — All Versions'. Only the primary item 'Microsoft Office 365' will be marked prohibited. Other versions stay allowed."

6. **Prohibit Software — Auto-Uninstall .exe needs silent switches.** UI must validate this before allowing the rule to go live. Provide a "Test command" button.

7. **Prohibit + ServiceDesk Plus integration:** Requests **must** be resolved in SDP if integrated. Cannot resolve in EC console. Show this in User Requests tab as a banner.

8. **Block Executable — Path Rule is fragile.** Renaming/relocating the file breaks it. UI should advise: "Use Hash Rule if attackers might rename the file."

9. **Block Executable — AppLocker hash works ONLY on Win10 1803+ / Server 2019+.** UI must check target OS versions and warn before save.

10. **Block Executable — files > 200 MB need special PowerShell snippet for hash.** Provide it inline.

11. **Block Executable — does NOT block system-launched executables.** Explicit tooltip.

12. **Block Executable — needs Local GPO enabled + Unrestricted security policy.** This trips up org policies. Show prereq checker per-target.

13. **Asset Scan Settings — toggling OFF deletes existing data.** Confirmation modal required.

14. **Asset Scan Settings — toggling ON populates only from next scan.** Show: "Data will appear after next scheduled scan, not immediately."

15. **Warranty manual entry disables auto-fetch for that computer.** Critical, easy to miss. Confirmation modal: "Manually entering warranty disables automatic vendor fetch for this device. Auto-fetch will resume only if you clear manual entry."

16. **HP Warranty credentials expire every 90 days.** Show countdown + alert at T-14/T-7/T-1.

17. **HP Developer Portal access is gated by HP Account Manager.** UI cannot automate this — must show step-by-step external workflow.

18. **Custom Field — single scope (Computer OR Software).** Can't be both. Make this an explicit radio.

19. **Custom Field — PII masking is RBAC-gated.** Configuration UI must show which roles can unmask.

20. **Hardware deltas need machine restart.** A new monitor plugged in won't show up until the user reboots. UI should explain this on the History tab.

21. **Core Properties Scan posts immediately.** IP/MAC/OS/Domain/Computer Name changes propagate instantly. UI freshness indicator can rely on these.

22. **Network Installation vs Managed Installation discrepancy.** RBAC-scoped admins see only Managed count — compliance math can look wrong. UI must show both with tooltips.

23. **Software Category — single category per software.** Reassign auto-removes from previous category. Explicit confirmation.

24. **Software Group — first item in list determines group properties.** Reorderable list with "Primary" badge on item #1.

25. **Uninstall from Inventory view — Computer-based vs User-based.** User-based requires Software Deployment package or User-based Custom Script. UI must inspect "Installed User Account" and route appropriately.

26. **Inventory alerts depend on Mail Server / SMS Server config.** If not configured, alerts silently don't fire. UI should show pre-flight check: "Mail Server: Not configured — alerts won't send. [Configure now]"

27. **Server load on bulk scan.** Best practices warn against scanning many endpoints simultaneously. UI should warn at threshold (e.g. selecting >100 computers for on-demand scan).

28. **Custom Group — static vs dynamic.** Dynamic groups update with new matching machines; static stay frozen. Cross-cutting concern from EC-CROSS module — surface in any group picker.

---

## 9. UI Screens Needed (deliverable list)

### 9.1 Browse / list screens (15)
1. Inventory Dashboard / Summary (KPIs across HW/SW/license/warranty)
2. Computers list (faceted, OS chips)
3. Computer Detail (with OS-aware tab strip — 9 tabs max)
4. Hardware aggregate view
5. Hardware → drill to computers using HW item
6. Software inventory list (the heaviest screen)
7. Software Detail (drill from software list)
8. Software → Computers using this software
9. Scanned Computers (scan status per machine)
10. Manage Licenses list
11. License Detail / Edit
12. Group Software list
13. Software Group Detail / Edit
14. Manage Software Category list
15. Category Detail / Edit

### 9.2 Policy / management screens (10)
16. Prohibit Software list
17. Add Prohibited Software dialog (shuttle picker)
18. Auto-Uninstall Policy config
19. Per-software Exclusions
20. Global Exclusion config
21. User Requests (for prohibited SW)
22. Auto Uninstallation Status — Detailed View
23. Block Executable Policies list
24. Add Block Executable Policy wizard (Path / Hash branches)
25. Software Metering Rules list

### 9.3 Operations / settings screens (8)
26. Scan Systems (On Demand) picker
27. Schedule Scan config
28. Asset Scan Settings (per-component toggles + destructive warnings)
29. Configure Inventory Alerts (6 categories × 3 channels)
30. View Inventory Alerts (inbox)
31. HP Warranty Settings (Client ID, Secret Key, expiry tracking)
32. Add Custom Data for Computers (single + bulk + CSV)
33. Custom Fields management

### 9.4 Reports screens (6)
34. Inventory Reports landing (5 categories tree)
35. Hardware Inventory Reports
36. Software Inventory Reports
37. Software Compliance Reports
38. System Details Reports
39. Warranty Reports (Soon-to-Expire / Expired / Unidentified)

### 9.5 Cross-cutting (4)
40. Search Asset (global typeahead — find any computer / software / license)
41. Bulk action toolbar (multi-select context-aware)
42. Export panel (CSV / PDF / Schedule)
43. Filter sidebar builder (saved filters)

---

## 10. Component Library — Inventory-Specific Components

Beyond the universal library (from EC-00 cross-cutting), the Inventory module needs these specialized components:

### 10.1 Data display
- **`AssetTable`** — virtualized list, column picker, column-pin, OS-aware column visibility, persistent per-user prefs
- **`OSAwareTabStrip`** — tab strip that hides tabs unavailable on the current record's OS
- **`ComputerSummaryCard`** — compact device card: hostname, OS icon, IP, MAC, last scan, status pill
- **`SoftwareRow`** — expandable row: name, vendor, version, install count, compliance, actions
- **`HardwareAggregateRow`** — HW name, type, manufacturer, count (clickable to drill)

### 10.2 Status / badge
- **`ComplianceStatusBadge`** — In-Compliance (green ✓) / Over Licensed (blue ↑) / Under Licensed (red ⚠️) / Expired (grey ⏱)
- **`AccessTypeBadge`** — Allowed / Prohibited (red), clickable
- **`SoftwareTypeBadge`** — Commercial / Non-Commercial
- **`WarrantyStatusBadge`** — In-Compliance / Soon-to-Expire / Expired / Unidentified
- **`ScanStatusPill`** — Pending / In Progress / Success / Failed / Partial
- **`UsageBucketTag`** — Frequently / Occasionally / Rarely Used
- **`OSIcon`** — Win / Mac / Linux / Android / iOS / etc.
- **`PIIMaskedField`** — masked value with "Show" toggle (RBAC-gated)

### 10.3 Pickers / inputs
- **`SoftwarePicker`** — typeahead from inventory; "Add software not in list" fallback
- **`ComputerShuttlePicker`** — Available ↔ Selected dual-list with toggle: "Installed Computers" vs "Managed Computers"
- **`SoftwareGroupOrdered`** — reorderable list with "Primary" badge on first item
- **`CategoryDropdown`** — pre-defined + custom categories
- **`HashTypeRadio`** — MD5 / SHA256 / AppLocker (with prereq warning on AppLocker)
- **`PathRuleInput`** — file path + name + extension fields with validation
- **`UninstallCommandInput`** — Pre-fill / Specify-myself radio + command field + "Test command" button
- **`WaitWindowInput`** — days-grace-period numeric with live preview

### 10.4 Specialized cards / panels
- **`LicenseCard`** — purchased / installed / remaining / expiry / compliance, with associated computers count
- **`ProhibitedSoftwareCard`** — software name, detected on N, auto-uninstall config, exclusions, requests pending
- **`MeteringRuleCard`** — rule name + platform + file name + discovered/usage/duration stats
- **`BlockExecPolicyCard`** — policy name, rule type, target group, status
- **`WarrantyTimelineCard`** — purchase date → expiry date with today-marker
- **`HPCredentialsCard`** — Client ID + Secret Key + expiry countdown + renew CTA
- **`ScanHistoryRow`** — timestamp + scan type chip + status pill + duration + error link

### 10.5 Wizards / multi-step
- **`AddLicenseWizard`** — 3-step (Select Software → License Details → Associate Computers)
- **`AddProhibitedSoftwareDialog`** — shuttle picker with Software Group warning
- **`AddBlockExecPolicyWizard`** — target group → rule type branch (Path | Hash) → save
- **`CSVImportWizard`** — generic with sample download, mapping, per-row validation

### 10.6 Feedback / alerts
- **`DestructiveConfirmDialog`** — "Turning this off will DELETE all stored data. Continue?"
- **`OSCompatibilityBanner`** — "This feature is available only for Windows Desktop Apps"
- **`PrereqChecklist`** — DCOM ✓ / WMI ✓ / Ports ✗ / GPO ✓ — with fix actions
- **`StaleDataNotice`** — "Last scanned 14 hours ago. Run scan now?"
- **`WarrantyExpiryAlert`** — countdown widget with renew CTA
- **`MeteringDataRetentionNotice`** — "Showing 90 days of available data"
- **`UninstallTestButton`** — runs test → returns success/failure with log

### 10.7 Charts / visualizations
- **`ComplianceDonut`** — 4-segment: In-Compliance / Over / Under / Expired
- **`SoftwareCategoryTreemap`** — fleet's software grouped by category
- **`UsageBucketHistogram`** — Frequent / Occasional / Rare distribution
- **`WarrantyTimelineGantt`** — soon-to-expire warranties on a calendar strip
- **`InventoryScanFreshnessHeatmap`** — fleet rows × time, color = scan recency

---

## 11. Cross-Module Dependencies

Asset Management is **upstream** to many modules. UI must respect these data contracts.

| Consuming module | What it consumes from Inventory |
|---|---|
| **Patch Management** | Software catalog (which apps to patch). Patch scan reuses inventory data; "Application Patches" filter shows only apps in inventory |
| **Vulnerability Management** | Same software list — CVEs are matched to detected versions. CIS/STIG benchmarks read OS + service config from Inventory |
| **Software Deployment** | "Installed?" check per package before deploy. Uninstall command pre-fill comes from Add/Remove Programs sync via Inventory |
| **EDR** | Process metadata, file hashes, services, drivers — Inventory scan must include these for IoCs to work |
| **App Control** | Reuses software list for greylist/blocklist; Audit Mode compares against inventory baseline |
| **EPM** | Discovery of admin-level installed apps comes from Inventory |
| **Device Control / USB Audit** | USB Audit tab on Computer Detail reads from Inventory's USB scan |
| **Browser Security** | Browser inventory (which browsers, which extensions) comes from Inventory scan |
| **DEX** | Device health metrics use Inventory's hardware data as baseline |
| **MDM** | Mobile inventory (apps installed, OS version, jailbreak status) lives in Inventory; separate scan paths but same UI patterns |
| **Reports** | All Inventory reports surface here too — same data, different presentation |

> **UI ask**: When admin is in a downstream module (e.g. Patch Management) and they need to see a computer's full inventory record, give a "View in Inventory" deep-link button. Don't duplicate inventory UI inside each module.

---

## 12. Reference URLs (sub-pages used to build this doc)

### Help docs — primary
- Module landing: https://www.manageengine.com/products/desktop-central/help/inventory/inventory_asset_management.html
- Inventory Scan: https://www.manageengine.com/products/desktop-central/help/inventory/scan_systems_for_inventory.html
- Asset Scan Settings: https://www.manageengine.com/products/desktop-central/help/inventory/asset-scan-settings.html
- Viewing Inventory Details: https://www.manageengine.com/products/desktop-central/help/inventory/viewing_inventory_details.html
- Viewing Software Details: https://www.manageengine.com/products/desktop-central/help/inventory/viewing_software_inventory_details.html
- Manage Software Licenses: https://www.manageengine.com/products/desktop-central/help/inventory/manage_software_licenses.html
- Create Software Groups: https://www.manageengine.com/products/desktop-central/help/inventory/create_software_groups.html
- Manage Software Categories: https://www.manageengine.com/products/desktop-central/help/inventory/manage_software_categories.html
- Software Metering: https://www.manageengine.com/products/desktop-central/help/inventory/software_metering.html
- Configure Prohibited Software: https://www.manageengine.com/products/desktop-central/help/inventory/configure_prohibited_software.html
- Block Executable: https://www.manageengine.com/products/desktop-central/help/inventory/block_executables.html
- Creating Custom Fields: https://www.manageengine.com/products/desktop-central/help/inventory/creating-custom-fields.html
- Configure Email Alerts: https://www.manageengine.com/products/desktop-central/help/inventory/configure_email_alerts_for_inventory.html
- Warranty Management: https://www.manageengine.com/products/desktop-central/help/inventory/inv-warranty-management.html
- Warranty Reports: https://www.manageengine.com/products/desktop-central/help/inventory/viewing_system_warranty_reports.html
- Viewing Inventory Reports: https://www.manageengine.com/products/desktop-central/help/inventory/viewing_inventory_reports.html

### Feature pages (marketing-driven positioning + features)
- IT Inventory Management: https://www.manageengine.com/products/desktop-central/it-inventory-management.html
- Software Inventory: https://www.manageengine.com/products/desktop-central/software-inventory.html
- Hardware Inventory: https://www.manageengine.com/products/desktop-central/hardware-inventory.html
- Software License Management: https://www.manageengine.com/products/desktop-central/software-license-management.html
- Software Metering: https://www.manageengine.com/products/desktop-central/software-metering.html
- Prohibited Software: https://www.manageengine.com/products/desktop-central/prohibited-software.html
- Block EXE / Block Application: https://www.manageengine.com/products/desktop-central/block-exe-application.html
- Software Warranty Management: https://www.manageengine.com/products/desktop-central/software-warranty-management.html
- Optimize Software Spend (usage-based license mgmt): https://www.manageengine.com/products/desktop-central/optimize-software-spend-usage-based-license-management.html
- Adding Additional Details For Computers: https://www.manageengine.com/products/desktop-central/inventory-management-adding-additional-details-how-to.html

### KB / FAQ
- Inventory Management KB: https://www.manageengine.com/products/desktop-central/inventory-management-knowledge-base.html
- General FAQ: https://www.manageengine.com/products/desktop-central/faq.html

### API (for understanding underlying data model)
- API Inventory landing: https://www.manageengine.com/products/desktop-central/api/api-inventory-view.html
- Inventory Summary API: https://www.manageengine.com/products/desktop-central/api/api-inventory-summary.html
- Scan Computers API: https://www.manageengine.com/products/desktop-central/api/api-inventory-scancomputers.html
- Software Licenses API: https://www.manageengine.com/products/desktop-central/api/api-inventory-softwarelicenses.html
- Software Metering API: https://www.manageengine.com/products/desktop-central/api/api-inventory-softwaremetering.html
- Prohibited Software API: https://www.manageengine.com/products/desktop-central/api/api-inventory-prohibitedsoftware.html

### Demo videos referenced in help docs
- Prohibit Software demo: https://www.manageengine.com/products/desktop-central/demo/inventory/prohibit-software.html
- Block Executable demo: https://www.manageengine.com/products/desktop-central/demo/inventory/block-exe.html
- Add License demo: https://www.manageengine.com/products/desktop-central/demo/inventory/add-license.html

---

## 13. Critical UX Tensions (design traps to avoid)

1. **Network vs Managed installation confusion** — RBAC-scoped admins see different numbers. Always show both with tooltips, never hide one silently.

2. **Prohibit vs Block confusion** — These are different mechanisms. Show a "Which should I use?" decision tree at the entry to both pages.

3. **Auto-uninstall is destructive at scale** — A bulk-apply across the fleet can be massively disruptive. Strong confirmations + dry-run / preview mode + staged rollout (Pilot Custom Group → Full fleet).

4. **Scan All has performance impact** — Don't make "Scan All" a single click. Warn about server overwhelm above N machines. Suggest Schedule Scan for fleet-wide cadence.

5. **Asset Scan Settings toggle-off deletes data** — Modal confirmation must spell out the data deletion consequence.

6. **Custom Field PII masking** — Forgetting to mask exposes employee data. Default to PII = ON for fields named like "Email", "SSN", "Owner", etc.

7. **License compliance is legal/audit-grade** — Under-Licensed must be visually unmissable. Hold all your other modules' Red signals to less alarming colors so Under-Licensed reads as Red.

8. **Warranty manual entry silently disables auto-fetch** — Critical, easy to overlook. Always confirm + always show "automatic fetch disabled" status on the computer record after manual entry.

9. **HP credentials expire every 90 days** — Easy to miss. Multi-channel reminders (in-product banner + email).

10. **Software Group "first item determines properties"** — Non-obvious. Always show a "Primary" badge + tooltip.

11. **Mass on-demand scan = bad practice** — Don't make the easy path the slow one. Surface "Schedule Scan" as the recommended path for >X targets.

12. **Cross-OS feature availability** — Half the inventory features are Windows-only. Don't grey-out without explanation. Show OS coverage badges everywhere.

13. **Single-source-of-truth pressure** — Inventory feeds 10+ other modules. If data is stale, everything downstream is wrong. Make freshness visible (last scan timestamp on every detail view).

14. **End-user request flow goes either to EC OR SDP, not both** — If SDP integration is on, requests live in SDP and EC's User Requests tab should clearly route them: "Resolve this request in ServiceDesk Plus → [open ticket]".

15. **Hardware scan deltas need a reboot** — A user who plugs in a new monitor won't see it for hours. UI shouldn't claim "real-time" hardware data — it's restart-triggered.

---

## 14. Status Lifecycle Summary (Inventory-specific)

Following the universal Endpoint Central status pattern (Draft → Saved → Deployed → InProgress → Completed), here are the specific lifecycles in Inventory:

### Inventory Scan
```
Idle → Pending → InProgress → (Success | Failed | Partial) → [Fail-safe retry?] → Final
```

### License record
```
Draft → Saved → (No status — license is a static record;
                  Compliance Status is computed per software, not the license)
```

### Prohibited Software (per computer)
```
Listed → Detected → (Auto-uninstall enabled?)
                       ├── Pending Uninstall → Uninstalling → Uninstalled | Failed
                       └── (No auto) → Detected (manual action needed)
                       
                  → (User requested?)
                       └── Requested → Approved | Rejected → (back to lifecycle)
```

### Block Executable Policy
```
Draft → Saved → Deploying → Active | Failed-to-deploy → (Suspended | Removed)
```

### Metering Rule
```
Saved → Awaiting Data (until next refresh cycle) → Active (collecting) → Reports populated
```

### HP Warranty Credentials
```
Configured → Valid → (T-14: Warning) → (T-1: Critical) → Expired → (Re-configure)
```

---

## 15. Quick reference — module signature for designers

> **One-paragraph mental model**: Inventory is a **catalog-driven, list-heavy, RBAC-aware** module where every change requires a scan to materialize. The dominant UI metaphor is faceted lists + detail drill-downs + compliance badges. The most important UX commitments are: **data freshness visibility**, **OS-aware adaptability**, **clear separation of "discover" (read) from "govern" (write)**, **non-destructive defaults** (especially for scan settings + auto-uninstall), and **trust-building error states** with actionable next steps.

> **The five jobs an admin must accomplish without friction**:
> 1. Know what's on the network (Computers / Software / Hardware views)
> 2. Stay license-compliant (Manage Licenses + Compliance Status badges)
> 3. Remove unwanted software (Prohibit + Block Executable)
> 4. Optimize spend (Software Metering → reclaim Rarely Used)
> 5. Plan ahead (Warranty + Alerts)
> 
> Every screen should map cleanly to one (and only one) of these five jobs.

---

**File**: EC-03 — Inventory & Asset Management (Deep Dive)
**Companion files**: EC-00 (Master), EC-01 (Patch Management), EC-02 (Vulnerability Management)
**Next**: EC-04 — Software Deployment (Package Creation, Templates, Repository, Self-Service Portal — say "next" for sequential, or specify module)
