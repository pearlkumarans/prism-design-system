# Enterprise App Catalogue

> A curated, organization-approved catalog of applications that employees can browse, discover, and install on their own — saving IT time and keeping the environment compliant by ensuring only approved apps are used. Parent module: [Software Deployment](software-deployment.md) (the end-user surface overlaps with the [Self-Service Portal](self-service-portal.md)). Available in the editions that include software-deployment self-service (Enterprise and above). (Edition gating inferred from packaging — the catalogue is positioned alongside SSP.)

---

## 1. What it is — Feature detail

The Enterprise App Catalogue is Endpoint Central's curated storefront of **organization-approved applications**. IT builds a catalogue of vetted apps; employees then **discover and install** them on their own, reducing the need for IT support and the request-and-wait cycle. Because only approved apps are offered, the catalogue helps the organization stay **compliant with industry regulations and data-protection requirements** (only sanctioned software is used).

It is part of the same application-management family as software distribution and the Self-Service Portal: you publish applications (and patches) to a self-service surface and empower users to install them themselves. The catalogue is the **discovery-and-installation experience** over the approved set; the SSP is the agent-tray mechanism through which that experience is typically delivered. (Relationship inferred — ManageEngine markets a single "build a catalogue of apps employees can easily discover and install" capability under software deployment.)

### What the catalogue provides
- A **curated list of approved apps** (free and commercial) for self-service discovery and installation.
- **Reduced IT load** — employees self-serve instead of raising tickets.
- **Compliance enforcement** — only approved/sanctioned apps appear, reducing shadow IT and unapproved-software risk.
- **Optional approval governance** — with ServiceDesk Plus, apps can be published "with approval," so a request becomes a help-desk ticket a technician approves before install.

### Relationship to SSP, MDM App Catalog, and software deployment
| Surface | Audience / scope | Mechanism |
| --- | --- | --- |
| **Enterprise App Catalogue** | Approved-app discovery/installation for managed desktops | Curated catalog over published packages (delivered via the agent-tray self-service surface) |
| **Self-Service Portal (SSP)** | Windows/macOS end users | Agent-tray portal listing published install/uninstall actions |
| **MDM App Catalog** | Mobile (iOS/Android/etc.) | OTA app catalog assigned to enrolled devices |

These overlap conceptually for users; ManageEngine surfaces them under one application-management umbrella, and a unified self-service surface is a noted opportunity. (See §3.)

### Prerequisites and key concepts
- EC server + agents; software packages created and published; (optional) ServiceDesk Plus for approval workflow.
- The same package/repository/deployment-policy machinery as [Software Deployment](software-deployment.md) underlies catalogue entries.
- Key terms: approved apps, curated catalogue, discovery, self-install, approval mode, compliance/shadow-IT reduction.

---

## 2. UX lens

### Console navigation path (admin side)
Catalogue entries are managed through the software-deployment self-service area: `Software Deployment → Deployment → Self-Service Portal` (publish/associate approved apps), with appearance under `Software Deployment → Settings → SSP Settings`. (Exact "App Catalogue" labeling can vary by release — inferred from the shared self-service surface.)

### Step-by-step: build the approved-app catalogue (admin)
1. Create packages for the apps you want to approve (`Package Creation → Add Package`), storing binaries in the [software repository](software-repository.md).
2. Publish/associate them to the target users/computers/custom groups via the Self-Service Portal flow (`Software Deployment → Deployment → Self-Service Portal`).
3. Choose the approval mode (with/without approval) if ServiceDesk Plus is integrated.
4. Customize the catalogue appearance (rebranding/logo/colors) under SSP Settings.
5. Maintain currency with **Auto-update Templates** so catalogue apps stay on the latest version.

### Step-by-step: employee discovers and installs an app
1. Open the self-service surface (agent-tray icon / desktop shortcut / start menu).
2. Browse the curated catalogue of approved apps.
3. Click **Install** (or request approval if the app is published with approval).
4. Wait for install; activate license for commercial apps if prompted.

### UX research hooks
- **Catalogue vs SSP vs MDM catalog naming** confuses users; study whether a single, consistently named "App Catalogue" reduces mis-navigation.
- **Discovery quality** — search, categories, descriptions, and icons drive findability; study what makes employees self-serve vs. raise a ticket anyway.
- **Approval friction vs. governance** — tune which apps are auto-installable vs. approval-gated by risk.
- **Shadow-IT displacement** — measure whether a good catalogue actually reduces unapproved installs.

### Notable UI patterns
Curated app grid/list with per-app install action and metadata (icon, version, description); admin publish/associate flow; approval handoff to ServiceDesk Plus; rebrandable appearance.

---

## 3. PM lens

### Value proposition & outcomes
- **Self-service at scale** — employees find and install vetted apps without IT, cutting ticket volume and wait time.
- **Compliance & shadow-IT control** — only approved apps are offered, supporting regulatory and data-protection requirements.
- **Governed flexibility** — optional approval workflow balances autonomy with control.

### Target personas & use cases
- **End user / employee** — discover and self-install approved productivity apps.
- **IT administrator** — curate and maintain the approved set; offload routine installs.
- **Compliance / security** — constrain installs to a sanctioned catalogue.
- Use cases: onboarding app kits, department-specific approved tools, controlled rollout of new approved apps, replacing ad-hoc install requests.

### Positioning & differentiators
- Native to the unified platform — the catalogue reuses packages, repository, deployment policies, and the SSP delivery surface, with ServiceDesk Plus approvals layered on.
- Compliance angle (approved-only) differentiates from generic app stores.

### Edition gating & packaging
- Positioned with the Enterprise-tier self-service capabilities (Enterprise and above), alongside the SSP. (Inferred from packaging.)

### Expansion opportunities (analysis)
- **Unified self-service surface** merging Enterprise App Catalogue + SSP + MDM App Catalog with one approval workflow and consistent naming. *(inferred)*
- **Rich discovery** — categories, search, ratings, recommendations, and license-aware availability (hide apps with no free license, tying to ITAM). *(inferred)*
- **Risk-tiered approval automation.** *(inferred)*
- **Usage analytics** — most-installed, abandoned-request, and shadow-IT-displacement metrics. *(inferred)*

---

## 4. Developer / Technical lens

### Mechanics & components
- Built on the **Software Deployment** stack: packages stored in the network-share/HTTP **repository**, published to custom groups, executed by the agent in the configured context, and refreshed by **Auto-update Templates**.
- The catalogue is the curated/published subset surfaced to end users via the agent-tray self-service portal (90-minute sync, Sync Now).
- **ServiceDesk Plus** integration brokers approval tickets for approval-gated apps.

### Ports / protocols / limits (mark inferred)
- Inherits Software Deployment/SSP transport: agent–server **8020**, on-demand **8027**, console HTTPS commonly **8383**, Cloud over **443**. *(inferred — shared platform.)*
- Requires **.NET 4** on Windows clients for the self-service surface (shared with SSP). *(inferred.)*
- **Limits:** approval workflow requires ServiceDesk Plus; commercial apps may need manual license activation; catalogue changes lag up to one 90-minute sync; user-based publishing not supported on Mac (shared SSP constraint).

### Data model / key objects (inferred naming)
AppCatalogEntry (package ref, metadata: icon/version/description, target custom group, approval mode), Package, CustomGroup, ApprovalRequest ↔ SDP ticket.

---

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| App missing from catalogue | Not published/associated to the user's group; tray/SSP surface disabled; sync pending | Publish/associate to the right group; enable the agent tray icon + self-service menu; allow a 90-min sync or Sync Now. |
| Install requires approval but nothing happens | Approval-gated app; SDP ticket pending or integration not set | Approve the SDP ticket; verify ServiceDesk Plus integration and versions. |
| Commercial app installed but unlicensed | Commercial software needs manual license activation | User activates the license; document the step in the catalogue entry. |
| Catalogue app version stale | Auto-update Templates not enabled | Enable Auto-update Templates so catalogue entries refresh to the latest. |
| Employees still raising tickets / installing unapproved apps | Poor discovery or incomplete catalogue | Improve metadata/search; broaden the approved set; pair with application control to block unapproved installs. |
| Mac user-based catalogue entry missing | User-based publishing not supported on Mac | Publish to computer-based groups on Mac. |

### FAQs
- **What is the Enterprise App Catalogue?** A curated catalogue of organization-approved apps employees can discover and self-install.
- **How is it different from the SSP?** The catalogue is the curated, approved-app discovery experience; the SSP is the agent-tray delivery surface — they overlap and are delivered together.
- **Does it enforce compliance?** Yes — only approved apps are offered, helping prevent shadow IT and meet regulatory/data-protection requirements.
- **Can installs require approval?** Yes — with ServiceDesk Plus, publish "with approval" so a request becomes an approvable ticket.
- **How do I keep apps current?** Enable Auto-update Templates.

---

## Cross-references
- [software-deployment.md](software-deployment.md) — parent module; the catalogue reuses packages, repository, deployment policies, and Auto-update Templates.
- [self-service-portal.md](self-service-portal.md) — the agent-tray delivery surface for the approved-app catalogue; shares approval and sync behavior.
- [it-asset-management.md](it-asset-management.md) — approved-only catalogue supports software-license compliance and prohibited-software control.
- [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) — block unapproved apps to complement the approved-only catalogue.

## Sources
- Software Deployment (build a catalogue of apps for discovery/installation) — https://www.manageengine.com/products/desktop-central/software-deployment.html
- Software Self Service Portal — https://www.manageengine.com/products/desktop-central/self-service-portal-software.html
- Application Management — https://www.manageengine.com/products/desktop-central/help/application-management-and-control.html
- Endpoint Central features — https://www.manageengine.com/products/desktop-central/features.html

*Items marked "(inferred)" are reasoned conclusions not stated verbatim on the cited pages.*
