# Section Header

A Section Header labels a distinct content group within a page. It supports an optional subtitle description, an inline border extension, optional top/bottom divider rules, an action slot, and full RTL support. Three sizes let it adapt from compact sidebars to spacious page regions.

**Figma source:** [UEMS Design System 3.0 — Section Header page](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17392-399995)  
**Component node:** `17392:399995` (Section Header component set)  
**Last updated:** 2026-04-14

---

## Anatomy

**Default — title only**
```
  Section Title
```

**With Description — title + subtitle**
```
  Section Title
  Optional description text for this section
```

**With Border — title + inline extending rule**
```
  Section Title  ─────────────────────────────────────
```

**With Bottom Divider**
```
  Section Title
  ──────────────────────────────────────────────────
```

**With Top and Bottom Dividers**
```
  ──────────────────────────────────────────────────
  Section Title
  ──────────────────────────────────────────────────
```

**With Action slot**
```
  Section Title                              View All
```

| Part | Description |
|---|---|
| **Title** | Primary section label. Semibold, scales with `Size`. Always visible. |
| **Description** | Optional subtitle below the title. Lighter weight, smaller scale. Visible in `Style=With Description` or when `showDescription=true`. |
| **Right Border** | Horizontal rule extending from the title to the right edge of the container. Present only in `Style=With Border`. Fills remaining width dynamically. |
| **Top Divider** | 1 px full-width rule above the content. Visible when `Divider=Top and Bottom`. |
| **Bottom Divider** | 1 px full-width rule below the content. Visible when `Divider=Bottom` or `Divider=Top and Bottom`. |
| **Action** | Right-aligned slot for a link, button, or icon. Hidden by default. Instance-swappable. |

---

## Variants

### Style

| Value | Description | Structure |
|---|---|---|
| `Default` | Title only. Text group fills full container width. | No description, no inline border. |
| `With Description` | Title + subtitle description below. Text group fills full width. | Description layer visible. |
| `With Border` | Title with a horizontal rule filling the remaining row width. Text group shrinks to hug content. | Right Divider rectangle added. No description. |

> `With Border` only combines with `Divider=None` — it is not paired with top/bottom dividers in the component set.

### Divider

| Value | Description |
|---|---|
| `None` | No divider lines (default). |
| `Bottom` | 1 px rule below the component. |
| `Top and Bottom` | 1 px rules above and below the component. |

### Size

| Value | Padding T/B | Title | Description | Height (Default/None) | Height (With Desc/None) |
|---|---|---|---|---|---|
| `Small` | 8 px | 12 px / Semibold / 16 px lh | 10 px / Medium / 14 px lh | 32 px | 48 px |
| `Medium` | 12 px | 14 px / Semibold / 20 px lh | 12 px / Regular / 16 px lh | 44 px | 64 px |
| `Large` | 16 px | 16 px / Semibold / 24 px lh | 14 px / Regular / 20 px lh | 56 px | 78 px |

### Direction

| Value | Description |
|---|---|
| `RTL = False` | Left-to-right layout. Title and description left-aligned (default). |
| `RTL = True` | Right-to-left layout. Title and description right-aligned. Child order reversed for `With Border` (border appears on left). Arabic placeholder text used. |

---

## Variant Matrix

- **3 sizes** × **3 styles** × **3 divider** × **2 directions** = **54 Section Header variants**

---

## Props / API

### Variant props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `'Small' \| 'Medium' \| 'Large'` | `'Small'` | Controls title scale, description scale, and vertical padding. |
| `style` | `'Default' \| 'With Description' \| 'With Border'` | `'Default'` | Layout style — plain title, title + description, or title + inline extending rule. |
| `divider` | `'None' \| 'Bottom' \| 'Top and Bottom'` | `'None'` | Adds 1 px horizontal rule(s) above/below the component. |
| `rtl` | `boolean` | `false` | Switches to right-to-left layout. |

### Content props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"Section Title"` | Primary label text. |
| `description` | `string` | `"Optional description text for this section"` | Subtitle text, visible when `style='With Description'` or `showDescription=true`. |
| `showDescription` | `boolean` | `false` | Explicitly show the description text regardless of `style`. |

### Action props

| Prop | Type | Default | Description |
|---|---|---|---|
| `showAction` | `boolean` | `false` | Shows the right-aligned action slot. |
| `actionLabel` | `string` | `"View All"` | Text label for the default action link. |
| `action` | `ReactNode` | Text link component | Instance-swap slot — replace with any button, icon button, or link component. |

---

## Design Tokens

### Text colours

| Token | Usage |
|---|---|
| `Text/Text-Primary` | Section title text |
| `Text/Text-Secondary` | Description subtitle text |

### Border / Divider

| Token | Usage |
|---|---|
| `Border/Border-Secondary` | Top Divider, Bottom Divider, and Right Border (With Border) fills |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing/8` | 8 px | Small padding T/B; divider gap (S + M); Content → Action gap (S + M) |
| `spacing/12` | 12 px | Medium padding T/B; divider gap (L); Content → Action gap (L) |
| `spacing/16` | 16 px | Large padding T/B |
| `spacing/2` | 2 px | Text Group gap (Small + Large, between title and description) |
| `spacing/4` | 4 px | Text Group gap (Medium) |

---

## Typography

| Element | Size | Font | Size | Weight | Line Height | Token |
|---|---|---|---|---|---|---|
| Title | Small | Zoho Puvi | 12 px | Semibold (600) | 16 px | `body/Small/SemiBold` |
| Title | Medium | Zoho Puvi | 14 px | Semibold (600) | 20 px | `body/Default/SemiBold` |
| Title | Large | Zoho Puvi | 16 px | Semibold (600) | 24 px | `body/Large/SemiBold` |
| Description | Small | Zoho Puvi | 10 px | Medium (500) | 14 px | `body/Xsmall/Default` |
| Description | Medium | Zoho Puvi | 12 px | Regular (400) | 16 px | `body/Small/Default` |
| Description | Large | Zoho Puvi | 14 px | Regular (400) | 20 px | `body/Default/Regular` |

---

## Sizing Reference

| Property | Small | Medium | Large |
|---|---|---|---|
| Component width | 360 px (fills container in code) | 360 px | 360 px |
| Padding top / bottom | 8 px | 12 px | 16 px |
| Height — Default / None | 32 px | 44 px | 56 px |
| Height — Default / Bottom | 41 px | 53 px | 69 px |
| Height — Default / Top and Bottom | 50 px | 62 px | 82 px |
| Height — With Description / None | 48 px | 64 px | 78 px |
| Height — With Description / Bottom | 57 px | 73 px | 91 px |
| Height — With Description / Top+Bottom | 66 px | 82 px | 104 px |
| Height — With Border / None | 32 px | 44 px | 56 px |
| Title ↔ Description gap | 2 px | 4 px | 2 px |
| Text Group ↔ Action gap | 8 px | 8 px | 12 px |
| Divider thickness | 1 px | 1 px | 1 px |

> All component widths in the Figma canvas are fixed at 360 px. In code, use `width: 100%` to fill the container.

---

## Divider Lines

Dividers are implemented as **separate `RECTANGLE` layers** (not CSS `border` on the container). Each rectangle is `1 px` tall, full container width, filled with `Border/Border-Secondary`.

| Layer name | When visible |
|---|---|
| `Top Divider` | `Divider = "Top and Bottom"` only |
| `Bottom Divider` | `Divider = "Bottom"` or `"Top and Bottom"` |
| `Right Divider` | `Style = "With Border"` — fills remaining row width after the title |

**CSS implementation:**

```css
/* Bottom divider */
.section-header--divider-bottom {
  border-bottom: 1px solid var(--color-border-secondary);
}

/* Top and bottom */
.section-header--divider-both {
  border-top: 1px solid var(--color-border-secondary);
  border-bottom: 1px solid var(--color-border-secondary);
}

/* With Border (inline extending rule) */
.section-header--with-border .section-header__title-row::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--color-border-secondary);
  margin-left: 8px; /* matches itemSpacing */
  align-self: center;
}
```

---

## Usage

### When to use

- To **label a distinct group of content** within a page, card, panel, or sidebar.
- When a page is divided into multiple named regions and users need clear headings to navigate.
- Use `With Description` when the section purpose needs a short explanatory subtitle.
- Use `With Border` to visually extend the title across the full width without adding vertical space — common in dense dashboards or sidebars.
- Use `Bottom` divider to draw a clear boundary between the header and the content below it.
- Use `Top and Bottom` dividers when the section sits between other content regions and needs explicit framing.
- Use the Action slot for a scoped link or button that is relevant to the entire section (e.g. "View All", "Edit", "Add").

### When not to use

- **Top-level page heading** → use [Page Header](./page-header.md).
- **Card titles** → use a card-level heading (`h3`/`h4`) styled appropriately — a Section Header would overstate the visual hierarchy.
- **Navigation items** → use [Left Navigation](./left-navigation.md) or [Tabs](./tabs.md).
- **When the heading can be inferred from context** — omit the Section Header rather than duplicating obvious labels.

### Do / Don't

| Do | Don't |
|---|---|
| Choose the `Size` that matches the surrounding content density — `Small` for sidebars and data tables, `Large` for spacious page regions | Use `Large` everywhere regardless of layout density |
| Keep titles concise (2–4 words: "Recent Activity", "Team Members") | Write a full sentence as a section title |
| Use `With Description` for sections with non-obvious purposes | Add a description to every section regardless of clarity |
| Use `With Border` for inline title-rule patterns in dense layouts | Use `With Border` alongside `Bottom` divider — it creates redundant visual borders |
| Use the Action slot for section-scoped actions only (e.g. "View All", "Edit") | Put unrelated page-level actions in the section action slot |
| Match `Size` to the heading level — `Large` for `h2`, `Medium` for `h3`, `Small` for `h4` | Mix sizes arbitrarily without regard to heading hierarchy |
| Use `Bottom` divider to separate the header from its content | Add dividers to every section — overuse creates visual noise |
| Use `RTL=True` for right-to-left pages | Manually flip layout with CSS when the RTL variant is available |

### Heading level mapping

The Section Header is a presentational component. Map sizes to HTML heading levels to maintain semantic document structure:

| Section Header Size | Recommended HTML element | Context |
|---|---|---|
| `Large` | `<h2>` | Top-level page section |
| `Medium` | `<h3>` | Sub-section within an `<h2>` region |
| `Small` | `<h4>` | Nested sub-section, sidebar grouping |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Heading semantics** | Render the title as the appropriate heading element (`<h2>`, `<h3>`, `<h4>`) — never use a `<div>` for heading text |
| **Heading hierarchy** | Do not skip heading levels (e.g. `<h2>` → `<h4>`). Section Header sizes should map consistently to levels. |
| **Description** | The description is supplementary — it does not need a separate `aria-*` attribute; it follows the heading naturally in the DOM |
| **Action** | The action link/button must have a descriptive accessible name. "View All" alone is ambiguous — consider `aria-label="View all recent activity"` |
| **Dividers** | Divider rectangles are purely decorative. Implement as CSS borders or `aria-hidden` elements. |
| **RTL** | Set `dir="rtl"` on the section container or page `<html>` — the component's child order reversal already handles the `With Border` layout flip |
| **Contrast** | `Text/Text-Primary` on the page background must meet WCAG AA 4.5:1. `Text/Text-Secondary` (description) must also meet AA. |
| **Keyboard** | If the action slot contains an interactive element, it must be reachable via `Tab` and activatable with `Enter` / `Space`. |

---

## Code Examples

### Default — title only

```tsx
<SectionHeader
  title="Recent Activity"
  size="Medium"
/>
```

### With description

```tsx
<SectionHeader
  title="Team Members"
  style="With Description"
  description="People with access to this workspace."
  size="Medium"
/>
```

### With Border (inline rule)

```tsx
<SectionHeader
  title="Overview"
  style="With Border"
  size="Large"
/>
```

### With Bottom Divider

```tsx
<SectionHeader
  title="Filters"
  size="Small"
  divider="Bottom"
/>
```

### With Top and Bottom Dividers

```tsx
<SectionHeader
  title="Advanced Settings"
  size="Medium"
  divider="Top and Bottom"
/>
```

### With Action slot

```tsx
<SectionHeader
  title="Recent Files"
  size="Medium"
  showAction
  actionLabel="View All"
  onActionClick={() => navigate('/files')}
/>
```

### With custom Action (icon button)

```tsx
<SectionHeader
  title="Notifications"
  size="Small"
  showAction
  action={<IconButton icon="settings" aria-label="Notification settings" />}
/>
```

### Large with description + bottom divider + action

```tsx
<SectionHeader
  title="Project Summary"
  style="With Description"
  description="Key metrics and status for this project."
  size="Large"
  divider="Bottom"
  showAction
  actionLabel="Edit"
  onActionClick={() => openEditModal()}
/>
```

### RTL

```tsx
<SectionHeader
  title="عنوان القسم"
  style="With Description"
  description="نص وصفي اختياري لهذا القسم"
  size="Medium"
  rtl
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Page Header](./page-header.md) | Top-level page title with breadcrumbs, metadata, and tab navigation |
| [Divider](./divider.md) | Standalone horizontal or vertical rule without a title |
| [Accordion](./accordion.md) | Collapsible section with an expand/collapse toggle |
| [Tabs](./tabs.md) | Navigating between content sections that require tab selection |
