# Module architecture (`webapp/lib/`)

Each product **module** is a self-contained, relocatable slice of the shell — its own
views (and, over time, routes, nav, data adapter, styles). This exists because most
Endpoint Central modules also ship as **standalone products** (Patch Management →
Patch Manager Plus, Vulnerability → Vulnerability Manager Plus, DEX → DEX Manager
Plus): the *same module* must mount as a tab inside Endpoint Central **and** boot as
its own product. So a module can't live tangled in `app/components/` — it's a package.

## Layers (dependency direction — every arrow points down)

```
host app(s)   (app/)                       shell chrome, routes, routing glue; composes modules
   │
modules       (lib/inventory, lib/threats-patches, …)   a product's screens
   │
shared        (lib/shared)                 Patterns::* archetypes + config-chart/set-prop/refit-charts
   │
design-system (../design-system-library)   ds-* web components + --uems-* tokens
```

A module depends on `lib/shared`, **never** on a host — that's what makes it relocatable.
Layout patterns are always **common**, never per-module: a module owns *views*, not
*patterns*. If a screen needs a layout no archetype covers, extend an archetype via
props/slots, or promote a genuinely reusable composition up into `lib/shared` — never
fork one into a module.

## Shared layer — `lib/shared`

The reusable UI layer that sits below the modules. Contains:

- **`app/components/patterns/`** — the L0x archetypes: `module-dashboard` (L02),
  `list-view` (L03), `list-detail` (L04), `sectioned-form` (+ template-only `section`),
  `tabbed-form` (+ `panel`), `empty-state`, `skeleton/*`.
- **`app/modifiers/`** — the modifiers those patterns/views rely on: `config-chart`,
  `set-prop`, `refit-charts`.

It uses the addon's **`app/` tree** (merged into the host namespace), NOT the
`addon/` + re-export bridge the modules use. Why the difference: these are invoked by
NAME in templates (`<Patterns::ModuleDashboard>`, `{{config-chart}}`) and never imported
by module path — so the `app/` tree lands them at their original resolver paths with zero
bridge files, and it transparently handles nested (`skeleton/*`) and template-only
(`sectioned-form/section.hbs`) components. Modules keep code in `addon/` only because
they're candidates to become engines (standalone products), which needs an importable
namespace; the shared library never is.

> Shell-level glue stays in the host `app/`, not here: the `chrome`, `mount-view`, and
> `drawer-toggle` modifiers, the `native-view` helper (reads app config), routes, and
> `shell-chrome`. Those are app-specific wiring, not reusable patterns.

## Current mechanism — v1 in-repo addons (interim)

> **Status: interim, deliberately.** This is the *legacy* Ember modularization
> pattern. It's a valid way to enforce the module boundary without changing the build,
> which is the right trade for a migration POC. It is **not** the current Ember
> standard — see "Modernization roadmap" below.

Each module is a v1 in-repo addon under `lib/<module>/`:

```
lib/<module>/
├── package.json                 # name "<module>", keywords:["ember-addon"], ember-addon:{}
├── index.js                     # module.exports = { name, isDevelopingAddon: () => true }
├── addon/                        # the module's REAL code (its own namespace: <module>/…)
│   └── components/views/
│       └── <slug>.{js,hbs}       # colocated component + template
└── app/                          # thin BRIDGE tree — merged into the host app namespace
    └── components/views/
        └── <slug>.js             # export { default } from '<module>/components/views/<slug>';
```

Registered in the host `package.json`:

```json
"ember-addon": { "paths": ["lib/inventory", "lib/threats-patches"] }
```

Why the two trees: the classic resolver only finds invokable components under the app
namespace (`prism-webapp/components/…`). The `addon/` tree keeps the real code isolated
to the module; the `app/` re-export bridges it back to the **same** resolver path the
shell already uses (`views/<slug>`), so **nothing downstream changes** — `native-views.js`,
the catalog slug, and the URL all stay identical. Template invocations of host pieces
(`<Patterns::ModuleDashboard>`, `{{config-chart}}`, `{{set-prop}}`) resolve globally at
runtime, so they keep working from inside a module.

### Existing modules

| Module | Package | Views | Serves |
|---|---|---|---|
| Inventory | `lib/inventory` | `acme-inventory-overview` (L02), `inventory-computer-summary` (L04) | EC `inv` tab |
| Threats & Patches | `lib/threats-patches` | `threats-patches-highly-vulnerable-systems` (L03) | EC `tp` tab **and** the Patch Manager Plus / Vulnerability Manager Plus landing |

## Adding a module (the recipe)

1. `mkdir -p lib/<module>/{addon,app}/components/views`
2. Copy a `package.json` + `index.js` from an existing module; change `name` to `<module>`.
3. Move the module's view files into `addon/components/views/`.
4. Add an `app/components/views/<slug>.js` re-export per view.
5. Add `"lib/<module>"` to `ember-addon.paths` in the host `package.json`.
6. **Restart `ember serve`** — addons are discovered at boot; a plain rebuild won't pick up a *new* one (adding files to an *existing* module rebuilds fine).

No change to `native-views.js`, `catalog`, or URLs is required — the bridge preserves the slug path.

### Server (BFF)

Mirror the split as modules grow: one `server/modules/<module>.mjs` per module, with
`server/bff.mjs` routing to them — instead of one growing `bff.mjs`.

## Modernization roadmap (when the POC graduates)

The current standard is not v1 addons. Target, in order:

1. **Embroider build** + `.gjs`/`.gts` template-tag — explicit component imports, no resolver strings.
2. **v2 addons** — plain npm packages; drops every `app/` re-export bridge and the `app/`-tree merge.
3. **Ember Engines** for the standalone-product modules — lazy loading, isolated routing namespace, mount the same module in multiple product hosts.
4. **Workspaces monorepo** — `packages/module-*` (v2 addons/engines) + `apps/<product>` (thin hosts: `endpoint-central` mounts all; `patch-manager-plus` mounts its subset).

Each step is incremental and preserves the module boundaries established here.
