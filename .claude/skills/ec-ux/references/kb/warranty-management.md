# Warranty Management

> Tracking and auto-detection of hardware warranty information for every managed computer (Dell, Lenovo, Toshiba auto-detected), with soon-to-expire and expired alerts and schedulable reports. Parent module: [IT Asset Management](it-asset-management.md). Available in Endpoint Central Professional and Enterprise editions (and UEM/Security bundles); a Free edition exists with reduced endpoint limits (edition gating inferred — verify against the official edition-comparison matrix).

## 1. What it is — Feature detail

A warranty management system keeps tabs on the warranty information of IT assets so that faulty or damaged hardware can be replaced or repaired by the vendor in a timely manner. Endpoint Central's warranty tracking feature lets you record warranty information for IT hardware — Service Tag, date of purchase, date of expiry — and then automates verification. The agent on each client machine scans for asset details, sends them to the Endpoint Central server, and reconciles against the recorded inputs, so warranty tracking runs with essentially no day-to-day administrator intervention.

### Auto-detection
For major OEMs, warranty details are retrieved **automatically**. The official warranty page lists **Dell, Toshiba, and Lenovo** as auto-detected (the ITAM overview also mentions HP — treat HP as supported-but-verify, marked inferred). The agent reads device identifiers (e.g., the **Service Tag**) and the server reconciles them against vendor data. For OEMs outside the supported set, or where the identifier is unreadable, the admin enters warranty details manually.

### Reports
The feature ships three specialized reports:
1. **Soon-to-Expire Warranty Report** — computers whose warranty will expire soon, with the number of days left.
2. **Expired Warranty Report** — computers whose warranty has already expired.
3. **Unidentified Computers Report** — computers for which the warranty could not be discovered (manual entry required).

Reports can be **scheduled by email** at a chosen frequency and **exported to PDF and CSV**.

### Capability summary
| Capability | Detail |
|---|---|
| Auto-detected OEMs | Dell, Lenovo, Toshiba (HP — inferred; verify) |
| Manual fields | Service Tag, purchase date, expiry date |
| Reports | Soon-to-Expire (days-left), Expired, Unidentified Computers |
| Delivery | Scheduled email; export PDF/CSV |
| Alerts | Warranty/asset alerts surfaced via inventory alerts (inferred linkage to Configure Alerts) |

### A note on "software warranty"
The product page also discusses *software* warranties (a manufacturer's contract guaranteeing condition/performance, covering repairs and fixes). In practice Endpoint Central's warranty tracking is centered on **hardware** entitlements; software-warranty handling is described conceptually and tracked the same way where applicable (inferred).

## 2. UX lens

### Console navigation path
- Reports: `Reports > Inventory Reports > Warranty Reports` (Soon-to-Expire / Expired / Unidentified Computers)
- Manual entry / Service Tag: per-computer warranty details within Inventory (exact path inferred — typically under the computer's inventory detail view).

### Step-by-step workflow
1. **Baseline scan.** Ensure each computer is under Scope of Management with the agent installed; the agent collects hardware identifiers on scan.
2. **Auto-detection runs.** For Dell/Lenovo/Toshiba, the server reconciles the Service Tag against vendor data and populates warranty status automatically.
3. **Fill gaps manually.** For Unidentified Computers, open the machine and enter Service Tag, purchase date, and expiry date.
4. **Review reports.** Open `Reports > Inventory Reports > Warranty Reports`; check Soon-to-Expire (days-left), Expired, and Unidentified.
5. **Schedule delivery.** Configure the warranty reports to email at a chosen frequency so the team is alerted proactively; export to PDF/CSV for procurement/finance.
6. **Act before expiry.** Renew warranties or plan hardware refresh before the days-left counter hits zero.

### Worked example (proactive renewal)
A 500-workstation Dell/Lenovo fleet auto-populates warranty status after the first scan. The Soon-to-Expire report (scheduled weekly by email) flags 30 machines with <60 days left. Procurement reviews the list, renews coverage on the 12 business-critical machines, and earmarks the other 18 for the next refresh cycle — avoiding both lapsed coverage and unnecessary renewals. The five "Unidentified" Acer machines are filled in manually with Service Tag and dates.

### UX research hooks / friction points
- **Unidentified computers need manual data entry** one machine at a time — a bulk Service-Tag import would reduce toil for non-supported OEMs.
- **Limited OEM coverage** means mixed fleets (HP/ASUS/Acer, etc.) carry manual overhead; admins want clarity on exactly which vendors auto-detect.
- **No purchase-cost / depreciation field** surfaced, so warranty data can't yet drive full financial-lifecycle decisions.
- **Days-left thresholds** for "soon-to-expire" should be configurable and tied to alerting to avoid surprises.
- **Auto-detection is silent** — admins have little feedback on *why* a machine ended up Unidentified (bad tag vs. unsupported OEM vs. no internet); a per-machine reason would speed remediation.

## 3. PM lens

### Value & positioning
Warranty tracking protects against unexpected repair costs and ensures hardware is upgraded or claimed before coverage lapses — "complete visibility into your guarantees and privileges." It doubles a UEM/ITAM platform as a warranty tracking tool, reinforcing the single-console story. Customer proof point (Barentz International): automatic warranty status detection lets the team know proactively which systems are going out of warranty, plus multi-domain AD integration.

### Personas & use cases
- **IT Asset Manager / hardware owner** — avoid missed warranty claims; plan refresh.
- **IT Procurement / Finance** — budget replacements, maximize ROI on devices.
- **Service desk** — confirm coverage before authorizing repairs.
- Centralized, growing organizations managing hundreds-to-thousands of workstations across offices.

### Edition gating & expansion opportunities
- Bundled with ITAM in paid editions; Free edition limited (inferred).
- **Expansion:** broaden OEM auto-detection (HP confirmation, ASUS, Acer, Apple, etc.); add purchase cost + depreciation for full financial lifecycle; predictive refresh combining warranty + asset age + DEX experience scores; vendor-API live warranty lookups; configurable multi-tier expiry thresholds wired to alerts.

## 4. Developer / Technical lens

### Mechanics & data collection
- The agent collects hardware identifiers (Service Tag and related fields) during inventory scans and posts them to the server.
- The server reconciles identifiers against OEM warranty data for supported vendors; manual inputs override/fill where auto-detection is unavailable.
- Warranty status drives the three reports and the days-left calculation.

### Ports / protocols (shared ITAM path — inferred)
- On-prem: **8020** (agent↔server), **8027** (on-demand). Cloud: **443** to `desktopcentral.manageengine.com` and `dms.zoho.com`.
- Outbound vendor-data lookups likely require internet access from the server for auto-detection (inferred).
- Mail Server must be configured for scheduled report email.

### Data model (inferred naming)
- WarrantyRecord (ServiceTag, purchaseDate, expiryDate, vendor, status, daysLeft), Computer/Asset linkage.

### Reports reference
| Report | Contents | Primary use |
|---|---|---|
| Soon-to-Expire Warranty | Computers with warranty expiring soon + days left | Proactive renewal / refresh planning |
| Expired Warranty | Computers past warranty | Risk visibility; prioritize replacements |
| Unidentified Computers | Machines with no discovered warranty | Manual data-entry queue |

### Limits
- Auto-detection limited to a fixed OEM set (Dell, Lenovo, Toshiba; HP inferred).
- Depends on a readable Service Tag and a successful scan.
- No native cost/depreciation tracking surfaced.
- Internet/server reachability to vendor data required for auto lookups (inferred).
- Configurable "soon-to-expire" thresholds and per-machine detection-failure reasons are not surfaced (inferred gap).

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
|---|---|---|
| Warranty shows "Unidentified" | OEM not in supported set, or Service Tag unreadable | Enter Service Tag, purchase date, expiry date manually for that computer. |
| Auto-detection not populating for a Dell/Lenovo/Toshiba | Scan stale, server lacks internet, or identifier not captured | Run a scan; verify server outbound access; confirm the agent collected the Service Tag. |
| Not receiving scheduled warranty reports | Mail Server not configured or schedule disabled | Configure Mail Server; re-create/enable the scheduled report. |
| Days-left looks wrong | Manual expiry date incorrect, or auto data not refreshed | Correct the manual entry or re-scan to refresh auto-detected data. |
| Computer missing from warranty reports | Not in Scope of Management or agent error | Add to SoM; verify agent health with the agent troubleshooting tool. |

### FAQs
- *Which OEMs auto-detect?* Dell, Toshiba, Lenovo (HP — inferred; verify).
- *What if my OEM isn't supported?* Enter Service Tag, purchase date, and expiry date manually.
- *Can I get reports by email?* Yes — schedule them at a chosen frequency; export to PDF/CSV.
- *Which reports exist?* Soon-to-Expire, Expired, and Unidentified Computers.
- *Do I need anything before warranty tracking works?* The machine must be under SoM with a healthy agent and at least one successful scan.

## Cross-references
- [it-asset-management.md](it-asset-management.md) — parent module; hardware inventory and scan engine that feed Service Tag data.
- [endpoint-intelligence-dex.md](endpoint-intelligence-dex.md) — asset age + warranty can feed hardware-refresh decisions.

## Sources
- https://www.manageengine.com/products/desktop-central/software-warranty-management.html
- https://www.manageengine.com/products/desktop-central/help/inventory/viewing_system_warranty_reports.html
- https://www.manageengine.com/products/desktop-central/it-asset-management.html
