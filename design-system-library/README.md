# UEMS Design System

Token-driven, framework-agnostic component library built with **CSS custom properties** and **Web Components**. Drop it into Ember, React, Vue, or plain HTML — same elements, same theming, no framework runtime.

## What's inside

```
src/
├── tokens/          Primitive palette, semantic tokens, spacing, typography
├── styles/          Reset + base utilities, single import surface
├── icons/           SVG sprite + <ds-icon> custom element
├── components/      One folder per component (CSS + JS + examples + .md)
├── utils/           Tiny shared helpers
└── index.js         Library entry — imports styles + registers all elements

docs/                Live playground (Vite root)
```

## Install

```bash
npm install
npm run dev          # opens docs/index.html with hot reload
npm run build        # produces dist/ (es + umd JS, single CSS, sprite)
```

(Use `npm run build -- --mode lib` once you're ready to publish to a registry.)

## Use in any framework

### Plain HTML

```html
<link rel="stylesheet" href="dist/ds.css" />
<script type="module" src="dist/ds.es.js"></script>

<ds-accordion variant="outlined" expanded>
  <span slot="title">Settings</span>
  <div slot="body">Hello world</div>
</ds-accordion>

<ds-avatar size="medium" name="Jane Doe" src="/photos/jane.jpg"></ds-avatar>
```

### React / Vue / Ember

Custom elements work natively. In React 19+:

```jsx
<ds-accordion variant="outlined" expanded={isOpen}>
  <span slot="title">Settings</span>
  <div slot="body">{children}</div>
</ds-accordion>
```

Ember:

```hbs
<DsAccordion @variant="outlined" @expanded={{this.isOpen}}>
  <:title>Settings</:title>
  <:body>{{yield}}</:body>
</DsAccordion>
```

(Or use the bare `<ds-accordion>` tag — Ember happily renders custom elements.)

## Theming

Add `data-theme` to any element to scope the theme:

```html
<body data-theme="dark">…</body>
<section data-theme="night">…</section>
```

Available themes: `light` (default), `dark`, `night`, `green-accent`. All defined in `src/tokens/tokens.css`.

## Naming conventions

| Surface | Convention | Example |
|---|---|---|
| CSS classes (BEM) | `ds-{component}__{part}--{modifier}` | `ds-accordion__header--filled` |
| Custom elements | `ds-{kebab-case}` | `<ds-accordion>` |
| Element attributes | kebab-case | `variant="filled"`, `expanded` |
| CSS custom properties | `--{role}-{tier}` | `--bg-secondary-alt`, `--text-primary` |
| Slots | semantic name | `<slot name="title">` |
| Events | `ds-{component}-{verb}` | `ds-accordion-toggle` |

## Adding a new component

1. Drop a folder at `src/components/{name}/`:
   ```
   {name}.css                 BEM classes, token-driven
   {name}.js                  Ds{Name} extends HTMLElement
   {name}.examples.html       Visual smoke test
   {name}.md                  Spec (copy from your design doc)
   ```
2. Add one line to `src/components/index.js`:
   ```js
   import './{name}/{name}.js';
   export { Ds{Name} } from './{name}/{name}.js';
   ```
3. Add one line to `src/styles/index.css`:
   ```css
   @import "../components/{name}/{name}.css";
   ```

That's the entire onboarding for a new component. The token layer, theming, build pipeline, and docs page automatically pick it up.

## Component checklist

For every new component, verify:

- [ ] No hardcoded hex/px values — only `var(--…)` tokens.
- [ ] BEM classes work without the JS file (progressive enhancement).
- [ ] Custom element exposes all variants as attributes.
- [ ] Slots cover every "swap-in" requirement from the spec.
- [ ] Keyboard interaction works (Tab, Enter, Space as appropriate).
- [ ] `aria-*` attributes track state (`expanded`, `disabled`, `selected`, etc.).
- [ ] `:focus-visible` ring uses `--border-accent-focus`.
- [ ] RTL flips child order via `[rtl]` attribute or logical properties.
- [ ] `examples.html` shows every variant from the spec.
- [ ] `.md` documents attributes, slots, events, tokens, accessibility.

## DX practices baked in

- **Single source for tokens** — adding a 5th theme is one file edit.
- **Framework-free** — no React/Vue/Ember runtime, no transpilation needed for consumers.
- **No build required to use** — `dist/ds.css` + `dist/ds.es.js` are drop-in.
- **Each component is self-contained** — own folder, own CSS, own JS, no cross-imports between components.
- **Spec lives next to code** — the `.md` and the `.js` are siblings, so docs can never silently desync.
- **Public API = element name + attributes + events**. Internal shadow-DOM markup is private and can be refactored.

## Components shipped

| Component | Status | Spec |
|---|---|---|
| `<ds-icon>` | ✅ | inline in `src/icons/icon.js` |
| `<ds-accordion>` | ✅ | `src/components/accordion/accordion.md` |
| `<ds-avatar>` | ✅ | `src/components/avatar/avatar.md` |
| `<ds-badge>` | ✅ | `src/components/badge/badge.md` |
| `<ds-breadcrumb>` | ✅ | `src/components/breadcrumb/breadcrumb.md` |
| `<ds-button>` | ✅ | `src/components/button/button.md` |
| `<ds-calendar>` | ✅ | `src/components/calendar/calendar.md` |
| `<ds-checkbox>` | ✅ | `src/components/checkbox/checkbox.md` |
| `<ds-checkbox-group>` | ✅ | `src/components/checkbox-group/checkbox-group.md` |
| `<ds-counter>` | ✅ | `src/components/counter/counter.md` |
| `<ds-data-table>` | ✅ | `src/components/data-table/data-table.md` |
| `<ds-date-picker>` | ✅ | `src/components/date-picker/date-picker.md` |
| `<ds-divider>` | ✅ | `src/components/divider/divider.md` |
| `<ds-illustration>` | ✅ | `src/components/illustration/illustration.md` |
| `<ds-icon-button>` | ✅ | `src/components/icon-button/icon-button.md` |
| `<ds-inline-alert>` | ✅ | `src/components/inline-alert/inline-alert.md` |
| `<ds-otp-input>` | ✅ | `src/components/otp-input/otp-input.md` |
| `<ds-empty-state>` | ✅ | `src/components/empty-state/empty-state.md` |
| `<ds-dropdown-menu>` | ✅ | `src/components/dropdown-menu/dropdown-menu.md` |
| `<ds-sidebar-l1>` | ✅ | `src/components/sidebar-l1/sidebar-l1.md` |
| `<ds-sidebar-l2>` | ✅ | `src/components/sidebar-l2/sidebar-l2.md` |
| `<ds-progress-bar>` | ✅ | `src/components/progress-bar/progress-bar.md` |
| `<ds-radio-group>` | ✅ | `src/components/radio-group/radio-group.md` |
| `<ds-rich-text-editor>` | ✅ | `src/components/rich-text-editor/rich-text-editor.md` |
| `<ds-right-pane>` | ✅ | `src/components/right-pane/right-pane.md` |
| `<ds-status-indicator>` | ✅ | `src/components/status-indicator/status-indicator.md` |
| `<ds-toggle>` | ✅ | `src/components/toggle/toggle.md` |
| `<ds-tag>` | ✅ | `src/components/tag/tag.md` |
| `<ds-text-link>` | ✅ | `src/components/text-link/text-link.md` |
| `<ds-tooltip>` | ✅ | `src/components/tooltip/tooltip.md` |
| `<ds-toast>` | ✅ | `src/components/toast/toast.md` |
| `<ds-slider>` | ✅ | `src/components/slider/slider.md` |
| `<ds-text-input>` | ✅ | `src/components/text-input/text-input.md` |
| `<ds-text-area>` | ✅ | `src/components/text-area/text-area.md` |
| `<ds-section-header>` | ✅ | `src/components/section-header/section-header.md` |
| `<ds-split-button>` | ✅ | `src/components/split-button/split-button.md` |
| `<ds-script-editor>` | ✅ | `src/components/script-editor/script-editor.md` |
| `<ds-page-header>` | ✅ | `src/components/page-header/page-header.md` |

More to come — drop the next spec into the conversation and a new folder appears.

## Icons

The sprite at `src/icons/icons.svg` ships **425+ product icons** plus a couple of stroked utility icons (`check`, `close`). Every symbol declares `fill="currentColor"` so icons inherit the consuming element's `color` (and therefore respect theming).

```html
<!-- Custom element (recommended) -->
<ds-icon name="folder-open" size="20"></ds-icon>

<!-- Plain SVG with <use> (no JS required) -->
<svg width="20" height="20" aria-hidden="true">
  <use href="/icons.svg#icon-folder-open"></use>
</svg>
```

Browse the full catalog and copy snippets in the playground (`npm run dev`) under the **Icons** section — the grid is searchable and clicking a tile copies `<ds-icon name="…">` to your clipboard.

**Adding new icons**: drop a new `<symbol id="icon-{name}" viewBox="0 0 20 20" fill="currentColor">…</symbol>` into `src/icons/icons.svg`. No build step or component change required.
