# Endpoint Central — Module Catalog (all modules)

> A capsule for every module so routing is bulletproof and you get instant context without opening a
> file. Once you've picked the module, **open its KB file** (`Endpoint-Central-KB/<file>.md`) for the
> full 5-lens depth (exact Console navigation paths, step-by-step workflows, all friction hooks,
> expansion ideas). Sub-modules that don't have their own capsule here are listed under their parent's
> "Owns / children" and are routed via `module-map.md`. Console paths are from the KB; "(inferred)" /
> "(verify)" mark anything not explicitly confirmed.

Coverage maps to the 22 official Endpoint Central feature areas (Patch, Vulnerability, Asset, App
Management, Remote Troubleshooting, OS Imaging, Reports, Conditional Access, Certificate, Content,
Geo-fencing, OS Update Mgmt, EDR, BitLocker, Browser Security, Application Control, EPM, Device
Control, Endpoint DLP, DEX, Private Access, Integrations) plus foundations and delivery variants.

---

## FOUNDATIONS

### Product Overview
- **KB file:** `00-product-overview.md`
- **Console:** Home / Dashboard landing (verify)
- **Edition/platform:** All editions; Windows, macOS, Linux, ChromeOS, Android, iOS, iPadOS, tvOS.
- **Purpose:** UEM+security platform positioning, editions, and the full module map.
- **Owns:** UEM, editions (Free/Professional/Enterprise/UEM/Security), rebrand history, module map, analyst positioning, edition-comparison matrix.
- **Personas:** IT leaders, procurement, architects evaluating consolidation.
- **Top friction:** Edition confusion (Windows/Mac MDM gated to UEM/Security; add-on security features unclear); feature-parity surprises.
- **Cross-refs:** architecture, cloud-vs-on-premises, msp, all modules.

### Architecture & Agent Deployment
- **KB file:** `01-architecture-agent-deployment.md`
- **Console:** `Admin > Server/Agent Settings`, `Admin > Scope of Management` (Distribution/Secure Gateway/Failover Servers)
- **Edition/platform:** All; agent on Windows/macOS/Linux/Android/iOS/ChromeOS/tvOS.
- **Purpose:** Server, DB, agent, Distribution Server, Secure Gateway, ports, scaling, HA, TLS.
- **Owns:** Server, DB, agent, Distribution Server, Secure Gateway Server, Failover Server, Central Patch Repository, ports (8383/8027/443/135/139/445…), TLS, scalability tiers, agent install methods, on-prem/cloud models.
- **Personas:** Infra/deployment engineers, network/firewall admins.
- **Top friction:** Port/firewall blockage (agent-reachability failures); push-credential/UAC errors; TLS on legacy OS; multi-DS scaling decisions.
- **Cross-refs:** onboarding, patch, software-deployment, remote-troubleshooting, secure-private-access.

### Getting Started & Onboarding
- **KB file:** `getting-started-onboarding.md`
- **Console:** `Admin > Scope of Management`, `Admin > General Settings`, `Admin > User Administration`
- **Edition/platform:** All; on-prem + cloud.
- **Purpose:** Prerequisites → SoM → agent install (traditional) + enrollment (modern) → 2FA + roles.
- **Owns:** Prerequisites, system requirements, SoM (domain/workgroup/remote office), agent install (push/GPO/SCCM/manual/Azure/Intune/Autopilot), MDM enrollment (iOS/Android/Knox/Chrome/tvOS/macOS), APNs setup, 2FA, role-based administration.
- **Key flows:** Define SoM wizard, Add Domain/Workgroup, Agent Install (choose method), Mobile Enrollment (platform + auth), APNs cert, User Administration (role/scope).
- **Personas:** First-time implementers, sysadmins, network/security teams.
- **Top friction:** Dual-onboarding of modern laptops (agent + enrollment) not obvious; push install fails on Access-Denied/UAC; APNs renewal friction; terse port-validation errors.
- **Cross-refs:** architecture, patch, software-deployment, mdm, remote-troubleshooting.

### Reporting & Auditing
- **KB file:** `reporting-auditing.md`
- **Console:** `Reports` tab > category > report
- **Edition/platform:** All; on-prem + cloud.
- **Purpose:** Compliance reporting — 200+ AD reports, custom/query/scheduled builders, compliance templates, dashboards.
- **Owns:** Reports (Executive/Predefined/Custom/Query/Scheduled), AD reports, user-logon reports, compliance templates (HIPAA/CIS/GDPR/PCI/ISO/NIST/RBI/DPDPA), compliance dashboards, formula columns, PII masking, report delivery, Group By, date templates.
- **Key flows:** Reports tab navigation; Create Custom Report (Table/Chart, columns, Group By, filters); Query Report (SQL); Add Schedule Report (format/recipients/frequency).
- **Personas:** IT admins, compliance officers, auditors, IT managers.
- **Top friction:** Chart reports can't be scheduled/exported; formula-column scoping blocks sharing; query-report SQL needs support; template discoverability (8+ frameworks).
- **Cross-refs:** integrations (SIEM), patch, vulnerability, application-control, dlp, mdm.

### Integrations
- **KB file:** `integrations.md`
- **Console:** `Admin > Integrations`
- **Edition/platform:** All; on-prem + cloud.
- **Purpose:** ITSM/security/SIEM/identity/BI integrations to sync data and centralize admin.
- **Owns:** ITSM (ServiceDesk Plus/ServiceNow/Jira/Zendesk/Freshservice), VM (Tenable/Rapid7/Qualys/CrowdStrike), SIEM (Log360/EventLog/Splunk), identity (AD/Azure Entra ID), BI (Analytics Plus), AssetExplorer, PAM360, Zoho Flow, REST API.
- **Key flows:** Admin > Integrations > select > credentials/keys > validate > enable/schedule sync.
- **Personas:** IT admins, integration engineers, SOC.
- **Top friction:** Connectivity/credential errors; API-scope misconfig (Azure/Splunk/Tenable); asset-field-mapping gaps (reconciliation).
- **Cross-refs:** patch, vulnerability, software-deployment, remote-troubleshooting, edr.

### Zia AI Assistant
- **KB file:** `zia-ai.md`
- **Console:** Mobile app (Android voice) > Zia; console "Ask Zia" in Endpoint Analytics (inferred)
- **Edition/platform:** Cloud-first; Android hands-free voice; on-prem availability unclear.
- **Purpose:** AI execution layer — NL query + action for admins, self-service for end users.
- **Owns:** Zia for Admins (Operations & Security Agent), Zia for End Users (Self-Service Companion), Zia Agent Studio, Zoho MCP, context-aware patching, AI-generated scripts, EDR threat investigation.
- **Personas:** IT admins, L1 help-desk, end users, automation engineers.
- **Top friction:** Trust/confirmation for AI-executed actions (blast-radius); NL scope mis-resolution; voice Android-only (iOS gap); on-prem availability unclear.
- **Cross-refs:** admin-mobile-app, edr, patch, software-deployment, dex.

### Glossary · Point Products · Advisories · Cloud-vs-OnPrem · MSP · Admin Mobile App
- **`glossary.md`** — 100+ EC terms (SoM, APD, APNs, DS, SGS, EPM, DLP, DEX, NAC, NGAV, WinPE…) → module mapping. Use to decode acronyms in a request.
- **`point-products.md`** — standalone ManageEngine products ↔ EC modules. See the dedicated **Point Products** capsule below (build-vs-bundle, naming traps, edition gating).
- **`security-advisories-cve.md`** — EC's OWN CVEs/advisories + fixed builds + PPM update flow. Use when designing update/patch-EC-itself or security-posture surfaces.
- **`cloud-vs-on-premises.md`** — Cloud vs On-Prem parity: EDR & Zia are Cloud-only; DLP, Secure Private Access, voice/video remote are On-Prem-only; OS deployment On-Prem-centric. Always check this for edition/deployment gating in a brief.
- **`endpoint-central-msp.md`** — multi-tenant MSP console: tenant switcher, per-client scope/RBAC/billing/branding, PSA integrations. Design for wrong-tenant risk + cross-client alert fatigue.
- **`admin-mobile-app.md`** — iOS/Android admin companion: patch approve/deploy, scan, remote actions, alerts, Zia voice (Android). Design for on-prem server-connect first-run + confirmation on destructive actions + feature-subset expectations.

### Point Products — standalone ↔ Endpoint Central mapping
- **KB file:** `point-products.md`
- **Console:** N/A — point products are separate purchases/consoles; each maps to one EC module inside the single EC console.
- **Edition/platform:** Each point product has its own Free (usually ≤25 endpoints) / Professional / Enterprise + Cloud/MSP variants; the same engine ships as an EC module.
- **Purpose:** ManageEngine sells most endpoint capabilities two ways — as focused standalone "**Plus**" point products *and* bundled inside Endpoint Central (one agent, one console). A point product ≈ "one EC module sold separately." Use this to know, when a feature comes up, both the EC module AND the standalone product it corresponds to, and to reason about edition gating.
- **Standalone → EC module → KB file:**
  - **Patch Manager Plus** → Patch Management → `patch-management.md` (EC Professional+)
  - **Vulnerability Manager Plus** → Vulnerability Management → `vulnerability-management.md` (EC Security)
  - **Mobile Device Manager Plus (MDM Plus)** → MDM → `mobile-device-management.md` (EC Professional+ mobile; UEM for modern laptops)
  - **Application Control Plus** → App Control + EPM → `application-control-privilege-mgmt.md` (EC Security; JIT is an add-on)
  - **Device Control Plus** → USB/peripheral control (Endpoint Data Security) → `endpoint-data-security-dlp.md` (USB mgmt EC Enterprise+)
  - **Endpoint DLP Plus** → DLP (Endpoint Data Security) → `endpoint-data-security-dlp.md` (EC Security, On-Prem only)
  - **Browser Security Plus** → Browser Security → `browser-security.md` (EC Security)
  - **Remote Access Plus** → Remote Troubleshooting → `remote-troubleshooting.md` (EC Professional; auditing Enterprise)
  - **OS Deployer** → OS Imaging & Deployment → `os-deployment.md` (EC UEM)
  - **Patch Connect Plus** → *NOT bundled in EC* — third-party patching add-on for Microsoft SCCM/Intune/WSUS; uses Microsoft's agent, not EC's. Conceptually near `patch-management.md`.
- **EC-only modules (no standalone "Plus" sibling):** EDR, NGAV/Anti-Ransomware, IT Asset Management, Software Deployment, Configuration Management, DEX, Secure Private Access (ZTNA).
- **Naming traps (avoid mislabeling in designs/specs):** "Desktop Central" = "Endpoint Central" (renamed ~2022; URL slug still `/desktop-central/`). **Patch Manager Plus** (ME's own engine) ≠ **Patch Connect Plus** (SCCM/Intune bolt-on). **Remote Access Plus** lives at `/remote-desktop-management/`. There is **no** standalone "Endpoint Privilege" product — EPM ships inside Application Control Plus and as EC's EPM module. The "+ /Plus" suffix marks a point product; the suite is just "Endpoint Central".
- **Why it matters for UX/PM:** clarifies edition/feature gating (what's in Professional vs Enterprise vs UEM vs Security), the "build-vs-bundle" upsell story (each point product cross-sells EC via a `*-vs-ec` migration page), and which capabilities are add-ons even within the suite (e.g., JIT access). Feeds the brief's "edition/platform gating" and any upgrade-prompt / consolidation UX.
- **Cross-refs:** 00-product-overview (editions), cloud-vs-on-premises (parity), endpoint-central-msp, and each mapped module file above.

---

## UEM CORE

### Patch Management
- **KB file:** `patch-management.md`
- **Console:** `Patch Mgmt` (or `Threats & Patches`) > Deployment (APD, Deployment Policies, Test & Approve, Manual Deployment, Decline Patch, Trash) / Systems (Scan, Attention Required) / Patches (Missing, Downloaded) / Settings (Patch DB, System Health Policy)
- **Edition/platform:** All paid (Professional+); limited Free. Windows/macOS/Linux + 1,000+ third-party apps.
- **Purpose:** Automated patch lifecycle — detect, download, test, approve, deploy.
- **Owns:** Patch scan, vulnerability DB sync, APD, Test & Approve, deployment policies (window/reboot/notify/WoL/grace), decline patches, System Health Policy (Healthy/Vulnerable/Highly Vulnerable), BIOS/driver updates, AV definition updates, RHEL/SUSE, SSP publishing, patch reports.
- **Key flows:** 4-step APD wizard; Deployment Policy editor; Test & Approve / test group; Manual Deploy (patch/computer/detailed views); Decline wizard; dashboard health tiles → Attention Required.
- **Personas:** IT admins, patch admins, help-desk, server owners (SSP).
- **Top friction:** Scanning is event-driven only (can't schedule/restrict) — expectation mismatch; auto-approve rule subtle; Deploy-vs-SSP decision; wizard cognitive load; "No Missing Patches Found" when approval pending.
- **Cross-refs:** software-deployment, vulnerability, configuration, reporting, zia.

### Software Deployment (+ children)
- **KB file:** `software-deployment.md` — children: `self-service-portal.md`, `software-repository.md`, `enterprise-app-catalogue.md`
- **Console:** `Software Deployment` > Package Creation (Packages, Templates) / Deployment (Install/Uninstall Software, Self-Service Portal, View Configurations) / Settings (Software Repository, SSP Settings)
- **Edition/platform:** Professional+ (MDM editions for mobile OTA). Windows/macOS/Linux/mobile.
- **Purpose:** Distribute, install, uninstall, update software via templates, repositories, policies, and SSP.
- **Owns:** Package creation (MSI/EXE/APPX/MSIX), pre/post-deployment activities, software repository (Network Share vs HTTP), deployment policies, Self-Service Portal, Enterprise App Catalogue, mobile OTA (VPP, managed Google Play), 10,000+ templates, auto-update templates, software metering link.
- **Key flows:** Package → repo → deploy → policy → status; SSP publish → user self-install from tray.
- **Personas:** IT admins, application managers, help-desk, end users (SSP).
- **Top friction:** Silent-install switches hard to source (fail late); Network Share vs HTTP repo choice; Mac/Linux packaging docs thinner; SSP 90-min sync lag; SSP action mismatch (name/version vs Control Panel).
- **Cross-refs:** patch, inventory, remote-troubleshooting, configuration, mdm.

### IT Asset Management (+ children)
- **KB file:** `it-asset-management.md` — children: `software-metering.md`, `software-license-management.md`, `warranty-management.md`, `certificate-management.md`, `power-management.md`, `prohibited-software.md`
- **Console:** `Inventory` > Actions/Settings (Scan Systems, Scan Settings, Schedule Scan, Software Metering, Manage Licenses, Configure Alerts, File Scan Rules, Custom Fields, Prohibit Software) / View Inventory Details (Hardware/Software/System) / `Reports > Inventory Reports`
- **Edition/platform:** Professional+ (metering/licenses Enterprise+); Free reduced.
- **Purpose:** Real-time HW/SW inventory, license compliance, metering, warranty, prohibited software, alerts.
- **Owns:** Asset scans (on-demand/scheduled/automated), HW/SW inventory, license management, software metering (90-day window), warranty (OEM auto-detect), prohibited software + auto-uninstall, file scanning, custom fields, real-time alerts (HW/SW change, license, disk, cert expiry).
- **Personas:** IT admins, asset managers, finance/procurement, end users (prohibited-software notice).
- **Top friction:** HW-change scan waits for reboot; metering 90-day window opaque; license grouping manual; alert fatigue (many categories).
- **Cross-refs:** configuration, software-deployment, dex (device-age/warranty for refresh).

### Configuration Management
- **KB file:** `configuration-management.md`
- **Console:** `Configurations` > Add Configurations (Windows/Mac/Linux; Computer/User; Templates) / Script Repository / Collections / Settings
- **Edition/platform:** All paid (core UEM).
- **Purpose:** Central management of settings, security policies, apps, and scripts (50+ Win, 30+ Mac, 20+ Linux configs).
- **Owns:** Computer configurations (startup, 90-min refresh), user configurations (logon/logoff), templates, collections, script repository (300+ scripts), custom scripts, profiles/kiosk, drift, Group By/exclusions, config reports. Certificate/Power/BitLocker/Kiosk can be delivered here.
- **Key flows:** Add Configurations → OS/Computer/User → config family → package/deployment/target/execution → deploy.
- **Personas:** Sysadmins, desktop admins, scripting engineers, kiosk owners.
- **Top friction:** Config taxonomy dense (4 families × user/computer); script args lack validation/dry-run; revert asymmetry (only some configs trash-revert); drift visibility gap.
- **Cross-refs:** os-deployment, mdm (profiles), remote-troubleshooting (scripts).

### OS Deployment
- **KB file:** `os-deployment.md`
- **Console:** `OS Imaging & Deployment` > Images / Customize / Deploy / Remote Deployment
- **Edition/platform:** UEM/Security (add-on for Pro/Enterprise); On-Prem-centric; MSP Cloud add-on. Windows-primary.
- **Purpose:** Capture and deploy OS images with hardware-independent driver injection.
- **Owns:** Online/offline imaging, image + driver repositories, hardware-independent deployment (HID), WinPE media (USB/PXE/ISO), deployment templates, zero-touch/standalone/WFH deployment, user-profile migration, remote-office deployment.
- **Key flows:** Online Imaging (partition/compression/repo); Create Bootable Media (type + drivers); Zero-touch (template → media → targets → deploy).
- **Personas:** Imaging/deployment admins, branch IT, OS-migration leads.
- **Top friction:** WinPE/ADK install failures; PXE/DHCP expertise; disk-number mapping cryptic; MBR↔GPT conversion warnings.
- **Cross-refs:** configuration, remote-troubleshooting (WoL), inventory.

### Remote Troubleshooting (+ System Tools)
- **KB file:** `remote-troubleshooting.md` — child: `system-tools.md`
- **Console:** `Tools` > Remote Control (+ History) / System Manager / Remote Shutdown / Wake on LAN / Chat / Announcement / System Tools
- **Edition/platform:** All (Free ≤25 desktops). Voice/video On-Prem-only.
- **Purpose:** Web-based remote control, recording, chat/voice/video, WoL, shutdown, and Windows maintenance tools.
- **Owns:** Remote control (HTML5 + ActiveX viewers), input control/blackout, multi-monitor, session recording, file transfer, chat (audited), voice/video, remote shutdown/restart/lock, WoL (cross-VLAN), system tools (Defrag/Check Disk/Cleanup), announcements, view-only, idle-timeout, user confirmation.
- **Key flows:** Tools > Remote Control > device > Connect > session toolbar; System Tools > options → targets → schedule.
- **Personas:** IT support, help-desk, sysadmins, end users (WFH).
- **Top friction:** HTML5 vs ActiveX choice unclear; user-confirm blocks technician if user absent; "make permanent" one-way; multi-monitor scaling; WoL debugging (BIOS/NIC/VLAN).
- **Cross-refs:** system-tools, configuration (scripts), patch (WoL).

### Digital Employee Experience (DEX)
- **KB file:** `endpoint-intelligence-dex.md`
- **Console:** `DEX` > Dashboard / Devices / Settings
- **Edition/platform:** Enterprise+ (add-on, gating inferred); Windows-primary.
- **Purpose:** Telemetry → Experience Score → RCA → automated remediation, proactively.
- **Owns:** Experience Score (endpoint/network), Baseline Score, telemetry (CPU/memory/GPU/disk/battery/boot/logon/crash), metrics (Performance/Reliability/Responsiveness/App Reliability), RCA, automated remediation workflows, Action Library, Zia-accelerated investigation.
- **Key flows:** Settings (metric thresholds + baseline) → Devices (per-device events/insights) → Dashboard (network score vs baseline).
- **Personas:** IT ops/desktop engineering, service desk (RCA), IT leadership (refresh planning), automation engineers.
- **Top friction:** Static-threshold tuning → alert fatigue; single-score interpretability → action mapping; cold-start baseline (no recommended baseline); auto-remediation blast-radius (needs staging/approval); telemetry overhead transparency.
- **Cross-refs:** inventory (device age), patch (remediation), zia (RCA/auto-fix).

### Mobile Device Management (+ children)
- **KB file:** `mobile-device-management.md` — children: `mobile-app-management-mam.md`, `email-management.md`, `content-management.md`, `conditional-access.md`, `geo-fencing.md`, `kiosk-management.md`, `byod-management.md`
- **Console:** `Mobile Device Management` / `Device Mgmt` > Enrollment / Profiles / Apps / Security Management (Conditional Access) / Email / Content / Kiosk / Reports
- **Edition/platform:** Professional (mobile) / Enterprise / UEM (modern laptops too); iOS/Android/Windows/macOS/ChromeOS/tvOS. Includes OS Update Management for mobile.
- **Purpose:** Enroll, manage, secure mobile + modern devices — apps, email, content, kiosk, conditional access, wipe.
- **Owns:** Enrollment (OTA/manual/bulk/self/Autopilot/APNs/Android-Enterprise), ownership (corporate/BYOD), profiles/policies, MAM, email (Exchange ActiveSync), content distribution, containerization, kiosk (single/multi-app), conditional access, geo-fencing, OS update management, remote lock/wipe (full/corporate-selective), app catalog, VPP, managed Google Play.
- **Key flows:** Enrollment (method → auth → ownership → verify); Profiles (create → associate to group); Apps (distribute); Security (lock/locate/wipe).
- **Personas:** MDM admin, help-desk, end user (BYOD), security ops.
- **Top friction:** APNs cert setup/renewal (.pem format → "Invalid APNs"); push-service ports (5223 APNs / 5228-30 FCM / WNS) hidden cause of "device not reachable"; ownership tagging at enrollment is high-stakes for BYOD privacy; VPP redemption-code exhaustion.
- **Cross-refs:** children above; configuration (profiles for modern laptops); software-deployment (OTA apps).

---

## SECURITY SUITE

### Vulnerability Management
- **KB file:** `vulnerability-management.md`
- **Console:** `Threats & Patches` > Software Vulnerabilities / Zero-day / System Misconfiguration / Web-server Hardening / High-Risk Software / CIS Compliance
- **Edition/platform:** Security Edition. Windows/macOS/Linux (assessment); Windows-only NAC.
- **Purpose:** Risk-based vulnerability assessment, prioritization, and remediation + security config/hardening.
- **Owns:** Vulnerability assessment (severity/exploit/patch-availability/CVSS/age), zero-day + scripted mitigation, security misconfiguration (200+ CIS/STIG), CIS compliance (90+ policies, L1/L2), web-server hardening, high-risk software (EOL/RDP/P2P), port audit, NAC/System Quarantine, vulnerability exceptions.
- **Key flows:** Software Vulnerabilities → filter → Fix (patch deploy or script/config); CIS Compliance → framework → scan → dashboard → remediate.
- **Personas:** Security ops, vulnerability managers, compliance officers, IT admins.
- **Top friction:** Prioritization has many axes (6); age-matrix UI dense; zero-day patch-vs-script signposting; CIS sync failure not obvious; NAC rule complexity.
- **Cross-refs:** patch, application-control, dlp, edr, configuration.

### Malware Protection — NGAV & Anti-Ransomware (+ children)
- **KB file:** `next-gen-antivirus-ransomware.md` — children: `next-gen-antivirus.md`, `anti-ransomware.md`
- **Console:** Security / Malware Protection settings; `Anti-Ransomware` tab (settings, VSS backup frequency)
- **Edition/platform:** Security Edition (NGAV add-on; Anti-Ransomware bundled/trial). Windows 8–11.
- **Purpose:** Multi-layer malware detection + ransomware behavioral detection with VSS rollback.
- **Owns:** NGAV (static/dynamic/deep-learning detection, MITRE TTP mapping, remediation), Anti-Ransomware (behavior detection, VSS shadow copies, single-click rollback, repeat-offender defense), exclusion lists, Zia triage (Cloud).
- **Key flows:** Enable Malware Protection; Anti-Ransomware > enable > rollback config; Incidents > alert > classify TP/FP > remediate.
- **Personas:** Security analysts, IT admins, incident responders.
- **Top friction:** NGAV add-on/Early-Access discovery; exclusion-list per-engine/per-method density; VSS rollback prerequisites not validated upfront.
- **Cross-refs:** edr, vulnerability, dlp.

### Endpoint Detection & Response (EDR)
- **KB file:** `endpoint-detection-response.md`
- **Console:** EDR/Security workspace > Incidents / Threat Hunting / Malware Protection / Anti-Ransomware / Settings
- **Edition/platform:** Cloud-only (inferred); Windows-primary detection engines.
- **Purpose:** Detect, investigate, respond to behavior-driven attacks; threat hunting + guided response.
- **Owns:** Incidents (auto-grouped alerts), alerts (Behavior Type), threat hunting (event-log queries, saved/recurring detections), Behavior/Ransomware/Exfiltration engines, Zia triage + attack-timeline (Cloud), containment/isolation, file neutralization, VSS rollback, exclusion list, IoA/IoC/MITRE ATT&CK.
- **Key flows:** Incidents → incident → Alerts → classify TP/FP; Threat Hunting → query logs → save as recurring detection.
- **Personas:** Security analysts, incident responders, SecOps, threat hunters.
- **Top friction:** Cloud-first positioning confuses on-prem; headline AI features Cloud-gated; alert fatigue; query language/saved-condition UX thin in KB.
- **Cross-refs:** ngav-ransomware, vulnerability, patch, zia.

### Browser Security
- **KB file:** `browser-security.md`
- **Console:** `Browsers` tab > Policies / Manage (Groups & Computers)
- **Edition/platform:** Security Edition. Windows + macOS (add-on mgmt); Chrome/Firefox/Edge/IE + Ulaa/Brave/Vivaldi/Yandex/Cốc Cốc/Naver Whale.
- **Purpose:** Central browser hardening, lockdown, filtering, threat prevention, DLP across browsers.
- **Owns:** Browser Restriction (allow/blocklist), Lockdown (kiosk), Router (IE-mode redirect), Web Filtering (category/SSL/ads), File Activity Restriction, Add-on Management, Web Isolation, Java Manager, DLP (print/sync/autofill/upload/screen-capture/history), Threat Prevention (Safe Browsing/SmartScreen), Customization (homepage/pop-ups/cookies/proxy).
- **Key flows:** Browsers > Policies > policy type > author > Manage > Groups & Computers > Associate > Deploy.
- **Personas:** Security admins, endpoint admins, compliance managers.
- **Top friction:** 11 policy types → dense authoring; file-upload restriction dialog-only (bypass risk); category filtering in beta; DLP settings scattered across policy types.
- **Cross-refs:** dlp, application-control, configuration.

### Application Control & Endpoint Privilege Management (+ children)
- **KB file:** `application-control-privilege-mgmt.md` — children: `application-control.md`, `endpoint-privilege-management.md`
- **Console:** Security console > Policies (Application Control / EPM); `Application Control` and `Endpoint Privilege Management` tabs
- **Edition/platform:** Security Edition (add-on); Windows-primary (inferred).
- **Purpose:** Zero-trust app governance (allow/deny) + least-privilege (remove admin, scoped elevation).
- **Owns:** Application Control (allow/blocklist, app groups by file/folder/publisher/hash/product/verified-exe/Store, Audit vs Strict mode, child-process control, self-updating lists), EPM (remove admin rights, app-specific elevation on-reason/on-request/auto, CLSID/Control-Panel elevation, Just-In-Time access, conditional access, self-elevation).
- **Key flows:** Application Control > Create Policy > allow/blocklist > associate; EPM > Create Policy > admin-rights removal + elevation rules (app + condition + approval) > associate.
- **Personas:** Security admins, privileged-access managers, auditors.
- **Top friction:** Rule-type complexity (publisher vs hash) needs expertise; Audit-mode false positives; elevation-approval modes need clarity; child-process inheritance surprises.
- **Cross-refs:** vulnerability (high-risk apps), configuration (script elevation), dlp.

### Endpoint Data Security — DLP / Device Control / Encryption (+ children)
- **KB file:** `endpoint-data-security-dlp.md` — children: `endpoint-dlp.md`, `device-control.md`, `bitlocker-management.md`
- **Console:** Security console > Policies (DLP / Device Control / Encryption); `Threats & Patches > Device Control`; BitLocker also via `Configurations`
- **Edition/platform:** DLP: Security, **On-Prem only**; Device Control: Enterprise+; Encryption: UEM+ (BitLocker/FileVault).
- **Purpose:** Discover/classify sensitive data (DLP), prevent physical egress (Device Control), encrypt at rest (BitLocker/FileVault).
- **Owns:** DLP (discovery/classification, clipboard/email/upload/print/screen-capture controls, cloud-upload protection, file tracing/mirroring, containerization), Device Control (USB/peripheral allow/block/read-only/trusted-device lists, temporary access, encrypt-on-write, file shadowing), BitLocker/FileVault (full-disk encryption, TPM/recovery-key escrow, automation, compliance).
- **Key flows:** DLP Policies > classification rules > control policies > associate; Device Control > USB rules (class/manufacturer/product) > associate.
- **Personas:** Security admins, data-security officers, compliance/privacy, forensics.
- **Top friction:** DLP false positives need tuning; device-class-vs-product mismatch risk; BitLocker TPM dependency; cloud-upload protection browser-specific.
- **Cross-refs:** browser-security (web-upload), application-control (file access), vulnerability.

### Secure Private Access (ZTNA) & Network Access Control
- **KB file:** `secure-private-access.md` — related: `network-access-control.md`
- **Console:** `Admin > Private Access` (build 11.5.2606.02+); NAC via `Threats & Patches > Compliance > System Quarantine Policy`
- **Edition/platform:** On-Prem only (inferred); Windows/macOS/iOS/Android (Private Access); Windows (NAC).
- **Purpose:** ZTNA app-level access (VPN alternative) + NAC quarantine for non-compliant endpoints.
- **Owns:** Private Access (application definition, App Segments, user/device verification via Azure Entra ID + agent enrollment, Application/Edge Connector, per-app TCP tunnels), NAC/System Quarantine (compliance rules: patch/software/service/vulnerability/registry-file; audit vs quarantine; restrictions: block-all/block-intranet/block-custom/allow-custom).
- **Key flows:** Admin > Private Access > Applications > add > App Segments > policy > Endpoints > enroll; or Compliance > System Quarantine Policy > rules > enable > isolation level.
- **Personas:** Network/security admins, ZTNA architects, identity/access managers, compliance.
- **Top friction:** Azure-Entra-only identity (no on-prem AD/LDAP/OIDC documented); TCP-only (no UDP); NAC rule+restriction combinations hard to reason about; connector placement non-trivial.
- **Cross-refs:** cloud-vs-on-premises, integrations (Azure Entra), vulnerability (NAC compliance rules).
