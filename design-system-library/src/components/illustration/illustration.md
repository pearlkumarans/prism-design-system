# Illustration

Multi-color SVG graphics for empty states, error pages, onboarding screens, and hero blocks. Sibling of `<ds-icon>` but categorically different:

| | Icon | Illustration |
|---|---|---|
| Default size | 20 × 20 | 220 × 184 |
| Color | inherits `currentColor` | preserves its own multi-color palette |
| Sprite | `/icons.svg` | `/illustrations.svg` |
| Use cases | UI affordances, buttons, badges | Empty states, error pages, onboarding |

## API

| Attribute | Description |
|-----------|-------------|
| `name` | Sprite symbol name (without the `illu-` prefix). Required. |
| `size` | `small` (140 px) / `medium` (220 px, default) / `large` (320 px) / `xlarge` (480 px) |
| `width`, `height` | Fixed pixel size (overrides `size`) |

## Usage

```html
<ds-illustration name="access-denied" size="medium"></ds-illustration>

<!-- Empty state -->
<div class="empty-state">
  <ds-illustration name="chart-emptystate" size="large"></ds-illustration>
  <h3>No data yet</h3>
  <p>Once you add a chart it will show here.</p>
</div>
```

## Adding new illustrations

1. Drop the new SVG into `src/illustrations/source/{name}.svg`.
2. Run the sprite generation script:
   ```bash
   node scripts/build-illustrations.mjs
   ```
3. The script extracts each SVG's inner content, wraps it in `<symbol id="illu-{name}" viewBox="…">…</symbol>`, and writes the combined sprite to `src/illustrations/illustrations.svg`.
4. Use it: `<ds-illustration name="{name}">`.

## Bundled illustrations

Currently shipped (50 graphics):

- access-denied · access-denied-computer
- add-certificate · add-email-address · add-patch · add-widget
- all-image-selected
- application-list · application-unverified · application-verified
- chart-emptystate
- common-search · computer-search
- config
- create-dashboard · create-image · create-notification-alert
- data-replication · data-table · device-protected
- file-search · formula-column
- generate-key · install-server · invite-email
- license-downgrade · license-shortage
- network-bandwidth-insufficient · network-bandwidth-sufficient · network-device-group
- parametre-missing · report-error · restrict-application · review-email-address
- security-alert-better · -good · -great · -http · -low · -medium
- security-alert-sgs-not-configure · -ui-expire · -ssl-padlock
- select-endpoint · select-value
- settings-restricted · telecom-expense-mgmt · threat-scanner-integration
- two-factor-auth · upload-cloud
