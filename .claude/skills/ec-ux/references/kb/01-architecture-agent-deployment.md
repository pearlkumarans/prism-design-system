# Endpoint Central — Architecture, Agent & Deployment

> A technical reference to how ManageEngine Endpoint Central is built and deployed: the central server (Tomcat + Nginx) and its PostgreSQL/MSSQL database, the lightweight cross-platform agent, Distribution Servers for branch/WAN bandwidth optimization, the Secure Gateway Server for roaming and mobile users, the Central Patch Repository, communication ports, scalability/sizing, high availability (Failover Server), security of communications (TLS/HTTPS), and the on-prem / cloud / MSP deployment models.

---

## Overview diagram (described in text)

Picture three concentric zones connected by the agent-to-server protocol.

```
   ManageEngine Cloud (Internet)                        Endpoint Vendors
   ┌──────────────────────────┐                    ┌──────────────────────┐
   │  Central Patch Repository │ <── HTTPS sync ──  │  Microsoft / Apple / │
   │  (vulnerability DB portal)│                    │  Adobe / 3rd-party   │
   │  FCM / WNS / APNs push    │                    │  patch sources       │
   └──────────────┬───────────┘                    └──────────────────────┘
                  │ (patch metadata, binaries, push notifications)
   ====================== DMZ (optional) ==========================
   ┌──────────────────────────┐
   │   Secure Gateway Server   │  <── HTTPS ──  Roaming / mobile / WAN agents
   │   (reverse proxy in DMZ)  │                 over the public Internet
   └──────────────┬───────────┘
                  │ forwards to
   ========================= Customer LAN (head office) ===========
   ┌──────────────────────────┐        ┌───────────────────────┐
   │   Endpoint Central Server │ <────> │  Database (PGSQL/MSSQL)│
   │   Nginx (static) + Tomcat │        │  same or separate host │
   │   Web Console (8020/8383) │        └───────────────────────┘
   └───────┬──────────┬────────┘
           │          │
   LAN agents     ┌───┴─────────────┐ replicates packages/patches to branch
   (auto-install) │ Distribution    │ ──────────────► Branch-office WAN agents
                  │ Server (branch) │
                  └─────────────────┘
   Active Directory ── feeds AD/site/OU/group/computer reports to the server
```

Key idea: **one server, one console, one agent type**, with two optional relay tiers — the **Distribution Server** (LAN-to-branch bandwidth optimizer) and the **Secure Gateway Server** (Internet-facing relay that keeps the EC server off the public Internet).

---

## Core components

### Endpoint Central Server
- Web-based application installed at the customer site (typically head office) for on-premises, or hosted by ManageEngine for cloud.
- Acts as the **container for configuration details and instructions**; agents poll it and pull instructions, packages, and patches.
- Functions: install agents, deploy configurations, scan for inventory and patches, download/stage patch binaries, generate reports (including Active Directory reports), drive remote-control sessions, and orchestrate security modules.
- For Internet-facing/WAN scenarios it is configured as an **EDGE device**, exposing the designated port (default 8020, configurable) to the Internet — though best practice is to front it with a Secure Gateway Server in a DMZ instead of exposing it directly.
- **Should be kept running at all times** to perform daily management tasks.
- **Web servers used:** **Nginx** for static file services and **Apache Tomcat** for application services.

### Database
- Supported databases: **PostgreSQL (PGSQL)** — bundled/default — and **Microsoft SQL Server** (2016, 2017, 2019, 2022). MSSQL is also supported on AWS.
- SQL Server edition: Standard or Enterprise.
- For large fleets (>10,000 endpoints) ManageEngine recommends running the **SQL server on a separate machine** from the EC server for performance.

### Web Console
- The single point of administration for all modules; browser-based, accessible over LAN, WAN, VPN, or Internet without any separate client install.
- Supported browsers: Microsoft Edge, Mozilla Firefox, Google Chrome, Zoho Ulaa. Minimum screen resolution 1280×1024.

### Active Directory (data source)
- In an AD-based domain, the EC server gathers data from Active Directory to generate reports across **sites, domains, OUs, groups, and computers**, giving admins visibility into the AD infrastructure. EC is also network-agnostic — it can manage AD, Novell eDirectory, and Windows Workgroup environments.

### Third-party notification services
- Used to push notifications to managed devices: **Firebase Cloud Messaging (FCM)** for Android, **Windows Notification Service (WNS)** for Windows, **Apple Push Notification service (APNs)** for iOS. These sit between the server and the end-user device.

---

## Distribution Server (branch office / WAN bandwidth optimization)

- **What it is:** lightweight software installed on one computer in a remote/branch office. It acts as an **intermediary cache/relay** between the central EC server and the agents in that branch.
- **How it works:** the Distribution Server pulls configuration details, software packages, and patch binaries **once** from the EC server over the WAN, then serves them locally to all branch agents. Branch (WAN) agents contact the Distribution Server instead of reaching across the WAN individually.
- **Benefits:**
  - **Low WAN bandwidth** — only one component (the DS) periodically contacts the central server, instead of every branch endpoint.
  - **Bandwidth planning and cost control** for distributed organizations.
  - **Secure mode (SSL/HTTPS)** supported between DS and server.
  - **One-time install; auto-upgrades** thereafter.
- **When to use (deployment thresholds):**
  - Per the WAN architecture guidance, use **Distribution Servers + WAN agents** when managing **more than 10 computers** in a remote office; for **fewer than 10**, use **WAN agents only**.
  - A small branch of ~3 endpoints does not need a DS; for ~15+ endpoints a DS is recommended.
  - For large fleets, install **one Distribution Server per ~1,000 computers**.
- **DS hardware sizing (per system requirements):**

| Computers via the DS | Processor (physical) | RAM | Disk |
| --- | --- | --- | --- |
| 1–500 | Intel Core i3 (2C/4T) 2.0 GHz | 4 GB | 6 GB* |
| 501–1000 | Intel Core i3 (2C/4T) 2.9 GHz | 4 GB | 12 GB* |
| 1001–3000 | Intel Core i5 (4C/8T) 2.3 GHz | 8 GB | 16 GB* |
| 3001–5000 | Intel Core i5 (6C/12T) 3.2 GHz | 8 GB | 20 GB* |
| 5000–10000 | Intel Core i5 (6C/12T) 3.2 GHz | 8 GB | 20 GB* |

\* Disk may grow with the number of applications/patches deployed.

- **OS support for Distribution Server:** broader than the server — Windows 7, 8, 8.1, 10, 11, and Windows Server 2008 R2 / 2012 / 2012 R2 / 2016 / 2019 / 2022 / 2025. (Windows 7/8/8.1 and Server 2008R2/2012/2012R2 are supported for the **Distribution Server only**, not the central server.)
- **Distribution Server availability by edition:** available across Free, Professional (noted with an asterisk), Enterprise, UEM, and Security editions.

---

## Secure Gateway / Cloud (roaming and mobile users)

### Secure Gateway Server (SGS)
- **What it is:** an intermediate **reverse-proxy server** placed between roaming/mobile agents on the Internet and the EC server. It receives all agent communications and **redirects them to the EC server**, so the EC server itself never has to be directly exposed to the Internet.
- **Where it lives:** typically deployed in a **DMZ**, sandwiched between firewalls, adding a security layer that shields the internal EC server from external access.
- **Behavior:** WAN/roaming agents reach the EC server **through the SGS over the Internet**, while agents inside the LAN reach the EC server directly (faster local resolution).
- **Install rules:** must be on a **separate machine** from the Central Server, Distribution Server, and Failover Server; map a **public FQDN**; open the required ports (notably **8383**, **8027**, **8443**).
- **Licensing:** sold as an **add-on**, starting at **$345**.
- **Best practice for bandwidth:** configure the **same FQDN for LAN and WAN agents** to minimize redundant downloads.

### Cloud agent model
- In **Endpoint Central Cloud (SaaS)**, ManageEngine hosts the server and the roaming/connectivity tier; agents simply call home to the cloud tenant over HTTPS, removing the need for the customer to operate an SGS or expose any on-prem server. (inferred: this is the architectural simplification that the Cloud deployment model provides versus on-prem + SGS.)

---

## Endpoint Agent

### What it is
- A **lightweight cross-platform software application** installed on each managed computer. It executes tasks initiated from the server (deploy software, change wallpaper, uninstall an app, apply a configuration, run a patch, etc.) and **reports status** back to the server.

### Installation methods
- **LAN:** the agent is **installed automatically** on computers in the LAN (server-driven push).
- **Remote push** for agent installation requires ports **135, 139, and 445** open and inbound on both agent and server (and on the Distribution Server where applicable).
- **Manual install** and **logon-script install** are supported, especially for branch/WAN computers — a one-time task.
- **Out-of-the-box / zero-touch enrollment** for managed devices: Apple Business Manager / Apple Configurator / Autopilot for laptops; Android Zero-Touch, Samsung Knox, QR/NFC, and Chromebook enrollment for mobile.
- **Agent upgrades are automatic** after the initial install.

### Functions / behavior
- Polls the server for instructions and completes them, then updates the server with deployment status.
- **Check-in triggers (on-premises documented behavior):**
  - **User-specific configurations:** at user logon and every **90-minute refresh interval**.
  - **Computer-specific configurations:** at computer startup and every **90-minute refresh interval**.
- Copies required patch binaries from the EC server (or local Distribution Server) before installing them.

### OS support (agent)
- **Managed endpoint OSs:** Windows, macOS (10.11+), Linux, ChromeOS (57.0+), Android (4.0+), iOS/iPadOS (4.0+), tvOS (7.0+), and Windows Phone 8.1+.
- Device classes: desktops, laptops, servers, smartphones, tablets, TVs, IoT, and rugged devices.

### Self-healing
- (inferred) The agent runs as a managed service with auto-upgrade; in practice EC agents are designed to re-register and resume reporting after connectivity loss, and the platform supports re-pushing/repairing agents that stop checking in. The cited pages confirm **automatic upgrade** and continuous **periodic check-in**; explicit "self-healing/watchdog" wording is not on the architecture pages, so treat the watchdog framing as inferred.

### Agent hardware footprint (per system requirements)
- Processor: Intel Pentium, 1.0 GHz; RAM: 512 MB; Disk: 3 GB (grows with operations performed on the client).

---

## Central Patch Repository (patch database)

- **What it is:** a **portal on the ManageEngine website** that hosts the **latest vulnerability database**, published after patches have been tested.
- **Flow:**
  1. The EC server **synchronizes the vulnerability database periodically** from the ManageEngine portal (via direct Internet connection or a proxy server).
  2. EC **scans managed computers** to determine missing patches.
  3. Required patch **binaries are downloaded from the respective vendors' websites** and **staged on the EC server**.
  4. **Agents copy the patch binaries** from the EC server (or from a local Distribution Server) and install them.
- This design means endpoints never go directly to vendor sites — the server centralizes download, test/approve, and distribution, which is what enables bandwidth control via Distribution Servers.

---

## Communication & ports table

The ports below are compiled from the LAN/WAN architecture pages and ManageEngine port documentation. The server ports must be open **regardless of edition**; module-specific ports are opened as needed. The authoritative live list is the in-product/help "ports used" document.

| Port | Protocol | Direction / use |
| --- | --- | --- |
| **8020** | TCP / HTTP | Default **agent ⇄ server** communication and **Web Console** access (configurable; used as the EDGE port for Internet-facing setups). |
| **8383** | TCP / HTTPS | **Secured agent ⇄ server** communication (and SGS). |
| **8027** | TCP | **Endpoint Central Notification Server** — server-to-agent notifications (also opened on the SGS). |
| **8031** | TCP | **Remote control file transfer**. |
| **8443** | TCP / HTTPS | **Remote control (secure)** / WebSocket for remote-control sessions (also opened on the SGS). |
| **8444** | TCP | **Remote control screen sharing** (sharing computers remotely). |
| **135, 139, 445** | TCP | **Agent installation push** — must be open and inbound on agent, server, and Distribution Server. |

Notes:
- It is recommended to use **HTTPS mode** for agent-server communication, enabled via **Admin → Security Settings → Enable Secured communication**.
- For WAN/roaming agents, enable secured communication when creating the remote office: **Admin → Scope of Management → Remote Offices → Add/Modify → Communication Details → Enable Secured Communications (HTTPS)**.
- For secure remote control, enable secure WebSocket and file-transfer ports via **Tools → Remote Control → Settings → Port Settings → Use secure connection**.
- (inferred) Distribution Server ports are configurable per remote office (ManageEngine documents a "Changing Distribution Server Ports" how-to), so exact DS ports depend on configuration; default DS communication rides the same 8020/8383 server ports.

---

## Scalability & sizing

EC publishes per-tier sizing for the **server** and **co-located SQL** (selected tiers shown; agents are constant at Pentium/1.0 GHz/512 MB/3 GB):

| Managed computers | EC Server CPU (physical) | EC Server RAM | EC Server disk | SQL RAM | SQL disk |
| --- | --- | --- | --- | --- | --- |
| 1–250 | Core i3 (2C/4T) 2.0 GHz | 4 GB | 5 GB | 4 GB | 5 GB |
| 251–500 | Core i3 (2C/4T) 2.4 GHz | 4 GB | 10 GB | 4 GB | 10 GB |
| 501–1000 | Core i3 (2C/4T) 2.9 GHz | 4 GB | 20 GB | 4 GB | 20 GB |
| 1001–3000 | Core i5 (4C/8T) 2.3 GHz | 8 GB | 30 GB | 8 GB | 30 GB |
| 3001–5000 | Core i7 (6C/12T) 3.2 GHz | 8 GB | 40 GB | 8 GB | 200 GB |
| 5001–10000 | Xeon (8C/16T) 2.6 GHz | 16 GB | 60 GB | 16 GB | 250 GB |
| 10001–15000 | Xeon (12C/24T) 2.7 GHz | 32 GB | 100 GB | 32 GB | 500 GB |
| 15001–20000 | Xeon (14C/28T) 2.7 GHz | 32 GB | 120 GB | 64 GB | 500 GB |
| 20001–25000 | Xeon (16C/32T) 3.0 GHz | 32 GB | 500 GB | 64 GB | 1 TB |
| 25001–35000 | Xeon (16C/32T) 3.0 GHz | 32 GB | 500 GB | 64 GB | 1 TB |
| 35000+ | Custom — contact endpointcentral-support@manageengine.com | — | — | — | — |

**Scaling recommendations above 10,000 endpoints:**
1. Install SQL server and EC server on **different machines**.
2. Use **Windows Server** operating systems.
3. Use **enterprise-grade HDDs or SSDs**.
4. Install **one Distribution Server per 1,000 computers**.

**Network:** minimum **1 Gbps NIC** at all tiers. **EC server OS** for managing 5,000+ endpoints: Windows Server 2016/2019/2022/2025 recommended (server can also run on Windows 10/11 for smaller setups).

---

## High availability / failover

- **Failover Server** is an add-on (from **$1,195**) that provides a standby EC server for high availability — if the primary EC server fails, the failover server takes over so management continues.
- The Failover Server must be on a **separate machine** from the Central, Distribution, and Secure Gateway servers.
- (inferred) HA is achieved at the application tier via the Failover Server pairing; database HA would rely on the customer's SQL Server high-availability features (e.g., clustering/AlwaysOn) when using external MSSQL — this is not detailed on the cited pages and is inferred from standard MSSQL practice.

---

## Security of communications

- **Transport encryption:** agent-server and DS-server traffic can run over **HTTPS/SSL**; secured communication is toggled in **Admin → Security Settings**.
- **TLS versions:**
  - **From v11.2.2330.1:** EC and the Secure Gateway Server **default to TLS 1.2**; TLS 1.0/1.1 can optionally be re-enabled from Security Settings.
  - **Prior to v11.2.2330.1:** TLS 1.0/1.1/1.2 allowed by default with the option to disable the older versions.
- **DMZ isolation:** placing the Secure Gateway Server in a DMZ keeps the EC server off the public Internet, restricting external access to internal/sensitive servers.
- **Authentication / access control:** Active Directory authentication, Two-Factor Authentication, and Role-Based Administration (paid editions) govern console access.
- **Roaming/mobile security:** roaming users are secured via the Secure Gateway Server; FQDN alignment between LAN and WAN agents reduces exposure and bandwidth.
- **Hardening:** ManageEngine publishes server security-hardening / fortify guidelines (security-recommendations page) covering OS hardening of the EC host.

---

## Deployment models

- **On-Premises:** customer-hosted EC server + PostgreSQL/MSSQL, with optional Distribution Servers (branches), Secure Gateway Server (DMZ, roaming/mobile), and Failover Server (HA). Full control over data residency; some features (DLP, Secure Private Access, voice/video remote) are on-prem-specific.
- **Cloud (SaaS):** ManageEngine-hosted multi-component cloud architecture; no on-prem server/SGS to operate; home of Cloud-only features (EDR, Zia AI). Agents call the cloud tenant over HTTPS.
- **MSP (Endpoint Central MSP):** multi-tenant edition for managed service providers; one console manages multiple client orgs with per-client segregation and its own ports-used documentation.

---

## Troubleshooting agent / comms issues

- **Agent not contacting server:** verify the server ports (8020/8383) are reachable from the endpoint; confirm secured-communication setting matches on both ends; check the agent's configured server name/IP/port (a documented "change name/IP/port" procedure exists for when the server address changes).
- **Agent install push failing:** confirm **135/139/445** are open and inbound on agent and server (and DS); check admin credentials/firewall.
- **Branch endpoints slow or saturating WAN:** deploy/verify a **Distribution Server** for that remote office (recommended above ~10–15 endpoints), and ensure it is replicating packages/patches.
- **Roaming users can't reach server:** verify the **Secure Gateway Server** is reachable on its public FQDN with ports 8383/8027/8443 open, and that remote-office secured communication is enabled.
- **Remote control fails:** confirm ports 8443 (secure)/8444 (sharing)/8031 (file transfer) and the "use secure connection" port settings.
- **Patch download failures:** check the server's Internet/proxy path to the ManageEngine vulnerability portal and to vendor download sites.
- **Performance degradation at scale:** revisit sizing — separate SQL from EC, add Distribution Servers (1 per 1,000), move to Windows Server + SSD, and engage support beyond 35,000 endpoints.
- **TLS/handshake errors:** confirm TLS 1.2 support on both ends (default since v11.2.2330.1); enable legacy TLS only if a dependency requires it.

---

## Console navigation — admin settings (quick map)

All deployment/admin tasks below live under the **Admin** tab. Key paths:

| Task | Console path |
|---|---|
| Define managed inventory | **Admin → Scope of Management → Add Domain/Workgroup** |
| Fix/rotate install credentials | **Admin → Scope of Management → Edit Credentials** (or **Admin → Credential Manager**) |
| Agent tray/behavior | **Admin → SoM → Agent Settings** |
| Remote office + proxy + DS | **Agent → Remote Offices → Add/Edit Remote Office** (Communication Details, Proxy) |
| Distribution Server replication | **Admin → SoM → Replication Policy** |
| Enable secured (HTTPS) comms | **Admin → Security Settings → Enable Secured communication** |
| Import/replace SSL cert | **Admin → Security → Import SSL Certificates** |
| Server address / public reachability | **Admin → Server → Server Settings / NAT Settings** |
| Move server (migration) | **Admin → Server → Server Migration** |
| Database backup (schedule) | **Admin → Server → Schedule DB Backup** / **Admin → Tools → Database Backup** |
| Manual backup/restore | run `<Install_Dir>\DesktopCentral_Server\bin\backuprestore.bat` |
| Apply product update (PPM) | click the **build number (top-right)** → download latest PPM → update |
| Secure Gateway Server health | **Admin → Secure Gateway Server** (build/status) |
| Remote control port security | **Tools → Remote Control → Settings → Port Settings** |

---

## Agent installation troubleshooting (detailed)

Remote agent installation drives nearly every "agent missing" ticket. The push uses admin credentials + ports **135/139/445**; most failures are credential, UAC/DCOM, network-path, or service-timeout related. Workgroup vs Active Directory matters (AD admin credentials are **per-OU** — you cannot use one OU's admin to operate on another OU's computers).

| Error message | Root cause | Resolution |
|---|---|---|
| **Access Denied** (agent/DS install, scan, or remote control) | SoM credentials lack admin rights on the target; UAC/Remote-UAC blocking; DCOM disabled | **Workgroup:** set credentials with admin rights on *all* workgroup computers (**Admin → SoM → Edit Credentials → Workgroup**); on Vista+ disable **UAC** (set to *Never Notify*) and **Remote UAC** (registry `LocalAccountTokenFilterPolicy = 1` under `HKLM\…\Policies\system`). **AD:** supply OU-correct domain admin credentials. **Both:** verify credentials still valid; enable **DCOM** (`dcomcnfg` → My Computer → Properties → Enable Distributed COM). Fallback: automate install via **GPO startup script**. |
| **The network path was not found** | Target unreachable / file-and-print sharing off / name resolution failure | Confirm the host is online and reachable; enable File & Printer Sharing; ensure 135/139/445 open; verify DNS/NetBIOS resolution. |
| **Unknown username or password** (logon failure) | Wrong/expired credentials in SoM | Re-enter valid admin credentials in **Edit Credentials**; confirm the account isn't locked/changed. |
| **No network provider accepted the given network path** | Network provider/redirector or sharing path issue | Verify network connectivity and that admin shares (ADMIN$/IPC$) are accessible. |
| **Not enough server storage space is available** | `IRPStackSize` too low / storage exhaustion on target | Increase IRPStackSize on the target or free space; retry. |
| **systeminfo.exe — Unable to Locate Component** | System variable/component issue on the target | Repair the missing component / system PATH variable on the endpoint. |
| **Target Account Name is Incorrect** | Kerberos SPN/computer-account/time-skew mismatch | Reset the computer account / fix SPN duplication; correct system clock skew; re-join domain if needed. |
| **The service did not respond to the start or control request in a timely fashion** (service timeout) | Agent/DS service start timed out (slow host, AV interference, locked service) | Retry; exclude the agent dir from AV; ensure the host isn't resource-starved; restart and reinstall. Also seen for remote control and DS install. |
| **Mac / Linux installation failure** | Wrong package/permissions; missing dependencies; agent can't reach server | Use the correct platform package; run with `sudo`; ensure server FQDN/ports reachable from the endpoint. |
| **Windows Vista and later install failure** | UAC/Remote-UAC blocking the push | Apply the UAC/Remote-UAC steps above; or deploy via GPO. |

**GPO install notes.** GPO (startup script / software-install policy) is the recommended fallback for AD environments when LAN push hits Access-Denied/UAC. Trade-off: **agents installed via GPO are not automatically uninstalled** when Endpoint Central is removed — plan removal separately. **SCCM** is supported for distributing/**reinstalling** the agent in Microsoft-managed shops.

**Other install-related items:**
- **AV interference** (e.g., Symantec Endpoint Protection): add EC exceptions so the agent functions.
- **Allowing end-user uninstall**: optional setting to expose uninstall via Add/Remove Programs.
- **Manual remote-office uninstall**: documented procedure to remove agents from branch computers.
- **Cannot add a remote office — "Agent MSI Creation Failed"**: MSI build step failed on the server; retry/regenerate the remote-office agent package; check server temp/disk and that the build is healthy.

---

## Distribution Server failures

- **"Unable to start Distribution Server" (specified port):** the configured DS port is already in use, or the DS service can't bind. Identify the port owner (`netstat -ano -p tcp | find "port"` then `tasklist | find "PID"`), free the port, and restart the DS. Confirm the DS can reach the central server on **8020/8383**.
- **DS install fails with "service did not respond in a timely fashion":** same service-timeout handling as agent install (AV exclusion, resources, retry).
- **DS not replicating to branch agents:** verify the **Replication Policy** (window/frequency), DS↔server connectivity, and disk space on the DS for staged packages/patches.
- **Coexistence:** a Distribution Server uses an **nginx** service; it **cannot run alongside the Secure Gateway Server's nginx on the same machine** (see SGS startup failure). Keep them on separate hosts; if co-located, the DS can fall back to a bundled Apache server while SGS uses nginx.

---

## Secure Gateway Server startup failure

The SGS is the DMZ reverse-proxy for roaming/mobile agents; startup failures follow a checklist (**Admin → Secure Gateway Server** shows build/status):

1. **Build:** ensure the SGS is on the **latest build** (older builds may carry the bug) — upgrade from the forwarding-server download.
2. **Ports:** another service may have grabbed the SGS port — find it (`netstat -ano -p tcp | find "port"`, `tasklist | find "PID"`) and stop it.
3. **Connectivity:** the central server must be reachable from the SGS host — test `https://<dcservername>:8383` (or by IP) from the SGS machine.
4. **Antivirus:** exclude the `…\ME_Secure_Gateway_Server` directory from AV; if that fixes it, revert AV and send logs to support.
5. **nginx conflict:** only one nginx can run per machine — kill stray nginx processes (e.g., a co-located Distribution Server's nginx) before starting the SGS.
6. **WMI service:** SGS startup uses `tasklist.exe` to check nginx; if **Windows Management Instrumentation (WMI)** is stopped/disabled, startup fails — start WMI.
7. **Restart:** a leftover JVM process can block startup — reboot the SGS host and retry.
8. **Support:** if unresolved, send logs from `<Installed_Dir>\ME_Secure_Gateway_Server\logs`.

---

## Backup & Restore

**Database backup** (manual via `backuprestore.bat` GUI under `…\DesktopCentral_Server\bin`, or scheduled via **Admin → Schedule DB Backup**). Backup files are named `buildnumber-date-time.zip`.

- **"Database backup failed":** causes are a **write-protected/invalid/inaccessible directory**, **insufficient drive space**, or a **full Temp folder**. Resolutions: point the backup to a valid, writable folder (for network shares grant **Everyone → Full Control**); free space or change the **Backup directory** (**Admin → Tools → Database Backup → Backup directory → Save Changes**) to a drive with room; clear `%temp%` on the server before backing up.
- **Restore — "The Endpoint Central server is not compatible":** restore requires the **target install build to match the backup's build**. Install the **same build** that produced the backup (ideally on a different machine), then restore. This compatibility rule is also central to the post-incident rebuild path in [security-advisories-cve.md](security-advisories-cve.md).

---

## Hotfix / PPM upgrade issues

- **Apply an update:** click the **build number (top-right of the console)**, download the latest applicable **PPM**, and update. This is also how every security advisory is remediated ([security-advisories-cve.md](security-advisories-cve.md)).
- **"Configurations not applied properly after a hotfix upgrade":** post-upgrade, some configurations may not reapply; re-deploy/refresh the affected configurations and verify agents have checked in on the new build. (Agents auto-upgrade after the server is updated.)

---

## Agent–server communication failures (deep dive)

The General KB "**Agent communication failed — Unable to reach gateway port**" article gives the canonical checklist:

1. **Domain reachability:** EC's server domains/IPs must be **whitelisted** in firewalls, proxies, AV, and web filters. Verify by browsing `https://<domain>` and confirming the request succeeds without user intervention. (ManageEngine publishes a "domains required for agent communication" list.)
2. **Proxy configuration:** to make agents talk through a proxy, set it on the remote office (**Agent → Remote Offices → Edit Remote Office**). Notes: **existing agents must be reinstalled** with new binaries to pick up proxy details; the agent **does not use the system proxy**; if it can't reach the proxy it tries the server **directly**.
3. **TLS 1.2 default:** TLS 1.0/1.1 support is withdrawn; **TLS 1.2 is mandatory** (esp. for the cloud server). On legacy OSes (Windows 7, Server 2008 R2, Server 2012) TLS 1.2 is **not enabled by default** — enable it via the Microsoft WinHTTP TLS update.
4. **Proxy/root certificates missing from the trust store:** intercepting proxies present their own cert — install the **proxy root certificate** in the machine trust store. Missing **third-party root certificates** (Windows Root Certificate Program) break server authentication; causes include admin removal, missing root-cert update, no Internet for auto-update, or a GPO disabling auto-download (`HKLM\Software\Policies\Microsoft\SystemCertificates\AuthRoot\DisableRootAutoUpdate = 1`). Import the required CA certs manually via `mmc.exe → Certificates (Local Computer) → Trusted Root Certification Authorities → Import`, or distribute via **GPO** at scale.

---

## Changing the server DNS / IP / port for already-installed agents

When the server is migrated (FQDN, IP, HTTP/HTTPS port, or protocol changes), existing agents lose contact until told the new details. Two mechanisms:

- **Script (cscript / shell):** download `configureDCAgentServerCommunication` for the platform, copy to endpoints, and run:
  - **Windows:** `cscript configureDCAgentServerCommunication.vbs <ServerName> <ServerIP> <HTTPPort> <HTTPSPort> <protocol>` — e.g., `… joe.manageengine.com 192.168.112.146 8020 8383 https`
  - **Mac/Linux:** `chmod +x …` then `sudo ./configureDCAgentServerCommunication.sh <ServerName> <ServerIP> <HTTPPort> [<HTTPSPort>] <protocol>`
- **GPO:** push the new server details to all domain agents via Group Policy (documented "migrated-server-details-gpo" procedure).

After the change, agents should resume check-in on the next interval. This is the fix for "agents not communicating after migration."

---

## Sources
- LAN Architecture (components, agent check-in, patch database, ports, securing comms) — https://www.manageengine.com/products/desktop-central/desktop-central-lan-architecture.html
- WAN Architecture (Distribution Server, WAN agents, EDGE config, securing WAN comms) — https://www.manageengine.com/products/desktop-central/desktop-central-wan-architecture.html
- System Requirements (server/agent/SQL/DS sizing, OS/DB/browser/TLS support) — https://www.manageengine.com/products/desktop-central/system-requirements.html
- Prerequisites — https://www.manageengine.com/products/desktop-central/help/getting_started/prerequisites.html
- Secure Gateway Server — https://www.manageengine.com/products/desktop-central/secure-communication-of-mobile-users-using-forwarding-server.html
- Installing Endpoint Central in DMZ — https://www.manageengine.com/products/desktop-central/installing-dc-in-dmz-how-to.html
- Failover Server — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configuring_failover_server.html
- Ports / agent KB (port purposes) — ManageEngine ports documentation and community references
- Edition Comparison Matrix (DS availability, Failover/SGS add-on pricing) — https://www.manageengine.com/products/desktop-central/edition-comparison-matrix.html
- Knowledge Base index (Agent Installation, Backup & Restore, Hotfix, General categories) — https://www.manageengine.com/products/desktop-central/knowledge-base.html
- Agent install — Access Denied (UAC/Remote-UAC/DCOM, Workgroup vs AD) — https://www.manageengine.com/products/desktop-central/agent_installation_access_denied.html
- Agent install — Target Account Name Incorrect — https://www.manageengine.com/products/desktop-central/agent-installation-failure-target-account-name-incorrect.html
- Agent install — Mac/Linux failure — https://www.manageengine.com/products/desktop-central/agent-installation-failure-for-mac-linux.html
- Service did not respond in a timely fashion (service timeout) — https://www.manageengine.com/products/desktop-central/agent_installation_service_error.html
- Cannot start the Distribution Server in the specified port — https://www.manageengine.com/products/desktop-central/distribution-server-failure.html
- Agent install via GPO (advantages/disadvantages, GPO uninstall caveat) — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/advantages-and-disadvantages-of-agent-installation-via-gpo.html
- Reinstall Agent via SCCM — https://www.manageengine.com/products/desktop-central/agent-reinstall-via-sccm.html
- Changing the server DNS/IP/port for installed agents (cscript/GPO) — https://www.manageengine.com/products/desktop-central/desktop_agent_change_ip.html
- Agent communication failed — Unable to reach gateway port (domains/proxy/TLS/root certs) — https://www.manageengine.com/products/desktop-central/agent_communication_failure.html
- Troubleshoot Secure Gateway Server startup failure — https://www.manageengine.com/products/desktop-central/troubleshoot-secure-gateway-server-startup-failure.html
- Database backup failed — https://www.manageengine.com/products/desktop-central/database-backup-creation-failed.html
- Restore — server not compatible (build-match rule) — https://www.manageengine.com/products/desktop-central/backup_restoration_desktop_central_server_incompatible.html
- Configurations not applied after hotfix upgrade — https://www.manageengine.com/products/desktop-central/dc_hotfix_configurations.html
- General Settings (admin nav: SoM, Server, NAT, Security, Database) — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/configure-general-settings.html

*Note: Items marked "(inferred)" are reasoned conclusions not stated verbatim on the cited pages. The empty-page fetches for `ports-used.html`, `distribution-server.html`, and `secure-gateway-server.html` were unavailable; their content was reconstructed from the LAN/WAN architecture pages, system-requirements page, and ManageEngine search results.*
