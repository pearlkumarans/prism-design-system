# RFC: Adopting Ember for the Prism / Endpoint Central shell

**Status:** Spike complete — all phases A–E demonstrated running. Decision requested: commit to the production migration.
**Author:** (fill in)
**Date:** 2026-08-11
**Decision owner:** (architecture owner — fill in)

---

## 1. The question

The Prism / Endpoint Central shell (`Layout/Shell.html`) is a hand-rolled vanilla-JS app:
a bespoke router, imperative `selectTab`/`openView`, and ~100 dual-mode HTML view files.
The design system beneath it (`design-system-library/`) is **framework-agnostic Web
Components** — 70 `ds-*` custom elements + `--uems-*` tokens.

1. Can the **app layer** (routing, shell chrome, state) move to **Ember** without rewriting
   the design system?
2. If we later want **React or Angular** instead, is that still feasible?

## 2. TL;DR / recommendation

**Both answered yes — and the spike has grown from "does it render" into a running
reference implementation covering the whole stack.** An Ember 5.8 app now serves the real
Endpoint Central shell — header, L1/L2 sidebars, right utility rail, drawers, top/left nav,
responsive/mobile — around real views, with the design system **completely untouched**. It
builds proxy-free into a self-contained deployable, has a passing test suite, shares one
routing catalog with the vanilla shell, and has four views rewritten as native Ember
components. Two of them are server-driven tables loading through the **data layer** across
**two BFF endpoints** — the last unexercised risk, now proven end to end.

**Recommendation: commit to the production migration**, resourced as a small team grinding
the ~100-view tail behind a strangler switch. The feasibility risk is retired; what remains
is bounded, parallelizable transcription plus a few finishing items (§6). If we decline,
nothing is lost — the spike stays in `webapp/` as reference.

## 3. What the spike now includes (all running, all verified)

| Area | What was built | Where |
|---|---|---|
| **WC data binding** | `{{set-prop}}` modifier (upgrade-safe) — the one bridge for array/object props | `app/modifiers/set-prop.js` |
| **Router** | nested routes mirroring `?product` / tab / `?view`; legacy-URL redirects | `app/router.js`, `app/routes/**` |
| **View injection** | `ContentOutlet` + `mount-view` — the `injectDrawer` port (legacy views render unchanged) | `app/components/content-outlet.hbs`, `app/modifiers/mount-view.js` |
| **Shell chrome** | `ds-header-nav` + L1/L2 sidebars + `ds-right-pane` + module rail, reusing `ec-menus` helpers | `app/components/shell-chrome.*` |
| **Drawers** | profile / help / settings / search / apps — lazy-injected, header + right-pane wired | `app/services/drawers.js` |
| **Services (Phase A)** | `i18n` (t / addMessages / dir), `theme` (light/dark/green), `nav` (top/left + rail) → `window.ShellCtx` | `app/services/*.js`, `app/instance-initializers/shell-ctx.js` |
| **Responsive** | reuses the shell's own `shell-responsive.js` (tablet collapse, mobile bottom-sheet) | (loaded from vendored DS) |
| **Single source of truth** | `Layout/shell-catalog.js` — the routing tables, consumed by BOTH shells | `Layout/shell-catalog.js`, `app/config/catalog*.js` |
| **Production build (Phase C)** | proxy-free; DS + views vendored into `public/`; self-contained `dist/` | `scripts/vendor-assets.mjs` |
| **Tests (Phase D)** | 13-assertion characterization suite in headless Chrome | `tests/unit/**` |
| **Data layer** | reuses `PrismAPI` (mock↔live) via a thin `api` service; a **BFF** (`server/bff.mjs`) with a shared query engine + **two endpoints** | `app/services/api.js`, `server/bff.mjs`, `DATA-LAYER.md` |
| **Native views (Phase E)** | dashboard + sectioned form + **two server-driven tables** (bitlocker computers, deployments) on the data layer | `app/components/views/*` |

## 4. Verification

Every item above was exercised in a running app (screenshots captured during the build):

- The shell renders in **top-nav and left-nav** modes, at desktop and **mobile** (bottom-sheet).
- Drawers open from the header (avatar → profile, gear → settings, …) and right rail (help).
- **Language flip → RTL** re-localizes the chrome and the native dashboard automatically.
- **Green theme** applies the real `data-theme="green-light"` (Fern accent) — a fixed bug.
- The vanilla `Shell.html` still boots (0 console errors) reading the shared catalog (19
  products, 41 views); the Ember app rebrands + scopes tabs from the same data.
- Production `dist/` served by a plain `python -m http.server` (no proxy) renders the shell.
- Two list views are **server-driven tables** — filter · debounced search · sort · paginate all
  go through the BFF (`?status=…&search=…&sort=…&page=…`); KPIs + facet counts stay full-dataset.
  The **second view + second endpoint were near-transcription** (columns + facet config), confirming
  the pattern reuses — the query engine is written once (`applyQuery`).
- `npm test` → **13 pass / 0 fail** (headless Chrome).

## 5. Why this keeps React / Angular open (unchanged, still the hedge)

Ember lives only at the app layer; the design system stays **pure Web Components**, and the
spike reuses the shell's own framework-agnostic helpers (`ec-menus`, `shell-responsive`)
rather than reimplementing them. A future framework swap costs in proportion to app-layer
code, not the component library:

- **React 19+** — passes props + binds custom events natively (no `set-prop` needed).
- **Angular** — `CUSTOM_ELEMENTS_SCHEMA`, then `[prop]` / `(event)` binding.
- **Ember** — the `set-prop` modifier shown here.

Same `ds-*`, same tokens, same stylesheet in every case.

## 6. What remains (the honest gaps now)

Most of the earlier gaps are closed. What's left:

1. **The Phase E tail — ~100 views** to convert from injected-legacy to native Ember. Each
   is a bounded **S–M** of transcription, independent, and shippable behind the per-slug
   switch (`config/native-views.js`). This is the bulk of remaining effort.
2. **DS bundling.** The design system is vendored as **source** (many small modules) — a
   real, deployable artifact, but unoptimized. Bundling/minifying it (which means fixing the
   `dist/ds.css` emission so the npm package is cleanly consumable) is the perf follow-up.
3. **SPA fallback.** A plain static host needs an "unknown path → `index.html`" rule for
   deep links; loading `/` and letting client routing take over works without one.
4. **Full acceptance tests.** The Phase D layer is deterministic characterization (logic +
   services). Route-level tests that assert an injected view rendered need the custom-element
   + asset environment wired into the test harness.
5. **i18n coverage.** The `i18n` service is real; each view's message catalog migrates with
   that view (as the two native pilots did).

## 7. Migration approach & effort (updated)

**Strategy: strangler-fig behind `ContentOutlet` + a per-slug native switch.** Stand up the
Ember shell (done); every legacy view keeps working via injection; convert views to native
one at a time, flipping each on in `native-views.js`.

The four Phase E pilots calibrate the tail:

- **Infrastructure cost is front-loaded and paid.** The dashboard needed two new modifiers
  (`set-prop` upgrade-safety, `config-chart`) to solve Web-Component timing gotchas. The
  form needed **none**. The two list views share one server-driven-table pattern — so the
  *second* list (deployments) + its endpoint were near-transcription (columns + facet config).
- **Per view ≈ S–M, and falling.** No trivially-small view exists (smallest archetype is a
  ~300-line form), but each conversion gets cheaper as patterns accumulate. Dynamic UI is often
  *cleaner* in Ember (repeatable rows → tracked array + `{{#each}}` vs imperative `innerHTML`).
- **Data is reusable, not per-view.** The query engine (`applyQuery`) and the table contract are
  written once; a new list view = its columns + facet config + endpoint method.
- The tail is **parallelizable** across a team, module by module, with zero risk to unconverted
  views.

Phases A–D (foundation) are complete. Phase E is the ongoing, resourceable remainder.

## 8. Risks & trade-offs (updated)

- **Two shells during migration** — mitigated: the routing tables are now a **single source
  of truth** (`Layout/shell-catalog.js`) consumed by both, so they can't drift.
- **Legacy scripts inside Ember** — the bridge runs unconverted views' inline scripts as-is;
  fine transitionally, and each Phase E conversion removes one more. A long-term bug source
  only for views not yet converted.
- **DS served unbundled** in the current build — see §6.2.
- **Team ramp-up** on Ember Octane, services, modifiers.
- **Framework churn** — Ember is stable but smaller-ecosystem; §5 is the hedge (the design
  investment is portable regardless).

## 9. Runtime issues hit & fixed (evidence it genuinely runs)

The real, non-obvious integration cost — all resolved, most reusably:

1. `<ds-content>` inside `{{! }}` template comments parsed as a real unclosed tag → strip
   angle brackets from hbs comments.
2. ember-auto-import rejects non-literal `import()` → load `ec-menus`/`shell-responsive` via a
   runtime-constructed native import.
3. webpack can't bundle the DS dist (its `import.meta.url` CSS ref) → load the DS from
   vendored source, not a webpack bundle.
4. Ember 5 removed `Route#replaceWith` → inject the router service, use `this.router.replaceWith`.
5. Chrome didn't re-sync on client navigation → consume tracked `shell.tabId/viewSlug` inside
   the modifier body.
6. Sidebar `is-hidden` didn't collapse — that CSS lived in `Shell.html`, not the DS → replicate.
7. Catalog pointed at non-existent view files → correct paths (now the shared SSOT).
8. Green theme was stripped to `light` → set the real `data-theme="green-light"`.
9. `testem@3.11` pulls an ESM-only `execa` its CJS code `require()`s (Node 20) → pin `testem@3.10.1`.
10. `set-prop` set a property before the element upgraded → silently lost (chart kept demo data)
    → wait for `customElements.whenDefined` first.
11. `ds-widget` captures slotted children on connect, but Ember renders incrementally, so a
    slotted `<ds-chart>` isn't there yet → let ds-widget make its body chart and configure it
    via a `MutationObserver` modifier (`config-chart`).
12. No `data-theme` on `<html>` → the design system's theme-scoped color tokens fell back to
    white (flat, "no background"). And the shell root used `--uems-bg-base` (plain white) rather
    than `--uems-background` (the per-theme canvas tint). → set `data-theme` in an index.html
    boot script (as every vanilla page does) + use `--uems-background`.
13. `PrismAPI` defaults to LIVE mode (`/proxy`), but the proxy-free POC has no backend → the
    availability call failed and the view correctly showed its ERROR state (lifecycle works).
    For the no-backend demo → force MOCK mode at boot via the `api` service (`useMock` reads
    config live), and skip the availability gate when mock (it has no mock branch). Going live is
    still one config switch.

## 10. Decision requested

- **Commit** — resource the Phase E tail (a small team, module by module) and the §6 finishing
  items. Feasibility is proven; this funds the remainder.
- **Continue incrementally** — keep converting opportunistically without a dedicated push.
- **Park / decline** — keep `Shell.html`; the spike stays as reference in `webapp/`.

## Appendix — run the spike (proxy-free)

```bash
cd webapp && npm install && npm start      # http://localhost:4200 — self-contained
npm test                                       # ember test — 13 pass, headless Chrome
npm run build                                  # → dist/ (serve on any static host)
```

Try: `/ec/bitlocker/bitlocker-dashboard` (native), `/ec/configs/sectioned-form` (native),
`/pmp/tp/…` (product scope), `/?product=pmp&view=bitlocker-dashboard` (legacy URL → redirects).
See `README.md` for the wiring and `ROUTING.md` for the route mapping.
