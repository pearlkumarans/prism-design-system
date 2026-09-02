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

Baselines live in `screenshots/Chrome/baseline/`. On a failure the actual +
diff images are written to `screenshots/Chrome/failed/` (git-ignored).

## Adding a component

In `components.visual.js`, mount it the way it should **look**, then
`shot(el, 'unique-name')`. Prop-driven / layout components go inside the
fixed-width `frame(...)` wrapper so the shot is stable. Run
`npm run test:visual:update` to bless the new baseline, eyeball the PNG, commit
it.

## ⚠️ Baselines are environment-specific

Screenshots depend on the OS's font rendering, so baselines generated on one
machine will show sub-pixel diffs on another. The `failureThreshold` (0.15%)
absorbs a little of that, but **the canonical baselines should be generated on
the CI runner image** (or a pinned font container) and regenerated there when a
component legitimately changes. Treat the committed PNGs here as the reference
for *this* environment; re-bless on the CI image before enforcing in CI.
