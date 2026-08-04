# `<ds-empty-state>`

A "no content yet" / onboarding / zero-data block. One component, four layouts via `type`
(mirrors the Figma **Empty State** component set): **centered · steps · option-cards · promo**.
Composes `<ds-illustration>`, `<ds-button>`, `<ds-badge>`, `<ds-text-link>` (footer + inline
links), `<ds-list>` (promo feature benefits), `<ds-icon>` and design tokens only.

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `type` | `centered` \| `steps` \| `option-cards` \| `promo` | `centered` | Chooses the layout. |
| `title` | string | — | Heading (`<h2>`). |
| `description` | string (may contain one inline `<a>`) | — | Body. Use the `description` slot for rich inline links. |
| `illustration` | sprite name | — | Centered media (`<ds-illustration>`). |
| `media` | sprite name | — | Promo logo/media (`<ds-illustration size="small">`). |
| `primary-label` / `secondary-label` | string | — | Button labels. Secondary shown only on `centered`. |
| `banner-text` | string | — | Option-cards info banner text. |
| `banner-action-label` | string | — | Banner button label. |
| `supported` | comma list of OS ids | — | `windows,macos,linux,android,ios,chromeos`. |
| `supported-label` | string | `Supported` | |
| `useful-link` / `watch-video` | href | — | Footer links; set (even `#`) to render. Labels via `useful-link-label` / `watch-video-label`. |
| `benefits-label` | string | `Feature Benefits` | Promo benefits heading. |
| `show-illustration`, `show-media`, `show-primary`, `show-secondary`, `show-banner`, `show-feature-benefits`, `show-footer`, `show-supported` | `false` to hide | shown | Toggles for optional regions (mirror the Figma boolean properties). |
| `size` | `sm` \| `md` \| `lg` | `md` | Centered illustration size. |
| `rtl` | boolean | — | Right-to-left layout. |

## Properties (DOM-only collections)

| Property | Shape | Used by |
|---|---|---|
| `steps` | `[{ badge, label, icon }]` | `type="steps"` |
| `options` | `[{ icon, title, description, actionLabel, actionIcon }]` | `type="option-cards"` |
| `benefits` | `string[]` | `type="promo"` |

## Slots

- `description` — a span/paragraph with inline links instead of the plain-string attribute.

## Events (bubble + composed)

- `ds-empty-state-primary` / `ds-empty-state-secondary` — action buttons.
- `ds-empty-state-banner` — option-cards banner action.
- `ds-empty-state-option` — an option card's button (`detail: { index }`).
- `ds-empty-state-dismiss` — reserved for a banner dismiss.

## Tokens

Text: `--uems-text-primary` (title), `--uems-text-secondary` (description/benefits),
`--uems-text-quaternary` (Supported), `--uems-text-disabled` (separator),
`--uems-text-accent-link` (links). Spacing: `--spacing-*`. Type: Zoho Puvi via
`--font-size-*` / `--font-weight-*`. No hardcoded values — re-themes across all modes.

## Examples

```html
<!-- Centered -->
<ds-empty-state
  illustration="common-search"
  title="No matches"
  primary-label="Clear filters"
  useful-link="#" watch-video="#">
  <span slot="description">Try a different term or <a href="/docs">read the docs</a>.</span>
</ds-empty-state>

<!-- Steps (set the collection as a JS property) -->
<ds-empty-state type="steps" title="Samsung Knox Mobile Enrollment"
  primary-label="Start enrollment"></ds-empty-state>
<script>
  document.querySelector('ds-empty-state').steps = [
    { badge: 'Step 1', label: 'Set up a Knox account', icon: 'help-circle' },
    { badge: 'Step 2', label: 'Enroll devices', icon: 'info-circle' },
    { badge: 'Step 3', label: 'Bulk prepare / assign', icon: 'circle-tick' },
  ];
</script>
```
