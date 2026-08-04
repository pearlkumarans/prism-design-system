# Endpoint Central — Reporting & Auditing

> Endpoint Central's reporting and auditing module turns the data its agents collect into compliance evidence and operational insight: 100+ pre-built reports across modules; audit-ready templates aligned to HIPAA, CIS, GDPR, PCI DSS, ISO 27001, NIST, RBI, and DPDPA; 200+ out-of-the-box Active Directory reports; wizard-based custom reports (table and chart) with Group By, filters, and Formula Columns; raw-SQL query reports with built-in date functions for anything the canned/custom reports can't express; agent-based user-logon reports; scheduled email delivery in CSV/XLS/PDF; PII masking on export; and compliance dashboards. Documented under **Features → Reports** in the help (`help/reports/desktop-central-reports.html`), available across On-Premises and Cloud editions.

---

## 1. What it is — detail

Reporting and auditing in Endpoint Central is the layer that makes the platform's continuous data collection usable for **compliance, audit, and decision-making**. Because the same agent that manages and secures an endpoint also inventories it, EC can report on patches, software, hardware, configurations, USB usage, power, logons, and security posture from one place, and frame that data against regulatory standards. The help frames reports as "the bedrock for your IT audit and compliance."

### Console navigation
- **`Reports` tab** — the central console view; authorized users pick the required **report type** and **filter** and generate. The tab is organized into report categories (below). On-Premises and Cloud builds expose slightly different layouts but the same core categories.
- Key sub-actions launched from the Reports tab: **Add Schedule Report**, **New Custom Report** (under User-defined Reports → Custom Reports), **Query Report** button, plus **Report Settings** and **Export Settings**.

### Report categories (out-of-the-box, from the help)
Endpoint Central groups reporting under the following categories on the Reports tab:

| Category | Members (from the help) |
| --- | --- |
| **User-defined Reports** | Schedule Reports; Custom Reports (wizard, table & chart); Custom Dashboards; Query Reports |
| **Active Directory Reports** | Group Reports; Computer Reports; GPO Reports; Domain Reports; OU Reports (200+ AD reports total) |
| **Security Reports** | Application Control; BitLocker; Browser; Device Control; Vulnerability; Vulnerable Patches; Patch; Supported Patches |
| **Self-service Portal Reports** | Usage statistics / ROI dashboard for the self-service portal |
| **Configuration Reports** | Configurations by User; Configurations by Computer; Configurations by Type |
| **Task Reports** | Task/deployment status reports |
| **Power Management Reports** | System uptime/downtime, device-usage and power-consumption analysis |
| **USB Reports** | Audit of USB/peripheral devices used to access corporate data |
| **Inventory Reports** | Hardware Inventory; Software Inventory; Software Compliance; System Details; Warranty |
| **User Log-on Reports** | Agent-based logon tracking (General / Usage / History sub-reports — see below) |
| **MDM Reports** | Mobile device management reports |

### User-defined reports — detail
- **Custom Reports (wizard-based):** EC ships 100+ pre-built reports; Custom Reports add tailor-made views. Two report **types**:
  - **Table** — pick **Sub Module** (Computer, Hardware, or Software), select/reorder columns (drag), use **Group By** to summarize (grouped columns appear first), add multiple **filter conditions** with a customizable **criteria pattern** (pencil icon), **Preview Table**, then **Save**.
  - **Chart** — choose chart type (**Bar, Line, Area, Pie, Dial, Pyramid, Funnel**), pick X-axis and Y-axis columns, **Preview Chart**, then **Save**.
  - **Formula Columns** — rule-based derived columns: name the column, define a **Derived Value Name** (label applied when criteria match, e.g., `ADF_Computers` for names starting with "ADF"), define matching criteria, add up to **5 derived values** (max **30 criteria** total across them), and label unmatched records. Usable in reports, dashboards, and filters like standard columns.
  - **Limitations (from the help):** chart-based custom reports **cannot be scheduled** and **cannot be exported**; a formula column created by one technician isn't visible to another; a formula column created in one sub-module doesn't carry to another.
- **Query Reports (raw SQL):** create via the **Query Report** button on the Reports tab. Provide a SQL query; save for reuse and/or export to CSV. Used when canned/custom reports can't express the need.
  - **Where to get the query:** EC support (`endpointcentral-support@manageengine.com`) or the online custom-query-request form — support processes the requirement and returns the query.
  - **Built-in date functions** (dates are stored as Long in the DB): `LONG_TO_DATE()` to render a stored Long as readable date in results; `DATE_TO_LONG(mm/dd/yyyy hh:mm:ss)` to use a date inside the query (e.g., `WHERE DETECTED_TIME BETWEEN DATE_TO_LONG(...) AND DATE_TO_LONG(...)`).
  - **Date templates** for relative ranges: `<from_today>/<to_today>`, `<from_yesterday>/<to_yesterday>`, `<from_thisweek>/<to_thisweek>`, `<from_lastweek>/<to_lastweek>`, `<from_thismonth>/<to_thismonth>`, `<from_lastmonth>/<to_lastmonth>`, `<from_thisquarter>/<to_thisquarter>`, `<from_lastquarter>/<to_lastquarter>`.
- **Custom Dashboards** — assemble report widgets into dashboards.
- **Canned reports** — ready-made on Patch Management, Asset Management, Active Directory, and other modules.

### Active Directory reports (200+)
EC ships **200+ out-of-the-box AD reports** across **Group, Computer, GPO, Domain, and OU** scopes (users, computers, groups, GPOs, OUs, sites, domains). They give **real-time visibility** to track AD changes, monitor user activity/access, watch critical-group changes, and assess AD health/integrity. (AD reports read directly from the directory — accuracy depends on inter-DC replication; see User-Logon contrast below.)

### User Logon Reports (agent-based)
Generated with the help of the **Endpoint Central agents on client systems** — more accurate and richer than AD's last-logon data because they include logon time, logoff time, the computer logged on from, the reporting domain controller, and full **logon history**. Navigate to **`Reports tab > Other Reports > User Logon Reports`** (also reachable as `Reports > User Logon Reports`). Three sub-categories:
- **General Reports:** Currently Logged on Users; Currently Logged on Computers.
- **Usage Reports:** Computers with No User Logon.
- **History Reports:** User Logon History; User Logon History by Computers; User Logon History on Domain Controllers; Domain Controllers with Reported Users. (History depth is configurable in **Report Settings**.)
- **vs AD reports:** AD reports may be stale (DCs replicate only at intervals, often weekly) and limited to username + last logon. User-Logon reports are agent-sourced, current, and historical — but **only for users/computers within the Scope of Management**, and they won't capture users who log on and immediately log off.

### Configuration Reports
Audit/log every configuration deployed to an endpoint. Three types: **Configurations by User** (configs per user, count, latest, time, domain), **Configurations by Computer** (per managed endpoint: computer/domain name, count, latest, time), **Configurations by Type** (by functionality — browser, USB, security policies, drive mapping, etc., with OS type and details). All exportable to PDF/CSV/XLSX with privacy controls.

### Audit-ready compliance templates
Pre-configured report templates mapped to major frameworks so teams don't hand-build evidence per audit:
- **HIPAA** — confidentiality/security of PHI.
- **CIS Controls / CIS Benchmarks** — assesses CIS best-practice implementation (EC supports 75+ CIS benchmarks in its security configuration management).
- **GDPR** — tracks/audits user access to personal data; aligns to GDPR data-protection principles.
- **PCI DSS** — payment-card-data security requirements.
- **ISO** — ISO 27001:2013 controls.
- **NIST** — NIST 800-171 for orgs handling CUI for DoD/NASA/federal/state agencies.
- **RBI** — Reserve Bank of India cyber-resilience guidelines.
- **DPDPA** — India's Digital Personal Data Protection Act.

### Scheduled reports
Deliver predefined, query, and custom reports automatically by email in **CSV, XLS, or PDF**. Delivery formats: **Attachment**, **Zipped file** (for many reports), or **URL** (when the report exceeds the mail server's size limit — EC publishes it on the Central Server and emails a download URL plus a code mapped to the file path).

### Export settings & PII
Reports export as **PDF, CSV, XLSX**. **Export Settings** let admins **mask or remove Personally Identifiable Information (PII)** from reports, and retain/remove/mask PI data per export — important for sharing evidence externally.

### Compliance dashboards
Present posture against the standards above for at-a-glance gap identification before an audit.

---

## 2. UX lens (roles, workflows, UX research hooks, UI patterns)

### Roles
- **IT administrator** — runs inventory/patch/configuration reports operationally; builds custom, formula-column, and query reports.
- **Compliance officer / auditor** — consumes compliance templates and dashboards; primary audience for scheduled PDF/XLS deliveries.
- **CISO / IT manager** — monitors security/compliance dashboards; receives scheduled summaries.
- **External auditor** — receives exported evidence (CSV/XLS/PDF), often PII-masked, rather than console access.

### Core workflows (step by step)

**Build a wizard-based custom report (table):**
1. `Reports` tab → **User-defined Reports → Custom Reports** → **New Custom Report**.
2. Enter **Name**; select **Sub Module** (Computer / Hardware / Software); set type **Table**.
3. Select & reorder columns (drag); optionally **Add Formula Columns**.
4. Use **Group By** to summarize; add **filter conditions** and edit the **criteria pattern**.
5. **Preview Table** → **Save**. Edit later via the Edit option; export to PDF/XLSX/CSV with PII masking.

**Build a chart custom report:**
1. Same entry → type **Chart** → pick chart type (Bar/Line/Area/Pie/Dial/Pyramid/Funnel).
2. Choose X-axis and Y-axis columns → **Preview Chart** → **Save**. (Note: chart reports can't be scheduled or exported.)

**Create a query (SQL) report:**
1. `Reports` tab → **Query Report** button.
2. Paste the SQL (use `LONG_TO_DATE()`/`DATE_TO_LONG()` and date templates as needed).
3. Run → **Save** for reuse and/or export to CSV.

**Schedule a report:**
1. `Reports` tab → **Add Schedule Report**.
2. Provide **Scheduler Name** + **Description**; choose reports from the categories.
3. Set **report format** (CSV/XLS/PDF) and **delivery format** (Attachment / Zipped / URL) with a **size limit** (over-limit → published on server + URL emailed).
4. Add **recipient email IDs**; configure **frequency** and generation time.
5. **Save**. Use **Execute Now** in the Actions column to send immediately.

**Run a compliance/audit cycle:**
1. Select the framework template (CIS/HIPAA/etc.) → scan → review the compliance dashboard.
2. Remediate gaps in the underlying module (patch/CIS/configuration) → re-scan.
3. Schedule the recurring framework report as ongoing evidence.

### UX research hooks
- **Query report = power-user signal.** The raw-SQL escape hatch (and the fact queries come from *support*) signals the wizard doesn't satisfy advanced needs. Track query frequency and which fields drive them — roadmap input for the custom builder and formula columns.
- **Self-service query authoring gap.** Users must email support for queries; a guided/AI query builder is an obvious improvement.
- **Chart limitations friction.** Chart reports can't be scheduled or exported — surprising; worth signposting in-UI.
- **Formula-column scoping confusion.** Per-technician / per-sub-module visibility limits sharing; usability + governance opportunity.
- **Audit-evidence packaging.** Study whether auditors want a single PDF pack vs per-control exports; scheduled multi-format + PII masking are the levers.
- **Template discoverability.** 8+ frameworks × many report families is an IA challenge worth usability testing.

### UI patterns
- Reports-tab category navigation; wizard custom-report builder (column picker, Group By, filter/criteria-pattern editor, Formula Column dialog); chart-type picker with X/Y axis; Query Report SQL editor; Add Schedule Report dialog (format/delivery/size/recipients/frequency); Export Settings with PII masking; compliance dashboard cards/widgets.

---

## 3. PM lens (value, personas, positioning, editions, expansion)

### Value
- **Audit cost reduction:** pre-built framework templates + scheduled evidence delivery cut manual audit prep — concrete TCO and risk story.
- **Single source of truth:** reporting rides the same agent/inventory used to manage/secure endpoints, so compliance and operational pictures match.
- **Breadth of frameworks:** HIPAA, CIS, GDPR, PCI, ISO, NIST, plus India-specific **RBI/DPDPA** — a differentiator for regulated, geographically diverse customers.
- **Flexibility:** wizard + formula columns + raw SQL covers casual through power users.

### Personas (buying)
- **Regulated-industry IT/compliance leaders** (healthcare/HIPAA, finance/PCI/RBI, EU/GDPR) — compliance templates drive purchase.
- **Enterprises with heavy AD estates** — the 200+ AD reports + agent-based user-logon accuracy stand out.

### Positioning & editions
- **Compliance-ready reports are broadly available** (reporting positioned as accessible, not gated) which strengthens the "land" motion; the underlying **data** depends on which modules are licensed.
- Depth of *security* reports (Vulnerability, Application Control, BitLocker, Browser, Device Control) pulls customers toward the **Security edition** where those modules live.

### Expansion opportunities
- **Self-service / AI query authoring** — generate query reports and summaries from natural language instead of emailing support.
- **Auditor portal / evidence packs** — packaging scheduled, framework-mapped, PII-masked evidence as a shareable pack is a natural premium capability.
- **Schedulable/exportable charts** — close the current chart-report limitation.
- **Cross-technician formula-column sharing** — promote reusable derived columns to org-level assets.
- **Additional regional frameworks** — RBI/DPDPA appetite suggests more region-specific compliance lanes.

---

## 4. Developer / Technical lens

- **Data foundation:** reports are generated from the EC database (PostgreSQL or MSSQL) populated by agent scans (inventory, patch, configuration, USB, logon, power) and by Active Directory data the server gathers (sites/domains/OUs/groups/computers).
- **Date storage:** timestamps are stored as **Long integers**; query reports must use `LONG_TO_DATE()` / `DATE_TO_LONG()` to convert (e.g., `invsoftware.DETECTED_TIME`). Date templates expand to from/to bounds at run time.
- **User-logon reports** depend specifically on the **agent on client systems** (not AD replication), which is why they're current and historical but limited to Scope of Management.
- **Query reports** expose **direct, read-oriented SQL** against the product schema — powerful but schema-coupled; tables like `invsoftware` are targeted directly. Queries are sourced from support to stay schema-correct.
- **Sub-module model (custom reports):** Computer / Hardware / Software sub-modules; formula columns are scoped per technician and per sub-module.
- **Export formats:** CSV, XLS/XLSX, PDF; PII masking/removal applied at export.
- **Delivery:** scheduled reports emailed via server SMTP; large reports published on the Central Server with a URL + path-mapped code.
- **Dashboards** aggregate compliance and module posture.

---

## 5. Support / Troubleshooting lens

### Symptom → Cause → Fix
| Symptom | Likely cause | Fix |
| --- | --- | --- |
| **Report empty / incomplete** | Agents not reporting in or latest scan not completed, so the DB lacks data. | Confirm relevant agents are healthy and have completed their latest scan (see architecture/agent doc); re-scan; check Scope of Management. |
| **User-logon report shows no data** | Agent-based reports cover only users/computers within Scope of Management; agent not installed/checking in; user logged on/off too quickly to record; the underlying logon-tracking setting disabled. | Verify target is within SoM and the agent is installed and checking in; enable **logon/logoff tracking** in **Report Settings**; note transient logon/logoff sessions aren't captured. |
| **User-logon History too short / missing older entries** | History-days window in Report Settings is small. | Increase the configurable history depth under **Report Settings** (User Logon Reports). |
| **AD report data missing/stale** | EC server can't reach AD or the account lacks read rights; or inter-DC replication lag. | Verify the server's AD connection and that the configured account can read sites/OUs/groups; for currency, prefer agent-based **User Logon Reports** over AD reports. |
| **Scheduled report not delivered** | SMTP/mail-server misconfigured; bad recipients; report set no longer resolves; size exceeded mail limit. | Check server SMTP config, recipient list, format, schedule; if oversized, choose **URL** delivery (publish on server + emailed link); use **Execute Now** to test. |
| **Scheduled report arrives as a link, not attachment** | Total report size exceeded the configured size limit. | Expected behavior — EC publishes on the Central Server and emails a download URL + code; raise the size limit or split the report set if attachments are required. |
| **Custom report can't find a field** | Wizard/sub-module doesn't expose the needed field combination. | Fall back to a **Query Report** (raw SQL); request the query from EC support if unsure of the schema. |
| **Chart custom report won't schedule / export** | By design, chart-based custom reports can't be scheduled or exported. | Use a **table** custom report (or query report) for scheduling/exporting; keep charts for on-screen analysis. |
| **Formula column not visible to a colleague / in another module** | Formula columns are scoped per technician and per sub-module. | Recreate the formula column under the other technician/sub-module; (roadmap) request org-level sharing. |
| **Query report returns unreadable Long dates** | Date columns stored as Long. | Wrap with `LONG_TO_DATE(<column>)` in the SELECT; use `DATE_TO_LONG()` in WHERE clauses. |
| **Compliance dashboard shows gaps** | Dashboard reflects the last scan state. | Remediate via the underlying module (patch/CIS/configuration), then re-scan. |
| **"Report/feature missing"** | Underlying module not licensed in the edition (reporting is broad, but data depends on modules). | Confirm the relevant module (e.g., security modules for Vulnerability/BitLocker reports) is licensed/enabled. |
| **PII visible in exported evidence** | Export Settings not configured to mask/remove PII. | Configure **Export Settings** to mask or remove PII before exporting/sharing. |

### Diagnostics
- Verify agent health and last scan time (the source of most report data).
- Validate AD connectivity/permissions for AD reports; prefer agent-based logon reports for currency.
- Check Report Settings (logon tracking, history days) and Export Settings (PII).
- Test scheduled reports with **Execute Now**; validate SMTP.

### FAQs
- *Which formats can reports be exported/delivered in?* PDF, CSV, XLS/XLSX (delivery: Attachment, Zipped, or URL).
- *How do I report on something the wizard can't reach?* Use a Query Report (raw SQL); obtain the query from EC support if needed.
- *Why are my AD logon numbers stale?* AD replication is periodic; use agent-based **User Logon Reports** for accurate, historical data (within Scope of Management).
- *Can I auto-deliver reports?* Yes — Add Schedule Report with format, delivery type, recipients, and frequency; use Execute Now for immediate sends.
- *Can I hide personal data in exports?* Yes — Export Settings support masking/removing PII.

---

## Cross-references
- `00-product-overview.md` — module map, editions, integrations.
- `01-architecture-agent-deployment.md` — agent data collection and check-in (the source of report data), database, AD as a data source.
- [configuration-management.md](configuration-management.md) — Configuration Reports (by User/Computer/Type) audit deployed configs.
- [endpoint-intelligence-dex.md](endpoint-intelligence-dex.md) — DEX scoring complements reporting with experience telemetry.

## Sources
- Reports & Audit (categories, settings, export): https://www.manageengine.com/products/desktop-central/help/reports/desktop-central-reports.html
- Custom Reports: https://www.manageengine.com/products/desktop-central/help/reports/custom_reports.html
- Creating Custom Reports (table/chart, Group By, Formula Columns): https://www.manageengine.com/products/desktop-central/help/reports/creating_custom_reports.html
- Query Reports (SQL, date functions, templates): https://www.manageengine.com/products/desktop-central/help/reports/custom_query_report.html
- Scheduled Reports (formats, delivery, steps): https://www.manageengine.com/products/desktop-central/help/reports/scheduled_reports.html
- User Logon Reports (General/Usage/History): https://www.manageengine.com/products/desktop-central/help/reports/user_logon_tracking_reports.html
- Configuration Reports (by User/Computer/Type): https://www.manageengine.com/products/desktop-central/help/reports/viewing_configuration_reports.html
- Active Directory Reports: https://www.manageengine.com/products/desktop-central/windows-active-directory-reports.html
- Reporting & Auditing feature page: https://www.manageengine.com/products/desktop-central/reporting-auditing.html
- Compliance pages — HIPAA https://www.manageengine.com/products/desktop-central/hipaa-compliance.html ; CIS https://www.manageengine.com/products/desktop-central/cis-compliance.html ; GDPR https://www.manageengine.com/products/desktop-central/gdpr-compliance.html ; PCI DSS https://www.manageengine.com/products/desktop-central/pci-dss-compliance.html ; ISO 27001 https://www.manageengine.com/products/desktop-central/iso-27001-compliance.html ; NIST https://www.manageengine.com/products/desktop-central/nist-compliance.html ; RBI https://www.manageengine.com/products/desktop-central/rbi-compliance.html ; DPDPA https://www.manageengine.com/products/desktop-central/dpdpa-compliance.html
- Edition Comparison Matrix: https://www.manageengine.com/products/desktop-central/edition-comparison-matrix.html

*Note: Items marked "(inferred)" are reasoned conclusions not stated verbatim on the cited pages.*

---

## Appendix A — Settings / options reference

| Setting / option | Where | What it controls |
| --- | --- | --- |
| **Report Settings** | `Reports` tab → Report Settings | Personalizes report generation; enables **user logon/logoff tracking**; configures **User Logon History days**; enables power-management reporting. |
| **Export Settings** | `Reports` tab → Export Settings | Export formats (PDF/CSV/XLSX) and **PII masking/removal/retention** on export. |
| **Scheduler — report format** | Add Schedule Report | CSV / XLS / PDF. |
| **Scheduler — delivery format** | Add Schedule Report | Attachment / Zipped file / URL (over-size → published on server + URL). |
| **Scheduler — size limit** | Add Schedule Report | Threshold above which reports are published as a URL instead of attached. |
| **Scheduler — recipients & frequency** | Add Schedule Report | Multiple recipient emails; cadence and generation time; **Execute Now** for immediate send. |
| **Custom report — Sub Module** | New Custom Report | Computer / Hardware / Software data domain. |
| **Custom report — Group By / Filter / Criteria pattern** | New Custom Report | Summarization, multi-condition filters, and the boolean criteria pattern. |
| **Formula Column** | New Custom Report | Up to 5 derived values, max 30 criteria; per-technician, per-sub-module scope. |
| **Query report — date helpers** | Query Report | `LONG_TO_DATE()`, `DATE_TO_LONG()`, and `<from_*>/<to_*>` date templates. |

## Appendix B — Prerequisites checklist
- [ ] Agents installed and completing scans (source of inventory/patch/config/USB/power/logon data).
- [ ] For AD reports: server connected to AD with an account that can read sites/OUs/groups/computers.
- [ ] For user-logon reports: targets within Scope of Management; logon/logoff tracking enabled in Report Settings.
- [ ] For scheduled delivery: server SMTP/mail configured; valid recipient list.
- [ ] For external sharing: Export Settings configured for PII masking/removal.
- [ ] For query reports: the SQL query (request from EC support if needed); read access to the product schema.

## Appendix C — Compliance template quick map
| Framework | Primary fit | Notes |
| --- | --- | --- |
| HIPAA | Healthcare / PHI | Confidentiality & security of protected health information. |
| CIS | General hardening | Backed by 75+ CIS benchmarks in security configuration management. |
| GDPR | EU personal data | Tracks/audits access to personal data. |
| PCI DSS | Payment card data | Cardholder-data security requirements. |
| ISO 27001:2013 | ISMS controls | Control alignment evidence. |
| NIST 800-171 | US gov / CUI | DoD/NASA/federal/state CUI handlers. |
| RBI | Indian banking | RBI cyber-resilience guidelines. |
| DPDPA | Indian personal data | Digital Personal Data Protection Act access tracking. |
