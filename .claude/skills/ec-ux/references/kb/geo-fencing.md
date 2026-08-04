# Geo-Fencing

> Create virtual geographic perimeters and automatically trigger security actions when a managed device leaves the fence. Parent module: [Mobile Device Management](mobile-device-management.md). Edition/point product: available in **Professional, Free, and Trial** editions of MDM (Mobile Device Manager Plus); bundled in Endpoint Central UEM (advanced asset/security management).

## 1. What it is — Feature detail

Geo-fencing lets IT administrators restrict the usage of corporate devices to certain regions (such as office premises) by creating virtual fences — **geo-fences** — based on real-world geography. It is ideal for enterprises with stringent compliance standards that require devices holding sensitive data to remain on premises at all times. MDM lets you define security policies around the virtual perimeter so there is no unauthorized corporate data access when a device strays.

### Supported platforms

- **iOS:** geofencing available with accurate location tracking and policy enforcement.
- **Android:** geofencing available; actions triggered on location events (entry/exit).

### Prerequisites

- MDM server running **build #92516 or later** (shown top-right on the MDM server).
- ME MDM app on **Android 9.2.400 A or later**.
- ME MDM app on **iOS 9.2.313 or later**.

### Two-step configuration model

Geo-fencing is configured in two stages: **(1) create a geo-fence** (the perimeter) and **(2) create a geo-fence policy** (the rule + actions), then distribute the policy to groups/devices.

### Step 1 — Create a geo-fence

- `Device Mgmt → Fence Repository` (under Geofencing) lists previously created fences.
- **Create Fence** → provide a fence name.
- Search/select a center location on the map; the address and coordinates auto-populate.
- Specify a **radius** — fences can be as large as **500 km**.
- **Create** to add it to the Fence Repository. Modify/delete via the ellipsis.

### Step 2 — Create a geo-fence policy

- `Device Mgmt → Fence Policy` lists existing policies.
- **Create Policy** → provide a name.
- **Define a rule:** choose the geo-fence; devices that leave it are marked **non-compliant**.
- **Define actions** for non-compliant devices:
  - **Security commands:** mark the device as lost via **Lost Mode**, ring an **alarm**, **wipe device data** and **wipe the memory-card data**.
  - **Notifications:** email alert to the IT administrator (message customizable).
  - Actions execute **immediately** or **after a day**. For commands to run, the device must be in contact with the server.
- **Create Policy**, then **Distribute to devices** (select groups/devices) via the ellipsis. Modify/delete or remove associations later via the ellipsis.

### Behavior notes

- When a device is marked non-compliant, the admin is notified by (customizable) email.
- If a geofencing policy can't apply to an iOS device, open the ME MDM app on the device and retry.
- Location tracking for **Wi-Fi-only devices is less accurate** (depends on Wi-Fi/Bluetooth).
- **Android:** geofencing actions execute even when the device is **offline**.
- **iOS:** the device must be **online and connected** for geofencing actions to occur.
- **Delayed-wipe grace:** if a policy wipes after 24h outside the fence but the device re-enters within that window, the wipe is **automatically canceled** — protecting data when the device returns to a trusted area in time.
- **Android camera block:** the Camera app can be blocked on a geo-fence violation if **Block Camera App for Geo-fence** is enabled while configuring the Camera application.

## 2. UX lens

### Console navigation

`Device Mgmt → Fence Repository` (fences) and `Device Mgmt → Fence Policy` (rules + actions).

### Step-by-step workflow

1. **Create a fence:** name → pick center on map → set radius (up to 500 km) → Create.
2. **Create a policy:** name → select the fence (the non-compliance trigger) → choose actions (Lost Mode / alarm / wipe / SD wipe / admin email) and timing (immediate or after a day) → Create.
3. **Distribute** the policy to groups/devices.
4. **Monitor** non-compliance email alerts; reconcile iOS connectivity if a policy fails to apply.

### UX research hooks

- **Platform asymmetry (offline behavior)** is a major expectation gap: Android acts offline, iOS does not. Surface this prominently when building a policy targeting mixed fleets.
- **Wipe-after-a-day vs. immediate** is high-stakes; the auto-cancel-on-return behavior should be explained inline to reduce fear of accidental wipes.
- **Wi-Fi-only accuracy caveat** causes "false" non-compliance; flag low-accuracy devices.
- **iOS "open ME MDM app and retry"** is a hidden remediation step — surface it as an in-console hint.
- **500 km radius** is huge; guide admins toward sensible premises-sized radii.

### Notable UI patterns/components

Map-based fence builder (center + radius); Fence Repository list; Fence Policy builder (rule + action checklist + timing); distribution target picker; non-compliance email template editor.

## 3. PM lens

### Value proposition & business outcomes

Automates location-based IT security: devices holding sensitive data are confined to defined premises, and leaving the fence auto-triggers lock/alarm/wipe plus admin alerts — closing a compliance gap that manual monitoring can't. Particularly valuable for regulated industries and high-value/shared device fleets.

### Target personas & use cases

- **Compliance/security teams** — keep sensitive-data devices on premises; auto-respond to breaches.
- **Asset/ops managers** — track and recover constantly-moving devices; pair with location history.
- **Healthcare/finance/government** — strict on-premises data residency for corporate devices.

### Positioning & differentiators

Integrated into MDM/UEM with the same grouping/distribution model; combines a virtual perimeter with a configurable action set (Lost Mode, alarm, full + SD wipe, email) and a safety net (auto-cancel wipe on return). The Android-offline execution and the geo-fence-conditional camera block are notable differentiators.

### Edition / point-product gating

Available in **Professional, Free, and Trial** MDM editions; in Mobile Device Manager Plus this sits under advanced **Asset management (location history, geofencing, remote control)**. Bundled in Endpoint Central UEM. Requires server build **#92516+** and recent ME MDM app versions.

### Expansion opportunities

- **iOS offline enforcement** parity with Android.
- Improved accuracy for **Wi-Fi-only** devices.
- **Entry-based** triggers/actions (not just exit) and time-scheduled fences *(inferred)*.
- Per-fence app/function restrictions beyond the camera *(inferred)*.

## 4. Developer / Technical lens

### Mechanics

- A geo-fence = center coordinates + radius (≤500 km). The ME MDM app evaluates device location against the fence and reports compliance state.
- Policy actions ride the per-platform push/agent channel; commands require server contact (except Android, which can execute offline).
- **Android** geofence evaluation/actions run on-device and execute offline; **iOS** requires an online, server-connected device.
- Camera-block-on-violation is implemented via the Android Camera app configuration (`Block Camera App for Geo-fence`).

### Ports / protocols / limits

| Item | Value |
| --- | --- |
| Server build | #92516 or later (required) |
| ME MDM app (Android) | 9.2.400 A or later |
| ME MDM app (iOS) | 9.2.313 or later |
| Max fence radius | 500 km |
| Action timing | Immediate or after one day |
| Push ports | iOS APNs 443/5223; Android FCM 5228-5230 (see [mobile-device-management.md](mobile-device-management.md)) |

- Wi-Fi-only device location is less accurate (Wi-Fi/Bluetooth dependent).
- Delayed wipe auto-cancels if the device re-enters the fence within the configured window.

### Data model / key objects

Geo-fence (name, center coords, address, radius), Fence Policy (rule = fence, actions, timing), Compliance state (compliant/non-compliant), Distribution assignment. *(Some names inferred.)*

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
| --- | --- | --- |
| Geofencing policy won't apply to iOS device | iOS needs the ME MDM app engaged | Open the ME MDM app on the device and retry applying the policy |
| Actions don't fire on iOS when device is away | iOS requires online + server connection | Ensure the device is online/connected; iOS doesn't act offline |
| False non-compliance alerts | Wi-Fi-only device, low location accuracy | Expect reduced accuracy; prefer GPS-capable devices for strict fences |
| Device wiped unexpectedly / not wiped on return | Delayed-wipe window behavior | Re-entry within the window auto-cancels the wipe; confirm timing setting |
| Commands queued but not executing | Device not in contact with server | Restore connectivity; commands need server contact (Android can act offline) |
| Camera not blocked on violation (Android) | Block Camera App for Geo-fence not enabled | Enable it while configuring the Camera application |
| Old ME MDM app / old server build | Below required versions | Update server to #92516+ and ME MDM app to required versions |

### FAQs

- *Do actions work offline?* Android: yes. iOS: no — must be online and server-connected.
- *Will a 24h-delayed wipe still happen if the device returns?* No — re-entering within the window auto-cancels the wipe.
- *Can I block the camera on a violation?* Yes, Android, via Block Camera App for Geo-fence.
- *How big can a fence be?* Up to 500 km radius.
- *What actions are available?* Lost Mode, alarm, device wipe, memory-card wipe, and admin email — immediate or after a day.

## Cross-references
- [mobile-device-management.md](mobile-device-management.md) — parent module; location tracking, Lost Mode, wipe, push services.
- [kiosk-management.md](kiosk-management.md) — geofence-based alerts for kiosk/purpose-built fleets.
- [conditional-access.md](conditional-access.md) — complementary compliance-based access control.
- [byod-management.md](byod-management.md) — corporate-data protection on devices that leave premises.

## Sources
- https://www.manageengine.com/mobile-device-management/help/security_management/mdm_geofencing.html
- https://www.manageengine.com/products/desktop-central/help/mobile_device_management/security_management/geo-fencing.html (JS-rendered; canonical points to the help page above)
- https://www.manageengine.com/mobile-device-management/mdm-geofencing.html
- https://www.manageengine.com/mobile-device-management/mdm-what-is-geofencing.html
- https://www.manageengine.com/mobile-device-management/edition-comparison-matrix.html
