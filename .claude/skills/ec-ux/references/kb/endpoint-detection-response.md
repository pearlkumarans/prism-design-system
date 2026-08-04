# Endpoint Detection and Response (EDR)

> An endpoint security framework in ManageEngine Endpoint Central that combines **preventive, detective, investigative, and responsive** capabilities so security teams can see deeper into endpoint activity, investigate suspicious behavior with context, and respond before a threat progresses. Per the official help documentation, Endpoint Central's EDR is delivered as a **unified framework that combines Malware Protection, Ransomware Protection, and Threat Hunting** within a single console. It is built on an **assume-breach mindset** — covering the threats that slip past preventive controls — and is powered by the **existing Endpoint Central agent** (no separate EDR agent). EDR/Threat-Hunting and the Zia AI surfaces are positioned as **Cloud-first / Cloud-only capabilities** for the deeper analytics (inferred from ManageEngine's Cloud-led security packaging; confirm exact gating with the edition matrix). Console help is also surfaced for **Endpoint Central MSP**.

---

## 1. What it is — Feature detail

### Purpose and console placement

Endpoint Central EDR exists because modern attacks rely on **stealth, persistence, and a sequence of suspicious actions** rather than a single recognizable malware artifact. Traditional, prevention-only endpoint protection is effective against many *known* threats, but evasive, behavior-driven attacks — suspicious process execution, abnormal file behavior, unauthorized system changes, low-and-slow techniques that unfold over time — frequently do not trip preventive controls. EDR's job is to give **deeper visibility** into endpoint events, let analysts **investigate with context**, and **respond with confidence**.

Its core differentiator remains **endpoint security enhanced by endpoint management**: a threat traced to an unpatched vulnerability can be patched directly from the same platform (Patch Management), and an attack via an unauthorized USB can be blocked via Device Control — closing the loop that standalone EDR products cannot.

**Navigation (console paths — partly inferred from help structure):**
- **EDR / Security workspace** is reached from the main Endpoint Central console under the security/threats area. The unified framework groups **Malware Protection**, **Ransomware Protection**, and **Threat Hunting**.
- **Incidents** tab — central list of detections grouped into incidents; drill into an incident to see its **Alerts** tab (where, for example, the **Behavior Type** of a Behavior-Detection-Engine alert is shown).
- **Threat Hunting** — query interface over endpoint event logs for proactive investigation; validated queries can be saved for **recurring detection**.
- **Settings → Exclusion** — manage the Exclusion List (false-positive suppression; see §"Settings / options reference").
- **Anti-Ransomware tab → Settings** — enable/disable Ransomware Protection and configure its behavior (see the companion NGAV & Anti-Ransomware KB file).
- The marketing-side product pages live at `/endpoint-detection-and-response.html` and `/endpoint-detection-and-response-edr.html`; the canonical help overview is `/help/edr/edr-overview.html`.

### What Endpoint Central's EDR offers (from the official overview)

- **Integrated endpoint security** — combines Malware Protection, Ransomware Protection, and Threat Hunting in one framework.
- **Deeper endpoint visibility** — visibility into endpoint events and activities so teams can analyze suspicious behavior across managed devices.
- **Threat detection and prevention** — identify and block malicious files, suspicious threats, and ransomware-related activity.
- **Proactive threat investigation** — investigate suspicious activity and uncover threats that may not have triggered automated detections.
- **Threat Hunting** — query endpoint event logs, identify unusual patterns, and validate suspicious activity through deeper analysis.
- **Alert-based follow-up** — convert suspicious findings into alerts for immediate attention.
- **Recurring detection workflows** — reuse validated conditions for repeated monitoring so similar suspicious activity is detected again.
- **Incident-oriented response** — link alerts and detections to incident investigation workflows.
- **Centralized security operations** — investigate and respond from a unified console.

### How EDR works — the three pillars (detection → investigation → response)

EDR moves an organization from a **purely preventive** posture to an **investigation-driven** model.

**1) Real-time threat detection ("detection is awareness")**
- **Real-time endpoint visibility:** the agent records activity across multiple dimensions — users, endpoints, files, processes, and networks. Detection engines (see "Detection internals") evaluate that telemetry against **behavioral analytics, Indicators of Attack (IoAs), Indicators of Compromise (IoCs), and the MITRE ATT&CK framework** to distinguish normal from suspicious behavior. Rather than viewing events in isolation, EDR **connects them into a sequence**, spotting malicious behavior before it escalates.
- **Searchable endpoint data / Threat Hunting:** analysts can query endpoint event logs to find unusual patterns. **Zia AI-driven incident search** lets analysts hunt in plain (natural) language (Cloud; inferred for the AI tier). **Custom / saved conditions** let teams define suspicious behaviors and reuse them for **recurring detection**.
- **Threat Intelligence integration:** a built-in Threat Intelligence database (updated as the landscape evolves) plus support for **third-party threat-intel / IoC feeds** for known malicious hashes and URLs.

**2) AI-powered threat investigation (solving alert fatigue)**
- **Zia AI triage/prioritization (Cloud):** sorts alerts by criticality, potential risk, and time sensitivity, surfacing the most important alert first — countering the alert fatigue that causes missed, time-sensitive attacks in high-volume environments.
- **Attack-timeline reconstruction (Zia, Cloud):** reconstructs the complete attack timeline from initial point of entry to furthest point of impact; identifies **root cause**, maps current progression, and provides **severity, true-positive confirmation, threat summary, and recommended remediation**.

**3) Containment and response ("response determines what it costs you")**
- **Network containment / isolation:** isolate a compromised endpoint, cutting off lateral movement before the threat spreads.
- **Neutralize the attack:** remove malicious files / terminate malicious processes so they cannot re-execute.
- **Data restoration / rollback:** single-click restoration of enterprise data after ransomware/extortion (uses VSS-based shadow copies and a tamper-proof backup; see companion Anti-Ransomware KB).

### Supported OS / platforms / coverage

- The deeper detection engines (Behavior Detection, Ransomware Detection, Exfiltration Detection) and the rollback subsystem are **Windows-focused**, consistent with the NGAV (Windows 8/8.1/10/11) and Anti-Ransomware (Windows 8/8.1/10/11) support matrices. Broader OS inventory/management coverage is inherited from the Endpoint Central agent (Windows/Mac/Linux), but EDR-grade detection/response parity for macOS/Linux is **not documented** (inferred gap).
- Runs on the **existing Endpoint Central agent**. A published Gartner Peer Insights success story describes consolidating MDM + threat intelligence into one solution managing **~10,000 endpoints**.

### Prerequisites and key concepts

- **Existing Endpoint Central agent** — no separate EDR agent (consistent with the NGAV/Anti-Ransomware "no additional agent" model).
- **Cloud-only note (inferred):** Threat Hunting's advanced analytics and the **Zia AI** triage / natural-language search / timeline reconstruction are positioned as Cloud capabilities. On-premises customers should confirm which detection engines and AI surfaces are available in their build before relying on them.
- **Edition / add-on gating:** EDR is an advanced endpoint-security capability that goes beyond base UEM. Ransomware Protection (Anti-Ransomware module) is broadly available (including Free trial, build **11.1.2236.1+**); Malware Protection / NGAV detection is a **separate add-on** (not in the Security Edition standard license) and may require enabling an **Early Access program**. Confirm exact SKU/add-on status against the official edition-comparison matrix.
- **Key terms:** assume-breach, IoA, IoC, MITRE ATT&CK, TTPs, kill chain, behavioral analytics, Behavior/Ransomware/Exfiltration Detection Engines, Behavior Type, Threat Hunting, recurring detection, Zia AI, threat-intel feeds, network containment/isolation, neutralize, attack timeline, root-cause analysis, Exclusion List, true/false positive.

---

## 2. Step-by-step procedures

### Enabling EDR / its component modules

EDR is delivered as a framework over three building blocks. There is no single "install EDR" action; instead each capability is enabled and then operated from the unified console.

1. **Verify prerequisites:** the Endpoint Central agent is deployed to the target Windows endpoints; the build supports the modules you intend to use (Anti-Ransomware needs **11.1.2236.1+**); for the AI / Threat-Hunting tier, confirm you are on the Cloud tier or the build that exposes it (*inferred*).
2. **Enable Ransomware Protection:** **Anti-Ransomware tab → Settings → enable.** VSS shadow copies begin at the 3-hour cadence; the Ransomware Detection Engine starts monitoring.
3. **Enable Malware Protection (NGAV):** ensure the **add-on license** is present; if required, switch on the **Early Access program** so the NGAV detection surfaces appear; static+dynamic detection then runs out of the box.
4. **Use Threat Hunting:** open **Threat Hunting**, query endpoint event logs, validate suspicious patterns, then **save a validated condition** so it becomes a recurring detection.
5. **Confirm scope (MSP / RBAC):** technicians only see/act on endpoints within their assigned scope — relevant because CVE-2024-38868 specifically tightened scope-based access for isolate/de-isolate actions.

### Configuring detection & exclusions

See the full method reference in §"Settings / options reference." The short path: **Settings → Exclusion → Add Exclusion →** choose engine type(s) → choose method (prefer Signer Certificate or SHA-256) → for behavior alerts select the **Behavior Type** from the incident's Alerts tab → for Ransomware/Exfiltration engines optionally add **Allowed Folder(s)**.

### Responding to a detection (contain → quarantine → neutralize → rollback)

1. **Open the Incident** (alerts are auto-grouped into incidents listing the affected devices and files).
2. **Investigate** on the **Alerts** tab; in Cloud, let **Zia** reconstruct the entry→impact timeline, root cause, severity, and recommended remediation; note the **Behavior Type** for behavior-engine alerts.
3. **Classify** the incident **True Positive** or **False Positive**.
4. **Contain:** network-isolate the endpoint (cut lateral movement) — for ransomware, manually quarantine the device.
5. **Neutralize:** remove malicious files / terminate the malicious process so it cannot re-execute.
6. **Rollback / restore:** single-click restoration from VSS shadow copies (≤3h old) and the tamper-proof backup; a recurrence of the same attack restores automatically.
7. **Remediate root cause:** if the entry vector was an unpatched vulnerability, patch it from **Patch Management**; if it was an unauthorized USB, block it via **Device Control** — without leaving the platform.
8. **Tune:** for false positives, mark them so and add a precise Exclusion to stop recurrence.

### Settings / options reference

| Setting / option | Where | What it does |
|---|---|---|
| Anti-Ransomware enable/disable | Anti-Ransomware tab → Settings | Turns the Ransomware Detection Engine and 3-hourly VSS backup on/off |
| NGAV / Malware Protection | Security console (Early Access if required) | Enables static+dynamic malware detection (add-on) |
| Exclusion List | Settings → Exclusion | Suppresses false positives per engine and method |
| Engine type (exclusion) | Add Exclusion dialog | Behavior Detection Engine / Ransomware Detection Engine / Exfiltration Detection Engine / Select All |
| Exclusion method | Add Exclusion dialog | Signer Certificate (narrow) · SHA-256 (narrow) · Executable Path (broad, not recommended) · GLOB (broad) · Command-Line |
| Behavior Type | Incident → Alerts tab | Alert rule identifier required when excluding a Behavior-Detection-Engine alert |
| Allowed Folder(s) | Add Exclusion → Allowed Folder(s) tab | Excludes named folders from Ransomware/Exfiltration detection |
| Threat-intel feeds | Threat-intel configuration | Built-in DB + third-party IoC ingestion (hashes, URLs) |
| Recurring detection | Threat Hunting → save condition | Reuses a validated hunt query for ongoing monitoring |
| Alerting / incidents | Incidents | Auto-grouping of related alerts; conversion of findings to alerts |

### Kill-chain / MITRE ATT&CK walkthrough (how a detection maps)

When an engine flags anomalous behavior, EDR places it on the **kill chain** (e.g., initial access → execution → persistence → privilege escalation → defense evasion → lateral movement → impact) and tags it with MITRE **TTPs**. IoAs describe the in-progress technique (e.g., mass file encryption ≈ *Impact: Data Encrypted for Impact*), while IoCs (file hashes, URLs from threat-intel feeds) confirm known-bad artifacts. The timeline view stitches these into the entry→impact narrative so responders can see where to cut the chain (contain) and where the root cause sits (remediate).

---

## 3. UX lens

### Primary user roles & jobs-to-be-done

- **SOC analyst / threat hunter** — JTBD: find and investigate threats fast with minimal noise; hunt endpoint event logs (ideally in plain language); understand the full attack story before acting; save validated hunts for recurring detection.
- **Incident responder** — JTBD: contain, neutralize, and restore quickly to minimize impact; classify true vs. false positive correctly.
- **Security manager / CISO** — JTBD: confidence the "missed" threats are covered; clear severity and remediation guidance; audit trail via incidents.
- **IT admin (cross-functional)** — JTBD: remediate root causes (patch the unpatched vuln, block the USB) from the same console; manage the Exclusion List to reduce false positives without opening holes.
- **MSP technician** — JTBD: operate across multiple customer tenants within scope; help docs explicitly note applicability for Endpoint Central MSP.

### Key workflows / screen flows

1. **Detect → alert:** the agent records activity; a detection engine (Behavior / Ransomware / Exfiltration) raises an alert when activity matches indicators; alerts with the same pattern across devices are **auto-grouped into an Incident** with the list of devices and files involved.
2. **Triage with Zia (Cloud):** Zia prioritizes alerts; the most critical surfaces first.
3. **Investigate:** open the Incident → review the **Alerts** tab (including the **Behavior Type** for behavior-engine detections) → Zia reconstructs the attack timeline (entry → impact), root cause, severity, true/false-positive call, threat summary, recommended remediation.
4. **Hunt:** use Threat Hunting / Zia natural-language search across endpoint event data; save validated conditions for **recurring detection**.
5. **Respond:** network-contain (isolate) the endpoint → remove malicious files / terminate process → single-click data restoration → remediate root cause (patch / block device).
6. **Tune:** mark confirmed false positives and add them to the **Exclusion List** (Signer Certificate, SHA-256, Executable Path, GLOB, Command-Line, Behavior Type, or Allowed Folder) to prevent recurrence.

### UX research hooks / friction points to study

- **Alert fatigue** is the central problem EDR claims to solve — validate whether Zia prioritization actually reduces analyst cognitive load; measure time-to-triage.
- **Trust in AI triage/root-cause** — analysts may distrust AI severity calls; study explainability needs and override behavior.
- **Natural-language hunt expectations** — measure query success/failure and recovery from no-result searches.
- **Exclusion authoring risk** — choosing between Signer Certificate / SHA-256 (narrow) vs. Executable Path / GLOB (broad) has real security consequences; the help explicitly warns Executable Path is *not recommended* because ransomware may copy itself there. Study whether admins understand the narrow-vs-broad trade-off.
- **True/false-positive decisioning** — a wrong false-positive call auto-suppresses similar future events (including a real attack). Study confidence, evidence presented, and consequences of misclassification.
- **Containment confidence** — isolating an endpoint is disruptive; study hesitation, confirmation, and de-isolation expectations.
- **Cross-module handoff** — the "patch the root cause from here" promise spans EDR → Patch Management → Device Control; study whether the journey feels seamless.
- **MITRE / kill-chain literacy** — TTP and Behavior-Type views assume security expertise; study comprehension for generalist IT admins and MSP technicians.

### Notable UI patterns/components

- Unified security workspace grouping Malware Protection, Ransomware Protection, Threat Hunting; Incidents list with auto-grouping; Incident detail with **Alerts** tab and **Behavior Type**; attack-timeline visualization; Zia natural-language search bar; Threat-Hunting query builder with save-as-recurring-detection; containment / neutralize / restore action controls; threat-intel feed configuration; MITRE ATT&CK mapping views; **Settings → Exclusion** manager with engine-type and exclusion-method selectors.

---

## 4. PM lens

### Value proposition & measurable outcomes

- **Covers what prevention misses:** detects and neutralizes evasive, behavior-driven threats that preventive controls do not surface.
- **From information to solution:** "Most EDR solutions detect threats and hand you the information. Endpoint Central EDR hands you the solution" — root-cause remediation (patch, device control) is built in.
- **Performance:** the shared agent is lightweight (NGAV cited at **<1% CPU**); EDR adds telemetry recording without a heavy second agent.
- **Recovery:** continuous, tamper-proof backup enables **single-click** recovery of encrypted/stolen data — recover without paying the attacker.
- **Consolidation:** customer proof (Gartner Peer Insights) — consolidated MDM + threat intelligence into one solution managing ~10,000 endpoints.

### Target personas & use cases

- Enterprises with a SOC or lean security team facing alert volume.
- Organizations consolidating tools (MDM + EDR + UEM + patch) into one platform.
- MSPs operating multi-tenant security operations.
- Use cases: APT / zero-day / living-off-the-land detection, ransomware containment + recovery, threat hunting, insider / lateral-movement detection, data-exfiltration detection (Exfiltration Detection Engine).

### Competitive positioning / differentiators

- **EDR + endpoint management in one** — root-cause remediation (patch, device control) standalone EDR can't do.
- **Zia AI** for triage, natural-language hunting, and full attack-timeline reconstruction (Cloud).
- **Built-in + third-party threat intelligence.**
- **Single lightweight agent** shared with the rest of Endpoint Central.
- **Three purpose-built detection engines** (Behavior, Ransomware, Exfiltration) with per-engine exclusion granularity.

### Edition gating & packaging

- Advanced endpoint-security capability beyond base UEM; the AI / Threat-Hunting analytics tier is **Cloud-led** (inferred). Ransomware Protection is broadly available (incl. Free trial, build 11.1.2236.1+); NGAV / Malware Protection detection is a **separate add-on**, possibly behind an Early Access toggle. Confirm exact SKU/add-on status against the official edition-comparison matrix.

### Product expansion opportunities / gaps / roadmap ideas (analysis)

- **Configurable telemetry retention** for regulated / long-dwell-time investigations.
- **Automated response playbooks (SOAR-lite)** — conditional auto-contain / auto-remediate with approval gates.
- **Cross-endpoint correlation / org-wide attack graph** beyond single-endpoint timelines.
- **MITRE ATT&CK coverage dashboard** showing detection gaps per engine.
- **Managed Detection & Response (MDR)** service layered on top.
- **Explainable-AI surfaces** for Zia's severity/root-cause calls to build analyst trust.
- **macOS/Linux detection parity** for the deep engines (current gap).
- **Exclusion risk scoring** — warn when a Path/GLOB exclusion is dangerously broad.

---

## 5. Developer / Technical lens

### Architecture & components

- **Endpoint Central Agent** — records multi-dimensional activity (users, endpoints, files, processes, networks); hosts the on-device detection engines; executes containment / neutralization / restore. No separate EDR agent.
- **Detection engines (on agent + backend logic):**
  - **Behavior Detection Engine** — behavioral analytics with per-alert **Behavior Type** (an alert rule for precise behavior detection).
  - **Ransomware Detection Engine** — ML-assisted detection of the browse→encrypt→update file pattern; supports Allowed-Folder exclusions.
  - **Exfiltration Detection Engine** — detects data-exfiltration behavior; supports Allowed-Folder exclusions.
- **Endpoint Central Server / EDR backend** — stores endpoint telemetry, runs MITRE ATT&CK mapping, hosts the built-in Threat-Intelligence DB, powers Threat Hunting queries, and (Cloud) Zia AI triage / timeline reconstruction.
- **Zia AI (Cloud)** — triage/prioritization, natural-language incident search, attack-timeline + root-cause analysis.
- **Threat-intel subsystem** — built-in feed + third-party IoC ingestion (hashes, URLs).
- **Backup / rollback subsystem** — VSS shadow copies + patented tamper-proof backup store enabling single-click restoration.

### Detection internals (IoA/IoC, MITRE, kill chain, static vs dynamic, deep learning, telemetry, Zia)

- **IoA vs IoC:** EDR identifies both **Indicators of Attack** (behavioral, in-progress TTPs) and **Indicators of Compromise** (artifacts such as malicious file hashes and distribution URLs from threat-intel feeds).
- **MITRE ATT&CK & kill chain:** anomalous detections are examined within the **kill-chain framework** and mapped to MITRE **tactics, techniques, and procedures (TTPs)**; attack paths and techniques are charted to support precise response.
- **Static vs dynamic + deep learning:** the malware-protection layer blends **static** (pre-execution file analysis) and **dynamic** (runtime behavioral) detection, augmented by **AI-assisted behavioral analysis and deep-learning algorithms** that learn from past attacks to counter polymorphic and fileless malware (see NGAV KB for engine detail).
- **Telemetry retention:** EDR retains endpoint activity for historical/forensic context (commonly cited as ~30 days for the activity store; exact retention is build/edition-dependent — *inferred*, confirm in-product). Ransomware-recovery VSS shadow copies are taken **every 3 hours**.
- **Zia AI triage:** correlates and prioritizes alerts and reconstructs the entry→impact timeline; flags true/false positive and recommends remediation (Cloud).

### Agent mechanics

- Continuous real-time activity recording and behavioral analysis on the endpoint; works **online and offline** (native offline protection for the detection engines).
- Detection via IoA/IoC matching, Behavior-Type rules, and ATT&CK behavior models; saved hunt conditions evaluated for recurring detection.
- Response actions: network isolation, malicious-file removal / process termination (prevent re-execution), data restoration from tamper-proof backups.
- **Footprint:** shared lightweight agent (NGAV layer cited at <1% CPU).

### Ports, protocols, integrations, APIs

- Uses Endpoint Central agent↔server channels (specific ports not enumerated on the fetched pages — *inferred* to be the standard agent-communication/gateway ports). Outbound to threat-intel sources; ingestion endpoint for third-party IoC feeds.
- Integrates with **Patch Management** (root-cause patching), **Device Control** (block unauthorized USB), and the platform **API Explorer** (`/products/desktop-central/api/`). Helpdesk / Log360 / ServiceDesk Plus integrations exist at the platform level.

### Data model / key objects

- Activity record (user/endpoint/file/process/network), Alert (with Behavior Type), Incident (auto-grouped; lists devices + files), IoA, IoC (hash/URL), Threat-intel entry, Detection Engine (Behavior/Ransomware/Exfiltration), Attack timeline (entry→impact), Root-cause node, Backup snapshot (VSS, 3-hourly), Containment action, Exclusion entry (engine type + method).

### Technical limitations

- Telemetry/activity retention window may be insufficient for long-dwell investigations (configurable retention is a roadmap gap).
- Deepest detection/response capabilities are **Windows-focused**; macOS/Linux parity not documented.
- AI triage/root-cause decisions need analyst validation (true-positive confirmation is part of the flow).
- Up to **~3 hours** of file changes can be lost on VSS-based rollback (snapshot interval).
- Marking an incident false positive auto-suppresses similar future events — misclassification can hide a real attack.

---

## 6. Support / Troubleshooting lens

### Common issues & resolutions

- **Too many alerts / fatigue** — rely on Zia AI prioritization; mark confirmed benign detections false positive and add precise Exclusions to cut repeat noise.
- **Endpoint isolated but business-critical** — release from containment after confirming false positive; document via the incident.
- **False-positive recurrence** — add the process to the **Exclusion List** scoped by **Signer Certificate** (narrowest, requires valid signature) or **SHA-256**; avoid broad **Executable Path** exclusions.
- **A real attack got auto-suppressed** — a prior false-positive flag now masks a true positive; review/clear the offending Exclusion entry.
- **Data not recoverable** — verify VSS is running and backups are healthy; confirm the most recent 3-hour snapshot exists for the endpoint.
- **Component / engine failure** — confirm agent health and that the relevant Detection Engine (Behavior/Ransomware/Exfiltration) is enabled; for endpoint-analytics/DEX component issues see the DEX troubleshooting KB.

### AV exclusion list needs (mutual exclusions with third-party AV)

When Endpoint Central coexists with a third-party antivirus, the AV may interfere with agent/EDR operation. ManageEngine maintains a **"Files to be added to Antivirus exclusion list"** entry in the Knowledge Base (it points to the EDR exclusion help). Practical guidance:
- Add the Endpoint Central agent install directory and its executables/services to the third-party AV's exclusion list so the AV does not quarantine agent components.
- A documented example exists for **Symantec Endpoint Protection** ("Adding exceptions to Endpoint Central to allow it to function with Symantec Endpoint Protection").
- Conversely, exclude trusted business apps inside Endpoint Central's own **Settings → Exclusion** so EDR engines don't flag them.

### Diagnostics

- Confirm agent health and activity recording; verify the Threat-Intel DB is updating; check telemetry availability for the endpoint under investigation; review the Incident's **Alerts** tab and Behavior Type; validate Zia-generated timeline/root-cause; confirm build version for build-gated capabilities.

### False-positive handling (procedure)

1. Open the Incident → **Alerts** tab; for a Behavior-Detection-Engine alert, note the **Behavior Type**.
2. If confident it is benign, mark it **False Positive**. Endpoint Central will auto-recognize the same pattern in future detections.
3. To make suppression robust, add an **Exclusion** (Settings → Exclusion → Add Exclusion): pick the engine type, choose an exclusion method (prefer Signer Certificate or SHA-256), and — for behavior alerts — select the matching **Behavior Type**; for Ransomware/Exfiltration engines, optionally add **Allowed Folder(s)**.

### Relevant agent CVEs / security advisories

| Advisory (CVE / name) | Impact | Fixed-in / action |
|---|---|---|
| **CVE-2024-10203** — Archive Logs vulnerability in Agent Tray Icon (High; 23-Sep-2024; physical/local access) | Archive-logs feature could delete files in directories the user lacked access to → arbitrary file deletion + privilege escalation. Applies to **On-Prem and Cloud**. | Enterprise 11.3.2435.1; 11.3.2416.21↓→11.3.2416.22; 11.3.2428.9↓→11.3.2428.10. Update via console → click build number → download PPM. |
| **CVE-2025-5494** — Privilege Escalation in agent (Low; 24-Apr-2025; local) | Privileged file deletion during **patch scan** can be exploited to elevate to SYSTEM. | 11.4.2500.25↓→11.4.2500.26; 11.4.2508.13↓→11.4.2508.14. |
| **CVE-2024-38868** — Access-control fixes in **ransomware protection module** (High; 2-Apr-2024) | Unintended exposure of basic computer info to unauthorized users; technicians could isolate/de-isolate devices outside their scope. Resolved via scope-based access-control improvements. | 11.3.2406.05↓→11.3.2406.08; 11.3.2400.12↓→11.3.2400.15. |
| **Privilege Escalation via DLL** (High; 30-Aug-2024; local) | Standard user replaces a DLL outside the agent directory by tampering with its code sign → admin privilege via the replaced DLL. **Not applicable to Cloud.** | 11.3.2416.18↓→11.3.2416.20; 11.3.2428.02↓→11.3.2428.04. |
| **Privilege Escalation via DTA tool** (High; 30-Aug-2024; local) | A standard user interacts with the Device Temporary Access tool's service to launch it as SYSTEM → further privilege escalation. | 11.3.2416.18↓→11.3.2416.20; 11.3.2428.02↓→11.3.2428.04. |
| **CVE-2022-47523** — Authenticated SQL Injection | SQL injection by an authenticated user. | Upgrade to the fixed build per the advisory (apply latest PPM). |

> Patching procedure for all of the above is identical: **log in to the console → click the current build number (top right) → download and install the latest applicable PPM update.** Endpoint Central remediates *agent* CVEs as well as customer-environment vulnerabilities, so keeping the server/agent current is itself a security control.

### FAQs (from source pages)

- **How does EDR detect threats?** Continuously monitors endpoint activity across users/files/processes/network; evaluates it with behavioral analytics + threat intelligence + MITRE ATT&CK; raises an alert when activity matches IoAs/IoCs and groups related alerts into an incident.
- **Can data encrypted/stolen by ransomware be recovered?** Yes — VSS shadow copies (every 3 hours) plus a tamper-proof backup enable single-click restoration.
- **Impact on system performance?** Minimal — shared lightweight agent (NGAV layer cited at <1% CPU).
- **Do I need another agent?** No — the existing Endpoint Central agent supports EDR, Malware Protection, and Ransomware Protection.

### Useful KB / help references

- EDR help overview: https://www.manageengine.com/products/desktop-central/help/edr/edr-overview.html
- Creating Exclusion List (engines, methods, Behavior Type, Allowed Folders): https://www.manageengine.com/products/desktop-central/help/edr/creating-exclusion.html
- Endpoint Central Knowledge Base index: https://www.manageengine.com/products/desktop-central/knowledge-base.html
- Security Updates on Vulnerabilities (CVE list): linked from the KB index above.

## Cross-references

- [Patch Management](patch-management.md) — root-cause remediation when a threat traces to an unpatched vulnerability.
- [Vulnerability Management](vulnerability-management.md) — proactive surface reduction feeding EDR context.
- [Next-Gen Antivirus & Anti-Ransomware](next-gen-antivirus-ransomware.md) — the preventive first line (NGAV) and ransomware-specific detection/rollback that EDR's framework incorporates as Malware Protection + Ransomware Protection.

## Sources

- https://www.manageengine.com/products/desktop-central/help/edr/edr-overview.html
- https://www.manageengine.com/products/desktop-central/help/edr/creating-exclusion.html
- https://www.manageengine.com/products/desktop-central/next-gen-antivirus.html
- https://www.manageengine.com/products/desktop-central/nextgen-antivirus.html
- https://www.manageengine.com/products/desktop-central/ransomware-protection.html
- https://www.manageengine.com/products/desktop-central/anti-ransomware.html
- https://www.manageengine.com/products/desktop-central/security-updates-ngav.html (CVE-2024-38868)
- https://www.manageengine.com/products/desktop-central/knowledge-base.html
- https://www.manageengine.com/products/desktop-central/cve-2024-10203.html
- https://www.manageengine.com/products/desktop-central/privilege-escalation-endpointcentral-agent.html (CVE-2025-5494)
- https://www.manageengine.com/products/desktop-central/privilege-escalation-vulnerability-dll.html
- https://www.manageengine.com/products/desktop-central/privilege-escalation-vulnerability-dta.html
- https://www.manageengine.com/products/desktop-central/endpoint-detection-and-response.html
- https://www.manageengine.com/products/desktop-central/endpoint-detection-and-response-edr.html
