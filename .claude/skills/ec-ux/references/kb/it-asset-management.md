# IT Asset Management (ITAM)

> Endpoint Central's IT Asset Management module discovers, tracks, and governs hardware, software, and digital assets across Windows, macOS, and Linux endpoints throughout their full lifecycle — from provisioning and monitoring to maintenance, compliance, and disposal — from a single console. Available in the Professional and Enterprise editions of Endpoint Central (and in the UEM/Security editions); a Free edition exists with reduced endpoint limits. (Edition gating partly inferred — verify against the official edition-comparison matrix.)

## 1. What it is — Feature detail

### Purpose and console location
IT Asset Management (ITAM) is one of the core pillars of Endpoint Central (formerly Desktop Central), sitting alongside Patch Management, Software Deployment, Mobile Device Management, and Endpoint Security. Its job is to give IT administrators a single, automated, always-current view of every IT asset in the estate — both LAN and work-from-home endpoints — and to drive cost, compliance, and security decisions from that data. Per the official help, ITAM lets IT teams "scan the managed assets, audit them with the inventory reports, analyze and trigger alerts to track any suspicious movements," and covers hardware asset management, software asset management, basic security auditing, and compliance.

- **Top-level navigation:** the **`Inventory`** tab in the Endpoint Central console. Within it, most administrative actions live under **`Inventory > Actions/Settings`** (Scan Systems, Scan Settings, Schedule Scan, Software Metering, Manage Licenses, Configure Alerts, File Scan Rules, Custom Fields). Asset views live under **`Inventory > View Inventory Details`** (Hardware Details, Software Details, System Details). Reports live under the separate **`Reports > Inventory Reports`** area.
- The module is positioned as covering three asset classes: **Hardware Asset Management, Software Asset Management, and Digital Asset Management.**
- Asset data is also surfaced on the **Endpoint Central mobile app**, so admins can check inventory, warranty, and license-compliance status from a phone.

### Console navigation map (Inventory tab)
| Task | Console path |
|---|---|
| Run an on-demand / manual scan | `Inventory > Actions/Settings > Scan Systems` → select computers → **Scan System** (top-left) |
| Customize what each scan collects | `Inventory > Actions/Settings > Scan Settings` |
| Schedule a recurring inventory scan | `Inventory > Actions/Settings > Schedule Scan > Inventory Scan > Configure Schedule` |
| Schedule a file scan | `Inventory > Actions/Settings > Schedule Scan > File Scan > Configure Schedule` |
| Add file-scan rules | `Inventory > Actions/Settings > File Scan Rules > Add Rule` |
| Add/import software licenses | `Inventory > Manage Licenses` (under Actions/Settings) → **Add License** / **Import from CSV** |
| Group software versions | `Inventory > Group Software` (Create Software Groups) |
| Add software-metering rules | `Inventory > Actions/Settings > Software Metering > Software Metering Rules > Add Rule` |
| View metering summary | `Inventory > Actions/Settings > Software Metering > Software Metering Summary` |
| Configure prohibited software | `Inventory > Prohibit Software` → **Add Prohibited Software** |
| Configure inventory alerts | `Inventory > Actions/Settings > Configure Alerts` |
| View triggered alerts | `Inventory > View Alerts` |
| Add custom asset fields | `Inventory > Actions/Settings > Custom Fields` |

### Full capability breakdown

**A. Periodic Asset Scans (the data-collection engine)**
The agent residing on each managed machine scans for software and hardware details and posts data to the server. The current help documentation enumerates **eight scan types**:

1. **Agent Initial Scan** — runs immediately the first time the agent is installed, to gather a full baseline of the machine.
2. **Automated Software Scan** — triggered automatically whenever the agent detects a software install, uninstall, or upgrade. The detected change is posted to the server **within ~12 minutes**.
3. **Automated Hardware Scan** — triggered when the agent detects a hardware change (e.g., a component added or removed). Hardware-change data is posted to the server **after the endpoint is restarted**.
4. **Automated Dynamic Computer Properties Scan** — triggered when dynamic "core properties" change; posted to the server **immediately** on detection. Core properties include IP address, MAC address, OS, domain name, computer name, and logged-on user.
5. **On-Demand Scan** — manually initiated by the admin from the console (`Inventory > Actions/Settings > Scan Systems`). Use for immediate audit/troubleshooting.
6. **Schedule Scan** — automated scan at admin-defined daily/weekly/monthly intervals; also the prerequisite for the User Login Scan.
7. **User Login Scan** — fires automatically when a user logs into a machine (requires a Schedule Scan to be configured); collects user-specific details.
8. **User Initiated Scan** — manually triggered by the end user from the agent tray icon.
9. **Fail-safe Scan** — when the server fails while processing data received from an agent, it automatically re-initiates an on-demand scan so the agent reposts the data, ensuring the inventory database is accurately reconciled.

> Note: this scan taxonomy was refreshed in current docs from the older naming (post-install / scheduled-user / notify / FS-server, etc.). The behaviors map closely; the names above reflect the live help pages.

**Scan-trigger and post-back timing (quick reference)**
| Scan type | Trigger | When data reaches the server |
|---|---|---|
| Agent Initial Scan | Agent first installed | Immediately after install |
| Automated Software Scan | Software install/uninstall/upgrade detected | Within ~12 minutes |
| Automated Hardware Scan | Hardware component added/removed | After the endpoint restarts |
| Automated Dynamic Computer Properties Scan | IP/MAC/OS/domain/name/logged-on-user change | Immediately on detection |
| On-Demand Scan | Admin clicks Scan System | Promptly (agent must be online) |
| Schedule Scan | Admin-defined daily/weekly/monthly time | At the scheduled time |
| User Login Scan | User logs in (needs a Schedule Scan defined) | At logon |
| User Initiated Scan | End user clicks the tray icon | When the user triggers it |
| Fail-safe Scan | Server-side parse failure | After the agent reposts on server request |

This timing model explains most "why is my inventory stale?" questions: a swapped stick of RAM will not show until the next reboot, whereas a newly installed app appears within roughly 12 minutes and an IP-address change appears almost immediately.

**B. Details captured per scan**
A single inventory scan can capture: installed software details; hardware details; operating system; computer name; logged-in user; IP address; MAC address; domain; antivirus details; encryption (BitLocker) details; firewall status; local users and groups; driver details; certificates; shares; services; and file details.

**C. Software & Hardware Inventory**
- **Hardware inventory** tracks physical components: computers, laptops, servers, and connected peripherals. Reports: Computers by OS, by Manufacturer, by Memory, by Age (year of manufacture), by Device Type, Hardware Manufacturers (with product + install counts), and List of Hardware Types. Per-machine fields include computer name, OS, service pack, version, virtual/visible memory, manufacturer, model, system type, physical memory, year of installation, domain, description, serial number, and uptime.
- **Software inventory** catalogs all installed applications on Windows, macOS, and Linux with Software Name, Version, and Manufacturer. Supports user-specific software reports and reports of computers with/without a given application. Export to TXT, CSV, and PDF.
- Both report sets offer graphical representation with drill-down.

> **Sub-modules (full depth in their own files — summarized here to avoid duplication):**

**D. Software License Management** — compliance status (under/over-licensed) from network installations; manual or CSV license entry; software grouping; product keys; remediation. *Full detail: → [software-license-management.md](software-license-management.md).*

**E. Software Metering** — agent monitors app usage (Windows + macOS) via metering rules; 90-day retention; usage reports. *Full detail: → [software-metering.md](software-metering.md).*

**F. Hardware Warranty Management** — auto-detects OEM warranty (Dell/Lenovo/Toshiba/HP); expiry reports & alerts. *Full detail: → [warranty-management.md](warranty-management.md).*

**G. Certificate Management** — create/distribute/renew trust & user-specific certificates. *Full detail: → [certificate-management.md](certificate-management.md).*

**H. Geofencing** — virtual boundary; leaving the range marks a device non-compliant and triggers actions. *Full detail: → [geo-fencing.md](geo-fencing.md).*

**I. Power Management** — power schemes, shut down/hibernate idle PCs, up-time & savings reports. *Full detail: → [power-management.md](power-management.md).*

**J. Prohibited Software & Block Executables** — blocklist + auto-uninstall + block-exe (Windows). *Full detail: → [prohibited-software.md](prohibited-software.md).*

**K. Real-Time Inventory Alerts**
Email/SMS/mobile-app notifications for: hardware components added/removed; software installed/uninstalled; prohibited-software installation; license compliance (non-compliant, nearing/after expiry, under-utilized commercial licenses); disk-space thresholds (total free and per-partition); and certificate expiration (with a configurable lead time). Alerts fire during the successive asset scan after the change.

**L. File Scanning**
Define file-scan rules by type (audio, video, documents, etc.), schedule scans, measure space consumed, and notify users on low-free-disk machines.

**M. USB Device Management**
Enable/disable/record by device class at computer, user, or manufacturer level; audit with device name, user, type, duration, and manufacturer.

**N. Custom Fields**
Add custom asset attributes (`Inventory > Actions/Settings > Custom Fields`) to record organization-specific metadata against assets.

### Supported OS / platforms / counts
- Inventory (HW/SW): **Windows, macOS, Linux** (desktops and servers).
- Software metering: **Windows and macOS** (prohibited-software listing within metering is Windows-only).
- Prohibited Software / Block Executable: **Windows Desktop Apps only.**
- Warranty auto-detection: major OEMs (Dell, Lenovo, Toshiba, HP).
- Scale: marketed as managing **200,000+ endpoints**.

### Prerequisites and key concepts
- **Target machines must be under Scope of Management (SoM).** A machine that is not in the SoM will not appear under Scan Systems.
- **Endpoint Central agent** installed on each managed endpoint — the data-collection unit for all scans.
- **DCOM and WMI must be enabled** on Windows targets. To enable DCOM: Start > Run > `DCOMCNFG` > Component Services > Computers > My Computer > right-click Properties > Default Properties tab > check "Enable Distributed COM on this computer" > OK. (Applicable to Windows 7 and above.) WMI ("Windows Management Instrumentation") service must be Running with startup type Automatic.
- **Mail Server / SMS Server settings** must be configured before inventory alerts can be delivered.
- **Differential / change-driven scanning** — automated scans transmit only detected changes, conserving bandwidth.
- **Custom Groups / Remote Office** — used for scoping (exclude lists, technician scope, Managed Installations metric).

### Settings / options reference
| Setting / option | Where | What it controls |
|---|---|---|
| Scan triggers (automated) | implicit (agent) | Software (~12 min), hardware (post-reboot), core properties (immediate) |
| Scan schedule | `Inventory > Actions/Settings > Schedule Scan` | Daily/weekly/monthly cadence; enables User Login Scan |
| Scan inclusions | `Inventory > Actions/Settings > Scan Settings` | Optional Drivers, Services, Shares, Certificates (software/HW/AV/BitLocker/firewall/users always on) |
| Auto-uninstall (prohibited) | `Prohibit Software > Auto-Uninstall Policy` | Enable, max-per-cycle, wait-window (days), notify-user message |
| Exclusions / Global Exclusion | `Prohibit Software` | Per-software or all-software computer/group exemptions |
| Alert categories | `Inventory > Actions/Settings > Configure Alerts` | HW change, SW change, prohibited, license, disk space, certificate expiry; Email/SMS toggles + recipients |
| Metering rule | `Software Metering > Software Metering Rules > Add Rule` | Platform, Software Name, Rule Name, File Name (.exe/.app) |
| License association | `Manage Licenses > Add License` | Installed Computers vs Managed Computers scoping |
| Custom fields | `Inventory > Actions/Settings > Custom Fields` | Organization-specific asset metadata |

### Inventory reports reference (`Reports > Inventory Reports`)
- **Hardware Reports** — Computers by OS / Manufacturer / Memory / Age / Device Type; Hardware Manufacturers; List of Hardware Types.
- **Software Reports** — installed software by name/version/manufacturer; computers with/without a given app; user-specific software.
- **Software Compliance Reports** — license compliance status (Under/Over/In-compliance/Expired); licenses to be renewed.
- **System Details Reports** — per-machine system properties.
- **Warranty Reports** — Soon-to-Expire, Expired, Unidentified Computers.
- **Software Metering Reports** — Rules Summary, Computers with Metered Software, Users with Metered Software (90-day window).
All reports support graphical drill-down, scheduled email delivery, and export (TXT/CSV/PDF).

## 2. UX lens

### Primary user roles & jobs-to-be-done
- **IT Administrator / Asset Manager** — keep an accurate, real-time asset register; detect unauthorized devices/software; stay audit-ready.
- **IT Procurement / Finance** — make data-backed buy/renew decisions using metering and license-compliance data.
- **Security/Compliance officer** — enforce prohibited-software policy, geofencing, USB control, certificate-based auth.
- **End user** — receives notifications (prohibited software, low disk), triggers tray-icon scans, and raises prohibited-software-use requests.

### Step-by-step procedures

**Configure a recurring (scheduled) inventory scan**
1. Navigate to `Inventory > Actions/Settings > Schedule Scan > Inventory Scan > Configure Schedule`.
2. Set the frequency (daily / weekly / monthly) and time per requirement.
3. Save. The User Login Scan only fires once a Schedule Scan exists.
4. (Optional) Configure a separate **File Scan** schedule under `Schedule Scan > File Scan > Configure Schedule`, then add file-type rules under `File Scan Rules > Add Rule`.

**Tune what each scan collects (Scan Settings)**
1. Navigate to `Inventory > Actions/Settings > Scan Settings`.
2. Every scan collects software, hardware, antivirus, BitLocker, firewall, and users/groups by default. Optionally enable **Drivers, Services, Shares, Certificates**.
3. Save the rule — it applies from the next scan. Note: excluding a component **removes** its previously collected data from Endpoint Central; including a component adds it on the next scan.

**Run an on-demand scan**
1. `Inventory > Actions/Settings > Scan Systems`.
2. Select one or more computers; click **Scan System** (top-left).
3. Watch scan status in the same view; avoid selecting too many endpoints at once to prevent server overload.

**View inventory details for an asset**
1. `Inventory > View Inventory Details`.
2. Drill into **Hardware Details** (computer/system properties, components, peripherals), **Software Details** (installed apps with version/manufacturer, user-specific software), and **System Details**.
3. From a hardware/software list row, drill down to the per-computer view; export to TXT/CSV/PDF as needed.

**Configure software-metering rules (Windows or Mac)**
1. Determine the exact process file name: Windows — Task Manager > Details > Name column (`.exe`); Mac — Activity Monitor > select process > Sample Process / Open Files and Ports, read the `.app` name from the path.
2. `Inventory > Actions/Settings > Software Metering > Software Metering Rules > Add Rule`.
3. Choose the **Platform** (Windows or Mac); enter **Software Name** (from discovered inventory), a unique **Rule Name**, and the **File Name** (with extension).
4. Save. Metering begins from the next 90-minute refresh; first data appears the next day. View summary at `Software Metering > Software Metering Summary`; full reports under `Reports > Inventory Reports`.

**Manage software licenses (manual + CSV import)**
- *Manual:* `Inventory > Manage Licenses` → **Add License** → select the software (manufacturer + version are pre-filled and locked) → fill license details → optionally attach the license file/invoice and comments → associate computers (Installed Computers or Managed Computers) → **Save**.
- *Bulk CSV:* `Inventory > Manage Licenses` (Actions/Settings) → **License > Import from CSV** → build a `.csv` matching the **Sample CSV format shown in the console** → browse and **Save**. Typical license fields (verify against the in-console sample): Product Name, Manufacturer, Version, License Owner, No. of licenses purchased, License Name, Licensed To, Purchased Date, Expiry Date, License Key. Example row (illustrative — confirm exact column order against the console sample):
  ```
  Product Name,Manufacturer,Version,License Owner,No. of Licenses,License Name,Licensed To,Purchased Date,Expiry Date,License Key
  Acme PDF Pro,Acme Corp,12.0,IT Dept,250,Acme-VLK-2026,Contoso Inc,2026-01-15,2027-01-14,ABCDE-12345-FGHIJ-67890
  ```
  Always download/inspect the in-console **Sample CSV** first, since the accepted column set and order are defined there and may differ from the illustrative list above (inferred).
- *Add more licenses on renewal:* `Manage Licenses` → **Add More** (Actions column) → enter the additional license count → **Save**.
- Filter the Manage License view by Under License / Over License / In Compliance / Expired.

**Group software versions for unified license tracking**
1. `Inventory > Group Software` (Create Software Groups).
2. Combine the multiple editions/versions of one application into a single group so its licenses are tracked as one entity.
3. Apply the group when adding/associating a license so compliance is computed across all versions.
   Note: a software group cannot be used as a metering rule, and adding a software *group* to the prohibited list adds the group's parent software.

**Define prohibited software + auto-uninstall (Windows)**
1. `Inventory > Prohibit Software` → **Add Prohibited Software** (the dialog lists software detected on managed computers — scan at least once first).
2. Select the software → move to the **Prohibited List** → **Update**. (Adding a software *group* adds the group's parent software.)
3. Open the **Auto-Uninstall Policy** tab → check **Enable Automatic Uninstallation**.
4. Set the **maximum number of software** to uninstall per computer per refresh cycle (higher = higher CPU; overflow is removed at next startup).
5. (Optional) Check **Notify User before Uninstalling** with a custom message (requires Notify User Settings).
6. Set the **wait-window** (e.g., enter `3` to remove 3 days after detection). **Save.**
7. For `.exe` apps (MSI is auto-supported), open the **Prohibited SW** tab → click **Not Configured** under **Uninstall command** → choose **Pre-fill Uninstall Command** (fetched from Add/Remove Programs; only the silent switch is needed) or **I will specify myself** → **Save**. Verify in **Auto Uninstallation Status > Detailed View**.
8. (Optional) **Exclusions:** select the software → click the **Exclusions** link → add computers/custom groups → **Save**. Or **Configure Global Exclusion** for computers exempt from all prohibited rules.

**Manage software categories**
1. `Inventory > Actions/Settings > Software Category` (Manage Software Categories).
2. Classify discovered software into categories (e.g., productivity, utilities, prohibited candidates) to make inventory and compliance reporting easier to filter and act on.

**Configure inventory alerts**
1. Prerequisite: configure Mail Server (and SMS Server) settings.
2. `Inventory > Actions/Settings > Configure Alerts`.
3. For each alert category, customize preferences and click **Configure**. To enable email: **Enable Email** → fill details → **Save**, then add recipient addresses → **Save**. For SMS: **SMS > Enable SMS > Save**, then add the mobile number → **Save**.

**Block an executable (run-time prevention)**
1. `Inventory > Actions/Settings > Block Executable` (Windows).
2. Add the executable(s) to block by name; the block prevents the app from running even when launched from an external/removable drive — defending against portable/fileless apps.
3. Unlike Prohibit Software (which uninstalls), blocking stops execution at run time; combine the two for both removal and run-time prevention.

**Configure file scanning (disk-space governance)**
1. Schedule the scan: `Inventory > Actions/Settings > Schedule Scan > File Scan > Configure Schedule`.
2. Add rules: `Inventory > Actions/Settings > File Scan Rules > Add Rule` — define the file type(s) to probe (audio, video, documents, etc.) and the target machines.
3. Deploy the rule. After scanning, view file count and memory consumed; notify users on low-free-disk machines to clean up.

**Approve a request to use prohibited software**
1. End users raise the request from the agent tray icon (they see the network's prohibited-software list).
2. Technicians resolve it at `Inventory > Prohibit Software > User Requests`. With ServiceDesk Plus integration (SDP 9203+), requests can only be approved from SDP; associate a template via `Admin > Integration Settings > ServiceDesk Plus`.
3. On approval, the user is allowed to install/use the requested software.

### Key end-to-end workflows (recap)
1. **Onboard & baseline:** add to SoM → install agent → Agent Initial Scan auto-runs → inventory populated.
2. **Configure recurring visibility:** set a Schedule Scan → tune Scan Settings → enable real-time alerts (HW/SW/license/disk/certificate).
3. **License compliance run:** import license CSV (or add manually) → group software versions → review Compliance Report → if under-licensed, add licenses or uninstall on N machines.
4. **Cost optimization:** review Software Metering reports (rules summary / by computer / by user) → revoke licenses for low-usage apps before renewal.
5. **Warranty governance:** auto-detect OEM warranties → schedule Soon-to-Expire report by email → act before expiry; manually enter Service Tag for Unidentified Computers.
6. **Prohibited-software enforcement:** add blocklist → enable Auto-Uninstall Policy + exclusions → notifications fire → review status and User Requests.
7. **Disk hygiene:** schedule File Scan + rules → identify large file types → notify low-disk users.

### UX research hooks / friction points
- **Scan-trigger model is rich but opaque.** Eight scan types with different post-back timings (12 min for software, *after reboot* for hardware, immediate for core properties) make "why is my data stale?" hard to reason about. Opportunity: a "data freshness / last-scan reason" indicator per asset.
- **License CSV import** relies on an in-console sample format and is field-heavy; a guided column-mapper or procurement-system integration would reduce errors.
- **Two installation counts** (Network vs Managed Installations) can confuse scoped technicians about why compliance numbers differ from a colleague's view.
- **Prohibited-software auto-uninstall** has several interacting knobs (max-per-cycle, wait-window, exclusions, global exclusion, `.exe` switch config); a single review screen would reduce misconfiguration.
- **Alert fatigue** — many categories (HW change, SW change, prohibited, license, disk, certificate) need digesting, grouping, and severity tuning.
- **Mac metering parity** is new and worth surfacing in-context so mixed-fleet admins know it exists.

### Notable UI patterns/components
- **Actions/Settings hub** — most configuration (scans, settings, schedule, metering, licenses, alerts, file scan, custom fields, software category) is reached from one consistent place under the Inventory tab, with the asset views (View Inventory Details) and Reports kept separate.
- Inventory dashboard with graphical, drill-down reports.
- Scheduling wizards (inventory scan, file scan, report email).
- CSV import for licenses; export to TXT/CSV/PDF throughout.
- Custom-group / Remote Office pickers for scoping and exclusions.
- Tabbed Prohibit-Software console (Prohibited SW / Auto-Uninstall Policy / Auto Uninstallation Status / User Requests).
- Mobile app mirrors key asset views.

## 3. PM lens

### Value proposition & business outcomes
- Single-console visibility over HW, SW, and digital assets across distributed/WFH fleets reduces redundancy and simplifies budgeting.
- Avoids non-compliance fines via automatic license-compliance detection and audit-ready reports.
- Cuts wasted spend by reclaiming under-used licenses (metering) and avoiding premature hardware replacement (warranty tracking).
- Forrester TEI study cited across Endpoint Central: **442% ROI and $3.7M net savings** (platform-level, not ITAM-only).
- Compliance posture: ISO/IEC 27001, ISO/IEC 27017, SOC 2 Type II, PCI, Cyber Essentials, GDPR; supports CIS compliance.

### Target personas & use cases
- Mid-to-large enterprises (1k–200k endpoints), MSPs (via Endpoint Central MSP), regulated industries needing audit trails, and WFH-heavy organizations.

### Competitive positioning / differentiators
- **Unified platform** — ITAM ships inside the same console as patching, deployment, MDM, and endpoint security, reducing tool sprawl.
- Gartner Peer Insights "Customers' Choice 2024" for UEM (platform-level), 10,000+ deployment templates, 20-language UI, mobile app, broad OS coverage.

### Edition gating & packaging
- Free edition (limited endpoints); Professional and Enterprise tiers; UEM and UEM+Security bundles; separate MSP edition. (Exact ITAM feature split by edition is inferred — validate via the edition-comparison matrix. Geofencing/certificate management likely tie to MDM-capable editions.)

### Product expansion opportunities / gaps (analysis)
- **Extend prohibited-software/block-exe beyond Windows** — currently Windows Desktop Apps only.
- **SaaS / subscription license discovery** — current SLM is install-based; cloud-app entitlement reconciliation is a growth area.
- **Broaden warranty auto-detection** beyond the current OEM set and add purchase-cost/depreciation tracking for full financial lifecycle.
- **CMDB / ITSM two-way sync** (ServiceDesk Plus) for asset-to-ticket correlation (partially present via integration).
- **Predictive refresh** — combine age + warranty + DEX experience scores.
- **AI-driven anomaly alerts** to replace static thresholds and reduce fatigue.

## 4. Developer / Technical lens

### Architecture & components
- **Endpoint Central Server** (console + database + HTTP repository host) ↔ **Distribution Servers** (remote-office/WAN) ↔ **Agents** on endpoints.
- Agents collect inventory/metering data and post payloads to the server; the server stores them in the inventory database and renders reports. A failed server-side parse triggers a **Fail-safe Scan** to reconcile.

### Scan data flow (end to end)
1. The agent detects a change (or is told to scan on demand/schedule/logon/tray).
2. It collects the relevant asset data (software, hardware, core properties, or the optional Drivers/Services/Shares/Certificates set per Scan Settings).
3. It posts the payload to the Central Server over the agent–server channel (8020 on-prem; 443 to `desktopcentral.manageengine.com` on cloud); on-demand tasks use 8027 on-prem (or `dms.zoho.com:443` on cloud).
4. The server parses and stores the data in the inventory database and renders reports/alerts. If a parse fails, the server requests a **Fail-safe Scan** so the agent reposts and the DB reconciles.
5. Distribution Servers relay this for remote offices/WAN.

### Agent mechanics
- **Inventory scans:** the eight/nine trigger types in §1A. Software-change posts within ~12 min; hardware-change posts after reboot; core-property change posts immediately.
- A core agent process for scanning is **`dcinventory.exe`** (its crash surfaces as the "Asset Scan is Locked" error).
- **Metering collection:** agent meters from the next 90-minute refresh; uploads once daily; 90-day server retention.
- **Prohibited software:** detection per scan cycle; auto-uninstall jobs run on the subsequent refresh (or startup for overflow) with configurable wait-window; `.exe` removal needs silent switches.

### Ports, protocols, integrations, APIs
- **On-premise ports:** **8020** (agent–server communication and web console), **8027** (on-demand tasks: inventory/patch scan, remote control, remote shutdown, moving agents between remote offices), **8383** (HTTPS console — inferred, verify). These must be excepted in the server-host firewall.
- **Cloud / MSP Cloud:** port **443** to `desktopcentral.manageengine.com` (agent–server/console) and `dms.zoho.com` (on-demand tasks).
- WMI/DCOM used for Windows scanning (`root\CIMV2` namespace).
- Software repository: Network-Share (SMB/UNC) for LAN; HTTP repository under `<server>\webapps\DesktopCentral\swrepository`.
- Integrations: **ServiceDesk Plus** (asset sync; prohibited-software approvals), **Log360**, Active Directory (multi-domain), and a REST API (API Explorer at `/products/desktop-central/api/`).

### Data model / key objects (inferred naming)
- Computer/Asset, HardwareComponent, SoftwareProduct, LicenseGroup, License, MeteringRule, UsageRecord (count/duration), WarrantyRecord, ProhibitedSoftwareRule, Exclusion/GlobalExclusion, Certificate, CustomGroup, CustomField, AlertRule.

### Technical limitations
- Prohibited Software / Block Executable: **Windows Desktop Apps only.**
- Warranty auto-detection limited to a fixed OEM set.
- Heavy reliance on agent presence; agentless discovery of rogue devices is limited.
- Hardware-change data only posts **after reboot**, so freshly added/removed hardware may lag until the next restart.

## 5. Support / Troubleshooting lens

### Inventory scan failures (symptom → cause → fix)

**Symptom: Manual scan fails with "Access Denied."**
- *Cause:* Domain Administrator credentials in the SoM are wrong/changed; DCOM disabled; or the "Force Guest" / "Simple File Sharing" feature is on (workgroup).
- *Fix:* Re-validate SoM domain credentials; enable DCOM on all targets (`dcomcnfg` > My Computer > Properties > Default Properties > Enable DCOM, set authentication + impersonation levels); in workgroups, disable simple file sharing (Explorer > Tools > Folder Options > View > uncheck "Use simple file sharing").

**Symptom: Manual scan fails with "Scanning Timed Out."**
- *Cause:* Server-host firewall blocking; remote-office machine offline; server host has multiple IPs (virtual adapter / dual NIC); UAC + Remote UAC enabled on Vista+ workgroup machines.
- *Fix:* Open ports **8020** and **8027** (on-prem) or allow **443** to `desktopcentral.manageengine.com` and `dms.zoho.com` (cloud); ensure targets are on and the **ManageEngine UEMS – Remote Control** service is running; disable virtual adapters / extra NICs on the server; disable UAC (drag to "Never Notify") and Remote UAC (set `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\system\LocalAccountTokenFilterPolicy = 1`).

**Symptom: "WMI Connection Failed" during manual/scheduled scan.**
- *Cause:* WMI service down/disabled, mis-configured, or the WMI repository is corrupted; client machine very slow (high CPU/RAM).
- *Fix:* Confirm the **Windows Management Instrumentation** service is Running / Automatic. Test the repository with `wbemtest` → connect to `root\CIMV2` → run `Select * from Win32_operatingsystem`. If it errors, repair/resync (`winmgmt /salvagerepository` on Win7+/2008), or rebuild: stop & disable WMI, rename `C:\Windows\System32\wbem\Repository`, re-enable & start WMI, then recompile MOF/MFL files (`for /f %s in ('dir /b *.mof') do mofcomp %s` and the `en-us\*.mfl` equivalent).

**Symptom: "Asset Scan is Locked."**
- *Cause:* `dcinventory.exe` has likely crashed on the endpoint.
- *Fix:* This requires ManageEngine assistance — contact `endpointcentral-support@manageengine.com`.

**Symptom: Target machine not listed under Scan Systems.**
- *Cause:* Machine not in the Scope of Management.
- *Fix:* Add the machine to the SoM; verify the agent is installed and error-free (use the built-in agent troubleshooting tool).

**Symptom: Scheduled inventory scan fails.**
- *Cause:* Same root causes as manual scans (agent/WMI/connectivity).
- *Fix:* Review last successful scan time under Scan Systems; remediate agent/WMI/firewall as above. ManageEngine recommends scheduled scans over repeated manual scans for reliability and to avoid server overload.

**Symptom: Not receiving inventory alerts.**
- *Cause:* Mail Server / SMS Server settings not configured — or the most recent scan for the affected computer failed (no scan = no alert).
- *Fix:* In Scan Systems, confirm the **last successful scan** for the computer; if failed, fix the scan first. Then configure Mail Server and SMS Server settings and re-test the alert.

### License / metering / prohibited-software issues (symptom → cause → fix)

**Symptom: License compliance status looks wrong.**
- *Cause:* editions/versions not grouped under one license group; inaccurate CSV fields (purchase count, expiry); confusion between Network vs Managed Installations.
- *Fix:* group all versions under the correct license group; correct the CSV/manual fields; remember Managed Installations reflects only the logged-on technician's scope while Network Installations counts all managed devices.

**Symptom: Metering reports are empty.**
- *Cause:* OS not Windows/Mac; **File Name** doesn't match the real process name (incl. extension); no rule exists; or the daily upload hasn't happened yet.
- *Fix:* confirm the OS; re-derive the exact `.exe` (Task Manager > Details) or `.app` (Activity Monitor) name; confirm the rule exists; wait until the next day after the daily post.

**Symptom: Prohibited software is not auto-uninstalling.**
- *Cause:* the computer is in an Exclusion or the Global Exclusion list; the wait-window hasn't elapsed; the per-cycle max was exceeded (overflow waits for startup); or for `.exe`, no valid uninstall command + silent switch is configured.
- *Fix:* check exclusions; confirm the wait-window has passed; raise the per-cycle max if appropriate (watch CPU); configure the `.exe` uninstall command (Pre-fill or manual) and verify in Auto Uninstallation Status > Detailed View.

**Symptom: Warranty shows "Unidentified."**
- *Cause:* the OEM isn't in the supported set, or the Service Tag wasn't readable.
- *Fix:* enter the warranty details (Service Tag, purchase/expiry dates) manually for that computer.

### Scan best practices (from official guidance)
- Use **on-demand scans sparingly** — only for immediate audit needs — to avoid server scalability issues and performance bottlenecks.
- **Do not select many endpoints for simultaneous on-demand scans**; bulk uploads can overwhelm the Central server.
- For large environments, **divide endpoints into smaller groups and scan in intervals** to reduce server load.
- Ensure agents are **online and reachable** before initiating scans.
- Track scan status in the console and **avoid repeated attempts** if a scan is already in progress.
- Prefer **Scheduled Inventory Scanning** over repeated manual scans for reliable, automated data collection.

### Diagnostics
- Check the **last successful scan** per machine in Scan Systems.
- Validate scan schedules, Scan Settings inclusions, and alert-rule thresholds.
- Confirm repository reachability (UNC ACLs; HTTP repository path).
- Use the built-in **agent troubleshooting tool** to auto-diagnose agent errors on a target.
- Verify **DCOM and WMI** are enabled/running on Windows targets (most scan failures trace here).
- Confirm the target is within the **Scope of Management** if it is missing from Scan Systems.
- Collect Endpoint Central **server logs** and endpoint **agent logs** (see the official "logs how-to") when escalating to support.

### FAQs
- *Which OSes for inventory?* Windows, macOS, Linux.
- *Is metering cross-platform?* Windows and macOS (the prohibited-software listing within metering is Windows-only).
- *Is prohibited software cross-platform?* No — Windows Desktop Apps only.
- *Can users self-scan?* Yes — User Initiated Scan from the agent tray icon.
- *Why doesn't a hardware change show immediately?* Hardware-change data posts only after the endpoint restarts.
- *How long is metering data kept?* The last 90 days from the current date.
- *How often does metering post?* The agent meters from the next 90-minute refresh and posts to the server once per day.
- *How do I exempt an executive's machine from a prohibited rule?* Add the computer (or a custom group) to that software's Exclusions, or to the Global Exclusion list to exempt it from all prohibited rules.
- *Why do my compliance counts differ from a colleague's?* They are likely seeing Managed Installations scoped to their Custom Group/Remote Office, while Network Installations counts all managed devices.
- *Can I add custom asset attributes?* Yes — `Inventory > Actions/Settings > Custom Fields`.
- *Do I need WMI/DCOM?* Yes, on Windows targets; most scan failures trace to WMI/DCOM being disabled.

### Useful KB / help references
- Setting up Asset Management: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/asset_management_setup.html
- Inventory Scan: https://www.manageengine.com/products/desktop-central/help/inventory/scan_systems_for_inventory.html
- Schedule an Inventory Scan: https://www.manageengine.com/products/desktop-central/help/inventory/schedule_inventory_scanning.html
- Asset Scan Settings: https://www.manageengine.com/products/desktop-central/help/inventory/asset-scan-settings.html
- Manage Software Licenses: https://www.manageengine.com/products/desktop-central/help/inventory/manage_software_licenses.html
- Software Metering: https://www.manageengine.com/products/desktop-central/help/inventory/software_metering.html
- Prohibit Software: https://www.manageengine.com/products/desktop-central/help/inventory/configure_prohibited_software.html
- Configure Inventory Alerts: https://www.manageengine.com/products/desktop-central/help/inventory/configure_email_alerts_for_inventory.html
- KB — Manual inventory scan failure (Access Denied / Timed Out): https://www.manageengine.com/products/desktop-central/inventory_scanning_failure.html
- KB — Asset Scan Locked / WMI Connection Failed: https://www.manageengine.com/products/desktop-central/inventory_asset_scan_locked.html
- KB — Not receiving inventory alerts: https://www.manageengine.com/products/desktop-central/inventory_alert_failure.html

## Cross-references
- [software-deployment.md](software-deployment.md) — works in tandem with ITAM (deploy/uninstall to remediate license non-compliance and prohibited-software auto-uninstall; shared software repository).
- [endpoint-intelligence-dex.md](endpoint-intelligence-dex.md) — DEX consumes hardware/performance telemetry; asset age + warranty can feed refresh decisions.

## Sources
- https://www.manageengine.com/products/desktop-central/it-asset-management.html
- https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/asset_management_setup.html
- https://www.manageengine.com/products/desktop-central/help/application-management-and-control.html
- https://www.manageengine.com/products/desktop-central/help/inventory/scan_systems_for_inventory.html
- https://www.manageengine.com/products/desktop-central/help/inventory/schedule_inventory_scanning.html
- https://www.manageengine.com/products/desktop-central/help/inventory/asset-scan-settings.html
- https://www.manageengine.com/products/desktop-central/help/inventory/manage_software_licenses.html
- https://www.manageengine.com/products/desktop-central/help/inventory/software_metering.html
- https://www.manageengine.com/products/desktop-central/help/inventory/configure_prohibited_software.html
- https://www.manageengine.com/products/desktop-central/help/inventory/configure_email_alerts_for_inventory.html
- https://www.manageengine.com/products/desktop-central/software-metering.html
- https://www.manageengine.com/products/desktop-central/software-license-management.html
- https://www.manageengine.com/products/desktop-central/hardware-inventory.html
- https://www.manageengine.com/products/desktop-central/software-inventory.html
- https://www.manageengine.com/products/desktop-central/software-warranty-management.html
- https://www.manageengine.com/products/desktop-central/desktop-power-management.html
- https://www.manageengine.com/products/desktop-central/prohibited-software.html
- https://www.manageengine.com/products/desktop-central/knowledge-base.html
- https://www.manageengine.com/products/desktop-central/inventory_scanning_failure.html
- https://www.manageengine.com/products/desktop-central/inventory_asset_scan_locked.html
- https://www.manageengine.com/products/desktop-central/inventory_alert_failure.html
