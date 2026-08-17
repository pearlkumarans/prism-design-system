/* =============================================================================
   shell-catalog.js — SINGLE SOURCE OF TRUTH for the shell's routing tables.

   Consumed by BOTH:
     • Layout/Shell.html      — imports these directly (it's a <script type="module">)
     • webapp/             — copies this verbatim into app/config/catalog-data.js
                                via `npm run sync:catalog` (see webapp/scripts)

   So the vanilla shell and the Ember app can never drift on product scope, the
   routable content views, or the per-module default view. Edit HERE only.
   ============================================================================= */

/* Product scope: ?product=<id> → header variant, allowed tab subset, landing view.
   tabs:null = Endpoint Central (all tabs). */
export const PRODUCTS = {
  ec:  { variant: 'endpoint-central',         name: 'Endpoint Central',           tabs: null },
  pmp: { variant: 'patch-manager-plus',       name: 'Patch Manager Plus',         tabs: ['home','tp','sd','inv','reports','support'], defaultView: 'threats-patches-highly-vulnerable-systems' },
  vmp: { variant: 'vulnerability-manager-plus', name: 'Vulnerability Manager Plus', tabs: ['home','tp','inv','reports','support'],      defaultView: 'threats-patches-highly-vulnerable-systems' },
  mdm: { variant: 'mdm',                      name: 'Mobile Device Manager Plus', tabs: ['home','mdm','inv','reports','support'] },
  bsp: { variant: 'browser-security-plus',    name: 'Browser Security Plus',      tabs: ['home','browsers','inv','reports','support'] },
  acp: { variant: 'application-control-plus', name: 'Application Control Plus',   tabs: ['home','app-ctrl','inv','reports','support'] },
  dcp: { variant: 'device-control-plus',      name: 'Device Control Plus',        tabs: ['home','dev-ctrl','inv','reports','support'] },
  dxm: { variant: 'dex-manager-plus',         name: 'DEX Manager Plus',           tabs: ['home','dex','inv','reports','support'], tabDefaults: { home: 'dex-home' } },
  dlp: { variant: 'endpoint-dlp-plus',        name: 'Endpoint DLP Plus',          tabs: ['home','dlp','inv','reports','support'] },
  mpp: { variant: 'malware-protection-plus',  name: 'Malware Protection Plus',    tabs: ['home','malware','inv','reports','support'] },
  osd: { variant: 'os-deployer',              name: 'OS Deployer',                tabs: ['home','osd','inv','reports','support'] },
  pcp: { variant: 'patch-connect-plus',       name: 'Patch Connect Plus',         tabs: ['home','tp','sd','inv','reports','support'] },
  rpp: { variant: 'ransomware-protection-plus', name: 'Ransomware Protection Plus', tabs: ['home','malware','tp','inv','reports','support'] },
  rap: { variant: 'remote-access-plus',       name: 'Remote Access Plus',         tabs: ['home','tools','inv','reports','support'] },
  /* Adjacent ManageEngine suites (branding only — not Endpoint-Central modules,
     so a neutral Home/Reports/Support nav until their real IA is modelled). */
  ad360:    { variant: 'ad360',            name: 'AD360',            tabs: ['home','reports','support'] },
  log360:   { variant: 'log360',           name: 'Log360',           tabs: ['home','reports','support'] },
  pam360:   { variant: 'pam360',           name: 'PAM360',           tabs: ['home','reports','support'] },
  sdp:      { variant: 'servicedesk-plus', name: 'ServiceDesk Plus', tabs: ['home','reports','support'] },
  site24x7: { variant: 'site24x7',         name: 'Site24x7',         tabs: ['home','reports','support'] },
};

/* Tab id → module-rail icon (left-nav). Presentation metadata for the tabs listed
   in PRODUCTS. The Ember app reads this via catalog-data.js (one map, no drift);
   Layout/Shell.html keeps its own inline copy for now, to consolidate onto this later. */
export const TAB_ICONS = {
  home: 'home', configs: 'settings-custom', tp: 'patch', sd: 'software',
  inv: 'product', deployments: 'settings-deploy', osd: 'disk', mdm: 'mobile-devices', tools: 'computer-online',
  agent: 'computer', browsers: 'globe', 'app-ctrl': 'property-slider',
  malware: 'shield', dlp: 'computer-security', bitlocker: 'encryption-lock',
  'dev-ctrl': 'device-control', reports: 'bar-vertical-chart',
  support: 'help-circle', dex: 'speedometer',
};

/* slug → { file, tab, nav? }. `file` WITH a slash is relative to Layout/; a bare
   name lives under Layout/views/. `nav` (optional) is the list view whose sidebar
   item stays highlighted on a drill-down page. */
export const CONTENT_VIEWS = {
  'sectioned-form': { file: 'layout-sectioned-form', tab: 'configs' },
  'tabbed-form': { file: 'layout-tabbed-form', tab: 'configs' },
  'list-view': { file: 'layout-list-view', tab: 'inv' },
  'missing-patches': { file: 'missing-patches', tab: 'tp' },
  'module-dashboard': { file: 'layout-module-dashboard', tab: 'home' },
  'list-detail': { file: 'layout-list-detail', tab: 'inv' },
  /* project pages (projects/<project>/…) — grouped by project, shared shell.
     Slugs describe the page's PURPOSE, not the archetype it was built from. */
  'demo-create-deployment': { file: '../projects/demo/layout-create-deployment', tab: 'sd' },
  'demo-deployments': { file: '../projects/demo/layout-deployments', tab: 'sd' },
  'demo-deployment-detail': { file: '../projects/demo/layout-deployment-detail', tab: 'sd' },
  'acme-inventory-overview': { file: '../projects/acme/layout-inventory-overview', tab: 'inv' },
  'acme-patch-approvals': { file: '../projects/acme/layout-patch-approvals', tab: 'tp' },
  'acme-patch-detail': { file: '../projects/acme/layout-patch-detail', tab: 'tp' },
  'patch-management-deployment-schedule': { file: '../projects/patch-management/layout-deployment-schedule', tab: 'tp' },
  'threats-patches-highly-vulnerable-systems': { file: '../projects/threats-patches/layout-highly-vulnerable-systems', tab: 'tp' },
  'threats-patches-linux-repository-settings': { file: '../projects/threats-patches/layout-linux-repository-settings', tab: 'tp' },
  'threats-patches-n1-patch-settings': { file: '../projects/threats-patches/layout-n1-patch-settings', tab: 'tp' },
  'bitlocker-dashboard': { file: '../projects/bitlocker/layout-summary-dashboard', tab: 'bitlocker' },
  'bitlocker-managed-systems': { file: '../projects/bitlocker/layout-managed-systems', tab: 'bitlocker' },
  'bitlocker-device-detail': { file: '../projects/bitlocker/layout-device-detail', tab: 'bitlocker', nav: 'bitlocker-managed-systems' },   /* drill-down: highlight its list parent ("Managed Computers") in the sidebar */
  'bitlocker-activity-report': { file: '../projects/bitlocker/layout-activity-report', tab: 'bitlocker' },
  'bitlocker-policy-creation': { file: '../projects/bitlocker/layout-policy-creation', tab: 'bitlocker' },
  'custom-groups-create-group': { file: '../projects/custom-groups/layout-create-group', tab: 'inv', nav: 'custom-groups' },   /* drill-down: highlight "Custom Groups" in the Inventory sidebar */
  /* ── Deployments module (projects/deployments/) — merged from the deployments project.
     Primary nav destinations have no `nav:`; drill-downs name their list parent via `nav:`. */
  'deployments-summary':                          { file: '../projects/deployments/layout-summary',                          tab: 'deployments' },
  'deployments-devices':                          { file: '../projects/deployments/layout-devices',                          tab: 'deployments' },
  'deployments-policy':                           { file: '../projects/deployments/layout-policy',                           tab: 'deployments', nav: 'deployments-policy-list' },
  'deployments-policy-list':                      { file: '../projects/deployments/layout-policy-list',                      tab: 'deployments' },
  'deployments-policy-detail':                    { file: '../projects/deployments/layout-policy-detail',                    tab: 'deployments', nav: 'deployments-policy-list' },
  'deployments-workflow':                         { file: '../projects/deployments/layout-workflow',                         tab: 'deployments' },
  'deployments-workflow-builder':                 { file: '../projects/deployments/layout-workflow-builder',                 tab: 'deployments', nav: 'deployments-workflow' },
  'deployments-schedule':                         { file: '../projects/deployments/layout-schedule',                         tab: 'deployments' },
  'deployments-schedule-form':                    { file: '../projects/deployments/layout-schedule-form',                    tab: 'deployments', nav: 'deployments-schedule' },
  'deployments-schedule-detail':                  { file: '../projects/deployments/layout-schedule-detail',                  tab: 'deployments', nav: 'deployments-schedule' },
  'deployments-list':                             { file: '../projects/deployments/layout-list',                             tab: 'deployments' },
  'deployments-create':                           { file: '../projects/deployments/layout-deployment-create',                tab: 'deployments', nav: 'deployments-list' },
  'deployments-detail':                           { file: '../projects/deployments/layout-deployment-detail',                tab: 'deployments', nav: 'deployments-list' },
  'deployments-device-execution':                 { file: '../projects/deployments/layout-deployment-device',                tab: 'deployments', nav: 'deployments-list' },
  /* DEX — Digital Experience (DEX Manager Plus). */
  'dex-home':                                     { file: '../projects/dex/layout-home',                                     tab: 'home' },
  'dex-overview':                                 { file: '../projects/dex/layout-overview',                                 tab: 'dex' },
  'dex-devices':                                  { file: '../projects/dex/layout-devices',                                  tab: 'dex' },
  'dex-device-detail':                            { file: '../projects/dex/layout-device-detail',                            tab: 'dex', nav: 'dex-devices' },
  'experience-insights':                          { file: '../projects/dex/layout-experience-insights',                      tab: 'dex' },
  'remote-actions':                               { file: '../projects/dex/layout-remote-actions',                           tab: 'dex' },
  'insight-detail':                               { file: '../projects/dex/layout-insight-detail',                           tab: 'dex', nav: 'experience-insights' },
  'insight-cpu':                                  { file: '../projects/dex/layout-insight-cpu',                              tab: 'dex', nav: 'experience-insights' },
  'live-telemetry':                               { file: '../projects/dex/layout-live-telemetry',                           tab: 'dex', nav: 'dex-devices' },
  'alerts':                                       { file: '../projects/dex/layout-alerts',                                   tab: 'dex' },
  'alert-detail':                                 { file: '../projects/dex/layout-alert-detail',                             tab: 'dex', nav: 'alerts' },
  'alert-profile-detail':                         { file: '../projects/dex/layout-alert-profile-detail',                     tab: 'dex', nav: 'alerts' },
  'create-alert-profile':                         { file: '../projects/dex/layout-create-alert-profile',                     tab: 'dex', nav: 'alerts' },
  'sensors':                                      { file: '../projects/dex/layout-sensors',                                  tab: 'dex' },
  'sensor-detail':                                { file: '../projects/dex/layout-sensor-detail',                            tab: 'dex', nav: 'sensors' },
  'sensor-deployment':                            { file: '../projects/dex/layout-sensor-deployment',                        tab: 'dex', nav: 'sensors' },
  'sensor-run':                                   { file: '../projects/dex/layout-sensor-run',                               tab: 'dex', nav: 'sensors' },
  'add-sensor':                                   { file: '../projects/dex/layout-add-sensor',                               tab: 'dex', nav: 'sensors' },
  'deployments-reports':                          { file: '../projects/deployments/layout-reports',                          tab: 'deployments' },
  'deployments-policy-install-uninstall-software':{ file: '../projects/deployments/layout-policy-install-uninstall-software',tab: 'deployments', nav: 'deployments-policy' },
  'deployments-policy-file-folder-operation':     { file: '../projects/deployments/layout-policy-file-folder-operation',     tab: 'deployments', nav: 'deployments-policy' },
  'deployments-policy-install-uninstall-patches': { file: '../projects/deployments/layout-policy-install-uninstall-patches', tab: 'deployments', nav: 'deployments-policy' },
  'deployments-policy-custom-script':             { file: '../projects/deployments/layout-policy-custom-script',             tab: 'deployments', nav: 'deployments-policy' },
};

/* Module tab → the content view it lands on when opened bare. */
export const TAB_DEFAULT_VIEW = {
  home: 'module-dashboard',
  tp: 'threats-patches-highly-vulnerable-systems',   /* Threats & Patches tab lands on the Highly Vulnerable Systems list */
  sd: 'demo-deployments',   /* Software Deployment tab lands on the demo deployments list */
  inv: 'acme-inventory-overview',   /* Inventory tab lands on the acme inventory overview dashboard */
  deployments: 'deployments-summary',   /* Deployments tab lands on the module Summary */
  bitlocker: 'bitlocker-dashboard',   /* BitLocker Management tab lands on the Summary Dashboard (Overview > Dashboard) */
  dex: 'dex-overview',   /* DEX tab lands on the Digital Experience overview dashboard */
};
