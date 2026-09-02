/* Visual-regression config — a STYLED-RENDER pipeline, separate from the unit
   suite (web-test-runner.config.js). The difference that makes pixels meaningful:
   this harness links the design tokens globally (so every `var(--uems-*)` resolves)
   and kills motion/carets for deterministic screenshots. Component CSS still loads
   the normal way (each component injectCss()es its own <link>); the styled fixture
   helper awaits those links + fonts before diffing.

   Run:   npm run test:visual                 (compare against baselines)
   Bless: npm run test:visual:update          (write/refresh baselines)

   NOTE: baselines are environment-specific (system font rendering differs across
   OSes). Regenerate them on the canonical CI image; see test/visual/README.md. */
import fs from 'node:fs';
import path from 'node:path';
import { chromeLauncher } from '@web/test-runner-chrome';
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';

/* Components injectCss() their DEPENDENCIES but not their own stylesheet (a real
   app links the full design-system CSS). So the styled harness links every
   component CSS file globally — the equivalent of importing the built bundle. */
const componentsDir = path.resolve('src/components');
const cssLinks = fs.readdirSync(componentsDir)
  .flatMap((name) => {
    const dir = path.join(componentsDir, name);
    if (!fs.statSync(dir).isDirectory()) return [];
    return fs.readdirSync(dir)
      .filter((f) => f.endsWith('.css'))
      .map((f) => `<link rel="stylesheet" href="/src/components/${name}/${f}">`);
  })
  .join('\n        ');

const ciBrowsers = process.env.CI
  ? [chromeLauncher({ launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage'] } })]
  : undefined;

export default {
  files: 'test/visual/**/*.visual.js',
  nodeResolve: true,
  concurrency: 1,
  browsers: ciBrowsers,
  testFramework: { config: { ui: 'bdd', timeout: 10000, retries: 0 } },
  plugins: [
    visualRegressionPlugin({
      update: process.argv.includes('--update-visual-baseline'),
      /* Allow a hair of AA/subpixel noise so a re-render on the same machine is
         green, while any real visual change (a moved box, a wrong colour) still
         trips it. Tighten toward 0 once baselines live on a pinned CI image. */
      failureThreshold: 0.15,          // ≤0.15% of pixels may differ
      failureThresholdType: 'percent',
    }),
  ],
  testRunnerHtml: (testFramework) => `<!doctype html>
    <html>
      <head>
        <script>
          window.UEMS_ICON_SPRITE = '/src/icons/icons.svg';
          window.UEMS_ILLUSTRATION_SPRITE = '/src/icons/illustrations.svg';
          window.UEMS_LOGO_BASE = '/src/icons/logos';
        </script>
        <!-- The FULL token layer (index.css @imports primitives → spacing →
             typography → semantic tokens → gradients). Linking tokens.css alone
             left the semantic colors pointing at undefined primitives, so
             everything rendered colourless — this is the fix. -->
        <link rel="stylesheet" href="/src/tokens/index.css">
        <!-- Every component's own stylesheet (see cssLinks above). -->
        ${cssLinks}
        <style>
          /* Determinism: no motion, no blinking caret, stable ground. */
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
            caret-color: transparent !important;
          }
          html, body { margin: 0; background: #ffffff; }
          body {
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
};
