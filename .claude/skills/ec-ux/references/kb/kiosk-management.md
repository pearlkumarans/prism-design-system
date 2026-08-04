# Kiosk Management

> Lock mobile devices into single-app, multi-app, or autonomous single-app kiosk mode with custom home screens, hardware/function restrictions, and secure browsing. Parent module: [Mobile Device Management](mobile-device-management.md). Edition/point product: kiosk/device provisioning is in the **Standard** edition of Mobile Device Manager Plus; bundled in Endpoint Central UEM. (Desktop kiosk is handled via configuration management — see Cross-references.)

## 1. What it is — Feature detail

Kiosk management transforms smartphones, tablets, laptops, desktops, and TVs into secured single-purpose devices. A kiosk device has one purpose; only selected apps, web shortcuts, and device functions are accessible, so users can't wander off-task. Kiosk mode preconfigures a policy (apps + settings) and associates it with target devices, which then lock down to the approved apps/settings; users cannot revoke the changes.

### Kiosk modes

ManageEngine supports three modes:

- **Single-app kiosk mode** — exactly one app runs; all others and settings are disabled.
- **Multi-app kiosk mode** — a selected set of apps runs; everything else is disabled.
- **Autonomous single-app kiosk mode** — an app locks the device into single-app mode on its own for a specific duration (e.g., time-bound assessments/surveys) and exits when the task is done. While active it limits features like autocorrect/spell-check and prevents app switching, exiting, or returning to home.

### Supported platforms

Kiosk mode is available for **Android, iOS, iPadOS, tvOS, Windows, and ChromeOS** devices (mobiles, tablets, laptops, desktops, TVs, rugged, IoT).

### Lockdown & customization capabilities

- **Flexible lockdown:** single app, multiple apps, or **web kiosks**, enforced with strong **exit passcodes**.
- **Hardware/function control:** choose which hardware buttons (volume, power) and device functions (task bar, status bar, notifications) are enabled.
- **Background apps:** run apps like a VPN in the background to satisfy dependencies.
- **Vital settings display:** expose chosen critical settings (brightness, mobile networks, battery optimization, screen timeout) via a custom settings app.
- **Home-screen customization:** set app layout, arrange/organize apps in folders, change wallpapers for a consistent experience.
- **Network/content/security policies:** configure Wi-Fi/VPN, content, and security policies for the kiosk.

### Automation

- **Automatic app install/update:** apps provisioned in kiosk mode install silently; apps can also be **silently updated at a scheduled time** without user intervention.
- **Recurring IT tasks:** schedule device reboot/shutdown; automated compliance scans; admin/technician activity insights; scheduled parameter reports.
- **Autonomous lockdown:** put an app in the foreground for a fixed duration; it self-locks and exits when the purpose is served.

### Secure browsing (web kiosk)

- Allow only enterprise-approved websites; block content categories (social networking, download sites, explicit/risky/malware sites).
- Provide **web shortcuts** for quick resource access.
- **Disable the address bar** so users can't browse outside the web app.

### Security & monitoring

- Push digital certificates for Wi-Fi/VPN auth; enforce strong passwords with expiry.
- Control screen capture; restrict copying/sharing corporate data.
- **Real-time location tracking** with route history; **geofence** kiosk devices and alert on entry/exit (see [geo-fencing.md](geo-fencing.md)).
- **Alerts** for events like battery dropping below a threshold or a device leaving a designated area.
- **Unattended remote control:** troubleshoot shared/unattended kiosks without user prompts.

## 2. UX lens

### Console navigation

Kiosk profiles are built under `MDM → Profiles` (Kiosk) and associated with groups/devices; remote troubleshooting via the remote-control action. *(Exact menu path inferred from MDM profile structure.)*

### Step-by-step workflow

1. **Onboard** devices (zero-touch where possible).
2. **Create a kiosk profile:** choose single-app / multi-app / autonomous; select allowed app(s) and/or web shortcuts.
3. **Customize:** home-screen layout, allowed hardware buttons/functions, exposed settings, background apps.
4. **Layer policies:** Wi-Fi/VPN, content, security; set the exit passcode.
5. **Associate** the profile to groups/devices; provisioned apps install silently.
6. **Maintain:** silent app/OS updates on schedule; automated scans/reboots; remote-control for troubleshooting.

### UX research hooks

- **Exit passcode discoverability** — staff need a sanctioned way out for maintenance; document and protect it.
- **Autonomous mode timing** is subtle (auto-lock/auto-exit duration); a preview/test mode reduces misconfiguration.
- **Hardware-button matrix** is granular and error-prone; sensible per-use-case presets (POS, signage, survey) would cut setup time.
- **Web-kiosk address-bar/allowlist** misconfig leads to either too-open or unusable browsing; show a live preview.
- **Silent install dependency** — kiosk apps must be provisioned for silent install; mismatches leave a blank kiosk. Validate provisioning before lockdown.

### Notable UI patterns/components

Kiosk profile builder (mode selector, app picker, web-shortcut list); home-screen layout designer; hardware/function toggle matrix; exit-passcode field; allowed-website/category manager; remote-control panel; alert configuration.

## 3. PM lens

### Value proposition & business outcomes

Turns commodity devices into reliable, locked-down single-purpose terminals — POS, self-service, digital signage, info kiosks, surveys — driving sales/productivity while protecting data. Centralized control, bulk deployment, silent updates, and unattended remote control minimize field IT effort.

### Target personas & use cases

- **Retail/hospitality** — POS, self-service ordering, product catalogs.
- **Healthcare** — secure patient-data collection on locked devices.
- **Banking** — digital transactions/cash handling within compliance.
- **Education** — student/teacher devices with curated apps; attendance/exams.
- **Transportation/events/government** — purpose-built terminals and signage.

### Positioning & differentiators

Three kiosk modes (single, multi, autonomous) across the widest platform set (Android, iOS, iPadOS, tvOS, Windows, ChromeOS), with web kiosks, granular hardware/function control, background apps, silent install/update, geofencing, and unattended remote control — all in the same MDM/UEM console as the rest of device management.

### Edition / point-product gating

Kiosk/device provisioning is part of the **Standard** edition of Mobile Device Manager Plus (Wi-Fi, VPN, kiosk management, restrictions, SSO, certificates). Advanced home-screen/custom configuration is **Professional**. Bundled into Endpoint Central UEM.

### Expansion opportunities

- Per-industry kiosk **templates/presets** (POS, signage, survey).
- Richer **web-kiosk** controls and analytics.
- **Test/preview** mode before lockdown to prevent blank kiosks.
- Tighter autonomous-mode scheduling and reporting *(inferred)*.

## 4. Developer / Technical lens

### Mechanics

- A kiosk profile defines allowed app(s)/web shortcuts, home-screen layout, enabled hardware buttons/functions, exposed settings, background apps, and an exit passcode; it is pushed via the per-platform channel and enforced on-device.
- **Silent install/update:** provisioned apps install/update without user action on supervised/work-profile/kiosk devices, including scheduled silent updates.
- **Autonomous single-app mode:** an app self-invokes single-app lockdown for a fixed duration and releases on completion.
- **Web kiosk:** a managed browser with allowlist/category blocking and a disabled address bar.
- **Remote control:** unattended sessions on shared/kiosk devices without user prompts.

### Ports / protocols / limits

| Item | Value |
| --- | --- |
| Platforms | Android, iOS, iPadOS, tvOS, Windows, ChromeOS |
| Modes | Single-app, multi-app, autonomous single-app |
| Push ports | iOS APNs 443/5223; Android FCM 5228-5230; Windows WNS 443/9383/8383 (see [mobile-device-management.md](mobile-device-management.md)) |
| App install | Silent for provisioned apps; scheduled silent updates |

- iOS single-app uses Apple Single App Mode / guided-access-style locking; Android uses lock-task/screen-pinning mechanisms *(inferred from platform behavior)*.

### Data model / key objects

Kiosk Profile (mode, allowed apps, web shortcuts, home layout, hardware/function toggles, exit passcode), Web shortcut/allowlist, associated Wi-Fi/VPN/content/security policies, Distribution assignment. *(Some names inferred.)*

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
| --- | --- | --- |
| Kiosk shows no usable app (blank) | App not provisioned for silent install | Provision the app for the device before applying the kiosk profile |
| App Lock Profile Failed (unable to retrieve app data) | App metadata couldn't be fetched | Retry; verify store reachability |
| Staff can't exit kiosk for maintenance | Exit passcode unknown/not set | Set and securely share the exit passcode |
| Web kiosk too open / unusable | Allowlist/address-bar misconfigured | Refine allowed websites/categories; disable the address bar |
| Background dependency app not running | Background app not configured | Add the required app (e.g., VPN) as a background app |
| Kiosk app won't update | Silent update not scheduled | Schedule silent app updates |
| Kiosk device unreachable for support | Push channel blocked | Verify APNs/FCM/WNS reachability (see parent module) |

### FAQs

- *What kiosk modes are there?* Single-app, multi-app, and autonomous single-app.
- *Which devices?* Android, iOS, iPadOS, tvOS, Windows, ChromeOS.
- *Can I lock to websites?* Yes — web kiosk with an approved-site allowlist and disabled address bar.
- *Do apps update without users?* Yes — silent install and scheduled silent updates.
- *Can I troubleshoot unattended kiosks?* Yes — unattended remote control without user prompts.
- *What about desktop kiosks?* Desktop kiosk lockdown is delivered via configuration management (see Cross-references), separate from mobile MDM kiosk profiles.

## Cross-references
- [mobile-device-management.md](mobile-device-management.md) — parent module; kiosk overview, push services, restrictions.
- [configuration-management.md](configuration-management.md) — desktop kiosk and shared profile/restriction concepts.
- [mobile-app-management-mam.md](mobile-app-management-mam.md) — silent provisioning of kiosk apps.
- [geo-fencing.md](geo-fencing.md) — location tracking and geofence alerts for kiosk fleets.
- [remote-troubleshooting.md](remote-troubleshooting.md) — unattended remote control of kiosk devices.

## Sources
- https://www.manageengine.com/mobile-device-management/single-app-lock-kiosk-mode-mdm.html
- https://www.manageengine.com/mobile-device-management/mdm-kiosk-mode-purpose-built-devices.html
- https://www.manageengine.com/mobile-device-management/single-app-mode-ios-devices.html
- https://www.manageengine.com/mobile-device-management/help/profile_management/android/android_kiosk.html
- https://www.manageengine.com/products/desktop-central/mobile-device-management-mdm.html
