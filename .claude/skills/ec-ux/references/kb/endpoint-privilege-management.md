# Endpoint Privilege Management (EPM)

> Endpoint Privilege Management enforces **least privilege** on endpoints by removing standing administrative rights and granting just-enough, just-in-time, application-specific elevation. It shifts control from user-based admin rights to **application- and process-level permissions**, answering the question "with what privilege should this app run?" (its sibling, Application Control, answers "can it run at all?"). Parent module: [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md). Available in the Endpoint Central Security Edition / Endpoint Security add-on, and as the standalone point product **Application Control Plus (ACP)**. Vendor cites that **74% of data breaches involve privileged-credential abuse** (Verizon DBIR).

---

## 1. What it is — Feature detail

EPM is a Zero Trust security approach that lets organizations assign **temporary or delegated privileges without granting full administrative rights**, minimizing the attack surface while maintaining user productivity. Rather than leaving users as standing local admins, EPM removes those rights and selectively elevates specific applications and processes per policy, mapped to device groups.

### A. Removal of admin rights
- **Admin Rights Summary** tab — a global view of all local admin accounts, with a **Local Admin Count** per computer, to evaluate risk exposure and streamline remediation.
- **Exclusion Policy** tab — create **global** policies that preserve essential accounts (the built-in administrator, the sysadmin's own account, or any other critical account) so they are retained everywhere they are found while all unnecessary admin rights are removed.
- **Manual removal:** select computers in Admin Rights Summary -> **Remove Local Admin** -> all local admin accounts (except excluded) are removed in the next refresh cycle.
- **Automatic removal:** check **Enable Automatic Removal** -> all non-excluded admin accounts are removed from the selected computer groups in the next refresh cycle (**90 minutes**).

### B. Granular privilege policy configuration (the Privileged Application List)
Create a **Privileged Application List** (`Privilege Management -> Create`) that defines how applications run elevated. Elevation can be configured for **all allowlisted applications** or for **specific applications** based on administrator-defined rules, mapped to device groups. Specific apps are added by rule type: **Vendor, Products, Verified Executable, File Hash, StoreApps, Folder Path, CLSID**.

### C. Application-specific elevation modes
- **Allow users to elevate applications on reason (self-elevation with justification):** the user supplies a justification at runtime; it is logged for auditing under `Reports -> Applications Elevated with Reason Report`. The end user sees a self-elevation prompt.
- **Allow users to elevate applications on request (Just-In-Time request):** the user requests time-bound elevation with a mandatory reason; the request is routed to administrators for approval (or auto-approved). Prevents privilege misuse while letting users complete legitimate tasks without permanent admin rights.
- **Auto Elevation:** trusted applications are **automatically** run elevated for selected device groups without any manual request — balancing security with a seamless experience.
- **Not Configured:** no elevation.
- Self-elevation can target **specific applications** or **all allowlisted applications**.

### D. CLSID / Control-Panel / COM-object elevation
The **CLSID** rule type elevates COM objects (including Control Panel applets and other Windows system components) by their unique **Class IDs** instead of executables or paths. This gives granular control over Windows system components without relying on mutable file attributes. CLSID is the **only** rule type that matches COM components; conversely EXE/MSI are not matched by CLSID.

**Rule-type ↔ extension support (Windows):**

| Extension | Vendor | Product Name | Verified Exe | File Hash | Folder Path | CLSID |
|---|---|---|---|---|---|---|
| EXE, MSI | yes | yes | yes | yes | yes | no |
| MSC | no | no | no | yes | yes | no |
| BAT | no | no | no | yes | yes | no |
| COM Components | no | no | no | no | no | yes |

### E. Just-In-Time (JIT) access for temporary elevation
JIT grants temporary privilege elevation for specific tasks or timeframes, limiting persistent privileges and reducing insider-threat / lateral-movement risk. Two models: **admin-configured policies** (proactive grants by criteria) and **request-based** (user-initiated with justification + duration).
- **Create:** `Policies -> Just in Time Access -> Create -> Application Elevation -> name/description -> Computer Name + User Name (specific or All users) -> Duration type: Fixed (set duration) or Window (set a time frame)`. In **Access Settings**, "Just In Time Access for self-elevation" grants **All Allowed Application(s)** or **Specific applications** (rule types: Vendor, Products, Verified Executable, File Hash, CLSID, Folder Path). **Deploy Immediately**.
- **User-initiated requests:** on running an app needing elevation, the user gets a JIT prompt, specifies a **time duration** and a **justification**. Pending requests appear in the **Just-In-Time Access** tab; admin approves/declines.
- **Revocation:** approved access **auto-revokes** when the requested duration expires; admins can also manually revoke active access from the console.

### F. Autonomous (auto-) approval for JIT requests
**Autonomous Approval** (`Settings -> Autonomous Approval`) auto-approves eligible requests **instantly based on a confidence-scoring threshold derived from the machine's secure status** — reducing administrative overhead while maintaining governance and auditability. Keep manual approval for high-risk requests.

### G. Self-elevation
Self-elevation is the umbrella for the "on reason" (justified) and "on request" (JIT) end-user flows above, plus auto-elevation. The agent surfaces an on-endpoint self-elevation prompt; justified elevations are written to the Applications-Elevated-with-Reason report for audit.

### H. EPM-adjacent secure-access features (marketing/overview tier)
- **Per-App VPN** — protect data-in-transit for specific applications.
- **Conditional Access / Adaptive Control** — allow/deny dynamically by identity, device health, or location.
- **Office 365 security** — restrict O365 access to authorized devices.
These overlap with the Secure Private Access story; deep configuration is not in the EPM help pages reviewed (*inferred*).

### Recommended rollout sequence
1. Finalize the **Exclusion Policy** first (protect built-in/sysadmin/critical accounts).
2. Remove unnecessary standing local admins (manual or automatic, 90-min cycle).
3. Publish a **Privileged Application List** with self-elevation / JIT / auto-elevation as appropriate.
4. Associate it to the same custom groups so users keep standard rights but can still run needed apps elevated.
5. Turn on **Autonomous Approval** for low-risk apps/trusted users once the confidence-score behavior is understood.
6. Review reports (Applications Elevated with Reason, per-JIT Audit) on a cadence.

### Prerequisites & edition gating
- EC agent deployed; Privilege Management agent components install with the agent.
- **Windows** is the deeply-supported platform (CLSID/COM elevation, token elevation, admin-rights removal); macOS/Linux parity is lighter (*inferred*).
- Edition: Security Edition / Endpoint Security add-on (*inferred*); standalone **Application Control Plus**.

---

## 2. UX lens

### Console navigation map
- **Privileged Application List:** `Privilege Management -> Create | Modify`
- **Admin-rights removal:** `Privilege Management -> Admin Rights Summary` (+ `Exclusion Policy` tab)
- **JIT access:** `Policies -> Just in Time Access -> Create -> Application Elevation`
- **Autonomous approval:** `Settings -> Autonomous Approval`
- **Reports:** `Reports -> Applications Elevated with Reason Report`; per-JIT-policy **Audit** tab.

### Step-by-step workflows
1. **Remove admin rights:** `Privilege Management -> Exclusion Policy (protect accounts) -> Admin Rights Summary -> select computers -> Remove Local Admin` or **Enable Automatic Removal**.
2. **Create an EPM policy:** `Privilege Management -> Create -> configure self-elevation (on reason / on request / Not Configured) and/or All-allowed / Specific apps / Auto Elevation -> add specific apps by Vendor/Product/Verified-Exe/Hash/CLSID/Path -> deploy & associate to custom groups`.
3. **Create a JIT policy:** `Policies -> Just in Time Access -> Create -> Application Elevation -> name -> computer + user (or All users) -> Fixed/Window duration -> All Allowed/Specific apps -> Deploy Immediately`.
4. **Review a request:** `Just-In-Time Access tab -> review justification -> approve/decline` (auto-revoke on expiry; manual revoke available).
5. **Enable auto-approval:** `Settings -> Autonomous Approval` (confidence threshold from machine secure status).
6. **Audit:** `Reports -> Applications Elevated with Reason`; per-JIT `policy -> Audit`.

### UX research hooks
- **Self-elevation vs. JIT-request vs. auto-elevation:** three overlapping elevation paths — study which admins pick and whether "on reason" vs "on request" is clear.
- **Confidence-score auto-approval opacity:** the secure-status threshold is not surfaced — study whether admins trust an auto-approval they can't explain.
- **Admin-rights removal blast radius:** 90-minute auto-removal across a group is high-stakes — study reliance on Exclusion Policy and break-glass needs.
- **CLSID mental model:** elevating by Class ID rather than path is unfamiliar — study whether admins discover it for Control Panel applets.
- **Opportunity:** an "effective elevation" preview per device; explainable confidence scoring; break-glass temporary admin with session recording.

### Notable UI patterns
Privileged Application List builder with rule-type drop-down; Admin Rights Summary grid with Local Admin Count; Exclusion Policy editor; JIT request queue with justification + duration; Fixed/Window duration selector; Autonomous Approval toggle; per-JIT Audit tab.

---

## 3. PM lens

### Value proposition & business outcomes
- **Heightened security** — no standing admin; elevation is per-app, time-bound, and audited, cutting the 74%-of-breaches privileged-credential-abuse vector.
- **Operational efficiency** — right privileges for the task; fewer standing-admin tickets; auto/auto-approved elevation reduces admin toil.
- **Reduced attack surface** — removing local admin curbs lateral movement, ransomware, and insider threats.
- **Compliance** — auditable elevation trails (reason reports, JIT audit) demonstrate regulatory adherence.

### Target personas & use cases
- **Security Admin** — enforce least privilege, author elevation/JIT policies, approve/deny requests, run admin-rights removal.
- **End user** — self-elevate with a reason or request JIT elevation.
- **Auditor/Compliance** — review elevation and JIT audit trails.
- Use cases: stripping local admin without crippling power users; regulated industries needing auditable elevation; securing legacy/fixed-function systems and remote workforces. *Trusted by NASA, Honda, Etihad Airways, TCS, ABT (per vendor page).*

### Positioning & differentiators
- EPM + Application Control in one agent/console inside a full UEM suite, or as standalone **Application Control Plus**.
- Differentiators: **CLSID/COM elevation**, self-elevation with justification, JIT with **confidence-score autonomous approval**, auto-elevation, global admin-rights removal with global Exclusion Policy, application/process-level (not user-level) control.
- Competes with CyberArk EPM, BeyondTrust, ThreatLocker, Microsoft LAPS/MDM — EC's edge is consolidation and price within UEM.

### Edition / point-product gating
- Security Edition / Endpoint Security add-on (*inferred*). Standalone: **Application Control Plus** (its feature site markets Endpoint privilege management, Remove admin rights, Just-in-time access).

### Expansion opportunities (analysis)
- **Explainable confidence scoring** for autonomous approval (show the secure-status factors).
- **macOS/Linux parity** for CLSID-equivalent elevation and admin-rights removal.
- **Anomaly detection** on elevation/privilege patterns feeding real "privilege monitoring."
- **Break-glass temporary admin** with full session recording; tighter SIEM/SOAR + ITSM approval integration.

---

## 4. Developer / Technical lens

### Architecture & components (from EPM "how it works")
The EC server/console authors rules; the agent enforces and reports.

| Agent process | Executable | Bandwidth | CPU | Memory |
|---|---|---|---|---|
| Admin Accounts Scanner | `DRAdminUsers.exe` | NA | 0–1% | 1–5 MB |
| Process Notifier | `AppCtrlToast.exe` | NA | 0–1% | 20 MB |
| ACP Privileger | `Privilager.exe` | NA | 0–1.4% | 1–1.5 MB |
| Component Upgrade | `dcconfig.exe` | 3.5 MB | 0–1% | 1 MB |

### Agent mechanics
- **Admin-account scan:** `DRAdminUsers.exe` runs a one-time scan after install and again **every 90-minute refresh cycle**, identifying local admin accounts and performing their removal when configured.
- **Policy deployment:** `dcconfig.exe` pushes policy. **Deploy Immediately** applies to online agents at once (>200-machine groups: first 200 now, rest next cycle); **Deploy** schedules for the next 90-minute cycle. With a Distribution Server, policy replicates to the DS first, then to agents during the cycle.
- **Enforcement & elevation:** on the agent, `VerifyTrustedFiles.exe` invokes `Privileger.exe` to elevate processes per the deployed policy. Elevated-application events post on the 90-minute cycle and update every 7 days.
- **JIT:** when a JIT policy deploys, `VerifyTrustedFiles.exe` invokes `Privileger.exe` to elevate on the target machine/user; elevation **auto-terminates** after the specified duration.
- **CLSID elevation:** COM components are matched by Class ID (the only rule type supporting COM components).

### Data model / key objects
Privileged Application List, Elevation Rule (Vendor/Product/Verified-Exe/Hash/CLSID/Path), Self-Elevation Request, JIT Access Policy/Grant, Exclusion Policy, Admin Account (with Local Admin Count), Audit/Escalation Event.

### Ports, protocols, integrations
- Standard EC secure agent-server channel (HTTPS); on-prem default ports **8020 (HTTP) / 8383 (HTTPS)** per EC config KBs.
- Per-App VPN / Conditional Access integrate with identity/device-posture signals (*inferred*); O365 device-based gating referenced.
- REST API for policy automation via the platform API Explorer (*inferred*).
- Scales via custom groups/OUs and Distribution Servers; the 90-minute refresh cycle is the canonical sync unit.

### Technical limitations
- Deepest enforcement is **Windows-centric** (CLSID/COM, token elevation, admin-rights removal).
- Confidence-score auto-approval threshold is not user-visible (opacity).
- Per-App VPN / Conditional Access depend on supporting identity infrastructure.
- Elevation rule must match the extension (see the rule-type/extension table); a `.bat`/`.msc` added by Vendor/Product will not elevate.

---

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
|---|---|---|
| Elevation not applying to an app | App identity doesn't match the rule (e.g., a `.bat`/`.msc` added by Vendor/Product, which those extensions don't support; or a Control Panel object not added by CLSID) | Re-add using a supported rule type per the extension table (BAT/MSC -> Hash or Path; COM objects -> CLSID); confirm the policy reached the device |
| Self-elevation requests not reaching admin / not auto-approving | Self-elevation set to "Not Configured," or Autonomous Approval disabled / confidence threshold not met (machine secure-status too low) | Configure "elevate on request" in the Privileged Application List; enable `Settings -> Autonomous Approval` for trusted users/low-risk apps; otherwise approve manually from the JIT tab |
| JIT access revoked too soon / not revoked | Fixed vs Window duration misconfigured, or expiry reached | Review the JIT policy's duration type/value; manually re-grant or revoke from the console |
| Admin accounts not removed | Account is in the Exclusion Policy, or removal hasn't reached the next refresh cycle | Check Exclusion Policy; wait the 90-minute cycle (or apply immediately); verify `DRAdminUsers.exe` is running and the agent is online |
| Too many local admins still showing | Auto-removal not enabled, or accounts protected by Exclusion Policy | Enable Automatic Removal on the right computer groups; review which accounts the Exclusion Policy preserves |
| Policy stuck at "Ready to Execute"/"In Progress"/"Yet to Apply" | 90-min delay; agent offline/outdated; workgroup-linked config; DS not synced; firewall blocking status | Tray icon -> **Apply Configurations** or `cfgupdate`; open ports 8020/8383; use a custom group; upgrade agents; fix DS health |

### FAQs
- **What is EPM?** It ensures trustworthy apps run with the least privilege needed — combining least privilege with application/process-level control instead of standing admin rights.
- **Self-elevation vs. JIT vs. auto-elevation?** On-reason = user justifies and elevates immediately (logged); on-request (JIT) = time-bound request routed for approval; auto-elevation = trusted apps elevate with no request.
- **How does auto-approval decide?** A confidence score derived from the machine's secure status; below threshold, requests fall back to manual approval.
- **How fast does admin-rights removal take?** Next 90-minute refresh cycle.

---

## Cross-references
- [application-control.md](application-control.md) — the sibling capability; app control decides *if* an app runs, EPM decides *with what privilege*. They share the agent, the 90-minute cycle, custom-group association, and the Custom Rule model.
- [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) — parent module bundling both capabilities, with the shared deployment-status and GPO troubleshooting tables.
- [secure-private-access.md](secure-private-access.md) — Conditional Access and Per-App VPN concepts here align with application-level secure access.
- [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) — least privilege complements DLP and device control to limit data exfiltration.

## Sources
- https://www.manageengine.com/products/desktop-central/help/endpoint-privilege-management/epm-overview.html
- https://www.manageengine.com/products/desktop-central/help/endpoint-privilege-management/epm-policy-creation.html
- https://www.manageengine.com/products/desktop-central/help/endpoint-privilege-management/epm-jit-access.html
- https://www.manageengine.com/products/desktop-central/help/endpoint-privilege-management/remove-admin-rights.html
- https://www.manageengine.com/products/desktop-central/help/endpoint-privilege-management/epm-how-it-works.html
- https://www.manageengine.com/application-control/features.html
- https://www.manageengine.com/products/desktop-central/desktop_configuration_status.html
