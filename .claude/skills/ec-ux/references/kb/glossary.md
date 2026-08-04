# Endpoint Central — Glossary of Terms

> An alphabetical glossary of **ManageEngine Endpoint Central** (formerly Desktop Central) terminology. Each entry gives a 1–3 sentence definition and points to the **module file** in this KB where the concept is covered in depth. Use this when a term comes up in a UX/PM/Dev/Support discussion and you need a quick definition plus the right file to open.

**Conventions:** "→" indicates the primary KB module file that owns the term. Items marked **(inferred)** are reasoned from product behavior rather than stated verbatim on the cited pages. See [INDEX.md](INDEX.md) for the full module map and the 5-lens convention.

---

## A

**Agent**
The lightweight, cross-platform software application installed on each managed computer (Windows, macOS, Linux, ChromeOS). It polls the Endpoint Central server for instructions, executes tasks (deploy software, apply configurations, install patches, run scans), and reports status back. Agents auto-upgrade after the initial install.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**Agent Settings**
Console settings that govern agent behavior — the tray icon, system tray notifications, self-service options exposed to end users, and contact details shown to users. Found under **Admin → SoM → Agent Settings**.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md), [getting-started-onboarding.md](getting-started-onboarding.md)

**Allowlist / Blocklist (Application Control)**
Policy lists that explicitly permit (allowlist) or deny (blocklist) applications from running on endpoints, the foundation of Application Control. Modes include strict (only allowlisted apps run), audit, and flexible.
→ [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md)

**APD — Automate(d) Patch Deployment**
An automation that schedules the full patch lifecycle — synchronize the vulnerability database, scan, download, and deploy missing patches to selected targets — on a recurring schedule, optionally with test-and-approve and deployment policies applied.
→ [patch-management.md](patch-management.md)

**APNs — Apple Push Notification service**
Apple's push channel that Endpoint Central uses to send management commands and notifications to enrolled iOS/iPadOS/macOS/tvOS devices. An APNs certificate must be created and renewed annually for MDM to function.
→ [mobile-device-management.md](mobile-device-management.md); architecture context in [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**Active Directory (AD) integration**
EC reads AD to discover computers/users, define Scope of Management by domain/OU/group, authenticate console users, and generate 200+ AD reports. EC is also network-agnostic and can manage Workgroup and Novell eDirectory environments.
→ [getting-started-onboarding.md](getting-started-onboarding.md), [integrations.md](integrations.md), [reporting-auditing.md](reporting-auditing.md)

**Azure AD / Microsoft Entra ID**
Microsoft's cloud identity service. EC integrates with Entra ID for SSO/authentication and Azure-based agent installation (Azure/Intune agent methods) for cloud-joined devices.
→ [integrations.md](integrations.md), [getting-started-onboarding.md](getting-started-onboarding.md)

## B

**BitLocker / FileVault Management**
Centralized management of full-disk encryption — BitLocker on Windows and FileVault on macOS — including enabling encryption, recovery-key escrow, and compliance reporting.
→ [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md)

**Backup & Restore**
The built-in database backup utility (`backuprestore.bat` GUI / scheduled DB backup) and the restore process used during migration, disaster recovery, or incident response. Restore requires a target build that matches the backup's build version.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**BYOD — Bring Your Own Device**
A management model for employee-owned mobile devices in which corporate data lives in a managed container, separable from personal data (selective/corporate wipe).
→ [mobile-device-management.md](mobile-device-management.md)

## C

**Central Patch Repository**
A portal on the ManageEngine website hosting the latest tested **vulnerability database**. The EC server synchronizes this database periodically, scans endpoints for missing patches, and downloads binaries from vendor sites for staged distribution.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md), [patch-management.md](patch-management.md)

**Collection**
A grouping mechanism that bundles multiple **Configurations** so they can be deployed together as a single unit to targets. Useful for applying a standard "build" of settings in one operation.
→ [configuration-management.md](configuration-management.md)

**Configuration**
A discrete, predefined management setting applied to computers or users — for example drive mapping, registry edits, security policies, power schemes, shortcuts, or file/folder operations. EC ships 40+ Windows/Mac/Linux configurations.
→ [configuration-management.md](configuration-management.md)

**Configuration Template**
A reusable, pre-filled definition of a Configuration that lets admins standardize and quickly re-apply common settings without re-entering values.
→ [configuration-management.md](configuration-management.md)

**Containerization**
Logical separation of corporate apps/data from personal apps/data on a mobile device, enabling selective/corporate wipe and policy enforcement only on the work container (especially for BYOD).
→ [mobile-device-management.md](mobile-device-management.md), [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md)

**Credential Manager**
A central store under **Admin → Credential Manager** for the privileged credentials EC uses to perform remote operations (agent install, scans, remote control). Misconfigured credentials are the most common cause of "Access Denied" errors.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md), [getting-started-onboarding.md](getting-started-onboarding.md)

**Custom Group**
A user-defined, often dynamic, grouping of endpoints (by criteria such as OS, location, or custom field) used as a deployment/target audience across modules.
→ [configuration-management.md](configuration-management.md), [it-asset-management.md](it-asset-management.md) (inferred — used as a cross-cutting targeting construct)

**CVE — Common Vulnerabilities and Exposures**
The industry-standard identifier for a publicly disclosed security flaw (e.g., CVE-2024-10203). EC both *remediates* third-party/OS CVEs via patch/vulnerability management and *publishes* CVEs found in its own product.
→ [vulnerability-management.md](vulnerability-management.md) (remediation); [security-advisories-cve.md](security-advisories-cve.md) (EC's own advisories)

## D

**Deployment Policy**
A reusable policy that governs *how/when* a patch or software package is delivered to endpoints — deployment window, reboot/notification behavior, user prompts, retries, and applicability conditions.
→ [patch-management.md](patch-management.md), [software-deployment.md](software-deployment.md)

**DEX — Digital Employee Experience (Endpoint Intelligence)**
The module that measures end-user device experience using performance telemetry (CPU/memory/GPU/boot), computes experience scores, performs root-cause analysis, and triggers automated remediation.
→ [endpoint-intelligence-dex.md](endpoint-intelligence-dex.md)

**Distribution Server (DS)**
Lightweight software installed on one machine in a remote/branch office that caches configurations, software packages, and patch binaries from the central server and serves them locally to branch agents — drastically reducing WAN bandwidth. Rule of thumb: one DS per ~1,000 computers, recommended for branches above ~10–15 endpoints.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**DLP — Data Loss Prevention**
The module that discovers and classifies sensitive data on endpoints and enforces policies (clipboard, file transfer, upload, removable media) to prevent leakage.
→ [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md)

**DMZ — Demilitarized Zone**
A perimeter network segment between firewalls where the Secure Gateway Server is typically deployed so that the EC server itself is never directly exposed to the public Internet.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**DTA tool**
A diagnostic/troubleshooting utility associated with the agent. A privilege-escalation advisory was published relating to the agent's DTA tool (see advisories).
→ [security-advisories-cve.md](security-advisories-cve.md), [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

## E

**EDGE device**
A configuration of the EC server (or its relay) that exposes the designated agent-communication port to the Internet for WAN/roaming scenarios. Best practice is to front this with a Secure Gateway Server rather than exposing the EC server directly.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**EDR — Endpoint Detection and Response**
The security module providing continuous endpoint visibility, indicators of attack/compromise (IoA/IoC), MITRE ATT&CK mapping, Zia AI triage, and guided/single-click response.
→ [endpoint-detection-response.md](endpoint-detection-response.md)

**EPM — Endpoint Privilege Management**
The capability that removes standing local-admin rights and grants just-in-time (JIT) elevation per application, with child-process control — reducing the attack surface for privilege-escalation threats.
→ [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md)

## F

**Failover Server**
An add-on standby EC server that provides high availability: if the primary EC server fails, the failover server takes over so management continues. Must run on a separate machine from the Central/Distribution/Secure Gateway servers.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**FCM — Firebase Cloud Messaging**
Google's push channel (successor to GCM) used to deliver management commands/notifications to Android devices.
→ [mobile-device-management.md](mobile-device-management.md)

**Feature-specific settings**
Per-module configuration done during setup (e.g., patch settings, software repository, asset scan settings) as distinct from feature-independent **General settings** and **Value-added settings**.
→ [getting-started-onboarding.md](getting-started-onboarding.md)

## G

**General settings**
Feature-independent setup items: user administration, Credential Manager, Scope of Management, mail/server/NAT settings, SSL import, and DB backup. Configured under the **Admin** tab.
→ [getting-started-onboarding.md](getting-started-onboarding.md)

**GPO — Group Policy Object**
A Windows AD mechanism EC can use to deploy the agent (startup script / software-installation policy) at scale, and to push updated server details to existing agents.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md), [getting-started-onboarding.md](getting-started-onboarding.md)

## H

**Hotfix / PPM (Patch/Service Pack upgrade)**
An Endpoint Central product update delivered as a PPM file, applied by clicking the build number in the console and downloading the latest applicable build. Keeping current is the primary mitigation for the product's own security advisories.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md), [security-advisories-cve.md](security-advisories-cve.md)

## K

**Kiosk**
A locked-down device mode that restricts the endpoint (desktop or mobile) to a single app or a curated set of apps/sites — common in retail, kiosks, and frontline scenarios.
→ [mobile-device-management.md](mobile-device-management.md), [configuration-management.md](configuration-management.md), [browser-security.md](browser-security.md)

**Knox (Samsung Knox)**
Samsung's enterprise device platform. EC supports Knox enrollment and Knox-specific management/containerization on Samsung Android devices.
→ [mobile-device-management.md](mobile-device-management.md), [getting-started-onboarding.md](getting-started-onboarding.md)

## N

**NAC — Network Access Control**
Policy enforcement that gates network access based on device compliance/posture. (inferred — referenced as an endpoint-security adjacency; validate the exact EC implementation against internal docs.)
→ [secure-private-access.md](secure-private-access.md) (closest module), [vulnerability-management.md](vulnerability-management.md)

**NAT Settings**
Server settings that tell EC how it is reached through Network Address Translation, so agents/relays resolve the correct public address. Found under **Admin → Server → NAT Settings**.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md), [getting-started-onboarding.md](getting-started-onboarding.md)

**NGAV — Next-Gen Antivirus**
Multi-layer/deep-learning malware detection with MITRE TTP forensics, plus anti-ransomware behavior detection and VSS-based rollback.
→ [next-gen-antivirus-ransomware.md](next-gen-antivirus-ransomware.md)

**NS — Nominated System**
A designated endpoint nominated to perform a specialized role on behalf of the server — most notably as the cache/repository system for Linux patch management (e.g., Red Hat/SUSE), uploading/downloading content to/from vendor portals.
→ [patch-management.md](patch-management.md)

## P

**Patch Repository / Patch Store**
The directory on the EC server where downloaded patch binaries are staged before distribution. Its location is configurable; an invalid path causes "Invalid patch-store location" errors.
→ [patch-management.md](patch-management.md), [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**Profile**
A bundle of settings/restrictions/policies (especially in MDM) pushed to a device — for example a Wi-Fi profile, restrictions profile, email/ActiveSync profile, or app-lock profile.
→ [mobile-device-management.md](mobile-device-management.md)

**PXE — Preboot Execution Environment**
The network boot mechanism used by OS Imaging & Deployment to boot bare-metal machines for imaging. "PXE port already in use" is a known OS-deployment error.
→ [os-deployment.md](os-deployment.md)

## R

**RBA — Role-Based Administration**
Console access control that scopes what a technician can see and do (roles + scopes). "Enhanced scope security for technicians" is a published security improvement in this area.
→ [getting-started-onboarding.md](getting-started-onboarding.md), [security-advisories-cve.md](security-advisories-cve.md)

**Remote Office**
A logically defined branch/WAN location in EC (Active Directory, Workgroup, or local-network type) with its own communication details (server/SGS address, ports, protocol, proxy) and optional Distribution Server.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md), [getting-started-onboarding.md](getting-started-onboarding.md)

**Replication Policy**
Settings that control how/when a Distribution Server replicates packages and patches from the central server (bandwidth windows, frequency).
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**Roaming user**
A user/device that moves outside the corporate LAN and connects over the Internet. Roaming users are served securely via the Secure Gateway Server (on-prem) or directly by the cloud tenant.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

## S

**Secure Gateway Server (SGS)**
An intermediate reverse-proxy placed (usually in a DMZ) between Internet-facing roaming/mobile agents and the EC server. It receives all external agent traffic and forwards it inward, keeping the EC server off the public Internet. Sold as an add-on. Must run on its own machine.
→ [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**Self-Service Portal (SSP)**
An end-user-facing catalog where employees install approved software on demand without raising a ticket, reducing IT workload.
→ [software-deployment.md](software-deployment.md)

**Scope of Management (SoM)**
The total inventory of computers EC is set up to manage. Defined first after install by adding domains/workgroups (AD or Workgroup, LAN or remote), it is the foundation for all subsequent management. Found under **Admin → Global/Scope of Management**.
→ [getting-started-onboarding.md](getting-started-onboarding.md), [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

**System Health Policy**
A patch-management policy that classifies a computer's health (Healthy / Vulnerable / Highly Vulnerable) based on the severity and count of missing patches, driving prioritization and dashboards.
→ [patch-management.md](patch-management.md)

**SCCM (Microsoft Endpoint Configuration Manager)**
Microsoft's management suite. EC supports deploying/reinstalling its agent via SCCM as one of several enterprise install methods.
→ [getting-started-onboarding.md](getting-started-onboarding.md), [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)

## T

**Test & Approve**
A patch-management workflow that first deploys patches to a designated test group; only after validation are patches approved for broad production rollout — reducing the risk of bad patches.
→ [patch-management.md](patch-management.md)

**Two-Factor Authentication (2FA / TFA)**
A second verification factor (authenticator app/email/etc.) for console login. A published advisory covers an issue in reconfiguring/regenerating the 2FA QR code.
→ [getting-started-onboarding.md](getting-started-onboarding.md), [security-advisories-cve.md](security-advisories-cve.md)

## U

**UEM — Unified Endpoint Management**
The product category EC belongs to: one agent/console managing desktops, laptops, servers, and mobile/rugged/IoT devices across OSes, combined with endpoint security.
→ [00-product-overview.md](00-product-overview.md)

## V

**Value-added settings**
Optional setup items that enhance the deployment beyond core/feature settings (e.g., advanced or convenience configurations), distinct from General and Feature-specific settings.
→ [getting-started-onboarding.md](getting-started-onboarding.md)

**Vulnerability Database**
The tested catalog of patch/vulnerability metadata that the EC server synchronizes from the Central Patch Repository and uses to detect missing patches and vulnerabilities.
→ [patch-management.md](patch-management.md), [vulnerability-management.md](vulnerability-management.md)

**VPP — Volume Purchase Program (Apple Business Manager)**
Apple's mechanism for buying and distributing apps/licenses in bulk to managed Apple devices; EC distributes VPP apps and tracks license counts. ("License Count exceeded" is a known MDM app-distribution error.)
→ [mobile-device-management.md](mobile-device-management.md)

## W

**WinPE — Windows Preinstallation Environment**
The minimal Windows boot environment used by OS Imaging & Deployment to capture and apply images. "WinPE tool auto download failure" is a known OS-deployment issue.
→ [os-deployment.md](os-deployment.md)

**WNS — Windows Notification Service**
Microsoft's push channel used to deliver management notifications to enrolled Windows 10/11 devices via MDM.
→ [mobile-device-management.md](mobile-device-management.md)

## Z

**Zia AI**
ManageEngine/Zoho's AI assistant surfaced across EC modules (e.g., EDR triage), available primarily in the Cloud deployment.
→ [00-product-overview.md](00-product-overview.md), [endpoint-detection-response.md](endpoint-detection-response.md)

**ZTNA — Zero Trust Network Access / Secure Private Access (Private Access)**
EC's VPN-alternative module: application cloaking + per-app encrypted tunneling with context-aware access, granting users access to specific private apps rather than the whole network.
→ [secure-private-access.md](secure-private-access.md)

---

## Sources

- Endpoint Central Knowledge Base (term context across categories) — https://www.manageengine.com/products/desktop-central/knowledge-base.html
- What is Endpoint Central? — https://www.manageengine.com/products/desktop-central/help/introduction/what-is-desktop-central.html
- Getting Started — https://www.manageengine.com/products/desktop-central/help/getting_started/getting_started.html
- Scope of Management — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/defining_scope_of_management.html
- Device Onboarding — https://www.manageengine.com/products/desktop-central/help/device-onboarding.html
- Product Integrations — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/desktop-central-integrations.html
- General Settings — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configure-general-settings.html
- LAN Architecture — https://www.manageengine.com/products/desktop-central/desktop-central-lan-architecture.html
- WAN Architecture — https://www.manageengine.com/products/desktop-central/desktop-central-wan-architecture.html

*Items marked "(inferred)" are reasoned conclusions, not stated verbatim on the cited pages; validate against internal docs/console before relying on them.*
