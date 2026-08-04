# Content Management (Mobile Content Management / MCM — Content Distribution)

> Securely distribute documents and media to mobile devices in bulk, viewed through a sandboxed catalog with DLP-style content policies. Parent module: [Mobile Device Management](mobile-device-management.md). Edition/point product: available in **Professional, Free, and Trial** editions of Mobile Device Manager Plus; bundled in Endpoint Central UEM.

## 1. What it is — Feature detail

For a mobile workforce to be productive, employees need essential documents and media on their devices — but that content must travel securely. Mobile Content Management (MCM) lets admins add documents/media to a server-side **Content Repository** and distribute them in bulk to groups and devices in a few steps. Supported on **iOS and Android**. (The Windows MDM native app was discontinued following the deprecation of the Windows Business Store.) For **MDM Cloud the total size of files added for distribution must not exceed 1 GB**.

### Benefits

- Documents are saved and viewed securely in the **ME MDM app** (Content Catalog).
- **No copy of the document is saved on the cloud.**
- Admins choose which apps may open the documents.
- Documents are prevented from being copied/shared to untrusted apps.

### Adding content to the repository

1. `Device Mgmt → Content Management` lists all repository documents.
2. Click **Add Documents** → drag-and-drop or browse to add files.
3. Add **Tags** to help filter documents during distribution.
4. Click **Done**; content is saved on the MDM server, ready to distribute.
5. Optionally create **security policies** for accessing content and attach them before distribution.

### Content security policy settings

Policies are optional. If none is chosen, content distributes with no settings and any existing policy is revoked from the device. If multiple policies are applied, the **latest** one wins.

| Setting | Description | Android | iOS |
| --- | --- | --- | --- |
| Open content with | Open in the ME MDM App or in available third-party apps | yes | yes |
| Clipboard sharing | Restrict copying text/content from catalog files to the clipboard (ME MDM app only) | yes | yes |
| Screenshots/Screen recording restriction | Prevent screenshots/recording of distributed content (iOS needs ME MDM app v25.04.01+) | yes | yes |
| Prompt for device passcode | Require the existing device password to open content | yes | yes |
| Allow users to remove content | Let users delete content from device storage (re-installable from catalog) | yes | yes |
| Download settings | Download manually vs. automatically | yes | yes |
| Download only over Wi-Fi | Restrict auto-download to Wi-Fi | yes | yes |

> **Work-profile note:** For Profile-Owner devices, set `Profiles → Restrictions → Device Functionality → Screen Restriction` to **Allow**; screenshots of shared content are disabled by default during Work Profile creation.

### Distribute to devices/groups

1. `Device Mgmt → Content Management` → select content → optionally **Select Policy** (or **Create Policy**).
2. Pick target devices/groups → **Select** → **Distribute**.
3. New devices added to a target group **automatically receive** the group's content.
4. Users view it in the ME MDM app under **Content** (Content Catalog).

### Lifecycle: modify, version, delete

- **Modify a document:** upload a new version; already-distributed copies auto-update. The server keeps **only the latest version** — to retain both, add the new version as a separate document.
- **Modify a policy:** changes propagate to all devices the associated content reached.
- **Delete:** removes the document from the repository and from devices.

### Viewing distributed content (end user)

- **List View** (sort ascending/descending/by Tags) and **Folder View** (organized by Tags).
- Add to **favorites**; download in bulk and access later from the **Offline** tab; **Recently Searched/Opened** tab for quick access.
- Open via ME MDM app → Content Catalog on Android, iOS, iPadOS.

### Supported formats

- **iOS in-app viewable:** doc, ppt, xls, xlsx, docx, rtf, txt, pdf, key, page, numbers, shortcuts; jpeg/jpg/png/gif; mp3/wav; mp4/mov. Other formats open in external apps regardless of policy.
- **Android in-app viewable:** txt, pdf; jpeg/jpg/png; mp3; mp4/mov. Other formats use third-party viewers.
- **Additional distributable formats:** zip, vcf/vcard, json, xlsb/xlsm, odp/ods/odt, pptx, csv; mkv, mka, m4a, ogg, aac, ico, mpg, mov, qt, m4v, avi, and more.
- **Contacts (.vcf):** add to Content Management, distribute, then open from Content Catalog → **Add to Contacts**.

## 2. UX lens

### Console navigation

`Device Mgmt → Content Management` (repository, policies, distribution). End-user: ME MDM app → Content Catalog.

### Step-by-step workflow

1. **Add Documents** (drag-drop/browse) → add **Tags** → **Done**.
2. **Create/Select Policy** (open-with, clipboard, screenshot, passcode, removable, download manual/auto, Wi-Fi-only).
3. **Select groups/devices** → **Distribute**.
4. Users open content in the ME MDM app (List/Folder view, favorites, offline).
5. **Modify/version/delete** as content changes; updates propagate automatically.

### UX research hooks

- **Screenshot restriction on work profiles** has a hidden dependency (Screen Restriction must be set to Allow) — a frequent source of "screenshots don't work" tickets. Surface the conflict in the policy UI.
- **Versioning surprise** — only the latest version is kept; admins lose old versions unintentionally. Warn before overwrite.
- **Policy precedence** — when multiple policies apply, the latest silently wins. Show which policy is effective per document.
- **1 GB Cloud cap** — large media sets fail on MDM Cloud; show a running total against the cap.
- **Open-with confusion** — third-party vs. ME MDM app drastically changes the security posture; make the choice and its consequences explicit.

### Notable UI patterns/components

Content Repository grid with Tags filter; Add Documents drag-drop zone; content policy builder (DLP toggles); distribution target picker; end-user Content Catalog (List/Folder/Offline/Favorites).

## 3. PM lens

### Value proposition & business outcomes

Delivers a secure, sandboxed document channel so field/frontline staff always have current materials without storing them in personal cloud apps. DLP-style policies (no clipboard, no screenshots, passcode, restricted open-with) prevent leakage; auto-versioning keeps everyone current; group auto-assignment scales onboarding.

### Target personas & use cases

- **MDM admin / ops** — push manuals, price lists, SOPs, training material to fleets.
- **Frontline/field teams** — always-current documents, offline-accessible.
- **Regulated industries** — sandboxed content with screenshot/clipboard restriction and passcode prompts.
- **Onboarding** — new devices in a group inherit the group's content automatically.

### Positioning & differentiators

MCM is embedded in MDM/UEM, sharing console and grouping with apps and profiles. The sandboxed ME MDM app viewer (no cloud copy, restricted sharing, per-platform DLP toggles), auto-versioning, and group auto-assignment differentiate it from generic file-sync tools.

### Edition / point-product gating

Content Distribution is available in **Professional, Free, and Trial** editions of MDM. **MDM Cloud caps total distribution files at 1 GB.** Bundled in Endpoint Central UEM.

### Expansion opportunities

- Restore a modern **Windows** content channel (lost with Windows Business Store).
- Optional **version retention** rather than latest-only.
- Larger Cloud limits or tiered storage.
- Read receipts / acknowledgement workflows for compliance-critical documents *(inferred)*.

## 4. Developer / Technical lens

### Mechanics

- Content lives in a server-side **Content Repository**; the **ME MDM app** renders it securely on-device (no cloud copy retained).
- Distribution commands ride the per-platform push channel (APNs / GCM-FCM); see [mobile-device-management.md](mobile-device-management.md) for ports.
- Only the **latest version** of each document is stored server-side; modifying a document re-pushes to all targets; deletion removes from devices.
- Group membership drives auto-assignment: new group members receive the group's content automatically.

### Ports / protocols / limits

| Platform | Push service | Notes |
| --- | --- | --- |
| iOS/iPadOS | APNs | 443 (server, HTTP/2+TLS1.2+), 5223 (device Wi-Fi) |
| Android | GCM/FCM | 5228-5230 (device Wi-Fi); Google ASN 15169 |
| Windows | — | Native content app discontinued (Windows Business Store deprecation) |

- **MDM Cloud:** total distribution files must not exceed **1 GB** (documented).
- Screenshot restriction on iOS requires **ME MDM app v25.04.01+** (documented).

### Data model / key objects

Document (file, Tags, version — latest only), Content Policy (DLP toggles), Distribution assignment (group/device), Content Catalog view. *(Some object names inferred.)*

## 5. Support / Troubleshooting lens

| Symptom | Cause | Fix |
| --- | --- | --- |
| Screenshots of distributed content fail (work profile) | Screen Restriction disabled by default at Work Profile creation | Set `Profiles → Restrictions → Device Functionality → Screen Restriction` = Allow |
| Content distribution fails / size error on Cloud | MDM Cloud 1 GB total cap exceeded | Reduce total file size |
| Screenshot policy ignored on iOS | ME MDM app below v25.04.01 | Update the ME MDM app |
| Old document version disappeared | Server keeps only the latest version | Re-add the prior version as a separate document |
| Wrong policy in effect | Multiple policies applied; latest wins | Review/clean up policies; the latest associated policy is the effective one |
| Content won't open securely | "Open content with" set to third-party app | Set Open with = ME MDM App to enforce sandbox/DLP |
| New device didn't get content | Device not in the target group | Add the device to the group; group content auto-assigns |

### FAQs

- *Which platforms?* iOS and Android (Windows native content app discontinued).
- *Where do users view content?* ME MDM app → Content Catalog (List/Folder/Offline/Favorites).
- *Is anything stored in the cloud?* No copy of the document is saved on the cloud.
- *What's the Cloud size limit?* 1 GB total for distribution.
- *How do I keep content current?* Modify the document; distributed copies auto-update (latest version only).

## Cross-references
- [mobile-device-management.md](mobile-device-management.md) — parent module; push services, profiles, content overview.
- [byod-management.md](byod-management.md) — sandboxed content on personal devices.
- [email-management.md](email-management.md) — the same secure Document Viewer handles email attachments.
- [kiosk-management.md](kiosk-management.md) — content/security policies in kiosk deployments.

## Sources
- https://www.manageengine.com/mobile-device-management/help/content_management/mdm_document_distribution.html
- https://www.manageengine.com/products/desktop-central/help/mobile_device_management/document_distribution.html (JS-rendered; canonical points to the help page above)
- https://www.manageengine.com/mobile-device-management/edition-comparison-matrix.html
- https://www.manageengine.com/products/desktop-central/mobile-device-management-mdm.html
