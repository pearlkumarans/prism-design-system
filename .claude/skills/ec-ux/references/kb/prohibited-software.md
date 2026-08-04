# Prohibited Software

> Detecting and automatically removing blocklisted (banned) applications from managed Windows computers, with an exclude list for exceptions and the ability to block executables at run time. Parent module: [IT Asset Management](it-asset-management.md). Windows Desktop Apps only. Available across Endpoint Central paid editions; a Free edition exists with reduced endpoint limits (edition gating inferred — verify against the official edition-comparison matrix).

## 1. What it is — Feature detail

Every organization maintains a list of prohibited (blocklisted) software barred from employee use — commonly gaming and social-networking apps that cause productivity loss and compliance risk. Endpoint Central's ITAM **fully automates detection and removal** of such software. The module lets you:

1. **Enlist applications to be blocklisted** — after an initial scan, specify the software to prohibit; it is detected during subsequent scan cycles.
2. **Detect prohibited software** across the network on each scan cycle.
3. **Auto-uninstall** the blocklisted software within a specified time frame once detected.
4. **Exempt computers** from the auto-uninstall routine (the "Exclude list").
5. **Notify admins and end users** when prohibited software is detected (and during the detection-to-removal window).
6. **Generate a Prohibited Software Report** showing which computers run such apps.

A related capability, **Block Executable**, prevents an application from *running* even when launched from an external/removable drive — defending against portable/fileless apps. Prohibit Software *uninstalls*; Block Executable *stops execution at run time* — combine them for both removal and run-time prevention.

### Platform scope
Prohibited Software and Block Executable apply to **Windows Desktop Apps only.**

### Auto-uninstall mechanics
- Detection happens per scan cycle; auto-uninstall jobs run on the subsequent refresh cycle (overflow waits for next startup).
- Supports a **wait-window** (e.g., remove N days after detection), a **per-computer maximum** number of software to uninstall per cycle (higher = higher CPU), and **user notification** before uninstalling.
- For `.exe` apps a valid **uninstall command + silent switch** must be configured (MSI is auto-supported).

### Exclusions
- **Per-software exclusions** exempt specific computers/custom groups from a given prohibited rule (e.g., executives needing a chat app to talk to clients).
- A **Global Exclusion** list exempts computers from *all* prohibited rules.

### Capability summary
| Capability | Detail |
|---|---|
| Platform | Windows Desktop Apps only |
| Detection | Per scan cycle, after the app is added to the prohibited list |
| Removal | Auto-uninstall on subsequent refresh; wait-window + per-cycle max + user notify |
| `.exe` handling | Requires uninstall command + silent switch (MSI auto) |
| Exceptions | Per-software Exclusions + Global Exclusion |
| Run-time block | Block Executable (stops execution incl. from external drives) |
| Notification & reporting | Email to admins/users; Prohibited Software Report |
| User requests | End users can request to use a prohibited app; technician approves |

## 2. UX lens

### Console navigation path
- `Inventory > Prohibit Software > Add Prohibited Software`
- Auto-uninstall: `Prohibit Software > Auto-Uninstall Policy`
- Status: `Prohibit Software > Auto Uninstallation Status > Detailed View`
- User requests: `Inventory > Prohibit Software > User Requests`
- Block Executable: `Inventory > Actions/Settings > Block Executable`
- Report: `Reports > Inventory Reports` (Prohibited Software Report)

### Step-by-step: define prohibited software + auto-uninstall
1. Scan the network at least once. Go to `Inventory > Prohibit Software > Add Prohibited Software` (the dialog lists detected software).
2. Select the software → move to the **Prohibited List** → **Update**. (Adding a software *group* adds the group's parent software.)
3. Open **Auto-Uninstall Policy** → check **Enable Automatic Uninstallation**.
4. Set the **maximum number of software** to uninstall per computer per cycle (higher = more CPU; overflow removed at next startup).
5. (Optional) **Notify User before Uninstalling** with a custom message (requires Notify User Settings).
6. Set the **wait-window** (e.g., `3` to remove 3 days after detection). **Save.**
7. For `.exe` apps: open the **Prohibited SW** tab → **Not Configured** under Uninstall command → **Pre-fill Uninstall Command** (from Add/Remove Programs; add the silent switch) or **I will specify myself** → **Save**. Verify in **Auto Uninstallation Status > Detailed View**.
8. (Optional) **Exclusions:** select the software → **Exclusions** link → add computers/custom groups → **Save**; or **Configure Global Exclusion** for all-rule exemptions.

### Step-by-step: block an executable
1. `Inventory > Actions/Settings > Block Executable`.
2. Add the executable name(s) to block; blocking prevents the app from running even when launched from external/removable drives.

### Step-by-step: approve a user request
1. End users raise a request from the agent tray icon (they see the prohibited list).
2. Technicians resolve at `Inventory > Prohibit Software > User Requests`. With ServiceDesk Plus integration (SDP 9203+), approval is only via SDP — associate a template under `Admin > Integration Settings > ServiceDesk Plus`.
3. On approval, the user may install/use the requested app.

### UX research hooks / friction points
- **Many interacting knobs** (max-per-cycle, wait-window, exclusions, global exclusion, `.exe` switch) — a single review screen would reduce misconfiguration.
- **Windows-only** scope frustrates mixed-fleet admins; clear in-context labeling helps.
- **`.exe` silent-switch requirement** is a common failure point; pre-fill helps but verification is manual.
- **Exclude-list discoverability** matters so legitimate executive exceptions are handled cleanly.

## 3. PM lens

### Value & positioning
Positioned as a productivity-and-compliance guardrail inside ITAM/endpoint security: automatically rid the network of banned apps with minimal admin time. The exclude list balances enforcement with real-world exceptions (executives, client communication). Pairing with Block Executable extends from removal to run-time prevention, overlapping with application control.

### Personas & use cases
- **Security / compliance officer** — enforce acceptable-use and licensing policy.
- **IT admin** — automate removal at scale; handle exceptions.
- **HR/management (via policy)** — curb gaming/social apps that hurt productivity.
- **End user** — request legitimate exceptions through the tray icon.

### Edition gating & expansion opportunities
- Bundled with ITAM in paid editions; Free edition limited (inferred).
- **Expansion:** extend prohibited-software/block-exe beyond **Windows** (macOS/Linux); category-based blocklists (e.g., "all games"); reputation/hash-based blocking; tighter convergence with Application Control and endpoint security; self-service approval workflows with audit trails.

## 4. Developer / Technical lens

### Mechanics & data collection
- The prohibited list is evaluated against inventory scan results each cycle; matches trigger notification and (if enabled) auto-uninstall on the next refresh.
- Uninstall uses the app's uninstall command; `.exe` needs a silent switch, MSI is automatic.
- Block Executable enforces a run-time block at the endpoint, independent of installation, covering external-drive launches.
- Exclusions/Global Exclusion are checked before any uninstall action.

### Ports / protocols (shared ITAM path — inferred)
- On-prem: **8020** (agent↔server), **8027** (on-demand). Cloud: **443** to `desktopcentral.manageengine.com` / `dms.zoho.com`.
- Mail Server required for prohibited-software notifications.

### Data model (inferred naming)
- ProhibitedSoftwareRule, UninstallCommand (+ silentSwitch), AutoUninstallPolicy (enabled, maxPerCycle, waitWindow, notifyUser), Exclusion / GlobalExclusion, BlockExecutableRule, UserRequest.

### Limits
- **Windows Desktop Apps only.**
- `.exe` removal requires a valid uninstall command + silent switch.
- Detection/removal latency tied to the scan + refresh cadence and the configured wait-window.
- Per-cycle uninstall cap; overflow deferred to startup (CPU trade-off).

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
|---|---|---|
| Prohibited software not auto-uninstalling | Computer in Exclusion/Global Exclusion; wait-window not elapsed; per-cycle max exceeded; `.exe` lacks uninstall command | Check exclusions; confirm wait-window passed; raise per-cycle max (watch CPU); configure `.exe` uninstall command + silent switch; verify in Detailed View. |
| App reinstalls / keeps running | Removal alone doesn't stop re-launch from external media | Add Block Executable to stop run-time execution. |
| `.exe` won't uninstall silently | Missing/incorrect silent switch | Use Pre-fill Uninstall Command or specify the correct silent switch. |
| Software group behaves unexpectedly | Adding a group adds its parent software | Add the specific application rather than the group. |
| No notifications | Mail Server / Notify User Settings not configured | Configure Mail Server and Notify User Settings. |
| Executive's machine wrongly cleaned | Not excluded | Add the computer/custom group to the software's Exclusions or Global Exclusion. |
| User request can't be approved in console | ServiceDesk Plus integration active | Approve via SDP (9203+); associate the template under Integration Settings. |

### FAQs
- *Which platforms?* Windows Desktop Apps only.
- *How fast is removal?* After detection on a scan cycle, on the next refresh, subject to the wait-window.
- *How do I exempt a machine?* Add it (or a custom group) to the software's Exclusions, or to the Global Exclusion list for all rules.
- *What's the difference from Block Executable?* Prohibit uninstalls; Block Executable stops the app from running (even from external drives).
- *Can users request exceptions?* Yes — via the tray icon; technicians approve in console or via ServiceDesk Plus.
- *Does adding a group block all its versions?* It adds the group's parent software.

## Cross-references
- [it-asset-management.md](it-asset-management.md) — parent module; detection runs on the inventory scan engine.
- [software-license-management.md](software-license-management.md) — removing unauthorized software supports license compliance.
- [software-deployment.md](software-deployment.md) — shares the uninstall/deployment mechanics used for removal.

## Sources
- https://www.manageengine.com/products/desktop-central/prohibited-software.html
- https://www.manageengine.com/products/desktop-central/help/inventory/configure_prohibited_software.html
- https://www.manageengine.com/products/desktop-central/block-exe-application.html
- https://www.manageengine.com/products/desktop-central/help/inventory/block_executables.html
- https://www.manageengine.com/products/desktop-central/it-asset-management.html
