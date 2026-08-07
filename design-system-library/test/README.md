# Tests

Component tests run in a **real headless browser** via
[`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview/) — custom
elements, `ResizeObserver`, and `document`/`window` listeners all behave for real,
which jsdom cannot emulate faithfully.

## Run

```bash
cd design-system-library
npm install        # one-time: pulls @web/test-runner + @open-wc/testing
npm test           # run once (headless Chromium)
npm run test:watch # re-run on change
```

The runner needs a Chrome/Chromium it can launch. `@web/test-runner` downloads a
matching headless Chromium on first install; if your environment already has
Chrome, it will use it.

## Layout

```
test/
  helpers/listeners.js    Net document/window listener counter — the leak detector.
  teardown.test.js        Regression guards for the four teardown fixes (no leaked
                          global listeners across mount → open → unmount).
  enhancements.test.js    Behaviour guards for ds-button `label`, ds-radio-group
                          `description` + info-icon gate, and the ds-slider
                          min===max fill guard.
```

## Conventions

- Import the component under test directly: `import '../src/components/<name>/<name>.js'`.
- Use `fixture`/`html`/`expect` from `@open-wc/testing`; `nextFrame()` after
  setting `.options`/attributes that trigger a re-render.
- Assert on DOM structure, attributes, and JS state — not computed styles — so a
  test never silently depends on a stylesheet being loaded.
- For a leak test: `trackListeners()` → mount → exercise → `el.remove()` →
  assert `net() === 0` → `restore()` in a `finally`.

## Pre-commit test gate

A git hook runs the suite automatically before a commit — but **only when files
under `design-system-library/` are staged**, so commits elsewhere in the repo
stay fast. A failing test blocks the commit.

```bash
cd design-system-library
npm run hooks:install     # one-time, per clone (sets core.hooksPath)
```

- The hook lives in the tree at `scripts/git-hooks/pre-commit` (version-controlled,
  so it's shared and reviewable) and is activated via `git config core.hooksPath`.
- Because `core.hooksPath` is per-clone local config, each teammate runs
  `npm run hooks:install` once after cloning.
- Bypass a single commit with `git commit --no-verify`.
- Disable with `npm run hooks:uninstall`.
- If `node_modules` isn't installed yet, the hook warns and lets the commit
  through rather than blocking a fresh checkout.

## Token lint (no hardcoded colors)

`npm run lint:tokens` enforces the CLAUDE.md rule *"no hardcoded values where a
token exists"* for component CSS. It fails on a hex color in a color-role
declaration (`color` / `background` / `border*` / `outline` / `fill` / `stroke`)
that isn't routed through `var(--…)`.

Deliberately **not** flagged (all token-first or intentional):
- hexes inside CSS comments (they just document a token's value),
- `var(--token, #hex)` fallbacks,
- gradients, `box-shadow`, `rgba()`, `url()`.

It runs in **both** the pre-commit hook (fast, before the tests) and CI. Adding a
hardcoded color now fails the commit/build with the exact `file:line`.

## Continuous integration

GitHub Actions runs the same suite on every push / PR that touches
`design-system-library/**` — the workflow lives at
[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (repo root =
`prism-design-system/`). It installs deps with `npm ci`, then `npm test` in a
headless Chromium.

- The `CI` env var (set by GitHub Actions) makes `web-test-runner.config.js`
  launch Chrome with `--no-sandbox --disable-dev-shm-usage` — verified locally
  with `CI=1 npm test`.
- The pre-commit hook is the fast local gate; CI is the authoritative gate that
  also catches commits made with `--no-verify`.

### Flake hardening (don't revert without reading)

`web-test-runner.config.js` runs **one test file at a time** (`concurrency: 1`)
and sets Mocha **`retries: 2`**. These tests portal tooltips/menus to `<body>`
and drive `ResizeObserver`s; running files concurrently occasionally tore down a
browser execution context mid-evaluate (puppeteer *"Cannot read … 'resolve'"*),
failing an unrelated test ~1 run in 4. Serial execution removes that race and
retries absorb any residual flake — a genuine bug still fails on every attempt.
The suite is small, so serial is still ~10–16s.

## What to add next

Start with the logic-heavy components (`data-table` sort/filter/paginate,
`date-picker` value parsing, `criteria-filter` rule tree, `slider` range
crossover) and an accessibility pass (`@open-wc/testing` ships `axe` via
`expect(el).to.be.accessible()`).
