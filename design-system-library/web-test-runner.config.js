/* Web Test Runner — runs the component tests in a real headless browser so custom
   elements, ResizeObserver, and document/window listeners behave for real (jsdom
   can't emulate these faithfully). See test/README.md. */
import { chromeLauncher } from '@web/test-runner-chrome';

/* In CI, Chrome often runs in a restricted sandbox with a tiny /dev/shm; launch
   with the standard CI flags there. Local runs use the default launcher unchanged. */
const ciBrowsers = process.env.CI
  ? [chromeLauncher({ launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage'] } })]
  : undefined;

export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,            // resolve bare imports (@open-wc/testing)
  concurrency: 4,
  browsers: ciBrowsers,        // undefined ⇒ default launcher (local)
  testFramework: {
    config: { ui: 'bdd', timeout: 5000 },
  },
  /* Component modules read a few globals for icon/logo sprites; stub them before
     any component loads so nothing throws when the sprite files aren't served. */
  testRunnerHtml: (testFramework) => `<!doctype html>
    <html>
      <head>
        <script>
          window.UEMS_ICON_SPRITE = '/src/icons/icons.svg';
          window.UEMS_ILLUSTRATION_SPRITE = '/src/icons/illustrations.svg';
          window.UEMS_LOGO_BASE = '/src/icons/logos';
        </script>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
};
