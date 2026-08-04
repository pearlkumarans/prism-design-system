# OS Deployment (OS Imaging & Deployment)

> Automated OS imaging and deployment for Windows — online/offline capture, WinPE bootable media (USB/PXE/ISO), hardware-independent driver injection, customizable deployment templates, zero-touch/instant/standalone deployment, and remote-office deployment, all from the Endpoint Central console. Bundled with the UEM suite; the imaging engine maps to the companion OS Deployer product.

## 1. What it is — Feature detail

### Purpose and console location

OS imaging and deployment automates capturing a master image, customizing it, and deploying it to new or re-imaged systems directly from the product console — eliminating manual, error-prone OS/driver/config installs.

**Console navigation.** The feature lives under the top-level **OS Imaging & Deployment** module. Per the official help, it is organized into four groups:

- **Imaging** (`OS Deployment → Images`)
  - Online Imaging
  - Offline Imaging
  - User Profile Backup (on-premises only)
  - PE (WinPE) Media Creation
  - Hardware Independent Deployment
- **Customizing Deployment** (`OS Deployment → Customize`)
  - Creating Deployment Template
  - Post Deployment Activities
  - Adding Applications
- **Deployment** (`OS Deployment → Deploy`)
  - Deployment via Task
  - Deployment via Template
  - Zero-touch Deployment
  - Instant Deployment
  - Standalone Deployment
- **Remote Deployment**
  - Booting & Deployment (associating a deployment task to a remote office)
  - OS Deployment Settings (per remote office)

Create-bootable-media lives at `OS Deployment → Deploy → Create Bootable Media`. The help pages are marked "Applicable For Endpoint Central MSP," and the cloud edition restricts imaging to remote-office (not local) computers.

### Full capability breakdown (how it works at a low level)

- **Online imaging** — Captures a **live, running** computer. Image-creator components are installed onto the target (which must grant `Admin$` privileges, an admin system user, and remote-access privileges). The admin selects disk partitions (System/Firmware, OS-reserved, and OS partitions are selected by default and must not be deselected — they are required to boot after deployment), an image **compression rate** (low = fastest, medium, high = slowest but smallest), a **memory-usage level** (RAM consumed during imaging), and an **image repository** (a network share with Read/Write credentials). Options include **Shrink partition & start imaging**. Imaging can be paused, stopped, and re-imaged.
- **Offline imaging** — Captures a **powered-down** machine after booting it into the ManageEngine WinPE environment (see WinPE media below).
- **Image repository** — A network share storing captured images; client computers pull images from it during deployment. Must have enough free disk space and accessible from the relevant remote office.
- **Driver repository** — A separate network share (Read/Write) where drivers auto-detected during imaging are stored; client computers pull drivers from it to enable hardware-independent deployment.
- **Hardware-Independent Deployment (HID)** — Deploy a single base image to any machine regardless of vendor make/model; required drivers are matched and injected automatically. Mechanics:
  1. The target boots into the network using **WinPE** media.
  2. The selected OS image is deployed; **before the OS boots**, the OS deployment tool inside WinPE automatically adds the required drivers to the deployed image.
  3. **After the OS boots**, Windows automatically installs those drivers.
  This eliminates maintaining a separate image per hardware type and prevents driver-hardware mismatch errors.
- **WinPE bootable media** — Three media types to boot machines for offline imaging and deployment:
  - **USB media** — load WinPE onto a pen-drive/external disk; best for a small number of machines.
  - **PXE server** — target boots over the network (must support PXE); WinPE boot files are transferred via **TFTP**; greatly reduces boot time for many machines and removes the need for an on-site technician. Requires DHCP configuration. A separate PXE server runs per remote office on the respective Distribution Server.
  - **ISO media** — a disk-image file; mount on a CD/DVD or upload to a virtual machine to boot it.
  The WinPE tool relies on the Microsoft **ADK / Deployment and Imaging Tools (DISM)**; the tool can be installed automatically (incremental: ADK install, then media creation) or manually.
- **Deployment templates** — Customize a captured image per department/role: pick the image, choose a **deployment preference** (completely erase target partitions, or add/overwrite an existing partition — for overwrite, specify the exact partition number), select partitions to deploy (target disk must be larger than total selected partition size; MBR↔GPT disk-style conversion option), specify the **target hard disk/BIOS number** (found via `diskpart` → `list disk`), and enable/disable **disk adjustment** (auto-extends data partitions into unallocated space). Templates also define post-deploy computer settings: join a domain, add user accounts, install applications.
- **Post-deployment activities & adding applications** — Define settings and actions to run automatically after a successful OS deployment (e.g., install EXEs/applications, domain join).
- **Deployment methods:**
  - **Deployment via Task / via Template** — standard task- or template-driven deployment to targets.
  - **Zero-touch deployment** — Prereqs: a captured+customized image (deployment template), a bootable media with the necessary drivers, and target machines that are online with an existing OS. Steps: `Deploy → Zero touch task → Add Zero touch task` → name it → select the deployment template → select bootable media (PXE/USB/ISO) → select remote office + add target computers (manually or via CSV) → choose deployment method (**Unicast** = server sends the image to each computer one-by-one, recommended for up to 5 computers) and optionally schedule → **Deploy Now**.
  - **Instant deployment** — on-demand deployment task.
  - **Standalone deployment** — via the OS Deployer standalone path.
- **User Profile Backup (on-premises only)** — Back up user data/profile settings so they can be restored during an OS refresh/migration.
- **Remote office management** — Deploy OSs to all remote/branch-office computers (PXE server + media per remote office) to standardize branch OSs.
- **Windows migration** — Used to upgrade fleets (e.g., Windows 7 to Windows 10) at scale.

### Supported OS / platforms / coverage

- Imaging is supported on **all Windows OS from Windows XP and above**.
- Supported partition styles: **MBR** and **GPT** (with MBR→GPT conversion option in templates).
- Supported disk types: **HDD, SSHD, SSD**.
- Supported on **Hyper-V** virtual machines.
- WinPE is the boot/staging environment for offline imaging and deployment.

### Prerequisites & key concepts

- Endpoint Central server + Distribution Server (for remote offices) + an **image repository** network share (Read/Write) + a **driver repository** network share (Read/Write).
- For online imaging the target needs `Admin$`, an administrator system user, and remote-access privileges; the system must stay on the network and must not be shut down/restarted during imaging.
- WinPE media (USB/PXE/ISO); ADK/DISM (auto- or manually-installed). For PXE, a **DHCP server** must be configured and PXE uses **port 69 (TFTP)**.
- WoL/network-boot reachability for branch deployment.
- Terminology: *online vs offline capture*, *image repository*, *driver repository*, *base image*, *deployment template*, *deployment preference* (erase / add / overwrite), *disk adjustment*, *HID / driver injection*, *WinPE*, *ADK/DISM*, *PXE/TFTP/DHCP*, *unicast deployment*, *zero-touch / instant / standalone deployment*, *post-deployment activities*, *user profile backup*.

### Settings / options reference

| Stage | Option | Values / behavior |
| --- | --- | --- |
| Online imaging | Office | Local or remote (on-prem); remote office only (cloud) |
| Online imaging | Disk partitions | Select partitions; System/Firmware, OS-reserved, and OS partitions are pre-selected and must not be deselected |
| Online imaging | Image compression rate | Low (fastest) / Medium / High (slowest, smallest) |
| Online imaging | Memory usage level | Controls RAM consumed during imaging |
| Online imaging | Image repository | Network share, Read/Write, sufficient free space |
| Online imaging | Start option | Start Imaging / Shrink partition & start imaging |
| Imaging | Source-system privileges | `Admin$`, administrator system user, remote-access privileges |
| Imaging | Driver repository | Network share, Read/Write; stores auto-detected drivers for HID |
| Bootable media | Media type | USB / PXE / ISO |
| Bootable media | WinPE/ADK tool install | Automatic (incremental) or manual (specify location) |
| Bootable media | Architecture | Match target computers |
| Bootable media | Add drivers from repository | Select network & hard-disk drivers (search by hardware ID; filter by share path/storage/manufacturer/model) |
| Deployment template | Deployment preference | Completely erase target partitions / Add new partition / Overwrite partition (specify partition number) |
| Deployment template | Partitions to deploy | Target disk must exceed total selected size; MBR→GPT conversion for MBR images |
| Deployment template | Target hard disk/BIOS number | From `diskpart` → `list disk` |
| Deployment template | Disk adjustment | Auto-extend data partitions into unallocated space (behavior varies by deployment preference) |
| Deployment template | Post-deploy settings | Add to domain / add user accounts / install applications |
| Zero-touch task | Deployment method | Unicast (server → each target sequentially; recommended ≤5 computers) |
| Zero-touch task | Targets | Select remote office + add computers (manual or CSV) |
| Zero-touch task | Schedule | Optional time interval; or Deploy Now |

### Remote-office deployment

For branch offices, deployment is driven via **Remote Deployment → Booting & Deployment** (associating a deployment task to a remote office) and **OS Deployment Settings** (per remote office). Key mechanics: a separate **PXE server** runs per remote office on that office's **Distribution Server**, and created USB/ISO media can be re-downloaded for a specific remote office (`Action → Download → select remote office`). The image and driver repositories selected for a remote-office capture/deploy must be reachable from within that remote office. This lets an organization standardize OS builds across all branches without shipping pre-built images, while keeping image transfer local to each site.

## 2. UX lens

### Primary user roles & jobs-to-be-done

- **Deployment/imaging admin** — capture a golden image, build per-department templates, deploy to many machines with minimal hands-on.
- **Branch IT** — standardize OS across remote offices (PXE per remote office) without shipping pre-built images.
- **Migration lead** — move a fleet from an old Windows version to a new one on schedule, preserving user profiles.

### Key workflows / screen flows (step by step)

**A. Online imaging** (`OS Deployment → Images → Online Imaging → Create Image`):
1. Select the office where the target (imaging) computer is located (cloud edition: remote office only).
2. Specify the target computer's details so image-creator components install (requires Admin$, admin user, remote access).
3. Select disk partitions (keep System/Firmware/OS-reserved/OS partitions).
4. Choose compression rate (low/medium/high) and memory-usage level.
5. Select the image repository (network share, Read/Write, enough free space).
6. Click **Start Imaging** or **Shrink partition & start imaging**.
7. If no driver repository exists, create one (network share, Read/Write) — auto-detected drivers are stored there for HID.
8. Imaging runs; can pause/stop/re-image. Image lands in the repository.

**B. Create WinPE bootable media** (`OS Deployment → Deploy → Create Bootable Media`):
1. Select media type: USB / PXE / ISO.
2. Specify a media name and the remote office.
3. Choose automatic or manual WinPE/ADK tool install (specify location if manual).
4. Select target architecture.
5. Optionally enable "Add drivers from repository," select network & hard-disk drivers (search by hardware ID; filter by share path/storage type/manufacturer/model), save.
6. Click **Create bootable media** (incremental: ADK install → media creation; stored on the remote office's Distribution Server).
7. Media-specific finishing: USB/ISO → download media tool, run `OSDMediaDownloadLauncher.exe`, log in with Zoho account/verification code, select USB drive or download location, click download. PXE → Action → **Publish PXE media**.

**C. Boot the target:**
- **USB:** connect USB → Boot order menu → select USB drive (LEGACY or UEFI per the image).
- **PXE:** configure DHCP server → Boot order menu → select **Onboard NIC**; files transfer via TFTP.
- **ISO:** mount on CD/DVD or upload to the VM → select CD/DVD drive in boot order.

**D. Create deployment template** (`OS Deployment → Customize → Deployment Template → Create Deployment Template`):
1. Name it; select the captured image.
2. Choose deployment preference (erase / add / overwrite — for overwrite specify partition number; Modify Partition Settings).
3. Select partitions to deploy (target disk > total selected size; MBR→GPT conversion option for MBR images).
4. Specify target hard-disk/BIOS number (`diskpart` → `list disk`).
5. Enable/disable disk adjustment (auto-extend data partitions into unallocated space).
6. Configure post-deploy actions (domain join, user accounts, applications).

**E. Zero-touch deployment** (`OS Deployment → Deploy → Zero touch task → Add Zero touch task`): name → select template → select bootable media → select remote office + add targets (or CSV) → choose Unicast + schedule → **Deploy Now**.

### UX research hooks (friction, usability, where users get stuck, opportunities)

- WinPE/ADK install and PXE+DHCP setup are classic stumbling blocks (the help even offers a free personalized PXE demo); opportunity for a guided WinPE/boot wizard and an in-product PXE readiness check.
- Online vs offline capture choice is non-obvious; surface guidance based on machine power state.
- The "don't deselect System/OS-reserved/OS partitions" rule is a footgun — deselecting them yields an unbootable target. Make these non-deselectable by default with a strong warning.
- Driver-injection failures (missing/incompatible drivers) are a top frustration; opportunity for a pre-deploy driver-coverage check per hardware model and OEM driver-pack auto-sourcing.
- Template sprawl across departments; opportunity for template inheritance/diffing.
- Disk-style (MBR/GPT) and target-disk-number selection require CLI (`diskpart`) knowledge; an in-UI disk picker would reduce error.

### Notable UI patterns/components

- Image repository browser; driver repository; bootable-media list with per-media Action menu (Publish PXE media, Download); template builder with partition/disk-adjustment controls; target picker (remote office/group/OU, CSV import); deployment status/monitoring; zero-touch/instant/standalone task views.

## 3. PM lens

### Value proposition & business outcomes

- Removes manual OS/driver/config installs; reduces errors and time; standardizes branch fleets; accelerates large migrations; HID removes per-model image maintenance.
- Single console for imaging + ongoing management lowers tool count.

### Target personas & use cases

- Mid-to-large IT with mixed hardware vendors; multi-branch organizations; OS migration programs; new-machine provisioning (zero-touch for new joiners).

### Competitive positioning / differentiators

- HID (single image, auto driver injection) vs maintaining per-model images (MDT/SCCM/Acronis-style).
- Online + offline capture flexibility; USB/PXE/ISO boot options; per-remote-office PXE.
- Bundled into UEM with post-deploy app install, domain join, and profile backup.

### Edition gating & packaging

- Core OS deployment surfaced in Endpoint Central; the imaging engine maps to the **OS Deployer** companion product (many KB/help links point to `/products/os-deployer/`).
- **On-premises vs cloud differences:** User Profile Backup is on-premises only; cloud imaging targets remote-office computers only; for cloud, bootable media/PXE run on the Distribution Server.

### Product expansion opportunities / gaps / roadmap ideas (analysis)

- macOS/Linux imaging parity (currently Windows-only).
- Cloud-native / internet-based deployment without VPN for true WFH provisioning (autopilot-style; modern-laptop dual-onboarding is already addressed via Windows Autopilot integration).
- Driver-pack auto-sourcing from OEM catalogs; pre-flight hardware compatibility scoring.
- First-class user-profile/data migration with verification reporting (beyond current backup).
- Image versioning, drift detection, golden-image lifecycle management.
- Multicast deployment for large batches (current unicast is recommended only up to ~5 machines).

## 4. Developer / Technical lens

### Architecture & components

- Endpoint Central server + per-remote-office **Distribution Server** (hosts the PXE server and stores created media) + **image repository** network share + **driver repository** network share + **WinPE/ADK (DISM)** boot environment + **image-creator components** installed on the online-imaging target + the OS Deployer tool that runs inside WinPE for driver injection.

### Imaging/deployment mechanics & protocols

- **Offline/target boot:** WinPE media — USB, **PXE** (network boot, files via **TFTP**, requires DHCP), or ISO.
- **Online capture:** image-creator components capture a live OS volume; compression and memory-usage levels are tunable; partition layout is replicated on the target.
- **HID:** driver matching/injection occurs in WinPE pre-OS-boot, then Windows installs drivers post-boot, pulling from the driver repository.
- **Zero-touch:** a deployment task associates a template + bootable media + target list; **Unicast** sends the image to each target sequentially.
- **WinPE tooling:** Microsoft ADK / Deployment and Imaging Tools; WIM mount/unmount via DISM (e.g., `copype amd64 <path>`); the server/DS service account must have rights to mount WIMs.

### Ports, protocols, integrations, APIs

- **PXE/TFTP: UDP port 69** (PXE port). **DHCP** required for PXE boot.
- **SMB/CIFS** for the image and driver repository network shares (Read/Write credentials).
- WoL to power targets for scheduled deployment (shared with the Tools module).
- Created media is stored on the remote office's Distribution Server.
- REST API (`/api/`) for deployment automation *(inferred; not documented on the OS-deployment help pages)*.

### Data model / key objects, scalability

- Objects: Captured Image, Image Repository, Driver Repository, Deployment Template, Bootable Media (USB/PXE/ISO), Deployment Task (Task/Template/Zero-touch/Instant/Standalone), Target/Remote Office, Post-Deployment Activity. *(Some names inferred.)*
- Scales by deploying one base image to many heterogeneous machines via driver injection, per-remote-office PXE servers/repositories, and CSV target import.

### Technical limitations

- Windows-only imaging focus (XP and above).
- Network-boot/WinPE dependency; LAN/branch reachability required; driver-coverage gaps can fail deployments.
- Online imaging requires the target to stay online and not reboot during capture.
- Unicast deployment is recommended only for small batches (~5).

## 5. Support / Troubleshooting lens

Format: **symptom → cause → fix**, drawn from the official OS Imaging & Deployment knowledge base.

### Boot / PXE / WinPE media

- **"PXE port is already in use"** → another service is using **UDP port 69** → find the PID with `netstat -naop UDP | findStr "69"`; end that task in Task Manager (Details tab); then start the **ManageEngine OS Deployer PXE Server** service (`services.msc`).
- **"WinPE tool automatic download failed"** (Access denied / Error 404 / Error 407 / connection time-out / authorization bug / connection refused) → no Read/Write permission to the download location; proxy missing/misconfigured; low bandwidth; firewall/proxy blocking downloads of `java.exe` or `adksetup.exe` → grant Read/Write to the download location; verify proxy details (`Admin → Server Settings → Proxy Server`, user with EXE-download rights); ensure sufficient bandwidth; allow `java.exe` and `adksetup.exe` in the firewall's Application Control Policy; permit downloads from `http://download.microsoft.com`.
- **"Unable to mount WIM file - ADK version 10"** → Windows Firewall/antivirus is blocking the WinPE (DISM) process; the service account lacks rights; or a ReFS file system is in use → exclude the Central Server (on-prem) / Distribution Server (cloud) install location from AV and firewall; ensure DISM commands aren't blocked; add the server's service account to `gpedit.msc → Computer Configuration → Windows Settings → Security Settings → Local Policies → User Rights Assignment → Manage auditing and security log`; set the server service Log-On account to the current Windows user (`services.msc` → ManageEngine Endpoint Central Server / UEMS Distribution Server → Log On tab) and restart; if needed, run a manual mount check with `copype amd64 "<path>\mount_check"` and the provided `Mount_Check.bat`.

### Disk / data integrity

- **"CRC error"** (during image creation on the source, on the repository machine, or on the target during deployment) → a hard-disk integrity problem (registry corruption, cluttered disk, failed install, misconfigured files, or physical disk damage) → check disk peripherals (cable seated, no damage, working port, test on another machine); run CHKDSK (drive → Properties → Tools → Error Checking → Check Now); if files are corrupted, format or replace the drive.
- **"There is not enough space on the disk"** → insufficient free space on repository/target → free up or expand storage (KB *not-enough-space-on-disk*).
- **"Delay write failed" / "Device not functioning" / "Media is write protected"** → disk/media hardware or write-protect issues → check the media/disk per the corresponding KB articles.

### Network / domain / access

- **"Trust relationship between this workstation and the primary domain failed"** (when installing image-creator components or accessing a remote share) → invalid domain credentials, or duplicate computer names in the domain → rejoin the computer to the domain (manual: switch to Workgroup, reboot, rejoin Domain with domain credentials, reboot; or scripted with PowerShell `Reset-ComputerMachinePassword`); alternatively access the workstation with its local account.
- **"RPC Server unavailable"** → remote computer unreachable / RPC blocked → ensure the target is up and RPC/File-and-Printer-Sharing prerequisites are met (see Remote Control KB).
- **"Access Denied" / "Write access is denied" / "Login attempt failed" / "Incorrect target account name" / "No logon servers are available" / "Could not access network location" / "Network path not found" / "Network name errors" / "Multiple connections to computer"** → credential, share-permission, or SMB connectivity issues against the image/driver repository or target → verify Read/Write credentials on the network shares, resolve duplicate SMB sessions, and confirm DNS/logon-server reachability (per the respective KB articles).
- **"Image creator and server communication failed" / "Image creator setup is not running"** → the image-creator component on the target can't reach the server or didn't start → verify connectivity and that the component/service is running.
- **"Unable to replicate image due to network errors" / "Unable to fetch response from server" / "Unexpected network error occurred" / "Server cannot perform requested operation" / "Extended error occurred" / "System cannot find specified file"** → transient or configuration network/file errors during replication or deployment → retry and check share paths, DS replication, and connectivity per the KB.

### Quick-reference troubleshooting matrix

| Symptom (error) | Likely cause | First fix |
| --- | --- | --- |
| PXE port is already in use | UDP port 69 held by another service | Kill PID on port 69; start ManageEngine OS Deployer PXE Server |
| WinPE tool automatic download failed | Permissions, proxy, bandwidth, or firewall blocking java.exe/adksetup.exe | Grant Read/Write; fix proxy; allow downloads incl. download.microsoft.com |
| Unable to mount WIM file - ADK 10 | AV/firewall blocks DISM; service account lacks rights; ReFS | AV-exclude server/DS; grant audit/security-log right; set service Log-On account |
| CRC error | Hard-disk integrity/corruption on source/repo/target | Check disk/cable; run CHKDSK; format/replace drive |
| Trust relationship failed | Bad domain credentials or duplicate computer names | Rejoin domain (manual or PowerShell); or use local account |
| RPC server unavailable | Target unreachable / RPC blocked | Ensure target up; meet RPC/File-and-Printer-Sharing prereqs |
| Access Denied / Write access denied / Login attempt failed | Credential or share-permission issue | Verify Read/Write repo credentials and target rights |
| Network path/name errors / Could not access network location | SMB/DNS connectivity issue | Confirm share paths, DNS, logon servers |
| Multiple connections to computer | Duplicate SMB sessions to the same host | Drop existing sessions (`net use`) and retry |
| There is not enough space on the disk | Insufficient repo/target free space | Free up or expand storage |
| Image creator setup is not running / communication failed | Component didn't start or can't reach server | Verify connectivity and that the component/service is running |
| Unable to replicate image due to network errors | Transient/config network error during replication | Retry; check DS replication and share reachability |
| Device not functioning / Delay write failed / Media write protected | Disk/media hardware or write-protect | Inspect media/disk per matching KB |

### Diagnostics

- Deployment task status/logs; WinPE-stage logs for driver injection; repository connectivity and share-permission checks; PXE-server service state; proxy configuration (`Admin → Server Settings → Proxy Server`).

### FAQs

- *Do I need a separate image per hardware model?* No — HID deploys one base image and injects drivers per model from the driver repository.
- *Can I capture a running machine?* Yes — online imaging; offline (powered-down via WinPE) is also supported.
- *Which boot media can I use?* USB, PXE (network boot, requires DHCP, uses TFTP/port 69), or ISO.
- *Can I deploy to branch offices?* Yes — a PXE server runs per remote office on its Distribution Server.
- *How do I deploy to new joiners with zero touch?* Use a Zero touch task with a template + bootable media (Unicast for ≤5 machines).

### Useful KB / help references

- OS imaging & deployment (overview): https://www.manageengine.com/products/desktop-central/help/os-imaging-and-deployment.html
- Online imaging: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/online-imaging.html
- Creating WinPE media: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/creating-winpe-media.html
- Hardware Independent Deployment: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/hardware-independent-deployment.html
- Creating deployment template: https://www.manageengine.com/products/desktop-central/help/os-deployment/customize-deployment/customizing-image-deployment.html
- Zero-touch task: https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/zero-touch-task.html
- KB: PXE port already in use: https://www.manageengine.com/products/desktop-central/os-imaging-deployment/pxe-port-already-in-use.html
- KB: WinPE tool auto-download failure: https://www.manageengine.com/products/desktop-central/os-imaging-deployment/winPE-tool-auto-download-failure.html
- KB: Unable to mount WIM (ADK 10): https://www.manageengine.com/products/desktop-central/os-imaging-deployment/unable-to-mount-wimfile-adk10.html
- KB: CRC error: https://www.manageengine.com/products/desktop-central/os-imaging-deployment/crc-error.html
- KB: Trust relationship failed: https://www.manageengine.com/products/desktop-central/os-imaging-deployment/trust-relationship-failed.html
- OS Deployment KB category: https://www.manageengine.com/products/desktop-central/knowledge-base.html

## Cross-references
- [configuration-management.md](configuration-management.md) — post-deployment configs and custom scripts.
- [remote-troubleshooting.md](remote-troubleshooting.md) — WoL to power targets; remote support post-imaging.
- [mobile-device-management.md](mobile-device-management.md) — device provisioning/enrollment analog for mobile.

## Sources
- https://www.manageengine.com/products/desktop-central/os-deployment.html
- https://www.manageengine.com/products/os-deployer/hardware-independent-deployment.html
- https://www.manageengine.com/products/desktop-central/help/os-imaging-and-deployment.html
- https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/online-imaging.html
- https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/creating-winpe-media.html
- https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/hardware-independent-deployment.html
- https://www.manageengine.com/products/desktop-central/help/os-deployment/customize-deployment/customizing-image-deployment.html
- https://www.manageengine.com/products/desktop-central/help/os-deployment/os-imaging/zero-touch-task.html
- https://www.manageengine.com/products/desktop-central/os-imaging-deployment/pxe-port-already-in-use.html
- https://www.manageengine.com/products/desktop-central/os-imaging-deployment/winPE-tool-auto-download-failure.html
- https://www.manageengine.com/products/desktop-central/os-imaging-deployment/unable-to-mount-wimfile-adk10.html
- https://www.manageengine.com/products/desktop-central/os-imaging-deployment/crc-error.html
- https://www.manageengine.com/products/desktop-central/os-imaging-deployment/trust-relationship-failed.html
- https://www.manageengine.com/products/desktop-central/knowledge-base.html
