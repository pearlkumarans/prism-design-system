# Windows System Tools

> A suite of sysadmin maintenance and power tools — Disk Cleanup, Check Disk, Disk Defragmenter, Wake-on-LAN, Remote Shutdown, and an integrated Chat tool — that admins can run or schedule across many Windows computers simultaneously from the Endpoint Central console. Parent module: [Remote Troubleshooting / Tools](remote-troubleshooting.md). Available in Professional and above (tools/configurations are core management features). **Windows-focused.**

---

## 1. What it is — Feature detail

Periodic maintenance keeps systems performing well, but it is impractical for admins to run these tasks manually on individual machines. Endpoint Central lets admins **schedule maintenance tasks on multiple computers simultaneously, at regular intervals**, create **multiple tasks** that run different tools on different target computers at specified times, and **schedule during off-hours** so productivity isn't hit.

### The tools

**Disk Defragmenter**
Disks fragment as users create/delete files and install/uninstall programs: when a file is deleted, its space frees up; a new file then fills the first large-enough free space and saves the remainder in consecutive fragments. Fragmented disks slow retrieval and degrade performance, so periodic defragmentation is needed. Endpoint Central runs the defragmenter on many machines at once with options:
- **Verbose** — display the complete analysis and defragmentation reports.
- **Analyze** — analyze the volume and show a summary analysis report.
- **Force Defragmentation** — force defragmentation regardless of whether it's needed.

**Check Disk**
Disk errors (bad sectors, cross-linked files, directory errors) cause I/O problems. Check Disk creates a status report of the disk based on its file system. Options:
- **Verbose** — display the name of each file in every directory as the disk is checked.
- **Quick Check** — available only for **NTFS**; performs the check quickly by skipping cycle-checking within the folder structure and doing a less vigorous check of index entries.

**Disk Cleanup**
The Disk Cleanup utility determines unused files on the disk and deletes them to significantly increase free space.

**Wake-on-LAN (WoL)**
Remotely "wakes up" (boots) a switched-off machine present on the network. The target must be **configured to accept the Wake-on-LAN remote command**. Supports both **manual and scheduled** wake-ups and can boot systems **across VLANs**. (WoL is also used by deployment policies to wake machines before patching/software deployment.)

**Remote Shutdown**
Lets admins remotely perform:
- Shutdown
- Restart
- Hibernate
- Stand By
- Lock Computers

Tasks can be **manual or scheduled**, with per-task **status for verification**. Users can be **notified before** a shutdown/restart and may **skip** the operation (no workflow interruption), and the admin can choose to **leave active users undisturbed**.

**Chat (integrated)**
Integrated chat enables simple, efficient **one-to-one (admin ↔ end user)** communication for online users while troubleshooting desktop issues. **Chat history** is retained for reference, and **auditing** records and securely archives a copy of each chat session to help stay compliant with regulations. Pairs naturally with remote control/troubleshooting.

### Scheduling model
- Run a tool **on demand** or **on a schedule** at regular intervals.
- Create **multiple tasks**, each running a chosen tool on a chosen set of target computers at a specified time.
- Schedule during **off-hours** to avoid productivity impact; verify per-task **status** afterward.

### Prerequisites and key concepts
- EC server + agent on Windows targets; WoL requires the target NIC/BIOS configured to accept the magic packet (and reachable on the LAN/VLAN).
- Key terms: scheduled maintenance task, Verbose/Analyze/Force (defrag), Verbose/Quick Check (chkdsk), magic packet, cross-VLAN wake, pre-action user notification/skip, session audit (chat).

---

## 2. UX lens

### Console navigation path
`Tools` (System Tools) — Disk Cleanup, Check Disk, Disk Defragmenter, Wake-on-LAN, Remote Shutdown; Chat is launched from the Tools/remote-session context. (Exact menu placement varies by release; system tools are documented under the Windows System Tools help section.)

### Step-by-step: schedule a maintenance task (e.g., Disk Defragmenter)
1. Open the System Tools area under `Tools`.
2. Select **Disk Defragmenter** (or Check Disk / Disk Cleanup).
3. Choose options (Defrag: Verbose / Analyze / Force; Check Disk: Verbose / Quick Check on NTFS).
4. **Define the target** computers/groups.
5. Set the **schedule** (one-off or recurring at intervals; prefer off-hours).
6. Save/execute; verify per-task **status** afterward.

### Step-by-step: Wake-on-LAN
1. Ensure targets are configured to accept WoL (NIC/BIOS).
2. Open **Wake-on-LAN** under Tools.
3. Select target computers (works across VLANs).
4. Wake **now** or **schedule** the wake (e.g., before a maintenance window/deployment).

### Step-by-step: Remote Shutdown / Restart
1. Open **Remote Shutdown** under Tools.
2. Choose the action (Shutdown / Restart / Hibernate / Stand By / Lock).
3. Select targets; set manual or scheduled execution.
4. (Optional) Enable **user notification** with skip, and **leave active users undisturbed**.
5. Execute; check per-task status.

### Step-by-step: start a Chat
1. From a remote session/Tools context, launch **Chat** to the online end user.
2. Communicate one-to-one while troubleshooting; the session is recorded/audited and chat history is retained.

### UX research hooks
- **Off-hours scheduling discoverability** — do admins find and use scheduling vs. running ad hoc? Study default-to-off-hours nudges.
- **WoL prerequisites** — the NIC/BIOS configuration requirement is a frequent failure point; an in-console readiness check would help.
- **Disruptive actions safety** — Remote Shutdown/Restart can interrupt users; study whether the notify/skip/undisturbed controls give enough confidence.
- **Task status legibility** — for bulk tasks, study how clearly per-target success/failure is surfaced.

### Notable UI patterns
System Tools task builder (tool + options + target + schedule), per-task status view, pre-action user-notification/skip composer (Remote Shutdown), WoL target selector, integrated audited chat window.

---

## 3. PM lens

### Value proposition & outcomes
- **Hands-off maintenance at scale** — defrag/chkdsk/cleanup across the fleet on a schedule keeps machines healthy without desk visits.
- **Power and access control** — WoL boots machines for off-hours work; Remote Shutdown enforces power policies and locks idle/at-risk machines.
- **Faster support** — audited chat speeds troubleshooting and keeps a compliant record.
- **Productivity-aware** — off-hours scheduling and notify/skip protect users.

### Target personas & use cases
- **IT administrator / sysadmin** — scheduled fleet maintenance; power control.
- **Help-desk technician** — chat-assisted troubleshooting; lock/restart a problem machine.
- Use cases: nightly defrag/cleanup, pre-deployment WoL, end-of-day shutdown for energy savings, lock lost/idle machines, free disk space at scale.

### Positioning & differentiators
- Bundled in the unified console alongside remote control, patching, and deployment — no separate maintenance tooling.
- **Cross-VLAN WoL**, scheduled bulk maintenance, audited chat, and user-respecting shutdown notifications are practical differentiators.
- Ties into power management (energy savings) and deployment (WoL before patch/software rollout).

### Edition gating & packaging
- Core tools/configurations available from Professional upward; remote-session audit/recording (and some advanced controls) align with Enterprise+ feature tiers. (Inferred — verify against the edition-comparison matrix.)

### Expansion opportunities (analysis)
- **Modern storage awareness** — skip defrag on SSDs / run TRIM instead; surface SSD-vs-HDD logic. *(inferred)*
- **Health-driven scheduling** — trigger cleanup/chkdsk from DEX disk-health signals. *(inferred)*
- **macOS/Linux maintenance parity** (disk/cleanup equivalents). *(inferred)*
- **Energy/sustainability reporting** tied to WoL/shutdown schedules. *(inferred)*

---

## 4. Developer / Technical lens

### Mechanics & components
- **EC agent (Windows)** executes the underlying OS utilities — defrag (`defrag`), check disk (`chkdsk`), Disk Cleanup (`cleanmgr`) — with the selected options, on schedule, and reports status to the server. (Underlying utility mapping inferred from the documented options.)
- **Wake-on-LAN** sends a **magic packet** to the target's NIC; the agent/server orchestrates wake across subnets/VLANs (requires the wake packet to reach the target segment).
- **Remote Shutdown** issues shutdown/restart/hibernate/standby/lock commands to the agent, with optional pre-action user notification and skip.
- **Chat** runs a one-to-one session between admin and end user; sessions are recorded and securely archived for audit.

### Ports / protocols / limits (mark inferred)
- WoL uses the **magic packet** (UDP, commonly port 7 or 9) broadcast/directed to the target subnet; cross-VLAN wake needs the network to forward/relay the packet. *(inferred — standard WoL.)*
- Agent–server communication on the platform's standard ports (agent–server **8020**/console **8383**, on-demand **8027**). *(inferred — shared platform.)*
- **Limits:** WoL requires NIC/BIOS WoL enabled and the magic packet reaching the target segment; Check Disk "Quick Check" is **NTFS-only**; tools are **Windows-focused**; defrag is unnecessary/undesirable on SSDs (no SSD-specific logic documented). *(partly inferred.)*

### Data model / key objects (inferred naming)
SystemToolTask (tool type, options, target group, schedule, status), WoLTask, RemoteShutdownTask (action, notification/skip config), ChatSession (transcript, audit record).

---

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Wake-on-LAN doesn't wake the machine | WoL not enabled in NIC/BIOS; magic packet not reaching the segment; machine fully powered off without WoL support | Enable WoL in NIC/BIOS power settings; ensure the packet can reach the target subnet/VLAN; verify the NIC stays powered in sleep/off. |
| WoL works on same subnet but not across VLANs | Routers/switches not forwarding the directed broadcast | Configure directed-broadcast/relay so the magic packet reaches the remote VLAN. |
| Check Disk "Quick Check" unavailable | Volume is not NTFS | Quick Check is NTFS-only; run the standard (Verbose) check on non-NTFS volumes. |
| Disk Defragmenter runs on SSDs | No SSD-specific exclusion | Avoid scheduling defrag on SSDs; target HDD volumes only. *(inferred best practice.)* |
| Remote Shutdown interrupted a working user | Notification/skip not configured, or "leave active users undisturbed" not set | Enable pre-action notification with skip; set "leave active users undisturbed"; schedule off-hours. |
| Scheduled task didn't run / no effect | Agent offline or machine powered off at run time; target not in scope | Confirm agent connectivity and that the machine is on (use WoL first); verify the target group; check per-task status. |
| Disk Cleanup freed little space | Limited cleanable categories present | Combine with other maintenance; review what Disk Cleanup targets; consider scheduled recurrence. |
| Chat can't reach the user | User offline | Chat is for online users; use WoL/remote control or retry when the user is online; review chat history/audit. |

### FAQs
- **Can I run these on many machines at once?** Yes — schedule a tool across multiple computers simultaneously, and create multiple tasks for different tools/targets.
- **Which check-disk option is fastest?** Quick Check (NTFS only).
- **What does Wake-on-LAN need?** The target configured to accept the WoL command (NIC/BIOS); it can wake across VLANs.
- **Will Remote Shutdown disturb users?** Optionally not — notify users with a skip option and choose to leave active users undisturbed.
- **Is chat recorded?** Yes — chat history is retained and each session is audited/archived for compliance.
- **Are these Windows-only?** The documented system tools are Windows-focused.

---

## Cross-references
- [remote-troubleshooting.md](remote-troubleshooting.md) — parent module; system tools, WoL, remote shutdown, and chat are part of the remote-control/troubleshooting toolset.
- [software-deployment.md](software-deployment.md) — deployment policies use Wake-on-LAN to boot machines before patch/software rollout.
- [configuration-management.md](configuration-management.md) — power schemes and related configurations complement scheduled shutdown/WoL.

## Sources
- Windows System Tools — https://www.manageengine.com/products/desktop-central/windows-system-tools.html
- Disk Defragmenter — https://www.manageengine.com/products/desktop-central/disk-defragmenter.html
- Chat Tool — https://www.manageengine.com/products/desktop-central/chat-tool.html
- Windows System Tools (help) — https://www.manageengine.com/products/desktop-central/help/windows_system_tools/windows_system_tools.html

*Items marked "(inferred)" are reasoned conclusions not stated verbatim on the cited pages.*
