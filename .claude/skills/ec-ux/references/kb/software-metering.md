# Software Metering

> Tracking of application usage (usage count and usage duration) on managed endpoints so IT can reclaim idle licenses and right-size renewals. Parent module: [IT Asset Management](it-asset-management.md). Available in Endpoint Central Professional and Enterprise editions (and the UEM/Security bundles); a Free edition exists with reduced endpoint limits (edition gating inferred — verify against the official edition-comparison matrix).

## 1. What it is — Feature detail

Software metering is the analysis of software-usage statistics that helps IT administrators reduce the expense overhead incurred from unwanted renewals and upgrades. The Endpoint Central agent continuously monitors how often, and for how long, specific applications are used on managed computers, then posts that data periodically to the server. From those statistics, administrators derive a complete picture of used vs. unused software and can uninstall (and reclaim the license for) software that sits idle.

The unit of configuration is the **metering rule**. Each rule pins three things:

- **Software Name** — chosen from the discovered software inventory, so the rule always targets an application already present in the environment.
- **Rule Name** — a unique, descriptive label (e.g., "Monitoring Adobe Flash Player Usage"). Once used, a rule name cannot be reused for any other rule.
- **File Name** — the exact process file name *with its extension*: `.exe` on Windows, `.app` on macOS.

Platform support is a key nuance. The official help page states metering works on **Windows and macOS** computers; the marketing page still says "currently supporting Software Metering only for Windows." The prohibited-software listing surfaced inside the metering view is **Windows-only**. (Treat full Mac parity as recently added — surface it cautiously to mixed-fleet admins.) Metering rules **cannot** be created for software *groups*.

Three reports collate the data (`Reports > Inventory Reports > Software Metering Reports`):

1. **Software Metering Rules Summary** — per rule: **Discovered count** (computers with the app installed), **Usage count** (number of times the app was used across all computers), and **Usage duration** (how long it has been used).
2. **Computers with Metered Software** — the list of computers running a metered app, with per-computer usage count/duration over a chosen time period; used to retain or revoke a license per machine.
3. **Users with Metered Software** — usage details for user-specific software, useful when users roam across several computers but a per-user picture is still required.

### Capability summary
| Capability | Detail |
|---|---|
| Platforms | Windows and macOS (prohibited-software listing within metering is Windows-only) |
| Configuration object | Metering rule (Software Name + Rule Name + File Name with extension) |
| Reports | Rules Summary; Computers with Metered Software; Users with Metered Software |
| Metrics | Discovered count, Usage count, Usage duration |
| Data retention | Last 90 days from the current date |
| Rule scope limits | No rules for software groups; rule names must be unique |

## 2. UX lens

### Console navigation path
- Configure: `Inventory > Actions/Settings > Software Metering > Software Metering Rules > Add Rule`
- Summary: `Inventory > Actions/Settings > Software Metering > Software Metering Summary`
- Reports: `Reports > Inventory Reports > Software Metering Reports`

### Step-by-step workflow
1. **Find the exact process file name.**
   - Windows: open the app → Task Manager → **Details** tab → read the value under the **Name** column (e.g., `chrome.exe`).
   - macOS: open the app → Activity Monitor (Cmd+Space → "Activity Monitor") → CPU tab → select the main process → right-click → **Sample Process** or **Open Files and Ports** → read the path (e.g., `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`) and take the `.app` name, here `Brave Browser.app`. Watch for helper processes — pick the main one.
2. **Add the rule.** Go to `Inventory > Actions/Settings > Software Metering > Software Metering Rules > Add Rule`. Choose **Platform** (Windows or Mac). Enter Software Name (from inventory), a unique Rule Name, and the File Name (with extension).
3. **Wait for collection.** The agent begins metering from its **next 90-minute refresh cycle**; metered data is posted to the server **once per day**, so data appears the next day.
4. **Review.** Open Software Metering Summary, then drill into the three reports. Schedule report email delivery and export as needed.
5. **Act.** Where usage count/duration is consistently low, revoke or reallocate the license, or uninstall the app and return the seat to the pool (often paired with [software-license-management.md](software-license-management.md)).

### Reading the three reports (what to act on)
- **Rules Summary** answers "is this app worth keeping?" — a high Discovered count with a low Usage count is shelfware. Sort by Usage count/duration ascending to find reclaim candidates fast.
- **Computers with Metered Software** answers "which machines can I reclaim from?" — pick the per-machine rows with near-zero usage over the chosen window and target them for uninstall.
- **Users with Metered Software** answers "which person doesn't need this seat?" — essential for floating/roaming licenses where the install moves with the user.

### UX research hooks / friction points
- **Latency confuses first-time users.** "Why is my metering report empty?" is almost always the 90-min-then-daily cadence. A "data available from <date/time>" hint at rule-creation would prevent support tickets.
- **File-name derivation is manual and error-prone** — a wrong process name silently yields no data. A picker that maps discovered software to its known executable would reduce mistakes.
- **No group metering** means admins must add a rule per executable for multi-edition apps; a clear inline note avoids confusion.
- **Platform messaging mismatch** (help says Win+Mac, marketing says Windows only) creates uncertainty for Mac admins.
- **No in-context "reclaim" action** — metering reports inform but don't act; admins must jump to uninstall/license screens, breaking the workflow.

## 3. PM lens

### Value & positioning
Metering converts "we own N licenses" into "we actually use M of them," turning renewals into a data-driven decision instead of a rubber stamp. It is positioned as the cost-optimization engine inside ITAM and the natural feeder for license reclamation. Forrester TEI cites platform-level **442% ROI and $3.7M net savings** (not metering-only).

### Personas
- **IT Procurement / Finance** — reclaim idle seats before renewal; right-size purchase volumes.
- **IT Asset Manager** — identify shelfware and consolidate editions.
- **CIO / cost owner** — quantify software waste.

### Edition gating & expansion
- Bundled with ITAM in paid editions; Free edition limited (inferred). 
- **Expansion opportunities:** automated reclaim workflow triggered by a usage threshold (today metering informs, uninstall is a separate action); SaaS/subscription usage metering beyond installed desktop apps; per-feature/module metering within suites; anomaly detection on usage trends; explicit Mac-parity messaging and per-process auto-discovery.

## 4. Developer / Technical lens

### Mechanics & data collection
- The agent watches process launches for the file names defined in active metering rules and accumulates **usage count** (launch events) and **usage duration** (run time). (Exact counting semantics — e.g., whether overlapping sessions are summed — inferred.)
- Collection starts from the **next 90-minute agent refresh cycle** after the rule is saved; the agent **uploads once per day**; the server retains the **last 90 days**.
- Matching is by exact file name + extension; software *groups* are not supported as rule targets.

### Ports / protocols (shared ITAM data path — inferred from parent module)
- On-prem: agent↔server over **8020**; on-demand tasks over **8027**.
- Cloud: **443** to `desktopcentral.manageengine.com` (agent/server) and `dms.zoho.com` (on-demand).

### Worked example (interpreting the data)
Suppose a rule meters `AcadLT.exe` (AutoCAD LT). The Rules Summary shows Discovered count = 40, Usage count = 6, Usage duration = low across the 90-day window. Reading Computers with Metered Software reveals 34 machines with zero launches. Those 34 seats are reclaim candidates: uninstall the app (via [software-deployment.md](software-deployment.md)) and return the licenses to the pool in [software-license-management.md](software-license-management.md) before the next renewal — turning a 40-seat renewal into a ~6-to-10-seat purchase.

### Limits
- 90-day retention window (older data ages out).
- No group-level metering; one rule per executable.
- Daily post cadence means near-real-time usage is not available.
- Prohibited-software listing within metering is Windows-only.
- Data accuracy depends on supplying the correct process file name.
- Counting semantics (e.g., how concurrent sessions or background helper processes are tallied) are not fully documented (inferred).

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
|---|---|---|
| Metering report empty | Rule just created; daily post not yet done | Wait until the next day after rule creation (90-min cycle + daily upload). |
| Still no usage data after a day | File Name wrong / missing extension | Re-derive `.exe` (Task Manager > Details) or `.app` (Activity Monitor); update the rule. |
| No data on Mac | OS/feature mismatch or wrong `.app` path | Confirm Mac metering applies; capture the main process `.app` name, not a helper. |
| Cannot create a rule for a suite | Rule targets a software group | Create one rule per individual executable; groups are unsupported. |
| Duplicate rule-name error | Rule name already used | Use a new unique, descriptive name. |
| Usage looks lower than expected | Only last 90 days retained; agent offline during use | Review the 90-day window; verify agent connectivity/refresh. |

### FAQs
- *Which platforms?* Windows and macOS (prohibited-software listing within metering is Windows-only).
- *How long is data kept?* The last 90 days from the current date.
- *How often is data posted?* Agent meters from the next 90-minute refresh; posts once per day.
- *Can I meter a software group?* No.
- *Where do I find the file name?* Task Manager > Details (Windows) or Activity Monitor (Mac).
- *How does this save money?* Reports reveal idle installs; revoke/reclaim those licenses before renewal.

## Cross-references
- [software-license-management.md](software-license-management.md) — metering feeds reclamation and renewal decisions for the license pool.
- [prohibited-software.md](prohibited-software.md) — pair low-usage findings with auto-uninstall to recover seats.
- [it-asset-management.md](it-asset-management.md) — parent module; shared scan/agent data path and reports framework.

## Sources
- https://www.manageengine.com/products/desktop-central/software-metering.html
- https://www.manageengine.com/products/desktop-central/help/inventory/software_metering.html
- https://www.manageengine.com/products/desktop-central/it-asset-management.html
