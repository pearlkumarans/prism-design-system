# Configuration Management

> Centralized management of system settings, applications, security policies, and profiles across endpoints — user- and computer-based configurations for Windows/Mac/Linux (50+ configurations; 30+ on Windows alone), configuration templates and collections, a 300+ tested script repository, custom scripts with logon/startup/shutdown/refresh triggers, and profile/kiosk-based device provisioning. Part of the Endpoint Central UEM suite. Documented under **Features → Configurations** in the online help (`help/configurations.html`), tagged "Applicable For Endpoint Central / MSP."

## 1. What it is — Feature detail

### Purpose and console location
Configurations let admins manage applications, system settings, desktop settings, and security policies to **baseline** systems. Targets can be selected at the **user** or **computer (system)** level, and a group of configurations can be applied together as a **collection**. Selected settings come into action **during user logon or computer startup** (depending on the configuration type) to minimize productivity loss. **Status of applied configurations can be tracked anytime.**

**Console navigation paths (from the help):**
- **`Configurations` tab** — lists all defined configurations and collections with their status; this is also where you act on them (modify, suspend, resume, move to trash).
- **`Configurations > Add Configurations`** — entry point to create a new configuration; choose the OS (**Windows / Mac / Linux**), then pick the configuration and select **Computer Configuration** or **User Configuration**.
- **`Configurations > Add Configurations > Templates`** — apply a predefined configuration template (faster than building from scratch).
- **`Configurations > Settings > Script Repository > Templates`** — browse the 300+ script templates and **Add to Repository**.
- **`Configurations > Script Repository > Add Script`** — upload your own script manually.
- **`Configurations > Views > All Configurations`** — full list view used for reverting (Move to Trash) and modifying targets.
- Device provisioning framing: under **General Settings → Device Provisioning**, **Configurations** provision desktops/laptops/servers (Windows/Mac/Linux), while **Profiles** provision mobiles and modern laptops (Android, Apple Mac/iOS/iPadOS, Chrome, tvOS).

### The four configuration families (computer & user)
Endpoint Central's Windows configurations are organized into **four functional categories**. The exact membership documented in the help is below. (Mac and Linux offer their own configuration sets; Windows ships **30+** predefined configurations, and the platform offers **50+** across all three OSes.)

**Computer Configurations (apply at system startup or 90-minute refresh):**

| Category | Configurations (Windows, from the help) |
| --- | --- |
| **Security** | Certificate Distribution; Firewall; Install/Uninstall Patch; Permission Management (files/folders/registry); Secure USB Devices; Security Policies |
| **Productivity** | Custom Scripts; Environment Variables; IP Printer; Install/Uninstall Software (MSI/EXE); Path; Power Management; Registry; Scheduler (Task Scheduler); Services; Shortcut; WiFi |
| **Desktop** | Common Folder Redirection; Display; File Folder Operation; Fonts; General; Group Management (local groups); Legal Notice; Message Box; User Management (local users) |
| **Application** | Launch Application (at startup/shutdown) |

**User Configurations (apply at user logon/logoff):**

| Category | Configurations (Windows, from the help) |
| --- | --- |
| **Security** | Alerts; Certificate Distribution; Permission Management; Secure USB Devices; Security Policies; Browsers (e.g., Internet Explorer settings) |
| **Productivity** | Custom Scripts; Environment Variables; IP Printer; Shared Network Printer; Install/Uninstall Software; Path; Power Management; Registry; Shortcut; WiFi; Drive Mapping |
| **Desktop** | Display; File Folder Operation; Message Box; Folder Redirection |
| **Application** | Launch Application; MS Office; MS Outlook; Outlook Exchange Profile |

> User-based vs computer-based: *user-based* configs are tailored to individual user accounts and apply at **logon/logoff**; *computer-based* configs are enforced at the device level regardless of who logs in and apply at **startup** (and every 90-minute refresh). You must pick the type that matches the script/setting's behavior.

### Profile management (device provisioning for mobile & modern laptops)
Profiles are the mechanism that provisions basic settings on **mobile devices and modern laptops** — Android, Apple (Mac, iOS, iPadOS), Chrome, and tvOS. Create a profile, publish it, and associate it to a device or device group. Profiles can set up **VPN, Wi-Fi, APN, proxy, certificates**, deploy productivity tools, enforce strong passcodes, restrict device functions, and protect data. With directory + automated groupings you achieve **department-specific baselines**. Supports **OEM-supplied profiles from 22+ manufacturers**.

### Kiosk management
Lock a device down to a predefined set of apps/functions. Turns smartphones, tablets, laptops, desktops, and TVs into single-purpose devices. In kiosk mode you can set up networks, settings, restrictions, apps, and home screens. Sub-capabilities: **automated device lockdown** (push an app to the foreground for time-bound assessments; kiosk locks into single-app mode then exits when done), **secure browsing** (allow only enterprise-approved websites), **secure devices** (push certificates for Wi-Fi/VPN; geo-fences with enter/exit alerts), and **automatic app install/updates**.

### Configuration templates and collections
- **Configuration templates** — predefined configurations that achieve a specific task without the admin needing to know how. Two kinds: **Pre-defined** and **User-defined**. Advantages: faster completion, no need to understand the underlying mechanics, no need to explore all supported configurations. Browse under **`Configurations > Add Configurations > Templates`**; the **Type** column shows whether each applies to Users or Computers; filter by category.
- **Collections** — group several configurations and deploy them together to many users/computers simultaneously.

### Script repository & custom scripts
- **Script repository** — Endpoint Central ships **300+ scripts** written and tested by ManageEngine (built from customer/support feedback). Scripts must be **added to the Script Repository before deployment**. Two paths: pull a **template** (`Configurations > Settings > Script Repository > Templates`, filter by Platform/Category, **Add to Repository**) or **add your own manually** (`Configurations > Script Repository > Add Script`). Repository scripts can be Viewed, Edited, Modified, Downloaded, or Deleted.
- **Custom scripts** — for non-standard tasks beyond the predefined configurations (e.g., disable Windows auto-update, set date format, check for a file, block applications, change file owners, add sudo users, change user password, move files). Applied as **Computer** or **User** configuration depending on the script's behavior, across **Windows, Mac, and Linux**.
- **Supported script languages** (from the help):
  - **Windows:** vb, js, ps1, cmd, msi, jse, exe, bat, vbe, vbs, wsf, wsc, wsh, reg
  - **Mac:** sh, scpt, pl, py, command
  - **Linux:** sh, bash, ksh, csh, tcsh, py
- **Custom script triggers / Frequency** (from the computer custom-script help): **Once**; **During Every Startup** (optionally "execute until" a configured date/time); **During Subsequent Startup** (next N startups); **Every Refresh Cycle** (every 90 minutes). User scripts analogously run at **User Logon / Subsequent Logon**. Also: **Enable logging for troubleshooting** captures script output to the Remarks section under execution status.
- **Run As** options: **System user** (System-level / System account) or **Run as User** (supplied credentials; Domain Admin recommended to avoid access-level issues).

### Mobile app for configuration management
Admins can oversee and adjust configurations (security settings, software updates) from the Endpoint Central mobile app while away from their desk.

### Prerequisites & key concepts
- **Agent on targets** and a defined **Scope of Management (SoM)** — the help repeatedly states "ensure you have defined the scope of management before defining/executing configurations." User-logon configs apply only to users/computers within SoM.
- **Directory integration (AD)** for OU/domain/site targeting and automated grouping; targets can be Remote Office or Domain (with optional exclusions).
- **Scripts must exist in the Script Repository before deployment.** Test scripts on a test machine first; scripts requiring interactive input (e.g., a `pause`) will not proceed without manual user interaction.
- Terminology: *configuration* (a single setting payload), *collection* (a deployable group of configurations), *template* (predefined configuration), *profile* (provisioning vehicle for mobile/modern laptops), *baseline*, *configuration drift*, *script template* (parameterized), *kiosk/single-app mode*, *geo-fence*, *OEM profile*, *execution settings* (retry behavior), *defining targets*.

## 2. UX lens

### Primary user roles & jobs-to-be-done
- **System administrator** — baseline settings across the fleet, prevent drift, enforce security policy.
- **Desktop admin** — map drives/printers, set environment, deploy productivity tools per department.
- **Kiosk/operations owner** — lock public/shared devices to a single purpose.
- **Automation/scripting admin** — curate the script repository and deploy custom scripts.

### Key workflows / screen flows (step by step)

**Create a computer configuration (4-step defining process):**
1. Navigate to **`Configurations > Add Configurations`** and choose the **Windows** OS (or Mac/Linux). This lists all supported configurations for both computers and users.
2. Select the desired configuration and click **Computer**.
3. Step 1 — Enter a **Name and Description**.
4. Step 2 — Define the configuration: **Package settings** and **Deployment settings**.
5. Step 3 — **Define a target** based on **Remote Office** or **Domain** (you can **exclude** computers if needed).
6. Step 4 — Configure **Execution settings** (retry behavior).
7. Choose to **Deploy** (apply now) or **Save** (as draft/template). Computer configs apply at startup and every 90-minute refresh.

**Create a user configuration:**
1. Navigate to **`Configurations > Add Configurations`** → choose OS → the supported configurations for users and computers are listed.
2. Choose the required **user configuration** and click **User**.
3. Define name/description → configuration settings → target (users/OUs/domains) → execution settings.
4. **Deploy** or **Save**. User configs apply at logon/logoff and every 90-minute refresh thereafter until logout.

**Apply a configuration template:**
1. **`Configurations > Add Configurations > Templates`** to view templates (filter by category; check the Type column for User vs Computer).
2. Click the template → **Create Configuration**.
3. Define targets via the Defining Targets procedure.
4. **Deploy** (or **Save as Draft**).

**Add a script to the repository, then deploy as a custom script:**
1. *Template path:* **`Configurations > Settings > Script Repository > Templates`** → filter by Platform/Category → select script → **Add to Repository**. *Manual path:* **`Configurations > Script Repository > Add Script`** → upload your script.
2. Deploy: **`Configurations > Add Configurations > Windows Configuration > Custom Script`** → choose **Computer Configuration** or **User Configuration** (by script behavior).
3. Name/Description → choose **Repository** (select Script Name, pass **Script Arguments**, upload **Dependency Files**, set **Exit codes** — default 0, comma-separated for multiple) or **Command Line** (semicolon-separated commands; dynamic variables supported).
4. Set **Frequency** (Once / During Every Startup / During Subsequent Startup / Every Refresh Cycle) and optionally **Enable logging for troubleshooting**.
5. Set **Run As** (System user / Run as User — Domain Admin recommended).
6. **Define targets**, set retry options, optionally enable email notifications.
7. **Deploy / Deploy Immediately**, or **Save as** (draft/template).

**Provision via profile / set up a kiosk:**
1. (Device Provisioning) Create a **profile** for the target platform (Android / Apple / Chrome / tvOS) → add VPN/Wi-Fi/cert/restriction payloads → **publish** → associate to device group (department baseline).
2. (Kiosk) Create a kiosk profile → select allowed apps/sites/home screen/restrictions → optional geo-fence/certs → associate to devices.

**Track, modify, suspend, resume, revert (managing configurations):**
1. **`Configurations`** tab lists all configs/collections with a **Status** column. Click a name to drill into per-target status.
2. **Modify** via the pencil icon in the Actions column → change values → **Deploy**.
3. **Suspend** to stop further deployment (already-applied targets are NOT reverted); **Resume** to continue.
4. **Move to Trash** to permanently delete (and stop) the configuration.
5. **Reverting** (see Support lens) differs by config and OS.

### UX research hooks (friction, usability, opportunities)
- The four configuration families × user/computer split is powerful but dense; new admins may struggle to find the right config. Opportunity: search/recommendation across configs.
- Script argument-passing reduces effort but argument validation/errors are a friction point; opportunity for inline argument schemas and dry-run.
- **Revert asymmetry** is a known sharp edge: only **Secure USB** (Windows) and MDM-Profile-supported / certain frequency-based macOS configs can be reverted by moving to Trash; everything else requires modify-and-redeploy. This is non-obvious and worth usability attention.
- Drift visibility: customers value being able to "read how a machine is secured" — opportunity for a per-machine applied-config/restriction summary (Configuration Reports help here).
- Kiosk setup spans network/app/restriction/home-screen; opportunity for kiosk templates per use case (survey, retail, signage).

### Notable UI patterns/components
- Configuration catalog by OS/family; 4-step define wizard (name → package/deployment → target → execution); template browser with Type/category filters; target picker (Remote Office/Domain with exclusions); script repository browser (Platform/Category filters, Add to Repository); status list with Draft/Ready to Execute/In Progress/Suspended/Executed/Failed states and per-target drill-down.

## 3. PM lens

### Value proposition & business outcomes
- Enhanced efficiency (less manual work, fewer errors), consistency (no drift), granular control (per-user/per-device), improved security (policy enforcement, kiosk), and script automation (300+ tested scripts + templates).
- Cross-OS coverage (Windows/Mac/Linux configurations; mobile/modern-laptop profiles) under one console.

### Target personas & use cases
- Standardized corporate baselines, department-specific setups, public/shared kiosks, secure browsing, certificate/Wi-Fi/VPN provisioning, scripted remediation.

### Competitive positioning / differentiators
- 300+ tested scripts + community template sharing; 30+ Windows / 50+ total predefined configurations; OEM profiles from 22+ manufacturers; unified user- and computer-based model across desktop and mobile; configuration templates & collections; manage-from-mobile-app.

### Edition gating & packaging
- Configurations are core to Endpoint Central across paid editions; advanced profile/kiosk features overlap with MDM tiers. *(Exact per-edition matrix not on the help page — inferred.)*

### Product expansion opportunities / gaps / roadmap ideas (analysis)
- Desired-state/idempotent config with continuous remediation and drift dashboards.
- Symmetric, one-click **revert** for all configuration types (close the Trash-vs-modify gap).
- Config-as-code (versioned, exportable, GitOps-style) for change control.
- AI-assisted script generation/validation atop the template repository.
- Pre-built kiosk blueprints and a per-machine "why is this applied" explainability view.

## 4. Developer / Technical lens

### Architecture & components
- Server defines configurations/profiles and **stores the settings + required files**; the **agent** on each client contacts the server, collects the configuration data, and enforces it at the appropriate trigger.
- Script execution host: WSH/PowerShell on Windows; shell interpreters on Mac/Linux.

### Agent mechanics / execution model (from the help)
- **User-specific configurations** apply **when a user logs on and every 90 minutes thereafter** until the user logs out of the domain.
- **Computer-specific configurations** apply **when a computer starts and every 90 minutes thereafter** until shutdown.
- **Re-applying failed configurations** is automated via **Execution Settings**: enable retry, set the **number of retries**, and specify how many of those retries occur at **user logon** vs at the **90-minute refresh cycle**. Retry continues until deployment succeeds or the max retry count is reached.
- Custom scripts run in System or specified-user context per **Run As**; exit codes determine success.

### Ports, protocols, integrations, APIs (inferences marked)
- AD/LDAP for directory targeting and automated groups.
- Agent-server channel over Endpoint Central standard ports; Distribution Servers in remote-office topologies *(see architecture doc)*.
- REST API to push configs/scripts via the API Explorer *(inferred; confirm)*.

### Data model / key objects, scalability
- Objects: Configuration (Security/Productivity/Desktop/Application × Computer/User), Collection, Configuration Template (Pre-defined/User-defined), Profile, Script (repository copy + template), Target (User/Computer/OU/Domain/Site/Remote Office, with Exclude Target), Execution Settings (retry), Kiosk Profile, Geo-fence, Certificate. *(Some names inferred.)*
- Scales via collections, OUs/domains, automated directory groupings, reusable templates/profiles.

### Technical limitations
- Configuration families and many app configs (MS Office/Outlook) are Windows-centric; Mac/Linux sets are narrower.
- Custom scripts inherit script-host availability and execution-policy constraints; interactive scripts (e.g., `pause`) stall without user input.

## 5. Support / Troubleshooting lens

### Configuration status reference (from the help)
| Status | Meaning |
| --- | --- |
| **Draft** | Saved as draft; not yet deployed. |
| **Ready to Execute** | Initial state of a deployed configuration — waiting for the trigger. Stays here while patch/software is scheduled for the next **system startup**, or constrained by **Install Between** / **Install After** windows in Deployment/Scheduler settings. |
| **In Progress** | Applied to one or more targets; remains until applied to **all** defined targets. |
| **Suspended** | Deployment was suspended (already-applied targets are not reverted). |
| **Executed** | Applied to all defined targets. |
| **Failed** | Deployment attempt failed. |
| **Draft Download Failed** | One or more patches/service packs couldn't be downloaded (from Microsoft). |
| **Retry in Progress** | Product is currently retrying deployment (per Execution Settings). |

### Symptom → Cause → Fix
| Symptom | Likely cause | Fix |
| --- | --- | --- |
| **Config stuck in "Ready to Execute"** | Trigger hasn't occurred yet (waiting for next startup/logon), or an **Install Between / Install After** window in Deployment/Scheduler settings hasn't been reached. | Wait for the next startup/logon or 90-minute refresh; check Deployment Settings for an Install-Between/After window and adjust if needed. |
| **Config stuck in "In Progress"** | Not all targets have checked in / applied yet; some targets offline. | Confirm target agents are online and checking in; In Progress clears to Executed once all targets apply. Drill into the config name for per-target status. |
| **Config never applies ("Yet to Apply"/no change on endpoint)** | Target type (user vs computer) doesn't match the trigger; agent not checking in; target outside Scope of Management or association scope (OU/domain/site). | Verify config type matches trigger; confirm SoM includes the target; confirm agent check-in; check Execution Settings/retry. |
| **Configuration "Failed"** | Deployment error on the endpoint (permissions, missing dependency, bad arguments). | Enable retry in Execution Settings; review per-target status and (for scripts) the Remarks/execution log; fix the underlying cause and modify-redeploy. |
| **"Draft Download Failed"** | Patch/service-pack files couldn't be downloaded from Microsoft. | Check server internet/proxy access to Microsoft; re-sync vulnerability DB; redeploy. |
| **Script not executing** | Script not added to repository; wrong config type (computer vs user) for the script's behavior; wrong trigger/Frequency; missing dependency files. | Add script to Script Repository first; pick Computer/User to match behavior; verify Frequency; upload dependency files. |
| **Script fails / never completes** | Interpreter/engine missing; execution policy blocks it; script awaits interactive input. | Confirm the interpreter exists (WSH/shell); for PowerShell ensure the **PowerShell engine is present and execution policy permits the script** (inferred); remove interactive prompts (e.g., `pause`) — Endpoint Central won't press Enter. Test on a test machine first. |
| **PowerShell engine missing** | Endpoint lacks PowerShell / required version, so `.ps1` won't run. | Ensure PowerShell is installed/enabled on the target; consider a bootstrap script to install it; (inferred) verify execution-policy/signing requirements. |
| **File/folder operation "access denied"** | Script/config ran as a context without rights to the path/registry; or AV blocked it. | Set **Run As → Run as User** with Domain Admin credentials (recommended) instead of System user; check Permission Management config; add AV exclusions. |
| **Custom script wrong exit interpretation** | Non-zero/unexpected exit code treated as failure. | Specify the script's valid **Exit codes** (comma-separated) in the config; default success code is 0. |
| **Profile (VPN/Wi-Fi/cert) not effective** | Profile not published before association; certificate invalid; platform mismatch. | Publish the profile, confirm cert validity and platform support, then associate. |
| **Kiosk app not launching** | Provisioned app didn't auto-install; home-screen/restrictions inconsistent. | Ensure kiosk-provisioned apps auto-install; reconcile home-screen and restriction settings. |
| **Can't revert a configuration** | Most Windows configs (except Secure USB) can't be reverted via Trash. | Modify and redeploy with reversed settings (e.g., software Install→Uninstall with an uninstall string; re-enable a previously disabled setting). On macOS, MDM-Profile-supported configs can be reverted via Move to Trash or by Exclude Target. |

### Reverting configurations (from the help)
- **Windows:** only **Secure USB settings** can be reverted by **moving to Trash**. All others: **modify & redeploy** — e.g., change software **Operation Type** Install→Uninstall (adjust package type, ensure an uninstall string); for security policies, change the setting (e.g., re-enable wallpaper change) and redeploy.
- **macOS (MDM Profile Support):** revert via **Move to Trash**, or via **Modify > Configuration > Define Target > Exclude Target** then redeploy (redeploys to all configured targets and reverts for excluded ones). Suspending does **not** revert existing targets — it only stops deployment to newly-joined agents.
- **Custom Script / Message Box** configured with recurring frequency (Every/Subsequent Startup/Logon) can be reverted by moving to Trash or via Exclude Target.

### Diagnostics
- Configuration **Status** column + per-target drill-down (click the config name).
- Script **execution log / Remarks** (enable "logging for troubleshooting").
- Configuration Reports (Configurations by User/Computer/Type) for an applied-config audit.

### FAQs
- *What script languages are supported?* Windows: vb, js, ps1, cmd, msi, jse, exe, bat, vbe, vbs, wsf, wsc, wsh, reg. Mac: sh, scpt, pl, py, command. Linux: sh, bash, ksh, csh, tcsh, py.
- *Are there ready-made scripts?* Yes — 300+ tested templates; add to the repository and deploy.
- *When do scripts/configs run?* User logon (and every 90 min); computer startup (and every 90 min); custom-script Frequency: Once / Every Startup / Subsequent Startup / Every Refresh Cycle.
- *How do I retry failed deployments?* Configure retry counts in Execution Settings (split across logon vs 90-minute refresh).
- *Can I manage configs from mobile?* Yes — via the Endpoint Central mobile app.

### Useful KB / help references
- Configurations (overview, define/apply/revert): https://www.manageengine.com/products/desktop-central/help/configurations.html
- Windows Configurations: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/windows-configurations.html
- Computer Configurations (4 families + steps): https://www.manageengine.com/products/desktop-central/help/computer_configuration/computer_configurations.html
- User Configurations (4 families): https://www.manageengine.com/products/desktop-central/help/user_configuration/user_configurations.html
- Execute Custom Scripts (computer): https://www.manageengine.com/products/desktop-central/help/computer_configuration/executing_custom_scripts.html
- Execute Custom Scripts (user): https://www.manageengine.com/products/desktop-central/help/user_configuration/executing_custom_scripts.html
- Add scripts to Script Repository (templates/manual, languages): https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/managing_custom_scripts.html
- 300+ script templates list: https://www.manageengine.com/products/desktop-central/script-templates/all-script.html
- Configuration Templates: https://www.manageengine.com/products/desktop-central/help/configuration_templates/configuration_templates.html
- Managing Configurations & Collections (status states, suspend/resume/trash): https://www.manageengine.com/products/desktop-central/help/managing_configurations_collections.html
- Device Provisioning (configurations vs profiles): https://www.manageengine.com/products/desktop-central/help/device-provisioning.html
- Configuration management feature page: https://www.manageengine.com/products/desktop-central/configuration-management.html
- Custom scripts feature page: https://www.manageengine.com/products/desktop-central/custom-scripts.html

## Cross-references
- [remote-troubleshooting.md](remote-troubleshooting.md) — system tools, power management, and remote execution.
- [os-deployment.md](os-deployment.md) — post-deployment configurations.
- [mobile-device-management.md](mobile-device-management.md) — profiles, kiosk, and restrictions on mobile.
- [reporting-auditing.md](reporting-auditing.md) — Configuration Reports (by User/Computer/Type) audit deployed configs.
- [endpoint-intelligence-dex.md](endpoint-intelligence-dex.md) — DEX remediation reuses the custom-script/configuration rails.

## Sources
- https://www.manageengine.com/products/desktop-central/help/configurations.html
- https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/windows-configurations.html
- https://www.manageengine.com/products/desktop-central/help/computer_configuration/computer_configurations.html
- https://www.manageengine.com/products/desktop-central/help/user_configuration/user_configurations.html
- https://www.manageengine.com/products/desktop-central/help/computer_configuration/executing_custom_scripts.html
- https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/managing_custom_scripts.html
- https://www.manageengine.com/products/desktop-central/help/configuration_templates/configuration_templates.html
- https://www.manageengine.com/products/desktop-central/help/managing_configurations_collections.html
- https://www.manageengine.com/products/desktop-central/help/device-provisioning.html
- https://www.manageengine.com/products/desktop-central/configuration-management.html
- https://www.manageengine.com/products/desktop-central/custom-scripts.html
- https://www.manageengine.com/products/desktop-central/script-templates/all-script.html

*Note: Items marked "(inferred)" are reasoned conclusions not stated verbatim on the cited pages.*

---

## Appendix A — Settings / options reference

| Setting / option | Where | What it controls |
| --- | --- | --- |
| **Execution Settings (retry)** | Step 4 of the define wizard | Whether the agent retries failed deployments; total retry count; split of retries between **user logon** and the **90-minute refresh**. |
| **Deployment Settings — Install Between** | Configuration deployment settings | Time window during which patch/software deploys (drives "Ready to Execute"). |
| **Scheduler Settings — Install After** | Configuration scheduler | Earliest time deployment may run. |
| **Frequency (custom script)** | Custom Script config | Once / During Every Startup (optional "execute until") / During Subsequent Startup (next N) / Every Refresh Cycle (90 min). |
| **Run As (custom script)** | Custom Script config | System user (System account) or Run as User (Domain Admin recommended). |
| **Exit codes (custom script)** | Custom Script config | Codes treated as success (default 0; comma-separate multiples). |
| **Enable logging for troubleshooting** | Custom Script config | Logs script output to Remarks under execution status. |
| **Script Arguments / Dependency Files** | Custom Script (Repository option) | Parameters and supporting files passed to the script. |
| **Command Line + Dynamic variables** | Custom Script (Command Line option) | Inline commands (semicolon-separated) with dynamic variable substitution. |
| **Define Target / Exclude Target** | Step 3 of the wizard | Remote Office vs Domain targeting, with exclusions; Exclude Target is also the revert lever for some configs. |
| **Configuration expiry / Trash view** | `Configurations > Settings` | Lifecycle/cleanup of configurations. |
| **Email notifications** | Execution settings | Notify on deployment by frequency. |

## Appendix B — Prerequisites checklist
- [ ] Endpoint Central agent installed on every target.
- [ ] **Scope of Management (SoM)** defined before defining/executing configurations.
- [ ] Directory (AD) integrated for OU/Domain/Site targeting and automated groups (for domain targeting).
- [ ] For scripts: script **added to the Script Repository** first; correct interpreter/engine present on targets (WSH/PowerShell on Windows; shell on Mac/Linux); script tested on a test machine; no interactive prompts (`pause`).
- [ ] For profiles/kiosk: target platform supported (Android/Apple/Chrome/tvOS); certificates valid; profile **published** before association.
- [ ] Appropriate **Run As** context and permissions for file/folder/registry operations.

## Appendix C — Mac & Linux configuration notes
- **Mac** configurations are documented separately (`mac_configurations.html`) and many support an **MDM Profile Support** workflow that uniquely allows **revert via Move to Trash** or **Exclude Target** — unlike most Windows configs.
- **Linux** configurations (`linux-configurations.html`) include custom scripts and a narrower set of system configurations; supported script types: sh, bash, ksh, csh, tcsh, py.
- Custom scripts are the cross-OS common denominator: Computer/User on Windows, Mac, and Linux, sourced from the same Script Repository.
