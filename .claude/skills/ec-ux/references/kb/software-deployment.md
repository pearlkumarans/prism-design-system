# Software Deployment

> Endpoint Central's Software Deployment module automates the distribution, installation, uninstallation, and updating of applications across Windows, macOS, Linux, iOS, Android, tvOS, and chromeOS endpoints from a central console — using 10,000+ pre-defined templates, a central software repository, pre/post-deployment activities, deployment policies/scheduling, a Self-Service Portal, an enterprise app catalogue, and OTA mobile app distribution. Available in Professional and Enterprise editions; mobile/OTA distribution requires MDM-capable editions. (Edition gating partly inferred — verify against the edition-comparison matrix.)

## 1. What it is — Feature detail

### Purpose and console location
Software deployment is the process of remotely installing/uninstalling/updating applications on many computers simultaneously from one location, without manual visits and with controlled (or zero) user intervention. It works in tandem with Patch Management (updates) and IT Asset Management (visibility/compliance). Per the official help, application distribution uses two methods: **pre-filled templates** (best for most non-commercial software) and the **manual package-creation flow** (for in-house and commercial software), across Windows, Mac, and Linux.

- **Top-level navigation:** the **`Software Deployment`** tab. Key sub-areas:
  - **Package Creation:** `Software Deployment > Package Creation > Packages > Add Package`.
  - **Deploy software:** `Software Deployment > Deployment > Install/Uninstall Software`.
  - **Self-Service Portal (publish):** `Software Deployment > Deployment > Self-Service Portal`.
  - **View / manage configurations:** `Software Deployment > Deployment > View Configurations`.
  - **Settings:** `Software Deployment > Settings` (Software Repository, SSP Settings, Auto-update Templates, Proxy Settings).
  - **Templates:** `Software Deployment > Templates`.

### Console navigation map (Software Deployment tab)
| Task | Console path |
|---|---|
| Create a Windows package manually | `Software Deployment > Package Creation > Packages > Add Package > Windows` |
| Modify / duplicate / delete a package | `Software Deployment > Package Creation > Packages` → Actions (⋮) → Modify / Save package as / Delete |
| Install or uninstall software (Windows, computer-based) | `Software Deployment > Deployment > Install/Uninstall Software > Windows > Computer Configuration` |
| Apply / create a deployment policy | within the Install/Uninstall flow → **Apply Deployment Policies** → Create/Modify/Save As Policy |
| View / suspend / resume / trash a configuration | `Software Deployment > Deployment > View Configurations` → Actions (⋮) |
| Configure the software repository | `Software Deployment > Settings > Software Repository` (Network Share / HTTP Repository tabs) |
| Publish software to the Self-Service Portal | `Software Deployment > Deployment > Self-Service Portal > Publish Software Packages` / **Associate Package** |
| Configure SSP appearance & automation | `Software Deployment > Settings > SSP Settings` |
| Enable auto-update of templates | `Software Deployment > Settings > Auto-update Templates` |
| Set proxy for template/CRS sync | `Software Deployment > Proxy Settings` |
| Make SSP visible in the agent tray | `Agent > Settings > Agent Settings > Agent Tray Icon` → enable Show Agent Icon + Show Self Service Portal Menu |

### Full capability breakdown

**A. Pre-defined Application Templates**
- **10,000+ pre-defined templates** spanning Windows, Mac, and Linux, with both user-specific and computer-specific variants. Each template contains the vendor installable reference and silent install/uninstall switches, so admins skip hunting for installers and authoring command lines.
- **Prerequisite:** define valid **proxy credentials** and access rights so the product can fetch template binaries (`Software Deployment > Proxy Settings`).
- **Auto-update Templates** (Windows + macOS): after every successful sync (once daily), templates refresh to the latest version, packages for the new version are created automatically, and any package **published in the Self-Service Portal is automatically updated** — so end users see the latest version on next SSP launch, replacing the old package. Configured at `Software Deployment > Settings > Auto-update Templates`.

**B. Software Repository (central package store)**
All created packages are stored centrally and reused. Two repository types (configured at `Software Deployment > Settings > Software Repository`):

- **Network-Share Repository** — a UNC/network share accessible by all computers in the network; recommended when deploying within the **LAN**, and for complex multi-file installers (e.g., Microsoft Office whose files span directories). Once configured with credentials, it is auto-used whenever a package is created; saves bandwidth because executables aren't copied to each machine. Requires **Read and Execute** permission for the relevant users/computers (set for **Everyone**, *unless* you need to restrict access or deploy across domains/workgroups — in which case provide explicit user credentials).
- **HTTP Repository** — created **automatically at product install time**, located in the same folder as the server, e.g. `\webapps\DesktopCentral\swrepository` (relocatable). Recommended for **roaming/WAN agents** and remote offices, and when network-share connections are exhausted or unreachable. **No share permissions** needed; binaries are uploaded to the server and pulled by clients. Both repository types can serve distribution servers and WAN agents.
- Repository benefits: single storage location, avoids duplicate copies, read-only minimizes risk, easy backup.

**C. Package types & switches (Windows)**
- Supported Windows executables: **MSI, MSP, EXE, APPX, APPX Bundle, MSIEXEC, MSU, MSIX, MSIX Bundle.**
- **Locate Installable:** choose **From Shared Folder** (Network Share repo) or **From Local Computer** (upload to HTTP repo).
- **Silent switches** must be obtained from the vendor for unattended install. Representative commands:

| Executable | Network-Share install | HTTP install | Uninstall |
|---|---|---|---|
| EXE | `"\\<Share>\installer.exe" /s` | `installer.exe /s` | `... uninstaller.exe /s` |
| MSI | `"\\<Share>\installer.msi"` | `installer.msi` | same file is reused for uninstall |
| MSP | `"\\<Share>\installer.msp"` | `installer.msp` | `uninstaller.msp` |
| MSIEXEC | `msiexec /i "\\<Share>\installer.msi"` | `msiexec /i "path\installer.msi" /qn` | `msiexec /x "...\installer.msi"` |
| MSU | `"\\<Share>\installer.msu"` | `installer.msu` | `uninstaller.msu` |
| APPX / APPX Bundle / MSIX / MSIX Bundle | `"\\<Share>\installer.<ext>"` | `installer.<ext>` | **uninstall not supported** |

- For MSI/MSP, the **same file** given for install is auto-used for uninstall; supply **MST** transform files and **MSI/MSP Properties** (space-separated) as needed.

**D. Pre-Deployment Activities**
- Configured per package to run **before** install — e.g., check disk space, verify whether the software is already installed, or apply prerequisite configurations — raising success rates by ensuring the target is ready.

**E. Post-Deployment Activities**
- Configured to run **after** install — set environment variables, create/delete shortcuts, manage processes, change registry, create/append PATH, run custom scripts, uninstall previous versions, etc.

**F. Deployment Policy (scheduling wrapper)**
- A **Deployment Policy** bundles *when* and *how* a deployment runs: deployment window (3–24 hours; ≥3 h recommended so the agent contacts the server at least once), week split (Regular vs **Patch Tuesday**-based), download timing, system-startup/refresh-cycle triggering, **Wake-on-LAN before deployment**, pre-deployment reboot settings (with server exclusion), pre-deployment **user notification** (title/message, timeout, allow-skip with a force-after-N-days, show-progress, idle-time limit), and post-deployment **reboot/shutdown** (force/delay, restart-then-shutdown). Endpoint Central ships predefined policies; any policy can be set as default. Editing policies is restricted to Administrators, Policy owners, and users with Patch/Software-Deployment Write access (role-based access).

**G. Install/Uninstall execution context ("Install As")**
- **System User:** highest-privilege default; full system-level access. Recommended for *computer* software in the computer session.
- **Run As User:** deploy using configured domain credentials (store Domain Admin creds in **Credential Manager**). Recommended for *user* software in the user session, or when the package needs admin rights standard users lack.
- **Allow User to interact with the Installation/Uninstallation Window:** for installers needing input (folder choice, EULA, license file). Caution: with System User + interaction enabled, a standard user gains system privileges during install — verify the software's behavior first.
- **Add More Packages:** chain multiple packages in one deployment.

**H. Copy Option (Network-Share pre-copy)**
- When a package lives on a Network Share but targets struggle to reach it, the agent can copy first: **Copy file to client machine** (MSI/MSP) or **Copy folder to client machines** (EXE/APPX/MSIX and bundle types, where the full folder is needed).

**I. Self-Service Portal (SSP)**
- Publishes IT-approved software to target users/computers/custom groups; users install/uninstall on demand from the agent tray (also a desktop shortcut and start-menu entry once first published). Compatible with **Windows and macOS (10.12+)**; requires **.NET 4** on managed computers (auto-installed).
- The SSP list syncs every **90 minutes** (or manually via **Sync Now**). End-user actions shown — Install, Uninstall, Upgrade, Downgrade, Reinstall — depend on the package's configured install/uninstall commands and the Application Name/Version set under the package's **Advanced Settings > Package Properties** (must match the Control Panel name/version to sync correctly).
- **Per-package settings** (⋮ > Package Settings) set the install context: System User, Run As User (Domain Admin recommended), or Target User (for user-published packages). **Automate Settings** can auto-publish non-commercial software to all computers; with ServiceDesk Plus integration, commercial software can be auto-published with an approval requirement.
- **Approval workflow** (Endpoint Central 92080+ with ServiceDesk Plus 9203+, Windows): publish "with approval" so users raise a request that becomes an SDP ticket; on technician approval the user may install, and the ticket auto-closes after install.
- **Rebranding** (logo, header/table colors) and **ROI reporting** are available in SSP Settings.

**J. Enterprise App Catalogue**
- A self-service catalogue of approved apps employees can discover and install, reducing IT load and enforcing approved-only compliance.

**K. Mobile App Distribution (OTA, via MDM/MAM)**
- Bulk OTA deployment to users/devices — store apps or in-house apps; manage install, deletion, update, and licensing.
- **In-house formats:** IPA, APK, XAP, MSIX, APPX, APPXBUNDLE, MSI.
- Auto-fetch metadata from App Store / Play Store; maintain an app repository; allowlist/blocklist; assign to the device App Catalog.
- **Apple VPP integration:** install commercial apps, auto-assign/revoke redemption codes, insufficient-code alerts, managed distribution.
- Reports: Apps by Devices; Devices with/without an app; per-device deployment status.

### Supported OS / platforms / coverage
- Desktop software: **Windows, macOS, Linux.** Apps: **iOS, Android, tvOS, chromeOS** (and Windows).
- SSP: **Windows and macOS (10.12+)**; user-based publishing **not supported on Mac**.
- LAN agents → Network-Share repository; WAN/roaming agents → HTTP repository (HTTP also works for LAN).

### Prerequisites and key concepts
- **Agent** on each endpoint; **MDM enrollment** for mobile app distribution; **.NET 4** for SSP.
- **Proxy credentials** for template/Central-Repository-Server (CRS) sync.
- **Package** = installer + switches + pre/post activities; **Template** = pre-built package definition; **Deployment Policy** = scheduling/reboot/notification wrapper; **Configuration** = the deployment instance targeting computers/users.
- **Repository** chosen by agent reachability (LAN vs WAN) and installer complexity.
- **Refresh cycle:** deployments take effect during the 90-minute refresh cycle, at system startup, or at user logon (whichever comes first per policy), unless **Deploy Immediately** is used.

### Settings / options reference
| Setting / option | Where | What it controls |
|---|---|---|
| Repository type | `Settings > Software Repository` | Network Share (LAN) vs HTTP (WAN/roaming); HTTP auto-created at install |
| Network-share credentials | `Settings > Software Repository > Network Share` | Domain/workgroup creds for share access (Read+Execute) |
| Install As | Install/Uninstall flow | System User / Run As User (Credential Manager) / Target User |
| Allow user interaction | Install/Uninstall flow & SSP package settings | Lets the install window show to the user (folder/EULA/license input) |
| Copy option | Install/Uninstall flow | Pre-copy file (MSI/MSP) or folder (EXE/APPX/MSIX) to clients before install |
| Deployment Policy | Install/Uninstall flow → Apply Deployment Policies | Window (3–24 h), week split, WoL, pre/post reboot, user notification |
| Execution Settings | Install/Uninstall flow | Apply at startup / every refresh; retry on failed targets; notifications |
| Scheduler Settings | Install/Uninstall flow | Install After / Do-not-apply-after date-time bounds |
| Advanced > Package Properties | Package creation | Application Name & Version (must match Control Panel for SSP sync) |
| Logging for troubleshooting | Package > Advanced > Installer/Uninstaller settings | Generates MSI logs for failure diagnosis |
| Auto-update Templates | `Settings > Auto-update Templates` | Daily refresh of templates + SSP-published packages |
| SSP appearance/automation | `Settings > SSP Settings` | Display location, user view/actions, ROI, Automate, Rebranding |
| Proxy | `Software Deployment > Proxy Settings` | Template/CRS sync (ports 80/443; exempt sync.patchquest.com, patchdb.manageengine.com) |

### Mac & Linux deployment (note)
Desktop deployment supports Windows, macOS, and Linux via both predefined templates and manual packages; the manual package wizard, switch arguments, and the Self-Service Portal (Windows + macOS) are most fully documented for Windows. Mac uses `.app`/`.pkg`-style installers and the SSP (10.12+) but **user-based publishing is not supported on Mac**. Linux packages follow the same package → policy → target model. (Some Mac/Linux packaging ergonomics are less detailed in the help and are noted as a parity gap below — inferred.)

## 2. UX lens

### Primary user roles & jobs-to-be-done
- **IT Administrator** — roll out/uninstall/update software at scale reliably; reduce manual visits and errors.
- **Help-desk technician** — fulfill software requests; offload routine requests to SSP and approvals.
- **End user** — self-install approved apps from the tray/SSP/app catalogue without a ticket.
- **Mobility admin** — distribute and license apps OTA to phones/tablets.

### Step-by-step procedures

**Create a Windows package manually**
1. `Software Deployment > Package Creation > Packages > Add Package > Windows`.
2. Enter a **Package Name**; optionally add a package **icon** (<200 KB, 32×32 px, jpg/png/gif) shown in the SSP.
3. Choose **Package Type** (MSI/MSP, or EXE/APPX/MSIEXEC/MSU/MSIX/Bundle) and **License Type** (Commercial / Non-commercial).
4. **Locate Installable:** **From Shared Folder** (Network Share) or **From Local Computer** (upload to HTTP).
5. Enter install (and uninstall) commands/switches per the table in §1C; add MST and MSI/MSP Properties if needed.
6. Configure **Pre-Deployment** and **Post-Deployment** activities for install and uninstall.
7. Under **Advanced Settings**, set Exit Code, Architecture, Max install time; and **Package Properties** (Application Name, Version, Vendor, Language, Description — Application Name/Version must match Control Panel for SSP sync). Optionally enable **Logging for troubleshooting**.
8. Click **Add Package**. Modify / duplicate / delete later via the Packages list Actions (⋮) menu.

**Deploy to computer or user targets (Windows)**
1. `Software Deployment > Deployment > Install/Uninstall Software > Windows > Computer Configuration` (use the User Configuration path for user-session software).
2. Name and describe the configuration.
3. Under **Install/Uninstall Software**, set **Package Type = Install** (or **Uninstall**) and pick the **Package Name**.
4. Set **Install As** (System User / Run As User / allow user interaction) per §1G; **Add More Packages** if chaining.
5. If from a Network Share with reach issues, enable the **Copy** option (file or folder).
6. Apply a **Deployment Policy** (choose predefined or Create/Modify/Save As).
7. **Define the Target** computers/users/groups.
8. (Optional) **Execution Settings** (apply at startup / every refresh / retry on failed targets / notifications) and **Scheduler Settings** (Install After date-time; Do-not-apply-after date-time).
9. **Deploy** (acts on next refresh/startup/window) or **Deploy Immediately**. In a remote office with a Distribution Server, immediate deployment waits for file replication per the Replication Policy.
10. Save as **Draft** or **User-Defined Template** for reuse; manage later via **View Configurations** (Modify / Suspend / Resume / Move to Trash). Suspend before trashing to fully stop an in-progress configuration.

**Uninstall software**
1. Create (or reuse) an uninstall-capable package. For MSI/MSP the same installer file serves uninstall; for EXE/MSIEXEC/MSU supply the uninstall command + silent switch; APPX/MSIX bundles do **not** support uninstall via switches.
2. `Software Deployment > Deployment > Install/Uninstall Software > Windows > Computer Configuration` → set **Package Type = Uninstall** → pick the **Package Name**.
3. Set Install As, deployment policy, and targets as for install; **Deploy** or **Deploy Immediately**.
4. Software can also be uninstalled by end users from the SSP when an uninstall command is configured and the app is installed.

**Configure the repository (Network-Share vs HTTP)**
- *Network Share:* `Software Deployment > Settings > Software Repository > Network Share > Create Type > Create a Network Share` → enter the share path (auto-created on the server host if blank) → check **Accessing the Share using Credentials** → enter username/password (prefix domain for domain, machine name for workgroup, e.g. `ZohoCorp\Administrator`) → **Save**. Set Read+Execute for Everyone (or scoped users).
- *HTTP:* created automatically at install under `\webapps\DesktopCentral\swrepository`. To relocate: `Software Deployment > Settings > Software Repository > HTTP Repository` → enter new path → **Save**. (If it fails, see the "Cannot Change the Location of the HTTP Repository" KB.)
- *LAN + WAN:* create two packages for the same app — one in the Network Share (LAN) and one in the HTTP repo (WAN). Multiple installers in different directories can be zipped and uploaded to HTTP.

**Publish to the Self-Service Portal**
1. Make the SSP visible: `Agent > Settings > Agent Settings > Agent Tray Icon` → enable **Show Agent Icon in the System Tray** and **Show Self Service Portal Menu** → Save Changes.
2. Customize: `Software Deployment > Settings > SSP Settings` (display location, user view/actions, ROI, Automate, Rebranding).
3. Publish: `Software Deployment > Deployment > Self-Service Portal`. For a new group: **Publish Software Packages** → name the custom group → move apps from Available to Selected → **Publish**. For an existing group: select the group → **Associate Package** → move apps → **Publish**.
4. Set per-package context via ⋮ > **Package Settings** (System User / Run As User / Target User; enable user interaction if the installer needs it).
5. To remove: select the group → **Disassociate Package** → confirm (this removes it from the SSP list but does not uninstall it from machines). Published changes reach clients on the next 90-minute sync.

**Configure pre/post-deployment activities and a deployment policy**
1. Within package creation, add **Pre-Deployment** (disk-space/already-installed checks, prerequisite configs) and **Post-Deployment** (shortcuts, registry, PATH, scripts, remove old version) activities.
2. Create a policy: in the Install/Uninstall flow choose **Create/Modify/Save As Policy** (policies can also be authored under Deployment Policy). Set the week split (Regular / Patch Tuesday), the **deployment window** (3–24 h), download timing, startup/refresh triggers, Wake-on-LAN, pre-deploy reboot + user notification (timeout, allow-skip, force-after-N-days, show-progress, idle limit), and post-deploy reboot/shutdown. **Save** and apply to the configuration.

**Worked example: deploy a non-commercial app to a department, off-hours**
1. `Package Creation > Add Package > Windows`; pick the predefined template (or author manually) for the app; confirm install/uninstall switches are pre-filled; set License Type = Non-commercial; add an icon for the SSP; set Application Name/Version under Advanced.
2. Add a Pre-Deployment check ("already installed?") and a Post-Deployment shortcut creation.
3. `Deployment > Install/Uninstall Software > Windows > Computer Configuration`; Package Type = Install; pick the package; Install As = System User.
4. Apply a Deployment Policy with a Saturday 20:00–23:00 window, allow-skip with force-after-3-days, and a pre-deploy user notification.
5. Define Target = the department's custom group; **Deploy**.
6. Monitor in `View Configurations`; for stragglers, enable retry on failed targets.
7. Optionally also **publish to the SSP** so new joiners self-install on demand, and enable **Auto-update Templates** so the SSP entry stays current.

### Remote-office deployment flow (Distribution Server vs direct WAN agents)
- **Remote office with a Distribution Server (DS):** configuration files (and, for HTTP repo, binaries) replicate from the Central Server to the DS per the **Replication Policy**; WAN agents then collect from the DS (network-share binaries are pulled from the configured share; HTTP binaries from the DS). **Deploy Immediately** waits for replication to finish.
- **Remote office with direct WAN agents:** agents contact the Central Server, collect configuration files (and HTTP binaries), and execute — accessing the network share directly for network-share packages.
- In all cases, deployment fires on the 90-minute refresh, system startup, or user logon, whichever comes first per the policy.

**Distribute a mobile app OTA (high level)**
1. Import/upload the app: link a store app (App Store/Play Store — metadata auto-fetched) or upload an in-house app (IPA/APK/XAP/MSIX/APPX/APPXBUNDLE/MSI) to the app repository.
2. (iOS commercial) Configure **Apple VPP**: connect the VPP token, let Endpoint Central auto-assign redemption codes, and watch insufficient-code alerts.
3. Assign the app to the target devices/groups or the device **App Catalog**; segregate allowlisted/blocklisted apps as needed.
4. Push **over-the-air**; track per-device status via the Apps-by-Devices and Devices-with/without-App reports.
5. Manage lifecycle (update, delete, license reclaim) from the same console.
   Note: mobile OTA requires MDM enrollment and MDM-capable editions.

### UX research hooks / friction points
- **Repository choice (Network-Share vs HTTP)** maps to LAN/WAN agent type and installer complexity; admins can mis-route. Opportunity: auto-recommend repository per target.
- **Custom EXE silent switches** remain expert-only and fail late; an "Enable Logging for troubleshooting" toggle helps but a dry-run validator would help more.
- **Pre/post activities + deployment policy** are powerful but stacked; a visual deployment-flow builder would clarify sequencing.
- **SSP sync subtlety:** Install/Upgrade/Reinstall actions hinge on matching Application Name/Version between the package and Control Panel — a common cause of "wrong action shown."
- **SSP vs Enterprise App Catalogue vs MDM App Catalog** overlap conceptually for users; unifying the self-service surface would reduce confusion.

**Self-Service Portal end-user actions (what the user sees)**
| Action shown | Condition |
|---|---|
| Install | Published package has an install command and the app isn't yet installed |
| Uninstall | Uninstall command configured and the app is already installed |
| Upgrade | Installed version is lower than the published package version |
| Downgrade | Installed version is higher than the published package version |
| Reinstall | Package was installed via SSP but Control-Panel name/version or uninstall attributes aren't configured |

Users can launch the SSP from the agent tray, a desktop shortcut, or the start menu; multiple selected installs run sequentially (the rest queue). Manual uninstalls outside the SSP are not reflected back in the SSP status. Published changes reach the client on the next 90-minute sync (or via **Sync Now**).

### Notable UI patterns/components
- **Two-method distribution model** — predefined templates (fast path, most non-commercial apps) vs the manual package wizard (in-house/commercial apps), surfaced consistently across Windows/Mac/Linux.
- Package-creation wizard (template picker / manual switches, icon upload, advanced settings).
- Repository management (Network Share / HTTP tabs); deployment-policy editor with window + reboot + notification panels.
- View Configurations with Actions (⋮) lifecycle (Modify / Suspend / Resume / Trash) and Draft/Template saving.
- Agent-tray Self-Service Portal (end-user surface) with Sync Now; rebrandable theme.

## 3. PM lens

### Value proposition & business outcomes
- Eliminates manual, error-prone installs at scale; ensures endpoints run approved, current software.
- Reduces help-desk volume via SSP/app catalogue self-service and approval workflows.
- Off-hours deployment windows protect productivity and bandwidth.
- Part of the platform delivering **442% ROI / $3.7M net savings** (Forrester TEI, platform-level).

### Target personas & use cases
- Large/distributed enterprises and MSPs needing repeatable cross-platform rollouts; WFH/remote offices (HTTP repository / distribution servers); regulated orgs needing approved-only catalogues.

### Competitive positioning / differentiators
- **Unified platform** — deployment shares the console with patching, ITAM, MDM, and security.
- 10,000+ auto-updating templates; same-package MSI/MSP install/uninstall; rich pre/post activities; cross-platform incl. mobile OTA and Apple VPP; SSP with ServiceDesk Plus approvals.
- Gartner Peer Insights "Customers' Choice 2024" for UEM (platform-level).

### Edition gating & packaging
- Desktop deployment in Professional/Enterprise; mobile OTA/MAM/VPP requires MDM-capable editions; MSP edition available. (Inferred — verify via edition-comparison matrix.)

### Product expansion opportunities / gaps (analysis)
- **Ring/phased deployment + automated rollback** with health gates as a first-class workflow.
- **Template marketplace / community templates** and faster publishing SLAs.
- **Deployment success analytics** — failure-reason taxonomy, retry intelligence, predictive prerequisite checks (tie into DEX).
- **Unified self-service surface** across SSP, enterprise app catalogue, and mobile app catalog with one approval workflow.
- **macOS/Linux parity** for pre/post activities, SSP user-publishing, and APPX/MSIX-style uninstall support.
- **License-aware deployment** — block install when ITAM shows no available license; auto-reclaim on uninstall.

## 4. Developer / Technical lens

### Architecture & components
- **Server** (console, DB, hosts HTTP repository) → optional **Distribution Servers** for WAN/remote scale → **Agents** that pull packages and execute install/uninstall in the configured user context.
- Packages live in the repository (network-share or HTTP). In a remote office **with a Distribution Server**, configuration files and binaries replicate to the DS per the **Replication Policy**, then WAN agents collect from the DS; **WAN agents with direct server communication** collect from the server directly. Deployment fires on the 90-minute refresh, startup, or logon per policy.

### Deployment engine mechanics
- **Package model:** installer + install/uninstall switches + MST/properties + pre/post activities + advanced (exit code, architecture, max time, logging).
- **Execution context:** System User (default) or Run As User (Credential Manager domain creds); optional user interaction with the install window.
- **Scheduling:** Deployment Policy defines window (3–24 h), week split (Regular / Patch Tuesday), WoL, pre/post reboot, and user notification; configuration adds Execution + Scheduler settings.
- **Auto-update:** template engine detects new versions after each daily sync and refreshes packages and SSP entries.
- **Mobile:** OTA push via MDM channels; Apple VPP for licensed iOS apps; metadata sync from App Store/Play Store.

### Ports, protocols, integrations, APIs
- **On-premise:** agent–server/console on **8020**; on-demand tasks on **8027**; HTTPS console commonly **8383** (inferred). HTTP repository served by the Endpoint Central web server.
- **Cloud:** **443** to `desktopcentral.manageengine.com` and `dms.zoho.com`.
- Network-Share repository over SMB/UNC (Read+Execute ACLs).
- **Central Repository Server (CRS):** template/app sync needs proxy access; the proxy must allow ports **80 and 443** and exempt `sync.patchquest.com` and `patchdb.manageengine.com`.
- Apple VPP API; App Store / Play Store metadata APIs; ServiceDesk Plus (SSP approvals); REST API (API Explorer). Custom scripts (PowerShell/batch/shell) run in post-deployment activities.

### Data model / key objects (inferred naming)
- Package, Template (predefined / user-defined), Repository (NetworkShare | HTTP), DeploymentPolicy, Configuration/DeploymentTask, TargetGroup, PrePostActivity, SSPPublication, AppCatalogEntry, MobileApp (+ VPP token/redemption codes), CredentialManager entry.

### Technical limitations
- Network-share requires LAN reachability and Read+Execute permissions; cross-domain/workgroup needs explicit credentials (which forces a binary copy to clients).
- APPX / APPX Bundle / MSIX / MSIX Bundle: **uninstall not supported** via package switches.
- SSP: **user-based publishing not supported on Mac**; requires .NET 4; commercial/paid software needs manual license activation by the user.
- Template/app sync depends on CRS reachability and a minimum build (e.g., the Version Incompatibility fix requires build **80354+**).
- Mobile distribution depends on MDM enrollment and platform constraints (VPP for iOS commercial apps).

## 5. Support / Troubleshooting lens

### Software deployment errors (symptom → cause → fix)

**Symptom: "Fatal error during installation."**
- *Cause:* prior install present; wrong configuration type (user vs computer); related processes/files/browsers active; Run-As user lacks privilege; machine issues (no disk space, dirty temp dir, locked file); Windows Installer service problems; or app-specific MSI errors.
- *Fix:* remove traces of prior installs (Windows Installer Cleanup); run as an account with admin rights; test the silent switch manually first; clear the Temp directory contents; close related processes (or deploy at startup); resolve Windows Installer service issues; enable **Logging for troubleshooting** (Modify package > Advanced > Installer/Uninstaller settings) and inspect logs; escalate with server logs, agent logs, and the package.

**Symptom: "The system cannot find the specified executable file" / "Network path not found."**
- *Cause:* installer path/name wrong, or the target can't reach the Network-Share path.
- *Fix:* verify the package path/filename; test the path from the client (`Start > Run > <path>`); for unreachable shares, switch to the HTTP repository or enable the Copy option.

**Symptom: "Access Denied."**
- *Cause:* the deploying account lacks permission to the share or to install.
- *Fix:* supply valid share credentials with Read+Execute; use System User or a Run-As account with rights; verify share ACLs.

**Symptom: "The storage control block address is invalid" (SCB invalid).**
- *Cause:* the network path specified while adding the package is invalid.
- *Fix:* correct the network path; verify reachability from the client via `Start > Run > <path>`.

**Symptom: "Process Time Out."**
- *Cause:* the installer ran longer than allowed or stalled awaiting input.
- *Fix:* ensure a correct silent switch (no UI prompts); increase the package's **Maximum Time Limit for Installation** under Advanced; verify the installer isn't waiting on user interaction.

**Symptom: "Failed with an unknown error. Error Code: 61684" (e.g., IE 8).**
- *Cause:* prerequisites/components for the app are not met on the target OS.
- *Fix:* deploy the required prerequisite (e.g., the relevant Windows update) first via an EXE/MSIEXEC package with the proper silent switches and reboot, then redeploy the app.

**Symptom: MS Office 2007/2010 — "Failed with an unknown error code-30059."**
- *Cause:* invalid license key in `config.xml` or the customized MSP.
- *Fix:* specify a valid license key in `config.xml` / recreate the MSP with a valid key and redeploy.

**Symptom: "The requested operation requires elevation."**
- *Cause:* UAC (Vista/7/2008/2008 R2+) blocks silent installs by members of the Administrators group (only the built-in Administrator is allowed) when a group member is set in **Run As**.
- *Fix:* use the **built-in Administrator** account in Run As, or remove Run As and install as **System User**, or (last resort) disable UAC on the clients and reboot.

**Symptom: "Failed to connect to the Central Repository" (CRS).**
- *Cause:* proxy not defined / invalid / changed; `sync.patchquest.com` and `patchdb.manageengine.com` not exempted; no vendor-site access; ports 80/443 blocked. (Not applicable to Endpoint Central Cloud.)
- *Fix:* set valid proxy under `Software Deployment > Proxy Settings`; grant download rights; open ports 80 and 443; exempt the two CRS hostnames on the proxy.

**Symptom: "Version compatibility error" when synchronizing applications.**
- *Cause:* the local crawler and the CRS crawler are on different versions (version-related updates lag in the CRS crawler).
- *Fix:* upgrade Endpoint Central to the latest build (must be **80354 or higher**).

**Symptom: "Error while downloading binaries" when creating a package.**
- *Cause:* the package couldn't fetch the installable from the vendor/CRS (often proxy/connectivity).
- *Fix:* verify proxy settings and CRS reachability (as in the CRS error above); retry; or upload the installer manually to the HTTP repository.

**Symptom: "The handle is invalid."**
- *Cause:* the agent lost a valid handle to the target resource mid-operation (often connectivity/permission state changing during deployment).
- *Fix:* verify agent connectivity and repository access; retry; deploy during a stable window or at startup. See the "handle is invalid" KB.

**Symptom: "Incorrect Function" (installer quits).**
- *Cause:* the installer exited abnormally — frequently a missing/incorrect silent switch or an installer not designed for unattended mode.
- *Fix:* test the exact command + silent switch manually on a sample machine; obtain the correct switch from the vendor; re-author the package.

**Symptom: "%1 is not a valid Win32 application."**
- *Cause:* architecture/installer mismatch (e.g., 64-bit installer on 32-bit, or a corrupted binary).
- *Fix:* match the installer to the target architecture (set Architecture under Advanced); re-download the binary; re-upload to the repository.

**Symptom: "The directory name is invalid."**
- *Cause:* the path referenced by the package/installer doesn't exist or is malformed.
- *Fix:* correct the path in the package; validate it from a client machine.

**Symptom: "Specified logon session does not exist" (network browser).**
- *Cause:* the logon session used to browse the share has expired.
- *Fix:* re-authenticate and re-select the files; re-enter share credentials in the package.

**Symptom: Configuration stuck at "Ready to Execute" / "In Progress."**
- *Cause:* agent not contacting the server within the window, or deployment awaiting refresh/startup.
- *Fix:* confirm agent connectivity and that the deployment window allows at least one agent–server contact (≥3 h recommended); use **Deploy Immediately** for urgent rollouts; review View Configurations status.

### Self-Service Portal — points to consider (official)
- Removing/disassociating a published software does **not** uninstall it from target computers; it only removes it from the SSP list.
- Commercial/paid software published to the SSP requires the user to **activate the license manually**.
- **User-based publishing is not supported on Mac.**
- Remote-office and custom-group technicians can publish to computer-based groups within their scope, and deploy via SSP only in static custom groups they created/last-modified (custom-group technicians can also deploy to static unique custom groups assigned as their scope).
- A package cannot be deleted while it is used in a configuration, published in the SSP, or used in a user-defined template — remove those dependencies first.

### Self-Service Portal & mobile issues
- **SSP app not appearing:** confirm the package is published/associated to the right group, the agent tray icon + SSP menu are enabled, .NET 4 is present, and allow up to one 90-minute sync (or click Sync Now).
- **Wrong SSP action (Reinstall/Upgrade unexpected):** align the package's **Application Name** and **Version** (Advanced > Package Properties) with the Control Panel values.
- **Mobile app not installing (iOS commercial):** check VPP token validity and redemption-code availability; for store apps, confirm the store is reachable/enabled and the app isn't already installed.

### Deployment best practices (inferred from official guidance)
- **Always test the silent switch manually** on one machine before mass deployment — the single most common cause of fatal errors.
- Use **off-hours deployment windows** (≥3 hours) so the agent contacts the server at least once and user productivity is protected.
- Choose the **repository by reach**: Network Share for LAN and complex multi-file installers; HTTP for WAN/roaming agents.
- For LAN + WAN coverage, **maintain two packages** (one per repository) for the same application.
- Prefer **System User for computer software** and **Run As User for user software**; store domain credentials in Credential Manager.
- Keep **Application Name/Version** in sync with the Control Panel so the SSP shows the correct Install/Upgrade/Reinstall action.
- Enable **Auto-update Templates** so SSP-published apps stay current automatically.
- **Suspend before trashing** a configuration to fully stop an in-progress rollout.

### Diagnostics
- Review **View Configurations** status per target; enable per-package **Logging for troubleshooting**.
- Validate repository path/permissions (UNC ACLs; HTTP path under `webapps\DesktopCentral\swrepository`).
- For remote offices, confirm Distribution Server replication completed before expecting deployment.
- Check **Proxy Settings** and CRS reachability when template sync, package binary download, or version compatibility fails.
- Confirm the correct **Install As** context (System User for computer software; Run As / Target User for user software) when failures look permission-related.
- Collect server logs + endpoint agent logs + the package when escalating to support.

### FAQs
- *Which formats can I deploy?* MSI, MSP, EXE, APPX, APPX Bundle, MSIEXEC, MSU, MSIX, MSIX Bundle for Windows desktop; IPA/APK/XAP/MSIX/APPX/APPXBUNDLE/MSI for in-house mobile apps.
- *Can users install software themselves?* Yes — via the Self-Service Portal in the agent tray (Windows + macOS) and the enterprise app catalogue.
- *How do I keep templated apps current?* Enable Auto-update Templates (`Software Deployment > Settings > Auto-update Templates`); SSP-published packages update automatically.
- *Network-share vs HTTP repository?* Network-share for LAN agents and complex multi-file installers; HTTP for WAN/roaming agents (and where shares are unreachable). Both can serve distribution servers and WAN agents.
- *When does a deployment actually run?* On the next 90-minute refresh, system startup, or user logon per the deployment policy — or immediately with Deploy Immediately.
- *Can I deploy multiple apps in one go?* Yes — use **Add More Packages** in the configuration, or queue several from the SSP (they install sequentially).
- *How do I deploy an app that needs user input (folder/EULA)?* Enable **Allow User to interact with the Installation/Uninstallation Window** (note the System-User + interaction privilege caveat).
- *Why does the SSP show "Reinstall" instead of "Upgrade"?* The package's Control-Panel Application Name/Version or uninstall attributes aren't configured under Advanced > Package Properties.
- *Can users uninstall via the SSP?* Yes, when the package has an uninstall command configured and the app is installed.
- *Do APPX/MSIX packages support uninstall?* Not via package switches — only install is supported for APPX/APPX Bundle/MSIX/MSIX Bundle.
- *What if remote machines can't reach the network share?* Use the HTTP repository, or enable the Copy file/folder option to pre-stage binaries on the client.

### Useful KB / help references
- Create Software Packages: https://www.manageengine.com/products/desktop-central/help/software_installation/create-software-packages.html
- Windows Software Installation: https://www.manageengine.com/products/desktop-central/help/software_installation/windows_software_installation.html
- Software Deployment Templates: https://www.manageengine.com/products/desktop-central/help/software_installation/software_deployment_templates.html
- Self-Service Portal: https://www.manageengine.com/products/desktop-central/help/software_installation/self_service_portal.html
- Configuring Software Repositories: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/edit_network_shared_path.html
- Configuring Deployment Policies: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configuring_deployment_templates.html
- KB — Fatal error during installation: https://www.manageengine.com/products/desktop-central/software_installation_fatal_error.html
- KB — Unknown Error 61684: https://www.manageengine.com/products/desktop-central/software_deployment_unknown_error.html
- KB — MS Office error 30059: https://www.manageengine.com/products/desktop-central/software_installation_ms_office_unknown_error.html
- KB — Requires elevation: https://www.manageengine.com/products/desktop-central/software_installation_requires_elevation.html
- KB — SCB address invalid: https://www.manageengine.com/products/desktop-central/software_installation_SCB_address.html
- KB — Failed to connect to Central Repository: https://www.manageengine.com/products/desktop-central/software_installation_failure_to_connect.html
- KB — Version Compatibility Error: https://www.manageengine.com/products/desktop-central/software_installation_version_incompatibility_error.html

## Cross-references
- [it-asset-management.md](it-asset-management.md) — deployment remediates license non-compliance and prohibited-software auto-uninstall; shares the software repository and feeds metering data.
- [endpoint-intelligence-dex.md](endpoint-intelligence-dex.md) — DEX can prioritize deployments by actual user need and detect post-deployment performance regressions.

## Sources
- https://www.manageengine.com/products/desktop-central/software-deployment.html
- https://www.manageengine.com/products/desktop-central/help/application-management-and-control.html
- https://www.manageengine.com/products/desktop-central/help/software_installation/create-software-packages.html
- https://www.manageengine.com/products/desktop-central/help/software_installation/windows_software_installation.html
- https://www.manageengine.com/products/desktop-central/help/software_installation/software_deployment_templates.html
- https://www.manageengine.com/products/desktop-central/help/software_installation/self_service_portal.html
- https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/edit_network_shared_path.html
- https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configuring_deployment_templates.html
- https://www.manageengine.com/products/desktop-central/windows-software-installation.html
- https://www.manageengine.com/products/desktop-central/self-service-portal-software.html
- https://www.manageengine.com/products/desktop-central/software-repository.html
- https://www.manageengine.com/products/desktop-central/mobile-application-management-mam.html
- https://www.manageengine.com/products/desktop-central/knowledge-base.html
- https://www.manageengine.com/products/desktop-central/software_installation_fatal_error.html
- https://www.manageengine.com/products/desktop-central/software_deployment_unknown_error.html
- https://www.manageengine.com/products/desktop-central/software_installation_ms_office_unknown_error.html
- https://www.manageengine.com/products/desktop-central/software_installation_requires_elevation.html
- https://www.manageengine.com/products/desktop-central/software_installation_SCB_address.html
- https://www.manageengine.com/products/desktop-central/software_installation_failure_to_connect.html
- https://www.manageengine.com/products/desktop-central/software_installation_version_incompatibility_error.html
