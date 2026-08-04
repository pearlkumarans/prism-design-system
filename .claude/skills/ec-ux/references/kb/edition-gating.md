# Edition Gating (verified against the official matrix)

> **Source:** ManageEngine Endpoint Central **Edition Comparison Matrix** (On-Premises),
> manageengine.com/products/desktop-central/edition-comparison-matrix.html — **verified 2026-07-09.**
> This is the authoritative answer to "which edition includes feature X, and is it Cloud/On-Prem?"
> Prices are "starts at" list figures — confirm via a live quote.

## Editions & starting price (On-Premises)

| Edition | Starts at | Notes |
|---|---|---|
| Free | $0 (25 endpoints) | Broad feature access at tiny scale |
| Professional | $795 | Core UEM |
| Enterprise | $945 | + self-service portal, USB device mgmt, session audit, license mgmt |
| UEM | $1,095 | + remote data wipe, OS deployment, FileVault |
| Security | $1,695 | + the endpoint-security suite bundled (see below) |

- **Security Edition is available for both On-Premises and Cloud.**
- **MDM for Windows/macOS laptops requires UEM or Security** (Professional/Enterprise MDM = mobile only).
- Flexible licensing: individual security features can be added to non-Security editions (contact sales).

## Security features — bundled vs add-on

Legend: ✓ = included · **Add-on** = separately licensed · `*` = **Cloud only** · `^` = **On-Prem only**

| Feature | Free | Professional | Enterprise | UEM | Security |
|---|---|---|---|---|---|
| Vulnerability Detection | ✓ | Add-on | Add-on | Add-on | ✓ |
| Application Control + EPM | ✓ | Add-on | Add-on | Add-on | ✓ |
| USB & Peripheral Device Control | ✓ | Add-on | Add-on | Add-on | ✓ |
| Data Loss Prevention (DLP) `^` | ✓ | Add-on | Add-on | Add-on | ✓ |
| Enterprise Browser Security | ✓ | Add-on | Add-on | Add-on | ✓ |
| BitLocker Management | ✓ | Add-on | Add-on | Add-on | ✓ |
| **Ransomware Protection** | ✓ | Add-on | Add-on | Add-on | **Add-on** |
| **Malware Protection (NGAV)** | ✓ | Add-on | Add-on | Add-on | **Add-on** |
| **Endpoint Detection & Response (EDR)** `*` | ✓ | Add-on | Add-on | Add-on | **Add-on** |
| Secure Private Access (ZTNA) `^` | ✓ | Add-on | Add-on | Add-on | Add-on |

**Key takeaways for design/PM:**
- **Ransomware Protection, Malware Protection (NGAV), and EDR are add-ons even in the Security edition** —
  not bundled like the other security modules. (Free edition gets them at ≤25 endpoints.)
- **EDR is Cloud-only** (`*`). **DLP and Secure Private Access are On-Premises only** (`^`).
- The rest of the security suite (Vulnerability, App Control+EPM, Device Control, Browser, BitLocker) is
  **bundled in Security** and an add-on in lower editions.

## Other notable gating (from the same matrix)

- **OS Imaging & Deployment:** Add-on in Professional/Enterprise; **included in UEM & Security** (and Free).
- **Digital Employee Experience (DEX)** — Experience monitoring, Insights & RCA, Automated Remediation:
  **Add-on in all paid editions** (included in Free).
- **Enterprise features gated above Professional:** Home-screen layout customization, USB device mgmt,
  Kiosk for Windows, Firmware password (Mac), Test & Approve patches, BIOS/driver patching, AV definition
  updates, mobile app update mgmt, OS update for mobile, patch download scheduling, Self-Service Portal &
  App Catalog, Office 365 MAM/Conditional Access, geo-fencing, remote-control screen recording, remote
  session for mobile — most are ✗ in Professional but ✓ from Enterprise up.
- **UEM-tier items:** FileVault encryption, remote lock/wipe/geo-tracking for **laptops**, Office 365
  Conditional Access for Windows, Firmware password (Mac).
- **General (Professional+):** Multi-technician support and Role-Based Administration are **not in Free**.
- **Voice/Video call** in remote troubleshooting is **On-Prem only** (`^`).
- **Value-added add-ons (priced separately, any paid edition):** Failover Server ($1,195), Secure Gateway
  Server ($345), Multilanguage Support ($345).

> When a brief needs edition/platform gating, cite this file. If it conflicts with an older statement in
> another module file, **this file (matrix-verified) wins** — flag the other file for update.
