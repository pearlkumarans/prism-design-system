# Network Access Control (NAC) / System Quarantine

> Filters network access so only compliant ("legit") endpoints can reach corporate data — quarantining non-compliant or vulnerable devices and remediating them back to a healthy state. Parent module: [Vulnerability Management](vulnerability-management.md) (configured under **Threats & Patches → Compliance → System Quarantine Policy**). Part of the Endpoint Central **Security edition** (and standalone Vulnerability Manager Plus). **Applies to Windows.** (Edition gating inferred from ManageEngine's Endpoint-Security packaging.)

---

## 1. What it is — Feature detail

Network Access Control (NAC) is the discipline of filtering access to corporate data by allowing only legitimate, compliant endpoints to connect. In Endpoint Central, NAC is implemented through the **System Quarantine Policy**, a feature of the Vulnerability Management module. When a managed Windows endpoint is found susceptible — missing critical OS patches, running prohibited software, exposed to a high-severity vulnerability, or otherwise out of policy — the System Quarantine Policy can either flag it (audit) or actively isolate it from the network (quarantine) until it is brought back into compliance.

Stated benefits from ManageEngine:
- **Real-time compliance management** — proactively identify security vulnerabilities and non-compliant conditions as they occur, rather than during periodic audits.
- **Automated enforcement** — streamline compliance with automated checks and actions; mandate compliance policies across every system on the network.
- **Enhanced security posture** — quarantining non-compliant systems contributes to a robust posture, safeguarding sensitive data and critical infrastructure from a single risky endpoint becoming a foothold.

### Rules in a System Quarantine Policy
A policy is a set of compliance checks. A system is marked **non-compliant** if it violates any configured rule:

| Rule type | Non-compliance condition | Notes |
| --- | --- | --- |
| **OS patches** | Required OS updates not deployed within a specified period | Enforces a patch-currency SLA window. |
| **Software** | Certain applications are installed (or not installed/uninstalled) | Reference the software name from Control Panel. |
| **Service** | Certain services are running (or not running) | Reference the service name from Service Manager (e.g., AV service, firewall). |
| **Vulnerability** | Certain vulnerabilities are detected | Can be categorized by **CVSS score** and **exploit availability**. |
| **Registry and File checks** | Criteria for Registry Value, Registry Path, Folder Path, File Path, or File Version not adhered to | Flexible custom posture checks. |

### Execution options (the action taken on non-compliance)
- **Audit Systems for Non-Compliance** — perform regular audits to identify systems that fail the rules; results provide insight into non-compliance status, enabling proactive remediation **without disrupting users**. Best as a first, observational pass.
- **Quarantine Non-Compliant Systems** — for severe non-compliance, isolate the system from the network to prevent security risks. Four network-restriction levels:

| Restriction option | Effect |
| --- | --- |
| **Block all network access** | System isolated from the network **except** for Endpoint Central components (so it can still receive remediation). The strictest option. |
| **Block only intranet in range** | System isolated from the local network only. |
| **Block custom domain & IP** | System isolated from specific domains and IPs. |
| **Allow access only to custom IP/VPN/Domains** | System allowed to reach **only** specified domains, VPN, or IPs (allow-list model). |

A critical design property: even under "Block all network access," the EC agent retains a channel to the EC server, so quarantine never strands a device beyond remediation reach.

### Remediation lifecycle
1. Policy evaluates the endpoint against its rules (on the agent's refresh/scan cycle).
2. Non-compliant device is audited or quarantined per the configured action.
3. The end user sees an alert message (and, for quarantine, a configurable **grace period** before isolation bites).
4. Admin/SecOps remediates: deploy the missing OS patch, install/remove the offending software, start/stop the service, patch the vulnerability, or fix the registry/file condition — typically via [Patch Management](patch-management.md) or the [Vulnerability Management](vulnerability-management.md) fix flows.
5. On the next evaluation the device returns to compliant and quarantine is lifted automatically.

### Prerequisites and key concepts
- EC Security edition (or Vulnerability Manager Plus); EC server + agent deployed on Windows targets; vulnerability/patch DB synced (shared two-tier model with Patch Management).
- **Custom Group** scoping — a policy is applied to a selected custom group of computers.
- Key terms: NAC, System Quarantine Policy, compliance rule, audit vs. quarantine, network restriction, grace period, remediation.

---

## 2. UX lens

### Console navigation path
`Threats & Patches → Compliance → System Quarantine Policy` → **Create Policy**.
(Status, Modify, Suspend, Delete are available on each created policy.)

### Step-by-step workflow: create a System Quarantine Policy
1. Go to `Threats & Patches → Compliance → System Quarantine Policy`.
2. Click **Create Policy**.
3. Under **Select the Custom Group → Group Name**, pick the target custom group.
4. Under **Define Rules**, select the compliance checks you need (OS patches / Software / Service / Vulnerability / Registry and File).
5. Choose the execution option:
   - **Audit** — set a warning message shown to flagged users.
   - **Quarantine** — choose the network-restriction type (Block all / Block intranet / Block custom domain & IP / Allow only custom IP/VPN/Domains).
6. If quarantining, under **Alert Users** set the alert message and the **grace period** the end user gets before isolation takes effect.
7. (Optional) Under **Configure Notifications**, enable **Enable Notifications** and enter an email for alerts.
8. Click **Create** to finish.
9. Monitor the policy via its **Status** view; use **Modify / Suspend / Delete** as the situation evolves.

### Step-by-step: remediate a quarantined device
1. From the policy **Status** view, identify the non-compliant/quarantined endpoint and the failing rule.
2. Remediate the root cause — deploy the missing patch (Patch Management), install/remove software, start/stop the service, fix the vulnerability, or correct the registry/file value.
3. Wait for the next agent scan/refresh; the device is re-evaluated and quarantine is lifted on compliance.

### UX research hooks
- **Audit-before-quarantine adoption** — study whether admins run an audit pass first or jump straight to quarantine; a guided "simulate impact" preview would de-risk the leap.
- **Blast-radius anxiety** — "Block all network access" is powerful; observe whether the grace-period and alert-message controls give admins enough confidence (confirmation, dry-run, scoped pilot group).
- **Grace-period comprehension** — does the end user understand the countdown and what action clears it? Study message clarity and self-remediation guidance.
- **Rule-authoring friction** — Registry/File and Vulnerability (CVSS + exploit) rules are expert-level; a template library of common NAC baselines would lower the barrier.
- **Recovery loop visibility** — does the Status view make "what's still failing and why" obvious enough to close the loop quickly?

### Notable UI patterns
Policy editor (custom-group picker → Define Rules → Audit/Quarantine action → Alert Users → Configure Notifications → Create); per-policy Status dashboard with Modify/Suspend/Delete; alert message + grace-period composer.

---

## 3. PM lens

### Value proposition & outcomes
- **Containment, not just detection** — turns vulnerability findings into an enforced gate: a risky endpoint cannot become the breach pivot because it loses network reach.
- **Zero-trust posture for managed Windows fleets** — only compliant endpoints touch corporate data, complementing identity-based controls.
- **Automated, continuous enforcement** — replaces periodic manual audits with always-on rules, reducing dwell time of non-compliant machines.

### Target personas & use cases
- **SecOps / security analyst** — quarantine repeat offenders and high-CVSS-exposed hosts; enforce AV/firewall service running.
- **IT administrator** — enforce a patch-currency SLA (OS patches within N days) and block prohibited software.
- **Compliance officer** — demonstrate continuous, automated enforcement of an organizational baseline.
- Use cases: isolate unpatched/zero-day-exposed hosts, enforce AV/EDR service presence, block P2P/EOL software, gate access by registry/file posture (e.g., disk-encryption marker present).

### Positioning & differentiators
- **Find AND fence** from one console — unlike scan-only VM tools, EC can quarantine and then remediate the same endpoint through the shared patch/agent pipeline, with the agent channel preserved for recovery.
- Tight coupling to Patch Management and Vulnerability Management means rules reference live patch/vulnerability state, not a separate inventory.

### Edition gating
- Positioned within Endpoint Central **Security edition** (and standalone Vulnerability Manager Plus). NAC/System Quarantine is **Windows-only** today. (Edition gating inferred from ManageEngine packaging.)

### Expansion opportunities (analysis)
- **macOS / Linux quarantine** — current Windows-only scope is the obvious parity gap. *(inferred)*
- **Identity/ZTNA convergence** — pair posture-based quarantine with [Secure Private Access](secure-private-access.md) so a non-compliant device is denied application access, not just LAN access. *(inferred)*
- **Adaptive/graduated quarantine** — escalate restriction level the longer a device stays non-compliant. *(inferred)*
- **Self-service remediation portal** — let the quarantined user trigger the fix (e.g., install the patch via the Self-Service Portal) during the grace period. *(inferred)*
- **CISA KEV / exploit-aware rules** — auto-tighten when a vulnerability becomes actively exploited. *(inferred)*

---

## 4. Developer / Technical lens

### Mechanics & components
- **EC Server** holds the System Quarantine Policy definitions and pushes them to scoped agents; the policy is evaluated against the same vulnerability/patch/inventory data the EC agent already collects.
- **EC Agent (Windows)** enforces the network restriction locally (host-level filtering of network access while keeping the EC component channel open) and reports compliance status back to the server. (Enforcement is implemented at the endpoint by the agent rather than at switch/802.1X layer — inferred from the "except for the components of Endpoint Central" carve-out.)
- **Evaluation cadence** — rules are assessed on the agent's normal scan/refresh cycle (shared with the patch/vulnerability scan; agent contacts server roughly every 90 minutes). (inferred — shares VM/Patch scan model.)
- **Remediation path** — fixes route through Patch Management (manual/APD) and EC configurations/scripts; on next evaluation the agent lifts quarantine.

### Ports / protocols / limits (mark inferred)
- Inherits EC server-agent ports: **8383** (agent-server + console), **8027** (on-demand tasks), **443** (server ↔ central DB). *(inferred — shared with the platform.)*
- Quarantine enforcement is host-based; it requires a functioning EC agent on the endpoint (a device with a dead agent cannot be evaluated or quarantined). *(inferred limitation.)*
- **Windows-only**; no macOS/Linux enforcement today.
- The agent's own communication channel is always exempted from "Block all network access" so remediation can proceed.

### Data model / key objects (inferred naming)
SystemQuarantinePolicy (custom-group target, rule set, action=Audit|Quarantine, restriction type, alert message, grace period, notification config, status), ComplianceRule (OS-patch | Software | Service | Vulnerability | Registry/File), ComplianceResult per endpoint.

---

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Policy created but no systems evaluated | Custom group empty/wrong; agent not reporting; scan not yet run | Verify the custom group membership and agent live status; allow a scan/refresh cycle; confirm last-scan time. |
| Quarantine isolated a system that needed access | Rule too aggressive or restriction too strict ("Block all") | Modify/Suspend the policy; switch to "Allow access only to custom IP/VPN/Domains"; use Audit first; remediate the failing rule. |
| Quarantined device can't be reached to fix it | Misconception — EC component channel is always exempt | Remediate via EC (patch/config/script) over the preserved agent channel; the device collects the fix on next refresh. |
| Device stays quarantined after fixing | Endpoint not yet re-evaluated; fix didn't fully satisfy the rule | Wait for the next scan/refresh; re-check the exact failing rule (e.g., patch installed but reboot pending) in the Status view. |
| End user surprised by isolation | Grace period too short or alert message unclear | Increase the grace period; clarify the alert message with self-remediation steps; enable notifications. |
| Notifications not received | Notifications not enabled or wrong email | Under Configure Notifications, enable and set a valid email. |
| Non-compliant device never quarantined | Policy set to **Audit** only | Change execution option to **Quarantine** with the appropriate restriction level. |

### FAQs
- **Does the user lose all connectivity when quarantined?** Only per the chosen restriction; even "Block all network access" preserves the Endpoint Central component channel for remediation.
- **Which platforms are supported?** Windows.
- **How does a device get out of quarantine?** Fix the failing rule (patch/software/service/vulnerability/registry-file); the agent re-evaluates and lifts the restriction automatically.
- **Should I quarantine immediately?** Best practice is to run **Audit** first to understand impact, then apply **Quarantine** with the least-restrictive rule that still protects the network. *(inferred best practice.)*

---

## Cross-references
- [vulnerability-management.md](vulnerability-management.md) — parent module; NAC/System Quarantine lives under Threats & Patches → Compliance; rules reference live vulnerability/CVSS/exploit data.
- [patch-management.md](patch-management.md) — primary remediation path for the OS-patch and vulnerability rules that trigger quarantine.
- [secure-private-access.md](secure-private-access.md) — complementary identity/ZTNA-style access control; NAC fences at the network layer, SPA at the application layer.

## Sources
- Quarantine Compliance (NAC) — https://www.manageengine.com/products/desktop-central/network-isolation.html (redirects to) https://www.manageengine.com/products/desktop-central/help/vulnerability-remediation/quarantine-compliance.html
- Vulnerability Management Overview — https://www.manageengine.com/products/desktop-central/vulnerability-management.html
- VM FAQ — https://www.manageengine.com/products/desktop-central/help/vulnerability-remediation/vulnerability-faq.html

*Items marked "(inferred)" are reasoned conclusions not stated verbatim on the cited pages.*
