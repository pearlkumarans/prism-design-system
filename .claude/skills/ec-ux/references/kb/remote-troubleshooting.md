# Remote Troubleshooting (Remote Access & Troubleshooting)

> Web-based remote control, recorded sessions, system tools, announcements, collaborative troubleshooting, chat, and wake-on-LAN/shutdown for endpoints across LAN and WAN. Available in all editions; the Free edition supports remote desktop sharing for up to 25 desktops.

## 1. What it is — Feature detail

### Purpose and console location

Endpoint Central's (formerly Desktop Central) remote desktop manager lets administrators connect to and control remote desktops and mobile devices across both LAN and WAN, from a single web-based console. Systems on a WAN are reachable through VPN or the internet; no inbound firewall reconfiguration of the endpoint is required beyond the agent already calling home.

**Console navigation.** All the tools live under the **Tools** tab. Per the official help, Endpoint Central groups seven tools under Tools:

1. **Remote Control** (`Tools → Remote Control`)
2. **System Manager** (`Tools → System Manager`)
3. **Remote Shutdown** (`Tools → Remote Shutdown`)
4. **Wake on LAN** (`Tools → Wake on LAN`)
5. **Chat** (`Tools → Chat`)
6. **Announcement** (`Tools → Announcement`)
7. **Windows System Tools** (`Tools → System Tools` — Disk Defragmenter / Check Disk / Disk Cleanup)

Remote-control feature settings are reached from `Tools → Remote Control → Settings` (and its sub-tabs: General Settings, Idle Session, Screen Recording, Performance, User Confirmation). Port settings live separately under `Admin → Tools Settings → Port Settings`. Remote-session audit data is reached from the **History** tab inside Remote Control and from `Admin → Audit → Action Log Viewer`.

### Full capability breakdown (how it works at a low level)

- **Web-based remote control** — Establishes a connection to a remote computer with no additional client software beyond the Endpoint Central agent already on the target. The technician views/controls the desktop from any browser, including from phones and tablets. Two viewers are supported: an **HTML5 viewer** (clientless, browser-based, available for all OS) and an **ActiveX viewer** (a native Windows viewer; per the settings page, "Opt for ActiveX if you need a native viewer"). Screen resolution is configurable to fit the technician's screen.
- **Supported OS for remote control** — Per the official Remote Desktop Sharing help page: **Windows, Mac, Linux, and Android**. (Some advanced controls listed below are Windows-only.)
- **Session security** — All remote access operations use **256-bit AES** encryption. The product is positioned as **HIPAA- and PCI-ready**, with user confirmation, screen recording, and chat archiving as the supporting controls.
- **User-privacy / consent controls (User Confirmation)** — Admins can require the end user to grant permission before connecting; a dialog pops on the user's screen requesting remote access. Configurable per `Tools → Remote Control → User Confirmation` (see settings reference below).
- **Input control & screen blackout** — During a session the technician can **lock (disable) the user's keyboard and mouse** to prevent interference, **black out the user's screen** (e.g., while typing sensitive credentials), **disable the wallpaper**, and **hide the remote cursor**.
- **Special key shortcuts** — One-click send of remote hot keys (Ctrl, Alt, Esc, Win) and access to the security-options screen (sign out, restart, swap users, Task Manager) — equivalent to Ctrl+Alt+Del.
- **Quick Launch (one-click system access)** — When enabled, gives quick access to Command Prompt, other System Manager tools, and power options from within the session.
- **Clipboard keystroke** — A toolbar action that copies and pastes a password into the remote login screen, useful when keyboard input is restricted at the logon screen.
- **Remote file transfer** — Bi-directional file/folder transfer between technician and endpoint, working across domains and workgroups. Accessible from the in-session toolbar (`File Transfer` icon).
- **Multi-monitor support** — A remote machine with more than one monitor is auto-detected; all active monitors/tabs are displayed and the technician can switch between them.
- **Control modes** — Take full control of the computer, or **View only mode** (observe without acting). View-only is used to audit/monitor a user's activity.
- **Recording remote sessions (Screen Recording)** — Sessions can be recorded for auditing and to educate new technicians (Windows and Linux only). Recordings are downloaded from the **History** tab and can be gated behind a password. See the settings reference for codec/FPS/color/storage options.
- **Network performance view** — In-session, the technician can view network performance of both the viewer and the end-user device; a screenshot action captures the remote screen.
- **Integrated communication** — Text chat plus voice and video calling during a session (from the in-session toolbar). Collaborative troubleshooting lets two or more technicians work a single issue together.
- **Chat tool (standalone)** — One-to-one (admin-to-end-user) instant messaging used while remotely troubleshooting. Chat history is retained; the auditing capability records and securely archives a copy of each chat session for compliance.
- **Announcements** — Push messages directly to users'/computers' screens (in minutes), reaching users inside and outside the network. Targeted to specific users, computers, remote offices, domains, or custom groups. Announcements can be scheduled, modified, suspended, resumed, or deleted.
- **System Manager** — A consolidated remote-administration console (processes, services, etc.) reached from `Tools → System Manager` for live diagnostics. (Detailed sub-functions on dedicated System Manager help page — high level here.)
- **Windows System Tools** (centrally scheduled, run on many machines at once):
  - **Disk Defragmenter** — Options: **Verbose** (full analysis + defrag report), **Analyze** (summary report only), **Force Defragmentation** (defrag regardless of fragmentation level).
  - **Check Disk** — Status report based on the file system to catch bad sectors, cross-linked files, directory errors. Options: **Verbose** and **Quick Check** (NTFS only).
  - **Disk Cleanup** — Identifies and deletes unused files to free space.
- **Wake on LAN (WoL)** — Powers on a switched-off machine; requires the target NIC/BIOS to be configured to accept the WoL magic packet. Supports manual and scheduled wake-ups and can boot systems across VLANs (a wake relay/distribution server is needed per subnet — broadcast packets do not cross VLAN boundaries) *(inferred)*.
- **Remote Shutdown** — Remotely Shutdown / Restart / Hibernate / Stand By / Lock. Manual or scheduled; per-task status verification; optional pre-shutdown user notification with skip option; option to leave active users undisturbed (selective shutdown).

### Prerequisites & key concepts

- Endpoint Central agent installed on the target.
- For WAN access: VPN or internet reachability; for branch offices, a Distribution Server in the remote office relays remote-control traffic.
- **Ports:** the default remote control port is **8443** (TCP). Configurable at `Admin → Tools Settings → Port Settings`; ensure it is not blocked on the firewall. For LAN connections, Windows **File and Printer Sharing for Microsoft Networks** and **Remote Administration** must be enabled (these are what the "RPC server is unavailable" error traces back to).
- **Linux endpoints:** the agent machine must have an **X Window (X11)** GUI component; remote control may fail when **Wayland** is used instead of X11 (Ubuntu 22+, RHEL 8+, Fedora 25+).
- WoL: target must be WoL-capable, configured in BIOS/NIC, and wired (not Wi-Fi).
- Terminology: *view-only* vs *full control*, *viewer* (HTML5 vs ActiveX), *User Confirmation* (consent prompt), *idle session*, *announcement targets* (users/computers/remote offices/domains/custom groups), *magic packet* (WoL trigger), *Action Log Viewer* (audit).

### Settings / options reference

The remote-control behavior is driven entirely from `Tools → Remote Control → Settings`, split across tabs. The following consolidates the documented options.

**General Settings tab.** Windows-only options: Disable Wallpaper, Blacken the monitor of client computer, Disable keyboard and mouse of client computer, Hide Remote Cursor, **Viewer Type = ActiveX** (native viewer), Notify end user (persistent prompt in the top-right corner during the session), Allow end user to disconnect, Enable Quick Launch (Command Prompt + System Manager tools + power options), Disable Aero Theme (Vista+ with Aero), Capture Alpha-Blending (view transparent windows). All-OS options: **Viewer Type = HTML5** (browser-based), Log the reason for remote connection (prompt technician for a reason), View only mode (no actions on the remote computer). On cloud, Disable Wallpaper/Blacken/Disable input/Hide cursor are available; ActiveX, Notify end user, Allow end user to disconnect, Quick Launch, Disable Aero, Capture Alpha-Blending are on-premise.

| Tab | Setting | Values / behavior |
| --- | --- | --- |
| General | Viewer Type | HTML5 (all OS) / ActiveX (native, Windows, on-prem) |
| General | Disable Wallpaper / Blacken monitor / Disable keyboard & mouse / Hide remote cursor | On/Off (Windows) |
| General | Notify end user / Allow end user to disconnect / Quick Launch / Disable Aero / Capture Alpha-Blending | On/Off (Windows, on-prem) |
| General | Log the reason for remote connection / View only mode | On/Off (all OS) |
| Idle Session | Max idle time | Numeric minutes |
| Idle Session | Action on timeout | Disconnect / Disconnect and lock the remote computer |
| Screen Recording | Enable Screen Recording | On/Off (Windows & Linux only) |
| Screen Recording | Codec | Microsoft Video 1 (default) / Intel IYUV / Cinepak by Radius |
| Screen Recording | Frames per second | Higher = smoother but larger file (default fine for audit) |
| Screen Recording | Color quality | High (24-bit) / Low (16-bit; recommended for audit) |
| Screen Recording | Maximum storage size | Oldest videos auto-deleted when exceeded; cloud capped at 5 GB |
| Screen Recording | On client out-of-space | Stop recording / End the remote session |
| Screen Recording | Secure downloading recorded videos | Require password to download |
| Screen Recording | Enable User Notification | Show recording icon + custom notice to end user |
| Performance | Compression (Windows) | Best (higher ratio, slower UI, less bandwidth) / Fast (lower ratio, faster UI, more bandwidth) |
| Performance | Color Quality | All OS: True Color / Low; Windows also: High / Medium |
| User Confirmation | Show confirmation in locked/logged-off computers | If off, session starts without approval on locked/logged-off machines (Windows & Mac) |
| User Confirmation | Time Out | Approval window; if exceeded, session is not initiated |
| User Confirmation | Message | Custom text shown to end user |
| User Confirmation | Make User Confirmation Permanent | Once on, only Support can revoke |
| User Confirmation | Exclude Computers | Computers that never need consent (excluded even when permanent) |
| Port Settings (`Admin → Tools Settings`) | Remote control port | Default TCP 8443; must be open on firewall |

### In-session toolbar reference

The HTML5 and ActiveX viewers expose a toolbar of quick actions (documented icons): fit-to-screen / full-screen / actual-size; refresh view; switch to the security-options screen (sign out, restart, swap users, Task Manager); switch between tabs/monitors; blackout end-user screen; disable/enable (lock/unlock) keyboard & mouse; clipboard keystroke (copy/paste a password into the login screen); use end user's configured keyboard language; view-only mode toggle; take/release control; take a screenshot; view network performance (viewer + end-user device); quick access to diagnostic tools (Task Manager, power options, system clean-up); file/folder transfer; initiate chat/voice/video; send remote hot keys (Ctrl, Alt, Esc, Win); zoom in / zoom out.

## 2. UX lens

### Primary user roles & jobs-to-be-done

- **IT support specialist / help-desk technician** — connect to a user's machine to install software, update drivers, and troubleshoot, without commuting on-site.
- **System administrator** — manage servers and roaming users' machines remotely; run maintenance (defrag/chkdsk/cleanup) at scale; broadcast announcements.
- **End user (WFH/roaming)** — connect to their own work computer from home under policies that bar taking hardware home.

### Key workflows / screen flows (step by step)

**A. Configure essential settings before first connection** (`Tools → Remote Control → Settings`):
1. **General Settings** tab — choose viewer type (HTML5 for all OS; ActiveX for a native Windows viewer), enable Disable Wallpaper / Blacken Monitor / Disable Keyboard & Mouse / Hide Remote Cursor; optionally enable "Notify end user," "Allow end user to disconnect," "Enable Quick Launch," "Log the reason for remote connection," and "View only mode."
2. **Idle Session** tab — set max idle time and the action on timeout (disconnect, or disconnect and lock the remote computer).
3. **Screen Recording** tab (Windows/Linux) — enable recording; pick codec, FPS, color quality, max storage, out-of-space behavior, secure download password, user notification.
4. **Performance** tab — per remote office, choose Compression (Best vs Fast) and Color Quality to balance bandwidth vs responsiveness.
5. **User Confirmation** tab — enable consent prompt, set time-out, customize message, optionally exclude specific computers, optionally make confirmation permanent.
6. **Port Settings** (`Admin → Tools Settings → Port Settings`) — change default port 8443 if needed; ensure firewall allows it.

**B. Initiate remote control** (`Tools → Remote Control`):
1. Click **Connect** next to the target device.
2. If multiple users are logged into the same computer, click the three dots next to Connect and choose the user account.
3. If User Confirmation is enabled, the server waits for the end user's approval; otherwise the session starts immediately.
4. Multiple monitors are auto-detected and displayed; switch between them via the toolbar.
5. Use the in-session toolbar: blackout, lock/unlock input, view-only/take-control toggle, screenshot, clipboard keystroke, remote hot keys, file transfer, chat/voice/video, network performance.

**C. Audit / history:**
1. In the Remote Control tab, click the **User Access Log** icon next to a device for its per-device connection report.
2. Use the **History** tab for a consolidated report across all endpoints (and to download recorded videos).
3. Use `Admin → Audit → Action Log Viewer` for full remote-control audit logs.

**D. Wake & maintenance:** `Tools → Wake on LAN` → select targets/VLAN → wake now or schedule. Then `Tools → System Tools` → Disk Defragmenter/Check Disk/Cleanup → pick option → target machines → schedule off-hours.

**E. Remote shutdown:** `Tools → Remote Shutdown` → action (Shutdown/Restart/Hibernate/Stand By/Lock) → user notification + skip + exclude-active-users → run/schedule → verify per-task status.

**F. Announcement:** `Tools → Announcement` → compose → pick audience → schedule/instant → later modify/suspend/resume/delete.

### UX research hooks (friction, usability, where users get stuck, opportunities)

- HTML5 vs ActiveX choice is a decision point: users may not know which to pick; ActiveX is a native-Windows-only path. Opportunity: auto-detect and default to HTML5, hide ActiveX behind "advanced/native."
- User-Confirmation flow: if the end user is away, the technician is blocked. The "Exclude Computers" list (consent waived) is the relief valve for unattended servers; surface it clearly. Note the "show confirmation in locked/logged-off computers" toggle changes behavior subtly.
- "Make User Confirmation Permanent" is a one-way door — once enabled, only Support can revoke it. High-stakes toggle that deserves a strong confirmation dialog.
- Multi-monitor switching and resolution/color scaling are common readability pain points; test discoverability of the monitor/tab switcher and the Performance compression setting.
- WoL frequently "doesn't work" due to BIOS/NIC/VLAN/Wi-Fi misconfig — high support friction; opportunity for an in-product WoL readiness check.
- Linux Wayland-vs-X11 breakage is invisible to the admin until connection fails; a pre-flight check on the agent could detect Wayland.

### Notable UI patterns/components

- In-session toolbar (blackout, lock/unlock input, view-only/control toggle, screenshot, clipboard keystroke, remote hot keys, monitor/tab switch, file transfer, chat/voice/video, network performance, fit-to-screen/full-screen/actual-size, zoom in/out).
- Settings tab strip (General / Idle Session / Screen Recording / Performance / User Confirmation).
- Target picker with groups/OUs/domains/remote offices.
- Scheduler component shared by system tools, shutdown, and announcements.
- History/recorded-session library with password-gated download.

## 3. PM lens

### Value proposition & business outcomes

- Cuts mean-time-to-resolution by removing physical travel; one console for global endpoints.
- Compliance enablement (HIPAA/PCI) via 256-bit AES, User Confirmation, session recording, and chat archiving.
- Collaboration: multiple technicians on one issue; integrated chat/voice/video reduces tool-switching.
- Listed benefits (official help): troubleshoot unattended computers, manage multiple monitors from one tab, stay HIPAA-compliant via user confirmation, record sessions for audit/training, and perform sensitive operations behind screen blackout.

### Target personas & use cases

- Help desks handling high daily ticket volume across mixed OS/configs/locations.
- MSPs (Endpoint Central MSP edition; remote-control help pages are marked "Applicable For Endpoint Central MSP").
- WFH enablement and server administration from afar.

### Competitive positioning / differentiators

- Bundled into a UEM suite (patch, software deployment, asset, MDM, configs) on a single console — vs standalone remote tools (TeamViewer, AnyDesk, LogMeIn).
- Clientless HTML5 viewer + recording + chat/voice/video + System Manager + WoL/shutdown + announcements in one place.
- Cross-platform target coverage (Windows/Mac/Linux/Android).

### Edition gating & packaging

- Free edition: remote desktop sharing for up to **25 desktops**.
- Cloud vs on-premise differences exist in settings: e.g., ActiveX viewer, Notify end user, Allow end user to disconnect, Quick Launch, Disable Aero, Capture Alpha-Blending are listed as on-premise; cloud screen-recording storage is capped at **5 GB**. Full feature set across paid tiers; MSP variant available.

### Product expansion opportunities / gaps / roadmap ideas (analysis)

- Replace any remaining legacy transport with a modern WebRTC/WebSocket-only path; deprecate ActiveX viewer entirely.
- Built-in WoL diagnostics + auto BIOS/NIC config guidance; agent-side Wayland/X11 detection for Linux.
- AI session summaries from recordings and chat transcripts for ticket auto-documentation.
- Unattended-access policy tiers, blur/redaction in recordings for privacy compliance.
- Native mobile-device remote control parity with desktop (view vs full control varies by OS).

## 4. Developer / Technical lens

### Architecture & components

- Web console (server) orchestrates sessions; the **Endpoint Central agent** on each managed endpoint brokers the remote-control channel, file transfer, System Manager/system-tool execution, announcements, and chat.
- For remote offices, a **Distribution Server (DS)** relays agent traffic; DS replication interval and connectivity are visible at `SoM → Remote Office`.
- Two viewer renderers: HTML5 (browser-based) and ActiveX (native Windows control).

### Agent mechanics / protocols

- Remote screen sharing is VNC-style/proprietary over the agent channel; encrypted with **256-bit AES**.
- Default remote-control transport port is **TCP 8443** (configurable). LAN connections rely on Windows RPC + File & Printer Sharing + Remote Administration.
- **Wake on LAN** uses the standard magic-packet broadcast (UDP 7/9 *(inferred)*); cross-VLAN wake implies a relay/agent per subnet.
- **Remote shutdown** issues OS power commands via the agent; supports user-notification/skip logic.
- On Linux, the agent renders via the **X Window system (X11)**; **Wayland** must be disabled (`/etc/gdm3/custom.conf` → uncomment `WaylandEnable=false`) for remote control to work on recent distros.

### Ports, protocols, integrations, APIs

- Remote control: **TCP 8443** (default; `Admin → Tools Settings → Port Settings`).
- LAN remote control prerequisites: File and Printer Sharing for Microsoft Networks, Remote Administration (firewall exception via `gpedit.msc → Computer Configuration → Administrative Templates → Network → Network Connections → Windows Firewall → Domain Profile → Allow remote administration exception`).
- WoL: UDP magic packets (ports 7/9) *(inferred)*.
- Agent-to-server: Endpoint Central's standard agent/gateway ports *(verify in deployment docs)*.
- REST API: Endpoint Central exposes an API Explorer (`/api/`); programmatic triggering of tools/sessions *(inferred; not documented on the remote-control help pages)*.

### Data model / key objects, scalability

- Objects: Computer, Remote Office, Distribution Server, Domain/OU, Custom Group, Session, Recorded Session (History), User Access Log entry, Announcement, Scheduled Task, Chat Transcript. *(Some names inferred.)*
- Scales via groups/OUs and scheduled batch execution of system tools across many machines.

### Technical limitations

- Many advanced controls (wallpaper disable, Aero disable, alpha-blending capture, screen recording on some paths) are Windows-only; screen recording is Windows/Linux only (not macOS).
- ActiveX viewer is a native-Windows-only path.
- WoL requires hardware/BIOS support and per-VLAN reachability.
- Cloud screen-recording storage capped at 5 GB.

## 5. Support / Troubleshooting lens

Format below: **symptom → cause → fix**, drawn from the official Remote Control knowledge base.

### Connection failures

- **"Unable to establish connection with a remote desktop"** → endpoint unreachable, agent down, or viewer/port issue → verify the agent is checking in, the machine is online, the remote-control port (8443) is open on the firewall, and try switching viewer (HTML5 ↔ ActiveX). See KB *remote_desktop_sharing_failure*.
- **"RPC server is unavailable"** → (1) "File and Printer Sharing for Microsoft Networks" disabled, (2) Remote Administration disabled, or (3) the remote computer is not reachable → enable File and Printer Sharing on the NIC properties; enable the "Allow remote administration exception" firewall policy via `gpedit.msc` (Domain Profile); confirm the machine is up and its DNS record is current.
- **"Agent version is not compatible"** (also affects patch/inventory scan, remote shutdown, agent moves) → Endpoint Central tried to auto-upgrade the agent but failed because (a) server↔Distribution Server communication failed or (b) agent binaries are corrupted → verify server-DS connectivity (`SoM → Remote Office → DS Replication Interval`); ensure the DS has replicated the new version; exclude the server/DS `S` folder from antivirus; re-save Agent Settings (`SoM Settings → Agent Settings → Save Changes`) to regenerate binaries; ping the server from the agent machine; if still failing, contact Support with server + agent logs.
- **"The service did not respond to the start or control request in a timely fashion"** (service timeout) → agent service did not start in time → see KB *agent_installation_service_error*; restart the agent service and retry.
- **LAN connection errors** ("The network path was not found," "Unknown username or password," "No network provider accepted the given network path," "Not enough server storage space," "The storage control block address is invalid") → classic Windows networking/credential/SMB issues → resolve per the corresponding agent-installation KB articles (network path, logon credentials, SMB provider, server storage, SCB).
- **"Event service not interactive"** (also surfaces as **HTML5 viewer connection error**) → the agent's event/desktop-interaction service is not running interactively → see KB *event-service-not-interactive*; restart the relevant agent service so it can interact with the desktop, then retry the HTML5 viewer.

### Input / key-send failures

- **Ctrl+Alt+Del does not work on Windows Vista / 7 / Server 2008** → UAC/Secure Attention Sequence (SAS) handling → use the toolbar "security options" action; see KB *rds_vista_UAC_SAS_failure*.

### Linux

- **"Unable to establish remote connection to a Linux computer" / "GUI component X Window is not found"** → no X Window (X11) on the agent machine, or Wayland is enabled instead of X11 (Ubuntu 22+, RHEL 8+, Fedora 25+) → install the X Window system on the agent; to disable Wayland, edit `/etc/gdm3/custom.conf`, uncomment `WaylandEnable=false`, save and reboot.

### Recording / consent

- **Recording missing** → recording was not enabled before the session, or storage limit/out-of-space behavior triggered deletion → enable Screen Recording in Settings beforehand; check max-storage and "client runs out of space" behavior; note cloud cap is 5 GB and oldest videos auto-delete when the limit is exceeded.
- **Consent prompt blocks unattended access** → User Confirmation is enabled (possibly permanent) → add the target to the **Exclude Computers** list under User Confirmation; if confirmation was made permanent, contact Support to revoke.

### Quick-reference troubleshooting matrix

| Symptom (error) | Likely cause | First fix |
| --- | --- | --- |
| Unable to establish connection with a remote desktop | Endpoint/agent unreachable, port/viewer issue | Verify agent check-in, machine online, port 8443 open; switch viewer |
| RPC server is unavailable | File & Printer Sharing or Remote Administration disabled; host unreachable | Enable both on the target; confirm reachability/DNS |
| Agent version is not compatible | Auto-upgrade failed (server↔DS comms or corrupt binaries) | Check DS replication; AV-exclude `S` folder; re-save Agent Settings |
| Service did not respond in a timely fashion | Agent service slow/failed to start | Restart agent service; retry |
| Network path / logon / SMB / storage / SCB errors (LAN) | Windows networking/credential/SMB issues | Resolve per matching agent-installation KB |
| Event service not interactive / HTML5 viewer error | Agent desktop-interaction service not interactive | Restart agent service; retry HTML5 viewer |
| Ctrl+Alt+Del fails on Vista/7/2008 | UAC/SAS handling | Use the toolbar security-options action |
| Linux: X Window not found / connection fails | No X11, or Wayland enabled | Install X11; disable Wayland in `/etc/gdm3/custom.conf` |
| Recording missing | Recording not enabled, or storage limit hit | Enable Screen Recording beforehand; check storage/out-of-space behavior |
| Consent prompt blocks unattended access | User Confirmation enabled (maybe permanent) | Add target to Exclude Computers; if permanent, contact Support |
| Cannot add computers to exclusion list | Invalid computer entry | See KB *invalid-computer-error* |
| Disk Cleanup failed on Win 2008/2008 R2 | OS-specific cleanup limitation | See KB *disk-cleanup-failed-win2008r2* |

### Diagnostics

- Check agent health/last contact, DS replication interval, session/User-Access logs, and scheduled-task status pages.
- Validate the remote-control port (8443) end-to-end and viewer compatibility per OS.
- Collect server + agent logs for Support (`logs-how-to`).

### FAQs

- *Do users need extra software?* No — only the Endpoint Central agent (HTML5 viewer is clientless).
- *Is it secure/compliant?* 256-bit AES; HIPAA/PCI-ready; sessions (Windows/Linux) and chat can be recorded/archived; User Confirmation supports consent.
- *Which OS can I remote into?* Windows, Mac, Linux, Android.
- *Default port?* 8443 (configurable under Admin → Tools Settings → Port Settings).

### Useful KB / help references

- Remote Control (overview): https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/remote_desktop_sharing.html
- Essential configurations / settings: https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/remote_desktop_sharing_configuring_settings.html
- Steps to initiate remote control: https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/accessing_remote_desktop.html
- Endpoint Central Tools (tool list): https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/desktop-central-tools.html
- KB: Agent version not compatible: https://www.manageengine.com/products/desktop-central/desktop_agent_version_incompatible.html
- KB: RPC server unavailable: https://www.manageengine.com/products/desktop-central/rpc_server_unavailable_rds.html
- KB: Event service not interactive / HTML5 viewer error: https://www.manageengine.com/products/desktop-central/event-service-not-interactive.html
- KB: Linux X Window not found / Wayland: https://www.manageengine.com/products/desktop-central/gui-component-x11-not-found.html
- Remote Control KB category: https://www.manageengine.com/products/desktop-central/knowledge-base.html

## Cross-references
- [configuration-management.md](configuration-management.md) — custom scripts and power management complement remote maintenance.
- [os-deployment.md](os-deployment.md) — remote OS deployment to branch offices; WoL to power targets.
- [mobile-device-management.md](mobile-device-management.md) — remote troubleshooting of mobile devices.

## Sources
- https://www.manageengine.com/products/desktop-central/remote-desktop-sharing.html
- https://www.manageengine.com/products/desktop-central/chat-tool.html
- https://www.manageengine.com/products/desktop-central/windows-system-tools.html
- https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/desktop-central-tools.html
- https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/remote_desktop_sharing.html
- https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/remote_desktop_sharing_configuring_settings.html
- https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/accessing_remote_desktop.html
- https://www.manageengine.com/products/desktop-central/desktop_agent_version_incompatible.html
- https://www.manageengine.com/products/desktop-central/rpc_server_unavailable_rds.html
- https://www.manageengine.com/products/desktop-central/event-service-not-interactive.html
- https://www.manageengine.com/products/desktop-central/gui-component-x11-not-found.html
- https://www.manageengine.com/products/desktop-central/knowledge-base.html
