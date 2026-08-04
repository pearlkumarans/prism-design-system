# Endpoint Central — Integrations

> How **ManageEngine Endpoint Central** connects to adjacent IT tools — ITSM/help desk, SIEM/log analytics, security/VM scanners, identity, and business intelligence — to break down silos, increase visibility, and centralize IT administration. This file covers the purpose of each integration, what data/actions flow, a setup outline, and known troubleshooting from the KB **Integrations** category.

**Where to configure (console nav):** **Admin tab → Integrations** lists every supported integration; select one and follow its wizard. Help-desk integration also appears under **Admin → Integrations → Helpdesk integration**.
See [INDEX.md](INDEX.md) for the module map. Architecture/ports context lives in [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md). Items marked **(inferred)** are reasoned, not stated verbatim on the cited pages.

---

## Why integrate?

Per the product-integrations page, an integrated EC setup yields:

- **Cross-team collaboration** — removes the siloed approach to resolution; issues are remediated faster.
- **Pronounced visibility and control** over the IT network.
- **Proactive** IT management and security rather than reactive.
- **Centralized** IT administration.

EC groups its integrations into: **IT Service Management (ITSM)**, **Enterprise Protection Platforms** (security/VM), **Business Intelligence**, **IT Asset Management**, **Privileged Access Management**, and **iPaaS** (Zoho Flow). It also exposes a **REST API** (API Explorer) for custom integration.

---

## Integration catalog (at a glance)

| Category | Integrations |
|---|---|
| ITSM / Help desk | ManageEngine **ServiceDesk Plus**, **ServiceNow**, **Jira** Service Management, **Zendesk**, **Freshservice** |
| Security / Vulnerability & EDR | **Tenable** (VM, SC), **Rapid7** InsightVM (On-Prem, Cloud), **Qualys**, **CrowdStrike** Falcon Spotlight |
| SIEM / Log analytics | ManageEngine **Log360 / EventLog Analyzer**, **Splunk** (inferred — via syslog/EventLog Analyzer or API) |
| Identity | **Active Directory**, **Azure AD / Microsoft Entra ID** |
| Business Intelligence | ManageEngine **Analytics Plus** |
| IT Asset Management | ManageEngine **AssetExplorer** |
| Privileged Access | ManageEngine **PAM360** |
| iPaaS | **Zoho Flow** |

---

# 1. IT Service Management (ITSM)

## 1a. ManageEngine ServiceDesk Plus (SDP)

**Purpose.** Tightest, native integration — bridges endpoint management with the help desk so technicians can act on assets directly from tickets.

**What flows (data/actions):**
- **Asset data sync** — EC pushes hardware/software inventory and managed-computer data into SDP's CMDB/asset module.
- **Software deployment from SDP** — deploy software to a workstation directly from a ServiceDesk Plus request.
- **Bi-directional context** — endpoint details (patch status, inventory) enrich tickets; ticket actions can trigger endpoint operations.

**Setup outline:**
1. In SDP, ensure the asset/integration module is available and the server is running.
2. In EC: **Admin → Integrations → ServiceDesk Plus** (or Helpdesk integration). Enter SDP server **name/IP**, **port**, **protocol (HTTP/HTTPS)**, and the **authentication key** generated in SDP.
3. Save; EC shows a connectivity status (e.g., *Reachable* / *Not Reachable*).
4. Schedule asset data sync.

**Troubleshooting (5-lens style):**

- **Feature/Detail — "Not Reachable."** SDP server-connectivity status shows *Not Reachable*. Causes: incorrect server details, SDP shut down, no network connectivity, wrong product selected with HTTPS, or required ports blocked by firewall.
- **Dev/Technical — verify:** correct **name/IP, port, protocol**; ensure the SDP service is started (**Programs → ManageEngine ServiceDesk Plus → ServiceDesk Plus Server**); confirm you can **ping** SDP from the EC machine; **Telnet** the SDP port from the EC machine — if it fails, fix inbound/outbound firewall rules on both servers.
- **Support — "Invalid Authentication Key" (cannot deploy software from SDP).** The auth key configured doesn't match. Regenerate/copy the key from SDP into EC's integration settings and retry.
- **Support — "Cannot access the EC server from the SDP server."** The reverse path is broken; confirm SDP can reach EC's web/agent port and that EC's service is running.
- **Support — "Asset data sync failure (SDP-DC)."** Inventory not flowing to SDP; re-check connectivity/credentials, ensure the sync schedule is enabled, and verify the asset module is licensed/available in SDP.

→ Asset/inventory specifics: [it-asset-management.md](it-asset-management.md); deployment specifics: [software-deployment.md](software-deployment.md).

## 1b. ServiceNow

**Purpose.** Integrate EC with ServiceNow ITSM via a Store/plug-in app so ServiceNow becomes the system of record for incidents/assets while EC executes endpoint actions.

**What flows:** Asset/CI data into the ServiceNow CMDB; incident/request context to technicians; (inferred) ability to trigger EC actions from ServiceNow workflows.

**Setup outline:** Install the EC plug-in app from the ServiceNow Store; configure the EC instance URL and API credentials/token; map asset/CI fields; schedule sync. In EC, configure the matching integration entry under **Admin → Integrations**.

**Troubleshooting:** Validate API credentials/token and instance URL; confirm outbound HTTPS connectivity from EC to the ServiceNow instance; check field mappings if CIs aren't created; (inferred) review the plug-in app's logs in ServiceNow for auth/scope errors.

## 1c. Jira (Service Management)

**Purpose.** Connect EC to Atlassian Jira so endpoint/asset context appears in Jira issues and IT can coordinate remediation.

**What flows:** Asset/inventory and endpoint context into Jira issues; (inferred) issue-driven actions.

**Setup outline:** In Jira, generate API token/credentials; in EC **Admin → Integrations → Jira**, provide the Jira base URL and credentials; map projects/issue types; save and validate.

**Troubleshooting:** Check API token validity and Jira base URL; confirm HTTPS reachability; verify the integration user has the required Jira project permissions.

## 1d. Zendesk

**Purpose.** Surface endpoint/asset data inside Zendesk tickets for support agents.

**Setup outline:** Configure Zendesk subdomain + API token in EC **Admin → Integrations → Zendesk**; map fields; validate.

**Troubleshooting:** Validate subdomain/API token; confirm outbound HTTPS; check agent permissions in Zendesk.

## 1e. Freshservice

**Purpose.** Integrate EC asset/endpoint data with Freshservice ITSM. Setup/troubleshooting parallels the other cloud ITSM connectors (API key + base URL + HTTPS reachability).

---

# 2. Security / Vulnerability & EDR (Enterprise Protection Platforms)

**Common pattern.** These integrations let EC **ingest vulnerability/threat findings from a scanner or EDR and remediate them via patch/configuration deployment** — closing the loop between *detection* (the scanner) and *remediation* (EC). Configure under **Admin → Integrations** (the patch-management help hosts the per-vendor setup pages).

→ Remediation lives in [patch-management.md](patch-management.md) and [vulnerability-management.md](vulnerability-management.md); EDR context in [endpoint-detection-response.md](endpoint-detection-response.md).

## 2a. Tenable (Tenable VM / Tenable.io and Tenable SC / SecurityCenter)

- **Purpose:** Import Tenable-detected vulnerabilities into EC and remediate by deploying the corresponding patches.
- **What flows:** Vulnerability findings (CVEs/plugins) and affected assets → EC; remediation status → (inferred) back to reporting.
- **Setup:** In Tenable, create **API keys** (access + secret) with the right scope; in EC integration wizard, enter the Tenable host/URL and API keys; map assets; sync.
- **Troubleshooting:** Invalid/expired API keys; URL/host mismatch (Tenable.io cloud vs on-prem SC); outbound HTTPS blocked; asset-matching gaps (EC and Tenable identify the same host differently — reconcile by hostname/IP).

## 2b. Rapid7 InsightVM (On-Premises and Cloud)

- **Purpose / flow:** Same loop — pull InsightVM findings, remediate with EC.
- **Setup:** Provide the InsightVM console URL (on-prem) or platform region/API key (cloud) plus credentials; map and sync.
- **Troubleshooting:** Credential/API-key validity; correct on-prem vs cloud endpoint; firewall/HTTPS reachability; asset reconciliation.

## 2c. Qualys

- **Purpose / flow:** Ingest Qualys VM findings for remediation in EC.
- **Setup:** Qualys API username/password + correct **API server URL** for your Qualys platform (POD); configure in EC; sync.
- **Troubleshooting:** Wrong API POD URL is the classic failure; verify credentials and HTTPS reachability; check API rate limits if syncs stall.

## 2d. CrowdStrike Falcon Spotlight

- **Purpose / flow:** Pull CrowdStrike Falcon **Spotlight** vulnerability data into EC for patch remediation, combining CrowdStrike's telemetry with EC's deployment.
- **Setup:** Create a CrowdStrike API client (client ID + secret) with Spotlight read scope; enter into EC; select the correct CrowdStrike cloud region; sync.
- **Troubleshooting:** API client scope/permissions insufficient; wrong cloud region; expired secret; asset matching (CrowdStrike AID vs EC resource).

---

# 3. SIEM / Log Analytics

## 3a. ManageEngine Log360 / EventLog Analyzer

**Purpose.** Forward EC asset/endpoint data into Log360 (EventLog Analyzer component) for correlation, auditing, and security analytics.

**What flows:** Asset data posted from EC to the Log360 EventLog Analyzer server.

**Setup outline:** In EC integration settings, provide the **Log360 EventLog Analyzer server name/IP, port, and protocol**; ensure the ELA server is running; enable the post/sync.

**Troubleshooting (from KB Integrations):**
- **"Unable to connect server."** Causes: ELA server down or wrong credentials; no network connectivity; firewall blocking ports. Resolution: verify **name/IP, port, protocol** in EC's Log360 settings; start the EventLog Analyzer server; confirm you can **ping** ELA from the EC machine; open the correct inbound/outbound ports (test with **Telnet** to the ELA port).
- **"Asset data not posted."** Connection may be up but data isn't flowing — re-check the posting configuration/schedule, confirm the integration is enabled, and review connectivity/firewall as above.

→ Compliance/audit reporting that consumes this data: [reporting-auditing.md](reporting-auditing.md).

## 3b. Splunk

**Purpose.** Feed EC/endpoint data into Splunk for SIEM dashboards and alerting.
**Setup (inferred):** No dedicated native connector is listed on the product-integrations page; integration is typically achieved via **syslog/EventLog forwarding**, the **EC REST API**, or by routing through EventLog Analyzer. Validate the current supported method against internal docs before committing.
**Troubleshooting (inferred):** Confirm the forwarding mechanism (syslog/HEC/API), index/sourcetype mapping, network reachability to the Splunk receiver, and token/credential validity.

---

# 4. Identity — Active Directory & Azure AD / Microsoft Entra ID

## 4a. Active Directory (AD)

**Purpose.** AD is foundational, not just an integration: it powers discovery, Scope of Management by domain/OU/group, console authentication, and 200+ AD reports.

**What flows:** Computer/user/OU/group objects into EC; AD-authenticated console logins.

**Setup outline:** Add the domain under **Admin → SoM → Add Domain/Workgroup** with domain admin credentials (Credential Manager). Add AD users/roles under **Admin → User Administration**.

**Troubleshooting:**
- **"Cannot add and authenticate a user using AD" (restricted AD user)** — the user lacks rights or the bind is restricted; supply a valid domain account with appropriate read rights.
- **"Unable to add domains in SoM — Validation Failed"** — credentials/DNS suffix wrong or DC unreachable; re-enter valid domain admin credentials and verify connectivity.
- Browser/network resource lists incomplete — see General KB ("network browser does not list all computers").

→ Onboarding detail: [getting-started-onboarding.md](getting-started-onboarding.md).

## 4b. Azure AD / Microsoft Entra ID

**Purpose.** Identity + cloud-device onboarding for Entra-joined/Intune-managed devices.

**What flows:** Entra identities for SSO/authentication (inferred); Azure/Intune-based agent installation for cloud devices.

**Setup outline:** Use the **Azure/Intune agent installation** method to push the EC agent to Entra-joined devices; configure SSO/identity per the EC identity settings.

**Troubleshooting (inferred):** App-registration permissions/consent in Entra; correct tenant ID; token expiry; device-join state mismatches. Validate specifics against internal docs.

---

# 5. Business Intelligence — ManageEngine Analytics Plus

**Purpose.** Advanced analytics/visualization over EC data — custom dashboards, blended reports, and trend analysis beyond EC's built-in reports.

**What flows:** EC datasets (patch, inventory, compliance, deployment) into Analytics Plus for modeling.

**Setup outline:** Install/configure the EC–Analytics Plus connector; point Analytics Plus at the EC data source; schedule data import; build dashboards.

**Troubleshooting (inferred):** Connector/data-source credentials; scheduled-import failures (check connectivity and DB access); ensure the EC build is compatible with the Analytics Plus connector version.

→ Built-in reporting: [reporting-auditing.md](reporting-auditing.md).

---

# 6. IT Asset Management — ManageEngine AssetExplorer

**Purpose.** Sync EC inventory into AssetExplorer's asset/CMDB repository (shares the same connectivity model and "Not Reachable" troubleshooting as ServiceDesk Plus — the KB article covers both SDP and AssetExplorer together).

**Troubleshooting:** Same as SDP §1a — verify server name/IP/port/protocol, ensure the AssetExplorer service is running, confirm ping/Telnet reachability, open firewall ports.

→ [it-asset-management.md](it-asset-management.md).

---

# 7. Privileged Access Management — ManageEngine PAM360

**Purpose.** Integrate EC with PAM360 so privileged credentials EC uses (for agent install, remote ops) can be vaulted/brokered and access is governed.

**Setup outline:** Configure the PAM360 connection in EC **Admin → Integrations → PAM360**; map the credentials EC retrieves at runtime.

**Troubleshooting (inferred):** Vault connectivity/auth; credential-mapping/scope errors; certificate trust between EC and PAM360.

→ Privilege concepts: [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md).

---

# 8. iPaaS — Zoho Flow & the EC REST API

**Purpose.** For integrations not covered natively, **Zoho Flow** provides low-code automation across hundreds of apps, and the **EC REST API (API Explorer)** lets developers script custom integrations (deploy software, query inventory/patches, manage SoM).

**Setup outline:** Authenticate to the EC API (token/OAuth); for Zoho Flow, connect the EC app and build flows triggered by events in either system.

**Troubleshooting (inferred):** API token/OAuth scope and expiry; rate limits; webhook reachability for Flow triggers.

→ API context: [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md).

---

## Cross-cutting troubleshooting checklist

Most integration failures reduce to the same root causes — work this list before escalating:

1. **Details** — server name/IP, port, and protocol (HTTP vs HTTPS) entered correctly on the EC side.
2. **Service up** — the partner product's service is actually running.
3. **Network** — EC can **ping** the partner host (and vice-versa where bi-directional).
4. **Ports/firewall** — required inbound/outbound ports open; verify with **Telnet** to the partner port from the EC machine.
5. **Auth** — API key/token/credentials valid and unexpired, with sufficient scope/permissions.
6. **Endpoint/region** — cloud connectors point at the correct region/POD/instance URL.
7. **Asset reconciliation** — for security scanners, EC and the scanner must identify the same host (hostname/IP) for findings to map.
8. **Build compatibility** — keep EC current; connector behavior can depend on the EC build (see [security-advisories-cve.md](security-advisories-cve.md) for why staying patched matters).

---

## Persona quick-reference

- **UX:** the integration list lives under one **Admin → Integrations** hub; the connectivity-status indicator (*Reachable / Not Reachable*) is the primary signal users rely on — friction concentrates on credential/port errors with terse messages.
- **PM:** integrations are a key ROI/stickiness lever (ITSM + VM scanners + SIEM). The native ManageEngine stack (SDP, Log360, Analytics Plus, AssetExplorer, PAM360) is the differentiator vs. point UEM tools.
- **Dev:** REST API + Zoho Flow cover the long tail; security-scanner integrations are pull-based (API keys, scheduled sync) with an asset-matching layer.
- **Support:** the KB "Integrations" category is small but high-frequency — SDP "Not Reachable", "Invalid Authentication Key", "Asset data sync failure", and Log360 "Unable to connect"/"Asset data not posted" are the recurring tickets.

---

## Sources

- Endpoint Central Integrations (catalog, why, how-to, console nav) — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/desktop-central-integrations.html
- Cannot connect to the ServiceDesk Plus/AssetExplorer server (Not Reachable) — https://www.manageengine.com/products/desktop-central/servicedesk_connection_failure.html
- Cannot deploy software from SDP — Invalid Authentication Key — https://www.manageengine.com/products/desktop-central/invalid-authentication-key.html
- Cannot access the EC server from the SDP server — https://www.manageengine.com/products/desktop-central/servicedeskplus-dc-server-not-running.html
- SDP-DC: Asset data sync failure — https://www.manageengine.com/products/desktop-central/servicedeskplus-asset-data-failure-case.html
- Log360–EC: Unable to connect server — https://www.manageengine.com/products/desktop-central/elakb-unable-to-connect.html
- Log360–EC: Asset data not posted — https://www.manageengine.com/products/desktop-central/elakb-data-not-posted.html
- Tenable VM — https://www.manageengine.com/products/desktop-central/help/patch_management/tenablevm.html
- Tenable SC — https://www.manageengine.com/products/desktop-central/help/patch_management/tenablesc.html
- Rapid7 InsightVM On-Prem — https://www.manageengine.com/products/desktop-central/help/patch_management/rapid7op.html
- Rapid7 InsightVM Cloud — https://www.manageengine.com/products/desktop-central/help/patch_management/rapid7cloud.html
- CrowdStrike Falcon Spotlight — https://www.manageengine.com/products/desktop-central/help/patch_management/spotlight.html
- Qualys — https://www.manageengine.com/products/desktop-central/help/patch_management/how-to-integrate-qualys.html
- Analytics Plus integration — https://www.manageengine.com/products/desktop-central/desktop-central-analytics-plus-integration.html
- AssetExplorer integration — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/integrating_with_asset_explorer.html
- PAM360 integration — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/integrating-with-pam360.html
- ServiceNow plug-in app — https://www.manageengine.com/products/desktop-central/servicenow-intergration-using-dc-plug-in-app.html
- Jira integration — https://www.manageengine.com/products/desktop-central/jira-integration.html
- Zendesk integration — https://www.manageengine.com/products/desktop-central/zendesk-integration.html
- Zoho Flow integration — https://www.manageengine.com/products/desktop-central/zoho-flow-integration.html

*Items marked "(inferred)" are reasoned conclusions, not stated verbatim on the cited pages; validate against internal docs/console before relying on them. Splunk has no dedicated connector listed on the public integrations page — treat its method as inferred.*
