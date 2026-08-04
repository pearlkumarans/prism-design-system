# ManageEngine Endpoint Point Products — Catalog & EC Mapping

> **What this file is.** ManageEngine sells most endpoint capabilities **two ways**: (1) as small, standalone "**point products**" — each a focused tool you can buy on its own (Patch Manager Plus, Mobile Device Manager Plus, etc.), and (2) bundled together inside **Endpoint Central**, the unified endpoint management + security (UEM + UES) suite. The same engineering team builds both; a point product is effectively "one module of Endpoint Central, sold separately." This file catalogs every point product in the endpoint/UEM/security family, says in one line what each does, and maps it to the matching **Endpoint Central module** and its **KB file**, so that when a feature comes up in conversation the reader instantly knows *both* the EC module *and* the standalone product it corresponds to.
>
> Pricing figures below are taken from the manageengine.com product pages at the time of research (2026-06) and are **list/"starts at" prices** that change frequently — always **confirm current pricing** with a quote. Figures not visible on the pages are marked **(inferred)** or **(confirm)**.

---

## Quick mapping table

| Point product | What it does (1 line) | Endpoint Central module | KB file | Standalone editions (incl. Cloud / MSP) |
|---|---|---|---|---|
| **Patch Manager Plus** | Automated patching of Windows/macOS/Linux OS + 850–1,100+ third-party apps | Automated patching | [patch-management.md](patch-management.md) | Free, Professional, Enterprise; Cloud; MSP |
| **Vulnerability Manager Plus** | Multi-OS vulnerability assessment, security config (CIS/STIG), built-in remediation | Threat & vulnerability management | [vulnerability-management.md](vulnerability-management.md) | Free (inferred ≤25), Professional, Enterprise; Cloud; MSP (inferred) |
| **Mobile Device Manager Plus (MDM Plus)** | Manage/secure mobile + endpoint OSs (iOS/iPadOS/Android/Windows/macOS/ChromeOS/tvOS) | Mobile device management | [mobile-device-management.md](mobile-device-management.md) | Free (inferred ≤25), Standard, Professional; Cloud; MSP |
| **Application Control Plus** | App allowlisting/blocklisting + endpoint privilege management (EPM) | Application & privilege management | [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) | Free (≤25), Professional; Cloud (via Endpoint Security platform) |
| **Device Control Plus** | Control/monitor USB & peripheral devices; file-transfer control | Peripheral device control (within Endpoint data security) | [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) | Free (inferred ≤25), Professional; Cloud (inferred) |
| **Browser Security Plus** | Manage/secure multiple browsers, extensions, lockdown, compliance | Browser security | [browser-security.md](browser-security.md) | Free (≤25), Professional |
| **Endpoint DLP Plus** | Endpoint data loss prevention — discover, classify, control data egress | Data loss prevention (within Endpoint data security) | [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) | Free (inferred ≤25), Professional; Cloud (inferred) |
| **Remote Access Plus** | Remote desktop / troubleshooting, system tools, voice/video chat, WoL | Advanced remote troubleshooting | [remote-troubleshooting.md](remote-troubleshooting.md) | Free, Standard, Professional; Cloud |
| **OS Deployer** | OS imaging & zero-touch deployment, golden images, driver mgmt | OS imaging and deployment | [os-deployment.md](os-deployment.md) | Free (≤4 WS + 1 server), Professional, Enterprise |
| **Patch Connect Plus** | **Third-party** patching add-on for **SCCM / Intune / WSUS** (not EC's own engine) | (Adjacent — extends Microsoft tools, not bundled in EC) | [patch-management.md](patch-management.md) | Standard, Professional, Enterprise |
| **Endpoint Central** | The unified UEM + security suite that **bundles** the modules above | (The suite itself) | [00-product-overview.md](00-product-overview.md) | Free (≤25), Professional, Enterprise, UEM, Security; Cloud; MSP |
| **Endpoint Central MSP** | Multi-tenant RMM edition of the suite for managed service providers | (Suite — MSP variant) | [endpoint-central-msp.md](endpoint-central-msp.md) | MSP (component/pay-per-use); Cloud & On-prem |

> Adjacent / related modules that exist **only inside Endpoint Central** (no standalone "Plus" sibling): **Endpoint Detection & Response (EDR)**, **Next-Gen Antivirus / Anti-ransomware**, **IT Asset Management**, **Software Deployment**, **Configuration Management**, **Digital Employee Experience (DEX)**, **Secure Private Access (ZTNA)**. These have KB files but are *not* sold as separate point products today.

---

## How point products relate to Endpoint Central

### The "build vs. bundle" story

ManageEngine has spent 20+ years building endpoint capabilities from homegrown technology ("zero acquisition"). Rather than ship one monolith, they **modularized** the engine and exposed each module as a sellable unit:

- **Point product** = one capability, its own console, its own pricing page, its own free tier (usually up to 25 endpoints). Examples: Patch Manager Plus, Browser Security Plus.
- **Endpoint Central** = the *same* capabilities re-bundled behind a **single agent** and a **single console**, sold in tiered editions (Professional → Enterprise → UEM → Security). Buying the suite is cheaper per-capability than stacking point products, and you avoid running multiple servers/agents.

Almost every point-product homepage explicitly cross-sells Endpoint Central ("Want complete endpoint protection? Explore Endpoint Central"), and several even describe themselves as "the X component of Endpoint Central." This is deliberate: the point product is the **land**, Endpoint Central is the **expand**.

### When a customer buys a point product vs. the suite

| Buy the **point product** when… | Buy **Endpoint Central** when… |
|---|---|
| You only need one capability (e.g., just patching, or just MDM). | You need ≥2 capabilities (patch + asset + remote + security). |
| You already own a competing UEM and want to bolt on one gap (very common with Patch Connect Plus for SCCM/Intune shops). | You want one agent, one console, one vendor for the whole endpoint lifecycle. |
| You want the cheapest possible entry / free tier for a single function. | You want better blended per-endpoint economics across functions. |
| A different team owns that function (e.g., SecOps owns vulnerability, IT owns patching). | One team owns the endpoint estate end-to-end. |

### Licensing implications

- Point products are typically **per-device/per-endpoint per month or per year** (e.g., PMP "< $1/endpoint/month", VMP Professional "$0.9/device/month"). Endpoint Central is sold in **edition tiers priced per block of endpoints** (e.g., Professional "$795/yr for 50 endpoints").
- A point product license generally **does not** unlock the rest of the suite. To get additional modules you either add more point products or **migrate to Endpoint Central** (ManageEngine publishes dedicated migration paths, e.g. `pmp-vs-ec`, `vmp-vs-ec`).
- Within Endpoint Central, some capabilities are **add-ons even in the suite** — notably **Application Control + Endpoint Privilege Management** features like Just-in-Time access are called out as "available only in Endpoint Central with the Application Control and Endpoint Privilege Management add-on."

### Shared agent / shared console notes

- **One unified agent.** Endpoint Central's headline differentiator is a single lightweight agent that performs management *and* security ("accomplish your IT and security needs using a single agent"). Running several point products instead can mean several agents/servers — a key reason to consolidate.
- **Console reuse.** Several point products (Browser Security Plus, Device Control Plus, MDM Plus, PMP, VMP) market the ability to be "overseen from the Endpoint Central console," reflecting the shared codebase.
- **Cloud vs. on-prem applies at both levels.** Most point products and Endpoint Central itself ship in both Cloud (SaaS) and On-Premises forms. See [cloud-vs-on-premises.md](cloud-vs-on-premises.md).

### Naming clarity (so the reader is never confused)

A few naming traps worth fixing in the reader's mind up front:

- **"Desktop Central" = "Endpoint Central."** The suite was renamed from **Desktop Central** to **Endpoint Central** around 2022; the URL slug is still `/products/desktop-central/`. Treat them as the same product.
- **"Remote Access Plus" lives at `/remote-desktop-management/`.** The product brand is *Remote Access Plus*; the marketing slug talks about "remote desktop management." Same thing.
- **"Patch Connect Plus" lives at `/sccm-third-party-patch-management/`.** It is **not** "Patch Manager Plus." Patch *Manager* Plus = ManageEngine's own patch engine; Patch *Connect* Plus = a bolt-on for **Microsoft** SCCM/Intune. Easy to mix up — they solve patching for two different management planes.
- **"Endpoint Privilege" is not a separate product.** Endpoint Privilege Management (EPM) ships *inside* **Application Control Plus** (standalone) and as the EPM module inside EC. There is no standalone "Endpoint Privilege Plus."
- **The "+ /Plus" suffix** marks a point product (Patch Manager **Plus**, Device Control **Plus**, …). The suite has no "Plus" — it is just *Endpoint Central*.

### Deployment-model & licensing comparison at a glance

| Dimension | Point products | Endpoint Central (suite) | Patch Connect Plus (special case) |
|---|---|---|---|
| Agent | One agent per product (sprawl risk) | One unified agent for all modules | Uses **Microsoft's** SCCM/Intune agent — no ME agent |
| Console | Separate console per product | Single console | Plugs into the SCCM/Intune console |
| Pricing unit | Per device/endpoint (mo or yr) | Per block of endpoints, by edition tier | Per instance/seat (confirm) |
| Free tier | Usually ≤25 endpoints (some ≤4 for OS Deployer) | ≤25 endpoints (inferred) | Free catalogs (Standard) |
| Cloud / MSP | Marquee products yes; security line thinner | Cloud + MSP both shipped | On-prem extension product |
| Best buyer | Single-function / single-team | Whole endpoint estate, one team/vendor | Existing Microsoft-managed estate |

---

## Per-product detail

### Patch Manager Plus

- **What it is / key capabilities.** An all-around automated patch management solution. Periodically scans managed systems for missing patches, then auto-tests and deploys via lightweight agents. Covers **Windows, macOS, Linux** OS patches plus **850+ (homepage also says 1,100+ across the platform)** third-party applications (Adobe, Java, Office, Chrome, Teams, Skype, etc.). Features: automated patch deployment, test-and-approve before rollout, decline/roll-back of faulty patches, driver/BIOS/antivirus updates (Enterprise), scheduled remote shutdown + Wake-on-LAN, bandwidth optimization, Self-Service Portal for patches, patching across LAN/WAN/DMZ and **work-from-home without VPN**, and a mobile app (iOS/Android).
- **Maps to EC module:** [patch-management.md](patch-management.md) — included in **every paid EC edition from Professional up** (patch management is a core Professional feature).
- **Platforms supported.** Windows, macOS, Linux (Red Hat, SUSE, Ubuntu, CentOS, Pardus, Oracle Linux, Rocky Linux, Debian), plus 850+ third-party apps.
- **Editions / pricing (confirm current).** **Professional** "starts at less than $1/endpoint/month" (multi-OS, third-party patching, reporting, Self-Service Portal). **Enterprise** "starts at $1/endpoint/month" (adds drivers/BIOS/AV updates, scheduled remote shutdown + WoL, automated patch testing/approval, bandwidth optimization). Also offered as **Cloud** and an **MSP** edition (Patch Manager Plus MSP). A free tier exists across ManageEngine endpoint tools (typically ≤25 endpoints) — **(confirm for PMP)**.
- **Positioning / when to choose standalone vs. EC.** Choose PMP standalone when patching is the only gap (especially to complement an existing UEM). Choose EC when you also need vulnerability, asset, remote, or security. PMP homepage explicitly cross-sells: "Want complete endpoint protection? Explore Endpoint Central."
- **Notable differences vs. the EC module.** Functionally the same patch engine. PMP standalone is patch-only; the EC module sits alongside vulnerability management, software deployment, and configurations in one console/agent, enabling tighter "detect-and-remediate" workflows.

### Vulnerability Manager Plus

- **What it is / key capabilities.** A multi-OS vulnerability management and compliance solution with **built-in remediation** (patching included at no extra cost in the Enterprise edition). Capabilities: vulnerability scanning + attacker-based prioritization (exploitability, severity, age, affected count, fix availability); **security configuration management**; **CIS compliance** (75+ benchmarks) and STIG; **web server hardening**; **high-risk software audit** (detect & uninstall EOL/peer-to-peer/remote-sharing software); **zero-day vulnerability mitigation** via pre-built tested scripts; **antivirus audits**; and **network device** (firmware) vulnerability scanning + patching. Single console across local, DMZ, remote, and roaming endpoints.
- **Maps to EC module:** [vulnerability-management.md](vulnerability-management.md) — included in EC's higher tiers; "vulnerability remediation" is a headline of the **EC Security edition**.
- **Platforms supported.** Windows, Linux, macOS (plus network devices).
- **Editions / pricing (confirm current).** **Professional** "$0.9/device/month" (scanning/assessment, misconfiguration detection, high-risk software detection, secure-config deployment, server misconfig resolution, reports). **Enterprise** "$1.55/device/month" (adds built-in patch management, automated patch deployment, high-risk software uninstallation, zero-day mitigation, compliance, network devices). Cloud available; **MSP variant inferred**; free tier (≤25) **(inferred)**.
- **Positioning / when to choose standalone vs. EC.** Choose VMP standalone when SecOps owns vulnerability management separately from IT's patching. Choose EC (Security edition) when you want vulnerability + DLP + EPM + browser security + ransomware in one platform. Migration path: `vmp-vs-ec`.
- **Notable differences vs. the EC module.** VMP already *contains* a patch module, so it overlaps with Patch Manager Plus (see PM notes below). In EC, vulnerability and patch are unified rather than duplicated, removing that overlap.

### Mobile Device Manager Plus (MDM Plus)

- **What it is / key capabilities.** Enterprise MDM/EMM covering full mobile lifecycle (onboarding → retirement). Manages **smartphones, tablets, laptops, desktops, TVs, and rugged devices**. Pillars: **device management** (single console, dashboards, profiles for Wi-Fi/VPN), **app management** (in-house + store app distribution, Kiosk mode, app inventory/licenses), **security management** (remote lock/wipe, jailbreak/root detection, role-based access), **email management** (Conditional Exchange Access, Office 365/Azure), **content management** (secure doc distribution), and **containerization** (separate corporate vs. personal, BYOD work profiles). Admin mobile app available (see [admin-mobile-app.md](admin-mobile-app.md)).
- **Maps to EC module:** [mobile-device-management.md](mobile-device-management.md) — MDM is a core part of EC (BYOD/Kiosk appear from EC Professional; remote data wipe in EC UEM edition). MDM page states its features run "within Endpoint Central."
- **Platforms supported.** Android, iOS, iPadOS, tvOS, macOS, Windows, Chrome OS.
- **Editions / pricing (confirm current).** **Cloud:** Standard "$1.28/device/month", Professional "$2.38/device/month" (annual billing saves up to 20%). **On-Premises:** Standard "$9.9/device/year", Professional "$17.9/device/year". Standard = MDM, app distribution, config/restriction mgmt, Kiosk, geotracking, remote commands; Professional adds content mgmt, custom configs, app/OS update policies, conditional access, remote control, geofencing. **MSP** edition (MDM Plus MSP) and **Cloud** both exist. Free tier ≤25 **(inferred)**. The page also cross-sells EC at "$2.48/device/month (cloud) / $18.9/device/year (on-prem)" as "everything in MDM Professional + asset/patch/vuln/malware/app-control/OS-deploy/remote."
- **Positioning / when to choose standalone vs. EC.** Choose MDM Plus standalone for mobile-only fleets (frontline, BYOD, education, retail/rugged). Choose EC when those same devices sit beside Windows/Mac/Linux endpoints needing patch/asset/security in one console.
- **Notable differences vs. the EC module.** Same MDM engine. Standalone focuses purely on devices/apps/content/email; the EC module integrates MDM with the broader endpoint estate (one agent, shared asset/security data).

### Application Control Plus

- **What it is / key capabilities.** Application control **plus** endpoint privilege management (EPM) in one product. **Application Control:** allowlisting/blocklisting, audit mode (see what would be blocked before enforcing), tracking of unmanaged executions/block events, and **Just-in-Time (JIT) application access** (temporary allow, auto-revoke). **Endpoint Privilege Management:** eliminate standing local-admin rights, passwordless app-specific elevation, JIT elevation with auto-revoke, and elevation of Control Panel applets / built-in admin tools for standard users. Workflow model: **Discover → Audit → Enforce**.
- **Maps to EC module:** [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) — in EC this surfaces as **Application & privilege management** / **Endpoint privilege management**, part of the **EC Security edition**. JIT access is explicitly "available only in Endpoint Central with the Application Control and Endpoint Privilege Management add-on."
- **Platforms supported.** Windows primarily (allowlisting/EPM are Windows-centric); macOS coverage **(confirm)**.
- **Editions / pricing (confirm current).** **Free** $0 up to 25 endpoints. **Professional** "$6/endpoint per year" (quoted for 1,000 endpoints; per-endpoint price drops as you scale). Cloud is offered "**via the Endpoint Security platform**" (sign-up routes to EC cloud), which is notable — its cloud delivery is tied to the EC security console rather than a wholly separate SaaS app.
- **Positioning / when to choose standalone vs. EC.** Choose ACP standalone to validate allowlisting/EPM policies cheaply (free up to 25, audit-mode rollout). Choose EC Security when you also want vulnerability, DLP, device control, browser security, and EDR.
- **Notable differences vs. the EC module.** Application Control Plus is the product that **combines** application control *and* endpoint privilege management. Within EC these can appear as related-but-distinct modules ("Application & privilege management" and "Endpoint privilege management"). JIT capabilities are gated to the EC add-on. **Note on naming:** there is **no separate "Endpoint Privilege" point product** — EPM ships as part of Application Control Plus standalone and as the EPM module inside EC.

### Device Control Plus

- **What it is / key capabilities.** Peripheral/removable-device control and file-access management. Block/allow/monitor **USB and peripheral devices**; set **read-only** access; block file copy from removable media; **file type / file size transfer restrictions**; **trusted device list** (zero-trust — only authorized devices connect); **temporary/time-bound access**; **role-based access control** for devices; audit logs, dashboards, and instant unauthorized-access alerts. Positioned as the "peripheral device security component of Endpoint Central."
- **Maps to EC module:** part of **Endpoint data security** → see [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md). In EC it appears as **peripheral device control / USB device management** (USB device management is an **EC Enterprise**-edition feature; deeper device control sits in the Security edition's data-security suite).
- **Platforms supported.** Windows (primary); macOS **(confirm)**.
- **Editions / pricing (confirm current).** Free tier ≤25 **(inferred)** and **Professional** (per-endpoint; **figures not published on the homepage — confirm via quote**). Cloud delivery **(inferred)**.
- **Positioning / when to choose standalone vs. EC.** Choose Device Control Plus standalone when the only requirement is USB/peripheral lockout for insider-threat/DLP-lite. Choose EC when device control should be combined with content-aware DLP (Endpoint DLP Plus capabilities) and the rest of endpoint security.
- **Notable differences vs. the EC module.** Same engine. Standalone is device-port control only; inside EC it integrates with **Endpoint DLP Plus** capabilities for content-aware policies (e.g., allow printing of sensitive docs only with a watermark) — Endpoint DLP Plus itself markets a "stringent device control" sub-feature, showing the two converge in EC's data-security module.

### Browser Security Plus

- **What it is / key capabilities.** Enterprise browser security and multi-browser management. **Identify** browser usage trends and add-ons; **enforce** security configurations from one console; **control** plug-ins/extensions/sites (provide or revoke access, **browser lockdown** to trusted business apps, **web isolation** for enterprise vs. non-enterprise sites); **audit** browser health and compliance with custom configs. Protects against phishing, watering-hole attacks, ransomware, viruses, trojans, credential theft, and accidental data leakage.
- **Maps to EC module:** [browser-security.md](browser-security.md) — surfaces as **Browser security** in EC; a headline of the **EC Security edition**. Page markets being run "from the comfort of your Endpoint Central console."
- **Platforms / browsers supported.** Google Chrome, Microsoft Edge, Mozilla Firefox, plus Ulaa, Brave, Yandex, Vivaldi, Cốc Cốc, Naver Whale, Internet Explorer. (Windows-centric.)
- **Editions / pricing (confirm current).** **Free** up to 25 computers; **Professional** (full feature suite; **per-endpoint price not published on homepage — confirm**). No separately advertised Cloud/MSP variant on the page **(inferred: available via EC cloud/MSP)**.
- **Positioning / when to choose standalone vs. EC.** Choose Browser Security Plus standalone for browser-only hardening (common ahead of Windows migrations / for compliance). Choose EC Security to combine browser security with DLP, EPM, device control, and vulnerability.
- **Notable differences vs. the EC module.** Same engine; EC integrates browser data with the wider security posture.

### Endpoint DLP Plus

- **What it is / key capabilities.** Dedicated **endpoint data loss prevention**. **Detect** (advanced data discovery + content inspection for PII, PHI, financial data, IP), **classify** (predefined templates, keyword search, fingerprinting, document matching, RegEx), and **enforce** (granular rules for access and transfer). Features: insider-threat monitoring, false-positive remediation/override workflows, **cloud upload protection** (browser + third-party cloud), **email/Outlook DLP** (control sensitive attachments to trusted domains), **data containerization** (trusted apps), **device control** for USB/peripherals (with watermarked-print allowance), and reports/alerts. Lightweight agents enforce policies even offline.
- **Maps to EC module:** part of **Endpoint data security / Data loss prevention** → [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md). "Data loss prevention" is a headline of the **EC Security edition**.
- **Platforms supported.** Windows (primary). macOS **(confirm)**.
- **Editions / pricing (confirm current).** Free tier ≤25 **(inferred)** and **Professional** (per-endpoint; **figures not on homepage — confirm**). Cloud **(inferred)**.
- **Positioning / when to choose standalone vs. EC.** Choose Endpoint DLP Plus standalone for data-protection-only projects (compliance-driven: GDPR/HIPAA/PCI). Choose EC Security when DLP should sit beside device control, EPM, browser security, and ransomware protection on one agent.
- **Notable differences vs. the EC module.** Endpoint DLP Plus **and** Device Control Plus both feed EC's single **Endpoint data security** module — in the standalone world they are two products; in EC they converge into one DLP + peripheral-control suite. Hence both map to the same KB file.

### Remote Access Plus

- **What it is / key capabilities.** Enterprise remote desktop management / troubleshooting. **Advanced remote control** (Windows, Mac, Linux; HIPAA-ready; 10+ features), **System Manager** (12+ tools: processes, services, command prompt, registry, users, files, shares, printers), **voice/video/text chat**, **unattended remote access**, **file transfer**, **screen recording**, **Wake-on-LAN**, **remote shutdown/lock/sleep**, audit-ready reports, and **remote control for Android devices**. Includes 2FA.
- **Maps to EC module:** [remote-troubleshooting.md](remote-troubleshooting.md) — surfaces as **Advanced remote troubleshooting / remote desktop sharing**; remote troubleshooting is an **EC Professional** core feature (session auditing is an Enterprise feature).
- **Platforms supported.** Windows, macOS, Linux; plus Android device remote control.
- **Editions / pricing (confirm current).** **Free** (fully functional, for small businesses), **Standard** (advanced remote desktop access), **Professional** (full 12+ troubleshooting tools). Cloud and On-Premises both offered. Per-endpoint **figures not published on homepage — confirm**.
- **Positioning / when to choose standalone vs. EC.** Choose Remote Access Plus standalone for a help-desk/MSP that only needs remote support. Choose EC when remote troubleshooting should be one click away from asset, patch, and security data on the same endpoints.
- **Notable differences vs. the EC module.** Same remote engine. Note the URL/branding nuance: the product lives at `/remote-desktop-management/` and is branded **Remote Access Plus**.

### OS Deployer

- **What it is / key capabilities.** OS imaging and deployment for enterprises/SMBs. Three steps — **Create** (online/offline imaging of live machines), **Customize** (per role/department; post-deployment apps & activities), **Deploy** (multicast/unicast; authentication passcodes). Features: image live machines without disrupting users, **user-state/profile migration**, **hardware-independent deployment** (one golden image to any make/model), **automated driver management**, **zero-touch deployment**, and **deploy-anywhere** (provision WFH/remote-office machines). **Machine-based licensing** (per workstation/server; unlimited re-deployments per licensed machine).
- **Maps to EC module:** [os-deployment.md](os-deployment.md) — surfaces as **OS imaging and deployment**; an **EC UEM-edition** feature.
- **Platforms supported.** Windows (imaging/deployment is Windows-focused).
- **Editions / pricing (confirm current).** **Free** (up to 4 workstations + 1 server — fully functional, SMB-suitable), **Professional** (computers in LAN: online/offline imaging, multicast/unicast, hardware-independent deployment, computer-specific settings, SID handling), **Enterprise** (adds remote-office/WAN deployment). Per-machine **price not published on homepage — confirm**. No advertised standalone Cloud/MSP variant **(inferred via EC)**.
- **Positioning / when to choose standalone vs. EC.** Choose OS Deployer standalone for imaging/refresh projects (Windows migrations, lab/classroom reimaging). Choose EC UEM when OS deployment should chain into immediate patch/app/config provisioning on the same agent.
- **Notable differences vs. the EC module.** Same imaging engine. Standalone uses machine-based licensing; in EC, OS deployment is bundled into the UEM edition's per-endpoint model.

### Patch Connect Plus

- **What it is / key capabilities.** **The odd one out** — not a slice of Endpoint Central, but an **integration/extension product** that adds **third-party patching to Microsoft SCCM (ConfigMgr), Intune, and WSUS/SCUP**. It plugs into the Microsoft consoles so existing SCCM/Intune shops can patch 800+ non-Microsoft apps without ripping out their tooling. Features: automated third-party patch publishing to SCCM/Intune, **native SCCM plug-in**, **application management** in SCCM and Intune, **SCCM Right Click Tools** (client troubleshooting/admin from the console), customized deployment with pre/post scripts, auto-detect & publish, third-party update catalogs (SCCM 1806+, SCUP), and deployment reports.
- **Maps to EC module:** loosely related to [patch-management.md](patch-management.md) **conceptually only**. It is **NOT bundled inside Endpoint Central** and does **not** use EC's agent — it is a distinct integration product for customers who keep Microsoft's management plane. If a customer would rather run patching *inside* SCCM/Intune than adopt EC/PMP, Patch Connect Plus is the answer.
- **Platforms supported.** Windows third-party applications, delivered through SCCM / Microsoft Intune / WSUS.
- **Editions / pricing (confirm current).** **Standard** (publish 500 third-party update catalogs to SCCM 1806+ / SCUP — free catalog access), **Professional** (automated publishing of 800 apps, all SCCM versions, native plug-in, customized deployment, multi-user, reports, WSUS support), **Enterprise** (adds application management in SCCM + Intune, Intune update management, SCCM Right Click Tools). Per-seat/per-instance **pricing not published on homepage — confirm via quote**.
- **Positioning / when to choose.** Choose Patch Connect Plus when the customer is **committed to SCCM/Intune** and only needs to close the third-party-patching gap (and optionally get right-click tools). Choose Patch Manager Plus or Endpoint Central instead when they want ManageEngine's own patch engine/agent.
- **Notable differences vs. PMP / EC patch module.** PMP and EC patch *with their own agent and console*; Patch Connect Plus patches *through Microsoft's agent and console*. Different deployment model, different buyer (existing Microsoft estate), different licensing. They are complementary, not interchangeable.

### Endpoint Central (the unified suite)

- **What it is / key capabilities.** The flagship **UEM + endpoint security** platform that bundles the modules above behind **one agent and one console**: automated patching, threat & vulnerability management, ransomware protection, IT asset management, MDM, DEX, DLP, OS imaging/deployment, app management & distribution, endpoint privilege management, advanced remote troubleshooting, configuration management, browser security, and **EDR**. Recognized by Gartner (Peer Insights Customers' Choice; Magic Quadrant Challenger), IDC MarketScape (Leader), and Forrester Wave (Strong Performer). Supports Windows, macOS, Linux, ChromeOS, Android, iOS, iPadOS, tvOS across desktops, laptops, servers, mobiles, tablets, TVs, IoT, and rugged devices.
- **Maps to KB:** [00-product-overview.md](00-product-overview.md) (and the whole KB).
- **Editions / pricing (confirm current).** **Free** (≤25 endpoints, **inferred**), **Professional** "$795/yr for 50 endpoints" (patch, app distribution, asset, remote, BYOD, Kiosk), **Enterprise** "$945/yr for 50" (+ self-service portal, USB device management, audit remote session, license mgmt), **UEM** "$1,095/yr for 50" (+ remote data wipe, OS deployment, FileVault encryption), **Security** "$1,695/yr for 50" (+ vulnerability remediation, DLP, EPM, browser security). Cloud (SaaS) and On-Premises both available — see [cloud-vs-on-premises.md](cloud-vs-on-premises.md).
- **Why it exists alongside point products.** It is the upsell/consolidation target — better blended economics, single agent, single console, cross-module workflows (e.g., vulnerability → patch in one place).

### Endpoint Central MSP / Cloud

- **What it is / key capabilities.** The **multi-tenant RMM** edition of the suite for managed service providers ("Next-Gen RMM Software"). Single lightweight agent, cross-platform (Windows/Apple/Linux/Android), multi-tenant console, **pay-for-what-you-use component-based pricing** (no forced bundles), region-specific data centers for data residency/compliance, and end-user privacy by design. Feature set mirrors EC: patch management (1,100+ patches), remote access (with video/audio + session recording), asset monitoring + intelligent alerts, application management (10,000+ templates), server management, reporting/analytics, security suite (threat detection, app control, encryption), automated operations, and OS deployment. Integrates with PSA/ticketing (HaloPSA, ConnectWise, Zendesk, ServiceDesk Plus MSP, Analytics Plus).
- **Maps to KB:** [endpoint-central-msp.md](endpoint-central-msp.md); cloud trade-offs in [cloud-vs-on-premises.md](cloud-vs-on-premises.md).
- **Editions / pricing (confirm current).** MSP-specific component/pay-per-use model; available **Cloud and On-Premises**. (A historical promo offered 250 free cloud endpoint licenses for 1 year — promo dates expired; treat as marketing history.) **Confirm current MSP pricing via quote.**
- **Cloud variant.** Endpoint Central is sold as a true SaaS (Cloud) as well as on-prem; many point products (PMP, VMP, MDM Plus, Remote Access Plus, Application Control Plus) likewise have Cloud editions, and several have **MSP** siblings (Patch Manager Plus MSP, MDM Plus MSP). See per-product rows in the mapping table.

---

## PM / strategy notes

> The following is internal analysis, not vendor copy.

### Portfolio rationale
The point-product line is a classic **land-and-expand / "good-better-best"** funnel. Each point product owns a single keyword/search intent (e.g., "patch management software", "MDM software", "device control software") with an aggressive free tier (usually ≤25 endpoints) to capture SMBs and single-team buyers. Endpoint Central is the **consolidation SKU** that captures the higher LTV once a customer needs more than one capability. Every point-product page funnels to EC via a dedicated `*-vs-ec` migration page — the conversion engine is built into the catalog.

### Overlaps & cannibalization risks
- **Patch Manager Plus vs. Vulnerability Manager Plus.** VMP Enterprise *includes* a full patch module "at no additional cost." A patch-only buyer could rationally buy VMP Enterprise ($1.55/device/mo) and get vulnerability scanning "for free," or buy PMP ($1/endpoint/mo) and skip vulnerability. This is genuine internal overlap; sales positioning has to steer by **who owns the function** (IT ops → PMP; SecOps → VMP) and by price sensitivity.
- **Device Control Plus vs. Endpoint DLP Plus.** Both touch USB/peripheral control. Endpoint DLP Plus markets "stringent device control" as a sub-feature, while Device Control Plus is *only* that. Risk: buyers unsure which to pick. EC resolves it by merging both into one **Endpoint data security** module — which is also the cleaner upsell message.
- **Application Control Plus internal bundling.** ACP already merges app control + EPM, yet EC lists "Application & privilege management" and "Endpoint privilege management" somewhat separately, and JIT is an add-on. Messaging risk around what's included where.
- **Patch Connect Plus vs. PMP/EC.** Minimal cannibalization because it targets a *different* buyer (committed SCCM/Intune shops). It's better seen as a **competitive wedge** into Microsoft-managed estates than as overlap.

### Cross-sell / upsell paths
- **PMP / VMP → EC Security** (add DLP, EPM, browser, EDR).
- **MDM Plus → EC UEM/Security** (unify mobile with desktop/server estate).
- **Remote Access Plus / OS Deployer (IT-ops entry) → EC UEM** (lifecycle: image → deploy → patch → support).
- **Device Control Plus / Browser Security Plus / ACP (security-team entry) → EC Security** (full data + app + browser + vuln posture).
- **Patch Connect Plus → EC** when the customer eventually wants to *replace* SCCM/Intune rather than extend it (a longer, strategic motion).

### Gaps & expansion opportunities (analysis)
- **No standalone EDR / NGAV / ransomware point product.** EDR, next-gen antivirus, and anti-ransomware exist only inside EC. Given the crowded EDR market, a focused standalone could open a new land motion — but also risks confusing the "single-agent" story.
- **No standalone IT Asset Management / Software Deployment / DEX / Configuration / ZTNA point product.** These are EC-only modules. ITAM in particular is a large standalone category (asset/license/SAM) where a "Plus" product could compete; DEX is a fast-growing category too. (Note: ManageEngine sells *adjacent* products like ServiceDesk Plus / AssetExplorer in the ITSM line, which partly covers ITAM demand outside the endpoint family.)
- **macOS/Linux depth.** Several security point products (DLP, device control, app control, browser, OS Deployer) are Windows-centric; deepening non-Windows coverage is an expansion lever as Mac fleets grow.
- **Cloud/MSP parity.** Cloud and MSP variants exist for the marquee products (PMP, MDM Plus, EC) but appear thinner/uncertain for the security point products (DLP, Device Control, Browser Security shown only as Free/Pro). Closing Cloud/MSP parity across the security line is a clear opportunity.

---

### Decision flow (which to recommend)

Use this quick triage when someone asks "which ManageEngine product do I need?":

1. **Do they already run SCCM or Intune and only need third-party patching?** → **Patch Connect Plus**. Stop.
2. **Do they need exactly one capability and nothing else (now or soon)?** → the matching **point product** (and its free tier if ≤25 endpoints).
   - Patching only → Patch Manager Plus
   - Vulnerability/compliance only → Vulnerability Manager Plus
   - Mobile/BYOD only → Mobile Device Manager Plus
   - USB/peripheral lockdown only → Device Control Plus
   - Data loss prevention only → Endpoint DLP Plus
   - App allowlisting / admin-rights removal only → Application Control Plus
   - Browser hardening only → Browser Security Plus
   - Remote support only → Remote Access Plus
   - Imaging/reimaging only → OS Deployer
3. **Do they need two or more of the above, or want one agent/console/vendor?** → **Endpoint Central** (pick the edition: Professional → Enterprise → UEM → Security by capability depth).
4. **Are they an MSP managing multiple clients?** → **Endpoint Central MSP** (multi-tenant, pay-per-use).

### Capability-to-EC-edition cheat sheet

| Capability (point product) | Lowest EC edition that includes it |
|---|---|
| Patch management (PMP) | Professional |
| Remote troubleshooting (Remote Access Plus) | Professional |
| App distribution / asset / BYOD / Kiosk (MDM Plus subset) | Professional |
| USB device management (Device Control Plus subset) | Enterprise |
| Remote-session auditing | Enterprise |
| OS deployment (OS Deployer) | UEM |
| Remote data wipe / FileVault (MDM Plus subset) | UEM |
| Vulnerability remediation (VMP) | Security |
| Data loss prevention (Endpoint DLP Plus) | Security |
| Endpoint privilege management (Application Control Plus) | Security |
| Browser security (Browser Security Plus) | Security |

*(Edition mapping derived from the Endpoint Central pricing page; confirm exact feature placement in the current edition-comparison matrix.)*

## Cross-references

- Suite overview: [00-product-overview.md](00-product-overview.md)
- Architecture & single agent: [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)
- Cloud vs. on-premises trade-offs: [cloud-vs-on-premises.md](cloud-vs-on-premises.md)
- MSP edition: [endpoint-central-msp.md](endpoint-central-msp.md)
- Per-module deep dives: [patch-management.md](patch-management.md) · [vulnerability-management.md](vulnerability-management.md) · [mobile-device-management.md](mobile-device-management.md) · [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) · [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) · [browser-security.md](browser-security.md) · [remote-troubleshooting.md](remote-troubleshooting.md) · [os-deployment.md](os-deployment.md)
- EC-only modules (no standalone sibling): [endpoint-detection-response.md](endpoint-detection-response.md) · [next-gen-antivirus-ransomware.md](next-gen-antivirus-ransomware.md) · [it-asset-management.md](it-asset-management.md) · [software-deployment.md](software-deployment.md) · [configuration-management.md](configuration-management.md) · [endpoint-intelligence-dex.md](endpoint-intelligence-dex.md) · [secure-private-access.md](secure-private-access.md)
- Glossary: [glossary.md](glossary.md) · Index: [INDEX.md](INDEX.md)

## Sources

All fetched from manageengine.com on 2026-06-22:

- Patch Manager Plus — https://www.manageengine.com/patch-management/
- Vulnerability Manager Plus — https://www.manageengine.com/vulnerability-management/
- Mobile Device Manager Plus — https://www.manageengine.com/mobile-device-management/
- Application Control Plus — https://www.manageengine.com/application-control/
- Device Control Plus — https://www.manageengine.com/device-control/
- Browser Security Plus — https://www.manageengine.com/browser-security/
- Endpoint DLP Plus — https://www.manageengine.com/endpoint-dlp/
- Remote Access Plus — https://www.manageengine.com/remote-desktop-management/ (the `/remote-access/` slug returned empty)
- OS Deployer — https://www.manageengine.com/products/os-deployer/
- Patch Connect Plus — https://www.manageengine.com/sccm-third-party-patch-management/ (the `/patch-connect-plus/` slug returned empty)
- Endpoint Central (suite) — https://www.manageengine.com/products/desktop-central/
- Endpoint Central MSP — https://www.manageengine.com/desktop-management-msp/ (redirected from `/products/desktop-central/msp/`)

**Pages that could not be fetched (returned empty / blocked):** `https://www.manageengine.com/patch-manager/`, `https://www.manageengine.com/remote-access/`, `https://www.manageengine.com/patch-connect-plus/`. Working equivalents were used as noted above. All pricing is "starts at" list pricing subject to change — **confirm current figures via a ManageEngine quote.**
