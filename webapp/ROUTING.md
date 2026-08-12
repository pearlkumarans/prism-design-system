# Mapping `Shell.html` → Ember routes

The vanilla shell is a **hand-rolled router**: query params (`?product`, `?view`),
a `_tab` variable, and imperative functions (`selectTab`, `openView`, `syncUrl`) that
also mutate the DOM. Ember's router already provides the URL↔state↔history machinery,
so most of that hand-rolled code *disappears* — it becomes route structure + hooks.

## The model

Shell.html's three coordinates are **product → module(tab) → view**, but only product
and view live in the URL (the tab is implied by the view's `.tab`). Ember makes all
three explicit as **nested route segments**:

```
Shell.html?product=pmp&view=bitlocker-dashboard
                    │             └─ CONTENT_VIEWS slug (its .tab = 'bitlocker')
                    └─ product scope

  ── automatically redirected to ──▼

/pmp/bitlocker/bitlocker-dashboard
   │      │           └─ view    → route  product.module.view
   │      └─ tab      → route  product.module
   └─ product         → route  product
```

## Concept-by-concept

| Shell.html | Ember | File |
|---|---|---|
| `?product=<id>` + `PRODUCTS[id]` scope | `product` route, `:product_id` segment | [routes/product.js](app/routes/product.js) |
| module tab / `selectTab(tabId)` | `product.module` route, `:tab_id` segment | [routes/product/module.js](app/routes/product/module.js) |
| `?view=<slug>` / `openView(slug)` | `product.module.view` route, `:view_slug` segment | [routes/product/module/view.js](app/routes/product/module/view.js) |
| `_product` / `_tab` / current view vars | tracked state on a **service** | [services/shell.js](app/services/shell.js) |
| `TAB_DEFAULT_VIEW[tab]` landing | `redirect` (via `replaceWith`) in the module route | routes/product/module.js |
| `syncUrl(slug, 'push')` | `transitionTo` / `<LinkTo>` (push is the default) | — (router owns it) |
| `syncUrl(slug, 'replace')` (boot) | `replaceWith` in a `beforeModel`/`redirect` | routes/application.js, product/module.js |
| `popstate` listener + Back/Forward | **built in** — the router handles history | — (deleted) |
| `_navReady` guard (suppress boot races) | **unneeded** — hooks run in deterministic order | — (deleted) |
| `nav:` drill-down parent highlight | `shell.activeNavSlug` (`view.nav ?? slug`) | services/shell.js |
| full-page `support` tab | leaf module route, no view child (`FULL_PAGE_TABS`) | routes/product/module.js |
| unknown product `|| 'ec'` fallback | explicit `replaceWith(DEFAULT_PRODUCT)` | routes/product.js |

## How each behavior maps

**Deep link.** `openView('bitlocker-dashboard')` on load → just visit
`/pmp/bitlocker/bitlocker-dashboard`. The router resolves `product` → `module` → `view`
top-down; each route's `afterModel` records its slice into the `shell` service. No
`whenDefined` + `requestAnimationFrame` boot dance.

**Default-view landing.** Shell's `selectTab` injects `TAB_DEFAULT_VIEW[tab]` when a tab
opens bare. Ember: hitting `/pmp/tp` lands on `product.module.index`, whose `afterModel`
`replaceWith`s `/pmp/tp/threats-patches-highly-vulnerable-systems`. `replaceWith` means
the bare `/pmp/tp` never becomes its own history entry — exactly Shell's
`syncUrl(defView, 'replace')`.

**Tab canonicalization.** `openView` always trusted `view.tab`. The view route does too:
if the URL's tab segment disagrees with `CONTENT_VIEWS[slug].tab` (a hand-edited link),
it `replaceWith`s the correct tab. So a view can never render under the wrong module.

**Back / Forward.** Deleted entirely. `history` location type + `transitionTo`/`replaceWith`
give correct Back/Forward and refresh for free — the manual `popstate` handler and the
`{ view: slug }` `history.state` bookkeeping are gone.

**Drill-down highlight.** `bitlocker-device-detail` has `nav: 'bitlocker-managed-systems'`.
`shell.activeNavSlug` returns that parent, so the sidebar keeps "Managed Computers"
highlighted — the L1/L2 template binds to `activeNavSlug`, not the raw slug.

## Backward compatibility with old links

Existing bookmarks/emails use `?product=…&view=…`. The **application route** intercepts
them once and `replaceWith`s the new path ([routes/application.js](app/routes/application.js)):

```
/?product=pmp&view=bitlocker-dashboard   →   /pmp/bitlocker/bitlocker-dashboard
/?product=pmp                            →   /pmp/tp/threats-patches-highly-vulnerable-systems  (product landing)
/                                        →   /ec/home/module-dashboard                          (default)
```

If you'd rather **keep** the query-param URLs verbatim (zero-broken-links), the alternative
is a single route with `queryParams: { product, view }` and no path segments — but you lose
the nested-route structure (per-level sidebars, natural redirects). The nested-path approach
above is recommended precisely because you're rebuilding the app layer anyway.

## What the routes deliberately DON'T do

Routes resolve **navigation state** only. Actually fetching a view's `.html` file and
injecting it into `<ds-content>` is *app chrome*, not routing — that's
[`<ContentOutlet @slug=… />`](app/components/content-outlet.hbs), driven by the
[`mount-view`](app/modifiers/mount-view.js) modifier (the Ember port of
`injectDrawer(file, 'content')`). The view route just binds `@slug={{this.model.slug}}`.
Keeping the fetch/inject out of the routes is the point: the router owns URLs and state;
the component owns the DOM.

`mount-view` fetches the view file **same-origin** (proxied to the repo server by
`ember serve --proxy`), extracts its `<template id="drawer-fragment">`, re-runs the
fragment's inline scripts so it registers `window.ShellDrawers[slug]`, then calls the
view's `show()`. This was verified against the real BitLocker dashboard — it renders KPI
cards, charts, badges, and icons, with localization resolved via a small `ShellCtx` stub
in [app/app.js](app/app.js). It's a **migration bridge**: it runs the existing views'
legacy inline scripts inside Ember unchanged, so you migrate the shell now and rewrite
individual views into real Ember components later.

## Try it (after the POC's run steps)

```
/                                          → redirects to /ec/home/module-dashboard
/pmp                                       → redirects to /pmp/tp/threats-patches-highly-vulnerable-systems
/pmp/tp                                    → redirects to its default view
/pmp/bitlocker/bitlocker-device-detail     → shows drill-down parent = bitlocker-managed-systems
/?product=pmp&view=bitlocker-dashboard     → legacy URL, redirects to the nested path
```

Each screen prints the resolved slug / owning tab / content file / drill-down parent, and
renders the real `ds-data-table` demo underneath — so the whole `URL → route → shell state`
chain is visible end to end.
