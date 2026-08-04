# Mobile Device Management (MDM)

> Enroll, manage, monitor, update, secure, and troubleshoot iOS, Android, and Windows devices from one console — including app/email/content management, BYOD containerization, kiosk, MAM, and conditional access. MDM is built into Endpoint Central (UEM); a standalone variant, Mobile Device Manager Plus, exists on-prem and cloud.

## 1. What it is — Feature detail

### Purpose and console location

MDM scrutinizes and secures any mobile device that accesses enterprise resources, configuring and securing devices across LAN/WAN from a central location, integrated with desktop management.

**Console navigation.** MDM is a top-level module: **Mobile Device Management** in the feature list. Day-to-day device operations live under the **Device Mgmt** tab (e.g., `Device Mgmt → Content Management`), and device onboarding lives under **Enrollment**. Sub-areas: Enrollment (incl. APNs setup, Windows Autopilot), Profiles/Policies, Apps (MAM), Security Management (incl. Conditional Access), Content Management, Email, Containerization, Kiosk, Audits/Reports, Asset.

**Device onboarding context.** Endpoint Central onboards both *traditional* devices (servers/desktops/laptops via an installed **agent**) and *modern* devices (mobiles, rugged, IoT, TV, HoloLens, Surface Hub, Chromebook, and Mac/Win10/Win11 laptops via **enrollment** to the central server). Modern laptops (Mac, Windows 10/11) fall into both categories and can be onboarded twice; this can be automated in one step (e.g., via Windows Autopilot).

### Full capability breakdown (how it works at a low level)

- **Device enrollment** — Automatic, manual, or **over-the-air (OTA)** enrollment; **bulk enrollment via CSV**; **self-enrollment** by users. Authentication via **one-time passcode** or **Active Directory credentials**. Enroll by **ownership** (corporate vs personal) to drive policy separation. Connectivity can be verified post-enroll via `Enrollment → Actions → Verify Connectivity`.
- **Profile management (policies/profiles)** — Configure and enforce policies for accessing enterprise resources; restrict apps (camera, YouTube, browsers, etc.); regulate access to corporate email/Wi-Fi/VPN accounts; group devices by department/location and by ownership (corporate vs BYOD), then apply policies/restrictions and distribute apps per group.
- **Mobile Application Management (MAM)** — OTA app distribution (Store/in-house), App Catalog, VPP (iOS) / managed Google Play (Android), allowlist/blocklist, app reports. *Full detail: → [mobile-app-management-mam.md](mobile-app-management-mam.md).*
- **Mobile security management** — Enforce device passcodes; **remote lock**; real-time **geo-location tracking**; **complete wipe** (factory-reset equivalent); **corporate wipe** (remove only corporate data, leaving personal data — key for BYOD). *Location-based compliance: → [geo-fencing.md](geo-fencing.md).*
- **Conditional Access** — gates corporate-resource (e.g., Exchange) access on device compliance/management state. *Full detail: → [conditional-access.md](conditional-access.md).*
- **Mobile content management (MCM)** — secure document/media distribution to a Content Repository, viewed in the ME MDM app. *Full detail (content policies, viewable formats, 1 GB Cloud cap): → [content-management.md](content-management.md).*
- **Email management** — corporate email via Exchange ActiveSync + containerization + selective wipe. *Full detail: → [email-management.md](email-management.md).*
- **Containerization** — separate corporate/personal data via ownership-based enrollment; corporate wipe leaves personal data intact. *Full BYOD detail: → [byod-management.md](byod-management.md).*
- **Kiosk mode** — lock devices to single/multiple apps. *Full detail: → [kiosk-management.md](kiosk-management.md).*
- **Audits and reports** — scan devices for compliance; predefined/custom, immediate/scheduled reports; real-time remote troubleshooting.
- **Asset management** — track device asset info, certificates, installed apps; out-of-the-box reports.

> **Sub-modules (deep-dives in their own files):** [mobile-app-management-mam.md](mobile-app-management-mam.md) · [email-management.md](email-management.md) · [content-management.md](content-management.md) · [conditional-access.md](conditional-access.md) · [geo-fencing.md](geo-fencing.md) · [kiosk-management.md](kiosk-management.md) · [byod-management.md](byod-management.md). This file keeps the MDM **core** (enrollment, push services, prerequisites, settings, troubleshooting); per-feature depth lives in those files.

### Supported OS / platforms / coverage

- **iOS, Android, and Windows** devices (smartphones, tablets, laptops); also modern devices (rugged, IoT, TV, HoloLens, Surface Hub, Chromebook). VPP/managed distribution and many controls are iOS-specific; managed Google Play / Play for Work for Android; WNS-based management for Windows.

### Prerequisites & key concepts (with the push services and ports)

- **iOS:** an **Apple Push Notification service (APNs)** certificate must be uploaded to the MDM server. Build 90072+ expects the certificate in **`.pem`** format (earlier builds used **`.p12`**). The MDM server must reach **`api.push.apple.com:443`** over **HTTP/2 + TLS 1.2+**, the Apple network **`17.0.0.0/8`** must be open on the external firewall, and devices on Wi-Fi need **TCP 5223** open to APNs; **TCP 443** open inbound/outbound. Apple blocks SSL inspection — disable HTTPS interception for Apple domains.
- **Android:** managed Google Play account; the Google push service (**GCM/FCM**) requires **TCP ports 5228, 5229, 5230** open when devices use Wi-Fi, plus connectivity to all IPs in Google's ASN 15169.
- **Windows:** the **Windows Notification Service (WNS)** path requires **HTTPS 9383 and 8383** (server↔MDM agent), **TCP 443** (server↔WNS), and reachability to `https://login.live.com` and `https://*.notify.windows.com`.
- AD integration for credential-based enrollment; CSV for bulk; OTA channel.
- Terminology: *OTA*, *ownership-based enrollment*, *APNs/GCM/FCM/WNS*, *container*, *corporate wipe vs full wipe*, *App Catalog / ME MDM app*, *VPP/managed distribution*, *Exchange ActiveSync*, *geo-location*, *blocklist/allowlist*, *single-app kiosk*, *conditional access*, *Content Repository/Catalog*.

### Settings / options reference

**Enrollment methods.**

| Method | How it works | Auth | Best for |
| --- | --- | --- | --- |
| Automatic / OTA | Device receives a management profile over the air | OTP or AD | Standard self-service enrollment |
| Manual | Admin-initiated per device | OTP or AD | Small/controlled rollouts |
| Bulk (CSV) | Import device list via CSV | OTP or AD | Large fleets |
| Self-enrollment | User enrolls their own device | OTP or AD | BYOD |
| Windows Autopilot | Automates dual onboarding of modern Win10/11 laptops in one step | Azure/Intune | Modern Windows laptops |

All enrollment assigns an **ownership** (corporate vs personal/BYOD), which determines downstream policy/containerization. Post-enrollment, use `Enrollment → Actions → Verify Connectivity` to confirm the device is reachable over its push channel.

**Wipe scope.**

| Action | Effect | Use case |
| --- | --- | --- |
| Remote lock | Locks the device | Lost/idle device |
| Complete (full) wipe | Factory-reset equivalent; all data removed | Corporate-owned, lost/decommissioned |
| Corporate wipe | Removes only managed/container data; personal data intact | BYOD offboarding |
| Selective email wipe | Removes the corporate email account/data only | Email-only deprovision |

### Push-service deep dive (why "device not reachable" happens)

MDM cannot send any command (scan, lock, wipe, install app, associate profile) without a working push channel to the device. Each platform uses a different service, each with its own firewall/proxy requirements:

- **iOS — APNs (Apple Push Notification service).** The MDM server connects to `api.push.apple.com:443` using **HTTP/2 over TLS 1.2+**. The Apple network block **`17.0.0.0/8`** must be open on the external firewall. Devices on Wi-Fi need **TCP 5223** open to reach APNs; **TCP 443** must be open inbound/outbound. Apple rejects connections subject to SSL inspection — **HTTPS interception must be disabled for Apple domains**. The APNs certificate (uploaded to the server) is the identity binding the org to Apple; it is **annually renewable** and format-sensitive (`.pem` on Build 90072+, `.p12` earlier).
- **Android — GCM/FCM (Google).** Push requires **TCP 5228, 5229, 5230** open on the device Wi-Fi path and reachability to all IPs in **Google's ASN 15169**. GCM registration during enrollment fails if these are blocked ("Error While Registering GCM").
- **Windows — WNS (Windows Notification Service).** The server reaches WNS over **TCP 443** and must reach `https://login.live.com` and `https://*.notify.windows.com`; the server↔MDM agent path uses **HTTPS 9383 and 8383**.

## 2. UX lens

### Primary user roles & jobs-to-be-done

- **MDM admin** — enroll fleets, push profiles/apps/content, secure lost/stolen devices, separate corporate/personal data, gate access via conditional access.
- **Help desk** — remote-troubleshoot devices, lock/wipe on loss, verify compliance/connectivity.
- **End user (BYOD)** — self-enroll, get corporate apps via App Catalog and documents via Content Catalog, keep personal data private.

### Key workflows / screen flows (step by step)

**A. APNs setup (iOS prerequisite):** generate an APNs certificate, then upload it to the MDM server in the correct format (`.pem` for Build 90072+, `.p12` for older). Renew annually before expiry.

**B. Enroll:** `MDM → Enrollment` → choose automatic/manual/OTA, or bulk via CSV, or self-enroll → authenticate (OTP or AD) → assign ownership (corporate/BYOD) → device joins a group. Verify with `Enrollment → Actions → Verify Connectivity`.

**C. Policy/profile:** `MDM → Profiles` → create policy (passcode/restrictions/Wi-Fi/VPN/email) → associate to a department/ownership group.

**D. Apps (MAM):** `MDM → Apps` → add Store/in-house app (VPP for iOS / managed Google Play for Android) → distribute to group/device → track status; manage allowlist/blocklist; apps surface in the end-user App Catalog.

**E. Content distribution:** `Device Mgmt → Content Management` → **Add Documents** (drag-and-drop/browse) → add Tags → Done. Optionally **Create/Select Policy** (open-with, clipboard, screenshot restriction, passcode prompt, removable, download manual/auto, Wi-Fi-only) → select groups/devices → **Distribute**. Users view in ME MDM app → Content Catalog (List/Folder view, favorites, offline).

**F. Secure:** `MDM → Security` → remote lock / locate / complete wipe / corporate wipe.

**G. Conditional access:** configure under Security Management to allow only compliant/authorized devices to reach corporate resources.

**H. Kiosk / email:** create a kiosk profile (allowed app(s) + home screen + restrict task manager/status bar); configure Email via Exchange ActiveSync + containerization + selective wipe.

### UX research hooks (friction, usability, where users get stuck, opportunities)

- APNs certificate setup/renewal for iOS is a notorious onboarding cliff (annual renewal; format changed to `.pem` at Build 90072 — wrong format/expiry both throw "Invalid APNs"). Opportunity: renewal reminders, format auto-detect, and a built-in "Verify Connectivity" surfaced prominently.
- The push-service port matrix (5223 for APNs, 5228-5230 for GCM/FCM, 9383/8383/443 for WNS) is the hidden cause of most "not reachable" failures; a pre-enrollment connectivity checker per platform would prevent tickets.
- Ownership tagging at enrollment drives everything downstream; mis-tagging breaks BYOD privacy/policy — needs a clear, hard-to-miss prompt.
- Corporate wipe vs full wipe is high-stakes; a preview of exactly what gets removed reduces accidental data loss.
- VPP redemption-code exhaustion is a recurring surprise; low-count notifications help — validate timing.
- Content screenshot-restriction has a hidden dependency: for Profile-Owner (work-profile) Android devices, screenshots are disabled by default, so Screen Restriction must be set to Allow under Profiles → Restrictions → Device Functionality. Surface this conflict in the policy UI.

### Notable UI patterns/components

- Enrollment wizard with ownership selector + Verify Connectivity action; group manager (department/location/ownership); App Catalog + distribution status; Content Repository (Add Documents, Tags, policy selector, Distribute); security action panel (lock/locate/wipe); kiosk profile builder; report generator (predefined/custom, scheduled).

## 3. PM lens

### Value proposition & business outcomes

- Single console for desktop + mobile; reduces attack surface from mobile access to corporate resources; enables BYOD cost savings while protecting corporate data; compliance via audits/reports, conditional access, and selective/corporate wipe.

### Target personas & use cases

- Enterprises with mixed corporate/BYOD fleets; field/frontline kiosk devices; regulated industries needing containerization and selective wipe; organizations standardizing app distribution via VPP/managed Google Play and secure document distribution.

### Competitive positioning / differentiators

- MDM embedded in UEM (vs standalone EMM) so desktops + mobile share one console; corporate-vs-personal containerization; VPP + managed Google Play; in-house enterprise app catalog; secure Content Catalog with per-platform DLP-style policies. ManageEngine also offers standalone **Mobile Device Manager Plus** (on-prem + cloud).

### Edition gating & packaging

- MDM bundled in Endpoint Central; standalone available as MDM Plus (on-prem/cloud). Content Distribution is available in **Professional, Free, and Trial** MDM editions. **MDM Cloud caps content distribution at 1 GB total.** APNs format/handling differs by Endpoint Central build (90072+).

### Product expansion opportunities / gaps / roadmap ideas (analysis)

- Deeper Zero-Trust conditional access (richer device-posture signals gating access).
- Modern Android Enterprise work-profile parity and Apple Business Manager / ADE automation surfaced clearly.
- Per-app VPN and modern MAM without enrollment (app-level containerization for unmanaged devices).
- Restore Windows content distribution (discontinued with Windows Business Store) via a modern channel.
- Privacy transparency dashboard for BYOD users; automated APNs renewal.

## 4. Developer / Technical lens

### Architecture & components

- Server + per-platform push/notification infrastructure + on-device MDM profiles and the **ME MDM app** (Content Catalog, app distribution). iOS uses the native MDM framework + **APNs**; Android uses managed Google Play + **GCM/FCM**; Windows uses native MDM + **WNS**.

### Agent mechanics / protocols

- **APNs** wakes iOS devices to check in for commands (scan/lock/wipe/install, associate profiles). The MDM server connects to `api.push.apple.com:443` over HTTP/2 + TLS 1.2+.
- **GCM/FCM** delivers push to Android during enrollment and management; requires Google ASN 15169 reachability and ports 5228-5230 on Wi-Fi.
- **WNS** delivers push to Windows; server↔WNS over TCP 443, server↔agent over HTTPS 9383/8383.
- **OTA enrollment** delivers a configuration/management profile; **Exchange ActiveSync** for email; **VPP managed distribution** assigns licenses/apps; CSV import for bulk enrollment.
- **Containerization** separates corporate/personal data so corporate wipe targets only managed data.
- Content is stored in a server-side **Content Repository**; only the latest version of a document is retained; the **ME MDM app** renders content securely on-device.

### Ports, protocols, integrations, APIs

| Platform | Push service | Key endpoints | Ports |
| --- | --- | --- | --- |
| iOS | APNs | `api.push.apple.com`, `17.0.0.0/8` | 443 (server, HTTP/2+TLS1.2+), 5223 (device Wi-Fi) |
| Android | GCM/FCM | Google ASN 15169 | 5228, 5229, 5230 (device Wi-Fi) |
| Windows | WNS | `login.live.com`, `*.notify.windows.com` | 443 (server↔WNS), 9383/8383 (server↔agent, HTTPS) |

- Integrations: Apple VPP, managed Google Play / Play for Work, Exchange ActiveSync, Active Directory.
- REST API (`/api/`) for device/app/policy automation *(inferred; not detailed on the MDM help pages)*.

### Data model / key objects, scalability

- Objects: Device (ownership: corporate/BYOD), Group (department/location/ownership), Profile/Policy, App (Store/in-house, allowlist/blocklist, VPP licenses), Content/Document (+ Tags, content policy), Email account, Container, Kiosk profile, Conditional Access policy, Report, Certificate (APNs). *(Some names inferred.)*
- Scales via grouping, OTA push, and bulk CSV enrollment; group-based content/app auto-assignment to new devices.

### Technical limitations

- Platform-specific gaps: VPP/managed distribution iOS-only; Android needs managed Google Play; APNs cert renewal is a hard annual dependency with a build-specific format.
- Windows MDM native content app discontinued (Windows Business Store deprecation).
- MDM Cloud content distribution capped at 1 GB total.
- BYOD management depends on user consent/enrollment; some controls unavailable on unmanaged devices.

## 5. Support / Troubleshooting lens

Format: **symptom → cause → fix**, drawn from the official MDM knowledge base.

### APNs / iOS

- **"Invalid APNs Certificate"** (on upload) → wrong file format, incorrect APNs password (builds < 90072), or expired certificate (builds < 90072) → upload **`.pem`** for Build 90072+ (`.p12` for older builds); use the exact password used to create the certificate; if expired, regenerate a new APNs certificate and re-upload.
- **"APNs not reachable" / "Unable to access api.push.apple.com"** → host/port blocked, expired certificate, or a proxy/firewall/web-filter (incl. SSL inspection) interfering → open `api.push.apple.com:443` (HTTP/2 + TLS 1.2+), Apple `17.0.0.0/8` on the external firewall, **TCP 5223** for devices on Wi-Fi, and TCP 443 inbound/outbound; upload the latest APNs cert; configure proxy auth correctly and whitelist the MDM server; **disable HTTPS interception/SSL inspection for Apple domains**; verify with `Enrollment → Actions → Verify Connectivity`. (Applies to On-Premise / Endpoint Central On-Premise.)
- **"APNs not reachable due to 5223 port block"** → same as above — **TCP 5223** is blocked on the device's Wi-Fi path → open TCP 5223 (and 443) on the firewall/proxy.
- **"APNs mismatch" / "APNs not recognized"** → the uploaded APNs cert does not match the one that enrolled the devices (e.g., a different Apple ID/cert was used) → re-upload the original matching APNs certificate; if it was regenerated, devices may need re-enrollment (KB *mdm-apns-mismatch*, *mdm-apns-not-recognized*).
- **"SSL certificate name mismatch"** → server SSL CN/SAN doesn't match the URL devices use → install a matching certificate (KB *ssl-certificate-name-mismatch*).

### Profiles / commands

- **"Command Format Error"** (associating a profile to groups/devices) → the profile created by the admin is not compatible/applicable per iOS policies → contact Support with the Endpoint Central server logs (the profile must be corrected to a valid format).
- **"Device Scanning failed - Scanning time-out"** → device didn't respond to a scan in time → retry; verify push reachability (APNs/GCM/WNS) and that the device is online (KB *mdm-scanning-time-out*).

### Android / GCM-FCM

- **"Android device - enrollment failed" / "Error While Registering GCM"** → GCM registration incomplete because the required GCM ports are blocked → open **TCP 5228, 5229, 5230** on the firewall when the device uses Wi-Fi, and allow all IPs in Google's ASN 15169 (`http://bgp.he.net/AS15169`).
- **"GCM service not available" / "Unable to reach GCM" / "GCM authentication failed"** → GCM/FCM connectivity or auth issue → verify the 5228-5230 ports and ASN 15169 reachability; re-check Google account configuration (KB *mdm-android-gcm-service-not-available*, *mdm-unable-to-reach-gcm*, *mdm-gcm-authentication-failed*).
- **"Google Play Store not reachable"** → Play Store blocked on the device network → allow Play Store endpoints (KB *mdm-google-play-store-not-reachable*).
- **"Device Administrator disabled" / "Android account missing" / "Android agent not reachable"** → MDM device-admin revoked, no managed Google account, or the ME MDM agent unreachable → re-enable device administrator, add the managed account, and confirm agent connectivity (respective KBs).
- **"Wi-Fi Profile Failed" / "Unable to Locate Android Device"** → profile push or location lookup failed → verify push reachability and location permissions (respective KBs).

### Windows / WNS

- **"WNS (Windows Notification Service) not reachable"** → ports blocked or proxy not configured → open **HTTPS 9383 and 8383** (server↔agent) and **TCP 443** (server↔WNS); allow reachability to `https://login.live.com` and `https://*.notify.windows.com`; configure proxy auth if a proxy is present.

### App distribution

- **"App distribution failed - License Count exceeded" / "License Limit has reached"** → insufficient VPP redemption codes or device licenses → free/revoke unused VPP codes or raise the license count (KB *mdm-license-count-exceeded*, *mdm-license-limit-has-reached*).
- **App installation failed — "App store not reachable" / "App store disabled" / "Manifest file URL not reachable" / "App already installed"** → store/network/manifest issue or app already present → allow store/manifest endpoints, enable the store, or ignore (already installed) per the respective KBs.
- **"App Lock Profile Failed" (unable to retrieve app data)** → app metadata couldn't be fetched → retry; verify store reachability (KB *mdm-unable-to-retrieve-app-data*).
- **"Developer Provisioning Profile Detected in IPA"** → an in-house iOS app was signed with a developer (not distribution) provisioning profile → re-sign the IPA with a distribution profile (KB *mdm-developer-provisioning-profile-detected*).

### Content

- **Screenshots of distributed content fail on Android work-profile devices** → for Profile-Owner devices, screenshots are disabled by default during work-profile creation → set Screen Restriction to **Allow** under `Profiles → Restrictions → Device Functionality`.
- **Content distribution fails / size error on Cloud** → MDM Cloud caps total distribution files at **1 GB** → reduce the total file size.

### Quick-reference troubleshooting matrix

| Symptom (error) | Platform | Likely cause | First fix |
| --- | --- | --- | --- |
| Invalid APNs Certificate | iOS | Wrong format / wrong password / expired | Upload `.pem` (Build 90072+); correct password; regenerate if expired |
| APNs not reachable / can't access api.push.apple.com | iOS | Port/host blocked, proxy, SSL inspection, expired cert | Open 443+5223 + `17.0.0.0/8`; disable HTTPS interception for Apple; renew cert; Verify Connectivity |
| APNs not reachable - 5223 block | iOS | TCP 5223 blocked on device Wi-Fi | Open TCP 5223 (and 443) |
| APNs mismatch / not recognized | iOS | Uploaded cert differs from the one that enrolled devices | Re-upload the matching cert; re-enroll if regenerated |
| SSL certificate name mismatch | All | Server cert CN/SAN mismatch | Install a matching SSL certificate |
| Command Format Error | iOS | Profile incompatible with iOS policy | Contact Support with server logs; fix the profile |
| Device Scanning failed - time-out | All | Device didn't respond | Retry; verify push + device online |
| Android enrollment failed / Error Registering GCM | Android | GCM ports blocked | Open TCP 5228-5230; allow Google ASN 15169 |
| GCM service not available / unable to reach / auth failed | Android | GCM/FCM connectivity/auth | Verify 5228-5230 + ASN 15169; recheck Google account |
| Google Play Store not reachable | Android | Play Store blocked | Allow Play Store endpoints |
| Device Administrator disabled / account missing / agent not reachable | Android | Admin revoked / no managed account / agent down | Re-enable admin; add account; confirm agent connectivity |
| WNS not reachable | Windows | Ports blocked / proxy | Open 9383, 8383, 443; allow login.live.com + *.notify.windows.com |
| App distribution failed - License Count exceeded / limit reached | iOS | Insufficient VPP codes/licenses | Free/revoke VPP codes; raise license count |
| App install failed - store/manifest issues | iOS/Android | Store/manifest blocked or app present | Allow endpoints; ignore if already installed |
| Developer Provisioning Profile Detected in IPA | iOS | In-house app signed with dev profile | Re-sign with a distribution profile |
| Screenshots of content fail (work profile) | Android | Screen Restriction disabled by default | Set Screen Restriction = Allow under Profiles → Restrictions → Device Functionality |

### Diagnostics

- Device check-in/scan status; push connectivity per platform (APNs/GCM-FCM/WNS); `Enrollment → Actions → Verify Connectivity`; app/content deployment status reports; compliance scan results; collect Endpoint Central server logs for Support.

### FAQs

- *Which platforms?* iOS, Android, Windows (plus modern devices: rugged/IoT/TV/Chromebook/etc.).
- *What APNs format do I upload?* `.pem` for Endpoint Central Build 90072 and above; `.p12` for earlier builds.
- *Why are devices "not reachable"?* Almost always a blocked push path: APNs (443/5223 + `17.0.0.0/8`), GCM/FCM (5228-5230 + ASN 15169), or WNS (443/9383/8383).
- *Can I separate personal and corporate data?* Yes — ownership-based enrollment + containerization + corporate wipe.
- *How do users get apps/documents?* Apps via the App Catalog; documents via the ME MDM app's Content Catalog.
- *Mobile-only option?* Yes — Mobile Device Manager Plus (on-prem/cloud).

### Useful KB / help references

- MDM feature: https://www.manageengine.com/products/desktop-central/mobile-device-management-mdm.html
- Device onboarding: https://www.manageengine.com/products/desktop-central/help/device-onboarding.html
- Conditional Access: https://www.manageengine.com/products/desktop-central/help/mobile_device_management/security_management/conditional_access.html
- Content Distribution: https://www.manageengine.com/mobile-device-management/help/content_management/mdm_document_distribution.html
- KB: Invalid APNs: https://www.manageengine.com/products/desktop-central/mdm-invalid-apns.html
- KB: APNs not reachable / 5223 block: https://www.manageengine.com/mobile-device-management/kb/mdm-apns-not-reachable.html
- KB: Command Format Error: https://www.manageengine.com/products/desktop-central/mdm-command-format-error.html
- KB: Android enrollment failed (GCM): https://www.manageengine.com/products/desktop-central/mdm-android-enrollment-failed.html
- KB: WNS not reachable: https://www.manageengine.com/mobile-device-management/kb/mdm-wns-not-reachable.html
- MDM KB category: https://www.manageengine.com/products/desktop-central/knowledge-base.html

## Cross-references
- [configuration-management.md](configuration-management.md) — shared profile/kiosk concepts and OEM profiles.
- [remote-troubleshooting.md](remote-troubleshooting.md) — remote control/troubleshooting of mobile devices.
- [os-deployment.md](os-deployment.md) — provisioning analog for desktops/laptops; modern-laptop dual onboarding.

## Sources
- https://www.manageengine.com/products/desktop-central/mobile-device-management-mdm.html
- https://www.manageengine.com/products/desktop-central/bring-your-own-device-byod.html
- https://www.manageengine.com/products/desktop-central/mobile-application-management-mam.html
- https://www.manageengine.com/products/desktop-central/help/device-onboarding.html
- https://www.manageengine.com/products/desktop-central/help/mobile_device_management/security_management/conditional_access.html
- https://www.manageengine.com/mobile-device-management/help/content_management/mdm_document_distribution.html
- https://www.manageengine.com/products/desktop-central/mdm-invalid-apns.html
- https://www.manageengine.com/mobile-device-management/kb/mdm-apns-not-reachable.html
- https://www.manageengine.com/products/desktop-central/mdm-command-format-error.html
- https://www.manageengine.com/products/desktop-central/mdm-android-enrollment-failed.html
- https://www.manageengine.com/mobile-device-management/kb/mdm-wns-not-reachable.html
- https://www.manageengine.com/products/desktop-central/knowledge-base.html
