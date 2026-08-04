# Search Field

> A text input specialized for search. It pairs a leading search icon with a
> placeholder, an optional keyboard shortcut hint, a clear affordance once
> filled, and a loading indicator while results are fetched. Supports three
> sizes, seven states, and full RTL mirroring.

- **Component set:** `Search Field`
- **Node ID:** `16827:123098`
- **Page / File:** UEMS — Design System 3.0 (`DahIgbIJrSkzyP3OoHaDaG`)
- **Variants:** 42 (Size 3 × State 7 × RTL 2)

---

## Anatomy

```
┌─────────────────────────────────────────────┐
│  🔍   Search...                       ⌘K     │
└─────────────────────────────────────────────┘
  │     │                                │
  │     │                                └─ Shortcut hint (optional) / Clear / Loader
  │     └─ Placeholder or value text
  └─ Leading search icon
```

| Element | Role | Notes |
|---------|------|-------|
| Search icon | Leading affordance | Always present; 16px (Small) / 20px (Medium, Large) |
| Placeholder / Value | Input text | `Search...` placeholder → `Search text` once filled |
| Shortcut hint | Trailing, optional | `⌘K` chip — shown when `Show Shortcut = true` |
| Clear icon | Trailing | Appears in **Filled** / **Error** states to reset the field |
| Loader | Trailing | Replaces clear in **Loading** state |

---

## Examples

### Sizes

| Size | Height | Padding (T R B L) | Gap | Icon | Text style | Font |
|------|--------|-------------------|-----|------|------------|------|
| Small | 32px | 8 · 8 · 8 · 8 | 8px | 16px | `Text/small/Regular` | 12px |
| Medium | 40px | 8 · 12 · 8 · 12 | 8px | 20px | `Text/Default/Regular` | 14px |
| Large | 48px | 12 · 12 · 12 · 12 | 8px | 20px | `Text/Default/Regular` | 14px |

All sizes share a `6px` corner radius and a `1px` border (focus uses `2px`).

### States

| State | Background | Border | Text | Trailing | Notes |
|-------|-----------|--------|------|----------|-------|
| **Default** | `BG-Primary` (#FFFFFF) | `Border-Tertiary` (#E1E4EB), 1px | `Text-Placeholder` | Shortcut (optional) | Resting state |
| **Hover** | `BG-Primary` | `Border-Primary` (#B4BBCC), 1px | `Text-Placeholder` | Shortcut (optional) | Pointer over field |
| **Focus** | `BG-Primary` | `Border-Accent-Focus` (#006AFF), 2px | `Text-Placeholder` | Shortcut (optional) | Active typing; focus ring |
| **Filled** | `BG-Primary` | `Border-Primary` (#B4BBCC), 1px | `Text-Primary` | Clear icon | Has a value |
| **Loading** | `BG-Primary` | `Border-Accent` (#006AFF), 1px | `Text-Primary` | Spinner | Fetching results |
| **Disabled** | `BG-Secondary` (#F0F2F5) | `Border-Primary` (#B4BBCC), 1px | `Text-Disabled` | — | Non-interactive |
| **Error** | `BG-Primary` | `Border-Error` (#E42527), 1px | `Text-Primary` | Clear icon | Invalid query / no results |

### With shortcut hint

The `⌘K` chip (`Text/small/Regular`, `Text-Placeholder`) is rendered only when
`Show Shortcut = true`. Use it where the search field is globally reachable via
a keyboard shortcut; hide it in dense or inline contexts.

---

## API

### Variant axes

| Axis | Values | Count | Default |
|------|--------|-------|---------|
| `Size` | Small, Medium, Large | 3 | Small |
| `State` | Default, Hover, Focus, Filled, Loading, Disabled, Error | 7 | Default |
| `RTL` | False, True | 2 | False |

### Component properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Shortcut` | Boolean | `false` | Toggles the trailing `⌘K` keyboard-shortcut hint |

### Design tokens used

| Role | Token | Value |
|------|-------|-------|
| Background (default) | `Background/BG-Primary` | #FFFFFF |
| Background (disabled) | `Background/BG-Secondary` | #F0F2F5 |
| Border (default) | `Border/Border-Tertiary` | #E1E4EB |
| Border (hover / filled / disabled) | `Border/Border-Primary` | #B4BBCC |
| Border (focus) | `Border/Border-Accent-Focus` | #006AFF |
| Border (loading) | `Border/Border-Accent` | #006AFF |
| Border (error) | `Border/Border-Error` | #E42527 |
| Text (placeholder) | `Text/Text-Placeholder` | — |
| Text (value) | `Text/Text-Primary` | — |
| Text (disabled) | `Text/Text-Disabled` | — |
| Radius | — | 6px |

---

## Usage

### When to use
- To filter, find, or query a list, table, dataset, or the whole product.
- As a global search entry point (pair with the `⌘K` shortcut hint).
- Inline within toolbars, headers, navigation, or data views.

### When not to use
- For free-form text that isn't a query — use a standard Text Input.
- For selecting from a small known set — use a Select / Combobox.

### Best practices

| ✅ Do | ❌ Don't |
|------|---------|
| Keep the leading search icon visible at all times | Replace the search icon with an unrelated glyph |
| Show the Clear icon once the field has a value | Leave a filled field with no way to clear it |
| Use the Loading state for async/debounced queries | Block the UI while searching |
| Reserve the Error state for failed or empty results | Use Error styling for normal "no input yet" |
| Show `⌘K` only when a real shortcut is wired up | Display a shortcut hint that does nothing |

### Accessibility

| Concern | Guidance |
|---------|----------|
| Role | Use `<input type="search">` (or `role="searchbox"`); wrap in `<form role="search">` |
| Label | Provide an accessible name via `aria-label="Search"` or a visually-hidden `<label>` |
| Keyboard | Focusable via Tab; `Esc` clears; `Enter` submits; if `⌘K` shown, it must move focus here |
| Focus | Honour the 2px `Border-Accent-Focus` ring — never remove the visible focus indicator |
| Loading | Announce async results with `aria-live="polite"`; expose busy state via `aria-busy` |
| Error | Tie the message to the field with `aria-describedby`; don't rely on color alone |
| RTL | Use the `RTL=True` variants — icon, text, and shortcut mirror to the opposite edge |

### RTL
Every state has a mirrored `RTL=True` variant. In RTL the search icon moves to
the trailing (right) edge, text aligns right, and the shortcut/clear affordances
flip to the leading (left) edge. Drive this from the document/`dir` attribute
rather than hardcoding direction.

---

## Related components
- **Text Input** — general-purpose single-line text entry
- **Select / Combobox** — choosing from a known set of options
- **Filter / Tag** — narrowing results after a search
