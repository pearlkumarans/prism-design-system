# Support / Troubleshooting KB map (real-world failure taxonomy)

> These are the official Endpoint Central **Knowledge Base** troubleshooting categories and the actual
> error/symptom articles under each (source: manageengine.com/products/desktop-central/knowledge-base.html
> plus the module KB files' §5 Support lens). Use this as the **error-state and friction reference**:
> when you design a screen, these are the real failures users hit there — turn them into good empty /
> error / partial states with a clear cause + fix + "Read KB" affordance, and design to prevent them.
> Every category is mapped to the owning module/KB file for deeper §5 detail.

## How to use in a design brief
- For §7 (States & edge cases): pick the failures from the relevant category and design the error
  state (message → likely cause → next action / KB link).
- For §9 (Friction): recurring failure clusters (agent-reachability, network-path/permissions, proxy,
  push-service ports) reveal where onboarding and deployment UX needs guardrails, validation, and
  connectivity tests.
- Ports/permissions/proxy issues repeat across Agent Install, Patch, Software Deployment, Remote
  Control, MDM, OS Deployment — a shared "connectivity pre-flight / diagnostics" pattern would help
  all of them.

---

## Agent Installation → `getting-started-onboarding.md`, `01-architecture-agent-deployment.md`
Common symptoms: SoM domain add "Validation Failed"; remote office "Agent MSI Creation Failed";
"Unable to start Distribution Server" (port); agent install fails — Access Denied / network path not
found / unknown username or password / no network provider accepted path / not enough server storage /
systeminfo.exe unable to locate component / target account name incorrect / Mac-Linux install failure;
GPO install advantages-disadvantages; agents not uninstalled after EC removal; Symantec Endpoint
Protection exceptions; allow user uninstall via Add/Remove; change server DNS/IP/port for existing
agents; manual remote-office uninstall; "service did not respond in timely fashion"; Vista+ install
failure; reinstall via SCCM.
**UX takeaways:** first-run onboarding must validate creds/UAC/ports and offer GPO/SCCM fallback;
Access-Denied/UAC and network-path errors are the dominant blockers — design inline remediation.

## Configurations → `configuration-management.md`
Symptoms: status stuck "Ready to Execute" / "In Progress" / "Yet to Apply"; configured scripts not
executed; File & Folder Operations "Configuration Failed – Access Denied"; PowerShell Script Engine
not installed; Secure USB config can't block certain devices; GPO configuration troubleshooting;
"Password Does Not Meet Policy Requirements".
**UX takeaways:** configuration status states (Ready/In Progress/Yet to Apply) need clear meaning +
"why stuck" help; script configs need a dry-run/validation affordance.

## Inventory Management → `it-asset-management.md`
Symptoms: manual scan "Access Denied" / "Scanning Timed Out"; scheduled scan failed; not receiving
inventory alerts; "Asset Scan Locked" / "WMI Connection Failed"; "Storage Control Block address invalid";
"no network provider accepted the given network path".
**UX takeaways:** scan status + alert config need failure visibility; WMI/permission causes should be
surfaced, not silent.

## Patch Management → `patch-management.md`
Symptom clusters: manual scan fails (network path / creds / storage / SCB / Scanning Timed Out); patch
config fails (Draft Download Failed, download-from-server problem, "Incorrect Function / 2359302 /
Access Denied", "wait operation timed out", Fatal error, invalid WIN32 app, 2145124329, Office update,
Windows Update service disabled 1058, Acrobat 1603, Chrome 1603, Java 1603, 2145124297, reverting
changes, "application used by another process"); DB update fails (Stream closed, no direct connection,
authorization bug 10 times); service pack 536870921; scheduled scan fails; "no patches in Applicable/
Missing"; download-not-started; invalid patch-store location; 1073741502; Java/Flash updates; APD "No
Missing Patches Found"; download fails (403, 407, connection timeout, checksum, access denied, SSL
exception, Citrix, Oracle, component store corrupted, Chrome M78); Red Hat errors (inactive/insufficient
subscription, download permission, NS upload, access.redhat unreachable, cache repo issues, yum already
running); SUSE errors (missing subscription, invalid registration code).
**UX takeaways:** the deploy/scan flows need per-endpoint status drill-down with cause + Read-KB (this
is the single richest failure surface); proxy/whitelist and subscription prerequisites should be
validated up front; "No Missing Patches Found" when approval is pending is a documented confusion.

## Software Deployment → `software-deployment.md`, `software-repository.md`
Symptoms: status stuck "Ready to Execute"; deploy fails (Fatal error, exe not found, handle invalid,
network path not found, Access Denied, Incorrect Function, SCB address invalid, Process Time Out,
unknown error / 61684, requires elevation, directory name invalid, not valid WIN32 app); MS Office
2007/2010 -30059; "error while downloading binaries" during package creation; "Failed to connect to
Central Repository"; "Version Compatibility Error" on sync; network-browser "Specified logon session
does not exist".
**UX takeaways:** silent-switch/elevation/network-share failures dominate — package creation needs
validation and a test-deploy; repository (Network Share vs HTTP) choice needs guidance to prevent
path/permission errors.

## Service Pack Installation → `patch-management.md`
Symptom: Windows XP SP3 install "Fatal error during installation." (legacy)

## Remote Control → `remote-troubleshooting.md`
Symptoms: sharing fails (can't establish connection, Access Denied, agent version incompatible, RPC
server unavailable); Ctrl+Alt+Del/UAC-SAS failure on Vista/7/2008; service timeout; LAN connect fails
(network path / creds / no network provider / storage / SCB); can't add to exclusion list; can't
connect remotely; "Event service not interactive"; HTML5 viewer connection error; Linux "GUI component
X11 not found".
**UX takeaways:** viewer choice (HTML5 vs ActiveX) and agent-version/RPC readiness cause most failures;
surface a pre-connect readiness check and clearer viewer fallback.

## Mobile Device Management → `mobile-device-management.md` (+ children)
Symptoms: "Invalid APNs" / "APNs not reachable" / APNs mismatch / not recognized / 5223 port block;
device scan time-out; profile install "Command format error"; app distribution "License Count exceeded"
/ "License Limit reached"; app install failures (app store not reachable/disabled, manifest URL not
reachable, app already installed); App Lock profile failed; Google Play not reachable; WNS not reachable;
Android — Device Administrator disabled / GCM service unavailable / account missing / GCM auth failed /
agent not reachable / unable to reach GCM / enrollment failed / locate device / Wi-Fi profile failed;
SSL certificate name mismatch; iOS developer provisioning profile detected.
**UX takeaways:** APNs cert setup/renewal and push-service ports (5223 APNs, 5228-30 FCM, WNS) are the
top failure cluster — enrollment UX needs guided cert setup, connectivity validation, and clear
per-platform push-service diagnostics.

## OS Deployment → `os-deployment.md`
Symptoms: device not functioning; delayed write failed; Access Denied; could not access network
location; CRC error; media write-protected; multiple connections to computer; network path not found;
PXE port already in use; RPC server unavailable; write access denied; image-creator↔server comms failed;
WinPE auto-download failure; WIM file not found (ADK 10); image-creator setup not running; incorrect
target account name; login attempt failed; network name errors; network path/location error; server
can't perform requested operation; no logon servers available; file not found; unexpected network error;
image replication network errors; trust relationship failed; not enough disk space; extended error;
unable to fetch response from server.
**UX takeaways:** WinPE/ADK, PXE/DHCP, and network-share failures dominate imaging — the imaging/deploy
wizard needs prerequisite checks and disk/partition mapping clarity.

## Integrations → `integrations.md`
Symptoms: ServiceDesk Plus "Not Reachable"; "Invalid Authentication Key"; can't access EC server from
SDP; SDP-DC asset-data sync failure; Log360 "Unable to connect server"; Log360 "Asset data not posted".
**UX takeaways:** integration setup needs credential/connectivity validation + field-mapping feedback.

## User Logon Reports → `reporting-auditing.md`
Symptom: user logon reports show no data. **UX:** empty-report state should explain the agent/logon
prerequisite.

## Endpoint Central Hotfix Upgrade → `security-advisories-cve.md`, `01-architecture-agent-deployment.md`
Symptom: configurations not applied after hotfix upgrade. **UX:** post-upgrade validation surface.

## On-Demand Tasks → `01-architecture-agent-deployment.md`
Symptom: "Agent not reachable" for on-demand tasks. **UX:** agent-reachability status is a recurring,
cross-module signal — consider a shared agent-health indicator.

## Backup and Restore → `01-architecture-agent-deployment.md`
Symptoms: restore "EC server not compatible"; "Database backup failed". **UX:** backup/restore needs
compatibility/version checks and clear failure reasons.

## BitLocker Management → `bitlocker-management.md` (Endpoint Data Security)
Symptom: BitLocker "Post Deployment Errors". **UX:** encryption policy status + TPM/recovery-key escrow
states; post-deployment error remediation.

## DEX → `endpoint-intelligence-dex.md`
Symptom: troubleshooting Endpoint Analytics / DEX component (agent) failures. **UX:** telemetry-agent
health visibility; degraded-data state on dashboards.

## Security Updates on Vulnerabilities → `security-advisories-cve.md`
Content: EC's OWN advisories/CVEs and fixes — agent privilege-escalation (DTA, DLL, CVE-2024-10203
archive-logs, CVE-2025-5494), auth-bypass (CVE-2021-44515 / 44757), SQLi (CVE-2022-47523), XSS/IDOR/
HTML-injection, component CVEs (OpenSSL, PostgreSQL, jQuery, Tomcat Ghostcat, POODLE), enhanced scope
security for technicians, access-control improvements, 2FA QR regeneration, remote-control privilege
fixes, blacklisting issue. **UX:** in-product "update available / am I affected?" build-status surface;
PPM update flow; security-posture messaging for the EC server itself.

## Private Access (ZTNA) → `secure-private-access.md`
Symptom: "Unable to reach Internal Application via Connector from the Endpoint." **UX:** connector
reachability status + guided connector setup/diagnostics.

## General → cross-module (`01-architecture-agent-deployment.md`, `remote-troubleshooting.md`, `edr/…`)
Symptoms: "Server connection is not private"; resource browser doesn't list all AD/Workgroup objects;
web console login failure; network browser doesn't list all computers; can't add/authenticate AD user;
can't add IP scope for remote office; can't change HTTP-upload store location; disk cleanup failed
(Win2008/R2); "Agent communication failed – unable to reach gateway port"; encrypted key file uploaded;
untrusted/root certificate error; wait operation timed out; Asia error; SQL server patch install
failure; **Files to be added to Antivirus exclusion list (EDR)**; troubleshoot Secure Gateway Server
startup failure.
**UX takeaways:** login, certificate/TLS, gateway-port, and AD-browser issues are foundational — the
admin console needs clear connectivity/cert diagnostics.

---

## Security modules — support notes (EDR, Malware/NGAV, Anti-Ransomware)
The public KB buries these under *General* and *Security Updates*, but they are first-class modules —
design their error/exception states from their KB §5 lenses:
- **EDR → `endpoint-detection-response.md`:** exclusion-list creation (antivirus exclusions, see the
  "Files to be added to Antivirus exclusion list" KB), incident/alert false-positive handling, threat-
  hunting query errors, agent/telemetry gaps, Cloud-gating confusion. Design alert triage + exclusion
  UX to fight alert fatigue.
- **Malware Protection / NGAV → `next-gen-antivirus.md` / `next-gen-antivirus-ransomware.md`:** per-engine
  exclusions, detection false positives (classify True/False Positive), add-on/Early-Access enablement,
  quarantine actions. Design clear detection-engine settings and quarantine/restore states.
- **Anti-Ransomware → `anti-ransomware.md`:** VSS shadow-copy prerequisites (volume type, backup
  recency), rollback/recovery flow, repeat-offender handling. Design a trustworthy single-click
  recovery + rollback-status state.

> For any of the above, open the module's KB file §5 (Support/Troubleshooting) for the exact
> symptom → cause → resolution tables before finalizing error-state copy.
