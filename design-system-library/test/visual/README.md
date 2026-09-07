# Visual-regression suite (styled render)

A screenshot-diff gate that renders components **with their real CSS + design
tokens** and compares each against a committed baseline image. It closes the
"visual-diff" half of the regression/a11y gate that the unit suite can't cover
(the unit harness deliberately loads no component CSS).

## Why a separate harness

`web-test-runner.config.js` (the unit suite) renders components **unstyled** —
fast, and right for logic/a11y assertions, but meaningless for pixels. This suite
(`web-test-runner.visual.config.js`) adds the two things that make pixels real:

1. **The full token layer** — it links `src/tokens/index.css` globally, so every
   `var(--uems-*)` resolves (primitives → semantic colours → typography). Linking
   `tokens.css` alone is not enough: the semantic colours point at primitives
   defined in `primitives.css`, so the whole `index.css` aggregate is required.
2. **Every component's own stylesheet** — components `injectCss()` their
   *dependencies* but not themselves (a real app links the built CSS bundle), so
   the config globs and links all `src/components/*/*.css`.

Plus determinism: motion/transitions/carets are killed, and
`test/visual/styled.js` `settleStyles()` awaits the stylesheet links, the async
`@import` sub-sheets (polling until a colour token resolves), and web fonts
before any screenshot.

## Running

```bash
npm run test:visual            # compare against baselines (the gate)
npm run test:visual:update     # (re)write baselines — do this on purpose
```

Baselines are **OS-keyed** (font rasterisation differs across platforms), so a
dev's macOS set and CI's Linux set coexist:
`screenshots/Chrome-<platform>/baseline/` (e.g. `Chrome-darwin`, `Chrome-linux`).
On a failure the actual + diff images are written to
`screenshots/Chrome-<platform>/failed/` (git-ignored).

## Adding a component

In `components.visual.js`, mount it the way it should **look**, then
`shot(el, 'unique-name')`. Prop-driven / layout components go inside the
fixed-width `frame(...)` wrapper so the shot is stable. Run
`npm run test:visual:update` to bless the new baseline, eyeball the PNG, commit
it.

## CI

The `visual` job in `.github/workflows/ci.yml` runs `npm run test:visual` on
`ubuntu-latest`, comparing against `Chrome-linux/baseline/**`. Because screenshots
depend on OS font rendering, those Linux baselines must be generated on the runner
— the committed `Chrome-darwin/**` set (macOS) won't match.

**Enforced.** All 55 Linux baselines are blessed, so a visual regression fails
the build. Before blessing, the runner's renders were byte-identical across two
separate CI runs — with a 0.15% threshold, that leaves plenty of headroom, so a
failure here means something really did change.

**When CI fails on a visual diff:**
1. Download the `visual-regression-linux` artifact from the failed run.
2. Compare `failed/<name>.png` (what CI rendered) against
   `failed/<name>-diff.png` (the highlighted pixels).
3. **Unintended?** Fix the component.
   **Intended?** Copy the new render over `Chrome-linux/baseline/<name>.png`,
   and refresh the macOS set locally with `npm run test:visual:update`.

Both platform sets must stay **name-for-name identical** — renaming a `shot()`
orphans one baseline and leaves the other missing, and a missing baseline is a
failure, not an auto-create. Check with:

```sh
diff <(ls screenshots/Chrome-darwin/baseline) <(ls screenshots/Chrome-linux/baseline)
```

The `failureThreshold` (0.15%) absorbs sub-pixel AA noise; tighten it toward 0
once baselines are stable on the runner.

### Assert real values

A `shot()` naming a variant/state the component doesn't have still produces a
screenshot — the component warns to the console, falls back, and the baseline
then locks in the *fallback* under a filename claiming otherwise. Three tests
did exactly this (`variant="danger"`, `status="active"`, `state="warning"`).
The suite must run warning-free:

```sh
npm run test:visual 2>&1 | grep '\[ds\] Unknown'   # must print nothing
```
