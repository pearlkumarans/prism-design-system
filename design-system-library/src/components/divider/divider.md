# Divider

Thin line that separates content sections, list items, or toolbar groups. 48-variant matrix.

**Figma source:** UEMS Design System 3.0 · Node `17009:925007`

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Direction of the line |
| `type` | `full` \| `inset` \| `middle-inset` \| `with-text` | `full` | Layout / indent / labelled |
| `pattern` | `solid` \| `dashed` \| `dotted` | `solid` | Line pattern. (`pattern`, not `style`, because `style` is a reserved DOM attribute.) |
| `thickness` | `thin` \| `medium` | `thin` | 1 px (thin) or 2 px (medium) |
| `label` | string | `"Label"` | Text shown in the centre of `with-text` dividers (also accepts default-slot text) |

### Token mapping

| Variant | Color |
|---|---|
| Solid line | `--border-tertiary` |
| Dashed / Dotted line | `--border-tertiary` |
| `with-text` segments | `--border-tertiary` |
| Label text | `--text-secondary` |

### Accessibility

- Always sets `role="separator"`.
- Vertical adds `aria-orientation="vertical"`.
- Decorative dividers should be wrapped by the consumer with `aria-hidden="true"` if the line carries no semantic meaning.
