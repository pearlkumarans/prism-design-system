# Certificate Management

> Creation, distribution, and renewal of trust and user-signed digital certificates — plus a central certificate repository — so endpoints can authenticate to Exchange, Wi-Fi, VPN, and web apps. Parent module: [IT Asset Management](it-asset-management.md). Available across Endpoint Central paid editions; certificate distribution to mobile devices aligns with MDM-capable editions (edition gating inferred — verify against the official edition-comparison matrix).

## 1. What it is — Feature detail

Endpoint Central simplifies the creation, distribution, and renewal of **trust certificates** and **user-signed certificates**, letting organizations authenticate devices and users to corporate services without manual certificate handling on each endpoint. Certificates are held in a central **certificate repository** on the server and pushed out to managed devices, with expiry details maintained so certificates are renewed before they lapse.

### Certificate types
- **Trust certificate** — a single, org-wide certificate (e.g., a CA root) trusted across the estate. Used to authenticate users on the corporate network, e.g., AD CA root certificates for Wi-Fi access.
- **User-specific (user-signed) certificate** — issued per user, typically by an integrated Certificate Authority, for per-user authentication to Exchange, VPN, Wi-Fi, and similar applications.

### What you can distribute
Via **Certificate Distribution** (a Windows configuration) you can install or delete digital certificates such as **SSL certificates** (for browsers like Chrome, Edge/IE) and **AD CA root certificates** (for Wi-Fi authentication) to specified targets, into selected **certificate stores**. Multiple certificate files can be added in one configuration ("Add More Certificates").

### Repository & lifecycle
- **Repository:** admins upload the required certificates to the server and distribute them to managed devices; the repository tracks each certificate's expiry.
- **Renewal:** on expiry, the renewed certificate must be uploaded as a **new** certificate and re-pushed to managed devices. For MDM profiles, the renewed certificate is uploaded into the profile and re-pushed. Note: if the agent↔server certificate itself expires, communication is no longer secure and (for MDM) mobile devices cannot be managed until certificates are renewed and re-uploaded on the server.
- **Expiry alerts:** certificate expiration is one of the inventory **alert categories**, with a configurable lead time, so admins are warned before certificates lapse.

### Capability summary
| Capability | Detail |
|---|---|
| Certificate types | Trust (org-wide) and User-specific (per-user via CA) |
| Distributable items | SSL certificates, AD CA root certificates, user/trust certificates |
| Targets | Certificate stores on Windows computers; managed mobile devices (MDM) |
| Operations | Install / Delete (by CN value + serial number, or delete all expired) |
| Lifecycle | Upload to repository → distribute → track expiry → renew (upload as new) → re-push |
| Alerts | Certificate-expiry alert with configurable lead time |

## 2. UX lens

### Console navigation path
- Distribute (computer): `Configurations > Windows > Certificate Distribution > Computer`
- Distribute (user): `Configurations > Windows > Certificate Distribution > User` (user-targeted variant)
- Certificate repository / MDM certificates: under Mobile Device Management > Certificate Management (certificate repository).
- Expiry alerts: `Inventory > Actions/Settings > Configure Alerts` (Certificate expiry category).

### Step-by-step: install certificates (Windows)
1. Navigate to `Configurations > Windows > Certificate Distribution > Computer`.
2. Specify the configuration **name and description**.
3. Select the **Install** option.
4. Select the **certificate store(s)** to receive the certificate.
5. **Browse and upload** the certificate file from your computer.
6. Specify the **password** for the certificate file if required.
7. Use **Add More Certificates** to install several files at once. Define targets and deploy.

### Step-by-step: delete certificates (Windows)
1. `Configurations > Windows > Certificate Distribution > Computer` → name/description → **Delete**.
2. Choose a delete action: delete a **specific** certificate, or delete **all expired** certificates from the store(s).
3. Select the certificate store(s).
4. For a specific delete, supply the **Common Name (CN)** value (all certs with that CN are removed) and the certificate's **serial number** for an exact match.
5. Deploy.

**Finding the CN and serial number:** open Certificate Manager (`Windows+R` → `certmgr.msc`) or MMC with the Certificates snap-in → open the certificate → **Details > Subject** for the CN (use **Issued To** if CN is absent) → copy the **Serial number** from the Details tab.

### Step-by-step: renew an expiring certificate
1. Watch the certificate-expiry alert / repository expiry details.
2. Obtain the renewed certificate from the CA.
3. Upload it as a **new** certificate (in the repository or the MDM profile).
4. **Re-push** it to the managed devices; for delete-on-renewal, remove the old cert (specific or all-expired).

### UX research hooks / friction points
- **Renewal is "upload as new + re-push," not in-place** — easy to forget, and an expired agent/server cert can break management. A guided renewal wizard with lead-time prompts would reduce risk.
- **CN + serial lookup is manual** (certmgr/MMC) — a picker that reads installed certs would cut errors during deletes.
- **Two distribution surfaces** (Windows configuration vs. MDM profile) can confuse admins about where a given certificate lives.

## 3. PM lens

### Value & positioning
Certificate management removes the manual, per-endpoint toil of trusting CAs and provisioning user certs, enabling certificate-based authentication (Wi-Fi/VPN/Exchange) at scale from the same console that handles inventory, patching, and MDM. It is positioned as a security/identity enabler within ITAM and MDM.

### Personas & use cases
- **Security / Identity admin** — roll out CA roots and user certs for 802.1X Wi-Fi, VPN, and Exchange auth.
- **IT admin** — distribute SSL certs to browsers for internal sites; clean up expired certs.
- **Compliance officer** — ensure certificates are current; avoid outages from lapsed certs.

### Edition gating & expansion opportunities
- Computer/user certificate distribution ships as a Windows configuration; mobile certificate distribution aligns with MDM-capable editions (inferred).
- **Expansion:** in-place/automated renewal workflows; SCEP/NDES and ACME integrations for automated issuance; cross-platform (macOS/Linux) certificate distribution parity; certificate inventory dashboard with expiry heatmap; CN/serial auto-discovery for deletes.

## 4. Developer / Technical lens

### Mechanics & data collection
- Certificates are uploaded to the server repository (with optional password for protected files) and distributed via configurations to selected **certificate stores** on targets.
- Inventory scans can capture **certificate details** from endpoints (Certificates is an optional Scan Settings inclusion), feeding expiry alerts.
- Deletes are matched by **CN value** (bulk) and **serial number** (exact); an "all expired" cleanup is available.

### Ports / protocols (shared platform path — inferred)
- On-prem: **8020** (agent↔server config/data), **8027** (on-demand). Cloud: **443** to `desktopcentral.manageengine.com` and `dms.zoho.com`.
- Agent↔server channel is itself secured by a certificate; its expiry breaks secure communication and MDM management until renewed (documented behavior).
- Mail Server required for expiry alert delivery.

### Data model (inferred naming)
- Certificate (CN, serialNumber, store, expiryDate, type[trust/user], password-protected flag), CertificateRepository, DistributionConfiguration, AlertRule(certificate-expiry).

### Limits
- Renewal is **upload-as-new + re-push**, not in-place rotation.
- Certificate Distribution documented for **Windows** certificate stores; broader OS parity not confirmed (inferred limitation).
- Exact deletes require CN + serial number sourced manually from the endpoint.

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
|---|---|---|
| Certificate not appearing on targets | Wrong certificate store selected, or config not deployed to targets | Re-select the correct store(s); confirm the configuration's target scope and redeploy. |
| Password-protected cert fails to install | Password omitted/incorrect | Re-enter the certificate file password in the Install configuration. |
| Specific delete didn't remove the cert | CN/serial mismatch | Re-read CN (Details > Subject / Issued To) and serial number via certmgr/MMC; retry. |
| Mobile devices unmanageable after expiry | Agent/server certificate expired | Renew certificates and re-upload them on the Endpoint Central server. |
| Renewed cert not taking effect | Uploaded but not re-pushed | Upload the renewed cert as new and re-push to devices/profile. |
| No expiry warning before lapse | Certificate-expiry alert not configured or Mail Server missing | Enable the certificate alert with a lead time; configure Mail Server. |

### FAQs
- *What certificate types are supported?* Trust (org-wide) and user-specific (per-user via a CA).
- *What can I distribute?* SSL certificates, AD CA root certificates, and trust/user certificates to selected stores.
- *How do I renew?* Upload the renewed certificate as a new one and re-push it to devices/profiles.
- *How do I delete a specific certificate?* Supply its CN value and serial number (from certmgr/MMC), or delete all expired certs.
- *Will I be warned before expiry?* Yes — the certificate-expiry inventory alert with a configurable lead time.
- *Why did MDM stop working after a cert expired?* The secure agent↔server channel broke; renew and re-upload certificates on the server.

## Cross-references
- [it-asset-management.md](it-asset-management.md) — parent module; certificate details captured during inventory scans and certificate-expiry alerts.
- [software-deployment.md](software-deployment.md) — certificate distribution is delivered via the configurations/deployment framework.

## Sources
- https://www.manageengine.com/products/desktop-central/help/mobile_device_management/certificate_management/certificate_repository.html
- https://www.manageengine.com/products/desktop-central/help/computer_configuration/certificate_distribution.html
- https://www.manageengine.com/products/desktop-central/help/user_configuration/certificate_distribution.html
- https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/importing_ssl_certificates.html
- https://www.manageengine.com/products/desktop-central/it-asset-management.html
