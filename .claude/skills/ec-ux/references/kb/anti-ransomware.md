# Anti-Ransomware

> Anti-Ransomware is an enterprise-grade, **AI-powered behavioral ransomware-detection and recovery** module that detects, resolves, and recovers from ransomware at an early stage with minimal disruption. It pairs a machine-learning behavior-detection engine with **device quarantine, incident analysis, and one-click recovery from Volume Shadow Copy (VSS) snapshots** taken every three hours. Surfaced within the EDR framework as **Ransomware Protection**. Parent module: [next-gen-antivirus-ransomware.md](next-gen-antivirus-ransomware.md). Available to **all Endpoint Central users including the Free trial** (requires build **11.1.2236.1 or above**), running on the **existing EC agent** (no extra agent). The lifecycle is **Detect -> Resolve -> Recover**.

---

## 1. What it is — Feature detail

Traditional signature-based detection offers limited protection against ever-evolving ransomware, which infiltrates silently and bypasses conventional security. Anti-Ransomware addresses this with cutting-edge **AI-powered behavior detection** to instantly identify and neutralize suspicious activity across the network, then recover encrypted files from tamper-proof backups.

### A. Behavior detection engine (AI/ML)
The **Ransomware Detection Engine** uses patented **machine-learning-powered anomaly detection** — analyzing program behavior in real time and identifying **deviations from established baselines**, even for unknown strains. Vendor materials describe behavioral detection accuracy on the order of **~99.5%** *(inferred from vendor marketing claims; not stated on the fetched pages)*.

- **Process-level monitoring** of suspicious activities such as **unsanctioned/mass file-encryption attempts** and **unauthorized access or modification of critical system files**. When a process matching a ransomware pattern **browses a file, encrypts it, and updates it**, an alert is raised.
- **Real-time alerting & mitigation** — anomalies trigger immediate alerts for investigation and containment.
- **Proactive protection** — mitigates **zero-day** ransomware by focusing on suspicious behavior rather than known signatures.
- Detection works **online and offline**, alerts on **even a single anomalous process**, and uses **heuristic detection** plus IoC/IoA identification mapped to the **MITRE ATT&CK framework**.
- **Enhanced security posture** — layered defense complementing signature-based detection, reducing response time and minimizing data loss/downtime.

### B. Incident analysis & end-to-end forensics
Alerts with the same pattern across devices are **automatically grouped and documented as incidents** (with the list of devices and files involved).
- **Advanced endpoint forensics** analyzes system logs, memory dumps, and registry entries to identify suspicious downloads/executions, exploited software vulnerabilities, and the user activity (e.g., a malicious email link) that triggered the infection.
- **In-depth IoC analysis** ingests threat-intelligence feeds to flag malicious file hashes and malware-distribution URLs associated with known ransomware variants.

### C. Device quarantine & seamless mitigation
Ransomware thrives on time and on revisiting previously compromised environments.
- **Automated threat containment** — on detection, automated actions plus **process termination** stop the ransomware process in its tracks.
- **Alert & network quarantine** — immediate alerts to security teams; administrators **manually isolate** the affected device to minimize lateral movement.
- **Behavioral pattern recognition** — analyzes program behavior even when the ransomware string is obfuscated or mutated, identifying repeat offenders that have changed their appearance.
- **Repeat-offender defense** — when a program exhibits behaviors linked to previously encountered ransomware, the system triggers an aggressive strategy: **instantaneous process termination** + **automatic rollback initiation** using pre-defined backups to restore systems to a clean state.

### D. One-click recovery via VSS shadow copies (single-click rollback)
Recovery leverages **Microsoft's Volume Shadow Copy Service (VSS)** to take shadow copies of all files on an endpoint **every three hours**.
- On confirmation of a **true-positive** attack, all infected files are **reverted to the most recent stored copy** in a **single click**.
- If the **same** ransomware attack recurs, files are **automatically restored** (paired with instantaneous process termination).
- Backups are **non-erasable / tamper-proof**, defending against attackers who try to destroy backups.
- **Recovery granularity:** up to ~3 hours of changes can be lost on rollback (the snapshot interval). A configurable/continuous cadence is **not documented** (roadmap gap — *inferred*).

### E. Single-step incident response (Resolve)
On an anomaly, examine the process and flag it **True Positive** or **False Positive**:
- **True Positive** -> the file-recovery process is initiated.
- **False Positive** -> similar future processes are **automatically flagged false positive** (self-learning suppression).

### F. Exclusions (zero-trust)
Trusted, benign executables can be excluded from real-time behavior detection and incident notifications via **Settings -> Exclusion**. Each exclusion specifies an **engine type** (Behavior / Ransomware / Exfiltration Detection Engine, or Select All) and an **exclusion method**:
- **Signer Certificate** *(recommended, narrow)* — by certificate thumbprint (valid signature required; `sigcheck.exe -i`).
- **SHA-256** *(narrow)* — by file hash.
- **Executable Path** *(broad — NOT recommended)* — ransomware may copy itself there to evade detection.
- **GLOB** *(broad)* — wildcard path.
- **Command-Line Support** — exclude a specific command line.
- **Allowed Folder(s)** — for Ransomware/Exfiltration engine exclusions, add folder names (one per entry) to exclude those folders from detection. Can also be set while marking an incident false positive.

### Supported OS / platforms
- **Windows 8, 8.1, 10, 11.** Currently **Windows-only**.

### Prerequisites & edition gating
- **No additional agent** — the existing EC agent supports the module.
- Requires EC build **11.1.2236.1+**; available to **Free-trial** users (strong land-and-expand motion).
- Enable/disable anytime via the **Anti-Ransomware tab -> Settings** (this also governs the 3-hourly VSS backup).

---

## 2. UX lens

### Console navigation path
- **Anti-Ransomware tab** — its own tab with a **Settings** option to enable/disable the module and govern the 3-hourly VSS shadow-copy backup.
- **Incidents tab** — alerts auto-grouped into incidents (device + file lists); open an incident -> **Alerts** tab to see the **Behavior Type**; mark **True Positive** (triggers recovery) or **False Positive** (auto-suppress + optionally add Exclusion).
- **Settings -> Exclusion** — the exclusion list (engine type + method + Behavior Type / Allowed Folders).
- Help pages: `ransomware-protection.html`, `anti-ransomware.html`, `anti-ransomware-behavioral-detection-feature.html`, `/help/edr/creating-exclusion.html`.

### Step-by-step workflow (Detect -> Resolve -> Recover)
1. **Enable:** confirm build **11.1.2236.1+** -> **Anti-Ransomware tab -> Settings** -> enable. VSS shadow copies begin (every 3 hours).
2. **Detect:** the Ransomware Detection Engine raises an alert on the browse->encrypt->update pattern / mass-encryption / critical-file tampering; related alerts auto-group into an **Incident** listing affected devices and files.
3. **Triage:** open the incident -> **Alerts** tab -> review evidence and Behavior Type -> decide **True Positive** or **False Positive**.
4. **Contain:** manually **isolate** (quarantine) the affected device; automated containment + **process termination** stop the ransomware.
5. **Recover:** on a confirmed true positive, **single-click rollback** reverts files to the most recent VSS shadow copy (≤3 hours old) from the tamper-proof backup. A recurrence triggers **automatic** restoration.
6. **Tune:** for a false positive, mark it so (auto-suppresses similar events) and add a precise **Exclusion** (Signer Certificate / SHA-256 preferred; Allowed Folders for ransomware/exfiltration).

### UX research hooks
- **True/false-positive decisioning** — a wrong false-positive call permanently suppresses similar events (could hide a real attack). Study confidence, evidence, and consequences.
- **Rollback trust & scope** — does the user know which files revert and to which ≤3-hour-old copy? Study data-loss anxiety.
- **Exclusion-method safety** — narrow vs. broad carries real security weight; the help warns against Executable Path. Study comprehension and the `sigcheck.exe` workflow.
- **VSS cadence expectation** — the fixed 3-hour interval implies potential data loss; study whether admins understand the recovery granularity.

### Notable UI patterns
Anti-Ransomware tab + Settings; auto-grouped Incidents list with device/file detail; Alerts tab with Behavior Type; True/False-positive classification control; one-click recovery action; manual device-quarantine control; `Settings -> Exclusion` manager with engine-type/method selectors, Behavior Type picker, and Allowed Folder(s) tab.

---

## 3. PM lens

### Value proposition & measurable outcomes
- **Early-stage detection** with minimal disruption; alerts on even a single anomalous process; offline-capable.
- **VSS shadow copies every 3 hours** + **single-click recovery** + tamper-proof, non-erasable backups -> reliable rollback that defends against backup-destroying ransomware.
- **No extra agent**; available even on **Free trial** -> strong land-and-expand motion.
- **Market stats cited (vendor pages):** ransomware most common malware in 2022 (Cybereason); average post-attack downtime **21 days** (Lougtec); an attack every **11 seconds** by 2023 with **$20B** annual global cost (Web Arx Security); Colonial Pipeline (May 2021) as a high-profile example.
- Outcomes: reduced downtime, avoided ransom payments, data integrity/availability, regulatory compliance.

### Target personas & use cases
- **Security admin** — detect ransomware proactively, contain, and recover with minimal effort.
- **Incident responder** — classify true/false positive correctly and recover encrypted files fast.
- **SMB owner / Free-trial user** — strong ransomware resilience out of the box, before purchase.
- Use cases: zero-day ransomware prevention, mass-encryption detection + rollback, forensic incident analysis for compliance. *Trusted by NASA, Honda, Etihad, TCS, ABT (vendor page).*

### Positioning & differentiators
- **Single agent / no extra deployment**; **patented tamper-proof backup + single-click rollback**.
- **ML behavioral detection** (not signatures) catches obfuscated/mutated repeat offenders; **repeat-offender defense** with automatic rollback.
- **Self-learning false-positive suppression**; **MITRE ATT&CK + IoC/IoA** forensics.
- **Available on Free trial** — unusually low barrier vs. NGAV (paid add-on).
- Competes with the ransomware-protection modules of CrowdStrike, SentinelOne, Sophos — EC's edge is consolidation and free availability within UEM.

### Edition / point-product gating
- Module available **broadly, including to Free-trial users**; requires build **11.1.2236.1+**. (Contrast: NGAV is a paid add-on.)

### Expansion opportunities (analysis)
- **Configurable / continuous shadow-copy cadence** — the 3-hour interval risks up to 3 hours of data loss.
- **macOS/Linux support** — Windows-only today.
- **Guided true/false-positive decisioning** with AI confidence + evidence.
- **Exclusion risk scoring** — warn when a Path/GLOB exclusion is overly broad.
- **Automatic (vs. manual) device quarantine** option on high-confidence detections.

---

## 4. Developer / Technical lens

### Architecture & components
- **Endpoint Central Agent** (shared) — runs the ML behavior engine; performs quarantine, neutralization, and restore on the endpoint.
- **Ransomware Detection Engine** — browse->encrypt->update pattern, mass-encryption, critical-file tampering; **Allowed-Folder** exclusions. (Sibling engines: **Behavior Detection Engine** with per-alert Behavior Type; **Exfiltration Detection Engine**.)
- **EC Server / security backend** — incident storage and auto-grouping, MITRE/IoC analysis, console.
- **VSS (Volume Shadow Copy Service)** — OS-native; snapshots all endpoint files **every 3 hours**.
- **Tamper-proof / non-erasable backup store** — enables file recovery.
- **ML / heuristic models** — power anomaly detection against behavioral baselines.

### Detection internals
- **ML anomaly detection** against established baselines + **heuristic detection**; process-level monitoring of the browse->encrypt->update sequence.
- **IoA/IoC + MITRE ATT&CK:** incidents enriched with IoCs (malicious hashes, distribution URLs) and mapped to ATT&CK.
- **Telemetry / retention:** VSS shadow copies retained per the 3-hour cadence; broader telemetry per the EDR activity store (~30 days, build/edition-dependent — *inferred*).

### Agent mechanics
- **Detection:** monitors process-level activity; alerts -> auto-grouped incidents.
- **Backup cadence:** VSS shadow copies **every 3 hours**.
- **Response:** manual device quarantine, automated containment + **process termination**, automatic re-attack restoration.

### Ports, protocols, integrations
- Uses EC agent-server channels (specific ports not enumerated on fetched pages — *inferred* **8020 HTTP / 8383 HTTPS** on-prem). Integrates with **VSS** on Windows; threat-intel feeds from the backend; platform **API Explorer** at `/products/desktop-central/api/`.

### Data model / key objects
Incident (auto-grouped; True/False-positive state; device + file list), Alert (Behavior Type), Backup snapshot (VSS, 3-hourly), Quarantine record, Exclusion entry (engine type + method + Allowed Folder), IoC/IoA, MITRE ATT&CK mapping, Recovery job.

### Technical limitations
- **Windows-only** (8/8.1/10/11); requires build **11.1.2236.1+**.
- Up to **~3 hours** of changes can be lost on rollback (snapshot interval).
- Device quarantine is **manual** (no documented auto-quarantine).
- False-positive classification permanently suppresses similar events — misclassification risk.

---

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
|---|---|---|
| Anti-Ransomware not available | EC build older than 11.1.2236.1 | Upgrade to **11.1.2236.1+** (console -> click build number -> download PPM) |
| Trusted app keeps getting flagged | No exclusion; flagged by the Ransomware/Behavior engine | `Settings -> Exclusion`, scoped by **Signer Certificate** (`sigcheck.exe -i`) or **SHA-256**; add **Allowed Folder(s)** for known-good directories; avoid broad Path/GLOB |
| Recovery missing recent changes | VSS snapshots are 3-hourly (recovers to most recent ≤3h copy) | Expected behavior — set expectations; consider supplementing with more frequent external backups |
| Real attack auto-suppressed | A prior false-positive flag now masks a true positive | Review/clear the offending Exclusion / false-positive entry |
| Recovery not working | VSS service stopped or snapshots not current | Verify the **VSS service** is running and snapshots exist; confirm the module is enabled in the Anti-Ransomware tab |
| Device still spreading after detection | Quarantine is manual | Manually isolate the affected device from the incident; verify process termination occurred |

### False-positive handling (procedure)
1. `Incidents -> incident -> Alerts` tab; note the **Behavior Type**.
2. Mark **False Positive** if confident; EC auto-recognizes the same pattern in subsequent detections.
3. For robust suppression, add an **Exclusion**: choose the engine type, prefer **Signer Certificate** / **SHA-256**, select the matching Behavior Type, or add **Allowed Folder(s)**.

### Relevant agent security advisory
- **CVE-2024-38868** — access-control fixes in the **ransomware-protection module** (High; 2-Apr-2024): unintended exposure of basic computer info, and technicians could isolate/de-isolate devices outside their scope. Fixed via scope-based access-control improvements (11.3.2406.05->.08; 11.3.2400.12->.15). Patch via console -> click build number -> download PPM. (Full agent-CVE table in [next-gen-antivirus-ransomware.md](next-gen-antivirus-ransomware.md).)

### FAQs
- **How does it work?** Real-time monitoring + ML/heuristic behavioral analysis + device quarantine + remediation with restoration from secure (VSS, tamper-proof) backups.
- **OS support?** Windows 8, 8.1, 10, 11.
- **Disable later?** Yes — Anti-Ransomware tab -> Settings.
- **Can Free-trial users try it?** Yes (build 11.1.2236.1+).
- **Does it need another agent?** No — the existing EC agent supports it.
- **Coexist with current antivirus?** Yes.

---

## Cross-references
- [next-gen-antivirus.md](next-gen-antivirus.md) — the sibling layer; shares the detection engines, the Exclusion model, and the tamper-proof backup/rollback subsystem, but focuses on general malware (static+dynamic+deep-learning) with MITRE TTP forensics.
- [next-gen-antivirus-ransomware.md](next-gen-antivirus-ransomware.md) — parent module bundling NGAV + Anti-Ransomware, with the full agent-CVE advisory table.
- [endpoint-detection-response.md](endpoint-detection-response.md) — the EDR framework incorporates Anti-Ransomware as Ransomware Protection plus Threat Hunting.
- [patch-management.md](patch-management.md) — patches the vulnerabilities ransomware exploits; also the channel for applying agent-CVE fixes (PPM).

## Sources
- https://www.manageengine.com/products/desktop-central/ransomware-protection.html
- https://www.manageengine.com/products/desktop-central/anti-ransomware.html
- https://www.manageengine.com/products/desktop-central/anti-ransomware-behavioral-detection-feature.html
- https://www.manageengine.com/products/desktop-central/anti-ransomware-faq.html
- https://www.manageengine.com/products/desktop-central/help/edr/creating-exclusion.html
- https://www.manageengine.com/products/desktop-central/security-updates-ngav.html (CVE-2024-38868)
