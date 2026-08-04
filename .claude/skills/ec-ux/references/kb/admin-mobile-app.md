# Endpoint Central Admin Mobile App
> The Endpoint Central mobile app (iOS and Android) lets IT administrators manage and secure Windows, Mac, and Linux endpoints on the go — installing agents, scanning, patching, remote-controlling, and acting on alerts from a phone. Available for both Cloud and On-Premises Endpoint Central; access is governed by the same role/permissions as the web console. Includes a Zia virtual IT assistant.

## 1. What it is — Feature detail

### Purpose, who it's for, where it sits in the EC product family
The admin mobile app is the companion client to the Endpoint Central web console, built so endpoint management "is no longer a job which holds you back on your seat." It targets **IT administrators and help-desk technicians** who need to perform endpoint operations away from their desk — during after-hours incidents, while mobile, or when fast turnaround on a critical request matters. It connects to a customer's Endpoint Central server (Cloud or On-Premises) using the same server details and login credentials as the web console.

It is distinct from Endpoint Central's *mobile device management (MDM)* features: this is the **admin's tool for managing the fleet**, not the managed endpoint itself. It manages Windows, Mac, and Linux computers (and supports remote sessions for Android and iOS devices too).

### FULL capability breakdown with how it works
Per the product page, the app supports:

- **Install / uninstall agents** — push the Endpoint Central agent onto, or remove it from, Windows/Mac/Linux computers with a tap (the first step in managing a computer).
- **Scan computers** — trigger a scan of one or more computers to fetch current hardware and software details.
- **Fetch software details** — view installed software inventory per computer.
- **Fetch hardware details** — query hardware by manufacturer, device type, age, etc., producing accurate hardware-inventory reports.
- **Manage prohibited software** — identify computers running prohibited software and trigger automatic uninstall.
- **Add / remove computers from Scope of Management (SoM)** — bring computers into management or disable management on them.
- **Patch management** — automate patching of Windows, Mac, Linux, and third-party applications, including approving/declining and deploying from the device. (Patch deploy is explicitly cited as something you can do "from your mobile phone.")
- **Advanced remote control** — initiate remote sessions and troubleshoot computers anytime; remote-control reach extends to Android and iOS devices.
- **Virtual assistant (Zia)** — manage endpoints hands-free via Zia, the virtual IT assistant (this capability is noted as limited to Android devices on the product page).
- **Alerts/notifications & asset views (inferred)** — receive notifications for endpoint events and review asset/inventory data; consistent with the app's "intelligent alerts" and asset-monitoring positioning across Endpoint Central. (inferred — the public app page emphasizes the actions above; alerting/announcement surfacing follows from the broader product.)

### Supported platforms / prerequisites / key concepts
- **App platforms:** iOS (Apple App Store) and Android (Google Play). Downloadable via store links or QR codes on the product page.
- **Managed platforms via app:** Windows, macOS, Linux; remote sessions also for Android and iOS.
- **Prerequisites:**
  - An existing Endpoint Central server (Cloud or On-Premises).
  - The server's connection details entered in the app.
  - The **same login credentials** as the web console.
  - Network reachability from the phone to the EC server (for On-Prem this may require the server be reachable, e.g., via Secure Gateway — inferred).
- **Key concepts:**
  - **Role-bound access:** "Access to the contents in the mobile app is determined by the role and permissions for every user." A read-only web user is read-only in the app.
  - **Demo mode:** a demo version is reachable via a link on the app login page (no real server needed).
  - **Zia:** the AI/virtual assistant layer ("Powered by Zia") that, in Endpoint Central's broader AI story, lets admins query live endpoint data in natural language and trigger patching/deployment/remediation.

### Supported actions: app vs web console
The app is a deliberate **subset** of the full web console, optimized for the actions an admin most needs away from the desk. The following maps app-supported actions against the web console:

| Capability | Mobile app | Web console |
|---|---|---|
| Install / uninstall agent | Yes | Yes |
| Add / remove from Scope of Management | Yes | Yes |
| Scan computers | Yes | Yes |
| Fetch hardware / software inventory | Yes | Yes |
| Manage / auto-uninstall prohibited software | Yes | Yes |
| Patch: approve / decline / deploy | Yes | Yes (full patch workflow) |
| Remote control (Win/Mac/Linux; remote for Android/iOS) | Yes | Yes |
| Zia hands-free assistant | Yes (Android only) | Web Zia (per AI page) |
| Full configuration authoring, advanced reports, security-module admin | Limited / not all | Yes (full) |

The guiding principle: the app covers **onboarding, inventory, patching, prohibited-software cleanup, and remote troubleshooting** — the high-frequency, time-sensitive operations — while deep authoring and full administration remain in the web console.

## 2. UX lens

### Primary roles & jobs-to-be-done
- **On-call IT admin** — JTBD: "Resolve a critical endpoint issue at 2 a.m. without opening my laptop."
- **Help-desk technician** — JTBD: "Knock out routine requests (scan, fetch inventory, push an agent, deploy a patch) between desk visits."
- **Roaming sysadmin** — JTBD: "Start a remote session and troubleshoot a user's machine from wherever I am."
- **Read-only viewer / auditor** — JTBD: "Check fleet status and inventory on the go" (limited to their role).

### Key workflows / screen flows step by step
1. **First-time setup** — download from App Store/Play Store (or scan QR) → enter Endpoint Central server details → log in with web-console credentials → land on the dashboard (role-scoped).
2. **Onboard a computer** — locate the target → tap install agent → confirm → add to Scope of Management.
3. **Inventory check** — select computer(s) → run scan → review fetched hardware/software details.
4. **Patch on the go** — open patch view → review missing/critical patches → approve/decline → deploy → monitor status.
5. **Remote troubleshooting** — pick the endpoint → launch remote session → resolve → end session.
6. **Hands-free (Android)** — invoke Zia → speak/type a request ("scan this computer," "deploy patches") → Zia executes.
7. **Prohibited-software cleanup** — scan → identify offending computers → trigger automatic uninstall.

### UX research hooks: friction points, where users get stuck, opportunities
- **Server-connection setup (friction):** entering On-Prem server URL/port and reachability is the most common first-run stumbling block. Opportunity: QR-based or account-based auto-config. (inferred)
- **Action confidence on a small screen:** destructive actions (uninstall agent, remove from SoM, deploy) need clear confirmation to prevent fat-finger mistakes. (inferred)
- **Feature parity gaps:** the app is a subset of the web console; users may hit "I can't do that here" moments — opportunity to clearly signal web-only actions.
- **Zia platform asymmetry:** the virtual assistant being Android-only is a discoverability/parity gap for iOS admins.
- **Notification trust:** for the app to replace desk-bound monitoring, alerts must be timely and actionable.

### Notable UI patterns
- **Role-scoped navigation** — the app mirrors the user's web permissions.
- **Tap-to-act tiles** for common operations (install, scan, patch, remote).
- **Conversational/assistant surface** (Zia) on Android.
- **Demo mode** entry on the login screen for evaluation.

## 3. PM lens

### Value proposition & business outcomes
"Manage your desktops & servers 24/7" and "resolve critical business needs away from your desk." Stated key benefits: work from anywhere/anytime and **eliminate wait time to resolve help-desk issues**. Business outcome: lower MTTR for endpoint incidents and continuity of IT operations outside business hours, without requiring a laptop.

### Target personas & use cases
- After-hours/on-call coverage; field/roaming admins; lean IT teams; MSP technicians servicing multiple clients on the move.
- Use cases: emergency patch deployment, agent onboarding for new machines, ad-hoc inventory checks, remote firefighting, prohibited-software remediation.

### Competitive positioning / differentiators
- **Same credentials, same roles** as the web console — no separate permission model to manage.
- **AI assistant (Zia)** for natural-language, hands-free operations — a differentiator versus apps that are read-only dashboards.
- **Cross-platform management** (Windows/Mac/Linux) plus remote reach to Android/iOS from a single admin app.
- **Available for both Cloud and On-Premises** Endpoint Central.

### Packaging / pricing / edition gating
- The app itself is a **free companion** to an Endpoint Central license (no separate purchase indicated).
- In-app capabilities inherit the licensed edition's features and the user's role (e.g., patch approval requires patch-management entitlement; remote control requires that feature in the edition).
- Zia/AI capabilities follow Endpoint Central's AI availability (Cloud-forward; see the AI page).

### Product expansion opportunities / gaps / roadmap ideas (analysis)
- **Bring Zia assistant to iOS** to close the platform gap. (inferred)
- **Push-notification-driven approval flows** (approve a patch/deployment straight from a notification). (inferred)
- **Biometric (Face/Touch ID) unlock and step-up auth** for sensitive actions. (inferred)
- **Wider parity with the web console** (announcements, richer reports, security-module actions). (inferred)
- **Offline-aware queuing** of actions when connectivity is poor. (inferred)

## 4. Developer / Technical lens

### Architecture & components
- **Native mobile clients** for iOS and Android (Android package id `com.manageengine.desktopcentral`).
- **Client-server model:** the app is a thin client that authenticates to and issues commands against the customer's Endpoint Central server (Cloud-hosted or On-Premises).
- **Zia integration:** the assistant connects to live endpoint data and the remediation engine to translate natural-language requests into actions (per the AI page's "execution layer" framing). On the app, Zia is surfaced on Android.

#### Zia IT-assistant integration (deep dive)
Zia is ManageEngine's AI assistant. In the Endpoint Central AI story, **Zia for IT Admins** is positioned as an "operations & security agent" that understands the environment and acts on it: query live endpoint data in natural language, trigger patching/deployments/remediation, automate workflows without scripts, and reduce MTTR with context-aware diagnostics. On the mobile app this manifests as the **virtual assistant** that lets an admin manage endpoints **hands-free** — speaking or typing a request and having Zia execute it. Per the public mobile-app page, this hands-free assistant is **limited to Android devices**. Zia's broader execution layer connects AI directly to live endpoint data, actions, and workflows (built on the unified agent and owned data lake), and can be extended via Zoho MCP + Zia Agent Studio. App-level Zia capabilities track the tenant's AI availability, which is Cloud-forward.

### Hosting, agent, ports, data flow, integrations, APIs (inferred where noted)
- **Hosting:** none required for the app; it talks to the existing EC server.
- **Data flow (inferred):** phone → Endpoint Central server (Cloud DC or On-Prem) → agents on endpoints execute the requested action; results flow back to the app.
- **Connectivity (inferred):** for On-Premises, the phone must reach the EC server (LAN/VPN or via Secure Gateway for external access); Cloud is internet-reachable by design.
- **APIs (inferred):** the app is expected to consume Endpoint Central's server APIs for inventory, patch, agent, and remote-session operations.
- **Integrations:** inherits the server's integrations; AI features tie into Zia / Zoho MCP per the AI page.

### Scalability / multi-tenancy / security
- **Scale:** bounded by the EC server, not the app; the app issues commands the server fans out to agents.
- **Multi-tenancy:** in MSP contexts, the app operates within the technician's scoped access to client tenants (inferred from MSP RBAC model).
- **Security:**
  - **Authentication:** same login credentials as the web console; honors role-based permissions (read-only stays read-only).
  - **Two-factor authentication** is supported at the Endpoint Central level and applies to console access (inferred to extend to app login).
  - Demo mode isolates evaluation from production data.

### Authentication & security (deep dive)
- **Single credential model:** the app uses the *same* login as the web console — there is no separate mobile identity to provision or revoke, which simplifies offboarding (disable the user once, everywhere).
- **Role/permission inheritance:** every screen and action is gated by the user's Endpoint Central role; the app cannot elevate beyond web entitlements.
- **Two-factor authentication (2FA):** Endpoint Central supports 2FA for console access; this is expected to govern app sign-in as well (inferred — confirm per deployment).
- **Directory authentication:** Active Directory authentication is supported at the product level, so app logins can ride existing identity. (inferred to apply to app)
- **Demo isolation:** the in-app demo connects to a sandbox, never production data.
- **Transport security (inferred):** communication between app and server is expected to use encrypted channels (HTTPS/TLS), consistent with EC's secured agent/console communications.
- **Lost-device risk (gap/opportunity):** biometric unlock and step-up auth for destructive actions would harden the app against a lost/stolen phone (inferred opportunity).

### Technical limitations
- **Subset of web-console functionality** — not every action is available on mobile.
- **Zia hands-free assistant is Android-only** per the public page.
- **Connectivity dependence** — On-Prem reachability can constrain remote use.

## 5. Support / Troubleshooting lens

### Common issues & resolutions
- **Can't log in / connect** — verify server details and that the phone can reach the EC server (VPN/Secure Gateway for On-Prem); confirm credentials match the web console.
- **Missing a feature/action** — check the logged-in user's role/permissions and the licensed edition (the app mirrors web entitlements).
- **Zia not available** — confirm you are on Android (assistant is Android-only) and that AI/Zia is enabled for the tenant.
- **Agent install fails from app** — same root causes as console installs: firewall/ports, admin rights, connectivity.

### Diagnostics, prerequisite checks
- Confirm app is installed from the official App Store / Play Store.
- Validate server URL/port and network path from the device.
- Verify the user's role grants the attempted action.
- Use the in-app **demo** link to confirm the app itself works before blaming server connectivity.

### FAQs
- **Q: Can endpoints be managed by a mobile app?** A: Yes — IT admins can monitor and manage endpoints remotely via the dedicated app.
- **Q: Is there an app for both platforms?** A: Yes — Android and iOS.
- **Q: How do I install it?** A: Download "Endpoint Central" from Google Play or the App Store, sign in with your server details and admin credentials.
- **Q: Does it respect my web-console role?** A: Yes — access is determined by your role and permissions; a read-only user stays read-only.
- **Q: Can I try it without a server?** A: Yes — use the demo link on the login page.

### Useful KB / help references
- Mobile app product page: https://www.manageengine.com/products/desktop-central/desktop-management-mobile-app.html
- LAN architecture / agent: https://www.manageengine.com/products/desktop-central/desktop-central-lan-architecture.html
- Scope of Management: https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/defining_scope_of_management.html
- Zia IT assistant blog: https://blogs.manageengine.com/desktop-mobile/desktopcentral/2019/03/19/meet-your-new-it-assistant-zia.html
- AI / Zia overview: https://www.manageengine.com/products/desktop-central/ai/

## Cross-references
- [cloud-vs-on-premises.md](cloud-vs-on-premises.md) — the app works against both deployment editions
- [endpoint-central-msp.md](endpoint-central-msp.md) — MSP technicians use the app within scoped tenant access
- [00-product-overview.md](00-product-overview.md) — product family overview
- [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md) — agent and Secure Gateway concepts relevant to mobile reachability

## Sources
- https://www.manageengine.com/products/desktop-central/desktop-management-mobile-app.html
- https://www.manageengine.com/products/desktop-central/ai/
- https://www.manageengine.com/products/desktop-central/edition-comparison-matrix.html
- https://www.manageengine.com/products/desktop-central/help/introduction/what-is-desktop-central.html
