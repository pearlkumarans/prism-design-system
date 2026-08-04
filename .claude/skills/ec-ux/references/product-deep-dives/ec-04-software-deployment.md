# EC-04 : Software Deployment — Deep Dive (UI Reference)

> **Source**: ManageEngine Endpoint Central Help — `/products/desktop-central/help/software_installation/*`, `/help/configuring_desktop_central/software_deployment_setup.html`, `/help/configuring_desktop_central/edit_network_shared_path.html`, plus feature & KB pages
> **Scope**: Package creation (manual + template), Software Repository (Network Share + HTTP), Pre/Post Deployment Activities, Deployment Configurations, Deployment Policy, Self-Service Portal, Package Cleanup, Software Uninstallation — Windows / Mac / Linux + remote office flows
> **Purpose**: Single source of truth for UI design of the Software Deployment module (screens, components, wizards, fields, states, error modes, edge cases)

---

## 1. Module Overview

### 1.1 What this module is
**Software Deployment** is Endpoint Central's distribution engine. It takes a software installable (MSI/EXE/APPX/etc), wraps it in a **Package**, places it in a **Repository** (Network Share or HTTP), wraps the package in a **Configuration** (with policy + target + pre/post activities), and pushes it through the agent fleet — either silently in the background, or via end-user choice through the **Self-Service Portal (SSP)**.

Mental model the UI must reinforce:

```
SOFTWARE BINARY ──▶ PACKAGE ──▶ REPOSITORY ──▶ CONFIGURATION ──▶ DEPLOY ──▶ END-USER MACHINE
   (vendor)         (admin)     (storage)      (with policy)    (90-min /    (silent or via
                                                                 startup /     SSP)
                                                                 immediate)
```

This module pairs tightly with **EC-03 (Inventory)** — Inventory tells you what's already installed, Software Deployment installs what's missing or updates what's outdated. Also pairs with **EC-01 (Patch Management)** — patches are essentially specialized packages with their own lifecycle, but the underlying "create config → policy → deploy → status" pattern is identical.

### 1.2 Persona
- **Primary**: IT Administrator (creates packages, builds deployment configs, monitors status)
- **Secondary**: Help-desk Technician (RBAC-scoped — pushes pre-built packages to support tickets)
- **Tertiary**: End-user (consumes SSP — installs apps on demand)
- **Approval persona** (when SDP integrated): ServiceDesk Plus Technician (approves SSP install requests)

### 1.3 Module signature
Unlike Patch (lifecycle-driven) or Inventory (list-driven), Software Deployment is **wizard-driven + repository-driven**. The dominant UI patterns are:
- A heavy **package-creation wizard** (10+ fields plus optional pre/post drag-drop builder)
- A **template gallery/search** (10,000+ predefined templates)
- A **configuration list** with status, suspend/resume/trash actions
- The **Self-Service Portal** — a separate end-user-facing UI that is part of the same module

The single most important UX commitment: **the package creation wizard must not be intimidating** for a routine "deploy Chrome to 200 machines" task. Default to templates; only show the manual path when needed.

### 1.4 OS coverage

| OS | Manual package | Template package | Auto-update template | SSP support |
|---|---|---|---|---|
| Windows | ✅ (9 executable types) | ✅ | ✅ | ✅ |
| Mac | ✅ | ✅ | ✅ | ✅ (10.12+) |
| Linux | ✅ (RPM/DEB) | ✅ | ❌ | ❌ |
| iOS | (via MDM) | | | |
| Android | (via MDM) | | | |
| tvOS | (via MDM) | | | |
| ChromeOS | (via MDM) | | | |

> Mobile/MDM software deployment is a separate module (EC-MAM — Mobile App Management) with different UX. This document covers desktop OSes only.

---

## 2. Concepts & Vocabulary

| Term | Definition | UI treatment |
|---|---|---|
| **Package** | A reusable wrapper around a software installable: installer file + commands + switches + properties | First-class entity. Has its own list view + CRUD |
| **Package Type** | The format of the installer: MSI / MSP / EXE / APPX / APPX Bundle / MSIEXEC / MSU / MSIX / MSIX Bundle | Radio/dropdown — drives downstream field requirements |
| **License Type** | Commercial vs Non-Commercial (semantic only — does not affect deployment mechanics) | Toggle |
| **Software Repository** | Centralized storage for packages: Network Share or HTTP | Settings + per-package "Locate Installable" picker |
| **Network Share Repository** | UNC path accessible to all agents — `\\server\share` | "From Shared Folder" mode |
| **HTTP Repository** | Endpoint Central server's built-in web repo — default after install | "From Local Computer" mode (upload) |
| **Template** | A pre-built package shell maintained by Endpoint Central, with vendor-supplied install/uninstall commands and switches | Gallery/grid view, search, "Use template" CTA |
| **User-defined Template** | An admin-saved configuration that can be reused for new deployments | "Save as template" from existing config |
| **Auto-update Template** | A template that automatically gets updated when the vendor releases a new version (Windows + macOS only) | Toggle per template |
| **Configuration** | The deployable unit: Package + Target + Policy + Pre/Post Activities + Schedule | Has lifecycle: Draft → Saved → Deployed → InProgress → Completed |
| **Deployment Policy** | Reusable rule set: deployment window, reboot/shutdown policy, skip rules, user notification message | Library + per-config selector + Create/Modify/Save As |
| **Deployment Window** | Time range within which the deployment is allowed to run | Picker with start/end times. Recommended min 3 hours |
| **Pre-Deployment Activity** | Checks (Conditions) and actions (Configurations) to run **before** install/uninstall | Drag-drop builder, ordered list |
| **Post-Deployment Activity** | Configurations to run **after** install/uninstall completes | Drag-drop builder |
| **Condition** | A pre-check that gates the deployment: Proceed Installation \| Skip Installation | Decision diamond in builder |
| **Refresh Cycle** | The default 90-minute agent check-in interval | Hidden in most UI; surfaces in deploy-status copy |
| **Deploy Immediately** | Bypasses the refresh cycle — agent acts on receiving the config | Button distinct from "Deploy" |
| **System Startup** | A deployment trigger that fires when the target boots | Policy option |
| **User Logon** | A deployment trigger that fires when a user signs in | Policy option |
| **Computer-based deployment** | Package installed under SYSTEM context, applies machine-wide | Default for MSI; required for many enterprise apps |
| **User-based deployment** | Package installed under user context, applies per-user | Required for apps installed in user profiles |
| **Run As User** | A configured credential set used to elevate per-user installs that need admin rights | Credential Manager + per-package binding |
| **Self-Service Portal (SSP)** | End-user-facing app catalog where users install published software at will | Separate UI surface launched via agent tray / desktop shortcut / start menu |
| **Publish to SSP** | Action that makes a package available to a Custom Group via the portal | Distinct action; "Disassociate" reverses it |
| **Approval Mode** | SSP install can be "with approval" or "without approval" (when EC integrated with SDP 9203+) | Per-package toggle (Windows only) |
| **Package Cleanup** | Automatic removal of old auto-update package versions, retaining N most recent | Settings page; default N=2 |
| **Transformation File (MST)** | An MSI customization file applied at install | Optional field in MSI package |
| **Silent Switch** | Vendor-supplied argument that suppresses install UI (e.g. `/s`, `/qn`) | Field per package type; vendor must provide |
| **Distribution Server (DS)** | Per-remote-office server that caches packages locally | Affects deployment timing for remote offices |
| **Refresh / Startup / Logon trigger** | The three ways a deployment fires (whichever comes first) | Policy section |

### 2.1 Package vs Configuration vs Template — call out in UI

The three concepts collapse easily in admins' heads. UI must distinguish:

| Concept | What it is | Lives in | Reusable? |
|---|---|---|---|
| **Template** | Pre-built package shell from EC team | Templates gallery | Yes — creates new package from it |
| **Package** | A specific installable + commands | Packages list | Yes — used in many configurations |
| **User-defined Template** | A saved Configuration shell | Templates section | Yes — creates new configs from it |
| **Configuration** | A specific deployment (package + target + policy + schedule) | View Configurations | Re-runs on the configured trigger; can be cloned |

> **UI ask**: At the top of each screen, show a "you are here" hint: *"Templates → Package → Configuration → Deploy"* — admin sees their position in the pipeline.

---

## 3. Navigation & IA — Software Deployment Tab

### 3.1 Top-level Software Deployment tab

```
SOFTWARE DEPLOYMENT (tab)
├── Dashboard / Summary
├── Package Creation              ← Build packages
│   ├── Packages                  — Master list of created packages
│   │   └── Add Package
│   │       ├── Windows  (Manual / From Template)
│   │       ├── Mac      (Manual / From Template)
│   │       └── Linux    (Manual / From Template)
│   ├── Templates                  — Gallery (10,000+ predefined)
│   │   ├── Windows templates
│   │   ├── Mac templates
│   │   ├── Linux templates
│   │   ├── User-defined Templates
│   │   └── Request a Template     — Submit new template request
│   └── Auto-update Settings
│
├── Deployment                    ← Deploy + monitor
│   ├── Install / Uninstall Software
│   │   ├── Windows Configuration (Computer / User)
│   │   ├── Mac Configuration
│   │   └── Linux Configuration
│   ├── View Configurations        — All deployments + status
│   ├── Self-Service Portal        — Publish + manage SSP catalog
│   └── User Requests              — SSP approval queue (when SDP integrated)
│
├── Settings                      ← Configuration
│   ├── Software Repository       — Network Share / HTTP config
│   ├── Deployment Policies       — Reusable policy library
│   ├── SSP Settings              — Portal customization + rebranding
│   ├── Auto-update Templates     — Schedule + scope
│   ├── Package Cleanup Settings  — Retention policy
│   └── Credential Manager        — Run As user credentials
│
└── Reports
    ├── Package Reports
    ├── Configuration Reports
    └── Self-Service Portal Reports (ROI tracking)
```

### 3.2 Cross-module entry points
- **Inventory → Software → Uninstall** action routes admin into the Software Deployment uninstall workflow (User-based software requires SD; Computer-based can use inventory uninstall directly)
- **Patch Management → Manual Deployment Task** for a CVE shares the same Configuration pattern
- **Vulnerability Management → "Fix" button** opens a deploy task in Software Deployment
- **EPM → Application Privilege Elevation** ties to Software Deployment (auto-elevation of trusted installer)
- **Configurations module** — many cross-cutting configurations (Files/Folders, Registry, Services) are reused as Pre/Post Activities here

### 3.3 Status badges across configuration lifecycle

Universal Endpoint Central status pattern surfaces clearly here:

```
DRAFT → SAVED → DEPLOYED → IN PROGRESS → COMPLETED
                                     │
                                     └── SUSPENDED → (Resume) → IN PROGRESS
                                     │
                                     └── TRASHED (logical delete; still runs in-progress)
```

Per-target sub-statuses: Yet-to-Apply / In Progress / Apply Success / Failed / Skipped (by condition) / Retry-Scheduled

---

## 4. Sub-Features — Deep Dive

### 4.1 Software Repository

Path: `Software Deployment > Settings > Software Repository`

#### 4.1.1 Two repository types — comparison

| | **Network Share** | **HTTP Repository** |
|---|---|---|
| **Default state** | Not configured; admin must set up | **Auto-created during install** at `\webapps\DesktopCentral\swrepository` |
| **Storage** | Existing file server share (UNC path) | EC server's local disk (relocatable) |
| **Access pattern** | Agents read directly from share | Agents download from EC server's HTTP endpoint |
| **Bandwidth** | Saves bandwidth — agents don't copy executable | Higher bandwidth — executable is copied per machine |
| **Use case** | LAN deployment within trusted domain | WAN, roaming agents, remote offices, cross-domain |
| **Permissions** | Read+Execute for **Everyone** group (or per-credential) | None needed — HTTP serves it |
| **Cross-domain** | Tricky — need explicit credentials | Works seamlessly |
| **Recommended** | LAN-only orgs | **Default recommendation** — works for both LAN + WAN |
| **Multi-file apps (e.g. MS Office)** | Native — store in subdirs | Need to zip + upload as bundle |
| **Roaming agents** | ❌ Won't reach the share | ✅ Works |
| **Distribution Server compatible** | ✅ via Replication Cycle | ✅ via Replication Cycle |

> **UI ask**: When admin lands on the Repository page for the first time, surface a recommendation widget: *"HTTP Repository (already configured) is recommended for most setups. Configure Network Share only if you need LAN-only deployment with bandwidth savings."*

#### 4.1.2 Network Share — creation workflow

```
Software Deployment > Settings > Software Repository > Network Share
        │
        ▼
Create Type ▸ Create a Network Share
        │
        ▼
Step 1: Path
   ├── Enter UNC path (e.g. \\fileserver\sw-packages)
   │   ⓘ  If you leave path blank, it auto-creates on the EC server machine
   │
        ▼
Step 2: Credentials (recommended for cross-domain / restricted shares)
   ├── ☑ Accessing the Share using Credentials
   ├── Username
   │   ├── Domain machine: prefix domain → "ZohoCorp\Administrator"
   │   └── Workgroup machine: prefix computer name → "\\MachineName\DCAdmin"
   └── Password
        │
        ▼
Save → share validated → status indicator
```

> **UI ask**: Validate the share asynchronously on save. Show: ✅ "Reachable & readable" or ❌ "Cannot connect: Access Denied — check credentials" with a Retry button.

#### 4.1.3 Permissions guidance — surface inline

```
┌─────────────────────────────────────────────────────────────────┐
│ ⓘ  Network Share permissions                                   │
│                                                                 │
│ Set Read + Execute for the "Everyone" group on this share —    │
│ this ensures every managed agent can access it.                 │
│                                                                 │
│ EXCEPTIONS — use per-credential access instead when:            │
│   • You need to restrict certain users from direct share access│
│   • You're deploying across multiple domains or workgroups     │
│                                                                 │
│ Example: Share is on Domain A, target machine is on Domain B   │
│ → don't open Everyone; use the Credentials option above.        │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.1.4 HTTP Repository — relocation workflow

Default location: `<EC install folder>\webapps\DesktopCentral\swrepository`

```
Software Deployment > Settings > Software Repository > HTTP Repository
        │
        ▼
Enter new path
        │
        ▼
Save
```

> **UI ask**: If the new path is invalid (no permissions, no space, missing parent dir), show structured error with: detected issue, attempted path, suggested fix, link to KB on "Cannot change HTTP repository location".

#### 4.1.5 Remote office deployment flow — explain in UI

The repository type interacts with remote office topology:

**Network Share + Distribution Server**:
1. Configuration files replicated to DS during the Replication Cycle
2. WAN agents access the network share for binaries
3. Deployment fires during 90-min refresh / startup / logon (whichever first) per Deployment Policy

**Network Share + WAN agents (no DS)**:
1. WAN agents pull config from EC server directly
2. WAN agents access the network share for binaries
3. Same 90-min trigger

**HTTP + Distribution Server**:
1. DS pulls config AND binaries from EC server (Replication Cycle)
2. WAN agents pull config + binaries from DS
3. Same 90-min trigger

**HTTP + WAN agents (no DS)**:
1. WAN agents pull config + binaries directly from EC server
2. Same 90-min trigger

> **UI ask**: On the per-deployment "Where will this be deployed from?" review screen, show a small topology preview indicating: Repository → (DS?) → Agents, with bandwidth & timing implications.

#### 4.1.6 Network Share vs HTTP — when both make sense

Recommended pattern from docs: **Create TWO packages of the same software**:
- One in Network Share → for LAN computers (saves bandwidth)
- One in HTTP → for WAN/roaming computers (works through the internet)

> **UI ask**: When creating a package, offer a "Create dual-repository package" shortcut that builds both versions and links them as a logical "deployment pair".

#### 4.1.7 Exceptional file-copy scenarios with Network Share

Even with Network Share, executables ARE copied to client machines when:
- "Copy Files/Folders" option is selected during configuration
- User credentials are required to access the share
- "Run As" option is used (non-admin user installing)

> **UI ask**: When the admin enables any of these three options, show a banner: *"Note: with this setting, executable files will be copied to each client. This uses more bandwidth than direct share access."*

---

### 4.2 Package Creation — Windows Manual

Path: `Software Deployment > Package Creation > Packages > Add Package > Windows`

This is the most complex screen in the module. The wizard has 10+ fields, plus optional pre/post activities, plus advanced settings.

#### 4.2.1 Supported executables — full table

Endpoint Central supports **9 Windows executable types**, each with distinct install/uninstall command syntax depending on the repository type used.

| # | Executable | Repo Install (Network Share) | Repo Install (HTTP) | Repo Uninstall (Network Share) | Repo Uninstall (HTTP) | Uninstall Supported? |
|---|---|---|---|---|---|---|
| 1 | **EXE** | `"\\<Share>\<installer.exe>" /s` | `installer.exe /s` | `"\\<Share>\<uninstaller.exe>" /s` | `uninstaller.exe /s` | ✅ |
| 2 | **MSI** | `"\\Share\installer.msi"` | `installer.msi` | `"\\Share\installer.msi"` | `installer.msi` | ✅ (auto, same file) |
| 3 | **MSP** | `"\\Share\installer.msp"` | `installer.msp` | `"\\Share\uninstaller.msp"` | `uninstaller.msp` | ✅ |
| 4 | **APPX** | `"\\Share\installer.appx"` | `installer.appx` | — | — | ❌ Not Supported |
| 5 | **APPX Bundle** | `"\\Share\installer.appxbundle"` | `installer.appxbundle` | — | — | ❌ Not Supported |
| 6 | **MSIEXEC** | `msiexec /i "\\Share\installer.msi"` | `msiexec /i "path\installer.msi" /qn` | `msiexec /x "\\Share\installer.msi"` | `msiexec /x "path\installer.msi"` | ✅ |
| 7 | **MSU** | `"\\Share\installer.msu"` | `installer.msu` | `"\\Share\uninstaller.msu"` | `uninstaller.msu` | ✅ |
| 8 | **MSIX** | `"\\Share\installer.msix"` | `installer.msix` | — | — | ❌ Not Supported |
| 9 | **MSIX Bundle** | `"\\Share\installer.msixbundle"` | `installer.msixbundle` | — | — | ❌ Not Supported |

> **UI ask**: When admin selects Package Type, the Installation Command field gets a contextual placeholder showing the correct syntax for the chosen repo type. Bundle types (APPX/APPX Bundle/MSIX/MSIX Bundle) must show a permanent warning: "Uninstall is not supported for this format — admin must use OS-level removal or different package type if uninstall is required."

#### 4.2.2 Full field inventory

##### Basic fields
| Field | Type | Required | Notes |
|---|---|---|---|
| Package Name | string | ✅ | Unique within the org |
| Package Icon | image upload | ⚠️ Recommended | < 200 KB, 32×32 px, .jpg / .jpeg / .png / .gif. Displayed in SSP |
| Package Type | enum: MSI/MSP OR EXE/APPX/MSIEXEC/MSU/MSIX/MSIX Bundle | ✅ | Two-bucket radio. Drives subsequent fields |
| License Type | enum: Commercial / Non-Commercial | ✅ | Semantic only |
| Locate Installable | enum: From Shared Folder / From Local Computer | ✅ | First = Network Share; second = HTTP (upload) |

##### Installation block (varies by Package Type)
**MSI/MSP:**
- MSI/MSP File Name (with full install command)
- MST File Name (transformation file dependency — optional)
- MSI/MSP Properties (space-separated; e.g. `INSTALLDIR="C:\App" ALLUSERS=1`)

**EXE/APPX/MSIEXEC/MSU/MSIX/MSIX Bundle:**
- Installation Command with Switches/Arguments

##### Uninstallation block
**MSI/MSP:** Same install file auto-fills + MSI/MSP Properties for uninstall

**EXE/APPX/MSIEXEC/MSU/MSIX/MSIX Bundle:** Uninstallation Command with Switches/Arguments — vendor must provide silent uninstall switches

##### Pre/Post Deployment Activities (drag-drop, optional — see 4.4)

##### Advanced Settings
**Under Advanced Option:**
- Exit Code (success/failure codes — comma-separated)
- Architecture (x86 / x64 / both)
- Maximum Time Limit for Installation (Hours)

**Under Package Properties:** (these must sync with Control Panel for SSP to work correctly!)
- Application Name (must match Control Panel app name)
- Version (must match Control Panel version)
- Vendor
- Language
- Package Description

> **UI ask**: Show a "Why does this matter?" tooltip on Application Name & Version: *"These must exactly match what Windows shows in Programs and Features for the Self-Service Portal to detect installed/installable state correctly."*

#### 4.2.3 Workflow walkthrough

```
Software Deployment > Package Creation > Packages > Add Package > Windows
        │
        ▼
Step 1: Identity
   ├── Package Name [_______________]
   ├── Package Icon [upload]
   ├── Package Type ◉ MSI/MSP  ◯ EXE/APPX/MSIEXEC/MSU/MSIX/MSIX Bundle
   ├── License Type ◉ Commercial  ◯ Non-Commercial
   └── Locate Installable
       ◯ From Shared Folder      (Network Share repo)
       ◉ From Local Computer     (HTTP repo — Browse & upload)
        │
        ▼
Step 2: Installation
   ├── (varies by Package Type — see field tables above)
   └── Reference: install command syntax table for the chosen repo type
        │
        ▼
Step 3: Uninstallation
   ├── Same vendor-provided uninstall switches required
   ⚠️  Bundle types (APPX/APPX Bundle/MSIX/MSIX Bundle):
        Uninstall not supported — banner appears
        │
        ▼
Step 4: Pre-Deployment Activities (optional)
   └── Drag-drop builder (Conditions + Configurations)
        │
        ▼
Step 5: Post-Deployment Activities (optional)
   └── Drag-drop builder (Configurations only)
        │
        ▼
Step 6: Advanced Settings
   ├── Advanced Option (Exit Code, Architecture, Max Install Time)
   └── Package Properties (App Name + Version — critical for SSP)
        │
        ▼
[Add Package] ──▶ Package saved to Packages list
```

#### 4.2.4 Package CRUD actions

Path: `Software Deployment > Package Creation > Packages > [package row] > ⋯`

| Action | Effect | Conditions |
|---|---|---|
| **Modify** | Edit package in same wizard | Always available |
| **Save package as** | Duplicate package | Useful for creating variants |
| **Delete** | Remove package | ⚠️ Blocked if package is: in use in any Configuration / published in SSP / used in any User-defined Template. Admin must remove these dependencies first |

> **UI ask**: When delete is blocked, show the exact blocking dependencies with deep-links: *"Cannot delete — used in: 3 Configurations [list], 1 SSP publication [list], 0 templates. Resolve these first."*

---

### 4.3 Templates — 10,000+ predefined packages

Path: `Software Deployment > Package Creation > Templates`

#### 4.3.1 What templates provide
- Pre-filled installation + uninstallation commands (vendor-supplied)
- Pre-filled silent switches (validated by Endpoint Central QA)
- Automatic installable download from vendor's website (eliminates admin's "find the installer" hunt)
- Auto-update — template tracks vendor releases, package gets auto-updated to latest

> Marketing pages state "10,000+ templates" in some places and "100,000+ templates" in others. **Treat 10,000+ as the authoritative number from the help doc** — the higher number may include all OSes combined, all versions, or cross-product totals. UI should say "Thousands of templates" or use the help-doc number.

#### 4.3.2 Template categories
- Windows templates
- Mac templates
- Linux templates
- User-defined Templates (admin-built reusable configs)

Plus user-vs-computer scoping: both **user-specific** and **computer-specific** templates exist for the same software in many cases (e.g. Slack, Teams, Chrome have both context variants).

#### 4.3.3 Prerequisites
- **Valid proxy credentials** configured (if EC server is behind proxy)
- **Access rights** for automated package creation from Templates section

> **UI ask**: First-time admin lands on Templates → run a pre-flight check: ✅ Proxy reachable / ✅ Access rights / ❌ Both must pass before templates work. If failing, route admin to the fix.

#### 4.3.4 Auto-update Templates

Path: `Software Deployment > Settings > Auto-update Templates`

**Scope**: Windows + macOS only (NOT Linux).

**Schedule**: After every successful sync, once daily.

**Benefits**:
- Manual update labor eliminated
- New packages auto-created for the latest version
- **SSP packages auto-reflect** — end-users get latest version on next portal launch (old package is replaced)

**Configuration**:
- Toggle: Auto-update enabled (per template / globally)
- Scope: Which templates to auto-update (all / curated list)
- Notification: Email admin on auto-update events

> **UI ask**: Auto-update is high-impact (silently changes what users install). Show a "What just updated?" feed on the dashboard listing recent auto-template-updates with date + old version → new version.

#### 4.3.5 Request a template

When desired software isn't in the template catalog, admin can submit a request to the Endpoint Central team. UI should make this discoverable from the empty-state of template search ("No template for 'X'? Request one →").

---

### 4.4 Pre & Post Deployment Activities

Path: Inside the package creation wizard — `Pre-Deployment Activities` and `Post-Deployment Activities` sections.

These are the "smart deployment" capabilities — they let admins build conditional logic and orchestration around the core install/uninstall.

#### 4.4.1 Pre-Deployment Activities

Two groups: **Conditions** (gate the deployment) and **Configurations** (perform actions).

##### Conditions (5) — each can `Proceed Installation` or `Skip Installation`

| # | Condition | Use case | Key fields |
|---|---|---|---|
| 1 | **Check Data on Registry Value** | Skip if registry value already shows software version | Header Key, Sub Key, Value Name, Data Type, Comparator, Data |
| 2 | **Check Registry Key/Value** | Skip if registry key/value exists | Header Key, Value Name |
| 3 | **Check File/Folder** | Skip if file/folder exists (signals app already installed) | File/Folder Path |
| 4 | **Check Free Disk Space** | Skip if insufficient disk space (avoid mid-install failure) | Disk drive, Min Space in MB |
| 5 | **Check Software** | Skip if software already installed at version X | Software Name, Version, Comparator |

> **UI ask**: Conditions are the most common pre-step. Surface them as the default tab in the Pre-Deployment Activities panel. Each condition card should preview-render: "IF [condition] THEN [Proceed/Skip Installation]" — clear cause-and-effect.

##### Configurations (9) — perform actions before install/uninstall

| # | Configuration | Use case |
|---|---|---|
| 1 | **Create/Append Path** | Add to PATH env variable (e.g. for JDK installs) — supports multiple paths with `;`, dynamic variables via Star icon |
| 2 | **Custom Script** | Run a script (from Script Repository OR command line). Can include dependency files. Specify exit codes |
| 3 | **Create/Delete Shortcut** | Create or remove desktop / start menu shortcuts; supports Internet Shortcuts too |
| 4 | **File Folder Operation** | Copy/delete files or folders; supports zipped archives (auto-unzipped on client) |
| 5 | **Manage on-going Process** | Pre-Deployment ONLY. Kill processes OR wait for them to stop. Critical for upgrades while app is running |
| 6 | **Registry Settings** | Write/delete registry values or keys. Manual entry OR import .reg file |
| 7 | **Services** | Start/Stop/Restart/None for OS services. Can add custom services. Supports Service Startup Type config |
| 8 | **Uninstall Software** | Pre-Deployment ONLY. Uninstall old version before installing new. Multiple software supported via "Add More" |
| 9 | **Set Environment Variable** | Set env var with value |

> **Critical fields on every Configuration**: "Proceed with Installation/Uninstallation even if the above Configuration fails" — gives the admin control over fail-soft vs fail-hard behavior.

#### 4.4.2 Post-Deployment Activities

NO Conditions in Post-Deployment (no point — install already happened).

**Configurations (7)** — subset of pre-deployment options:
1. Create/Append Path
2. Create/Delete Shortcut
3. Custom Script
4. File Folder Operation
5. Registry Settings
6. Services
7. Set Environment Variable

> Post-Deployment does NOT have "Manage on-going Process" or "Uninstall Software" — these only make sense as pre-steps.

> **UI ask**: The Post-Deployment "Proceed with the next task even if the above fails" flag is per-activity. Show ordering: drag handles + step numbers + "Continues to next if fails" indicator badge per step.

#### 4.4.3 Drag-drop builder UX

```
┌─ PRE-DEPLOYMENT ACTIVITIES (Installation) ──────────────────┐
│                                                              │
│  Library (drag from)              Sequence (drop here)       │
│  ─────────────────────            ────────────────────       │
│  Conditions:                       1. Check Software         │
│    [Check Data on Registry Value]    "App < v3.0"            │
│    [Check Registry Key/Value]        → Proceed Installation  │
│    [Check File/Folder]                                       │
│    [Check Free Disk Space]         2. Manage on-going Process│
│    [Check Software]                  Kill: app.exe           │
│                                      ☑ Continue if fails    │
│  Configurations:                                              │
│    [Create/Append Path]            3. Uninstall Software     │
│    [Custom Script]                   "AppV2 v2.x.x"          │
│    [Create/Delete Shortcut]                                  │
│    [File Folder Operation]         4. Check Free Disk Space  │
│    [Manage on-going Process]         C: ≥ 500MB              │
│    [Registry Settings]               → Proceed Installation  │
│    [Services]                                                │
│    [Uninstall Software]            ─── INSTALL HAPPENS ───   │
│    [Set Environment Variable]                                │
│                                    [View Summary]            │
└──────────────────────────────────────────────────────────────┘
```

> **UI ask**: The Summary view (`View Summary`) shows the ordered sequence as a flow with conditional branching. Admin can reorder via drag, modify per card, or X to remove. Important: emphasize that **execution order matters** — show step numbers prominently.

#### 4.4.4 Worked example from docs (Notepad++ uninstall)

```
PRE-DEPLOYMENT:
  1. Manage on-going Process: Kill notepad++.exe
       ↓
  2. (proceeds to uninstall)
UNINSTALL:
  Notepad++ silent uninstall command
       ↓
POST-DEPLOYMENT:
  (e.g. delete shortcut, custom cleanup script)
```

> **UI ask**: Provide "Recipe" templates inside the builder — common patterns like "Upgrade Pattern" (Check Software → Manage Process → Uninstall Software → Install → Create Shortcut) pre-built and one-click loadable.

---

### 4.5 Deployment Configuration (Install/Uninstall Software)

Path: `Software Deployment > Deployment > Install/Uninstall Software > Windows / Mac / Linux`

This is where Package + Target + Policy + Schedule come together into a deployable Configuration.

#### 4.5.1 Computer Configuration vs User Configuration

| | **Computer Configuration** | **User Configuration** |
|---|---|---|
| Scope | Per-machine (SYSTEM context) | Per-user (user context) |
| Install location | Machine-wide (Program Files) | User profile (AppData) |
| Best for | MSI, system services, enterprise apps | Per-user apps, browser extensions, user prefs |
| Target picker shows | Computers / Custom Groups (computers) / Remote Offices / Domains | Users / Custom Groups (users) / AD users |
| Apply trigger | System Startup, Refresh Cycle (90 min), Immediate | User Logon, Refresh Cycle, Immediate |

> **UI ask**: At the top of the Install/Uninstall page, show a clear radio: *Computer Configuration / User Configuration* — and explain the difference inline. Don't assume admins know which to pick.

#### 4.5.2 Workflow — the 4 universal steps

```
1. Name the Configuration
        │
        ▼
2. Define the Configuration
   ├── Select Package
   ├── Configure Install/Uninstall Option
   ├── (Optional) Copy Option:
   │     If Network Share but agent can't reach:
   │     ├── Copy file to client (MSI/MSP)
   │     └── Copy folder to client (EXE/APPX/Bundles/MSIX)
   └── Apply Deployment Policy
        │
        ▼
3. Define Targets
        │
        ▼
4. Execution Settings + Scheduler Settings
        │
        ▼
[Deploy] OR [Deploy Immediately]
        │
        ▼
Saved → InProgress → Completed
```

#### 4.5.3 Execution Settings (4 toggles)

| Setting | What it does |
|---|---|
| Apply this configuration at every Startup | Re-runs on each boot — useful for stuck-state recovery |
| Apply this configuration during every Refresh Cycle | Re-runs every 90 min — for "must stay installed" enforcement |
| Retrying the Configuration on failed targets | Auto-retry on failure (with backoff) |
| Enable Notification | End-user notification on deploy event |

#### 4.5.4 Scheduler Settings

- **Install After**: deployment takes effect after specified date+time (queue with start time)
- **Do not apply this configuration after the time specified**: hard end window — useful for one-time pushes that shouldn't keep retrying

> **UI ask**: When both Install After and "Do not apply after" are set, show a visual window on the screen: timeline strip with shaded "active window" between the two timestamps.

#### 4.5.5 Deploy vs Deploy Immediately

| Action | Behavior |
|---|---|
| **Deploy** | Deployment fires at 90-min Refresh Cycle OR System Startup OR Deployment Window (whichever comes first) |
| **Deploy Immediately** | Bypasses refresh cycle — agent acts on receiving config |

> ⚠️  Remote Office with Distribution Server caveat: "Deploy Immediately" still has to wait for the Replication Policy to push files to the DS. UI must explicitly say: *"Deploy Immediately to remote office with DS will be delayed by the Replication Cycle. Estimated earliest start: [time]."*

#### 4.5.6 Save options

| Save action | Behavior |
|---|---|
| **Draft** | Saved but not deployed; resume later |
| **User-Defined Template** | Saved as reusable template; instantiate fresh configs from it |

#### 4.5.7 Lifecycle actions

Path: `Software Deployment > Deployment > View Configurations > [config row] > ⋯`

| Action | Effect |
|---|---|
| **Modify** | Edit configuration in place |
| **Suspend** | Stop deployment from running on new targets (but in-progress retries continue) |
| **Resume** | Resume after suspension |
| **Move to Trash** | Logical delete — but in-progress deployments + queued retries STILL RUN. To fully stop, **Suspend first, then Trash** |

> **UI ask**: The "Trash doesn't actually stop running deployments" rule is non-obvious. When admin trashes an active config, show explicit modal: *"This config has 47 in-progress deployments. They will continue running. To stop them, click Suspend first, then Trash."* Offer "Suspend & Trash" combined button.

---

### 4.6 Deployment Policy

Path: `Software Deployment > Settings > Deployment Policies`

Reusable rule sets that govern deployment timing, reboot/shutdown behavior, user skip rules, notification messages.

#### 4.6.1 Policy components

**Deployment Window**:
- Start time + End time within a day
- Days of week
- Deployment only runs within this window
- ⚠️ Recommended minimum: **3 hours** — gives agent at least one chance to communicate with the server during the window

**Pre-deployment**:
- User notification before deployment ("Software X will be installed in N minutes")
- User skip option (allow user to defer)
- Skip count limit (max N skips before forced install)

**Post-deployment**:
- Reboot/Shutdown policy:
  - **Force Reboot/Shutdown** (immediate)
  - **Delay Reboot/Shutdown** (with countdown to user)
  - **Restart and then Shutdown** (special — full cycle for stuck states)
  - **No Reboot**
- Notification message to user
- Configurable reboot/shutdown time

#### 4.6.2 Default policies

Endpoint Central ships with predefined policies. Admin can:
- Use as-is from dropdown
- Create new (Create Policy)
- Modify existing (Modify Policy)
- Save current as new (Save As Policy)
- Mark a policy as **Default** — applied to all subsequent configurations unless overridden

> **UI ask**: Policy library page must show: name, deployment window summary, reboot behavior, used-in-N-configs count, last modified. Filter: Default badge highlighted.

#### 4.6.3 RBAC on Deployment Policies
> Modifying policies should be limited to Administrators, Policy owners, and users with Patch Management Write access. UI must enforce this gating and clearly explain to lower-RBAC users why they can't edit ("Only Administrators / Policy owners / Patch Mgmt Write users can modify policies").

---

### 4.7 Self-Service Portal (SSP)

Path (admin side): `Software Deployment > Deployment > Self-Service Portal` and `Software Deployment > Settings > SSP Settings`

Path (end-user side): Agent tray icon → Self Service Portal / Desktop shortcut / Start menu / right-click agent tray

#### 4.7.1 Purpose
Empower end-users to install IT-approved software on their own schedule, without raising tickets. Reduces admin manual deployments while keeping IT control over what's available.

#### 4.7.2 OS compatibility
- **macOS**: 10.12 and above
- **Windows**: All supported versions
- **Linux**: ❌ Not supported
- User-based publishing: ❌ Not supported for Mac (computer-based only on Mac)

#### 4.7.3 Prerequisites
- **.NET 4** must be installed on managed computers — Endpoint Central auto-installs it. Optionally install on server machines (toggle under SSP settings)

#### 4.7.4 Making SSP available to users

```
Agent tab > Settings > Agent Settings > Agent Tray Icon
        │
        ├── ☑ Show Agent Icon in the System Tray
        └── ☑ Show Self Service Portal Menu
        │
        ▼
Save Changes
```

End-user access methods (4):
1. Launch from EC agent tray
2. Double-click SSP desktop shortcut
3. Open from Start Menu
4. Right-click agent tray icon → "Self Service Portal"

#### 4.7.5 SSP Settings — admin customization

Path: `Software Deployment > Settings > SSP Settings`

**Display SSP on:**
- Agent tray (default)
- Desktop shortcut
- Start menu
*(can enable multiple)*

**Customize User View:**
- Which software metadata fields to display
- Which actions users can perform

**ROI Settings**:
- Configure cost-per-deployment baseline → SSP Reports calculate ROI

**Automate Settings**:
- ☑ Auto-publish non-commercial software to ALL computers' SSPs
- ☑ (If SDP integrated) Auto-publish commercial software too, with approval-required by default

**.NET 4 install on servers**: ☑ toggle

**Rebranding tab**:
- Upload company logo
- Custom company name
- Header color
- Table color
- Effect: end-users immediately recognize this as "IT-distributed", increases trust + portal adoption

> **UI ask**: Rebranding preview should show side-by-side: current branding vs new branding. Don't make admin save-and-launch to see the effect.

#### 4.7.6 Publishing Software to SSP

Path: `Software Deployment > Deployment > Self-Service Portal`

```
SCENARIO A: New Custom Group + new publication

  Click "Publish Software Packages"
        │
        ▼
  Enter Custom Group name
        │
        ▼
  Move packages from "Available Software" → "Selected Software"
        │
        ▼
  Click "Publish"

SCENARIO B: Existing Custom Group, add packages

  Select Group Name
        │
        ▼
  Click "Associate Package"
        │
        ▼
  Move from Available → Selected
        │
        ▼
  Click "Publish"
```

Sync behavior:
- Initial sync to target: **next 90-min refresh cycle**
- Ongoing sync: **every 90 minutes**
- Manual sync: end-user clicks "Sync Now" icon in top-right of portal

#### 4.7.7 Per-package Settings (in SSP)

After publishing, click `⋯ > Package Settings` per package:

**Install using:**
- **System User**: Installs under SYSTEM privilege (works for most enterprise apps)
- **Run As User**: Uses configured Credential Manager user — recommended Domain Admin for elevation. **Use when**: app requires admin rights that standard users lack
- **Target User**: Uses the user's own credentials (only available for user-published packages)

**Allow User to interact with the Installation/Uninstallation Window:**
- Available only when "System User" is selected
- ⚠️  **WARNING**: When enabled, end-user gets SYSTEM privilege during installation EVEN IF they are a standard user. Verify software behavior before enabling — security implication.
- Use when software requires user input (install folder, EULA, license file upload)

> **UI ask**: When admin toggles "Allow User to interact" ON, show a security warning modal: *"Enabling this elevates the end-user to SYSTEM during install. Only enable for software you've tested. This may grant unintended privileges. Continue?"*

#### 4.7.8 End-user SSP UI — Actions per package

| Action | When shown |
|---|---|
| **Install** | Package configured with install command, NOT yet installed |
| **Uninstall** | Uninstall command configured, software IS currently installed |
| **Upgrade** | Installed version < published version |
| **Downgrade** | Installed version > published version |
| **Reinstall** | Already installed via SSP, but Control Panel name/version OR uninstall command attributes don't match |

> **UI ask** (end-user side): Make these actions read clearly. Use icon + label. Show current version + target version side-by-side for Upgrade/Downgrade so user knows what they're getting into.

#### 4.7.9 Sequential install behavior

When user installs >1 software at a time: first software starts immediately, rest are queued. **Sequential** — not parallel. UI shows queue position + ETA.

> If user manually uninstalls software outside SSP, **the SSP status will not reflect it** — out-of-band uninstalls are not synced. Admin should know this limitation.

#### 4.7.10 Approval Mode (when SDP integrated)

Supported only for Endpoint Central version **92080+** integrated with ServiceDesk Plus **9203+**. Windows only.

```
Admin publishes software with mode:
  ├── Without approval  → user clicks Install → installs immediately
  └── With approval     → user clicks Install → cannot install
                            → user raises "Request for Approval"
                            → ticket created in ServiceDesk Plus
                            → SDP technician approves
                            → user can now install
                            → upon install: status flows back to SDP
                            → ticket auto-closes
```

> **UI ask**: On the Publish Software wizard, show Approval Mode prominently with a toggle: ◯ Without approval / ◉ With approval. If SDP isn't integrated, grey-out "With approval" and show: "Integrate ServiceDesk Plus to enable approval workflow → [Integrate]".

#### 4.7.11 Disassociate package from SSP

Path: `Software Deployment > Self Service Portal > [group] > [package] > Disassociate Package`

> Removing from SSP DOES NOT uninstall the software from already-installed users — it just removes it from the portal. UI must explicitly say this.

#### 4.7.12 RBAC scoping for SSP publishing

- Remote office and custom group technicians can publish to **computer-based groups within their scope**
- Can deploy via SSP only in **static custom groups created and last-modified by them**
- Custom group technicians can additionally deploy to **static unique custom groups assigned as their scope**

> **UI ask**: When a lower-RBAC technician tries to publish to a group outside their scope, show: *"This group is outside your assigned scope. You can publish to: [list of their static groups]. Ask an Administrator to publish to other groups."*

#### 4.7.13 Commercial software keying

> When a commercial/paid software is published, users must manually enter/activate the license. UI on end-user side must show: "After install, you'll need to activate this software with a license key from IT. Need help? [Open ticket]"

---

### 4.8 Software Uninstallation

Path: `Software Deployment > Deployment > Install/Uninstall Software` (choose Uninstall option in step 2)

Standard 4-step pattern:
1. Name the Configuration
2. Define Configuration (Uninstall option)
3. Define Targets
4. Deploy Configuration

#### 4.8.1 MSI uninstallation
- Silent uninstall switches **pre-filled** automatically (because MSI metadata exposes them)
- Just select package → set target → deploy

#### 4.8.2 EXE uninstallation
- Silent uninstall switches **must be specified manually**
- Vendor documentation is the source — UI must say so
- Test command before bulk deploy

#### 4.8.3 Bulk uninstall from Inventory
Cross-link: from `Inventory > Software > [select] > Uninstall`, EC routes to this Software Deployment uninstall workflow. For User-based software, EC redirects to a package-creation flow or User-based Custom Script Configuration.

---

### 4.9 Package Cleanup Settings

Path: `Software Deployment > Settings > Package Cleanup Settings`

#### 4.9.1 Purpose
- **Clutter reduction**: old auto-update package versions pile up
- **Efficiency**: manual cleanup is error-prone at scale
- **Storage**: free up server disk
- **Compliance/Security**: remove old vulnerable versions

#### 4.9.2 Configuration
- Specify **number of recent packages to retain** when auto-update creates a new one
- Default: **2** (keep current + 1 previous)
- Older versions are removed (after association cleanup)

#### 4.9.3 Cleanup safety rules

**Configurations that won't be archived**:
- Scheduled to deploy at Startup/Logon/Refresh cycle
- Status "in progress"

**Cleanup rules for packages associated with configurations**: If the configuration contains only old packages → it's affected (configurations with newer packages are preserved). Admin should review association before enabling aggressive cleanup.

> **UI ask**: Surface a "preview cleanup" view before enabling: "These N packages would be removed: [list]. Affecting N configurations: [list]". Don't surprise admin.

---

### 4.10 Credential Manager (cross-cutting but used heavily here)

Path: `Software Deployment > Settings > Credential Manager` (or Admin → Credential Manager)

#### 4.10.1 Purpose
Stores credentials used for **Run As User** in package settings + Network Share authentication.

#### 4.10.2 Recommended setup
- Domain Admin credentials (for elevation when end-user is standard user)
- Per-package credential override possible

> **UI ask**: Show "where this credential is used" for each stored credential — N packages, N network shares. Don't let admin delete a credential silently breaking deploys.

---

### 4.11 Mac & Linux deployment (brief)

Mac and Linux follow the same Package → Configuration → Deploy pattern. Differences:

**Mac**:
- Package types: PKG / DMG / APP / etc.
- Auto-update templates supported
- SSP supported (10.12+)
- User-based publishing NOT supported

**Linux**:
- Package types: RPM, DEB, run scripts
- Auto-update templates NOT supported
- SSP NOT supported
- Admin must provide install/uninstall scripts manually for non-template deploys

> **UI ask**: The Add Package wizard's OS picker should change downstream fields significantly. Don't show a single unified form for all 3 — render OS-specific wizards. Mac wizard won't have MSI/MSP type, etc.

---

## 5. Field-Level Inventory — Full Tables

### 5.1 Package record — full field list

**Identity:**
- Package ID (UUID)
- Package Name
- Package Icon (binary, ≤200KB, 32×32)
- OS (Windows / Mac / Linux)
- Package Type (per OS — see 4.2.1 for Windows)
- License Type (Commercial / Non-Commercial)
- Locate Installable (Network Share / HTTP)

**Installation:**
- MSI/MSP File Name OR Installation Command
- MST File Name (MSI only, optional)
- MSI/MSP Properties (optional)

**Uninstallation:**
- Uninstall command + switches (vendor-supplied; pre-filled for MSI)
- MSI/MSP Properties for uninstall (optional)

**Advanced Option:**
- Exit Code (success/failure)
- Architecture (x86 / x64 / both)
- Max Install Time (hours)

**Package Properties (Control Panel sync — critical for SSP):**
- Application Name
- Version
- Vendor
- Language
- Package Description

**Pre-Deployment Activities** (ordered list of Conditions + Configurations)

**Post-Deployment Activities** (ordered list of Configurations)

**Metadata:**
- Created By
- Created Date
- Last Modified
- Used-in-Configurations count
- Published-to-SSP count
- Used-in-Templates count

### 5.2 Configuration record — full field list

- Configuration ID
- Configuration Name
- Configuration Description
- OS (Windows / Mac / Linux)
- Type (Computer / User)
- Action (Install / Uninstall)
- Package (FK to Package)
- Deployment Policy (FK to Policy)
- Copy Option (when Network Share inaccessible)
- Targets (list of Computers / Users / Custom Groups / Remote Offices / Domains)
- Execution Settings: At Startup ☑, Every Refresh ☑, Retry on Fail ☑, Enable Notification ☑
- Scheduler: Install After (timestamp), Do Not Apply After (timestamp)
- Created By / Date
- Status (Draft / Saved / Deployed / InProgress / Completed / Suspended / Trashed)
- Per-target Status (Yet to Apply / In Progress / Apply Success / Failed / Skipped / Retry-Scheduled)

### 5.3 Deployment Policy record — full field list

- Policy ID / Name
- Is Default (boolean)
- Deployment Window: Start time, End time, Days of week
- Min duration enforcement (recommended ≥ 3 hours)
- Pre-deployment user notification: Enable, Message, Skip allowed?, Max skips
- Reboot/Shutdown:
  - Action (None / Force / Delay / Restart-then-Shutdown)
  - Delay duration
  - Notification message
- Used-in-Configurations count
- Last Modified

### 5.4 SSP-Published Package record — full field list

- Package (FK)
- Custom Group (FK)
- Published Date / Last Modified
- Install Using: System User / Run As User / Target User
- Run As User credential (FK to Credential Manager, if Run As)
- Allow User Interaction (boolean, if System User)
- Approval Mode: Without Approval / With Approval (Windows + SDP)
- Status sync count (last 90 minutes)

### 5.5 Template record — full field list

- Template ID
- Template Type: System (EC-supplied) / User-Defined
- OS
- Context: Computer-specific / User-specific
- Software Name + Version
- Vendor
- Default install/uninstall commands
- Default switches
- Auto-update enabled (boolean, Windows + Mac)
- Last vendor-sync date
- Source URL (vendor download)

---

## 6. Workflows — Common admin journeys

### W1. Deploy a common app to a group (template path)
```
1. Templates → search "Chrome" → select Windows Chrome template
2. Click "Use template" → package auto-created
3. Verify Application Name + Version match Control Panel (for SSP)
4. Deployment → Install/Uninstall → Windows → Computer Configuration
5. Select Chrome package
6. Apply Deployment Policy (default or custom)
7. Define Targets → All Domain Computers OR Custom Group
8. Set Scheduler (Install After: tonight 10pm)
9. Deploy
10. Monitor View Configurations → status pills
```

### W2. Deploy a custom in-house app (manual path)
```
1. Package Creation → Add Package → Windows
2. Name + Icon + Type (MSI) + License Type
3. Upload installer (HTTP) OR enter Network Share path
4. Install Command (e.g. msiexec with /qn switch)
5. Uninstall command auto-fills for MSI
6. Add Pre-Deployment:
     - Check Software (skip if v2.x already)
     - Check Free Disk Space (500MB on C:)
7. Add Post-Deployment:
     - Create Shortcut on desktop
     - Set Environment Variable
8. Advanced: Set max install time = 1 hour
9. Add Package → save
10. Then: Install/Uninstall workflow as in W1
```

### W3. Mass uninstall a deprecated app
```
1. Deployment → Install/Uninstall → Windows → Computer
2. Configuration name: "Remove Old App v1.x Q1 2026"
3. Action: Uninstall
4. Select package (or load template)
5. EXE? — manually specify silent uninstall switches; for MSI auto-filled
6. Pre-Deployment:
     - Check Software: "AppV1 < 2.0" → Proceed Uninstall
     - Manage on-going Process: Kill app.exe
7. Define Targets: All managed computers
8. Apply Policy (with end-user warning + skip option)
9. Deploy → monitor
```

### W4. Stand up Self-Service Portal for a department
```
1. Settings → SSP Settings → enable: agent tray, desktop shortcut
2. Customize User View, Rebrand with company logo, set theme colors
3. (Optional) Integrate with SDP for Approval Mode
4. Deployment → Self Service Portal → Publish Software Packages
5. Select Custom Group "Marketing Team"
6. Move 8 packages from Available → Selected (Chrome, Figma, etc.)
7. Per package: Package Settings → Install using = System User
     - For commercial apps: enable "Allow User Interaction" (test first!)
     - For SDP-integrated: pick With Approval / Without Approval
8. Publish
9. Train end-users on SSP — agent tray icon → launch portal
10. Monitor SSP Reports for ROI
```

### W5. Build a reusable upgrade pattern (User-Defined Template)
```
1. Build a Configuration for a specific app upgrade with full pre/post logic
2. Test it on a pilot group
3. Once validated, "Save as User-Defined Template"
4. Name: "Standard Adobe Upgrade Pattern"
5. Next upgrade comes → instantiate config from this template
     Just change package version + target → deploy
6. Maintain template; reuse forever
```

### W6. Set up auto-update Templates for low-touch deploy
```
1. Settings → Auto-update Templates
2. Enable auto-update for selected templates (Chrome, Firefox, 7-Zip, etc.)
3. Verify Package Cleanup Settings → retain last 2 versions
4. Settings → SSP Settings → enable "Automate Settings → auto-publish non-commercial software"
5. New vendor releases now flow:
     vendor releases → daily template sync → package auto-created → auto-published to SSP
     → end-users get latest version on next portal launch
6. Optional admin notification email on auto-update events
```

### W7. Cross-domain deployment (heterogeneous AD)
```
1. Use HTTP Repository (cross-domain Network Share is painful)
   OR Network Share + Credentials option
2. Configure Credential Manager with cross-domain admin creds
3. Build package as usual
4. Define Targets crossing domains
5. Deploy → agents pull via HTTP (works) OR network share with creds
```

### W8. Roll back a failed deployment
```
1. Identify the failed config
2. Suspend it first (so retry stops)
3. (Optional) Build a new "uninstall" config for partial successes
4. Once all is settled, Move to Trash
5. Lessons learned → update User-Defined Template
```

### W9. Emergency stop a runaway deployment
```
1. View Configurations → find the runaway config
2. Click Suspend (stops further targets)
3. ⚠️ In-progress agents on individual machines will still complete current install
4. Investigate root cause via per-target status drill-down
5. (Optional) Restore previous version via separate uninstall + install configs
6. After fix → either Modify config and Resume, or Trash and rebuild
```

---

## 7. Error States & Troubleshooting

### 7.1 Package creation errors

| Error | Cause | UI remediation |
|---|---|---|
| "Cannot resolve Network Share path" | UNC unreachable, credentials missing | Show validation: ❌ "Cannot reach \\server\share. Try: 1) Verify share exists. 2) Add credentials in Credential Manager. 3) Test from EC server CLI." |
| "Installer file > X size" | Large EXE/MSI hits HTTP repo limit | Suggest zip + multi-file deploy, or switch to Network Share |
| "Silent switches missing" | Vendor doesn't expose; admin guessing | Show common silent switch patterns by vendor (Google = `/silent`, Mozilla = `-ms`, etc.) + KB link |
| "Application Name doesn't match Control Panel" | SSP won't detect installed state correctly | Yellow warning + auto-suggest based on inventory data |

### 7.2 Deployment failure error catalog

| Error | Likely cause | Remediation |
|---|---|---|
| "Cannot access Software Repository" | Network Share permissions; HTTP unreachable | Verify Read+Execute for Everyone OR credentials; check HTTP port |
| "Insufficient disk space" | Pre-condition skipped install correctly OR no pre-condition caught it | Confirm pre-condition is set; check target free space |
| "Silent install failed" | Wrong switches | Check vendor docs; test on single machine first |
| "Reboot pending" | Previous deploy left reboot-pending state | Force reboot config; or wait for natural reboot |
| "Domain credentials expired" | Configured admin creds in SoM stale | Update SoM credentials |
| "Replication delay" (Remote Office + DS) | Files not yet replicated to DS | Wait for next Replication Cycle |
| "User logged off mid-install" | User-based deploy interrupted | Re-deploy on next logon (auto-handled if Retry enabled) |
| "MST file missing" | Transformation file path wrong | Re-upload MST |
| "Exit code unexpected" | App returned non-zero exit code not whitelisted | Verify Exit Code field includes app's success codes |

### 7.3 SSP-specific errors

| Error | Cause | Remediation |
|---|---|---|
| ".NET 4 not installed" | Required for SSP UI | Auto-install via deployment OR manually |
| "Package not appearing in SSP" | Sync hasn't run / Custom Group mismatch / RBAC | Click "Sync Now" in SSP; verify Custom Group membership; check RBAC scope |
| "Approval required but no SDP ticket created" | SDP integration broken / template missing | Verify SDP version 9203+ + integration settings + template name |
| "Software shows 'Reinstall' instead of 'Install'" | Application Name / Version / Uninstall command attributes missing | Fix Package Properties under Advanced Settings |

### 7.4 Per-target status diagnostic panel

For every "Failed" target, render:

```
┌────────────────────────────────────────────────────────────┐
│ ❌ Deploy Failed                                            │
│ Target: DESKTOP-XYZ                                         │
│ Package: AppV3.exe                                          │
│ Attempted: 14 min ago                                       │
│                                                             │
│ Error: Exit code 1603 (Microsoft Installer fatal error)    │
│                                                             │
│ Likely causes (in order):                                   │
│   1. Previous install left in inconsistent state            │
│   2. Insufficient disk space                                │
│   3. Conflicting installation in progress                   │
│   4. UAC blocked silent install (no admin context)          │
│                                                             │
│ [Retry on this target] [View full agent log]                │
│ [Open KB: Error 1603]                                       │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Edge Cases & Gotchas

1. **Bundle types (APPX/APPX Bundle/MSIX/MSIX Bundle) don't support uninstall.** UI must show warning at package creation time. Don't let admin think they can uninstall later.

2. **MSI uninstall uses the same MSI file as install.** Don't make admin re-specify. Auto-fill.

3. **HTTP Repository is recommended even for LAN-only.** Many admins assume Network Share is "better" — but HTTP avoids permissions hell + works for roaming.

4. **Network Share + cross-domain = pain.** Use HTTP or explicit credentials. UI should detect cross-domain target and warn.

5. **"Copy file/folder" for Network Share copies binaries to client** — eats bandwidth like HTTP. Use only when share is unreachable.

6. **`Manage on-going Process` is Pre-Deployment ONLY.** Not available as post-step.

7. **`Uninstall Software` activity is Pre-Deployment ONLY.** Used for upgrade patterns.

8. **"Proceed even if Configuration fails" must be set explicitly per activity.** Default is fail-hard. Admin should think about each step.

9. **Application Name + Version in Advanced Settings MUST match Control Panel.** SSP install detection breaks otherwise. Show this as a high-importance field, not buried in Advanced.

10. **Package Icon dimensions strict** — 32×32 px, .jpg/.jpeg/.png/.gif, <200KB. Show a live preview + validation feedback before save.

11. **Auto-update Templates work for Windows + macOS only.** Not Linux. Hide the option for Linux templates.

12. **Auto-update silently changes what users install via SSP.** Show "What just updated" feed prominently.

13. **Deploy Immediately + Remote Office with DS = delayed by Replication Cycle.** Show estimated start time, not "Immediate".

14. **Trash doesn't stop in-progress deployments.** Suspend first, then Trash. Offer combined action.

15. **SSP package "Allow User Interaction" with System User = privilege escalation risk.** Standard user gets SYSTEM during install. Strong warning needed.

16. **User-based publishing to SSP not supported on Mac.** Mac SSP = computer-based only.

17. **Linux has NO SSP support.** Surface this on Linux deploy pages — admin sees options that don't apply otherwise.

18. **Commercial software via SSP — user must manually activate license.** Provide a hand-off message + ticket link in SSP UI.

19. **End-user out-of-band uninstall doesn't sync to SSP.** Status remains "Installed" until next Inventory scan + sync.

20. **"Sync Now" in SSP forces a 90-min cycle pull early.** Useful for impatient admins testing.

21. **Removing a package from SSP doesn't uninstall it from end-user machines.** Just removes the entry. Explicit messaging needed.

22. **`.NET 4` install on servers is optional toggle.** Default off. Server SSP won't work without it.

23. **Approval Mode (SDP) is Windows-only.** Not available for Mac.

24. **Approval Mode requires EC 92080+ AND SDP 9203+.** Show version check.

25. **Once approval ticket is created in SDP, admin resolves IN SDP only.** Cannot resolve in EC console. Show this prominently in SSP User Requests tab.

26. **Custom group technicians can publish to SSP only in static groups they created.** RBAC restriction non-obvious.

27. **Default Deployment Policy = 3-hour minimum window recommended.** Less = high chance of missing the agent's check-in.

28. **"Save as Template" creates User-Defined Template** — this is a Configuration shell, not a Package. Don't confuse with predefined Templates.

29. **Modifying a package that's in use in 50 configs propagates everywhere.** Confirmation: "This package is used in 50 configurations. Changes apply to all. Continue?"

30. **Multi-file apps (MS Office) need Network Share with directory tree** OR HTTP with zipped bundle. Single-file uploads don't work for these.

31. **Switching repository type mid-package isn't seamless.** Network Share → HTTP requires re-upload. UI should show what'll happen.

32. **Auto-update Template + In-progress Configuration:** the in-progress config keeps the old version. New version applies to new configs.

33. **Pre-deployment Conditions evaluate at execution time** (not at config creation). Admin should remember that disk space, registry, etc. is checked when deploy actually runs on each target.

34. **`Set Environment Variable` in Pre vs Post** — pre affects the installer's environment; post affects post-install environment. Order matters for some installers.

35. **Custom Script's Dependency Files** must be uploaded BEFORE save. If you add the dependency file later, the script will fail.

---

## 9. UI Screens Needed (deliverable list)

### 9.1 Browse / list (12)
1. Software Deployment Dashboard (KPIs + status mix donut + recent deploys)
2. Packages list (filterable, OS chips, type chips)
3. Package detail
4. Templates gallery (Windows / Mac / Linux tabs + search)
5. Template detail
6. User-Defined Templates list
7. Deployment Policies list
8. Deployment Policy detail / Edit
9. View Configurations (with status pills)
10. Configuration detail (with per-target drill-down)
11. SSP-Published Packages list (by Custom Group)
12. User Requests (SSP Approval queue)

### 9.2 Wizards (8)
13. Add Package wizard (Windows — most complex, 10+ fields + drag-drop Pre/Post)
14. Add Package wizard (Mac)
15. Add Package wizard (Linux)
16. Install/Uninstall Software wizard (4-step universal)
17. Publish to SSP wizard
18. Create/Modify Deployment Policy
19. Save as User-Defined Template flow
20. Deploy Immediately confirmation modal (with Remote Office warning if applicable)

### 9.3 Settings / Admin (10)
21. Software Repository (Network Share + HTTP tabs)
22. SSP Settings (Display / Customize / ROI / Automate / .NET 4 / Rebrand tabs)
23. Auto-update Templates settings (toggles + scope + notification)
24. Package Cleanup Settings (retention N + preview)
25. Credential Manager
26. Per-published-package Settings (Install using + Allow Interaction + Approval Mode)
27. SDP Integration settings (template + approval mode)
28. Pre/Post Activity drag-drop builder (modal/panel within Package wizard)
29. Activity Summary view (with reorder + delete)
30. Recipe loader (one-click load common patterns: Upgrade / Clean Install / etc.)

### 9.4 End-user surfaces (4)
31. SSP main view (catalog grid with Install/Uninstall/Upgrade/Downgrade/Reinstall actions)
32. SSP install progress (queue when multi-install)
33. SSP install request approval form (when With Approval mode)
34. End-user notification banners (deployment incoming, reboot pending, skip option)

### 9.5 Reports / Cross-cutting (5)
35. Configuration Reports
36. Package Reports
37. SSP ROI Reports
38. Per-target status drill-down panel
39. Failure diagnostic panel (with retry CTA)

---

## 10. Component Library — Software-Deployment-Specific

### 10.1 Wizards / builders
- **`PackageCreationWizard`** — multi-step Windows wizard with conditional fields per Package Type
- **`PrePostActivityBuilder`** — drag-drop library (Conditions / Configurations) + drop zone with ordered sequence
- **`ActivityCard`** — card per activity: type icon, name, summary, "Continue if fails" badge, edit/delete, drag handle
- **`ConditionDecisionBranch`** — visual branch (Proceed Installation / Skip Installation) on each Condition card
- **`InstallUninstallWizard`** — 4-step (Name / Define / Targets / Schedule) with status persistence
- **`PublishToSSPWizard`** — Custom Group selection + shuttle picker
- **`DeploymentPolicyEditor`** — Deployment Window timeline + reboot picker + notification message editor

### 10.2 Pickers / inputs
- **`PackageTypePicker`** — two-bucket radio (MSI/MSP vs EXE/APPX/MSIEXEC/MSU/MSIX/MSIX Bundle) — drives downstream form
- **`InstallableLocatorPicker`** — radio: From Shared Folder / From Local Computer + secondary picker
- **`SwitchArgumentsField`** — code-formatted textfield + "show example for [Package Type]" toggle
- **`MSIPropertiesField`** — multi-key=value editor with space-separation reminder
- **`PackageIconUpload`** — drag-drop area with live preview + size/dim validation
- **`ExitCodeField`** — comma-separated integer list with validation
- **`MaxInstallTimeField`** — hours integer with sensible defaults

### 10.3 Status / badges
- **`PackageTypeBadge`** — MSI / EXE / APPX / etc. with icon
- **`LicenseTypeBadge`** — Commercial / Non-Commercial
- **`RepositoryBadge`** — Network Share / HTTP
- **`ConfigStatusPill`** — Draft / Saved / Deployed / InProgress / Completed / Suspended / Trashed
- **`PerTargetStatusPill`** — Yet to Apply / In Progress / Apply Success / Failed / Skipped / Retry-Scheduled
- **`AutoUpdateBadge`** — "Auto-updates" with last sync date
- **`ApprovalModeBadge`** — With Approval / Without Approval / Awaiting SDP Setup
- **`SSPPublishedBadge`** — "Published to N groups"
- **`InteractionAllowedBadge`** — ⚠️ warning when System User + Allow Interaction enabled

### 10.4 Specialized cards
- **`PackageCard`** — name, icon, type badge, used-in count, last modified
- **`TemplateCard`** — name, vendor icon, OS, auto-update toggle, "Use Template" CTA
- **`ConfigurationCard`** — name, package, target count, policy, status, suspend/trash actions
- **`DeploymentPolicyCard`** — name, window summary, reboot behavior, used-in N configs
- **`SSPPackageCard`** — package + custom group + Install using + Approval Mode + sync stats
- **`RepositoryStatusCard`** — type, path, health (✅/❌), free space, used by N packages

### 10.5 Specialized views
- **`SSPEndUserGrid`** — end-user catalog grid (re-brandable)
- **`SSPInstallActionButton`** — context-aware: Install / Uninstall / Upgrade / Downgrade / Reinstall + version diff display
- **`InstallQueueIndicator`** — for sequential multi-install
- **`DeploymentWindowTimeline`** — visual day strip with shaded "deploy allowed" window
- **`TargetSummaryBar`** — N total / N completed / N in-progress / N failed donut with click-through
- **`RemoteOfficeReplicationNotice`** — banner: "Deploy via remote office DS — estimated start [time] after replication"
- **`PreflightChecksPanel`** — checklist: proxy / access rights / repository reachable / credentials valid

### 10.6 Feedback / safety
- **`PrivilegeEscalationWarningModal`** — when enabling "Allow User Interaction" with System User
- **`BulkChangeConfirmModal`** — "This package is used in 50 configs. Changes apply everywhere."
- **`DeleteBlockedDialog`** — shows N dependencies preventing delete
- **`TrashWithSuspendOption`** — combined action when active config is trashed
- **`AutoUpdateFeedTimeline`** — recent template updates with old → new version
- **`CleanupPreviewModal`** — "These N packages will be removed. Affecting M configs."
- **`SDPIntegrationStatusBanner`** — green when configured + version-compatible, amber otherwise

---

## 11. Cross-Module Dependencies

| Module | What Software Deployment shares/consumes |
|---|---|
| **EC-03 Inventory** | Inventory provides software list + Control Panel name/version sync; Software Deployment writes back via inventory scan after install |
| **EC-01 Patch Management** | Same Configuration + Deployment Policy patterns; Patch is "specialized deployment" of vendor patches |
| **EC-02 Vulnerability Management** | "Fix" button on CVE → routes to Software Deployment for in-product fixes; for OS patches → Patch Management |
| **EC-19 EPM** | Privilege Elevation policies surface during installs (Run As User scenarios) |
| **EC-CROSS Configurations** | Pre/Post Activities reuse the Configuration types (Files/Folders, Registry, Services, Shortcuts, Environment Variables, Custom Scripts) |
| **EC-CROSS SoM** | Target picker reads Custom Groups, Domains, Remote Offices, Users from SoM |
| **EC-CROSS Credential Manager** | Run As User credentials + Network Share credentials |
| **EC-CROSS Reports** | Configuration Reports, Package Reports, SSP ROI Reports — read from this module |
| **ServiceDesk Plus (external)** | Approval Mode workflow; resolution flows back to SSP status |
| **EC-21 Integrations** | Software Deployment surfaces in API for automation (CMDB sync, custom workflows) |

> **UI ask**: When admin lands on a Configuration that uses cross-module dependencies (e.g. Run As User from Credential Manager), surface those dependencies clearly with deep-links: "Using credential [Domain Admin] → manage in Credential Manager".

---

## 12. Reference URLs

### Help docs — primary
- Module landing: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/software_deployment_setup.html
- Create Software Packages (Windows): https://www.manageengine.com/products/desktop-central/help/software_installation/create-software-packages.html
- Create Software Packages (Mac): https://www.manageengine.com/products/desktop-central/help/software_installation/creating_software_packages_for_mac_computers.html
- Software Deployment Templates: https://www.manageengine.com/products/desktop-central/help/software_installation/software_deployment_templates.html
- Configuring Software Repositories: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/edit_network_shared_path.html
- Pre and Post Deployment Activities: https://www.manageengine.com/products/desktop-central/help/software_installation/software-deployment-pre-post-deployment-activities.html
- Windows Computer-Based Software Deployment: https://www.manageengine.com/products/desktop-central/help/software_installation/windows_software_installation.html
- Windows User-Based Software Deployment: https://www.manageengine.com/products/desktop-central/help/software_installation/windows-user-based-software-deployment.html
- Mac Computer-Based Software Deployment: https://www.manageengine.com/products/desktop-central/help/software_installation/mac-computer-based-software-deployment.html
- Linux Computer-Based Software Deployment: https://www.manageengine.com/products/desktop-central/help/software_installation/linux-computer-based-software-deployment.html
- Software Uninstallation: https://www.manageengine.com/products/desktop-central/help/software_installation/software-uninstallation.html
- Self Service Portal: https://www.manageengine.com/products/desktop-central/help/software_installation/self_service_portal.html
- Self Service Portal Reports: https://www.manageengine.com/products/desktop-central/help/reports/self-service-portal-reports.html
- Auto-update Templates and Policies: https://www.manageengine.com/products/desktop-central/help/software_installation/auto-update-templates-and-policies.html
- Package Cleanup Settings: https://www.manageengine.com/products/desktop-central/help/software_installation/package-cleanup-settings.html
- Configuring Deployment Policies: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configuring_deployment_templates.html
- User-Defined Templates: https://www.manageengine.com/products/desktop-central/help/configuration_templates/user_defined_templates.html
- Credential Manager: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/credential_manager.html
- Execution Settings: https://www.manageengine.com/products/desktop-central/help/configuring_execution_settings.html
- Defining Targets: https://www.manageengine.com/products/desktop-central/help/defining_targets.html

### Feature pages (marketing-driven positioning)
- Software Deployment: https://www.manageengine.com/products/desktop-central/software-deployment.html
- What is Software Deployment: https://www.manageengine.com/products/desktop-central/what-is-software-deployment.html
- Automate Software Deployment using Templates: https://www.manageengine.com/products/desktop-central/automate-software-deployment-using-templates.html
- Self-Service Portal: https://www.manageengine.com/products/desktop-central/self-service-portal-software.html
- Software Repository: https://www.manageengine.com/products/desktop-central/software-repository.html
- Pre/Post Deployment Activities Scenarios: https://www.manageengine.com/products/desktop-central/software-deployment-pre-post-deployment-activities-scenarios.html
- Software Deployment How-To: https://www.manageengine.com/products/desktop-central/software-deployment-how-to.html

### MSI/MSP property reference (Microsoft, referenced in EC docs)
- MSI/MSP Properties: https://learn.microsoft.com/en-us/windows/win32/msi/property-reference#configuration-properties

---

## 13. Critical UX Tensions

1. **Template-first vs Manual-first.** New admin should default to templates (lower friction). UI must make templates discoverable and reduce the manual wizard's intimidation factor for advanced users only.

2. **Network Share vs HTTP confusion.** Help docs recommend HTTP for most cases — UI should reflect that with default + opinionated guidance, not let admin pick blindly.

3. **Pre/Post Activity drag-drop is power tool.** Easy to misuse: forgotten "Continue if fails" can cascade failures. Show preview-run mode + validation.

4. **Package Type → Uninstall support varies.** Bundle types don't uninstall — admin builds an app assuming uninstall works, then can't remove. Warn UPFRONT.

5. **Application Name + Version in Advanced Settings = SSP detection.** This is buried but critical. Promote to first-class field or add inline validation against inventory.

6. **Deploy Immediately ≠ Immediate (with Remote Office DS).** Show estimated start time, never lie.

7. **Trash doesn't actually stop running deploys.** Counterintuitive. Combine Suspend + Trash actions.

8. **Auto-update silently changes user experience.** End-users on SSP get latest version without notice. Surface this clearly on the SSP catalog ("Auto-updated to v3.2 yesterday").

9. **"Allow User Interaction" = privilege escalation.** Standard user gets SYSTEM during install. Strong warnings + RBAC gating.

10. **SDP Approval Mode is version-gated** (EC 92080+, SDP 9203+, Windows only). Detect and gracefully degrade.

11. **Approval resolution happens in SDP, not EC.** SSP User Requests tab must route admins to SDP when integration is on.

12. **Cross-domain deploys are painful with Network Share.** UI should detect cross-domain scope + suggest HTTP or credentials.

13. **Mac/Linux SSP gaps.** Linux = no SSP at all. Mac = no user-based publishing. Don't show ghost options.

14. **Commercial software in SSP — manual license activation.** Set user expectations clearly on end-user side.

15. **Package modifications propagate to all configs using it.** Confirm with impact preview.

16. **Custom group technicians have narrow RBAC** for SSP publishing. Show their scope clearly when they hit limits.

17. **Min 3-hour deployment window** — agent needs at least one check-in chance. UI should warn if shorter.

18. **Reboot policy is post-deploy critical.** Default to "Delay with user notification" rather than Force. Don't surprise users.

19. **Out-of-band uninstalls don't sync.** End-user uninstalls outside SSP → status stays "Installed" until next scan.

20. **Sequential multi-install in SSP.** End-user expects parallel; gets sequential. Set expectations.

---

## 14. Status Lifecycle Summary

### Package
```
Draft → Saved → (Used in Configurations / SSP / Templates)
              → Modified → New version
              → Auto-updated (template) → New version → Cleanup (older versions retained per N)
              → Deleted (blocked if used; allowed if isolated)
```

### Configuration
```
Draft → Saved → Deployed → InProgress → Completed
                                     │
                                     └── Suspended → Resume → InProgress
                                     │
                                     └── Trashed (in-progress continues!)
```

### Per-target deployment
```
Yet to Apply → In Progress → Apply Success | Failed | Skipped
              (if Failed + Retry enabled) → Retry-Scheduled → In Progress → ...
```

### SSP Approval (when SDP integrated)
```
User clicks Install
        │
        ├── Without Approval → Install starts
        │
        └── With Approval → Request created → SDP ticket open
                          → SDP technician approves
                          → User can install
                          → Install completes → status flows back to SDP → ticket auto-closed
```

### Auto-update Template
```
Vendor releases new version
        ↓
Daily template sync
        ↓
New template version detected
        ↓
New package auto-created
        ↓
Existing SSP publications auto-updated (old package replaced)
        ↓
End-users see new version on next portal launch
        ↓
Package Cleanup retains last N versions, removes older
```

---

## 15. Module signature — one-paragraph mental model

> Software Deployment is a **wizard-driven, template-accelerated distribution pipeline** built around four primary objects: **Packages** (the what), **Repositories** (the where), **Configurations** (the how-and-when), and **Self-Service Portal** (the who-decides). The five jobs an admin must accomplish without friction are: (1) **create a package fast** from templates, (2) **build a smart deployment** with pre/post conditional logic, (3) **target the right machines/users** with RBAC respected, (4) **monitor + recover** from failures with clear per-target diagnostics, and (5) **delegate routine installs** to end-users via SSP without losing control. The core UX commitments are: **defaults that work** (HTTP repo + standard policy + tested templates), **explicit warnings on destructive/escalating actions** (Allow Interaction, Trash-during-deploy, Bundle uninstall), and **truthful timing** (Deploy Immediately with remote DS isn't actually immediate). Every screen must answer: *what package, what target, what policy, what status — and what failed*.

---

**File**: EC-04 — Software Deployment (Deep Dive)
**Companion files**: EC-00 (Master), EC-01 (Patch Mgmt), EC-02 (Vulnerability Mgmt), EC-03 (Inventory)
**Next**: EC-05 — Remote Tools & Troubleshooting (Remote Control, System Manager, Wake on LAN, Chat, Announcement, System Tools) — say "next" for sequential, or specify (e.g. "EDR first" for security-heavy priority)
