# BYOD Management (Bring Your Own Device)

> Enroll and manage employee-owned devices separately from corporate ones, separating work and personal data via ownership-based enrollment and containerization, with corporate (selective) wipe on offboarding. Parent module: [Mobile Device Management](mobile-device-management.md). Edition/point product: BYOD enrollment is in the **Standard** edition of Mobile Device Manager Plus; bundled in Endpoint Central UEM.

## 1. What it is — Feature detail

Enterprises increasingly let employees access corporate resources from their own devices. BYOD demands a management approach that **differentiates corporate from employee-owned devices** and manages them separately, because the policies/restrictions for each differ — corporate devices can be tightly controlled, while BYOD must preserve user privacy. Endpoint Central's MDM enrolls devices **by ownership** and creates separate groups so policies/restrictions apply appropriately.

### Benefits of allowing BYOD

- Reduce the overhead cost of procuring mobile devices for employees.
- Increase collaboration between employees.
- Increase productivity by letting employees access corporate resources from anywhere.

### Managing BYOD with Endpoint Central

- **Enroll devices based on ownership** (corporate vs personal). Ownership assigned at enrollment drives every downstream policy/containerization decision.
- **Create separate groups** for BYOD and corporate devices.
- **Define separate policies** for BYOD and corporate devices (privacy-preserving for personal devices).
- **Wipe corporate data, leaving user data untouched**, when employees leave the organization.

### Work / personal separation (containerization)

BYOD relies on **containerization** to keep corporate and personal data apart on a single device:

- Enroll by ownership, then create distinct BYOD vs corporate groups and policies.
- Corporate-data wipe targets only managed/container data; personal data is intact (e.g., on offboarding).
- **Email containerization:** restrict corporate email access to only managed apps; secure attachments in the ME MDM app's Document Viewer; block syncing to personal cloud/non-work apps (see [email-management.md](email-management.md)).
- **Content containerization:** distribute documents that open only in the ME MDM app, with clipboard/screenshot/passcode restrictions (see [content-management.md](content-management.md)).

### Wipe scope on BYOD

| Action | Effect | BYOD use case |
| --- | --- | --- |
| Selective email wipe | Removes only the corporate email account/data | Email-only deprovision |
| Corporate (selective) wipe | Removes only managed/container data; personal data intact | Employee offboarding |
| Complete (full) wipe | Factory reset — all data | Generally reserved for corporate-owned devices, not BYOD |

### Access control for BYOD

- **Conditional Exchange Access** is the canonical BYOD control: corporate mail is reachable only from MDM-authorized devices (see [conditional-access.md](conditional-access.md)).
- **App Catalog** delivers corporate apps to personal devices without touching personal apps (see [mobile-app-management-mam.md](mobile-app-management-mam.md)).

## 2. UX lens

### Console navigation

`MDM → Enrollment` (assign ownership = personal/BYOD; self-enrollment for users); `MDM → Profiles` (BYOD-specific policy groups); `MDM → Security` (corporate wipe).

### Step-by-step workflow

1. **Self-enroll** the personal device (`MDM → Enrollment`); authenticate via OTP or AD.
2. **Assign ownership = personal/BYOD** — this is the pivotal step that drives containerization and policy.
3. **Place in a BYOD group**; apply privacy-preserving BYOD policies/restrictions.
4. **Deliver corporate resources:** managed email (containerized), App Catalog apps, sandboxed content.
5. **Govern access:** layer Conditional Exchange Access so only authorized devices reach corporate mail.
6. **Offboard:** issue a **corporate wipe** — managed data removed, personal data untouched.

### UX research hooks

- **Ownership tagging at enrollment** drives everything downstream; mis-tagging a personal device as corporate breaks privacy and applies the wrong policy. Needs a clear, hard-to-miss prompt.
- **Corporate wipe vs full wipe** is the highest-stakes BYOD action; a preview of exactly what gets removed reduces accidental personal-data loss.
- **Privacy transparency** — BYOD users worry about what IT can see/do; a privacy summary at enrollment builds trust.
- **Self-enrollment funnel** — the user-driven path must be frictionless; tie it to the Conditional Exchange Access grace-period mail (self-enrollment URL) for conversion.
- **Container boundaries** — users confuse which apps/data are managed; visual separation (work vs personal) helps.

### Notable UI patterns/components

Enrollment wizard with prominent **ownership selector**; self-enrollment flow; BYOD vs corporate group manager; privacy-preserving policy templates; security action panel with **corporate wipe** (scoped preview); App Catalog and Content Catalog on the personal device.

## 3. PM lens

### Value proposition & business outcomes

Lets organizations cut device-procurement cost and boost productivity by securely embracing personal devices — without sacrificing corporate data control or employee privacy. Ownership-based separation + containerization + corporate wipe satisfy security/compliance while keeping personal data off-limits to IT, which drives BYOD adoption.

### Target personas & use cases

- **MDM admin** — onboard personal devices, apply privacy-safe policies, corporate-wipe on exit.
- **Employees** — use one device for work and personal life with assurance personal data is private.
- **HR/IT offboarding** — clean corporate-data removal without wiping the person's device.
- **CISO/compliance** — prove corporate data is contained and only authorized devices access it.

### Positioning & differentiators

BYOD is embedded in MDM/UEM: ownership-based enrollment, separate policy groups, containerization, App Catalog, and corporate (selective) wipe all in one console, with Conditional Exchange Access as the access gate. The clean "wipe corporate data, leave personal data untouched" promise is the core differentiator versus full-device management.

### Edition / point-product gating

BYOD enrollment (all zero-touch and BYOD enrollment methods) is in the **Standard** edition of Mobile Device Manager Plus. Containerization-dependent features like content management and conditional access are **Professional** (also Free/Trial). Bundled into Endpoint Central UEM.

### Expansion opportunities

- **MAM-without-enrollment** (app-level containerization on fully unmanaged BYOD).
- **Privacy dashboard** for BYOD users showing exactly what IT can and cannot do.
- Modern **Android Enterprise work-profile** and **Apple User Enrollment** parity surfaced clearly.
- Automated offboarding workflows (HR trigger → corporate wipe) *(inferred)*.

## 4. Developer / Technical lens

### Mechanics

- **Ownership-based enrollment:** at enrollment the device is tagged corporate or personal; this flag drives group membership, policy scope, and wipe behavior.
- **Containerization:** corporate apps/email/content are confined to a managed container (work profile on Android Enterprise; managed-app/account scope on iOS) so a **corporate wipe** removes only container data. *(Platform container mechanisms inferred from Android work-profile / Apple managed-account behavior.)*
- **Corporate wipe:** removes managed/container data and corporate accounts; personal data and apps remain.
- **Conditional Exchange Access** authorizes only enrolled devices for corporate mail (see [conditional-access.md](conditional-access.md)).
- Enrollment/commands ride the per-platform push channel (APNs / GCM-FCM / WNS) — see [mobile-device-management.md](mobile-device-management.md).

### Ports / protocols / limits

| Item | Value |
| --- | --- |
| Enrollment | Self-enrollment, OTA; auth via OTP or AD |
| Ownership | Corporate vs personal (drives policy/wipe) |
| Push ports | iOS APNs 443/5223; Android FCM 5228-5230; Windows WNS 443/9383/8383 |
| Wipe scopes | Selective email, corporate (container), complete |

- BYOD management depends on **user consent/enrollment**; some controls are unavailable on unmanaged devices.
- Work-profile screenshot/content behaviors differ from corporate (see content-management Screen Restriction note).

### Data model / key objects

Device (ownership: corporate/BYOD), Group (BYOD vs corporate), Policy/Profile (privacy-preserving for BYOD), Container, Email account, App Catalog assignment, Conditional Access policy, Wipe command (selective/corporate/complete). *(Some names inferred.)*

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
| --- | --- | --- |
| Wrong (over-restrictive) policy on a personal device | Device tagged corporate at enrollment | Re-tag ownership as personal/BYOD; move to the BYOD group |
| Personal data lost during deprovision | Full wipe issued instead of corporate wipe | Use **corporate wipe** for BYOD; reserve full wipe for corporate devices |
| Corporate mail still reachable after exit | Email not containerized / CEA not applied | Containerize email; apply Conditional Exchange Access |
| Personal device can't access corporate mail | Not enrolled / not CEA-authorized | Self-enroll the device; verify EAS profile + CEA authorization |
| Corporate wipe also removed personal data | Container boundary misconfigured | Verify ownership tag and containerization before wiping |
| Device unreachable for management | Push channel blocked | Verify APNs/FCM/WNS reachability (see parent module) |

### FAQs

- *How does BYOD keep work and personal data separate?* Ownership-based enrollment + containerization (work container).
- *What happens when an employee leaves?* Corporate wipe removes managed/container data; personal data stays.
- *Can IT see my personal data?* BYOD policies are privacy-preserving and scoped to the corporate container *(IT control limited to managed data)*.
- *How do personal devices get corporate apps/mail?* App Catalog for apps; containerized Exchange ActiveSync for mail, gated by Conditional Exchange Access.
- *Is BYOD a separate edition?* No — BYOD enrollment is in the Standard edition; advanced containment features are Professional.

## Cross-references
- [mobile-device-management.md](mobile-device-management.md) — parent module; ownership-based enrollment, wipe scopes, push services.
- [conditional-access.md](conditional-access.md) — gate corporate mail to authorized BYOD devices.
- [email-management.md](email-management.md) — email containerization and selective email wipe.
- [content-management.md](content-management.md) — sandboxed content on personal devices.
- [mobile-app-management-mam.md](mobile-app-management-mam.md) — App Catalog delivery to personal devices.

## Sources
- https://www.manageengine.com/products/desktop-central/bring-your-own-device-byod.html
- https://www.manageengine.com/products/desktop-central/leveraging-byod.html
- https://www.manageengine.com/mobile-device-management/mobile-email-management.html (email containerization)
- https://www.manageengine.com/mobile-device-management/help/profile_management/mdm_conditional_exchange_access.html (BYOD access control)
- https://www.manageengine.com/mobile-device-management/edition-comparison-matrix.html
