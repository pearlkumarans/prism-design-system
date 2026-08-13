/**
 * catalog.js — the Ember app's view of the routing tables.
 *
 * The DATA (PRODUCTS / CONTENT_VIEWS / TAB_DEFAULT_VIEW) is the SINGLE SOURCE OF
 * TRUTH from Layout/shell-catalog.js, copied verbatim into ./catalog-data.js by
 * `npm run sync:catalog`. This file re-exports it and adds the app-side helpers
 * (validation, label lookup, landing resolution) — pure logic, no data to drift.
 */
export { PRODUCTS, CONTENT_VIEWS, TAB_DEFAULT_VIEW } from 'prism-webapp/config/catalog-data';

import { PRODUCTS, CONTENT_VIEWS } from 'prism-webapp/config/catalog-data';

export const DEFAULT_PRODUCT = 'ec';

// Modules that render a full content page instead of L1/L2 + a content view.
export const FULL_PAGE_TABS = new Set(['support']);

// Tab id → header label. Covers the tab ids referenced across PRODUCTS.tabs.
// (Labels aren't routing-critical — drift here is cosmetic, unlike view→file→tab.)
export const TAB_LABELS = {
  home: 'Home', configs: 'Configurations', tp: 'Threats & Patches',
  sd: 'Software Deployment', inv: 'Inventory', deployments: 'Deployments',
  osd: 'OS Deployment', mdm: 'MDM', tools: 'Tools', agent: 'Agent',
  browsers: 'Browsers', 'app-ctrl': 'Application Control', malware: 'Malware Protection',
  dlp: 'Endpoint DLP', bitlocker: 'BitLocker', 'dev-ctrl': 'Device Control',
  reports: 'Reports', support: 'Support', dex: 'DEX',
};

export function isValidProduct(id) {
  return Object.prototype.hasOwnProperty.call(PRODUCTS, id);
}

export function tabAllowedForProduct(productId, tabId) {
  const p = PRODUCTS[productId];
  if (!p) return false;
  return p.tabs === null || p.tabs.includes(tabId); // null = all tabs allowed
}

// Tabs to show in the header for a product: its explicit list, or (for tabs:null,
// i.e. Endpoint Central) every tab we have a label for.
export function tabsForProduct(productId) {
  const p = PRODUCTS[productId];
  if (!p) return [];
  const ids = p.tabs === null ? Object.keys(TAB_LABELS) : p.tabs;
  return ids.map((id) => ({ id, label: TAB_LABELS[id] ?? id }));
}

// The view a product lands on: its explicit defaultView, else the Home module.
export function landingForProduct(productId) {
  const p = PRODUCTS[productId];
  if (p && p.defaultView && CONTENT_VIEWS[p.defaultView]) {
    return { tab: CONTENT_VIEWS[p.defaultView].tab, view: p.defaultView };
  }
  return { tab: 'home', view: 'module-dashboard' };
}
