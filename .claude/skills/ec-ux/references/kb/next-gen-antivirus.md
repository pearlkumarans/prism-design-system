# Next-Gen Antivirus (NGAV)

> Next-Gen Antivirus is **AI/ML, deep-learning, behavior-based, signature-less malware prevention** that goes beyond signature matching to detect known, unknown, and fileless malware online and offline, with MITRE TTP-based incident forensics, contextual containment, and single-click rollback. Surfaced within the EDR framework as **Malware Protection**. Parent module: [next-gen-antivirus-ransomware.md](next-gen-antivirus-ransomware.md). NGAV is a **separate paid add-on** (not in the Security Edition standard license) and may require enabling an **Early Access program**; it runs on the **existing Endpoint Central agent** (no extra agent). A standalone point product, **Malware Protection Plus (MPP)**, exists for buyers wanting dedicated malware defense without full UEM.

---

## 1. What it is — Feature detail

NGAV is a proactive, signature-less malware-prevention engine — the "first line of defense" against malware. Unlike conventional antivirus, it combines artificial intelligence, behavior-based analysis, and deep-learning algorithms to identify and neutralize threats in real time, defending against emerging and sophisticated threats that signature-based tools miss. It continually monitors and proactively responds rather than waiting for a signature match. The lifecycle is **Threat Detection -> Incident Forensics -> Threat Mitigation** ("360-degree malware defense").

### A. Multi-layer / static + dynamic + deep-learning detection engines
NGAV employs a **multi-layered detection** approach, combining **AI-assisted behavior-based analysis** with **deep-learning algorithms** for both online and offline reactive malware security. This blends static and dynamic detection:
- **Static detection** — pre-execution analysis of files.
- **Dynamic / behavioral detection** — runtime monitoring of program behavior for anomalies; works offline; triggers instant alerts.
- **Deep learning / ML** — continuously evolves and learns from past attacks to counter polymorphic and fileless (memory-resident) malware, leveraging real-time threat intelligence.

It detects **known, unknown, and fileless malware** and keeps monitoring regardless of online/offline status, triggering **instant alerts** on detection. By constantly learning from new threats, it shields against the latest vulnerabilities.

The detection engines exposed in the Exclusion UI are the **Behavior Detection Engine**, **Ransomware Detection Engine**, and **Exfiltration Detection Engine** (shared with the broader EDR/Anti-Ransomware story).

### B. MITRE TTPs-based incident forensics
NGAV integrates **MITRE TTPs-based forensics**: it examines anomalous detections within the **kill-chain framework**, mapping incidents to MITRE **tactics, techniques, and procedures (TTPs)** for a comprehensive understanding of the attack lifecycle. It identifies **Indicators of Compromise (IoCs)**, maps attack paths/techniques, and produces detailed reports that enhance incident-response capabilities and help analysts make informed decisions and fortify defenses against future threats.

### C. Contextual threat remediation
NGAV excels in **contextual threat remediation** by immediately containing malware: **quarantining infected devices** and **neutralizing attacks in real time**. By isolating compromised systems and thwarting ongoing attacks it safeguards the network and **prevents the lateral spread** of threats.
- **Network quarantine** — isolate infected devices and promptly terminate malware for breach containment.
- **Mitigation & rollback** — restore an infected endpoint to its **pre-malware state with a single click**, using a **patented, tamper-proof backup system** (crucial against actors who try to encrypt/erase backups).

### D. Exclusions
Trusted, benign executables can be excluded from detection to preserve productivity, scoped via the **Settings -> Exclusion** list. Each exclusion specifies an **engine type** (Behavior / Ransomware / Exfiltration Detection Engine, or Select All) and an **exclusion method** (narrow -> broad):
- **Signer Certificate** *(recommended, narrow)* — by certificate thumbprint; the executable must have a valid signature; obtain the leaf-signer thumbprint with `sigcheck.exe -i`.
- **SHA-256** *(narrow)* — by file hash; obtain via `sigcheck.exe`.
- **Executable Path** *(broad — NOT recommended)* — ransomware may copy itself there to evade detection.
- **GLOB** *(broad)* — wildcard path exclusion; use carefully.
- **Command-Line Support** — exclude a specific command line (e.g., `cmd.exe /c vssadmin delete shadows /all`).
- For a **Behavior Detection Engine** exclusion, also select the matching **Behavior Type** (the alert rule, listed on `Incidents -> incident -> Alerts`).

### Out-of-the-box functionality & coexistence
Real-time threat detection, incident forensics, frictionless quarantine and release, and mitigation & rollback work out of the box. NGAV can run **alongside an existing antivirus** as a second layer (low-friction adoption). Footprint: a lightweight **single agent using less than 1% CPU**.

### Benefits of unifying NGAV with endpoint management
Centralized control of policies/updates/responses; improved real-time visibility into device security posture; exhaustive reporting for audits and compliance; efficient resource utilization (combining AV + UEM); and automated workflows that cut incident response time.

### Supported OS / platforms
- **Windows 11, Windows 10, Windows 8.1, Windows 8.** Currently **Windows-only**.

### Prerequisites & edition gating
- **No additional agent** — the existing EC agent supports NGAV.
- NGAV is a **paid add-on**, separate from the Security Edition standard license, and may require enabling the **Early Access program** before features appear.
- The deeper AI/Threat-Hunting analytics tier is Cloud-led; the core NGAV detection/recovery engines run on the on-prem/cloud agent on supported Windows (*inferred*).

---

## 2. UX lens

### Console navigation path
- NGAV / Malware Protection features appear in the **security console** (within the EDR framework); some builds require enabling the **Early Access program** first.
- **Exclusions:** `Settings -> Exclusion -> Add Exclusion`.
- **Incidents:** `Incidents` tab -> open an incident -> **Alerts** tab (shows Behavior Type, evidence) -> mark True/False Positive.
- Marketing/help pages: `next-gen-antivirus.html`, `nextgen-antivirus.html`, `/help/edr/creating-exclusion.html`, `/help/edr/edr-overview.html`.

### Step-by-step workflow
1. **Enable:** ensure the add-on license is present; if required, enable the **Early Access program** so NGAV features appear -> hybrid static+dynamic + deep-learning detection runs continuously and out of the box.
2. **Detect:** an engine raises an **instant alert**; related alerts auto-group into an **Incident** listing affected devices and files.
3. **Investigate:** open the incident -> review **MITRE TTP / kill-chain forensics**, IoCs, and the Behavior Type on the Alerts tab.
4. **Contain / neutralize:** **network-quarantine** the device and neutralize the attack in real time to stop lateral spread.
5. **Recover:** **single-click rollback** restores the endpoint to its pre-malware state from the tamper-proof backup.
6. **Tune:** for false positives, mark False Positive (auto-suppresses similar events) and add a precise **Exclusion** (Signer Certificate / SHA-256 preferred).

### UX research hooks
- **NGAV vs. coexisting AV confusion** — both can run together; study conflicts and duplicate-alert perception.
- **Early Access / add-on discoverability** — NGAV being a separate add-on (vs. broadly available Anti-Ransomware) may confuse buyers about what is enabled.
- **MITRE forensics literacy** — kill-chain/TTP/Behavior-Type views assume security expertise; study comprehension for generalist IT admins.
- **Exclusion-method safety** — narrow (Signer Certificate/SHA-256) vs. broad (Path/GLOB) carries real security weight; study whether admins grasp the trade-off and the `sigcheck.exe` workflow.
- **Rollback trust & scope** — does the user know which files revert and to which point in time? Study data-loss anxiety.

### Notable UI patterns
NGAV dashboard; alert feed with instant alerts; auto-grouped Incidents list with device/file detail; MITRE TTP / kill-chain forensics view; IoC report; quarantine / neutralize / one-click-rollback controls; `Settings -> Exclusion` manager (engine-type selector, exclusion-method selector, Behavior Type picker).

---

## 3. PM lens

### Value proposition & measurable outcomes
- Catches **known, unknown, and fileless** malware that signature AV misses; proactive, real-time, offline-capable.
- **<1% CPU** footprint; **patented tamper-proof backup** enabling reliable one-click rollback.
- **Coexists** with an existing AV — low-friction second layer that lowers switching cost.
- MITRE TTP forensics + IoC mapping built in for faster, better-informed response.
- Outcomes: reduced dwell time, contained lateral movement, reliable recovery, exhaustive compliance reporting.

### Target personas & use cases
- **Security admin** — prevent malware proactively, investigate via MITRE mapping, contain and roll back with minimal effort.
- **Incident responder** — triage true/false positive and recover fast.
- **IT admin / SMB owner** — strong protection out of the box without a separate agent.
- Use cases: fileless/polymorphic malware prevention, layered defense alongside incumbent AV, incident forensics for compliance. *Trusted by NASA, Honda, Etihad, TCS, ABT (vendor page).*

### Positioning & differentiators
- **Single agent / no extra deployment** vs. standalone NGAV/EDR products.
- **Patented tamper-proof backup + one-click rollback** defends against backup-destroying malware.
- **MITRE TTP forensics + IoC** built in; **coexistence** with incumbent AV.
- Competes with CrowdStrike, SentinelOne, Microsoft Defender for Endpoint — EC's edge is consolidation and price within UEM.

### Edition / point-product gating
- **Separate paid add-on**, **not** in the Security Edition standard license; may need Early Access enablement. Standalone point product: **Malware Protection Plus (MPP)**.

### Expansion opportunities (analysis)
- **macOS/Linux support** — Windows-only today; clear gap.
- **Guided true/false-positive decisioning** with AI confidence + evidence.
- **Exclusion risk scoring** — warn when a Path/GLOB exclusion is overly broad.
- **Package clarity** — fold NGAV into the Security Edition or clarify add-on bundling; unify NGAV + Anti-Ransomware + Threat Hunting further under EDR.

---

## 4. Developer / Technical lens

### Architecture & components
- **Endpoint Central Agent** (shared) — runs NGAV static + dynamic detection; performs quarantine, neutralization, and restore on the endpoint; **<1% CPU**.
- **Detection engines** (exposed in the Exclusion UI) — **Behavior Detection Engine** (per-alert Behavior Type), **Ransomware Detection Engine**, **Exfiltration Detection Engine**.
- **EC Server / security backend** — incident storage and auto-grouping, MITRE TTP/IoC analysis, alert sorting, console.
- **Tamper-proof / non-erasable backup store** — patented backup enabling single-click rollback.
- **Deep-learning / ML models** — power detection; continuously learn from past attacks.

### Detection internals
- **Static vs dynamic:** blends pre-execution file analysis (static) with runtime behavioral monitoring (dynamic); offline-capable; instant alerts.
- **Deep learning / ML:** counters polymorphic and fileless malware via continuous learning + real-time threat intel.
- **IoA/IoC + MITRE/kill-chain:** incidents examined within the kill-chain framework, mapped to MITRE TTPs, enriched with IoCs (malicious hashes, distribution URLs).
- **Telemetry / retention:** broader endpoint telemetry retention is governed by the EDR activity store (commonly ~30 days, build/edition-dependent — *inferred*).

### Ports, protocols, integrations
- Uses EC agent-server channels (specific ports not enumerated on the fetched pages — *inferred* standard agent/gateway ports **8020 HTTP / 8383 HTTPS** on-prem). MITRE/threat-intel data from the backend; platform **API Explorer** at `/products/desktop-central/api/`. Coexistence means it does **not** require disabling Windows Defender / other AV.

### Data model / key objects
Incident (auto-grouped; True/False-positive state; device + file list), Alert (Behavior Type), Detection (static/dynamic; per engine), Quarantine record, Backup snapshot, Exclusion entry (engine type + method), IoC/IoA, MITRE TTP mapping, Recovery job.

### Technical limitations
- **Windows-only** (8/8.1/10/11).
- Requires the **add-on license / Early Access** enablement.
- False-positive classification permanently suppresses similar events — misclassification risk.
- Deeper analytics tier is Cloud-led (*inferred*).

---

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
|---|---|---|
| NGAV features not visible | Add-on license missing, or Early Access not enabled | Confirm the add-on license; enable the **Early Access program** |
| Trusted app keeps getting flagged | No exclusion, or it's flagged by a detection engine | `Settings -> Exclusion`, scoped by **Signer Certificate** (needs valid signature; `sigcheck.exe -i`) or **SHA-256**; avoid broad Path/GLOB |
| Real attack auto-suppressed | A prior false-positive flag now masks a true positive | Review/clear the offending Exclusion / false-positive entry |
| Coexistence conflicts with existing AV | Third-party AV quarantines agent components | NGAV is designed to coexist; add the agent files to the AV's exclusion list (documented example for Symantec Endpoint Protection); see KB "Files to be added to Antivirus exclusion list" |
| Rollback missing recent changes | Backup snapshot interval; recovers to most recent stored copy | Set expectations; for ransomware-specific recovery see [anti-ransomware.md](anti-ransomware.md) (VSS every 3 hours) |

### Relevant agent security advisory
- **CVE-2024-38868** — access-control fix in the (sibling) ransomware-protection module; patch via console -> click build number -> download PPM. (Full NGAV/Anti-Ransomware CVE table in [next-gen-antivirus-ransomware.md](next-gen-antivirus-ransomware.md).)

### Diagnostics
Confirm agent health; verify the relevant Detection Engine is enabled; check incident classification history; review Exclusion-list scope; confirm add-on / Early Access status.

### FAQs
- **Can it coexist with current antivirus?** Yes — designed as a complementary second layer.
- **Performance impact?** Minimal — **<1% CPU**.
- **Deploy another agent?** No — the existing EC agent supports NGAV.
- **In the Security-Edition standard license?** No — separate add-on, usable after enabling Early Access.
- **Does it catch fileless malware?** Yes — dynamic/behavioral + deep-learning detection targets memory-resident and polymorphic threats.

---

## Cross-references
- [anti-ransomware.md](anti-ransomware.md) — the sibling layer; shares the detection engines, the Exclusion model, and the tamper-proof rollback subsystem, but focuses on ransomware behavior detection + VSS shadow-copy recovery.
- [next-gen-antivirus-ransomware.md](next-gen-antivirus-ransomware.md) — parent module bundling NGAV + Anti-Ransomware, with the full agent-CVE advisory table.
- [endpoint-detection-response.md](endpoint-detection-response.md) — the EDR framework incorporates NGAV as Malware Protection plus Threat Hunting.
- [patch-management.md](patch-management.md) — patches the vulnerabilities malware targets; also the channel for applying agent-CVE fixes (PPM).
- [vulnerability-management.md](vulnerability-management.md) — reduces the attack surface malware exploits.

## Sources
- https://www.manageengine.com/products/desktop-central/next-gen-antivirus.html
- https://www.manageengine.com/products/desktop-central/nextgen-antivirus.html
- https://www.manageengine.com/products/desktop-central/help/edr/creating-exclusion.html
- https://www.manageengine.com/products/desktop-central/help/edr/edr-overview.html
- https://www.manageengine.com/products/desktop-central/security-updates-ngav.html (CVE-2024-38868)
- https://www.manageengine.com/products/desktop-central/knowledge-base.html
