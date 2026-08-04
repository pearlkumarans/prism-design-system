# `<ds-right-pane>`

Transparent vertical utility rail (no fill / no border — sits on the app shell). Top stack: Update (alert-tint) / Product (sprite `icon-product`; `product-logo` swaps to a full-color logo) / Mobile app / Get started / Help / Road map / Review. Bottom stack: Announcement / Accessibility / Upload logs / Call / Tickets / Chat (plus a theme toggle on top of the bottom stack). 28×28 icon buttons (20px icon, 4px padding).

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `theme` | `light` \| `dark` | `light` | Drives the toggle icon + label. |
| `hide-theme-toggle` | boolean | — | Removes the toggle from the bottom stack. |
| `rtl` | boolean | — | Mirrors to the left edge. |
| `show-update`, `show-product`, `show-mobile-app`, `show-get-started`, `show-help`, `show-road-map`, `show-review` | `false` to hide | shown | Toggle individual top icons. |
| `product-logo` | logo name from `icons/logos/` (e.g. `sdp`, `endpoint-central`, `mdm`) | — (sprite `icon-product`) | Optional: swap the product slot's sprite icon for a full-color product logo. |
| `show-announcement`, `show-accessibility`, `show-upload-logs`, `show-call`, `show-tickets`, `show-chat` | `false` to hide | shown | Toggle individual bottom icons. |

## Properties

```js
pane.topItems = [{ id, icon, label, active? }, ...];   // override defaults
pane.bottomItems = [{ id, icon, label, active? }, ...];
```

## Events

- `ds-right-pane-select` — `detail: { id }` when any utility button is clicked.
- `ds-right-pane-theme` — `detail: { theme }` after the toggle flips.

## Accessibility

- Renders `<aside aria-label="Utilities">`.
- Every button has an `aria-label` (icon-only buttons are not announced otherwise).
- Theme toggle's `aria-label` describes the *next* state ("Switch to dark theme"), not the current one.
