# Data layer / API plan

**The key fact:** the app already has a framework-agnostic data layer —
[`Layout/data/prism-api.js`](../Layout/data/prism-api.js) (`window.PrismAPI`). Like the
design system and `ec-menus`, it is **not Ember-specific and is reused as-is**. So "API
integration" is far less new work than it looked: the endpoints, request/response mapping,
auth, and the mock↔live switch already exist.

## What PrismAPI already gives us

- **One switch, mock or live.** Empty config = an in-JS mock server that mimics the real
  contract, so views work with no backend. Set `proxyPrefix` (`/proxy` → `server/dev-proxy.mjs`
  → the EC backend) or `baseUrl`, and the *same* request/mapping code runs live. Going live is
  config, not a rewrite.
- **Domain methods:** `listDevices` / `stats`, `bitlocker.resourceAvailable`, `auth`
  (`login`/`whoami`/`logout`), `branding`, plus `isMock`, mapping helpers, and a
  `fallbackToMock` policy (off by default so live failures surface real error states).
- **No CORS / no cert prompts** in dev — same-origin `/proxy/*` forwarded by the dev proxy
  with auth attached.

## The Ember piece (the genuinely new, but small, part)

Only the **binding ergonomics** are new — turning imperative `await PrismAPI.x()` calls into
Ember-idiomatic tracked `data` / `isLoading` / `error`:

1. **Load PrismAPI** the same way we load the DS: vendor `Layout/data/` into `public/` and a
   `<script src="/Layout/data/prism-api.js">` in `index.html`.
2. **A thin `api` service** ([`app/services/api.js`](app/services/api.js)) injects `window.PrismAPI`
   via DI (testable, mockable) and adds a small `load()` helper returning a tracked
   `{ isLoading, data, error }` object.
3. **Per-view loading.** Each native view calls `this.api.…` in `load()`, binds the tracked
   result, and renders a **skeleton while loading** / **`ds-empty-state` on error or empty**
   (the DS ships both). Route-level `loading`/`error` substates are available too.
4. **List ops.** `ds-data-table` emits sort/filter/page/search events → map to PrismAPI params
   (server-side for large sets; client-side for small). Bulk actions → PrismAPI mutations →
   toast feedback (pattern already in place).

## Migration approach for data

- **Phase-1 spike (de-risk):** wire **one** real endpoint end-to-end through the `api` service
  — the pattern below, exercised on `bitlocker-managed-systems`, is that spike. It resolves the
  open decisions against the real backend: auth mechanism, pagination model, response envelope.
- **Per view thereafter:** each conversion adds its data call in `load()` + loading/error UX.
  Where PrismAPI lacks a method (e.g. a per-module list), add it in *one* place — the views stay
  URL-free.
- **Auth/session:** `PrismAPI.auth` + the proxy already handle it; the Ember app adds a route
  guard (401 → login) — a small addition, not a new system.

## Building NEW APIs (not just proxying existing ones)

Proxying reuses an endpoint EC already exposes. A *new* feature with no backend API is
two pieces — the **backend endpoint** (new server code, not in this repo) and the **client
wiring** (PrismAPI + the `api` service). Do it **contract-first** so both sides move in
parallel and the UI never fetches URLs directly:

**1. Define the contract.** Path, method, query params, response envelope, one record shape.
Write it down (an OpenAPI snippet or a short table). This is the agreement between UI and API.

**2. Add it to `PrismAPI`** (`Layout/data/prism-api.js`) — the ONE place URLs live:
   - `CONFIG.endpoints.<name>` = the real path; `CONFIG.params` = the real query-param names.
   - a domain method `PrismAPI.<domain>.<method>(params)` that returns from the built-in **Mock**
     when `useMock()`, else `httpGet(endpoint, params)` → `readList()` / `mapRecord()`.
   - a **Mock** implementation matching the contract, so the UI works with no backend yet.

**3. Consume it in the view** via the `api` service:
   `this.page = this.api.load(() => this.api.prism.<domain>.<method>(params))` → tracked
   loading / data / error. (The managed-computers view is exactly this shape.)

**4. Backend implements the contract** — any stack. Because the mock already mimics it, the
   UI doesn't change when the real endpoint lands.

**5. Go live** — flip `proxyPrefix` / `baseUrl` (config, not code).

### Where the new backend endpoint physically lives (pick per case)
- **Extend the existing EC backend** — add the route there; the proxy already forwards `/proxy/*`.
  Best when EC owns the data.
- **A new BFF (backend-for-frontend)** — a thin new service (Node/Express, Fastify, Nest, or a
  serverless fn) the shell calls. Best when the UI needs data EC doesn't expose, aggregation
  across services, or UI-shaped responses. This is "building new APIs" as first-class services.
- **Mock in the dev proxy** — add handlers to `server/dev-proxy.mjs` so `/proxy/<new>` returns
  fixtures locally, with no backend at all.

Auth (proxy-injected or token), versioning (`/api/v1/…`), and a consistent error envelope are
set once in `PrismAPI` `headers()` / `httpGet`, so every new endpoint inherits them.

### Worked example — the BFF built here (proven live)

A concrete BFF ships in [`server/bff.mjs`](../server/bff.mjs) (zero-dependency Node, CORS on)
with two real endpoints:
- `GET /bitlocker/api/resourceAvailable` → `{ resourceAvailable }`
- `GET /bitlocker/api/managedComputers?status&os&auth&compliance&page&pageSize` → `{ rows, total }`
  (server-side filter + paginate)

Wired through `PrismAPI.bitlocker.listComputers()` (mock branch mirrors the contract; live
branch hits the BFF), consumed by the native managed-computers view via `this.api.load(...)`.
Verified live: the view issues real cross-origin GETs to the BFF and renders its response
(`isMock: false`, first row `SALES-WKS-107` straight from the service).

```bash
node server/bff.mjs                 # :8787 (the api service points baseUrl here)
# then run the shell (npm start) — managed-computers loads from the BFF
```

Add a new endpoint = a route in `bff.mjs` + a `PrismAPI` method (mock + live) + a view that
calls it. Same three edits every time; the contract is the glue.

### Why a new endpoint per module — and why it's NOT a rewrite

Each module is a different **resource** (bitlocker computers vs deployments) — different
fields, facets, KPIs — so it gets its own route. That's normal REST, not duplication. What is
NOT re-written is the query LOGIC: filter · search · sort · paginate · aggregate lives once in
`applyQuery()` in `bff.mjs`. A second endpoint is just **its data + a small config**:

```js
const deploymentsQuery = (p) => applyQuery(DEPLOYMENTS, p, {
  searchFields: ['name', 'target'],
  facets: { status: […], type: DEP_TYPE, platform: DEP_PLATFORM },
  kpi: (d) => ({ total: d.length, success: …, running: …, failed: … }),
});
```

Two endpoints now share that engine: `/bitlocker/api/managedComputers` and
`/deployments/api/list`. Both are consumed identically — `PrismAPI.bitlocker.listComputers()`
and `PrismAPI.deployments.list()` — and any list view binds either the same way. Verified live:
the deployments endpoint does filter/search/sort/paginate + full-dataset KPIs & facets, callable
from the app via `PrismAPI.deployments.list()`.

### Server-side filtering (wired + proven)

The managed-computers table filters **on the server**: a filter-panel change re-queries the
BFF with the filter params (`?status=Encrypted…`) instead of filtering client-side. The
contract that makes this work: the list endpoint returns **filtered `rows` + full-dataset
aggregates** (`kpis`, `facets`), so KPIs and facet counts stay stable as the user narrows the
table. The view keeps the table visible during the round-trip with a small "Updating…" chip.

Verified: filtering to "Encrypted" issued `GET …/managedComputers?status=Encrypted` (network),
the table dropped 42 → 21 rows, and KPIs held at 42 / 21 / 7 / 21. This is the reusable
server-driven-table pattern for the rest of the list views.

### Pagination + search (same param path)

Paging and search go through the **same server query** — no client slicing:
- `ds-data-table` server mode: set **`total-rows`** to the server total and it renders page
  controls for `ceil(total / pageSize)` while showing exactly the rows you hand it.
- `ds-data-table-page` / `-rows-per-page` / `-search` events → update `page`/`pageSize`/`search`
  (search **debounced 250ms**) → `reload()` re-queries with the params.

Verified live (network): `?page=2&pageSize=12` (page 2 = `SALES-WKS-191`) and
`?search=SRV&page=1&pageSize=12` (7 of 7). Filter / search reset to page 1; KPIs + facet counts
stay full-dataset throughout.

### Sort (completes the contract)

`ds-data-table-sort {columnId, direction}` → `?sort=name&dir=desc`. The server sorts the FULL
matched set before paging (numeric-aware, case-insensitive), so page 1 reflects the true order.
The table's own local sort is idempotent on already-sorted rows, so it doesn't fight the server.
Columns opt in with `sortable: true`. Verified: name desc → `SRV-WKS-387…`, asc → `ENG-WKS-114…`.

**The complete server-driven-table contract, reused by every list view:**
`{ status, os, auth, compliance, search, sort, dir, page, pageSize } → { rows, total, kpis, facets }`.
Filter · search (debounced) · paginate · sort all flow through one endpoint and one `reload()`.

## Open decisions (resolved by the spike, need the real backend)

- Auth: proxy-injected key (default) vs interactive login (`requireLogin`).
- Pagination/sort/filter: server-side vs client-side per endpoint.
- Response envelope shape (`readList`) + per-record mapping (`mapDevice`) for each module's
  list — PrismAPI centralizes these; fill them per real endpoint.
