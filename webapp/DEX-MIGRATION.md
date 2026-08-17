# DEX Manager Plus — full migration plan

Migrate the vanilla DEX design (`projects/dex/`, 36 screens) into the native Ember
`lib/dex` module, one functional area at a time. Each screen becomes a native view
(addon component + `app/` bridge) backed by a BFF resource, following the recipe in
[`MODULES.md`](MODULES.md). Vanilla files stay as the design reference.

**Status: 3 / 36 done** — `dex-overview` (L02), `dex-devices` (L03), `dex-device-detail` (L04).

> Coordination: `lib/dex` is also touched by the parallel (login/dex) session, and
> the whole tree is currently uncommitted. **Commit a checkpoint and confirm ownership
> of `lib/dex` before starting a batch**, so two sessions don't edit the same module.

## Screen inventory (by area → archetype → BFF)

Archetype legend: L02 dashboard · L03 list (server-driven table) · L04 detail (bento) ·
L06 sectioned form · L07 tabbed form/builder · modal.

| Area | Screen (`projects/dex/layout-*`) | Archetype | BFF resource | Status |
|---|---|---|---|---|
| **Overview** | overview *(native-only)* | L02 | `/dex/api/overview` | ✅ |
| **Home** | home | L02 (bento, 40 widgets) | `/dex/api/home` | ▫ |
| **Devices** | devices | L03 | `/dex/api/devices` | ✅ |
| | device-detail | L04 | `/dex/api/device` | ✅ |
| **Insights** | experience-insights | L03 | `/dex/api/insights` | ▫ |
| | insight-detail | L04 (charts) | `/dex/api/insight?id=` | ▫ |
| | insight-cpu | L04 (charts) | `/dex/api/insight?type=cpu` | ▫ |
| | live-telemetry | L04 (live) | `/dex/api/telemetry?device=` | ▫ |
| | remote-actions | L03 | `/dex/api/remoteActions` | ▫ |
| **Alerts** | alerts | L03 | `/dex/api/alerts` | ▫ |
| | alert-detail | L04 | `/dex/api/alert?id=` | ▫ |
| | alert-profile-detail | L04 | `/dex/api/alertProfile?id=` | ▫ |
| | create-alert-profile | L06 | (POST stub) | ▫ |
| **Sensors** | sensors | L03 | `/dex/api/sensors` | ▫ |
| | sensor-detail | L04 | `/dex/api/sensor?id=` | ▫ |
| | sensor-deployment | L03 | `/dex/api/sensorDeployments` | ▫ |
| | sensor-run | L04 (run output) | `/dex/api/sensorRun?id=` | ▫ |
| | add-sensor | L06 | (POST stub) | ▫ |
| **Scripts** | script-detail | L04 | `/dex/api/script?id=` | ▫ |
| | add-script | L06 | (POST stub) | ▫ |
| **Extensions** | extensions | L03 | `/dex/api/extensions` | ▫ |
| | extension-detail | L04 | `/dex/api/extension?id=` | ▫ |
| | content-detail | L04 | `/dex/api/content?id=` | ▫ |
| | add-ext-modal | modal | — | ▫ |
| **Deployments** | deployments | L03 | `/dex/api/deployments` | ▫ |
| | deployment-detail | L04 | `/dex/api/deployment?id=` | ▫ |
| | create-deployment | L06 | (POST stub) | ▫ |
| **Workflows** | workflows | L03 | `/dex/api/workflows` | ▫ |
| | workflow-detail | L04 | `/dex/api/workflow?id=` | ▫ |
| | workflow-builder | L07 (builder) | (POST stub) | ▫ |
| **Dashboards** | dashboards | L03 | `/dex/api/dashboards` | ▫ |
| | dashboard-view | L04 (viewer) | `/dex/api/dashboard?id=` | ▫ |
| | dashboard-builder | L07 (builder) | (POST stub) | ▫ |
| **Reports** | reports | L03 | `/dex/api/reports` | ▫ |
| | report-detail | L04 | `/dex/api/report?id=` | ▫ |
| **AI & Settings** | ai-assistant | custom (chat) | `/dex/api/ai` | ▫ |
| | ai-settings | L06 | (config stub) | ▫ |
| | settings | L06 (tabbed) | `/dex/api/settings` | ▫ |

## Phased batches (order = value + dependency)

Each batch is one session's worth: build the area's list → detail → form, wire the
BFF + PrismAPI + catalog/native-views, verify, commit.

1. **Experience core** — `home`, `experience-insights`, `insight-detail`, `insight-cpu`, `live-telemetry`, `remote-actions`. The DEX product's reason to exist; reuses the device dataset. *(6 screens)*
2. **Alerts** — `alerts`, `alert-detail`, `alert-profile-detail`, `create-alert-profile`. Monitoring loop. *(4)*
3. **Sensors** — `sensors`, `sensor-detail`, `sensor-deployment`, `sensor-run`, `add-sensor`. Data collection. *(5)*
4. **Scripts & Extensions** — `script-detail`, `add-script`, `extensions`, `extension-detail`, `content-detail`, `add-ext-modal`. Remediation content. *(6)*
5. **Deployments & Workflows** — `deployments`, `deployment-detail`, `create-deployment`, `workflows`, `workflow-detail`, `workflow-builder`. Actioning. *(6)*
6. **Dashboards, Reports, AI, Settings** — `dashboards`, `dashboard-view`, `dashboard-builder`, `reports`, `report-detail`, `ai-assistant`, `ai-settings`, `settings`. Reporting + config. *(8)*

## Per-screen recipe (from MODULES.md)

1. **BFF** — add the resource to `server/bff.mjs` (list → `applyQuery(data, p, {searchFields, facets, kpi})`; detail → composite record; reuse `DEX_DEVICES` where the data overlaps so numbers reconcile) + a route in `handle()`.
2. **PrismAPI** — add a method to the `dex` namespace in `Layout/data/prism-api.js` (mock → `null`/empty; live → `httpGet`), then re-vendor.
3. **View** — `lib/dex/addon/components/views/<slug>.{js,hbs}` on the right pattern (`Patterns::ListView` / `ListDetail` / `ModuleDashboard` / `SectionedForm` / `TabbedForm`) + an `app/` re-export bridge.
4. **Register** — add the slug to `native-views.js`; add/confirm the catalog entry in `Layout/shell-catalog.js` (+ `sync:catalog`). Sub-pages carry `nav:` to their list.
5. **Verify** — build clean, page renders against the live BFF, no console errors.

## BFF datasets to add

One generator per entity, reused across that area's list + detail (mirrors how
`DEX_DEVICES` feeds devices/detail/overview): `alerts`, `sensors`, `scripts`,
`extensions`, `deployments`, `workflows`, `dashboards`, `reports`, plus a device
`insights/telemetry` metric feed. Detail routes derive from the list row + synthesised
sub-records (sub-scores, timelines), same as `dexDevice()`.
