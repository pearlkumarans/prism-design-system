/**
 * Bridge: re-export the DEX devices list from the addon namespace into the host app
 * namespace (prism-webapp/components/views/dex-devices), so the shell resolver +
 * {{native-view}} helper find it at the SAME path as before the move — no change to
 * native-views.js, the catalog, or the URL. The real implementation lives in
 * lib/dex/addon/components/views/.
 */
export { default } from 'dex/components/views/dex-devices';
