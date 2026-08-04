# Endpoint Central MSP
> ManageEngine's multi-tenant edition of Endpoint Central, purpose-built for Managed Service Providers (MSPs) to manage, patch, and secure endpoints across many client networks from one console. Positioned by ManageEngine as a "Next-Gen RMM" (Remote Monitoring & Management) platform. Available in Free, Professional, and Enterprise editions, on Cloud and (for Free/Enterprise) On-Premises.

## 1. What it is — Feature detail

### Purpose, who it's for, where it sits in the EC product family
Endpoint Central MSP is the channel/service-provider variant of ManageEngine Endpoint Central (formerly Desktop Central MSP). Where standard Endpoint Central is built for a single organization managing its own endpoints, Endpoint Central MSP is built for a service provider that manages the endpoints of **multiple, separate customer organizations** under one roof. It is the operational equivalent of an RMM tool combined with a Unified Endpoint Management & Security (UEMS) platform.

It sits alongside the standard Endpoint Central editions (Free, Professional, Enterprise, UEM, Security) but with a **multi-tenant data and management model layered on top**. Functionally, an MSP technician gets the same endpoint-management muscle (patching, software deployment, remote control, asset management, security suite, OS deployment) but with the ability to scope every action to a specific client and to keep each client's data, reporting, and billing logically isolated.

Target users:
- Managed Service Providers (MSPs) delivering outsourced IT.
- Managed Security Service Providers (MSSPs) layering endpoint security on top of management.
- IT services firms, system integrators, and break-fix shops moving to a recurring-revenue managed model.
- Large enterprises with distinct subsidiaries/business units that behave like separate "clients" (a multi-tenant pattern, inferred use case).

### FULL capability breakdown with how it works
Endpoint Central MSP delivers the full UEMS feature set, organized around client tenancy:

- **Patch management** — Automated deployment across OS and 1,100+ third-party/OS patches (per the MSP product page). Supports testing, approval workflows, rollback, and health monitoring. Patches can be scheduled per client to fit each customer's maintenance window. In the MSP edition matrix, advanced patch controls (driver/BIOS patching, antivirus definition updates, test-and-approve, patch download scheduling) are gated to the **Enterprise** edition, while basic automated and third-party patching is available in all editions.
- **Remote access / remote control** — Single-click remote sessions to client endpoints, with video/audio call support, file transfer, multi-monitor support, session recording, and audit trails. HIPAA/PCI-compliant remote control.
- **Asset monitoring & intelligent alerts** — Real-time device health, performance, and software metrics with proactive alerting to minimize downtime per client.
- **Application management** — Software deployment using 10,000+ built-in templates, automated app updates, usage tracking, self-service portal, and a curated app catalog.
- **Server management** — Centralized monitoring, updates, and maintenance of client servers with real-time insights.
- **Reporting & analytics** — Customizable, per-client reports and analytics dashboards for KPIs, trends, and compliance evidence. Integrates with ManageEngine Analytics Plus.
- **Security suite** — Real-time threat detection, application control, BitLocker/encryption management, ransomware/malware protection, vulnerability detection, browser security, and device control. (Several of these are Cloud-only add-ons in the MSP edition — see Packaging.)
- **Automated operations** — Standardized, repeatable workflows so technicians are freed from manual tasks.
- **OS deployment** — Capture, customize, and deploy OS images to client endpoints from the central console (an add-on in paid editions; Cloud-only for the deployment add-on).
- **Cross-platform** — Windows, Apple (macOS/iOS/iPadOS), Linux, Android, ChromeOS from a unified console.
- **Unified, performance-optimized agent** — A single lightweight agent manages and secures endpoints, reducing agent sprawl across all client environments.
- **End-user privacy by design** — Clear separation between IT control and end-user privacy, so MSPs gain endpoint health/security visibility without intrusive monitoring — important for client trust.

### Supported platforms / prerequisites / key concepts
- **Platforms managed:** Windows, macOS, Linux, Android, iOS/iPadOS, ChromeOS.
- **Deployment models:** Cloud (all three editions) and On-Premises (Free and Enterprise only; Professional is Cloud-exclusive).
- **Key concepts:**
  - **Customer / tenant:** Each managed client is a logically isolated tenant with its own scope of management, computers, policies, and reports.
  - **Technician roles:** Technicians are granted access scoped to specific customers and capabilities (role-based administration).
  - **Distribution Server:** A per-client/per-remote-office relay that optimizes bandwidth by caching patches/software locally.
  - **Secure Gateway Server (add-on):** Secures communication from roaming/WAN agents and mobile users back to the server.
  - **Agent:** Single unified agent installed on each managed endpoint, reporting back to the MSP console (Cloud-hosted or MSP-hosted).

### How multi-tenancy works in practice
The defining property of Endpoint Central MSP versus standard Endpoint Central is the **customer layer** wrapped around every object in the system. Where a single-org deployment has one global scope of management, the MSP edition partitions everything — computers, policies, patch jobs, software packages, reports, alerts — under a parent **customer/tenant** record. When a technician selects a customer, the entire console "narrows" to that tenant: they see only that client's machines, can only run jobs against them, and pull reports scoped to them. This is what allows one provider to safely manage dozens or hundreds of unrelated companies from one pane of glass.

Three pillars make this safe and billable:
1. **Data segregation** — each client's inventory and telemetry is logically isolated so client A can never see client B's data.
2. **Technician/role segregation** — RBAC binds each technician to a set of customers and a set of capabilities, so a junior tech assigned to two clients cannot touch a third or perform privileged actions outside their grant.
3. **Per-client reporting & billing** — reports and endpoint counts roll up per customer, feeding QBRs and invoices.

### Branding / white-labeling
Endpoint Central MSP supports branding so the provider can present a consistent identity to clients — customizing the console and client-facing artifacts with the MSP's own name/logo rather than ManageEngine's (inferred from the MSP edition's branding positioning). This lets the provider deliver the service under its own brand, reinforcing the managed-services relationship.

### What differs from the standard Endpoint Central product
| Dimension | Standard Endpoint Central | Endpoint Central MSP |
|---|---|---|
| Tenancy | Single organization | Many isolated customer tenants |
| Console scope | One global scope of management | Per-customer scope, switchable |
| Technician model | RBAC within one org | RBAC scoped per client |
| Reporting | Org-wide | Per-client (plus aggregate) |
| Billing | Org license | Per-client / per-endpoint consumption |
| Branding | ManageEngine-branded | White-label / MSP branding |
| Editions | Free, Professional, Enterprise, UEM, Security | Free, Professional, Enterprise |
| Distribution Server | Per remote office | Per client and/or per remote office |
| PSA integrations | ITSM-oriented | PSA-oriented (ConnectWise, HaloPSA, SDP MSP) |

## 2. UX lens

### Primary roles & jobs-to-be-done
- **MSP administrator / account owner** — Onboards new client tenants, defines technician roles, sets global policies, manages licensing and billing, configures branding. JTBD: "Stand up a new client and keep all clients cleanly separated."
- **MSP technician (L1/L2/L3)** — Day-to-day patching, remote troubleshooting, software deployment, alert triage across assigned clients. JTBD: "Resolve client issues fast without ever touching the wrong client's machines."
- **Service desk / NOC operator** — Watches alert streams across the client base. JTBD: "Catch and act on health/security alerts before the client notices."
- **MSP account manager / billing** — Pulls per-client reports for QBRs and invoicing. JTBD: "Show the client value and bill accurately for what was consumed."

### Key workflows / screen flows step by step
1. **Client onboarding** — Create a customer/tenant → define its scope of management → push the unified agent to the client's endpoints → (optionally) deploy a Distribution Server at the client's remote office → assign technicians.
2. **Cross-client patch cycle** — Sync patch DB → review missing/critical patches per client → test on a pilot group → approve → schedule deployment within each client's maintenance window → monitor health → roll back if needed.
3. **Remote troubleshooting** — Select client → select endpoint → launch single-click remote session → use file transfer / chat / voice-video → record session for audit → close ticket.
4. **Per-client reporting & billing** — Open reports module → filter to a single customer → generate compliance/asset/patch report → export for QBR → reconcile endpoint counts for invoicing.
5. **Tenant-scoped switching** — Technician switches the active customer context; all subsequent actions are scoped to that tenant.

### UX research hooks: friction points, where users get stuck, opportunities
- **Context-switching risk (friction):** The biggest UX hazard in any multi-tenant console is acting on the wrong tenant. Clear, persistent "you are in Client X" affordances and confirmation guards on destructive actions (wipe, uninstall, deploy) are critical. (Inferred research opportunity.)
- **Onboarding friction:** Agent deployment across an unfamiliar client network (firewalls, NAT, no AD) is a classic stuck point; Distribution Server placement decisions add complexity.
- **Alert fatigue:** NOC operators watching N clients can be overwhelmed; opportunity for prioritization, grouping, and AI triage (Zia).
- **Billing reconciliation:** Manual endpoint counting for invoicing is error-prone; opportunity for automated, exportable consumption reports.
- **Edition discovery:** Professional being Cloud-only and several security modules being Cloud-only add-ons creates "why can't I see this feature?" confusion; opportunity for in-product gating cues.

### Notable UI patterns
- **Tenant selector / global customer switcher** as a first-class navigation element (inferred standard MSP pattern).
- **Role-scoped navigation** — menu and data visibility change with the technician's permissions.
- **Per-client dashboards** with health, patch compliance, and security posture tiles.
- **Branding controls** to white-label the console and client-facing artifacts (inferred from MSP branding capability).

## 3. PM lens

### Value proposition & business outcomes
"Run a profitable managed-services practice from one multi-tenant platform." Endpoint Central MSP lets a service provider:
- Consolidate management + security into one tool (eliminate operational silos and agent sprawl).
- Reduce manual workload and free technicians for higher-value work via automation.
- Scale the client base without linearly scaling headcount or tool count.
- Bill predictably with pay-for-what-you-use, component-based pricing.
- Deliver "secure, resilient IT services" — the explicit positioning on the MSP home page.

### Target personas & use cases
- Growing MSPs needing multi-client management and security without juggling multiple tools.
- MSSPs offering advanced malware/ransomware protection as a managed service.
- Providers needing data-residency compliance via region-specific data centers.

### Competitive positioning / differentiators
- Positioned as **"Next-Gen RMM"** — combining RMM operations with full UEMS and an integrated security suite, versus point RMM tools that bolt on security.
- **Unified, lightweight agent** as a differentiator against multi-agent stacks.
- **PSA/ITSM integrations** with HaloPSA, ConnectWise, Zendesk, ServiceDesk Plus MSP, and Analytics Plus — meeting MSPs where their ticketing/billing lives.
- **End-user privacy by design** as a trust differentiator for client relationships.
- **Global data centers & compliance readiness** for data residency.

### Packaging / pricing / edition gating
Three editions (per the MSP Cloud edition comparison matrix):

| Edition | Starting price | Deployment | Multi-technician / RBAC |
|---|---|---|---|
| Free | $0 for 25 endpoints | Cloud + On-Premises | No |
| Professional | $1.25 / endpoint / month | Cloud only | Yes |
| Enterprise | $1.50 / endpoint / month | Cloud + On-Premises | Yes |

Key gating notes from the matrix:
- **Free edition** ironically exposes the widest feature surface (it's a try-everything tier capped at 25 endpoints), including security modules and OS imaging.
- **Multi-technician support and Role-Based Administration** are gated to **Professional and Enterprise** — the core multi-tenant operations capability for real MSPs.
- **Professional is Cloud-exclusive**; Enterprise and Free support both Cloud and On-Premises.
- **Security add-ons** (Application Control, BitLocker, Browser Security, Ransomware Protection, Malware Protection, Vulnerability Detection) are **available only in Cloud** setup and are paid add-ons in Professional/Enterprise.
- **OS Imaging & Deployment** add-on is **Cloud-only** in MSP.
- **Voice and Video Call** is not in Professional (text-based chat only); available in Free and Enterprise.
- **Pay-for-what-you-use** component pricing — no forced bundles, scale as the client base grows.
- A promotional offer historically provided 250 free cloud endpoint licenses for one year (time-limited; verify current offers).

Add-on value-added components (shared with standard EC, priced per the EC matrix): Failover Server (~$1,195), Secure Gateway Server (~$345), and Multilanguage Support (~$345), offered for paid editions.

### Edition selection guidance for MSPs (analysis)
- **Free** — evaluation or very small client (≤25 endpoints); broadest feature exposure but **no multi-technician / RBAC**, so unsuitable for a team servicing real clients.
- **Professional ($1.25/endpoint/mo, Cloud only)** — entry paid tier with multi-technician support and RBAC; trims advanced patch controls, screen recording, mobile remote sessions, and several security/MDM extras; uses text chat instead of voice/video. Good for cost-sensitive MSPs whose clients need core management.
- **Enterprise ($1.50/endpoint/mo, Cloud + On-Prem)** — the full MSP tier with advanced patching, screen recording, mobile remote sessions, voice/video, and the broadest feature surface; the natural choice for mature MSPs and any client needing On-Premises.

### Product expansion opportunities / gaps / roadmap ideas (analysis)
- **Bring Cloud-only security modules to On-Premises MSP** to remove the deployment/feature split that confuses buyers. (inferred)
- **Native consumption-based billing exports / PSA billing sync** to close the manual reconciliation gap. (inferred)
- **Cross-tenant fleet view with AI triage (Zia)** for NOC operators monitoring many clients. (inferred)
- **Client-facing portals/branded reports** as a productized upsell. (inferred)
- **Tenant templates** — clone a "golden" client configuration when onboarding a new customer. (inferred)

## 4. Developer / Technical lens

### Architecture & components
- **Central MSP console** — single management plane (Cloud-hosted by ManageEngine, or self-hosted On-Premises) that manages many client tenants.
- **Tenant/customer partition** — each client's scope of management, policies, inventory, and reports are logically segregated.
- **Unified agent** — one lightweight agent per endpoint across OSes, handling management + security telemetry and action execution.
- **Distribution Server (per client / per remote office)** — caches patches and software locally to optimize WAN bandwidth and speed deployments for that client.
- **Secure Gateway Server (add-on)** — secures communication for roaming/WAN agents and mobile devices.
- **Failover Server (add-on)** — high availability for On-Premises deployments.

### Hosting, agent, ports, data flow, integrations, APIs (inferred where noted)
- **Hosting:** Cloud edition is SaaS hosted by ManageEngine in region-specific data centers; On-Premises (Free/Enterprise) is hosted on MSP infrastructure.
- **Data flow (inferred):** Agents on client endpoints → (optional) per-client Distribution Server → MSP console/server; Cloud edition routes agent traffic to ManageEngine's data center for that region.
- **Ports (inferred):** Aligns with standard Endpoint Central agent-to-server and Distribution Server ports; consult the EC port reference for exact values rather than assuming.
- **Integrations:** HaloPSA, ConnectWise, Zendesk, ServiceDesk Plus MSP, Analytics Plus — covering PSA, ticketing, and reporting.
- **APIs (inferred):** Endpoint Central exposes REST APIs for automation; the MSP edition is expected to expose tenant-scoped equivalents, though tenant-API specifics should be confirmed against current docs.

### Scalability / multi-tenancy / security
- **Multi-tenancy** is the defining trait: isolated client data, scoped technician access, and per-client reporting/billing.
- **Per-client Distribution Servers** allow horizontal scale-out of content delivery across client networks.
- **Security:** controlled access, strong encryption, region-specific data residency, two-factor authentication, Active Directory authentication, and role-based administration.
- **Privacy boundary** between IT control and end-user data is an architectural design principle.

### Technical limitations
- **Feature/deployment split:** several security modules and OS imaging are Cloud-only; Professional edition has no On-Premises option.
- **Tenant isolation is logical, not physical** (inferred) — strict RBAC discipline is required to prevent cross-client mistakes.
- **Add-on sprawl:** advanced security capabilities are à-la-carte add-ons, increasing configuration/licensing complexity.

## 5. Support / Troubleshooting lens

### Common issues & resolutions
- **Agent fails to install on a client network** — verify firewall/port access, admin credentials, and connectivity to the MSP server/Distribution Server; use the mobile/console install flow as alternative.
- **Slow patch/software delivery at a client site** — deploy or right-size a Distribution Server at that client's remote office to cache content.
- **Technician can't see a client or feature** — check role-based administration scope and edition gating (e.g., RBAC requires Professional/Enterprise; certain modules are Cloud-only).
- **Roaming/mobile agents can't reach the server** — confirm the Secure Gateway Server add-on is configured.

### Diagnostics, prerequisite checks
- Confirm edition and deployment model (Cloud vs On-Premises) before troubleshooting feature availability.
- Verify per-client scope of management and technician role assignments.
- For On-Premises, check Failover Server status if HA is expected.
- Validate Distribution Server health per client for content-delivery issues.

### FAQs
- **Q: Can one console manage multiple unrelated customers?** A: Yes — that is the core multi-tenant design.
- **Q: Do all editions run on-premises?** A: No — Free and Enterprise do; Professional is Cloud-only.
- **Q: Is multi-technician support free?** A: No — it requires Professional or Enterprise.
- **Q: Are security modules included?** A: Most are Cloud-only add-ons in paid editions; Free exposes them within its 25-endpoint cap.
- **Q: How is it billed?** A: Per-endpoint, component-based, pay-for-what-you-use.

### Useful KB / help references
- Endpoint Central MSP user guide: https://www.manageengine.com/desktop-management-msp/help/
- MSP edition comparison: https://www.manageengine.com/desktop-management-msp/edition-comparison-matrix-cloud.html
- Distribution Server / WAN agents help (shared with EC): https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/installing_wan_agents_and_distribution_server.html

### PSA / ITSM integrations for MSPs
A core operational concern for MSPs is connecting endpoint management to their ticketing and billing systems. Endpoint Central MSP integrates with:
- **HaloPSA** — PSA, ticketing, and billing sync.
- **ConnectWise** — PSA used widely across the MSP channel.
- **Zendesk** — help-desk ticketing.
- **ServiceDesk Plus MSP** — ManageEngine's own MSP ITSM.
- **Analytics Plus** — advanced BI/reporting over endpoint data.

These integrations let alerts/assets from Endpoint Central flow into the MSP's service-desk workflow, and let endpoint counts/activity inform billing — closing the loop between operations and revenue.

## Cross-references
- [cloud-vs-on-premises.md](cloud-vs-on-premises.md) — deployment-model differences that also govern MSP editions
- [admin-mobile-app.md](admin-mobile-app.md) — manage client endpoints on the go
- [00-product-overview.md](00-product-overview.md) — Endpoint Central product family
- [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md) — agent, Distribution Server, Secure Gateway concepts

## Sources
- https://www.manageengine.com/desktop-management-msp/
- https://www.manageengine.com/desktop-management-msp/edition-comparison-matrix-cloud.html
- https://www.manageengine.com/products/desktop-central/edition-comparison-matrix.html
- https://www.manageengine.com/products/desktop-central/help/introduction/what-is-desktop-central.html
