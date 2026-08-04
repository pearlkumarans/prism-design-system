# EC-08 : Conditional Access — Deep Dive (UI + UX Reference)

> **Source**: ManageEngine MDM / Endpoint Central Help — `/mobile-device-management/help/profile_management/mdm_conditional_*`, `/products/desktop-central/help/mobile_device_management/security_management/*`, plus Vulnerability Remediation Quarantine docs
> **Scope**: Conditional Exchange Access (CEA), Microsoft Entra (Azure AD) Conditional Access for Office 365, Okta Device Trust, Zoho Workspace Conditional Access, Office 365 MAM Policies, System Quarantine Policy (NAC) for desktops/laptops, Access levels (Allow / Block / Quarantine), Grace Period, EAS Device Identifier, PowerShell integration
> **Purpose**: Single source of truth for UI + UX design of Conditional Access — the gatekeeper module that decides which devices/users can access corporate resources (Exchange, Office 365, internal apps)

---

## 1. Module Overview

### 1.1 What this module is

**Conditional Access** is Endpoint Central's **access gatekeeper** — the policy surface that decides:
- **Which devices** can read corporate email (Exchange / Outlook)
- **Which devices** can access Office 365 / Microsoft 365 cloud apps
- **Which devices** are trusted via Okta or Zoho Workspace
- **Which laptops/desktops** should be quarantined from the network when non-compliant

Mental model:

```
                ┌─────────────────────────────────────────────────────────────┐
                │  WITHOUT Conditional Access                                   │
                │  Any device with credentials → corporate resources access     │
                │  • Personal phones reading mail                               │
                │  • Unmanaged laptops downloading SharePoint files             │
                │  • Compromised devices grabbing internal data                 │
                └─────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                ┌─────────────────────────────────────────────────────────────┐
                │  WITH Conditional Access                                      │
                │                                                                │
                │   USER tries to access ──────▶  ENFORCEMENT POINT             │
                │   corporate resource             (Exchange / Azure / Okta)     │
                │                                       │                         │
                │                                       ▼                         │
                │                              "Is device enrolled in MDM?"      │
                │                                       │                         │
                │                       ┌───────────────┼───────────────┐         │
                │                       ▼               ▼               ▼         │
                │                    ALLOW           QUARANTINE        BLOCK     │
                │                  (enrolled +     (grace period to   (not       │
                │                   compliant)       enroll)           allowed)   │
                └─────────────────────────────────────────────────────────────┘
```

The core insight: **enrollment in MDM becomes the entry ticket** to corporate resources. Want corporate email on your iPhone? Enroll the device first. Want Office 365 on your laptop? Get enrolled + compliant first.

### 1.2 Personas
- **Primary**: IT Administrator / Security Admin (sets the policy)
- **Secondary**: Help-desk Technician (handles enrollment requests from blocked users)
- **End-user impact: VERY HIGH** — directly affects whether they can read email, open Word, sync files
- **Tertiary**: Exchange Admin (PowerShell / Exchange Online integration setup)
- **Tertiary**: Azure / Entra ID Admin (sets up Conditional Access policy on Microsoft side)
- **Tertiary**: Okta Admin (Device Trust setup)

### 1.3 Module signature

**Highest-stakes UX in the entire product.** A wrong policy = thousands of users locked out of email instantly. The UI must:
1. **Surface impact preview before applying** — "This policy will affect 1,247 users / 3,892 devices"
2. **Default to safe modes** — "Quarantine" recommended over "Block" (gives users a path to recover)
3. **Strong "are you sure" friction** on broad policies
4. **Clear visibility into who's currently in which state**
5. **Recovery paths visible** to admins (manually allow a device, extend grace period)

### 1.4 Five integration surfaces

| # | Surface | What it gates | Target devices |
|---|---|---|---|
| 1 | **Conditional Exchange Access (CEA)** | On-prem Exchange + Exchange Online (mail) | iOS / Android / Windows native mail apps |
| 2 | **Microsoft Entra Conditional Access (O365)** | Office 365 / M365 cloud apps via Azure | Win 10+ devices |
| 3 | **Okta Device Trust** | Okta-protected resources | Diverse (BYOD / COPE) |
| 4 | **Zoho Workspace Conditional Access** | Zoho Mail + Workspace | All MDM-enrolled |
| 5 | **Office 365 MAM Policies** | Microsoft 365 apps (Word/Excel/Teams) on iOS/Android | Mobile (without device enrollment) |

Plus an Endpoint-Central-specific surface:

| 6 | **System Quarantine Policy (NAC)** | Network access for non-compliant laptops/desktops | Windows + Mac + Linux endpoints |

### 1.5 OS coverage matrix

| Surface | iOS | Android | Windows mobile | Win 10+ desktop | macOS | Linux |
|---|---|---|---|---|---|---|
| **CEA (Exchange)** | ✅ Native mail / Gmail | ✅ Samsung 8.0+ / Non-Samsung | ✅ | — | — | — |
| **Entra Conditional Access (O365)** | — | — | — | ✅ Win 10+ | — | — |
| **Okta Device Trust** | ✅ | ✅ | — | ✅ | ✅ | — |
| **Zoho Workspace** | ✅ | ✅ | — | ✅ | ✅ | — |
| **Office 365 MAM** | ✅ | ✅ | — | — | — | — |
| **System Quarantine Policy** | — | — | — | ✅ | ✅ | ✅ |

### 1.6 Cloud vs On-premises caveats

| | Cloud | On-prem |
|---|---|---|
| **CEA** | ❌ On-prem ONLY (per docs) | ✅ |
| Entra CA (O365) | ✅ | ✅ |
| Okta Device Trust | ✅ | ✅ |
| Zoho Workspace | ✅ | ✅ |
| O365 MAM | ✅ | ✅ |
| System Quarantine Policy | ✅ | ✅ |

⚠️ **CEA is on-premises only** — biggest caveat in the module. Cloud customers can't use Exchange Conditional Access via EC. They must use Entra CA instead.

> **UX ask**: For Cloud customers, hide CEA entirely or show a clear "CEA requires on-premises Endpoint Central" message with link to Entra CA alternative.

---

## 2. Concepts & Vocabulary

| Term | Definition | UI/UX treatment |
|---|---|---|
| **CEA (Conditional Exchange Access)** | Policy controlling mailbox access via EAS | Section under MDM > Device Mgmt > Conditional Exchange Access |
| **EAS (Exchange ActiveSync)** | Protocol Exchange uses for mobile mail sync | Implicit; surfaces in profile creation |
| **EAS Device Identifier** | Unique ID per device-mailbox combo Exchange uses for blocking | Critical: Outlook breaks this paradigm (see 4.x) |
| **Default Access Level** | Org-wide fallback for unmonitored devices: Allow / Block / Quarantine | Recommended: Quarantine |
| **Allow** | Device can access mailbox fully | "Green light" status |
| **Block** | Device blocked from accessing mailbox | "Red light" — terminal state |
| **Quarantine** | Device can access mailbox during Grace Period, then becomes Block if not enrolled | "Yellow light" — recovery path |
| **Grace Period** | Time window during which non-enrolled devices retain access | Configurable (days) |
| **Personal Exemption** | Per-user Exchange override (overridden by CEA) | Exchange concept; CEA wins |
| **Device Access Rule** | Exchange-level rule (overridden by CEA when policy enforced) | Exchange concept; CEA wins |
| **All Users** | CEA applies to entire org | Broad scope |
| **Specific Users** | CEA applies to selected subset | Narrow scope, often used for pilot |
| **Exclude Specific Users** | Bypass certain users (e.g. top execs) | Per-user exemption from CEA |
| **Daily Sync Scheduler** | CEA syncs with Exchange at 4 AM daily | Auto + manual sync option |
| **Grace Period Mail** | Email to users in grace warning them to enroll | Sent at daily 4 AM scheduler |
| **App-specific Password** | Required when MFA is on for the Exchange admin account | Microsoft concept; surface during setup |
| **EXO V2 Module** | Exchange Online PowerShell V2 module — required for cloud Exchange CEA | Latest version recommended |
| **Microsoft Entra ID** | Formerly Azure Active Directory; identity layer for O365 | Re-branded; UI must use new name |
| **Entra Conditional Access** | Microsoft's native CA policy engine — MDM compliance feeds it | Policy lives in Azure portal; MDM integration on EC side |
| **Compliance Status** | "Compliant" / "Non-compliant" — set by MDM, consumed by Entra | Surfaces in Azure portal too |
| **Work or School Account** | Microsoft account state required for Entra CA | End-user setup requirement |
| **Entra ID P1 Premium License** | Required Microsoft license for CA feature | Per-user license cost |
| **Global Administrator** | Azure role needed for MDM-Entra integration | Setup pre-req |
| **MS-Organization-Access Certificate** | Microsoft certificate confirming device-Azure registration | Visible in MDM Inventory |
| **Okta Device Trust** | Okta's per-device verification | Contextual access management |
| **BYOD (Bring Your Own Device)** | Employee-owned, accessing corp data | Primary use case for CEA |
| **COPE (Corporate-Owned Personally Enabled)** | Company device with personal use | Secondary use case |
| **Zoho Workspace** | Zoho's email + collaboration suite | Native integration |
| **MAM (Mobile Application Management)** | App-level policies WITHOUT device enrollment | Used for personal devices accessing M365 |
| **Intune License** | Microsoft license required for MAM policies | Per-user cost |
| **System Quarantine Policy** | EC's own NAC policy for laptops/desktops | Separate from MDM CA |
| **NAC (Network Access Control)** | Filter network access based on compliance | Industry term |
| **Block All Network Access** | Most aggressive quarantine — only EC components can reach | Most restrictive |
| **Block Only Intranet** | Isolate from local network but allow internet | Mid-level |
| **Block Custom Domain & IP** | Specific block list | Targeted |
| **Allow Access Only to Custom IP/VPN/Domains** | Whitelist approach | Most flexible |
| **SCEP Certificate** | Used for cert-based authentication | Cross-link to EC-09 Certificate Management |
| **Compliance Signal** | Data MDM sends to Entra/Okta to mark device compliant | Internal data flow |

### 2.1 Critical concept: 3 access states (Allow / Block / Quarantine)

This is the heartbeat of Conditional Access. Every device-user-resource combo lives in one of three states.

| State | Behavior | Recovery path |
|---|---|---|
| **Allow** | Full access to mailbox / Office 365 | No action needed |
| **Block** | Cannot access anything | Must contact admin OR enroll device |
| **Quarantine** | Access during Grace Period; auto-becomes Block if not enrolled | Enroll device during Grace Period |

> **UX ask**: Color-code consistently throughout the UI:
> - **Allow** = green
> - **Quarantine** = amber/yellow (warning state)
> - **Block** = red
>
> Show this state alongside every device row in the CEA device list.

### 2.2 Critical concept: Default Access Level matters most

When a NEW device tries to access Exchange, what happens depends on Default Access Level:

| Default Access Level | New device's initial state |
|---|---|
| **Allow** | New device gets ALLOWED immediately |
| **Block** | New device gets BLOCKED immediately, NO grace period |
| **Quarantine** ⭐ recommended | New device gets QUARANTINED, NO grace period |

> **Important nuance**: Grace Period applies to **EXISTING** devices when policy is first applied. NEW devices joining post-policy do NOT get a Grace Period if default is Block or Quarantine.

> **UX ask**: Show this matrix prominently when admin picks Default Access Level. Don't let them set "Block" without understanding it has no Grace Period for new devices.

### 2.3 Critical concept: Outlook app limitation

**Outlook app on mobile devices CANNOT be properly conditionally accessed by CEA.** Why:

```
NATIVE EMAIL CLIENT          OUTLOOK MOBILE APP
   │                             │
   ▼                             ▼
EAS Device ID is               EAS Device ID is
DEVICE-SPECIFIC                USER/ACCOUNT-SPECIFIC
   │                             │
   ▼                             ▼
Different device =             Same user across devices =
new EAS ID                     SAME EAS ID
   │                             │
   ▼                             ▼
CEA can block one              CEA can't differentiate
device, allow another          enrolled vs unenrolled
                                Outlook
```

The reason: Outlook is cloud-backed (Microsoft Cloud). Outlook connections appear as ONE device identifier in Exchange regardless of how many devices use it. CEA can only block/allow by EAS Device Identifier → cannot segregate Outlook on enrolled vs unenrolled devices.

**Result**: When CEA is applied, **Outlook app is blocked entirely** (safe default).

> **UX ask**: Surface this prominently in the CEA policy creation flow: *"Note: Outlook app will be blocked on all devices when CEA is active. Use native mail app or Gmail app instead. [Learn why]"*

### 2.4 Email client support matrix (CEA)

| Platform | Native mail | Gmail app | Outlook / third-party |
|---|---|---|---|
| **iOS** | ✅ | ✅ | ❌ (blocked) |
| **Windows** | ✅ | ✅ | ❌ (blocked) |
| **Android — Samsung 8.0+** | ✅ | ✅ | ❌ (blocked) |
| **Android — Samsung < 8.0** | ✅ | ❌ | ❌ |
| **Android — Non-Samsung** | varies | ✅ | ❌ |

> **UX ask**: When admin enables CEA, surface a "Supported email clients" table prominently so they can warn users.

---

## 3. Navigation & IA — Conditional Access

### 3.1 Top-level structure

```
DEVICE MGMT (within MDM section of EC)
└── CONDITIONAL ACCESS
    │
    ├── Conditional Exchange Access (CEA)
    │   ├── Setup (Exchange server credentials)
    │   ├── Default Access Level config
    │   ├── Policy management
    │   ├── Device list (per device: Allow / Block / Quarantine)
    │   ├── Grace Period config
    │   └── Sync & Logs
    │
    ├── Office 365 (Microsoft Entra Conditional Access)
    │   ├── Azure integration
    │   ├── Access Policy
    │   └── Device Details (enrolled Win 10+ devices)
    │
    ├── Okta Device Trust
    │   └── Configuration
    │
    ├── Zoho Workspace
    │   └── Integration + Policy
    │
    └── Office 365 MAM Policies
        ├── Policy Creation
        ├── Data Protection
        ├── Access Requirements
        └── Conditional Launch

(SEPARATE — under Threats & Patches)
SYSTEM QUARANTINE POLICY (NAC for laptops/desktops)
└── Threats & Patches > Compliance > System Quarantine Policy
```

### 3.2 Cross-module entry points

- **MDM Profiles** → Exchange ActiveSync profile is **prerequisite** for CEA
- **Inventory** → Per-device EAS Identifier shown via column chooser (Enrollment view)
- **EC-09 Certificate Management** → SCEP certificates for Entra CA cert-based authentication
- **EC-02 Vulnerability Management** → Quarantine triggers from CVE detection
- **Admin → Reports Settings** → Daily CEA sync scheduler config
- **Threats & Patches → Compliance** → System Quarantine Policy
- **Azure portal (external)** → Entra CA policy creation
- **Okta portal (external)** → Okta Device Trust setup

---

## 4. Sub-Features — Deep Dive

### 4.1 Conditional Exchange Access (CEA)

Path: `MDM > Device Mgmt > Conditional Exchange Access`

⚠️ **On-premises ONLY**. Cloud customers can't use this; use Entra CA instead.

#### 4.1.1 Prerequisites

##### Universal
1. **PowerShell 5.1** installed on EC server machine
2. **Basic Authentication** enabled on Exchange (for CEA to function)
3. **Exchange ActiveSync profile** associated with managed devices BEFORE applying CEA policy

##### Exchange on-prem (Server 2010 or older)
- Enable **Basic Authentication** in IIS Manager
  - IIS Manager → Sites → Default Website → PowerShell → Authentication → Enable Basic Authentication

##### Exchange Online (cloud)
- Upgrade to **EXO V2 module** (Exchange Online PowerShell V2)
- Download pre-built script + run on PowerShell as admin
- If `Set-ExecutionPolicy Unrestricted` needed, run that first
- ⚠️ Access state changes can take **up to 24 hours** in Exchange Online

##### MFA accounts
- If admin account has MFA enabled, use **app-specific password** instead of normal password

> **UX ask**: Build a "CEA Setup Checklist" wizard:
> 1. ✅ PowerShell 5.1 detected
> 2. ✅ Basic Auth enabled on Exchange
> 3. ✅ EAS Active Sync profile created
> 4. ⚠️ EXO V2 module status (for cloud)
> 5. ⚠️ MFA detection on admin account
>
> Don't let admin start configuring policy until all checks pass.

#### 4.1.2 Configuring CEA — full workflow

```
MDM > Device Mgmt > Conditional Exchange Access > Setup
        │
        ▼
1. Provide Exchange admin credentials
   ├── Username (admin or commandlet-permitted account)
   ├── Password (or app-specific password if MFA)
   └── Exchange Server FQDN
        │
        ▼
2. MDM tests connection + syncs daily devices
   (or manual sync triggered by admin)
        │
        ▼
3. Configure Default Access Level
   ◯ Allow      (permissive — all new devices get full access)
   ◯ Block      (most restrictive — all new devices blocked)
   ◯ Quarantine (recommended — grace period for existing, blocked for new)
        │
        ▼
4. Configure Access Policy
   Apply policy on:
   ◯ All users
   ◯ Specific users (multi-select picker)
        │
        ▼
5. Exclude Specific Users (optional)
   ├── e.g. top execs, CEO, IT admins
   └── Excluded users bypass CEA entirely
        │
        ▼
6. Grace Period configuration (optional)
   ├── Set Grace Period (days)
   ├── During Grace Period: existing devices retain access even if not enrolled
   └── After Grace Period: only enrolled devices access Exchange
        │
        ▼
7. Grace Period Mail
   ├── Sent to users with devices in "Allowed" state but not enrolled in MDM
   ├── Sent at 4 AM daily during sync scheduler
   └── Contains Self-Enrollment URL
        │
        ▼
8. Save & Apply
        │
        ▼
Policy is now active
```

#### 4.1.3 Customizing the Grace Period notification email

> Path on Exchange server: `https://Exchange Server FQDN/ecp` (e.g. `https://mdm-exchange/ecp`)

Click Edit → Exchange ActiveSync Access Settings → Add **Self-Enrollment URL** to the content sent to users from Exchange.

> **UX ask**: Show admins where this is configured + provide a "Preview Email" feature so they see what users will receive.

#### 4.1.4 Apply policy to All Users vs Specific Users

```
ALL USERS                          SPECIFIC USERS
   │                                   │
   ▼                                   ▼
Full org coverage                 Pilot / staged rollout
Maximum security                  Lower risk
Maximum disruption risk           Phased adoption
                                  Test with 50 users first
                                  Expand to all once stable
```

> **UX ask**: Strongly recommend "Specific Users" pilot mode first. Add a banner: *"Pro tip — Start with 50-100 specific users to validate behavior. Expand to All Users after 1-2 weeks of stable operation."*

#### 4.1.5 Device list view

After policy is active, admin sees every device that's tried to access Exchange:

```
Conditional Exchange Access > Device List

┌──────────────────────────────────────────────────────────────────────────┐
│  User       │ Device        │ EAS Identifier │ Status     │ Last Sync   │
│             │               │                │            │             │
│ john.doe    │ iPhone 14     │ Apple_12345   │ ✅ Allow   │ 2 min ago   │
│ jane.smith  │ Samsung S22   │ Android_67890 │ ⏳ Quarantine│ 5 min ago   │
│ bob.lee     │ iPad Pro      │ Apple_11111   │ ❌ Block   │ 1 hour ago  │
│ alice.k     │ Surface Pro   │ Windows_22222 │ ✅ Allow   │ 30 sec ago  │
└──────────────────────────────────────────────────────────────────────────┘

Per-row actions:
   ├── View user details
   ├── View device details
   ├── Manually override status (Allow / Block / Quarantine)
   ├── Remove from list (Remove-MobileDevice)
   └── View EAS Identifier full info
```

> **UX ask**: Make this list filterable by status, user, device type, last sync time. Critical for daily ops.

#### 4.1.6 PowerShell commandlets used (transparency for admins)

EC uses these commandlets for CEA — useful for security audit + permissions setup:

**Session initiation**:
- `New-PSSession`
- `Import-PSSession`

**READ-only (data fetching)**:
- `Get-ExchangeServer`
- `Get-ActiveSyncOrganizationSettings`
- `Get-Recipient`
- `Get-MobileDeviceStatistics`
- `Set-ADServerSettings` — fetches across entire AD forest

**WRITE commandlets**:
- `Set-CASMailbox` — applies policy after CEA configuration
- `Remove-MobileDevice` — manual admin trigger only

> **UX ask**: Show commandlets used in a "Permissions Required" panel during setup. Saves admin time figuring out service account permissions. Show as info dropdown.

#### 4.1.7 Removing / modifying CEA policy

| Action | Behavior |
|---|---|
| **Modify with rollback enabled** | Blocked devices of unselected users → granted access |
| **Modify without rollback** | Blocked devices remain blocked; manual change required |
| **Remove Exchange server details** | Policy effects NOT auto-reverted; can no longer monitor or restrict new devices |

> **UX ask**: Rollback toggle is **critical** — show consequences prominently before saving. "If you disable rollback, blocked devices stay blocked even after policy removal."

#### 4.1.8 Troubleshooting enrolled-but-blocked devices

If a device is enrolled but CEA still blocks:

```
1. MDM web console > Enrollment tab
2. Click column chooser (right side)
3. Add "EAS Identifier" column to view
4. Compare EAS Identifier on Enrollment view vs CEA view
        │
        ├── If MATCH → device is correctly enrolled; check CEA policy
        └── If MISMATCH → Exchange was NOT configured via MDM
                        Enroll Exchange via MDM ActiveSync profile
```

> **UX ask**: One-click "Diagnose EAS Identifier mismatch" tool that does this comparison automatically and surfaces the fix.

---

### 4.2 Microsoft Entra Conditional Access (Office 365)

Path: `MDM > Device Mgmt > Office 365 (under Conditional Access)`

#### 4.2.1 Purpose
Restrict Office 365 / M365 cloud apps to **Windows 10 or above devices** that are:
1. Enrolled in MDM, AND
2. Marked as compliant

#### 4.2.2 Limitations
- **Windows 10 or above ONLY** (Microsoft Azure restriction for third-party MDM solutions)
- Other device types → can be blocked but not granted via this surface
- For iOS/Android M365 access, use **O365 MAM Policies** instead

#### 4.2.3 Prerequisites
- Each user using CA must have **Microsoft Entra ID P1 Premium license** or higher
- **Global Administrator** privileges in Entra ID to integrate
- Entra ID account added as **Work or School Account** on target devices

#### 4.2.4 Two-step configuration

##### Step 1: Create CA Policy in Azure Portal

```
Azure Portal > Entra ID (formerly Azure AD) > Security > Conditional Access
        │
        ▼
Click "Create New Policy"
        │
        ▼
1. Policy Name
2. Users and Groups → identify who policy applies to
3. Cloud Apps → include Office 365 (and/or other Azure-signed apps)
4. Conditions → device platforms (Windows recommended)
5. Access Controls → Grant access
6. ✅ "Require device to be marked as compliant"
7. Enable Policy: ON
8. Create
```

##### Step 2: Integrate Azure with MDM (on EC side)

```
MDM Console > Device Mgmt > Office 365 (Conditional Access)
        │
        ▼
If not already integrated → Click "Integrate"
   ├── Azure tenant credentials
   └── OAuth flow
        │
        ▼
Apply Policy via "Apply Policy" option in Access Policy view
        │
        ▼
Device Details view shows all enrolled Win 10+ devices
   ├── Compliance status per device
   ├── Manually override if needed
   └── Sync status with Azure
```

#### 4.2.5 End-user verification flow

When a user with policy active opens a Microsoft 365 app:

```
User opens Word/Excel/Teams
        │
        ▼
Azure asks: "Is this device compliant?"
        │
        ├── YES → Allow access
        │   ├── Verify Azure Registration (Entra in Work/School)
        │   ├── Check MS-Organization-Access certificate (in MDM Inventory > Devices > [device] > Certificates)
        │   ├── Initiate O365 Sync (in MDM)
        │   └── Verify in Entra ID > Devices > All Devices: compliant ✅
        │
        └── NO → Block access
            └── User sees Azure block message + remediation steps
```

> **UX ask**: Build an end-user-facing "Why am I blocked?" page that explains:
> 1. Your device is not enrolled in MDM → [Enroll here]
> 2. Your device is enrolled but not compliant → [Run compliance check]
> 3. You need a Premium license → [Contact admin]

#### 4.2.6 Diagnostic toolkit

The docs describe a 5-step diagnostic:
1. **Verify Azure Registration**: Device registered in Azure (Entra account = Work or School account)
2. **Check Microsoft Certificate**: `MS-Organization-Access` certificate appears in MDM Inventory > Devices > [device] > Certificates
3. **Initiate O365 Sync**: Once cert is fetched, trigger sync
4. **Check Enrollment**: Verify device marked enrolled in MDM's O365 CA page
5. **Check Compliance**: Microsoft Entra ID > Devices > All Devices

> **UX ask**: One-button "Run O365 CA Diagnostic" that walks through all 5 checks automatically and surfaces pass/fail per step.

---

### 4.3 Office 365 MAM Policies (mobile, no enrollment)

Path: `MDM > Device Mgmt > Office 365 MAM Policy (under Conditional Access)`

#### 4.3.1 Purpose
Apply security configurations to **Microsoft 365 apps** (Word, Excel, Teams, OneDrive, etc.) on iOS + Android **WITHOUT enrolling the device**. Ideal for BYOD.

#### 4.3.2 What it protects
- Data protection
- Access requirements
- Conditional launch settings

#### 4.3.3 Prerequisites
- Organization must have **Entra ID account**
- **Microsoft Intune licenses** for each user who'll get MAM policies (enforced by Microsoft)

#### 4.3.4 Use case
> "Sales rep with personal iPhone needs Microsoft Word + Outlook access. Don't want to enroll their personal device, but want to protect corporate data."

MAM solution:
- User downloads Word + signs in with corporate Entra ID
- MAM policy applies (e.g., require PIN to open, no copy-paste to personal apps, wipe corporate data on logout)
- Personal data on the device is untouched

> **UX ask**: Position MAM as "BYOD-friendly alternative to full device enrollment". Compare side-by-side with full MDM enrollment in the CA section's intro.

#### 4.3.5 Policy components

```
Office 365 MAM Policy > Create
        │
        ▼
1. Policy Name + Description
2. Target Apps (Word / Excel / PowerPoint / Outlook / Teams / OneDrive / etc.)
3. Data Protection:
   ├── Allow / disallow copy-paste to non-managed apps
   ├── Encryption requirement
   ├── Save-as restriction
   └── Block printing
4. Access Requirements:
   ├── App PIN required
   ├── Biometric allowed
   ├── PIN complexity
   └── Number of attempts before block
5. Conditional Launch:
   ├── Minimum OS version
   ├── Block jailbroken / rooted devices
   ├── Block on offline use beyond N days
   └── Block on app version too old
6. Target users (Entra users/groups)
7. Apply
```

---

### 4.4 Okta Device Trust

Path: `MDM > Device Mgmt > Okta Device Trust`

#### 4.4.1 Purpose
Verify users + devices using Okta as the IdP. When integrated with MDM, supports:
- **BYOD** (Bring Your Own Device)
- **COPE** (Corporate-Owned Personally Enabled)

#### 4.4.2 Setup overview
1. Integrate Okta with MDM
2. Configure Okta Device Trust on Okta side
3. Pair Okta policies with MDM compliance signals
4. Resources behind Okta now check device trust before granting

> **UX ask**: Setup is multi-step across two products (Okta + EC). Provide a side-by-side "What to do where" guide. Most admins get lost moving between consoles.

---

### 4.5 Zoho Workspace Integration

Path: `MDM > Device Mgmt > Zoho Workspace`

#### 4.5.1 Purpose
For organizations using Zoho Mail + Workspace — apply CA policies to enforce device compliance before Zoho resources are accessible.

#### 4.5.2 Use cases
- Block Zoho Mail access from unenrolled iPhones
- Allow Zoho Docs only on managed Macs

#### 4.5.3 Configuration
Integration with Zoho Workspace happens at the org level (admin token); per-device gating happens via MDM compliance status.

---

### 4.6 System Quarantine Policy (NAC for desktops/laptops)

Path: `Threats & Patches > Compliance > System Quarantine Policy`

⚠️ **Separate from MDM CA**. This is for **Windows / Mac / Linux desktops/laptops** — not mobile devices.

#### 4.6.1 Purpose
Network Access Control (NAC) for laptops/desktops. When a system fails compliance (vulnerability detected, software missing, etc.), it gets quarantined from the network.

#### 4.6.2 The 4 quarantine modes

| Mode | What happens |
|---|---|
| **Block all network access** | System fully isolated — only EC components reachable |
| **Block only intranet in range** | System isolated from local network; internet still works |
| **Block custom domain & IP** | Block specific list |
| **Allow access only to custom IP/VPN/Domains** | Whitelist approach — most flexible |

> **UX ask**: Show consequences of each mode with concrete examples:
> - "Block all = user can't even reach Google.com"
> - "Block intranet = user can browse internet, but can't reach corporate SharePoint"
> - "Whitelist = user can ONLY reach what you list"

#### 4.6.3 Configuration

```
Threats & Patches > Compliance > System Quarantine Policy > Create Policy
        │
        ▼
1. Policy Name
2. Trigger conditions:
   ├── Vulnerability detected (CVSS-score based — categorize by Critical / High / Medium / Low)
   ├── Specific software missing
   ├── Specific software detected
   ├── Compliance check failed
   └── Custom condition
        │
        ▼
3. Quarantine Action:
   ├── Mode (Block all / intranet / custom / whitelist)
   └── Custom domains/IPs (per mode)
        │
        ▼
4. Notification:
   ├── End-user notification (what they see when quarantined)
   └── Admin notification (who to alert)
        │
        ▼
5. Recovery:
   ├── Auto-recover when compliance restored?
   └── Manual recovery only?
        │
        ▼
6. Target devices (Custom Groups / SoM)
        │
        ▼
Save & Apply
```

#### 4.6.4 Benefits (from docs)
- **Real-time Compliance Management** — proactive identification of vulnerabilities
- **Automated Enforcement** — streamlined compliance + auto actions
- **Categorize vulnerabilities by CVSS score**

#### 4.6.5 Recovery path
When admin remediates the trigger (patches the CVE, installs missing software, etc.):
- If auto-recover enabled: system rejoins network automatically
- If manual: admin clicks "Restore Access" in console

> **UX ask**: For end-users, show a friendly "Your computer is quarantined because: [reason]. [Steps to fix]" page that's reachable even while quarantined (since EC components stay accessible).

---

## 5. Field-Level Inventory — Records & Settings

### 5.1 CEA Configuration record

- Exchange Server FQDN
- Admin Username
- Password (encrypted; app-specific if MFA)
- Default Access Level (Allow / Block / Quarantine)
- Apply Policy On (All / Specific users)
- Selected users (if Specific)
- Excluded users
- Grace Period (days)
- Grace Period mail recipients (auto)
- Sync schedule (default 4 AM daily)
- Last sync date/time
- Sync status (Success / Failed / In progress)
- EXO V2 module status (cloud Exchange only)
- Rollback enabled on remove (bool)

### 5.2 CEA Device record (per device per user)

- User
- Device name / type
- EAS Device Identifier
- Current state (Allow / Block / Quarantine)
- Last sync with Exchange
- Enrolled in MDM (bool)
- Grace Period status (in grace / expired / N/A)
- Manual override applied (bool)
- Override by admin
- Override timestamp

### 5.3 Entra CA (O365) Configuration record

- Azure tenant ID
- Azure integration status (Integrated / Not integrated)
- Global admin credentials (OAuth-based)
- Policy applied (link to Azure portal)
- Sync schedule

### 5.4 Entra CA Device record (per device)

- Device name
- Azure registered (bool)
- MS-Organization-Access certificate present (bool)
- Last O365 sync
- Enrolled in MDM (bool)
- Compliance status (Compliant / Non-compliant)
- Entra-reported compliance state

### 5.5 Okta Device Trust Configuration

- Okta tenant
- Integration status
- Compliance signal mapping

### 5.6 Zoho Workspace Configuration

- Zoho tenant
- Integration status
- Policy mapping

### 5.7 O365 MAM Policy record

- Policy ID / Name / Description
- Target apps (list)
- Data protection settings (multiple toggles)
- Access requirements (PIN, biometric, complexity)
- Conditional launch (OS version, jailbreak, offline, app version)
- Target users (Entra)
- Intune licensing required note

### 5.8 System Quarantine Policy record

- Policy ID / Name
- Trigger conditions (CVSS-based / software / compliance)
- Quarantine mode (4 options)
- Custom domains/IPs (if applicable)
- End-user notification message
- Admin notification recipients
- Auto-recovery (bool)
- Target devices (Custom Groups / SoM)
- Status (Active / Suspended / Disabled)

### 5.9 Quarantined Device record

- Device
- Policy that triggered
- Trigger reason (e.g. CVE-2026-XXXX detected)
- Quarantine start date/time
- Current network state (which mode active)
- Compliance status
- Last compliance check
- Recovery eligibility

---

## 6. Workflows — Common admin journeys

### W1. Roll out CEA in pilot mode
```
1. MDM > Device Mgmt > Conditional Exchange Access
2. Setup: Exchange admin creds, EXO V2 module installed for cloud
3. Default Access Level: Quarantine (recommended)
4. Apply Policy On: Specific users → pick "Pilot-Group-IT-Dept" (20 users)
5. Grace Period: 7 days
6. Save
7. IT team receives Grace Period mail → enrolls iPhones/iPads in MDM via Exchange ActiveSync profile
8. After 7 days: enrolled devices → Allow; unenrolled → Block
9. Monitor for 2 weeks → no major issues
10. Expand: Apply Policy On: All Users with 14-day grace
11. Communicate to entire org before applying
12. Apply
```

### W2. Block a specific compromised device immediately
```
1. Security alert: device PHONE-XYZ likely compromised
2. CEA > Device List > find PHONE-XYZ row
3. Manual override → Block
4. Immediately blocked from Exchange
5. Optional: Remove-MobileDevice via console
6. Notify user via separate channel (not corporate email — they're blocked)
```

### W3. Set up Entra CA for Office 365 access
```
1. Azure side:
   - Login to Azure Portal as Global Admin
   - Entra ID > Security > Conditional Access > Create
   - Users: select group "All Employees"
   - Cloud Apps: Office 365
   - Conditions: Windows platform
   - Access Controls: Grant > "Require device compliant"
   - Enable: ON > Create
2. EC side:
   - MDM > Device Mgmt > Office 365 (Conditional Access)
   - Integrate Azure (OAuth)
   - Apply Policy
   - View Device Details — all Win 10+ enrolled devices marked compliant in Azure
3. End-user impact:
   - Compliant Win 10+ devices: full access
   - Non-compliant: blocked
   - iOS/Android: blocked entirely (must use MAM instead)
```

### W4. BYOD without enrollment via MAM
```
1. CFO wants Outlook on personal iPhone without enrolling personal device
2. MDM > Device Mgmt > Office 365 MAM Policy > Create
3. Target apps: Outlook + Word + Excel + OneDrive
4. Data Protection:
   ☑ Block copy-paste to non-managed apps
   ☑ Encrypt data
   ☑ Block save-as to personal storage
5. Access Requirements:
   ☑ App PIN (6 digits)
   ☑ Biometric allowed
   ☑ Block after 5 wrong attempts
6. Conditional Launch:
   ☑ Block jailbroken
   ☑ Min iOS 17
7. Target: CFO's Entra ID account
8. CFO downloads Outlook, signs in with corp Entra credentials
9. MAM policy auto-applies; personal data on iPhone untouched
```

### W5. Quarantine non-compliant laptop after CVE detection
```
1. EC-02 detects CVE-2026-XXX on laptop LAPTOP-ABC
2. System Quarantine Policy "Critical-CVE-Quarantine" matches CVSS > 9.0
3. Auto-triggers Quarantine: "Block only intranet"
4. LAPTOP-ABC isolated from corp network (still has internet)
5. End-user sees: "Your laptop is quarantined due to CVE-2026-XXX. [Apply patch] to restore."
6. EC server still accessible from laptop (EC components allowed in all modes)
7. User clicks "Apply patch" → patch installs from EC > Patch Mgmt
8. Auto-recovery: laptop rejoins network
```

### W6. Diagnose enrolled device still blocked
```
1. User: "I enrolled but can't access email"
2. Admin: CEA > Device list > user → finds device in Block
3. Check EAS Identifier on this row
4. MDM > Enrollment tab > add EAS Identifier column
5. Find user's device → compare EAS Identifier
6. MISMATCH → Exchange was configured manually, not via MDM
7. Fix: push Exchange ActiveSync profile via MDM
8. New EAS Identifier registered → CEA Allow
9. User can access email
```

### W7. Grace Period extension for late enrollment
```
1. Policy active with 7-day Grace Period
2. Day 6: marketing dept manager requests extension (10 people not yet enrolled due to travel)
3. CEA > policy edit > extend grace by 7 days
4. Marketing devices remain in Allow state during extended grace
5. Grace Period mail re-sent at 4 AM scheduler
```

### W8. Roll back CEA policy (e.g. business decision change)
```
1. Org leadership decides: CEA too restrictive; revert to "all access"
2. CEA > policy management
3. Modify policy → Apply Policy On: change to "Specific users" with empty list (essentially removing scope)
4. ☑ Enable Rollback
5. Save
6. All previously blocked devices regain access immediately
7. Continue monitoring via daily sync (no enforcement)
```

### W9. Handle MFA-protected Exchange admin account
```
1. Exchange admin has MFA on
2. CEA Setup: try password → fails with auth error
3. Admin generates app-specific password in Microsoft 365 admin center
4. Use app-specific password in CEA setup
5. Connection succeeds
6. Document app-specific password securely (treat as secret)
```

---

## 7. Error States & Troubleshooting

### 7.1 CEA setup errors

| Error | Cause | Remediation |
|---|---|---|
| "PowerShell session failed" | PowerShell 5.1 not installed on EC server | Install PowerShell 5.1 |
| "Basic Auth disabled" | Exchange refuses Basic Auth | Enable in IIS Manager > Default Website > PowerShell |
| "Auth failed — bad password" | Wrong password OR MFA enabled | Use app-specific password if MFA |
| "EXO V2 module missing" (cloud) | Old Exchange Online PowerShell | Run script to upgrade |
| "Set-ExecutionPolicy required" | PowerShell execution disabled | Run `Set-ExecutionPolicy Unrestricted` |
| "Cannot sync — admin lacks permissions" | Service account missing commandlet access | Grant required permissions (see commandlet list) |

### 7.2 CEA runtime errors

| Error | Cause | Remediation |
|---|---|---|
| "Device blocked despite enrollment" | EAS Identifier mismatch | Reconfigure Exchange via MDM profile (W6) |
| "Outlook blocked even though enrolled" | Outlook's EAS ID is user-not-device | Expected — use native mail OR Gmail |
| "Unmanaged device reappears after delete" | Password unchanged + Allow default | Change password OR set Default to Block |
| "Daily sync not running" | Server downtime / scheduler issue | Manual sync; check scheduler status |
| "Grace Period mail not received" | User not in "Allowed + not enrolled" state OR mail server issue | Verify user state; check mail logs |
| "Exchange Online sync 24h delay" | Microsoft Cloud propagation | Wait — known Microsoft behavior |

### 7.3 Entra CA errors

| Error | Cause | Remediation |
|---|---|---|
| "MS-Organization-Access cert missing" | Device not Azure-registered | Add Entra account as Work/School on device |
| "Compliance status stuck Non-compliant" | MDM hasn't synced compliance to Azure | Initiate O365 Sync |
| "Premium license missing" | User lacks Entra ID P1 | Assign license |
| "Global admin permission denied" | Setup account isn't Global Admin | Use Global Admin account |
| "iOS user can't access M365" | Entra CA is Windows-only | Use O365 MAM Policy instead |

### 7.4 Quarantine Policy errors

| Error | Cause | Remediation |
|---|---|---|
| "Quarantined device can't be reached for patching" | "Block all" mode used | EC components allowed in all modes — should still work; if not, check firewall rules |
| "Auto-recovery not triggering" | Compliance check still failing | Verify trigger condition resolved |
| "User locked out of all resources" | Whitelist mode missed key resources | Add resources to whitelist OR change mode |

---

## 8. Edge Cases & Gotchas

1. **CEA is on-premises ONLY.** Cloud customers cannot use it. UI must hide entirely or show migration path.

2. **Outlook mobile app cannot be conditionally accessed properly** — EAS ID is user-level not device-level. CEA blocks Outlook entirely when applied.

3. **Native mail vs Outlook EAS ID difference** is non-intuitive. Document clearly.

4. **Default Access Level = "Allow" with no policy = no enforcement.** Easy to misunderstand.

5. **Grace Period applies to existing devices ONLY.** New devices joining post-policy with Default = Block / Quarantine have NO grace period.

6. **Quarantine ≠ Block** in CEA — Quarantine still allows mailbox access during Grace Period; Block doesn't.

7. **MFA on admin account requires app-specific password.** Easy admin mistake.

8. **EXO V2 module required for Exchange Online.** Old PowerShell module = sync issues.

9. **Exchange Online state change can take up to 24 hours.** Don't expect instant propagation.

10. **Daily sync runs at 4 AM** (server time). For global orgs, this is off-hours in some regions but business hours in others.

11. **Grace Period mail sent at 4 AM during sync.** Users in different time zones see it at different "Last Modified".

12. **PowerShell commandlets required need permissions** — `Set-CASMailbox`, `Get-MobileDeviceStatistics`, etc. Service account permissions audit.

13. **Removing CEA doesn't auto-revert** unless Rollback was enabled. Devices stay blocked.

14. **Manually deleting unenrolled devices from console = they reappear** with same EAS ID + password. Workaround: change password OR set Default to Block.

15. **Entra CA = Win 10+ only.** Not iOS, Android, macOS. Use MAM for those.

16. **Entra ID P1 license required PER USER.** Not org-wide. Budget impact.

17. **Global Administrator required** to integrate MDM with Entra. Not just any admin.

18. **Entra CA needs MS-Organization-Access certificate** to verify compliance. Cert must be in Inventory > Devices > Certificates.

19. **MAM policies need Intune licenses per user** — enforced by Microsoft, not optional.

20. **Okta Device Trust setup spans two consoles** — easy to miss config on Okta side.

21. **Zoho Workspace integration uses Zoho admin token** — separate from MDM auth.

22. **System Quarantine Policy is SEPARATE from MDM Conditional Access** — different tab, different concept. Often conflated.

23. **Quarantine "Block all" still allows EC components** — by design, so patching can happen during quarantine.

24. **Auto-recovery in Quarantine Policy requires compliance trigger to be resolvable** — if trigger is "CVE detected" and no patch exists, no auto-recovery.

25. **Apply Policy on All Users with no Excluded Users** — full org coverage. Easy to break things if not tested first.

26. **Excluded users override Apply Policy On.** Even with "All Users", excluded users bypass entirely.

27. **Personal Exemption (Exchange concept) vs Excluded Users (CEA concept)** — both exist; CEA's wins when policy applied.

28. **Device Access Rules (Exchange) overridden by CEA** — when CEA active, EC takes over.

29. **CEA needs Exchange ActiveSync profile pushed FIRST.** Without it, EAS Identifier never registers under MDM.

30. **Multiple users on same device** — each user has own EAS Identifier (in some clients). State per user.

31. **Windows phones in CEA matrix not fully shown** — Windows is deprecated mobile platform; coverage limited.

32. **Samsung 8.0+ vs Non-Samsung Android** — different Gmail app support. Important for Android-heavy orgs.

33. **Quarantine Policy "Allow access only to custom IP/VPN/Domains"** — most flexible but requires correct config or users get fully locked out.

34. **End-user-facing quarantine message** needs to be reachable even when quarantined. Design EC-hosted help URL.

35. **Setting up CEA requires PowerShell on EC server itself** — not just any machine. Audit / network reachability of Exchange from EC server matters.

36. **Read-only commandlets vs write commandlets** — sync uses read-only only (safe). Write happens only on policy apply.

37. **Set-CASMailbox runs per user, per device** — for large orgs, sync time grows. Budget for hours, not minutes.

38. **Entra CA + iOS user = blocked with no workaround on EC** — push them to O365 MAM Policy instead. Surface this in policy creation UI.

39. **MAM = NO device enrollment** — perfect for BYOD but doesn't give the admin device inventory data.

40. **System Quarantine Policy can chain with CEA**: User's phone gets CEA-blocked (no email); their laptop gets system-quarantined (no network). Two surfaces, same user.

---

## 9. UI / UX Screens Needed

### 9.1 CEA (Conditional Exchange Access) (8 screens)
1. CEA landing page (status overview + KPIs: devices in Allow/Block/Quarantine)
2. CEA Setup Checklist wizard (PowerShell + Basic Auth + EAS profile + EXO V2)
3. CEA Setup form (Exchange credentials + Default Access Level)
4. CEA Policy builder (Apply On + Exclude + Grace Period + Grace Mail customization)
5. CEA Device List (per-device state with manual override)
6. CEA Sync history + manual sync trigger
7. CEA per-device drilldown (EAS Identifier + sync history + override log)
8. CEA Diagnostic Tool (EAS Identifier mismatch checker)

### 9.2 Entra CA / Office 365 (5 screens)
9. Entra integration setup (Azure OAuth)
10. Entra CA Policy view (link to Azure portal where policy lives)
11. Device Details view (Win 10+ enrolled, compliance status)
12. Entra CA Diagnostic Tool (5-step check)
13. iOS/Android user "use MAM instead" redirect

### 9.3 O365 MAM Policy (4 screens)
14. MAM Policy list
15. Create MAM Policy wizard (target apps + data protection + access + launch + users)
16. MAM Policy Data Protection panel
17. MAM Policy Conditional Launch panel

### 9.4 Okta + Zoho Workspace (3 screens)
18. Okta Device Trust integration setup
19. Zoho Workspace integration setup
20. Zoho Workspace policy

### 9.5 System Quarantine Policy (4 screens)
21. System Quarantine Policy list
22. Create Quarantine Policy (trigger + mode + custom IPs + recovery)
23. Quarantined devices view (per-device with recovery)
24. End-user-facing quarantine notification page

### 9.6 Cross-cutting (3 screens)
25. Conditional Access Dashboard (across all 5+1 surfaces with KPIs)
26. Impact Preview modal (before applying broad policies)
27. Rollback Configuration modal (with clear consequences)

---

## 10. Component Library — Conditional Access specific

### 10.1 State badges (used everywhere)
- **`AccessStateBadge`** — Allow (green) / Block (red) / Quarantine (amber)
- **`ComplianceBadge`** — Compliant (green check) / Non-compliant (red X)
- **`EnrollmentBadge`** — Enrolled / Not enrolled / Unmanaged

### 10.2 Setup wizards
- **`CEASetupWizard`** — multi-step setup with prerequisites checklist
- **`PrerequisitesChecklist`** — PowerShell / Basic Auth / EAS Profile / EXO V2 / MFA
- **`ExchangeCredentialsField`** — Exchange admin creds with MFA-aware password field
- **`EXOV2InstallerHelper`** — download script + installation steps
- **`AzureIntegrationOAuthButton`** — Azure OAuth flow trigger

### 10.3 Policy builders
- **`DefaultAccessLevelPicker`** — 3-option with consequences explained per option
- **`ApplyPolicyOnPicker`** — All Users vs Specific Users with impact preview
- **`UserSelectorWithImpact`** — selector showing total impacted devices
- **`ExcludeUsersPicker`** — separate excluded list
- **`GracePeriodConfig`** — days input + Grace Period Mail customization
- **`GracePeriodMailPreview`** — preview what user receives
- **`RollbackEnabledToggle`** — with consequence explanation
- **`QuarantineModePicker`** — 4 modes with concrete examples per mode

### 10.4 Device list
- **`CEADeviceList`** — filterable + sortable by state, user, device type, sync time
- **`EASIdentifierDisplay`** — copyable EAS ID
- **`ManualOverrideButton`** — change state with confirmation
- **`PerDeviceOverrideHistory`** — audit log of state changes

### 10.5 Diagnostic tools
- **`CEADiagnosticTool`** — one-click EAS Identifier mismatch check
- **`O365CADiagnosticTool`** — 5-step diagnostic (Azure / cert / sync / enrollment / compliance)
- **`MS-Organization-Access-CertChecker`** — verify cert presence in MDM Inventory
- **`SyncStatusIndicator`** — last sync + next sync + manual sync button

### 10.6 Mobile app config (MAM)
- **`MAMPolicyBuilder`** — multi-step with Data Protection / Access / Launch
- **`TargetAppsPicker`** — M365 app multi-select with icons
- **`DataProtectionToggles`** — clear groupings (copy-paste, encryption, save-as, print)
- **`AccessRequirementsConfig`** — PIN + biometric + complexity + attempts
- **`ConditionalLaunchConfig`** — min OS, jailbreak, offline, app version

### 10.7 System Quarantine
- **`SystemQuarantinePolicyBuilder`** — trigger + mode + custom + recovery
- **`TriggerConditionPicker`** — CVSS-based / software / compliance with multi-condition
- **`QuarantineModeWithExamples`** — visual showing what users can/can't reach per mode
- **`QuarantineRecoveryConfig`** — auto vs manual

### 10.8 Impact preview / safety
- **`ImpactPreviewModal`** — "This policy will affect X users / Y devices" before save
- **`BroadScopeWarning`** — "All Users" gets extra friction
- **`RollbackWarningBanner`** — when admin removes policy without rollback
- **`MFADetectedNotice`** — admin account has MFA → use app-specific password

### 10.9 End-user-facing
- **`EndUserQuarantineNotification`** — friendly message with fix steps + Self-Enrollment URL
- **`GracePeriodCountdownBanner`** — for users in grace, count down to enforcement
- **`EnrollmentSelfServiceLanding`** — branded enrollment landing page

---

## 11. Cross-Module Dependencies

| Module | Relationship |
|---|---|
| **MDM Profiles** | Exchange ActiveSync profile is PREREQUISITE for CEA |
| **MDM Enrollment** | Self-enrollment URL embedded in Grace Period mails + quarantine messages |
| **EC-03 Inventory** | EAS Identifier visible via column chooser in Enrollment view |
| **EC-09 Certificate Management** | SCEP cert for Entra ID cert-based authentication |
| **EC-02 Vulnerability Management** | CVE detection triggers System Quarantine Policy |
| **EC-CROSS Custom Groups** | Target users for CEA / Excluded users / Quarantine targets |
| **EC-CROSS RBAC** | Who can configure Conditional Access policies |
| **EC-CROSS Audit Log** | All policy applies / state changes audited |
| **External: Exchange Server** | CEA depends on Exchange + Basic Auth |
| **External: Microsoft Entra ID** | Native CA happens in Azure; MDM feeds compliance signal |
| **External: Okta** | Okta Device Trust separately configured in Okta |
| **External: Zoho Workspace** | Zoho admin token for integration |
| **External: Microsoft Intune licenses** | Required for MAM policies |
| **External: PowerShell on EC server** | Required for CEA |

---

## 12. Reference URLs

### Help docs — primary
- Conditional Access overview (MDM): https://www.manageengine.com/mobile-device-management/help/profile_management/mdm_conditional_access.html
- Conditional Exchange Access (MDM): https://www.manageengine.com/mobile-device-management/help/profile_management/mdm_conditional_exchange_access.html
- Conditional Exchange Access (EC): https://www.manageengine.com/products/desktop-central/help/mobile_device_management/security_management/mdm_conditional_exchange_access.html
- Office 365 Conditional Access (MDM): https://www.manageengine.com/mobile-device-management/help/profile_management/mdm_o365_conditional_access.html
- Office 365 Conditional Access (MSP): https://www.manageengine.com/mobile-device-management-msp/help/profile_management/mdm_o365_conditional_access.html
- Microsoft Entra Conditional Access CBA: https://www.manageengine.com/mobile-device-management/help/profile_management/mdm_ca_azuread_cba.html
- Okta Device Trust: https://www.manageengine.com/mobile-device-management/help/profile_management/okta_device_trust.html
- Zoho Workspace CA setup: https://www.manageengine.com/mobile-device-management/how-to/mdm-enable-conditional-access-zoho-mail.html
- Office 365 MAM Policy: https://www.manageengine.com/mobile-device-management/help/profile_management/mdm_office365_app_policies.html
- System Quarantine Policy: https://www.manageengine.com/products/desktop-central/help/vulnerability-remediation/quarantine-compliance.html
- Why Outlook is blocked by CEA: https://www.manageengine.com/mobile-device-management/mdm-cea-block-outlook.html
- Exchange ActiveSync iOS: https://www.manageengine.com/mobile-device-management/help/profile_management/ios/mdm_exchange_active_sync.html
- Exchange ActiveSync Android: https://www.manageengine.com/mobile-device-management/help/profile_management/android/mdm_android_exchange_activesync.html
- Exchange ActiveSync Windows: https://www.manageengine.com/mobile-device-management/help/profile_management/windows/mdm_windows_exchange_active_sync.html

### Microsoft references
- EXO V2 PowerShell module: https://docs.microsoft.com/en-us/powershell/exchange/exchange-online/exchange-online-powershell-v2/exchange-online-powershell-v2
- MFA app-specific passwords: https://docs.microsoft.com/en-us/azure/active-directory/user-help/multi-factor-authentication-end-user-app-passwords

### Demo videos
- CEA setup demo (under 3 min): https://www.manageengine.com/mobile-device-management/demo/securing-access-to-exchange-mailboxes-with-mdm-video.html

---

## 13. Critical UX Tensions

1. **Default Access Level "Block" with no Grace Period** can lock out an entire org. Default to Quarantine + show consequences.

2. **CEA on-premises ONLY** — Cloud customers lose this surface. UX should redirect to Entra CA early.

3. **Outlook mobile blocked entirely by CEA** is counter-intuitive — users expect it to be supported. Loud warning required.

4. **Apply Policy On = "All Users"** is high-risk default. Strongly recommend pilot mode first.

5. **Grace Period applies to existing devices ONLY** — new devices skipped. Easy to confuse.

6. **Quarantine vs Block in CEA** — Quarantine = mailbox access during grace; Block = no access. Diagram needed.

7. **EAS Identifier mismatches between Enrollment and CEA view** — manual comparison painful. Need diagnostic tool.

8. **MFA-protected admin needs app-specific password** — easy mistake at setup.

9. **EXO V2 module requirement** for cloud Exchange is non-obvious. Surface in checklist.

10. **24-hour sync delay on Exchange Online** — admins panic when changes don't propagate. Set expectations.

11. **Daily sync at 4 AM server time** — timezone awareness needed for global orgs.

12. **Rollback toggle on policy removal** — without it, blocked devices stay blocked. Surface consequence prominently.

13. **PowerShell on EC server** is required — not a generic Windows machine. Document setup carefully.

14. **Entra CA = Win 10+ ONLY** — iOS/Android/macOS users get blocked with no remediation. Redirect to MAM clearly.

15. **Entra ID P1 license per user** = budget impact. Surface licensing cost in setup.

16. **Global Administrator required** for Entra integration — too many setups fail because the wrong admin tries.

17. **MS-Organization-Access certificate** verification is hidden inside Inventory. Make it discoverable.

18. **Conditional Access spans 6 surfaces** (CEA + Entra + Okta + Zoho + MAM + System Quarantine) — overwhelming. Dashboard view helps.

19. **CEA and System Quarantine Policy are separate tabs** but conceptually related. Cross-link clearly.

20. **Quarantine Policy "Block all" still allows EC** — non-obvious but critical (allows patching during quarantine).

21. **Manual override on individual devices** can lead to "I forgot why I allowed this" later. Audit trail with comments.

22. **Remove Exchange server details ≠ Remove policy** — different consequences. Confirm modal needed.

23. **Outlook EAS ID = user-level** explanation needs visual diagram for admins to understand.

24. **Email client support matrix** (Samsung 8.0 vs non-Samsung etc.) is intricate — admins need a clear pre-rollout table.

25. **Excluded Users override Apply Policy On** — non-intuitive precedence. Make explicit.

26. **Personal Exemptions and Device Access Rules in Exchange overridden by CEA** — admins worry their existing rules are lost. They aren't, just suspended during CEA.

27. **Per-user license requirements (Entra P1, Intune)** are budget surprises. Calculate upfront.

28. **End-user-facing notifications must work even when device is restricted** — design carefully (mail blocked = need SMS / push / call alternative).

29. **MAM vs MDM enrollment** — admins confuse them. Clear comparison needed.

30. **Self-Enrollment URL in Grace Period Mail** is configured ON EXCHANGE SERVER (ecp), not in MDM. Confusing.

31. **PowerShell commandlet permissions** — service account audit. Surface requirements upfront.

32. **Cross-region orgs** — daily sync 4 AM in one TZ is awkward for another. Make schedule configurable.

33. **Quarantine end-user message reachability** — must work even with "Block all" network. EC components allowed; design landing page there.

34. **CVSS-based Quarantine triggers** — what about non-CVSS compliance failures (missing AV, missing patch). Multi-condition needed.

35. **Auto-recovery from System Quarantine** — relies on compliance check passing. If no auto-fix path, device stays quarantined forever.

---

## 14. Status Lifecycle Summary

### CEA Device state lifecycle
```
NEW DEVICE accesses Exchange
        │
        ▼
Daily sync (4 AM) detects device
        │
        ├── User in Excluded list → bypass (Full Access)
        ├── User in Specific Users list OR All Users active:
        │   │
        │   ▼
        │   Default Access Level check:
        │   ├── Allow → state = Allow
        │   ├── Block → state = Block (NO grace period for new)
        │   └── Quarantine → state = Quarantine (NO grace period for new)
        │
        └── Existing device (was already accessing):
              ├── Grace Period given → Full Access during grace
              └── After Grace Period:
                    ├── If enrolled in MDM → state = Allow
                    └── If not enrolled → state = Block / Quarantine per policy

ADMIN MANUAL OVERRIDE possible at any state → forces state change
```

### CEA Policy lifecycle
```
Created → Active → (Daily sync + state changes)
        │
        ├── Modified → re-evaluates all devices on next sync
        ├── Suspended → no enforcement, sync continues for visibility
        ├── Removed with Rollback ON → blocked devices restored
        ├── Removed with Rollback OFF → blocked devices stay blocked
        └── Exchange server removed → no further sync, no further enforcement
```

### Entra CA / O365 device lifecycle
```
Device tries M365 app
        │
        ▼
Azure asks: Is device compliant?
        │
        ├── Compliant signal from MDM:
        │   ├── Azure registered ✅
        │   ├── MS-Organization-Access cert ✅
        │   ├── O365 sync done ✅
        │   ├── Enrolled in MDM ✅
        │   └── → ALLOW access
        │
        └── Non-compliant:
              └── BLOCK → user sees Azure block message
                  └── User remediates (enroll / fix compliance) → re-evaluated on next sync
```

### System Quarantine lifecycle
```
Compliance check fails OR vulnerability detected
        │
        ▼
Quarantine Policy trigger matches
        │
        ▼
QUARANTINED (mode-specific network restrictions)
   ├── Block all
   ├── Block intranet
   ├── Custom domain block
   └── Whitelist mode
        │
        ▼
End-user notified (reachable via EC components)
        │
        ▼
User remediates (patches CVE / installs software / etc.)
        │
        ▼
Compliance check re-runs
        │
        ├── Pass + Auto-recovery enabled → AUTO-RESTORED
        └── Pass + Manual → admin clicks Restore Access → RESTORED
```

### MAM Policy lifecycle (no device enrollment)
```
User downloads M365 app (Word/Outlook/etc.) on personal device
        │
        ▼
Signs in with corporate Entra ID
        │
        ▼
MAM Policy auto-applies:
   ├── Data Protection rules active
   ├── App PIN required
   ├── Conditional Launch checks (OS / jailbreak / offline / version)
        │
        ▼
User uses app within policy constraints
   ├── Tries to copy-paste to personal app → blocked
   ├── Goes offline beyond N days → app blocked until online
   └── App version too old → forced update
        │
        ▼
User logs out / Admin wipes corporate data → CORP data removed (personal untouched)
```

---

## 15. Module signature — one-paragraph mental model

> **Conditional Access** is Endpoint Central's **access gatekeeper** — the policy surface that determines which devices and users can reach corporate resources (Exchange mail, Office 365 cloud apps, Okta-protected resources, Zoho Workspace, and the corporate network itself for laptops/desktops). The six jobs an admin must accomplish without friction are: (1) **set up Conditional Exchange Access (CEA)** with Exchange admin credentials + PowerShell + EAS profile prerequisites and choose Default Access Level (Quarantine recommended) with Grace Period for existing devices, (2) **integrate Microsoft Entra (Azure AD) Conditional Access** for Office 365 with policy lived in Azure portal and MDM feeding compliance signals — Windows 10+ only, (3) **configure Office 365 MAM Policies** for BYOD iOS/Android users who get M365 apps without device enrollment (requires Intune licenses), (4) **integrate Okta Device Trust and Zoho Workspace** for identity-provider-based access control, (5) **apply System Quarantine Policy** to laptops/desktops failing compliance (4 quarantine modes: Block all / Block intranet / Block custom / Allow whitelist — EC components always reachable), and (6) **diagnose blocked-but-enrolled scenarios** via EAS Identifier matching, MS-Organization-Access certificate verification, and per-device sync history. The core UX commitments are: **safe defaults** (Quarantine over Block, Specific Users pilot over All Users), **impact preview before broad applies** (X users / Y devices affected), **clear visibility of state per device** (Allow green / Quarantine amber / Block red), **graceful recovery paths** (Grace Period mails with Self-Enrollment URLs, auto-recovery from System Quarantine), **explicit handling of Outlook limitation** (blocked entirely under CEA due to EAS Identifier being user-level not device-level), and **rollback consequences surfaced** when policies are removed (without rollback, blocked devices stay blocked). Every state change is audited; every policy apply records who/when/why; end-users always have a path to remediation.

---

**File**: EC-08 — Conditional Access (Deep Dive)
**Companion files**: EC-00 (Master), EC-01 (Patch Mgmt), EC-02 (Vuln Mgmt), EC-03 (Inventory), EC-04 (Software Deployment), EC-05 (Remote Tools), EC-06 (OS Imaging), EC-07 (Reports)
**Next**: EC-09 — Certificate Management (SCEP, APNs, certificate distribution) — say `next` for sequential, or specify priority module (e.g. "EDR first" / "BitLocker first")
