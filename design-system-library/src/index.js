/* =============================================================================
   UEMS Design System — main entry
   - Imports the global stylesheet (tokens + reset + base + components)
   - Registers all custom elements
   ============================================================================= */

/* `import './styles/index.css'` only works under a bundler — in a plain
   browser the module graph dies on the CSS MIME type and NOTHING loads
   (no styles, no custom elements). Inject a <link> instead, resolved
   against this module's URL so it works from any page depth. */
const cssHref = new URL('./styles/index.css', import.meta.url).href;
if (typeof document !== 'undefined' && !document.querySelector(`link[href="${cssHref}"]`)) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssHref;
  document.head.appendChild(link);
}

import './components/index.js';

export * from './components/index.js';
