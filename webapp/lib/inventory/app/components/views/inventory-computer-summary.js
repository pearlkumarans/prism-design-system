/**
 * Bridge: re-export the Inventory computer-summary (L04 record detail, used by the
 * list-detail pattern preview) from the addon namespace into the host app namespace
 * (prism-webapp/components/views/inventory-computer-summary), so it resolves at the
 * SAME path as before the move — no change to pattern-previews.js. The real
 * implementation lives in lib/inventory/addon/components/views/.
 */
export { default } from 'inventory/components/views/inventory-computer-summary';
