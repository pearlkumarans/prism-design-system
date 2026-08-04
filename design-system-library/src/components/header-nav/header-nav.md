# Header Nav

**Design System:** UEMS Design System 3.0

The Header Nav is the top product chrome (`role="banner"`) for the ManageEngine endpoint-management family. It renders a brand cluster (logo + product name), a centre region, and a right utility cluster. The centre adapts to the product type: combined products show a horizontal **tab nav** with a search icon; point / left-only products show a centre-aligned **search field**.

The runtime implementation lives at:

- `header-nav.css` — BEM, token-driven (no hardcoded hex)
- `header-nav.js` — `<ds-header-nav>` host that renders the chrome, manages tab overflow (··· menu + sliding underline), and wires the customer selector + utility cluster

It auto-loads `search-field.css` so the centre search field is styled even when the page links `header-nav.css` alone.

---

## API

### Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `variant` | product key (see list below) | `endpoint-central` | Product chrome: logo + name + centre layout. |
| `product-name` | string | per-variant default | Overrides the displayed product name. |
| `search-placeholder` | string | `Search…` | Placeholder for the centre search field. |
| `center` | `search` | — | Forces the centred search field even on a combined product (left-nav mode). |
| `show-search` | `false` to hide | ON | Search (icon on combined products, field elsewhere). |
| `show-notifications` | `false` to hide | ON | Notifications icon. |
| `show-settings` | `false` to hide | ON | Settings icon. |
| `show-bookmark` | `false` to hide | ON | Bookmarks icon. |
| `show-avatar` | `false` to hide | ON | User avatar (initials fallback). |
| `show-bento` | `false` to hide | ON | App-switcher (bento) icon. |
| `show-customer-selector` | `true`/`false` | ON for `endpoint-central-msp`, else OFF | MSP customer/tenant selector dropdown. |
| `rtl` | boolean | unset | Mirrors layout (sets `dir="rtl"`). |

Right-cluster toggles use a default-ON convention: set `show-*="false"` to hide.

**Variants:** `endpoint-central`, `endpoint-central-msp`, `ec-left-only`, `mdm`, `patch-manager-plus`, `browser-security-plus`, `application-control-plus`, `device-control-plus`, `dex-manager-plus`, `endpoint-dlp-plus`, `malware-protection-plus`, `os-deployer`, `patch-connect-plus`, `ransomware-protection-plus`, `remote-access-plus`, `vulnerability-manager-plus`.

### Properties (JS)

| Property | Type | Description |
|----------|------|-------------|
| `tabs` | `[{ id, label, active?, href? }]` | Primary nav tabs (combined products only). Reassign to re-render. |
| `customers` | `[{ label, value }]` | Customer-selector list; falls back to a sample EC list. |

Other inputs read from attributes at render: `user-initials`, `customer-label`.

### Methods

- `setActiveTab(id)` — highlight a tab without firing `ds-header-nav-tab-select` (for programmatic sync).

### Events

| Event | Detail | When |
|-------|--------|------|
| `ds-header-nav-tab-select` | `{ id }` | A tab is activated by the user. |
| `ds-header-nav-search` | `{ value }` | Enter pressed in the search field. |
| `ds-header-nav-action` | `{ action }` | Any utility-cluster icon clicked. |
| `ds-header-nav-customer` | `{ value, label }` | A customer is picked from the selector. |

---

## Centre layout by product type

| Product type | Examples | Centre | Search |
|--------------|----------|--------|--------|
| Combined | `endpoint-central`, `endpoint-central-msp` | Horizontal tab nav | Plain icon in right cluster |
| Point / left-only | `ec-left-only`, `mdm`, `patch-manager-plus`, … | Centred search field | The field itself |

`center="search"` overrides a combined product to the centred-search layout (left-nav mode, where module tabs move to a left rail).

---

## Tab overflow

When tabs don't all fit, trailing tabs are clipped into a ··· overflow dropdown (`<ds-dropdown-menu>`), the active tab is always kept visible, and a 2px underline indicator glides under the active tab (snap on reflow, slide on click). A `ResizeObserver` plus `document.fonts.ready` / `window load` hooks re-clip after layout shifts.

## Accessibility

- Host is `role="banner"`; the tab region is a `<nav aria-label="Primary navigation">` with `aria-current="page"` on the active tab.
- The customer selector and overflow buttons expose `aria-haspopup` + `aria-expanded`.
- Utility icon buttons carry `aria-label`s and a mutually-exclusive `aria-pressed` highlight for destination actions.

## Do / Don't

- ✅ Set `tabs` as a property (not an attribute) on combined products.
- ✅ Enable `show-customer-selector` only where tenant switching applies (MSP / explicitly).
- ❌ Don't hide search on a point product — its centre is the search field.
- ❌ Don't hand-build the tab overflow / underline — the component manages it.
