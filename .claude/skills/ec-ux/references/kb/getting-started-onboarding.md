# Endpoint Central — Getting Started & Onboarding

> The end-to-end path from "we just installed Endpoint Central" to "our devices are managed": prerequisites, the three layers of setup (essential/general, feature-specific, value-added), defining the **Scope of Management (SoM)**, onboarding devices per platform (Windows / Apple / Android / Knox / Chrome / Linux), the agent installation methods (manual, GPO, SCCM, network share, remote office / Distribution Server), cloud vs on-prem onboarding, two-factor auth, and user/role management.

See [INDEX.md](INDEX.md) for the module map. Deep architecture/ports/sizing live in [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md). Items marked **(inferred)** are reasoned, not stated verbatim. *Note: setup tasks require an account with administrative privileges.*

---

## The onboarding journey (overview)

ManageEngine frames getting started as three stages:

1. **Prerequisites** — meet system requirements, open ports, use a supported browser.
2. **Installation** — install the product (on-prem) or provision the tenant (cloud).
3. **Setup** — define the Scope of Management, configure settings, then onboard devices.

After installation, the **first** real task is always **defining the Scope of Management**, because every downstream module targets the computers in scope.

```
Prerequisites ─► Install / Provision ─► Define SoM ─► Configure settings ─► Onboard devices ─► Manage
   (HW/SW,          (on-prem server     (domains/      (general / feature   (agent install /   (patch, deploy,
    ports,           or cloud tenant)    workgroups,    / value-added)        device enroll)     secure, report)
    browser)                              remote offices)
```

---

## 1. Prerequisites

Three things must be in place before installation succeeds:

- **System requirements** — hardware/software for the server, agent, database, and (where used) Distribution Server. Full sizing tables are in [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md). In short: a Windows host for the server, PostgreSQL (bundled) or MSSQL, and per-tier CPU/RAM/disk that scales with endpoint count.
- **Ports** — open the agent⇄server ports (default **8020** HTTP / **8383** HTTPS), notification port **8027**, remote-control ports (**8443/8444/8031**), and the agent-install push ports (**135/139/445**). Full table in [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md).
- **Supported browsers** — Microsoft Edge, Mozilla Firefox, Google Chrome, Zoho Ulaa; minimum resolution 1280×1024.

**Deployment topology choice (decide up front):**
- **On-Premises** — you host the server + DB; add Distribution Servers (branches), a Secure Gateway Server (DMZ, roaming/mobile), and a Failover Server (HA) as needed.
- **Cloud (SaaS)** — ManageEngine hosts everything; you just deploy agents/enroll devices.
- **MSP** — multi-tenant edition for managed service providers.
- Special topologies: **Amazon/Azure** hosting and **DMZ** placement have dedicated setup guides.

---

## 2. Configure Settings (three layers)

EC separates setup into three buckets, all under the **Admin** tab:

### General settings (feature-independent)
The foundational, cross-cutting settings:
- **Administration** — **User administration** (users/roles), **Credential Manager** (privileged creds EC uses for remote ops), **Exceptions List**.
- **Scope of Management** — **Add domain/workgroup**, **Agent Settings** (tray icon/behavior), **Replication Policy** (Distribution Server replication), **APNS** (Apple push cert).
- **Server** — **Mail Server**, **Server Settings**, **Server Migration**, **NAT Settings**.
- **Security** — **Export Settings**, **Import SSL Certificates**.
- **Database** — **Remote DB Access**, **MSSQL migration**, **Schedule DB Backup**.

Console path: **Admin → General Settings**.

### Feature-specific settings
Per-module setup, e.g., patch settings, software repository (Network Share / HTTP), asset-scan settings, configuration settings. Console path: **Admin → Configure Settings → Feature-specific settings**.

### Value-added settings
Optional enhancements layered on top of core/feature settings. Console path: **Admin → Configure Settings → Value-added settings**.

---

## 3. Scope of Management (SoM)

**What it is.** The SoM is the **total inventory of computers to be managed** by Endpoint Central. Managed computers can come from **Active Directory** or **Workgroup**, and can be on the **same LAN** or in a **remote location** connected via VPN or Internet.

**Why it's first.** Until the SoM is defined, EC has nothing to target — it's the prerequisite for agent install, patching, deployment, and every other module.

**Setup outline (console nav):**
1. **Admin → Scope of Management → Add Domain/Workgroup.**
2. Choose **Active Directory** or **Workgroup**; supply domain/workgroup name, **admin credentials** (stored in Credential Manager), and DNS suffix.
3. Define **Remote Offices** for branch/WAN/cloud locations (with their communication details — server/SGS address, ports, protocol, optional proxy, optional Distribution Server).
4. Proceed to **agent installation** (traditional devices) or **device enrollment** (modern/mobile devices).

**Subsequent paths from SoM:** adding domain/workgroup → LAN agent install → WAN/remote-office management → cloud management → modern management → Mac/Linux management → APNs cert creation → add devices to Apple Business Manager (ABM).

→ Architecture of LAN/WAN/Remote Office/Distribution Server: [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md).

---

## 4. Device onboarding — traditional vs modern

EC distinguishes two onboarding mechanics:

- **Traditional devices** (servers, desktops, laptops) → **install an agent**.
- **Modern devices** (mobile, rugged, IoT, TV, HoloLens, Surface Hub, Chromebook, and laptops running Mac/Win10/Win11) → **enroll to the central server** (MDM-style).

**Modern laptops are special.** Laptops on **Mac, Windows 10, and Windows 11** fall into *both* categories — to expose every capability they must be onboarded **twice** (agent + enrollment). This double-onboarding can be **automated into a single step** (e.g., Windows Autopilot flow) so admins don't do it manually.

→ Modern/mobile enrollment detail: [mobile-device-management.md](mobile-device-management.md). OS imaging for bare-metal: [os-deployment.md](os-deployment.md).

### Onboarding by platform

| Platform | How devices are onboarded | Notes |
|---|---|---|
| **Windows** (desktop/laptop/server) | Agent install (manual, GPO, SCCM, network share, remote office/DS, Azure/Intune) | Modern Win10/11 laptops can also be **enrolled** (MDM) and/or use Autopilot for zero-touch. |
| **Apple — macOS** | Agent install **and/or** MDM enrollment; **Apple Business Manager (ABM)** for zero-touch; **APNs certificate** required for MDM | Modern Mac laptops are dual-onboarded (agent + enrollment). |
| **Apple — iOS/iPadOS/tvOS** | MDM enrollment via APNs; ABM / Apple Configurator for supervised/zero-touch | APNs cert mandatory and renewed annually. |
| **Android** | MDM enrollment — Android Enterprise, **Zero-Touch**, QR/NFC, EMM token; **FCM** push | Device-owner vs profile-owner (BYOD) modes. |
| **Samsung Knox** | Knox-specific enrollment/containerization on Samsung Android | Knox enrollment is a distinct path within Android onboarding. |
| **ChromeOS / Chromebook** | Enroll via Google Admin console integration | Managed as a modern device. |
| **Linux** | Agent install (manual/script); managed via Linux configurations | See "Managing Linux computers" guide. |

---

## 5. Agent installation methods (traditional endpoints)

The agent is the lightweight, cross-platform client that executes server instructions and reports back; it **auto-upgrades** after the first install. Methods:

| Method | Best for | How it works |
|---|---|---|
| **Automatic (LAN push)** | Computers in the LAN within SoM | Server pushes/installs the agent automatically; needs ports **135/139/445** open and valid admin credentials. |
| **Manual install** | Branch/WAN computers, one-offs, locked-down hosts | Download the agent MSI/package from the console and run it on the endpoint (one-time task). |
| **GPO (logon/startup script)** | AD domains at scale; fallback when LAN push hits Access-Denied/UAC | Deploy the agent via a Group Policy startup script / software-install policy. Note GPO has trade-offs (e.g., agents may not auto-uninstall when EC is removed). |
| **SCCM** | Shops already standardized on Microsoft ECM | Distribute (or **reinstall**) the agent as an SCCM application/package. |
| **Network share** | Distributing the installer internally | Place the agent package on a share and install from there. |
| **Remote Office / Distribution Server** | Branch offices over WAN | Branch agents pull from a local **Distribution Server** to save WAN bandwidth (recommended above ~10–15 endpoints). |
| **Azure / Intune** | Cloud-joined / Entra devices | Azure agent installation methods for cloud devices. |

**Server-address note.** If the server's DNS/IP/port later changes (migration), existing agents must be told the new details via a **cscript/shell script** (`configureDCAgentServerCommunication`) or **GPO** — covered in [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md).

---

## 6. Cloud vs On-Premises onboarding

| Aspect | On-Premises | Cloud (SaaS) |
|---|---|---|
| Server/DB | You install and maintain the EC server + PostgreSQL/MSSQL | ManageEngine hosts it; nothing to install |
| Roaming/mobile reachability | Deploy a **Secure Gateway Server** in a DMZ | Agents call the cloud tenant over HTTPS directly — no SGS to operate |
| Branch bandwidth | **Distribution Servers** per branch | Distribution Servers still available for LAN bandwidth |
| Agent onboarding | Agents point at your server FQDN/IP + ports | Agents point at the cloud tenant URL |
| Feature availability | Home of on-prem-only features (DLP, Secure Private Access, voice/video remote) | Home of cloud-first features (EDR, Zia AI) |
| Patch fixes | You apply PPM updates | ManageEngine patches the tier; you patch agents |

→ Editions/feature gating: [00-product-overview.md](00-product-overview.md). Deployment-model architecture: [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md).

---

## 7. Two-Factor Authentication (2FA)

- **Purpose.** Adds a second verification factor to console login, hardening access to a highly privileged platform.
- **Setup (inferred nav):** **Admin → 2FA/Security** → enable, choose factor (authenticator app via QR / email / etc.), enroll users.
- **Known issue.** A published advisory covers a problem **reconfiguring/regenerating the 2FA QR code** — see [security-advisories-cve.md](security-advisories-cve.md). If a user loses access, regenerate the QR per that guidance.

---

## 8. User & Role Management (Role-Based Administration)

- **Where:** **Admin → User Administration** (under General → Administration).
- **What:** add console users (local or AD-authenticated), assign **roles** (what they can do) and **scopes** (which devices they can act on). RBA is a paid-edition capability.
- **Hardening:** ManageEngine has shipped "**Enhanced scope security for technicians**" and access-control improvements — keep current ([security-advisories-cve.md](security-advisories-cve.md)).
- **AD auth troubleshooting:** "Cannot add and authenticate a user using AD" → ensure the account has the needed rights and the bind isn't restricted (see Identity section in [integrations.md](integrations.md)).

---

## Onboarding troubleshooting (5-lens quick reference)

- **Feature/Detail — "Validation Failed" adding a domain to SoM.** Credentials/DNS suffix wrong or DC unreachable; re-enter valid domain admin credentials and confirm connectivity.
- **UX:** the biggest friction is the **dual-onboarding** of modern laptops and the terse credential/port errors during agent push — guide users to the GPO fallback when LAN push fails.
- **Dev/Technical — agent push fails (Access Denied / network path / logon failure):** verify admin credentials in Credential Manager, ports 135/139/445, UAC/Remote-UAC and DCOM settings (detail in [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)).
- **PM:** time-to-first-managed-device is the activation metric; the Autopilot single-step onboarding and self-healing auto-upgrade reduce that friction.
- **Support — agent not reachable for on-demand tasks / "Unable to reach gateway port":** check domain reachability/whitelisting, proxy config on the remote office, TLS 1.2 enablement, and root-certificate trust (detail in [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)).

---

## Pre-onboarding readiness checklist

Before pushing the first agent, confirm:

1. **Server reachable** — endpoints can resolve and reach the server FQDN/IP on **8020** (and **8383** if HTTPS).
2. **Install path open** — ports **135/139/445** inbound on targets for LAN push (or plan GPO/manual instead).
3. **Credentials staged** — valid admin credentials in **Credential Manager** (per-OU for AD; all-hosts for Workgroup).
4. **UAC/DCOM** — on Vista+ Workgroup targets, Remote-UAC and DCOM handled (see [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)).
5. **TLS 1.2** — enabled on legacy endpoints (Win7/2008R2/2012) and root CA certs present.
6. **Apple/Android prerequisites** — APNs certificate created (Apple), FCM/Android Enterprise set up (Android), before attempting mobile enrollment.
7. **Branch plan** — Distribution Server provisioned for remote offices above ~10–15 endpoints.
8. **Topology decided** — on-prem (with SGS/DS/Failover as needed) vs cloud.

## Suggested first-week sequence

A pragmatic order of operations for a new deployment:

| Day | Task | KB reference |
|---|---|---|
| 1 | Meet prerequisites, install/provision, log in, set up **mail server** + admin account + **2FA** | this file |
| 1–2 | **Define SoM** (domains/workgroups), stage credentials | this file, [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md) |
| 2–3 | Onboard a **pilot group** of Windows endpoints (LAN push or GPO); validate check-in | [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md) |
| 3–4 | Configure **patch settings**, run first **vulnerability DB sync + scan** | [patch-management.md](patch-management.md) |
| 4–5 | Enroll **Apple/Android** devices (APNs/FCM); set up **remote offices + Distribution Servers** | [mobile-device-management.md](mobile-device-management.md), [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md) |
| 5 | Set up **user/role** scopes, integrations (ITSM/SIEM), and baseline **reports** | [integrations.md](integrations.md), [reporting-auditing.md](reporting-auditing.md) |
| Ongoing | Apply **PPM updates** promptly; expand SoM; layer security modules | [security-advisories-cve.md](security-advisories-cve.md) |

## Persona quick-reference

- **UX:** onboarding is a linear wizard (Prereq → Install → SoM → Settings → Onboard); the "two onboardings for one laptop" concept and platform-specific enrollment are the conceptual hurdles.
- **PM:** breadth of onboarding methods (push/GPO/SCCM/share/DS/Azure + ABM/Autopilot/Zero-Touch/Knox/Chrome) is a key "manage anything" selling point; cloud removes the SGS/server burden.
- **Dev:** SoM + Credential Manager + Remote Office objects are the data model that all targeting hangs off; server-address changes require the reconfigure script/GPO.
- **Support:** most onboarding tickets are credential/port/UAC/DCOM on Windows push, APNs on Apple, and FCM/enrollment on Android.

---

## Sources

- Getting Started — https://www.manageengine.com/products/desktop-central/help/getting_started/getting_started.html
- Prerequisites — https://www.manageengine.com/products/desktop-central/help/getting_started/prerequisites.html
- System Requirements — https://www.manageengine.com/products/desktop-central/help/getting_started/desktop_central_system_requirements.html
- Setup / Configuring Endpoint Central — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configuring_desktop_central.html
- Scope of Management — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/defining_scope_of_management.html
- General Settings — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configure-general-settings.html
- Feature-specific settings — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configure-feature-specific-settings.html
- Value-added settings — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configure-value-addition-settings.html
- Device Onboarding — https://www.manageengine.com/products/desktop-central/help/device-onboarding.html
- Agent Installation Methods — https://www.manageengine.com/products/desktop-central/agent-installation.html
- Agent Installation via GPO — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/advantages-and-disadvantages-of-agent-installation-via-gpo.html
- Azure/Intune Agent Installation — https://www.manageengine.com/products/desktop-central/azure-agent-installation.html
- Reinstall Agent via SCCM — https://www.manageengine.com/products/desktop-central/agent-reinstall-via-sccm.html
- Managing computers in WAN / Remote office — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/managing_computers_wan.html
- Managing computers from Cloud — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/managing-computers-from-cloud.html
- Two-Factor Authentication — https://www.manageengine.com/products/desktop-central/secure-access-using-google-authenticator.html
- Role Based Administration — https://www.manageengine.com/products/desktop-central/role-based-administration.html

*Items marked "(inferred)" are reasoned conclusions, not stated verbatim on the cited pages; validate against internal docs/console before relying on them.*
