# Accordion Component

**Design System:** UEMS Design System 3.0
**Figma Node:** `17355:226378` (Component Set)
**Total Variants:** 40

## Overview

Collapsible content panel with a clickable header and an expandable body. Used in settings panels, FAQs, detail views, filters, and any context where grouped content needs to be revealed on demand.

## Custom Element API

```html
<ds-accordion variant="outlined" expanded>
  <span slot="title">Title text</span>
  <ds-icon slot="badge" name="info"></ds-icon>
  <button slot="action">Edit</button>
  <div slot="body">First body block</div>
  <div slot="body">Second body block</div>
</ds-accordion>
```

### Attributes

| Attribute | Values | Default | Description |
|---|---|---|---|
| `variant` | `filled`, `outlined` | `filled` | Visual container treatment |
| `type` | `default`, `checkbox` | `default` | Leading element: chevron vs checkbox |
| `expanded` | boolean | unset | Body visibility |
| `disabled` | boolean | unset | Non-interactive, 50% opacity |
| `rtl` | boolean | unset | Mirrors header layout for RTL languages |

### Slots

| Slot | Description |
|---|---|
| `title` | Header title text |
| `badge` | Optional status badge in the header |
| `action` | Optional action button (clicks here do not toggle) |
| `body` | Body content; can be repeated for multiple blocks |

### Events

| Event | Detail | When |
|---|---|---|
| `ds-accordion-toggle` | `{ expanded: boolean }` | After expanded state changes |

### JS API

```js
const acc = document.querySelector('ds-accordion');
acc.expanded = true;        // setter reflects to attribute + emits event
acc.toggle();               // flip expanded
acc.addEventListener('ds-accordion-toggle', (e) => console.log(e.detail.expanded));
```

## BEM Classes (no-JS path)

```html
<details class="ds-accordion ds-accordion--filled">
  <summary class="ds-accordion__header">
    <span class="ds-accordion__leading ds-accordion__leading--chevron">…</span>
    <span class="ds-accordion__title">Title</span>
  </summary>
  <div class="ds-accordion__body">Body</div>
</details>
```

| Class | Use |
|---|---|
| `.ds-accordion` | Root container |
| `.ds-accordion--filled` / `--outlined` | Variant modifiers |
| `.ds-accordion__header` | Clickable header row |
| `.ds-accordion__leading` | Chevron / checkbox container (20×20) |
| `.ds-accordion__title` | Title text |
| `.ds-accordion__badge` | Badge wrapper |
| `.ds-accordion__action` | Action button wrapper |
| `.ds-accordion__body` | Body region (hidden until expanded) |

## Tokens Used

| Token | Where |
|---|---|
| `--bg-secondary-alt` | Filled background |
| `--bg-base` | Outlined background |
| `--bg-secondary-hover` | Header hover |
| `--border-secondary` | Outlined border |
| `--border-disabled` | Outlined hover border |
| `--border-accent-focus` | 2px focus ring |
| `--text-primary` | Title color |
| `--icon-primary` | Chevron color |
| `--radius-md` | Container corner radius |
| `--spacing-4`, `--spacing-8`, `--spacing-12`, `--spacing-16` | Padding and gap |
| `--duration-fast`, `--duration-base`, `--easing-standard` | Motion |

## Accessibility

- Header is a `<button>` with `aria-expanded` reflecting state and `aria-controls` linking to the body's `id`.
- Body has `role="region"`.
- `Enter` and `Space` toggle the accordion.
- `disabled` removes from tab order (`tabindex="-1"`) and sets `aria-disabled="true"`.
- 2px `--border-accent-focus` ring on `:focus-visible`, rendered via `box-shadow` so it isn't clipped.
- Clicks within the `action` slot are intentionally not bubbled to toggle — buttons there can be used for primary actions without expanding the panel.
