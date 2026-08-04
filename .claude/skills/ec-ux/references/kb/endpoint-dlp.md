# Endpoint DLP

> Unified, policy-driven Data Loss Prevention for managed endpoints — discovers, classifies, and prevents leakage of sensitive data at rest, in motion, and in use across devices, applications, and the web. Parent module: [Endpoint Data Security](endpoint-data-security-dlp.md). Point product / edition: **Endpoint DLP Plus** (delivered through the Endpoint Security / Endpoint Data Security add-on for Endpoint Central). **On-premises only — not available in the cloud edition.**

---

## 1. What it is — Feature detail

In any enterprise the unmonitored flow of sensitive data is a serious threat to information security and regulatory compliance. Unintentional sharing, malicious exfiltration, or exposure of confidential files through endpoints can cause breaches, financial loss, and reputational damage. Endpoint Central's **Endpoint DLP** module answers this with a single, content-aware engine that detects, monitors, and prevents data leakage across every managed endpoint, giving administrators complete visibility into sensitive data **at rest, in motion, and in use** — without hindering employee productivity.

Endpoint DLP lives in its own console module with four sub-areas: **Data Classification** (data rules), **Policy Deployment** (Data Discovery + Data Loss Prevention), **Audit/Reports**, and **Settings**. It is complementary to the other data-security modules: DLP decides *whether sensitive content may leave* via a given channel; [Device Control](device-control.md) decides *whether a peripheral may be used at all*; [BitLocker Management](bitlocker-management.md) protects *data at rest on the whole drive*.

### Full capability breakdown
- **Sensitive Data Discovery & Classification** — automatically scan and categorize data stored across endpoints using content inspection and contextual analysis, including **OCR to scan content within images**. Identifies unstructured data and determines its sensitivity level. Discovery is the first step in classification.
- **Pre-defined Compliance Templates** — built-in policy templates aligned with **GDPR, HIPAA, PCI-DSS** and more, streamlining setup and ensuring consistent compliance across endpoints.
- **Data Classification Based on Custom Criteria** — RegEx, keywords, document matching, and file extensions to identify organization-specific sensitive data.
- **Centralized Policy Management** — create, deploy, and manage DLP policies from one unified console; consistent enforcement and simplified updates.
- **Data Containerization** — encapsulate sensitive data within secure containers on endpoints. By classifying trusted applications as "enterprise-friendly," data originating from them is automatically tagged sensitive and stays protected even on unmanaged devices.
- **Email and Web Upload Protection** — monitor/control sensitive data flow through email clients (Outlook) and web browsers; emails with sensitive content/attachments only go to permitted domains; block unauthorized uploads to web apps and third-party cloud storage.
- **Prevent Unauthorized Hard Copies** — restrict printing of sensitive data; granular print-control rules; log all print activity.
- **Removable Storage Device Control** — monitor/control USB drives and external storage; enforce read-only, approve specific devices, track all file transfers. Scoped to *sensitive* files (vs. [Device Control](device-control.md)'s blanket rules).
- **Real-time Alerts & Notifications** — instant alerts for policy overrides and false positives, giving IT visibility into user-justified exceptions and misclassifications.
- **Comprehensive Reports & Audit Logs** — logs/reports on user actions, file movements, and policy breaches for compliance audits.

### Data-rule type & example reference
| Rule type | Input | Threshold/option | Example (PII/PCI/PHI) |
| --- | --- | --- | --- |
| Predefined criteria | Built-in template | Category: Source Code, PII, Health, Finance, PCI DSS, HIPAA; country filter | "PCI DSS" template for card data; "HIPAA" for PHI |
| RegEx pattern | Regular expression | Occurrence count to flag | `^\d{3}-\d{2}-\d{4}$` → SSN (PII); card-number regex → PCI |
| Keyword matching | `.txt`/`.csv` keyword list | Occurrence count + case sensitivity | "Diagnosis", "ICD-10" → PHI; "Social Security Number" → PII |
| Document matching | `.doc`/`.docx`/`.pdf` (≥10 words) | Match percentage | A contract template → similar confidential docs |
| File extensions | Extension list | n/a | `.pem`, `.key`, `.sql` → flag all such files |

### Data states & the channels that protect them
- **Data in use** — File Access, Screen Capture, Clipboard.
- **Data in motion** — Email Client (Outlook), Removable Storage, Printers, File Upload (web).
- **Data at rest** — Data Discovery scans of local file systems (with recursion into supported password-protected archives: 7z, zip, tar, Bzip2, xz, Gzip, RAR/RAR4/RAR5, WIM, ISO, ARG, ISOUDF).

### Supported OS / platforms / coverage
- **Windows** with the agent-based discovery/classification engine. **On-premises only** — explicitly not available in the cloud edition (vendor note).
- macOS DLP parity is limited; the documented engine is Windows-centric (inferred).

### Prerequisites and key concepts/terminology
- Endpoint Central agent on endpoints; for email/upload monitoring, end-user **consent** to install the Outlook add-in and browser plugin.
- Key terms: data rule, predefined vs. custom criteria, RegEx/keyword/document/extension matching, occurrence threshold, match percentage, data discovery, data-in-use/motion/rest, trusted application/domain/device, consent settings, business override / false-positive, containerization, file tagging.

---

## 2. UX lens

### Console navigation path(s)
| Task | Navigation path |
| --- | --- |
| Create a data rule | **Endpoint DLP → Data Classification → New Data Rule** |
| Deploy/associate a DLP policy | **Endpoint DLP → Policy Deployment → Associate Policy** |
| Configure DLP channel controls | **Endpoint DLP → Policy Deployment → Data Loss Prevention** |
| DLP Outlook/browser consent | **Endpoint DLP → Policy Deployment → Configure Consent Settings** |
| DLP mail notifications | **Endpoint DLP → Settings → Configure Mail Notification** |
| DLP audit & reports | **Endpoint DLP → Audit/Reports** |

### Step-by-step workflow(s)

**Procedure 1 — Define a data rule (classification criteria)**
1. Go to **Endpoint DLP → Data Classification → New Data Rule**; enter a name and optional description.
2. Choose **Predefined Criteria** (categorized by Source Code, PII, Health, Finance, PCI DSS, HIPAA) — toggle categories, search, or filter by country — and **Save**; **or** choose **Create Custom Rule**:
   - **RegEx pattern** — enter the pattern and the occurrence threshold. Example: `^\d{3}-\d{2}-\d{4}$` for a US SSN; threshold 3 flags a file only when the pattern appears ≥3 times.
   - **Keyword Matching** — attach a `.txt`/`.csv` keyword list, set the occurrence threshold and case sensitivity.
   - **Document Matching** — attach a `.doc`/`.docx`/`.pdf` source (≥10 words) and set the required match percentage.
   - **File Extensions** — enter extensions to auto-classify all matching files as sensitive.

**Procedure 2 — Create and deploy a DLP policy**
1. **Policy Deployment → Associate Policy**; under **Select Custom Group**, pick target computer groups.
2. **Data Discovery** — select the data rules created earlier (password-protected archives can be classified as sensitive).
3. **Data Loss Prevention** — configure per-channel controls (see channel table below).
4. Configure **Consent Settings** to install the Outlook add-in and browser plugin — without consent these channels go unmonitored.
5. Optionally enable **Automatically Override if False-Positive** during tuning (logged for review).
6. Set **mail notifications** for overrides/false positives via **Settings → Configure Mail Notification**.

**DLP channel-control reference (data in use / motion / rest)** — each channel offers escalating control levels:

| Channel | State protected | Options (least → most restrictive) | Notable extras |
| --- | --- | --- | --- |
| **File Access** | In use | Not Configured → Audit Only → Allow Within Trusted Applications | Can disable Explorer preview pane; trusted-app list feeds Screen Capture & Clipboard |
| **Email Client (Outlook)** | In motion | Not Configured → Audit Only → Allow Within Trusted Domains → Block Emails with Sensitive Content/Attachments | Requires Outlook add-in consent |
| **Removable Storage** | In motion | Not Configured → Audit Only → Allow Within Trusted Devices → Block Sensitive File Transfers | Scopes to *sensitive* files |
| **Printers** | In motion (hard copy) | Not Configured → Audit Only → Allow Within Trusted Devices → Block Sensitive File Prints | Custom watermark; business-reason override; not supported for extension/context-based classifications |
| **File Upload (web)** | In motion | Not Configured → Audit Only → Allow Within Trusted Domains → Block Sensitive File Uploads | Browser extension + consent; choose monitored browsers; blind in Private/Guest mode |
| **Screen Capture** | In use | Allow → Block Within Trusted Applications | Trusted apps taken from File Access list |
| **Clipboard** | In use | Allow → block copy from trusted to untrusted apps/domains | Paste into browser allowed only for trusted domains |
| **File Download** | Tagging | Auto-mark files from enterprise apps / corporate web domains / emails as sensitive | Enables containerization-style tagging |

**Recommended phased rollout (best practice)**
1. **Discover first** — deploy in **Audit Only** across every channel to inventory where sensitive data lives and how it moves.
2. **Tune classification** — raise occurrence thresholds and document match percentages where false positives are noisy; enable false-positive override during tuning and review the log.
3. **Define trust** — populate trusted-application, trusted-email-domain, trusted-device, and trusted-upload-domain lists (reused by Screen Capture & Clipboard).
4. **Escalate controls** — move high-risk channels from Audit Only → Allow-Within-Trusted → Block; grant Outlook/browser consent so email/upload are actually enforced.
5. **Harden the edges** — disable Private/Guest browsing in managed browsers, disable the Explorer preview pane for sensitive files, add print watermarks.
6. **Operationalize** — configure mail notifications for overrides and schedule audit reports.

### UX research hooks
- **Discovery noise** — the occurrence-threshold and match-percentage knobs are the primary false-positive controls; study whether admins discover and tune them.
- **Consent friction** — email/upload channels silently go unmonitored without consent; surface consent status prominently.
- **Override clarity** — measure whether end users understand the business-override / false-positive path on a block.
- **Opportunity** — a "what would this policy block?" simulation mode against the discovery inventory before escalation.

---

## 3. PM lens
- **Value** — one content-aware engine covers discovery, classification, and egress controls (email, web, clipboard, print, screen capture, USB), eliminating point tools and demonstrating GDPR/HIPAA/PCI-DSS readiness with pre-defined templates and automated reporting.
- **Personas** — Security/Compliance Admin (rules, policies, violations); Endpoint Admin (deployment); Help Desk (override/false-positive triage); End user (business override on a block).
- **Positioning** — content-aware DLP at egress (not just USB/browser) bundled in a full UEMS suite with a single agent/console; competes with Microsoft Purview, Symantec/Forcepoint DLP, and GTB — edge is breadth and consolidation.
- **Edition / point-product gating** — Endpoint DLP Plus point product, or the Endpoint Security / Endpoint Data Security add-on. **On-premises only** — explicitly not in the cloud edition. 30-day free trial.
- **Expansion opportunities** — cloud-edition DLP to remove the on-prem-only limit; macOS/Linux parity; risk scoring combining discovery + device + access signals; auto-quarantine on violation and SIEM streaming; print restriction for context/extension-based classifications (documented gap).

---

## 4. Developer / Technical lens
- **Mechanics** — the Endpoint Central agent scans local file systems with content inspection (RegEx/keyword/document-similarity), OCR for images, and recursion into supported password-protected archives; occurrence thresholds and match percentages gate classification.
- **Enforcement channels** — File Access (trusted-app allow-listing; preview-pane disable), Email Client (Outlook add-in; trusted-domain or full block), Removable Storage (trusted-device or full block), Printers (trusted-printer, watermark, override), File Upload (browser extension; trusted domains; per-browser), Screen Capture (block within trusted apps), Clipboard (block copy trusted→untrusted). Browser extension does not operate in Private/Guest mode.
- **Ports/protocols** — secure agent↔server channel over HTTPS / EC management ports (inferred); REST API (API Explorer) for automation/reporting.
- **Data model / key objects** — Data Rule (predefined/custom), DLP Policy (per-channel settings), Incident/Override record, Discovery finding, trusted-application/domain/device lists.
- **Limitations** — on-prem only; print restriction unsupported for context/extension-based classifications; upload monitoring blind in Private/Guest browsing; macOS/Linux parity limited (inferred).

---

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
| --- | --- | --- |
| Excessive DLP false positives | Thresholds too low; broad extension rules | Raise occurrence thresholds / match percentages; narrow extension rules; enable false-positive override during tuning and review the log |
| Email or web upload not monitored | Consent not granted, so Outlook add-in / browser plugin not installed | Grant consent under Configure Consent Settings; disable Private/Guest browsing in managed browsers |
| Print not restricted for some files | Restriction unsupported for context/extension-based classifications | Use content-based rules for print-sensitive data (documented limitation) |
| Discovery missed sensitive files in archives | Archive format unsupported or password-protected handling not configured | Confirm format is in the supported archive list; enable archive classification |
| Image-based sensitive data not flagged | OCR not triggered / low quality | Confirm OCR is enabled in the data rule; content inspection runs on extracted text |

**FAQs**
- *Is DLP available in the cloud edition?* No — Endpoint DLP is on-premises only.
- *How do I cut false positives without blocking work?* Run Audit Only first, tune thresholds/match percentages, and enable false-positive override during tuning.
- *Why isn't email monitored after deploying?* Consent must be granted so the Outlook add-in installs.

---

## Cross-references
- [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) — parent data-security module overview.
- [device-control.md](device-control.md) — blanket peripheral/USB control; DLP's Removable Storage channel scopes to *sensitive* files only.
- [bitlocker-management.md](bitlocker-management.md) — data-at-rest full-disk encryption complementing DLP's at-rest discovery.
- [browser-security.md](browser-security.md) — browser DLP (uploads, screenshots, sync) complements the DLP browser-extension upload control.
- [secure-private-access.md](secure-private-access.md) — containerization and per-app VPN align with DLP tagging.
- [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) — least privilege reduces malware-driven data loss.
- [point-products.md](point-products.md) — Endpoint DLP Plus point product packaging.

## Sources
- https://www.manageengine.com/products/desktop-central/help/endpoint-dlp/dlp-overview.html
- https://www.manageengine.com/products/desktop-central/help/endpoint-dlp/create-data-rules.html
- https://www.manageengine.com/products/desktop-central/help/endpoint-dlp/deploy-dlp-policy.html
- https://www.manageengine.com/products/desktop-central/help/endpoint-dlp/dlp-audit-reports.html
- https://www.manageengine.com/products/desktop-central/help/endpoint-dlp/dlp-best-practices.html
