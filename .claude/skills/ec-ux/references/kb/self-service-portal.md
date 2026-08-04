# Self-Service Portal (SSP)

> An end-user storefront, surfaced in the Endpoint Central agent tray, where employees install/uninstall IT-approved software (and patches) on demand — eliminating the request-and-wait cycle and offloading routine software distribution from admins. Parent module: [Software Deployment](software-deployment.md). Available in **Enterprise edition and above** (SSP is listed as an Enterprise-tier feature). Supported on **Windows and macOS (10.12+)**. (Edition gating per the edition-comparison matrix; user-based publishing not supported on Mac.)

---

## 1. What it is — Feature detail

Software distribution is a routine but recurrent task: admins install/uninstall business-critical apps based on role and need, and common apps (Adobe Reader, browsers, runtimes) are wanted by everyone. The classic pain is the request-and-wait loop — users raise a ticket and wait, especially when they change roles/departments, need an app temporarily, or have a corrupted install.

The **Self-Service Portal (SSP)** is one of Endpoint Central's software-deployment methods that solves this. All IT-approved applications are **published** to all users, specific groups, or departments, and then appear in a list inside the Endpoint Central agent-tray portal. From this list, users choose to **install or uninstall** apps themselves, as and when needed — eliminating wait time and making distribution dynamic while saving admin effort.

Key tasks the SSP accomplishes:
- Publish software to all users, all computers, or specific groups.
- Empower users to install/uninstall IT-approved software themselves.
- Publish both **free and commercial** software (commercial apps may require the user to activate a license manually).
- Save admin time on software distribution; reduce help-desk tickets.

### How publishing & sync work
- An admin publishes a package (or associates one with an existing custom group); the published list reaches client agents on the **90-minute sync** (or via **Sync Now**).
- The end-user actions shown — **Install, Uninstall, Upgrade, Downgrade, Reinstall** — depend on the package's configured install/uninstall commands and on the Application Name/Version set under the package's Advanced > Package Properties matching the Control Panel values.
- **Auto-update Templates:** when enabled, SSP-published packages are automatically refreshed to the latest version, so users always see the current app on next launch.

### Approval flow (with ServiceDesk Plus)
When Endpoint Central is integrated with ServiceDesk Plus, software can be published in one of two modes:
- **Without approval** — users install directly from the SSP.
- **With approval** — the user raises a request from the SSP, which creates a help-desk ticket; a technician must approve it before the user can install; the ticket auto-closes after installation. (Approval flow requires EC 92080+ with ServiceDesk Plus 9203+, Windows.)

### End-user experience
- The portal is reached from the **agent-tray icon**, plus a **desktop shortcut** and **start-menu entry** created on first publish.
- Users see a rebrandable catalog (logo, header/table colors via SSP Settings) of approved apps with an action button each.
- Multiple selected installs run **sequentially** (the rest queue). Manual uninstalls done outside the SSP are not reflected back in SSP status.

### Prerequisites and key concepts
- **Agent** on each endpoint; **.NET 4** on Windows clients (auto-installed); agent-tray icon + SSP menu enabled.
- **Windows and macOS (10.12+)**; **user-based publishing is not supported on Mac**.
- Key terms: publish, associate/disassociate, custom group, approval mode, Automate Settings, package context (System User / Run As User / Target User), Sync Now.

---

## 2. UX lens

### Console navigation path (admin side)
- Make SSP visible: `Agent → Settings → Agent Settings → Agent Tray Icon` → enable **Show Agent Icon in the System Tray** and **Show Self Service Portal Menu**.
- Customize: `Software Deployment → Settings → SSP Settings` (display location, user view/actions, ROI, Automate, Rebranding).
- Publish: `Software Deployment → Deployment → Self-Service Portal`.

### Step-by-step: publish software to the SSP (admin)
1. Enable the agent-tray icon + SSP menu (path above).
2. Customize appearance/behavior under SSP Settings (optional rebranding/ROI/Automate).
3. Go to `Software Deployment → Deployment → Self-Service Portal`.
   - **New group:** click **Publish Software Packages** → name the custom group → move apps from Available to Selected → **Publish**.
   - **Existing group:** select the group → **Associate Package** → move apps → **Publish**.
4. Set per-package context via ⋮ → **Package Settings** (System User / Run As User (Domain Admin recommended) / Target User; enable user interaction if the installer needs folder/EULA/license input).
5. (Optional) **Automate Settings** to auto-publish non-commercial software to all computers; with ServiceDesk Plus, auto-publish commercial software with an approval requirement.
6. To remove: select the group → **Disassociate Package** → confirm (removes from the SSP list; does **not** uninstall from machines).

### Step-by-step: end-user installs an app
1. Open the SSP from the agent-tray icon (or desktop shortcut / start menu).
2. Browse the catalog of approved apps; click **Install** (or Uninstall/Upgrade/Reinstall as offered).
3. Wait for completion; for commercial apps, activate the license if prompted.
4. (With-approval mode) Raise a request → a help-desk ticket is created → on technician approval, install becomes available; the ticket closes after install.

### End-user actions and when they appear
| Action shown | Condition |
| --- | --- |
| Install | Package has an install command and the app isn't installed |
| Uninstall | Uninstall command configured and the app is installed |
| Upgrade | Installed version is lower than the published version |
| Downgrade | Installed version is higher than the published version |
| Reinstall | Installed via SSP but Control-Panel name/version or uninstall attributes aren't configured |

### UX research hooks
- **Wrong action shown** ("Reinstall" instead of "Upgrade") traces to Application Name/Version mismatch with Control Panel — a recurring confusion to instrument.
- **Approval latency** — study end-user perception of the with-approval wait vs. the without-approval instant install; tune defaults per app risk.
- **SSP vs Enterprise App Catalogue vs MDM App Catalog** overlap conceptually for users; a unified self-service surface would reduce confusion.
- **Discoverability** — does the user know the tray portal exists? First-publish desktop shortcut helps; measure first-use rate.
- **Sync lag expectation** — the 90-minute sync surprises users expecting instant catalog changes; surface "Sync Now" prominently.

### Notable UI patterns
Agent-tray portal (rebrandable catalog with per-app action buttons), admin publish/associate flow with custom-group targeting, per-package context settings, Automate Settings, approval handoff to ServiceDesk Plus.

---

## 3. PM lens

### Value proposition & outcomes
- **Eliminates request-and-wait** — instant self-service install/uninstall of approved apps.
- **Cuts help-desk volume** — routine software requests move to self-service (with optional approval governance).
- **Compliance by design** — only IT-approved apps are offered; commercial vs free both supported with license handling.
- **Admin time saved** — publish once to a group; Auto-update keeps it current. Contributes to the platform's 442% ROI story.

### Target personas & use cases
- **End user** — self-install role/department apps and runtimes on demand.
- **IT administrator** — publish an approved catalog once; offload recurrent installs.
- **Help-desk technician** — fulfill via approval workflow instead of manual installs.
- Use cases: onboarding app kits, role-change app swaps, temporary-need installs, self-heal of corrupted installs.

### Positioning & differentiators
- Native to the unified platform (shares packages, repository, and deployment policies with [Software Deployment](software-deployment.md)).
- **ServiceDesk Plus approval integration** adds governance most standalone self-service stores lack.
- Rebrandable + ROI reporting for IT to demonstrate value.

### Edition gating & packaging
- SSP is an **Enterprise-tier** feature (and above). **Windows + macOS (10.12+)**; user-based publishing not on Mac. (Per edition-comparison matrix.)

### Expansion opportunities (analysis)
- **Unified self-service surface** across SSP, Enterprise App Catalogue, and mobile App Catalog with one approval workflow. *(inferred)*
- **Risk-tiered approvals** — auto-approve low-risk, require approval for high-risk, by policy. *(inferred)*
- **macOS user-based publishing parity.** *(inferred)*
- **Reflect out-of-band uninstalls** back into SSP status. *(inferred)*

---

## 4. Developer / Technical lens

### Mechanics & components
- **Server** stores packages (network-share or HTTP repository) and the SSP publication mapping (package ↔ custom group ↔ context).
- **Agent** renders the tray portal, syncs the published list every **90 minutes** (or on Sync Now), and executes install/uninstall in the configured context (System User / Run As User / Target User).
- **Auto-update** engine refreshes SSP-published packages after the daily template sync.
- **ServiceDesk Plus** integration brokers the approval ticket lifecycle.

### Ports / protocols / limits (mark inferred)
- Inherits Software Deployment transport: agent–server on **8020**; on-demand on **8027**; HTTPS console commonly **8383**; Cloud over **443**. *(inferred — shared platform ports.)*
- Requires **.NET 4** on Windows clients.
- **Limits:** user-based publishing not supported on Mac; commercial apps may need manual license activation; disassociating a package does not uninstall it; out-of-band uninstalls aren't reflected; published changes lag up to one 90-minute sync.

### Data model / key objects (inferred naming)
SSPPublication (package ref, target custom group, context, approval mode), Package, CustomGroup, PackageProperties (Application Name/Version for action resolution), ApprovalRequest ↔ SDP ticket.

---

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| App not appearing in SSP | Not published/associated to the right group; tray icon/SSP menu disabled; .NET 4 missing; sync not yet run | Verify publication/group; enable agent tray icon + SSP menu; confirm .NET 4; allow one 90-min sync or click Sync Now. |
| Wrong action shown (Reinstall/Upgrade) | Package Application Name/Version doesn't match Control Panel | Align Advanced > Package Properties (Name & Version) with the Control Panel values. |
| User can't install (with approval) | Pending technician approval, or SDP integration/version mismatch | Approve the SDP ticket; verify EC 92080+ and SDP 9203+ (Windows). |
| Commercial app installed but not licensed | Commercial software requires manual license activation | User activates the license; document the step in the app entry. |
| Disassociated app still on machines | Disassociate only removes from the SSP list | Deploy an uninstall configuration to remove it from endpoints. |
| Manual uninstall not reflected in SSP | Out-of-band uninstalls aren't tracked | Re-sync; rely on Software Deployment / inventory for true state. |
| Mac user-based publish missing | User-based publishing not supported on Mac | Publish to computer-based groups on Mac. |

### FAQs
- **Where do users find the SSP?** The Endpoint Central agent-tray icon, plus a desktop shortcut and start-menu entry after first publish.
- **Can users uninstall apps?** Yes, when an uninstall command is configured and the app is installed.
- **Can I require approval?** Yes — publish "with approval" (needs ServiceDesk Plus); the user's request becomes a ticket a technician approves.
- **Free and paid apps both?** Yes; paid apps may need manual license activation by the user.
- **How fast do changes reach users?** On the next 90-minute sync, or immediately via Sync Now.
- **Does removing an app from the SSP uninstall it?** No — disassociation only removes it from the list.

---

## Cross-references
- [software-deployment.md](software-deployment.md) — parent module; SSP shares packages, repository, contexts, and Auto-update Templates; full publish/disassociate detail.
- [enterprise-app-catalogue.md](enterprise-app-catalogue.md) — sibling self-service surface for org-approved app discovery/installation.
- [software-repository.md](software-repository.md) — where the SSP's published packages are stored (network-share / HTTP).
- [it-asset-management.md](it-asset-management.md) — approved-only catalog supports software-license compliance and prohibited-software control.

## Sources
- Software Self Service Portal — https://www.manageengine.com/products/desktop-central/self-service-portal-software.html
- Self Service Portal (help) — https://www.manageengine.com/products/desktop-central/help/software_installation/self_service_portal.html
- Software Deployment Methods — https://www.manageengine.com/products/desktop-central/software-deployment.html

*Items marked "(inferred)" are reasoned conclusions not stated verbatim on the cited pages.*
