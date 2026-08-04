# Device Control

> Centralized control of peripheral and removable devices across endpoints — allow/block/read-only by device type, individual device, or computer group, with trusted devices, temporary access, USB encryption, file shadowing, and file tracing. Parent module: [Endpoint Data Security](endpoint-data-security-dlp.md). Point product / edition: **Device Control Plus** (delivered through the Endpoint Security / Endpoint Data Security add-on for Endpoint Central). Includes the **legacy USB Device Management** feature.

---

## 1. What it is — Feature detail

Unauthorized use of peripheral devices is a significant security risk: rogue USB drives, external disks, and portable devices can cause data leaks, malware intrusions, and compliance violations. The portable-storage problem has two faces — **data theft** (a disgruntled employee copying business-critical data) and **malware injection** (a booby-trapped device infecting the network). Endpoint Central's **Device Control** module provides a centralized solution to monitor, manage, and restrict peripheral device usage across all endpoints, with access control based on device type and target computers and the ability to exclude specific users from applied policies.

Device Control lives in its own console module: **Policies → Policy Creation**, **Deploy Policy**, **Trusted Devices**, **Temporary Access**, **Reports** (device audit + file shadow), and **Settings** (audit + alert). Recovery keys for USB encryption surface under **Insights → Retrieve Recovery Keys**. It is complementary to the other data-security modules: Device Control decides *whether a peripheral may be used at all* and enforces encrypt-on-write, while [Endpoint DLP](endpoint-dlp.md) decides whether *sensitive content* may leave a channel, and [BitLocker Management](bitlocker-management.md) protects the whole drive at rest.

### Full capability breakdown
- **Device-type Level Control** — allow or block entire categories (Removable Storage, Windows Portable Devices, Apple Devices, CD/DVD, Printers, Bluetooth adapters, and more).
- **Granular Access Permissions** — read-only, write, or full access by device type, individual device, or computer group.
- **USB Encryption** — enforce automated **BitLocker-to-Go** encryption on removable storage. When users copy files to an unencrypted USB they are prompted to set a password before write access is granted; recovery keys are centrally managed/retrieved from the console. Admins can restrict access to encrypted devices only, or prompt-to-encrypt on write.
- **Trusted Devices Management** — mark specific devices as trusted to bypass general restrictions; identified by **vendor ID, product ID, or serial number** so only verified hardware connects.
- **Temporary Access** — grant time-bound access to restricted devices for specific users/systems, with automated revocation when the window expires.
- **Device Auditing** — log all connected peripherals (when, where, by whom, on which endpoint) for usage analysis, forensics, and compliance.
- **File Shadow (data mirroring)** — keep a backup copy of every file transferred to a removable device, stored securely in a password-protected share for compliance/forensics.
- **File Tracing** — continuously record file names, source/destination locations, devices, users, endpoints, and timing for every file action — even content excluded from shadowing by size or extension.
- **Policy-based Control** — define rules and automate enforcement across computer groups.
- **Exclude User Groups** — exempt trusted roles (developers, IT admins) from a broad policy; their device/file activity is still traced.
- **Centralized Reporting** and **Email Alerts** — audit reports for compliance; instant admin notification when a blocked/unauthorized device is connected.

### Supported device types (Device Control Plus engine, Windows & macOS)
Apple devices, Biometric devices, Bluetooth adapters, CD-ROM, Floppy disks, Imaging devices, Infrared devices, Keyboards, Modems, Mice, Parallel ports (LPT), Printers, Removable storage devices, Serial ports (COM), Smart card readers, Tape drives, Windows portable devices, Wireless network adapters. (17 device categories can be governed by separate policies.) Devices are identified via the device instance path / device ID. *Limitation:* device types altered by an external source (e.g., devices accessed via Android Debug Bridge/ADB, or a device posing as another type) are out of scope; Bluetooth adapters cannot be managed on macOS Tahoe (26.0) and later.

### Control-option reference
| Control option | Effect | Notes |
| --- | --- | --- |
| **Allow** | Full functionality | Advanced Settings available for Removable Storage, CD-ROM, Bluetooth |
| **Block** | All functions restricted | For Removable Storage / CD-ROM can block specific connection types (USB, SCSI) |
| **Allow Trusted Devices** | Only listed trusted devices work; others blocked | Keyed on vendor ID / product ID / serial number |
| **Read Only** | View data; no transfer/modification | Common for removable media |
| **No Change** | Agent enforces nothing | Ideal when a GPO already governs the device |

| Device type | Windows | macOS | Advanced controls |
| --- | --- | --- | --- |
| Removable storage devices | Yes | Yes | File access, encrypt-on-write, file shadow (Win); transfer/modify restriction (Mac) |
| CD-ROM | Yes | Yes | Auto-run toggle; connection-type block |
| Bluetooth adapters | Yes | Yes (not Tahoe 26.0+) | File-transfer toggle |
| Windows portable devices | Yes | — | Allow/Block/Read-Only |
| Apple devices | Yes | Yes | Allow/Block |
| Printers, Imaging, Modems, Biometric, Smart card readers, Tape drives, Floppy, Infrared, Keyboards, Mice, Serial (COM), Parallel (LPT), Wireless network adapters | Yes | Varies | Allow/Block |

### Legacy USB Device Management feature
Before the full Device Control engine, Endpoint Central shipped a lighter **USB Device Management** capability (under USB Security Software / USB Reports) for simply enabling or disabling USB devices for users and computers, with audit and alert support. It remains available and supports a narrower device set:
- **Supported devices (legacy):** Mouse, Disk drive, CD-ROM, Portable storage devices, Floppy disk, Bluetooth, Image, Printer, Modem, Apple USB devices.
- **USB Device Audit** — tracks device name, user name, device type, time duration, manufacturer, and more; summary or detailed view; export to CSV/PDF.
- **USB Alert** — notify the end user whenever a restricted device is plugged in, enforcing compliance.
- **USB Encryption** — restrict access to encrypted USB devices only, or prompt users to encrypt on write.
- Restrictions can be set at the **computer, user, or manufacturer** level. Console path: **Reports → USB Reports** / USB security configuration.

### Supported OS / platforms
Windows and macOS (with the device-type limitations above). USB encryption (BitLocker-to-Go) is Windows-only.

### Prerequisites and key concepts/terminology
- Endpoint Central agent on endpoints. Key terms: device class, control option (Allow/Block/Read-Only/Allow Trusted/No Change), trusted device (VID/PID/serial), temporary access, encrypt-on-write, BitLocker-to-Go, recovery key / Key ID, file shadow (data mirroring), file tracing, exclude user groups, remote share path.

---

## 2. UX lens

### Console navigation path(s)
| Task | Navigation path |
| --- | --- |
| Create device-control policy | **Device Control → Policies → Policy Creation → Create Policy → (Windows / Mac)** |
| Deploy device-control policy | **Device Control → Deploy Policy** |
| Trusted devices list | **Device Control → Trusted Devices** |
| Temporary access | **Device Control → Temporary Access** |
| Device audit / file-shadow reports | **Device Control → Reports** |
| Audit & alert settings | **Device Control → Settings** |
| Retrieve USB (BitLocker-to-Go) recovery key | **Insights → Retrieve Recovery Keys** |
| Legacy USB audit | **Reports → USB Reports** |

### Step-by-step workflow(s)

**Procedure 1 — Create a device-control policy (Windows)**
1. **Policies → Policy Creation → Create Policy → Windows**; enter name/description.
2. For each device type pick a control option: Allow, Block, Allow Trusted Devices, No Change (defers to GPO), or Read Only.
3. For **Removable Storage** (Allow / Allow Trusted), open **Advanced Settings**:
   - **File Access** — restrict transfer from device→computer; restrict modification/transfer computer→device; allow only specific extensions/sizes.
   - **Device Access** — disable Auto-Run; set behavior for unencrypted devices (Not Configured / Block / Read-Only); "Notify end user to encrypt device for write access"; pick encryption method (Default / 128-bit / 256-bit).
   - **File Shadow** — enable shadowing; set the remote network-share path and credentials; set max file size (0 KB–1,048,576 KB; 0 = no limit); set exclude extensions.
   - **CD-ROM** Allow exposes an auto-run toggle; **Bluetooth** Allow exposes a file-transfer toggle.
4. Configure **Device Audit Settings** (Monitor All Device Activities; frequency; "Send Blocked Device Details to Server Immediately").
5. Configure **Alert Settings** (Off / Default / Custom Notification with title/message and optional temporary-access request button).
6. **Deploy Policy** → select target computer groups (optionally **exclude user groups**) → deploy.

> macOS policy is created via Create Policy → Mac; advanced settings are limited to "Restrict Modifications and Transfer of Files to Removable Storage Device."

**Procedure 2 — Enforce USB encryption (encrypt-on-write)**
1. Create a Windows policy; for Removable Storage select **Allow** or **Allow Trusted Devices**.
2. Set Read-Only for unencrypted devices and enable "notify users to encrypt for write access."
3. Pick the encryption method (Default / 128-bit / 256-bit) and save; **Deploy Policy** to target groups.
4. End-user flow: read access works immediately; on first write the user is prompted to set a password; the drive is encrypted with **BitLocker-to-Go**; thereafter the password unlocks write access.
5. Recovery: the user clicks "Enter recovery key," copies the **Key ID**, and the admin retrieves the matching key under **Insights → Retrieve Recovery Keys → Show key**.

**Procedure 3 — Trusted devices & temporary access**
1. **Trusted Devices** → add a device by vendor ID, product ID, or serial number; reference it from any policy via the **Allow Trusted Devices** option.
2. **Temporary Access** — when a user inserts a blocked device under a Custom Notification alert with the request option, they raise a temporary-access request; the admin grants a time-bound window that auto-revokes on expiry.

**Procedure 4 — File shadowing (data mirroring), five steps**
1. Select the specific USB devices to shadow (handpick to optimize bandwidth).
2. Choose file-size limits and exclude extensions (e.g., exclude large video/audio).
3. Configure the **remote share path** with domain credentials (use a dedicated, remote location — shadow copies consume significant disk).
4. Map the policy to custom groups of endpoints.
5. Review **file-shadowing reports** (device, endpoint, user, file name, time). *Note:* file tracing still records content excluded from shadowing by size/extension.

### UX research hooks
- **Recovery-key retrieval** is the highest-frequency help-desk task — study time-to-key and Key ID search ergonomics.
- **USB block frustration** — measure clarity of the custom alert and discoverability of the temporary-access request path.
- **Shadow storage shock** — admins underestimate share sizing; surface projected consumption before enabling file shadow.
- **Opportunity** — distinguish trusted-by-serial vs. trusted-by-model in the trusted-device list to avoid over-broad trust.

---

## 3. PM lens
- **Value** — stops insider data theft and USB-borne malware while resolving the productivity-vs-security dilemma via encrypt-on-write (don't block USB outright; force encryption only on write). Full forensic trail via device audit, file shadow, and file tracing.
- **Personas** — Endpoint Admin (policies, trusted devices); Security/Compliance Admin (audit/shadow for evidence); Help Desk (USB recovery keys, temporary-access approvals); End user (encrypt-on-write, temporary-access request).
- **Positioning** — single agent/console across device control, encryption, DLP; trusted-device identity by VID/PID/serial, USB encrypt-on-write with central key retrieval, file shadowing/tracing. Competes with dedicated device-control tools (e.g., Endpoint Protector, DriveLock) — edge is UEMS breadth.
- **Edition / point-product gating** — Device Control Plus point product, or the Endpoint Security / Endpoint Data Security add-on. Legacy USB management ships more broadly. 30-day free trial.
- **Expansion opportunities** — macOS Bluetooth parity post-Tahoe; risk scoring on device behavior; auto-quarantine on unauthorized device; broader cloud-edition support.

---

## 4. Developer / Technical lens
- **Mechanics** — kernel/filter-driver enforcement keyed on device class and VID/PID/serial; blocks at device enumeration and logs plug events. Known brief latency between physical connect and block (build-fixed; see Support).
- **File shadow** — intercepts computer→removable transfers and copies files (within size/extension limits) to an SMB share with stored credentials; falls back to a local cache when the share is unreachable and posts on the next refresh.
- **File tracing** — records file actions independently of shadowing (including unshadowed/oversized content); logs surface at the next agent↔server refresh cycle.
- **USB encryption** — uses **BitLocker-to-Go**; recovery keys flow to the same store as full-disk [BitLocker](bitlocker-management.md).
- **Ports/protocols** — secure agent↔server channel over HTTPS / EC management ports (inferred); file-shadow target is an SMB/network share; REST API for automation/reporting.
- **Data model / key objects** — Device-Control Policy + Control Option, Trusted Device (VID/PID/serial), Temporary-Access grant, Device/Shadow audit event, File-Trace record, Recovery-Key record (Key ID).
- **Limitations** — cannot manage externally-altered device types (ADB) or macOS Bluetooth on Tahoe 26.0+; USB encryption Windows-only; file-shadow scalability bounded by share bandwidth/disk.

---

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
| --- | --- | --- |
| USB still works after block | Wrong device class/manufacturer scope, policy not applied, or user-vs-computer scope mismatch | Verify scope and deployment status; confirm device class |
| Newly connected USB not blocked immediately | Delay before the OS recognizes a freshly connected USB; an in-flight operation in that window can't be blocked | Update to latest build/PPM (addressed in build 11.2.2330.1, 10 Aug 2023) — console → click build number → download/apply latest PPM |
| USB write still blocked after encryption prompt | User declined encryption, or unencrypted-device setting is "Block" not "Read-Only" | Confirm policy uses Read-Only + notify-to-encrypt |
| File shadow filling disk / saturating WAN | No size/extension limits; share too close | Set max file size, exclude large extensions, relocate to a dedicated remote share, size storage |
| File-shadow data not appearing | Remote share unreachable | Data falls back to local cache and posts on next refresh; restore share connectivity/credentials |
| Cannot retrieve USB recovery key | Wrong Key ID | Have the user copy the exact Key ID from the unlock screen; search **Insights → Retrieve Recovery Keys → Show key** |

**FAQs**
- *Can I allow only company USBs?* Yes — add them as Trusted Devices (by VID/PID/serial) and use the Allow Trusted Devices option.
- *Difference between file shadow and file tracing?* Shadow stores a copy of the file; tracing records metadata about the action — and traces even content excluded from shadowing by size/extension.
- *Is the legacy USB feature still supported?* Yes — for simple enable/disable plus audit/alert on a narrower device set.

---

## Cross-references
- [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) — parent data-security module overview.
- [endpoint-dlp.md](endpoint-dlp.md) — content-aware DLP whose Removable Storage channel scopes to *sensitive* files only.
- [bitlocker-management.md](bitlocker-management.md) — full-disk encryption; shares the recovery-key store with USB encrypt-on-write.
- [secure-private-access.md](secure-private-access.md) — device posture / trusted endpoint.
- [point-products.md](point-products.md) — Device Control Plus point product packaging.

## Sources
- https://www.manageengine.com/products/desktop-central/help/device-control/dc-overview.html
- https://www.manageengine.com/products/desktop-central/help/device-control/create-dc-policy.html
- https://www.manageengine.com/products/desktop-central/control-usb-devices.html
- https://www.manageengine.com/device-control/features.html
- https://www.manageengine.com/device-control/file-shadowing.html
- https://www.manageengine.com/device-control/file-tracing.html
- https://www.manageengine.com/device-control/trusted-devices.html
- https://www.manageengine.com/device-control/temporary-access.html
- https://www.manageengine.com/device-control/help/supported-devices.html
- https://www.manageengine.com/device-control/how-to/usb-encryption.html
- https://www.manageengine.com/products/desktop-central/configuration-secure-usb.html
