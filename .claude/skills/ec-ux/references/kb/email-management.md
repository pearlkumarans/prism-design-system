# Email Management (Mobile Email Management / MEM)

> Set up, manage, and secure corporate email on mobile devices via Exchange ActiveSync, containerization, DLP restrictions, and conditional access. Parent module: [Mobile Device Management](mobile-device-management.md). Edition/point product: email configuration is in the Standard edition of Mobile Device Manager Plus; **Conditional Access for Exchange / Microsoft 365** is a Professional capability. Bundled in Endpoint Central UEM.

## 1. What it is — Feature detail

Email is the primary channel of official communication, so a mobile workforce must reach corporate mailboxes from smartphones, tablets, and laptops — without leaking business-critical data. Mobile Email Management (MEM) lets IT admins remotely configure, manage, and secure enterprise email across iOS, Android, and Windows devices from a single console.

### Configure email over the air

- **Automatically configure email apps** as part of provisioning — no manual per-device setup.
- Configure email accounts OTA and at scale using **dynamic variables** that fetch usernames/email addresses mapped to devices from directory services or the MDM server during enrollment.
- Configure the **email signature** (org-wide standard or per-department) and set a **default email account**.
- Supported email clients for managed configuration include **Outlook, Gmail, Apple Mail, Samsung Email, Zoho Mail, and IBM Verse**, with preconfigured parameters such as account type, domain name, and preferred authentication method.

### Exchange ActiveSync (EAS)

- Enable **Exchange ActiveSync** so users access Exchange-stored email, contacts, calendars, and tasks — even offline.
- Configure EAS per platform: iOS/iPadOS, Android, and Windows each have their own EAS profile.
- EAS configuration is a **prerequisite for Conditional Exchange Access** (CEA grants access only to clients configured through the MDM EAS profile).

### Email security / DLP

- Enforce **data-loss-prevention (DLP)** policies: restrict copy/paste, screenshots, sharing attachments, and adding personal accounts.
- **Restrict HTML format** (force plain text) to neutralize hidden viruses/malware delivered via rich email.
- **Restrict automatic email forwarding** to outside addresses (prevents data exfiltration when employees leave).
- For iOS, disabling **Prevent Moving Messages to other Mail Accounts** and **Block Account usage from non-Mail Apps** ensures messages can neither be moved nor opened by any app other than the default mail app.
- Manage syncing of email addresses with third-party cloud services, usage of accounts from non-email apps, and notifications.

### Secure communication

- Force **SSL/TLS** for email transit; add **S/MIME** for end-to-end encryption at rest and in transit, plus digital signatures to verify sender authenticity and message integrity.
- Use **SSL certificates** and **SCEP** (iOS/Windows) to secure email with certificates.

### Email containerization (sandbox)

- **Containerize workspaces** and restrict corporate email access to **only managed apps** on personal (BYOD) devices.
- Securely view/organize attachments with the **ME MDM app's built-in Document Viewer**; sharing to other devices or cloud services is restricted, sandboxing corporate data.
- Disable data syncing with cloud services and non-work apps to prevent email content landing on untrusted third-party servers.

### Conditional email access

- **Audit access** to Exchange and Microsoft 365 mail servers and **restrict access for unmanaged devices** (see [conditional-access.md](conditional-access.md) for the full CEA workflow).

### Contacts & calendars

- Let users access **vCards**, save contacts to the device, and periodically sync via **CardDAV**.
- Allow subscribed calendars with **CalDAV** sync so scheduled events aren't missed.

### Revoke / wipe

- Remotely **wipe email configurations** from lost, stolen, jailbroken, rooted, noncompliant, and retired devices (selective email wipe leaves personal data intact).

### Passwordless / SSO

- Provide **single sign-on** so users log on once to reach all web services and apps including email clients; **certificate-based authentication** enables an effectively zero-sign-on experience.

## 2. UX lens

### Console navigation

Email profiles: `MDM → Profiles` → Email / Exchange ActiveSync (per platform: iOS, Android, Windows). Conditional access: `Device Mgmt → Conditional Exchange Access`.

### Step-by-step workflow

1. **Create an Email/EAS profile** for the target platform (server host, domain, auth method, signature, SSL/TLS, S/MIME).
2. **Use dynamic variables** for username/email so one profile scales to many users.
3. **Attach DLP restrictions** (no HTML, no forwarding, no copy/paste, no personal accounts, no non-mail-app access).
4. **Associate the profile** to a department/ownership group.
5. **(Optional) Containerize** on BYOD so only managed apps open corporate mail/attachments.
6. **(Optional) Layer Conditional Exchange Access** to block unmanaged devices.
7. **Revoke** email on offboarding via selective email wipe.

### UX research hooks

- **Dynamic-variable setup** is powerful but opaque; mis-mapped variables silently produce blank accounts — validate the mapping preview.
- **iOS "default mail app only" toggles** (Prevent Moving Messages / Block non-Mail apps) are easy to miss yet central to containment — surface them as a recommended bundle.
- **HTML-to-plain-text restriction** can frustrate users expecting rich email; explain the security rationale inline.
- **Attachment viewer** adoption — users default to third-party viewers; nudge toward the built-in secure viewer.
- **CEA + EAS dependency** — admins often apply CEA before configuring the EAS profile, so enrolled devices are still blocked (EAS Identifier mismatch). Add a pre-check.

### Notable UI patterns/components

Email/EAS profile builder with dynamic-variable inserter; DLP restriction checklist; certificate/SCEP selector; signature designer (org/department); Conditional Exchange Access dashboard with device access states.

## 3. PM lens

### Value proposition & business outcomes

Keeps a mobile workforce productive on corporate mail while closing the biggest BYOD leak vector — attachments and forwarding. Bulk OTA provisioning removes manual setup; DLP + containerization + selective wipe satisfy compliance; conditional access guarantees only trusted devices reach the mail server.

### Target personas & use cases

- **MDM/email admin** — provision mailboxes in bulk, enforce DLP, revoke on exit.
- **CISO / compliance** — prove only managed devices touch Exchange/M365; encrypt in transit and at rest.
- **BYOD users** — corporate mail in a managed app without exposing personal data.
- **Field/contract employees** — targeted conditional access policies with enrollment grace periods.

### Positioning & differentiators

MEM is embedded in MDM/UEM, so email config, app config, containerization, and conditional access share one console. Broad email-client support (Outlook, Gmail, Apple Mail, Samsung Email, Zoho Mail, IBM Verse) plus S/MIME, SCEP, and the secure attachment viewer differentiate it from basic EAS push.

### Edition / point-product gating

Email/EAS configuration and DLP are part of the **Standard** edition of Mobile Device Manager Plus (device provisioning + security essentials). **Conditional Access for Exchange and Microsoft 365 apps** is **Professional**. **CEA is supported only on MDM on-premises**, and **CEA for Office 365 only on Windows devices** (documented). Bundled into Endpoint Central UEM.

### Expansion opportunities

- Bring CEA to MDM Cloud (currently on-prem only).
- Native modern-auth (OAuth) for Exchange Online / M365 in place of Basic Authentication.
- Extend conditional email access beyond Exchange to Google Workspace / Zoho Workplace consistently (page mentions both as targets).

## 4. Developer / Technical lens

### Mechanics

- **Exchange ActiveSync** profile carries server host, auth, and sync scope (mail/contacts/calendar/tasks). Email profiles ride the per-platform push channel (APNs / GCM-FCM / WNS) — see [mobile-device-management.md](mobile-device-management.md) for ports.
- **Conditional Exchange Access** uses PowerShell against the Exchange host (read commandlets to enumerate mailbox-device pairs; `Set-CASMailbox` to apply access; `Remove-MobileDevice` on demand). Requires **PowerShell 5.1** on the MDM server and **Basic Authentication** enabled; Exchange Online needs the **EXO V2 module**. (Full detail in [conditional-access.md](conditional-access.md).)
- **Secure transit:** SSL/TLS for the EAS connection; **S/MIME** for message encryption/signing; **SCEP** (iOS/Windows) and SSL certificates for cert-based auth.
- **Containerization:** corporate mail/attachments are confined to managed apps / the ME MDM app's Document Viewer; cloud-sync and non-work-app access disabled.

### Ports / protocols / limits (inferred unless noted)

- EAS over HTTPS 443 to the Exchange/M365 endpoint *(inferred)*.
- POP/IMAP transmit plaintext unless SSL/TLS is enforced (documented caution).
- CEA: on-prem only; Office 365 CEA Windows-only; MFA accounts need an app-specific password (documented).

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
| --- | --- | --- |
| Enrolled device still blocked from Exchange after CEA | Exchange was not configured on the device via the MDM EAS profile (EAS Identifier mismatch) | Configure the EAS profile through MDM first; compare EAS Identifier in Enrollment vs. CEA view |
| Outlook app can't access Exchange after CEA | CEA blocks the Outlook app by design | Use a CEA-supported client (native mail/Gmail per platform table); see "why Outlook is blocked" KB |
| Unmanaged devices reappear after deletion | Default Access Level allows them | Change device password or set Default Access Level to **Block** |
| CEA sync fails on Exchange Online | Old PowerShell module | Upgrade to **EXO V2 module** and re-configure CEA |
| Email account blank on device | Dynamic variable mis-mapped | Verify the username/email variable mapping |
| Mail not encrypted in transit | SSL/TLS not enforced (POP/IMAP plaintext) | Enable SSL/TLS or SSL certificate / SCEP on the email profile |
| MFA account can't sync with MDM | MFA enabled on the Exchange admin account | Provide an **app-specific password** instead of the usual password |

### FAQs

- *What protocol delivers mail?* Exchange ActiveSync (with mail/contacts/calendar/tasks, offline-capable).
- *How do I stop personal devices from reading corporate mail?* Containerize + Conditional Exchange Access (blocks unmanaged devices).
- *Can I wipe just the email?* Yes — selective email wipe removes the corporate account/data only.
- *Which clients can I preconfigure?* Outlook, Gmail, Apple Mail, Samsung Email, Zoho Mail, IBM Verse.
- *Is CEA available on cloud?* No — CEA is on-premises only; Office 365 CEA is Windows-only.

## Cross-references
- [conditional-access.md](conditional-access.md) — full Conditional Exchange Access workflow and device access states.
- [byod-management.md](byod-management.md) — containerization and selective email wipe on personal devices.
- [mobile-app-management-mam.md](mobile-app-management-mam.md) — managed app configuration for email clients.
- [mobile-device-management.md](mobile-device-management.md) — parent module; push services and profiles.

## Sources
- https://www.manageengine.com/mobile-device-management/mobile-email-management.html
- https://www.manageengine.com/mobile-device-management/help/profile_management/mdm_conditional_exchange_access.html
- https://www.manageengine.com/products/desktop-central/help/mobile_device_management/security_management/mdm_conditional_exchange_access.html
- https://www.manageengine.com/mobile-device-management/how-to/mdm-secure-email.html
- https://www.manageengine.com/mobile-device-management/edition-comparison-matrix.html
