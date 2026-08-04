---
name: ds-component-gotchas
description: Non-obvious ds-* component behaviors when composing project pages (toggle/radio-group/input-select)
metadata:
  type: reference
---

Gotchas hit while building `projects/patch-management/layout-deployment-schedule.html` (all verified in preview):

- **`ds-toggle`**: state attribute is `checked` (NOT `toggled`); change event detail is `{ checked }` (NOT `{ toggled }`). Visible in-track label comes from the `text` attr (defaults "Enable"), NOT `label` (that's aria-label only). Read initial state upgrade-safely via `el.hasAttribute('checked')` — `el.checked` is `undefined` before the element upgrades.

- **`ds-input-select`**: components load via async `import`, so setting `.options` / `.value` / `.values` in a view IIFE BEFORE upgrade creates own-properties that shadow the setters → the trigger never re-renders (a plain read still returns your array, so it looks set but isn't shown). Fix: feed selects inside `customElements.whenDefined('ds-input-select').then(...)`. Also `show-badge` renders a STATIC "+3" overflow badge regardless of actual selection count — omit it and let tags render.

- **`ds-radio-group`**: with `label-position="left"` (the default) it reserves a ~280px label column even when you pass no `label` (header has `hidden` attr but a `display` rule overrides it, leaving a stray help-circle). When supplying your own label column, add `label-position="top"` AND hide `.ds-radio-group__header { display:none }` in scoped CSS.

- **CSS leaks across injected pages (shared `document.head`)**: every project view's `<style>` is appended to the one shared head and never removed, so an **unscoped** class rule leaks to every sibling view and the last-injected page wins. Symptom seen: the BitLocker Managed Systems table collapsed to a 6-column strip after visiting the device-detail page — the detail's `.bl-grid { grid-template-columns: repeat(6,…) }` overrode the hub's `.bl-grid`. A shared prefix across your own pages (`.bl-*` in 3 pages) does NOT isolate them. Fix: scope EVERY selector to the root id (`#<slug>-pop .thing`), media queries included. Verify by navigating A→B→back-to-A. (Now a hard rule in the generate-layout skill.) See [[bitlocker-module-build]].

Chart categorical palette for color-coding (e.g. calendar week bands): `--uems-bg-chart-{blue,green,orange,charoite,yellow,grey,red}-{primary…senary}` (senary = lightest fill, primary = solid swatch). See [[deployment-schedule-page]].
