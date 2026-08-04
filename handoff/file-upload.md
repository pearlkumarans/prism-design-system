# Handoff Spec: File Upload

**Source:** Figma → UEMS Design System 3.0 → page *File Upload* → section **File Upload 2.0**
**Component sets:**
- `File Upload` (main, 64 variants) — node `22034:1812136`
- `_File Upload / File Item` (16 variants) — node `22034:1809573`
- `_File Upload / Files Summary` (12 variants) — node `22034:1809677`

The old file-upload sets have been deleted; this section is the single source of truth.

---

## Overview

A file-upload control in two visual styles:

- **Form** — a 40px input-like field that sits inline with other form controls. Placeholder text + a Browse button. Best for compact forms with one attachment.
- **Prominent** — a 78px dashed drop zone for upload-centric screens. Zone hint + Upload button; the zone itself hosts the file status while a single upload is in flight.

Both styles support **Single** and **Multiple** file selection, 8 interaction/lifecycle states, and RTL.

## Anatomy

```
Root (vertical auto-layout, gap: spacing-8)
├── Field (Form) / Dropzone (Prominent)
│   ├── Placeholder / Zone Hint text
│   ├── Browse Button (Form) / Upload Button (Prominent)
│   └── [busy states] file status content (see States)
├── Files list (Multiple type only, while busy)
│   ├── _File Upload / File Item × n
│   └── _File Upload / Files Summary (collapsible)
└── Helper Row — instance of Form Field Helper Row (shared with radio button, checkbox, etc.)
```

## Component API (Figma props → suggested web props)

| Figma prop | Type | Options / default | Web equivalent |
|---|---|---|---|
| `Style` | variant | Form \| Prominent | `variant="form\|prominent"` |
| `Type` | variant | Single \| Multiple | `multiple` (boolean attr) |
| `State` | variant | Default, Hover, Focus, Drop, Uploading, Error, Success, Disabled | interaction + `status` |
| `RTL` | variant | False \| True | `dir="rtl"` inheritance |
| `Show Helper` | boolean | true | `helper-text` present/absent |
| `File Name` | text | "repository.fon" | per-file data |
| Helper Row (exposed nested instance) | — | Helper Text, Show Icon, Show Counter, State | `helper-text`, error/success message |

Helper text is **not** a set-level text prop — edit it through the exposed `Helper Row` nested instance. Its `State` follows the upload state: Error → Negative, Success → Success, Disabled → Disabled, otherwise Default.

## Design Tokens Used

| Figma token | Web token | Usage |
|---|---|---|
| `Background/BG-Secondary` | `--uems-bg-secondary` | Form field fill (all non-disabled states) |
| `Background/BG-Primary-alt` | `--uems-bg-primary-alt` | Prominent zone fill; File Item row fill |
| `Background/BG-Accent-Primary_alt` | `--uems-bg-accent-primary-alt` | Drop state fill (both styles) |
| `Background/BG-Disabled` | `--uems-bg-disabled` | Disabled fill |
| `Background/BG-Tertiary` | `--uems-bg-tertiary` | Secondary (Browse) button fill |
| `Border/Border-Primary` | `--uems-border-primary` | Resting border |
| `Border/Border-Accent` | `--uems-border-accent` | Hover / Focus / Drop border |
| `Border/Border-Error` | `--uems-border-error` | Error border |
| `Border/Border-Disabled` | `--uems-border-disabled` | Disabled border |
| `Text/Text-Quaternary` | `--uems-text-quaternary` | Placeholder & zone hint |
| `Text/Text-Primary` | `--uems-text-primary` | File names |
| `Text/Text-Secondary` | `--uems-text-secondary` | Scanning status text |
| `Text/Text-Error` | `--uems-text-error` | Error file name / status text |
| `Text/Text-Accent-Primary` | `--uems-text-accent-primary` | Upload percentage |

**Typography** — `Text/Default/Regular` (14px) for the Form placeholder; `Text/Default/Medium` (14px) for the Prominent zone hint and drop hint; `Text/small/Medium` (12px) for file names inside the Form field; File Item / Summary rows use the small styles.

**Spacing & shape** — root gap `spacing-8`; field/zone radius **8px**; File Item row radius 4px. Form field padding `0 2px 0 12px` (2px reserves the button inset), height **40px**. Prominent zone padding **8px** (16px horizontal in busy states), height **78px**. Dashed border pattern `4,4`.

## States

Container fill/border per state (identical logic both styles; Prominent keeps the `4,4` dash except Focus, which is a solid 2px):

| State | Fill | Border |
|---|---|---|
| Default | BG-Secondary / BG-Primary-alt | Border-Primary, 1px |
| Hover | unchanged | **Border-Accent**, 1px |
| Focus | unchanged | **Border-Accent, 2px solid** (both styles) |
| Drop (drag-over) | **BG-Accent-Primary_alt** | Border-Accent, 1px dashed (both styles) |
| Uploading | unchanged | Border-Primary, 1px |
| Error | unchanged | **Border-Error**, 1px |
| Success | unchanged | Border-Primary, 1px |
| Disabled | **BG-Disabled** | Border-Disabled, 1px |

State-specific content:

- **Form / Single busy:** the field's placeholder is replaced inline — Uploading: file name + progress bar + cancel ✕; Error: file name in Text-Error + `exclamation-circle` icon; Success: file name + tick. Browse button stays.
- **Prominent / Single busy:** the **drop zone hosts the file status** — a `File Item` instance fills the zone (16px side padding, vertically centered); zone hint and Upload button are hidden while a file is in flight.
- **Multiple busy (both styles):** field/zone stays interactive (users can add more files); below it a `Files` list stacks `File Item` rows (gap 2) capped by a `Files Summary` row.
- **Drop:** all content replaced by the "Drop here" hint, `Text/Default/*` 14px.
- **Disabled:** all text/buttons switch to disabled tokens; no pointer events.

## Sub-components

### `_File Upload / File Item` (28px row)
Props: `File Name` (text), `Status Text` (text), `Status` = Uploading | Scanning | Success | Error, `Hover`, `RTL`.

| Status | Content | Colors |
|---|---|---|
| Uploading | file icon, name, progress bar + %, cancel ✕ | name Text-Primary, % Text-Accent-Primary |
| Scanning | shield icon, name, "Scanning…" (fixed copy) | status Text-Secondary |
| Success | tick, name, remove ✕ | name Text-Primary |
| Error | error icon, name, status text (e.g. "Virus found"), retry ↻, remove ✕ | status Text-Error |

Hover=True reveals the row's hover affordances (retry/remove).

### `_File Upload / Files Summary` (28px row)
Props: `Summary Text` (e.g. "Uploading files (3 of 5)…"), `Status` = Uploading | Success | Error, `Expanded` (chevron up/down), `RTL`. Clicking toggles the file list's expand/collapse.

## Interactions

| Element | Trigger | Behavior |
|---|---|---|
| Whole field/zone | click | opens OS file picker (`<input type="file">`, `multiple` when Type=Multiple) |
| Field/zone | drag-enter | switch to Drop state; drag-leave/drop reverts |
| Field/zone | drop file(s) | validate → Uploading state |
| Browse / Upload button | click | file picker (don't double-trigger with zone click) |
| Cancel ✕ (uploading) | click | abort request, revert to Default |
| Retry ↻ (error) | click | re-attempt upload of that file |
| Remove ✕ (success/error) | click | remove file from list |
| Summary row | click | expand/collapse file list |
| Progress | while uploading | determinate bar, 0–100%; percentage label in Text-Accent-Primary |

## Content

- **File name truncation:** middle or tail ellipsis; keep the extension visible where possible. File names have a min-width so status/actions never collapse.
- **Helper text:** single line, e.g. "Only .csv files are supported" — also carries error copy in Error state (red, with icon from Helper Row's Negative variant).
- **Scanning copy is fixed** ("Scanning…"), intentionally not a prop.
- **Summary copy pattern:** "Uploading files (n of m)…" / error and success equivalents.

## Edge Cases

- **Long file names / RTL:** truncate with ellipsis; RTL mirrors the entire layout (all 64 variants exist in RTL — Arabic copy is wired through props).
- **Many files:** list is scrollable/collapsible via the Summary row; recommend collapsing after 3 visible rows.
- **Oversize / wrong type:** reject before upload → Error state with reason in helper/status text.
- **Slow connection:** progress bar stays determinate if length known, otherwise indeterminate; never hide the cancel affordance.
- **Single + new file while busy:** replace behavior — cancel current upload first or block until finished (block recommended).

## Accessibility

- Root is a labelled group; underlying control is a real `<input type="file">` (visually hidden) so keyboard and screen readers get native semantics.
- Zone/field: `role="button"` semantics via the input's label; `aria-describedby` → helper row text.
- Focus state (2px accent border) matches keyboard focus; focus order: field/zone → each file row's actions → summary toggle.
- Progress: `role="progressbar"` with `aria-valuenow`; announce state changes via `aria-live="polite"` ("Upload complete", "Upload failed — virus found").
- Buttons (cancel/retry/remove) need `aria-label`s including the file name ("Remove repository.fon").
- Drop interaction must have a click-to-browse equivalent (it does — the whole zone is clickable).

## Motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Border/fill state changes | hover/drag | color transition | 150ms | ease |
| Progress bar | upload progress | width transition | 200ms | linear |
| File list expand/collapse | summary click | height + fade | 200ms | ease-in-out |

## Implementation Notes (web component)

- Follow the light-DOM `ds-*` pattern (`ds-file-upload`), reuse `ds-button`, `ds-progress`, existing icon sprite (`tick`, `exclamation-circle`, `cancel`, `file`, `shield`, `refresh`, `chevron-up/down`, `upload`).
- Helper row = same markup pattern as other field helper rows (shared with radio/checkbox) — don't fork a new helper style.
- In Prominent/Single busy states the file item fills the zone height with centered content — implement as flex-center inside the zone rather than a fixed 28px row.
