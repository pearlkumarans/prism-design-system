# Accordion Component

**Design System:** UEMS Design System 3.0
**Figma Node:** `17355:226378` (Component Set)
**Page:** Accordion
**Total Variants:** 40

---

## Overview

The Accordion is a collapsible content panel with a clickable header and an expandable body. It allows users to show or hide sections of content progressively, reducing visual clutter while keeping information accessible. Accordions are used in settings panels, FAQs, detail views, filters, and any context where grouped content needs to be revealed on demand.

---

## Anatomy

### Collapsed State

```
┌──────────────────────────────────────────────────────────┐
│  [›]  Accordion Title          [Badge]  [Action]         │  <- Header (always visible)
└──────────────────────────────────────────────────────────┘
```

### Expanded State

```
┌──────────────────────────────────────────────────────────┐
│  [∨]  Accordion Title          [Badge]  [Action]         │  <- Header
├──────────────────────────────────────────────────────────┤
│  [ Slot 1 content ]                                      │  <- Body (visible when expanded)
│  [ Slot 2 content ]                                      │
│  [ Slot 3 content ]                                      │
└──────────────────────────────────────────────────────────┘
```

### With Checkbox Type

```
┌──────────────────────────────────────────────────────────┐
│  [☐]  Accordion Title          [Badge]  [Action]         │  <- Checkbox replaces chevron
├──────────────────────────────────────────────────────────┤
│  [ Slot 1 content ]                                      │
└──────────────────────────────────────────────────────────┘
```

### Layer Structure

```
Root (vertical auto-layout, fill width, hug height, clips content)
├── Header (horizontal auto-layout, fill width, hug height)
│   ├── Chevron (20×20, chevron-down icon)         — Type=Default only
│   ├── Checkbox (20×20, Checkbox instance)         — Type=With Checkbox only
│   ├── Title (fill width, 14px medium, truncating)
│   ├── Badge (hug, Badge instance)                 — toggleable via Show Badge
│   └── Action Button (hug, TextLink or Button)     — toggleable via Show Action
└── Body (fill width, slot)                         — visible in State=Expanded only
    ├── Slot 1                                      — toggleable
    ├── Slot 2                                      — toggleable
    └── Slot 3                                      — toggleable (off by default)
```

### Parts

| Part | Description |
|------|-------------|
| **Root Container** | Vertical auto-layout frame. Fill width, hug height. Corner radius: 8px. Clips content. |
| **Header** | Horizontal auto-layout row. Always visible. Padding: 4px top/bottom, 16px left/right. Min height: 40px (Filled) / 44px (Outlined). 8px gap between children. |
| **Chevron** | 20×20 chevron-down icon instance. Rotates to indicate collapsed/expanded state. Visible in `Type = Default` only. |
| **Checkbox** | 20×20 Checkbox component instance. Replaces the chevron in `Type = With Checkbox`. Controls selection and/or expansion. |
| **Title** | Fill-width text element. 14px medium weight. Text-Primary token. Truncates with ellipsis on overflow. |
| **Badge** | Badge component instance (default: "Critical", red solid fill). Toggleable via `Show Badge`. |
| **Action Button** | TextLink or Button instance. Toggleable via `Show Action`. Swappable via instance swap. |
| **Body** | Slot container. Fill width. Visible only when `State = Expanded`. Accepts up to 8 nested content slots. |
| **Slot 1 / 2 / 3** | Individual body content slots. Slot 1 and 2 are on by default; Slot 3 is off by default. |

---

## Variant Axes

| Property | Values | Description |
|----------|--------|-------------|
| **Type** | `Default`, `With Checkbox` | Controls the leading element in the header — chevron icon or checkbox. |
| **State** | `Collapsed`, `Expanded`, `Hover`, `Focus`, `Disabled` | Controls the interaction and expansion state of the accordion. |
| **Style** | `Filled`, `Outlined` | Controls the visual container treatment — tinted background vs. white with border. |
| **RTL** | `False`, `True` | Mirrors header child order and text alignment for right-to-left languages. |

### Variant Count Breakdown

2 (Type) × 5 (State) × 2 (Style) × 2 (RTL) = **40 variants**

---

## Component Properties

### Content Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Title` | Text | `"Accordion Title"` | The header title text (LTR). |
| `Title RTL` | Text | `"عنوان الأكورديون"` | The header title text for RTL layout. |
| `Show Badge` | Boolean | `true` | Toggles the Badge instance in the header. |
| `Show Action` | Boolean | `true` | Toggles the Action Button (TextLink or Button) in the header. |

### Body Slot Visibility

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Slot 1` | Boolean | `true` | Toggles body slot 1 visibility. |
| `Slot 2` | Boolean | `true` | Toggles body slot 2 visibility. |
| `Slot 3` | Boolean | `false` | Toggles body slot 3 visibility. Off by default. |

### Body Content Slots

| Property | Type | Description |
|----------|------|-------------|
| `Body` | Slot | Primary body slot. Accepts any nested component. |
| `Body2` – `Body8` | Slot | Additional body slots (up to 8 total). Accept any nested component. |

---

## Styles

| Style | Background | Border | Min Header Height |
|-------|-----------|--------|-------------------|
| **Filled** | `BG-Secondary-alt` (tinted) | None (no border) | 40px |
| **Outlined** | `BG-White` | `Border-Secondary`, 1px stroke | 44px (includes border) |

---

## States

| State | Behavior | BG Token | Border Token | Stroke Width | Opacity |
|-------|----------|----------|--------------|--------------|---------|
| **Collapsed** | Header visible, body hidden. Chevron points right. | Style default | Style default | 1px | 100% |
| **Expanded** | Header visible, body revealed. Chevron points down. | Style default | Style default | 1px | 100% |
| **Hover** | Subtle background shift on mouse hover. Cursor: pointer. | `BG-Secondary-hover` | Outlined: `Border-Disabled` | 1px | 100% |
| **Focus** | 2px accent focus ring on the header (outside stroke). Keyboard activated. | Style default | `Border-Accent` | 2px outside | 100% |
| **Disabled** | Non-interactive. All header content faded. No hover/focus feedback. | Style default | Style default | 1px | 50% |

---

## Types

### Default
- The header leading element is a **chevron icon** (chevron-down, 20×20).
- Clicking anywhere on the header toggles the accordion open/closed.
- The chevron rotates to indicate state (right = collapsed, down = expanded).

### With Checkbox
- The header leading element is a **Checkbox component** (20×20), replacing the chevron.
- The checkbox controls **selection** of the accordion item (e.g., in multi-select lists).
- Clicking the checkbox or header may also toggle expansion, depending on implementation.
- Use when accordion items need to be selectable as part of a form or batch action.

---

## Body Slots

The body accepts up to **8 content slots** (`Body` through `Body8`) allowing free composition of any nested components — forms, tables, lists, text blocks, or other design system components.

- **Slot 1** and **Slot 2** are visible by default.
- **Slot 3** is hidden by default (toggle `Slot 3` property to show).
- Slots 4–8 are available via direct instance slot properties.
- The body is only rendered when `State = Expanded`.

---

## RTL Support

When `RTL = True`:
- Header child order is fully reversed: **Action Button → Badge → Title → Chevron/Checkbox** (right to left)
- Title text is right-aligned
- Chevron icon is mirrored where applicable
- Body content slots follow the document RTL direction

---

## Usage Guidelines

### Do
- Use accordions to progressively reveal content in long forms, settings panels, or FAQs
- Keep header titles concise and descriptive — users decide whether to expand based on the title alone
- Use `Show Badge` to surface critical status information without requiring expansion
- Use `Show Action` for contextual quick actions (e.g., edit, view all) accessible from the collapsed state
- Use `Style = Filled` for accordions inside panels or cards with a neutral container
- Use `Style = Outlined` when accordions need to stand out against white or content backgrounds
- Use `Type = With Checkbox` when accordion items need to be selectable for batch operations
- Allow multiple accordions to be expanded simultaneously unless content exclusivity is required

### Don't
- Don't hide critical required information inside a collapsed accordion — users may miss it
- Don't use accordions for very short content that doesn't justify the expand/collapse interaction
- Don't nest accordions more than one level deep — it creates confusing interaction patterns
- Don't use the accordion title as the sole access point for an action — provide explicit action elements
- Don't disable an accordion without communicating why it's unavailable
- Don't put primary form submission buttons inside accordion bodies

---

## Accordion vs. Other Disclosure Patterns

| Pattern | Use Case |
|---------|----------|
| **Accordion** | Multiple collapsible sections in a vertical list. Best for settings, FAQs, filters. |
| **Tabs** | Mutually exclusive content panels switching horizontally. Best when only one view is needed at a time. |
| **Modal / Dialog** | Overlay content requiring focused attention. Best for forms or confirmations. |
| **Expandable Row** | Inline content expansion within a table row. Best for data tables with detail panes. |

---

## Accessibility

| Aspect | Implementation |
|--------|---------------|
| **ARIA Role** | Use `role="button"` on the header element with `aria-expanded="true/false"` to communicate state to screen readers. |
| **ARIA Controls** | Use `aria-controls="[body-id]"` on the header linking it to the body panel. Use `id` on the body panel. |
| **Keyboard Navigation** | Tab to focus the accordion header. `Enter` or `Space` to toggle expand/collapse. Tab moves to the next focusable element (inside body when expanded, or next accordion). |
| **Focus Indicator** | 2px `Border-Accent` focus ring rendered outside the header stroke. `clipsContent = false` on the header ensures the ring is not clipped. |
| **Disabled State** | Use `aria-disabled="true"` on disabled accordions. Remove from tab order or keep with appropriate announcements. Reduced opacity (50%) provides visual disabled indication. |
| **Screen Reader** | The title text is the accessible name of the toggle button. Badge and Action Button are separately focusable elements within the header. |
| **RTL** | Full RTL layout support. ARIA attributes are direction-agnostic and remain correct in RTL mode. |
| **Color Contrast** | Title text meets WCAG 2.1 AA (4.5:1) against both Filled and Outlined backgrounds. |

---

## Design Tokens Used

| Token | Usage |
|-------|-------|
| `BG-Secondary-alt` | Filled style background (collapsed/expanded/focus) |
| `BG-Secondary-hover` | Background on hover (both styles) |
| `BG-White` | Outlined style background |
| `Border-Secondary` | Outlined style default border |
| `Border-Accent` | Focus ring border (both styles, 2px outside) |
| `Border-Disabled` | Outlined hover border |
| `Text-Primary` | Title text color |
| `Icon-Primary` | Chevron icon stroke color |
| `radius-8` | Header corner radius (8px) |

---

## Related Components

| Component | Relationship |
|-----------|-------------|
| **Badge** | Used inside the accordion header as a status indicator. Shares the same semantic color system. |
| **Checkbox** | Used as the leading element in `Type = With Checkbox` accordions. |
| **TextLink / Button** | Used as the Action element in the accordion header for quick actions. |
| **Tabs** | Alternative disclosure pattern for mutually exclusive content panels. |

---

## Figma Usage

```
Component Set: Accordion
Node ID: 17355:226378
File: UEMS - Design System 3.0

Example variant string:
Type=Default, State=Collapsed, Style=Filled, RTL=False
```

### Instance Overrides
1. Select the Accordion instance
2. Edit the **Title** text to set the header label
3. Toggle **Show Badge** on/off; swap the Badge instance to change the status label
4. Toggle **Show Action** on/off; swap the Action Button between TextLink and Button variants
5. Toggle **Slot 1**, **Slot 2**, **Slot 3** to control visible body slots
6. Drop components into **Body** through **Body8** slots to populate accordion content
7. Set **Style** to `Filled` or `Outlined` based on the surrounding container
8. Use **Type = With Checkbox** for selectable accordion items in forms or batch operations
9. Toggle **RTL** to `True` for right-to-left language layouts
