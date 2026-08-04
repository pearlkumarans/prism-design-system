# Endpoint Central Cloud vs On-Premises
> ManageEngine Endpoint Central ships in two deployment editions of the same Unified Endpoint Management & Security (UEMS) product: a SaaS **Cloud** edition hosted by ManageEngine, and an **On-Premises** edition self-hosted by the customer. Both share the core feature set, but a handful of modules are exclusive to one edition (notably EDR and Zia AI are Cloud-leaning, while Endpoint DLP, Secure Private Access, and voice/video remote control are On-Premises-only per the edition matrix).

## 1. What it is — Feature detail

### Purpose, who it's for, where it sits in the EC product family
Endpoint Central is one product with two delivery models. The **deployment edition** (Cloud vs On-Premises) is an orthogonal choice to the **functional edition** (Free, Professional, Enterprise, UEM, Security). You first pick *how* it runs (who hosts the server), then pick *what* tier of features you license.

- **Cloud (SaaS):** ManageEngine runs and maintains the server in its data centers. The customer manages endpoints through a web console and a mobile app; only agents live in the customer's network. Best for teams that want zero infrastructure overhead and automatic upgrades.
- **On-Premises:** The customer installs and operates the Endpoint Central server (and any add-on servers) on its own hardware/VMs. Best for organizations with strict data-residency, air-gap, or regulatory requirements, or that need On-Prem-only modules.

Both serve the same audience — IT teams managing and securing Windows, macOS, Linux, Android, iOS/iPadOS, tvOS, and ChromeOS endpoints across their lifecycle.

### FULL capability breakdown with how it works
Both editions deliver the unified UEMS feature set: device onboarding/enrollment, device provisioning/configurations, automated patch management (OS + 850+/1,100+ third-party apps), software/application management, IT asset management, remote troubleshooting, OS imaging & deployment, digital employee experience (DEX), reporting, integrations, and the endpoint security suite (vulnerability management, BitLocker, device control, browser security, application control, privilege management, malware/ransomware protection).

Where they diverge (the load-bearing differences):

| Capability | Cloud | On-Premises | Notes |
|---|---|---|---|
| **Endpoint Detection & Response (EDR)** | Yes (Cloud-only per matrix) | Add-on (matrix marks EDR rows "Applicable for Endpoint Central Cloud only") | EDR is positioned as Cloud-first |
| **Zia AI / AI-powered features** | Yes | Limited / inferred Cloud-first | AI ("Powered by Zia") is surfaced on the Cloud/AI pages |
| **Endpoint DLP (Data Loss Prevention)** | Not currently supported | Yes (On-Premises only) | Help docs: "applicable only for Endpoint Central On-Premises and not currently supported on Cloud" |
| **Secure Private Access** | Add-on (On-Prem marked) | Yes | Matrix marks Secure Private Access "Applicable for Endpoint Central On-Premises only" |
| **Voice & Video call (remote control)** | Not available | Yes | Matrix marks voice/video "Applicable for Endpoint Central On-Premises only" |
| **OS Deployment / Imaging** | Supported but On-Prem-centric | Yes | OS imaging is historically an On-Prem-rooted module; in MSP Cloud it's a Cloud-only add-on, illustrating the split nature |
| **Server upgrades / maintenance** | Handled by ManageEngine | Handled by customer | — |
| **Data hosting** | ManageEngine regional data centers | Customer infrastructure | Data-residency driver |

Note: ManageEngine's matrix explicitly uses two markers — `*` = "Applicable for Endpoint Central Cloud only" and `^` = "Applicable for Endpoint Central On-Premises only" — confirming the edition-exclusive nature of EDR (Cloud) and DLP / Secure Private Access / voice-video (On-Prem).

### Who hosts what — responsibility split
| Responsibility | Cloud | On-Premises |
|---|---|---|
| Server hardware / VM | ManageEngine | Customer |
| Server OS patching & hardening | ManageEngine | Customer |
| Database administration & backups | ManageEngine | Customer |
| Application upgrades / service packs | ManageEngine (automatic) | Customer (manual) |
| High availability / failover | ManageEngine | Customer (Failover Server add-on) |
| Data location | ManageEngine regional DC | Customer-controlled |
| Agent deployment & lifecycle | Customer | Customer |
| Endpoint policy & operations | Customer | Customer |

The mental model: **Cloud shifts the entire server-side operational burden to ManageEngine**, leaving the customer responsible only for agents and the actual endpoint-management decisions. On-Premises keeps everything under the customer's control — and therefore under the customer's maintenance responsibility.

### Supported platforms / prerequisites / key concepts
- **Endpoints managed (both):** Windows, macOS, Linux, Android, iOS/iPadOS, tvOS, ChromeOS.
- **Cloud prerequisites:** A ManageEngine cloud account, outbound connectivity from agents to the cloud, and a supported browser; no server install.
- **On-Premises prerequisites:** A server host (Windows/Linux per supported specs), database, ports opened, and ongoing patching/backups of the server itself.
- **Key concepts (both):**
  - **Agent:** unified lightweight agent on each endpoint.
  - **Distribution Server:** caches content to optimize bandwidth at remote sites.
  - **Secure Gateway Server (add-on):** secures roaming/WAN/mobile agent communication to the server (especially relevant On-Prem so agents outside the LAN can reach the server safely; Cloud handles much of this natively — inferred).
  - **Failover Server (add-on):** HA for On-Premises.

## 2. UX lens

### Primary roles & jobs-to-be-done
- **IT administrator (decision-maker)** — chooses the deployment model. JTBD: "Pick the edition that meets our compliance, control, and ops-capacity constraints."
- **Sysadmin / endpoint engineer** — runs daily patching, deployment, remote support. JTBD: "Do the same work regardless of where the server lives."
- **Security analyst** — uses EDR/vulnerability/DLP. JTBD: "Get the security module my deployment supports (EDR on Cloud, DLP on-Prem)."
- **Infrastructure/ops engineer (On-Prem only)** — keeps the EC server healthy. JTBD: "Patch, back up, and upgrade the server without downtime."

### Key workflows / screen flows step by step
1. **Choosing an edition** — assess data-residency rules → assess in-house ops capacity → check which exclusive modules are required (EDR vs DLP/SPA/voice-video) → select Cloud or On-Premises.
2. **Cloud onboarding** — sign up for the cloud account → download/deploy agents → start managing immediately (no server build).
3. **On-Premises onboarding** — provision server host → install EC server → open ports → deploy agents → configure Distribution/Secure Gateway/Failover servers as needed.
4. **Upgrade cycle** — Cloud: transparent, ManageEngine-managed; On-Prem: admin downloads and applies service packs/upgrades during a maintenance window.
5. **Migration (On-Prem → Cloud or vice versa)** — plan data export/agent re-pointing, validate module parity, re-enroll/redirect agents (see Support lens).

### UX research hooks: friction points, where users get stuck, opportunities
- **Edition-choice confusion (friction):** Buyers struggle with the two-axis model (deployment edition × functional edition) and with which modules are exclusive. Opportunity: a guided "which edition is right for me?" selector. (inferred)
- **Feature-parity surprises:** A team that standardizes on Cloud then discovers DLP isn't available (or On-Prem team wants EDR) — a costly late discovery. Opportunity: surface exclusivity up front.
- **On-Prem ops burden:** Server patching/backup/upgrade is a recurring stuck point and a reason teams move to Cloud.
- **Migration anxiety:** Re-pointing thousands of agents and validating parity is high-risk; opportunity for first-class migration tooling. (inferred)

### Notable UI patterns
- **Identical console UX across editions** so skills transfer — the differentiator is deployment, not interface.
- **Module availability cues** that reflect the active deployment edition (inferred best practice).
- **Web console + mobile app** in both editions for on-the-go management.

### Decision guide — when to choose which
**Choose Cloud when:**
- You want zero server infrastructure and automatic upgrades.
- Your workforce is distributed/remote-first and agents need internet-reachable management.
- You want the latest innovation first (EDR, Zia AI) and DEX/security delivered as a service.
- You have no data-localization mandate beyond what ManageEngine's regional data centers satisfy.
- Your IT team is lean and cannot absorb server-side ops.

**Choose On-Premises when:**
- Regulatory, sovereignty, or air-gap requirements demand full control of the data plane.
- You need On-Prem-only modules: **Endpoint DLP, Secure Private Access, voice/video remote control**, or the historically On-Prem-rooted OS deployment workflows.
- You require deep customization or integration that only self-hosting allows.
- You have the operations capacity to patch, back up, and upgrade the server.

A useful framing: **let required modules and compliance drive the choice first**, then operations capacity, then cost model. If a must-have module is edition-exclusive (e.g., DLP on-Prem, EDR on Cloud), that often settles the decision before any cost comparison.

## 3. PM lens

### Value proposition & business outcomes
- **Cloud:** fastest time-to-value, no infrastructure, automatic upgrades, regional data residency, predictable subscription. Outcome: lower operational overhead, faster adoption of new features (EDR, Zia AI).
- **On-Premises:** maximum data control and customization, air-gap capability, and access to On-Prem-only modules (DLP, Secure Private Access, voice/video). Outcome: meets the strictest compliance and sovereignty needs.

### Target personas & use cases
- **Cloud:** distributed/remote-first workforces, lean IT teams, organizations prioritizing AI/EDR, those without data-localization mandates.
- **On-Premises:** regulated industries, government/defense, organizations with data-sovereignty laws, those needing DLP or private-access controls, or wanting full control of the data plane.

### Competitive positioning / differentiators
- ManageEngine offers **the same product in both models** with a consistent console — a differentiator versus vendors that are Cloud-only or On-Prem-only.
- **Cloud-first innovation** (EDR, Zia AI) signals the strategic direction while On-Prem retains data-sovereignty-sensitive modules (DLP, SPA).
- **Single unified agent** across both models.

### Packaging / pricing / edition gating
- Functional editions (Free, Professional, Enterprise, UEM, Security) overlay both deployment models, though some matrix combinations are exclusive.
- **Security Edition** is available in both On-Premises and Cloud.
- Add-on servers (Failover ~$1,195; Secure Gateway ~$345; Multilanguage ~$345) apply to paid editions.
- Cloud is subscription/SaaS; On-Premises is typically annual subscription on owned infrastructure.
- Gating to remember: **EDR Cloud-only; DLP / Secure Private Access / voice-video On-Prem-only; OS Deployment On-Prem-centric.**

### Product expansion opportunities / gaps / roadmap ideas (analysis)
- **Bring DLP and voice/video to Cloud** to close the most-cited parity gaps. (inferred)
- **Bring EDR/Zia AI fully to On-Premises** for regulated buyers wanting AI without the cloud. (inferred)
- **First-class bi-directional migration tooling** with parity-check reports. (inferred)
- **Hybrid model** — Cloud control plane with On-Prem data residency for sensitive modules. (inferred)

## 4. Developer / Technical lens

### Architecture & components
- **Cloud:** ManageEngine-hosted server/control plane in regional data centers; customer network contains only agents (and optional Distribution Servers). Agents communicate outbound to the cloud.
- **On-Premises:** customer-hosted EC server + database, with optional Distribution Server, Secure Gateway Server, and Failover Server, all on customer infrastructure. Agents communicate to the on-prem server (directly on LAN, or via Secure Gateway for roaming/WAN).

### Hosting, agent, ports, data flow, integrations, APIs (inferred where noted)
- **Hosting:** Cloud = ManageEngine; On-Prem = customer.
- **Agent:** identical unified agent; differs mainly in the server endpoint it reports to.
- **Data flow:** On-Prem keeps all management/telemetry data inside the customer boundary; Cloud routes it to the regional data center.
- **Secure gateway difference:** On-Prem typically requires a Secure Gateway Server to safely expose the server to roaming/WAN/mobile agents; Cloud provides internet-reachable, secured endpoints natively (inferred).
- **Ports:** consult the EC ports reference; do not assume — On-Prem requires explicit inbound/outbound rules whereas Cloud is primarily outbound from agents (inferred).
- **Integrations:** both support ITSM/threat-detection/analytics integrations; AI integrations (Zoho MCP + Zia Agent Studio, ServiceNow, Okta, AD, Tenable, CrowdStrike, Splunk, Rapid7) are surfaced on the Cloud/AI pages.
- **APIs:** REST APIs available (parity expected across editions — confirm against docs). (inferred)

### Scalability / multi-tenancy / security
- **Scalability:** Cloud scales elastically on ManageEngine's side; On-Prem scales by sizing the server and adding Distribution/Failover servers.
- **Security:** Cloud emphasizes encryption + regional data residency + provider-managed hardening; On-Prem keeps data fully under customer control and supports air-gapped/DLP/private-access scenarios.
- **Maintenance/upgrades:** Cloud = ManageEngine's responsibility (automatic); On-Prem = customer's responsibility (manual service packs/upgrades, backups, OS patching of the server).

### Technical limitations
- **Module exclusivity** (EDR Cloud-only; DLP/SPA/voice-video On-Prem-only) limits a single deployment from having everything.
- **On-Prem upgrade lag** — customers may run behind the latest features until they upgrade.
- **Cloud data residency** is limited to the regions ManageEngine operates.

## 5. Support / Troubleshooting lens

### Common issues & resolutions
- **"A module is missing in my Cloud tenant"** — check edition exclusivity (e.g., DLP is On-Prem-only; contact endpointcentralcloud-support@manageengine.com if a supported module is absent).
- **"Roaming agents can't reach my On-Prem server"** — deploy/configure a Secure Gateway Server.
- **"Server upgrade broke something" (On-Prem)** — roll back via backup, validate service-pack prerequisites, retry during maintenance window.
- **"Slow content delivery at branch"** — add a Distribution Server (both editions).

### Diagnostics, prerequisite checks
- Identify deployment edition first; it determines which modules and troubleshooting paths apply.
- On-Prem: verify server health, DB, ports, Failover, and Secure Gateway status; confirm backups before upgrades.
- Cloud: verify agent outbound connectivity and regional data center reachability.

### FAQs
- **Q: Is it the same product?** A: Yes — one product, two deployment models, mostly shared features.
- **Q: Which has EDR?** A: EDR is Cloud-focused (marked Cloud-only in the matrix).
- **Q: Which has DLP?** A: On-Premises only (not currently supported on Cloud).
- **Q: Who handles upgrades?** A: Cloud — ManageEngine; On-Prem — the customer.
- **Q: Can I migrate between them?** A: Yes, with planning — re-point/re-enroll agents and validate module parity.
- **Q: Which is better for data residency?** A: On-Premises gives full control; Cloud offers regional data centers.

### Migration between Cloud and On-Premises (guidance)
- Inventory current modules and confirm parity in the target edition (watch EDR/DLP/SPA/voice-video gaps).
- Plan agent re-pointing/re-enrollment to the new server.
- Migrate configurations, policies, and reports as supported.
- Pilot a subset before cutting over the fleet. (Process specifics — confirm with ManageEngine support; inferred.)

### Useful KB / help references
- What is Endpoint Central (module availability notes): https://www.manageengine.com/products/desktop-central/help/introduction/what-is-desktop-central.html
- Edition comparison matrix (On-Prem): https://www.manageengine.com/products/desktop-central/edition-comparison-matrix.html
- Cloud edition page: https://www.manageengine.com/products/desktop-central/cloud/
- AI / Zia page: https://www.manageengine.com/products/desktop-central/ai/

## Cross-references
- [endpoint-central-msp.md](endpoint-central-msp.md) — MSP editions also split across Cloud/On-Prem
- [admin-mobile-app.md](admin-mobile-app.md) — mobile management works against both editions
- [00-product-overview.md](00-product-overview.md) — product family overview
- [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md) — agent, Distribution/Secure Gateway/Failover servers

## Sources
- https://www.manageengine.com/products/desktop-central/cloud/
- https://www.manageengine.com/products/desktop-central/edition-comparison-matrix.html
- https://www.manageengine.com/products/desktop-central/help/introduction/what-is-desktop-central.html
- https://www.manageengine.com/products/desktop-central/ai/
