# Text Area

A Text Area is a multi-line text input that allows users to enter longer-form free text. It supports optional labels, placeholder text, inline tags, character counters, helper text, and validation states. Height is controlled by the `maxLines` prop.

**Figma source:** [UEMS Design System 3.0 — Text Area page](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16048-2043)  
**Component node:** `16048:2043` (Text Area component set)  
**Last updated:** 2026-04-14

---

## Anatomy

**Default — Left layout (web)**
```
┌─ Text Area ──────────────────────────────────────────────────────────────────┐
│  Label *        ┌──────────────────────────────────────────────────────────┐ │
│                 │  Placeholder / Value text                           ✕   │ │
│                 │                                                          │ │
│                 └──────────────────────────────────────────────────────────┘ │
│                 ⓘ  Help text                                       0/500   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Special case — Top layout (responsive / constrained width)**
```
┌─ Text Area ──────────────────────────────┐
│  Label *                                 │
│  ┌────────────────────────────────────┐  │
│  │  Placeholder / Value text      ✕  │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│  ⓘ  Help text                  0/500    │
└──────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Label** | Field label text. Semibold, 13 px. Toggleable via `Show Label`. |
| **Required asterisk** | Red `*` appended to the label when `Required = true`. Uses `Text/Text-Error`. |
| **Field box** | The multi-line input surface. Padding 12 px H / 8 px V, corner radius 6 px. |
| **Placeholder** | Hint text shown when the field is empty (`state = Placeholder`). |
| **Value** | Entered text shown in all non-placeholder states. |
| **Tags Container** | Optional inline tag chips inside the field (hidden by default). |
| **Clear Icon** | Optional trailing `✕` button to clear the field (hidden by default). |
| **Footer** | Row below the field containing an icon, help text, and optional counter. Toggleable via `Show Footer`. |
| **Help Text** | Contextual hint or validation message. Changes colour with `validationState`. |
| **Counter** | Character/word count display, e.g. `0/500`. Toggleable via `Show Counter`. |

---

## Variants

### Label Position

| Value | Default? | Description |
|---|---|---|
| `Left` | **Yes (web)** | Label sits to the left of the field in a horizontal row. Default for all standard responsive web layouts. Component width: **568 px** (240 px label column + 8 px gap + 320 px field). |
| `Top` | Special case | Label sits above the field in a vertical stack. Use for responsive/mobile breakpoints or when the label is too long to sit comfortably beside the field. Component width: **320 px**. |

### State

| State | Description | Border token |
|---|---|---|
| `Placeholder` | Field is empty; placeholder hint text visible | `Border/Border-Secondary` |
| `Inactive` | Field has a value but is not focused | `Border/Border-Secondary` |
| `Hover` | Cursor over the field | `Border/Border-Accent` |
| `Active` | Field is focused / being typed into | `Border/Border-Accent` (2 px stroke) |
| `Read Only` | Value is shown but not editable | `Border/Border-Disabled`, `Background/BG-Secondary-alt` |

### Disabled

| Value | Description |
|---|---|
| `False` | Field is interactive (default) |
| `True` | Field is non-interactive; all elements greyed out |

### Validation State

| Value | Visual cue | Tokens |
|---|---|---|
| `None` | No validation indicator | `Border/Border-Secondary` (default), `Text/Text-Tertiary` for help text |
| `Success` | Tick icon in footer; green help text | `Border/Border-Success`, `Text/Text-Success`, `Border/Icon/Icon-Success` |
| `Error` | Error icon in footer; red help text and border | `Border/Border-Error`, `Text/Text-Error`, `Border/Icon/Icon-Error` |

### Max Lines (Height)

The textarea height is controlled by a discrete `maxLines` variant. Each line adds 20 px (one line-height unit).

| `maxLines` | Field height | Outer height (Top) | Outer height (Left) |
|---|---|---|---|
| `2` | 56 px | 100 px | 76 px |
| `3` | 76 px | 120 px | 96 px |
| `4` | 96 px | 140 px | 116 px |
| `5` | 116 px | 160 px | 136 px |

> **Note:** There is no free-drag resize handle. Height is a discrete design-time choice via `maxLines`. At runtime, implement resizable behaviour (if needed) in code using CSS `resize: vertical` bounded by `min-height` / `max-height`.

### Direction

| Value | Description |
|---|---|
| `RTL = False` | Left-to-right reading order (default) |
| `RTL = True` | Right-to-left layout (Arabic, Hebrew, etc.) — label, field content, and footer order all mirror. Controlled via `RTL Layout` variable collection. |

---

## Variant Matrix

All combinations of variant axes:

- **2 label positions** × **5 states** × **2 disabled** × **3 validation states** × **4 max-lines** × **2 directions** = **192 Text Area variants**

---

## Props / API

### Text Area

| Prop | Type | Default | Description |
|---|---|---|---|
| `labelPosition` | `'left' \| 'top'` | `'left'` | Controls label placement. `'left'` is the default for responsive web; use `'top'` for mobile breakpoints or long labels. |
| `state` | `'Placeholder' \| 'Inactive' \| 'Hover' \| 'Active' \| 'Read Only'` | `'Placeholder'` | Interaction state of the field. Typically driven by focus/blur/value in code. |
| `isDisabled` | `boolean` | `false` | Disables the field — non-interactive, all elements greyed out. |
| `validationState` | `'None' \| 'Success' \| 'Error'` | `'None'` | Drives border colour, footer icon, and help text colour. |
| `maxLines` | `2 \| 3 \| 4 \| 5` | `2` | Sets the visible height of the textarea. Each line = 20 px. |
| `rtl` | `boolean` | `false` | Switches to right-to-left layout mode. |
| `label` | `string` | `"Label"` | Field label text. |
| `showLabel` | `boolean` | `true` | Shows or hides the label row. |
| `required` | `boolean` | `true` | Appends a red `*` to the label. |
| `placeholder` | `string` | `"Placeholder"` | Hint text shown when the field is empty. |
| `value` | `string` | `"Value"` | The current value of the textarea (controlled). |
| `showFooter` | `boolean` | `true` | Shows or hides the entire footer (help text + counter). |
| `helpText` | `string` | `"Help text"` | Contextual or validation message below the field. |
| `showCounter` | `boolean` | `true` | Shows the character/word counter in the footer. |
| `counter` | `string` | `"0/500"` | Counter display string (e.g. `"120/500"`). |
| `showClearIcon` | `boolean` | `false` | Shows a trailing `✕` button to clear the field value. |
| `showTags` | `boolean` | `false` | Shows inline tag chips inside the field. |
| `tag1` – `tag6` | `boolean` | `true` (1–3), `false` (4–6) | Visibility of each of the up to 6 tag slots. |
| `tag1Swap` – `tag6Swap` | `ReactNode` | Tag component | Instance-swap slot for each tag chip. |
| `clearIconSwap` | `ReactNode` | Icon button | Instance-swap slot for the clear icon. |
| `onChange` | `(value: string) => void` | — | Fires on every keystroke. |
| `onClear` | `() => void` | — | Fires when the clear icon is activated. |

---

## Design Tokens

### Colour

| Token | Role |
|---|---|
| `Background/BG-Primary-alt` | Field background (Default, Hover, Active, Validation states) |
| `Background/BG-Secondary-alt` | Field background (Read Only state) |
| `Background/BG-Disabled` | Field background (Disabled state) |
| `Border/Border-Secondary` | Field stroke (Placeholder, Inactive, None validation) |
| `Border/Border-Accent` | Field stroke (Hover, Active) |
| `Border/Border-Success` | Field stroke (Success validation) |
| `Border/Border-Error` | Field stroke (Error validation) |
| `Border/Border-Disabled` | Field stroke (Disabled, Read Only) |
| `Text/Text-Primary` | Input value text colour |
| `Text/Text-Placeholder` | Placeholder text colour |
| `Text/Text-Tertiary` | Label, help text (default) |
| `Text/Text-Disabled` | Label, help text, value (Disabled state) |
| `Text/Text-Error` | Required asterisk; help text (Error state) |
| `Text/Text-Success` | Help text (Success state) |
| `Text/Text-Secondary` | Counter text colour |
| `Border/Icon/Icon-Tertiary` | Footer info icon (None state) |
| `Border/Icon/Icon-Success` | Footer tick icon (Success state) |
| `Border/Icon/Icon-Error` | Footer error icon (Error state) |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing/2` | 2 px | Gap between label text and required asterisk |
| `spacing/4` | 4 px | Gap: label row ↔ body; field ↔ footer |
| `spacing/8` | 8 px | Field padding top/bottom; gap between leading and trailing areas; Left layout outer gap |
| `spacing/12` | 12 px | Field padding left/right |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `border-radius/radius-6` | 6 px | Field box all corners |

---

## Typography

| Element | Font | Size | Weight | Line Height | Token |
|---|---|---|---|---|---|
| Label | Zoho Puvi | 13 px | Semibold (600) | 20 px | `body/Small/Medium`, `Font-size/13px` |
| Required `*` | Zoho Puvi | 14 px | Medium (500) | auto | — |
| Placeholder | Zoho Puvi | 14 px | Regular (400) | 20 px | `body/Default/Regular` |
| Input value | Zoho Puvi | 14 px | Regular (400) | 20 px | `body/Default/Regular` |
| Help text | Zoho Puvi | 12 px | Regular (400) | 16 px | `body/Small/Default` |
| Counter | Zoho Puvi | 12 px | Regular (400) | 16 px | `body/Small/Default` |

---

## Spacing & Sizing Reference

| Property | Value |
|---|---|
| Field padding (horizontal) | 12 px (`spacing/12`) |
| Field padding (vertical) | 8 px (`spacing/8`) |
| Leading ↔ trailing gap inside field | 8 px (`spacing/8`) |
| Label row ↔ body gap (Top layout) | 4 px (`spacing/4`) |
| Label column ↔ body gap (Left layout) | 8 px (`spacing/8`) |
| Field ↔ footer gap | 4 px (`spacing/4`) |
| Label column width (Left layout) | 240 px |
| Field width | 320 px |
| Total width (Left layout) | 568 px |
| Total width (Top layout) | 320 px |
| Corner radius | 6 px (`border-radius/radius-6`) |
| Default border stroke | 1 px |
| Active / focused stroke | **2 px** |

---

## Usage

### When to use

- When users need to enter **multiple lines** of free text (descriptions, comments, notes, messages).
- When input length is variable and unpredictable — unlike a single-line text input.
- In forms where the length or structure of the response cannot be predicted (feedback, addresses, bio).
- When a character limit needs to be communicated via the counter.

### When not to use

- **Short, single-line input** (name, email, phone) → use [Text Input Field](./text-input-field.md).
- **Rich/formatted text** (bold, lists, links) → use [Rich Text Editor](./rich-text-editor.md).
- **Code or script input** → use [Script Editor](./script-editor.md).
- **Predefined answer choices** → use [Select Box](./select-box.md) or [Radio Group](./radio-group.md).

### Do / Don't

| Do | Don't |
|---|---|
| Use `Left` layout (default) for standard web forms | Switch to `Top` layout unless you are on a mobile/narrow breakpoint or the label is long |
| Use `Top` layout on mobile viewports or when the label exceeds ~30 characters | Default to `Top` layout on desktop just because it looks familiar |
| Size `maxLines` to match the expected content length | Always use `maxLines=2` regardless of expected input length |
| Always show a label (even visually hidden for a11y) | Rely on placeholder as the only label |
| Use `helpText` to give format hints (e.g. "Describe in 2–3 sentences") | Leave the field with no guidance when format matters |
| Show `validationState=Error` + `helpText` together | Show an error border without an accompanying message |
| Show `counter` when there is a character limit | Show a counter without a limit set in code |
| Use `showClearIcon=true` for long-form fields where clearing is valuable | Show clear icon on short, single-line-height fields |
| Keep required fields marked with `required=true` | Use asterisks inconsistently across a form |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Element** | Use `<textarea>` — never a `<div contenteditable>` |
| **Label association** | Connect `<label for="id">` to `<textarea id="id">`, or use `aria-labelledby` |
| **Required** | Set `required` / `aria-required="true"` on the `<textarea>`; the visual `*` alone is not sufficient |
| **Validation** | Set `aria-invalid="true"` on the `<textarea>` in Error state; link error message via `aria-describedby` |
| **Read Only** | Use `readonly` attribute; inform screen readers with `aria-readonly="true"` |
| **Disabled** | Use `disabled` attribute; disabled fields are not focusable (remove from tab order) |
| **Keyboard** | `Tab` moves focus into the field; `Shift+Tab` moves out; standard text-editing keys apply inside |
| **Counter** | Associate counter text with the field via `aria-describedby` so screen readers announce remaining characters |
| **Resize** | If resizable at runtime, ensure resize handle is keyboard-accessible or document the fixed height |
| **Contrast** | Placeholder text (`Text/Text-Placeholder`) must meet WCAG AA 4.5:1 against `Background/BG-Primary-alt` |
| **Focus ring** | Active state 2 px `Border/Border-Accent` stroke must be visible and not rely on colour alone |
| **RTL** | Set `dir="rtl"` on the `<textarea>` or a parent; `text-align: right` applies automatically |

---

## Code Examples

### Basic usage — Left layout (default, web)

```tsx
{/* labelPosition defaults to "left" — no need to set it explicitly */}
<TextArea
  label="Description"
  placeholder="Enter a brief description…"
  helpText="Maximum 500 characters."
  showCounter
  counter="0/500"
  maxLines={3}
  required
/>
```

### Error state

```tsx
<TextArea
  label="Reason for request"
  validationState="Error"
  helpText="Please provide a reason before submitting."
  required
  maxLines={3}
/>
```

### Success state

```tsx
<TextArea
  label="Bio"
  validationState="Success"
  helpText="Looks good!"
  value="Product designer with 8 years of experience."
  maxLines={3}
/>
```

### Read Only

```tsx
<TextArea
  label="Previous notes"
  state="Read Only"
  value="Reviewed and approved by team lead on 2026-03-15."
  showClearIcon={false}
  maxLines={4}
/>
```

### Top layout (special case — responsive / mobile / long label)

```tsx
{/* Use labelPosition="top" for mobile breakpoints or labels longer than ~30 chars */}
<TextArea
  labelPosition="top"
  label="Describe the business impact of this change request"
  placeholder="Include affected systems, teams, and timelines…"
  helpText="Be as specific as possible."
  maxLines={5}
  required
/>
```

### With tags and clear icon

```tsx
<TextArea
  label="Tags"
  showTags
  tag1
  tag2
  tag3
  showClearIcon
  placeholder="Add more context…"
  maxLines={3}
/>
```

### RTL

```tsx
<TextArea
  label="الوصف"
  placeholder="أدخل وصفاً مختصراً…"
  helpText="الحد الأقصى 500 حرف."
  rtl
  maxLines={3}
  required
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Text Input Field](./text-input-field.md) | Single-line input (name, email, phone, search) |
| [Rich Text Editor](./rich-text-editor.md) | Formatted text with bold, lists, and links |
| [Script Editor](./script-editor.md) | Code or scripting input with syntax highlighting |
| [Select Box](./select-box.md) | Choosing from a predefined list |
| [Multiselect](./multiselect.md) | Selecting multiple items from a predefined list |
