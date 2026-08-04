# Software Repository

> A central file location where Endpoint Central stores software packages (MSI/EXE and more) for storage, retrieval, and backup — offered as a **Network-Share repository** (for LAN deployment) and an **HTTP repository** (for WAN/roaming agents). Parent module: [Software Deployment](software-deployment.md). Available across the editions that include software deployment (Professional and above). Supports **Windows, macOS, and Linux**.

---

## 1. What it is — Feature detail

A software repository is a storage location where software packages are kept and accessed/installed on demand on network computers. Having a repository makes software management effective — easy storage, retrieval, and backup of packages — and, in a world of open source, helps ensure authentic software while reducing risk. Commonly used apps are stored centrally and installed when required.

Endpoint Central offers **two repository types**:

### Network-Share repository (LAN)
A network-share repository is used when deploying an application to multiple computers in a network. You store the package in a network share accessible from all network computers; the application installs directly on the specified computers. It is ideal for **computers in the same LAN**.

- Most installers are a single file (`setup.exe` / `<softwarename>.exe`); some have multiple files in the same directory; complex apps like **Microsoft Office** have multiple installables across **different directories** — such apps are best deployed from a network share reachable by all computers.
- **Advantages:**
  - Avoid multiple copies of the same application across the network.
  - Network-share details auto-fill whenever you add a package.
  - **Save network bandwidth** — executables aren't copied into each computer (they run from the share).

### HTTP repository (WAN)
An HTTP repository stores executable files before installation, used when deploying via the **HTTP path** — e.g., to a remote office whose computers reach the main office over **VPN or the Internet**, where a network share isn't usable. You browse and upload the required executables to the EC server; remote computers then pull them over HTTP to install.

- **Created automatically when the application is installed**, located in the **same folder as the Endpoint Central server**, e.g. `<DesktopCentral server>\webapps\DesktopCentral\swrepository`. The location can be changed if required.
- **Advantages:**
  - Install on computers that **cannot access a network share**.
  - Reach computers when a network share is unreachable because its **maximum connections** have been reached.
  - **No permissions to set** when using HTTP.

### Retrieval, backup, and security benefits
- **Easy software management** — packages are stored and grouped logically, easy to identify/deploy/manage.
- **No duplicate copies** — one common folder reduces scattered duplicates.
- **Minimized security risk** — the storage folder is set **Read-Only**.
- **Easy backup** — everything lives in one folder, so backing it up is simple.

### Choosing a repository
| Factor | Network-Share | HTTP |
| --- | --- | --- |
| Best for | LAN agents; complex multi-directory installers (e.g., MS Office) | WAN/roaming agents; remote offices over VPN/Internet |
| Created | Manually configured | Automatically at install time |
| Permissions | Requires Read & Execute share ACLs | None required |
| Bandwidth | Saves bandwidth (run from share) | Binaries uploaded to server, pulled by clients |
| Fallback | — | Use when shares are unreachable or connection-capped |

For full LAN + WAN coverage of one app, maintain **two packages** — one in the network share (LAN) and one in the HTTP repo (WAN). Both repository types can also serve **distribution servers** and WAN agents. (Per Software Deployment guidance.)

### Prerequisites and key concepts
- EC server + agents; a reachable UNC share with Read+Execute for network-share use; sufficient server disk for HTTP-uploaded binaries.
- Key terms: package, network share/UNC, HTTP path, swrepository, read-only store, distribution server, replication.

---

## 2. UX lens

### Console navigation path
`Software Deployment → Settings → Software Repository` (Network Share / HTTP Repository tabs).

### Step-by-step: configure a Network-Share repository
1. `Software Deployment → Settings → Software Repository → Network Share`.
2. Choose **Create Type → Create a Network Share** and enter the share path (auto-created on the server host if left blank).
3. Check **Accessing the Share using Credentials** and enter username/password — prefix the domain for a domain (e.g., `ZohoCorp\Administrator`) or the machine name for a workgroup.
4. **Save.** Set **Read and Execute** for Everyone (or scope to specific users/computers when restricting access or crossing domains/workgroups, which then requires explicit credentials).

### Step-by-step: use / relocate the HTTP repository
1. The HTTP repository already exists at `\webapps\DesktopCentral\swrepository` from install time.
2. To relocate: `Software Deployment → Settings → Software Repository → HTTP Repository` → enter the new path → **Save**.
3. Upload installables (browse/select executables, or zip multiple installers in different directories and upload).
4. (If relocation fails, consult the "Cannot Change the Location of the HTTP Repository" KB.)

### Step-by-step: store a package
1. Create a package (`Package Creation → Add Package`).
2. **Locate Installable:** choose **From Shared Folder** (network share) or **From Local Computer** (upload to HTTP).
3. The chosen repository stores the binary; the package references it for all subsequent deployments.

### UX research hooks
- **Repository mis-routing** — admins can pick the wrong store for the agent type (LAN vs WAN); an auto-recommend-per-target hint would reduce errors.
- **Share permission failures** — Read+Execute/credential setup is a common stumbling block; surface a connectivity test from the console.
- **HTTP disk growth** — uploaded binaries consume server disk; a usage/cleanup view would help.
- **Two-package pattern** for LAN+WAN is non-obvious; document and template it.

### Notable UI patterns
Software Repository settings with Network Share / HTTP Repository tabs; credential entry for shares; path relocation for HTTP; "Locate Installable" From Shared Folder / From Local Computer toggle in package creation.

---

## 3. PM lens

### Value proposition & outcomes
- **Single source of truth** for installables — authentic, deduplicated, backed-up, read-only.
- **Bandwidth efficiency** on LAN (run-from-share) and **reach** on WAN (HTTP pull) — one model covers both topologies.
- **Lower risk** via read-only storage and curated, approved binaries.

### Target personas & use cases
- **IT administrator** — store and reuse approved packages; deploy MS Office-class multi-file installers from a share.
- **Remote-office / WFH admin** — serve roaming agents via HTTP over VPN/Internet.
- **Backup/operations** — single-folder backup of all packages.

### Positioning & differentiators
- Dual-repository design fits both LAN and WAN out of the box; HTTP needs **zero permission setup**, easing remote rollout.
- Native to the platform — shared by Software Deployment, the Self-Service Portal, distribution servers, and WAN agents.

### Edition gating & packaging
- Bundled with software deployment (Professional and above). (Inferred from packaging; the repository is foundational to deployment.)

### Expansion opportunities (analysis)
- **Auto-recommend repository** per target reachability. *(inferred)*
- **Repository storage analytics & cleanup** (orphaned binaries, dedup). *(inferred)*
- **Content integrity** — checksum/signature verification surfaced in-console. *(inferred)*
- **Object-storage / cloud-native repo** option for Cloud edition. *(inferred)*

---

## 4. Developer / Technical lens

### Mechanics & components
- **Network-Share repository** — a UNC share over **SMB**; agents run installers from the share (LAN), saving the copy step; cross-domain/workgroup access requires explicit credentials (which forces a copy to clients).
- **HTTP repository** — served by the EC web server from `webapps\DesktopCentral\swrepository`; binaries uploaded to the server and pulled by clients over HTTP; relocatable; no ACLs.
- **Distribution servers** — both repository types can replicate to DS for WAN/remote scale per the Replication Policy; WAN agents then collect from the DS (network-share binaries from the share, HTTP binaries from the DS).

### Ports / protocols / paths / limits (mark inferred)
- Network share over **SMB (TCP 445)** with Read+Execute ACLs. *(inferred — standard SMB.)*
- HTTP repository served by the EC web server (console HTTPS commonly **8383**; HTTP path used by clients). *(inferred — shared platform ports.)*
- Default HTTP path: `<DesktopCentral server>\webapps\DesktopCentral\swrepository` (relocatable).
- **Limits:** network share needs LAN reachability and correct ACLs; it has a maximum-connections ceiling (a documented reason to fall back to HTTP); HTTP consumes server/DS disk for uploaded binaries.

### Data model / key objects (inferred naming)
Repository (type = NetworkShare | HTTP, path, credentials), Package (binary ref → repository), ReplicationPolicy (to distribution servers).

---

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| "Network path not found" on deploy | Target can't reach the share; wrong path | Test `Start → Run → <path>` from a client; correct the path; or switch to HTTP / enable the Copy option. |
| "Access Denied" to the share | Missing/invalid credentials or ACLs | Provide valid credentials (domain/machine-prefixed); set Read+Execute on the share. |
| Network-share install fails for remote agents | Remote office can't reach the LAN share over WAN | Use the HTTP repository for those agents (upload binaries to the server). |
| Share connection failures under load | Network share max-connections reached | Use HTTP repository (no connection cap / no permissions). |
| Cannot change HTTP repository location | Relocation prerequisites/permissions | Follow the "Cannot Change the Location of the HTTP Repository" KB; verify target path permissions and free space. |
| Multi-file installer (e.g., MS Office) fails | Installables span directories not all reachable | Place all files in a network share reachable by all targets (or zip and upload to HTTP). |
| Server disk filling up | Accumulated HTTP-uploaded binaries | Remove unused packages; relocate the HTTP repo to a larger volume. |

### FAQs
- **Network-share vs HTTP?** Network-share for LAN agents and complex multi-directory installers; HTTP for WAN/roaming agents and where shares are unreachable or connection-capped.
- **Where is the HTTP repository?** Created at install under `\webapps\DesktopCentral\swrepository`, same folder as the server; relocatable.
- **Do I need permissions for HTTP?** No — no share permissions are required.
- **How do I cover both LAN and WAN for one app?** Maintain two packages — one in the network share and one in the HTTP repo.
- **Which platforms are supported?** Windows, macOS, and Linux.
- **Why a read-only store?** It minimizes security risk and keeps packages authentic and backup-friendly.

---

## Cross-references
- [software-deployment.md](software-deployment.md) — parent module; package creation chooses the repository ("Locate Installable"), and deployment policies/distribution servers consume it.
- [self-service-portal.md](self-service-portal.md) — SSP serves packages drawn from these repositories.
- [01-architecture-agent-deployment.md](01-architecture-agent-deployment.md) — distribution servers, WAN agents, and replication that the repositories feed.

## Sources
- Software Repository (Network-Share & HTTP) — https://www.manageengine.com/products/desktop-central/software-repository.html
- Configuring Software Repositories (help) — https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/edit_network_shared_path.html
- Software Deployment Methods — https://www.manageengine.com/products/desktop-central/software-deployment.html

*Items marked "(inferred)" are reasoned conclusions not stated verbatim on the cited pages.*
