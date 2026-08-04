# Divider

A Divider is a thin line used to visually separate content sections, list items, or layout regions. It supports horizontal and vertical orientations, three line styles, two thickness levels, four layout types (including a centred label variant), and inset spacing options.

**Figma source:** [UEMS Design System 3.0 — Divider page](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17009-925007)  
**Component node:** `17009:925007` (Divider component set)  
**Last updated:** 2026-04-14

---

## Anatomy

**Horizontal — Full Width**
```
────────────────────────────────────────────────────
```

**Horizontal — Inset (16 px leading indent)**
```
                ────────────────────────────────────
```

**Horizontal — Middle Inset (16 px both sides)**
```
                ──────────────────────────────
```

**Horizontal — With Text**
```
──────────────────── Label ─────────────────────────
```

**Vertical — Full Width**
```
│
│
│
│
```

**Vertical — With Text**
```
│
│
Label
│
│
```

| Part | Description |
|---|---|
| **Line** | The dividing rule. A single frame rendered as a stroke (non-With Text) or a filled frame (With Text). |
| **Label** | Optional centred text label splitting the line into two equal segments. 12 px Regular, `Text/Text-Secondary`. Present only in `With Text` type. |
| **Line Left / Line Right** | The two line segments flanking the label in horizontal With Text variants. Each fills equally. |
| **Line Top / Line Bottom** | The two line segments flanking the label in vertical With Text variants. Each fills equally. |

---

## Variants

### Orientation

| Value | Layout | Default size |
|---|---|---|
| `Horizontal` | Line spans width of container | 280 × 1–2 px |
| `Vertical` | Line spans height of container | 1–2 × 80 px |

### Type

| Value | Description | Indent |
|---|---|---|
| `Full Width` | Line spans the full available width or height. Default. | None |
| `Inset` | 16 px indent on the leading edge only (left for H, top for V). | 16 px leading |
| `Middle Inset` | 16 px indent on both edges. | 16 px each side |
| `With Text` | Line is split by a centred label. Two equal line segments flank the text with 8 px gaps. | None |

### Style

| Value | Line colour token | Visual |
|---|---|---|
| `Solid` | `Border/Border-Tertiary` (`#E1E4EB`) | Continuous rule |
| `Dashed` | `Border/Border-Tertiary` (`#E1E4EB`) | Evenly spaced dashes |
| `Dotted` | `Border/Border-Tertiary` (`#E1E4EB`) | Evenly spaced dots |

> The line colour is **uniform** — every style (Solid / Dashed / Dotted) and the `With Text` line segments all use `Border/Border-Tertiary`, matching the Data Table gridlines. (Dashed/Dotted/With-Text were previously bound to `Border-Secondary`; rebound to `Border-Tertiary` on 2026-06-15.)

### Thickness

| Value | Line thickness | Use case |
|---|---|---|
| `Thin` | **1 px** | Default — most layouts, list separators, subtle section breaks |
| `Medium` | **2 px** | Stronger visual weight — separating major page regions |

---

## Variant Matrix

- **2 orientations** × **4 types** × **3 styles** × **2 thicknesses** = **48 Divider variants**

---

## Props / API

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'Horizontal' \| 'Vertical'` | `'Horizontal'` | Direction of the dividing line. |
| `type` | `'Full Width' \| 'Inset' \| 'Middle Inset' \| 'With Text'` | `'Full Width'` | Layout type. Controls indent and whether a label is shown. |
| `style` | `'Solid' \| 'Dashed' \| 'Dotted'` | `'Solid'` | Visual line style. |
| `thickness` | `'Thin' \| 'Medium'` | `'Thin'` | Line thickness — 1 px (`Thin`) or 2 px (`Medium`). |
| `label` | `string` | `"Label"` | Text displayed in the centre of a `With Text` divider. |

> The Divider has **no Boolean or Instance Swap properties** — all four axes are pure variant switches.

---

## Design Tokens

### Line colour

| Token | Usage |
|---|---|
| `Border/Border-Tertiary` | Line colour for **every** style — Solid, Dashed, Dotted, and all With-Text line segment fills (uniform) |

### Text colour

| Token | Usage |
|---|---|
| `Text/Text-Secondary` | Label text in With Text variants |

### Spacing

| Value | Usage |
|---|---|
| 16 px (hard-coded) | Leading indent for Inset; both-side indent for Middle Inset |
| 8 px (hard-coded) | Gap between line segments and label in With Text variants |

> No spacing design tokens are applied directly — padding and itemSpacing are set as raw values in the component. When implementing, consider mapping these to `spacing/16` and `spacing/8` from the UEMS Global Tokens collection for consistency.

---

## Typography

| Element | Font | Size | Weight | Line Height | Token |
|---|---|---|---|---|---|
| Label | Zoho Puvi | 12 px | Regular (400) | 16 px | `body/Small/Default` |

---

## Sizing Reference

### Horizontal variants

| Type | Thickness | Component size | Line thickness | Padding |
|---|---|---|---|---|
| Full Width | Thin | 280 × 1 px | 1 px | — |
| Full Width | Medium | 280 × 2 px | 2 px | — |
| Inset | Thin | 280 × 1 px | 1 px | Left 16 px |
| Inset | Medium | 280 × 2 px | 2 px | Left 16 px |
| Middle Inset | Thin | 280 × 1 px | 1 px | Left + Right 16 px |
| Middle Inset | Medium | 280 × 2 px | 2 px | Left + Right 16 px |
| With Text | Thin | 280 × 20 px | 1 px | Gap 8 px each side of label |
| With Text | Medium | 280 × 20 px | 2 px | Gap 8 px each side of label |

### Vertical variants

| Type | Thickness | Component size | Line thickness | Padding |
|---|---|---|---|---|
| Full Width | Thin | 1 × 80 px | 1 px | — |
| Full Width | Medium | 2 × 80 px | 2 px | — |
| Inset | Thin | 1 × 80 px | 1 px | Top 16 px |
| Inset | Medium | 2 × 80 px | 2 px | Top 16 px |
| Middle Inset | Thin | 1 × 80 px | 1 px | Top + Bottom 16 px |
| Middle Inset | Medium | 2 × 80 px | 2 px | Top + Bottom 16 px |
| With Text | Thin | 20 × 120 px | 1 px | Gap 8 px each side of label |
| With Text | Medium | 20 × 120 px | 2 px | Gap 8 px each side of label |

> Both the horizontal and vertical Divider are designed to **fill their container** via auto-layout `FILL` sizing — the canvas dimensions above are design-time defaults only.

---

## Implementation Notes

### CSS mapping

```css
/* Horizontal full-width — Thin / Solid */
.divider-h {
  display: block;
  width: 100%;
  height: 1px;
  background-color: var(--color-border-tertiary); /* #E1E4EB */
  border: none;
}

/* Horizontal — Medium */
.divider-h--medium { height: 2px; }

/* Dashed / Dotted — use border instead of background */
.divider-h--dashed {
  height: 0;
  border-top: 1px dashed var(--color-border-tertiary); /* #E1E4EB */
  background: none;
}
.divider-h--dotted {
  height: 0;
  border-top: 1px dotted var(--color-border-tertiary);
  background: none;
}

/* Inset */
.divider-h--inset    { margin-left: 16px; }
.divider-h--m-inset  { margin-left: 16px; margin-right: 16px; }

/* Vertical */
.divider-v {
  display: inline-block;
  width: 1px;
  height: 100%;
  background-color: var(--color-border-tertiary);
}
.divider-v--medium { width: 2px; }
```

### With Text layout

```css
.divider-with-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}
.divider-with-text::before,
.divider-with-text::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--color-border-tertiary);
}
/* Medium thickness */
.divider-with-text--medium::before,
.divider-with-text--medium::after { height: 2px; }
```

---

## Usage

### When to use

- To **visually separate** distinct sections of a page, card, panel, or list.
- To **group related content** — a divider signals a boundary between two logical groups.
- Use `With Text` to label a section transition (e.g. "Or", "Today", "More options").
- Use `Inset` or `Middle Inset` inside lists where items have leading icons or avatars, so the divider aligns with the text rather than bleeding to the edge.
- Use `Vertical` to separate items in a horizontal row (e.g. toolbar actions, breadcrumb segments, stat figures).

### When not to use

- **As padding substitute** — do not use a Divider just to add vertical space; use a Spacing token instead.
- **Inside dense data tables** — row borders in a Data Table serve the same purpose more efficiently.
- **Decoratively** — a Divider communicates a semantic boundary; if there is no logical separation, omit it.
- **Overuse** — too many dividers fragment a layout and increase visual noise.

### Do / Don't

| Do | Don't |
|---|---|
| Use `Thin` for most separators — it is the default and least intrusive | Default to `Medium` everywhere — reserve it for major section breaks |
| Use `Solid` as the default; reach for `Dashed` / `Dotted` to signal softer or provisional boundaries | Use Dashed/Dotted without a clear semantic reason |
| Use `Inset` inside lists with leading icons to align the rule to the text column | Use `Full Width` inside lists that have left-aligned icons or avatars |
| Keep `With Text` labels very short (1–3 words, e.g. "Or", "Today", "Continue") | Write full sentences as divider labels |
| Use `Vertical` to separate inline items (toolbar buttons, stats) | Use `Vertical` in a vertical stack — use `Horizontal` there |
| Let the Divider fill its container width/height with CSS `flex: 1` or `width: 100%` | Hard-code a fixed pixel width for a horizontal divider |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Semantic element** | Use `<hr>` for meaningful horizontal section breaks. It has an implicit `role="separator"`. |
| **Vertical dividers** | Use `<div role="separator" aria-orientation="vertical">` or `<hr>` with `aria-orientation="vertical"`. |
| **Decorative dividers** | If purely visual, use `<hr aria-hidden="true">` or a CSS `::before`/`::after` pseudo-element so screen readers skip it. |
| **With Text** | The label text is already in the DOM — no additional `aria-label` is needed. Ensure the surrounding `<hr>` or wrapper has `aria-hidden="true"` if the text itself is the meaningful content. |
| **Contrast** | `Border/Border-Tertiary` (`#E1E4EB`) on white is low-contrast by design — this is intentional for a subtle separator. Do not rely on the divider colour alone to communicate meaning. |
| **Keyboard** | Dividers are not interactive and should never receive focus. |

---

## Code Examples

### Horizontal full-width (default)

```tsx
<Divider />
```

### Horizontal — Medium, Dashed

```tsx
<Divider thickness="Medium" style="Dashed" />
```

### Inset (inside a list)

```tsx
<ul>
  <li><Avatar /> Alice</li>
  <Divider type="Inset" />
  <li><Avatar /> Bob</li>
  <Divider type="Inset" />
  <li><Avatar /> Carol</li>
</ul>
```

### Middle Inset

```tsx
<Divider type="Middle Inset" />
```

### With Text label

```tsx
<Divider type="With Text" label="Or" />
```

### With Text — continue reading

```tsx
<Divider type="With Text" label="Today" />
```

### Vertical — separating toolbar actions

```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <IconButton icon="bold" />
  <IconButton icon="italic" />
  <Divider orientation="Vertical" />
  <IconButton icon="link" />
  <IconButton icon="image" />
</div>
```

### Vertical — Middle Inset with Medium thickness

```tsx
<Divider
  orientation="Vertical"
  type="Middle Inset"
  thickness="Medium"
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Spacing tokens](./spacing.md) | Adding vertical/horizontal whitespace without a visible line |
| [Accordion](./accordion.md) | Collapsible sections that need a more structured separator with interactivity |
| [Data Table](./data-table.md) | Row and column separators within tabular data |
| [Section Header](./section-header.md) | Labelled section breaks that need heading-level semantics and more visual weight |
