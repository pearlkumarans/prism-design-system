# EC-06 : OS Imaging & Deployment — Deep Dive (UI Reference)

> **Source**: ManageEngine Endpoint Central Help — `/products/desktop-central/help/os-deployment/*`, OS Deployer product docs `/products/os-deployer/help/*`, plus feature pages
> **Scope**: Online imaging, Offline imaging (WinPE), Image Repository, Driver Repository, PE Media Creation (USB/PXE/ISO), Hardware Independent Deployment (HID), Deployment Templates, Post-deployment Activities, Adding Applications, User Profile Backup & Migration, Deployment Task, Zero-touch Task, Instant Deployment, Standalone Deployment, Remote Office Deployment, Unicast vs Multicast
> **Purpose**: Single source of truth for UI design of the OS Imaging & Deployment add-on (screens, workflows, image lifecycle, repository management, deployment methods)

---

## 1. Module Overview

### 1.1 What this module is

**OS Imaging & Deployment** is Endpoint Central's bare-metal-to-managed pipeline. Where Software Deployment installs apps onto an existing OS, this module **installs the OS itself** — captures a "golden image" from a reference machine, stores it in a repository, customizes it via a Deployment Template (domain join, apps, user accounts, computer naming pattern), and deploys it to target machines via WinPE bootable media.

> **Important**: This module is the same product surface as the standalone **ManageEngine OS Deployer** — but exposed inside Endpoint Central as the **OS Deployment tab**. Help docs reference both URL paths interchangeably.

Mental model:

```
                   ┌─────────────────────────────────────────────────────┐
REFERENCE MACHINE  │                                                       │
(set up with OS    │   IMAGE                IMAGE              DEPLOYMENT    │  TARGET
 + apps + config)──┼──CAPTURE──▶ REPOSITORY──TEMPLATE──▶ via WinPE Media──▶  │  MACHINES
                   │   │                       (customize)                     │  (bare metal
                   │   ├── Online (from host OS while running)                  │   or wipe-redeploy)
                   │   └── Offline (boot to WinPE)                              │
                   │                                                            │
                   │   DRIVER REPOSITORY ──▶ HARDWARE INDEPENDENT DEPLOYMENT ──┘
                   │   (auto-injects per-target drivers)
                   └─────────────────────────────────────────────────────
```

The core problem this solves: **deploying the same OS to 100 machines with different hardware** — without maintaining 100 different images. Solution: capture one base image + maintain a Driver Repository → Hardware Independent Deployment (HID) injects right drivers per target.

### 1.2 Persona
- **Primary**: IT Administrator (image creator + deployment task creator)
- **Secondary**: Help-desk Technician (re-image corrupted machines, new-joiner onboarding)
- **Tertiary**: Field engineer at remote office (boots target machines, monitors deployment)
- **End-user role**: Receives newly-deployed machine — no active interaction with module

### 1.3 Module signature

**Most setup-heavy module in Endpoint Central.** Unlike Patch / Software Deployment which work mostly out-of-the-box, OS Imaging requires:
- A reference machine
- Two repositories (Image + Driver) with R/W credentials
- WinPE bootable media (USB / PXE / ISO)
- DHCP server (for PXE)
- BIOS boot order configuration
- Deployment Template authoring
- Per-target authentication (passcode or MAC)

The dominant UX patterns are:
1. **Multi-step image capture wizards** (compression, memory, repository)
2. **WinPE media creator** (USB / PXE / ISO with driver pre-loading)
3. **Deployment Template builder** (partition + post-deploy + apps)
4. **Three deployment "modes"** that confuse newcomers: Task / Template / Zero-touch / Instant / Standalone

### 1.4 OS coverage

| Capability | Windows | Mac | Linux |
|---|---|---|---|
| **Online imaging** | ✅ (XP+) | ❌ | ❌ |
| **Offline imaging** | ✅ | ❌ | ❌ |
| **Deployment** | ✅ | ❌ | ❌ |
| **User Profile Backup** | ✅ (On-prem only) | ❌ | ❌ |
| **Hardware Independent Deployment** | ✅ | — | — |
| **Multicast** | ✅ (On-prem only) | — | — |

> OS Imaging & Deployment is **Windows-only**. For Mac, separate MDM enrollment patterns apply (EC-CROSS MDM). No Linux equivalent in EC.

### 1.5 Cloud vs On-premises caveats

| | Cloud | On-premises |
|---|---|---|
| Image capture from local office | ❌ (remote office only) | ✅ |
| User Profile Backup | ❌ | ✅ |
| Multicast deployment | ❌ | ✅ |
| Standalone Deployment | ❌ | ✅ (via standalone OS Deployer agent) |
| PXE server | ✅ (one per remote office) | ✅ |
| Zoho account authentication for offline boot | ✅ (cloud-only auth method) | OS Deployer Admin credentials |

> **UI ask**: Edition-aware rendering throughout. Cloud users shouldn't see local-office-imaging UI; on-prem users should see multicast option distinctly.

### 1.6 Supported hardware

- **OS**: All Windows from XP and above
- **Disk styles**: MBR (Master Boot Record) + GPT (GUID Partition Table)
- **Disk types**: HDD, SSHD, SSD
- **VMs**: Hyper-V virtual machines supported
- **Boot modes**: LEGACY BOOT + UEFI BOOT

---

## 2. Concepts & Vocabulary

| Term | Definition | UI treatment |
|---|---|---|
| **Reference Machine / Imaging Computer** | The "desired system" set up with the OS + apps you want to clone | Source picker with creds field |
| **Online Imaging** | Capture image while reference machine is running (no reboot needed) | Default method; minimal disruption |
| **Offline Imaging** | Capture image after booting into WinPE | More reliable; needs bootable media |
| **WinPE (Windows Pre-installation Environment)** | Lightweight Windows used to boot target machines for imaging/deployment | Bootable media wraps this |
| **Bootable Media** | USB / PXE / ISO that contains WinPE + ManageEngine OS Deployment components | Created in Bootable Media tab |
| **PXE (Preboot Execution Environment)** | Boots target machines over network via TFTP — no per-machine media | Best for bulk deploy |
| **TFTP (Trivial File Transfer Protocol)** | Protocol PXE uses to transfer boot files | Internal — surfaces in PXE setup |
| **DHCP Server** | Required to host PXE media — assigns IPs + points to PXE server | Pre-requisite |
| **Image Repository** | Network share storing captured images | Must have R/W credentials |
| **Driver Repository** | Network share storing per-hardware drivers | Auto-populated during imaging; manually added too |
| **Disk Partition** | OS reserved, system, OS, data partitions on disk | Multi-select picker; system partitions auto-selected (can't deselect) |
| **Image Compression Rate** | Low / Medium / High — trade speed vs file size | Picker with speed/size hint |
| **Memory Usage Level** | RAM allocated to imaging process | Picker — high = faster, more RAM consumed |
| **Shrink Partition** | Resize partition before imaging to reduce image size | Optional "Shrink partition & start imaging" CTA |
| **Hardware Independent Deployment (HID)** | One base image deploys to multiple hardware configs; drivers auto-injected per target | Headline feature |
| **Deployment Template** | Customized recipe: image + partition layout + post-deploy + apps + user accounts + naming | Reusable across deployments |
| **Deployment Preference** | (a) Completely erase target partitions, OR (b) Add/Overwrite a partition | Radio — drives downstream fields |
| **Target Hard Disk Number** | Which disk on target to deploy to (found via `diskpart` → `list disk`) | Numeric input |
| **Disk Adjustment** | Auto-extend data partitions to use unallocated space | Toggle |
| **Disk Style Format Conversion** | MBR ↔ GPT during deployment | Available when source MBR + OS partitions |
| **Post-Deployment Activities** | Domain join / OU / User accounts / Apps / SID gen / Computer naming / Restart-Shutdown | Builder within Template |
| **Generate New SIDs** | Generate unique Security Identifiers per target (vs. cloning duplicates) | Toggle in Post-Deploy |
| **Computer Specific Settings** | Per-MAC overrides for name, domain, etc. | Per-target customization within Template |
| **User Profile Migration** | Restore user data + settings from backed-up profile onto fresh image | On-prem only; needs User Profile Backup first |
| **Deployment Task** | A specific deployment of a Template to a set of targets with creds + schedule | The deployable unit |
| **Zero-touch Task** | Deploy to online machines that already have OS — auto-boots into WinPE | Target machines online with existing OS |
| **Instant Deployment** | On-the-spot deployment from console without authentication step | Instant trigger |
| **Standalone Deployment** | Deployment outside EC server context via standalone OS Deployer agent | On-prem only |
| **Authentication: Passcode** | 4 or 6-digit code entered on target | Generated per task; visible in task view |
| **Authentication: MAC Address** | Identify target by MAC + IP + subnet → auto-deploy | No human input on target |
| **Unicast Deployment** | Server sends image copy to each target separately | Up to ~5 targets recommended |
| **Multicast Deployment** | Server sends one image copy to all targets simultaneously via IGMP | Many targets, bandwidth-efficient. On-prem only. IPs 239.255.20.20-239.255.20.29 / port 20001 |
| **IGMP (Internet Group Management Protocol)** | Required for multicast — routers/switches must support it | Pre-req for multicast |
| **Deployment Waiting Time** | Server waits N seconds for target to connect after Deploy Now | Set per task |
| **Remote Office Bootable Media** | Bootable media scoped to a specific remote office | Required for remote office imaging |

### 2.1 Critical concept: Online vs Offline Imaging

This is the first major decision in the module.

| | **Online Imaging** | **Offline Imaging** |
|---|---|---|
| When | Reference machine is **running** | Reference machine is **booted into WinPE** |
| Reboot needed? | No | Yes — boot via PXE/USB/ISO |
| Components | Image creator installed silently via Admin$ | Comes bundled with bootable media |
| Best for | Routine image capture without disruption | Locked / corrupted / off-the-shelf reference |
| Privileges needed | Admin$ + admin user + remote access | OS Deployer Admin creds OR Zoho account |
| Cloud edition | Remote office only (not local) | Same |
| Driver collection | Auto into Driver Repository | Per-machine collection on first boot |

> **UI ask**: At the top of the Image creation flow, show a clear chooser: *"How do you want to capture? Online (machine stays running) vs Offline (boot from WinPE media)"* with one-line guidance per option.

### 2.2 Critical concept: Deployment modes — 5 ways to deploy

This is where newcomers get confused. EC has FIVE deployment "flavors":

| Mode | Path | When to use |
|---|---|---|
| **Deployment Task** | OS Deployment > Deploy > Add Deployment Task | Standard — authenticate target via passcode or MAC; bulk-deploy |
| **Deployment via Template** | OS Deployment > Customize > Deployment Template > Deploy | When you have a pre-built Template and want one-step deploy |
| **Zero-touch Task** | OS Deployment > Deploy > Add Zero-touch Task | Targets already online with OS — auto-reboot into WinPE → deploy |
| **Instant Deployment** | OS Deployment > Deploy > Instant Task | Single ad-hoc deploy without setup |
| **Standalone Deployment** | OS Deployer standalone agent (separate URL) | On-prem only; deploy outside EC server |

> **UI ask**: Add a "Which deployment method should I use?" decision tree in the Deploy tab landing page. Filter the picker by: target state (online/offline), target count, and trust level (passcode vs MAC).

---

## 3. Navigation & IA — OS Deployment Tab

### 3.1 Top-level OS Deployment tab

```
OS DEPLOYMENT (tab)
├── Dashboard (KPIs: total images, recent deployments, repository usage)
│
├── Images                              ← Image lifecycle
│   ├── Online Imaging
│   │   └── Create Image
│   ├── Offline Imaging
│   │   └── (instructions; image creation happens in WinPE)
│   ├── User Profile Backup            (On-premises only)
│   └── Images list (browse, modify, delete captured images)
│
├── Customize                           ← Build deploy recipe
│   ├── Deployment Template
│   │   ├── Create Deployment Template
│   │   ├── Modify / Clone / Delete
│   │   └── Computer Specific Settings (per-MAC overrides)
│   └── Applications (post-deploy app library)
│
├── Deploy                              ← Push to targets
│   ├── Bootable Media
│   │   ├── Create Bootable Media (USB / PXE / ISO)
│   │   └── Media list + Download / Publish PXE
│   ├── Deployment Task                 (standard auth-based)
│   ├── Zero-touch Task                 (online machines)
│   ├── Instant Task                    (single ad-hoc)
│   └── Deployment Status               (per-target progress)
│
├── Settings                            ← Configuration
│   ├── Image Repository
│   ├── Driver Repository
│   ├── User Profile Migration Settings
│   ├── Remote Office Deployment Settings
│   ├── OS Deployment Settings (general)
│   └── User Administration / Roles (OS Deployer role)
│
└── Reports
    ├── Image Reports
    ├── Deployment Status Reports
    └── Audit / Action Log
```

### 3.2 Cross-module entry points

- **Inventory → Bare Metal computer** can route to "Deploy OS via this Template"
- **Software Deployment** packages can be referenced from Add Applications in Deployment Template
- **Remote Office Management** drives the Remote Office picker throughout
- **Admin → Tools Settings → OS Deployment Settings** for ports + general config
- **Wake-on-LAN (EC-05)** chains with Zero-touch Task to wake before deploy

---

## 4. Sub-Features — Deep Dive

### 4.1 Online Imaging

Path: `OS Deployment > Images > Online Imaging > Create Image`

#### 4.1.1 Prerequisites

The reference (desired) system needs:
- **Admin$** privileges (share accessible)
- **System user with administrator privileges** (for installer execution)
- **Remote access** privileges (RPC + network reachable)

Components note: EC silently installs "Image creator components" on the reference machine to perform imaging.

#### 4.1.2 Workflow

```
OS Deployment > Images > Online Imaging > Create Image
        │
        ▼
1. Select Office where reference machine is
   ├── Local Office     (on-premise only)
   └── Remote Office    (both cloud + on-prem)
        │
        ▼
2. Specify reference machine details
   ├── Computer Name / IP
   ├── Admin credentials (Admin$ + remote access)
   └── (EC installs image creator components silently)
        │
        ▼
3. Select Disk Partitions
   ├── ALL available disk partitions shown
   ├── System / Firmware / OS reserved / OS partitions: AUTO-SELECTED (cannot deselect)
   ├── Data partitions: admin chooses
   └── ⚠️ Disk partition layout WILL BE REPLICATED on target during deployment
        │
        ▼
4. Image Compression Rate
   ◯ Low      → Faster imaging, larger file
   ◯ Medium   → Moderate
   ◯ High     → Slower imaging, smaller file
        │
        ▼
5. Memory Usage Level
   (How much RAM imaging consumes — higher = faster but more memory pressure)
        │
        ▼
6. Image Repository
   ├── Select existing repo OR
   └── Create new (Network Share with R+W credentials)
        │
        ▼
7. Click: [Start Imaging] OR [Shrink partition & start imaging]
   (Shrink reduces partition before imaging → smaller image)
        │
        ▼
8. Driver Repository check
   ├── If none exists: prompt to create (Network Share with R+W creds)
   └── Drivers auto-collected during imaging → stored in Driver Repo
        │
        ▼
Imaging starts on reference machine
   ├── [Pause] [Stop] [Re-image] available during imaging
   ├── Reference machine must STAY ONLINE throughout
   └── ⚠️ Don't shut down / restart reference during imaging
        │
        ▼
Imaging complete → image stored in Image Repository
```

> **UI ask**: System/firmware/OS-reserved partitions should show as **locked-on** checkboxes with explanation: *"These are required to boot after deployment — cannot be deselected."* Don't make admins guess.

#### 4.1.3 Image creation controls

During imaging, real-time controls:
- **Pause** — Temporarily halt; resume later
- **Stop** — Cancel imaging; partial image discarded
- **Re-image** — Restart from beginning (e.g. if something changed on reference)

Status indicator: progress bar with % complete + ETA + current partition being imaged.

#### 4.1.4 Key Points (from docs)
- Imaging supported on **Windows XP and above**
- **MBR** and **GPT** disk styles supported
- **HDD, SSHD, SSD** disk types supported
- **Hyper-V** VMs supported

---

### 4.2 Offline Imaging

Path: `OS Deployment > Images > Offline Imaging`

#### 4.2.1 When to use
- Reference machine can't run online imaging (locked, corrupted OS)
- Capturing an off-the-shelf OEM image before any customization
- More reliable image (no open files / running services)

#### 4.2.2 Workflow

```
1. Create bootable WinPE media (USB / PXE / ISO) — see 4.4
        │
        ▼
2. Boot reference machine using bootable media
   ├── Open BIOS boot order
   ├── Select USB / PXE / CD-DVD per media type
   └── ⚠️ For remote office: use REMOTE OFFICE bootable media
        │
        ▼
3. OS Deployment console opens in WinPE environment
        │
        ▼
4. Authenticate:
   ├── On-prem: OS Deployer Admin credentials
   └── Cloud:   Zoho account verification
        │
        ▼
5. Select [Create Image]
        │
        ▼
6. All disk partitions in reference computer displayed
        │
        ▼
7. Select partitions to image
        │
        ▼
8. Select Image Repository (must be pre-configured in product console)
        │
        ▼
9. Specify image name
        │
        ▼
10. Select Memory Usage Level
    (All RAM available since machine is in WinPE)
        │
        ▼
11. Click [Start Imaging]
```

> **UI ask**: For offline imaging, the UI is inside the WinPE-booted console (limited resolution, no browser). Design for **WinPE-constrained UI**: keyboard-friendly, no fancy animations, large fonts, simple form layout.

---

### 4.3 Image Repository & Driver Repository

Path: `OS Deployment > Settings > Image Repository / Driver Repository`

#### 4.3.1 Both follow the same pattern

| | Image Repository | Driver Repository |
|---|---|---|
| Purpose | Store captured OS images | Store per-hardware drivers for HID |
| Type | Network share | Network share |
| Required permissions | **Read + Write** credentials | **Read + Write** credentials |
| Populated by | Image capture flows | Auto during imaging + manual driver uploads |
| Used by | Deployment Task / Template / Zero-touch | Hardware Independent Deployment + bootable media creation |
| Disk space | Large — multiple images × GB each | Smaller, but grows with hardware diversity |
| Remote office | Per-remote-office repository recommended | Per-remote-office recommended |

#### 4.3.2 Driver Repository — used in two contexts

1. **During imaging**: drivers auto-collected from reference machine → stored
2. **During bootable media creation**: pick relevant drivers to bake into the media (so target machine can recognize network/storage drivers in WinPE)

#### 4.3.3 Configuration

```
OS Deployment > Settings > [Image OR Driver] Repository
        │
        ▼
Add new repository:
   ├── Repository Name
   ├── UNC Path (\\server\share)
   ├── Username (with R+W permissions)
   ├── Password
   ├── Remote Office (if applicable)
   └── Test & Save
        │
        ▼
Validate connectivity + read+write capability
   ├── ✅ Reachable + writable → Saved
   └── ❌ Cannot reach OR no write perms → Show specific error + fix link
```

> **UI ask**: Free-disk-space gauge per repository. Image growth can sneak up — show alert when <20% free.

---

### 4.4 PE Media Creation — Bootable WinPE

Path: `OS Deployment > Deploy > Create Bootable Media`

#### 4.4.1 Three media types

| Media | Use case | Bulk-friendly? | Pros | Cons |
|---|---|---|---|---|
| **USB** | Small deployments / on-site | ❌ Per-machine | Portable, no infra needed | One USB per machine; manual |
| **PXE** | Bulk fleet, network boot | ✅ Best | No physical media; reuses TFTP | Needs DHCP + IGMP config |
| **ISO** | Virtual machines, CD/DVD | ⚠️ VM-friendly | Easy for VM uploads | Less practical for physical |

#### 4.4.2 Workflow

```
OS Deployment > Deploy > Create Bootable Media
        │
        ▼
1. Select Media Type: ◯ USB  ◯ PXE  ◯ ISO
        │
        ▼
2. Specify Media Name
        │
        ▼
3. Select Remote Office under which media is created
   (Media stored in respective DS for that remote office)
        │
        ▼
4. WinPE tool installation:
   ├── ☑ Install automatically (incremental: ADK first, then media)
   └── ◯ Manual install — specify location after install
        │
        ▼
5. Select Architecture of target computers (x86 / x64)
        │
        ▼
6. Add drivers from repository (optional but recommended)
   ├── ☑ Add drivers from repository → Select network & hard disk drivers
   ├── Search by Hardware ID
   ├── Filter by Share Path / Storage Type / Manufacturer / Model
   └── Select drivers → Save
        │
        ▼
7. Click [Create Bootable Media]
        │
        ▼
8. Per-media-type next steps:
   ├── USB: Download Media Tool → Run OSDMediaDownloadLauncher.exe → Login (Zoho or code)
   │        → Select USB drive → Customize format → Download
   ├── PXE: Click Action → Publish PXE Media (made available in DS)
   └── ISO: Download Media Tool → Run OSDMediaDownloadLauncher.exe → Login
            → Select location → Download → Use to boot VM or mount on CD
```

#### 4.4.3 Booting target computers

| Media | How to boot |
|---|---|
| **USB** | Connect USB → BIOS boot order → select USB drive → choose **LEGACY BOOT** or **UEFI BOOT** matching image's boot mode |
| **PXE** | Configure DHCP to host PXE → BIOS boot order → select **Onboard NIC** → files transfer over TFTP |
| **ISO** | Upload to VM OR mount on CD drive → BIOS boot order → select CD/DVD |

> ⚠️ **Boot mode match is critical** — if the image was created from a UEFI-boot machine, the target must also boot UEFI. Mismatched boot mode = failed deployment. UI should detect image's boot mode and warn admin if target BIOS doesn't match.

#### 4.4.4 Per-remote-office bootable media

- For ISO and USB: click Download under Actions → select remote office → use that media for that office
- For PXE: a **separate PXE server runs per remote office** in its DS computer

> **UI ask**: When creating bootable media for a multi-office deployment, show: *"This media is scoped to [Remote Office X]. For other offices, create separate media."*

---

### 4.5 Hardware Independent Deployment (HID)

Path: `OS Deployment > Images > Hardware Independent Deployment` (concept; configured implicitly via Driver Repository + Deployment Template)

#### 4.5.1 The problem
Without HID, admins maintain separate images per hardware config:
- Dell laptop image
- HP desktop image
- Lenovo ThinkPad image
- ... and so on

This balloons storage + maintenance. New hardware = new image to create + maintain.

#### 4.5.2 How HID solves it

```
1. Capture ONE base image (no hardware-specific drivers locked in)
2. Maintain Driver Repository with drivers for ALL your hardware types
3. Deploy base image to target machine
4. During deployment (in WinPE):
   ├── OS Deployment tool detects target's hardware
   ├── Pulls matching drivers from Driver Repository
   └── Injects them into the deployed image BEFORE first boot
5. Target boots into OS — Windows installs the drivers automatically
6. Machine is fully functional with correct hardware drivers
```

The deployment flow (from docs):
```
1. Target booted into network environment using WinPE media
2. Selected OS image deployed
3. (Before OS boots) → OS Deployment tool in WinPE auto-adds required drivers
4. OS boots → Windows installs the drivers automatically
```

> **UI ask**: On Deployment Task summary screen, show HID readiness: *"Driver coverage: ✅ Network drivers for [Realtek RTL8125] / ✅ Storage drivers for [Intel SATA RAID] / ❌ No drivers for [unknown video adapter] — deployment may need post-install driver hunt."*

#### 4.5.3 Driver coverage gaps
If Driver Repository doesn't have a matching driver for target hardware, post-deployment may need manual driver install. HID surfaces this risk upfront in the Task summary.

---

### 4.6 Deployment Template

Path: `OS Deployment > Customize > Deployment Template > Create Deployment Template`

#### 4.6.1 What it is
A reusable recipe combining:
- A captured image
- Partition layout decisions
- Post-deployment activities
- Application list
- Per-target customization rules (Computer Specific Settings)

Use case examples (from docs):
- Hospital: separate templates for Radiology / Pharmaceutical / Biotechnology departments
- School: separate templates for Science / Arts students

#### 4.6.2 Configuration — full workflow

```
OS Deployment > Customize > Deployment Template > Create Deployment Template
        │
        ▼
1. Template Identity
   ├── Unique Template Name
   └── Description
        │
        ▼
2. Select Image (from Image Repository)
        │
        ▼
3. Deployment Preference (drives downstream)
   ├── ◯ Completely erase target computers' partitions
   └── ◯ Add a new partition / Overwrite existing partition
         ├── Modify Partition Settings (required)
         └── Specify exact partition number to overwrite
        │
        ▼
4. Select Partition(s) to deploy
   ├── From available partitions in captured image
   └── ⚠️ Target disk size MUST be larger than total selected partition size
   ├── If MBR image with OS partitions:
   │     Option for Disk Style Format Conversion (MBR ↔ GPT) appears
        │
        ▼
5. Target Hard Disk / BIOS Number
   ├── Where on target to deploy
   └── Find via: `diskpart` → `list disk` on target
        │
        ▼
6. Disk Adjustment Settings
   ◯ Enable disk adjustment:
       Auto-extend data partitions using unallocated space on target
       Per Deployment Preference:
       • Completely erase: data partitions extended proportionately
       • Add new: data partition extended into unallocated
       • Overwrite: data partition extended on overwritten partition
   ◯ Disable
        │
        ▼
7. Post-Deployment Activities (see 4.7)
   ├── Computer naming pattern
   ├── Domain / OU
   ├── User accounts
   ├── Applications
   ├── Restart / Shutdown
   └── Generate New SIDs
        │
        ▼
8. Computer Specific Settings (optional, per-MAC overrides)
        │
        ▼
9. Save Template
```

> **UI ask**: The deployment preference choice (erase vs add/overwrite) drives 60% of downstream UI. Show a clear radio with consequence preview: *"Erase = clean install, all target data gone. Add/Overwrite = keep some partitions, deploy to specific slot."*

#### 4.6.3 Template lifecycle

| Action | Effect |
|---|---|
| Modify | Edit template; existing tasks referencing it use updated version on next deploy |
| Clone | Duplicate as new template (e.g. for variant department) |
| Delete | Remove template; blocked if used in active tasks |

---

### 4.7 Post-Deployment Activities

Path: Inside Deployment Template wizard → Post Deployment Activities section

> Where Software Deployment had Pre + Post activities, OS Imaging has only Post (deployment is destructive — nothing makes sense Pre).

#### 4.7.1 Activities catalog

##### 4.7.1.1 Computer Action After Deployment
- ◯ Restart (use machine immediately)
- ◯ Shutdown (for later use)

##### 4.7.1.2 Generate New SIDs

> When you image a computer, the Security Identifiers (SID) of the imaged computer get duplicated on all targets. Duplicated SIDs can break domain functionality.

```
☑ Generate New SIDs
   ├── Achieved WITHOUT Sysprep (EC's built-in capability)
   └── Each target gets unique SID
☐ Retain existing SID (rare; only if specifically needed)
```

> **UI ask**: Default to ON for Generate New SIDs. Show inline explanation: *"Without this, all your target machines will have the same Windows SID, which breaks Active Directory and domain functionality. Recommended: ON."*

##### 4.7.1.3 Computer Naming Patterns

Three naming methods:
1. **Fixed name**: `WIN-COMPUTER` → all targets named "WIN-COMPUTER" (rare; only useful for one target)
2. **Sequential pattern**: `WINPC-{1}` → "WINPC-1", "WINPC-2", "WINPC-3", ...
3. **Prefix-based with hardware attributes**: e.g. `WINPC-{SERIAL}` → "WINPC-XYZ1234ABC"

Special option: **"Specify computer name during deployment"** — admin types name on target after deploy completes.

> ⚠️ **Wait time behavior**: After deployment, if computer name isn't specified, a 10-minute wait timer starts. If no input → default to name in Computer Specific Settings → if not set → keep name from image.

##### 4.7.1.4 Domain / OU
- Add computer under specific domain
- Add computer under specific Organisational Unit (OU) inside that domain
- Both happen automatically after successful deployment

##### 4.7.1.5 User Accounts
Create user accounts on target during post-deployment:
- Useful for new-employee handover
- Specify username, password, full name, admin/standard, etc.

##### 4.7.1.6 Applications
Install applications, drivers, executables, scripts after deployment — see 4.8 below.

##### 4.7.1.7 User Profile Migration (On-prem only)
Restore user data + settings from previously-backed-up profile:
- Select required backup under "User Profile migration settings" in template
- OR via Computer Specific Settings — add backup per MAC address
- Default password assignment (expires after first login)
- Domain of target system retained from User Account chosen
- Apps whose data is in backup should be added to template under post-deploy

#### 4.7.2 Computer Specific Settings (per-MAC overrides)

Path: Inside Template → Customize tab → Computer Specific Settings

```
For each MAC address:
   ├── Computer Name (override pattern)
   ├── Domain
   ├── User Account / User Profile backup association
   └── Any unique parameter per machine
```

> **UI ask**: Bulk CSV import for Computer Specific Settings — admin uploads spreadsheet with MAC, Name, Domain, OU, User per row.

---

### 4.8 Adding Applications

Path: Inside Deployment Template → Add Applications

#### 4.8.1 Supported application types
- **EXE** (executable installers)
- **MSI** (Windows installer)
- **BAT** (batch scripts)
- **PowerShell** scripts (`.ps1`)
- **VBS** scripts (`.vbs`)

#### 4.8.2 Workflow

```
Inside Template > Add Applications
        │
        ▼
For each app:
   ├── Application Name (label)
   ├── Upload installer file (EXE / MSI / BAT / PS1 / VBS)
   ├── Specify Execution / Installation Command (with silent switches)
   │     Examples:
   │     EXE silent: installer.exe /S /v"/qn"
   │     MSI silent: msiexec /i installer.msi /qn
   │     PS1: powershell.exe -executionpolicy unrestricted -file config_user.ps1
   │     VBS: cscript script.vbs /quiet
   └── Save
        │
        ▼
Sequence/order apps (drag-drop)
        │
        ▼
On target — after OS deployment + first boot:
   Apps execute in sequence using configured commands
```

> **UI ask**: Provide silent install command examples per file type in a tooltip — admins always forget the `/S` or `/qn` flags.

#### 4.8.3 Cross-link to Software Deployment
For complex apps with pre/post activities, easier to use **Software Deployment** module after deployment instead of bundling into the image template. This module is for "baseline" apps that should be on EVERY deployment of this template.

---

### 4.9 User Profile Backup (On-premises only)

Path: `OS Deployment > Images > User Profile Backup`

#### 4.9.1 Purpose
Capture a user's profile (data + settings + per-app data) before re-imaging, so the new image can restore the profile.

Common use case: **Hardware refresh** — same user, new machine, retain all their stuff.

#### 4.9.2 Workflow (overview)

```
1. Source: Select machine + user account
2. Specify what to back up:
   ├── User profile folder (Documents, Desktop, Downloads, etc.)
   ├── Application data (per-app folders in AppData)
   └── Settings + preferences
3. Choose storage location (similar to Image Repository)
4. Capture backup
        │
        ▼
Later, during deployment via Template:
   Reference this backup under User Profile Migration Settings
   → Restored automatically post-deploy
```

#### 4.9.3 Migration password behavior
- A **default password** assigned to all restored accounts
- **Expires after first login** — user must reset on first sign-in
- Edit default password: `Admin > OS Deployment Settings > User Profile Migration Settings`

> **UI ask**: User Profile Backup is on-prem only. Hide for cloud edition with clear "Not available on Cloud" message.

---

### 4.10 Deployment Task (standard mode)

Path: `OS Deployment > Deploy > Add Deployment Task`

#### 4.10.1 Workflow

```
OS Deployment > Deploy > Add Deployment Task
        │
        ▼
1. Task Name
        │
        ▼
2. Select Deployment Template (from Customize section)
        │
        ▼
3. Select Bootable Media (PXE / USB / ISO)
        │
        ▼
4. Authentication / Target Selection
   ├── By generating passcode:
   │     ├── 4-digit OR 6-digit unique code
   │     ├── Enter code on target after booting WinPE
   │     ├── Target must connect to Central Server
   │     └── View passcode in deployment tasks view
   │
   └── By MAC Address (no human input needed):
         ├── Specify computer's MAC address
         ├── IP address
         ├── Subnet mask
         └── Server wakes target up + initiates deploy automatically
        │
        ▼
5. Deployment Method
   ├── ◯ Multicast      (on-prem only, IGMP required, >5 targets)
   │     IGMP must be enabled on routers/switches
   │     OS deployment server uses IP 239.255.20.20 - 239.255.20.29 + port 20001
   │
   └── ◯ Unicast        (1:1 server-to-target, recommended up to 5 targets)
        │
        ▼
6. Deployment Waiting Time
   ├── Time interval server waits for targets to connect after Deploy Now
   ├── If Schedule Deployment enabled → wait time starts at scheduled time
   └── ⚠️ Passcode must be entered within this window
        │
        ▼
7. Schedule Deployment (optional)
   ├── Defer to specific date/time
   └── Useful for off-hours mass deploy
        │
        ▼
[Deploy Now] OR [Save as Draft]
        │
        ▼
Task created → Boot computer using media → Deployment initiates → Status viewable in Deployment Status tab
```

#### 4.10.2 Passcode vs MAC — which to use?

| | Passcode (4/6 digit) | MAC Address |
|---|---|---|
| Human involvement | Yes — must type code on target | No — auto-deploys |
| Setup effort | Low — just generate + share with on-site engineer | Higher — need MAC + IP + subnet upfront |
| Use case | Small batch with on-site help | Large batch, hands-off |
| Wake on LAN compatible | Need WoL beforehand | WoL chained into deploy |

> **UI ask**: Surface a "method picker" with use-case hints at top of authentication step.

#### 4.10.3 Multicast prerequisites
- IGMP enabled on routers + switches (network team config)
- IP range `239.255.20.20-29` and port `20001` not used elsewhere
- All targets in same multicast group

> **UI ask**: Pre-flight checklist before allowing Multicast selection: ✅ IGMP detected on network / ✅ Multicast IPs not in use / ✅ All targets in same VLAN.

---

### 4.11 Zero-touch Task

Path: `OS Deployment > Deploy > Add Zero-touch Task`

#### 4.11.1 When to use
Target machines are **already online with an existing OS** — admin wants to refresh/re-image them without manually booting each into WinPE.

EC orchestrates: trigger remote reboot → boot into WinPE → deploy → restart into new OS.

#### 4.11.2 Prerequisites
- Image of required machine created
- Image customized via Deployment Template
- **Bootable media with necessary drivers** (used to boot targets before deployment)
- **Target machines online with existing OS** (this is the differentiator)

#### 4.11.3 Workflow

```
1. Deployment Template (select pre-built)
2. Bootable Media (PXE/USB/ISO)
3. Target Computers
   ├── Select remote office
   ├── Add target computers from inventory
   └── OR manually add via CSV file
4. Deployment Settings
   └── Unicast (Multicast is NOT mentioned for Zero-touch — typically Unicast)
5. Schedule Deployment (optional)
6. [Deploy Now]
```

> **UI ask**: For Zero-touch, the "no manual intervention needed" promise must be highlighted. Show before/after illustration: "User leaves laptop on desk at 6 PM → next morning, fresh OS deployed."

---

### 4.12 Instant Deployment / Instant Task

Path: `OS Deployment > Deploy > Instant Task`

#### 4.12.1 What it is
Single ad-hoc deployment without authentication setup. Quick for:
- Tech is in front of target machine
- Want to deploy immediately without creating reusable task

The exact UX is condensed: pick image (or template) → boot target → deploy.

#### 4.12.2 Cross-comparison

| Mode | Pre-setup needed | Best for |
|---|---|---|
| Deployment Task | Auth (passcode/MAC) + schedule | Standard bulk |
| Zero-touch Task | Targets online with OS | Bulk refresh |
| Instant Task | Minimal | Tech with hands-on access, single target |
| Standalone | Standalone agent (separate) | Off-EC deployment |

---

### 4.13 Standalone Deployment (On-prem only)

Path: separate standalone OS Deployer agent — not in main EC console

#### 4.13.1 Purpose
Deploy without EC server context — useful when:
- EC server isn't reachable
- Single-site, no full EC infrastructure
- Customer wants OS Deployer-only feature

#### 4.13.2 Notes for UI
This is mainly a separate installer + workflow — the EC console only references it. UI doesn't need to deeply model this; just link out + explain when it applies.

---

### 4.14 Remote Office Deployment

Path: `OS Deployment > Deploy > Remote Office Deployment Settings`

#### 4.14.1 Key constraints
- Imaging from remote office needs remote-office-scoped bootable media
- Repositories should be accessible from the chosen remote office (or per-remote-office repos)
- PXE server runs **per-remote-office** (in respective DS computer)

#### 4.14.2 Workflow modifications
For remote office deployments, the standard Deployment Task wizard adds:
- Remote Office picker (mandatory)
- Repository check: ensure selected repo is reachable from that office
- Booting & Deployment configuration scoped to that office

---

## 5. Field-Level Inventory — Records & Settings

### 5.1 Image record

- Image ID
- Image Name
- Source Computer (reference)
- Source Remote Office
- Capture Date / Time
- Captured by (admin)
- Imaging method (Online / Offline)
- Disk partitions captured (list with sizes)
- Total image size (after compression)
- Compression rate (Low / Medium / High)
- Boot mode (Legacy / UEFI)
- Disk style (MBR / GPT)
- OS info (OS version, build, edition)
- Image Repository (FK)
- Driver Repository association (drivers collected from this image)
- Status (Available / Imaging in Progress / Corrupted / Archived)

### 5.2 Deployment Template record

- Template ID / Name / Description
- Source Image (FK)
- Created by / Created date / Last modified
- Deployment Preference (Erase / Add / Overwrite)
- Selected partitions (list)
- Target Hard Disk Number
- Disk Adjustment (bool)
- Disk Style Format Conversion (if MBR + OS partitions)
- Post-Deployment Activities:
  - Computer action (Restart / Shutdown)
  - Generate New SIDs (bool)
  - Computer naming pattern (Fixed / Sequential / Prefix-based / Specify during deploy)
  - Domain
  - OU
  - User Accounts (list)
  - Applications (list)
  - User Profile Migration backup (FK, on-prem only)
- Computer Specific Settings (list of per-MAC overrides)
- Used-in-Tasks count

### 5.3 Bootable Media record

- Media ID / Name
- Type (USB / PXE / ISO)
- Remote Office (FK)
- WinPE tool install method (auto / manual)
- Architecture (x86 / x64)
- Drivers included (list from Driver Repository)
- Created date / Created by
- Storage location (in DS computer for that remote office)
- For PXE: published status
- For USB/ISO: downloadable link

### 5.4 Deployment Task record

- Task ID / Name
- Template (FK)
- Bootable Media (FK)
- Authentication method (Passcode / MAC)
- Passcode (4 or 6 digit, generated)
- Target list (with MAC + IP + Subnet if MAC method)
- Deployment Method (Unicast / Multicast)
- Deployment Waiting Time (seconds)
- Schedule (optional date/time)
- Status (Created / Scheduled / In Progress / Completed / Failed / Partial)
- Per-target status (Yet to Start / Booting / Deploying / Installing Drivers / Post-Deploy / Success / Failed)

### 5.5 Repository record

| | Image Repository | Driver Repository |
|---|---|---|
| Repo ID | ✓ | ✓ |
| Name | ✓ | ✓ |
| UNC path | ✓ | ✓ |
| Username (R+W) | ✓ | ✓ |
| Password | ✓ (encrypted) | ✓ (encrypted) |
| Remote Office | ✓ | ✓ |
| Free disk space | ✓ | ✓ |
| Used disk space | ✓ | ✓ |
| Images stored | ✓ | — |
| Drivers stored | — | ✓ |
| Last validated | ✓ | ✓ |

### 5.6 User Profile Backup record (on-prem only)

- Backup ID
- Source machine
- User account
- Profile components backed up (folders + AppData)
- Apps with data in backup (list — for cross-reference with template apps)
- Storage location
- Backup size
- Capture date

---

## 6. Workflows — Common admin journeys

### W1. Capture image from a freshly built reference machine
```
1. Build reference machine: install Win 11 + Office + Chrome + corporate apps + AD-join + standard policies
2. OS Deployment > Settings > Image Repository → ensure repo configured with R+W creds
3. OS Deployment > Settings > Driver Repository → ensure repo configured
4. OS Deployment > Images > Online Imaging > Create Image
5. Local Office → reference machine creds
6. Disk Partitions: system + OS auto-selected; admin adds Data partition
7. Compression: High (save storage; not in a hurry)
8. Memory Usage: Medium
9. Image Repository: Selected
10. Click "Shrink partition & start imaging" (reduce image size)
11. Driver Repository auto-collects drivers as imaging runs
12. Imaging completes → "Win11-Standard-2026Q1" in Image Repo
13. Cross-link: build Deployment Template next (W2)
```

### W2. Build a deployment template for new joiners
```
1. OS Deployment > Customize > Deployment Template > Create Deployment Template
2. Name: "Standard New-Joiner Template"
3. Select image: "Win11-Standard-2026Q1"
4. Preference: Completely erase target's partitions
5. Partitions to deploy: All OS partitions + Data partition
6. Target Disk: 0
7. Disk Adjustment: enabled
8. Post-Deployment Activities:
     - Computer action: Restart
     - Generate New SIDs: ON (default)
     - Computer naming: Sequential "EMP-{1}" → EMP-1, EMP-2, ...
     - Domain: "corp.local"
     - OU: "OU=Employees,DC=corp,DC=local"
     - User Account: create default "newuser" with temp password
     - Apps: add Adobe Reader, Zoom, custom internal app (3 EXEs)
9. Save Template
```

### W3. Set up PXE deployment for 30 new laptops
```
1. OS Deployment > Deploy > Create Bootable Media
2. Type: PXE
3. Name: "PXE-Office1-2026Q1"
4. Remote Office: HQ
5. Install WinPE tool: Automatic (incremental)
6. Architecture: x64
7. Add drivers from repository: select Dell, Lenovo network + storage drivers
8. Create Bootable Media
9. Click Action → Publish PXE media (now hosted on HQ Distribution Server)
10. Configure DHCP server to point to PXE server
11. Boot one laptop at a time → BIOS boot order → Onboard NIC → connects to PXE
12. Create Deployment Task referencing this PXE media
13. Authentication: by MAC (gather from new laptops sticker)
14. Method: Multicast (>5 targets, IGMP-ready network)
15. Deploy → watch Deployment Status tab as 30 laptops image simultaneously
```

### W4. Re-image a corrupted laptop (single-target via passcode)
```
1. User reports: "My laptop is unbootable"
2. Tech: OS Deployment > Deploy > Add Deployment Task
3. Template: Standard Template
4. Media: USB
5. Authentication: Passcode (4-digit, generated)
6. Method: Unicast
7. Schedule: Deploy Now
8. Tech goes to user's desk with USB
9. Boots laptop from USB → WinPE loads → enters 4-digit passcode
10. Laptop connects to EC server → image deploys → drivers injected → restart
11. New OS boots → joins corp.local → Adobe / Zoom / custom apps installed
12. Tech logs Computer Specific Setting: original computer name retained
13. Reports back: "Re-imaged successfully"
```

### W5. Hardware refresh — migrate user profile to new laptop
```
1. User's old laptop: capture User Profile Backup (on-prem)
2. OS Deployment > Images > User Profile Backup > Create
3. Source: old laptop + user account
4. Select: full profile + app data for Outlook, Chrome, Slack
5. Storage: profile repo
6. Backup captured → "JohnDoe-2026-01-15"
7. New laptop arrives
8. Deployment Template: reference JohnDoe-2026-01-15 under User Profile Migration
9. Customize: under Computer Specific Settings, map new laptop's MAC to John's backup
10. Deploy via passcode or zero-touch
11. New laptop deploys OS + John's profile + apps + data
12. John logs in with temp password → forced reset → all his data is there
```

### W6. Zero-touch deploy 50 office PCs overnight
```
1. PCs are online, currently running Win 10 — need refresh to Win 11
2. OS Deployment > Deploy > Add Zero-touch Task
3. Template: "Win11-Standard-2026Q1"
4. Media: PXE-Office1-2026Q1
5. Targets: import 50 PCs from inventory CSV
6. Schedule: 10 PM (off-hours)
7. Save
8. At 10 PM: EC remotely reboots 50 PCs → boots into PXE → deploys → restarts
9. Morning: 50 fresh Win 11 PCs with all apps + domain-joined
10. Deployment Status report shows: 48 success / 2 failed (driver issues)
11. Manual investigation on 2 failures
```

### W7. Department-specific templates for hospital
```
1. Base image: Win 11 + standard EMR client
2. Create Deployment Template "Radiology":
     - Same base image
     - Apps: + DICOM viewer + RADIOLOGY-specific tools
     - Computer naming: "RAD-{1}"
     - OU: OU=Radiology,DC=hospital,DC=corp
3. Create "Pharmacy":
     - Same base image
     - Apps: + Pharmacy management software
     - Naming: "PHARM-{1}"
     - OU: OU=Pharmacy,...
4. Create "Biotechnology":
     - Lab software, electron microscope tools
     - Naming: "BIO-{1}"
     - OU: OU=BioTech,...
5. Hospital admin maintains 1 base image + 3 templates instead of 3 separate images
```

### W8. Bulk migrate from MBR to GPT during deployment
```
1. Old images captured from BIOS/MBR machines
2. New target machines are UEFI/GPT capable
3. Create Deployment Template:
     - Source: MBR image
     - Enable Disk Style Format Conversion (MBR → GPT)
     - Target Disk: 0
4. Deploy → image converts to GPT during deployment
5. Targets boot in UEFI mode with GPT layout
```

### W9. Driver coverage gap diagnosis
```
1. Deployed image to new HP laptop model → boots but no Wi-Fi
2. Investigation:
     - OS Deployment > Settings > Driver Repository → search "HP ProBook 470 G10"
     - Result: no matching wireless driver
3. Manually download HP wireless driver from vendor
4. Upload to Driver Repository with Hardware ID metadata
5. Recreate bootable media (Add drivers from repository → select new driver)
6. Future deployments to this HP model auto-inject the wireless driver
```

---

## 7. Error States & Troubleshooting

### 7.1 Image creation errors

| Error | Cause | Remediation |
|---|---|---|
| "Cannot connect to reference machine" | Network / firewall / Admin$ disabled | Verify Admin$ enabled; firewall allows EC server; admin creds correct |
| "Image creator component install failed" | Permission / antivirus blocks | Whitelist EC components; check admin priv |
| "Insufficient disk space in Image Repository" | Repo full | Free space OR change repo |
| "Imaging interrupted — reference machine offline" | Reference disconnected / shut down mid-imaging | Restart imaging from beginning |
| "Driver Repository inaccessible" | Network / creds issue | Verify R+W creds + reachability |
| "Compression failed" | Codec issue / corrupted | Try lower compression; verify disk health |

### 7.2 Bootable media errors

| Error | Cause | Remediation |
|---|---|---|
| "WinPE tool install failed" | ADK download or install failure | Manual install; check internet to MS download |
| "USB drive not detected" | Tool can't see USB | Replug; format USB first; try different tool version |
| "PXE boot fails — TFTP timeout" | DHCP misconfigured | Verify DHCP options 66 (TFTP server) + 67 (boot file) |
| "ISO won't boot VM" | VM boot order or VM hypervisor compatibility | Set CD/DVD first in boot order; check VM type matches ISO architecture |
| "Driver not loading in WinPE" | Driver not added to media OR wrong architecture | Re-create media with correct drivers; match x86/x64 |
| "Architecture mismatch" | Created x86 media for x64 target | Recreate with correct arch |

### 7.3 Deployment errors

| Error | Cause | Remediation |
|---|---|---|
| "Passcode timeout" | Code not entered in deployment waiting time window | Extend wait time OR regenerate task |
| "Target hard disk too small" | Image larger than target disk | Use different target OR shrink image first |
| "Boot mode mismatch" | Image is UEFI but target booted Legacy | Match boot modes — recreate boot config |
| "Driver missing for target hardware" (HID) | Driver Repo doesn't have it | Add driver to repo; recreate media if network driver |
| "SID collision" | Generate New SIDs was OFF | Re-deploy with SID generation ON |
| "Domain join failed" | Wrong domain creds in template / DC unreachable | Verify domain admin creds; check DC connectivity |
| "OU not found" | OU path typo / OU doesn't exist | Verify OU full path; create OU first |
| "Multicast failed" (multiple targets) | IGMP not enabled on switches | Network team enables IGMP; or fall back to Unicast |
| "Target connected late, deployment skipped" | Waiting time too short | Increase deployment waiting time |
| "App install post-deploy failed" | Silent switches wrong / app needs reboot | Verify command syntax; chain reboot after app |

### 7.4 Per-target status diagnostic

For each failed target, render:

```
┌─────────────────────────────────────────────────────────────────┐
│ ❌ Deployment Failed: PC-XYZ (MAC: AA:BB:CC:DD:EE:FF)            │
│                                                                   │
│ Stage failed: Driver Injection                                    │
│ Error: No matching driver for "Intel I225-V Gigabit"             │
│                                                                   │
│ Recommendation:                                                   │
│ 1. Download Intel I225-V driver from Intel website               │
│ 2. Add to Driver Repository                                       │
│ 3. Recreate bootable media including this driver                 │
│ 4. Retry deployment on this target                                │
│                                                                   │
│ [View full WinPE log] [Retry on this target] [Mark as resolved]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Edge Cases & Gotchas

1. **System / Firmware / OS reserved partitions can NOT be deselected during imaging.** They're required for boot. UI must lock these checkboxes with explanation.

2. **Disk partition layout REPLICATES on target.** If reference has 4 partitions, target gets 4 partitions. Target disk must be larger than total source partitions.

3. **Reference machine must STAY ONLINE during imaging.** Don't shut down / restart. UI should periodically remind during long imaging.

4. **MBR vs GPT mismatch breaks deployment.** Source MBR + target UEFI/GPT? Enable Disk Style Format Conversion in template.

5. **Boot mode (Legacy vs UEFI) must match between image and target BIOS.** Detect and warn.

6. **Multicast is on-prem only AND requires IGMP-enabled network.** Don't show option on cloud. Pre-flight check on on-prem.

7. **Multicast uses fixed IPs (239.255.20.20-29) + port 20001.** Conflicts break deployment. UI must check for existing use.

8. **PXE needs DHCP server configured separately.** Don't assume admin has done this. Pre-req checklist.

9. **PXE runs per-remote-office** — each office has its own PXE server in its DS.

10. **Bootable media is also scoped per-remote-office.** Wrong office media = wrong creds / configs.

11. **Cloud edition can't image local-office machines.** Only remote office imaging works. Surface upfront.

12. **User Profile Backup is on-premises only.** Cloud users won't see this.

13. **Standalone Deployment is also on-premises only.** Same.

14. **Generate New SIDs is critical for AD environments.** Default ON. Without it, domain functionality breaks.

15. **Computer naming "Specify during deployment" has a 10-minute wait timer.** If admin doesn't type a name → falls back to Computer Specific Settings → falls back to image's name. Cascade not obvious.

16. **Disk Adjustment behavior varies per Deployment Preference.** Erase = proportional extension; Add = into unallocated; Overwrite = on overwritten. Show preview.

17. **Passcode (4/6 digit) must be entered WITHIN deployment waiting time.** If admin sets 30 sec wait time, on-site engineer has 30 sec to type. Default to generous wait.

18. **MAC-based deployment skips human intervention** — but requires accurate MAC + IP + subnet upfront. Wrong MAC = no deploy.

19. **HID needs Driver Repository populated.** Empty driver repo = no HID benefit; image deploys but drivers may be missing post-boot.

20. **Adding drivers to bootable media is separate from Driver Repository for HID.** Boot media drivers help WinPE recognize target's network/storage; HID drivers help fully-deployed OS recognize all hardware. Two parallel concepts.

21. **Imaging creates components on reference machine** — get cleaned up after but might leave artifacts if interrupted. Admin should check.

22. **Image Repository disk space grows quickly.** Average image: several GB. 10 images = tens of GB. Configure cleanup / retention policy.

23. **Deployment Template referencing deleted image = broken template.** Cascade check on image delete.

24. **Computer Specific Settings (per-MAC) overrides Template defaults.** Order of precedence not obvious.

25. **Apps in template installed AFTER OS boots, sequentially.** Order matters. If App A depends on App B, list B first.

26. **Apps with reboot requirement can disrupt the post-deploy chain.** Add reboot handling in commands OR chain via separate Software Deployment configs.

27. **MSI silent install needs /qn switch.** Common admin mistake to forget. Show examples per app type.

28. **VBS scripts need cscript prefix.** Easy to miss.

29. **PowerShell needs -executionpolicy bypass/unrestricted.** Default policy blocks script execution.

30. **User Profile Migration default password expires on first login.** User must know to reset. Set expectations.

31. **User Profile Backup data location may have apps' user-specific data not just user folder.** Add those apps to template under post-deploy.

32. **For Hyper-V VMs**, imaging supports them but driver requirements differ. Hyper-V Integration Services as driver may be needed.

33. **Disk style conversion (MBR ↔ GPT) only available when source MBR + OS partitions exist.** Greyed-out otherwise.

34. **PXE boot requires target to support PXE.** Some older / consumer hardware doesn't — fall back to USB/ISO.

35. **Zero-touch task targets must be ONLINE with existing OS.** If a target is offline at scheduled time, it's skipped. Schedule WoL beforehand.

36. **Instant Deployment has fewer options** than Deployment Task — admin trades flexibility for speed.

37. **Image Repository credentials need R+W (not just R like Software Deployment's Network Share).** Different from EC-04 pattern.

38. **WinPE tool install is incremental** — ADK first, then media creation. Don't kill the process between steps.

39. **Driver Repository searchable by Hardware ID.** Useful but admins don't know Hardware IDs offhand. Provide a "Detect from inventory" assist.

40. **Sequential computer naming (e.g. WINPC-{1}) increments across deployments.** Restarting at WINPC-1 = collision. Track last-used.

---

## 9. UI Screens Needed (deliverable list)

### 9.1 Image lifecycle (8)
1. OS Deployment Dashboard (KPIs: images, repos, recent deploys, repo space gauge)
2. Images list (browseable, filter by source/date/OS/size)
3. Online Imaging wizard (8-step)
4. Offline Imaging instructions + WinPE console UI (constrained design)
5. Image detail view (partitions, drivers collected, used-in-templates)
6. Image Repository management
7. Driver Repository management (Hardware ID search)
8. User Profile Backup wizard + list (on-prem only)

### 9.2 Customize / Templates (5)
9. Deployment Templates list
10. Create Deployment Template wizard (9-step)
11. Post-Deployment Activities builder (sub-wizard)
12. Add Applications interface (file upload + command builder)
13. Computer Specific Settings (per-MAC table + CSV import)

### 9.3 Bootable Media (4)
14. Bootable Media list
15. Create Bootable Media wizard (USB/PXE/ISO)
16. PXE Publish + DHCP config helper
17. Media Tool launcher (USB downloader UI)

### 9.4 Deployment (7)
18. Deployment Task wizard (authentication + method + waiting time)
19. Zero-touch Task wizard
20. Instant Task condensed wizard
21. Deployment Tasks list (status pills)
22. Deployment Status (per-target progress drill-down)
23. Per-target failure diagnostic panel
24. Standalone Deployment info screen (on-prem only)

### 9.5 Settings & Cross-cutting (6)
25. Image Repository settings
26. Driver Repository settings
27. User Profile Migration Settings (default password, etc.)
28. Remote Office Deployment Settings
29. OS Deployment Settings (ports, paths, general)
30. OS Deployer role + user admin

### 9.6 Reports (3)
31. Image Reports (capture history, sizes, source)
32. Deployment Status Reports (success rate, time-to-deploy, per-template)
33. Audit / Action Log (who deployed what)

---

## 10. Component Library — OS-Deployment-Specific

### 10.1 Image / capture components
- **`ImagingWizard`** — Online + Offline modes
- **`ReferenceMachineCredsField`** — Computer + admin creds + remote office picker
- **`DiskPartitionPicker`** — Multi-select with locked system partitions
- **`CompressionRatePicker`** — Low/Medium/High with speed/size hint
- **`MemoryUsageLevelPicker`** — Slider or 3-option picker with RAM impact
- **`ImageCaptureProgress`** — Live progress bar with Pause/Stop/Re-image controls
- **`ShrinkPartitionToggle`** — "Shrink before imaging" with size preview

### 10.2 Repository components
- **`RepositoryCard`** — Image OR Driver repo with health, free space, used count
- **`RepositoryHealthGauge`** — Visual gauge for free space
- **`NetworkShareCredsField`** — UNC path + R+W creds + test
- **`DriverRepoHardwareIDSearch`** — Search drivers by Hardware ID with auto-detect-from-inventory assist

### 10.3 Bootable media components
- **`BootableMediaTypePicker`** — USB / PXE / ISO with use-case hints
- **`PXEPrerequisiteChecklist`** — DHCP / TFTP / Onboard NIC readiness
- **`DriverInjectionPanel`** — Pick drivers to bake into media from Driver Repo
- **`MediaTypeNextStepsCard`** — Per-type next steps (USB tool / PXE publish / ISO download)
- **`MediaDownloaderToolLauncher`** — UI for OSDMediaDownloadLauncher.exe (downloadable .exe)

### 10.4 Template / customization components
- **`DeploymentTemplateWizard`** — Multi-step builder
- **`DeploymentPreferencePicker`** — Erase / Add / Overwrite radio with consequences
- **`PartitionSelector`** — From image, with size constraint check
- **`DiskStyleConversionToggle`** — MBR ↔ GPT (conditional)
- **`DiskAdjustmentExplainer`** — Visual showing how unallocated space gets used per preference
- **`PostDeploymentActivitiesBuilder`** — All post-deploy options in tabbed/collapsible form
- **`ComputerNamingPatternBuilder`** — Fixed / Sequential / Prefix-based / Specify-during with examples
- **`GenerateNewSIDsToggle`** — Default ON with explanation
- **`DomainOUSelector`** — Active Directory picker
- **`UserAccountsBuilder`** — Add user accounts table
- **`AppsToInstallBuilder`** — Drag-drop ordered list with EXE/MSI/BAT/PS1/VBS support + command examples
- **`ComputerSpecificSettingsTable`** — Per-MAC overrides with CSV import

### 10.5 Deployment components
- **`DeploymentMethodPicker`** — Task / Zero-touch / Instant / Standalone
- **`AuthenticationMethodPicker`** — Passcode vs MAC with comparison
- **`PasscodeGenerator`** — 4 or 6 digit code display + copy
- **`MACAddressInput`** — MAC + IP + Subnet with validation
- **`UnicastMulticastPicker`** — With IGMP pre-flight + edition-aware
- **`DeploymentWaitingTimeField`** — With recommendation tooltip
- **`ScheduleDeploymentPicker`** — Optional scheduler

### 10.6 Status / progress components
- **`DeploymentStatusGrid`** — Per-target with status pills
- **`PerTargetProgressIndicator`** — Stage-by-stage: Booting → Deploying → Driver Injection → Post-Deploy → Success
- **`DriverCoverageReport`** — Pre-deploy preview of driver readiness per target
- **`FailureDiagnosticPanel`** — Specific to deployment errors
- **`RetryDeploymentButton`** — Per-target retry

### 10.7 Edition / compliance
- **`OnPremOnlyFeatureGate`** — User Profile Backup / Standalone / Multicast
- **`CloudOnlyFeatureGate`** — Zoho-based offline auth
- **`HIPAACompliantUserProfileBadge`** — For user data migration
- **`BootModeMismatchWarning`** — Image vs target BIOS conflict

---

## 11. Cross-Module Dependencies

| Module | Relationship |
|---|---|
| **EC-CROSS SoM** | Target computer selection sources Custom Groups, Domains, Remote Offices |
| **EC-04 Software Deployment** | Apps in Deployment Template overlap with Software Deployment packages — for non-baseline apps, use Software Deployment AFTER OS deploy |
| **EC-05 Remote Tools / WoL** | WoL chains with Zero-touch Task (wake before deploy) |
| **EC-05 Remote Tools / Remote Shutdown** | Restart/Shutdown after deployment uses similar Power Action pattern |
| **EC-03 Inventory** | New machines post-deploy enter Inventory; their hardware enriches Driver Repo metadata |
| **EC-CROSS RBAC** | OS Deployer role gates access to this module entirely |
| **EC-CROSS Audit** | All deployment tasks logged in Action Log Viewer |
| **EC-CROSS Helpdesk** | Re-imaging often triggered by SDP tickets |
| **External: Active Directory** | Domain join + OU placement requires AD trust |
| **External: DHCP server** | Required for PXE — separate infrastructure |
| **External: IGMP-enabled network** | Required for Multicast |

> **UI ask**: After OS deployment, Inventory auto-refreshes. Show notification: "X new computers enrolled in Inventory via OS deployment."

---

## 12. Reference URLs

### Help docs — primary
- Module landing: https://www.manageengine.com/products/desktop-central/help/os-imaging-and-deployment.html
- Online Imaging: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/online-imaging.html
- Offline Imaging: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/offline-imaging.html
- User Profile Backup: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/user-profile-backup.html
- PE Media Creation: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/creating-winpe-media.html
- Hardware Independent Deployment: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/hardware-independent-deployment.html
- Creating Deployment Template: https://www.manageengine.com/products/desktop-central/help/os-deployment/customize-deployment/customizing-image-deployment.html
- Configuring Post-Deployment Activities: https://www.manageengine.com/products/desktop-central/help/os-deployment/customize-deployment/configuring-post-deployment-activities.html
- Adding Applications: https://www.manageengine.com/products/desktop-central/help/os-deployment/customize-deployment/adding-applications.html
- Deployment via Task: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-deployment/deploying-os-image.html
- Deployment via Template: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-deployment/offline-deployment.html
- Zero-touch Deployment: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/zero-touch-task.html
- Instant Deployment: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-deployment/instant-task.html
- Standalone Deployment: https://www.manageengine.com/products/os-deployer/help/standalone-deployment.html
- Remote Office Deployment: https://www.manageengine.com/products/desktop-central/help/os-deployment/remote-deployment/associating-deployment-task-remote-office.html
- Remote Office OS Deployment Settings: https://www.manageengine.com/products/desktop-central/help/os-deployment/remote-deployment/remote-office-os-deployment-settings.html

### OS Deployer product docs
- PXE Boot: https://www.manageengine.com/products/os-deployer/pxe-preboot-execution-environment.html
- DHCP Configuration: https://www.manageengine.com/products/desktop-central/os-imaging-deployment/how-to-configure-dhcp-server.html
- How to Shrink Partitions: https://www.manageengine.com/products/os-deployer/help/shrinking-partitions.html
- How to Share a Folder: https://www.manageengine.com/products/os-deployer/help/how-to-share-a-folder.html
- Zero-touch Task How-to: https://www.manageengine.com/products/os-deployer/help/zero-touch-task-how-to.html
- User Profiles in Templates: https://www.manageengine.com/products/os-deployer/help/deployment-template/creating-templates-with-user-profiles.html
- Adding Applications: https://www.manageengine.com/products/os-deployer/help/adding-applications.html
- OS Deployer Role: https://www.manageengine.com/products/os-deployer/help/access-management/user_management.html
- OS Deployer How-Tos: https://www.manageengine.com/products/os-deployer/how-to.html
- Deployment Preference: https://www.manageengine.com/products/os-deployer/help/deployment-template/how-to-select-deployment-preference.html

### Feature pages
- Hardware Independent Deployment: https://www.manageengine.com/products/desktop-central/hardware-independent-deployment.html
- OS Deployer product page: https://www.manageengine.com/products/os-deployer/

---

## 13. Critical UX Tensions

1. **Online vs Offline imaging** — admins don't know which to pick. UI should default to Online with "switch to Offline if your reference can't run live" hint.

2. **Five deployment modes** (Task / Template / Zero-touch / Instant / Standalone) — overwhelming. Provide decision tree on Deploy tab landing.

3. **WinPE / PXE / TFTP / DHCP / IGMP** — heavy networking concepts. Need an explainer mode + readiness checks before each step.

4. **Image Repository vs Driver Repository** — confused often. Different purposes, both Network Share with R+W. Label clearly + show purpose tags.

5. **Per-remote-office repositories + media** — easy to mix up. Tag every repo/media with remote office.

6. **System partitions auto-selected, can't deselect.** Friction when admin tries to "save space" — explain WHY.

7. **Disk style conversion (MBR ↔ GPT)** is only available in specific conditions. Greyed-out states need explanation.

8. **Hardware Independent Deployment** marketing-prominent but quietly fails when Driver Repo is sparse. Show driver-coverage preview before deploy.

9. **Generate New SIDs default = ON** is correct, but the consequence of OFF is severe (domain breakage). Surface the trade-off explicitly when admin disables it.

10. **Computer naming patterns** with sequential `{1}` continue across deployments — admin expects reset. State current counter; offer "Reset numbering".

11. **Cloud vs On-prem edition gaps are large** in this module. Local imaging / User Profile Backup / Standalone / Multicast — all on-prem. Don't show ghost options.

12. **MAC-based deployment requires accurate MAC upfront.** No way to "discover" — admin must collect from stickers / inventory. Friction. Surface "Import MACs from Inventory" assist.

13. **Multicast prerequisites are heavy** — IGMP / network IPs / port. Pre-flight gate.

14. **Passcode deployment waiting time** trap — short wait + slow boot = missed window. Default generous; warn on short values.

15. **Apps in template install sequentially.** Order matters when there are dependencies. Drag-drop ordering essential.

16. **Silent install switch syntax** varies per file type. Tooltip examples crucial.

17. **Boot mode (Legacy/UEFI) mismatch** breaks silently. Detect + warn proactively.

18. **Disk size constraint** — target must be larger than source total. Easy to miss; pre-deploy check needed.

19. **Reference machine must stay online during imaging** — easy to forget, especially overnight imaging. Periodic UI reminder + email alert option.

20. **User Profile Migration default password expires on first login** — communicate this clearly to end-user receiving the deployed machine.

21. **Zero-touch Task targets must be online** — schedule WoL beforehand if some may be off.

22. **Standalone Deployment is a totally separate product surface** — link to it carefully, don't conflate.

23. **PXE per-remote-office** — admins try to use HQ PXE for branch office. Explicit error needed.

24. **Driver Repository populated during imaging is automatic — but only collects drivers FROM that machine.** New hardware = need manual driver upload. Educate.

25. **Computer Specific Settings overrides Template defaults** — precedence not obvious. Show "effective config preview" per-target.

---

## 14. Status Lifecycle Summary

### Image
```
Capture Triggered → Image Creator Installed → Imaging In Progress
        │                                            │
        ├── (Pause) → Resume → continues             │
        ├── (Stop)  → Discarded                      │
        └── (Re-image) → Restarts                    │
                                                     ▼
                                            Imaging Complete
                                                     │
                                                     ▼
                                     Stored in Image Repository (Available)
                                                     │
                                                     ├── Used in Templates (count++)
                                                     ├── Modified (re-image)
                                                     └── Deleted (blocked if used)
```

### Deployment Task
```
Created → (Authentication method set)
        │
        ▼
Scheduled / Deploy Now Triggered
        │
        ▼
Deployment Waiting Time started
        │
        ├── Target connects within window → Booting → Deploying → Driver Injection → Post-Deploy → Success
        │
        ├── Target doesn't connect → Skipped
        │
        └── Per-target failure → Failed (with stage info)
```

### Per-target deployment
```
Yet to Start → Booting (into WinPE) → Image Deploying →
   Driver Injection (HID) → OS Booting → Post-Deploy Activities →
   ├── Restart per Template → Final State (Up + Domain-joined + Apps installed)
   ├── User Profile Migration (if configured)
   └── Final State
```

### Bootable Media
```
Created (WinPE tool install) → Drivers added → Media Created
        │
        ├── USB: Downloaded
        ├── PXE: Published to DS
        └── ISO: Downloaded
        │
        ▼
Stored on Distribution Server
        │
        ├── Modified (re-create with new drivers)
        └── Deleted
```

### Template
```
Created → Saved → (Used in Tasks)
        │
        ├── Modified (existing tasks use new version on next deploy)
        ├── Cloned (creates new template)
        └── Deleted (blocked if used in active tasks)
```

---

## 15. Module signature — one-paragraph mental model

> **OS Imaging & Deployment** is Endpoint Central's **bare-metal pipeline** — the only module that **installs the operating system itself** rather than configuring an existing one. The seven jobs an admin must accomplish without friction are: (1) **set up two repositories** (Image + Driver) on Network Shares with R+W credentials, (2) **capture a base image** from a reference machine (online or offline via WinPE), (3) **create bootable media** (USB for small batches, PXE for fleet, ISO for VMs) with appropriate driver injection, (4) **build a Deployment Template** that customizes the image with domain join, OU placement, computer naming pattern, user accounts, apps, and SID generation, (5) **deploy to targets** via one of five modes (Task / Template / Zero-touch / Instant / Standalone) with the right authentication (passcode for hands-on, MAC for hands-off), (6) **use Hardware Independent Deployment** to avoid maintaining per-hardware images by relying on the Driver Repository to inject correct drivers per target at deploy time, and (7) **monitor + recover** from per-target failures with clear stage-level diagnostics. The core UX commitments are: **edition-aware rendering** (Cloud vs On-prem; Multicast / User Profile Backup / Standalone gate behind on-prem), **explicit warnings on constraint mismatches** (boot mode, disk size, MBR/GPT, IGMP availability), **decision-tree guidance on multi-mode choices** (which deployment method? which authentication?), and **proactive driver coverage diagnosis** so admins know before deploying whether HID will succeed. Every captured image leaves a partition layout fingerprint; every deployment is auditable per-target; every WinPE media is scoped to a remote office.

---

**File**: EC-06 — OS Imaging & Deployment (Deep Dive)
**Companion files**: EC-00 (Master), EC-01 (Patch Mgmt), EC-02 (Vuln Mgmt), EC-03 (Inventory), EC-04 (Software Deployment), EC-05 (Remote Tools)
**Next**: EC-07 — Reports (massive — Schedule / Custom / Query reports, PII masking, 9 categories) — say `next` for sequential, or specify priority module
