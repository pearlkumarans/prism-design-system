/**
 * Bridge: re-export the DEX overview (L02 dashboard, the DEX tab landing) from the
 * addon namespace into the host app namespace
 * (prism-webapp/components/views/dex-overview), so the shell resolver + catalog slug
 * `dex-overview` find it. The real implementation lives in
 * lib/dex/addon/components/views/.
 */
export { default } from 'dex/components/views/dex-overview';
