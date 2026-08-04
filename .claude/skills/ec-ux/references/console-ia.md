# Endpoint Central — Console Information Architecture

> Where things live and how the console is structured. Use this to *place* a screen in the real product
> and to reuse existing patterns. Grounded in the KB; items you can't confirm are marked "(verify)".
> The per-module KB files hold the exact, current menu paths — treat those as more authoritative than
> this summary when they differ.

## Table of contents
1. Top-level tabs
2. Module → console location map
3. Cross-cutting concepts (apply to almost every screen)
4. Recurring UI patterns & components
5. Standard states (empty / loading / error / success / partial)

---

## 1. Top-level tabs

The console is organized around top-level tabs; visibility depends on edition (Free / Professional /
Enterprise / UEM / Security) and cloud vs on-prem. In the **Security edition** many security modules
collapse under a unified **Threats & Patches** tab.

- **Home / Dashboard** — landing dashboards, summary tiles.
- **Patch Mgmt** (a.k.a. **Threats & Patches** in Security edition) — Deployment (Automate Patch
  Deployment, Deployment Policies, Test & Approve, Manual Deployment, Decline Patch, Trash), Systems
  (Scan Systems, Attention Required, Health Status), Patches (Missing / Downloaded), Settings (Patch
  Database sync, System Health Policy), Reports.
- **Software Deployment** — Package Creation (Packages, Templates), Deployment (Install/Uninstall
  Software by OS, Self-Service Portal, View Configurations), Settings (Software Repository, SSP
  Settings, auto-update templates, proxy), Reports.
- **Inventory** — Actions/Settings (Scan Systems, Scan Settings, Schedule Scan, Software Metering,
  Manage Licenses, Configure Alerts, File Scan Rules, Custom Fields, Prohibit Software), View Inventory
  Details (Hardware / Software / System), Reports (Inventory Reports incl. Warranty).
- **Configurations** — Add Configurations (Windows / Mac / Linux; Computer vs User configuration;
  Templates), Script Repository, Collections, All Configurations view, Settings. (Certificate
  distribution, Power Scheme, BitLocker, Kiosk can live here as configurations.)
- **Device Mgmt / Mobile Device Management** — Enrollment, Profiles/Policies, Apps (MAM), Security
  Management (Conditional Access), Email, Content, Kiosk, Geo-fencing, Containerization/BYOD, Reports.
- **Tools** — Remote Control (+ History for recordings), System Manager, Remote Shutdown, Wake on LAN,
  Chat, Announcement, System Tools (Disk Cleanup / Defrag / Check Disk). Port settings under Admin.
- **Browsers** (Security add-on) — Policies (Restriction, Lockdown, Router, Web Filter, Isolation,
  Add-on Mgmt, File Activity, Java Manager, DLP, Threat Prevention, Customization), Manage, Reports.
- **Application Control** (Security add-on) — Application Groups (allowlist/blocklist per OS), Policies.
- **Endpoint Privilege Management** (Security add-on) — privilege policies, JIT elevation, child-process.
- **Anti-Ransomware** (Security add-on) — Settings (enable, VSS backup frequency), Detection, Quarantine.
- **DEX / Endpoint Intelligence** (Enterprise+/add-on) — experience dashboard, per-device drill-down,
  DEX Settings (metric rules, baseline score).
- **Reports** — patch / inventory / configuration / compliance / custom / query / scheduled / AD reports.
- **Admin** — General Settings (Scope of Management, User Administration, Credentials, Mail, Server,
  Security, Database), Feature-specific Settings, Value-added Settings, Audit Log Viewer, Tools Settings.

Security-only/on-prem-specific surfaces under **Threats & Patches**: Vulnerability Management, EDR,
Device Control, Endpoint DLP (on-prem), Secure Private Access / ZTNA (on-prem), System Quarantine (NAC).

---

## 2. Module → console location map

| Module | Console location | Edition gating |
|---|---|---|
| Patch Management | `Patch Mgmt` or `Threats & Patches` | All paid + limited Free |
| Software Deployment | `Software Deployment` | Professional+ |
| Self-Service Portal / App Catalogue | `Software Deployment > Deployment > Self-Service Portal` | Professional+ |
| Software Repository | `Software Deployment > Settings > Software Repository` | Professional+ |
| IT Asset Management | `Inventory` | Professional+ |
| Software Metering | `Inventory > Actions/Settings > Software Metering` | Enterprise+ |
| License Management | `Inventory > Actions/Settings > Manage Licenses` | Enterprise+ |
| Warranty Management | `Reports > Inventory Reports > Warranty` | Enterprise+ |
| Prohibited Software | `Inventory > Prohibit Software` | Professional+ |
| Certificate Management | `Configurations > Windows > Certificate Distribution` | All |
| Power Management | `Configurations > … > Power Scheme` | Professional+ |
| Configurations | `Configurations` | Professional+ |
| OS Deployment | standalone (varies) | UEM+ |
| Mobile Device Management | `Device Mgmt` | Professional+ (mobile); UEM+ (modern laptops) |
| Mobile App Management (MAM) | `Device Mgmt > Apps` | needs MDM |
| Email / Content / Conditional Access / Geo-fencing / Kiosk / BYOD | under `Device Mgmt` | MDM-capable editions |
| Remote Troubleshooting | `Tools` | All paid + limited Free |
| System Tools | `Tools > System Tools` | Professional+ |
| Vulnerability Management | `Threats & Patches` | Security+ |
| Next-Gen Antivirus / Malware Protection | EDR / Security console | Security (add-on) |
| Anti-Ransomware | `Anti-Ransomware` | Security (add-on) |
| Browser Security | `Browsers` | Security (add-on) |
| Application Control | `Application Control` | Security (add-on) |
| Endpoint Privilege Management | `Endpoint Privilege Management` | Security (add-on) |
| Device Control | `Threats & Patches > Device Control` | Security (add-on) |
| BitLocker Management | `Configurations > Windows > BitLocker` or `Threats & Patches > Device Control` | UEM+/Security+ |
| Endpoint DLP | `Threats & Patches > Endpoint Data Security` | Security (on-prem only) |
| EDR | Security workspace (Cloud-centric) | Security (Cloud) |
| Secure Private Access (ZTNA) | `Threats & Patches > Secure Private Access` | On-prem only |
| Network Access Control (System Quarantine) | `Threats & Patches > Compliance > System Quarantine Policy` | Security |
| DEX / Endpoint Intelligence | `DEX` | Enterprise+ (add-on) |
| Zia AI | contextual within modules + Android mobile | Cloud-centric |
| Reporting & Auditing | `Reports` | All |
| Admin mobile app | separate app | Paid editions |
| Endpoint Central MSP | separate multi-tenant console | MSP edition |

For deeper routing use the KB `INDEX.md` "Feature → Module lookup" table — it maps individual terms
("Test & Approve", "JIT elevation", "geo-fencing", "experience score", …) to the owning file.

---

## 3. Cross-cutting concepts (apply to almost every screen)

These shape any design; check which apply and reuse their established UI.

- **Scope of Management (SoM)** — the master set of managed devices (domains/workgroups + remote
  offices). Every targeting UI selects from the SoM device tree. `Admin > Scope of Management`. Nothing
  can be targeted until SoM is defined — relevant to first-run/empty states.
- **Custom Groups / target selection** — include/exclude computers, users, or groups for a focused
  action. Appears in every deployment/configuration/remote-control flow as a "Define Target" step.
- **Deployment Policies** — reusable "when & how" wrapper (deployment window 3–24h, week split
  Regular vs Patch Tuesday, reboot behavior, pre/post activities, WoL, grace period → force). Created
  once, reused across patch and software deployment. `Patch Mgmt > Deployment > Deployment Policies`.
- **Test & Approve** — pilot-group safety gate before network-wide patch rollout.
- **3-layer settings model** — General (`Admin > General Settings`) / Feature-specific / Value-added.
- **Action ⋯ row menu** — consistent per-row lifecycle menu on list views: Modify, Suspend, Resume,
  Move to Trash, Restore.
- **Dashboards + drill-down** — status tiles (e.g., Healthy / Vulnerable / Highly Vulnerable) whose
  counts drill into a device list and then a per-device detail view.
- **Attention Required** — the daily "exceptions" view (failed deployments, pending reboots).
- **RBAC & scope** — roles + device scope hide/gray-out actions; technicians see only their OU.
  `Admin > User Administration`.
- **Distribution Server / Secure Gateway Server** — remote-office/roaming comms; affects "Deploy
  Immediately" timing (replication waits) and onboarding flows.
- **Agent tray icon + Self-Service Portal** — the endpoint-side UI (status, scan, sync, SSP).
- **Mobile admin app + Zia AI** — on-the-go patch approve/deploy, remote actions; Zia executes NL
  commands (confirmation gates matter). Zia voice is Android-only (parity gap).

---

## 4. Recurring UI patterns & components

Reuse these; don't invent new ones without a strong reason.

- **Tab + left-nav** — every top-level tab has a consistent left sidebar of sections.
- **List/table view** — checkbox multi-select + column sort + filters + search + Action ⋯ menu. Patch
  and device lists offer multiple **views**: patch-view / computer-view / detailed-view.
- **Drill-down count links** — a number in a tile/row links to the underlying filtered list.
- **Wizard stepper** — multi-step flows (e.g., APD = 4 steps: Define → Select Applications →
  Deployment Settings → Target/Notify). Show Step N/total, Next/Back, review-before-save.
- **Grouped settings panels / sub-tabs** — complex editors group options into fieldsets or tabs
  (General / Advanced / Notification / Performance …). Deployment Policy editor is the archetype.
- **Dashboard tile cards** — count + status color, often with a trend chart; clickable.
- **Scope/OU tree** — expandable domain/OU/group hierarchy for target selection.
- **Confirmation & input modals** — before destructive actions (Trash, Suspend, Deploy Immediately) and
  for create/edit (policy name, group, script).
- **Status badges** — health (green/yellow/red), deployment (In Progress / Success / Failed / Yet to
  Apply / Suspended), agent (online/offline/unknown).
- **Notification config block** — recurring "notify every N hours / attach report / email / mobile"
  block inside deployment wizards.
- **Rebranding/customization** — SSP and email templates support logo/colors/text.
- **Breadcrumb + module header**; **global search** in the header.
- **Endpoint-side**: agent tray right-click menu; SSP window with per-app Install/Uninstall/Upgrade.

---

## 5. Standard states

Design every screen for these, not just the happy path.

- **Empty / no-data**: no devices in scope ("Define Scope of Management first"), no custom groups
  ("Create a custom group to target…"), no missing patches ("All systems healthy"), no configs
  assigned, no reports yet. Give the next action.
- **Loading / in-progress**: scan running, "Draft: Download In Progress", replication waiting, agent
  yet to check in. Set expectations (e.g., 90-min agent refresh; DS replication delay).
- **Partial / mixed**: deployed to a group where some machines are Not Applicable; some patches
  couldn't download but others installed.
- **Error**: failed deploy, access denied, network path not found, checksum failed, "No Missing Patches
  Found" when approval is pending. Pair with a cause + a "Read KB" / next step.
- **Success**: Successfully Applied / Executed; confirm and offer the logical next step (view report,
  scan again, drill into remaining).
- **Blocked-by-edition**: feature not in this edition → explain + upgrade path rather than a dead end.
