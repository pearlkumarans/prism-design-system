# Patch Management

> Automated, end-to-end patch management for Windows, macOS, Linux, and 1,000+ third-party applications — detect, download, test, approve, and deploy missing OS and application patches from a single console. Available across all paid Endpoint Central editions (Professional, Enterprise, UEM, Security); a limited form ships in the Free edition (manage up to a small device count). Patch Management is a foundational module bundled in every commercial tier, while advanced security tie-ins (Vulnerability Management, EDR) sit in the Security edition.

---

## 1. What it is — Feature detail

### Purpose and console placement
Patch Management is Endpoint Central's (EC, formerly Desktop Central) module for keeping operating systems and applications free of known, fixable vulnerabilities by automating the full patch lifecycle. ManageEngine defines it as "the process of acquiring, testing, and deploying updates—known as patches—to software applications, operating systems, and firmware." It is the most-used module and the historical backbone of the product, and it streamlines the entire patching lifecycle — from detection to deployment — across Windows, macOS, and Linux endpoints.

- **Top-level navigation:** the `Patch Mgmt` top-level tab. In Security-edition builds the same workflows also appear under `Threats & Patches`. Throughout this document both paths are given because the console exposes the identical sub-menus under either entry point.
- It sits upstream of (and feeds data into) Vulnerability Management and the security modules — a vulnerability traced by EDR back to an unpatched flaw can be remediated directly through this module.

### Console navigation paths (exact UI menu reference)
The following table consolidates the exact menu paths documented in the help/admin guide. Either `Patch Mgmt -> ...` or `Threats & Patches -> ...` is valid depending on edition.

| Task | Console path |
| --- | --- |
| Automate Patch Deployment (APD) | `Patch Mgmt -> Deployment -> Automate Patch Deployment` → **Automate Task** |
| Test & Approve (create test group) | `Threats & Patches -> Deployment -> Test and Approve` → **Add Group** |
| Manual approve / decline a patch | `Threats & Patches -> Missing Patches` → select → **Mark as** → Approved / Declined / Not Approved |
| Decline a patch (per group) | `Patch Mgmt -> Decline Patch` → **Select Group & Decline Patch** |
| Deployment Policies | `Threats and Patches -> Deployment -> Deployment Policies` → **Create Policy** |
| Scan systems for missing patches | `Patch Mgmt -> Systems -> Scan Systems` → **Scan Systems** / **Scan All** |
| On-demand Vulnerability DB update | `Patch Mgmt -> Update Now` → **Update Now** (under Update Vulnerability DB) |
| System Health Policy | `Patch Mgmt -> Settings -> System Health Policy` |
| Patch Database (DB sync) settings | `Admin -> Patch Settings -> Patch Database` |
| Downloaded / re-download patches | `Patch Mgmt -> Patches -> Downloaded Patches` (Settings tab shows patch-store path; **Re-download patches** action) |
| Missing patches view (URLs/IDs) | `Patch Mgmt -> Patches -> Missing Patches` |
| Attention Required (failed deploys, pending reboots) | `Patch Mgmt -> Systems -> Attention Required` |
| Red Hat Linux subscription settings | `Patch Management -> Redhat Linux Settings` |
| Agent post-install scan toggle | `Admin -> Agent settings -> General Settings` → "Perform Patch Scanning" |
| Scheduled patch reports | `Reports -> Schedule Reports -> Scan Report` |

### The patch management lifecycle
Per ManageEngine's documented lifecycle, the module operates through these phases:
1. **Update vulnerability details from vendors** — Zoho Corp continuously probes the internet for newly released patches and vulnerabilities. The Patch Database (hosted on the ManageEngine website) is "periodically updated and maintained through rigorous analysis and testing by ManageEngine" before being published.
2. **Scan the network** — EC agents continuously and automatically scan computers within the Scope of Management (SoM) to identify missing patches.
3. **Identify patches for vulnerabilities** — assess vulnerabilities; analyze which patches are missing vs. installed; classify each system by health status.
4. **Download and deploy patches** — download required patches from the vendor site, deploy to missing systems (via deployment policy or SSP), then verify/validate installation accuracy via a follow-up scan.
5. **Generate status reports** — produce Executive, Predefined, Scheduled, Patch, System, SSP, and APD reports to monitor enterprise-wide patching progress, and surface failures in the Attention Required view.

### FULL capability breakdown (sub-features and low-level mechanics)

- **Two-tier patch repository (Patch DB ↔ local Vulnerability Database):**
  - **Patch Database / Central Patch Repository** — hosted on the ManageEngine website (patchdb.manageengine.com). Zoho probes the internet for new patches/vulnerabilities for Microsoft, Apple, Linux, and other third-party vendors; each is verified and tested before being published.
  - **Local Vulnerability Database** — maintained by the EC server inside the customer environment. It syncs with the Patch DB on a configurable schedule (daily) or on demand. The sync downloads helper files in `.7z`, `.gz`, and `.sql` formats, so proxy/firewall must permit them.

- **Patch scanning (continuous, agent-driven):** The lightweight agent runs scans automatically in the background with minimal CPU/memory impact; the scan typically completes within a few minutes. **Vulnerability and patch scans are not separate — they run simultaneously in one scan.** Importantly, scanning **cannot be restricted to specific machines and cannot be scheduled** — EC scans automatically whenever certain trigger events occur (see Patch Scan Scenarios in §2).

- **Patch Deployment Policies:** flexible policies controlling *when* and *how* patches install — maintenance windows, reboot behavior, retry configuration, Wake-on-LAN, skip/grace-period, and pre/post-deployment activities (see §1 Settings reference).

- **Manual Patch Deployment:** lets the admin decide exactly which patches deploy, when, and to which systems — useful for business-critical production servers that cannot afford unplanned downtime. Available in a Patch-based view (one patch → all applicable systems) or System-based view (all missing patches → one system).

- **Automated Patch Deployment (APD):** schedule once, automate forever — fully automates detection, testing, approval, and deployment for specific applications/departments on a chosen schedule, minimizing the vulnerability window. Separate APD tasks target Windows, Mac, and Linux groups. **Automated third-party patch deployment** applies to Windows/macOS/Linux; **automated antivirus definition updates and feature-pack deployment** apply to **Windows only**.

- **Test & Approve before deployment:** form **test groups** of pilot computers; auto-install patches there before rolling network-wide. Patches auto-approve after a configurable number of days **only if** successfully installed on at least one machine with **no failures** across any test machine. Only manually-approved or Test-&-Approve-approved patches are deployed by an APD task.

- **Decline patches:** exclude specific patches, applications, or whole application families — scoped to All Computers or specific custom groups. A declined patch is no longer counted as missing, is excluded from system-health calculation, and is never deployed by APD. **Declining does NOT uninstall an already-installed patch.** Available for **Windows and macOS** (not yet Linux). Reason/remarks audit trail is available on EC 11.5.26.20.01 and above.

- **Patch Management for Closed Networks:** patch air-gapped/isolated networks by exporting patches from an internet-connected environment and importing them into the offline systems.

- **Self-Service Portal (SSP) publishing:** instead of forced deployment, publish IT-approved patches to the SSP for users/server owners to self-install during their own maintenance windows — critical for high-uptime servers.

- **Linux patch management:** automates patching across major distributions (Ubuntu, CentOS, Debian). **Red Hat Enterprise Linux** patching uses authenticated Red Hat subscription management (entitlement certificates); **SUSE** patching uses a registration code.

- **BIOS and Driver Updates:** detect outdated BIOS firmware and drivers and automate updates (Driver Updates automatable via APD on Windows; BIOS/driver coverage list on the BIOS/Driver Updates help page).

- **Antivirus definition updates:** schedule frequent AV definition updates to avoid bandwidth spikes. Supported: Microsoft Defender, Microsoft Defender x64, McAfee Endpoint Security, Microsoft Forefront Endpoint Protection 2010 Server Management (and x64), Microsoft Forefront Client Security (and x64), Microsoft Security Essentials (and x64).

- **System Health Policy:** classify each system as **Healthy / Vulnerable / Highly Vulnerable** by defining missing-patch thresholds per severity (see §1 Settings reference).

- **Superseded patch handling (Windows only):** a patch may become obsolete when a vendor releases a superseding update; admins can enable or ignore superseded patches in Patch DB settings.

- **Mobile app + Zia:** install patches, approve/decline, view reports, and initiate scans from the EC mobile app; Zia (EC's IT assistant) can perform these on request. APD and DB-sync notifications can be pushed to the mobile app.

- **Reporting:** Executive Summary reports (compliance metrics, vulnerabilities remediated, systems at risk), Predefined reports (Patch, System, SSP, APD), Scheduled reports (auto-generated and emailed), and the Attention Required section (failed deployments, pending reboots).

### Supported OS / platforms / coverage
- **Operating systems:** Windows, macOS, and Linux (Ubuntu, Debian, CentOS, Red Hat Enterprise Linux, SUSE Linux Enterprise).
- **Applications:** 1,000+ third-party applications plus all Microsoft/Windows updates, hotfixes, security updates, and service packs. (Full list on the supported-applications page.)
- **Networks:** Active Directory and Workgroup-based networks; physical and virtual assets; remote offices via Distribution Servers.

### Prerequisites and key concepts
- **EC server** installed on-premises (or EC Cloud), with the **EC agent** deployed to each managed endpoint and onboarded.
- **Scope of Management (SoM)** defined; automatic system discovery via Active Directory in AD environments.
- **"Perform Patch Scanning"** enabled under `Admin -> Agent settings -> General Settings` so the first scan runs after agent install.
- **Vulnerability DB synced** before the first scan (auto-daily; can be manual on-prem — not required on Cloud, which syncs automatically on weekdays).
- **Ports / connectivity** (see §4): server ports must be open at all times; for patch download the proxy/firewall must allow the vendor download URLs and `patchdb.manageengine.com`.
- **Red Hat prerequisite:** *mandatory* that all managed endpoints possess at least a **Standard subscription** for Red Hat Enterprise Linux; `cdn.redhat.com` (and `https://cdn.redhat.com`) must be reachable from the central server; entitlement certificates (`*.pem` + `*-key.pem`) in `/etc/pki/entitlement/`. SCA-enabled accounts only need the system registered via `subscription-manager`.
- **SUSE prerequisite:** an active SUSE subscription per machine and a valid registration code from the SUSE customer portal (`scc.suse.com`), configured under SUSE Linux settings.
- Key terms: Patch DB / Central Patch Repository, local Vulnerability Database, Deployment Policy, Test & Approve, APD task, Test Group, System Health Policy, Decline list, Deployment Window, grace period, Patch Store, superseded patch.

### Settings / options reference

**Patch Database settings** (`Admin -> Patch Settings -> Patch Database`):
1. **Selection of Patches** — choose which patch categories to manage, selectable individually per OS (Windows/Mac/Linux and third-party). EC always receives the full repository, but only missing patches matching the selection are listed after a scan.
2. **Superseded Patch Settings (Windows only)** — enable or ignore superseded/older patches.
3. **Schedule the Sync** — enable "Schedule Vulnerability Database Update" and set a daily **Start at** time; optional email notification address; optional mobile-app notification. (Cloud sync runs automatically on weekdays only; manual update is not applicable to Cloud.)

**Deployment Policy settings** (`Deployment -> Deployment Policies -> Create Policy`):
- **Name** the policy; any policy can be marked **default** so it applies to subsequent tasks.
- **Preferred week split:** **Regular Split** (normal weekly schedule) or **Patch Tuesday** (second Tuesday of each month until the following Monday).
- **Preferred days:** any/specific days (e.g. Saturdays + Sundays for weekend-only).
- **Deployment Window:** the per-client time interval for deployment; configurable **between 3 and 24 hours** (3 hours minimum recommended so the agent contacts the server at least once during the window).
- **Download patches from server to agent:** during the deployment window, or when the agent next contacts the server.
- **Initiation:** deployment can start at system startup or refresh cycle.
- **Pre-deployment:** "Automatically wake computers before deployment" (Wake-on-LAN — Windows; corporate LAN/WAN only; operates per the computer's local time zone); **Pre-Deployment Reboot** (exclude servers, skip machines that don't need it, notify users); **Custom Script** (Windows/Linux — run a script from the script repository before deployment, with Script Arguments, Dependency Files, Exit Codes).
- **Pre-deployment user notification:** Title, message content, Notification Timeout, "Allow Users to Skip Deployment," "Show deployment progress on the client systems," number of days after which deployment is **forced**, and idle-time limit before deployment begins.
- **Post-deployment:** Reboot/Shutdown — **Force** or **Delay** reboot/shutdown, scheduled time, "Restart and then Shutdown," customizable notification; Post-deployment **Custom Script** (Windows/Linux) to re-open apps closed pre-deployment.
- **Platform applicability:** Wake-on-LAN = Windows; Pre-deployment activities = Windows + Linux; Post-deployment Reboot/Shutdown = Windows + macOS + Linux; Post-deployment Custom Script = Windows + Linux.
- **Role-based access:** only Administrators, Policy Owners, and users with Patch Management Write or Software Deployment Write access may modify deployment policies.

**System Health Policy settings** (`Patch Mgmt -> Settings -> System Health Policy`):
- **Default classification:** Healthy = up-to-date; Vulnerable = missing Moderate/Low patches; Highly Vulnerable = missing Critical/Important patches.
- **Patch Severity Settings:** specify the *count* of missing patches per severity (Critical/Important/Moderate/Low) that tips a system into Vulnerable vs. Highly Vulnerable.
- **Advanced Settings:** "Consider only 'Approved Patches' to determine the System's Health"; "Exclude all 3rd party patches to determine the System's Health" (with **Add Exceptions** to re-include selected apps); "Exclude BIOS updates"; "Exclude the patches released in the last *N* days." Declined patches are never counted.

**APD task settings** — see §2 step-by-step procedure.

---

## 2. UX lens

### Primary user roles & jobs-to-be-done
- **IT Administrator / Patch Admin** — manages hundreds-to-thousands of endpoints; JTBD: keep all endpoints compliant with minimal manual effort, avoid downtime from bad patches, prove compliance.
- **Security/Compliance officer** — JTBD: confirm vulnerable systems are remediated and produce audit evidence.
- **Help-desk technician** — JTBD: remediate a specific user's missing patches on demand.
- **Server owner / business user (via SSP)** — JTBD: self-install patches during their own downtime without IT physically visiting the machine.

### Step-by-step: create an Automate Patch Deployment (APD) task
1. Go to `Patch Mgmt -> Deployment -> Automate Patch Deployment` (or `Threats & Patches -> Deployment -> Automate Patch Deployment`), click **Automate Task**, and select the Operating System (Windows / Mac / Linux).
2. **Select Applications.** For **Microsoft Updates**, pick by *Updates and Severities*, then choose **Patch All Applications**, **Patch Specific Applications** (select them under *Selected Applications*), or **Patch All Applications Except** (select the exclusions). Repeat for **Third Party Updates**. Optionally enable **Definition Updates** (AV — Windows) and **Driver Updates** (Windows). Under **Deployment**, set **Deploy patches after** *N* days post-approval (Windows) or release. *Only patches approved manually or via Test & Approve are deployed.* Click **Next**.
3. **Choose Deployment Settings.** Pick **Deploy** (per a Deployment Policy) or **Publish to Self Service Portal (SSP)** (for high-uptime servers). If Deploy: select the **Deployment Policy** (its Preferred Week(s)/Day(s) and Deployment Window are shown), optionally also push to SSP, optionally enable **Patch outside deployment window** (set grace days → force deploy for systems that missed the window), and optionally **Suspend** the task after a set date/time (useful when server downtime changes). Click **Next**.
4. **Define Target.** Include or exclude target computers/computer groups. Click **Next**.
5. **Configure Notifications.** Enable **Notify Download/Deployment Failure for every** *N* hours and/or **Notify Deployment Status Report for every** *N* hours; optionally **Attach Report** (PDF/CSV/XLSX); enter the **E-mail**; optionally **Enable notification via Mobile App**. Click **Save**.

### Step-by-step: configure Test & Approve and create a test group
1. Go to `Threats & Patches -> Deployment -> Test and Approve`.
2. Under **Patch Approval Settings**, the default is **Automatically without testing** (new patches auto-approve after ManageEngine's evaluation). Click **Modify** → choose **Test and Approve** to re-evaluate compatibility yourself.
3. For **Existing Patches**, choose **Retain Approval Status** (new patches become *Not Approved*) or **Mark Patch as Not Approved**. Save. *Note: switching back to "Automatically without testing" deletes all created test groups.*
4. Click **Add Group**. Under **Define Task**, choose **Platform** (Windows/Mac/Linux) and the **Group Name** (target group of pilot computers; create custom groups if needed).
5. **Deployment Option** — select Microsoft Updates and Third-Party Updates by *Updates and Severities* (Patch All / Specific / All Except); optionally **Driver Updates**.
6. **Deployment Settings** — set **Deploy patches after** to **0 Days** (test immediately); choose the deployment policy (recommended: *Deploy any time at the earliest*). *Only Not-Approved patches deploy to a test group; Approved/Declined ones do not.*
7. **Notification Settings (optional)** — **Enable Notifications** for approvals or test-stage deployment failures.
8. **Approval Mode** — enable **Automatically approve tested patches after** *N* days. A patch auto-approves only if installed successfully on at least one machine and with no failures anywhere.
9. Click **Create**. Patches then test in that group and can later deploy via an APD task or manually.

### Step-by-step: manual patch deployment (Install/Uninstall Patch)
Manual deployment is preferred for business-critical/production servers, for software whose automatic updates were disabled (its missing patches appear under **Supported Patches**, not **Missing Patches**), and whenever granular per-patch/per-target control is wanted. Applies to **Windows, macOS, Linux**.
1. Open **Missing Patches** at `Threats & Patches -> Patches -> Missing Patches`. Filter by application, service pack, bulletin, patch type, approval status, download time, or release time; views available are patch view, computer view, and detailed view. Select patches → **Install/Publish Patches** → the **Install/Uninstall Patch** window. (Alternatives: `Systems -> By Patches` → click the missing-patch count → select → Install/Publish Patches with targets auto-chosen; or `Deployment -> Manual Deployment -> Install/Uninstall Patch -> choose OS`.)
2. Give the configuration a **Name** and optional Description.
3. Under **List of Patches**, set **Operation Type** to **Install Patch** (or **Uninstall Patch** to roll back a previously installed patch from **Installed Patches** — supported only for patches with rollback capability, useful when a patch caused compatibility issues). Use **Add Patches** to add more (filter by missing/all, application, service pack).
4. **Deployment Settings:** choose **Deploy** (then pick a deployment policy — your **Self Created** policies, or **Created by Others** including ManageEngine pre-built ones) or **Publish to Self Service Portal (SSP)**; optionally also push to SSP; optionally enable **Patch outside deployment window** (set a grace date/time → force deploy). (Apply Deployment Policy / SSP / Patch-outside-window apply only when **Deploy** is chosen.)
5. **Define Target:** include/exclude target computers/groups.
6. **Execution Settings (optional):** **Retry this configuration on failed targets** (choose retry count, at startup or refresh cycle — useful for in-use apps like Java/.NET); **Enable Notifications**; **Scheduler Settings** — **Install After** date/time, **Do not apply this configuration after** date/time (constrain to a downtime window), and **Continue deployment even if some patches cannot be downloaded** (failed patches install on a later refresh cycle once re-downloaded).
7. Click **Deploy Immediately** (deploys to ≤200 computers now if the window is open, rest on next refresh) or **Deploy** (next refresh). If the window is closed, deployment always follows the policy regardless of which button is used.

### Manual deployment status states (Deployment Status view)
On the **Manual Deployment** page, each configuration shows a **Status**, drillable to per-endpoint **Execution Status** with **Remarks** (use **Detail View** for failure reasons and **Read KB** to jump to the matching troubleshooting article):
- **Draft: Download In Progress** — server is downloading patches from the vendor.
- **Ready to Execute** — server has the patches.
- **In Progress** — agent is installing on targets.
- **Executed** — install succeeded on all targets.
- **Retry in Progress / In Progress (Failed)** — retry-on-failure is enabled and a previous attempt failed; the agent is retrying.
- **Failed** — deployment failed at some stage across all attempts.
- **Not Applicable** — policy deployed to a group but specific computers don't meet the criteria.

### Step-by-step: publish patches to the Self-Service Portal (SSP)
SSP lets users/server owners install IT-approved patches during their own downtime — ideal for high-uptime servers and special equipment (e.g., CT/MRI scanners). Available for **Windows and Linux**.
1. **Publish** via Manual Deployment (Missing Patches → Install/Publish Patches → **Deployment Option = Publish to Self Service Portal (SSP)** → Deploy) or via APD (Choose Deployment Settings → **Publish to Self Service Portal (SSP)**). Only approved patches are published via APD.
2. **Enable the portal entry point (Windows):** `Admin -> SoM Settings -> Agent Settings -> Agent Tray Icon` → enable **Show Agent Icon in the System Tray** and **Show Self Service Portal Menu** → Save. Users then right-click the agent tray icon → **Self Service Portal** (or use desktop shortcut / Start menu if enabled).
3. **Linux:** GUI mode — `cd <uems_agent>/bin` (default `/usr/local/manageengine/uems_agent/bin`) then `sudo ./StartSelfServicePortal`. CLI mode — `sudo ./SelfServicePortal` with commands such as `update` (sync), `list` / `list -s <severity>` / `list --security`, `upgrade` / `upgrade -s <severity>` / `upgrade --security` / `upgrade patch1 patch2`.
4. **End user:** opens SSP → **Updates** → **Install** beside the desired patch.
5. **Display/Rebranding settings:** `Threats & Patches -> Settings -> Self Service Portal Settings -> Settings` (choose tray/Start menu/desktop shortcut) and **Rebranding** (replace logo/name, header/table colors).

### Step-by-step: suspend, delete, or restore a manual deployment
- **Delete:** `Deployment -> Manual Deployment` → select → **Move to Trash** (view/restore from `Deployment -> Trash` → Action ⋯ → **Restore**).
- **Suspend / Resume:** `Deployment -> Manual Deployment` → Action ⋯ → **Suspend** (later **Resume**). Useful for banks/regulated orgs with strict monthly downtime windows, or to stop an incorrectly configured task.
- Suspend/delete take effect immediately on LAN/remote agents (except machines with a deployment already in progress, which continue) and per the replication policy under a distribution server.

### Step-by-step: decline a patch
1. Go to `Patch Mgmt -> Decline Patch` (or `Threats & Patches -> Patches -> Decline Patch`) → **Select Group & Decline Patch**.
2. Under **Select Custom Group**, choose **All Computers Group** (decline everywhere) or a specific custom group; add an optional Description; **Next**.
3. Under **Select Patches, Applications & Families**, click **Add Patches** and choose by **Family / Patch Type / Application** (or use the Applications / Family tabs). Optionally add a reason and remarks (EC 11.5.26.20.01+). Click **Add**.
4. Review the **Summary Details** and click **Save**. Declined patches drop out of missing-patch counts and system-health calculation and will not be deployed by APD.

### Step-by-step: scan systems for missing patches
- **From the console:** `Patch Mgmt -> Systems -> Scan Systems` → select computers → **Scan Systems**; or **Scan All** (limited to 100 computers).
- **From an endpoint:** right-click the **Agent Tray icon -> Scan -> Initiate Patch Scan**.
- **On-demand DB update + scan:** `Patch Mgmt -> Update Now` → **Update Now** (a scan follows the DB update).

### Patch Scan Scenarios (what triggers a scan)
A scan triggers on: daily/manual **DB synchronization**; after **patch installation** (Install Patch Configuration, APD, or Test & Approve); after a **system reboot** that a patch required; when patches in an APD task or test group are **approved / not-approved / declined**; on a **manual scan** (console or agent tray); and after **agent installation** if "Perform Patch Scanning" is enabled. There is no scan schedule and no per-machine restriction.

### Dashboard triage
Open the Patch Management dashboard → see Healthy / Vulnerable / Highly Vulnerable tiles → drill into systems needing attention; the **Attention Required** view lists failed deployments and pending reboots.

### UX research hooks / friction points to study
- **Deployment policy complexity** — week split / days / 3–24h window / reboot / skip / grace-period combinations are powerful but cognitively heavy; study where admins misconfigure windows or grace periods.
- **Deploy vs. SSP decision** — the trade-off between forced Deploy and SSP publishing for high-uptime servers is a documented pain point; study whether the choice is understood at the point of decision.
- **Test & approve adoption** — do admins create test groups, or skip testing? The auto-approve-only-if-no-failures rule is subtle; study comprehension.
- **Decline workflow discoverability** — declining per group, and the fact that it does not uninstall, is easily misunderstood.
- **Scan-expectation mismatch** — users may expect to schedule/restrict scans; the UI must set expectations that scanning is event-driven, not scheduled.
- **Notification overload** — hourly failure + status emails can cause fatigue (mirrors EDR alert-fatigue).
- **"No missing patches found" confusion** — when manual approval is on, an APD task can report this even though patches exist but are unapproved; study messaging.

### Notable UI patterns/components
- Patch Management dashboard with health-status tiles; Patch-based vs. System-based views; the 4-step APD wizard; the Deployment Policy editor (pre/post-deployment, notifications); Test & Approve / Test Group editor; Decline Patch wizard; Downloaded Patches (with Re-download); Missing Patches (with per-patch URL/ID); Attention Required; Reports (Executive/Predefined/Scheduled); mobile app + Zia conversational actions.

---

## 3. PM lens

### Value proposition & measurable outcomes
- **"Customers have slashed patching time by 90%"** (Forrester Total Economic Impact study of UEMS, cited on the patch-management page).
- **"Set it and forget it"** — schedule once, fully automate the lifecycle.
- Customer proof: County of Madison (NY) reduced its security-patch timeline and gets daily metrics; BMI Healthcare automates deployment for **6,500+ systems**. Trusted-by logos: NASA, Honda, Etihad, TCS, ABT.
- Business outcomes: reduced breach risk (unpatched systems are the most common attack entry point), reduced downtime, regulatory compliance, improved productivity.

### Target personas & use cases
- Mid-to-large enterprise IT teams managing 1,000+ heterogeneous endpoints.
- Regulated industries (healthcare, finance, government) needing audit-ready compliance.
- MSPs (the page is explicitly applicable to **Endpoint Central MSP**) patching across multiple client tenants.
- Air-gapped/secure environments (Closed Network patching).

### Competitive positioning / differentiators
- **Cross-platform breadth** — Windows + macOS + Linux (incl. RHEL/SUSE) + 1,000+ third-party apps in one console (vs. WSUS/SCCM being Microsoft-centric).
- **Vetted Patch DB** — ManageEngine tests patches before publishing, reducing faulty-patch risk.
- **Tight integration with the wider UEM/security suite** — patch data feeds Vulnerability Management and EDR remediation.
- **Test & Approve + Decline + SSP + Closed-Network** give granular safety and reach controls competitors often lack at this depth.

### Edition gating & packaging
- Patch Management is included in **all paid editions** (Professional, Enterprise, UEM, Security) plus a limited **Free edition** (Windows patching). Advanced security adjacencies (Vulnerability Management, EDR, Anti-Ransomware/NGAV add-ons) are gated to the Security edition / sold as add-ons. (Edition specifics inferred from ManageEngine edition gating.)

### Recommended best practices (from the admin guide)
ManageEngine's documented best practices for automatic patch deployment, which double as PM guidance and onboarding defaults:
1. **Test before production** — evaluate patches in a pilot/test group that mirrors the real network (all OSes used) before approving and rolling out via APD.
2. **Critical-first prioritization** — deploy Critical/Important patches first; patch highly vulnerable, business-critical, and internet-facing systems without delay; schedule moderate/low patches in regular maintenance windows.
3. **Schedule auto-deployments twice a week** — vendors like Chrome/Firefox ship weekly; twice-weekly APD keeps compliance high.
4. **Group-tailored configurations** — create computer groups by domain/OS/hardware/app and critical-vs-noncritical role; tailor a deployment policy per group (e.g., Patch Tuesday split, working/non-working hours).
5. **Allow users to postpone deployments/reboots** — protect productivity with skip/delay plus notify-then-force-reboot.
6. **Patch all vulnerabilities, not just zero-days** — known (non-zero-day) flaws also cause breaches.
7. **Generate detailed compliance reports** — schedule Executive/Predefined reports for audit visibility and to track vulnerabilities mitigated.

### Product expansion opportunities / gaps / roadmap ideas (analysis)
- **Linux Decline parity** — Decline is Windows/macOS only; the help page explicitly invites feature requests for Linux. *(inferred opportunity)*
- **Patch risk scoring / AI sequencing** by exploit-in-the-wild data (tie to CISA KEV). *(inferred)*
- **Rollback for OS/app patches** — extend the Anti-Ransomware one-click-rollback concept to patch-induced regressions. *(inferred)*
- **Maintenance-window intelligence** — auto-suggest windows from observed usage/power patterns to reduce SSP-vs-Deploy confusion. *(inferred)*
- **Unified compliance posture** — single SLA dashboard combining patch latency + vulnerability + config drift. *(inferred)*
- **Self-healing APD** — auto-retry/auto-quarantine endpoints repeatedly failing deployment. *(inferred)*

---

## 4. Developer / Technical lens

### Architecture & components
Per the LAN-architecture document, the deployment comprises:
- **EC Server** (on the customer site; should never be switched off) — orchestrates agent install, scanning, downloading, deployment, and reporting; hosts the local **Vulnerability Database**. Downloads required patch binaries from vendor sites and stores them in the **Patch Store** before agents copy them.
- **Patch Database** — a portal on the ManageEngine website hosting the tested vulnerability DB; the server syncs it periodically (via proxy or direct internet) and scans the network for missing patches.
- **EC Agent** — a lightweight application on each managed endpoint; performs (authenticated, domain-credentialed) vulnerability/patch scans and patch installation, and reports status back. It contacts the server at **system startup / user logon and at a 90-minute refresh interval**.
- **Web Console** — central management point accessible over LAN/WAN/VPN; no separate client install.
- **Active Directory** — source for site/domain/OU/group/computer discovery and reports.
- **Distribution Server** — used for remote-office/branch bandwidth optimization (WAN-distributed patch delivery).
- **Third-party notification services** — FCM (Android), WNS (Windows), APNs (iOS) for push notifications.

### Agent mechanics
- **Scanning:** continuous and automatic (not scheduled, not per-machine-restrictable); vulnerability and patch scans run together; results posted to the server within a few minutes per machine. The agent contacts the server at startup/logon and every 90 minutes for instructions.
- **Deployment:** server hands the agent approved patches and the deployment policy; the agent applies them within the deployment window, handles pre/post-deployment scripts and reboots, and reports status.
- **Wake-on-LAN:** server can wake powered-off corporate-LAN/WAN machines before a scheduled deployment (per the machine's local time zone).
- **Closed networks:** patches exported from an online environment are imported into the offline EC environment.
- **Red Hat:** entitlement certs auto-upload from a qualifying agent; the server downloads offline metadata from `cdn.redhat.com` (allow one refresh cycle before scan/deploy). RHUI-subscribed cloud systems download metadata/patches directly from the configured RHUI repositories rather than the EC server (changeable via an internal setting on request).

### Ports, protocols, integrations, APIs
From the architecture and troubleshooting docs:
- **8383** — agent-server communication and Web console access (HTTPS).
- **8027** — on-demand tasks (inventory/patch scanning, remote control, remote shutdown, moving agents between remote offices).
- **443** — server ↔ Patch DB / vendor download over HTTPS (must be open through the proxy for DB sync).
- **135, 139, 445** — must be open and inbound on agent and server (and distribution server) for *pushing* agent installation.
- The "ports" help page links to a dynamic ports document (`iframe-doc.html?all_port`); server ports must remain open at all times regardless of edition; enable module-specific ports as needed. **Secured communication** can be enabled at `Admin -> Security settings -> Enable Secured communication`.
- **Integrations:** Active Directory (discovery), Self-Service Portal, EC mobile app, Zia, ServiceDesk Plus / helpdesk, Log360; REST **API Explorer** is exposed at `/products/desktop-central/api/`.

### Data model / key objects
Patch (vendor metadata, severity, bulletin, dependencies, superseded flag, download URL, patch ID), System (health status, missing-patch list), Deployment Policy, APD Task, Test Group, Decline list (scoped to groups), Computer Group/Target, Patch Store, Report. Documented customer scale: 6,500+ to ~10,000 endpoints on one deployment.

### Technical limitations
- Scanning cannot be scheduled or restricted to certain machines (event-triggered only).
- Driver/BIOS updates and AV definition updates are largely **Windows-only**; Decline is **Windows/macOS-only**.
- Faulty-patch protection relies on admin discipline (test groups, decline) rather than automatic rollback.
- DFS share paths and mapped drives are not valid Patch Store locations (see §5).

---

## 5. Support / Troubleshooting lens

### Error / symptom → likely cause → resolution (from the KB)

| Error / symptom | Likely cause | Resolution |
| --- | --- | --- |
| **Manual patch scan: "Scanning Timed Out"** | Firewall blocking data on the EC server; remote-office computers unreachable; multiple IPs/NICs on the server; UAC/Remote UAC enabled (workgroup Vista+) | Open ports **8383** and **8027** in the server's firewall; ensure remote-office machines are on and the EC Remote Control service runs; disable virtual adapters / extra NICs; in workgroups, set UAC to **Never Notify** and add `LocalAccountTokenFilterPolicy=1` under `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\system`. Prefer letting EC's automatic scanning run. |
| **Patch scan: "The storage control block address is invalid"** | Network/SMB path issue (shared with agent-install class of errors) | Verify agent reachability and network path; resolve as per the SCB KB / agent-install path errors. |
| **DB update: "Update of latest patch information failed: Stream closed"** | Proxy blocking; outdated server build; invalid proxy credentials; port 443 blocked | Upgrade the server to the latest build; set valid proxy credentials; open **443**; add **patchdb.manageengine.com** to proxy exceptions; allow `.7z`, `.gz`, `.sql` file types. |
| **DB update: "Unable to establish direct connection"** | No direct internet path / proxy misconfig | Configure proxy or direct connection; whitelist patch URLs. |
| **DB update: "Server refused the given information 10 times"** | Proxy authorization handling bug | Re-validate proxy credentials; consult the authorization-handling KB. |
| **Patch config: "Draft Download Failed"** | Proxy not configured or lacks privilege to download EXEs; no access to vendor site | Set proxy with a user authorized to download EXEs (`Admin -> Proxy settings`); whitelist vendor download URLs (download.microsoft.com; ardownload.adobe.com; dl.google.com; javadl.sun.com / *.oracle.com; download.cdn.mozilla.net; appldnld.apple.com; support.apple.com; archive.ubuntu.com; ftp.debian.org; mirror.centos.org; access.redhat.com; updates.suse.com; etc.). |
| **"Problem while downloading the patch from server"** | Patch Store relocated without copying old patches; patches deleted from store; "Continue deployment even if some patches cannot be downloaded" enabled | Copy patches from old to new store location; redeploy on the target; deselect "Continue deployment even if some patches cannot be downloaded." Error codes 12002/12007/12019/12029/12030/12175 → ensure agents reachable from central/distribution servers; 403 → whitelist vendor URL; 404 → re-upload the patch under Downloaded patches → Upload patches. |
| **Patch download: "Error 403" / Unknown Host Exception** | Web server unreachable or access denied (forbidden/connectivity) | Ensure proxy can reach the vendor download sites (exceptions list); retry download; contact support if persistent. |
| **Patch download: "Error 407"** | Proxy not configured, or proxy account lacks privilege to download EXEs | Add proxy credentials (`Admin -> Proxy settings`) with EXE-download permission; whitelist vendor URLs. |
| **Patch download: "Checksum Failed"** | Download incomplete/corrupted; partial transfer | Add vendor domains to proxy exceptions; **Re-download** the patch (`Patch Mgmt -> Patches -> Downloaded Patches -> Re-download patches`); for Java, download manually; the file is stored as `<PatchID>-<PatchName>`; install manually to verify. |
| **Patch download: "SSL Exception – peer shutdown incorrectly"** | Firewall/proxy/AV dropping the connection (often slow downloads like iTunes) | Download the patch manually from the vendor URL (find it via `Patch Mgmt -> Patches -> Missing Patches` → patch ID), save into the Patch Store renamed as `<PatchID>-<PatchName>` (no extension), then deploy. |
| **Patch config: "Incorrect Function" / "Unknown Error Code: 2359302" / "Access Denied"** | Patch already installed but the machine was not rebooted (via Windows Update, prior APD, or another tool) | Reboot the client and run a patch scan; the status flips from Missing to Installed. |
| **Patch config: "The component store has been corrupted" / "No signature was present in the subject"** | Corrupted Microsoft component store | Apply ManageEngine's troubleshooting patch; or run Microsoft Fix it (KB 971058), reboot, try manual install; if still failing run the System Update Readiness Tool (KB 947821), inspect `%windir%\logs\CBS\CheckSUR.log` for `(f)` payload-missing entries, copy the listed files from a matching-OS/arch machine into `%windir%\winsxs`, then redeploy. |
| **Chrome / Adobe Acrobat / Java patch fails with Error 1603** | Corrupted registry keys controlling update data; install/uninstall blockers | Redeploy at **System Startup**; if it persists, run the Microsoft "Fix problems that block programs being installed or removed" troubleshooter; (Java/Acrobat have dedicated KBs). |
| **Patch install: "Error 1058 – service cannot be started…disabled"** | Windows Update service disabled | In `Services.msc`, set **Windows Update** startup type to Automatic / Manual / Automatic (Delayed Start) — anything except Disabled — then redeploy. |
| **Patch update delayed: "Application is used by another process"** | Target app is running and locks files | Close the app (or use a pre-deployment custom script to close it; post-deployment script to reopen). |
| **APD status: "No Missing Patches Found"** | No patches missing for the targets; or manual approval is on and the missing patches are not approved | If manual approval is enabled, test and **approve** the needed patches; they deploy on the next schedule. |
| **No patches in Applicable/Missing Patches** | Agents not installed on all managed computers; systems never scanned; missing patches not high enough severity | Fix agent-install failures; ensure scanning runs; raise severity selection in the APD task's Deployment settings if low-severity patches were skipped. |
| **"Invalid Patch Store Location" (relocating Patch Store)** | New path is a mapped drive; inaccessible network share; invalid folder name; Failover enabled with store on the EC/Failover server; DFS share path used | Use a non-mapped path; for network shares grant **Everyone** access; use a valid folder name; with Failover, keep the store off the EC/Failover server; do not use DFS (the EC service runs as local system and cannot access DFS). |
| **Red Hat: "The account is missing an active Red Hat subscription"** | No active subscription, or status Unknown/Insufficient | Purchase/renew a Red Hat subscription; run `sudo subscription-manager status`; if Unknown (registered offline) or Insufficient (migrated VM) follow Red Hat's solution articles; else detach and re-attach the subscription / `subscription-manager refresh`; verify certs in `/etc/pki/entitlement/`. |
| **Red Hat: "Download permission required. Contact organization admin."** | Account lacks download entitlement | Have the Red Hat org admin grant download permission to the account. |
| **Red Hat: "Yum is already running"** | A user-initiated install is in progress, or the `yumbackend.py` auto-update process is running | Wait for the install to finish; disable Red Hat automatic updates. |
| **SUSE: "This system is missing an active SuSE subscription"** | Scanning/deploying to a machine without an active SUSE subscription | Purchase/renew a SUSE subscription; ensure every targeted SUSE machine is subscribed; detach/re-attach if needed. |
| **SUSE: "Invalid SuSE registration code"** | Expired or invalid registration code in SUSE Linux settings | Use the valid registration code from the SUSE customer portal (`scc.suse.com`); renew if expired; ensure it's configured under SUSE Linux settings. |
| **High bandwidth at sync time** | DB sync / AV definition updates during business hours | Reschedule the daily DB sync (Patch DB settings) and AV definition updates to off-hours; use Distribution Servers for branches. |

### Diagnostics
Validate scan status at `Patch Mgmt -> Systems -> Scan Systems`; check DB sync time/status; confirm agent health and last-scan time; review APD download/deployment failure notifications; inspect the **Attention Required** view for failed deployments and pending reboots; use **Patch Deployment Troubleshooting** logs/error reports; export task-status reports (PDF/CSV/XLSX). For unresolved issues, upload logs (logs-how-to page) to ManageEngine support (desktopcentral-support@manageengine.com / patchmanagerplus-support@manageengine.com).

### Security advisories / CVEs (relevant context)
EC's own server/agent have had security fixes that touch patching/agent paths and warrant prompt upgrades: **CVE-2024-10203** (archive-logs vulnerability in the agent tray icon), **CVE-2025-5494** (privilege escalation in the EC agent), privilege-escalation issues in the agent via DTA tool and via DLL, and historical authentication-bypass issues (**CVE-2021-44515**, **CVE-2021-44757**) and SQL injection (**CVE-2022-47523**). Because unpatched EC servers are themselves an attack surface, keeping the EC build current is part of patch hygiene; the "DB update Stream closed" fix also requires upgrading to the latest server build.

### FAQs (from source pages)
- **What is patch management?** Acquiring, testing, and deploying patches to apps, OSes, and firmware; EC streamlines detection-to-deployment across Windows/macOS/Linux.
- **Why is it important?** Unpatched systems are the most common attack entry point; effective patching minimizes crashes, malware, and performance degradation.

### Useful KB / help references
- Patch Management Overview: https://www.manageengine.com/products/desktop-central/help/patch_management/patch_management_overview.html
- Automate Patch Deployment: https://www.manageengine.com/products/desktop-central/help/patch_management/apd.html
- Deployment Policy: https://www.manageengine.com/products/desktop-central/help/patch_management/patch-deployment-policy.html
- Test & Approve: https://www.manageengine.com/products/desktop-central/help/patch_management/enable_patch_approval.html
- Decline Patch: https://www.manageengine.com/products/desktop-central/help/patch_management/exclude_patches_applications.html
- Patch Scan: https://www.manageengine.com/products/desktop-central/help/patch_management/patch-scan.html

## Cross-references
- [Vulnerability Management](vulnerability-management.md) — consumes patch data; zero-day mitigation deploys patches via this module.
- [Endpoint Detection & Response](endpoint-detection-response.md) — traces threats back to unpatched vulnerabilities and triggers patching.
- [Next-Gen Antivirus & Anti-Ransomware](next-gen-antivirus-ransomware.md) — complementary endpoint security layers; AV definition updates are automated through Patch Management.

## Sources
- https://www.manageengine.com/products/desktop-central/help/patch_management/patch_management_overview.html
- https://www.manageengine.com/products/desktop-central/help/patch_management/apd.html
- https://www.manageengine.com/products/desktop-central/help/patch_management/patch-deployment-policy.html
- https://www.manageengine.com/products/desktop-central/help/patch_management/enable_patch_approval.html
- https://www.manageengine.com/products/desktop-central/help/patch_management/exclude_patches_applications.html
- https://www.manageengine.com/products/desktop-central/help/patch_management/patch-scan.html
- https://www.manageengine.com/products/desktop-central/help/patch_management/manual-deployment.html
- https://www.manageengine.com/products/desktop-central/help/patch_management/patch-self-service-portal.html
- https://www.manageengine.com/products/desktop-central/help/patch_management/best-practices-for-automatic-patch-deployment.html
- https://www.manageengine.com/products/desktop-central/help/patch_management/red-hat-linux-patching.html
- https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/vulnerability_db_synchronization.html
- https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configuring_system_health_policy.html
- https://www.manageengine.com/products/desktop-central/help/getting_started/prerequisites.html
- https://www.manageengine.com/products/desktop-central/desktop-central-lan-architecture.html
- https://www.manageengine.com/products/desktop-central/knowledge-base.html
- KB: patch_management_time_out.html; patch_management_vulnerability_update.html; patch_configuration_failure.html; patch_download_failure.html; patch-download-failure-error-403.html; patch-download-failure-error-407.html; patch-download-checksum-failed.html; patch-download-failure-ssl-exception.html; patch_configuration_failure_2359302.html; patch-configuration-failure-component-store-corrupted.html; chrome-patches-failure-error-code-1603.html; windows-update-service-disabled.html; automated-patch-deployment-no-missing-patches-found.html; patch_management_list_patches.html; patch_store_invalid.html; inactive_redhat_subscription.html; redhat_yum_already_running.html; system-is-missing-an-active-suse-subscription.html; invalid-suse-registration-code.html
- https://www.manageengine.com/products/desktop-central/patch-management.html
