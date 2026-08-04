# ManageEngine Endpoint Central — Product Knowledge Base (INDEX)

> Master reference for **ManageEngine Endpoint Central** (formerly **Desktop Central**) — a Unified Endpoint Management (UEM) + Endpoint Security platform from ManageEngine (a division of Zoho Corp). This knowledge base is built to support **UX research/design, Product Management, Development, and Support** discussions: any time a feature, use case, or idea comes up, use these files to know *which module it belongs to, where it lives, how it works, and where it can be expanded.*

**Last built:** 2026-06-22 · **Lens convention:** every module file covers 5 lenses — (1) Feature detail, (2) UX, (3) PM, (4) Developer/Technical, (5) Support/Troubleshooting — plus *UX research hooks* and *Product expansion opportunities*.

---

## How to use this KB

| If you are… | Start with | Then read, per module |
|---|---|---|
| **UX researcher / designer** | This INDEX → `00-product-overview.md` | Section 2 (UX lens) + the "UX research hooks" — friction points, where users get stuck, workflow flows |
| **Product Manager** | `00-product-overview.md` (editions, positioning) | Section 3 (PM lens) — value, personas, competitive angle, **expansion opportunities** |
| **Developer / Architect** | `01-architecture-agent-deployment.md` | Section 4 (Developer/Technical lens) — components, agent mechanics, ports, limits |
| **Support / SE** | The relevant module file | Section 5 (Support/Troubleshooting) — common issues, logs, FAQs |

**Brainstorm / discussion shortcut:** Have a feature or use case in mind? Use the *Feature → Module lookup* table below to jump straight to the right file and section.

---

## Module map

### Foundations
| File | What it covers |
|---|---|
| [00-product-overview.md](00-product-overview.md) | What EC is, Desktop Central → Endpoint Central rebrand, UEM+security category, full module map, supported OS/devices, **editions & pricing** (Free / Professional / Enterprise / UEM / Security), deployment models (on-prem / cloud / MSP), analyst recognition, integrations, Zia AI |
| [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md) | Server, DB, web console, **Distribution Server**, **Secure Gateway Server**, endpoint agent, Central Patch Repository, **ports table**, scalability/sizing, HA/failover, comms security |
| [reporting-auditing.md](reporting-auditing.md) | Audit-ready compliance templates (HIPAA, GDPR, CIS, ISO 27001, PCI DSS, NIST, RBI, DPDPA), 200+ AD reports, custom/query/scheduled reports, compliance dashboards |
| [getting-started-onboarding.md](getting-started-onboarding.md) | Prerequisites, 3-layer settings (general/feature/value-added), **Scope of Management**, device onboarding per platform (Windows/Apple/Android/Knox/Chrome/Linux), agent install methods (manual/GPO/SCCM/share/DS/Azure), cloud vs on-prem, 2FA, user/role management |
| [integrations.md](integrations.md) | ITSM (ServiceDesk Plus, ServiceNow, Jira, Zendesk, Freshservice), security/VM (Tenable, Rapid7, Qualys, CrowdStrike), SIEM (Log360, Splunk), identity (AD/Entra), Analytics Plus, AssetExplorer, PAM360, Zoho Flow + per-integration troubleshooting |
| [zia-ai.md](zia-ai.md) | **Zia AI assistant** — AI for IT admins & end users across modules (patch, troubleshooting, NL queries), execution layer, Cloud/mobile availability, Zoho MCP |
| [glossary.md](glossary.md) | Alphabetical glossary of EC terms (DS, SGS, SoM, APD, System Health Policy, Configuration, Collection, NS, Test & Approve, DEX, EPM, DLP, ZTNA, Kiosk, VPP, APNs, WinPE, Failover, etc.) → module mapping |
| [point-products.md](point-products.md) | Full ManageEngine endpoint **point-product catalog** (Patch Manager Plus, Vulnerability Manager Plus, MDM Plus, Application Control Plus, Device Control Plus, Browser Security Plus, Endpoint DLP Plus, Remote Access Plus, OS Deployer, Patch Connect Plus) ↔ EC module mapping + build-vs-bundle strategy |
| [security-advisories-cve.md](security-advisories-cve.md) | EC's own published advisories/CVEs (agent priv-esc CVE-2024-10203/CVE-2025-5494/DTA/DLL, auth-bypass CVE-2021-44515/44757, SQLi CVE-2022-47523, component CVEs) + why-it-matters + stay-patched guidance |

> **Granularity:** each major module now has its own file PLUS a dedicated file per sub-module. Parent files act as section overviews; the indented children are the standalone deep-dives.

### Management & Deployment suite (UEM core)
| File | Module | Sub-module files |
|---|---|---|
| [patch-management.md](patch-management.md) | Automated patch management — Windows/Mac/Linux + 1,000+ third-party apps | — |
| [software-deployment.md](software-deployment.md) | Application distribution & packaging | [self-service-portal.md](self-service-portal.md) · [software-repository.md](software-repository.md) · [enterprise-app-catalogue.md](enterprise-app-catalogue.md) |
| [it-asset-management.md](it-asset-management.md) | HW/SW inventory & asset scan (core) | [software-metering.md](software-metering.md) · [software-license-management.md](software-license-management.md) · [warranty-management.md](warranty-management.md) · [certificate-management.md](certificate-management.md) · [power-management.md](power-management.md) · [prohibited-software.md](prohibited-software.md) |
| [configuration-management.md](configuration-management.md) | 40+ configurations, profiles, kiosk, 300+ scripts | — |
| [os-deployment.md](os-deployment.md) | Online/offline imaging, zero-touch, HID, templates | — |
| [remote-troubleshooting.md](remote-troubleshooting.md) | Remote control, recording, collaboration, chat/voice/video | [system-tools.md](system-tools.md) |
| [endpoint-intelligence-dex.md](endpoint-intelligence-dex.md) | Digital Employee Experience — telemetry, RCA, remediation | — |
| [mobile-device-management.md](mobile-device-management.md) | MDM enrollment & device management (core) | [mobile-app-management-mam.md](mobile-app-management-mam.md) · [email-management.md](email-management.md) · [content-management.md](content-management.md) · [conditional-access.md](conditional-access.md) · [geo-fencing.md](geo-fencing.md) · [kiosk-management.md](kiosk-management.md) · [byod-management.md](byod-management.md) |

### Security suite (Security Edition / add-ons)
| File | Module | Sub-module files |
|---|---|---|
| [vulnerability-management.md](vulnerability-management.md) | Vulnerability assessment, zero-day, sec-config, hardening | — |
| [next-gen-antivirus-ransomware.md](next-gen-antivirus-ransomware.md) | Malware protection (overview) | [next-gen-antivirus.md](next-gen-antivirus.md) · [anti-ransomware.md](anti-ransomware.md) |
| [endpoint-detection-response.md](endpoint-detection-response.md) | EDR — IoA/IoC, MITRE ATT&CK, guided response | — |
| [browser-security.md](browser-security.md) | Browser restriction, extensions, lockdown, isolation, Java | — |
| [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) | App control + privilege mgmt (overview) | [application-control.md](application-control.md) · [endpoint-privilege-management.md](endpoint-privilege-management.md) |
| [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) | Endpoint data security (overview) | [endpoint-dlp.md](endpoint-dlp.md) · [device-control.md](device-control.md) · [bitlocker-management.md](bitlocker-management.md) |
| [secure-private-access.md](secure-private-access.md) | ZTNA — app cloaking, per-app tunneling, context access | [network-access-control.md](network-access-control.md) (NAC / System Quarantine) |

### Product variants & delivery
| File | Covers |
|---|---|
| [endpoint-central-msp.md](endpoint-central-msp.md) | Endpoint Central **MSP** edition — multi-tenant console for managed service providers, per-client segregation/reporting/billing, RMM/PSA positioning, MSP pricing tiers |
| [cloud-vs-on-premises.md](cloud-vs-on-premises.md) | **Cloud vs On-Premises** editions — architecture/hosting differences, feature parity (EDR & Zia Cloud-only; DLP, Secure Private Access, voice/video remote On-Prem-only), data residency, upgrades, when to choose which |
| [admin-mobile-app.md](admin-mobile-app.md) | **Admin mobile app** (iOS/Android) — patch approve/deploy/scan, remote actions, alerts, asset views, Zia IT assistant (Android), role-bound access |

---

## Feature → Module lookup (quick reference)

Use this when a feature/term comes up in discussion and you need to know *which file owns it*.

| Feature / term you hear | Lives in |
|---|---|
| Test & approve patches, decline patches, deployment policy, WoL before deploy | `patch-management.md` |
| Third-party app patching, antivirus definition updates | `patch-management.md` |
| Zero-day mitigation scripts, CIS benchmarks, web-server hardening, EOL software | `vulnerability-management.md` |
| Deep-learning AV, MITRE TTP forensics, quarantine device | `next-gen-antivirus-ransomware.md` |
| VSS shadow-copy rollback, ransomware behavior detection, single-click recovery | `next-gen-antivirus-ransomware.md` |
| Attack timeline, IoA/IoC, threat hunting, guided response | `endpoint-detection-response.md` |
| Browser kiosk/lockdown, extension control, browser isolation, Java rules, browser router | `browser-security.md` |
| Allowlist/blocklist, remove admin rights, JIT elevation, child-process control, per-app VPN, conditional access | `application-control-privilege-mgmt.md` |
| Sensitive-data discovery, DLP, BitLocker/FileVault, USB control, containerization, remote wipe | `endpoint-data-security-dlp.md` |
| ZTNA, application cloaking, VPN alternative, context-aware access | `secure-private-access.md` |
| Hardware/software inventory, software metering, license compliance, warranty, geo-fencing, power schemes, prohibited software | `it-asset-management.md` |
| Pre-defined app templates, software repository (Network Share / HTTP), self-service portal, app catalogue, OTA mobile apps | `software-deployment.md` |
| CPU/memory/GPU telemetry, RCA, experience score, automated remediation workflows | `endpoint-intelligence-dex.md` |
| Remote control, session recording, blackout, chat/voice/video, announcements, disk cleanup/defrag | `remote-troubleshooting.md` |
| PXE / online-offline imaging, zero-touch OS deploy, driver injection, profile migration | `os-deployment.md` |
| 40+ configurations, profiles, kiosk, custom scripts / script repository | `configuration-management.md` |
| Device enrollment, MAM, BYOD, email/ActiveSync, content management, corporate wipe | `mobile-device-management.md` |
| Compliance templates (HIPAA/GDPR/CIS/ISO/PCI), AD reports, scheduled reports | `reporting-auditing.md` |
| Distribution Server, Secure Gateway, agent, ports, sizing, failover | `01-architecture-agent-deployment.md` |
| Editions, pricing, what's gated where, integrations, Zia AI | `00-product-overview.md` |

---

## Editions at a glance

Single agent, single console. Capabilities unlock by edition (validate exact gating against the official [edition comparison matrix](https://www.manageengine.com/products/desktop-central/edition-comparison-matrix.html)); details in `00-product-overview.md`.

| Edition | Indicative starting price* | Adds (over previous) |
|---|---|---|
| Free | $0 (up to 25 endpoints) | Core management for small environments |
| Professional | ~$795 / 50 endpoints / yr | Patch mgmt, app distribution, asset mgmt, remote troubleshooting, BYOD, kiosk |
| Enterprise | ~$945 / 50 endpoints / yr | Self-service portal, USB device mgmt, audit remote session, license mgmt |
| UEM | ~$1,095 / 50 endpoints / yr | Remote data wipe, OS deployment, FileVault encryption |
| Security | ~$1,695 / 50 endpoints / yr | Vulnerability remediation, DLP, endpoint privilege mgmt, browser security |

\*Prices captured from public pricing at build time — confirm current numbers before quoting.

---

## Conventions & disclaimers

- **Source of truth:** content is sourced from public manageengine.com product/feature/help pages (each file lists its URLs under "Sources"). Marketing pages can lag the shipping product.
- **Inferred items:** anything not explicitly stated on the source pages — especially **ports/protocols, exact edition gating, some data-model object names, and a few platform-coverage details** — is marked **"(inferred)"** in the files. Treat these as hypotheses to validate against internal docs/console before relying on them in a customer or engineering decision.
- **Gaps to validate internally:** Secure Private Access edition/OS matrix; DEX (Endpoint Intelligence) technical internals (newer module, light public docs); FileVault/macOS encryption specifics; deep `/help/` API details.
- These are reference docs, not official documentation. For authoritative specs, cross-check the in-product help and internal PRDs/specs.

---

## Suggested next steps (this KB can grow)

- ~~Add a `glossary.md`~~ ✅ added — [glossary.md](glossary.md).
- ~~Add `integrations.md`~~ ✅ added — [integrations.md](integrations.md).
- ~~Add onboarding & security-advisory references~~ ✅ added — [getting-started-onboarding.md](getting-started-onboarding.md), [security-advisories-cve.md](security-advisories-cve.md).
- Add `zia-ai.md` for the AI assistant capabilities across modules.
- Layer in screenshots/console navigation paths once captured from a live tenant.
- Validate every "(inferred)" tag against internal documentation and replace with confirmed facts.
