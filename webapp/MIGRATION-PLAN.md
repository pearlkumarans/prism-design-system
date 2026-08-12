# Migration Plan — POC → production Ember shell

**Companion to:** [`RFC.md`](RFC.md) (the go/no-go) and [`README.md`](README.md) (how the POC works).
**Precondition:** the RFC decision is **Commit**. If it isn't, stop here — this plan assumes the go.
**Status:** proposed execution roadmap.

---

## 0. Goal & definition of done

Replace the vanilla `Layout/Shell.html` app with an Ember app, on the **unchanged** Web
Component design system, with no user-visible regression.

**Done means:**
- All ~100 views render as native Ember (no legacy `ContentOutlet` injection left).
- The Ember app is the production entry; `Shell.html` + the bridge are decommissioned.
- Real data/auth wired (the POC used demo data); CI green; a11y + perf at or above today.
- One routing source of truth still shared while both shells coexist.

**Non-goals:** touching the design system's authoring model (stays Web Components), or a
big-bang rewrite (everything is incremental behind the strangler switch).

## 1. Guiding principles

1. **Strangler-fig, always shippable.** Every view flips native independently behind
   `config/native-views.js`; unconverted views keep working via the bridge. Never a "big
   branch that merges in 6 months."
2. **Design system stays untouched.** No Ember-specific components; that's what preserves the
   React/Angular option.
3. **Single source of truth.** `Layout/shell-catalog.js` stays the one nav catalog while both
   shells live, so they can't drift.
4. **Real content, not demo.** Each view conversion also wires real data — the POC's hardcoded
   data does not graduate.

## 2. Phase 0 — Graduate the POC into a real project  ·  size: S–M

The POC was hand-authored to be minimal. Start the production app from a clean blueprint and
port the proven pieces — don't ship the hand-rolled scaffold.

- **Scaffold** a fresh app: `npx ember new prism-shell --lang en` (gets the standard blueprint,
  test harness, lint/format, and the Embroider/Vite build option). Decide **classic vs
  Embroider** up front — Embroider is the modern default and eases native-class/CSS handling.
- **Location:** keep it in this monorepo beside `design-system-library/` and `Layout/` so the
  DS and the shared catalog are co-located and versioned together.
- **Port the reusable modules** from `webapp/app/`:
  - services: `i18n`, `theme`, `nav`, `drawers`, `shell`
  - modifiers: `set-prop`, `config-chart`, `chrome`, `mount-view`, `refit-charts`
  - components: `shell-chrome`, `content-outlet`; helpers: `t`, `native-view`
  - routes + `router.js`; `instance-initializers/shell-ctx.js`
  - `config/catalog.js` + the `sync-catalog` / `vendor-assets` scripts
  - the two native views as the first migrated pair
- **Retire hand-authored config** (`ember-cli-build.js`, index.html, etc.) in favor of the
  blueprint's, re-applying only our deltas (DS load, sprite vars, `data-theme` boot script).

**Exit:** the production app boots, renders the shell + both native views, `npm test` green.

## 3. Phase 1 — Foundation hardening  ·  size: M  (parallel with Phase 2)

The infra items that aren't per-view. Most were flagged in RFC §6.

| Item | What | Why |
|---|---|---|
| **Bundle the design system** | fix the lib build so it emits a real `dist/ds.css` + a bundleable `ds.es.js`; consume that instead of vendoring ~200 source modules | perf: kills the request waterfall; the honest "productionize" step |
| **SPA fallback** | host rule: unknown path → `index.html` | direct deep-links in prod |
| **CI** | `ember test` + `lint:tokens` + `sync:catalog` check, on every PR | prevent drift + regressions |
| **Acceptance tests** | route-level: visit → assert view rendered, over the characterization layer | guards conversions |
| **Real data layer** | pick the pattern: `fetch` in route models, a data service, or ember-data; wire the dev proxy to the EC backend (`server/dev-proxy.mjs` already exists) | the POC used demo data; production needs live |
| **Auth / session, error & loading states** | route `error`/`loading` substates, auth redirect | production basics the POC skipped |

**Exit:** app deployable to a static/CDN host, CI enforcing quality, one view reading real data.

## 4. Phase 2 — Conversion playbook + team ramp  ·  size: S

Turn the two pilots into a repeatable recipe so the team converts consistently.

- **Playbook** (`webapp/CONVERTING-A-VIEW.md`): the steps — register in `native-views`;
  `set-prop` for array/object props; `config-chart` for charts-in-widgets; `{{t}}` + a
  co-located message catalog; tracked state for interactions; wire real data; add an acceptance
  test. Include the known gotchas (RFC §9) as a checklist.
- **Ramp:** 1–2 engineers convert 2–3 views each pairing off the playbook, to shake it out
  before scaling.

**Exit:** a documented recipe + a couple more converted views done by someone other than the
playbook author.

## 5. Phase 3 — View migration (the tail)  ·  size: L, parallelizable, ongoing

The bulk. ~98 remaining views.

1. **Inventory & triage.** List every `CONTENT_VIEWS` slug; group by module (bitlocker, tp,
   deployments, inv, …); tag each **S / M / L** (forms & lists = S–M; dashboards & builders = M–L);
   note data dependencies.
2. **Order.** Convert module-by-module (keeps a coherent area fully native), highest-traffic
   modules first. Within a module: list/detail before the complex builders.
3. **Per-view loop** (from the playbook): convert → wire real data → acceptance test → flip the
   slug in `native-views.js` → PR → ship. Each merge is safe; the switch means zero blast radius.
4. **Track** progress as **X / 100 native** on a board; parallelize across the team by module.

**Exit:** every slug registered native; `ContentOutlet` no longer used at runtime.

## 6. Phase 4 — Cutover & decommission  ·  size: S

- **Parity gate:** all views native + real data, a11y and perf checks pass, stakeholder sign-off.
- **Flip the entry** from `Shell.html` to the Ember app — can be gradual (route-by-route via the
  proxy/CDN) or a clean switch once parity holds.
- **Decommission:** delete `ContentOutlet`/`mount-view`, the `shell-catalog` dual-consumer
  bridge (Ember becomes the sole consumer), and eventually `Shell.html` + `Layout/views/*`
  legacy files once nothing injects them.

## 7. Cross-cutting concerns (own these throughout)

- **Design-system versioning:** pin the DS version the shell builds against; upgrades are
  deliberate, tested against the acceptance suite.
- **i18n:** the service is real; each view ships its own message catalog (as the pilots did). A
  later pass can consolidate catalogs and add locales.
- **Accessibility:** the DS carries a11y; verify per view (focus, keyboard, RTL) in the
  acceptance tests — don't regress what the vanilla shell had.
- **Analytics / feature flags:** if the current shell has them, wire equivalents into the router
  (route transitions are a clean analytics hook).
- **Performance budget:** measure after Phase 1 bundling; watch route + view-injection cost.

## 8. Team, effort & sequencing

- **Roles:** 1 lead (foundation + playbook + reviews), 2–4 engineers (the view tail), design/QA
  for parity checks.
- **Relative effort:** Phase 0 = S–M (days–1 wk), Phase 1 = M (2–4 wks, overlaps), Phase 2 = S
  (days), **Phase 3 = L (the long pole — weeks-to-months, scales with headcount)**, Phase 4 = S.
- **Sequencing:** `Gate 0 → Phase 0 → (Phase 1 ∥ Phase 2) → Phase 3 (bulk) → Phase 4`.
  Phases 1–2 are front-loaded and small; Phase 3 is where the calendar time lives and is the
  part that parallelizes.
- **Milestones to track:** foundation deployable · playbook published · 10 % views native ·
  50 % · first module 100 % native · all native · cutover.

## 9. Risks & mitigations (migration-specific)

- **Data wiring is the hidden cost.** The POC proved *rendering*; real API integration per view
  is new work not exercised yet. → spike the data layer in Phase 1 against one real endpoint
  before scaling.
- **Two shells drifting.** → SSOT catalog (done); CI check that `catalog-data.js` matches source.
- **Scope creep during conversion** (redesigning while porting). → convert faithfully first;
  file redesigns separately.
- **DS bundling unknowns** (the `import.meta.url` CSS issue). → tackle in Phase 1 as a discrete
  spike; vendored-source fallback already works if bundling slips.
- **Team ramp on Ember.** → the playbook + pairing in Phase 2.

## 10. Week-1 concrete actions

1. Confirm the RFC decision is **Commit** and name the lead + decision owner.
2. `ember new` the production app in the monorepo; port the POC modules (Phase 0 checklist).
3. Spike the **data layer** against one real EC endpoint (de-risks the biggest unknown).
4. Draft `CONVERTING-A-VIEW.md` from the two pilots.
5. Produce the **view inventory** with S/M/L tags + module grouping + conversion order.
