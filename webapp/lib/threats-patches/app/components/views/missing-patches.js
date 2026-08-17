/**
 * Bridge: re-export Missing Patches (T&P list, L03) from the addon namespace into
 * the host app namespace (prism-webapp/components/views/missing-patches), so it
 * resolves at the catalog slug `missing-patches` — no catalog change. The real
 * implementation lives in lib/threats-patches/addon/components/views/.
 */
export { default } from 'threats-patches/components/views/missing-patches';
