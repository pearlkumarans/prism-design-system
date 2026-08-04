# Software License Management

> Documenting, tracking, and controlling all software licenses across the organization from one console — with automatic compliance detection (over-/under-use), CSV import, product-key storage, and expiry alerts. Parent module: [IT Asset Management](it-asset-management.md). Available in Endpoint Central Professional and Enterprise editions (and UEM/Security bundles); a Free edition exists with reduced endpoint limits (edition gating inferred — verify against the official edition-comparison matrix).

## 1. What it is — Feature detail

Software License Management (SLM) is the process of documenting, tracking, and controlling the software licenses used throughout an organization from a single console. A software license is a legal document that sets rules for using and distributing software (terms, restrictions, limitations, disclaimers); SLM helps you comply with those agreements — including end-user license agreements (EULA) — flag over- or under-usage, and stay ahead of expiry.

Endpoint Central's SLM is built on its always-current software inventory (gathered via **differential asset scanning**, which transmits only detected changes to conserve bandwidth) and adds entitlement tracking on top.

### Common software license types (increasing restrictiveness)
- **Public Domain** — anyone may use/modify, no restrictions.
- **Lesser General Public License (LGPL)** — open-source libraries may be linked; the LGPL component must remain under LGPL.
- **Permissive** — modify/distribute with few restrictions.
- **Copyleft** — modify/distribute provided the same rights carry forward.
- **Proprietary (commercial)** — no copy/modify/distribute; most restrictive; needs active product-key management for compliance.

### Key capabilities
- **Updated software inventory** — periodic differential scans detect newly installed/uninstalled software across Windows, macOS, and Linux.
- **Compliance reports** —
  1. **Software License Compliance Report** — commercial software with its compliance status, computed from the data entered under Manage Software Licenses.
  2. **Software Licenses to be Renewed Report** — licenses expiring soon (configurable time period) and already-expired licenses.
- **Compliance alerts** — email alerts for (1) non-compliance (over-/under-licensed), (2) software used past its validity period, (3) license usage falling below a specified limit.
- **Centralized key store** — product/license keys, invoices, proof of purchase, warranty details kept in one place ("software license key management").
- **Group software** — combine multiple editions/versions under one entry for unified tracking.
- **Reconciliation** — compares licenses owned vs. installations detected, highlighting over-deployment or shelfware.

### Compliance computation
Status is derived from purchased licenses vs. detected installations and shown by color: **blue = Over Licensed, green = In Compliance, red = Under Licensed**. Two installation counts exist: **Network Installations** (all managed devices) and **Managed Installations** (only devices in the logged-on technician's scope via Custom Group/Remote Office) — a frequent source of "why do our numbers differ?" confusion.

## 2. UX lens

### Console navigation path
- `Inventory > Manage Licenses` (under Actions/Settings) → **Add License** / **License > Import from CSV** / **Add More**
- `Inventory > Group Software` (Create Software Groups)
- Reports: `Reports > Inventory Reports > Software Compliance Reports`
- Alerts: `Inventory > Actions/Settings > Configure Alerts`

### Step-by-step: the four-stage lifecycle
**Stage 1 — Discovery.** Run an asset scan across all endpoints to build/update the software inventory; identify commercial software needing tracking; flag unauthorized/end-of-life apps for removal.

**Stage 2 — Centralization.** Consolidate license details in one place.
- *Manual:* `Manage Licenses > Add License` → pick the software (manufacturer + version pre-filled and locked) → fill license fields → optionally attach the license file/invoice + comments → associate computers (Installed vs. Managed) → **Save**.
- *Bulk CSV:* `Manage Licenses > License > Import from CSV` → build a `.csv` matching the in-console Sample format → browse → **Save**. Documented columns: **Product Name, Manufacturer, Version, License Owner, Number of licenses, License Name, Licensed To, Purchase Date, Expiry Date, License Key**. Always inspect the in-console Sample CSV first, since accepted columns/order are defined there.
  ```
  Product Name,Manufacturer,Version,License Owner,No. of Licenses,License Name,Licensed To,Purchase Date,Expiry Date,License Key
  Acme PDF Pro,Acme Corp,12.0,IT Dept,250,Acme-VLK-2026,Contoso Inc,2026-01-15,2027-01-14,ABCDE-12345-FGHIJ-67890
  ```
- *Group editions:* `Inventory > Group Software` → combine versions/editions under one entry for unified compliance.

**Stage 3 — Reclamation.** Use software metering to monitor actual usage; reclaim licenses from systems where the app is installed but idle; reallocate reclaimed seats before purchasing new ones.

**Stage 4 — Audit preparation.** Configure over/under-licensed alerts; schedule compliance reports; run periodic internal audits; renew based on current usage, not historical purchase volume.

### Renewals
On renewal, `Manage Licenses > Add More` (Actions column) → enter the additional license count → **Save**. Filter the Manage License view by Under/Over/In Compliance/Expired.

### UX research hooks / friction points
- **CSV import is field-heavy** and relies on the in-console sample — a guided column-mapper or procurement-system integration would cut errors.
- **Two installation counts** (Network vs. Managed) confuse scoped technicians.
- **Manual entitlement entry** is a one-time effort that organizations defer, weakening audit readiness — onboarding nudges would help.
- **Install-based model** misses SaaS/subscription entitlements entirely.

## 3. PM lens

### Value & positioning
Positioned as the compliance and cost backbone of ITAM: avoid audit penalties from publishers (Adobe, Microsoft, etc.), cut spend by reclaiming idle seats, and make renewals data-driven. Differentiator: unified with patching, metering, application control, and the rest of Endpoint Central — one console, one agent, across Windows/Mac/Linux, with cloud, on-prem, and hybrid deployment.

### Personas & use cases
- **IT Procurement / Finance** — renewal planning, reclamation, audit defense.
- **Compliance officer** — continuous compliance, internal audit cadence.
- **IT Asset Manager** — license sprawl control, edition consolidation, shadow-IT visibility.
- Mid-to-large enterprises, regulated industries, hybrid/remote-heavy orgs, MSPs (via Endpoint Central MSP).

### Edition gating & expansion opportunities
- Bundled with ITAM in paid editions; Free edition limited (inferred).
- **Expansion:** SaaS/subscription entitlement discovery and reconciliation (current model is install-based); automated reclaim triggered by metering thresholds; procurement/CMDB two-way sync; vendor-contract and true-up modeling; AI-driven renewal forecasting.

## 4. Developer / Technical lens

### Mechanics & data collection
- Built on the inventory scan engine: differential scans detect install/uninstall events and feed installation counts.
- Compliance = purchased licenses (manual or CSV) vs. detected installations; reconciliation surfaces gaps.
- License entitlements stored in the license repository; alerts evaluated on the successive scan after a change and against configured expiry/threshold rules.

### Ports / protocols (shared ITAM path — inferred)
- On-prem: **8020** (agent↔server), **8027** (on-demand). Cloud: **443** to `desktopcentral.manageengine.com` and `dms.zoho.com`.
- Mail Server must be configured before compliance alerts deliver.

### Data model (inferred naming)
- SoftwareProduct, LicenseGroup, License (count, key, owner, purchase/expiry dates, attachment), InstallationRecord (Network vs. Managed), ComplianceStatus, AlertRule.

### Limits
- **Install-based** — does not natively reconcile SaaS/subscription seats.
- CSV columns/order defined by the in-console sample (illustrative lists may differ).
- Compliance accuracy depends on grouping editions and on scan freshness.
- Scoped technicians see Managed Installations, not the full Network figure.

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
|---|---|---|
| Compliance status looks wrong | Editions/versions not grouped | Group all versions under one license group. |
| Counts differ from a colleague's | Network vs. Managed Installations | Managed = logged-on technician's scope; Network = all managed devices. |
| CSV import fails | Columns/order don't match sample | Download the in-console Sample CSV and match it exactly. |
| Over/under figures off | Wrong purchased count or expiry in CSV/manual entry | Correct the entitlement fields and re-check. |
| No expiry/non-compliance alerts | Mail Server not configured or last scan failed | Configure Mail Server; verify the computer's last successful scan first. |
| New software not tracked | Scan stale or app is non-commercial | Run a scan; confirm the app is flagged as commercial/tracked. |

### FAQs
- *What is software non-compliance?* Using software outside its license terms — e.g., more installs than entitled, or use after expiry. Risks: fines, legal action, reputational damage.
- *What does reconciliation analyze?* Licenses owned vs. installations detected, highlighting over-deployment or undeployed purchases.
- *Which OSes?* Windows, macOS, Linux.
- *How do I add licenses on renewal?* `Manage Licenses > Add More`.
- *Where are product keys stored?* Centrally, via the license key management feature.
- *Can I be alerted before expiry?* Yes — license-to-be-renewed alerts with a configurable lead time.

## Cross-references
- [software-metering.md](software-metering.md) — usage data that drives reclamation and renewal sizing.
- [prohibited-software.md](prohibited-software.md) — remove unauthorized/over-deployed software to restore compliance.
- [software-deployment.md](software-deployment.md) — deploy/uninstall to remediate under-/over-licensing.
- [it-asset-management.md](it-asset-management.md) — parent module; shared inventory and alerts.

## Sources
- https://www.manageengine.com/products/desktop-central/software-license-management.html
- https://www.manageengine.com/products/desktop-central/help/inventory/manage_software_licenses.html
- https://www.manageengine.com/products/desktop-central/it-asset-management.html
