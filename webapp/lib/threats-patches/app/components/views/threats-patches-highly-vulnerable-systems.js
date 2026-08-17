/**
 * Bridge: re-export the Highly Vulnerable Systems list (the T&P landing, L03) from
 * the addon namespace into the host app namespace
 * (prism-webapp/components/views/threats-patches-highly-vulnerable-systems), so it
 * resolves at the SAME path as before the move — no change to native-views.js or the
 * catalog. The real implementation lives in lib/threats-patches/addon/components/views/.
 */
export { default } from 'threats-patches/components/views/threats-patches-highly-vulnerable-systems';
