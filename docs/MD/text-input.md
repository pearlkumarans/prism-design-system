# Text Input Component

**Design System:** UEMS Design System 3.0
**Figma Node:** `16042:44400` (Component Set)
**Page:** Text Input
**Total Variants:** 96

---

## Overview

The Text Input is a form control component that allows users to enter and edit single-line text. It provides a comprehensive set of features including labels, placeholder text, prefix/suffix elements (icons and text), helper text, character counters, validation states, and clear functionality. Text Input is one of the most commonly used form components across the UEMS application.

---

## Anatomy

### Label Left (Default)

```
┌──────────────────────────────────────────────────────────────┐
│         ┌──────────────────────────────────────────────────┐ │
│ Label * │ [Prefix Icon] [Prefix Text] | Input Text         │ │
│         │               [Suffix Text] [Suffix Icon] [X]    │ │
│         └──────────────────────────────────────────────────┘ │
│         [Helper Icon] Supporting text                0/100   │
└──────────────────────────────────────────────────────────────┘
```

### Label Top (Responsive / Special Cases)

```
┌─────────────────────────────────────────────────┐
│  Label *                                        │
│  ┌─────────────────────────────────────────────┐│
│  │ [Prefix Icon] [Prefix Text] | Input Text    ││
│  │              [Suffix Text] [Suffix Icon] [X] ││
│  └─────────────────────────────────────────────┘│
│  [Helper Icon] Supporting text           0/100  │
└─────────────────────────────────────────────────┘
```

### Parts

| Part | Node Type | Description |
|------|-----------|-------------|
| **Container** | Auto-layout Frame | Outer wrapper. Uses **horizontal** layout for label-left (default) or **vertical** stack for label-top (responsive/special cases). |
| **Label** | Text | Field label text. Toggled via `Show Label`. Includes required asterisk when `Required` is on. Positioned to the left of the input by default; moves above the input at responsive breakpoints or in special-case layouts. |
| **Input Field** | Frame | Horizontal auto-layout frame with border, containing prefix/suffix elements and input text. |
| **Prefix Icon** | Instance Swap | Optional icon before the input text. Toggled via `Show Prefix Icon`. |
| **Prefix Text** | Text | Optional text before the input (e.g., currency symbol, URL prefix). Toggled via `Show Prefix Text`. |
| **Input Text / Placeholder** | Text | The actual input value or placeholder text. |
| **Suffix Text** | Text | Optional text after the input (e.g., unit label). Toggled via `Show Suffix Text`. |
| **Suffix Icon** | Instance Swap | Optional icon after the input text. Toggled via `Show Suffix Icon`. |
| **Suffix Icon Right** | Instance Swap | Additional optional icon at the far right. Toggled via `Show Suffix Icon Right`. |
| **Clear Button** | Boolean toggle | Optional clear (X) button to reset the input. Toggled via `Show Clear Button`. |
| **Helper Row** | Frame | Contains helper icon, helper text, and character counter. Toggled via `Show Helper Row`. Aligns under the input field in both label positions. |
| **Helper Icon** | Instance Swap | Optional icon next to helper text. Toggled via `Show Helper Icon`. |
| **Helper Text** | Text | Supporting or instructional text below the input field. |
| **Counter** | Text | Character count display (e.g., "0/100"). Toggled via `Show Counter`. |

---

## Variant Axes

| Property | Values | Description |
|----------|--------|-------------|
| **Size** | `Small`, `Medium`, `Large` | Controls input field height, padding, font size, and icon sizing. |
| **State** | `Default`, `Hover`, `Focus`, `Filled`, `Error`, `Success`, `Disabled`, `Read Only` | Interaction and validation state of the input. |
| **RTL** | `False`, `True` | Mirrors layout direction for right-to-left languages. |
| **Label Position** | `Top`, `Left` | Controls whether the label appears above or beside the input field. |

### Variant Count Breakdown

3 (Size) x 8 (State) x 2 (RTL) x 2 (Label Position) = **96 variants**

---

## Component Properties

These are overridable instance-level properties:

### Label & Required

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Label` | Boolean | `true` | Toggles the label text visibility. |
| `Label` | Text | `"Label"` | The field label text. |
| `Required` | Boolean | `true` | Shows a required asterisk (*) indicator next to the label. |

### Prefix Elements

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Prefix Icon` | Boolean | `false` | Toggles the prefix icon visibility. |
| `Prefix Icon` | Instance Swap | Default icon | Swappable icon instance before the input text. |
| `Show Prefix Text` | Boolean | `false` | Toggles the prefix text visibility. |
| `Prefix Text` | Text | `"Text"` | Static text before the input (e.g., "$", "https://"). |

### Input Content

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Placeholder` | Text | `"Placeholder"` | Placeholder text shown when the input is empty. |
| `Value` | Text | `"Input Text"` | The current input value text. |

### Suffix Elements

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Suffix Text` | Boolean | `false` | Toggles the suffix text visibility. |
| `Suffix Text` | Text | `"Text"` | Static text after the input (e.g., "kg", "USD"). |
| `Show Suffix Icon` | Boolean | `false` | Toggles the first suffix icon visibility. |
| `Suffix Icon` | Instance Swap | Default icon | Swappable icon instance after the input text. |
| `Show Suffix Icon Right` | Boolean | `false` | Toggles the second (far-right) suffix icon visibility. |
| `Suffix Icon Right` | Instance Swap | Default icon | Additional swappable icon at the far right. |
| `Show Clear Button` | Boolean | `false` | Toggles the clear (X) button to reset the input value. |

### Helper Row

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Helper Row` | Boolean | `true` | Toggles the entire helper row (helper text + counter). |
| `Show Helper Icon` | Boolean | `true` | Toggles the icon next to the helper text. |
| `Helper Icon` | Instance Swap | Default icon | Swappable icon for the helper row. |
| `Helper Text` | Text | `"Supporting text"` | Instructional or validation message text below the input. |
| `Show Counter` | Boolean | `true` | Toggles the character counter visibility. |
| `Counter` | Text | `"0/100"` | Character count display string. |

---

## States

| State | Border | Background | Behavior |
|-------|--------|------------|----------|
| **Default** | Standard border | Default background | Resting state. Shows placeholder text. |
| **Hover** | Slightly emphasized border | Default background | Visual feedback on mouse hover. Cursor changes to text cursor. |
| **Focus** | Highlighted border (brand color) | Default background | Active typing state. Visible focus indicator. Caret visible. |
| **Filled** | Standard border | Default background | Input contains a value. Shows the `Value` text instead of placeholder. |
| **Error** | Red/error border | Default background | Validation failed. Helper text changes to error message with error color. |
| **Success** | Green/success border | Default background | Validation passed. Helper text may show success message with success color. |
| **Disabled** | Muted border | Muted/greyed background | Non-interactive. Reduced opacity. All elements are visually muted. |
| **Read Only** | Minimal/no border | Subtle background | Displays value but cannot be edited. No hover/focus indicators. |

---

## Sizes

| Size | Typical Use |
|------|-------------|
| **Small** | Compact forms, table inline editing, filters, toolbars |
| **Medium** | Default size for most form contexts |
| **Large** | Standalone forms, registration pages, prominent data entry |

---

## Label Position

| Position | Layout | Use Case |
|----------|--------|----------|
| **Left** (Default) | Label positioned to the left of the input field | **Default layout.** Standard forms, settings panels, detail views, and all desktop-width contexts. |
| **Top** | Label stacked above the input field | Responsive/mobile breakpoints where horizontal space is limited. Also used in special cases such as multi-column compact forms or stacked filter layouts. |

### Responsive Behavior

- At **desktop widths**, the label-left layout is the default and should be used across all standard forms.
- At **smaller / responsive breakpoints** (tablets, mobile), the layout should automatically switch to label-top to prevent the label from consuming too much horizontal space and to maintain readability.
- In **special cases** (e.g., narrow side panels, stacked filter groups, or multi-field rows where horizontal space is constrained even on desktop), label-top may be used as an override regardless of screen size.

---

## RTL Support

When `RTL = True`:
- Layout direction is fully mirrored
- Prefix elements move to the right side; suffix elements move to the left
- Text alignment adjusts to right-to-left
- Label and helper text alignment are mirrored
- Clear button position is mirrored

---

## Usage Guidelines

### Do
- Always use **Label Position = Left** as the default layout on desktop
- Switch to **Label Position = Top** on responsive/mobile breakpoints where horizontal space is limited
- Use **Label Position = Top** as an override on desktop only for special cases (narrow side panels, stacked filters, compact multi-field rows)
- Always provide a label for the input field (even if visually hidden, include it for accessibility)
- Use placeholder text to show example input format, not as a replacement for the label
- Use helper text to provide context, formatting requirements, or constraints
- Show the character counter when there is a maximum length
- Use the Error state with a descriptive helper text message explaining what went wrong
- Use the Success state sparingly and only after explicit validation
- Use prefix/suffix elements to clarify expected input format (e.g., "$" prefix for currency, "kg" suffix for weight)
- Use the Clear button for search fields or fields that are frequently cleared

### Don't
- Don't use Label Position = Top as the default on desktop; left-label is the standard
- Don't keep Label Position = Left on mobile/narrow screens where it crowds the input field
- Don't use placeholder text as the only label
- Don't show Error and Success states simultaneously
- Don't use the Read Only state when the field should be Disabled
- Don't add both prefix text and prefix icon simultaneously unless design specifically calls for it
- Don't use overly long helper text; keep it to one line when possible
- Don't hide the label in forms where context is not otherwise obvious
- Don't use the Large size in compact or data-dense layouts

---

## Accessibility

| Aspect | Implementation |
|--------|---------------|
| **Color Contrast** | All states meet WCAG 2.1 AA contrast ratio (4.5:1) for text and borders. Error/Success colors are distinguishable. |
| **Keyboard Navigation** | Input is focusable via Tab. Focus state provides a visible ring/border. Clear button is separately focusable. |
| **Screen Reader** | Label is programmatically associated with the input via `for`/`id`. Required state announced. Error/helper text linked via `aria-describedby`. |
| **Error Handling** | Error messages are announced via `aria-live` or `aria-describedby`. Error state uses both color and icon (not color alone). |
| **RTL** | Full RTL support with mirrored layout and text alignment. |
| **Disabled State** | Disabled inputs are excluded from tab order. Read-only inputs remain focusable but not editable. |
| **Label Position** | Left-positioned labels maintain programmatic association. Both positions support screen readers equally. |

---

## Related Components

| Component | Relationship |
|-----------|-------------|
| **Text Area** | Multi-line text input. Use Text Area when content spans multiple lines (comments, descriptions). |
| **Select / Dropdown** | Use Select when users choose from a predefined list of options rather than typing free text. |
| **Search Input** | Specialized text input with search icon and clear button. Consider using Text Input with prefix icon and clear button for simple search. |
| **Number Input** | Specialized input for numeric values with increment/decrement controls. Use when input is strictly numeric. |
| **Password Input** | Specialized text input with masked characters and show/hide toggle. |

---

## Figma Usage

```
Component Set: Text Input
Node ID: 16042:44400
File: UEMS - Design System 3.0

Example variant string:
Size=Medium, State=Default, RTL=False, Label Position=Top
```

### Instance Overrides
1. Select the Text Input instance
2. Toggle **Show Label**, **Required**, and **Label Position** as needed
3. Edit the **Label** and **Placeholder** text
4. Toggle **Show Prefix Icon** / **Show Prefix Text** for leading elements
5. Toggle **Show Suffix Icon** / **Show Suffix Text** / **Show Suffix Icon Right** for trailing elements
6. Toggle **Show Clear Button** for clearable inputs
7. Edit **Helper Text** and toggle **Show Helper Row** / **Show Counter** for the helper section
8. Edit **Value** to set the input text content
9. Toggle **RTL** for right-to-left language support
