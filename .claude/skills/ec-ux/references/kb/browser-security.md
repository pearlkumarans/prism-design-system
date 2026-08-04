# Browser Security

> Centralized control plane within ManageEngine Endpoint Central (EC, formerly Desktop Central) that hardens, locks down, filters, and isolates web browsers across managed endpoints so enterprise data is accessed only through approved browsers in approved ways. Available as part of the Endpoint Central Security Edition / Endpoint Security add-on (and also sold standalone as ManageEngine Browser Security Plus). With over 90% of malware delivered via browsers and a large share of employees running unmanaged extensions (vendor cites Gartner, 2023), the module exists to govern the single largest enterprise attack surface — the web browser.

---

## 1. What it is — Feature detail

### Purpose and where it sits in the EC console
Browser Security is a module in the Endpoint Central Security suite. In the modern console it surfaces under a top-level **Browsers** workspace, and almost everything is authored as **policies** (`Browsers -> Policies -> <policy type>`) that are saved as drafts, published, and then **associated** with custom groups or individual computers from `Browsers -> Manage -> Groups & Computers`. The agent translates each published, associated policy into native browser-enforceable settings and reports compliance/insights back to the server.

The module's promise: ensure "enterprise data is accessed only via authorized browser applications," then layer filtering, threat prevention, data-leak prevention, isolation, routing, Java control, and customization on top. A central dashboard (`Browsers -> Manage`, Insights tab) provides a browser/add-on inventory, highlights risks (harmful extensions, outdated browsers, web activity), and produces a security score from scheduled scans.

### Console navigation map (authoritative paths from the help)
- **Policy authoring:** `Browsers -> Policies -> {Browser Restriction | Browser Lockdown | Browser Router | Web Filter | Web Isolation | Add-on Management | File Activity Restriction | Java Manager | Data Leakage Prevention | Threat Prevention | Browser Customization}`
- **Policy deployment:** `Browsers -> Manage -> Groups & Computers` (select a custom group, or switch to **Computers** to pick devices) `-> Associate Policy -> Deploy`
- **Inventory / insights / security score / web activity:** `Browsers -> Manage` (Insights tab; overridden category requests appear under Web Activity)
- **Website groups (reusable URL sets):** referenced throughout as "website groups," created via the Browser Security web-groups screen and reused by Lockdown, Router, Web Filter, Web Isolation, Java Manager, and File Activity Restriction.

### FULL capability breakdown (every sub-feature, what it does, how it works)

1. **Browser Restriction (allowlist/blocklist of browsers)**
   - Controls which browsers may be used on a device by **allowlisting** or **blocklisting** specific browsers. Allowlisting one browser implicitly blocks all others (the documented technique for blocking *unsupported* browsers such as Opera or UC Browser: allow only a supported browser).
   - Explicitly supported/controllable browsers: **Google Chrome, Mozilla Firefox, Naver Whale, Brave, Vivaldi, Coc Coc, Yandex, Ulaa, Microsoft Edge, Microsoft Edge (Legacy), and Internet Explorer.**
   - Takes effect **after the next asset scan** once a new browser is installed (i.e., enforcement is inventory-driven).

2. **Browser Lockdown (kiosk mode)**
   - Enables **kiosk mode in Internet Explorer and Microsoft Edge**, restricting users to a predefined list of websites or website groups. Used to harden legacy-IE workflows down to trusted sites only.

3. **Browser Router (legacy redirection)**
   - Redirects website traffic from one browser to another by criteria — e.g., Chrome -> Edge in **Internet Explorer (IE) mode** — so legacy web apps keep working. Routing targets can be entered manually, selected as **website groups**, or scoped to **Intranet sites**. Multiple route rules can target different destination browsers (add with the **+** button).

4. **Web Filtering**
   - Toggles: **Block Malicious Websites**, **SSL certificate protection** (enforce SSL encryption), **Restrict over-riding SSL certificate errors** (stop users bypassing untrusted-cert warnings), **Block third party websites that inject code**, **Block websites with excessive ads**.
   - **URL Filter:** allow or block by **AI-classified web categories** (Education, News, Entertainment, etc.) or by individual sites / website groups, with per-rule **access time windows** in `HH:MM:SS`. **Override Category Restriction** lets a blocked domain in a category be permitted (overrides are logged under Web Activity). **Define exclusion list for URL filter** carves sites out of filtering.
   - Block-page customization: custom message, logo, redirect to another site, and an **Allow users to contact admin from a blocked page** mail option.
   - **Web Category feature is in closed beta** (request access from support).
   - **Not enforced in Incognito or Guest mode** — disable Incognito via `Browser Customization -> Security Restriction -> Disable Incognito Policy`; disable Guest via `Browser Customization -> User Account Settings -> Allow users to use guest mode`.

5. **File Activity Restriction (downloads & uploads)**
   - **Block Downloads** / **Block Uploads** outright (Yes/No), or conditionally when any/all conditions match: **Web Domains/URLs** (tab URL or download URL), **Web Groups**, **File Size** (in bytes; 4KB = 4000 bytes), **File Types** (extensions, e.g., `.pdf`, `.exe`), **Time Limit** (24-hour format).
   - **Exclusion List** carves items out of restriction. Block-page is customizable (message/logo, contact-admin link).
   - Important caveat: blocking uploads via this policy only disables the **file-selection dialog box** — **drag-and-drop and copy-paste uploads still work** (see DLP "File upload to webpages"). Also **not enforced in Incognito/Guest mode**.

6. **Add-on Management (extensions/plugins)**
   - Block specific add-ons manually or via **CSV upload**; block specific **add-on permissions** (e.g., Desktop capture).
   - **Remove selected extensions if already installed** auto-removes them from devices.
   - **Native Messaging Permissions** (browser ↔ native app communication on Windows) can be allowed/blocked.
   - **Pin Extensions** fixes add-ons to the toolbar for visibility.
   - **Manage Runtime Host Access** allows/blocks an extension from running on specific websites by associating it with a website group.
   - **Now supported on macOS** (vendor note).

7. **Web Isolation**
   - Renders untrusted sites in a **virtualized/sandboxed** environment (virtualization + sandboxing); cache, images, and cookies are wiped after browsing, leaving no trace. Segregates personal vs. business sites.
   - Options: **Data persistence between sessions** (Allow/Deny) and **iFrame Restriction** (Allow/Deny — limits embedding external content via iFrames).
   - **Platform-gated:** applicable to **Microsoft Internet Explorer and Edge on Windows 10 Enterprise Edition version 1709 and later.**

8. **Java Version Management (Java Manager)**
   - Enable/disable specific **Java versions within Internet Explorer**, mapped per website or website group. Per-rule action: **Run -> Any** (allow all versions) or a **specific version**; **Block** (with a custom blocked message); **Default** (latest Java present on the user's machine). Multiple site->version rules via the **+** button.

9. **Browser Security Policies — three policy sets** (`Browser Settings`)
   - **Data Leakage Prevention (DLP):** see the full settings table below — controls passwords, autofill, sync, cookies, screen capture, upload via dialog, printing, history deletion, etc.
   - **Threat Prevention:** enables Chrome **Safe Browsing** and the Edge/IE **SmartScreen** filter to shield against malicious sites and drive-by attacks; also certificate validation and plugin restrictions.
   - **Browser Customization:** homepages/startup, images & audio, bookmark deployment, proxy, default search, pop-ups, cookies, scripts, device-access (camera/mic/geolocation), plus Security Restriction (Incognito) and User Account Settings (Guest mode) toggles referenced by other policies.
   - Once applied, **end users cannot change these settings**. Policies unify settings across **Chrome, Internet Explorer, Edge, and Firefox** (and Ulaa / Chromium browsers for many DLP settings).

10. **Distribute Bookmarks & Extensions** — push curated bookmarks and approved extensions OTA for productivity/consistency.

11. **Phishing Protection** — policy-driven monitoring to detect and block phishing attempts.

12. **Enterprise Browser Visibility & Insights** — browser/add-on inventory, risk highlights (harmful extensions, outdated browsers), web-activity log, security score, and scheduled scans for continuous monitoring.

### Data Leakage Prevention — full settings reference

| Setting | Effect when restricted/disabled | Supported browsers | Platforms |
|---|---|---|---|
| Print webpage | Disables printing a web page | Chrome, Edge, Ulaa | Windows, Mac |
| Automatic browser sync | Disables syncing bookmarks, passwords, themes | Chrome, Edge, Firefox, Ulaa, Chromium | Windows, Mac |
| Autofill | Restricts auto-filling of forms | Chrome, Edge, IE, Ulaa, Chromium | Windows, Mac |
| File upload to webpages | Blocks upload **via file-selection dialog only** (drag-drop & copy-paste still work) | Chrome, Edge, Ulaa, Chromium | Windows, Mac |
| Screen Capture and Mirroring | Disables screenshots / Chromecast mirroring **by site/extension** (OS shortcuts & Snipping Tool still work) | Chrome, Edge | Windows, Mac |
| Remember passwords | Controls saving of login credentials | Chrome, Edge, IE, Firefox, Ulaa, Chromium | Windows, Mac |
| Site per process | Isolates each site in its own process | Chrome, Edge, Ulaa, Chromium | Windows, Mac |
| Search Suggestions | Controls address-bar autocomplete suggestions | Chrome, Edge, Ulaa, Chromium | Windows, Mac |
| Metrics reporting to Google | Controls sending usage/metrics data to Google | Chrome, Edge, Ulaa | Windows, Mac |
| Prompt for download location | Controls per-download save-location prompt | Chrome, Edge, Ulaa, Chromium | Windows, Mac |
| Browser history deletion | Prevents users deleting browsing history | Chrome, Edge, Ulaa, Chromium | Windows, Mac |
| Background processing | Disables browser background processes | Chrome, Edge, Ulaa, Chromium | Windows |
| Network Prediction | Controls preloading/DNS prefetch | Chrome, Edge, Ulaa, Chromium | Windows, Mac |
| Third Party Cookies | Always Allow / Never Allow / Allow in visited sites | Firefox | Windows, Mac |

### Threat Prevention — full settings reference

| Setting | Effect / options | Supported browsers | Platforms |
|---|---|---|---|
| Phishing Filter | Protects against malware, abusive sites, insecure extensions, phishing, malicious & social-engineering attacks | Chrome, Edge, Firefox, Ulaa, Chromium | Windows, Mac |
| File Downloads | Enable all / Disable all / **Restrict Malicious File Downloads** (allow but block malware & phishing downloads) | Chrome, Edge, Ulaa, Chromium | Windows, Mac |
| Over-ride certificate errors | Restricting prevents users bypassing cert errors to reach unsafe sites | Chrome, Edge, Firefox, Ulaa, Chromium | Windows, Mac |
| Verification of certificate with revocation list | Checks certs against IE's revocation list to block compromised certs | Internet Explorer | Windows |
| Zone Elevation Protection | Stops lower-security-zone content executing scripts in a higher zone | Internet Explorer | Windows |
| Browser Helper Object | Disables third-party BHOs (extend browser but can be abused) | Internet Explorer | Windows |
| Flash Restriction | Restricts deprecated Flash plugins/content | Edge, Internet Explorer | Windows |
| IE Plugin Protection | Blocks unsigned ActiveX/plugins; allows only signed | Internet Explorer | Windows |
| Run scripts on webpages | Disables site script execution to stop script-based attacks | Internet Explorer | Windows |
| Unsigned IE plugins | Enforces digitally signed add-ons only | Internet Explorer | Windows |
| Block websites with excessive ads | Auto-blocks intrusive/excessive-ad sites | Chrome, Edge, Chromium | Windows, Mac |
| Block third party websites that inject code | Blocks untrusted sites injecting unauthorized scripts | Chrome, Chromium | Windows, Mac |

### Browser Customization — settings overview
Configured at `Browsers -> Policies -> Browser Customization` (select OS platform). Categories include: homepage & startup behavior; enable/disable **images and audio**; **bookmark deployment**; proxy; default search engine; pop-up control; cookie control; script control; device-access (camera/microphone/geolocation); plus the **Security Restriction** sub-area (e.g., **Disable Incognito Policy**) and **User Account Settings** sub-area (e.g., **Allow users to use guest mode**) that Web Filter and File Activity Restriction depend on for full enforcement. As with the other policy sets, once applied end users cannot change these settings.

### Deprecated Browser Policies (operational note)
Some previously available policies are no longer supported because browser vendors deprecated them. **Windows deprecations:** Flash restriction (Threat Prevention) for Chrome/Edge/Firefox; Print from cloud storage (DLP) for all browsers; Plugins (Content Restriction, and for URLs) for Chrome/Edge; Print from cloud, Print Proxy Enabled, Same-site cookie behavior (Customization) for Chrome/Edge; Allow users to run Adobe Flash (Add-on management) for Chrome/Edge. **Mac deprecations:** Flash restriction for Chrome/Edge/Firefox; Print from cloud storage for all browsers; Plugins (Content Restriction) for Chrome/Edge; Print from cloud, Print Proxy Enabled, Same-site cookie behavior for Chrome/Edge.

### Supported OS / platforms / coverage
- **Workstations/servers:** Windows and macOS (Add-on Management explicitly extended to macOS; DLP table lists Windows + Mac per setting).
- **Mobile devices:** browser restriction/silent install supported on mobile devices.
- **Browsers:** Chrome, Edge, Edge Legacy, Firefox, IE, plus Brave, Vivaldi, Yandex, Coc Coc, Naver Whale, Ulaa, Chromium variants (coverage varies by policy).

### Recommended rollout sequence (synthesized — partly inferred)
1. **Deploy the agent and run an asset scan** so the browser/add-on inventory and Insights populate (Browser Restriction enforces only after a scan).
2. **Start with high-value, low-friction policies** — Threat Prevention (Phishing Filter, Restrict Malicious File Downloads) and Browser Restriction (allowlist the standard browser) on a pilot group.
3. **Layer DLP and Web Filter**, remembering to disable Incognito/Guest (via Browser Customization) so those policies actually enforce.
4. **Add Add-on Management** (block-by-CSV + "remove if installed") and **File Activity Restriction** once baseline browsing is stable.
5. **Use Lockdown/Router/Java Manager only where legacy IE/Edge workflows demand it.**
6. **Always Save & Publish, then Associate & Deploy**, and confirm via `chrome://policy` / `edge://policy` / `about:policies` on a sample endpoint.
7. **Monitor Insights** (security score, harmful extensions, outdated browsers, Web Activity overrides) and iterate.

### Prerequisites and edition gating
- **EC agent** installed and communicating on each endpoint; **inventory/asset scan** must run (browser restriction enforces only after the next asset scan).
- **Web Isolation:** requires **Windows 10 Enterprise v1709+** and IE/Edge.
- **Java Manager / Browser Lockdown:** IE/Edge-centric.
- **Web Category filtering:** closed beta — requires support enablement.
- Full Browser Security ships in **Endpoint Central Security Edition / Endpoint Security add-on** (inferred), and standalone as **Browser Security Plus**.

---

## 2. UX lens

### Primary user roles & jobs-to-be-done
- **IT Security Admin** — define and enforce secure browsing policies (web filtering, threat prevention, DLP) org-wide.
- **Desktop/Endpoint Admin** — standardize browser configuration (homepage, proxy, bookmarks, default engine), push approved extensions silently.
- **Compliance Officer** — demonstrate regulatory alignment (content filtering, data-leak controls, auditability via Insights/Web Activity).
- **Help Desk** — diagnose why a site/extension/download is blocked; the block page's "contact admin" mail flow is the deflection mechanism.

### Key workflows / screen flows (verified against help)
1. **Create a Browser Restriction policy:** `Browsers -> Policies -> Browser Restriction -> Create Policy -> Allowlist/Blocklist -> pick browsers -> Save -> Save & Publish -> Associate to computers/groups`.
2. **Lock down to kiosk:** `Browsers -> Policies -> Browser Lockdown -> Create Policy -> select IE/Edge -> enter websites or website groups -> Save & Publish -> Associate`.
3. **Browser Router rule:** `Browsers -> Policies -> Browser Router -> Create Policy -> name -> choose destination browser -> enter sites manually / pick website group / choose Intranet sites -> (+ for more rules) -> Save & Publish -> Associate`.
4. **Web Filter:** `Browsers -> Policies -> Web Filter -> Create Policy -> name -> toggle malicious/SSL/code-injection/ads -> configure URL Filter (categories or sites, time windows, override, exclusions) -> customize block page -> Save & Publish -> Associate`.
5. **Web Isolation:** `Browsers -> Policies -> Web Isolation -> Create Policy -> name -> enter sites/website group -> set Data persistence + iFrame Restriction -> Save & Publish -> Associate`.
6. **Add-on Management:** `Browsers -> Policies -> Add-on Management -> Create Policy -> select browser -> name -> block add-ons (manual or CSV) / block permissions -> Remove if installed / Native Messaging / Pin Extensions / Runtime Host Access -> Save & Publish -> Associate`.
7. **File Activity Restriction:** `Browsers -> Policies -> File Activity Restriction -> Create Policy -> set Block Downloads/Uploads or conditional rules (domain/group/size/type/time) -> exclusions -> block page -> Associate`.
8. **Java Manager:** `Browsers -> Policies -> Java Manager -> Create Policy -> name -> Website(s)/group(s) -> Run Any/specific version | Block (+message) | Default -> (+ more) -> Save & Publish -> Associate`.
9. **DLP / Threat Prevention / Browser Customization:** `Browsers -> Policies -> <set> -> Create Policy -> select OS platform -> name -> toggle settings -> Save & Publish -> Associate`.
10. **Deploy any policy:** `Browsers -> Manage -> Groups & Computers -> (select group or Computers) -> Associate Policy -> choose from Available Policies into Selected Policies -> Deploy`.

### UX research hooks
- **Draft-vs-publish two-step** plus the separate **associate/deploy** step is a frequent point of "I created a policy but nothing happened" confusion — study where admins forget Save & Publish or the Associate step.
- **Incognito/Guest bypass:** Web Filter and File Activity Restriction silently do nothing in Incognito/Guest unless those modes are disabled in Browser Customization — a real foot-gun worth surfacing inline.
- **Upload-block partial coverage:** users learn that drag-drop/copy-paste still uploads; measure surprise and the gap between expectation and enforcement.
- **Deprecated-policy confusion:** the long deprecation list can leave admins maintaining toggles that no longer apply.
- **Asset-scan latency:** browser restriction only kicks in after the next asset scan; study the perceived delay.
- **Opportunity:** a per-device "effective browser policy" simulator and a one-click "publish + associate" combined flow.

### Notable UI patterns/components
- Per-policy-type "Create Policy" wizard with Save (draft) / Save & Publish actions.
- Website-group picker reused across policies.
- Groups & Computers association screen with Available/Selected policy panes.
- Insights dashboard with security score, harmful-extension and outdated-browser cards, Web Activity log.

---

## 3. PM lens

### Value proposition & business outcomes
- Shrinks the browser attack surface (phishing, malicious downloads, drive-by, script/code-injection, ad-laden sites) while preserving productivity (approved extensions and bookmarks flow OTA).
- Prevents data leakage through browsers (uploads, screen capture/mirroring, sync, password save, printing, history retention).
- Keeps legacy web apps alive (Browser Router IE-mode redirection, Java version pinning, IE/Edge kiosk lockdown).
- Replaces brittle GPO/ADMX browser management with a single central console; once applied, end users cannot alter settings.

### Target personas & use cases
- Regulated industries needing content filtering + DLP + audit (finance, healthcare, government; vendor cites HIPAA/GDPR).
- Kiosk/fixed-function deployments (IE/Edge lockdown to specific sites).
- Hybrid/remote workforces needing identical browser policy on- and off-network.
- Enterprises running legacy intranet apps demanding old browsers/Java.

### Competitive positioning / differentiators
- Bundled inside a full UEM+Security suite (browser security beside patch, software deployment, device control, app control, EPM, BitLocker) — single agent, single console.
- Differentiators vs. point tools: native **Browser Router** (legacy redirection incl. IE mode), built-in **Web Isolation** via virtualization/sandboxing, **Java Manager** version pinning, **AI-classified web-category** filtering (beta), and broad multi-browser coverage including Brave/Vivaldi/Yandex/Ulaa.
- Competes with Island/Talon enterprise browsers, secure-web-gateway vendors, and Chrome/Edge cloud management — EC's edge is consolidation and breadth.

### Edition gating & packaging
- Part of Endpoint Central Security Edition / Endpoint Security add-on (inferred). Standalone as **Browser Security Plus**. Web Category filtering gated behind closed beta.

### Product expansion opportunities / gaps / roadmap ideas (analysis)
- **Close the upload-block gap:** intercept drag-drop/copy-paste uploads, not just the file dialog.
- **Deprecation handling:** auto-detect and flag deprecated toggles in existing configs with migration guidance.
- **Risk-scored extensions:** integrate a CRX reputation feed; auto-recommend block lists.
- **GA the AI web-category engine** and expose category-level reporting in Insights.
- **Generative-AI site controls:** templates for AI/LLM sites (block sensitive-data paste) — extends DLP.
- **Cloud-delivered (remote) isolation** to cut local virtualization overhead and lift the Windows-Enterprise-only gate.

---

## 4. Developer / Technical lens

### Architecture & components
- **EC server/console** authors policies (draft -> publish -> associate -> deploy) and orchestrates distribution; **Distribution Servers** replicate to remote offices.
- **EC agent** translates each associated policy into native browser settings and reports inventory/insights/compliance.
- **Inventory/asset-scan subsystem** seeds Browser Restriction and the browser/add-on inventory; restriction enforces only after the next scan.

### Agent mechanics & enforcement methods (mostly inferred to native mechanisms)
- **Windows:** registry-based browser policy keys (Chromium/Edge `HKLM\SOFTWARE\Policies\...`, Firefox `policies.json`/registry), force-install/allow/block extension lists, URL allow/block lists, and application blocking for disallowed browser binaries.
- **macOS:** configuration profiles / managed preferences (plist) for Chrome/Edge/Firefox enterprise policies (Add-on Management explicitly supported).
- **Web Isolation:** virtualization + sandboxing renders untrusted sites away from the OS; cache/cookies/images wiped per session (IE/Edge on Win10 Enterprise 1709+).
- **Browser Router:** intercepts URL launches and redirects matching patterns (manual list, website group, or intranet) to a designated destination browser, including Edge IE mode.
- **Java Manager:** controls Java plugin/version loading per site within IE.
- **Add-on Management:** maps to ExtensionInstallBlocklist/Allowlist/Forcelist, permission blocks, native-messaging host policy, pinned-extension and runtime-host-permission policies.

### Ports, protocols, integrations, APIs (mark inferences)
- Agent-server over EC's secure channel (HTTPS; default on-prem ports 8020 HTTP / 8383 HTTPS — confirmed for EC generally in config KBs).
- Native integration with Chrome/Edge/Firefox/IE enterprise policy frameworks (inferred for Chromium/Firefox; explicit for IE/Edge in Lockdown/Router/Java/Isolation).
- REST API for policy automation (inferred — EC exposes APIs broadly; browser-security-specific endpoints not documented on these pages).

### Data model / key objects, scalability
- Key objects (inferred from UI): Browser Policy (per type), Website Group, Custom Group, Computer, Add-on/Extension, Web Category, Insight/Event record, Security Score.
- Scales via custom groups/OUs and Distribution Servers; configuration changes sync to agents during the standard **90-minute refresh cycle** (Distribution Server replicates first, then agents).

### Technical limitations
- Web Filter / File Activity Restriction not enforced in Incognito/Guest mode unless those are separately disabled.
- Upload block only covers the file-selection dialog (not drag-drop/copy-paste); screen-capture block only covers site/extension capture (not OS shortcuts/Snipping Tool).
- Web Isolation limited to IE/Edge on Win10 Enterprise 1709+; Java Manager and Lockdown are IE/Edge-centric.
- Vendor-deprecated policies (Flash, certain plugin/print/cookie controls) no longer enforceable.
- Browser Restriction enforcement is asset-scan-gated (delayed for newly installed browsers).

---

## 5. Support / Troubleshooting lens

Symptom -> Cause -> Fix format. Generic config-delivery issues mirror EC's Configurations KBs (see Application Control file for the shared "Ready to Execute / In Progress / Yet to Apply" tables).

### Browser-specific issues

- **"I created a policy but nothing changed on endpoints"**
  - *Cause:* policy left as a draft (Save only) and never published, or published but never **Associated/Deployed** to a group/computer.
  - *Fix:* open the policy, click **Save & Publish**, then `Browsers -> Manage -> Groups & Computers -> Associate Policy -> Deploy`.

- **Web filter / download block "does nothing" for some users**
  - *Cause:* the user is browsing in **Incognito** or **Guest** mode, where these policies are not enforced.
  - *Fix:* disable Incognito (`Browser Customization -> Security Restriction -> Disable Incognito Policy`) and Guest mode (`Browser Customization -> User Account Settings -> Allow users to use guest mode`), then redeploy.

- **Uploads still succeed despite an upload block**
  - *Cause:* File Activity Restriction (and DLP "File upload to webpages") only blocks the **file-selection dialog**; drag-and-drop and copy-paste are not covered.
  - *Fix:* set expectations; combine with broader Data Security/DLP controls; restrict the source sites via Web Filter.

- **Screenshots still possible after enabling screen-capture block**
  - *Cause:* DLP "Screen Capture and Mirroring" blocks only site/extension-initiated capture; OS shortcuts and Snipping Tool are unaffected.
  - *Fix:* layer OS-level/device-control screenshot prevention if required.

- **Newly installed unapproved browser not blocked yet**
  - *Cause:* Browser Restriction enforces only **after the next asset scan**.
  - *Fix:* trigger an inventory/asset scan or wait for the scheduled scan, then re-check.

- **Unsupported browser (Opera, UC Browser) cannot be selected to block**
  - *Cause:* only the documented browser list is directly controllable.
  - *Fix:* use the allowlist technique — allow only a supported browser (e.g., Chrome); all others, including unsupported ones, are then blocked.

- **A policy toggle has no effect**
  - *Cause:* the setting is a **deprecated browser policy** for that browser/OS (Flash, certain plugin/print/cookie controls).
  - *Fix:* consult the deprecation list; use an alternative control or browser-native mechanism.

- **Web Isolation cannot be applied / not isolating**
  - *Cause:* not on **Windows 10 Enterprise v1709+** with IE/Edge.
  - *Fix:* verify OS edition/build and browser; otherwise the policy is unsupported on that device.

- **AI web-category filter options missing**
  - *Cause:* Web Category is in **closed beta**.
  - *Fix:* request access from support.

- **Extension still present after a block policy**
  - *Cause:* "Remove selected extensions if already installed" not enabled; or extension ID/permission mismatch.
  - *Fix:* enable removal, verify the add-on identity/CSV, redeploy.

### Shared configuration-delivery troubleshooting (applies to browser policies too)
Published-and-associated browser policies ride EC's standard configuration/refresh pipeline, so the generic configuration-status symptoms apply. Summarized (full tables in the Application Control file):
- **Policy not reaching endpoints / status stuck:** wait the **90-minute refresh cycle**, or force application via the agent tray icon (**Apply Configurations**) or `cfgupdate` (`C:\Program Files\UEMS_Agent\bin\cfgupdate` on EC 11.2.2309.01+; `...\DesktopCentral_Agent\bin\...` below that). Verify the agent's last-contact time is after policy creation, the target group is non-empty, the agent version is current, and (for remote offices) the Distribution Server (DS) status is green — DS replicates first, then agents sync.
- **On-prem firewall blocking status updates:** open ports **8020 (HTTP)** and **8383 (HTTPS)** on the EC server (not applicable to EC Cloud).
- **AD GPO overriding a browser setting:** AD GPOs have higher precedence by default and can overwrite EC-pushed registry values; review via GPMC and adjust conflicting GPOs.

### Diagnostics
- Validate that native policy landed on the endpoint: `chrome://policy`, `edge://policy`, Firefox `about:policies`.
- Confirm agent online, supported browser/OS, correct edition/license, target-group membership, and that an asset scan has run.
- Check Insights/Web Activity for category overrides and blocked events; review per-policy compliance reports.

### FAQs
- *Does it work off-network?* Yes — protects on-site and remote workers.
- *Will it remove personal extensions?* Yes if "Remove if already installed" is enabled; otherwise it blocks future installs.
- *Which browsers?* Chrome, Edge, Edge Legacy, Firefox, IE, plus Brave/Vivaldi/Yandex/Coc Coc/Naver Whale/Ulaa/Chromium (coverage varies by policy).
- *Can users override blocked sites?* Only via the admin's Override Category Restriction; such requests are logged.

---

## Cross-references
- [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md) — blocking disallowed browser executables overlaps with Application Control; Java/plugin restriction complements app control; the shared 90-minute refresh cycle and configuration-status troubleshooting apply to both.
- [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md) — browser DLP is a subset of the broader Data Security/DLP story.
- [secure-private-access.md](secure-private-access.md) — application-level access pairs with browser lockdown for secure web-app access.

## Sources
- https://www.manageengine.com/products/desktop-central/help/browser-security/browser-overview.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/browser-restriction.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/browser-lockdown.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/browser-router.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/web-filter.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/web-isolation.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/addon-restriction.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/download-restriction.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/secure-and-manage-java.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/browser-settings.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/data-leakage-prevention-configurations.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/threat-prevention-configurations.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/browser-customization-configurations.html
- https://www.manageengine.com/products/desktop-central/help/browser-security/policy-deployment.html
- https://www.manageengine.com/products/desktop-central/knowledge-base.html
- https://www.manageengine.com/products/desktop-central/browser-security.html
