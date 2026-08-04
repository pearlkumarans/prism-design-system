# Empty State

An Empty State is a centred message shown when a page, panel, or data surface has **no content yet**. It communicates the absence, explains the feature in one or two sentences, and offers a clear next action. The default layout stacks an illustration, title, description (with optional inline link), primary / secondary action buttons, and an optional **"Supported" row** listing platform / OS icons.

**Figma source:** [UEMS Design System 3.0 — Empty State](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=10208-202426)
**Component node:** `10208:202426` (Empty State component set)
**Last updated:** 2026-04-20

---

## Anatomy

```
┌─ Empty State ───────────────────────────────────────────────────────┐
│                                                                     │
│                        ┌───────────────────┐                        │
│                        │        ✧           │                        │
│                        │   🖥   📱   🛡✓     │  ← Illustration        │
│                        │                   │                        │
│                        └───────────────────┘                        │
│                                                                     │
│             Explore a diverse array of configurations               │ ← Title
│                                                                     │
│    Configurations helps you manage applications, system settings,    │ ← Description
│      and security policies across your network and so on. Learn more│   (+ inline link)
│                                                                     │
│                ┌─────────────────────┐  ┌─────────────┐             │
│                │ Create Configuration│  │ Learn more  │             │ ← Primary + Secondary
│                └─────────────────────┘  └─────────────┘             │
│                                                                     │
│                  Supported   ▦  🍎  🐧                              │ ← Supported row
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Illustration** | Centred decorative spot illustration (~200 × 160 px) that communicates the feature theme. Swappable via the `illustration image` instance-swap slot. Toggleable via `Illustration image = true/false`. |
| **Title** | Primary headline — one sentence, action-oriented. Semibold 16 px, `Text-Primary`. |
| **Description** | Supporting paragraph, 1–2 sentences. 14 px, `Text-Secondary`. May contain an inline **"Learn more"** link. |
| **Primary Action** | Solid brand button — the one thing users should do next (`Create Configuration`, `Add item`, `Invite teammate`). Toggleable via `Show Primary Action`. |
| **Secondary Action** | Subtle/ghost button for alternatives (`Learn more`, `View docs`). Toggleable via `Show Secondary Action`. |
| **Supported Row** | `"Supported"` label + up to 3 OS / platform icons (Windows, macOS, Linux, Android, iOS, Chrome OS). Toggleable via `Show Supported`. Individual icons toggleable via `Show OS Icon 1–3`. |

---

## Variants

### RTL

| Value | Description |
|---|---|
| `False` | Left-to-right reading order (default). Primary button sits to the left of the secondary button. |
| `True` | Right-to-left layout (Arabic, Hebrew). Text aligns right, the button cluster mirrors (primary on the right), the "Supported" row and OS icons mirror. |

### Variant Matrix

- **2 directions** × 2 illustration toggles × 2 supported toggles × 2 primary × 2 secondary = configurable at runtime. The Figma set ships **2 variants** (one per direction).

---

## Component Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `Illustration image` | `boolean` | `true` | Show or hide the illustration block. |
| `illustration image` (swap) | `instance swap` | Default illustration | Swap the illustration asset for a feature-specific spot illustration. |
| `Title` | `text` | `"Explore a diverse array of configurations"` | Primary headline. |
| `Description` | `text` | `"Configurations helps you manage applications, system settings, and security policies across your network and so on. Learn more"` | Supporting paragraph. Include inline `Learn more` link text when relevant. |
| `Show Primary Action` | `boolean` | `true` | Show the primary button. |
| `Primary Label` | `text` | `"Create Configuration"` | Primary button label. |
| `Show Secondary Action` | `boolean` | `true` | Show the secondary button. |
| `Secondary Label` | `text` | `"Learn more"` | Secondary button label. |
| `Show Supported` | `boolean` | `true` | Show the `"Supported"` label + OS icon row. |
| `Show OS Icon 1` / `2` / `3` | `boolean` | `true` | Toggle individual OS / platform icons. |
| `OS Icon 1` / `2` / `3` (swap) | `instance swap` | Windows / macOS / Linux | Swap each OS icon slot for a different platform glyph. |

---

## Props / API

### Empty State

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Primary headline text. |
| `description` | `string \| ReactNode` | — | Supporting text. Pass a React node to embed inline links. |
| `illustration` | `ReactNode` | Default illustration | Illustration asset (SVG, image, or custom component). |
| `showIllustration` | `boolean` | `true` | Show or hide the illustration block. |
| `primaryAction` | `{ label: string; onClick: () => void; href?: string }` | — | Primary action. Rendered as a solid `Button`. |
| `secondaryAction` | `{ label: string; onClick: () => void; href?: string }` | — | Secondary action. Rendered as a subtle / ghost `Button`. |
| `showPrimaryAction` | `boolean` | `true` | Show the primary button. |
| `showSecondaryAction` | `boolean` | `true` | Show the secondary button. |
| `supportedPlatforms` | `Platform[]` | `[]` | Platforms to display in the Supported row. Each `Platform = { id, icon, label }`. |
| `supportedLabel` | `string` | `"Supported"` | Label preceding the icon cluster. |
| `showSupported` | `boolean` | `true` | Show or hide the Supported row. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Overall scale — `sm` for card/drawer, `md` for panel, `lg` for full-page. |
| `rtl` | `boolean` | `false` | Mirrors layout for right-to-left reading order. |
| `className` | `string` | — | Optional class hook for container overrides. |

### `Platform` shape

| Key | Type | Description |
|---|---|---|
| `id` | `string` | Unique platform id (`windows`, `macos`, `linux`, `android`, `ios`, `chromeos`). |
| `icon` | `ReactNode` | Platform icon glyph. |
| `label` | `string` | Accessible label for screen readers (e.g. `"Windows"`). |

---

## Design Tokens

### Colour

| Token | Role |
|---|---|
| `Background/BG-Primary-alt` | Surface background (the page or panel behind the empty state) |
| `Text/Text-Primary` | Title |
| `Text/Text-Secondary` | Description |
| `Text/Text-Link` | Inline `Learn more` link; secondary link-style action |
| `Text/Text-Tertiary` | `"Supported"` label |
| `Border/Icon/Icon-Tertiary` | OS / platform glyphs |

Buttons inherit the standard [Button](./button.md) tokens — primary uses `Background/BG-Brand-Solid` + `Text/Text-Inverse`, secondary uses the subtle variant.

### Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing/8` | 8 px | Title ↔ description gap; between supported label and icons |
| `spacing/12` | 12 px | Primary ↔ secondary button gap; between OS icons |
| `spacing/16` | 16 px | Description ↔ action row gap; action row ↔ supported row gap |
| `spacing/24` | 24 px | Illustration ↔ title gap |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `border-radius/radius-6` | 6 px | Button corners (inherited from Button) |

---

## Typography

| Element | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| Title | Zoho Puvi | 16 px | Semibold (600) | 24 px |
| Description | Zoho Puvi | 14 px | Regular (400) | 20 px |
| Inline link | Zoho Puvi | 14 px | Medium (500) | 20 px |
| Primary / Secondary button label | Zoho Puvi | 14 px | Medium (500) | 20 px |
| Supported label | Zoho Puvi | 13 px | Regular (400) | 20 px |

---

## Spacing & Sizing Reference

| Property | Value |
|---|---|
| Illustration size (md) | ~200 × 160 px |
| Illustration size (sm) | ~120 × 96 px |
| Illustration size (lg) | ~280 × 220 px |
| Max text width | **480 px** (keeps description to ~2 lines at md) |
| Title ↔ description gap | 8 px |
| Illustration ↔ title gap | 24 px |
| Description ↔ actions gap | 16 px |
| Actions ↔ supported row gap | 16 px |
| Primary ↔ secondary button gap | 12 px |
| OS icon size | 16 × 16 px |
| OS icon ↔ icon gap | 12 px |
| Horizontal alignment | Centred |
| Container horizontal padding | 24 px (inherits panel padding) |

---

## Usage

### When to use

- A **list, table, or grid** has no items yet for a first-time user ("no configurations yet").
- A **search / filter result** is empty ("no matches for 'xyz'").
- A **feature** is available but not yet activated ("enable single sign-on to continue").
- A **permission-gated view** has nothing to show for the current role.

Always pair an empty state with **at least one path forward** — create something, adjust filters, request access, read more.

### When not to use

- **Loading** — use a skeleton / spinner, not an empty state.
- **Error** — use [Inline Alert Message](./inline-alert-message.md) or a dedicated error state.
- **Intermediate zero-results** inside a complex filter UI where the filter controls already tell the user why — a subtle inline notice is usually enough.
- **Success confirmation** after an action — use a [Toast](./toast.md).
- **First-run tutorials** — use an onboarding flow or coach marks, not an empty state.

### Content guidelines

| Element | Guidance |
|---|---|
| Title | One sentence, ≤ 50 chars. Action-oriented ("Start your first automation") or descriptive ("No configurations yet"). Avoid "There are no…". |
| Description | 1–2 sentences that explain **what the feature does** and **why the user should act**. End with a `Learn more` link when documentation exists. |
| Primary action | The single most useful next step. Prefer a verb phrase — "Create configuration", "Invite teammate", not "OK". |
| Secondary action | Optional lower-commitment alternative — `Learn more`, `View docs`, `Import`. Omit when there is nothing useful to offer. |
| Supported row | Include only when **platform compatibility materially affects the action** (agent install, OS-targeted policy). Omit for generic empty states. |

### Do / Don't

| Do | Don't |
|---|---|
| Write a specific, feature-named title ("Start your first patch job") | Write generic ("No data", "Nothing here") — wastes the opportunity |
| Pair the empty state with at least one action | Show an empty state with no clear next step |
| Use an illustration that matches the feature theme | Use a generic mascot for unrelated features |
| Keep description to ≤ 2 lines at the default size | Write a paragraph of marketing copy |
| Hide the Supported row when irrelevant | Show Windows/macOS/Linux icons on features that are OS-agnostic |
| Use the primary-button style for the **one** expected next action | Stack multiple solid primary buttons — users cannot tell which to click |
| Centre-align the block in its container | Left-align the block in a wide container — it reads as an error |
| Localise the Supported row labels | Leave OS names un-translated in Arabic/Hebrew/CJK layouts |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Landmark** | Wrap the empty state in a `role="region"` with an `aria-labelledby` pointing to the title `id`. When it replaces the main content of a page, a `<section>` with `aria-labelledby` is sufficient. |
| **Heading** | Render the title as a real heading (`<h2>` or `<h3>` depending on page hierarchy) so screen readers announce the landing. |
| **Illustration** | Decorative illustrations should have `role="img"` with `aria-label` describing the scene, or `alt=""` + `aria-hidden="true"` when purely decorative. Never leave informative illustrations un-labelled. |
| **Inline link** | The inline `Learn more` in the description is a real `<a>` with visible underline or colour and a non-colour hover affordance. |
| **Button semantics** | Actions are `<button>` for in-app commands and `<a>` for navigation. Primary and secondary must have distinct visible styles, not rely on position alone. |
| **Keyboard** | Tab order: title → inline description links → primary → secondary → supported-row icons (if interactive). All focusable elements expose a 2 px focus ring. |
| **Supported icons** | Each OS icon has `aria-label` (`"Windows"`, `"macOS"`, `"Linux"`). If the Supported row is purely decorative, set `aria-hidden="true"` on the icon cluster and keep only the label visible. |
| **Live announcement** | If the empty state appears dynamically (e.g. after applying a filter that yielded zero results), announce it via an `aria-live="polite"` region so screen-reader users hear "No matches found". |
| **Contrast** | Title (`Text-Primary`) and description (`Text-Secondary`) both meet WCAG AA 4.5:1. Link colour against background meets 4.5:1 plus a non-colour affordance. |
| **RTL** | In RTL, the action cluster mirrors (primary on the right), supported-row order reverses, illustration stays centred. Use `dir="rtl"` on the root. |

---

## Code Examples

### Default — illustration + actions + supported row

```tsx
<EmptyState
  title="Explore a diverse array of configurations"
  description={
    <>
      Configurations helps you manage applications, system settings, and security
      policies across your network and so on. <a href="/docs/configurations">Learn more</a>
    </>
  }
  primaryAction={{ label: 'Create configuration', onClick: openCreate }}
  secondaryAction={{ label: 'Learn more', href: '/docs/configurations' }}
  supportedPlatforms={[
    { id: 'windows', icon: <WindowsIcon />, label: 'Windows' },
    { id: 'macos', icon: <AppleIcon />, label: 'macOS' },
    { id: 'linux', icon: <LinuxIcon />, label: 'Linux' },
  ]}
/>
```

### Minimal — no supported row, single action

```tsx
<EmptyState
  title="No matches found"
  description="Try adjusting your filters or search terms."
  primaryAction={{ label: 'Clear filters', onClick: clearFilters }}
  showSecondaryAction={false}
  showSupported={false}
/>
```

### Without illustration (compact panel)

```tsx
<EmptyState
  showIllustration={false}
  title="Invite your first teammate"
  description="Share work, assign tickets, and collaborate in real time."
  primaryAction={{ label: 'Invite teammate', onClick: openInvite }}
  size="sm"
/>
```

### Full-page (large scale)

```tsx
<EmptyState
  size="lg"
  title="Start your first patch job"
  description="Automate updates across Windows, macOS, and Linux endpoints."
  primaryAction={{ label: 'Create patch job', onClick: createPatchJob }}
  secondaryAction={{ label: 'View docs', href: '/docs/patch' }}
  supportedPlatforms={supportedOs}
/>
```

### Dynamic zero-results (announced)

```tsx
<div role="region" aria-live="polite" aria-label="Search results">
  {results.length === 0 && (
    <EmptyState
      title={`No results for "${query}"`}
      description="Try different keywords or clear active filters."
      primaryAction={{ label: 'Clear filters', onClick: clearFilters }}
      showSecondaryAction={false}
      showSupported={false}
    />
  )}
</div>
```

### Custom illustration

```tsx
<EmptyState
  illustration={<img src="/illustrations/automation.svg" alt="" />}
  title="Automate repeat work"
  description="Create rules that trigger on schedule, status change, or file event."
  primaryAction={{ label: 'Create automation', onClick: createAutomation }}
/>
```

### RTL (Arabic)

```tsx
<EmptyState
  rtl
  title="استكشف مجموعة متنوعة من التكوينات"
  description="تساعدك التكوينات في إدارة التطبيقات وإعدادات النظام وسياسات الأمان عبر شبكتك وما إلى ذلك."
  primaryAction={{ label: 'إنشاء تكوين', onClick: openCreate }}
  secondaryAction={{ label: 'اعرف المزيد', href: '/docs/configurations' }}
  supportedLabel="مدعوم"
  supportedPlatforms={supportedOs}
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Inline Alert Message](./inline-alert-message.md) | Error or warning state — not "no content yet" |
| [Toast](./toast.md) | Transient success / info confirmation after an action |
| [Data Table](./data-table.md) | Pass the empty-state content to `emptyState` prop for a clean fallback inside the table |
| [Button](./button.md) | Primitive for primary / secondary actions inside the empty state |
