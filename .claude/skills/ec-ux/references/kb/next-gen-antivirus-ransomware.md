# Malware Protection — NGAV & Anti-Ransomware (Overview)

> Umbrella module for endpoint malware defense: next-gen antivirus (prevention/detection) and anti-ransomware (behavior-based detection + rollback). **Licensing (per the official edition-comparison matrix, verified 2026-07-09):** both **Malware Protection (NGAV)** and **Ransomware Protection** are **separately-licensed add-ons in every paid edition — including the Security edition** (they are *not* bundled into Security the way vulnerability/app-control/device-control/DLP/browser/BitLocker are). Both are included in the **Free** edition; Anti-Ransomware is also available for trial. **EDR** (which combines Malware + Ransomware Protection + Threat Hunting) is likewise an add-on and is **Cloud-only**.

> **This module is split into dedicated files — open the child file for full depth. This page is a navigation overview only (kept short to avoid duplication).**

## Sub-modules

| Sub-module | File | Covers |
|---|---|---|
| Next-Gen Antivirus (NGAV) | [next-gen-antivirus.md](next-gen-antivirus.md) | Multi-layer static + dynamic + deep-learning detection engines, MITRE TTP/kill-chain forensics, contextual remediation, per-engine exclusions |
| Anti-Ransomware | [anti-ransomware.md](anti-ransomware.md) | AI/ML behavior detection engine, device quarantine & incident analysis, VSS shadow-copy single-click rollback, repeat-offender defense |

## How the pieces fit
NGAV is the **prevention/detection** layer against malware broadly; Anti-Ransomware is a **specialized behavioral layer** focused on encryption-style attacks with a dedicated recovery (rollback) capability. Both feed detections into the EDR investigation/response workflow.

## Cross-references
- Deeper investigation & response: [endpoint-detection-response.md](endpoint-detection-response.md)
- Related: [vulnerability-management.md](vulnerability-management.md), [network-access-control.md](network-access-control.md), [security-advisories-cve.md](security-advisories-cve.md)

## Sources
- See full Sources lists in the child files: [next-gen-antivirus.md](next-gen-antivirus.md), [anti-ransomware.md](anti-ransomware.md).
