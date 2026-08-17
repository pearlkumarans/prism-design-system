/**
 * native-views — the Phase E registry. Slugs listed here render as real Ember
 * components (app/components/views/<slug>) instead of the legacy ContentOutlet
 * injection. This is the strangler switch: add a slug once its native component
 * lands; everything else keeps working via injection, unchanged.
 */
export const NATIVE_VIEWS = new Set([
  'module-dashboard',
  'threats-patches-highly-vulnerable-systems',
  'missing-patches',
  'acme-inventory-overview',
  'bitlocker-dashboard',
  'sectioned-form',
  'bitlocker-managed-systems',
  'bitlocker-policy-creation',
  'deployments-list',
  'deployments-devices',
  'deployments-policy-list',
  'deployments-workflow',
  'deployments-device-execution',
  'deployments-summary',
  'tabbed-form',
  'dex-overview',
  'dex-devices',
  'dex-device-detail',
  'experience-insights',
  'remote-actions',
  'insight-detail',
  'insight-cpu',
  'live-telemetry',
]);
