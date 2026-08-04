# Endpoint Intelligence / Digital Employee Experience (DEX)

> Endpoint Central's Endpoint Intelligence module delivers Digital Employee Experience (DEX): it continuously collects real-time endpoint telemetry, analyzes it against configurable performance-metric rules, computes per-endpoint and network-level **Experience Scores**, compares them against an admin-defined **Baseline Score**, surfaces fix guidance, and (paired with remediation scripts/workflows) turns UEM from reactive device management into proactive experience management. The capability is documented in the Endpoint Central online help under **General Settings → Digital Employee Experience** (`help/insights.html`) and is marked "Applicable For Endpoint Central / MSP." Edition gating is not published on the help page (inferred to be Enterprise / a DEX add-on — verify against the edition-comparison matrix).

## 1. What it is — Feature detail

### Purpose and console location
DEX (Digital Employee Experience) is the practice of continuously measuring and improving how employees experience their digital workplace by combining **endpoint telemetry, analytics, scoring, and remediation**. In Endpoint Central it is the experience-intelligence layer that sits on top of traditional UEM (which manages, patches, and secures devices) and answers not just "is the device up?" but "is the device delivering a good experience to the user, and if not, why — and can we fix it?"

Per the official help, Endpoint Central "collects real time events from your endpoints and posts it to the central server. The data collected will be analyzed in the form of metrics configured to determine the experience and performance of your endpoints. Endpoint Central will refine the telemetry data and share insights on how to fix the device performance issues reported."

**Console navigation paths (from the help):**
- **`DEX` (top-level module / dashboard)** — the DEX home page presents experience insights and the device-level view. Navigate to **`DEX > Devices`** and select a device to view the events reported for that particular endpoint.
- **`DEX > Settings`** — where the performance-metric rules are configured and customized, and where the network Baseline Score is set.
- Positioning: "From Endpoint Management to Experience Management" — moves IT from reactive support to proactive, outcome-driven operations.

> Note on naming: marketing materials call the module "Endpoint Intelligence" / "DEX"; the agent component is referred to in the KB as the **Endpoint Analytics agent** (the troubleshooting article URL is `troubleshooting-endpoint-analytics-agent.html`). DEX components run as binaries alongside the standard Endpoint Central agent.

### How DEX works (end-to-end, from the help)
1. The agent **collects real-time events** from each endpoint.
2. Events are **posted to the central server** through telemetry on a regular cadence.
3. The server **analyzes** the telemetry against the **metrics configured** in `DEX > Settings`.
4. The platform **refines** the telemetry and **shares insights** / fix guidance for reported device-performance issues.
5. Metrics drive the calculation of an **Endpoint Experience Score** at both the **endpoint level** and **network level**.
6. The score is compared to the **Baseline Score**; when an endpoint's score falls below the baseline, it signals an unhealthy experience needing immediate attention.

### Full capability breakdown

**A. Experience Monitoring — performance metrics (telemetry collection)**
Metrics are configured under **`DEX > Settings`** and are grouped into **four categories**. These are the officially documented metric families and their members:

| Category | Metrics (from the help) |
| --- | --- |
| **Endpoint Performance** | Free Disk Space; Free Disk Space (OS Drive); CPU Usage; CPU Interrupt; Memory Usage; Memory Swap Rate; Memory Swap Size; GPU Usage; Disk Queue Length; Wi-Fi Signal Strength; Wi-Fi Receive Rate; Wi-Fi Transmit Rate; Network Output Queue Length |
| **Endpoint Reliability** | Battery Health; Warranty; Device Age; Hard Reset; System Crash |
| **Endpoint Responsiveness** | Boot Time; Extended Logon Time; Max Input Delay |
| **Application Reliability** | Application crash details |

"The details of these metrics will be posted to the central server regularly through telemetry." Each metric can be **customized** (e.g., a rule for "free disk space less than 10 GB") so that the score is reduced when the threshold is breached.

**B. Endpoint Experience Scoring**
- The **Experience Score** is an indicator of the quality of an endpoint's experience, calculated from the **status of the metrics**.
- Example from the help: when a rule is set to score against "free disk space less than 10 GB," the score is reduced when free disk space falls below 10 GB; likewise the score is calculated across all hardware indicators and application crashes.
- The score is computed at **both network level and endpoint level**.
- To inspect the underlying events for an endpoint: **`DEX > Devices`** → select the device.

**C. Baseline Scoring**
- The **Baseline Score** is the minimum acceptable score assigned to the endpoint network.
- IT administrators **configure the baseline for their network based on business requirements**.
- When an endpoint's Experience Score **falls below** the baseline, it indicates an unhealthy experience needing attention. The baseline is the trigger boundary for prioritizing remediation.

**D. Root Cause Analysis (RCA)** *(positioned on the product/marketing page; detail not enumerated in the help text)*
- Goes beyond alerts to diagnose the **"why"** behind issues.
- **Correlates telemetry across devices, device models, and applications** to find common causes (e.g., a specific app version or hardware model driving crashes/slowdowns).
- **Smart grouping and prioritization** so IT resolves the highest-impact issues first.

**E. Automated Remediation Workflows** *(product page)*
- Two modes: (1) **standalone remediation scripts** for quick fixes, and (2) **no-code troubleshooting workflows** that detect and remediate problems automatically across thousands of endpoints.
- Workflows can be triggered by detected conditions (login delays, app crashes, high CPU) and fix issues in real time. (inferred) Remediation likely rides Endpoint Central's existing Custom Script / configuration rails — see `configuration-management.md`.

**F. Extensible Action Library** *(product page)*
- A library of **pre-built collectors, remediation scripts, workflows, and dashboards** that admins can use as-is or extend.

### Example end-to-end use case (from the product page)
A critical business app slows down for a department. Traditional monitoring flags high CPU but stops there. With DEX: telemetry correlates the spikes to **specific device models and app versions** → RCA surfaces the **root cause** → an automated remediation workflow fixes it **fleet-wide** — before users notice or raise tickets.

### Supported OS / platforms / coverage
- Metrics enumerated in the help (boot time, logon time, battery health, Wi-Fi rates, GPU, system crash, app crash) align with **Windows endpoints** primarily; the troubleshooting KB references Windows Event Viewer logs explicitly. macOS/Linux coverage **(inferred / to verify)**.
- Coverage scope: "thousands of endpoints"; integrated with the broader Endpoint Central platform.

### Prerequisites and key concepts
- **Endpoint Central agent + DEX/Endpoint Analytics component binaries** on the endpoint as telemetry collector (and remediation executor — inferred). The DEX component is installed/upgraded alongside the agent and depends on agent-server connectivity.
- **Agent-to-server (or Distribution Server) connectivity** is a hard prerequisite — telemetry posting and DEX component install/upgrade both fail without it.
- **Metric rules configured** in `DEX > Settings` and a **Baseline Score** set for the network — without these, scores are not meaningful.
- Terminology: **Telemetry** (raw CPU/memory/GPU/disk/battery/boot/logon/crash signals); **performance metric / rule** (threshold definition per metric); **Experience Score** (network- and endpoint-level health indicator); **Baseline Score** (minimum acceptable network score); **RCA correlation**; **remediation workflow / collector / Action Library item**.

## 2. UX lens

### Primary user roles & jobs-to-be-done
- **IT Operations / Desktop engineering** — proactively detect and fix endpoint friction before tickets pile up.
- **Service desk** — faster diagnosis (RCA) and fewer repetitive tickets via auto-remediation.
- **IT leadership / End-user computing strategy** — track experience scores by department/location to plan refresh cycles and app rollouts.
- **Automation engineer** — build/extend collectors, scripts, and no-code workflows in the Action Library.
- **End user (indirect)** — experiences fewer disruptions, faster responses, smoother interactions.

### Key workflows (step by step)

**Workflow 1 — Set up DEX monitoring (configure performance metrics):**
1. Navigate to **`DEX > Settings`**.
2. Review the four metric categories: **Endpoint Performance, Endpoint Reliability, Endpoint Responsiveness, Application Reliability**.
3. **Customize the available metrics** — e.g., set "Free Disk Space (OS Drive)" rule threshold, CPU Usage threshold, Boot Time threshold, Extended Logon Time threshold, etc., to match what "good" means in your environment.
4. Save the rules. The agent begins posting these metrics through telemetry on its regular cadence.

**Workflow 2 — Configure the Experience Score baseline:**
1. In **`DEX > Settings`**, locate the Baseline Score configuration.
2. Set the **minimum acceptable score** for the network based on business requirements.
3. Endpoints whose score later drops below this baseline are flagged as unhealthy.

**Workflow 3 — Monitor and diagnose a specific endpoint:**
1. Open the **`DEX`** dashboard to view network-level experience posture.
2. Navigate to **`DEX > Devices`**.
3. Select the affected device to **view the events reported** for that endpoint (the raw signals behind its score).
4. Read the insights / fix guidance the platform shares for the reported issue.

**Workflow 4 — Remediation (script or no-code workflow):** *(product-page capability)*
1. From the flagged issue / RCA finding, choose a **standalone remediation script** for a quick fix, or build/trigger a **no-code workflow** to auto-fix across many endpoints.
2. (Recommended, inferred) Pilot on a small target group, confirm score recovery, then widen scope.

**Workflow 5 — Benchmark and plan:**
1. Compare endpoint/network scores against the baseline over time.
2. Identify underperformers → feed hardware **upgrade/refresh** and **app-rollout** decisions (correlate with `it-asset-management.md` warranty/device-age data).

### UX research hooks / friction points
- **Threshold tuning** — configurable per-metric rules risk alert fatigue or missed issues; opportunity for adaptive/AI baselines rather than static thresholds.
- **Score interpretability** — a single Experience Score per device/network must map to clear next steps; the per-device event drill-down (`DEX > Devices`) is the key explainability surface.
- **Baseline-setting cold start** — admins must pick a baseline "based on business requirements" with little initial data; opportunity for a recommended baseline derived from the fleet's own distribution.
- **Trust in automation** — auto-remediating across thousands of endpoints raises blast-radius concerns; UX needs staging, dry-run, scoping, approval gates, audit, and rollback.
- **Telemetry overhead transparency** — admins may worry about agent CPU/network cost of "real time events"; surface collector cost.

### Notable UI patterns/components
- **DEX home dashboard** (network experience tiles/trends).
- **`DEX > Devices`** list + per-device event drill-down.
- **`DEX > Settings`** metric-rule editor grouped by the four categories, plus Baseline Score control.
- RCA correlation/grouping views; no-code workflow builder; Action Library catalog (product page).

## 3. PM lens

### Value proposition & business outcomes
- **Uncover hidden friction** — detect silent degradations (boot/logon delays, recurring app crashes, low disk, poor Wi-Fi) before they're reported.
- **Quantify experience** — Experience Score + Baseline give IT a single, trackable health KPI per device and per network.
- **Reduce ticket volumes** — catch and (with remediation) auto-resolve common issues.
- **Smarter planning** — Endpoint Reliability metrics (Warranty, Device Age, Battery Health) directly inform refresh cycles.
- Strategic narrative: turns the existing UEM install base into a proactive, experience-driven platform — a differentiated upsell.

### Target personas & use cases
- Enterprises with hybrid/digital-first workforces where productivity hinges on device/app performance; IT orgs drowning in reactive tickets; EUC teams planning hardware refresh and app rollouts.

### Competitive positioning / differentiators
- **Unified platform** — DEX, management, and security in one product (vs standalone DEX tools like Nexthink, ControlUp, 1E/Tachyon, Lakeside). Single agent, single console.
- Combines telemetry + scoring/baseline + RCA + remediation + extensible Action Library, not just dashboards.
- Reliability metrics tie experience directly to ITAM (warranty/age) for refresh decisions.

### Edition gating & packaging
- Not stated on the help page (page is tagged "Applicable For Endpoint Central / MSP"). **(Inferred)**: likely Enterprise-tier or a DEX add-on/module, possibly metered by endpoint count. Verify against the edition-comparison matrix and any DEX-specific licensing.

### Product expansion opportunities / gaps (analysis)
- **Explicit OS coverage matrix** — publish Windows/macOS/Linux metric parity clearly.
- **AI/ML baselines & anomaly detection** — replace static per-metric thresholds; predictive issue forecasting, explainable.
- **Recommended baseline** — auto-suggest a Baseline Score from the fleet's score distribution to solve the cold-start problem.
- **Sentiment / experience surveys** — blend objective telemetry with lightweight in-agent user sentiment (a common gap vs mature DEX tools).
- **SaaS/network/application-path telemetry** — extend beyond device metrics to network latency and SaaS responsiveness.
- **Closed-loop with ITSM** — auto-create/auto-resolve tickets and write RCA findings back to ServiceDesk Plus.
- **Remediation governance** — change-control, maintenance windows, staged rollout rings, rollback.

## 4. Developer / Technical lens

### Architecture & components
- **Agent + DEX/Endpoint Analytics component binaries** on endpoints gather real-time events and post telemetry to the server (and run remediation — inferred). The DEX component is a separate set of binaries installed/upgraded with the agent; the KB documents their install/upgrade and runtime-crash failure modes.
- **Server / analytics layer** ingests telemetry, evaluates it against configured metric rules, computes per-endpoint and network Experience Scores, compares to the Baseline Score, and surfaces fix insights.
- **Distribution Server** participates in agent/DEX-component delivery in remote-office topologies (the KB lists "unable to reach Endpoint Central Server / Distribution Server" as a primary failure cause).
- **Action Library** — repository of pre-built and custom collectors, scripts, workflows, dashboards (product page).

### Agent mechanics
- **Telemetry collection:** the agent collects real-time events for the configured metrics and posts them to the central server "regularly" (exact cadence not published — inferred interval-based).
- **Scoring:** server-side, rule-driven; status of each metric reduces/maintains the Experience Score; aggregated to network level.
- **Baseline comparison:** server flags endpoints below the configured Baseline Score.
- **Remediation:** standalone scripts (quick fix) or no-code workflows (condition-triggered, fleet-scale) — product page.

### Ports, protocols, integrations, APIs (inferred unless noted)
- Agent↔server / agent↔Distribution Server over the existing Endpoint Central agent communication channels (HTTPS). Connectivity failure blocks both telemetry and DEX-component install/upgrade (KB-confirmed dependency).
- Reuses Endpoint Central's script/custom-script and deployment infrastructure for remediation (*inferred*).
- REST API for telemetry export / workflow automation (*inferred* — confirm against the API Explorer).

### Data model / key objects (inferred naming unless from help)
- `PerformanceMetric` (per the four documented categories), `MetricRule`/`Threshold`, `ExperienceScore` (endpoint + network — from help), `BaselineScore` (from help), `DeviceEvent` (viewable under `DEX > Devices` — from help), `RCAFinding`, `RemediationScript`, `RemediationWorkflow`, `Collector`, `ActionLibraryItem`.

### Technical limitations
- Published metric set is Windows-centric; macOS/Linux parity unspecified.
- Telemetry sampling cadence, retention, and agent resource cost are not documented publicly.
- "Predictive"/RCA capabilities are described on the product page but not detailed in the help.
- Fleet-scale automated remediation carries blast-radius risk without strong staging/rollback.

## 5. Support / Troubleshooting lens

### Symptom → Cause → Fix (DEX component & data issues)

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| **DEX agent install/upgrade fails** | Agent cannot reach the Endpoint Central Server / Distribution Server (network connectivity). | Verify connectivity per the **Agent-Server Communication Failure** KB (`agent_communication_failure.html`); confirm firewall/proxy allows the agent ports; resolve DNS/routing to server. |
| **DEX install/upgrade fails; binaries removed or "access denied"** | Antivirus / security software flags and removes installation files, or blocks access to File/Folder, Registry, or Services. | Add Endpoint Central agent + DEX binaries to AV exclusions. Collect for support: agent logs, the AV log entries showing binary removal/access denial, and error screenshots; upload via the documented log-upload steps (`logs-how-to.html`). |
| **DEX component crashes at runtime / metrics stop posting** | One or more DEX component binaries crashed during runtime. | Upload **agent logs** and **Windows Event Viewer → Application** logs to support via the log-upload procedure; restart agent service; reinstall DEX component if crashes recur. |
| **No telemetry / stale metrics for an endpoint** | Agent or DEX component not running, or no server connectivity, so events aren't posted. | Confirm agent + DEX binaries running; verify server/Distribution-Server reachability; check the device under `DEX > Devices` for last-reported events. |
| **Experience Score looks wrong / always 100 or always low** | Metric rules not configured (or thresholds set incorrectly) in `DEX > Settings`; or insufficient telemetry. | Open `DEX > Settings`, review/tune each metric rule across the four categories; ensure relevant metrics are enabled; allow time for telemetry to accumulate. |
| **No endpoints ever flagged as unhealthy** | Baseline Score not set, or set too low. | Set/raise the **Baseline Score** in `DEX > Settings` to a value meaningful for the network. |
| **Too many endpoints flagged** | Baseline too high or thresholds too strict. | Re-tune metric thresholds and/or lower the Baseline Score to match real business requirements. |
| **Remediation workflow didn't fix / over-fired** | Trigger conditions too broad; script success criteria wrong; wrong Action Library version. | Scope triggers tightly, pilot on a small group, confirm script exit/success criteria, review the Action Library item version (inferred). |

### Diagnostics
- **Per-device events:** `DEX > Devices` → select device (the authoritative view of what the score is based on).
- **Logs:** agent logs; Windows Event Viewer → Application; upload to support via `logs-how-to.html`.
- **Connectivity:** validate against the agent-server communication-failure KB before deeper DEX debugging — most install/upgrade failures are connectivity or AV-related.

### FAQs (from the product/help pages)
- *How does DEX work?* The agent collects real-time events, posts them to the central server, the server analyzes them against configured metrics, refines telemetry, shares fix insights, and computes Experience Scores vs the Baseline.
- *Where do I configure metrics?* `DEX > Settings` — four categories: Endpoint Performance, Endpoint Reliability, Endpoint Responsiveness, Application Reliability.
- *What is the Experience Score?* A health indicator computed from metric status, at both network and endpoint level; drill into a device via `DEX > Devices`.
- *What is the Baseline Score?* The admin-set minimum acceptable score; falling below it signals an unhealthy experience.
- *Why did DEX install fail?* Most commonly server/Distribution-Server connectivity, or AV blocking/removing binaries (see the troubleshooting table).

### Useful KB / help references
- DEX / Endpoint Intelligence help (metrics, scoring, baseline): https://www.manageengine.com/products/desktop-central/help/insights.html
- Troubleshooting DEX component install/upgrade & failures: https://www.manageengine.com/products/desktop-central/kb/troubleshooting-endpoint-analytics-agent.html
- Agent-Server communication failure: https://www.manageengine.com/products/desktop-central/agent_communication_failure.html
- Steps to upload logs: https://www.manageengine.com/products/desktop-central/logs-how-to.html
- DEX / Endpoint Intelligence product overview: https://www.manageengine.com/products/desktop-central/endpoint-intelligence.html

## Cross-references
- [it-asset-management.md](it-asset-management.md) — DEX Endpoint Reliability metrics (Warranty, Device Age, Battery Health) consume ITAM data; asset age + warranty + experience score together drive refresh decisions.
- [configuration-management.md](configuration-management.md) — remediation reuses the Custom Script / configuration rails; DEX detects post-change regressions.
- [software-deployment.md](software-deployment.md) — DEX Application Reliability detects post-deployment app-crash regressions and can prioritize rollouts by real user need.

## Sources
- https://www.manageengine.com/products/desktop-central/help/insights.html
- https://www.manageengine.com/products/desktop-central/kb/troubleshooting-endpoint-analytics-agent.html
- https://www.manageengine.com/products/desktop-central/agent_communication_failure.html
- https://www.manageengine.com/products/desktop-central/logs-how-to.html
- https://www.manageengine.com/products/desktop-central/endpoint-intelligence.html

*Note: Items marked "(inferred)" are reasoned conclusions not stated verbatim on the cited pages.*

---

## Appendix A — Settings / options reference (`DEX > Settings`)

The following options are configurable from the DEX Settings area (consolidated from the help and from standard Endpoint Central settings behavior; items not explicitly enumerated on the help page are marked inferred):

| Setting | Where | What it controls |
| --- | --- | --- |
| **Metric rules — Endpoint Performance** | `DEX > Settings` | Per-metric thresholds for Free Disk Space, Free Disk Space (OS Drive), CPU Usage, CPU Interrupt, Memory Usage, Memory Swap Rate, Memory Swap Size, GPU Usage, Disk Queue Length, Wi-Fi Signal Strength, Wi-Fi Receive/Transmit Rate, Network Output Queue Length. |
| **Metric rules — Endpoint Reliability** | `DEX > Settings` | Thresholds/weighting for Battery Health, Warranty, Device Age, Hard Reset, System Crash. |
| **Metric rules — Endpoint Responsiveness** | `DEX > Settings` | Thresholds for Boot Time, Extended Logon Time, Max Input Delay. |
| **Metric rules — Application Reliability** | `DEX > Settings` | Application-crash tracking. |
| **Baseline Score** | `DEX > Settings` | The network-wide minimum acceptable Experience Score; endpoints below it are flagged. |
| **Enable/disable a metric** | `DEX > Settings` (inferred) | Whether a given metric contributes to the score. |
| **Telemetry posting cadence** | server/agent (not published — inferred) | How often the agent posts collected events. |

### Recommended setup order (best practice, inferred)
1. Confirm agent + DEX component health and connectivity on a pilot group.
2. Enable and tune metric rules per the four categories in `DEX > Settings`, starting with the metrics most relevant to your fleet (e.g., Boot Time, Free Disk Space, System Crash, Application crashes).
3. Let telemetry accumulate for a representative period.
4. Inspect the score distribution under the `DEX` dashboard and `DEX > Devices`.
5. Set the **Baseline Score** so that genuinely unhealthy endpoints (not the whole fleet) fall below it.
6. Iterate on thresholds to control flag volume, then layer remediation scripts/workflows for the most common root causes.

## Appendix B — Prerequisites checklist
- [ ] Endpoint Central agent installed and checking in on each target.
- [ ] DEX / Endpoint Analytics component binaries installed (delivered/upgraded with the agent).
- [ ] Agent able to reach the Endpoint Central Server **or** Distribution Server (firewall/proxy/DNS clear).
- [ ] Antivirus exclusions for agent + DEX binaries (prevents binary removal / access-denied install failures).
- [ ] Metric rules configured in `DEX > Settings`.
- [ ] Baseline Score set for the network.
- [ ] (For remediation) Custom Script / configuration rails available and tested — see `configuration-management.md`.
