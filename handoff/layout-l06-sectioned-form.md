# L06 — Sectioned Form (single column)

**Demo:** `Layout/views/layout-sectioned-form.html` · standalone + `Shell.html?view=sectioned-form`
**Taxonomy:** `Layout/layouts.md` → L06
**Figma:** UEMS – Design System 3.0 · node `17310:45989` ("Main Content", 1192×1416, page *Navigations*)
**Reference screen:** Install/Uninstall Windows Patch (Computer) — Patch Manager module.

Create/edit a record with multiple grouped sections on one page. Use when > 3
sections and order isn't strict.

## Anatomy

```
ds-content (main)
└── .lay (height:100%, flex column)
    ├── ds-breadcrumb                     All Configurations › Windows › Install/Uninstall Windows Patch
    ├── ds-page-header                     title "Install/Uninstall Windows Patch (Computer)" + description
    ├── .lay__scroll (flex:1, overflow:auto; 20px inline inset)
    │   ├── §1 Basic Information           ds-section-header + rows
    │   │     ├── Name *                   ds-text-input  (maxlength 100, counter 0/100, required)
    │   │     └── Description              ds-text-area   (placeholder)
    │   ├── §2 Configure Patches
    │   │     ├── Operation Type           ds-radio-group (Install Patches • Uninstall Patches)
    │   │     └── (action)                 ds-button variant="secondary" — "Select Patches"
    │   ├── §3 Deployment Settings         section-header w/ action-label "View All"
    │   │     ├── Deployment Option        ds-checkbox ×2 (Deploy ✓ • Publish to SSP) + ds-tooltip help
    │   │     ├── Apply Deployment Policy  ds-input-select "Select policy" + ds-text-link "+ Create Policy"
    │   │     └── Force deploy … after     ds-date-picker (+ help icon, prefix/suffix text)
    │   ├── §4 Define Target               section-header w/ action-label "View All"
    │   │     └── Target 1 (repeatable)    ds-input-select "Remote Office" + ds-input-select "Select remote office"
    │   │                                  + add/remove ds-icon-button (＋ / −)
    │   └── §5 Additional Settings (Optional)
    │         ├── Retry on Failed Targets  ds-accordion item, header ds-toggle (on)
    │         │     ├── Retry on Startup * ds-input-select "1"
    │         │     └── Retry on Refresh * ds-input-select "1"
    │         ├── Notification Settings    ds-accordion item, header ds-toggle (off)
    │         └── Scheduler Settings       ds-accordion item (chevron)
    └── ds-form-footer (sticky, flex:none)
          ├── left slot                    "Last saved 2 min ago"
          └── right button group           ds-button outline "Cancel" · ds-split-button "Save as" · ds-button primary "Deploy"
```

## Slot → component

| Region | Component | Key attrs |
|---|---|---|
| Breadcrumb | `ds-breadcrumb` | items = All Configurations / Windows / Install-Uninstall… |
| Page header | `ds-page-header` | `title`, `description`, `show-breadcrumbs="false"` (breadcrumb is separate) |
| Section header | `ds-section-header` | `title`, `description`, `action-label="View All"` + `show-action` (§3, §4 only) |
| Text field | `ds-text-input` | `label`, `required`, `maxlength="100"`, counter |
| Multiline | `ds-text-area` | `label`, `placeholder` |
| Choice (one) | `ds-radio-group` | inline options |
| Choice (many) | `ds-checkbox` | `checked` on "Deploy"; help via `ds-tooltip` |
| Select | `ds-input-select` | `placeholder`, size default |
| Date | `ds-date-picker` | help icon; affix text |
| Inline link | `ds-text-link` | "+ Create Policy" |
| Collapsible group | `ds-accordion` + `ds-toggle` | toggle in each item header |
| Footer | `ds-form-footer` | left meta slot + right button group |
| Footer buttons | `ds-button` (outline/primary), `ds-split-button` | Cancel = **outline**, Deploy = **primary** (rightmost) |

All components exist in `design-system-library/src/components/` — **no new abstractions**.

## Labels — use the component's own label

Fields use each component's **own `label` with `label-position="left"`** (not a
hand-rolled label column), so labels, required(*), help icons and counters come
from the design system. The components' native left-label column is **240px + 8px
gap**; each field is capped at ~820px so the control lands ~572px like the Figma.
Composite rows with no single owning component (Define Target) use a matching
240px `.lay__label-col`; a lone control (Select Patches) is offset 248px to align
under the control column.

## Measurements & tokens (from Figma)

- Content column ≈ **1192px**; section inline padding **20px** (`--spacing-20`).
- Figma "Name" row measured label 280 · gap 40 · control 572; the built page uses
  the component-native 240 · 8 · (≤572 via 820 cap) so all fields align consistently.
- Section title: **16px Semibold**, color `Text/Text-Primary` (`--uems-text-primary`);
  full-width divider trailing the title; optional right `View All` action.
- Section vertical padding 16–20px top; row bottom gap 20px.
- Form footer: padding `12px 24px`, gap 16px, left meta + right button group (gap 12).

## Rules (taxonomy + Prism conventions)

- One section per logical group; **Accordion** for the optional "Additional Settings" group.
- Validate on blur → inline `ds-inline-alert`/message under the field.
- Footer buttons right-aligned, **primary (Deploy) rightmost, Cancel = outline**.
- Section titles via `ds-section-header` — never ALL-CAPS.
- First field (Name) focused on load.
- RTL-safe: logical properties only.

## Decisions to confirm

1. **Required asterisk direction.** Figma asterisks *required* fields (Name*, Retry*),
   but `layouts.md` states "required indicator on *optional* fields, not required ones."
   → Following Figma (asterisk on required); confirm which rule wins for Prism.
2. **Page-header name.** Taxonomy calls for an *inline-editable* name Text field in the
   header; Figma shows a static title + description. → Following Figma (static).
3. **"Force deploy … after" control.** Figma shows a combined text + date-picker with a
   help icon. → Mapping to `ds-date-picker` with affix text; confirm exact control.
4. **Data Table sibling.** The frame also contains a 1328px "Data Table" (likely the
   "Select Patches" picker in a separate panel). → Out of scope for L06; treated as a
   downstream drawer/modal, not part of the form flow.

## Component fixes made while building this page

- `design-system-library/src/components/index.js` — registered **`ds-form-footer`** (it existed but
  was never imported, so the element never upgraded anywhere).
- `radio-group.css` / `checkbox-group.css` — added `.__info[hidden]{display:none}`
  so the info "?" respects the `hidden` attribute (a `display` rule was overriding it).
- Page-scoped: `ds-checkbox-group` shows a group help "?" by default and its opt-out
  is presence-only (can't be turned off by attribute), so the icon is hidden via page
  CSS for this form. `ds-date-picker` has no left-label variant, so it's grid-aligned
  to the 240px label column via page CSS.

Note: `Layout/settings-mail.html` is **not** the L07 pattern (it's a screen demo);
don't treat it as the L07 reference.
