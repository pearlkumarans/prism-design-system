# EC-01: PATCH MANAGEMENT — Deep Dive

> **Product:** ManageEngine Endpoint Central (formerly Desktop Central)
> **Module:** Patch Management
> **Console nav:** `Threats & Patches`
> **Sources analyzed:**
> - `/help/patch_management/patch_management_overview.html`
> - `/help/patch_management/patch_management_life_cycle.html`
> - `/help/patch_management/patch-scan.html`
> - `/help/patch_management/patch_management_configurations.html` (APD)
> - `/help/patch_management/enable_patch_approval.html` (Test & Approve)
> - `/help/patch_management/patch_management_views.html` (All views)
> - `/help/patch_management/patch-self-service-portal.html` (End-user SSP)
> - `/help/patch_management/patch-deployment-troubleshooting.html` (14 error categories)
> - Knowledge Base patch articles (error states)

---

## 0. WHY THIS MODULE MATTERS

Patch Management is **the** #1 reason customers buy Endpoint Central. Per their own framing:
> "Patch Management is undoubtedly one of the critical tasks for any IT admin. But that task is one amongst a million tasks which IT admins should focus on."

This means the UX has to nail two contradictory goals simultaneously:
1. **Make the routine case effortless** — admins shouldn't have to think about most patches
2. **Make the exception case findable** — when something goes wrong on 47 of 5000 machines, those 47 must surface immediately

This shapes every screen below.

---

## 1. CORE CONCEPTS / VOCABULARY

Admins use these words constantly — UI must use them consistently:

| Term | Meaning |
|---|---|
| **Patch** | A single update (KB12345, etc.) |
| **Bulletin** | Vendor advisory grouping related patches (e.g., MS22-001) |
| **Bulletin ID** | The advisory article ID issued by the vendor |
| **Patch ID** | Unique internal reference for each patch |
| **CVE** | Common Vulnerabilities and Exposures identifier (e.g., CVE-2024-12345) |
| **KB Number** | Microsoft Knowledge Base article number for a patch |
| **Q Number** | Microsoft KB Q-article reference |
| **Vulnerability DB** | Centralized DB of known patches/vulnerabilities synced daily |
| **Patch Repository** | The product's local store of downloaded patch binaries |
| **Severity** | Critical / Important / Moderate / Low (from vendor advisory) |
| **Approval Status** | Approved / Not Approved / Declined |
| **Download Status** | Whether the patch binary has been pulled from the vendor |
| **Reboot Required** | Whether installation needs a reboot |
| **Superseding Bulletin** | Newer bulletin that replaces this one |
| **System Health** | Healthy / Vulnerable / Highly Vulnerable (based on missing patches) |
| **APD** | Automate Patch Deployment — fully-automated task |
| **Test Group** | Pilot computers to validate patches before broad rollout |
| **SSP** | Self-Service Portal — end-user installs at their convenience |
| **Maintenance Window** | Defined time slot when patching is allowed to run |
| **Deployment Window** | Time during which a specific deployment can execute |
| **Refresh Cycle** | Agent's regular check-in with server |
| **Distribution Server (DS)** | Branch-office relay that hosts patches locally |
| **Scope of Management (SoM)** | The set of computers/domains under EC control |
| **Attention Required** | UI bucket for systems needing manual attention |
| **Zero-touch / Zero-day** | New patches deployed asap after release |

---

## 2. PATCH MANAGEMENT LIFECYCLE (5 STAGES)

Official 5-stage model — every patch goes through this:

```
┌─────────────────────────────────────────────────────────┐
│ 1. UPDATE VULNERABILITY DETAILS FROM VENDORS           │
│    - Sync with Vulnerability DB (daily auto, or manual) │
│    - Extensive tests to validate authenticity           │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. SCAN THE NETWORK                                     │
│    - Discover systems within Scope of Management        │
│    - Agent runs lightweight scan in background          │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. IDENTIFY PATCHES FOR VULNERABILITIES                 │
│    - Compare installed vs available                     │
│    - List missing patches per system                    │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. DOWNLOAD AND DEPLOY PATCHES                          │
│    - Download from vendor → Repository → DS → Agent     │
│    - Apply within deployment window                     │
│    - Verify installation                                │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 5. GENERATE STATUS REPORTS                              │
│    - Per-patch, per-system, executive, compliance       │
│    - Schedule + email                                   │
└─────────────────────────────────────────────────────────┘
```

**UI mapping:** Each stage roughly corresponds to a major navigation node under **Threats & Patches**:
- Stage 1 → `Threats & Patches → Update Now / Patch Database Settings`
- Stage 2 → `Threats & Patches → Systems → Scan Systems`
- Stage 3 → `Threats & Patches → Patches → Missing Patches`
- Stage 4 → `Threats & Patches → Deployment → Manual Deployment / APD / Test and Approve`
- Stage 5 → `Reports → Patch Reports`

**Design implication:** Surface this 5-step model as **horizontal stepper or progress nav** for new users; once familiar, they can jump anywhere.

---

## 3. NAVIGATION MAP (Within Threats & Patches)

Inferred from doc references — the IA inside this module:

```
Threats & Patches
│
├── Update Now
│   └── Update Vulnerability DB (button + scheduled config)
│
├── Patches
│   ├── Applicable Patches  ← All patches relevant to your network
│   ├── Top-Priority Patches
│   ├── Missing Patches    ← Most-used screen
│   ├── Installed Patches
│   ├── Supported Patches
│   ├── Latest Patches
│   ├── Downloaded Patches
│   └── Declined Patches
│
├── Systems
│   ├── Scan Systems       ← Initiate / view scan status
│   ├── Highly Vulnerable Systems
│   ├── Vulnerable Systems
│   ├── Healthy Systems
│   └── Attention Required
│       ├── Failed Patch Deployments
│       └── Reboot Pending
│
├── Deployment
│   ├── Automate Patch Deployment (APD)
│   ├── Manual Deployment
│   ├── Test and Approve
│   ├── Deployment Policies
│   └── Decline Patches
│
├── Settings
│   ├── Patch Database Settings
│   ├── System Health Policy
│   ├── Self Service Portal Settings
│   │   ├── Display options (tray / start menu / desktop)
│   │   └── Rebranding (logo, colors, name)
│   └── Patch Cleanup Settings
│
└── Reports (cross-module)
```

**Key insight:** The product separates the **Patch-centric view** (`Patches` tab) from the **System-centric view** (`Systems` tab). Same data, two slicings — this duality must be obvious to users.

---

## 4. PATCH SCAN — DEEP DIVE

### 4.1 Pre-requisites (must surface in onboarding UI)

1. **Vulnerability DB Sync**
   - Updated automatically every day (for on-prem)
   - Cloud: no manual update needed
   - Manual trigger: `Threats & Patches → Update Now → Update Vulnerability DB`
   - **Without sync, no scan can find new patches**

2. **Agent Onboarding**
   - Agent must be installed AND onboarded
   - "Perform Patch Scanning" checkbox must be enabled
   - Path: `Admin → Agent Settings → General Settings → Actions to be performed after agent installation`

### 4.2 When does a patch scan trigger?

Six trigger scenarios (from docs):

| # | Trigger | UX implication |
|---|---|---|
| 1 | **Database Synchronization** | After daily auto or manual DB update |
| 2 | **Patch Installation** | After Install Patch / APD / Test and Approve completes |
| 3 | **System Reboot** | After reboot for patches requiring it |
| 4 | **APD/Test Group Actions** | When patches in APD/Test Group are approved/declined/not approved |
| 5 | **Manual Scan** | User-initiated from console or Agent Tray |
| 6 | **Agent Installation** | First scan after agent install (if option enabled) |

**Important nuance:** Scans CANNOT be restricted to specific machines — they run for all in-scope. There's no scheduling — it's event-driven. This is a "feature" the docs explicitly call out, meaning users get confused by it — UI must communicate this.

### 4.3 On-demand scan paths

**Through Agent Tray Icon (end user side):**
Right-click Agent Tray → Scan → Initiate Patch Scan

**Through Server Console (admin side):**
1. `Threats & Patches → Systems → Scan Systems`
2. Select computers
3. Click "Scan Systems" OR "Scan All"
4. **Hard limit: Scan All is capped at 100 computers** ← document this in tooltip

### 4.4 Continuous scanning behavior

- Scan happens "right after the database is synced"
- All systems scanned within 90 minutes after DB sync
- Scanning runs **incrementally** to avoid bandwidth bottlenecks
- Only **diff data** is sent to server (delta between consecutive scans)
- **Vulnerability + patch scans are not separate — they happen simultaneously**

**UI implication:** A "Scan Status" indicator must be visible globally, showing:
- Last DB sync time
- Last scan time
- % of systems scanned in current cycle
- Estimated completion

---

## 5. PATCH VIEWS — COMPLETE FIELD INVENTORY

The doc lists **17 columns** that can appear in patch list views. UI must support these as configurable columns:

### 5.1 Standard patch list columns

| # | Field | Type | Notes |
|---|---|---|---|
| 1 | **Patch ID** | Unique ID | Internal reference |
| 2 | **Bulletin ID** | Linked text | Click → Bulletin Details view |
| 3 | **Patch Name** | Linked text | Click → Patch Details view |
| 4 | **Patch Description** | Text | Brief description |
| 5 | **Patch Type** | Badge | Microsoft OS / MS App / Non-Microsoft (Adobe, Java, etc.) |
| 6 | **Severity** | Badge | Critical / Important / Moderate / Low (vendor rating) |
| 7 | **Approve Status** | Badge + action | Approved / Not Approved / Declined |
| 8 | **Release Date** | Date | When vendor released |
| 9 | **Download Status** | Badge | Downloaded / Not downloaded / Failed |
| 10 | **Affected Systems** | Number | Total systems requiring this patch |
| 11 | **Installed Systems** | Number | Where patch is installed |
| 12 | **Missing Systems** | Number | Where patch is missing |
| 13 | **Failed Systems** | Number, drillable | Click → list of failed computers + redeploy action |
| 14 | **Platform** | OS badge | Windows / Mac |
| 15 | **Vendor** | Text | Microsoft / Apple / Adobe / etc. |
| 16 | **Reboot** | Yes/No icon | Reboot required? |
| 17 | **Patch Uninstallation** | Yes/No icon | Uninstall supported? |

### 5.2 Bulletin Details (drill-down)

When user clicks Bulletin ID:

- Bulletin ID
- **Posted On** date
- **Updated On** date
- **FAQ Page** (link to vendor)
- **Q Number** (link to KB article)
- **Issue** (related issue description)
- **Bulletin Summary** (brief summary)
- **Patch Details** section (name + affected products)

### 5.3 Patch Details (drill-down)

When user clicks Patch Name:

- Patch ID
- Patch Name
- Bulletin ID
- **MS Knowledge Base** (KB article ref)
- Severity
- Reboot required
- Download Status
- **Location Path** (complete download URL from vendor) ← shows transparency
- **Superseding Bulletin ID** (which newer bulletin replaces this)
- **File and registry changes** the patch makes ← important for compliance/audit

### 5.4 View categories

**All Patches View:**
- Applicable Patches (relevant to your network)
- Top-Priority Patches
- Missing Patches ← most-trafficked view
- Installed Patches
- Supported Patches
- Latest Patches (and Detailed View)
- Downloaded Patches
- Declined Patches

**All Systems View:**
- Highly Vulnerable Systems
- Vulnerable Systems
- Healthy Systems

System health classification is based on missing critical patches. **A "healthy" system = all critical patches installed.**

---

## 6. AUTOMATE PATCH DEPLOYMENT (APD)

### 6.1 What APD does

End-to-end automation:
1. Auto-scan after DB sync
2. Detect missing patches matching criteria
3. Auto-download
4. Auto-deploy in **the very next deployment window** (no waiting for next scheduler cycle)

### 6.2 Key benefits (from docs)

1. "Deployments are fast, and security is tightened due to readily available patches"
2. **No waiting for next APD scheduler** — approved patches deploy in the very next window
3. Handles offline systems: when agent reconnects, gets scanned in next refresh, then deploys in subsequent refresh cycle
4. **Loops until zero missing patches** for the APD criteria
5. Detailed history view of all APD activity

### 6.3 APD task creation flow (multi-step wizard)

**Step 1: Define Task**
- Platform (Windows / Mac / Linux)
- Task name + description

**Step 2: Select Applications**
- **Updates and Severities** filter
  - Microsoft Updates: by update type + severity
  - Third-Party Updates: by update type + severity
- Application scope (3 options):
  - **Patch All Applications**
  - **Patch Specific Applications** (multi-select)
  - **Patch All Applications Except** (exclusion list)
- Toggle: **Driver Updates** checkbox

**Step 3: Choose Deployment Option**
- Deploy to endpoints (default)
- **Publish to Self Service Portal (SSP)** ← lets users install at their convenience

**Step 4: Deployment Settings**
- **Apply Deployment Policy** (pick from list)
- Reboot policy
- Pre-deployment activities (e.g., Wake on LAN)
- Post-deployment activities (e.g., notification)

**Step 5: Define Target**
- Custom groups (dynamic preferred for large fleets)
- Specific computers
- Filter by system type (laptop / desktop / server)

**Step 6: Configure Notifications**
- On approval
- On failure
- On reboot pending

**Step 7: Review & Create**

### 6.4 APD history view

After creation, each APD task has a detailed history view showing:
- Run timestamp
- Patches deployed
- Systems targeted
- Success / failure breakdown
- Failed patches → drill into errors

---

## 7. TEST AND APPROVE WORKFLOW

This is the **safety net** for risky patches. Critical for production servers.

### 7.1 Approval modes (toggle at module level)

`Threats & Patches → Deployment → Test and Approve → Patch Approval Settings`

Two options:
1. **"Automatically without testing"** (default)
   - New patches auto-approved if they pass ManageEngine's evaluation
   - For low-criticality fleets — fast time-to-deploy
2. **"Test and Approve"** (recommended for production)
   - New patches default to "Not Approved"
   - Must be tested in pilot group first

### 7.2 Switching modes — important warning

> "If you change Patch Approval Settings from 'Test and Approve' to 'Automatically without testing', all the created test groups will be deleted automatically."

**UI implication:** This destructive switch needs a strong confirmation modal with explicit listing of test groups that will be deleted.

### 7.3 Handling existing patches when switching

When switching TO "Test and Approve" mode, choose:
- **Retain Approval Status** (existing patches keep current status, new patches start as Not Approved)
- **Mark Patch as Not Approved** (everything re-evaluates)

### 7.4 Test Group creation

`Test and Approve → Add Group`

**Define Task section:**
- Platform: Windows / Mac / Linux
- Group Name: target group of pilot computers

**Deployment Option:**
- Microsoft Updates (by Updates + Severities)
- Third-Party Updates (by Updates + Severities)
- For each: Patch All Apps / Patch Specific Apps / Patch All Except
- Optional: Driver Updates toggle

**Deployment Settings:**
- **Deploy patches after N days from vendor release** (recommend: 0 days for fast testing)
- **Apply Deployment Policy** (recommend: "Deploy any time at the earliest")
- **Note:** Only **Not Approved** patches deploy to test group. Approved or Declined patches don't.

**Notification Settings (optional):**
- On approval
- On deployment failure during testing

**Approval Mode:**
- Toggle: **"Automatically approve tested patches after N days"**
- Logic: A patch auto-approves only if it was **successfully installed on at least one machine AND had no failures across any machines** during the N-day window
- If it failed on any pilot → does NOT auto-approve
- Admin must review failures and decide

### 7.5 Manual approval path

For granular control: `Threats & Patches → Missing Patches → select → Mark as → Approved / Declined / Not Approved`

### 7.6 Platform support matrix

| Capability | Windows | Mac | Linux |
|---|---|---|---|
| Test & Approve (auto) | ✅ | ✅ | ✅ |
| Manual selective approval | ✅ | ✅ | ❌ |

---

## 8. SELF-SERVICE PORTAL (SSP) FOR PATCHES

**End-user-facing UI** — distinct from admin console. Critical for:
- Servers (admin pushes, owner installs during their downtime)
- Critical machines (CT scanners, MRI, manufacturing equipment — can't tolerate forced patching)

**Platforms supported:** Windows, Linux only (no Mac SSP for patches)

### 8.1 Publishing flow (admin side)

**Via Manual Deployment:**
1. `Threats & Patches → Patches → Missing Patches`
2. Select patches
3. Click "Install/Publish Patches"
4. In Deployment Settings → Deployment Option → **"Publish to Self Service Portal (SSP)"**
5. Configure & Deploy

**Via APD:**
1. APD task wizard → Choose Deployment Option → select "Publish to Self Service Portal (SSP)"
2. Approved patches auto-publish to SSP for selected targets

### 8.2 End-user access (Windows)

Prerequisites — admin must enable:
1. `Admin → SoM Settings → Agent Settings → Agent Tray Icon`
2. Enable "Show Agent Icon" in System Tray
3. Enable "Show Self Service Portal Menu"
4. Save

User access paths (three options):
- Right-click Agent Tray icon → "Self Service Portal"
- Double-click desktop shortcut (if enabled)
- From Start Menu (if enabled)

### 8.3 End-user access (Linux)

CLI-based:
```
cd /usr/local/manageengine/uems_agent/bin
sudo ./StartSelfServicePortal.sh
```

### 8.4 End-user SSP console

Simple UI for non-technical users:
- "Updates" tab → list of patches published for this machine
- **"Install" button** per patch
- Install at convenience → patch installs

### 8.5 SSP Settings (admin)

`Threats & Patches → Settings → Self Service Portal Settings → Settings`

Display options (multi-select):
- Show in agent tray
- Show in start menu
- Show as desktop shortcut

Once enabled, SSP appears in all selected places when patches are first successfully published.

### 8.6 SSP Rebranding (admin)

`Threats & Patches → Settings → Self Service Portal Settings → Rebranding`

Customizable:
- Logo (replace EC logo with company logo)
- Name (replace product name)
- Header colors
- Table colors

**Why this matters:** Drives adoption. Users see "ACME IT Portal" not "ManageEngine Endpoint Central" — feels native.

**UI implication for the rebranding screen:**
- Live preview pane (left side preview, right side controls)
- Upload zone for logo (PNG / SVG, with size guidance)
- Color picker (hex input + swatch)
- Reset to default button
- "Save & Push" with deployment progress

---

## 9. DEPLOYMENT TROUBLESHOOTING — 14 ERROR CATEGORIES

This is **gold** for error-state UI design. Every category has a defined Main View → Sub View pattern.

**Access path:** `Deployment → Automate Patch Deployment (or Manual Deployment) → click task → Troubleshoot → Setup/Component Issues OR Installation Issues`

### 9.1 The 14 error categories

| # | Category | Type | Main View shows | Sub View shows | Actions |
|---|---|---|---|---|---|
| 1 | **Agent Upgrade Failure** | Setup | Single view; agents with version mismatch from server | — | Contact support, manual upgrade |
| 2 | **Distribution Server Issues** | Setup | List of remote offices with affected resource count | List of affected systems under each DS | Investigate DS status |
| 3 | **Agent Not in Contact** | Setup | Systems with last-contact-time >7 days | — | Network/power check |
| 4 | **Patch Download Failure in Server** | Setup | Two tabs: Patch Download Failure (+dependency patches), File Download Failure. Systems affected view | Patch + system breakdown | Retry download, check connectivity |
| 5 | **Patch Replication Failure** | Setup | Patches that failed to replicate to DS | Systems affected per failed patch | Re-sync DS |
| 6 | **Low Disk Space** | Installation | Resources with patch count failed due to disk space | Patch details for that resource | User notification, cleanup |
| 7 | **Patch Download Failed in Agent** | Installation | Agents failing to download | Per-patch breakdown | Retry, check agent storage |
| 8 | **Reboot Pending Machines** | Installation | Resources + count of patches waiting reboot | Patches per resource | **Action: Shutdown / Restart from Main View** |
| 9 | **Systems Offline During Deployment Window** | Installation | Systems not live during window | — | Re-schedule, enable WoL |
| 10 | **CBS Corruption** (Windows Component Based Servicing) | Installation | System View: systems + patch count. Detail View (tab): system + failed patch info | Tabbed view, accessible via patch count click | KB link provided |
| 11 | **.NET Corruption** | Installation | Same pattern as CBS: System View + Detail View | Tabbed | .NET repair |
| 12 | **Application Corruption** (non-OS apps) | Installation | Same pattern: System View + Detail View | Tabbed | App reinstall, KB linked |
| 13 | **Application Already Running** | Installation | Systems where target app is currently in use | Patch info per system | Wait for user to close app (lowest priority) |
| 14 | **Other Installation Failures** | Installation | Three tabs: Systems View, Detail View, Reason View | Multi-tab navigation | Drill into Reason View for root cause grouping |

### 9.2 UI patterns to replicate

**A. Main View → Sub View navigation**
Almost every error category uses this 2-level drilldown:
- Main View: aggregate (e.g., "47 systems with low disk space")
- Sub View: details per row (e.g., "patch IDs failing on this specific system")
- Navigate via clicking the count column

**B. Multi-tab Detail Views (for complex errors)**
Categories 10, 11, 12, 14 use:
- "System View" tab (system-centric)
- "Detail View" tab (patch-centric)
- "Reason View" tab (only for #14 — grouping by error reason)
- Cross-tab navigation via clicking counts

**C. Resolution flow at the bottom**
> "Once errors have been resolved, click **Sync Now** to get the updated status."

**D. Re-deploy logic**
- **Setup/Component issues** — auto re-deploy after resolution
- **Installation issues** — must manually re-deploy via Manual Deployment task

### 9.3 Note on platform support

> "The patch deployment troubleshooting feature is currently not supported for Mac and Linux systems."

UI implication: When viewing Mac/Linux failures, hide the Troubleshoot button or show "Not available for this platform" with link to manual remediation docs.

### 9.4 Inferred priority order (top of UI surface)

Based on impact + frequency:
1. **Reboot Pending** (high frequency, easy fix, big compliance impact)
2. **Low Disk Space** (top priority per docs)
3. **Distribution Server Issues** (blocks many at once)
4. **Agent Not in Contact** (silent failure)
5. **Application Already Running** (lowest priority per docs)

---

## 10. ATTENTION REQUIRED SECTION

Surfaced as a top-level UI element. Per the overview docs:

> "Highlight systems with failed patch deployments or pending reboots, enabling administrators to prioritize urgent remediation efforts effectively."

**Composition:**
- **Failed Patch Deployments** bucket
- **Reboot Pending** bucket

**UI implication:** This is a **persistent dashboard widget** that should be visible on the Patch Management home/dashboard. Acts as the admin's daily action list.

Recommended pattern:
- Top card: count + severity color
- Click → filtered system list
- Bulk actions: "Trigger reboot", "Mark for review", "Snooze N days"

---

## 11. KNOWLEDGE BASE — REAL-WORLD ERROR STATES

Sourced from `/knowledge-base.html` — these are common errors UI must gracefully handle. Each implies an error-state screen design:

### 11.1 Patch Management errors

**Manual scan failures (6 types):**
- "The network path was not found"
- "Unknown username or password"
- "No network provider accepted the given network path"
- "Not enough server storage space available"
- "Storage control block address invalid"
- "Scanning Timed Out"

**Patch configuration failures (15+):**
- "Draft Download Failed"
- "Problem while downloading the patch from the server"
- "Incorrect Function or Unknown Error Code: 2359302 / Access Denied"
- "The wait operation timed out"
- "Fatal error during installation"
- "%1 is not a valid WIN 32 application"
- "Unknown Error: 2145124329"
- "Office Update Error"
- "Patch Installation Failure - windows update service disabled (Error: 1058)"
- "Adobe Acrobat Patch Installation Failure - Error 1603"
- "Chrome patches failed Error: 1603"
- "Java Update did not complete - Error: 1603"
- "Application is used by another process"

**Patch DB update failures:**
- "Update of latest patch information failed: Stream closed"
- "Unable to establish direct connection"
- "Bug in authorization handling: Server refused 10 times"

**Red Hat-specific:**
- "Account missing active Red Hat subscription"
- "Download permission required"
- "Unable to reach access.redhat.com/downloads"
- "Issues found in Nominated System while creating cache"
- "Cannot proceed since Yum is already running"

**SUSE-specific:**
- "System missing active SuSE subscription"
- "Invalid SuSE registration code"

**Patch download failures:**
- HTTP 403, 407
- Connection timeout
- Checksum failure
- Access Denied
- SSL Exception
- Citrix-specific, Oracle-specific, Chrome M78-specific

### 11.2 UI design implications from error catalogue

Build **standardized error state cards** with:
- Error code (e.g., "ERR-1603")
- Plain-English title ("Adobe Acrobat patch couldn't install")
- "Why this happened" expandable section
- "How to fix" step-by-step
- Affected systems count + drill link
- "Retry deployment" primary action
- "Mark resolved" secondary action
- "Contact support" tertiary with auto-attached logs

---

## 12. SUPPORTED PATCH TYPES & SCOPE

### 12.1 OS support

- **Windows** (XP, Vista, 7, 8, 10, 11, Server editions)
- **macOS**
- **Linux:**
  - Ubuntu
  - CentOS
  - Debian
  - Red Hat Enterprise Linux (via authenticated subscription)
  - SUSE Linux

### 12.2 Patch categories

- **Microsoft Updates** (OS + MS Applications)
- **Third-Party Updates** (Adobe, Java, Chrome, Firefox, Zoom, etc.)
- **Driver Updates** (separate toggle)
- **BIOS Updates**
- **Service Packs**
- **Patches for Microsoft 365 / Office** (special handling)

### 12.3 Out-of-scope

- **Cannot deploy/uninstall full applications via Patch Management** — that's the Software Deployment module
- **Cannot upgrade third-party app versions** — also Software Deployment
- **No custom patch uploads** — only ManageEngine-supported patches

---

## 13. INTEGRATIONS RELEVANT TO PATCHING

From Integrations module — these talk to Patch Management:

| Integration | What it does for patching |
|---|---|
| **Tenable VM / SC** | Pulls vulnerabilities → maps to patches in EC |
| **Rapid7 InsightVM** (On-prem + Cloud) | Same as Tenable |
| **Crowdstrike Falcon Spotlight** | Same |
| **Qualys** | Same |
| **ServiceDesk Plus / Jira / Freshservice / ServiceNow / Zendesk** | Create tickets from patch failures |

**UI implication:** In Patch failure views, show "Create ticket" button if helpdesk integration is configured. In CVE views, show "Imported from Tenable" badge if vuln data came from external scanner.

---

## 14. KEY UI SCREENS — DETAILED INVENTORY

Full list of screens to design for Patch Management module:

### 14.1 Dashboard / Home

- **Hero KPI band:**
  - Total managed systems + scan status
  - Total missing patches (Critical breakdown)
  - System health pie chart (Healthy / Vulnerable / Highly Vulnerable)
  - Last DB sync timestamp
  - "Attention Required" prominent CTA with count
- **Trend chart:** patches missing over time (last 30 days)
- **Top 5 vulnerable systems**
- **Top 5 missing critical patches**
- **Recent APD task summary**

### 14.2 Patches → Missing Patches (most-trafficked)

- Sortable data table with 17 columns (column picker)
- Filter chips: Severity, Platform, Vendor, Approval Status, Reboot Required, Downloaded
- Bulk select with floating action toolbar:
  - Install/Publish Patches
  - Mark as Approved/Declined/Not Approved
  - Decline
  - Export
- Search bar (full-text across Patch ID, Bulletin ID, Patch Name, KB number, CVE)
- Saved views ("My critical Windows patches", etc.)

### 14.3 Patch Details (drill-down)

- Header: Patch Name + Severity badge + Approval status
- Metadata grid: Patch ID, Bulletin ID, KB#, Vendor, Release Date, Reboot, Uninstall support
- Vendor URL (location path) shown for transparency
- Superseding Bulletin link
- **Affected Systems** tab → list of all systems with this patch's status
- **File & Registry Changes** tab (compliance)
- Actions: Approve, Decline, Deploy to selected, Add to APD, View vendor advisory

### 14.4 Systems → Scan Systems

- Computer list with last-scan timestamp, scan status
- Filter by OS, group, scan freshness
- Bulk select + "Scan Selected" / "Scan All" (warn at 100 limit)
- Live progress for in-flight scans

### 14.5 System Detail (per computer)

- Tabbed:
  - **Overview** (hostname, OS, health, last scan)
  - **Missing Patches** (specific to this system)
  - **Installed Patches**
  - **Failed Patches** (drill into errors)
  - **Installed Software** (cross-link to inventory)
  - **History** (audit trail of all patch actions)
- Quick actions: Scan now, Force install missing, Wake on LAN, Remote Control

### 14.6 APD Task list + creation wizard

- Task list: name, last run, next run, target count, success rate
- "Create APD Task" → multi-step wizard (7 steps as listed in §6.3)
- Per-task drill: history + per-run breakdown

### 14.7 Test and Approve

- Mode toggle (top): Automatic / Test and Approve
- Test Groups list with: name, platform, last test run, % pass, status
- "Add Group" → multi-step wizard (as detailed in §7.4)
- Per-group detail: patches in test, results, auto-approval countdown

### 14.8 Deployment Policies

- Policy list: name, used by N tasks, deployment window, reboot policy
- Policy editor:
  - Maintenance window definition (day(s) of week + time range)
  - Reboot behavior (no reboot / force / prompt user / defer N times)
  - Wake on LAN toggle
  - Skip deployment options
  - Pre-deployment activities
  - Post-deployment activities

### 14.9 Self-Service Portal admin pages

- **Settings:** display location toggles + preview
- **Rebranding:** live preview pane + uploads + color pickers

### 14.10 Self-Service Portal end-user UI (separate persona)

- Minimal, branded
- "Updates" tab with patch cards
- Per-patch: name, severity, size, install button
- Installation progress feedback
- Success/failure toasts

### 14.11 Troubleshoot view

- 14 error categories displayed as cards or accordion
- Per category: count badge + drill into Main View → Sub View pattern
- "Sync Now" button at top to refresh status

### 14.12 Patch Database Settings

- Sync schedule (default: daily; customizable time)
- Selection of patches to manage (allow filter by vendor, OS, application)
- Storage location / patch repository config
- "Update Now" manual trigger
- Cleanup settings

### 14.13 System Health Policy editor

- Define what makes a system Healthy / Vulnerable / Highly Vulnerable
- Threshold sliders: count of missing critical patches, age of missing patches

### 14.14 Reports

- **Scan Report** (recommended schedule: 2 hours after DB sync)
- **Patch Reports**
- **System Reports**
- **APD Reports**
- **SSP Reports**
- **Executive Summary**

---

## 15. PERMISSIONS / RBAC AROUND PATCH MANAGEMENT

Inferred roles (must support in UI):

- **Super Admin** — all actions
- **Patch Admin** — full patch module, no other modules
- **Helpdesk Technician** — view + deploy approved patches only, no decline, no APD config
- **Auditor / Read-only** — reports + views only, no actions
- **MSP technician** (in MSP edition) — scope-limited to specific customers

UI implication: Action buttons (Deploy, Approve, Decline, Create APD) must hide or disable based on role. Recovery flows (sensitive) need explicit RBAC checks.

---

## 16. MOBILE APP

Per docs, **Endpoint Central has a mobile app** that supports:
- Install software patches
- Approve / decline patches
- View detailed patch reports
- Initiate patch scanning
- "Zia" — IT Assistant (chat-based actions)

**UI implication:** If building mobile companion app, must support all of above. Bulk approvals on mobile via swipe gestures, voice via Zia.

---

## 17. EDGE CASES & GOTCHAS (FROM DOCS + FAQ)

These trip users up — UI must surface them clearly:

### 17.1 "Reboot Pending" persists after reboot

> "Even after a restart, Windows may still report a 'pending reboot' if certain registry keys or Windows Update operations remain uncleared."

**UI fix:** On the Reboot Pending list, add a "Re-scan to verify" action and explain the registry-key cause inline.

### 17.2 Patch scan timing

> "Definitely not [no overload]. The scan happens right after the database is synced."
> "Scanning will be initiated incrementally to avoid bandwidth bottlenecks."

**UI fix:** Show estimated scan completion ("Scanning 47% complete, ~12 min remaining") to reduce anxiety.

### 17.3 Excluding Mozilla from select computers

Per FAQ: workflow is convoluted — create custom group with excluded computers, decline applicable patches for those.

**UI fix:** Build a "Patch Exception Wizard": pick patch → pick computers/groups to exclude → auto-creates decline rule.

### 17.4 Switching from WSUS to Endpoint Central

> "Disable auto-updates from WSUS and install EC agent."

**UI fix:** Have a "Migration Helper" wizard for new customers — detect existing WSUS, guide through disabling.

### 17.5 Custom group selection got worse

User FAQ explicitly complaints:
> "Previously, when selecting target computers, you could see a list and check mark each. Now it seems you have to type each computer name."

**Direct user pain point.** UI implication: bring back visual multi-select for small groups, keep type-ahead for large fleets.

### 17.6 Dynamic custom groups not always available

> "Dynamic custom groups are evaluated on the client side during deployment based on criteria."

Confuses users when group seems "empty" until deployment. UI fix: show "Dynamic — evaluated at runtime" badge with explanation.

### 17.7 No separate scan scheduling

The product explicitly disallows scheduling scans — they're event-driven. Users coming from WSUS expect a "scan schedule" config and don't find one. UI must explain this prominently ("Scans run automatically after each DB sync — no scheduling needed").

---

## 18. ZIA — IT ASSISTANT (AI LAYER)

Per docs: "Just ask Zia, Endpoint Central's IT Assistant, and she'll do them for you."

Capabilities mentioned:
- Install software patches
- Approve/decline patches
- View detailed reports
- Initiate scanning

**UI implication:** Floating chat panel (Zia) available across patch screens. Slash commands for power users (`/approve KB12345`). Suggested actions based on screen context.

---

## 19. DESIGN PRINCIPLES SPECIFIC TO PATCH UI

1. **Always show the count** — "Deploy to 47 systems" not "Deploy"
2. **Always show the impact preview** — "This will require reboot on 23 of 47 systems"
3. **Severity is the primary sort/filter** — Critical patches always surface first
4. **Time-since matters** — patch released N days ago, system missing for M days
5. **System-centric AND patch-centric views must coexist** — same data, different cuts
6. **Failures must be more visible than successes** — green is background, red is foreground
7. **Maintenance windows are sacred** — UI must respect; never auto-deploy outside
8. **Reboot is the user's worst experience** — make reboot policy explicit, show user the deferral option
9. **Production servers are different from desktops** — UX must offer "production-safe" defaults
10. **Audit trail everywhere** — every approval, decline, deploy, override must be timestamped + attributable

---

## 20. RECOMMENDED COMPONENT SET FOR PATCH MODULE

Specific reusable components (extends the cross-cutting library):

| Component | Purpose |
|---|---|
| **PatchSeverityBadge** | Critical / Important / Moderate / Low color-coded |
| **PatchStatusBadge** | Approved / Not Approved / Declined / Pending |
| **DownloadStatusIndicator** | Downloaded / Downloading / Failed / Not started |
| **RebootRequiredIcon** | With tooltip explaining reboot policy |
| **CVEChip** | CVE-2024-XXXX with link to NVD |
| **KBChip** | KB1234567 with link to MS knowledge base |
| **BulletinChip** | Vendor advisory link |
| **MaintenanceWindowPicker** | Day(s) + time range + duration + timezone |
| **RebootPolicySelector** | No reboot / Force / Prompt / Defer + max defer count |
| **DeploymentWindowVisualizer** | Calendar-style preview of when patches will deploy |
| **SystemHealthGauge** | Healthy / Vulnerable / Highly Vulnerable distribution |
| **AffectedSystemsCount** | Drillable count with hover preview |
| **PatchTimeline** | Visual timeline: released → downloaded → approved → deployed |
| **ErrorCategoryCard** | For the 14 troubleshoot categories (count + drill) |
| **TestGroupCard** | Pilot group with pass rate gauge + countdown to auto-approve |
| **SSPPreviewPane** | Live preview for rebranding screen |

---

## 21. KEY URLs FOR FURTHER READING

```
Overview:            /help/patch_management/patch_management_overview.html
Architecture:        /help/patch_management/patch_management_architecture.html
Lifecycle:           /help/patch_management/patch_management_life_cycle.html
Scan:                /help/patch_management/patch-scan.html
Views:               /help/patch_management/patch_management_views.html
APD overview:        /help/patch_management/patch_management_configurations.html
APD detail:          /help/patch_management/apd.html
Manual deployment:   /help/patch_management/manual-deployment.html
Test & Approve:      /help/patch_management/enable_patch_approval.html
Deployment policy:   /help/patch_management/patch-deployment-policy.html
Decline patches:     /help/patch_management/exclude_patches_applications.html
Closed networks:     /help/patch_management/patch-management-for-closed-network.html
Self-Service Portal: /help/patch_management/patch-self-service-portal.html
Troubleshooting:     /help/patch_management/patch-deployment-troubleshooting.html
Linux patching:      /help/patch_management/linux-patch-deployment.html
Red Hat patching:    /help/patch_management/red-hat-linux-patching.html
BIOS & Driver:       /help/patch_management/biosdriverupdates.html
Best practices APD:  /help/patch_management/best-practices-for-automatic-patch-deployment.html
Executive Reports:   /help/patch_management/executive-reports.html
Attention Required:  /help/patch_management/attention-required.html
Patch DB Settings:   /help/patch_management/patch-db-sync.html
FAQ:                 /help/patch_management/patch-faq.html
KB (errors):         /knowledge-base.html
```

---

*This is the first of a series of module-specific deep dives.*
*Next files in sequence (to be created in subsequent responses):*
- **EC-02: Vulnerability Management**
- **EC-03: Asset Management / Inventory**
- **EC-04: Software Deployment / Application Management**
- **EC-05: Remote Tools**
- **EC-06: OS Imaging & Deployment**
- **EC-07: Reports**
- **EC-08 through EC-12: MDM features** (Conditional Access, Certificate, Content, Geo-fencing, OS Updates)
- **EC-13: EDR**
- **EC-14: BitLocker**
- **EC-15: Browser Security**
- **EC-16: Application Control**
- **EC-17: Endpoint Privilege Management**
- **EC-18: Device Control**
- **EC-19: Endpoint DLP**
- **EC-20: DEX**
- **EC-21: Private Access**
- **EC-22: Integrations**
- **EC-CROSS: Scope of Management, Custom Groups, RBAC, Admin Settings**
