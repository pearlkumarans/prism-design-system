# BitLocker Management

> Centralized management of Windows BitLocker full-disk encryption across the fleet — policy configuration (TPM modes), automated enforcement, encryption-status monitoring, and recovery-key escrow to Active Directory or the Endpoint Central server. Includes a macOS FileVault counterpart note. Parent module: [Endpoint Data Security](endpoint-data-security-dlp.md). Point product / edition: included in the management/security editions and the Endpoint Security / Endpoint Data Security add-on for Endpoint Central.

---

## 1. What it is — Feature detail

BitLocker is Windows' native full-disk encryption (introduced in 2004 as "Cornerstone," renamed Secure Startup, and shipped in Windows Vista), preventing unauthorized access if a device is lost or stolen. While BitLocker protects data, managing encryption across an organization is hard: without centralized management, IT teams struggle to enforce policies, monitor status, and securely store recovery keys. ManageEngine cites studies attributing **41% of data breaches** to lost or stolen devices without encryption — the motivation for centralized management. Endpoint Central **orchestrates** native BitLocker across the fleet rather than re-implementing encryption, simplifying deployment, monitoring, and recovery-key management.

BitLocker Management lives in its own console module: **Policy Creation**, **Policy Deployment**, **Managed Computers** (encryption status), **Retrieve Recovery Key**, **Audit Reports**, and **RBAC**. It is the data-at-rest pillar complementing [Endpoint DLP](endpoint-dlp.md) (egress controls) and [Device Control](device-control.md) (peripheral control + USB encrypt-on-write, which shares BitLocker's recovery-key store via BitLocker-to-Go).

### Full capability breakdown
- **Granular BitLocker Policy Configuration** — TPM Only, TPM + PIN, TPM + Enhanced PIN, or Passphrase (non-TPM); full-drive, OS-drive-only, or used-space-only encryption; multiple algorithm choices.
- **Automated Enforcement** — auto-encrypt newly added devices for instant compliance; deploy policies to **up to 250 devices at once**, eliminating manual tracking.
- **Encryption Status of Managed Computers** — the Managed Computers section gives a centralized view of encrypted / pending / non-compliant devices, with detailed reports on method and compliance.
- **Deployment Prerequisite Checks** — proactively detect BIOS-mode incompatibility, TPM-ownership errors, and other failures *before* deployment for a smooth rollout.
- **Recovery Key Management** — keys stored automatically in **Active Directory** or on the **Endpoint Central server**, with backup options and a retention policy.
- **Role-Based Access Control (RBAC)** — restricted technician access scoped to BitLocker configuration and recovery-key management only, without exposing other system settings.

### macOS FileVault counterpart
Endpoint Central manages **FileVault** full-disk encryption on macOS as the Mac counterpart to BitLocker — typically via configuration profiles with institutional/personal recovery-key escrow (inferred — the BitLocker module documentation is Windows-only; cross-platform encryption is part of the broader UEMS story). A FileVault status/dashboard parity with BitLocker is a documented gap (see PM lens).

### BitLocker settings / options reference
| Setting | Options | Notes |
| --- | --- | --- |
| Drive Encryption toggle | On (encrypt) / Off (decrypt) | Determines whether deploy encrypts or decrypts |
| Authentication (TPM) | TPM only / TPM + PIN / TPM + Enhanced PIN | PIN 6–20 digits; Enhanced PIN 6–20 alphanumeric+special |
| Authentication (non-TPM) | Passphrase / Protection off | Passphrase prompted on boot |
| Encryption scope | Full drive / OS drive only / Used space only | Used-space is fastest |
| Algorithm (Win10+) | AES_128, AES_256, XTS_AES_128, XTS_AES_256 | Microsoft default recommended for performance |
| Algorithm (Win8.1-) | AES_128, AES_256 | — |
| Password settings | Allow skip (grace window) / Enforce immediately | Hidden if no authentication configured |
| Update recovery key to DC | On / Off | On = escrow to Active Directory; off = EC server only |
| Periodic key rotation | On (days) | e.g., 7 days re-keys used keys |

### Supported OS / platforms
- **Windows only** — Windows 11/10 Pro/Enterprise/Education, Windows 8.1/8 Pro/Enterprise, Windows 7 Ultimate/Enterprise, Windows Server 2008 and above (Server requires manually enabling the BitLocker feature).
- **FileVault** — macOS (inferred).

### Prerequisites and key concepts/terminology
- Supported Windows edition; BitLocker feature available/enabled; **full TPM ownership**; **UEFI BIOS mode**; working WMI; no conflicting BitLocker GPOs.
- Key terms: TPM, TPM+PIN/Enhanced PIN, passphrase, encryption scope, algorithm (AES/XTS-AES), recovery key (48-bit), recovery-key identifier, escrow, key rotation/retention, used-space-only encryption, prerequisite check.

---

## 2. UX lens

### Console navigation path(s)
| Task | Navigation path |
| --- | --- |
| Create BitLocker policy | **BitLocker → Policy Creation → Create Policy** |
| Deploy BitLocker policy | **BitLocker → Policy Deployment** |
| BitLocker encryption status | **BitLocker → Managed Computers** |
| Retrieve BitLocker recovery key | **BitLocker → Retrieve Recovery Key** (or via ADUC BitLocker Recovery tab) |
| Audit reports | **BitLocker → Audit Reports** |
| Scope technician access | **BitLocker → RBAC** |

### Step-by-step workflow(s)

**Procedure 1 — Enable BitLocker on the fleet**
1. Verify prerequisites (see Support): supported OS, TPM full ownership, UEFI mode, WMI, no conflicting GPOs.
2. **Policy Creation → Create Policy**; name + description; toggle **Drive Encryption** on (off = decryption on deploy).
3. **Authentication (TPM machines):** TPM only / TPM + PIN (6–20 digits) / TPM + Enhanced PIN (6–20 alphanumeric+special). **Non-TPM:** passphrase on boot.
4. **Scope:** full drive, OS-drive-only, or used-space-only.
5. **Algorithm:** Win10+ → AES_128, AES_256, XTS_AES_128, XTS_AES_256; Win8.1- → AES_128, AES_256 (Microsoft default recommended).
6. **Password settings:** "Allow users to skip password request" (grace window with Cancel) or "Enforce immediately."
7. **Advanced settings:** "Update recovery key to domain controller" (escrow to AD; otherwise keys live only on the EC server); "Allow periodic rotation of the recovery key" (in days, e.g., 7).
8. Save as draft or publish; **Policy Deployment** → associate to a custom group; auto-enforce on new devices; deploy to up to 250 devices at once.

**Procedure 2 — Retrieve a recovery key (help desk)**
- **Via EC console:** find the recovery-key identifier under Managed Computers; enter the identifier or computer name in **Retrieve Recovery Key → Show key**. *Note:* once accessed via EC, the key rotates at the machine's next startup.
- **Via Active Directory (ADUC):** open the managed computer's **Properties → BitLocker Recovery** tab (requires the recovery-key-to-AD policy enabled).
- **Export:** "Export Recovery Keys" creates a password-protected XLSX backup of all machine keys; download requires authentication.

### UX research hooks
- **Recovery-key retrieval speed** is the highest-frequency help-desk task — study time-to-key and search ergonomics.
- **Key-rotation surprise** — retrieving a key silently rotates it on next boot; study whether admins expect this.
- **Encryption-status confidence** — can an admin instantly answer "what % of my fleet is encrypted and compliant?"
- **Opportunity** — surface prerequisite-check failures (TPM/UEFI) inline in the deployment flow rather than after a failed push.

---

## 3. PM lens
- **Value** — replaces manual per-device key handling ("a separate key for every door") and addresses the 41%-of-breaches-from-lost-devices problem; centralized escrow, rotation, retention, and one-click fleet deployment.
- **Personas** — Endpoint Admin (deploy, manage keys); Security/Compliance Admin (prove encryption compliance); Help Desk (retrieve keys for locked-out users, scoped via RBAC).
- **Positioning** — native BitLocker management with AD/server key escrow + rotation/retention, prerequisite checks, and RBAC, bundled in a full UEMS suite. Competes with Microsoft MBAM/Intune and dedicated encryption managers — edge is consolidation with patch/deploy/DLP under one agent.
- **Edition / point-product gating** — included in the management/security editions and the Endpoint Security / Endpoint Data Security add-on (verify on the edition-comparison matrix). Hard OS-edition gating (Pro/Enterprise/Education; Server needs manual feature enablement). 30-day free trial.
- **Expansion opportunities** — **macOS FileVault parity** clearly documented and dashboarded alongside BitLocker; **Linux LUKS** encryption management; a unified cross-platform encryption-compliance dashboard; risk scoring across encryption + device + access signals.

---

## 4. Developer / Technical lens
- **Mechanics** — leverages **native Windows BitLocker + TPM**; EC orchestrates via WMI (`win32_encryptablevolume`) and `manage-bde` operations rather than re-implementing encryption. The agent applies policy, escrows recovery keys, and reports TPM state, method, and % complete.
- **Recovery-key escrow** — integrates with **Active Directory** (Windows AD and Azure AD both support key backup) and the EC server; retained on the server up to one year after a computer leaves the Scope of Management.
- **USB encrypt-on-write** — [Device Control](device-control.md)'s BitLocker-to-Go keys flow to the same recovery-key store.
- **Ports/protocols** — secure agent↔server channel over HTTPS / EC management ports (inferred); AD/LDAP for key backup; REST API (API Explorer) for automation/reporting.
- **Data model / key objects** — BitLocker Policy (auth mode, scope, algorithm, password/rotation settings), Recovery-Key record (identifier, rotation, retention), Encryption status per drive, RBAC role scope.
- **Scalability** — deploys to up to 250 devices per push; scales via custom groups.
- **Limitations** — TPM/UEFI/edition prerequisites; Server OS needs manual feature install; conflicting GPOs break deployment; FileVault parity limited (inferred).

---

## 5. Support / Troubleshooting lens

### Prerequisite checks (run before deployment)
1. **OS compatibility** — Pro/Enterprise/Education (client) or Server 2008+; Server requires enabling the BitLocker feature.
2. **BitLocker availability** — on Server OS, enable via Server Manager (Add Roles and Features → *BitLocker Drive Encryption Administration Utilities* + *Recovery Password Viewer*) or `dism /online /Enable-Feature /all /FeatureName:BitLocker /quiet /norestart`, then reboot. Confirm the *BitLocker Recovery* tab appears in ADUC.
3. **WMI functionality** — re-register if broken: `mofcomp.exe C:\Windows\System32\wbem\win32_encryptablevolume.mof`.
4. **TPM ownership** — must be *full*; clear the TPM (TPM.msc) to let the OS reacquire full ownership (back up keys first).
5. **BIOS mode** — TPM-aided BitLocker requires **UEFI** (switch from Legacy/CSM).
6. **GPO** — remove all BitLocker/encryption-related GPOs to avoid conflicts with EC's policy.

### Post-deployment error table (symptom → cause → fix)
| Symptom (error) | Cause | Fix |
| --- | --- | --- |
| `0x80310092` / `0x80310091` | Conflicting BitLocker recovery-option GPO vs EC policy | Remove BitLocker-related Group Policies |
| `0x80310068` / `0x8031006B` / `0x80310073` | GPO dictates PIN/passphrase/smart-card requirements conflicting with EC policy | Remove BitLocker-related GPOs |
| `0x80310018` (TPM_NOT_OWNED) | TPM not initialized/owned | Initialize the TPM via TPM.msc |
| `0x80290107` (TPMAPI internal error) | TPM disabled in BIOS | Enable TPM in BIOS |
| `0x80310048` (FIRMWARE_TYPE_NOT_SUPPORTED) | Firmware in Legacy mode | Switch firmware Legacy → UEFI |
| `0x80070005` (ACCESS_DENIED) | Third-party software (e.g., AV) blocking BitLocker system files | Add BitLocker exclusions in the AV |
| `0x80310030` (BOOTABLE_CDDVD) | Bootable CD/DVD present | Remove media and restart before configuring |
| `0x803100B5` / `0x803100B6` | Keyboard-less machine can't accept pre-boot input | Provide pre-boot input / WinRE (use TPM-only where appropriate) |
| `0x80310000` (LOCKED_VOLUME) | Drive locked by BitLocker | Unlock from Control Panel |
| `0x8007054B` (NO_SUCH_DOMAIN) | AD unreachable; key can't back up to AD | Ensure endpoint↔AD connectivity |
| `0x80310052` (BCD_APPLICATIONS_PATH_INCORRECT) | Incorrect BCD path for integrity-protected app | Correct BCD settings (see Microsoft KB) |
| `0x80073AFC` (MUI_FILE_NOT_FOUND) | Resource loader can't find MUI file | Contact Microsoft |

### Other common issues
- *Locked out of device* → forgotten PIN/passphrase → retrieve escrowed recovery key (console identifier or ADUC); remember it rotates on next boot after console retrieval.
- *Encryption stuck/paused* → check `manage-bde -status`; resume; review disk health.

### Diagnostics
Prerequisite wizard, `manage-bde -status`, Control Panel BitLocker status, TPM.msc, ADUC BitLocker Recovery tab, EC agent logs and server deployment status (inferred).

### FAQs
- *What is a recovery key?* A 48-bit string that unlocks an encrypted drive when the password/PIN is forgotten — works even on a transplanted drive.
- *Where are recovery keys stored?* EC server and/or Active Directory (Windows AD and Azure AD); retained on the server up to one year after a computer leaves the Scope of Management.
- *How many devices can I encrypt at once?* Up to 250 per deployment push, with auto-enforcement on newly added devices.

---

## Cross-references
- [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) — parent data-security module overview.
- [device-control.md](device-control.md) — USB encrypt-on-write (BitLocker-to-Go) shares this module's recovery-key store.
- [endpoint-dlp.md](endpoint-dlp.md) — data-at-rest discovery complements full-disk encryption.
- [point-products.md](point-products.md) — edition/add-on packaging.

## Sources
- https://www.manageengine.com/products/desktop-central/help/bitlocker-management/bitlocker-overview.html
- https://www.manageengine.com/products/desktop-central/help/bitlocker-management/bitlocker-policy-creation.html
- https://www.manageengine.com/products/desktop-central/help/bitlocker-management/bitlocker-policy-deployment.html
- https://www.manageengine.com/products/desktop-central/help/bitlocker-management/bitlocker-pre-requisites.html
- https://www.manageengine.com/products/desktop-central/help/bitlocker-management/recovery-key.html
- https://www.manageengine.com/products/desktop-central/help/bitlocker-management/bitlocker-audit-reports.html
- https://www.manageengine.com/products/desktop-central/help/bitlocker-management/bitlocker-rbac.html
- https://www.manageengine.com/products/desktop-central/bitlocker-post-deployment-errors.html
