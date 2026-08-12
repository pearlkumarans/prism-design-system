# Prism × Ember — proof-of-concept

A minimal [Ember](https://emberjs.com) app that consumes the **framework-agnostic
`@uems/design-system` Web Components** — the exact same `ds-*` elements and tokens
the vanilla shell (`Layout/Shell.html`) uses. Nothing in the design system is
forked or rewritten for Ember; Ember lives only at the *app layer*.

The POC renders the real `ds-data-table` with `ds-button` and `ds-badge`, and
demonstrates the two (and only two) integration points a framework needs with
Web Components.

> **Deciding whether to adopt this?** See **[RFC.md](RFC.md)** — the go/no-go writeup:
> what the spike proved, known gaps, migration approach + effort, risks, and the
> decision being requested.

## What it proves

| Concern | How it's solved | File |
|---|---|---|
| Register the components | one side-effect import registers all 70 `ds-*` elements | [`app/app.js`](app/app.js) |
| Pass **array/object properties** (`columns`, `rows`) | `{{set-prop}}` modifier sets the JS property (attributes can't carry arrays) | [`app/modifiers/set-prop.js`](app/modifiers/set-prop.js) |
| Handle **custom events** (`ds-data-table-selection`, `-sort`) | the built-in `{{on}}` modifier → tracked state | [`app/components/patch-table.hbs`](app/components/patch-table.hbs) |
| Reactivity | mutating tracked `rows` re-pushes into the element and it re-renders | [`app/components/patch-table.js`](app/components/patch-table.js) |
| Styling | the design system's own `ds.css` tokens + component styles, unchanged | [`app/index.html`](app/index.html) |

`{{set-prop}}` is the whole bridge. Everything else is ordinary Ember.

## Phase E pilot — native BitLocker dashboard

One view is now a **real Ember component** instead of injected legacy HTML:
[`app/components/views/bitlocker-dashboard.js`](app/components/views/bitlocker-dashboard.js)
+ [`.hbs`](app/components/views/bitlocker-dashboard.hbs). The imperative IIFE (build DOM,
`setChart`, `innerHTML`, `applyStrings`, `ShellDrawers` registration) became tracked
getters + template bindings. Language flips **re-localize automatically** — the `{{t}}`
helper and chart getters read `i18n.lang`, so there's no re-render pass.

The switch is opt-in per slug via [`config/native-views.js`](app/config/native-views.js):
the view route renders the native component when the slug is registered, else falls back
to `<ContentOutlet>` (legacy injection). Migrate one view at a time; nothing else changes.

**Two Web-Component-in-Ember gotchas this surfaced (both now solved, reusable):**

- `set-prop` must wait for the custom element to be **defined** before setting a property —
  a pre-upgrade assignment is silently lost (a chart kept its demo data). Fixed in
  [`modifiers/set-prop.js`](app/modifiers/set-prop.js).
- `ds-widget` captures its slotted children on connect, but Ember renders incrementally,
  so a slotted `<ds-chart>` isn't there yet → ds-widget injects its own demo chart. Fix:
  don't slot the chart — let ds-widget make its body chart and configure it via
  [`modifiers/config-chart.js`](app/modifiers/config-chart.js) (a MutationObserver keeps it
  applied across ds-widget's re-renders).

### Second pilot — sectioned form (effort check)

A form archetype ([`app/components/views/sectioned-form.js`](app/components/views/sectioned-form.js)
+ `.hbs`) — 5 sections, radio/checkbox groups, selects, date picker, accordions, a form
footer, a save-as menu, and **repeatable "Define Target" rows**. It was pure transcription:
**no new plumbing** — `set-prop`, the `native-view` switch, and the toast/nav patterns from
the dashboard carried over unchanged, and it hit zero new gotchas. The repeatable rows —
imperative `innerHTML` + `relabel()` in the legacy — became a tracked array + `{{#each}}`
that auto-renumbers on add/remove (cleaner than the original).

**What the two pilots say about effort:** there's no trivially-small view here (the
smallest archetype is a ~300-line form), so each view is a solid **S–M** of transcription.
But the *infrastructure* cost is front-loaded and now paid: the dashboard needed two new
modifiers (`set-prop` upgrade-safety, `config-chart`); the form needed none. Subsequent
views should keep getting cheaper as patterns accumulate.

## Tests (Phase D — characterization layer)

```bash
npm test          # ember test — headless Chrome, 13 assertions
```

A deterministic safety net over the logic that future refactors (esp. Phase E) would
most likely break — no custom-element or network dependency, so it's fast and stable:

| Suite | Locks in | File |
|---|---|---|
| catalog (SSOT) | product scope, view→tab mapping, drill-down `nav`, landing resolution | [tests/unit/config/catalog-test.js](tests/unit/config/catalog-test.js) |
| i18n | `t()` resolution + key echo, `setLang` → `dir` + subscribers | [tests/unit/services/i18n-test.js](tests/unit/services/i18n-test.js) |
| theme | `applyTheme` sets `data-theme`, **green family not stripped** (regression guard) | [tests/unit/services/theme-test.js](tests/unit/services/theme-test.js) |
| nav | `setMode` → `html.nav-left`, `railIcons` | [tests/unit/services/nav-test.js](tests/unit/services/nav-test.js) |
| inject-view | `resolveViewUrl` bare vs slashed paths | [tests/unit/lib/inject-view-test.js](tests/unit/lib/inject-view-test.js) |

Full acceptance tests (visit a route → assert the injected view rendered) need the
custom-element registration + vendored assets wired into the test `index.html` — a
follow-up once the smoke layer has done its job of guarding the refactors.

## Shell chrome

The app renders inside the **real shell frame** — [`<ShellChrome>`](app/components/shell-chrome.js)
(header + L1/L2 sidebars around `<ds-content>`), wrapping the router `{{outlet}}` in
[application.hbs](app/templates/application.hbs). It **reuses the shell's own menu
helpers** — `applyL2For` / `wireL1ToL2` from the vendored `ec-menus.js` (`/vendor/ds/data/`)
— so the L1/L2 menus, their data, and the L1→L2 swap are identical to `Shell.html`. Ember only drives the *when* (react to `shell.tabId`)
and the *where to*:

- header tab select → `router.transitionTo('product.module', …)`
- sidebar item with a `view` slug → `router.transitionTo('product.module.view', …)`
- `shell.activeNavSlug` → the active L2 highlight (incl. drill-down parent)

Verified against the BitLocker module: the header shows the active tab, the L2 sidebar
shows the real BitLocker menu with the open page highlighted, and the injected dashboard
sits in `<ds-content>`.

### Full shell (added)

`ShellChrome` now renders the complete frame and wires it to services:

- **Right utility rail** — `<ds-right-pane>`; `ds-right-pane-select` opens help /
  accessibility / updates drawers, and `direction` flips the language (RTL).
- **Drawers** — [`services/drawers.js`](app/services/drawers.js) lazy-loads the shell's
  dual-mode overlays (profile, help, search, settings, apps) into a body host and calls
  their `show()`/`hide()`. Header icons route to them: avatar → profile, gear → settings,
  bento → apps, search → search.
- **Top / left nav mode** — [`services/nav.js`](app/services/nav.js) backs
  `ShellCtx.setNavMode` (driven from Profile ▸ Preferences). Left mode reveals the
  `<ds-module-rail>` and hides the header tab band via `html.nav-left`.
- **Responsive** — reuses the shell's own vendored `shell-responsive.js`
  (`initShellResponsive`): tablet collapses L1/L2; mobile relocates the rails into a
  bottom-sheet built from the module tabs.

### Phase A — ShellCtx services

The English-only stub is replaced by real Ember services, with
[`instance-initializers/shell-ctx.js`](app/instance-initializers/shell-ctx.js) building
`window.ShellCtx` from them — the single seam the injected views talk to:

| Service | Backs | File |
|---|---|---|
| `i18n` | `addMessages` / `t` / `onLangChange` / `applyDir` (+ `dir`, `shell:langchange`) | [services/i18n.js](app/services/i18n.js) |
| `theme` | `applyTheme` (light / dark / system / green-\*) → `data-theme` | [services/theme.js](app/services/theme.js) |
| `nav` | `setNavMode` / `setRailIcons` → `html.nav-left` + module rail | [services/nav.js](app/services/nav.js) |

## Single source of truth for the routing tables

The product / view / default-view tables are no longer copied by hand. The one
authoritative copy lives in [`Layout/shell-catalog.js`](../Layout/shell-catalog.js)
and is consumed by **both** shells:

- **Vanilla shell** — `Shell.html` `import`s it directly (it's a `<script type="module">`).
- **Ember app** — [`scripts/sync-catalog.mjs`](scripts/sync-catalog.mjs) copies it
  verbatim into `app/config/catalog-data.js` (git-ignored, regenerated on every
  `npm start` / `npm run build`); [`config/catalog.js`](app/config/catalog.js) re-exports
  that and adds the app-side helpers.

Edit the catalog in one place; neither shell can drift. Verified: the vanilla shell
boots from it (19 products, 41 views) and the Ember app rebrands + scopes tabs from
the same data.

## Routing

For how `Shell.html`'s `?product` / tab / `?view` model maps onto Ember's nested
routes — with default-view redirects, drill-down highlighting, Back/Forward, and
backward-compatible legacy `?product=…&view=…` links — see **[ROUTING.md](ROUTING.md)**.
The route tree lives in [`app/router.js`](app/router.js) + [`app/routes/`](app/routes),
with nav state on [`app/services/shell.js`](app/services/shell.js) and the ported
routing tables in [`app/config/catalog.js`](app/config/catalog.js).

## Run it

**No proxy, no separate repo server, no design-system build** (Phase C). `prestart`
generates the catalog and vendors the design system + view files into `public/`.

```bash
cd webapp
npm install
npm start          # http://localhost:4200 — self-contained
```

Then open http://localhost:4200 — it redirects to `/ec/home/module-dashboard`.

Try it:
- Visit `/ec/bitlocker/bitlocker-dashboard` → the **real** BitLocker dashboard renders
  inside the Ember route (fetched + injected by `<ContentOutlet>`).
- Click a module tab → the route changes and a different view mounts.
- `/?product=pmp&view=bitlocker-dashboard` → legacy URL redirects to the nested path.

### Production build (Phase C)

```bash
npm run build                       # → dist/ (app + vendored ds/ projects/ Layout/views/)
cd dist && python3 -m http.server 4310   # any static host; no proxy
```

`dist/` is fully self-contained. (A plain static server needs an SPA fallback —
serve `index.html` for unknown paths — to support deep links; loading `/` and letting
client-side routing take over works without one.)

## How the design system is wired (Phase C — proxy-free)

Everything the app fetches at runtime is **vendored into `public/`** by
[`scripts/vendor-assets.mjs`](scripts/vendor-assets.mjs), so dev and prod are identical
and neither needs a proxy:

- **Components (JS):** `<script type="module" src="/vendor/ds/components/index.js">` in
  [index.html](app/index.html) registers all `ds-*` elements from the vendored source.
- **CSS + sprites:** `/vendor/ds/styles/index.css` + `window.UEMS_ICON_SPRITE = /vendor/ds/icons/…`.
- **Menu + responsive helpers:** `ShellChrome` loads `/vendor/ds/data/ec-menus.js` and
  `/vendor/ds/shell/shell-responsive.js`.
- **View files:** `ContentOutlet` / drawers fetch `/projects/…` and `/Layout/views/…`.

`design-system-library/src → public/vendor/ds`, `projects → public/projects`,
`Layout/views → public/Layout/views`. All git-ignored, regenerated on start/build.

> Follow-up (not blocking): the design system is vendored as **source** (many small
> modules). Bundling/minifying it into one file — which means fixing the `dist/ds.css`
> emission so the npm package is cleanly consumable — is the remaining optimization.

## Why this scales to React / Angular later

The design system stays **pure Web Components**, so a future framework swap only
rewrites this thin app layer, never the components:

- **React 19+** — passes properties and binds custom events natively (no `set-prop` needed).
- **Angular** — add `CUSTOM_ELEMENTS_SCHEMA`, then `[columns]="..."` sets properties and
  `(ds-data-table-selection)="..."` binds events.
- **Ember** — the `{{set-prop}}` modifier shown here.

Same `ds-*` tags, same tokens, same `ds.css` in every case.

## Note

This scaffold follows standard `ember-cli` (Octane) conventions. The Ember build was
**not executed in the environment where this was generated**, so run the steps above to
install deps and verify locally. If your `ember-cli` version differs, regenerate the
config with `npx ember-cli new` and drop in `app/modifiers/set-prop.js`,
`app/components/patch-table.*`, and the `@uems/design-system` import — those are the only
POC-specific pieces.
