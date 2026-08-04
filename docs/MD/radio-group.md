# Radio Group

A Radio Group presents a set of mutually exclusive options where users can select exactly one. It wraps individual Radio Button items under a shared group label, optional help text, and coordinated validation states.

**Figma source:** [UEMS Design System 3.0 — Radio Button page](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17901-5085)  
**Component node:** `17901:5086` (Radio Group frame) / `15771:12129` (Radio Button variants)  
**Last updated:** 2026-04-13

---

## Anatomy

**Default — Left layout (web)**
```
┌─ Radio Group ─────────────────────────────────────────────┐
│  Group Label  ⓘ                                           │
│                                                            │
│  ● Radio label    ○ Radio label    ○ Radio label           │
│                                                            │
│  ⓘ Help text                                              │
└────────────────────────────────────────────────────────────┘
```

**Special case — Top layout (constrained space / long labels)**
```
┌─ Radio Group ──────────────────────────────┐
│  Group Label  ⓘ                            │
│                                             │
│  ● Radio label   (selected)                 │
│  ○ Radio label                              │
│  ○ Radio label                              │
│                                             │
│  ⓘ Help text                               │
└─────────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Group Label** | Title for the option set. Paired with an optional info (tooltip) icon. |
| **Radio Button** | Individual selectable option. Consists of a radio control + label. |
| **Help Text** | Supplementary guidance below the options. Uses `Text/Text-Secondary` in default state, `Text/Text-Error` in error state. |

---

## Variants

### Label Position

| Value | Default? | Description |
|---|---|---|
| `Left` | **Yes (web)** | Options are laid out horizontally in a row. Default for all standard responsive web layouts. |
| `Top` | Special case | Options stack vertically below the group label. Use only when horizontal space is severely constrained, for mobile viewports, or when options have long labels that wrap. |

### Size

| Size | Radio control | Label font | Use case |
|---|---|---|---|
| `S` | 14 × 14 px | body/Small (12) | Dense layouts, data tables |
| `M` | 16 × 16 px | body/Default (14) | Standard forms (default) |
| `L` | 20 × 20 px | body/Large (16) | Comfortable / onboarding flows |
| `Mobile` | 20 × 20 px | body/Large (16) | Touch targets on mobile viewports |

> **Note (2026-06-15):** Figma `15771:12260` specs control sizes 16/20/24/20, but the component is kept at **14/16/20/20** per product preference. Colour/state token bindings (below) are synced to Figma.

### State

| State | Visual cue | Token |
|---|---|---|
| `Default` | Blue filled circle on selected item | `Background/BG-Button-Primary` |
| `Hover` | Slightly deeper border on unselected | `Border/Border-Accent` |
| `Focused` | Focus ring around radio control | `Border/Border-Accent-Focus` |
| `Disabled` | Greyed-out control + label | `Background/BG-Disabled_subtle`, `Border/Border-Disabled`, `Text/Text-Disabled` |
| `Error` | Red border + red label/help text | `Border/Border-Error`, `Text/Text-Error` |

**Selected × state nuances (verified):** Default selected → `BG-Button-Primary` disc + white dot · Hover selected → `BG-Button-Primary-Hover` (#1E52BB) · Disabled selected → `BG-Accent-Disabled` (#ABC2F1) disc + `Text-Secondary` label · Error selected → `BG-Error-Solid` (#E42527) disc.

### Direction

| Value | Description |
|---|---|
| `LTR` | Left-to-right reading order (default) |
| `RTL` | Right-to-left reading order (Arabic, Hebrew, etc.) — controlled via `RTL Layout` variable collection |

---

## Variant Matrix

The full component set covers all combinations of:

- **Label position** × **Size** × **State** × **Direction**  
  → `2 positions × 3 sizes × 3 states × 2 directions = 36 Radio Group variants`

- Individual **Radio Button** variants:  
  → `4 sizes × 5 states × 2 selection states × 2 directions = 80 Radio Button variants`

---

## Props / API

### Radio Group

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Group label text displayed above/beside the options. |
| `labelPosition` | `'top' \| 'left'` | `'left'` | Controls the layout axis of the options relative to the label. `'left'` is the default for responsive web; use `'top'` only for special cases (mobile viewports, very long option labels). |
| `size` | `'S' \| 'M' \| 'L' \| 'Mobile'` | `'M'` | Applies consistent sizing across all child radio buttons. |
| `state` | `'default' \| 'error' \| 'disabled'` | `'default'` | Validation or interaction state of the entire group. |
| `helpText` | `string` | — | Supplementary text shown below the options. Turns red on `error`. |
| `showInfoIcon` | `boolean` | `false` | Shows an info tooltip icon next to the group label. |
| `rtl` | `boolean` | `false` | Switches to right-to-left layout mode. |
| `value` | `string` | — | The `value` of the currently selected option (controlled). |
| `defaultValue` | `string` | — | Initially selected value (uncontrolled). |
| `onChange` | `(value: string) => void` | — | Callback fired when the user changes selection. |
| `name` | `string` | — | HTML `name` attribute shared by all radio inputs in the group. |

### Radio Button (individual item)

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Visible label for this option. |
| `value` | `string` | — | Value submitted / passed to `onChange` when this option is selected. |
| `size` | `'S' \| 'M' \| 'L' \| 'Mobile'` | Inherited from group | Override size for a single item. |
| `disabled` | `boolean` | `false` | Disables only this option within the group. |
| `rtl` | `boolean` | Inherited from group | Override direction for a single item. |

---

## Design Tokens

| Token | Role |
|---|---|
| `Background/BG-Button-Primary` | Selected radio fill (blue disc) |
| `Background/BG-Button-Primary-Hover` | Selected + hover disc (#1E52BB) |
| `Background/BG-Disabled_subtle` | Disabled radio fill (#F0F2F5) |
| `Background/BG-Accent-Disabled` | Disabled **selected** disc (#ABC2F1) |
| `Background/BG-Error-Solid` | Error **selected** disc (#E42527) |
| `Border/Border-Primary` | Unselected radio ring (#B4BBCC) |
| `Border/Border-Accent` | Hover radio ring / selected card border |
| `Border/Border-Accent-Focus` | Focus ring |
| `Border/Border-Error` | Error state border |
| `Border/Border-Disabled` | Disabled radio border |
| `Text/Text-Primary` | Group label and option label (default) |
| `Text/Text-Secondary` | Help text (default) / disabled-selected label |
| `Text/Text-Disabled` | Label colour in disabled state |
| `Text/Text-Error` | Label + help text in error state |
| `Text/Text-Accent-Link` | Card-variant per-option help icon (#006AFF) |
| `Background/BG-Accent-Primary-Subtle` | Selected **card** fill (#F0F4FD) |
| `Background/BG-Secondary` | Unselected **card** fill (#F0F2F5) |
| `Border/Icon/Icon-Tertiary` | Group info icon (#55607A) |
| `spacing/8px` | Gap between radio control and label (S/M/L; Mobile = 12px) |
| `spacing/16px` | Gap between radio options (Left layout) |
| `10px` | Gap between radio options (Top layout) |

### Group label / helper typography (doc-completeness, verified in Figma)

| Element | Token | Size |
|---|---|---|
| Group label | `Text/Special-Sizes/small-13/SemiBold` | 13 px SemiBold |
| Helper row | `Text/Special-Sizes/small-11/Regular` | 11 px Regular |

> Help-icon size: the group node exposes only `iconSize.small = 12`; the radio help icon renders at a fixed small size rather than scaling per control size.

---

## Card variant (codebase extension)

Each option renders as a selectable card — neutral grey when unselected, accent tint + accent border when selected. Uses design-system tokens only.

```html
<ds-radio-group variant="card" name="verdict"></ds-radio-group>
```
```js
group.options = [
  { value: 'tp', label: 'True Positive',  selected: true, info: 'Correctly flagged as a real threat.' },
  { value: 'fp', label: 'False Positive', info: 'Flagged but actually benign.' },
];
```

| Part | Unselected | Selected |
|---|---|---|
| Card fill | `BG-Secondary` (#F0F2F5) | `BG-Accent-Primary-Subtle` (#F0F4FD) |
| Card border | transparent (hover → `Border-Accent-Subtle`) | `Border-Accent` (#006AFF) |
| Per-option help icon | `info-circle` in `Text-Accent-Link` (#006AFF), tooltip from `option.info` | same |

---

## Usage

### When to use

- When the user must choose **exactly one** option from a small, finite list (2–6 options).
- When all options need to be visible at once without interaction (cf. Select / Dropdown which hides options).
- For settings or configuration screens where the full set of choices is informative.

### When not to use

- **Multiple selections** → use Checkbox Group.
- **Long lists (7+)** → use Select Box to save vertical space.
- **Binary yes/no with immediate effect** → use Toggle.
- **Yes/No inside a form** → a single Checkbox may suffice.

### Do / Don't

| Do | Don't |
|---|---|
| Use a concise group label that frames the decision | Leave the group unlabelled |
| Always pre-select a sensible default when one exists | Leave all options unselected if a default makes sense |
| Use `Left` layout (default) for standard web forms | Switch to `Top` layout only when labels are very long or horizontal space is unavailable |
| Show an error state + help text together | Show only a red border without explaining what went wrong |
| Keep option labels to 1–4 words | Write full sentences as radio labels |
| Group semantically related options together | Mix unrelated options in a single group |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **ARIA role** | Wrap with `<fieldset>` + `<legend>` (or `role="radiogroup"` + `aria-labelledby`) |
| **Keyboard navigation** | `Tab` moves focus into the group; `Arrow` keys move between options; `Space` selects focused option |
| **Focus visible** | Focus ring uses `Border/Border-Accent-Focus` token — must remain visible and not rely on colour alone |
| **Disabled state** | Set `disabled` attribute on `<input type="radio">`; do not use `aria-disabled` alone |
| **Error state** | Associate help text via `aria-describedby` on the group or on each input |
| **Screen reader** | Each option reads as: "[Label], radio button, [N] of [total], [group label]" |
| **Contrast** | Label text on white background must meet WCAG AA (4.5:1). `Text/Text-Primary` ≥ 4.5:1 in both Light and Dark themes. |
| **RTL** | Control and label swap sides automatically; `dir="rtl"` on a parent element is sufficient |

---

## Code Examples

### Basic usage — Left layout (default, web)

```tsx
{/* labelPosition defaults to "left" — no need to set it explicitly */}
<RadioGroup
  label="Notification frequency"
  defaultValue="daily"
  helpText="We'll send alerts based on this preference."
>
  <RadioButton value="realtime" label="Real-time" />
  <RadioButton value="daily"    label="Daily digest" />
  <RadioButton value="weekly"   label="Weekly summary" />
</RadioGroup>
```

### Error state

```tsx
<RadioGroup
  label="Assign to"
  state="error"
  helpText="Please select an assignee before submitting."
>
  <RadioButton value="me"   label="Me" />
  <RadioButton value="team" label="My team" />
  <RadioButton value="all"  label="Everyone" />
</RadioGroup>
```

### Top layout (special case — constrained space or long labels)

```tsx
{/* Use labelPosition="top" only when horizontal space is unavailable
    or option labels are long enough to cause wrapping in Left layout */}
<RadioGroup
  label="Select your preferred data export format"
  labelPosition="top"
  size="M"
  defaultValue="csv"
>
  <RadioButton value="csv"  label="CSV — Comma-separated values" />
  <RadioButton value="json" label="JSON — JavaScript Object Notation" />
  <RadioButton value="xml"  label="XML — Extensible Markup Language" />
</RadioGroup>
```

### RTL

```tsx
<RadioGroup label="الحجم" rtl defaultValue="m">
  <RadioButton value="s" label="صغير" />
  <RadioButton value="m" label="متوسط" />
  <RadioButton value="l" label="كبير" />
</RadioGroup>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Checkbox](./checkbox.md) | Multiple selections allowed |
| [Select Box](./select-box.md) | 7+ options; space is constrained |
| [Toggle](./toggle.md) | Binary on/off with immediate effect |
| [Radio Button](./radio-button.md) | Using a single radio control outside a group |
