# Inline Alert Message

An Inline Alert Message is a semantic banner that communicates status information within the page flow — below a form, inside a card, or at the top of a panel. It supports five semantic types (Info, Success, Warning, Error, Neutral), two visual weights (Subtle and Intense), optional title, description, action link, and dismiss control, with full RTL support.

**Figma source:** [UEMS Design System 3.0 — Inline Alert Message page](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17096-1024469)  
**Component node:** `17096:1024469` (Inline Alert Message component set)  
**Last updated:** 2026-04-15

---

## Anatomy

**Default — Subtle, LTR (all elements visible)**
```
┌─ Inline Alert ─────────────────────────────────────────────────┐
│  ⓘ  Alert Title                                            ✕   │
│     This is a description of the alert message that            │
│     provides additional context for the user.                  │
│     ↗ Action                                                    │
└────────────────────────────────────────────────────────────────┘
```

**Intense style**
```
┌─ Inline Alert (solid fill) ────────────────────────────────────┐
│  ⓘ  Alert Title                                            ✕   │
│     This is a description of the alert message…               │
│     ↗ Action                                                    │
└────────────────────────────────────────────────────────────────┘
```

**RTL layout (right-to-left)**
```
┌─────────────────────────────────────────────── Inline Alert ───┐
│  ✕  عنوان التنبيه                                            ⓘ  │
│     هذا وصف لرسالة التنبيه يوفر سياقًا إضافيًا للمستخدم.       │
│                                                    إجراء ↗      │
└────────────────────────────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Status Icon** | 20×20 px semantic icon indicating alert type (info / check / warning / error). Instance-swappable. Toggled by `Show Icon`. |
| **Title** | Primary alert heading. 14 px / Semibold. Colour varies per `Type` in Subtle; white/black in Intense. Toggled by `Show Title`. |
| **Description** | Supporting body text below the title. 12 px / Regular. Toggled by `Show Description`. |
| **Action Link** | Inline TextLink (Standalone, Primary, Small). Instance-swappable. Toggled by `Show Action`. |
| **Dismiss Icon** | 16×16 px close/X icon in the top-right corner. Instance-swappable. Toggled by `Show Dismiss`. |
| **Container** | Full-width banner with 8 px corner radius, 12 px T/B padding, 16 px L/R padding. Background fills the full component width. |

> The component structure includes a 3 px wide **Accent Bar** rectangle layer (left edge vertical rule) that is present in the layer tree but **not visible** in any of the 20 variants. Do not implement it in code.

---

## Variants

### Style

| Value | Description |
|---|---|
| `Subtle` | Light tinted background per semantic type. Title uses a type-matched colour token. Description uses `Text-Primary`. |
| `Intense` | Full solid-colour background per type. All foreground text is white (`Text/Text-White`), except Warning which uses black (`Text/Text-Black`) to maintain contrast. |

### Type

| Value | Icon | Subtle Background | Intense Background |
|---|---|---|---|
| `Info` | Info circle | `Background/BG-Accent-Primary` | `Background/BG-Accent-Secondary-Solid` |
| `Success` | Check circle | `Background/BG-Success-Primary` | `Background/BG-Success-Solid` |
| `Warning` | Warning triangle | `Background/BG-Alert-Primary` | `Background/BG-Alert-Solid` |
| `Error` | Error circle | `Background/BG-Error-Primary` | `Background/BG-Error-Solid` |
| `Neutral` | Info circle | `Background/BG-Secondary` | `Background/BG-Secondary-Solid` |

### RTL

| Value | Description |
|---|---|
| `RTL = False` | Left-to-right. Order: Status Icon → Content → Dismiss Icon. Title and description left-aligned. |
| `RTL = True` | Right-to-left. Order reversed: Dismiss Icon → Content → Status Icon. Title and description right-aligned. Arabic placeholder text used. |

---

## Variant Matrix

- **2 styles** × **5 types** × **2 directions** = **20 Inline Alert Message variants**

---

## Props / API

### Variant props

| Prop | Type | Default | Description |
|---|---|---|---|
| `style` | `'Subtle' \| 'Intense'` | `'Subtle'` | Visual weight — tinted background vs solid fill. |
| `type` | `'Info' \| 'Success' \| 'Warning' \| 'Error' \| 'Neutral'` | `'Info'` | Semantic alert type controlling background, icon, and title colour. |
| `rtl` | `boolean` | `false` | Switches to right-to-left layout. |

### Content props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"Alert Title"` | Primary alert heading text. |
| `showTitle` | `boolean` | `true` | Shows or hides the title row. |
| `description` | `string` | `"This is a description of the alert message that provides additional context for the user."` | Supporting body text below the title. |
| `showDescription` | `boolean` | `true` | Shows or hides the description text. |

### Icon props

| Prop | Type | Default | Description |
|---|---|---|---|
| `showIcon` | `boolean` | `true` | Shows or hides the left status icon. |
| `statusIcon` | `ReactNode` | Semantic icon per `type` | Instance-swap slot for the 20×20 px status icon. |
| `showDismiss` | `boolean` | `true` | Shows or hides the dismiss (×) button. |
| `dismissIcon` | `ReactNode` | Close icon | Instance-swap slot for the 16×16 px dismiss icon. |
| `onDismiss` | `() => void` | — | Callback fired when the dismiss icon is clicked. |

### Action props

| Prop | Type | Default | Description |
|---|---|---|---|
| `showAction` | `boolean` | `true` | Shows or hides the action link. |
| `action` | `ReactNode` | `<TextLink>` (Standalone / Primary / Small) | Instance-swap slot — replace with any link or button component. |

---

## Design Tokens

### Subtle — Background tokens

| Type | Background Token |
|---|---|
| Info | `Background/BG-Accent-Primary` |
| Success | `Background/BG-Success-Primary` |
| Warning | `Background/BG-Alert-Primary` |
| Error | `Background/BG-Error-Primary` |
| Neutral | `Background/BG-Secondary` |

### Intense — Background tokens

| Type | Background Token |
|---|---|
| Info | `Background/BG-Accent-Secondary-Solid` |
| Success | `Background/BG-Success-Solid` |
| Warning | `Background/BG-Alert-Solid` |
| Error | `Background/BG-Error-Solid` |
| Neutral | `Background/BG-Secondary-Solid` |

### Text colours — Subtle

| Element | Info | Success | Warning | Error | Neutral |
|---|---|---|---|---|---|
| Title | `Text/Text-Accent-Link` | `Text/Text-Success` | `Text/Text-Alert` | `Text/Text-Error` | `Text/Text-Primary` |
| Description | `Text/Text-Primary` | `Text/Text-Primary` | `Text/Text-Primary` | `Text/Text-Primary` | `Text/Text-Secondary` |

### Text colours — Intense

| Element | Info | Success | Warning | Error | Neutral |
|---|---|---|---|---|---|
| Title | `Text/Text-White` | `Text/Text-White` | `Text/Text-Black` | `Text/Text-White` | `Text/Text-White` |
| Description | `Text/Text-White` | `Text/Text-White` | `Text/Text-Black` | `Text/Text-White` | `Text/Text-White` |

> Warning Intense uses `Text/Text-Black` for both title and description because the amber/yellow background (`BG-Alert-Solid`) does not provide sufficient contrast for white text.

### Spacing tokens

| Token | Value | Usage |
|---|---|---|
| `spacing/12` | 12 px | Container top / bottom padding |
| `spacing/16` | 16 px | Container left / right padding |
| `spacing/12` | 12 px | Gap between Status Icon, Content, and Dismiss Icon (horizontal) |
| `spacing/4` | 4 px | Gap between Title, Description, and Action Link (vertical stack inside Content) |

---

## Typography

| Element | Font | Size | Weight | Line Height | Token |
|---|---|---|---|---|---|
| Title | Zoho Puvi | 14 px | Semibold (600) | 20 px | `Text/Default/SemiBold` |
| Description | Zoho Puvi | 12 px | Regular (400) | 16 px | `Text/small/Regular` |
| Action Link | Zoho Puvi | 12 px | Medium (500) | — | Via `TextLink` component |

---

## Sizing Reference

| Property | Value |
|---|---|
| Component width | 400 px canvas / `width: 100%` in code |
| Height | Auto — hugs content |
| Typical height (all elements shown, LTR) | ~104 px |
| Typical height (all elements shown, RTL) | ~88 px |
| Container padding top / bottom | 12 px |
| Container padding left / right | 16 px |
| Corner radius | 8 px |
| Status Icon size | 20 × 20 px |
| Dismiss Icon size | 16 × 16 px |
| Icon → Content → Dismiss gap | 12 px |
| Title → Description → Action gap | 4 px |

> All widths in the Figma canvas are fixed at 400 px. In code, use `width: 100%` so the alert fills its container.

---

## RTL Notes

In RTL mode:
- The child order is **reversed**: Dismiss Icon → Content → Status Icon (right-to-left reading order).
- Title and description text alignment changes to `text-align: right`.
- Arabic placeholder text is used in the Figma component (`عنوان التنبيه` for the title, `هذا وصف لرسالة التنبيه…` for the description, `إجراء` for the action).
- Set `dir="rtl"` on the component or its page container in code.

---

## Usage

### When to use

- To **communicate a status or feedback message** directly within the page content flow — below a form field group, inside a card, or at the top of a panel.
- Use `Info` for neutral guidance, tips, or informational notices that don't require immediate action.
- Use `Success` to confirm a completed action or successful state within a page region.
- Use `Warning` when the user should be aware of a potential issue or proceed with caution.
- Use `Error` to report a validation failure, a blocked action, or a critical problem that must be resolved.
- Use `Neutral` for low-priority messages that do not map to a specific semantic state.
- Use `Subtle` (default) for most in-page messages — it integrates with the content without dominating it.
- Use `Intense` when the message demands immediate visual priority, such as a blocking error in a form or a time-sensitive warning.
- Show `Show Action` when there is a direct resolution step the user can take (e.g., "Retry", "View details").
- Show `Show Dismiss` when the message is temporary or the user can safely close it.

### When not to use

- **Global/system-wide alerts** (affecting the whole application) → use a [Toast Message](./toast.md) or a page-level banner.
- **Field-level validation messages** (inline below a single input) → use the form field's built-in helper/error text.
- **Transient confirmations** that auto-dismiss after a few seconds → use [Toast Message](./toast.md).
- **Blocking modal errors** that require acknowledgement before the user can proceed → use a [Dialog / Modal](./dialog.md).
- **Progress or loading states** → use [Progress Bar](./progress-bar.md) or a loading indicator.

### Do / Don't

| Do | Don't |
|---|---|
| Use `Subtle` for most inline notifications — it fits naturally within page content | Default to `Intense` for all alerts — reserve it for high-priority messages that need to stand out |
| Match `type` to the actual semantic meaning — `Error` for failures, `Success` for completions | Use `Warning` for errors or `Info` for success — mismatched semantics confuse screen reader users |
| Keep the title concise (3–6 words: "Action Required", "Upload Failed") | Write a full sentence as the title — use `description` for longer explanatory text |
| Use `description` to provide context and explain next steps | Show only a title with no description when the situation requires explanation |
| Use `Show Action` to link directly to the resolution ("Retry", "View error details") | Put unrelated page-level actions in the alert action slot |
| Use `Show Dismiss` for temporary, non-critical messages the user can safely ignore | Hide the dismiss button on critical blocking errors the user must resolve |
| Use `RTL=True` for right-to-left pages; set `dir="rtl"` on the container | Manually mirror layout with CSS overrides when the RTL variant is available |
| Stack multiple alerts when multiple distinct issues need reporting | Repeat the same message type in consecutive banners — consolidate if possible |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **ARIA role** | Render as `role="alert"` for Error/Warning (live region announced immediately) or `role="status"` for Info/Success/Neutral (polite announcement). |
| **Live region** | `aria-live="assertive"` for Error and Warning alerts; `aria-live="polite"` for Info, Success, and Neutral. |
| **Icon** | The status icon is decorative — mark it `aria-hidden="true"`. The semantic meaning is conveyed by the title and `role`. |
| **Dismiss button** | The dismiss icon must have a descriptive accessible name: `aria-label="Dismiss alert"` or equivalent. |
| **Action link** | The action label "Action" alone may be ambiguous — use `aria-label="[Action description] in [section context]"` if needed. |
| **Contrast — Subtle** | `Text/Text-Accent-Link` on `BG-Accent-Primary`, `Text/Text-Success` on `BG-Success-Primary`, etc., must meet WCAG AA 4.5:1 for normal text. |
| **Contrast — Intense** | White text on coloured backgrounds (`BG-Accent-Secondary-Solid`, `BG-Success-Solid`, `BG-Error-Solid`) must meet WCAG AA. Warning Intense uses black text on amber — verify contrast. |
| **Keyboard** | If `Show Dismiss` is true, the dismiss button must be reachable via `Tab` and activatable with `Enter` / `Space`. Action link must also be keyboard-accessible. |
| **RTL** | Set `dir="rtl"` on the section container or `<html>` — the component's reversed child order already handles the visual flip. |
| **Dynamic injection** | When an alert appears dynamically (e.g., after form submission), inject it into a live region container already in the DOM so screen readers detect the change. |

---

## Code Examples

### Info — Subtle (default)

```tsx
<InlineAlert
  type="Info"
  title="Sync in progress"
  description="Your data is being synchronised. This may take a few minutes."
/>
```

### Success — Subtle with action

```tsx
<InlineAlert
  type="Success"
  title="Changes saved"
  description="Your profile has been updated successfully."
  showAction
  action={<TextLink href="/profile">View profile</TextLink>}
/>
```

### Warning — Subtle, no dismiss

```tsx
<InlineAlert
  type="Warning"
  title="Storage almost full"
  description="You have used 90% of your available storage. Free up space to avoid interruptions."
  showDismiss={false}
  showAction
  action={<TextLink href="/storage">Manage storage</TextLink>}
/>
```

### Error — Intense, blocking

```tsx
<InlineAlert
  type="Error"
  style="Intense"
  title="Upload failed"
  description="The file could not be uploaded due to a network error. Please try again."
  showDismiss={false}
  showAction
  action={<TextLink onClick={retryUpload}>Retry upload</TextLink>}
/>
```

### Neutral — title only

```tsx
<InlineAlert
  type="Neutral"
  title="No results found"
  showDescription={false}
  showAction={false}
/>
```

### Info — Intense

```tsx
<InlineAlert
  type="Info"
  style="Intense"
  title="Maintenance scheduled"
  description="The system will be unavailable on Saturday 18 Apr from 02:00–04:00 UTC."
  showAction
  action={<TextLink href="/status">View status page</TextLink>}
/>
```

### Custom dismiss handler

```tsx
<InlineAlert
  type="Warning"
  title="Browser unsupported"
  description="Some features may not work correctly in your current browser."
  showDismiss
  onDismiss={() => dismissBrowserWarning()}
/>
```

### RTL

```tsx
<InlineAlert
  type="Info"
  title="عنوان التنبيه"
  description="هذا وصف لرسالة التنبيه يوفر سياقًا إضافيًا للمستخدم."
  rtl
/>
```

### With custom status icon

```tsx
<InlineAlert
  type="Info"
  title="New feature available"
  description="Try the redesigned dashboard for a faster experience."
  showIcon
  statusIcon={<Icon name="sparkle" size={20} aria-hidden />}
  showAction
  action={<TextLink href="/dashboard/new">Try it now</TextLink>}
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Toast Message](./toast.md) | Transient system-level notifications that auto-dismiss; triggered by background events, not inline content |
| [Section Header](./section-header.md) | Labelling a content group — not a status or feedback message |
| [Progress Bar](./progress-bar.md) | Communicating ongoing progress of a task rather than its final status |
| [Divider](./divider.md) | Visual separation between content regions — no semantic message needed |
