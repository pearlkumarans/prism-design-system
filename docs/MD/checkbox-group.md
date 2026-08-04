# Checkbox Group

A Checkbox Group presents a set of options where users can select **one or more** items simultaneously. It wraps individual Checkbox items under a shared group label, optional help text, and coordinated validation states.

**Figma source:** [UEMS Design System 3.0 — Check box page](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17918-385584)  
**Component node:** `17918:385584` (Checkbox Group component set)  
**Last updated:** 2026-04-13

---

## Anatomy

**Default — Left layout (web)**
```
┌─ Checkbox Group ───────────────────────────────────────────────────┐
│  Group Label  ⓘ        ☑ Checkbox    ☐ Checkbox    ☐ Checkbox     │
│                         ⓘ Help text                                │
└────────────────────────────────────────────────────────────────────┘
```

**Special case — Top layout (constrained space / long labels)**
```
┌─ Checkbox Group ──────────────────────────┐
│  Group Label  ⓘ                           │
│                                            │
│  ☑ Checkbox                               │
│  ☐ Checkbox                               │
│  ☐ Checkbox                               │
│                                            │
│  ⓘ Help text                              │
└────────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Group Label** | Title for the option set. Uses `Text/Text-Tertiary`. Paired with an optional info (tooltip) icon. |
| **Checkbox Item** | Individual selectable option — a square box + label. Multiple items can be checked simultaneously. |
| **Help Text** | Supplementary guidance below the options. Uses `Text/Text-Quaternary` by default, `Text/Text-Error` in error state. |
| **Counter** | Optional character/selection counter inside the Helper Row (hidden by default). |

---

## Variants

### Label Position

| Value | Default? | Description |
|---|---|---|
| `Left` | **Yes (web)** | Group label sits to the left; checkboxes are arranged horizontally in a row beside it. Default for all standard responsive web layouts. |
| `Top` | Special case | Group label sits above; checkboxes stack vertically below it. Use only when horizontal space is severely constrained, for mobile viewports, or when option labels are too long to sit comfortably in a row. |

### Size

| Size | Box | Label font | Checkbox gap | Use case |
|---|---|---|---|---|
| `Small` | 16 × 16 px, radius 4 px | body/Small/Medium (13 px) | 6 px | Dense layouts, data tables, settings panels |
| `Medium` | 20 × 20 px, radius 4 px | body/Default/Medium (14 px) | 8 px | Standard forms (default) |

### State

| State | Visual cue | Tokens |
|---|---|---|
| `Default` | Blue fill on checked box; white checkmark | `Background/BG-Button-Primary`, `Text/Text-White` |
| `Error` | Red fill on checked box; red border on unchecked; red help text | `Background/BG-Error-Solid`, `Border/Border-Error`, `Text/Text-Error` |
| `Disabled` | Greyed-out box, label, and help text; non-interactive | `Background/BG-Disabled_subtle`, `Border/Border-Disabled`, `Text/Text-Disabled` |

### Direction

| Value | Description |
|---|---|
| `RTL = False` | Left-to-right reading order (default) |
| `RTL = True` | Right-to-left layout (Arabic, Hebrew, etc.) — group label alignment and checkbox order mirror. Controlled via `RTL Layout` variable collection. |

---

## Variant Matrix

All combinations of variant axes:

- **2 label positions** × **2 sizes** × **3 states** × **2 directions** = **24 Checkbox Group variants**

Individual Checkbox item variants (sub-component):
- **2 sizes** × **2 checked states** × **2 interaction states** × **2 error states** × **2 directions** = **32 Checkbox variants**

---

## Props / API

### Checkbox Group

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `"Group Label"` | Group label text displayed beside (Left) or above (Top) the options. |
| `labelPosition` | `'left' \| 'top'` | `'left'` | Controls the layout axis. `'left'` is the default for responsive web; use `'top'` only for special cases (mobile, very long option labels, constrained width). |
| `size` | `'Small' \| 'Medium'` | `'Medium'` | Applies consistent sizing across all child checkboxes. |
| `state` | `'Default' \| 'Error' \| 'Disabled'` | `'Default'` | Validation or interaction state of the entire group. |
| `showHelpIcon` | `boolean` | `true` | Shows an info tooltip icon next to the group label. |
| `showHelperRow` | `boolean` | `true` | Shows or hides the Helper Row (help text + optional counter). |
| `helpText` | `string` | `"Help text"` | Supplementary text shown below the options. Turns red on `Error`. |
| `showCounter` | `boolean` | `false` | Displays a character/selection counter inside the Helper Row. |
| `counter` | `string` | `"0/232"` | Counter value displayed when `showCounter` is `true`. |
| `rtl` | `boolean` | `false` | Switches to right-to-left layout mode. |
| `value` | `string[]` | `[]` | Array of `value` strings for the currently checked options (controlled). |
| `defaultValue` | `string[]` | `[]` | Initially checked values (uncontrolled). |
| `onChange` | `(values: string[]) => void` | — | Callback fired when any checkbox changes selection. |
| `name` | `string` | — | HTML `name` attribute shared by all checkbox inputs in the group. |

### Checkbox (individual item)

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Visible label for this option. |
| `value` | `string` | — | Value included in the group's `value` array when checked. |
| `checked` | `'Checked' \| 'Unchecked'` | `'Unchecked'` | Selection state of this individual checkbox. |
| `size` | `'Small' \| 'Medium'` | Inherited from group | Override size for a single item. |
| `state` | `'Default' \| 'Disabled'` | Inherited from group | Disables only this item within the group. |
| `error` | `boolean` | `false` | Applies error styling to only this item. |
| `rtl` | `boolean` | Inherited from group | Override direction for a single item. |

---

## Design Tokens

| Token | Role |
|---|---|
| `Background/BG-Button-Primary` | Checked box fill (Default state) |
| `Background/BG-Error-Solid` | Checked box fill (Error state) |
| `Background/BG-Primary-alt` | Unchecked box fill |
| `Background/BG-Disabled_subtle` | Box fill (Disabled state) |
| `Text/Text-White` | Checkmark stroke (checked) |
| `Border/Border-Primary` | Unchecked box border (Default) |
| `Border/Border-Error` | Unchecked box border (Error) |
| `Border/Border-Disabled` | Box border (Disabled) |
| `Text/Text-Primary` | Checkbox label colour (Default) |
| `Text/Text-Disabled` | Label colour (Disabled state) |
| `Text/Text-Tertiary` | Group label colour |
| `Text/Text-Quaternary` | Help text colour (Default) |
| `Text/Text-Error` | Help text colour (Error state) |
| `Border/Icon/Icon-Primary` | Info icon stroke (Default) |
| `Border/Icon/Icon-Error` | Leading icon stroke in Helper Row (Error) |
| `Border/Icon/Icon-Tertiary` | Leading icon stroke in Helper Row (Default) |
| `spacing/8` | Gap between Header / Checkbox Items / Helper Row |
| `spacing/12` | Gap between individual checkbox items (vertical, Top layout) |
| `spacing/16` | Gap between individual checkbox items (horizontal, Left layout) |

---

## Spacing & Sizing Reference

| Element | Small | Medium |
|---|---|---|
| Box (checkbox square) | 16 × 16 px | 20 × 20 px |
| Box corner radius | 4 px | 4 px |
| Checkmark vector | 8 × 6 px | ~10 × 8 px |
| Box ↔ Label gap | 6 px | 8 px |
| Gap between items (Top / vertical) | 12 px | 12 px |
| Gap between items (Left / horizontal) | 16 px | 16 px |
| Header ↔ Checkbox Items gap | 8 px | 8 px |
| Header width (Left layout) | 240 px | 240 px |
| Header ↔ Body gap (Left layout) | 12 px | 12 px |
| Help icon | 20 × 20 px | 20 × 20 px |
| Leading icon (Helper Row) | 12 × 12 px | 12 × 12 px |

---

## Usage

### When to use

- When users may select **none, one, or multiple** options from a list.
- When all options should be visible simultaneously (cf. Multi-select which hides options).
- For preference, settings, or filter panels where multiple concurrent selections are valid.
- When the number of options is small enough to display inline (2–8 items).

### When not to use

- **Exactly one selection** → use Radio Group.
- **Binary on/off with immediate effect** → use Toggle.
- **Long list of options** → use Multi-select Dropdown to save space.
- **Single opt-in** (e.g. "I agree to terms") → use a standalone Checkbox, not a group.

### Do / Don't

| Do | Don't |
|---|---|
| Use `Left` layout (default) for standard web forms | Switch to `Top` layout unless horizontal space is genuinely unavailable |
| Use `Top` layout for mobile viewports or when labels are long enough to wrap | Use `Top` layout by default just because it feels familiar |
| Show a descriptive group label that frames the choices | Leave the group unlabelled |
| Use `helpText` to clarify constraints (e.g. "Select up to 3") | Leave users guessing about selection limits |
| Show an `Error` state + help text together | Show only a red border without an error message |
| Keep option labels concise (1–5 words) | Write full sentences as checkbox labels |
| Pre-check options that apply to most users as a smart default | Pre-check options for commercial/legal consent |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **ARIA role** | Wrap with `<fieldset>` + `<legend>` (or `role="group"` + `aria-labelledby`) |
| **Keyboard navigation** | `Tab` moves focus between checkboxes; `Space` toggles the focused checkbox |
| **Focus visible** | Focus ring must be visible on each checkbox; uses `Border/Border-Accent-Focus` token |
| **Disabled state** | Set `disabled` attribute on `<input type="checkbox">`; do not use `aria-disabled` alone |
| **Error state** | Associate help text via `aria-describedby` on the group or each input; pair with `aria-invalid="true"` |
| **Screen reader** | Each option reads as: "[Label], checkbox, [checked/unchecked], [group label]" |
| **Indeterminate state** | Use `aria-checked="mixed"` on a parent/select-all checkbox when only some items are checked |
| **Contrast** | Checkbox label text on white background must meet WCAG AA (4.5:1). `Text/Text-Primary` passes in both Light and Dark themes. |
| **RTL** | Control and label swap sides automatically; `dir="rtl"` on a parent element is sufficient |

---

## Code Examples

### Basic usage — Left layout (default, web)

```tsx
{/* labelPosition defaults to "left" — no need to set it explicitly */}
<CheckboxGroup
  label="Notify me about"
  defaultValue={["comments"]}
  helpText="You can change this at any time in your settings."
>
  <Checkbox value="comments"  label="Comments" />
  <Checkbox value="mentions"  label="Mentions" />
  <Checkbox value="reminders" label="Reminders" />
</CheckboxGroup>
```

### Error state

```tsx
<CheckboxGroup
  label="Required permissions"
  state="Error"
  helpText="You must grant at least one permission to continue."
>
  <Checkbox value="read"   label="Read" />
  <Checkbox value="write"  label="Write" />
  <Checkbox value="delete" label="Delete" />
</CheckboxGroup>
```

### Top layout (special case — constrained space or long labels)

```tsx
{/* Use labelPosition="top" only when horizontal space is unavailable
    or option labels are long enough to cause wrapping in Left layout */}
<CheckboxGroup
  label="Select all applicable compliance frameworks"
  labelPosition="top"
  size="Medium"
  defaultValue={[]}
>
  <Checkbox value="iso27001" label="ISO 27001 — Information Security Management" />
  <Checkbox value="soc2"     label="SOC 2 Type II — Security & Availability" />
  <Checkbox value="gdpr"     label="GDPR — General Data Protection Regulation" />
</CheckboxGroup>
```

### With counter

```tsx
<CheckboxGroup
  label="Skills"
  showCounter
  counter="2/5"
  helpText="Select up to 5 skills."
>
  <Checkbox value="design"   label="Design" />
  <Checkbox value="frontend" label="Frontend" />
  <Checkbox value="backend"  label="Backend" />
  <Checkbox value="data"     label="Data" />
  <Checkbox value="devops"   label="DevOps" />
</CheckboxGroup>
```

### RTL

```tsx
<CheckboxGroup label="الإشعارات" rtl defaultValue={["تعليقات"]}>
  <Checkbox value="تعليقات"  label="تعليقات" />
  <Checkbox value="إشارات"   label="إشارات" />
  <Checkbox value="تذكيرات"  label="تذكيرات" />
</CheckboxGroup>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Radio Group](./radio-group.md) | Exactly one selection from a list |
| [Toggle](./toggle.md) | Binary on/off with immediate effect |
| [Select Box](./select-box.md) | Long list of options; space is constrained |
| [Multiselect](./multiselect.md) | Many options with search/filter; options hidden behind a trigger |
| [Checkbox](./checkbox.md) | Single standalone checkbox outside a group |
