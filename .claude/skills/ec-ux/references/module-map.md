# Feature / term → module → KB file (routing)

> Use this to route a request to the module that owns it, then open that file — the full KB is bundled
> with this skill at **`references/kb/<file>.md`** (e.g. `references/kb/patch-management.md`) — for the
> deep detail (Console navigation paths, UX lens, friction hooks). The bundled `references/kb/INDEX.md`
> has an even richer lookup. If a feature spans modules, read all the referenced files. (If the user has
> a newer connected `Endpoint-Central-KB` folder open, prefer that copy.)

## Feature / term you hear → KB file

| Feature / term | KB file |
|---|---|
| Test & Approve, decline patches, deployment policy, APD, WoL before deploy, missing/downloaded patches, System Health Policy | `patch-management.md` |
| Third-party app patching, antivirus definition updates, BIOS/driver updates | `patch-management.md` |
| Zero-day mitigation, CIS benchmarks, hardening, EOL software, security config | `vulnerability-management.md` |
| Deep-learning AV, malware protection, MITRE TTP forensics, quarantine device | `next-gen-antivirus-ransomware.md` (+ `next-gen-antivirus.md`) |
| Ransomware behavior detection, VSS rollback, single-click recovery | `anti-ransomware.md` |
| Attack timeline, IoA/IoC, threat hunting, guided response, incidents/alerts | `endpoint-detection-response.md` |
| Browser lockdown/kiosk, extension control, isolation, Java rules, web filter | `browser-security.md` |
| Allowlist/blocklist apps, application groups | `application-control.md` |
| Remove admin rights, JIT elevation, child-process control, per-app elevation | `endpoint-privilege-management.md` |
| Sensitive-data discovery, DLP, exfiltration, content rules | `endpoint-dlp.md` (overview: `endpoint-data-security-dlp.md`) |
| USB / peripheral control, trusted devices | `device-control.md` |
| BitLocker / FileVault encryption, key recovery | `bitlocker-management.md` |
| ZTNA, application cloaking, per-app VPN, context-aware access | `secure-private-access.md` |
| NAC, system quarantine | `network-access-control.md` |
| Hardware/software inventory, asset scan | `it-asset-management.md` |
| Software metering / usage | `software-metering.md` |
| License compliance | `software-license-management.md` |
| Warranty | `warranty-management.md` |
| Certificates | `certificate-management.md` |
| Power schemes / energy | `power-management.md` |
| Prohibited / blocked software | `prohibited-software.md` |
| App distribution, packaging, templates | `software-deployment.md` |
| Self-service install portal | `self-service-portal.md` |
| Software repository (Network Share / HTTP) | `software-repository.md` |
| Enterprise app catalogue, OTA apps | `enterprise-app-catalogue.md` |
| 40+ configurations, profiles, custom scripts, script repository, collections | `configuration-management.md` |
| PXE / online-offline imaging, zero-touch OS deploy, driver injection | `os-deployment.md` |
| Remote control, session recording, blackout, chat/voice/video, announcements | `remote-troubleshooting.md` |
| Disk cleanup / defrag / chkdsk and other Windows tools | `system-tools.md` |
| CPU/memory/GPU telemetry, RCA, experience score, auto-remediation | `endpoint-intelligence-dex.md` |
| Device enrollment, MDM profiles | `mobile-device-management.md` |
| Mobile app management (MAM), VPP | `mobile-app-management-mam.md` |
| Email / ActiveSync management | `email-management.md` |
| Content / document distribution | `content-management.md` |
| Conditional access | `conditional-access.md` |
| Geo-fencing | `geo-fencing.md` |
| Kiosk mode (mobile & desktop) | `kiosk-management.md` |
| BYOD, containerization, corporate wipe | `byod-management.md` |
| Compliance templates (HIPAA/GDPR/CIS/ISO/PCI), AD reports, scheduled reports | `reporting-auditing.md` |
| Distribution Server, Secure Gateway, agent, ports, sizing, failover | `01-architecture-agent-deployment.md` |
| Editions, pricing, module map, supported OS, positioning | `00-product-overview.md` |
| Prerequisites, Scope of Management, onboarding per platform, roles/2FA | `getting-started-onboarding.md` |
| ITSM/SIEM/identity/analytics integrations | `integrations.md` |
| Zia AI assistant across modules | `zia-ai.md` |
| Term definitions (DS, SGS, SoM, APD, EPM, DLP, ZTNA, VPP, WinPE…) | `glossary.md` |
| EC's own CVEs/advisories | `security-advisories-cve.md` |
| Point-product mapping (Patch Manager Plus, VMP, MDM Plus, …) | `point-products.md` |
| MSP multi-tenant console | `endpoint-central-msp.md` |
| Cloud vs on-prem feature parity, data residency | `cloud-vs-on-premises.md` |
| Admin mobile app | `admin-mobile-app.md` |

## Routing tips
- **Overview vs sub-module**: some parents are overviews with dedicated child files (e.g.,
  `mobile-device-management.md` → MAM / email / content / conditional-access / geo-fencing / kiosk /
  BYOD; `endpoint-data-security-dlp.md` → DLP / device-control / BitLocker). Read the child for depth.
- **Security edition dual-home**: patch/vulnerability/EDR and other security modules appear under the
  unified **Threats & Patches** tab — note both entry points in the brief.
- **Feeds/cross-refs**: each KB file ends with a "Cross-references" section — follow it when the
  feature interacts with others (patch → vulnerability → EDR; MDM → conditional access; etc.).
