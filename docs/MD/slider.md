# Slider

A Slider lets users select a numeric value (or range) by dragging a thumb along a horizontal track. It supports single-value and range selection, three sizes, optional labels, step markers, helper text, and all standard interaction states including error and disabled.

**Figma source:** [UEMS Design System 3.0 — Slider page](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17186-1117862)  
**Component node:** `17186:1117862` (Slider component set)  
**Last updated:** 2026-04-14

---

## Anatomy

**Single slider**
```
┌─ Slider ─────────────────────────────────────────────┐
│  Label                                           50  │
│  ━━━━━━━━━━━━━━━━━○───────────────────────────────── │
│  0                                              100  │
│  Helper text                                         │
└──────────────────────────────────────────────────────┘
```

**Range slider**
```
┌─ Slider ─────────────────────────────────────────────┐
│  Label                                           50  │
│  ─────────────────○━━━━━━━━━━━━━━━━━○─────────────── │
│  0                                              100  │
└──────────────────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Label** | Field label. Semibold 13 px. Toggleable via `Show Label`. |
| **Value Badge** | Pill displaying the current value (or range). Toggleable via `Show Value Label`. Colour shifts on interaction. |
| **Inactive Track** | Full-width background rail. Uses `Border/Border-Secondary`. |
| **Active Track** | Filled portion indicating the selected value. Uses `Background/BG-Button-Primary`. For Range, fills between the two thumbs. |
| **Thumb** | Draggable circular handle. White fill with accent border. Transforms on hover, focus, and press. |
| **Focus Ring** | Outer ring visible only on keyboard focus. Uses `Border/Border-Accent-Focus`. |
| **Min / Max Labels** | Optional text labels at each end of the track (hidden by default). |
| **Step Markers** | Optional tick marks along the track (hidden by default). |
| **Helper Text** | Optional contextual message below the slider (hidden by default). |

---

## Variants

### Type

| Value | Description |
|---|---|
| `Single` | One thumb selects a single value. Default. |
| `Range` | Two thumbs (`Thumb Left` + `Thumb Right`) define a start and end value. The active track fills the span between them. |

### Size

| Size | Track height | Thumb (visible) | Thumb container | Component height |
|---|---|---|---|---|
| `Small` | 4 px | 16 × 16 px | 24 × 24 px | 52 px |
| `Medium` | 6 px | 20 × 20 px | 28 × 28 px | 56 px |
| `Large` | 8 px | 24 × 24 px | 32 × 32 px | 60 px |

Track corner radius scales with track height: `radius = height / 2` (2 px / 3 px / 4 px).  
Focus ring matches the thumb container size per size (24 / 28 / 32 px), stroke 2 px.

### State

| State | Active track | Thumb fill | Thumb stroke | Focus Ring | Value label |
|---|---|---|---|---|---|
| `Default` | `BG-Button-Primary` | `BG-Base-White` | `Border-Accent` | Hidden | `Text-Secondary` |
| `Hover` | `BG-Button-Primary-Hover` | `BG-Accent-Secondary` | `Border-Accent` | Hidden | `Text-Accent-Primary` |
| `Focus` | `BG-Button-Primary` | `BG-Base-White` | `Border-Accent` | **Visible** (`Border-Accent-Focus`) | `Text-Accent-Primary` |
| `Active` | `BG-Button-Primary` | `BG-Button-Primary` | `Border-Accent` | Hidden | `Text-Accent-Primary` |
| `Disabled` | `BG-Accent-Secondary_action` | `BG-Disabled` | `Border-Disabled` | Hidden | `Text-Disabled` |
| `Error` | `BG-Error-Solid` | `BG-Base-White` | `Border-Accent` | Hidden | `Text-Error` |

---

## Variant Matrix

- **2 types** × **3 sizes** × **6 states** = **36 Slider variants**

---

## Props / API

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `'Single' \| 'Range'` | `'Single'` | Single-value or range (two-thumb) slider. |
| `size` | `'Small' \| 'Medium' \| 'Large'` | `'Small'` | Controls track thickness and thumb size. |
| `state` | `'Default' \| 'Hover' \| 'Focus' \| 'Active' \| 'Disabled' \| 'Error'` | `'Default'` | Interaction or validation state. Typically managed automatically by focus/blur/validation in code. |
| `value` | `number \| [number, number]` | `50` | Current value (Single) or `[start, end]` (Range). |
| `min` | `number` | `0` | Minimum value of the track. |
| `max` | `number` | `100` | Maximum value of the track. |
| `step` | `number` | `1` | Increment step between selectable values. |
| `label` | `string` | `"Label"` | Field label text displayed above the track. |
| `showLabel` | `boolean` | `true` | Shows or hides the label. |
| `showValueLabel` | `boolean` | `true` | Shows or hides the value badge pill. |
| `showMinMaxLabels` | `boolean` | `false` | Shows min and max value text at either end of the track. |
| `minLabel` | `string` | `"0"` | Text for the minimum end label. |
| `maxLabel` | `string` | `"100"` | Text for the maximum end label. |
| `showStepMarkers` | `boolean` | `false` | Shows tick marks along the track at each step interval. |
| `showHelperText` | `boolean` | `false` | Shows helper text below the slider. |
| `helperText` | `string` | `"Helper text"` | Contextual message below the slider. |
| `disabled` | `boolean` | `false` | Disables the slider — non-interactive, all elements greyed out. |
| `onChange` | `(value: number \| [number, number]) => void` | — | Fires on every value change. |
| `onChangeEnd` | `(value: number \| [number, number]) => void` | — | Fires when the user finishes dragging (mouseup / touchend). |

---

## Design Tokens

### Colour

| Token | Usage |
|---|---|
| `Background/BG-Button-Primary` | Active track fill (Default, Focus, Active states) |
| `Background/BG-Button-Primary-Hover` | Active track fill (Hover state) |
| `Background/BG-Error-Solid` | Active track fill (Error state) |
| `Background/BG-Accent-Secondary_action` | Active track fill (Disabled state) |
| `Background/BG-Error-Secondary` | Inactive track fill (Error state) |
| `Border/Border-Secondary` | Inactive track fill (Default / interaction states) |
| `Background/BG-Disabled` | Inactive track fill + thumb fill (Disabled state) |
| `Background/BG-Base-White` | Thumb fill (Default, Focus, Error states) |
| `Background/BG-Accent-Secondary` | Thumb fill (Hover state) |
| `Border/Border-Accent` | Thumb stroke (all interactive states) |
| `Border/Border-Disabled` | Thumb stroke (Disabled state) |
| `Border/Border-Accent-Focus` | Focus ring stroke (Focus state only) |
| `Background/BG-Primary-alt` | Value badge background |
| `Border/Border-Tertiary` | Value badge border |
| `Text/Text-Tertiary` | Label text (Default / interactive states) |
| `Text/Text-Disabled` | Label + value label (Disabled state) |
| `Text/Text-Secondary` | Value label (Default state) |
| `Text/Text-Accent-Primary` | Value label (Hover, Focus, Active states) |
| `Text/Text-Error` | Value label (Error state) |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing/2` | 2 px | Value badge padding top / bottom |
| `spacing/4` | 4 px | Gap between Label Row and Track Row |
| `spacing/8` | 8 px | Value badge padding left / right |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `border-radius/radius-4` | 4 px | Value badge corner radius |

---

## Typography

| Element | Font | Size | Weight | Line Height | Tokens |
|---|---|---|---|---|---|
| Label | Zoho Puvi | 13 px | Semibold (600) | 20 px | `body/Small/Medium`, `Font-size/13px`, `Font-weight/Semibold` |
| Value Label | Zoho Puvi | 14 px | Regular (400) | 20 px | `body/Default/Regular` |
| Min / Max Labels | Zoho Puvi | 14 px | Regular (400) | 20 px | `body/Default/Regular` |
| Helper Text | Zoho Puvi | — | — | — | (hidden by default; tokens not directly bound) |

> Label and value label typography is **identical across all three sizes**. The label style does not scale with slider size.

---

## Sizing Reference

| Property | Value | Token |
|---|---|---|
| Component width | 240 px (design canvas; fill container in code) | — |
| Label Row height | 24 px | — |
| Track Row height | 24 / 28 / 32 px (S / M / L) | — |
| Track height (S / M / L) | 4 / 6 / 8 px | — |
| Track corner radius (S / M / L) | 2 / 3 / 4 px | — |
| Thumb visible circle (S / M / L) | 16 / 20 / 24 px | — |
| Thumb container (S / M / L) | 24 / 28 / 32 px | — |
| Thumb border stroke | 1.5 px (S/M), 2 px (L) | — |
| Focus ring (S / M / L) | 24 / 28 / 32 px, stroke 2 px | — |
| Value badge padding | 2 px top/bottom, 8 px left/right | `spacing/2`, `spacing/8` |
| Value badge corner radius | 4 px | `border-radius/radius-4` |
| Label Row ↔ Track Row gap | 4 px | `spacing/4` |

---

## Usage

### When to use

- When users need to **select a numeric value within a known range** (volume, brightness, price, percentage).
- When the **exact value is less important** than the relative position — users adjust by feel, then read the value label.
- When the range is **continuous or has many discrete steps** where individual option buttons would be impractical.
- Use **Range** type when users define a **start and end** within a range (price filter, date range within a bounded set, etc.).

### When not to use

- **Exact values required** (e.g. entering a specific number) → use a [Text Input Field](./text-input-field.md) with numeric type.
- **Small number of fixed options** (e.g. Low / Medium / High) → use a [Radio Group](./radio-group.md) or [Select Box](./select-box.md).
- **Precise step-based selection** (e.g. quantity 1–10) → consider a number input with increment/decrement buttons.
- **Vertical orientation** → not currently modelled in this component set; build a custom solution if required.

### Do / Don't

| Do | Don't |
|---|---|
| Always show the value label so users know the current value | Hide the value label when the number matters |
| Use `showMinMaxLabels` to give users range context | Leave users guessing what the min and max values are |
| Use `showStepMarkers` when the slider has a small number of discrete steps (≤ 10) | Show step markers on a continuous 0–100 slider — they become visually noisy |
| Use `showHelperText` to explain units or constraints (e.g. "Values in GB") | Leave the unit ambiguous |
| Use `Range` type for bounded filters (e.g. price $10–$500) | Use two separate Single sliders to express a range |
| Size `Medium` for standard form layouts | Use `Small` in a context where touch targets are needed (prefer `Large` on mobile) |
| Ensure `step` aligns with the granularity users actually need | Set `step=1` on a 0–10,000 range where increments of 100 make more sense |
| Provide `onChangeEnd` for network requests (debounce cost) | Fire API calls on every `onChange` tick while dragging |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Element** | Use `<input type="range">` for native keyboard and screen reader support |
| **Label association** | Connect `<label for="id">` to the `<input id="id">` |
| **ARIA for Range** | Use two `<input type="range">` elements; associate with `aria-labelledby` and communicate min/max of each thumb via `aria-valuemin`, `aria-valuemax`, `aria-valuenow` |
| **Value announcement** | Set `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on the input. Use `aria-valuetext` for non-numeric displays (e.g. "Low", "Medium", "High") |
| **Keyboard** | `Tab` to focus the thumb; `Arrow Left/Right` (or `Up/Down`) to increment/decrement; `Home`/`End` to jump to min/max |
| **Focus visible** | Focus Ring uses `Border/Border-Accent-Focus` — must remain visible; do not suppress `:focus-visible` outline |
| **Step markers** | If shown, mark the track with `aria-label` or visually-hidden text describing the step values |
| **Disabled** | Set `disabled` on `<input type="range">`. Disabled sliders are removed from tab order. |
| **Error state** | Associate error/helper text via `aria-describedby`; set `aria-invalid="true"` on the input |
| **Contrast** | Active track (`BG-Button-Primary`) vs inactive track (`Border-Secondary`) must be visually distinguishable beyond colour alone (size difference satisfies this) |
| **Touch targets** | Thumb container (24–32 px) meets minimum 24 px WCAG 2.5.8 target. Use `Large` size for touch-primary interfaces. |

---

## Code Examples

### Single slider (default)

```tsx
<Slider
  label="Volume"
  value={50}
  min={0}
  max={100}
  onChange={(val) => setValue(val)}
/>
```

### Range slider

```tsx
<Slider
  type="Range"
  label="Price range"
  value={[20, 80]}
  min={0}
  max={200}
  showMinMaxLabels
  minLabel="$0"
  maxLabel="$200"
  onChange={(val) => setRange(val)}
  onChangeEnd={(val) => fetchResults(val)}
/>
```

### With step markers and helper text

```tsx
<Slider
  label="Quality"
  value={3}
  min={1}
  max={5}
  step={1}
  showStepMarkers
  showMinMaxLabels
  minLabel="Low"
  maxLabel="High"
  showHelperText
  helperText="Affects processing time"
  size="Medium"
/>
```

### Error state

```tsx
<Slider
  label="Timeout (seconds)"
  value={0}
  min={1}
  max={60}
  state="Error"
  showHelperText
  helperText="Value must be at least 1 second."
/>
```

### Disabled

```tsx
<Slider
  label="Concurrency"
  value={4}
  min={1}
  max={16}
  disabled
  showHelperText
  helperText="Concurrency is managed by your plan."
/>
```

### Large size (touch / mobile)

```tsx
<Slider
  label="Brightness"
  value={70}
  size="Large"
  showMinMaxLabels
  minLabel="0%"
  maxLabel="100%"
  onChange={(val) => setBrightness(val)}
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Text Input Field](./text-input-field.md) | User needs to type an exact numeric value |
| [Radio Group](./radio-group.md) | Fixed set of labeled options (Low / Medium / High) |
| [Select Box](./select-box.md) | Discrete named options in a compact dropdown |
| [Toggle](./toggle.md) | Binary on/off — not a value range |
