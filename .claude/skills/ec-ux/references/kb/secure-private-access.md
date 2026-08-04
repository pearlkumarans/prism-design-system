# Secure Private Access (Private Access / ZTNA)

> A Zero Trust Network Access (ZTNA) capability in ManageEngine Endpoint Central (EC, formerly Desktop Central), branded **Private Access** in the product console and help. It connects remote/hybrid users directly to specific internal applications — not the whole network — verifying user identity and device trust before access, replacing legacy VPNs. Now documented in the official help: it requires **EC build 11.5.2606.02 or above**, is enabled from **Admin → Private Access**, supports **Windows, macOS, iOS and Android**, integrates exclusively with **Azure Entra ID** for identity, and currently supports **TCP-based connections only**. The closely-related **System Quarantine / Network Access Control (NAC)** capability — which isolates non-compliant endpoints from the network — is covered here as the complementary "network isolation" story.

---

## 1. What it is — Feature detail

### Purpose and where it sits in the EC console
Private Access shifts remote access from full network connectivity to **focused, application-level access**. Traditional VPNs grant broad network reach after authentication, increasing exposure, enabling lateral movement, and exposing resources users do not need. Private Access instead lets users connect only to the internal applications assigned to them, requires user *and* device verification before access, keeps internal services hidden from unauthorized users, and uses application-specific tunnels to restrict visibility and movement within the network.

- **Enable it:** Navigate to **Admin → Private Access** in the EC console (requires build 11.5.2606.02+).
- **Module tabs (per help):** **Applications**, **App Segments**, **Endpoints**, **Identity (User Identity Configuration)**, **Connectors** (Application Connector / optional Edge Connector), and **Auditing**.

### Problems it solves
- **Overexposed network access:** a VPN, once connected, grants unrestricted network reach and expands the attack surface.
- **Implicit trust after authentication:** VPN trust is decided only at login, with no continuous validation of identity/device health.
- **Infrastructure that doesn't scale:** routing all traffic through central VPN gateways adds latency and bottlenecks.
- **The fix — access at the application layer:** users connect only to allowlisted applications; internal services stay hidden from unauthorized users; visibility and lateral movement are restricted by application-specific tunnels.

### FULL capability breakdown (per official help)
1. **Application and App-Segment-Based Access Control** — define internal applications by attributes (**name, DNS, port**) and organize them into **App Segments** aligned to teams/departments. Policies assigned to an App Segment apply to all applications in it, enabling granular user-level access while simplifying enforcement. *Only allowlisted applications are accessible; everything else stays hidden.*
2. **User and Device Verification** — enforce access based on both **identity** (Azure Entra ID) and **endpoint trust** (the device must have the EC agent and be enrolled/compliant). Only authenticated users on compliant, managed devices reach internal services.
3. **Comprehensive Auditing** — all access attempts are logged in the console for detailed insight into user activity, anomaly detection, and compliance.

### Private Access vs VPN
| Aspect | Traditional VPN | Private Access |
| --- | --- | --- |
| Access level | Network-wide access | Application-specific (allowlisted) access |
| Trust model | Implicit after login | User + device verification before access |
| Exposure | Internal network visible | Applications/services remain hidden |
| Lateral movement | High risk | Restricted by app-specific tunnels |
| Performance | Traffic backhauled through gateway | Direct, application-level access |

### Compliance-driven access control (how it maps to controls)
Private Access supports common security-program requirements directly:
- **Least-privilege access** — users reach only the applications assigned to them, never the broader network.
- **Continuous user + device verification** — access is gated on both authenticated identity (Entra ID) and an enrolled, trusted endpoint, not a one-time login.
- **Resource isolation** — internal services that are not allowlisted stay hidden/undiscoverable, shrinking the attack surface and frustrating reconnaissance (including AI-accelerated scanning of exposed services).
- **Auditability** — every access attempt is logged in the console, giving the access trail auditors expect and a feed for anomaly detection.

### Why application-level access beats VPN (narrative)
A VPN is a *network* primitive: once the tunnel is up, the user's machine is logically on the corporate LAN and can reach — or at least probe — everything routable, with trust frozen at the moment of login. That model made sense when offices were the perimeter; with a distributed workforce it means every remote laptop becomes a potential pivot point into the entire network, and a single compromised credential or device can move laterally at will. Private Access inverts the default: nothing is reachable unless it has been explicitly published and assigned, the path is an application-specific TCP tunnel rather than a network route, and the user and device are re-evaluated rather than trusted indefinitely. The practical payoff is a smaller blast radius (lateral movement is structurally constrained), lower exposure (unpublished services cannot be enumerated), and often better performance (traffic goes direct via a nearby connector instead of being backhauled through a central gateway).

### Network isolation / NAC (System Quarantine Policy)
A complementary EC capability (under Vulnerability Remediation / Compliance) provides **Network Access Control** by quarantining non-compliant endpoints — filtering network access so only legitimate, compliant endpoints reach corporate data. It applies to **Windows**.

- **Compliance rules:** OS patches (within a period), Software (installed/uninstalled), Service (running/not running), Vulnerability (by CVSS score / exploit availability), Registry and File checks (value/path/folder/file/version).
- **Execution options:** **Audit Systems for Non-Compliance** (identify only) or **Quarantine Non-Compliant Systems** with network restrictions: Block all network access (except EC components), Block only intranet in range, Block custom domain & IP, or Allow access only to custom IP/VPN/Domains.

### Application & connector settings reference
| Object | Field / option | Notes |
| --- | --- | --- |
| Application | Application Name | Friendly identifier |
| Application | Application DNS (FQDN) | Must be resolvable from the Application Connector's network |
| Application | Port | TCP only |
| App Segment | Name / Description | Groups apps for team-level policy |
| App Segment | Applications | An app can belong to only one segment |
| App Segment | Policy | Applies to all apps in the segment |
| App Segment | Application Connector | Required broker next to the app |
| App Segment | Edge Connector | Optional, architecture-dependent |
| Identity | Provider | Azure Entra ID only |
| Endpoint | Enrollment | Windows agent / Android MDM app + token / iOS PKI+SCEP+relay |

### NAC quarantine rule & restriction reference
| Compliance rule | Marks system non-compliant when… |
| --- | --- |
| OS patches | OS updates not deployed within the defined period |
| Software | Certain applications installed/uninstalled (Control Panel name) |
| Service | Certain services running/not running (Service Manager name) |
| Vulnerability | Vulnerabilities detected (by CVSS score / exploit availability) |
| Registry & File checks | Registry value/path, folder/file path, or file version criteria not met |

| Quarantine restriction | Effect |
| --- | --- |
| Block all network access | Isolated except EC components |
| Block only intranet in range | Isolated from the local network |
| Block custom domain & IP | Isolated from specific domains/IPs |
| Allow access only to custom IP/VPN/Domains | Allowed only to specified destinations |

### Supported OS / platforms / coverage
Private Access supports **Windows, macOS, iOS, and Android**. NAC/quarantine applies to **Windows**.

### How Private Access and NAC fit together
Private Access and System Quarantine/NAC attack endpoint exposure from two directions and are best read as a pair:
- **Private Access** governs the *forward* path — *which internal applications a verified user on a trusted device may reach*. It assumes the network around the app is hidden and only brokers allowlisted, app-specific TCP connections.
- **NAC / System Quarantine** governs the *containment* path — *whether a non-compliant Windows endpoint is allowed on the network at all*. When an endpoint fails compliance (missing patches, prohibited software, risky vulnerability, etc.), it is isolated to a degree the admin chooses, while EC components stay reachable so it can be remediated.

Together they implement a practical zero-trust posture: trusted users reach only what they need (Private Access), and devices that fall out of compliance are quarantined before they can be abused (NAC).

### Prerequisites and key concepts/terminology
- **Build requirement:** EC **11.5.2606.02** or above; enable at **Admin → Private Access**.
- **Identity:** **Azure Entra ID exclusively** as the Identity Provider — the authoritative source for verifying credentials and passing identity attributes.
- **Connectivity:** **TCP-based connections only** (current limitation).
- **Endpoint enrollment:** EC agent on Windows; ME MDM App + authentication token on Android; built-in PKI / SCEP / relay-configuration profile on iOS.
- **Connectors:** **Application Connector** (must resolve the application DNS on its network) and an optional **Edge Connector**.
- Key terms: ZTNA, application, App Segment, Application/Edge Connector, allowlist, identity provider (Entra ID), endpoint enrollment, device trust, audit log; (NAC) System Quarantine Policy, compliance rule, audit vs quarantine, grace period.

**Glossary (key concepts):**

| Term | Meaning |
| --- | --- |
| ZTNA | Zero Trust Network Access — verify identity/device per access, grant app-level not network-level reach |
| Application | An internal service published by name + DNS + TCP port; only published apps are reachable |
| App Segment | A group of applications sharing one policy and connector; team/department aligned; one app → one segment |
| Application Connector | The broker beside the apps; must resolve app DNS; mediates access without exposing inbound ports |
| Edge Connector | Optional connector for edge/segmented architectures |
| Identity Provider | Azure Entra ID — the authoritative source for authentication and identity attributes |
| Endpoint enrollment | Registering a trusted device (Windows agent / Android MDM / iOS PKI) so it may connect |
| Auditing | Console log of every access attempt for compliance/anomaly detection |
| System Quarantine Policy (NAC) | Compliance-driven network isolation of non-compliant Windows endpoints |
| Grace period | Time given to a quarantined user before isolation takes effect |

---

## 2. UX lens

### Primary user roles & jobs-to-be-done
- **Security/Network Admin** — replace VPN, publish internal apps, group them into App Segments, bind policies, prove compliance via audit.
- **IT Admin** — deploy/maintain Application Connectors next to apps, enroll endpoints, integrate Entra ID.
- **End user (remote/hybrid)** — open an assigned internal app and have it work, securely, without a heavy VPN client.
- **Auditor** — review access-attempt logs.

### Console navigation paths (reference)
| Task | Navigation path |
| --- | --- |
| Enable Private Access | **Admin → Private Access** |
| Add an internal application | **Private Access → Applications → Add Application** |
| Group apps into a segment | **Private Access → App Segments → Add App Segment** |
| Configure identity provider | **Private Access → Identity / User Identity Configuration** (Entra ID) |
| View/enroll endpoints | **Private Access → Endpoints** |
| Enroll Windows agent | **Agent → Computers → Add Computers** |
| Review access logs | **Private Access → Auditing** |
| Configure NAC / quarantine | **Threats & Patches → Compliance → System Quarantine Policy** |

### Step-by-step procedures

#### Procedure 1 — Enable Private Access
1. Confirm the server is on build **11.5.2606.02+**.
2. Go to **Admin → Private Access** and enable it.
3. Configure the Identity Provider (**Azure Entra ID**) under User Identity Configuration so the IdP becomes the authoritative source for authentication.

#### Procedure 2 — Publish an internal application
1. **Private Access → Applications → Add Application**.
2. Enter:
   - **Application Name** — friendly identifier.
   - **Application DNS** — the FQDN of the internal service; **must be resolvable from the Application Connector's network**.
   - **Port** — the port the internal service listens on (TCP only).
3. **Save.** The application becomes discoverable/accessible only through the configured Private Access setup (everything not allowlisted stays hidden).

#### Procedure 3 — Create an App Segment and bind a policy
1. **Private Access → App Segments → Add App Segment**.
2. Enter a name and optional description.
3. Select the **Applications** to include. *Note:* an application can belong to only one App Segment at a time.
4. Select the required **Policy** (applies to all apps in the segment, enabling team-level rather than per-app management).
5. Choose the **Application Connector** (and optionally an **Edge Connector**, depending on your architecture).

#### Procedure 4 — Enroll endpoints
- **Windows:** **Agent → Computers → Add Computers** to remotely install the agent; devices with the EC agent appear automatically under **Endpoints** with Private Access enabled.
- **Android:** add the **ME MDM App** to the MDM App Repository → enable Private Access and paste the **Authentication Token** → distribute via MDM; devices auto-register after install.
- **iOS:** create a **Built-in PKI Server** in MDM → download/upload the **CA certificate** → download the **relay configuration file** → create an Apple profile (**MDM → Create Profile → iOS/iPadOS**), upload the relay file under **Custom Configuration**, configure **SCEP** with a template → deploy the profile to targeted devices.

Enrollment ensures only verified endpoints with a valid agent can connect.

**Endpoint enrollment reference:**

| Platform | Mechanism | Key artifacts |
| --- | --- | --- |
| Windows | EC agent (remote install) | Agent appears under Endpoints automatically |
| macOS | EC agent | Agent-based, Private Access enabled |
| Android | ME MDM App via MDM | Authentication Token; auto-registers after install |
| iOS | MDM profile | Built-in PKI Server, CA certificate, relay configuration file, SCEP template |

For iOS PKI specifics, see "Managing Certificates with Internal PKI" in the MDM help. The relay configuration file plus SCEP-issued certificate are what let an iOS device present trusted identity to Private Access.

#### Procedure 5 — Configure NAC / network isolation (System Quarantine Policy)
1. **Threats & Patches → Compliance → System Quarantine Policy → Create Policy**.
2. Under **Select the Custom Group**, choose the target group.
3. Under **Define Rules**, select compliance checks (OS patches, Software, Service, Vulnerability, Registry/File).
4. Choose **Audit** (with a warning message) or **Quarantine** (pick the network restriction type).
5. For Quarantine, set the **alert message** and **grace period** under Alert Users.
6. Optionally enable notifications and add notification emails.
7. **Create**; then view **Status**, and Modify/Suspend/Delete as needed.

#### Procedure 6 — Connectors (Application Connector & Edge Connector)
- The **Application Connector** is the broker that sits on the same network as the internal application and must be able to resolve the application's DNS. It is selected when building an App Segment, so all apps in that segment are reached through it.
- The **Edge Connector** is optional and selected per architecture (e.g., to terminate or relay connections at a network edge). For most single-site deployments only an Application Connector is needed; multi-site or segmented networks may add Edge Connectors.
- Operational guidance (inferred): place an Application Connector close to each cluster of internal apps to minimize latency, and plan for redundancy since a connector outage makes its apps unreachable. Published HA guidance is not yet available.

#### End-user access flow (what happens at connect time)
1. The user (on an enrolled Windows/macOS/iOS/Android device with the EC agent/client) requests an allowlisted application.
2. **Identity** is verified against **Azure Entra ID**; **device trust** is checked via enrollment.
3. If both pass and the user is authorized for the App Segment, an application-specific TCP connection is brokered through the Application Connector directly to the app — no broad network route is granted.
4. The attempt is recorded in **Auditing**. Non-allowlisted services remain hidden throughout.

### UX research hooks
- **Migration mental model:** admins think in subnets/VPN routes; Private Access thinks in apps/DNS/port — study the shift and whether app-discovery tooling is needed.
- **Connector DNS resolution:** the most common setup failure is an app DNS that the Application Connector cannot resolve — study how clearly setup surfaces this.
- **Hidden-app debugging:** when a user "can't see" an app, troubleshooting is harder because it's hidden by design — study the diagnostic UX.
- **Entra-only constraint:** orgs on Okta/Ping/AD-FS cannot use Private Access yet — study the friction and demand.
- **TCP-only constraint:** apps needing UDP (some VoIP/RDP-UDP) won't work — surface this before publishing.
- **Connector HA:** placement/health visibility of Application/Edge Connectors is the operational crux.

### Notable UI patterns/components
Application add form (name/DNS/port), App Segment builder (apps + policy + connector), Endpoints list, Identity/Entra integration screen, Auditing grid; (NAC) quarantine-policy wizard with rule builder and restriction selector.

---

## 3. PM lens

### Value proposition & business outcomes
- Reduces exposure by design (apps hidden, no network-wide reach), enforces user + device verification, and supports a distributed workforce without legacy-VPN latency.
- Restricts lateral movement — a primary driver of breach blast radius.
- App-Segment model enables team-level policy management, lowering admin overhead.
- NAC adds an enforcement backstop: non-compliant endpoints are quarantined from the network entirely.

### Target personas & use cases
- Enterprises retiring VPNs / adopting zero trust, already invested in **Microsoft Entra ID**.
- Hybrid/remote workforces needing access to a defined set of internal **TCP** apps.
- Regulated environments needing auditable, least-privilege application access.
- Orgs wanting unified posture: combine Private Access (who reaches what) with NAC quarantine (which endpoints stay on the network at all).

### Competitive positioning / differentiators
- Delivered inside a UEM+Security suite — the same EC agent that does patch/deploy/device control carries ZTNA, so device trust is first-party rather than bolted on.
- Native MDM enrollment path for iOS/Android (PKI/SCEP/relay; MDM app + token) is a differentiator vs ZTNA-only vendors.
- Competes with Zscaler Private Access, Cloudflare Access, Palo Alto Prisma Access, Cisco/Duo, Twingate, Tailscale — EC's edge is consolidation with endpoint management and likely lower TCO.
- Current relative gaps: **Entra-ID-only** IdP support and **TCP-only** connectivity vs broader competitor protocol/IdP coverage.

### Edition gating & packaging
- Requires EC build **11.5.2606.02+**; enabled at Admin → Private Access. Specific edition/add-on pricing not published on the help pages (inferred: Security/UEM editions or a dedicated add-on; 30-day free trial of EC applies). NAC/System Quarantine ships with the vulnerability-remediation/compliance capability.

### Product expansion opportunities / gaps / roadmap ideas (analysis)
- **Additional identity providers** (Okta, Ping, on-prem AD, Google) beyond Entra-ID-only.
- **UDP / non-TCP** application support.
- **Deeper posture integration:** make access conditional on EC-verified patch level, BitLocker/FileVault status, app-control compliance.
- **App auto-discovery** from observed traffic to ease VPN migration.
- **Clientless/browser-based access** for unmanaged/BYOD and third parties.
- **Connector HA / health dashboards** and published throughput SLAs.
- **Unify** Private Access policy with NAC quarantine and Conditional Access to remove overlap.

---

## 4. Developer / Technical lens

### Architecture & components
- **EC agent / client** on the user device (Windows/macOS/iOS/Android) initiates outbound connections and presents identity/device-trust signals.
- **Application Connector** deployed adjacent to internal apps; it must resolve the application DNS on its network and brokers outbound connections (so no inbound ports are exposed — enabling the "hidden apps" property). An optional **Edge Connector** can be added per architecture.
- **Identity Provider** — **Azure Entra ID** authenticates users and supplies identity attributes.
- **EC control plane** authenticates the user, evaluates the App-Segment policy and device enrollment/trust, and stitches the user-side and app-side connections.

**Why apps stay hidden (the outbound connector model, partly inferred).** The Application Connector is documented to brokers access by resolving the app's DNS on its own network and connecting users to the specific app. In standard ZTNA designs — and consistent with EC's "internal services remain hidden" and "application-specific tunnels" language — the connector dials *outbound* to the control plane rather than listening for inbound connections, so the published apps have no internet-facing port for an attacker to scan or enumerate. Unauthorized users therefore cannot even discover that a service exists, which is what makes the "cloaking"/hidden-resource property possible. (The precise wire protocol and inbound/outbound details beyond "TCP" are not published; treat the broker mechanics as inferred.)

### Agent mechanics & enforcement methods
- **Allowlisting/hiding:** only applications added in the console (name/DNS/port) are reachable; everything else is undiscoverable.
- **App-specific tunnels:** access is to the specific TCP app, not a broad network route — restricting lateral movement.
- **User + device verification:** identity via Entra ID; device trust via EC-agent enrollment (Windows agent, Android MDM app + token, iOS PKI/SCEP/relay profile).
- **Direct access:** avoids backhauling traffic through a central VPN gateway, reducing latency.
- **NAC enforcement:** the agent applies firewall-style network restrictions (block all/intranet/custom, or allow-only-custom) on quarantined Windows endpoints while leaving EC components reachable.

### Ports, protocols, integrations, APIs (mark inferences)
- **TCP only** (explicit); outbound connector model over TLS (inferred); no inbound firewall holes required.
- Integrates with **Azure Entra ID** (exclusive IdP) and EC MDM for enrollment/certificates (built-in PKI, SCEP).
- REST API and audit export (inferred).

### Data model / key objects, scalability
- Objects: Application (name/DNS/port), App Segment (apps + policy + connector), Application Connector / Edge Connector, Endpoint (enrolled device), Identity configuration (Entra ID), Access-attempt audit record; (NAC) System Quarantine Policy, compliance rule, restriction set, grace period.
- Scales by adding connectors near app locations and grouping apps into segments; avoids the central-gateway bottleneck of VPNs.

### Technical limitations & buyer-watch items
| Limitation (current) | Impact | Watch for |
| --- | --- | --- |
| TCP-only connectivity | UDP apps (some VoIP, RDP-UDP, certain DBs) unsupported | Future protocol expansion |
| Azure Entra ID only | Orgs on Okta/Ping/AD-FS/Google cannot integrate | Additional IdP support |
| Build 11.5.2606.02+ required | Older servers must upgrade first | n/a |
| One app → one App Segment | Cannot share an app across teams' segments | Possible multi-segment support |
| App DNS must resolve on the connector network | Mis-scoped connectors break access | Connector validation tooling |
| NAC/quarantine is Windows-only | macOS/Linux endpoints not isolated by NAC | Cross-platform NAC |
| HA / throughput not published | Hard to size for enterprise scale | Published SLAs / HA guidance |

---

## 5. Support / Troubleshooting lens

### Common issues & resolutions (symptom → cause → fix)
- *Private Access option missing in console* → server below build 11.5.2606.02 → upgrade EC, then enable at **Admin → Private Access**.
- *Can't configure identity / users not authenticating* → IdP not Entra ID, or Entra integration incomplete → Private Access supports **Azure Entra ID only**; complete the User Identity Configuration.
- *Application unreachable* → app not allowlisted, user not authorized in Entra, device not enrolled/trusted, or the **Application Connector cannot resolve the app DNS** → verify the app is added (correct DNS/port), the user is authorized, the endpoint is enrolled, and DNS resolves on the connector's network.
- *App on a non-TCP protocol won't work* → only **TCP** connections are supported → expose the service over TCP or use an alternate access method.
- *App can't be added to a second segment* → an application can belong to only one App Segment → remove it from the existing segment first.
- *iOS device not connecting* → missing/incorrect built-in PKI, CA certificate, relay configuration, or SCEP template → re-verify the PKI server, CA cert upload, relay file in Custom Configuration, and SCEP template, then redeploy the profile.
- *Android device not registering* → ME MDM App not in repository or wrong Authentication Token → add the app, paste the correct token, redistribute via MDM.
- *Latency complaints* → connector placed far from the app / indirect routing → place the Application Connector close to the app; confirm the direct-access path.
- *Endpoint missing from Endpoints list* → EC agent not installed → enroll via **Agent → Computers → Add Computers** (Windows) or the MDM path (mobile).

### NAC / quarantine troubleshooting
- *Compliant systems still quarantined* → over-broad compliance rule (e.g., software/service/version mismatch) → refine Define Rules; use **Audit** mode first to preview impact before switching to **Quarantine**.
- *Quarantined users fully cut off* → restriction set to "Block all network access" → switch to "Block only intranet in range" or "Allow access only to custom IP/VPN/Domains" so remediation endpoints remain reachable (EC components stay reachable by design).
- *Users surprised by isolation* → no grace period/alert configured → set an alert message and grace period under Alert Users.

### Deployment planning & rollout sequence (best practice)
A staged rollout keeps users productive while replacing the VPN:
1. **Upgrade** the EC server to 11.5.2606.02+ and enable Private Access at Admin → Private Access.
2. **Integrate Entra ID** as the identity source and confirm test users authenticate.
3. **Inventory internal apps** users currently reach over VPN; for each, capture FQDN and TCP port and confirm it is TCP-based.
4. **Deploy an Application Connector** on the network segment where those apps live; verify it can resolve each app's DNS.
5. **Publish apps** (Applications → Add Application) and group them into **App Segments** by team/department, binding the appropriate policy and connector.
6. **Enroll endpoints** (Windows agent; Android MDM app + token; iOS PKI/SCEP/relay) so devices appear under Endpoints with Private Access enabled.
7. **Pilot** with one segment/team, watch **Auditing**, then expand. Once coverage is confirmed, **decommission the broad VPN route** for those apps.
8. Optionally layer **System Quarantine/NAC** so endpoints that drift out of compliance are isolated regardless of Private Access.

### Diagnostics: logs, prerequisite checks
- **Auditing** tab for per-attempt access decisions; **Endpoints** list for enrollment/trust state.
- Application Connector DNS-resolution and reachability checks; Entra ID connectivity.
- (NAC) Quarantine policy **Status** view; EC agent reachability.

### FAQs
- *How is this different from a VPN?* VPN gives network-wide access with implicit post-login trust and backhauled traffic; Private Access gives application-specific, allowlisted access with user + device verification, hidden resources, restricted lateral movement, and direct access.
- *Which identity providers are supported?* **Azure Entra ID only** (current).
- *Which protocols?* **TCP only** (current).
- *Which platforms?* Windows, macOS, iOS, Android.
- *What build do I need?* EC **11.5.2606.02** or above; enable at Admin → Private Access.
- *Does it expose my apps to the internet?* No — only allowlisted applications are reachable, and unpublished internal services stay hidden from unauthorized users.
- *Is access checked only at login?* No — both user identity and device trust are verified before access is granted.
- *Can one application be in two App Segments?* No — an application belongs to exactly one App Segment at a time.
- *Do I always need an Edge Connector?* No — the Application Connector is required; the Edge Connector is optional and architecture-dependent.
- *How do I prove who accessed what?* Use the **Auditing** tab, which logs all access attempts for compliance and anomaly detection.

### Useful KB / help references
Private Access overview, configuring application access, app segments, endpoint enrollment, user identity configuration, auditing; Quarantine Compliance / NAC (links below).

---

## Cross-references
- [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) — Conditional Access and Per-App VPN overlap conceptually with Private Access's identity/device-aware app access.
- [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) — device trust/posture and containerization complement application-level access; System Quarantine/NAC is shared infrastructure.
- [browser-security.md](browser-security.md) — lockdown-to-specific-websites pairs with Private Access for securing internal web-app access.

## Sources
- https://www.manageengine.com/products/desktop-central/help/private-access/private-access-overview.html
- https://www.manageengine.com/products/desktop-central/help/private-access/configuring-application-access.html
- https://www.manageengine.com/products/desktop-central/help/private-access/configuring-app-segment.html
- https://www.manageengine.com/products/desktop-central/help/private-access/endpoint-enrollment.html
- https://www.manageengine.com/products/desktop-central/help/private-access/user-identity-configuration.html
- https://www.manageengine.com/products/desktop-central/network-isolation.html (redirects to Quarantine Compliance / NAC)
- https://www.manageengine.com/products/desktop-central/help/vulnerability-remediation/quarantine-compliance.html
- https://www.manageengine.com/products/desktop-central/secure-private-access.html (referenced)
- https://www.manageengine.com/products/desktop-central/request-demo.html (referenced)
