/**
 * Bridge: re-export the Inventory overview component from the addon namespace into
 * the host app namespace (prism-webapp/components/views/acme-inventory-overview),
 * so the shell resolver + {{native-view}} helper find it at the SAME path as before
 * the move — no change to native-views.js, the catalog, or the URL. The real
 * implementation lives in lib/inventory/addon/components/views/.
 */
export { default } from 'inventory/components/views/acme-inventory-overview';
