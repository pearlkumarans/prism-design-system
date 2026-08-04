# Endpoint Central — Security Advisories & CVE Reference

> An **internal-awareness** reference to security advisories and CVEs that ManageEngine has published for **Endpoint Central / Desktop Central** itself (the product, not the third-party CVEs it remediates). This is for PM/Support/Dev situational awareness — to recognize an advisory by ID, understand its high-level impact, and know the fix. **Impact is described at a high level only; no exploitation detail is included.**

**Important distinction.** Endpoint Central plays two roles with CVEs:
- It **remediates** OS/third-party CVEs on managed endpoints — that is [patch-management.md](patch-management.md) and [vulnerability-management.md](vulnerability-management.md).
- It occasionally **has** CVEs in its own server/agent code — those are published in the KB "Security Updates on Vulnerabilities" category and catalogued here.

This file is the second of those. See [INDEX.md](INDEX.md) for the module map. Items marked **(inferred)** are reasoned, not stated verbatim.

---

## How EC ships security fixes

- Fixes are delivered as **PPM updates** (Patch/Service-Pack builds). To apply: **log in to the console → click the current build number (top-right) → download the latest applicable PPM → update.** This is the single most important habit for staying secure.
- Advisories list a **fixed build** per release line (Enterprise / MSP / specific build ranges). You must move to (at least) the fixed build for *your* line.
- Most agent/server advisories apply to **both On-Premises and Cloud**, except where noted (some, e.g., the 2021 auth-bypass, are **not applicable to Cloud** because ManageEngine operates and patches the cloud tier).
- ManageEngine runs a **Bug Bounty program** (Zoho Corp / Bugcrowd-style); several recent agent advisories were reported through it.
- Security contact: **endpointcentral-security@manageengine.com**; support: **endpointcentral-support@manageengine.com**.

---

## Why this matters (PM / Support / Dev)

- **PM:** Endpoint Central is a *highly privileged* platform — its server holds credentials and its agent runs as SYSTEM on every managed endpoint. That makes it a high-value target; historically, EC/Desktop Central auth-bypass/RCE bugs were **actively exploited in the wild** (CVE-2021-44515 had observed exploitation; the broader ManageEngine RCE family drew CISA/FBI advisories). Security posture and rapid-patch messaging are part of the product's value story, not a footnote.
- **Support:** Customers will ask "am I affected?" and "what build fixes it?" Know that the answer pattern is almost always **"upgrade to the latest PPM"**, that some advisories ship an **Exploit Detection Tool** (e.g., RCEScan.bat) and **Indicators of Compromise**, and that compromised on-prem servers require an **incident-response path** (isolate → backup → rebuild → restore matching build → patch → rotate credentials).
- **Dev:** The recurring themes are **(1) agent privilege escalation to SYSTEM** (local file operations during patch scan / log archiving / DLL handling), **(2) server-side authentication bypass / access control**, and **(3) classic web vulns** (SQLi, XSS, CSRF, IDOR, XXE). Defense-in-depth: least privilege in agent file ops, robust authN/authZ filters, input validation, and keeping bundled components (Tomcat, OpenSSL, PostgreSQL, jQuery) current.

**Staying patched — practical guidance:**
1. Subscribe to ManageEngine security advisories and watch the in-console build-update banner.
2. Treat EC server/agent updates as **security-critical**, not optional housekeeping — apply promptly, especially for *Critical/High* agent or server advisories.
3. After any auth-bypass/RCE-class advisory, run the provided detection tool and check IOCs before assuming you're clean.
4. Keep the EC host hardened (DMZ + Secure Gateway, TLS 1.2, restricted ports) per [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md).
5. For on-prem, ensure DB backups are current so restore-to-matching-build is possible after an incident.

---

## Advisory / CVE reference table

> Severity and fixed-build values are taken from the linked advisories where available; where the public KB page did not state a value at capture time it is left as "—" or marked (inferred). Always confirm the **fixed build for your specific release line** on the live advisory.

### Agent privilege-escalation advisories (highest current relevance)

| ID / Title | Type | High-level impact | Action / Fixed-in |
|---|---|---|---|
| **CVE-2024-10203** — Archive Logs Vulnerability in Agent Tray Icon | Local privilege escalation / arbitrary file deletion | The agent tray's "archive logs" feature could be abused to delete files in directories the user shouldn't reach, leading to arbitrary file deletion and privilege escalation. **Requires physical access.** Severity **High**. Applies to **On-Prem + Cloud**. | Upgrade via PPM. Fixed builds: Enterprise **11.3.2435.1**; 11.3.2416.21 & below → **11.3.2416.22**; 11.3.2428.9 & below → **11.3.2428.10**. (Released 23-Sep-2024.) |
| **CVE-2025-5494** — Privilege Escalation Vulnerability (Agent) | Local privilege escalation | Privileged file deletion performed by the agent during a **patch scan** could be exploited to elevate to **SYSTEM**. Attack vector **Local**; severity **Low** (but elevation to SYSTEM warrants prompt patching). | Upgrade via PPM. Fixed builds: 11.4.2500.25 & below → **11.4.2500.26**; 11.4.2508.13 & below → **11.4.2508.14**. (Released 24-Apr-2025.) |
| **Privilege Escalation in Agent via DTA tool** | Local privilege escalation | Escalation path through the agent's **DTA** diagnostic tool. | Upgrade to the fixed agent build per the advisory. |
| **Privilege Escalation in Agent via DLL** | Local privilege escalation (DLL-related) | Escalation path involving agent **DLL** handling. | Upgrade to the fixed agent build per the advisory. |
| **Service Trusted Path Escalated Privilege** | Local privilege escalation (unquoted/trusted service path class) | Service path handling could allow privilege escalation. | Upgrade to fixed build. |
| **Privilege Elevation / Elevation of Privilege Vulnerabilities** | Privilege escalation | General elevation-of-privilege fixes in the agent/service. | Upgrade to fixed build. |
| **CVE-2022-23863** — Privilege Escalation Vulnerability | Privilege escalation | Privilege escalation in the product. | Upgrade to fixed build. |
| **CVE-2017-7213** — Remote Control Privilege Violation | Privilege violation (remote control) | Improper privilege handling in the remote-control feature. | Upgrade to fixed build. |

### Server-side authentication / access-control advisories

| ID / Title | Type | High-level impact | Action / Fixed-in |
|---|---|---|---|
| **CVE-2021-44515** — Authentication Bypass | Auth bypass → RCE | Could allow an adversary to **bypass authentication and execute arbitrary code** on the server. **Severity Critical; exploitation observed in the wild.** Ships an **Exploit Detection Tool (RCEScan.bat)** + IOCs; full incident-response plan if affected. **Not applicable to Cloud.** | Enterprise: 10.1.2127.17 & below → **10.1.2127.18**; 10.1.2128.0–10.1.2137.2 → **10.1.2137.3** (MSP equivalents published). Run detector; if compromised, isolate→backup→rebuild→restore matching build→patch→rotate all credentials. (3-Dec-2021.) |
| **CVE-2021-44757** — Authentication Bypass | Auth bypass | Authentication-bypass weakness in the server. | Upgrade to fixed build per advisory. |
| **Insufficient Authentication and Authorization Handling** | Improper access control | Gaps in authN/authZ handling. | Upgrade to fixed build. |
| **Enhanced scope security for technicians** | Access-control hardening (RBA) | Tightened technician scope enforcement (Role-Based Administration). | Upgrade to fixed build. |
| **Improvements in access control mechanisms** | Access-control hardening | General access-control improvements (incl. NGAV-related). | Upgrade to fixed build. |
| **CVE-2015-2560** — Unauthorized Administrator credential modification | Improper authZ | Admin credentials could be modified without authorization. | Upgrade to fixed build. |

### Injection / web-application advisories

| ID / Title | Type | High-level impact | Action / Fixed-in |
|---|---|---|---|
| **CVE-2022-47523** — Authenticated SQL Injection | SQLi (authenticated) | Authenticated SQL injection in the application. | Upgrade to fixed build. |
| **CVE-2020-10859** — Arbitrary File Upload | Arbitrary file upload | Could allow uploading arbitrary files to the server. | Upgrade to fixed build. |
| **SRC-2020-0011** — Remote Code Execution | RCE | Remote code execution in the server. | Upgrade to fixed build. |
| **CVE-2020-8540** — XML External Entity (XXE) | XXE | XML external-entity processing weakness. | Upgrade to fixed build. |
| **CVE-2020-1938** — Ghostcat (Apache Tomcat AJP) | Information disclosure / file read (bundled Tomcat) | Tomcat AJP "Ghostcat" affecting the bundled web server. | Upgrade to fixed build (Tomcat update). |
| **Unauthenticated IDOR** | Insecure direct object reference | Object access without proper authorization. | Upgrade to fixed build. |
| **Cross-Site Scripting (multiple)** | XSS | Stored/reflected scripting issues (incl. Custom Reports). | Upgrade to fixed build. |
| **HTML Injection (Custom Reports / general)** | HTML injection | Injected markup in report/UI contexts. | Upgrade to fixed build. |
| **CVE-2014-9331 / CSRF (User Management Role Handling)** | CSRF | Cross-site request forgery, incl. user-management role handling. | Upgrade to fixed build. |
| **CVE-2020-15588 & CVE-2020-24397** — Integer Overflow | Integer overflow | Memory/logic safety issue. | Upgrade to fixed build. |
| **Vulnerabilities in Reports module** | Multiple web vulns | Issues localized to the Reports module. | Upgrade to fixed build. |

### Component / cryptographic & misc advisories

| ID / Title | Type | High-level impact | Action / Fixed-in |
|---|---|---|---|
| **CVE-2014-3566** — POODLE | TLS/SSLv3 downgrade weakness | Legacy SSLv3 protocol weakness. | Disable SSLv3 / upgrade; use TLS 1.2 (default since v11.2.2330.1). |
| **Multiple Vulnerabilities in OpenSSL** | Bundled component CVEs | OpenSSL CVEs in the bundled crypto library. | Upgrade to build with patched OpenSSL. |
| **Multiple Vulnerabilities in PostgreSQL** | Bundled component CVEs | PostgreSQL CVEs in the bundled database. | Upgrade to build with patched PGSQL. |
| **Upgrading jQuery Libraries** | Bundled JS component | Outdated jQuery libraries replaced. | Upgrade to fixed build. |
| **CVE-2022-23779** — Internal Hostname Disclosure | Information disclosure | Internal hostname could be disclosed. | Upgrade to fixed build. |
| **CVE-2019-14287** — Linux Sudo | Endpoint-side OS CVE (sudo) | Sudo bypass on Linux endpoints (remediated, not an EC-code bug). | Patch affected Linux endpoints via [patch-management.md](patch-management.md). |
| **Vulnerability: Accessing Domain via System Manager cmd** | Improper access (tool) | System Manager command tool could reach the domain improperly. | Upgrade to fixed build. |
| **Vulnerability in Remote Control (permanent user confirmation)** | Privacy/consent hardening | Made end-user confirmation for remote sessions permanent. | Upgrade to fixed build. |
| **Configuration-Password Encryption Policy Violation** | Crypto/policy | Password-encryption policy gap in configurations. | Upgrade to fixed build. |
| **Vulnerabilities in Log Files / Logging Key Entries** | Sensitive data in logs | Sensitive entries could appear in logs. | Upgrade to fixed build. |
| **Issue with blacklisting certain applications** | Control-efficacy | Application blacklisting could be bypassed/ineffective. | Upgrade to fixed build. |
| **Issue in reconfiguring two-factor authentication (regenerate QR)** | 2FA usability/security | Problem regenerating the 2FA QR code. | Upgrade to fixed build; follow the regenerate-QR guidance. |

> The list above mirrors the KB "Security Updates on Vulnerabilities" category and is **not exhaustive of every historical fix**; "Fixes to Multiple Vulnerabilities" bundle entries (2020 and earlier) roll up several smaller issues. Always treat the live KB category as the authoritative, current list.

---

## Recognizing the recurring patterns

1. **Agent → SYSTEM privilege escalation.** The agent runs with high privilege and performs file operations (patch scan, log archive). Several advisories (CVE-2024-10203, CVE-2025-5494, DTA, DLL, trusted-service-path) trace to privileged local file handling. **Mitigation:** upgrade agents promptly; these usually need *agent* build movement, not just server.
2. **Server auth bypass / RCE.** The most dangerous class (CVE-2021-44515, CVE-2021-44757) — internet-exposed servers are the target. **Mitigation:** never expose the EC server directly (use Secure Gateway in a DMZ), patch immediately, run detection tools.
3. **Classic web app bugs.** SQLi (CVE-2022-47523), XSS, CSRF, IDOR, XXE, file upload — typical of a large web console. **Mitigation:** routine PPM updates.
4. **Bundled-component CVEs.** Tomcat (Ghostcat), OpenSSL, PostgreSQL, jQuery — inherited from dependencies, fixed by moving to a build that bundles patched versions.

---

## Incident-response outline (on-prem, for an auth-bypass/RCE-class advisory)

When an advisory indicates active exploitation and provides a detection tool/IOCs:
1. **Detect** — run the provided tool (e.g., `RCEScan.bat` from `\bin`); check IOCs (suspicious files in `\lib`/`\webapps`, anomalous access-log POSTs).
2. **If affected:** disconnect the server from the network.
3. **Back up** the EC database.
4. **Rebuild** — format the compromised machine (after preserving critical data); reinstall on a **different machine** at the **same build** as the backup.
5. **Restore** the database backup (build must match — see restore-compatibility in [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md)).
6. **Patch** — update to the latest PPM (mandatory).
7. **Rotate** all credentials/secrets accessed from the server (service accounts, AD admin, etc.).
8. **If not affected:** still **mandatory** to update to the latest build.

---

## Scope of this reference

- **Covers:** publicly disclosed security advisories/CVEs in the **Endpoint Central / Desktop Central product itself** (server and agent), as catalogued in the KB "Security Updates on Vulnerabilities" category.
- **Does not cover:** the OS/third-party CVEs that EC *remediates* on managed endpoints (that is patch/vulnerability management — see [patch-management.md](patch-management.md) and [vulnerability-management.md](vulnerability-management.md)); nor advisories for *other* ManageEngine products (ServiceDesk Plus, Log360, etc.) even when integrated.
- **Naming note:** older advisories use the **Desktop Central** name and **DesktopCentral_Server** install paths; newer ones use **Endpoint Central** and **UEMS_CentralServer**. Both refer to the same product lineage. Build numbers also changed format across the rebrand (e.g., 10.1.x → 11.x).
- **Authority:** the live KB category is the source of truth and may list newer advisories than captured here; always confirm severity and the fixed build for *your* release line on the linked advisory.

## Timeline at a glance (selected, most relevant)

A rough chronology helps recognize the era of a given advisory and the shift in attack surface over time — from server-side web/RCE bugs toward agent-side local privilege escalation.

| Year | Notable EC/Desktop Central advisories | Theme |
|---|---|---|
| 2014–2015 | POODLE (CVE-2014-3566), CSRF (CVE-2014-9331), unauthorized admin-credential mod (CVE-2015-2560), PostgreSQL CVEs | Early web/crypto + access-control |
| 2017 | Remote Control privilege violation (CVE-2017-7213) | Tool privilege handling |
| 2019 | Linux sudo (CVE-2019-14287, endpoint-side) | Endpoint OS CVE (remediated) |
| 2020 | Ghostcat (CVE-2020-1938), XXE (CVE-2020-8540), arbitrary file upload (CVE-2020-10859), RCE (SRC-2020-0011), integer overflow, IDOR, OpenSSL CVEs | Bundled-component + web-app + RCE wave |
| 2021 | **Auth bypass CVE-2021-44515 (Critical, exploited in the wild)**, CVE-2021-44757 | Server auth bypass → RCE |
| 2022 | SQLi (CVE-2022-47523), priv-esc (CVE-2022-23863), hostname disclosure (CVE-2022-23779) | Authenticated web vulns |
| 2024 | **CVE-2024-10203** (agent tray archive-logs, High) | Agent local priv-esc |
| 2025 | **CVE-2025-5494** (agent patch-scan → SYSTEM) | Agent local priv-esc |

The trend toward **agent-side local privilege escalation** is consistent with the agent running as SYSTEM on every endpoint; expect future advisories in this class and prioritize *agent* build movement, not just server.

## Persona FAQ

**"Am I affected?" (Support)** — Find your current build (top-right of console). Compare to the advisory's affected ranges and fixed builds for *your release line* (Enterprise vs MSP vs specific SP). If an advisory ships a detection tool/IOCs (e.g., CVE-2021-44515), run it before concluding you're clean.

**"What's the fix?" (Support/Dev)** — Almost always: **upgrade to the latest applicable PPM** (console → build number → download → update). Agent-level advisories require the agent fleet to move to the fixed agent build (agents auto-upgrade after the server is updated).

**"Does this affect Cloud?" (PM/Support)** — Agent advisories typically affect **both On-Prem and Cloud** (the agent runs on customer endpoints regardless). Pure server-side advisories like CVE-2021-44515 are **not applicable to Cloud** because ManageEngine operates/patches that tier. Always check the advisory's note.

**"Why so many priv-esc bugs in the agent?" (Dev)** — The agent legitimately performs privileged local file operations (patch scans, log archiving, DLL loads). Bugs in those paths can be turned into SYSTEM escalation. Defensive coding (least privilege, safe path/temp handling, signed DLL loading) is the recurring engineering lesson.

**"How do we reduce blast radius?" (PM/Dev)** — Never expose the EC server to the Internet directly (Secure Gateway in a DMZ), enforce TLS 1.2, restrict ports, use RBA scopes for technicians, keep credentials in a vault (PAM360), and maintain current DB backups for restore-to-matching-build recovery. See [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md) and [integrations.md](integrations.md).

## Security-posture verification checklist

Run this periodically (e.g., monthly, and immediately after any Critical/High advisory):

1. **Build current?** Server and agents on the latest PPM for your line.
2. **Exposure** — EC server not directly Internet-facing; SGS in DMZ; only required ports open.
3. **TLS** — TLS 1.2 enforced; legacy TLS disabled unless a dependency requires it.
4. **AuthN** — 2FA enabled for console; AD-auth users scoped via RBA; technician scopes verified ("Enhanced scope security").
5. **Credentials** — privileged creds vaulted/rotated; rotate after any incident.
6. **Backups** — DB backups current and restorable; build recorded for matching-build restore.
7. **Detection** — for any exploited-in-the-wild advisory, detection tool run + IOCs checked.
8. **Components** — bundled Tomcat/OpenSSL/PostgreSQL/jQuery current (carried by recent PPMs).
9. **Logs** — review for sensitive-data leakage advisories; ensure log hygiene.
10. **Subscriptions** — security advisory notifications active; owner assigned for triage.

---

## Sources

- Endpoint Central Knowledge Base — "Security Updates on Vulnerabilities" category (full advisory list) — https://www.manageengine.com/products/desktop-central/knowledge-base.html
- CVE-2024-10203 (Archive Logs / Agent Tray Icon) — https://www.manageengine.com/products/desktop-central/cve-2024-10203.html
- CVE-2025-5494 (Agent Privilege Escalation) — https://www.manageengine.com/products/desktop-central/privilege-escalation-endpointcentral-agent.html
- Privilege Escalation via DTA tool — https://www.manageengine.com/products/desktop-central/privilege-escalation-vulnerability-dta.html
- Privilege Escalation via DLL — https://www.manageengine.com/products/desktop-central/privilege-escalation-vulnerability-dll.html
- CVE-2021-44515 (Authentication Bypass) — https://www.manageengine.com/products/desktop-central/cve-2021-44515-authentication-bypass-filter-configuration.html
- CVE-2021-44757 (Authentication Bypass) — https://www.manageengine.com/products/desktop-central/cve-2021-44757.html
- CVE-2022-47523 (Authenticated SQL Injection) — https://www.manageengine.com/products/desktop-central/CVE-2022-47523.html
- CVE-2022-23863 (Privilege Escalation) — https://www.manageengine.com/products/desktop-central/privilege-escalation-vulnerability.html
- CVE-2022-23779 (Internal Hostname Disclosure) — https://www.manageengine.com/products/desktop-central/cve-2022-23779.html
- Enhanced scope security for technicians — https://www.manageengine.com/products/desktop-central/enhanced-scope-security.html
- Improvements in access control mechanisms — https://www.manageengine.com/products/desktop-central/security-updates-ngav.html
- Issue in reconfiguring two-factor authentication — https://www.manageengine.com/products/desktop-central/regenerate-qr-code.html
- CVE-2020-10859 (Arbitrary File Upload) — https://www.manageengine.com/products/desktop-central/arbitrary-file-upload-vulnerability.html
- SRC-2020-0011 (RCE) — https://www.manageengine.com/products/desktop-central/remote-code-execution-vulnerability.html
- CVE-2020-1938 (Ghostcat) — https://www.manageengine.com/products/desktop-central/ghostcat-vulnerability.html
- CVE-2020-8540 (XXE) — https://www.manageengine.com/products/desktop-central/xxe-vulnerability.html
- CVE-2014-3566 (POODLE) — https://www.manageengine.com/products/desktop-central/cve-2014-3566-poodle-vulnerability.html
- Multiple Vulnerabilities in OpenSSL — https://www.manageengine.com/products/desktop-central/multiple-vulnerabilities-in-openSSL.html
- Multiple Vulnerabilities in PostgreSQL — https://www.manageengine.com/products/desktop-central/multiple-vulnerabilities-in-pgsql.html
- Service Trusted Path Escalated Privilege — https://www.manageengine.com/products/desktop-central/service-trusted-path-vulnerability.html
- CVE-2017-7213 (Remote Control Privilege Violation) — https://www.manageengine.com/products/desktop-central/cve-2017-7213-remote-control-privilege-violation.html

*This document is for internal awareness and defensive patch-prioritization only. Impact is described at a high level; no exploitation steps are provided. Items marked "(inferred)" are reasoned conclusions — confirm severity and the exact fixed build for your release line on the live advisory.*
