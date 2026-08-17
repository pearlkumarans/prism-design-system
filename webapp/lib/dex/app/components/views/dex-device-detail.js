/**
 * Bridge: re-export the DEX device-detail record page from the addon namespace into
 * the host app namespace (prism-webapp/components/views/dex-device-detail), so the
 * shell resolver + {{native-view}} helper find it at the SAME path as before the
 * move. The real implementation lives in lib/dex/addon/components/views/.
 */
export { default } from 'dex/components/views/dex-device-detail';
