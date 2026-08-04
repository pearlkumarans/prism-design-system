# Application Control

> Application Control governs **which applications are permitted to execute** on managed endpoints through allowlisting and blocklisting, enforced per device group under selectable Audit or Strict policy modes. It answers the question "can this app run?" (its sibling, Endpoint Privilege Management, answers "and with what privilege?"). Parent module: [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md). Available in the Endpoint Central Security Edition / Endpoint Security add-on, and as the standalone point product **Application Control Plus (ACP)**. Vendor cites unmonitored software linked to **16% of 2023 data breaches** as the core driver.

---

## 1. What it is — Feature detail

Application Control is a centralized allowlisting/blocklisting capability that lets administrators decide which executables may run across the network, minimizing the attack surface from unmonitored or malicious software. It is inventory-driven: agents scan every endpoint to discover installed applications, populate a software inventory, and admins build **application groups** from that discovered inventory, associate them with custom device groups, and deploy them.

### Allowlisting vs. Blocklisting
- **Allowlisting** — only pre-approved applications run; everything else is blocked. This is the zero-trust, minimal-attack-surface posture. Allowlists can be created automatically by specifying prerequisites in the form of application-control rules.
- **Blocklisting** — named applications are blocked while everything else runs. This is the productivity-leaning posture used to curb non-business applications and known-bad/malicious executables.

### Application Groups — building blocks
A group is named (name + description) and populated with apps via filters/custom rules run against the discovered inventory. The "All" view shows everything discovered; a rule-type drop-down switches the criterion. A search bar filters installed apps by custom group, application type, and publisher credibility.

**Windows rule/filter types:**
- **Trusted Vendors** — code-signed publishers (verified publisher information).
- **Product Name** — match by product.
- **Verified Executables** — digitally signed exes; tampered signatures are blocked.
- **File Hash** — unique per-binary hash; surfaces even unsigned processes (but breaks on every app update).
- **Folder Path** — a folder plus its subfolders; supports certain Windows environment variables (see the supported-system-variables reference).
- **StoreApps** — Windows 10/11 Microsoft Store applications.
- **Custom Rule** — define vendor / product / verified-exe / file-hash criteria for apps not yet detected in your network.

**Mac rule/filter types:** Vendors, Application, Binary (Mac executables), File Hash, Folder Path, Custom Rule. *Mac prerequisite:* complete the Mac configure-prerequisites steps before creating a group.

**App-group identity attributes** therefore include file/folder, publisher (vendor certificate), and hash — the three classic application-identity anchors, plus product name, verified-exe state, and StoreApp identity.

### Import / Export of groups (self-updating / portable lists)
- **Export** a group to `.xlsx` with each filter rule on its own sheet.
- **Import** an `.xlsx` to either **add rules to an existing group** or **replace** it. Unknown rules in the file are added to the database and auto-selected — a practical mechanism for maintaining and propagating lists as the environment changes. (The fully self-updating reputation-driven list is a roadmap direction — *inferred*.)
- **Application Group Summary** — per-group view of rule details and associated custom groups.

### Child Process Control
Child processes are processes spawned by a running application; they can be an attack vector. **Global Child Process Configuration** (`Application Control -> Child Process`) selects which trusted parent applications are allowed to spawn child processes. Crucially, **an allowed parent's child processes run even if those children are themselves individually blocklisted** — a deliberate trust escape valve for legitimate parents. Workflow: Configure -> select trusted apps -> **Apply**.

### Unmanaged Applications
Apps outside any defined group are "unmanaged." Two strategies:
- **Allow** them — productivity-friendly but risky.
- **Block** them — zero-trust, but generates request overhead (under a restrictive allowlist all newly installed apps default to blocked/unmanaged).

View unmanaged apps per associated policy at `Deploy Policy -> <group> -> Unmanaged Apps`. Resolution actions: **Add to Allowlist/Blocklist**, **Move to Existing App Group** (associates the app with the deployed custom group), and **Restore** (undo a move, from Application Groups). Audit mode is the recommended way to observe unmanaged apps before tightening.

### Request Access (Strict-mode bridge for unmanaged apps)
Available only when the associated group is in **Strict mode with request access enabled**. When a user runs an unmanaged app, they receive a request prompt and supply a **reason**. Sysadmins are notified by **email** and see the request on the **Dashboard**, then respond with: **Add to Allowlist/Blocklist**, **Reject** (stays unmanaged), or **Move to existing App Group**. **Scope note:** granting a requested app applies the permission to **all computers in the specified custom group**, not just the requester. Mail config: `Application Control -> Alert Settings -> "Alert for Requested Apps" -> enter domain email address(es) -> Save`.

### Policy modes (the Flexibility Regulator)
- **Audit Mode** — high flexibility for admins just starting. **All allowlisted AND unmanaged applications run**; blocklisted apps are still prevented. Event collection is on to help identify apps to allowlist. Explicitly **not** a secure model — for discovery/monitoring only.
- **Strict Mode** — zero-trust enforcement. **Only allowlisted apps run; unmanaged apps are blocked** and the user is notified the app is prohibited. Unmanaged apps can be **requested** if request access is enabled.
- Recommended path: start in Audit -> observe unmanaged apps -> add to allow/block lists -> switch to Strict.

### Supported OS / platforms
- **Windows** is the deepest-supported platform (StoreApps, child-process control, environment-variable folder paths).
- **macOS** supported for app groups (with prerequisites) using Vendor/Application/Binary/Hash/Path rules.
- Linux coverage is lighter (*inferred*). Targets workstations, servers, fixed-function devices, and legacy OSes.

### Prerequisites and edition gating
- EC agent deployed and **software/application inventory populated** (agents scan each endpoint to seed groups).
- Mac app groups require the Mac configure-prerequisites steps first.
- Edition: Endpoint Central Security Edition / Endpoint Security add-on (*inferred*); standalone **Application Control Plus**.

---

## 2. UX lens

### Console navigation map (authoritative paths)
- **Create groups:** `Application Control -> Application Groups -> Create Allowlist | Create Blocklist -> Windows | Mac OS`
- **Child-process control:** `Application Control -> Child Process`
- **Associate & deploy:** `Application Control -> Application Groups -> Deployment -> Deploy Policy`
- **Resolve unmanaged apps:** `Deploy Policy -> <group> -> Unmanaged Apps`
- **Request-access mail:** `Application Control -> Alert Settings -> "Alert for Requested Apps"`
- **Reports:** `Reports -> Blocked Application Reports`

### Step-by-step workflows
1. **Build an allowlist/blocklist:** `Application Groups -> Create Allowlist/Blocklist -> Windows/Mac -> name + description -> add apps via Trusted Vendors / Product / Verified Exe / File Hash / Folder Path / StoreApps / Custom Rule -> Create`.
2. **Associate & deploy:** `Application Groups -> Deployment -> Deploy Policy -> create/select custom group -> select app group -> (optional) associate Privileged Application List -> choose Audit or Strict -> (Strict) enable unmanaged-app requests -> set custom block notification -> Deploy / Deploy immediately`.
3. **Resolve unmanaged apps:** `Deploy Policy -> group -> Unmanaged Apps -> Add to Allowlist/Blocklist | Move to Existing App Group | Restore`.
4. **Enable child processes:** `Application Control -> Child Process -> select trusted parent apps -> Apply`.
5. **Approve a request (Strict):** review the request reason on the Dashboard / email -> Add to Allowlist/Blocklist | Reject | Move to existing App Group.
6. **Import/Export a list:** export group -> `.xlsx`; import `.xlsx` -> add-to or replace the group.

### UX research hooks
- **Audit -> Strict transition** is the single biggest confidence gap: how do admins decide unmanaged apps are fully resolved before flipping, and how does the block notification land with users?
- **Child-process trust mental model:** allowed parents' children run even when the child is blocklisted — do admins understand this escape valve and its security implications?
- **Rule-type stability:** File Hash breaks on every update; study whether admins default to fragile hash rules vs. stable vendor/path rules.
- **Request-access blast radius:** granting one user's request applies it to the whole custom group — study whether admins expect this scope.
- **Opportunity:** one-click "trust this publisher" to collapse repeat prompts; an "effective allowlist" preview per device.

### Notable UI patterns
Discovery-driven group builder with a rule-type drop-down over a live inventory; xlsx import/export; Audit/Strict toggle (Flexibility Regulator); custom block notification; Unmanaged Apps resolution panel; request queue on the Dashboard.

---

## 3. PM lens

### Value proposition & business outcomes
- **Reduced attack surface** — only trusted apps run; unmonitored software (16% of 2023 breaches) is contained.
- **Productivity control** — blocklisting curbs non-business apps without full lockdown.
- **Compliance & visibility** — Blocked Application Reports give auditable evidence of access attempts and actions taken.
- **Operational flexibility** — Audit vs. Strict lets orgs phase in enforcement without breaking users.

### Target personas & use cases
- **Endpoint Admin** — builds/maintains allow/block lists from inventory, resolves unmanaged apps, manages child-process trust.
- **Security Admin** — drives zero-trust allowlisting and Strict-mode enforcement.
- **Auditor/Compliance** — reviews Blocked Application Reports.
- Use cases: zero-trust mandates, locking down fixed-function/legacy systems, blocking risky/known-bad executables, controlling shadow IT.

### Positioning & differentiators
- App control inside a full UEM suite (one agent/console), or as standalone **Application Control Plus**.
- Differentiators: the **Flexibility Regulator** (Audit/Strict), child-process control, StoreApps support, automatic allowlist creation from rules, xlsx import/export, and tight pairing with EPM.
- Competes with ThreatLocker, Microsoft AppLocker/WDAC, CyberArk EPM, BeyondTrust — EC's edge is consolidation and price within UEM.

### Edition / point-product gating
- Endpoint Central Security Edition / Endpoint Security add-on (*inferred*). Standalone: **Application Control Plus**. The ACP feature site markets Application allowlisting, Application blocklisting, Flexibility Regulator, Child process control, and Request access as headline features.

### Expansion opportunities (analysis)
- **Risk-based auto-allowlisting** via reputation + prevalence to cut manual curation.
- **Self-updating publisher/reputation lists** so vendor updates don't break hash rules.
- **macOS/Linux parity** for child-process control and StoreApp-equivalents.
- **Anomaly detection** on newly-appearing unmanaged apps; tighter ITSM approval integration for request access.

---

## 4. Developer / Technical lens

### Architecture & components
The EC server/console authors rules; the agent enforces and reports. Relevant agent processes (shared with EPM):

| Agent process | Executable | CPU | Memory |
|---|---|---|---|
| Process Notifier (toasts) | `AppCtrlToast.exe` | 0–1% | 20 MB |
| Component Upgrade / policy push | `dcconfig.exe` | 0–1% | 1 MB |
| Trust verification | `VerifyTrustedFiles.exe` | (inferred) | (inferred) |

### Enforcement mechanics (partly inferred)
- **Process-creation interception** compares each launching executable against allow/block rules keyed on publisher certificate, file hash, product name, folder path, verified-exe status, and StoreApp identity; unverified apps are treated per the policy mode (Audit = run; Strict = block) — *inferred from rule model*.
- **Policy deployment:** `dcconfig.exe` pushes policy. **Deploy Immediately** applies to online agents at once (for custom groups >200 machines, first 200 now, the rest next cycle); **Deploy** schedules for the next **90-minute refresh cycle**. Modifications, deletions, group changes, and unmanaged-app updates sync during refresh cycles; with a Distribution Server, policy replicates to the DS first, then to agents during the 90-minute cycle.
- **Child-process enforcement:** allowed parents bypass child blocks at the process-tree level.

### Data model / key objects
Application (with identity attributes), Application Group (Allowlist/Blocklist), Custom Group, Filter/Rule (Vendor/Product/Verified-Exe/Hash/Path/StoreApp/Custom), Unmanaged App, Request Access entry, Policy Deployment (Audit/Strict), Blocked-Application event.

### Ports, protocols, limits
- Standard EC secure agent-server channel (HTTPS); on-prem default ports **8020 (HTTP) / 8383 (HTTPS)** per EC config KBs.
- REST API for policy automation via the platform **API Explorer** (*inferred — API Explorer exists EC-wide*).
- Scale via custom groups/OUs and Distribution Servers; the **90-minute cycle** is the canonical sync unit; Deploy Immediately throttles to 200 machines/cycle for large groups.

### Technical limitations
- Deepest enforcement is Windows-centric (StoreApps, child-process, env-var paths).
- **File-hash rules break on every app update** unless publisher/path-based rules are used.
- Audit mode is explicitly **not** secure (unmanaged apps run).
- A historical bypass existed where some blocklist rules were overridden by **executing apps through a share path** — fixed in build **10.1.2127.15** (apply the latest PPM).

---

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
|---|---|---|
| Legitimate app blocked under an allowlist | App not in any allowlist; Strict mode blocks unmanaged apps | Run in **Audit mode** first, observe under Unmanaged Apps, add via a stable rule (Trusted Vendor/Folder Path, not Hash), then switch to Strict |
| App still runs after being blocklisted | Historic share-path bypass, or the matching attribute doesn't match the launched binary | Upgrade to build **10.1.2127.15+** (click the build number top-right -> download PPM); verify publisher/hash/path matches the actual binary |
| Child process of an allowed app is blocked | Parent not selected in Global Child Process Configuration | `Application Control -> Child Process -> select the parent -> Apply` |
| New apps keep appearing as unmanaged | Strict allowlist defaults all new installs to blocked/unmanaged | Enable **Request Access** + the "Alert for Requested Apps" mailbox; resolve via Unmanaged Apps |
| Granting one user's request affected others | By design, grants apply to the whole custom group | Use narrower custom groups if per-user scoping is needed |
| Deploy stuck at "Ready to Execute" / "In Progress" / "Yet to Apply" | Normal 90-min delay; agent offline/outdated; workgroup-linked config; DS not synced; empty OU; firewall blocking status | Tray icon -> **Apply Configurations** or run `cfgupdate`; open ports 8020/8383; use a custom group not a workgroup; upgrade agents; fix DS health; clean stale AD objects |

### FAQs
- **Allowlist vs. blocklist?** Allowlist permits only approved apps (zero-trust); blocklist blocks named apps and runs the rest (productivity).
- **Audit vs. Strict?** Audit runs allowlisted + unmanaged apps and logs (not secure); Strict blocks unmanaged apps.
- **How fast do changes apply?** Next 90-minute refresh cycle, or immediately via Deploy Immediately / tray "Apply Configurations" / `cfgupdate`; large groups throttle to 200 machines/cycle.
- **Which rule type is most stable?** Trusted Vendor / Verified Executable / Folder Path — File Hash breaks on every update.

---

## Cross-references
- [endpoint-privilege-management.md](endpoint-privilege-management.md) — the sibling capability; app control decides *if* an app runs, EPM decides *with what privilege*. They share the agent, the 90-minute cycle, and custom-group association.
- [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) — parent module bundling both capabilities, with shared deployment-status troubleshooting tables.
- [browser-security.md](browser-security.md) — blocking browser executables/plugins overlaps with application control.
- [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) — controlling which apps run complements DLP/device control.

## Sources
- https://www.manageengine.com/products/desktop-central/help/application-control/ac-overview.html
- https://www.manageengine.com/products/desktop-central/help/application-control/configure-app-groups.html
- https://www.manageengine.com/products/desktop-central/help/application-control/ac-policy-deployment.html
- https://www.manageengine.com/products/desktop-central/help/application-control/unmanaged-applications.html
- https://www.manageengine.com/products/desktop-central/help/application-control/unmanaged-application-request.html
- https://www.manageengine.com/application-control/features.html
- https://www.manageengine.com/products/desktop-central/issue-with-blacklisting.html
- https://www.manageengine.com/products/desktop-central/desktop_configuration_status.html
