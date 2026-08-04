# Conditional Access (Conditional Exchange Access / CEA)

> Permit access to corporate email (Exchange / Microsoft 365) only from MDM-authorized, compliant devices; block or quarantine everything else. Parent module: [Mobile Device Management](mobile-device-management.md). Edition/point product: Conditional Access for Exchange and Microsoft 365 apps is a **Professional** capability (also in Free/Trial); **on-premises MDM only**. Bundled in Endpoint Central UEM.

## 1. What it is — Feature detail

Conditional access ensures only authorized devices reach important corporate information. **Conditional Exchange Access (CEA)** monitors the devices accessing your Exchange server and permits access only to authorized (MDM-enrolled) devices. It is ideal for BYOD: corporate data is reachable only from an MDM-authorized device. CEA makes MDM the single point of control — any restriction it sets **overrides** the access specifications in the Exchange server. Mobile Device Manager Plus supports up to **Exchange Server 2019** and **Exchange Online**.

### Scope and support matrix

- CEA is supported only for **Exchange Server** and **Exchange Online**. **CEA for Office 365 can be configured only for Windows devices.**
- **CEA is supported only on MDM on-premises** (not Cloud).
- CEA grants access only to email clients configured via the **MDM Exchange ActiveSync profile**. Native mail and Gmail apps are supported (varies by platform/version, e.g., Samsung native email, Android 8.0+); corporate accounts configured manually by the user on managed devices are **blocked**.
- **CEA is not supported for the Outlook app** — Outlook is blocked from accessing Exchange once CEA is applied.
- If the CEA account has **MFA** enabled, use an **app-specific password** when initiating Exchange sync with MDM.

### Default Access levels

The Default Access level governs how new/unknown devices are treated:

| Default Access level | Existing devices (Grace Period) | New devices |
| --- | --- | --- |
| Allow | As specified in policy; Full Access during grace | Grace as specified; Full Access during grace |
| Block | As specified in policy; Full Access during grace | No grace; Blocked by default |
| Quarantine | As specified in policy; Full Access during grace | No grace; Quarantined by default |

> Recommended Default Access level is **Quarantine**.

### Policy targeting

- **Apply policy on:** All users or Specific users.
- **Exclude specific users** (e.g., top-level executives) from monitoring.
- **Grace Period:** a window during which MDM does not restrict access; the user must enroll the device before it expires, or access is revoked. Grace-period mails go out when the daily sync scheduler runs at **4am** and are sent to selected users whose devices are "Allowed" but not yet enrolled.
- Notify users (via the Exchange email) when access is revoked; customize the message at `https://<Exchange FQDN>/ecp` → Exchange ActiveSync Access Settings → add the Self Enrollment URL.

### Behavior when restricted

Once restriction applies, devices cannot send/receive mail, but mail already in the mailbox before restriction remains accessible. Restricting immediately (no grace) denies all devices regardless of Personal Exemptions/Device Access rules in Exchange; users must enroll to regain access. With a grace period, devices get time to enroll, after which only enrolled devices have access.

### Removing / modifying the policy

- Modify/remove **with rollback enabled** → blocked devices of unselected users regain access.
- Without rollback → device access state stays restricted and must be changed manually.
- Removing the **Exchange server details** does **not** auto-revert changes; you can no longer fetch new-device details or restrict them.

## 2. UX lens

### Console navigation

`Device Mgmt → Conditional Exchange Access`.

### Step-by-step workflow

1. **Meet prerequisites:** PowerShell 5.1 on the MDM server; Basic Authentication enabled; for Exchange Online, the **EXO V2 module**; configure the **EAS profile** on managed devices first.
2. **Connect Exchange:** provide Exchange admin (or commandlet-capable) credentials so MDM can fetch users/devices accessing Exchange (enrolled + unenrolled). MDM syncs daily; manual sync is possible.
3. **Create the access policy:** choose All users / Specific users; optionally exclude users; set the **Default Access level** (recommended Quarantine); set a **Grace Period** and grace-mail recipients.
4. **Apply.** Unauthorized devices are blocked/quarantined per policy; enrolled devices with the MDM EAS profile retain access.
5. **Monitor** device access states; reconcile EAS Identifiers when a device is unexpectedly blocked.

### UX research hooks

- **EAS-profile prerequisite is the #1 trap:** admins apply CEA before configuring the MDM EAS profile, so even enrolled devices are blocked (EAS Identifier mismatch). Add an explicit pre-flight check.
- **Outlook-blocked-by-design** surprises admins; warn loudly before applying.
- **Exchange Online 24-hour lag** — access state can take up to 24h to change; show expected propagation time so admins don't assume failure.
- **Quarantine vs. Block vs. Allow** semantics for new devices are subtle; the access-level table should be inline.
- **Rollback toggle** at removal time is high-stakes; default and explain it.

### Notable UI patterns/components

CEA dashboard listing devices with access states; Exchange connection panel (credentials, sync now); policy builder (user scope, exclusions, Default Access level, Grace Period); grace-mail recipient picker; EAS Identifier column chooser in the Enrollment view.

## 3. PM lens

### Value proposition & business outcomes

Turns MDM into the gatekeeper for corporate mail: only enrolled, compliant devices reach Exchange/M365, overriding native Exchange rules. Closes the BYOD leak vector at the source and gives a clean enrollment funnel (grace period + self-enrollment mail) that converts unmanaged devices into managed ones.

### Target personas & use cases

- **CISO / compliance** — guarantee only managed devices access mailboxes; auditable device states.
- **MDM admin** — drive enrollment via grace-period mail; exclude executives where needed.
- **BYOD environments** — the canonical use case: corporate data only from authorized devices.

### Positioning & differentiators

Device-level Exchange access control that overrides Exchange's own rules, integrated into MDM/UEM with the same enrollment and EAS profiles. Per-user targeting, exclusions, grace periods, and customizable revocation mail differentiate it from coarse firewall-based controls.

### Edition / point-product gating

Conditional Access for Exchange & M365 apps is **Professional** (also Free/Trial). **On-premises MDM only.** Office 365 CEA is **Windows-only**. Outlook app unsupported. Bundled into Endpoint Central UEM.

### Expansion opportunities

- Bring CEA to **MDM Cloud**.
- Support **modern auth (OAuth)** to remove the Basic Authentication dependency.
- Extend conditional access uniformly to **Google Workspace / Zoho Workplace** and the Outlook app.
- Richer Zero-Trust posture signals (jailbreak/root, compliance) gating access *(inferred)*.

## 4. Developer / Technical lens

### Mechanics & commandlets

MDM opens a PowerShell session to the Exchange ActiveSync host and uses:

- **Session:** `New-PSSession`, `Import-PSSession`.
- **Read (fetch mailbox/mobile-device data):** `Get-ExchangeServer`, `Get-ActiveSyncOrganizationSettings`, `Get-Recipient`, `Get-MobileDeviceStatistics`, `Set-ADServerSettings` (forest-wide data).
- **Write:** `Set-CASMailbox` (applied when the policy is enforced).
- **On-demand:** `Remove-MobileDevice` (admin-initiated from MDM).

### Prerequisites

- **PowerShell 5.1** on the MDM server machine.
- **Basic Authentication** enabled (Exchange Server 2010 via IIS Manager → Default Website → PowerShell → Authentication → enable Basic Authentication).
- **Exchange Online:** upgrade to the **EXO V2 module** (provided script / `Set-ExecutionPolicy Unrestricted` if scripts are disabled).
- Devices must have the **EAS profile** associated via MDM before CEA is applied.

### Sync / propagation

- MDM syncs with Exchange **daily** (scheduler at 4am for grace mails); manual sync available.
- On **Exchange Online**, the device must contact Exchange and attempt to fetch mail for the state to change; this can take **up to 24 hours**.

### Limits (documented)

- On-prem only; O365 CEA Windows-only; Outlook unsupported; MFA accounts need app-specific passwords.

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
| --- | --- | --- |
| Enrolled device still blocked | EAS profile not configured via MDM (EAS Identifier mismatch) | Configure EAS through MDM; compare EAS Identifier in Enrollment vs. CEA view |
| Outlook can't access Exchange after CEA | Outlook blocked by design | Use a supported client (native mail/Gmail per platform); see Outlook-blocked KB |
| Unmanaged devices reappear after deletion | Default Access level allows them | Change device password or set Default Access level to **Block** |
| CEA sync issues on Exchange Online | Old PowerShell module | Upgrade to EXO V2 module; re-configure CEA |
| Access change not taking effect (O365) | Propagation lag | Wait up to 24h; ensure the device attempts to fetch mail |
| MFA account can't sync | MFA on the admin account | Use an app-specific password |
| Removing policy didn't restore access | Rollback not enabled | Re-enable access manually or modify/remove with rollback enabled |

### FAQs

- *What does CEA protect?* Access to Exchange / Microsoft 365 mailboxes — only authorized devices get in.
- *Cloud or on-prem?* On-premises MDM only; O365 CEA is Windows-only.
- *Why is Outlook blocked?* CEA does not support the Outlook app; it is blocked once CEA applies.
- *What's the recommended Default Access level?* Quarantine.
- *How do unmanaged users get back in?* Enroll within the grace period (self-enrollment URL in the revocation mail).

## Cross-references
- [email-management.md](email-management.md) — EAS configuration (a CEA prerequisite) and email DLP.
- [byod-management.md](byod-management.md) — CEA is the canonical BYOD access-control mechanism.
- [mobile-device-management.md](mobile-device-management.md) — parent module; enrollment that authorizes devices.
- [geo-fencing.md](geo-fencing.md) — complementary location-based compliance gating.

## Sources
- https://www.manageengine.com/products/desktop-central/help/mobile_device_management/security_management/conditional_access.html
- https://www.manageengine.com/mobile-device-management/help/profile_management/mdm_conditional_exchange_access.html
- https://www.manageengine.com/products/desktop-central/help/mobile_device_management/security_management/mdm_conditional_exchange_access.html
- https://www.manageengine.com/mobile-device-management/blog/protect-enterprise-email-with-exchanges-conditional-access.html
- https://www.manageengine.com/mobile-device-management/edition-comparison-matrix.html
