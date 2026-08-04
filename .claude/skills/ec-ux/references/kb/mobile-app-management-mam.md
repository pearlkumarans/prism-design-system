# Mobile Application Management (MAM)

> Distribute, configure, secure, and report on in-house and commercial apps over the air to managed mobile groups and devices. Parent module: [Mobile Device Management](mobile-device-management.md). Edition/point product: bundled in Endpoint Central UEM; available standalone in Mobile Device Manager Plus (Standard edition for store/custom-app distribution + config + blocklisting; advanced "App only management" / Office 365 MAM in Professional).

## 1. What it is — Feature detail

Mobile Device Management does not stop at configuring policies, gathering asset information, and securing a device. A complete MDM solution must also distribute and manage the apps installed on those devices. MAM is the Endpoint Central capability that lets administrators publish, update, configure, secure, and report on apps across iOS, iPadOS, Android, and Windows fleets — all over the air (OTA), without touching the device physically.

MAM groups into four pillars: **app management**, **app distribution**, **Apple VPP integration**, and **reports**.

### App management

- Manage apps **over-the-air (OTA)** to groups and devices.
- **Automatically fetch app information** from the Apple App Store and Google Play Store (name, icon, version, bundle/package ID).
- Maintain a **repository of all apps** used in the network — both store-sourced and in-house (enterprise) apps.
- View the **list of apps and their installation count** across managed devices.
- **Segregate blocklisted and allowlisted apps** to control what can run on managed devices.

### App distribution

- Seamless distribution of **in-house and Store apps** to groups/devices.
- Assign App Store apps, Play Store apps, and in-house apps to the **App Catalog** on each end user's device, from which they self-install.
- Get the **status** of deployed apps on users' devices (installed, pending, failed).
- **Remove apps** that are no longer required.
- **Silent install/update** — provisioned apps install automatically on kiosk-mode and supervised/work-profile devices; apps can also be silently updated at a scheduled time without user intervention *(silent update timing inferred from kiosk provisioning docs)*.

### Apple VPP integration (iOS/iPadOS)

- Integrates with Apple's **Volume Purchase Program** to install commercial apps in bulk.
- **Automatically assigns redemption codes** to users for installing apps.
- **Revokes unused redemption codes** so licenses can be reclaimed.
- **Notifies admins on insufficient redemption codes** before a distribution fails.
- Supports **managed distribution** (license-based assignment to Apple IDs / devices rather than one-time codes).

### Managed Google Play / Play for Work (Android)

Commercial app distribution for Android Enterprise runs through **managed Google Play** (Play for Work). Apps are approved in the managed Play iframe and pushed to work profiles / fully managed devices. *(Mechanism named on the MDM feature page; per-app config detail inferred.)*

### App configuration & permissions

Managed app configurations (iOS and Android Enterprise) let admins preconfigure parameters such as account type, domain name, preferred authentication method, and email signature so an app is corporate-ready immediately after install (e.g., Outlook, Gmail, Apple Mail, Samsung Email, Zoho Mail, IBM Verse). App permissions (e.g., storage, contacts, location) can be force-enabled, force-disabled, or left user-controlled before distribution. *(Drawn from the email-management app-config workflow.)*

### Reports

- Comprehensive reports to monitor apps installed on devices.
- Predefined examples: **Apps by Devices** (apps available per device) and **Devices with/without specific App** (coverage of a given app).

### Allowlist / blocklist

Apps are segregated into allowlisted (permitted) and blocklisted (prohibited) sets. Blocklisting prevents disallowed apps from running on managed devices; allowlisting restricts the device to an approved set. This is distinct from kiosk lockdown but complementary to it.

## 2. UX lens

### Console navigation

`MDM → Apps` (app repository, distribution, VPP, blocklist/allowlist, reports). VPP setup lives under the Apple integration area of Enrollment/Apps; managed Google Play under the Android Enterprise binding.

### Step-by-step workflow

1. **Add an app.** `MDM → Apps → Add App` → choose App Store / Play Store / in-house (upload IPA/APK). Store metadata auto-populates.
2. **(iOS) Buy licenses via VPP.** Configure the VPP token; purchased licenses sync into the repository.
3. **Distribute.** Select the app → choose target groups/devices → push. App appears in the user's **App Catalog**; install can be silent (supervised/work-profile/kiosk) or user-initiated.
4. **Configure.** Attach a managed app configuration / permission set so the app is corporate-ready on first launch.
5. **Govern.** Maintain allowlist/blocklist; track install status; remove apps no longer needed; revoke unused VPP codes.
6. **Report.** Run "Apps by Devices" or "Devices with/without specific App."

### UX research hooks

- **VPP redemption-code exhaustion** is a recurring surprise; low-count notifications help, but admins still hit "License Count exceeded." Validate whether the warning fires early enough.
- **In-house iOS signing** is an onboarding cliff: an IPA signed with a developer (not distribution) provisioning profile fails with "Developer Provisioning Profile Detected." Surface a pre-upload signing check.
- **App Catalog discoverability** — users may not know where corporate apps live; an in-app prompt after enrollment reduces tickets.
- **Silent vs. user-initiated install** differs by enrollment mode (supervised/work-profile silent; BYOD often user-tap). Make the expected behavior explicit in the distribution UI.
- **Allowlist/blocklist vs. kiosk** confusion — users conflate the two; clarify that blocklist blocks named apps while kiosk locks the device to named apps.

### Notable UI patterns/components

App repository grid with install counts; Add App wizard (store search / in-house upload); VPP token manager with license counters; distribution target picker (groups/devices); App Catalog (end-user); blocklist/allowlist manager; report generator.

## 3. PM lens

### Value proposition & business outcomes

One console publishes both commercial and proprietary apps to mixed iOS/Android/Windows fleets, removing manual sideloading and per-device store sign-ins. License governance (VPP revoke/reclaim) controls spend; allowlist/blocklist and managed config reduce the mobile attack surface and make apps secure-by-default on first launch.

### Target personas & use cases

- **MDM admin / app owner** — curate the corporate App Catalog, push line-of-business apps, manage licenses.
- **Procurement / IT finance** — reclaim unused VPP licenses; right-size purchases via low-code alerts.
- **Frontline/kiosk fleets** — silent install/update of purpose-built apps without user action.
- **BYOD users** — self-serve corporate apps from the App Catalog while personal apps stay untouched.

### Positioning & differentiators

MAM is embedded in UEM, so desktop software deployment and mobile app distribution share one console. VPP managed distribution (iOS) + managed Google Play (Android) + an in-house enterprise App Catalog + per-app managed configuration cover the full commercial-and-custom app lifecycle.

### Edition / point-product gating

In Mobile Device Manager Plus, store/custom-app distribution, app configuration, permission management, updates, and blocklisting are in the **Standard** edition. Advanced **"App only management" (Office 365 MAM policies)** is a **Professional** capability. The **Free** edition is fully featured for up to 25 devices. MAM is bundled into Endpoint Central UEM.

### Expansion opportunities

- Modern **MAM-without-enrollment** (app-level containerization on unmanaged BYOD).
- Richer per-app VPN tied to app distribution.
- App-reputation/risk scoring feeding the blocklist automatically.
- Automated VPP license reclamation policies (idle-license clawback).

## 4. Developer / Technical lens

### Mechanics

App commands ride the same per-platform push channel as all MDM commands; the server cannot trigger an install/update/removal without a working push path.

| Platform | Push service | Key endpoints | Ports |
| --- | --- | --- | --- |
| iOS/iPadOS | APNs | `api.push.apple.com`, `17.0.0.0/8` | 443 (server, HTTP/2 + TLS 1.2+), 5223 (device Wi-Fi) |
| Android | GCM/FCM | Google ASN 15169 | 5228, 5229, 5230 (device Wi-Fi) |
| Windows | WNS | `login.live.com`, `*.notify.windows.com` | 443 (server↔WNS), 9383/8383 (server↔agent, HTTPS) |

- **VPP managed distribution** assigns licenses/apps to Apple IDs or devices via a VPP token; the App Store / manifest URL must be reachable from the device.
- **In-house iOS apps** require a distribution (not developer) provisioning profile and a reachable manifest file URL.
- **Managed Google Play** binds an Android Enterprise managed account; approved apps push to work profiles / fully managed devices.
- **Managed app configuration** delivers key/value config and permission grants alongside the app.

### Limits (inferred unless noted)

- VPP/managed distribution is **iOS-only**; Android requires managed Google Play (documented).
- Install/update silence depends on enrollment mode (supervised/work-profile/kiosk silent; BYOD often user-initiated) *(inferred)*.
- App distribution fails on blocked store/manifest endpoints or insufficient VPP codes (documented error states).

### Data model / key objects

App (Store/in-house, version, bundle/package ID, allowlist/blocklist flag, VPP license count), App Catalog assignment, App Config profile, Distribution job + status, VPP token. *(Object names partly inferred.)*

## 5. Support / Troubleshooting lens

| Symptom (error) | Platform | Likely cause | First fix |
| --- | --- | --- | --- |
| App distribution failed — License Count exceeded / License Limit reached | iOS | Insufficient VPP redemption codes or device licenses | Free/revoke unused VPP codes; raise license count |
| App installation failed — App store not reachable / disabled | iOS/Android | Store blocked on device network or store disabled by policy | Allow store endpoints; enable the store |
| App install failed — Manifest file URL not reachable | iOS | In-house app manifest URL unreachable | Allow/serve the manifest URL over HTTPS |
| App already installed | iOS/Android | App present | Ignore — benign |
| App Lock Profile Failed (unable to retrieve app data) | iOS | App metadata couldn't be fetched | Retry; verify store reachability |
| Developer Provisioning Profile Detected in IPA | iOS | In-house app signed with a developer profile | Re-sign the IPA with a distribution provisioning profile |
| App not reaching device at all | All | Push channel blocked | Verify APNs (443/5223 + 17.0.0.0/8), GCM/FCM (5228-5230 + ASN 15169), or WNS (443/9383/8383) |

### FAQs

- *Where do users get corporate apps?* From the **App Catalog** on their device.
- *iOS commercial app licensing?* Via **Apple VPP** (redemption codes or managed distribution); revoke unused codes to reclaim.
- *Android commercial apps?* Via **managed Google Play / Play for Work**.
- *Can I stop specific apps from running?* Yes — **blocklist** them (or use allowlist to permit only approved apps).
- *Can apps install/update silently?* Yes on supervised/work-profile/kiosk devices; BYOD installs are often user-initiated *(inferred)*.

## Cross-references
- [mobile-device-management.md](mobile-device-management.md) — parent module; enrollment, push services, profiles.
- [kiosk-management.md](kiosk-management.md) — silent app provisioning/updates in kiosk mode.
- [byod-management.md](byod-management.md) — App Catalog on personal devices; corporate app delivery without touching personal data.
- [email-management.md](email-management.md) — managed app configuration for email clients (Outlook, Gmail, Zoho Mail).

## Sources
- https://www.manageengine.com/products/desktop-central/mobile-application-management-mam.html
- https://www.manageengine.com/mobile-device-management/mobile-email-management.html (app configuration/permissions detail)
- https://www.manageengine.com/mobile-device-management/single-app-lock-kiosk-mode-mdm.html (silent install/update in kiosk)
- https://www.manageengine.com/mobile-device-management/edition-comparison-matrix.html (edition gating)
- https://www.manageengine.com/products/desktop-central/mobile-device-management-mdm.html
