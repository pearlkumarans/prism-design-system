# Button

**Design System:** UEMS Design System 3.0
**Figma Node:** `15897:18750`
**Total variants:** 320 (8 variants × 4 sizes × 5 states × 2 RTL)

The Button is the primary interactive element for triggering actions. The runtime implementation lives at:

- `button.css` — BEM, token-driven (no hardcoded hex)
- `button.js` — `<ds-button>` host that renders a real `<button>` child so all native form semantics keep working

---

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `variant` | `primary` \| `secondary` \| `tertiary` \| `outline` \| `destructive` \| `success` \| `warning` \| `secondary-color` | `primary` | Visual style + semantics |
| `size` | `large` \| `medium` \| `small` \| `xsmall` | `medium` | Height + padding + font size |
| `type` | `button` \| `submit` \| `reset` | `button` | Forwarded to the inner `<button>` |
| `disabled` | boolean | unset | Disables interaction; mirrors to inner button |
| `loading` | boolean | unset | Shows spinner; hides label/icons; sets `aria-busy` |
| `prefix-icon` | sprite name | — | Leading icon (uses `<ds-icon>`) |
| `suffix-icon` | sprite name | — | Trailing icon |
| `rtl` | boolean | unset | Mirrors layout |

### Slots

- default — label content (text or rich nodes)

### Events

The custom element does not invent its own click event; consumers listen for native `click` on `<ds-button>` (it bubbles from the inner `<button>`). When `disabled` or `loading`, click events are stopped before they leave the component.

### Methods

- `click()`, `focus(opts)`, `blur()` — proxy to the inner `<button>`

---

## Token mapping

| Variant | Background | Hover bg | Foreground | Border |
|---------|-----------|----------|------------|--------|
| `primary` | `--bg-button-primary` | `--bg-button-primary-hover` | `--text-white` | — |
| `secondary` | `--bg-secondary` | `--bg-secondary-hover` | `--text-primary` | — |
| `tertiary` | transparent | `--bg-accent-primary-subtle` | `--text-accent-link` | — |
| `outline` | transparent | `--bg-secondary-hover` | `--text-primary` | `--border-secondary` |
| `destructive` | `--bg-error-solid` | `--bg-error-solid-hover` | `--text-white` | — |
| `success` | `--bg-success-solid` | `--bg-success-solid-hover` | `--text-white` | — |
| `warning` | `--bg-warning-solid` | `--bg-warning-solid-hover` | `--text-white` | — |
| `secondary-color` | `--bg-accent-primary` | `--bg-accent-primary-hover` | `--text-accent-primary` | — |

Disabled (all variants): `--bg-disabled` / `--text-disabled`. Focus ring: `--border-accent-focus`.

---

## Sizes

| Size | Height | Padding-x | Font-size | Icon size |
|------|--------|-----------|-----------|-----------|
| `large` | 48px | 16px | 16px | 20px |
| `medium` | 40px | 16px | 14px | 20px |
| `small` | 36px | 12px | 14px | 16px |
| `xsmall` | 28px | 8px | 12px | 16px |

All sizes use `--radius-sm` (8px).

---

## Loading state

`loading` swaps the contents for an inline CSS spinner (animated by `@keyframes ds-button-spin`, respects `prefers-reduced-motion`). The button stays the same width because label/icons are kept in the DOM with `visibility: hidden`.

## Do / Don't

- ✅ One Primary per section. Pair with Secondary/Outline for secondary actions.
- ✅ Use Destructive only for irreversible actions.
- ❌ Don't use Loading without disabling user interaction (the component handles this — but don't hand-roll it).
- ❌ Don't use color alone to convey meaning — keep label text descriptive.
