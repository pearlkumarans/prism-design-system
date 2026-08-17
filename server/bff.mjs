/* =============================================================================
   bff.mjs — a thin Backend-For-Frontend for the Prism shell (zero dependencies).

   New APIs live here — endpoints shaped for the UI that own or reshape data. The
   shell reaches them via PrismAPI (client seam) → this service.

   Why a new endpoint per module? Because each is a different RESOURCE (bitlocker
   computers vs deployments) with its own fields/facets — that's normal REST. But
   the query LOGIC (filter · search · sort · paginate · aggregate) is NOT rewritten
   each time: it lives once in applyQuery(). A new endpoint = its data + a small
   config, nothing more.
   ============================================================================= */
import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const pick = (a, i) => a[i % a.length];

/* ── The one reusable query engine ─────────────────────────────────────────
   Server-driven-table contract for ANY collection:
     in:  ?<facet>=a,b … &search &sort &dir &page &pageSize
     out: { rows, total, kpis, facets }   (rows filtered+searched+sorted+paged;
                                            kpis/facets computed over the FULL set) */
function applyQuery(data, p, { searchFields = [], facets = {}, kpi = () => ({}) }) {
  const multi = (k) => (p.get(k) ? p.get(k).split(',').filter(Boolean) : []);
  const keys = Object.keys(facets);
  const sel = {}; keys.forEach((k) => { sel[k] = multi(k); });
  const q = (p.get('search') || '').trim().toLowerCase();

  let rows = data.filter((r) =>
    keys.every((k) => !sel[k].length || sel[k].includes(r[k])) &&
    (!q || searchFields.some((f) => String(r[f] ?? '').toLowerCase().includes(q))));
  const total = rows.length; // after filter+search, before sort/paging

  const sortKey = p.get('sort');
  if (sortKey) {
    const dir = p.get('dir') === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => dir * String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true, sensitivity: 'base' }));
  }
  const page = Number(p.get('page') || 1);
  const size = Number(p.get('pageSize') || 999);
  const paged = rows.slice((page - 1) * size, (page - 1) * size + size);

  const countBy = (k) => { const c = {}; for (const r of data) c[r[k]] = (c[r[k]] || 0) + 1; return c; };
  const outFacets = {};
  keys.forEach((k) => { const c = countBy(k); const order = facets[k] || Object.keys(c).sort(); outFacets[k] = order.map((v) => ({ value: v, count: c[v] || 0 })); });

  return { rows: paged, total, kpis: kpi(data), facets: outFacets };
}

/* ── Resource 1: BitLocker managed computers ───────────────────────────────── */
const OS = ['Windows 11 Pro', 'Windows 11 Ent', 'Windows 10 Ent', 'Windows 10 Pro', 'Windows 8.1 Ent', 'Server 2019'];
const ST = ['Encrypted', 'Encrypted', 'Encrypted', 'In progress', 'Not started', 'Failed'];
const AUTH = ['TPM only', 'TPM + PIN', 'TPM + Enhanced PIN', 'Passphrase'];
const SCOPE = ['Full drive', 'OS drive only', 'Used space only'];
const SEEN = ['2 min ago', '18 min ago', '1 hr ago', '3 hrs ago', 'Yesterday', 'Jul 8, 2026'];
const COMPUTERS = Array.from({ length: 42 }, (_, k) => {
  const i = k + 1, status = pick(ST, i + (i % 3));
  return { id: i, name: pick(['FIN', 'SALES', 'ENG', 'HR', 'OPS', 'SRV'], i) + '-WKS-' + (100 + i * 7), os: pick(OS, i + 1), status, auth: pick(AUTH, i), scope: pick(SCOPE, i), compliance: status === 'Encrypted' ? 'Compliant' : 'Not compliant', seen: pick(SEEN, i) };
});
const computersQuery = (p) => applyQuery(COMPUTERS, p, {
  searchFields: ['name', 'os'],
  facets: { status: ['Encrypted', 'In progress', 'Not started', 'Failed'], os: OS, auth: AUTH, compliance: ['Compliant', 'Not compliant'] },
  kpi: (d) => ({ managed: d.length, encrypted: d.filter((r) => r.status === 'Encrypted').length, pending: d.filter((r) => r.status === 'In progress').length, noncompliant: d.filter((r) => r.compliance === 'Not compliant').length }),
});

/* ── Resource 2: Deployments (the NEW endpoint — data + config, reuses applyQuery) */
const DEP_TYPE = ['Software', 'Patch', 'Configuration', 'Script'];
const DEP_PLATFORM = ['Windows', 'macOS', 'Linux'];
const DEP_STATUS = ['Success', 'Success', 'In progress', 'Failed', 'Scheduled'];
const DEP_TARGET = ['All Windows', 'Finance OU', 'Remote offices', 'Servers', 'Kiosks', 'Sales laptops'];
const DEP_CREATED = ['Just now', '10 min ago', '1 hr ago', 'Today', 'Yesterday', 'Jul 6, 2026'];
const DEPLOYMENTS = Array.from({ length: 30 }, (_, k) => {
  const i = k + 1;
  return { id: i, name: pick(['Deploy', 'Rollout', 'Push', 'Install'], i) + '-' + pick(DEP_TYPE, i) + '-' + (1000 + i * 3), type: pick(DEP_TYPE, i), platform: pick(DEP_PLATFORM, i + 1), status: pick(DEP_STATUS, i + (i % 2)), target: pick(DEP_TARGET, i), devices: 5 + (i * 13) % 240, created: pick(DEP_CREATED, i) };
});
const deploymentsQuery = (p) => applyQuery(DEPLOYMENTS, p, {
  searchFields: ['name', 'target'],
  facets: { status: ['Success', 'In progress', 'Failed', 'Scheduled'], type: DEP_TYPE, platform: DEP_PLATFORM },
  kpi: (d) => ({ total: d.length, success: d.filter((r) => r.status === 'Success').length, running: d.filter((r) => r.status === 'In progress').length, failed: d.filter((r) => r.status === 'Failed').length }),
});

/* ── Resource 3: Devices in deployment scope (same engine, new config) ─────── */
const DEV_OS = ['Windows', 'macOS', 'Linux'];
const DEV_STATUS = ['Deployed', 'Deployed', 'In progress', 'Pending', 'Failed'];
const DEV_GROUP = ['All Windows', 'Finance OU', 'Servers', 'Sales laptops', 'Kiosks'];
const DEV_SEEN = ['Just now', '12 min ago', '1 hr ago', 'Today', 'Yesterday'];
const DEVICES = Array.from({ length: 36 }, (_, k) => {
  const i = k + 1;
  return { id: i, name: pick(['FIN', 'SALES', 'ENG', 'HR', 'OPS', 'SRV'], i) + '-DEV-' + (200 + i * 5), os: pick(DEV_OS, i), status: pick(DEV_STATUS, i + (i % 3)), deployments: 1 + (i * 7) % 6, lastRun: pick(DEV_SEEN, i), group: pick(DEV_GROUP, i) };
});
const devicesQuery = (p) => applyQuery(DEVICES, p, {
  searchFields: ['name', 'group'],
  facets: { status: ['Deployed', 'In progress', 'Pending', 'Failed'], os: DEV_OS, group: DEV_GROUP },
  kpi: (d) => ({ total: d.length, deployed: d.filter((r) => r.status === 'Deployed').length, pending: d.filter((r) => r.status === 'Pending' || r.status === 'In progress').length, failed: d.filter((r) => r.status === 'Failed').length }),
});

/* ── Resource 4: Deployment policies (same engine, new config; no KPIs) ────── */
const POL_PLATFORM = ['Windows', 'macOS', 'Linux'];
const POL_TYPE = ['Profile', 'Software', 'Patch', 'Script'];
const POL_STATUS = ['Draft', 'Ready to Execute', 'Executed', 'In Progress', 'In Progress (Failed)', 'Suspended', 'Rejected', 'Expired'];
const POL_USER = ['A. Menon', 'R. Kapoor', 'S. Iyer', 'J. Fernandes', 'M. Bose'];
const POL_WHEN = ['Just now', '10 min ago', '1 hr ago', 'Today', 'Yesterday', 'Jul 6, 2026', 'Jun 28, 2026'];
const POLICIES = Array.from({ length: 34 }, (_, k) => {
  const i = k + 1;
  return { id: i, name: pick(['Onboarding', 'Baseline', 'Security', 'Kiosk', 'Finance', 'Field'], i) + '-' + pick(POL_TYPE, i) + '-' + (100 + i * 3), scope: i % 4 === 0 ? 'user' : 'computer', platform: pick(POL_PLATFORM, i), type: pick(POL_TYPE, i), status: pick(POL_STATUS, i + (i % 3)), createdBy: pick(POL_USER, i), modified: pick(POL_WHEN, i), modifiedBy: pick(POL_USER, i + 2) };
});
const policiesQuery = (p) => applyQuery(POLICIES, p, {
  searchFields: ['name', 'createdBy'],
  facets: { platform: POL_PLATFORM, type: POL_TYPE, status: POL_STATUS },
});

/* ── Resource 5: Workflows (same engine; name/stages/status, no KPIs) ──────── */
const WF_STATUS = ['Active', 'Draft', 'Paused'];
const WF_NAME = ['Onboarding', 'Patch Tuesday', 'Kiosk refresh', 'Security baseline', 'Server hardening', 'Field rollout', 'Finance close', 'Lab reimage'];
const WORKFLOWS = Array.from({ length: 22 }, (_, k) => {
  const i = k + 1;
  return { id: i, name: pick(WF_NAME, i) + ' workflow ' + (i * 3), stages: 2 + (i * 5) % 7, status: pick(WF_STATUS, i + (i % 2)) };
});
const workflowsQuery = (p) => applyQuery(WORKFLOWS, p, {
  searchFields: ['name'],
  facets: { status: WF_STATUS },
});

/* ── Resource 6: Device execution DETAIL — a by-id record, not a table query.
   Details have their own shape: one nested object (meta + donut + stages +
   timeline), fetched by name. Proves the data seam isn't only list-shaped. ── */
const DEV_EXEC = {
  name: 'VIR-LT-0245', domain: 'corp.acme.com', site: 'Chennai DC', loggedOn: 'nithya.k',
  lastContact: 'Jul 21, 9:14 AM', batch: 'Onboarding — July batch', status: 'Failed',
  donut: { succeeded: 2, failed: 1, waiting: 2 },
  stages: [
    { n: 1, name: 'Okta Verify — Install', type: 'Software', status: 'Succeeded', retry: '—', remarks: 'Installed 9.4 x64 silently', at: 'Jul 21, 8:02 AM' },
    { n: 2, name: 'CrowdStrike Falcon — Install', type: 'Software', status: 'Succeeded', retry: '—', remarks: 'Sensor registered with cloud', at: 'Jul 21, 8:09 AM' },
    { n: 3, name: 'Zscaler VPN Profile', type: 'Profile', status: 'Failed', retry: 'Retry In Progress', remarks: 'Error 0x87D1: profile install blocked by pending reboot', at: 'Jul 21, 8:15 AM' },
    { n: 4, name: 'Domain Join — corp.acme.com', type: 'Profile', status: 'Yet to Apply', retry: '—', remarks: 'Waiting — upstream stage failed', at: '--' },
    { n: 5, name: 'BitLocker — OS drive, TPM', type: 'Security', status: 'Yet to Apply', retry: '—', remarks: 'Waiting — upstream stage failed', at: '--' },
  ],
  timeline: [
    { d: 'g', t: 'Announcement (pre)', out: 'Users saw a message: "IT is installing your onboarding profile — allow 15 min."' },
    { d: 'g', t: '1. Okta Verify — Install', out: 'msiexec exit 0 / Detected: 9.4.0 x64', mono: true },
    { d: 'g', t: '2. CrowdStrike Falcon — Install', out: 'Sensor installed · CID registered', mono: true },
    { d: 'r', t: '3. Zscaler VPN Profile', out: 'Error 0x87D1: profile install blocked\nCause: pending reboot from Falcon sensor\nOn failure = Stop → downstream stages held\nRetry: attempt 2 of 2 scheduled after reboot', mono: true },
    { d: 'n', t: '4. Domain Join — corp.acme.com', out: 'Waiting for stage 3 to succeed' },
    { d: 'n', t: '5. BitLocker — OS drive, TPM', out: 'Waiting for stage 3 to succeed' },
  ],
};
const deviceExecution = (p) => ({ ...DEV_EXEC, name: p.get('name') || DEV_EXEC.name });

/* ── Resource 7: Home module dashboard — a composite record (KPIs + charts +
   list widgets + a table), not a table query. One fetch feeds the whole L02
   bento. Charts are { categories, series:[{ name, values, colors? }] }; list
   `tone` is a semantic key the client maps to tokens (no CSS in the API). ── */
const HOME_DASHBOARD = {
  kpis: [
    { label: 'Managed Computers', value: '186', state: 'success', icon: 'computer' },
    { label: 'SDP Computers', value: '39', state: 'default', icon: 'server-01' },
    { label: 'Waiting Computers', value: '39', state: 'warning', icon: 'clock' },
  ],
  charts: {
    os:      { categories: ['Redhat', 'Windows', 'Ubuntu', 'Mac', 'Others'], series: [{ name: 'Devices Enrolled', values: [43270, 78990, 86543, 121, 209] }] },
    contact: { categories: ['0-3 Days', '4-7 days', '8-15 days', '16-30 days', '31+ days'], series: [{ name: 'Devices', values: [20, 50, 210, 60, 200], color: 'red' }] },
    vuln:    { categories: ['Install', 'Important', 'Moderate', 'Low'], series: [{ name: 'Count', values: [1700, 1100, 650, 180], colors: ['red', 'orange', 'yellow', 'grey'] }] },
    patch:   { categories: ['Installed', 'Missing'], series: [{ name: 'Patches', values: [125, 30], colors: ['green', 'red'] }] },
    img:     { categories: ['Microsoft Windows 11 Professional'], series: [{ name: 'Total', values: [3], colors: ['blue'] }] },
    health:  { categories: ['Vulnerable', 'High Vulnerable', 'Healthy', 'Health Not Available'], series: [{ name: 'Count Range', values: [22, 45, 55, 68], colors: ['orange', 'red', 'green', 'blue'] }] },
    deploy:  { categories: ['Completed', 'Scheduled', 'In progress', 'Failed'], series: [{ name: 'Devices', values: [125, 90, 90, 90], colors: ['green', 'orange', 'yellow', 'red'] }] },
    devtype: { categories: ['SmartPhone', 'Desktop', 'Laptop', 'Tablet', 'Others'], series: [{ name: 'Devices', values: [225, 200, 90, 90, 90] }] },
    imgstat: { categories: ['In progress', 'Completed', 'Vulnerable', 'Failed'], series: [{ name: 'Count Range', values: [60, 40, 25, 30], colors: ['green', 'blue', 'grey', 'red'] }] },
    drivers: { categories: ['Net', 'Mouse', 'Keyboard', 'System', 'I4IDClass', 'Process', 'fdc', 'USB', 'hdc', 'Ports', 'Display'], series: [{ name: 'Drivers', values: [5, 4, 3, 3, 2, 2, 2, 2, 2, 2, 1] }] },
    cfgsum:  { categories: ['Expired', 'Ready to Execute', 'Executed', 'In progress', 'Suspended', 'Retry in progress', 'Draft'], series: [{ name: 'Status', values: [1500, 1300, 864, 744, 643, 465, 245], colors: ['red', 'blue', 'green', 'orange', 'purple', 'charoite', 'grey'] }] },
  },
  lists: {
    software: [
      { icon: 'layers', label: 'Total Software', val: '1,289', tone: 'info' },
      { icon: 'circle-tick', label: 'In Compliance (Licensed)', val: '834', tone: 'success' },
      { icon: 'exclamation-circle', label: 'Over Licensed', val: '89', tone: 'error' },
      { icon: 'clock', label: 'Under Licensed', val: '42', tone: 'warning' },
      { icon: 'info-circle', label: 'License Expired', val: '15', tone: 'error' },
      { icon: 'shield', label: 'Prohibited Software', val: '13', tone: 'error' },
    ],
    remote: [
      { icon: 'computer', label: 'Roy Device', link: true, badge: 'Disconnected', state: 'default' },
      { icon: 'computer', label: 'Reser 2 device', link: true, badge: 'Disconnected', state: 'default' },
      { icon: 'computer', label: 'Raju 209', link: true, badge: 'Operation failed!', state: 'critical' },
      { icon: 'computer', label: '2892Dell dev', link: true, badge: 'Operation failed!', state: 'critical' },
      { icon: 'computer', label: 'aravinth29302', link: true, badge: 'Disconnected', state: 'default' },
      { icon: 'computer', label: 'James1239', link: true, badge: 'Operation failed!', state: 'critical' },
    ],
    config: [
      { icon: 'settings', label: 'Configuration 2832', link: true, badge: 'Executed', state: 'success' },
      { icon: 'settings', label: 'Configuration 1187', link: true, badge: 'Ready to Execute', state: 'default' },
      { icon: 'settings', label: 'Configuration 0459', link: true, badge: 'Suspended', state: 'critical' },
      { icon: 'settings', label: 'Configuration 7720', link: true, badge: 'Suspended', state: 'critical' },
      { icon: 'settings', label: 'Configuration 5561', link: true, badge: 'Ready to Execute', state: 'default' },
      { icon: 'settings', label: 'Configuration 3390', link: true, badge: 'Suspended', state: 'critical' },
    ],
  },
  repo: ['Notepad 5.8.6', 'Orca', 'Nvidia-353 367.57-0 for Ubuntu 14.04 LTS', 'PostgreSQL 9.5.173 for Ubuntu 16.04 LTS (x64)', 'Nvidia-353 367.57-0 for Ubuntu 14.04 LTS', 'Orca']
    .map((n, i) => ({ id: i + 1, name: n, path: 'C:\\DEMO\\DesktopCentral_Server\\lib\\703795-nvidia-352_3…' })),
};
const homeDashboard = () => HOME_DASHBOARD;

/* ── Resource 8: Highly Vulnerable Systems (Threats & Patches landing) — a
   server-driven table ranked by vulnerability/missing-patch risk. ── */
const HVS_OS = ['Windows 11 Pro', 'Windows 10 Ent', 'Windows Server 2019', 'Ubuntu 22.04 LTS', 'macOS 14', 'RHEL 9'];
const HVS_RISK = ['Critical', 'Critical', 'High', 'High', 'Medium', 'Low'];
const HVS_GROUP = ['Finance OU', 'Servers', 'Sales laptops', 'Engineering', 'Kiosks', 'Remote offices'];
const HVS_SCAN = ['12 min ago', '1 hr ago', '3 hrs ago', 'Today', 'Yesterday', 'Jul 9, 2026'];
const HVS = Array.from({ length: 34 }, (_, k) => {
  const i = k + 1, risk = pick(HVS_RISK, i + (i % 3));
  const base = risk === 'Critical' ? 60 : risk === 'High' ? 35 : risk === 'Medium' ? 18 : 6;
  return {
    id: i,
    name: pick(['FIN', 'SRV', 'ENG', 'SALES', 'OPS', 'HR'], i) + '-WKS-' + (100 + i * 5),
    os: pick(HVS_OS, i + 1),
    risk,
    vulnerabilities: base + (i * 7) % 25,
    missingPatches: 3 + (i * 3) % 40,
    exploitable: risk === 'Critical' ? 2 + (i % 6) : risk === 'High' ? 1 + (i % 3) : 0,
    group: pick(HVS_GROUP, i),
    lastScan: pick(HVS_SCAN, i),
  };
});
const highlyVulnerableQuery = (p) => applyQuery(HVS, p, {
  searchFields: ['name', 'os', 'group'],
  facets: { risk: ['Critical', 'High', 'Medium', 'Low'], os: HVS_OS, group: HVS_GROUP },
  kpi: (d) => ({
    total: d.length,
    critical: d.filter((r) => r.risk === 'Critical').length,
    high: d.filter((r) => r.risk === 'High').length,
    exploitable: d.filter((r) => r.exploitable > 0).length,
  }),
});

/* ── Resource 8b: Missing Patches (Threats & Patches) — patches missing across the
   fleet, a server-driven table. Same applyQuery contract as HVS. ── */
const MP_VENDOR = ['Microsoft', 'Adobe', 'Google', 'Mozilla', 'Oracle', '7-Zip'];
const MP_SEV = ['Critical', 'Critical', 'Important', 'Important', 'Moderate', 'Low'];
const MP_CAT = ['Security update', 'Rollup', 'Feature pack', 'Driver', 'Third-party app', 'Security update'];
const MP_PLAT = ['Windows', 'Windows', 'Windows', 'macOS', 'Linux', 'Windows'];
const MP_APPROVAL = ['Approved', 'Not approved', 'Not approved', 'Declined', 'Approved', 'Not approved'];
const MP_TITLE = ['Cumulative Update for Windows', 'Security Update for .NET', 'Acrobat Reader security patch', 'Chrome stable channel update', 'Firefox ESR update', 'Java SE critical patch update', '7-Zip update', 'Edge security update', 'Office security update'];
const MP_RELEASED = ['Jul 8, 2026', 'Jul 2, 2026', 'Jun 26, 2026', 'Jun 19, 2026', 'Jun 11, 2026', 'May 28, 2026'];
const MISSING_PATCHES = Array.from({ length: 38 }, (_, k) => {
  const i = k + 1;
  return {
    id: i,
    bulletinId: 'KB' + (5030000 + i * 137),
    title: pick(MP_TITLE, i) + ' (' + (2026 - (i % 3)) + ')',
    vendor: pick(MP_VENDOR, i),
    severity: pick(MP_SEV, i + (i % 4)),
    category: pick(MP_CAT, i),
    platform: pick(MP_PLAT, i),
    missingSystems: 3 + (i * 11) % 120,
    approval: pick(MP_APPROVAL, i),
    reboot: i % 3 === 0 ? 'Yes' : 'No',
    released: pick(MP_RELEASED, i),
  };
});
const missingPatchesQuery = (p) => applyQuery(MISSING_PATCHES, p, {
  searchFields: ['bulletinId', 'title', 'vendor'],
  facets: { severity: ['Critical', 'Important', 'Moderate', 'Low'], vendor: MP_VENDOR, approval: ['Approved', 'Not approved', 'Declined'], platform: ['Windows', 'macOS', 'Linux'] },
  kpi: (d) => ({
    total: d.length,
    critical: d.filter((r) => r.severity === 'Critical').length,
    systemsAffected: d.reduce((a, r) => a + r.missingSystems, 0),
    pendingApproval: d.filter((r) => r.approval === 'Not approved').length,
  }),
});

/* ── Resource 9: Inventory overview (the Inventory tab landing) — an L02 bento
   dashboard summarising hardware + software inventory across managed computers.
   One composite record (KPIs + charts + list widgets + a hardware table), same
   shape the home dashboard uses so the native view reads it with plain getters. */
const INV_MFR   = ['Dell', 'HP', 'Lenovo', 'Apple', 'Microsoft', 'Others'];
const INV_MODEL = ['OptiPlex 7090', 'EliteBook 840', 'ThinkPad T14', 'MacBook Pro 14', 'Surface Pro 9', 'Latitude 5540'];
const INV_MEM   = ['8 GB', '16 GB', '16 GB', '32 GB', '8 GB', '16 GB'];
const INV_DISK  = ['256 GB SSD', '512 GB SSD', '1 TB SSD', '512 GB SSD', '256 GB SSD', '1 TB NVMe'];
const INVENTORY_OVERVIEW = {
  kpis: [
    { label: 'Managed Computers', value: '186', state: 'success', icon: 'computer' },
    { label: 'Hardware Assets', value: '1,204', state: 'default', icon: 'server-01' },
    { label: 'Software Products', value: '1,289', state: 'default', icon: 'layers' },
  ],
  charts: {
    os:      { categories: ['Windows', 'Ubuntu', 'macOS', 'RHEL', 'Others'], series: [{ name: 'Computers', values: [118, 34, 21, 9, 4] }] },
    mfr:     { categories: INV_MFR, series: [{ name: 'Assets', values: [420, 356, 240, 96, 62, 30] }] },
    swcat:   { categories: ['Productivity', 'Developer', 'Security', 'Media', 'Utilities', 'Others'], series: [{ name: 'Products', values: [312, 268, 190, 140, 220, 159] }] },
    license: { categories: ['Licensed', 'Over licensed', 'Under licensed', 'Expired'], series: [{ name: 'Software', values: [834, 89, 42, 15], colors: ['green', 'orange', 'yellow', 'red'] }] },
    scan:    { categories: ['Success', 'Failed', 'Not scanned'], series: [{ name: 'Computers', values: [162, 14, 10], colors: ['green', 'red', 'grey'] }] },
    devtype: { categories: ['Desktop', 'Laptop', 'Server', 'Tablet', 'Others'], series: [{ name: 'Devices', values: [78, 82, 18, 6, 2] }] },
    memory:  { categories: ['4 GB', '8 GB', '16 GB', '32 GB', '64+ GB'], series: [{ name: 'Computers', values: [12, 64, 78, 26, 6] }] },
  },
  lists: {
    software: [
      { icon: 'layers', label: 'Total Software', val: '1,289', tone: 'info' },
      { icon: 'circle-tick', label: 'In Compliance (Licensed)', val: '834', tone: 'success' },
      { icon: 'exclamation-circle', label: 'Over Licensed', val: '89', tone: 'error' },
      { icon: 'clock', label: 'Under Licensed', val: '42', tone: 'warning' },
      { icon: 'info-circle', label: 'License Expired', val: '15', tone: 'error' },
      { icon: 'shield', label: 'Prohibited Software', val: '13', tone: 'error' },
    ],
    warranty: [
      { icon: 'computer', label: 'FIN-WKS-104 (Dell)', link: true, badge: 'Expires in 6 days', state: 'critical' },
      { icon: 'computer', label: 'SALES-LT-221 (HP)', link: true, badge: 'Expires in 14 days', state: 'warning' },
      { icon: 'computer', label: 'ENG-WKS-318 (Lenovo)', link: true, badge: 'Expires in 21 days', state: 'warning' },
      { icon: 'computer', label: 'OPS-SRV-002 (Dell)', link: true, badge: 'Expires in 28 days', state: 'default' },
      { icon: 'computer', label: 'HR-LT-140 (Apple)', link: true, badge: 'Expires in 30 days', state: 'default' },
      { icon: 'computer', label: 'SRV-DB-011 (HP)', link: true, badge: 'Expired', state: 'critical' },
    ],
  },
  hardware: Array.from({ length: 8 }, (_, k) => {
    const i = k + 1;
    return {
      id: i,
      name: pick(['FIN', 'SALES', 'ENG', 'OPS', 'HR', 'SRV'], i) + '-WKS-' + (100 + i * 6),
      manufacturer: pick(INV_MFR, i),
      model: pick(INV_MODEL, i),
      memory: pick(INV_MEM, i),
      disk: pick(INV_DISK, i),
    };
  }),
};
const inventoryOverview = () => INVENTORY_OVERVIEW;

/* ── Resource 10: whoami (userMeta) — resolves the current session to a user for
   the profile drawer, matching PrismAPI.auth.readUser's field names. This is a
   demo backend: it returns a fixed admin (no real session check — the client
   guard already gates on token presence). Wire a real auth check here to go live. */
const userMeta = () => ({
  displayName: 'Demo Admin',
  loginID: 'admin',
  roleName: 'Administrator',
  email: 'admin@acme.example',
  userTimeZone: 'America/Los_Angeles',
  userLocale: 'en_US',
  adminUser: true,
});

/* ── Resource: DEX devices — per-device digital-experience feed ──────────────
   Score bands: Good 71–100 · Average 31–70 · Poor 0–30. DEX status = onboarded
   to DEX (Enabled) or not (Yet to enable). Facets: platform / dexStatus / office
   / band. Reuses applyQuery — data + config only. */
const DEX_OFFICE = ['HQ', 'Remote', 'Branch'];
const DEX_OSMAP = { Windows: ['Windows 11 Pro', 'Windows 10 Ent', 'Windows 10 Pro', 'Windows Server 2019', 'Windows 11 IoT', 'Windows 8.1'], macOS: ['macOS 14 Sonoma', 'macOS 13 Ventura'], Linux: ['Ubuntu 22.04 LTS', 'RHEL 9'] };
const DEX_REMARK = ['High disk latency', 'Slow logon', 'High CPU', 'Memory pressure', 'Weak Wi-Fi', 'App crashes', 'Slow boot', 'Healthy', 'Unsupported OS', 'Battery drain'];
const DEX_NAMES = ['FIN-WKS', 'SALES-LT', 'ENG-WKS', 'HR-LT', 'OPS-WKS', 'DEV-MBP', 'SRV-DB', 'MKT-LT', 'EXE-MBP', 'SUP-WKS', 'QA-WKS'];
const dexBand = (s) => (s == null ? 'na' : s >= 71 ? 'Good' : s >= 31 ? 'Average' : 'Poor');
const DEX_DEVICES = Array.from({ length: 26 }, (_, k) => {
  const i = k + 1;
  const platform = pick(['Windows', 'Windows', 'Windows', 'macOS', 'Linux'], i);
  const enabled = i % 7 !== 0;
  const score = enabled ? (17 + (i * 29) % 84) : null;
  return { id: i, name: pick(DEX_NAMES, i) + '-' + (100 + i * 7), domain: 'corp.local', score, platform, os: pick(DEX_OSMAP[platform], i), office: pick(DEX_OFFICE, i), dexStatus: enabled ? 'Enabled' : 'Yet to enable', band: dexBand(score), remarks: enabled ? pick(DEX_REMARK, i) : 'Agent not deployed', agent: enabled && i % 4 !== 0 ? 'live' : 'down' };
});
const dexDevicesQuery = (p) => applyQuery(DEX_DEVICES, p, {
  searchFields: ['name', 'os', 'remarks'],
  facets: { platform: ['Windows', 'macOS', 'Linux'], dexStatus: ['Enabled', 'Yet to enable'], office: DEX_OFFICE, band: ['Good', 'Average', 'Poor'] },
  kpi: (d) => { const scored = d.filter((r) => r.score != null); const avg = scored.length ? Math.round(scored.reduce((a, r) => a + r.score, 0) / scored.length) : 0; return { total: d.length, avg, good: d.filter((r) => r.band === 'Good').length, poor: d.filter((r) => r.band === 'Poor').length, pending: d.filter((r) => r.dexStatus === 'Yet to enable').length }; },
});

/* Single device record (drill-down) — the list row + contributing sub-scores that
   roll up to the experience score, and a 14-day score trend for the chart. Fetched
   by ?id=. */
const DEX_FACTOR = ['CPU', 'Memory', 'Disk', 'Boot time', 'Network', 'App crashes'];
const DEX_FACTOR_WEIGHT = ['25%', '20%', '20%', '15%', '12%', '8%'];
const DEX_MODEL = ['Dell Latitude 7420', 'HP EliteBook 840', 'Lenovo ThinkPad X1', 'MacBook Pro 14', 'Surface Laptop 5'];
function dexDevice(p) {
  const id = Number(p.get('id') || 1);
  const base = DEX_DEVICES.find((d) => d.id === id) || DEX_DEVICES[0];
  const s = base.score == null ? 0 : base.score;
  const subScores = DEX_FACTOR.map((factor, i) => {
    const score = Math.max(4, Math.min(100, s + ((i * 17 + id * 7) % 41) - 20));
    return { id: i + 1, factor, score, weight: DEX_FACTOR_WEIGHT[i], band: dexBand(score) };
  });
  const days = Array.from({ length: 14 }, (_, k) => 'D-' + (13 - k));
  const values = Array.from({ length: 14 }, (_, k) => Math.max(6, Math.min(100, Math.round(s + 14 * Math.sin((k + id) / 2.3) - 4))));
  return { ...base, model: pick(DEX_MODEL, id), lastSeen: 'Jul 16, 2026 03:19 PM', subScores, trend: { days, values } };
}

/* DEX overview (the DEX tab landing, L02 bento) — fleet-level digital-experience
   summary aggregated from the same DEX_DEVICES dataset the list/detail use, so the
   numbers reconcile. KPIs + charts + list widgets, same shape as the home/inventory
   dashboards. */
const dexOverview = () => {
  const scored = DEX_DEVICES.filter((d) => d.score != null);
  const avg = scored.length ? Math.round(scored.reduce((a, r) => a + r.score, 0) / scored.length) : 0;
  const band = (b) => DEX_DEVICES.filter((d) => d.band === b).length;
  const platAvg = (plat) => { const s = DEX_DEVICES.filter((d) => d.platform === plat && d.score != null); return s.length ? Math.round(s.reduce((a, r) => a + r.score, 0) / s.length) : 0; };
  const officeCount = (o) => DEX_DEVICES.filter((d) => d.office === o).length;
  const issueCounts = {};
  DEX_DEVICES.forEach((d) => { if (d.remarks && d.remarks !== 'Healthy' && d.remarks !== 'Agent not deployed') issueCounts[d.remarks] = (issueCounts[d.remarks] || 0) + 1; });
  const issues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, n]) => ({ icon: 'exclamation-triangle', label, val: String(n) }));
  const lowest = [...scored].sort((a, b) => a.score - b.score).slice(0, 6).map((d) => ({ id: d.id, name: d.name, score: d.score, band: d.band }));
  return {
    kpis: [
      { label: 'Experience score', value: String(avg), state: avg >= 71 ? 'success' : avg >= 31 ? 'warning' : 'critical', icon: 'activity' },
      { label: 'Devices monitored', value: String(DEX_DEVICES.length), state: 'default', icon: 'computer' },
      { label: 'Poor experience', value: String(band('Poor')), state: 'critical', icon: 'exclamation-circle' },
    ],
    charts: {
      band:       { categories: ['Good', 'Average', 'Poor'], series: [{ name: 'Devices', values: [band('Good'), band('Average'), band('Poor')], colors: ['green', 'orange', 'red'] }] },
      trend:      { categories: ['May', 'Jun 1', 'Jun 8', 'Jun 15', 'Jun 22', 'Jul 1', 'Jul 8'], series: [{ name: 'Avg score', values: [52, 55, 54, 58, 57, 61, avg] }] },
      platform:   { categories: ['Windows', 'macOS', 'Linux'], series: [{ name: 'Avg score', values: [platAvg('Windows'), platAvg('macOS'), platAvg('Linux')] }] },
      office:     { categories: DEX_OFFICE, series: [{ name: 'Devices', values: DEX_OFFICE.map(officeCount) }] },
      onboarding: { categories: ['Enabled', 'Yet to enable'], series: [{ name: 'Devices', values: [DEX_DEVICES.filter((d) => d.dexStatus === 'Enabled').length, DEX_DEVICES.filter((d) => d.dexStatus === 'Yet to enable').length], colors: ['green', 'grey'] }] },
    },
    lists: { issues, lowest },
  };
};

/* ── Routes ────────────────────────────────────────────────────────────────── */
function handle(url) {
  const p = url.searchParams;
  switch (url.pathname) {
    case '/bitlocker/api/resourceAvailable': return { resourceAvailable: true };
    case '/bitlocker/api/managedComputers': return computersQuery(p);
    case '/deployments/api/list': return deploymentsQuery(p);
    case '/deployments/api/devices': return devicesQuery(p);
    case '/deployments/api/policies': return policiesQuery(p);
    case '/deployments/api/workflows': return workflowsQuery(p);
    case '/deployments/api/deviceExecution': return deviceExecution(p);
    case '/dex/api/overview': return dexOverview();
    case '/dex/api/devices': return dexDevicesQuery(p);
    case '/dex/api/device': return dexDevice(p);
    case '/home/api/dashboard': return homeDashboard();
    case '/threats-patches/api/highlyVulnerable': return highlyVulnerableQuery(p);
    case '/threats-patches/api/missingPatches': return missingPatchesQuery(p);
    case '/inventory/api/overview': return inventoryOverview();
    case '/emsapi/uac/userMeta': return userMeta();
    default: return null;
  }
}

const server = http.createServer((req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const body = handle(url);
  if (body == null) {
    res.writeHead(404, { ...cors, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found', path: url.pathname }));
    return;
  }
  // Mock data is dynamic per query — never let the browser cache it (a stale cache
  // also hides loading states on reload).
  res.writeHead(200, { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  // Optional artificial latency for exercising loading/skeleton states: BFF_DELAY=ms.
  const send = () => res.end(JSON.stringify(body));
  const delay = Number(process.env.BFF_DELAY || 0);
  if (delay > 0) setTimeout(send, delay); else send();
});

server.listen(PORT, () => console.log(`[bff] listening on http://localhost:${PORT} — /bitlocker/api/*, /deployments/api/list`));
