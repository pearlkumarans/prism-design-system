# EC-05 : Remote Tools & Troubleshooting — Deep Dive (UI Reference)

> **Source**: ManageEngine Endpoint Central Help — `/products/desktop-central/help/remote_desktop_sharing/*`, `/help/windows_system_tools/*`, `/help/chat/*`, `/help/wake_on_lan_tool.html`, plus feature pages
> **Scope**: Remote Control (HTML5 / ActiveX), System Manager (16 sub-tools), Remote Shutdown, Wake-on-LAN (WoL), Chat / Voice / Video calls, Announcement broadcast, Windows System Tools (Check Disk / Disk Cleanup / Disk Defragmenter)
> **Purpose**: Single source of truth for UI design of the Tools module (screens, components, settings, viewer toolbars, scheduling, audit, prerequisites)

---

## 1. Module Overview

### 1.1 What this module is

The **Tools** tab is Endpoint Central's hands-on troubleshooting + power-management + communication toolkit. Where Patch / Vuln / Software Deployment are about *configurations* (set policy → wait for agent to apply), Tools are about **real-time, point-in-time, technician-driven interventions**.

Mental model:

```
        ┌──────────────── REAL-TIME ────────────────┐
        │                                            │
        ▼                                            ▼
COMMUNICATE                                      INTERVENE
  ├── Chat / Voice / Video                       ├── Remote Control (live session)
  └── Announcement (broadcast)                   ├── System Manager (silent tools)
                                                 └── Remote Shutdown / WoL
        ▼                                            ▼
   "Understand the problem"                "Fix the problem"

        ┌──────────────── SCHEDULED ────────────────┐
        │                                            │
        ▼                                            ▼
   System Tools                               Scheduled Shutdown / WoL
   (Check Disk / Cleanup /                    (recurring power tasks)
    Defragmenter)
```

Unlike configuration modules, **session-based tools live and die in the moment** — a Remote Control session is over when the technician disconnects. Audit logs preserve what happened.

### 1.2 Persona
- **Primary**: IT Help-desk Technician (1st-line troubleshooting, daily user)
- **Secondary**: IT Administrator (escalations, audits, system maintenance scheduling)
- **Tertiary**: End-user (recipient of confirmations, notifications, announcements; consumer of Chat)
- **Auditor / Compliance officer** (consumes recorded sessions + audit trails)

### 1.3 Module signature

Heaviest **session UI** in all of Endpoint Central — Remote Control is essentially a remote-desktop viewer (HTML5 or ActiveX) with a toolbar of 17+ in-session actions. **Compliance constraints dominate** — user confirmation, screen recording, view-only mode, idle session timeout, log-the-reason — these aren't features, they're audit requirements (HIPAA, SOX, internal policy).

Everything else is lighter: System Manager is a "silent troubleshooting" panel with 16 sub-tools; Shutdown/WoL/Announcement are simple "send command + monitor delivery" patterns.

### 1.4 OS coverage matrix

| Tool | Windows | Mac | Linux | Android | Notes |
|---|---|---|---|---|---|
| **Remote Control** | ✅ | ✅ | ✅ | ✅ | Most features Windows-only (Blacken, Disable I/O, Aero, Quick Launch) |
| **System Manager** | ✅ | ❌ | ❌* | ❌ | *Terminal sub-tool is for Linux but rest is Windows-only |
| **Remote Shutdown** | ✅ | ✅ | ✅ | ❌ | "Allow skip/postpone" Win+Mac only |
| **Wake-on-LAN** | ✅ | ❌ | ✅ | ❌ | NOT supported on managed Virtual Machines |
| **Chat / Voice / Video** | ✅ | ❌ | ❌ | ❌ | **On-premises ONLY** (no cloud) |
| **Announcement** | ✅ | ❌ | ❌ | ❌ | Server-time-based scheduling |
| **System Tools (Check Disk / Cleanup / Defrag)** | ✅ | ❌ | ❌ | ❌ | Disk Cleanup replaced by Storage Sense on Win10 1703+ |

### 1.5 Cloud vs On-premises caveats

- **Chat (voice/video) is on-premises only**. Cloud customers don't have this. UI must hide the entire Chat tab on cloud editions or show a "Not available on Cloud" empty state.
- **File Manager, Computer Rename, Event Viewer** (in System Manager) are **NOT supported on Cloud Edition**
- **Hardware** sub-tool in System Manager is **NOT supported on On-Premises Edition** (only Cloud!) — opposite of the rest
- **Screen recording cloud storage limit**: 5 GB

---

## 2. Concepts & Vocabulary

| Term | Definition | UI treatment |
|---|---|---|
| **Viewer** | The technician's browser-based or native UI for remote session | Two types: HTML5 (default, all OS) and ActiveX (Windows-only, native) |
| **HTML5 Viewer** | Browser-based remote viewer — works on any device + browser | Default viewer; some advanced Windows features unavailable |
| **ActiveX Viewer** | Native viewer for Windows (IE/legacy) — supports more features | Requires Remote Control Component download to viewer machine |
| **User Confirmation** | Prompt to end-user before remote session starts | Compliance feature (HIPAA-grade). Configurable timeout + message |
| **Idle Session** | Remote session with no technician activity | Auto-disconnect or auto-lock policy |
| **Screen Recording** | Records the full remote session for audit | Windows + Linux only; cloud storage cap 5 GB |
| **Quick Launch Tools** | In-session tools (cmd, task mgr, power options) accessible from viewer toolbar | Enable in Settings |
| **View-only mode** | Technician can see but not control | Compliance mode |
| **Direct Connection** | Viewer ↔ Agent communicates directly (UDP 8443) | Lower latency; requires UDP enabled in network |
| **Gateway Connection** | Viewer ↔ Server ↔ Agent (default) | More stable; works through firewalls |
| **System Manager Tool** | Silent (no end-user disruption) troubleshooting tool | 16 sub-tools cataloged below |
| **WoL Magic Packet** | Network packet sent to wake a sleeping computer | Broadcast or directed |
| **Broadcast Address** | The subnet broadcast address used for WoL | Editable per remote device |
| **Magic Packet Port** | UDP port for WoL — default port 7 | Configurable |
| **Power Action** | Shutdown / Restart / Hibernate / Log Off / Standby / Lock | 6 actions, varies by OS |
| **Force Action** | Forcefully terminate apps before power action | Skips graceful shutdown |
| **Postpone / Skip** | End-user defers a scheduled power action | Win + Mac only, with max-count limit |
| **Announcement** | Broadcast message displayed instantly on end-user desktop | Windows only, rich text, time-bounded |
| **Chat Session** | Real-time text + (optionally) voice / video between admin and user | Windows + on-premises only |
| **Communication Port** | Default 8443/8444 for chat | Configurable in Admin → Tools Settings |
| **Voice/Video Dynamic Port** | UDP 49152-65535 for media | Required when calls route through Central Server |
| **System Tools Task** | Scheduled job for Check Disk / Cleanup / Defragmenter | Recurring with triggers + conditions |
| **Storage Sense** | Windows 10+ replacement for Disk Cleanup (1703+) | UI must reference this for compatibility |

### 2.1 Critical concept: HTML5 vs ActiveX Viewer

This drives nearly all "available features" decisions in Remote Control.

| | HTML5 Viewer | ActiveX Viewer |
|---|---|---|
| Browser/Client | Any modern browser | IE / legacy Windows + Remote Control Component installed |
| OS support | Windows / Mac / Linux / Android | **Windows only** |
| Installation | Zero-install | Download Remote Control Component to viewer device |
| Multi-monitor | ✅ | ✅ |
| Wallpaper disable | ✅ | ✅ |
| Blacken monitor | ✅ | ✅ |
| Disable keyboard/mouse | ✅ | ✅ |
| Hide Remote Cursor | ✅ | ✅ |
| **Notify end user** (top-right prompt) | ❌ | ✅ |
| **Allow end user disconnect** | ❌ | ✅ |
| **Enable Quick Launch** (cmd / system mgr) | ❌ | ✅ |
| **Disable Aero Theme** | ❌ | ✅ |
| **Capture Alpha-Blending** (transparent windows) | ❌ | ✅ |
| Log reason for remote | ✅ | ✅ |
| View-only mode | ✅ | ✅ |

> **UI ask**: Make Viewer Type a prominent setting with a comparison chip ("HTML5 — Universal" vs "ActiveX — Windows-only, full features"). Show feature-availability hints when the technician toggles.

### 2.2 Critical concept: Connection mode — Gateway vs Direct

| | Gateway Connection (default) | Direct Connection |
|---|---|---|
| Path | Viewer ↔ Central Server (gateway port 8443) ↔ Agent | Viewer ↔ Agent (direct via UDP 8443) |
| Setup | Default. Stable. No firewall config needed | Requires UDP communication enabled on network + both endpoints |
| Latency | Higher (extra hop) | Lower |
| Voice/Video calls | Possible but through server (UDP 49152-65535) | Voice/Video uses direct path here |
| Outside corp network | Works seamlessly | More setup needed |

> **UI ask**: Show connection mode status in the viewer (small badge: "Gateway" / "Direct") so techs know what to expect for latency.

---

## 3. Navigation & IA — Tools Tab

### 3.1 Top-level Tools tab

```
TOOLS (tab)
├── Remote Control                         (live session UI)
│   ├── Computers list
│   ├── Settings tab
│   │   ├── General Settings
│   │   ├── Idle Session Settings
│   │   ├── Screen Recording
│   │   ├── Performance
│   │   ├── User Confirmation
│   │   └── Port Settings (deep-link to Admin)
│   ├── History tab (recordings + access logs)
│   └── Per-device > Connect / View User Access Log
│
├── System Manager                          (silent tools)
│   ├── Computers list
│   ├── Per-device > Manage → 16 sub-tools
│   └── Settings (Permission + User Confirmation)
│
├── Remote Shutdown                         (power actions)
│   ├── Computers list
│   ├── Instant action: Shutdown Now / More Actions
│   ├── Scheduled Shutdown tab
│   └── Settings (Mode / Time Out / Message)
│
├── Wake on LAN                             (power-on)
│   ├── Computers list (Wake up Now)
│   ├── Schedule Wake Up tab
│   ├── Edit Broadcast Address
│   └── Settings (Port / Wait time / Resolve IP)
│
├── Chat                                    (on-prem only)
│   ├── Users tab (logged-in users)
│   ├── History tab
│   ├── History Settings
│   └── (Voice + Video are launched from Chat row actions)
│
├── Announcement                            (broadcast)
│   ├── Users / Computers tab
│   ├── Create Announcement
│   └── Reports per announcement
│
└── System Tools                            (Check Disk / Cleanup / Defrag)
    ├── Tasks list
    ├── Add Task wizard
    └── History Settings + per-task report
```

### 3.2 Cross-module entry points

- **In-session Quick Launch** in Remote Control links to System Manager tools
- **Diagnostic tools button** in viewer opens task manager / power options / cleanup
- **From Inventory → Computer detail → "Remote Connect" button** routes to Tools → Remote Control
- **Admin → Tools Settings → Port Settings** — central place for Remote Control, Chat, WoL ports
- **Admin → Tools Settings → System Manager Settings** — permission + confirmation for sensitive tools
- **Admin → Audit → Action Log Viewer** — consolidates Remote Control history with full org audit

---

## 4. Sub-Features — Deep Dive

### 4.1 Remote Control (Remote Desktop Sharing)

Path: `Tools > Remote Control`

#### 4.1.1 Benefits (from help docs)
1. Troubleshoot computers even when left unattended
2. Detect multiple monitors and manage from a single tab
3. Stay HIPAA-compliant via user confirmation
4. Record remote sessions for audit + training
5. Perform sensitive operations by blacking out end-user screens

**Supported OS**: Windows, Mac, Linux, Android

#### 4.1.2 Prerequisites

**Viewer machine setup (depends on viewer type)**:

| | HTML5 Viewer | ActiveX Viewer |
|---|---|---|
| Browser version | Modern Chrome/Edge/Firefox/Safari | IE or legacy Windows browser |
| Special download | None | Remote Control Component (from product console) |

**Server-side ports**:
- TCP/UDP **8443** open on Central Server + reachable from remote computer + viewer
- UDP 8443 → enables **Direct Connection** between viewer and agent (lower latency)
- For voice/video routed through server: UDP **49152-65535** dynamic range

#### 4.1.3 Configuration — full settings inventory

##### 4.1.3.1 General Settings

**Windows-only (both Cloud + On-premise)**:
- ☑ **Disable Wallpaper** — End-user wallpaper not visible during session
- ☑ **Blacken the monitor of client computer** — Screen blacks out for end-user during sensitive ops
- ☑ **Disable keyboard and mouse of client computer** — Lock end-user I/O during session
- ☑ **Hide Remote Cursor** — Hide viewer's mouse from end-user screen

**Windows-only (On-premise only)**:
- **Viewer Type**: HTML5 / ActiveX
- ☑ **Notify end user** — Persistent prompt top-right of end-user screen during session
- ☑ **Allow end user to disconnect** — Give end-user disconnect privilege
- ☑ **Enable Quick Launch** — Quick access to cmd, system manager tools, power options
- ☑ **Disable Aero Theme** — Disable Aero on Win Vista+ during session (perf optimization)
- ☑ **Capture Alpha-Blending** — Show transparent windows on remote screen

**All OS (On-premise)**:
- **Viewer Type**: HTML5 (browser-based, default for cloud)
- ☑ **Log the reason for remote connection** — Force tech to enter reason before connecting
- ☑ **View only mode** — Tech can see but not control

**All OS (Cloud)**:
- ☑ **Log the reason for remote connection**
- ☑ **View only mode**

> **UI ask**: Toggle layout should group by OS support — Windows toggles in one block, Universal in another. Add platform-icons next to each toggle. When toggle isn't applicable to current Viewer Type, show greyed-out + tooltip explanation.

##### 4.1.3.2 Idle Session Settings

```
1. Specify max time limit for the remote session to be idle
2. Choose idle action:
   ◯ Disconnect remote connection
   ◯ Disconnect AND lock the remote computer
```

> **UI ask**: This is a security control — show it prominently. Default values should be conservative (e.g. 10 min idle → Disconnect+Lock). Don't bury it in advanced settings.

##### 4.1.3.3 Screen Recording (Windows + Linux only)

```
Tools > Remote Control > Screen Recording tab
☑ Enable Screen Recording
   │
   ├── Select Codec:
   │     ◯ Microsoft Video 1 (Default)
   │     ◯ Intel IYUV codec
   │     ◯ Cinepak Codec by Radius
   │     (fallback to default if codec not on remote)
   │
   ├── Frames per Second
   │     Higher FPS = smoother mouse + larger video size
   │     For audit only: leave at default
   │
   ├── Color Quality
   │     ◯ High (24 bit)
   │     ◯ Low (16 bit)  ← recommended for audit
   │
   ├── Maximum storage size
   │     When exceeded: oldest videos auto-deleted
   │     ⚠️ Cloud cap: 5 GB
   │
   ├── Client computer runs out of space:
   │     ◯ Stop the recording
   │     ◯ End the remote session
   │
   ├── ☑ Secure downloading recorded videos
   │     Recordings only downloadable with valid password
   │
   └── ☑ Enable User Notification
         Customized notification + screen recording icon on end-user screen
```

> **UI ask**: Show a storage gauge ("3.2 GB / 5 GB used") on the Screen Recording settings. Old recordings list with date + size + delete action.

##### 4.1.3.4 Performance settings (bandwidth tuning per remote office)

| Setting | Options | Notes |
|---|---|---|
| **Compression** (Windows only) | Best / Fast | Best = better bandwidth, slower UI render. Fast = lower compression, faster UI |
| **Color Quality** (all OS) | True Color / Low | Low recommended for poor bandwidth |
| **Color Quality** (Windows only) | High / Medium | Mid-tier options |

Per-remote-office customizable — different offices can have different perf profiles.

##### 4.1.3.5 User Confirmation (HIPAA compliance)

Path: `Tools > Remote Control > User Confirmation`

```
☑ Show confirmation in locked and logged off computers
   (if unchecked, remote session bypasses confirmation when no user is logged in)
   (Supported on Windows + Mac)

Time Out: [____ seconds]
   End-user must approve within this window. If exceeded, session NOT initiated

Message: [_______________________________]
   Customizable prompt shown to end-user

☑ Make User Confirmation Permanent
   ⚠️ ONCE ENABLED, CANNOT BE DISABLED BY ADMIN
   To revoke, contact support
   
Exclude Computers: [computer list picker]
   Computers excluded from confirmation requirement
   EVEN IF user confirmation is made permanent
```

> **UI ask**: The "Make Permanent" toggle is **one-way destructive** — show a confirmation modal with the exact wording: *"This will make user confirmation permanent. You cannot disable it later — only support can revoke. Continue?"* Don't slip this past the admin.

##### 4.1.3.6 Port Settings

Path: `Admin > Tools Settings > Port Settings`

- Default Remote Control port: **8443**
- Modifiable, but firewall must be updated
- Restart Central Server after change

#### 4.1.4 Connecting to remote desktop — workflow

```
Tools > Remote Control
        │
        ▼
Find the device in the list (filterable)
        │
        ▼
Click "Connect" button
        │
        ├── If multiple users logged in:
        │     Click ⋯ next to Connect → choose user account
        │
        ▼
If User Confirmation is enabled:
   Server waits for end-user approval
   ├── Approved → session opens
   ├── Denied → session NOT initiated
   └── Timeout → session NOT initiated
   
If User Confirmation NOT enabled:
   Session opens immediately
        │
        ▼
If Log Reason is required:
   Tech enters reason → session opens
        │
        ▼
Multi-monitor: Auto-detected and displayed
   Tech selects active monitor
        │
        ▼
SESSION ACTIVE — toolbar appears
```

#### 4.1.5 In-session toolbar — Quick Launch Tools

The viewer toolbar exposes **17 icon actions**. UI must render these as a consistent toolbar across HTML5 and ActiveX:

| # | Action | Description |
|---|---|---|
| 1 | Show original size | Reset zoom |
| 2 | Fit to screen | Stretch to viewport |
| 3 | Full screen | Maximize viewer |
| 4 | Refresh | Re-render current view; required if computer locked / no user logged in |
| 5 | Switch to security screen | Sign out / Restart / Swap users / Task Manager |
| 6 | Switch tabs | Toggle between different views on remote device |
| 7 | Blackout end-user screen | Hide sensitive admin operations |
| 8 | Disable user keyboard/mouse | Lock end-user inputs |
| 9 | Enable user keyboard/mouse | Unlock end-user inputs |
| 10 | Clipboard keystroke | Paste passwords into login screen safely |
| 11 | Use end-user keyboard language | Match local keyboard layout |
| 12 | View-only mode | Switch to read-only |
| 13 | Take control | Switch to full control |
| 14 | Screenshot | Capture remote screen |
| 15 | Network performance | View latency/throughput |
| 16 | Diagnostic tools | Quick access: Task Manager / Power Options / Cleanup |
| 17 | File transfer | Bidirectional file share |
| 18 | Chat / Voice / Video | Initiate communication |
| 19 | Hot keys | Send Ctrl/Alt/Esc/Win to remote |

> **UI ask**: Group the toolbar logically:
> - **View**: original size, fit to screen, full screen, refresh, screenshot
> - **Control**: take control / view-only / blackout / disable I/O / enable I/O / hot keys
> - **Tools**: clipboard, keyboard lang, diagnostic tools, file transfer, network perf
> - **Communication**: chat / voice / video
> - **Security**: security screen
>
> Show icon + tooltip-on-hover with label. Use shortcut keys (e.g. Ctrl+B for Blackout).

#### 4.1.6 Audit & History

Per-device access log:
```
Tools > Remote Control > [device row] > User Access Log icon
   → Report of all remote connections to this device
```

Consolidated history:
```
Tools > Remote Control > History tab
   → All remote sessions across the fleet
   → Filter by user, date, status, recording-available
```

System-wide audit (cross-module):
```
Admin > Audit > Action Log Viewer
   → Remote Control history alongside all other audited actions
```

> **UI ask**: Each session record should show: timestamp, technician, device, end-user, duration, reason (if Log Reason enabled), recording available (download link), connection mode (Gateway/Direct), screen recording size.

---

### 4.2 System Manager — 16 silent tools

Path: `Tools > System Manager > [device row] > Manage`

#### 4.2.1 What it is
Unlike Remote Control (which takes over the screen), System Manager lets technicians **silently** perform troubleshooting tasks **without** the end-user noticing. Background operations, registry edits, service restarts — all without screen takeover.

**Supported OS**: Windows (most tools)

#### 4.2.2 The 16 sub-tools

| # | Tool | What it does | Cloud? | On-prem? |
|---|---|---|---|---|
| 1 | **Task Manager** | Kill/stop processes; sort by user; export PDF/CSV/XLSX | ✅ | ✅ |
| 2 | **Task Scheduler** | Run/end/disable/delete tasks; sort by status | ✅ | ✅ |
| 3 | **File Manager** | Browse drives + folders, add/delete files, transfer files silently between viewer and remote | ❌ | ✅ |
| 4 | **Device Manager** | List devices + drivers per computer; enable/disable drivers | ✅ | ✅ |
| 5 | **Services** | Start/Stop/Restart services; configure startup mode | ✅ | ✅ |
| 6 | **Event Viewer** | View event logs; classify errors/info/warnings | ❌ | ✅ |
| 7 | **Registry** | View/modify registry keys + values; search by key/value/data; export full report | ✅ | ✅ |
| 8 | **Command Prompt** | Execute commands; run scripts/batch; perform DOS ops; admin or specific user privilege | ✅ | ✅ |
| 9 | **PowerShell** | Execute advanced scripts remotely | ✅ | ✅ |
| 10 | **Terminal** | Linux text-based command interaction + script execution | ✅ | ✅ |
| 11 | **Software** | View installed software; uninstall directly | ✅ | ✅ |
| 12 | **Hardware** | Full picture of built-in + external hardware | ✅ | ❌ |
| 13 | **Shares** | List shared folders + path + description; manage sessions + open files; restrict # of concurrent users | ✅ | ✅ |
| 14 | **Users** | List local users + status (active/disabled) | ✅ | ✅ |
| 15 | **Groups** | View/manage local users + groups; add/remove members | ✅ | ✅ |
| 16 | **Printers** | Full report of connected printers | ✅ | ✅ |
| 17 | **Computer Rename** | Rename managed computers (workgroup or AD) | ❌ | ✅ |

> **UI ask**: Show tool availability badges per Edition (Cloud / On-prem). When a tool is unavailable for current edition, show ghosted card with explanation: "File Manager is not available on Cloud Edition. [Learn more]"

#### 4.2.3 Essential settings — Permission + User Confirmation

Path: `Admin > Tools Settings > System Manager Settings`

##### Permission Settings (per technician)
Restrict access to **File Manager, Computer Rename, and Command Prompt** (highest-risk sub-tools):

```
For each of File Manager / Computer Rename / Command Prompt:
   ◯ Enable for all users         (no restriction)
   ◯ Enable only for admin        (admin-only)
   ◯ Disable for all users        (admin + tech cannot access)
   ◯ Permanently disable for all  (only support can revert!)
```

> **UI ask**: "Permanently disable" is one-way destructive (like User Confirmation Permanent). Same warning treatment: explicit modal, "contact support to revert" disclaimer.

##### User Confirmation Settings
For File Manager + Command Prompt (sensitive tools), require end-user approval:

```
☑ Enable user confirmation
   Applies to File Manager + Command Prompt
   
☑ Show confirmation in locked and logged-off computers
   (if unchecked, technician can access without confirmation when no user logged in)

Time Out: [____ sec]
   How long to wait for end-user approval

Confirmation Message: [_______________________]
   Customizable message shown to end-user
```

#### 4.2.4 Steps to access System Manager

```
Tools > System Manager
        │
        ▼
List of managed devices
        │
        ▼
Click "Manage" on the target device row
        │
        ▼
All 16 (or 14/15 depending on edition) tools listed
        │
        ▼
Pick the tool you need
        │
        ├── If User Confirmation enabled for this tool:
        │     Server waits for end-user approval
        │     
        └── Else: opens immediately
        │
        ▼
Tool-specific UI opens (e.g. Task Manager grid, Registry editor)
```

#### 4.2.5 Task Manager sub-tool — UX details

Most-used sub-tool. Should feel like Windows Task Manager but web-based:
- Sortable columns: Name / PID / User / CPU / Memory / Status
- Actions: Kill Process / Stop Process
- Group-by toggle: by user
- Search by process name
- **Export**: PDF / CSV / XLSX of full task list

#### 4.2.6 Registry sub-tool — UX details

Tree view of registry hives + values:
- Header keys: HKEY_LOCAL_MACHINE, HKEY_CURRENT_USER, etc.
- Search by key / value name / data (key feature)
- Per-key actions: Add / Modify / Delete value; Add / Delete key
- Export detailed registry report (full hive snapshot)

> **UI ask**: Registry is destructive. Add confirmation modals for delete actions + show "last edited" timestamp per key/value. Auto-backup before bulk changes.

#### 4.2.7 Software sub-tool — direct uninstall path

Like Inventory → Software → Uninstall flow, but per-machine:
- View installed software list
- Uninstall directly (silent switches still required for EXE)
- For User-based software → route to Software Deployment

---

### 4.3 Remote Shutdown — power actions

Path: `Tools > Remote Shutdown`

**Supported OS**: Windows, Mac, Linux

#### 4.3.1 Instant power actions

```
Tools > Remote Shutdown
        │
        ▼
Select target devices (multi-select)
        │
        ▼
Action picker:
   ├── Shutdown Now            (primary action)
   └── More Actions:
         ├── Restart
         ├── Hibernate
         ├── Log Off
         │     ├── Log off current user
         │     └── Log off all users
         ├── Standby
         └── Lock
        │
        ▼
Configure Shutdown/Restart Settings (only for Shutdown + Restart since they disrupt sessions)
        │
        ▼
Execute
```

#### 4.3.2 Shutdown/Restart Settings (only for Shutdown + Restart)

| Setting | Options | Notes |
|---|---|---|
| **Mode** | • Do not disturb if user logged in (skip)<br>• Allow users to skip/postpone (Win+Mac)<br>• Force Shutdown/Restart (terminate apps) | "Allow skip" — set max # of postponements |
| **Time Out** | Duration (seconds) | How long the warning displays before action **Only applies when device is in use; logged-out devices proceed immediately** |
| **Message** | Custom text | Warning shown to end-user |

#### 4.3.3 Scheduled Shutdown

Path: `Tools > Remote Shutdown > Scheduled Shutdown`

```
Click "Add Shutdown Task"
        │
        ▼
1. Task Name
2. Action: Shutdown / Restart / Hibernate / Log Off (current or all) / Standby / Lock
3. (Configure Shutdown/Restart Settings if applicable)
4. Define Targets
5. Configure Scheduler:
   • Once          — one-time
   • Daily         — every day / alternate days / weekdays only
   • Weekly        — specific days of week
   • Monthly       — specific months OR weeks of month OR days of month
6. Save
```

> **UI ask**: Use case hint above the picker: "*Try scheduling shutdown on weekends to optimize power consumption.*" — feature page recommends this pattern.

#### 4.3.4 Lifecycle actions

| Action | Behavior |
|---|---|
| Modify | Edit the task |
| Suspend | Pause future executions; current/in-progress continue |
| Delete | Permanently remove |
| Execute on demand | Trigger the task now without waiting for schedule |

---

### 4.4 Wake-on-LAN (WoL)

Path: `Tools > Wake on LAN`

**Supported OS**: Windows, Linux (not Mac)

#### 4.4.1 What it is
Networking protocol to power up sleeping/off computers from low-power mode by sending a **magic packet** to the device's broadcast address. Useful for:
- Waking computers to apply patches/deploy software during off-hours
- Pre-emptive wake for scheduled maintenance

**Wake across subnets** is supported — both same subnet and different subnets (router/switch must allow IP-directed broadcast).

⚠️ **NOT supported on managed Virtual Machines**.

#### 4.4.2 Prerequisites

- At least one computer with Endpoint Central agent is **live** in that subnet (to forward the magic packet)
- **IP-directed broadcast** settings enabled on the router/switch
- WoL settings enabled per remote device (Tools > Wake On LAN > Settings)
  > ⚠️ **Enabling WoL settings restarts the network adapters of all agents.** UI must warn about this.
- BIOS Power Management settings on each device:
  - Wake on LAN/WLAN → choose LAN or WLAN
  - **Deep Sleep Mode**: **DISABLED**
  - Vendor BIOS tools: Dell DCCU, HP BCU, Lenovo Think BIOS Config
- Windows 10: computer must **not be in shutdown mode** (only sleep/hibernate). Use Microsoft KB workaround.
- WoL status check interval: **below 5 minutes recommended**
- Magic packet port: **default 7**

> **UI ask**: Show a "WoL readiness checklist" per device: ✅ Subnet has live agent / ✅ Broadcast settings detected / ❌ Device BIOS WoL not verified (link to vendor BIOS guide).

#### 4.4.3 Instant Wake-up workflow

```
Tools > Wake On LAN
        │
        ▼
Select devices to wake (multi-select)
        │
        ▼
Click "Wake up Now"
        │
        ▼
Magic packet sent
        │
        ▼
Status updates within configured wait time (recommended < 5 min)
   ├── Awake → status "Online"
   └── No response → status "Failed to wake"
```

##### Editing broadcast address

Path: `Tools > Wake On LAN > Edit Broadcast Address`

The broadcast address of the remote device should match the IP address of the viewer device's subnet. UI must allow per-device override.

#### 4.4.4 Scheduled WoL

Path: `Tools > Wake On LAN > Schedule Wake Up > Add Task`

| Field | Notes |
|---|---|
| Port | Default 7 — must be available on remote device |
| Waiting Time | How long Central Server waits to check status. **Recommended < 5 min** |
| ☑ Resolve IP address on each schedule | For DHCP scenarios |
| Define Targets | Devices to wake |
| Configure Scheduler | Cron-like (once/daily/weekly/monthly) |

Lifecycle: Modify / Suspend / Delete from `⋯` under Action column.

> **UI ask**: WoL is most useful chained with other tasks — e.g. "Wake before patching, then shutdown after." Surface "create chained task" pattern that pre-fills WoL → wait → Patch → Shutdown.

---

### 4.5 Chat / Voice / Video

Path: `Tools > Chat`

**Supported OS**: Windows
**Supported environment**: **On-premises ONLY** (no Cloud)

#### 4.5.1 Why it exists
> "A clear understanding of any problem will help in figuring out the right solution in a short span of time."

Used BEFORE taking remote control — tech chats with user to understand the problem, then escalates to remote session if needed.

#### 4.5.2 Prerequisites

**Chat port settings**:
- Default: **8443/8444** for Chat
- Modifiable via `Admin > Tools Settings > Port Settings`
- Restart Central Server after port change
- Ports must NOT be blocked in firewall / proxy / load balancer on server, viewer, and remote device

**Voice + Video port settings**:
Calls go one of two ways:
| Mode | Path | Ports |
|---|---|---|
| **Direct** | Viewer ↔ Endpoint device | Direct UDP (same as Direct Connection in RC) |
| **Through Central Server** | Viewer ↔ Server ↔ Endpoint | UDP 49152-65535 dynamic range (don't block in firewall) |

If Central Server is behind NAT, dynamic port range must be configured per NAT settings.

**Browser settings**: Pop-ups must be allowed (chat window opens as pop-up).

#### 4.5.3 History settings

Path: `Chat > History > History Settings`

```
Specify number of days history is retained in Central Server
   ├── Chat transcripts retained
   ├── Voice/Video call logs retained
   └── After N days: auto-deleted
```

> **UI ask**: Compliance-grade — show retention duration prominently. Allow per-channel retention (chat longer, video shorter due to size).

#### 4.5.4 Initiating communication

Path: `Tools > Chat > Users tab`

```
Users tab: List of users CURRENTLY LOGGED IN to managed computers
   (Refreshed every 90 minutes)
        │
        ▼
If same user is on multiple devices:
   Pick which device to communicate with
        │
        ▼
Per-user row: 3 action icons:
   ├── 💬 Chat       → opens immediately, NO end-user approval needed
   ├── 📹 Video call  → end-user must accept
   └── 📞 Voice call  → end-user must accept
```

**End-user controls during call**:
- Video: change layout, disconnect, hide video, mute audio
- Voice: mute, disconnect

> **UI ask**: Asymmetry — chat opens without consent but voice/video need consent. Visualize this clearly to admin so they understand what's appropriate when. Chat for "tap on shoulder" vibe; voice/video for richer troubleshooting.

#### 4.5.5 Auditing

Path: `Tools > Chat > History`

Full transcript per chat session is preserved (under View Conversation column). All voice/video sessions logged with timestamps + participants.

---

### 4.6 Announcement

Path: `Tools > Announcement`

**Supported OS**: Windows

#### 4.6.1 What it is
Broadcast messages displayed instantly on end-user desktops. Used when:
- Email is unreliable or too slow
- Critical notifications (VPN maintenance, patch deployment, emergency procedures)
- Mass communication to specific user groups

#### 4.6.2 Schedule an announcement workflow

```
Tools > Announcement > Create Announcement
        │
        ▼
1. Audience: Specific Users OR Specific Computers
        │
        ▼
2. Message:
   ├── Title
   └── Content (RICH TEXT: tables, links, highlights, pointers)
        │
        ▼
3. Time bounds:
   ├── Start time
   └── Expiry time
        │
        ▼
4. Display frequency:
   ├── Once
   └── Multiple times (within the window)
        │
        ▼
5. Define Target:
   ├── Remote Office
   ├── Domain
   └── Custom Group (users or devices)
        │
        ▼
Save
```

⚠️ **Important constraints**:
- Announcements run based on **Central Server time** (not local time)
- **Dynamic groups CANNOT be used** as targets (only static groups)

> **UI ask**: When a Dynamic group is selected as target, show validation error before save. Don't let the admin save and discover later that nothing was sent.

#### 4.6.3 Lifecycle actions

Path: `Tools > Announcement > [announcement row] > ⋯`

| Action | Behavior |
|---|---|
| **Modify** | Edit existing announcement |
| **Suspend** | Temporarily stop displaying |
| **Resume** | Resume a suspended announcement |
| **Delete** | Permanently remove |
| **Save As New** | Duplicate as new announcement |

#### 4.6.4 Reports

Path: Click announcement title → detailed report

Classified summary by status:
- **Yet to Schedule**
- **Scheduled**
- **Failed**
- **Displayed**
- **Expired**

Plus full list of users/devices targeted + filter for failed executions.

#### 4.6.5 FAQ — important user-impacting answers

| Question | Answer |
|---|---|
| What if computer is inactive when announcement scheduled to display ONCE? | Status = **Expired** (not retried) |
| What happens with large number of users at once? | First **200 users** see it instantly; rest get it in the next **90-min refresh** |
| Can I reuse an existing announcement? | Yes — `Save As New` from Actions menu |
| What if I suspend a one-time announcement? | Won't display unless resumed; will show again only if end date hasn't passed AND user hasn't seen it yet |
| User logged into multiple computers — where does it show? | **Every** computer where the user is currently logged in |
| Is there a target limit? | **NO** — any number of users/computers, once or repeatedly |

> **UI ask**: Show the "first 200 users get instant, rest get next refresh" rule clearly on the Create wizard summary panel. Surface estimated delivery time based on target size.

#### 4.6.6 End-user view
Announcement appears as a desktop notification with the rich text content. UI on the agent side should be cohesive with EC branding.

---

### 4.7 Windows System Tools (Check Disk / Disk Cleanup / Disk Defragmenter)

Path: `Tools > System Tools`

**Supported OS**: Windows

#### 4.7.1 What it does
Schedule recurring system maintenance tasks across multiple endpoints. Solves: "It's impossible to manually run disk maintenance on every machine."

#### 4.7.2 The 3 sub-tools

##### 4.7.2.1 Check Disk
Disk integrity checker (CHKDSK):
- Verbose — name of each file in every directory as disk is checked
- Quick Check — NTFS only; skips cycle check within folder structure; less vigorous index entry check
- Fix Errors on Disk — automatically fix errors detected

##### 4.7.2.2 Disk Cleanup
Removes unwanted files to free disk space:
- Temporary files
- Internet cache
- System cache files
- Recycle bin
- Downloads folder (after specified period)
- Compress old files — Windows compresses files unused for a while
- Remove old system restore positions

> ⚠️ **Important**: Windows 10 version 1703+ **replaced Disk Cleanup with Storage Sense**. Storage Sense requires a user to be logged on. UI must surface this caveat — older Disk Cleanup invocations may not work on newer Win 10 builds.

##### 4.7.2.3 Disk Defragmenter
Reorganizes fragmented data:
- Verbose — full analysis + defrag reports
- Analyze — analyzes volume + summary report only (no actual defrag)
- Force Defragmentation — forces defrag regardless of need (e.g. even with <15% free space)

#### 4.7.3 Schedule a System Tools task — workflow

```
Tools > System Tools > Add Task
        │
        ▼
1. Task name
2. Choose operations:
   ☑ Check Disk
   ☑ Disk Cleanup        (Storage Sense warning shown for Win10 1703+)
   ☑ Disk Defragmenter
   
   Per-tool options selected (e.g. drive, verbose, force)
        │
        ▼
3. Define Targets (multi-select machines)
        │
        ▼
4. Scheduler — 3 sub-sections:

   GENERAL
   ├── Run as user (with dynamic variable picker)
   ├── Run while user logged in / not logged in
   ├── Delete task if not executed for [N] days
   └── ☑ Run with high privilege

   TRIGGER
   ├── Frequency: Once / Daily / Weekly / Monthly / At Start-up / At Log on / When idle
   ├── ☑ Time synchronization (for cross-timezone endpoints)
   ├── Expiry date
   ├── Delay execution
   └── Repeat at regular intervals

   CONDITION (recommended best practices)
   ├── ☑ Start task only if computer is idle for [N] minutes
   ├── ☑ Stop if computer becomes active
   ├── ☑ Wake up device if sleeping/shutdown (chains with WoL)
   └── ☑ Don't execute if running on low battery
        │
        ▼
Save → task deployed
```

> **UI ask**: Hint at the top: *"Disk defragmentation and clean-up might take time — schedule during off-working hours."*

#### 4.7.4 Modify task

Path: `System Tools tab > [task row] > ⋯`

- **Modify**: Add/remove tools, change scheduler, change targets
- **Delete**: Cannot be revoked; task won't execute again

#### 4.7.5 History & Reports

Per-task report:
- Configure History Settings: how long to retain task history per computer
- Click task name → list of computers task ran on
- Per-computer → full task history on that device
- View Task Details → scheduler info, targets, action chosen

---

## 5. Field-Level Inventory — Records & Settings

### 5.1 Remote Control Settings record (org-level)

**General**:
- Disable Wallpaper (bool)
- Blacken monitor (bool)
- Disable keyboard/mouse (bool)
- Hide Remote Cursor (bool)
- Viewer Type (HTML5 / ActiveX)
- Notify end user (bool)
- Allow end user to disconnect (bool)
- Enable Quick Launch (bool)
- Disable Aero Theme (bool)
- Capture Alpha-Blending (bool)
- Log reason for remote connection (bool)
- View only mode (bool)

**Idle Session**:
- Max idle time (int, seconds)
- Idle action (Disconnect / Disconnect+Lock)

**Screen Recording**:
- Enabled (bool)
- Codec (enum)
- FPS (int)
- Color Quality (High/Low)
- Max storage size (int, GB)
- On-out-of-space action (Stop recording / End session)
- Secure download (bool)
- User notification (bool)

**Performance** (per remote office override):
- Compression (Best/Fast)
- Color Quality (True Color/Low/High/Medium)

**User Confirmation**:
- Show in locked/logged-off (bool)
- Time Out (int, seconds)
- Message (string)
- Permanent (bool, one-way!)
- Excluded computers (list)

**Port**:
- Remote Control port (int, default 8443)

### 5.2 Remote Control session record (per-session)

- Session ID
- Technician
- Device (computer name + ID)
- End-user account(s)
- Start time / End time / Duration
- Reason (if Log Reason enabled)
- Connection mode (Gateway / Direct)
- Viewer type used
- User Confirmation status (Approved / Denied / Timeout / Bypassed for locked)
- Recording available (bool + storage path)
- Recording size
- Actions performed (from in-session toolbar)
- Disconnected by (Tech / End-user / Idle Timeout / Lost connection)

### 5.3 System Manager session record

- Session ID
- Technician
- Device
- Tools accessed (list — Task Manager, Registry, etc.)
- Start / End time
- User Confirmation required (bool, for File Manager / Command Prompt)
- User Confirmation status (Approved / Denied / Timeout / Bypassed)
- Actions logged per tool (processes killed, registry edited, services restarted, files transferred, etc.)

### 5.4 Shutdown Task record

- Task ID / Name
- Action (Shutdown / Restart / Hibernate / Log Off / Standby / Lock)
- Log Off sub-action (current user / all users)
- Settings: Mode (DnD / Allow skip / Force), Time Out, Message
- Targets (list)
- Scheduler (Once / Daily / Weekly / Monthly with sub-options)
- Status (Active / Suspended / Deleted)
- Per-target execution log

### 5.5 WoL Task record

- Task ID / Name
- Port (int, default 7)
- Waiting Time (int, recommended <5 min)
- Resolve IP each schedule (bool)
- Targets (list)
- Scheduler (Once / Daily / Weekly / Monthly)
- Per-target wake status (Online / Failed / Pending)
- Broadcast address override (per-device)

### 5.6 Announcement record

- Announcement ID
- Title + Content (rich text)
- Start time / Expiry time
- Display frequency (Once / Multiple)
- Target (Remote Office / Domain / Custom Group — STATIC ONLY)
- Audience (Users / Computers)
- Per-target status (Yet to Schedule / Scheduled / Failed / Displayed / Expired)
- Created by / Created at
- Status (Active / Suspended / Expired / Deleted)

### 5.7 Chat session record

- Session ID
- Technician
- End-user
- Device
- Communication type (Chat / Voice / Video)
- Start time / End time / Duration
- Chat transcript (full text)
- Voice/Video routing (Direct / Through-Server)
- Initiated-from (Tools > Chat / In-Remote-Session)

### 5.8 System Tools Task record

- Task ID / Name
- Operations (Check Disk / Cleanup / Defragmenter — per-tool options stored)
- Run as user (or dynamic variable)
- High privilege (bool)
- Trigger (Frequency + sub-options + time-sync + delay + repeat)
- Conditions (idle minutes, stop-if-active, wake-if-asleep, no-low-battery)
- Targets (list)
- Per-target execution history (status + duration + report URL)

---

## 6. Workflows — Common technician journeys

### W1. Quick troubleshoot — user calls help desk
```
1. User calls help desk: "My PC is slow"
2. Tech: Tools > Chat > Users tab → find user → Chat
3. Tech chats: "What's slow? When did it start?"
4. User describes — tech suspects bloated processes
5. Tech: Tools > Remote Control > Connect to user's PC
6. (User Confirmation prompt → user clicks Allow)
7. Tech opens Quick Launch > Task Manager (silent, doesn't show on user's screen)
   OR escalate to System Manager > Task Manager
8. Identify rogue process → kill it
9. Tech disconnects → adds note "Killed Chrome.exe orphaned process"
10. Session recorded for audit
```

### W2. After-hours mass cleanup
```
1. Tools > System Tools > Add Task
2. Operations: Check Disk + Disk Cleanup + Defragmenter (combined task)
3. Targets: All Domain Computers (or Custom Group "Office PCs")
4. Scheduler: Weekly Sunday 2 AM, repeat
5. Conditions: ☑ idle for 5 min ☑ wake if asleep ☑ skip if low battery
6. Save → runs every Sunday automatically
7. Monitor execution status from System Tools tab
```

### W3. Wake fleet for patching
```
1. Tools > Wake on LAN > Schedule Wake Up > Add Task
2. Port: 7, Waiting time: 3 min, Resolve IP: yes
3. Targets: Domain "OfficeFloor1"
4. Scheduler: Patch Tuesday + 1 day (Wednesday), 5 AM
5. Save
6. Patch Tuesday: Endpoint Central wakes machines, Patch Management deploys patches via scheduled config, then Remote Shutdown task powers them off at 6 AM
```

### W4. Emergency broadcast — VPN outage
```
1. Tools > Announcement > Create Announcement
2. Audience: Users
3. Title: "⚠️ VPN Maintenance — 10pm-12am Tonight"
4. Content (rich text with bullet points): impact, expected duration, fallback contact
5. Start: now, Expiry: tomorrow 6 AM
6. Frequency: Multiple (re-show on logon)
7. Target: Custom Group "Remote Workers"
8. Save → 200 users see instantly; rest in next 90 min
9. Monitor delivery status; resend if too many failures
```

### W5. Compliance audit — review recorded sessions
```
1. Tools > Remote Control > History tab
2. Filter: date range Q1, status = recording available
3. For each session, download recording (provide password if Secure Download enabled)
4. Review against audit checklist:
     ✓ Did tech enter reason?
     ✓ Was user confirmation present?
     ✓ Was sensitive operation (Blackout, Disable I/O) used appropriately?
     ✓ Was screen recording stored within retention policy?
5. Reports back to compliance team
```

### W6. Silent malware investigation
```
1. Suspicious activity report on a machine
2. Tools > System Manager > [device] > Manage
3. Task Manager → look for suspicious processes
4. Registry → check autorun keys (HKLM\..\Run, HKCU\..\Run)
5. Services → identify suspicious services
6. Event Viewer → review system logs
7. File Manager → check suspicious paths (Temp, AppData)
8. Findings: malware detected
9. Cross-link: Inventory > Block Executable (EC-03) to lock it down
10. Cross-link: EDR (EC-13) deep dive
```

### W7. Mass shutdown end-of-day energy savings
```
1. Tools > Remote Shutdown > Scheduled Shutdown > Add Shutdown Task
2. Action: Shutdown
3. Settings: Mode = "Allow users to skip/postpone" (max 3 skips), Time Out 5 min, Message = "Saving energy! PC shutting down. Skip if needed (max 3 times)"
4. Targets: All office PCs except Servers
5. Scheduler: Weekdays 7 PM
6. Save → runs daily; users can postpone up to 3x; after that, force shutdown
```

### W8. Senior exec needs urgent help
```
1. Tools > Remote Control > Connect to CEO's laptop
2. User Confirmation pops up on CEO's screen
3. CEO clicks Allow
4. Tech sees CEO's screen; clicks Blackout to make end-user screen black during sensitive password reset
5. Tech enables Disable Keyboard+Mouse so CEO doesn't accidentally interrupt
6. Tech uses Clipboard Keystroke to paste temporary password into login field (more secure than displaying)
7. Issue resolved → tech disconnects → session recorded for audit
```

### W9. Investigate a "left their laptop on" scenario after hours
```
1. Tools > Remote Shutdown — see list of devices online after hours
2. Suspicious activity? Tools > Remote Control with View-only Mode
3. Observe what's running on the machine
4. Confirm legit (e.g. running scheduled report) or initiate Shutdown if abandoned
```

---

## 7. Error States & Troubleshooting

### 7.1 Remote Control errors

| Error | Cause | Remediation |
|---|---|---|
| "Cannot connect — port blocked" | Firewall on viewer, agent, or server blocks 8443 | Open TCP 8443 (UDP for direct connection) |
| "Agent not reachable" | Agent offline / machine asleep | Trigger WoL first; check agent status |
| "User Confirmation timeout" | End-user didn't approve in time | Tech retries; or admin checks if user is active |
| "ActiveX component not loaded" | Remote Control Component not installed on viewer | Download from product console |
| "Multi-monitor not detected" | Driver/display issue on remote | Reboot remote; check display drivers |
| "Codec not supported on remote" (recording) | Selected codec missing on remote machine | Falls back to default automatically; UI should surface this |
| "Recording disk full" | Cloud 5 GB limit OR on-prem max storage exceeded | Delete old recordings; configure max storage |

### 7.2 WoL errors

| Error | Cause | Remediation |
|---|---|---|
| "No live agent in subnet" | No relay machine to send magic packet | Ensure ≥1 agent online in target subnet |
| "BIOS WoL disabled" | Device BIOS doesn't have WoL enabled | Vendor BIOS settings (Dell DCCU / HP BCU / Lenovo Think BIOS) |
| "Deep Sleep Mode active" | Modern Windows + BIOS in deep sleep | Disable Deep Sleep in BIOS |
| "Windows 10 shutdown mode" | Win10 device fully shutdown (not sleep) | Use hibernate instead OR Microsoft KB workaround |
| "Network adapter restart needed" | First-time enabling WoL settings | Confirm with admin: "Network adapters of all agents will restart" |
| "IP-directed broadcast disabled" | Router doesn't forward broadcast packets | Network admin must enable on router/switch |
| "VM not supported" | Target is a managed VM | WoL doesn't work for VMs — use VM management tools |

### 7.3 Chat / Voice / Video errors

| Error | Cause | Remediation |
|---|---|---|
| "Browser blocked pop-up" | Browser security setting | User must allow pop-ups for the EC console |
| "Voice/Video disconnect immediately" | Dynamic UDP range blocked (49152-65535) | Network admin opens range |
| "NAT issue with calls" | Central Server behind NAT, dynamic ports not configured | Configure dynamic port range per NAT settings |
| "Chat not available" | Cloud edition or non-Windows endpoint | Chat is on-prem + Windows only |
| "Port 8443/8444 conflict" | Another service using these ports | Modify in Admin > Tools Settings > Port Settings; restart Server |

### 7.4 Announcement errors

| Error | Cause | Remediation |
|---|---|---|
| "Status: Expired" for one-time announcement | Computer was inactive within the time window | Choose "Multiple" display or extend window |
| "Status: Failed" mass deliveries | Network/agent issues | Retry; filter Failed and re-target |
| "Dynamic group not supported" | Picked a dynamic custom group | Pick static group instead |
| "Only 200 users got it instantly" | Mass delivery batching | Rest get it in next 90 min; expected behavior |

### 7.5 System Tools errors

| Error | Cause | Remediation |
|---|---|---|
| "Disk Cleanup not running on Win10 1703+" | Replaced by Storage Sense | Use Storage Sense GPO instead |
| "Defragmenter skipped — SSD detected" | SSDs shouldn't be defragmented | Auto-skip is correct behavior |
| "Check Disk running too long" | Large disk + verbose mode | Use Quick Check for NTFS to reduce time |
| "Task didn't run — device asleep" | Wake setting not enabled | Enable "Wake up device if sleeping" in Conditions |
| "Task didn't run — low battery" | Battery condition active | Plug in OR override "no execution on low battery" |

---

## 8. Edge Cases & Gotchas

1. **HTML5 vs ActiveX feature gap is large.** Many advanced controls (Notify end-user prompt, Aero disable, Alpha-blending, Quick Launch) are ActiveX-only. UI must show which features work for current Viewer Type.

2. **User Confirmation Permanent is one-way.** Once enabled, only support can revoke. Strong modal warning required.

3. **"Show confirmation in locked/logged-off" unchecked = bypass confirmation.** Hidden security implication — UI should make this trade-off explicit.

4. **Screen recording cloud cap is 5 GB.** On hitting cap, recording stops OR session ends per setting. Show storage gauge prominently.

5. **WoL doesn't work for VMs.** Hide WoL option for VM targets or show explicit "Not supported for VMs" message.

6. **WoL requires at least one live agent in target subnet.** If subnet has no online agent, magic packet can't be relayed. Pre-flight check.

7. **Enabling WoL settings restarts network adapters of ALL agents.** Strong confirmation modal.

8. **Win10 shutdown mode = no WoL.** Use Hibernate or follow MS KB workaround.

9. **System Manager Hardware tool is Cloud-only.** All other System Manager tools are on-prem-friendly. UI must conditionally render.

10. **System Manager File Manager / Computer Rename / Event Viewer are on-prem only.** Hide on Cloud edition.

11. **Chat is on-premises only.** Hide entire Chat tab on Cloud edition.

12. **Voice/Video can route Direct OR Through-Server.** Direct = lower latency; Through-Server = needs UDP 49152-65535. Show which mode is active during call.

13. **Announcement Dynamic groups NOT supported.** Validation error on save, not at runtime.

14. **Announcement: first 200 users instant, rest in next 90 min.** Explain on Create form to set expectations.

15. **Announcement runs on Central Server time, not local.** For cross-timezone fleets, this matters. Show server-time clock on the Create form.

16. **"Status: Expired" means missed delivery, not failure.** Don't conflate with Failed.

17. **Suspending a one-time announcement only matters if end date hasn't passed AND user hasn't seen it.** Otherwise it's just a record.

18. **Disk Cleanup deprecated on Win10 1703+.** Storage Sense is the modern replacement, but requires user logged on. Surface this caveat.

19. **Time Out on Shutdown only applies if device is in use.** Logged-out devices skip the wait — Force/proceed immediately. Easy to misunderstand.

20. **Log Off has two sub-actions: current user OR all users.** Wrong choice can disrupt other users on shared machines.

21. **System Manager Permission Settings have a "Permanently disable for all users" option.** One-way; only support can revert.

22. **System Manager User Confirmation applies only to File Manager + Command Prompt** — not all tools. UI should clarify scope.

23. **Quick Launch in viewer needs to be enabled in Remote Control Settings.** Default may be off; tech wonders where the tools went.

24. **Multi-user device — three-dots next to Connect lets you pick the session.** Easy to overlook the ⋯ button.

25. **Refresh button in viewer is required if computer is locked / no user logged in.** Tech expects the screen to just appear; needs to click refresh first.

26. **Clipboard Keystroke is a security feature** — paste passwords without showing them on remote. But not all techs notice it; can lead to typed-out passwords in plain view.

27. **Idle Session Disconnect+Lock is more secure than just Disconnect** — recommend Lock action as default to prevent re-entry without re-auth.

28. **Voice/Video Direct mode needs UDP enabled at network level.** Cisco-style ACLs sometimes block this; UI should hint at firewall checks.

29. **Active Directory and Workgroup machines both supported in Computer Rename**, but workflow differs slightly. UI must adapt.

30. **WoL recommended waiting time < 5 min**. Longer wait = stale status; shorter = misleading "failed" status. Default to 3-5 min.

31. **Network adapter port for WoL (default 7)** must be available on remote — some firewalls block.

32. **Broadcast address mismatch in WoL** — broadcast IP must match the remote subnet, not viewer subnet. Editable per remote device.

33. **Screen recording codec mismatch — falls back to default.** Don't error out; surface the fallback.

34. **Idle session timeout fires even during active screen recording** — admin loses both the session AND further recording. Plan accordingly.

35. **System Manager Hardware tool conflicts with EC-03 Inventory hardware view.** EC-05 Hardware is real-time; EC-03 is last-scan snapshot. Both have value; UI should cross-link.

---

## 9. UI Screens Needed (deliverable list)

### 9.1 Remote Control (10)
1. Remote Control device list (filterable, status indicators)
2. Remote Control Settings → General (Windows + Universal toggles)
3. Remote Control Settings → Idle Session
4. Remote Control Settings → Screen Recording (with codec + storage gauge)
5. Remote Control Settings → Performance (per-remote-office)
6. Remote Control Settings → User Confirmation (with Permanent warning)
7. Active Remote Session Viewer (HTML5 mode) with toolbar
8. Active Remote Session Viewer (ActiveX mode) with extended toolbar
9. Remote Session History list (with recording downloads)
10. Per-device User Access Log

### 9.2 System Manager (5)
11. System Manager device list
12. System Manager Tools Grid (16 sub-tool cards) per device
13. System Manager Settings — Permission + User Confirmation
14. Per-sub-tool UI (Task Manager / Registry / Services / etc.)
15. System Manager session log

### 9.3 Remote Shutdown (3)
16. Remote Shutdown device list + instant action picker
17. Scheduled Shutdown tab + Add Task wizard
18. Shutdown/Restart Settings modal (Mode / Time Out / Message)

### 9.4 Wake on LAN (4)
19. WoL device list + Wake up Now action
20. Schedule Wake Up tab + Add Task
21. Edit Broadcast Address per-device modal
22. WoL readiness checklist (prereq + BIOS + IP-directed broadcast)

### 9.5 Chat (4)
23. Chat Users tab (logged-in users list)
24. Active Chat window (admin view)
25. Voice/Video call interfaces (admin + end-user views)
26. Chat History + History Settings

### 9.6 Announcement (4)
27. Announcement list (Users/Computers tabs)
28. Create Announcement wizard (rich text editor)
29. Announcement detail report (status breakdown + targets)
30. End-user announcement display preview

### 9.7 System Tools (3)
31. System Tools task list
32. Add Task wizard (operations + targets + scheduler with 3 sub-sections)
33. Per-task report (per-device execution log)

### 9.8 Cross-cutting (3)
34. Tools tab dashboard (KPIs: active sessions, scheduled tasks, recent recordings)
35. Audit / Action Log Viewer (Tools-related entries)
36. Tools Settings hub (Port Settings + System Manager Settings + RC Settings)

---

## 10. Component Library — Tools-Specific

### 10.1 Session / viewer components
- **`RemoteSessionViewer`** — HTML5 viewer wrapper with toolbar
- **`RemoteSessionViewerActiveX`** — Native viewer wrapper (Windows only)
- **`ViewerToolbar`** — 17+ action toolbar with grouped icons (View / Control / Tools / Communication / Security)
- **`MultiMonitorTabStrip`** — auto-detected monitor switcher
- **`ConnectionModeBadge`** — Gateway / Direct indicator
- **`UserConfirmationModal`** — end-user-facing prompt with timeout countdown
- **`SessionRecordingIndicator`** — red dot + "Recording" badge in viewer
- **`IdleSessionWarning`** — countdown banner before disconnect
- **`SecureClipboardField`** — paste-without-display for passwords

### 10.2 Status / badge
- **`SessionStatusPill`** — Active / Idle / Disconnected / Failed
- **`ConfirmationStatusBadge`** — Approved / Denied / Timeout / Bypassed
- **`PowerActionBadge`** — Shutdown / Restart / Hibernate / Log Off / Standby / Lock
- **`WoLStatusBadge`** — Online / Failed to Wake / Pending
- **`AnnouncementStatusPill`** — Yet to Schedule / Scheduled / Failed / Displayed / Expired
- **`RecordingAvailableBadge`** — with download icon + storage size

### 10.3 Pickers / inputs
- **`ViewerTypePicker`** — HTML5 vs ActiveX with feature comparison chip
- **`CodecPicker`** — Microsoft Video 1 / Intel IYUV / Cinepak
- **`PowerActionPicker`** — 6-action picker (Shutdown / Restart / Hibernate / Log Off / Standby / Lock)
- **`SchedulerBuilder`** — Once / Daily / Weekly / Monthly with sub-options
- **`SystemToolsOperationsPicker`** — Check Disk + Cleanup + Defragmenter toggles with per-tool sub-options
- **`BroadcastAddressInput`** — per-device WoL config

### 10.4 Specialized cards
- **`SystemManagerToolCard`** — 16 cards in grid; ghosted if edition-incompatible
- **`SystemManagerToolCard:TaskManager`** — embedded process list, sortable, kill/stop actions
- **`SystemManagerToolCard:Registry`** — tree view with search
- **`SystemManagerToolCard:Services`** — service list with action dropdown
- **`SystemManagerToolCard:Software`** — installed list with uninstall direct
- **`ShutdownTaskCard`** — name + action + targets + next-run + status
- **`WoLTaskCard`** — name + port + targets + scheduler + last-status
- **`AnnouncementCard`** — title + audience + start/expiry + display freq + delivery KPI

### 10.5 Compliance / safety
- **`PermanentLockWarning`** — for User Confirmation Permanent + Permission Permanent-Disable
- **`RecordingStorageGauge`** — visual gauge for storage cap (with cloud 5 GB hint)
- **`LogReasonRequiredModal`** — text input before remote session
- **`UserConfirmationPrompt`** — end-user-facing approve/deny with timeout countdown
- **`ChatRetentionNotice`** — "Chats older than N days auto-deleted"
- **`NetworkAdapterRestartWarning`** — for enabling WoL settings
- **`BIOSWoLChecklist`** — per-device prereq checker
- **`ScreenRecordingNotification`** — end-user notification with recording icon
- **`AnnouncementTimezoneIndicator`** — "Scheduled at server time UTC+X — your time: HH:MM"

### 10.6 In-session widgets
- **`InSessionChatWidget`** — chat panel within Remote Control session
- **`InSessionDiagnosticToolsLauncher`** — quick access to Task Mgr / Power Options / Cleanup
- **`InSessionFileTransferDialog`** — bidirectional file share
- **`InSessionNetworkPerformanceWidget`** — latency + throughput
- **`InSessionScreenshotTool`** — capture and annotate
- **`InSessionHotKeyButton`** — Ctrl/Alt/Esc/Win for remote
- **`InSessionViewModeToggle`** — View-only ↔ Control

### 10.7 Cross-edition (Cloud vs On-prem)
- **`EditionFeatureGate`** — wraps a component; shows "Not available on Cloud" or "Not available on On-Premises" message + edition icon
- **`ChatUnavailableBanner`** — for Cloud users hitting the Chat tab
- **`HardwareToolCloudOnlyBadge`** — special-case for System Manager Hardware sub-tool

---

## 11. Cross-Module Dependencies

| Module | Relationship to Tools |
|---|---|
| **EC-03 Inventory** | Computer detail page links to Tools > Remote Control for that device. Inventory's hardware data overlaps with System Manager Hardware sub-tool (one is scan-based, other is real-time) |
| **EC-04 Software Deployment** | System Manager > Software tool shares the uninstall pattern; deeper deploys route here |
| **EC-01 Patch Management** | Tools-driven WoL + Shutdown often chain with Patch Management deployments (wake → patch → shutdown pattern) |
| **EC-CROSS Audit** | Remote Control + System Manager actions log into the central Action Log Viewer (Admin → Audit) |
| **EC-CROSS Custom Groups** | Targets in Shutdown / WoL / Announcement / System Tools all use Custom Groups (static only for Announcement) |
| **EC-CROSS RBAC** | Permission Settings for sensitive System Manager tools (File Manager, Cmd Prompt, Computer Rename) gated by RBAC |
| **EC-CROSS Helpdesk Integration** | Remote Control sessions can be linked to ServiceDesk Plus tickets for context |
| **EC-19 EPM** | Tools that require elevation (Cmd Prompt, PowerShell with admin privilege) interact with EPM's privilege escalation rules |
| **EC-CROSS Mobile App** | Endpoint Central mobile app can initiate Remote Control sessions on the go |

> **UI ask**: When tech opens Remote Control session, if SDP ticket integration is on, show a "Link to ticket" affordance — searches active tickets for that user / device and links the session to a ticket for audit + billing tracking.

---

## 12. Reference URLs

### Help docs — primary
- Module landing (Tools): https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/desktop-central-tools.html
- Remote Desktop Sharing: https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/remote_desktop_sharing.html
- Remote Desktop Pre-requisites: https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/remote_desktop_pre-requisites.html
- Remote Desktop Settings: https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/remote_desktop_sharing_configuring_settings.html
- Connecting to Remote Desktop: https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/accessing_remote_desktop.html
- File Transfer in Remote Session: https://www.manageengine.com/products/desktop-central/help/remote_desktop_sharing/file_transfer.html
- System Manager: https://www.manageengine.com/products/desktop-central/help/windows_system_tools/system_manager.html
- Remote Shutdown: https://www.manageengine.com/products/desktop-central/help/windows_system_tools/shutdown_tool.html
- Wake on LAN: https://www.manageengine.com/products/desktop-central/help/wake_on_lan_tool.html
- Chat: https://www.manageengine.com/products/desktop-central/help/chat/chat.html
- Chat Troubleshooting: https://www.manageengine.com/products/desktop-central/help/chat/chat_troubleshooting_tips.html
- Announcement: https://www.manageengine.com/products/desktop-central/help/windows_system_tools/announcement.html
- Windows System Tools: https://www.manageengine.com/products/desktop-central/help/windows_system_tools/windows_system_tools.html
- Check Disk: https://www.manageengine.com/products/desktop-central/help/misc/run_windows_chkdsk_tool.html
- Disk Cleanup: https://www.manageengine.com/products/desktop-central/help/misc/run_windows_disk_cleanup_tool.html
- Disk Defragmenter: https://www.manageengine.com/products/desktop-central/help/misc/run_windows_disk_defragmenter.html
- Creating and Scheduling System Tasks: https://www.manageengine.com/products/desktop-central/help/windows_system_tools/creating_scheduling_windows_system_tasks.html
- Direct Connection in Remote Control: https://www.manageengine.com/products/desktop-central/direct-connection-in-remote-control.html
- Defining Targets: https://www.manageengine.com/products/desktop-central/help/defining_targets.html

### Feature pages (marketing-driven positioning)
- Remote Desktop Sharing: https://www.manageengine.com/products/desktop-central/remote-desktop-sharing.html
- Remote Desktop Sharing Features: https://www.manageengine.com/products/desktop-central/remote-desktop-sharing-features.html
- Remote Desktop How-to: https://www.manageengine.com/products/desktop-central/remote-desktop-sharing-how-to.html
- Disk Defragmenter: https://www.manageengine.com/products/desktop-central/disk-defragmenter.html

### Demo videos referenced in help
- Idle Session Settings: https://www.manageengine.com/products/desktop-central/demo/remote/idle-session-settings.html
- Record Remote Sessions: https://www.manageengine.com/products/desktop-central/demo/remote/record-remote-sessions.html
- Log Reason: https://www.manageengine.com/products/desktop-central/demo/remote/log-reason.html
- Port Settings: https://www.manageengine.com/products/desktop-central/demo/remote/port-settings.html

---

## 13. Critical UX Tensions

1. **HTML5 vs ActiveX feature parity gap.** Most universal-looking features are actually ActiveX-only on Windows. Easy to mislead techs about what's possible from cloud/mobile/Mac viewer.

2. **One-way destructive settings (User Confirmation Permanent, Permanently Disable for All).** These nukes are easy to enable, impossible to revert without support. Strong friction needed.

3. **Cloud vs On-prem feature gaps are sprawling.** Chat / File Manager / Computer Rename / Event Viewer / Hardware tool — different combinations available on different editions. Hard to keep mental model.

4. **Idle Session Disconnect+Lock vs Just Disconnect.** Lock is more secure but inconveniences users (forces re-auth). Default matters.

5. **Screen recording storage cap (5 GB cloud).** Easy to silently lose recordings to oldest-first deletion. Surface storage gauge always.

6. **WoL prerequisites are heavy** — at least one live agent, BIOS settings, IP broadcast, Deep Sleep off, Win10 not-shutdown. Pre-flight checklist required.

7. **Announcements run on server time, not user local time.** Cross-timezone fleets get confused.

8. **Announcement "Expired" status confused with "Failed".** Expired = computer wasn't on; Failed = network/agent error.

9. **Disk Cleanup deprecated on Win10 1703+.** Storage Sense is replacement but needs user logged on. Easy gotcha.

10. **System Tools time-out behavior**: only applies when device is in use. Logged-out devices skip the warning. Counter-intuitive.

11. **Voice/Video routing (Direct vs Through-Server)** isn't visible by default. Tech blames "bad call quality" without knowing connection mode.

12. **System Manager Software tool overlaps with Inventory and Software Deployment.** Three places to uninstall — which to pick? UI should cross-link with use-case hints.

13. **Quick Launch in viewer is opt-in.** Tech expects it; needs to enable in Settings first.

14. **Compliance checkboxes (Log Reason, User Confirmation, Screen Recording) compound.** Enabling all = high audit but high friction. Show admin the impact preview.

15. **Multi-user devices — picking the wrong session via ⋯ is easy.** Make user selection more prominent than the default Connect button when multiple users present.

16. **Announcement first-200-instant behavior.** Cross-timezone or cross-subnet fleets may see staggered delivery. Set expectations.

17. **WoL doesn't work on VMs.** Hide the tool for VM targets — or at minimum, show "Use VM mgmt tools instead" hint.

18. **Force Shutdown setting can corrupt unsaved work.** Default to graceful with skip-allowed; opt-in to force.

19. **Permanent settings are spread across modules.** Track them centrally: a "What I've made permanent" admin view that lists all one-way locks.

20. **Tech who uses HTML5 viewer can't access Quick Launch / disable Aero / etc.** Show feature-mode chip near the toolbar so tech doesn't hunt for missing tools.

---

## 14. Status Lifecycle Summary

### Remote Control session
```
Tech clicks Connect
        │
        ▼
[Waiting for User Confirmation]
        │
        ├── Approved → [Session Active]
        ├── Denied → [Session Aborted]
        └── Timeout → [Session Aborted]
        │
        ▼
[Session Active]
        │
        ├── Idle for N min → [Session Disconnected | Session Disconnected+Locked]
        ├── Tech disconnects → [Session Ended]
        ├── End-user disconnects (if allowed) → [Session Ended by User]
        └── Network loss → [Session Lost]
        │
        ▼
[Recording uploaded to storage] (if enabled)
```

### Power action task (Shutdown / Restart / WoL)
```
Saved → Scheduled → Triggered → Executing → (Success | Failed | Skipped by user)
                                          │
                                          └── (if "Allow skip" and max not reached) → Postponed → Re-triggered
```

### Announcement
```
Created → Scheduled → (At start time)
        │
        ├── Displayed (delivered to first 200 in real-time)
        ├── Scheduled for rest (next 90 min refresh)
        ├── Failed (network / agent issues)
        ├── Expired (computer was inactive during window, "Once" only)
        └── (Admin Suspended) → Resume → back to Scheduled
```

### System Tools task
```
Saved → Scheduled → (Trigger fires)
        │
        ├── Conditions met → Executing → (Per-target: Success | Failed)
        ├── Idle condition not met → Skipped
        ├── Low battery → Skipped
        ├── Device asleep + Wake enabled → WoL → then Execute
        └── Device asleep + Wake disabled → Skipped
```

### Chat session
```
Tech initiates → 
   ├── Chat: Opens immediately (no consent)
   ├── Voice: Awaiting user accept → Connected | Declined | Timeout
   └── Video: Awaiting user accept → Connected | Declined | Timeout
        │
        ▼
[Active]
        │
        ├── Either party disconnects → [Ended]
        └── Network failure → [Lost]
        │
        ▼
[Transcript stored per retention policy]
```

---

## 15. Module signature — one-paragraph mental model

> **Tools** is Endpoint Central's **real-time, technician-driven intervention surface** — distinct from configuration modules that defer execution to the agent's refresh cycle. The five jobs a technician must accomplish without friction are: (1) **understand the user's problem** via Chat / Voice / Video before doing anything, (2) **take over the screen safely** via Remote Control with compliance constraints (user confirmation, screen recording, log reason), (3) **fix issues silently** via System Manager's 16 sub-tools without disrupting the end-user, (4) **manage power** of devices via Shutdown / WoL — both instant and scheduled, and (5) **broadcast critical information** via Announcement when email isn't fast enough. The core UX commitments are: **compliance-first defaults** (User Confirmation on, Log Reason required, recordings encrypted-download), **edition-aware rendering** (Cloud vs On-prem hide/show different features), **strong friction on one-way settings** (Permanent Confirmation, Permanently Disable), and **clear viewer-mode communication** (HTML5 has fewer features than ActiveX — tech must know which they're using). Every session leaves an audit trail; every broadcast has a delivery report; every scheduled task has a per-target log.

---

**File**: EC-05 — Remote Tools & Troubleshooting (Deep Dive)
**Companion files**: EC-00 (Master), EC-01 (Patch Mgmt), EC-02 (Vuln Mgmt), EC-03 (Inventory), EC-04 (Software Deployment)
**Next**: EC-06 — OS Imaging & Deployment (Online/Offline imaging, WinPE, Driver injection, Zero-touch deployment, HID) — say `next` for sequential, or specify security-heavy priority (e.g. "EDR first")
