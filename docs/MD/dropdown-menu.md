# Dropdown Menu

A floating panel that presents a list of selectable options triggered by a parent control (button, field, etc.). Supports single selection, multi-selection with confirm/clear actions, and grouped sections. Supports RTL layouts.

**Figma source:** [UEMS — Design System 3.0](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17286-257780) · Node `17286:257780`

---

## Variants

The component set contains **6 variants** across three axes:

| Axis | Values | Description |
|------|--------|-------------|
| `Type` | `Single Select`, `Multi Select`, `With Sections` | Controls item type, header, and footer presence |
| `Size` | `Small` | Currently only Small is available (Medium planned) |
| `RTL` | `False`, `True` | Mirrors the entire panel layout for RTL locales |

---

## Types

### Single Select

A plain list of action items — no header, no footer. Each item is an instance of **Action Dropdown Item** (`Type=Action item`). Used when the user picks one option and the menu closes immediately.

```
┌──────────────────────────┐
│  ⊕  action-list-item     │
│  ⊕  action-list-item     │
│  ⊕  action-list-item     │
│  ⊕  action-list-item     │
│  ⊕  action-list-item     │
└──────────────────────────┘
```

### Multi Select

A list of checkbox items with an optional header and footer. The header shows the menu title and a dismiss (`×`) button. The footer provides **Clear All** (text) and **Apply** (primary button) actions.

```
┌──────────────────────────┐
│  Select Options        × │  ← Menu Header (Show Header=ON)
├──────────────────────────┤
│  ☐  action-list-item     │
│  ☐  action-list-item     │
│  ☐  action-list-item     │
├──────────────────────────┤
│          Clear All  Apply │  ← Menu Footer (Show Footer=ON)
└──────────────────────────┘
```

### With Sections

Groups items under labeled section headings separated by a horizontal divider. No header or footer. Section headings are styled in a secondary/muted color to distinguish them from item labels.

```
┌──────────────────────────┐
│  Heading                 │  ← Section label (muted blue)
│  ⊕  action-list-item     │
│  ⊕  action-list-item     │
│ ─────────────────────── │  ← Divider
│  Heading                 │
│  ⊕  action-list-item     │
│  ⊕  action-list-item     │
│  ⊕  action-list-item     │
└──────────────────────────┘
```

---

## Component Properties

| Property | Type | Default | Applies To | Description |
|----------|------|---------|-----------|-------------|
| `Show Header` | Boolean | `ON` | Multi Select | Toggles the header bar ("Select Options ×") |
| `Header Text` | Text | `"Select Options"` | Multi Select | Editable title shown in the header |
| `Show Footer` | Boolean | `ON` | Multi Select | Toggles the footer ("Clear All" + "Apply") |

> These properties have no effect on Single Select or With Sections variants, which have no header/footer elements.

---

## Panel Design Tokens

| Token | Value | Description |
|-------|-------|-------------|
| Background | `BG-White` / `#FFFFFF` | Panel fill |
| Border | `Border-Secondary` | Panel stroke (light gray) |
| Border radius | `8px` | Rounded corners |
| Drop shadow | Elevation 2 | Contextual shadow (menu lift) |
| Vertical padding | `4px` | Top and bottom inner spacing |
| Min-width | `240px` | Default panel width in Figma |

### Multi Select — Header
| Element | Style |
|---------|-------|
| Title text | Body/medium weight, dark (`#292A2E`) |
| Dismiss button (`×`) | Icon-only, secondary color |
| Bottom border | `Border-Secondary` divider line |

### Multi Select — Footer
| Element | Style |
|---------|-------|
| "Clear All" | Text link, no background |
| "Apply" | Primary button, blue (`#0C66E4`), white text, 8px radius |
| Alignment | Right-aligned (reversed in RTL) |

### With Sections — Heading
| Element | Style |
|---------|-------|
| Heading label | Uppercase or small/medium text, muted blue/secondary color |
| Divider | Full-width horizontal rule, `Border-Secondary` |

---

## Sub-component: Action Dropdown Item

All list items are instances of the **Action Dropdown Item** component. Select a nested item directly to edit its individual properties.

| Property | Type | Description |
|----------|------|-------------|
| `Label` | Text | Item display text |
| `Type` | Variant | `Action item` (icon + text), `Checkbox item`, `Section Heading`, `Divider` |
| `State` | Variant | `Default`, `Hover`, `Active`, `Disabled` |
| `Show Icon` | Boolean | Toggles the leading icon |
| `Leading Icon` | Instance Swap | Swap the leading icon (default: ⊕ circle-plus) |
| `Selected` | Boolean | Checkbox checked state (Multi Select only) |

---

## RTL Support

When `RTL=True`, the entire panel is mirrored:

- Header title moves to the **right**, dismiss (`×`) moves to the **left**
- Item icons appear on the **right**, labels align **right**
- Footer: "Apply" (blue button) moves to the **left**, "Clear All" to the **right**
- Section headings remain full-width but text is right-aligned

Set `dir="rtl"` on the containing `<div>` or `<nav>` wrapper in code — do not mirror manually with CSS transforms.

---

## Usage Guidelines

### When to use

- To offer a contextual list of actions or options attached to a trigger element (button, icon button, field).
- When there are too many options to display inline (typically 3 or more).
- When the user needs to select one option and immediately apply it (Single Select).
- When the user needs to select multiple options before committing (Multi Select).
- When options fall into distinct logical groups (With Sections).

### When NOT to use

- For navigation — use a Nav Menu or Sidebar instead.
- When there are only 2 options — use a Toggle or two Buttons.
- When options need descriptions or rich content — use a Popover or Dialog.
- As a form select input — use a Select Field component instead.

### Do / Don't

| Do | Don't |
|----|-------|
| Keep item labels short and scannable (1–4 words) | Use sentence-long descriptions as item labels |
| Use Multi Select when the user needs to confirm before applying | Use Multi Select for single-pick scenarios (creates unnecessary friction) |
| Use With Sections when 2+ logical groupings exist with 3+ items each | Add a section with only 1 item — just place it in the flat list |
| Close Single Select immediately on item selection | Leave Single Select open after a choice |
| Use `Show Header=OFF` when the trigger label already provides context | Always show the header even when it duplicates the trigger label |
| Provide a "Clear All" path in Multi Select (`Show Footer=ON`) | Force users to uncheck each item manually to reset |

---

## Accessibility

| Concern | Guidance |
|---------|----------|
| Role | `role="menu"` on the panel; `role="menuitem"` for Single Select items; `role="menuitemcheckbox"` for Multi Select items |
| Trigger | The triggering element must have `aria-haspopup="menu"` and `aria-expanded` toggled on open/close |
| Focus management | On open, focus moves to the first item; on close, focus returns to the trigger |
| Keyboard — navigation | `↑` / `↓` arrows move between items; `Home` / `End` jump to first/last |
| Keyboard — selection | `Enter` or `Space` activates an item or toggles a checkbox |
| Keyboard — dismiss | `Escape` closes the menu and returns focus to trigger |
| Screen reader | Header text should be announced as the menu label via `aria-labelledby` |
| Multi Select Apply | "Apply" button must be keyboard reachable and labeled `aria-label="Apply selection"` if icon-only |
| RTL | Set `dir="rtl"` on the panel wrapper; rely on logical CSS properties (`margin-inline-start`, `padding-inline-end`) |
| Contrast | Item text must meet WCAG AA (4.5:1); section headings at minimum 3:1 against panel background |

---

## All Variants Reference

| Variant | Node ID |
|---------|---------|
| Type=Single Select, Size=Small, RTL=False | `17286:257664` |
| Type=Multi Select, Size=Small, RTL=False | `17286:257670` |
| Type=With Sections, Size=Small, RTL=False | `17286:257685` |
| Type=Single Select, Size=Small, RTL=True | `17286:257693` |
| Type=Multi Select, Size=Small, RTL=True | `17286:257699` |
| Type=With Sections, Size=Small, RTL=True | `17286:257714` |

---

## Related Components

- **Action Dropdown Item** — the atomic item inside every menu list
- **Button** — the most common trigger element for this menu panel
- **Select Field** — use this for form-bound single-value selection instead of Dropdown Menu
- **Popover** — use when menu content needs rich layout, descriptions, or images
- **Checkbox** — the standalone form equivalent of Multi Select's checkbox items

---

*Generated from UEMS Design System 3.0 · Figma node `17286:257780`*
