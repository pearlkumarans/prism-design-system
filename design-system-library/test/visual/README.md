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

**Bootstrap (current state):** the CI step is **non-blocking**
(`continue-on-error`) and, on the expected "no baseline" failure, uploads the
Linux renders + diffs as the `visual-regression-linux` artifact.

**To bless the Linux baselines and enforce:**
1. Download the `visual-regression-linux` artifact from a CI run (or run
   `npm run test:visual:update` on a Linux checkout / container).
2. Copy the images from `Chrome-linux/failed/` into `Chrome-linux/baseline/` and
   commit them.
3. Remove `continue-on-error: true` from the `visual` job so a real visual
   regression fails the build.

The `failureThreshold` (0.15%) absorbs sub-pixel AA noise; tighten it toward 0
once baselines are stable on the runner.
