/* =============================================================================
   prism-api.js — the app's data layer (front-end ⇄ backend API).

   ONE place to point the UI at a real backend. The views call PrismAPI.*;
   they never fetch or know URLs. Ships in MOCK mode (an in-JS fake server that
   mimics the real API contract) so pages work with no backend; set CONFIG.baseUrl
   to your API and it switches to live fetch — the SAME request/response/mapping
   code runs in both modes, so "going live" is a config change, not a rewrite.

   TO CONNECT YOUR EXISTING API, edit only the CONFIG block below:
     1. baseUrl      → your API origin (e.g. 'https://ec.example.com')
     2. headers()    → auth (Bearer token / cookie / API key)
     3. endpoints    → your real paths
     4. params       → your real query-param NAMES (search/status/page/…)
     5. mapDevice()  → map ONE api record → the table's row shape
     6. readList()   → where rows + total live in your response envelope
   Nothing else in the app needs to change.
   ============================================================================= */
(function (global) {
  'use strict';

  const CONFIG = {
    /* 1 ─ Where the API lives. Two modes:
       • proxyPrefix (DEFAULT) — talk to a SAME-ORIGIN dev proxy that forwards to the
         backend. Requests go to <this app's origin>/proxy/… → the proxy (server/dev-proxy.mjs)
         forwards to http://ems-ds:8020/…  No CORS, no cert prompt, no mixed-content.
       • baseUrl — talk to the API origin directly (needs CORS + a trusted cert).
       proxyPrefix wins when set. Empty BOTH = MOCK mode. Both overridable via localStorage
       ('uems-api-proxy' / 'uems-api-base'). */
    proxyPrefix: (function () { try { return localStorage.getItem('uems-api-proxy') ?? '/proxy'; } catch (_) { return '/proxy'; } })(),
    baseUrl:     (function () { try { return localStorage.getItem('uems-api-base')  || ''; } catch (_) { return ''; } })(),

    /* Login gate. OFF by default so the .env/proxy-key path (auth injected at the
       proxy, no browser token) is never bounced to a login screen. Turn ON for the
       interactive login flow: localStorage['uems-require-login'] = 'true'. */
    requireLogin: (function () { try { return localStorage.getItem('uems-require-login') === 'true'; } catch (_) { return false; } })(),

    /* When a live call fails, DON'T silently show mock data (that's the "still loads
       static data" trap) — let the failure surface so the UI shows its empty/error
       state. Opt back into mock-on-failure for offline demos with
       localStorage['uems-mock-fallback'] = 'true'. */
    fallbackToMock: (function () { try { return localStorage.getItem('uems-mock-fallback') === 'true'; } catch (_) { return false; } })(),

    /* 2 ─ Auth / headers sent on every request. Return your real token. */
    headers() {
      const token = (function () { try { return localStorage.getItem('uems-token') || ''; } catch (_) { return ''; } })();
      return {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      };
    },
    credentials: 'omit',               // 'include' if your API uses cookie auth (needs CORS creds on the server)

    /* 3 ─ Endpoint paths (appended to baseUrl). */
    endpoints: {
      devices: '/api/devices',         // GET list (filter/search/sort/page via query params)
      deviceStats: '/api/devices/stats', // GET KPI + facet counts (optional; derived from list if absent)
    },

    /* 4 ─ Query-param NAMES your API expects. Rename the values to match. */
    params: {
      search: 'search', status: 'status', platform: 'platform',
      page: 'page', pageSize: 'pageSize', sort: 'sort',
    },

    /* 5 ─ Map ONE record from your API → the table row shape the UI needs.
       Change the right-hand sides to your real field names. */
    mapDevice(r) {
      return {
        id:       r.id            ?? r.resourceId ?? r.guid,
        device:   r.device        ?? r.name       ?? r.hostName,
        platform: r.platform      ?? r.osPlatform,
        os:       r.os            ?? r.osName,
        status:   r.status        ?? r.managedStatus,
        owner:    r.owner         ?? r.ownerName,
        email:    r.email         ?? r.ownerEmail,
        lastSeen: r.lastSeen      ?? r.lastContactTime,
      };
    },

    /* 6 ─ Pull { rows, total } out of your list response envelope.
       Examples: { data:[…], total:N } → return { rows:body.data, total:body.total }
                 a bare array          → return { rows:body, total:body.length }  */
    readList(body) {
      if (Array.isArray(body)) return { rows: body, total: body.length };
      const rows = body.rows || body.data || body.items || body.devices || [];
      const total = body.total ?? body.totalCount ?? body.count ?? rows.length;
      return { rows, total };
    },

    /* 7 ─ Interactive login. EC is a TWO-STEP flow (confirmed from loginMeta):
         (1) GET metaEndpoint → RSA publicKey,
         (2) RSA-encrypt the password with it, then POST to `endpoint`.
       metaEndpoint is known; the POST endpoint/body + the encryption scheme are
       PENDING the actual Sign-in network request (loginPost below is a guess). */
    auth: {
      metaEndpoint: '/emsapi/login/loginMeta',
      metaAccept:   'application/loginMeta.v1+json',
      readPublicKey: (meta) => meta && meta.publicKey,
      readProduct:   (meta) => (meta && meta.productDetails) || null,
      /* "Who am I" — a POST-login call that requires a valid session. 200 + a
         name ⇒ authenticated; 401 ⇒ not. Also the source of real profile data. */
      whoamiEndpoint: '/emsapi/uac/userMeta',
      whoamiAccept:   'application/userMeta.v1+json',
      readUser: (u) => (u && (u.name || u.displayName || u.loginID)) ? {
        name: u.displayName || u.name || u.loginID,
        login: u.loginID || u.name || '',
        role: u.roleName || '',
        email: u.email || '',
        timeZone: u.userTimeZone || '',
        locale: u.userLocale || '',
        isAdmin: !!u.adminUser,
      } : null,
      /* ↓↓ TODO: replace once we see the real Sign-in POST ↓↓ */
      endpoint: '',                                   // e.g. '/emsapi/login/authenticate' (unknown)
      method: 'POST',
      form: (username, encryptedPassword) => ({ LOGIN_ID: username, PASSWORD: encryptedPassword }),
      readToken: (body) => (body?.auth_token || body?.token || ''),
    },
  };

  const useMock = () => !CONFIG.proxyPrefix && !CONFIG.baseUrl;

  /* ── Live transport ─────────────────────────────────────────────────────── */
  function buildUrl(path, query) {
    /* Proxy mode → same-origin: <origin>/proxy/<path>. Direct mode → against baseUrl. */
    const url = CONFIG.proxyPrefix
      ? new URL(CONFIG.proxyPrefix.replace(/\/$/, '') + '/' + String(path).replace(/^\//, ''), location.origin)
      : new URL(path, CONFIG.baseUrl);
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
      (Array.isArray(v) ? v : [v]).forEach((val) => url.searchParams.append(k, val));
    });
    return url.toString();
  }
  async function httpGet(path, query) {
    const res = await fetch(buildUrl(path, query), { headers: CONFIG.headers(), credentials: CONFIG.credentials });
    if (!res.ok) throw new Error('API ' + res.status + ' ' + res.statusText + ' for ' + path);
    return res.json();
  }

  /* Turn UI filter state → API query params (using CONFIG.params names). */
  function toQuery(p) {
    const P = CONFIG.params, q = {};
    if (p.search)   q[P.search] = p.search;
    if (p.status && p.status.length)     q[P.status] = p.status;
    if (p.platform && p.platform.length) q[P.platform] = p.platform;
    if (p.page)     q[P.page] = p.page;
    if (p.pageSize) q[P.pageSize] = p.pageSize;
    if (p.sort)     q[P.sort] = p.sort;
    return q;
  }

  /* ── Public API ─────────────────────────────────────────────────────────── */
  const PrismAPI = {
    get isMock() { return useMock(); },
    config: CONFIG,

    /* List devices. params: { search, status[], platform[], page, pageSize, sort }.
       Returns { rows:[{…row}], total:Number }. */
    async listDevices(params = {}) {
      if (useMock()) return Mock.list(params);
      try {
        const body = await httpGet(CONFIG.endpoints.devices, toQuery(params));
        const { rows, total } = CONFIG.readList(body);
        return { rows: rows.map(CONFIG.mapDevice), total };
      } catch (err) {
        if (CONFIG.fallbackToMock) { console.warn('[PrismAPI] live listDevices failed → using mock. Reason:', err.message); return Mock.list(params); }
        throw err;
      }
    },

    /* KPI + facet counts. Returns { total, byStatus:{Managed:n,…}, byPlatform:{…} }. */
    async stats() {
      if (useMock()) return Mock.stats();
      try {
        const body = await httpGet(CONFIG.endpoints.deviceStats, {});
        return {
          total: body.total ?? body.count ?? 0,
          byStatus: body.byStatus || body.status || {},
          byPlatform: body.byPlatform || body.platform || {},
        };
      } catch (_) {
        /* No stats endpoint → derive from a full (unpaged) list (which itself
           falls back to mock if the live list call fails). */
        const all = await this.listDevices({ pageSize: 100000 });
        return deriveStats(all.rows);
      }
    },

    /* BitLocker report availability gate. true → the report has data (show the
       table); false → show the empty state. No backend (mock) → true so the demo
       still renders. On a transient error, fall back to true (+ warn) so an auth
       hiccup doesn't blank the page. */
    bitlocker: {
      async resourceAvailable(viewName = 'BitLockerManagedSystemReportView') {
        if (useMock()) return true;
        try {
          const body = await httpGet('/bitlocker/api/resourceAvailable', { viewName });
          return !!(body && body.resourceAvailable);
        } catch (err) {
          if (CONFIG.fallbackToMock) { console.warn('[PrismAPI] bitlocker.resourceAvailable failed → assuming available (mock). Reason:', err.message); return true; }
          throw err;
        }
      },
      /* NEW endpoint (served by the BFF, server/bff.mjs). Mock mirrors the same
         contract so the UI works with no backend. { rows, total }. */
      async listComputers(params = {}) {
        if (useMock()) {
          const OS = ['Windows 11 Pro', 'Windows 11 Ent', 'Windows 10 Ent', 'Windows 10 Pro', 'Windows 8.1 Ent', 'Server 2019'];
          const ST = ['Encrypted', 'Encrypted', 'Encrypted', 'In progress', 'Not started', 'Failed'];
          const AU = ['TPM only', 'TPM + PIN', 'TPM + Enhanced PIN', 'Passphrase'];
          const SC = ['Full drive', 'OS drive only', 'Used space only'];
          const SE = ['2 min ago', '18 min ago', '1 hr ago', '3 hrs ago', 'Yesterday', 'Jul 8, 2026'];
          const p = (a, i) => a[i % a.length];
          const all = Array.from({ length: 42 }, (_, k) => {
            const i = k + 1, status = p(ST, i + (i % 3));
            return { id: i, name: p(['FIN', 'SALES', 'ENG', 'HR', 'OPS', 'SRV'], i) + '-WKS-' + (100 + i * 7), os: p(OS, i + 1), status, auth: p(AU, i), scope: p(SC, i), compliance: status === 'Encrypted' ? 'Compliant' : 'Not compliant', seen: p(SE, i) };
          });
          const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
          const f = { status: arr(params.status), os: arr(params.os), auth: arr(params.auth), compliance: arr(params.compliance) };
          const q = String(params.search || '').trim().toLowerCase();
          let matched = all.filter((r) => (!f.status.length || f.status.includes(r.status)) && (!f.os.length || f.os.includes(r.os)) && (!f.auth.length || f.auth.includes(r.auth)) && (!f.compliance.length || f.compliance.includes(r.compliance)) && (!q || r.name.toLowerCase().includes(q) || r.os.toLowerCase().includes(q)));
          const total = matched.length;
          if (params.sort) {
            const dir = params.dir === 'desc' ? -1 : 1;
            matched = [...matched].sort((a, b) => dir * String(a[params.sort] ?? '').localeCompare(String(b[params.sort] ?? ''), undefined, { numeric: true, sensitivity: 'base' }));
          }
          const page = Number(params.page || 1), size = Number(params.pageSize || 999);
          const rows = matched.slice((page - 1) * size, (page - 1) * size + size);
          const fc = (key, vals) => vals.map((v) => ({ value: v, count: all.filter((r) => r[key] === v).length }));
          return {
            rows, total,
            kpis: { managed: all.length, encrypted: all.filter((r) => r.status === 'Encrypted').length, pending: all.filter((r) => r.status === 'In progress').length, noncompliant: all.filter((r) => r.compliance === 'Not compliant').length },
            facets: { status: fc('status', ['Encrypted', 'In progress', 'Not started', 'Failed']), os: fc('os', OS), auth: fc('auth', AU), compliance: fc('compliance', ['Compliant', 'Not compliant']) },
          };
        }
        const q = {};
        ['status', 'os', 'auth', 'compliance', 'search', 'sort', 'dir', 'page', 'pageSize'].forEach((k) => {
          if (params[k] != null && String(params[k]).length) q[k] = Array.isArray(params[k]) ? params[k].join(',') : params[k];
        });
        const body = await httpGet('/bitlocker/api/managedComputers', q);
        return { rows: (body && body.rows) || [], total: (body && body.total) || 0, kpis: (body && body.kpis) || null, facets: (body && body.facets) || null };
      },
    },

    /* Deployments — the SECOND resource. Same server-driven-table contract; the
       client wiring is identical to bitlocker.listComputers (only the path + shape
       differ). Live → the BFF /deployments/api/list; mock mirrors the contract. */
    deployments: {
      async list(params = {}) {
        if (useMock()) {
          const T = ['Software', 'Patch', 'Configuration', 'Script'], P = ['Windows', 'macOS', 'Linux'];
          const S = ['Success', 'Success', 'In progress', 'Failed', 'Scheduled'], TG = ['All Windows', 'Finance OU', 'Remote offices', 'Servers', 'Kiosks', 'Sales laptops'], CR = ['Just now', '10 min ago', '1 hr ago', 'Today', 'Yesterday', 'Jul 6, 2026'];
          const p = (a, i) => a[i % a.length];
          const all = Array.from({ length: 30 }, (_, k) => { const i = k + 1; return { id: i, name: p(['Deploy', 'Rollout', 'Push', 'Install'], i) + '-' + p(T, i) + '-' + (1000 + i * 3), type: p(T, i), platform: p(P, i + 1), status: p(S, i + (i % 2)), target: p(TG, i), devices: 5 + (i * 13) % 240, created: p(CR, i) }; });
          const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
          const f = { status: arr(params.status), type: arr(params.type), platform: arr(params.platform) };
          const q = String(params.search || '').trim().toLowerCase();
          let m = all.filter((r) => (!f.status.length || f.status.includes(r.status)) && (!f.type.length || f.type.includes(r.type)) && (!f.platform.length || f.platform.includes(r.platform)) && (!q || r.name.toLowerCase().includes(q) || r.target.toLowerCase().includes(q)));
          const total = m.length;
          if (params.sort) { const dir = params.dir === 'desc' ? -1 : 1; m = [...m].sort((a, b) => dir * String(a[params.sort] ?? '').localeCompare(String(b[params.sort] ?? ''), undefined, { numeric: true, sensitivity: 'base' })); }
          const page = Number(params.page || 1), size = Number(params.pageSize || 999);
          const fc = (key, vals) => vals.map((v) => ({ value: v, count: all.filter((r) => r[key] === v).length }));
          return { rows: m.slice((page - 1) * size, (page - 1) * size + size), total, kpis: { total: all.length, success: all.filter((r) => r.status === 'Success').length, running: all.filter((r) => r.status === 'In progress').length, failed: all.filter((r) => r.status === 'Failed').length }, facets: { status: fc('status', ['Success', 'In progress', 'Failed', 'Scheduled']), type: fc('type', T), platform: fc('platform', P) } };
        }
        const q = {};
        ['status', 'type', 'platform', 'search', 'sort', 'dir', 'page', 'pageSize'].forEach((k) => { if (params[k] != null && String(params[k]).length) q[k] = Array.isArray(params[k]) ? params[k].join(',') : params[k]; });
        const body = await httpGet('/deployments/api/list', q);
        return { rows: (body && body.rows) || [], total: (body && body.total) || 0, kpis: (body && body.kpis) || null, facets: (body && body.facets) || null };
      },
      async devices(params = {}) {
        if (useMock()) {
          const OSS = ['Windows', 'macOS', 'Linux'], STS = ['Deployed', 'Deployed', 'In progress', 'Pending', 'Failed'], GRP = ['All Windows', 'Finance OU', 'Servers', 'Sales laptops', 'Kiosks'], SEE = ['Just now', '12 min ago', '1 hr ago', 'Today', 'Yesterday'];
          const p = (a, i) => a[i % a.length];
          const all = Array.from({ length: 36 }, (_, k) => { const i = k + 1; return { id: i, name: p(['FIN', 'SALES', 'ENG', 'HR', 'OPS', 'SRV'], i) + '-DEV-' + (200 + i * 5), os: p(OSS, i), status: p(STS, i + (i % 3)), deployments: 1 + (i * 7) % 6, lastRun: p(SEE, i), group: p(GRP, i) }; });
          const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
          const f = { status: arr(params.status), os: arr(params.os), group: arr(params.group) };
          const q = String(params.search || '').trim().toLowerCase();
          let m = all.filter((r) => (!f.status.length || f.status.includes(r.status)) && (!f.os.length || f.os.includes(r.os)) && (!f.group.length || f.group.includes(r.group)) && (!q || r.name.toLowerCase().includes(q) || r.group.toLowerCase().includes(q)));
          const total = m.length;
          if (params.sort) { const dir = params.dir === 'desc' ? -1 : 1; m = [...m].sort((a, b) => dir * String(a[params.sort] ?? '').localeCompare(String(b[params.sort] ?? ''), undefined, { numeric: true, sensitivity: 'base' })); }
          const page = Number(params.page || 1), size = Number(params.pageSize || 999);
          const fc = (key, vals) => vals.map((v) => ({ value: v, count: all.filter((r) => r[key] === v).length }));
          return { rows: m.slice((page - 1) * size, (page - 1) * size + size), total, kpis: { total: all.length, deployed: all.filter((r) => r.status === 'Deployed').length, pending: all.filter((r) => r.status === 'Pending' || r.status === 'In progress').length, failed: all.filter((r) => r.status === 'Failed').length }, facets: { status: fc('status', ['Deployed', 'In progress', 'Pending', 'Failed']), os: fc('os', OSS), group: fc('group', GRP) } };
        }
        const q = {};
        ['status', 'os', 'group', 'search', 'sort', 'dir', 'page', 'pageSize'].forEach((k) => { if (params[k] != null && String(params[k]).length) q[k] = Array.isArray(params[k]) ? params[k].join(',') : params[k]; });
        const body = await httpGet('/deployments/api/devices', q);
        return { rows: (body && body.rows) || [], total: (body && body.total) || 0, kpis: (body && body.kpis) || null, facets: (body && body.facets) || null };
      },
      /* Deployment policies — a plain list (no KPIs): name→detail, per-row menu. */
      async policies(params = {}) {
        if (useMock()) {
          const PL = ['Windows', 'macOS', 'Linux'], TY = ['Profile', 'Software', 'Patch', 'Script'];
          const ST = ['Draft', 'Ready to Execute', 'Executed', 'In Progress', 'In Progress (Failed)', 'Suspended', 'Rejected', 'Expired'];
          const US = ['A. Menon', 'R. Kapoor', 'S. Iyer', 'J. Fernandes', 'M. Bose'], WH = ['Just now', '10 min ago', '1 hr ago', 'Today', 'Yesterday', 'Jul 6, 2026', 'Jun 28, 2026'];
          const p = (a, i) => a[i % a.length];
          const all = Array.from({ length: 34 }, (_, k) => { const i = k + 1; return { id: i, name: p(['Onboarding', 'Baseline', 'Security', 'Kiosk', 'Finance', 'Field'], i) + '-' + p(TY, i) + '-' + (100 + i * 3), scope: i % 4 === 0 ? 'user' : 'computer', platform: p(PL, i), type: p(TY, i), status: p(ST, i + (i % 3)), createdBy: p(US, i), modified: p(WH, i), modifiedBy: p(US, i + 2) }; });
          const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
          const f = { platform: arr(params.platform), type: arr(params.type), status: arr(params.status) };
          const q = String(params.search || '').trim().toLowerCase();
          let m = all.filter((r) => (!f.platform.length || f.platform.includes(r.platform)) && (!f.type.length || f.type.includes(r.type)) && (!f.status.length || f.status.includes(r.status)) && (!q || r.name.toLowerCase().includes(q) || r.createdBy.toLowerCase().includes(q)));
          const total = m.length;
          if (params.sort) { const dir = params.dir === 'desc' ? -1 : 1; m = [...m].sort((a, b) => dir * String(a[params.sort] ?? '').localeCompare(String(b[params.sort] ?? ''), undefined, { numeric: true, sensitivity: 'base' })); }
          const page = Number(params.page || 1), size = Number(params.pageSize || 999);
          const fc = (key, vals) => vals.map((v) => ({ value: v, count: all.filter((r) => r[key] === v).length }));
          return { rows: m.slice((page - 1) * size, (page - 1) * size + size), total, kpis: null, facets: { platform: fc('platform', PL), type: fc('type', TY), status: fc('status', ST) } };
        }
        const q = {};
        ['platform', 'type', 'status', 'search', 'sort', 'dir', 'page', 'pageSize'].forEach((k) => { if (params[k] != null && String(params[k]).length) q[k] = Array.isArray(params[k]) ? params[k].join(',') : params[k]; });
        const body = await httpGet('/deployments/api/policies', q);
        return { rows: (body && body.rows) || [], total: (body && body.total) || 0, kpis: (body && body.kpis) || null, facets: (body && body.facets) || null };
      },
      /* Workflows — simplest list: name / stages / status, no KPIs. */
      async workflows(params = {}) {
        if (useMock()) {
          const ST = ['Active', 'Draft', 'Paused'], NM = ['Onboarding', 'Patch Tuesday', 'Kiosk refresh', 'Security baseline', 'Server hardening', 'Field rollout', 'Finance close', 'Lab reimage'];
          const p = (a, i) => a[i % a.length];
          const all = Array.from({ length: 22 }, (_, k) => { const i = k + 1; return { id: i, name: p(NM, i) + ' workflow ' + (i * 3), stages: 2 + (i * 5) % 7, status: p(ST, i + (i % 2)) }; });
          const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
          const f = { status: arr(params.status) };
          const q = String(params.search || '').trim().toLowerCase();
          let m = all.filter((r) => (!f.status.length || f.status.includes(r.status)) && (!q || r.name.toLowerCase().includes(q)));
          const total = m.length;
          if (params.sort) { const dir = params.dir === 'desc' ? -1 : 1; m = [...m].sort((a, b) => dir * String(a[params.sort] ?? '').localeCompare(String(b[params.sort] ?? ''), undefined, { numeric: true, sensitivity: 'base' })); }
          const page = Number(params.page || 1), size = Number(params.pageSize || 999);
          const fc = (key, vals) => vals.map((v) => ({ value: v, count: all.filter((r) => r[key] === v).length }));
          return { rows: m.slice((page - 1) * size, (page - 1) * size + size), total, kpis: null, facets: { status: fc('status', ST) } };
        }
        const q = {};
        ['status', 'search', 'sort', 'dir', 'page', 'pageSize'].forEach((k) => { if (params[k] != null && String(params[k]).length) q[k] = Array.isArray(params[k]) ? params[k].join(',') : params[k]; });
        const body = await httpGet('/deployments/api/workflows', q);
        return { rows: (body && body.rows) || [], total: (body && body.total) || 0, kpis: (body && body.kpis) || null, facets: (body && body.facets) || null };
      },
      /* Device execution DETAIL — a by-name record (not list-shaped): meta +
         donut counts + per-stage rows + timeline nodes. */
      async deviceExecution(params = {}) {
        const rec = {
          name: params.name || 'VIR-LT-0245', domain: 'corp.acme.com', site: 'Chennai DC', loggedOn: 'nithya.k',
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
        if (useMock()) return rec;
        const body = await httpGet('/deployments/api/deviceExecution', params.name ? { name: params.name } : {});
        return body || rec;
      },
    },

    /* Home module dashboard — a composite record (KPIs + charts + list widgets +
       a table) for the L02 bento, fetched in ONE call. Not list-shaped, so no
       query params; same detail pattern as deployments.deviceExecution. The BFF
       (/home/api/dashboard) owns the data; mock returns null so the view shows its
       empty/error state rather than duplicating the whole dataset here. */
    home: {
      async dashboard() {
        if (useMock()) return null;
        return httpGet('/home/api/dashboard');
      },
    },

    /* Threats & Patches — Highly Vulnerable Systems (the T&P landing list). Same
       server-driven-table contract as deployments.list (filter/search/sort/page →
       { rows, total, kpis, facets }). */
    threatsPatches: {
      async highlyVulnerableSystems(params = {}) {
        if (useMock()) return { rows: [], total: 0, kpis: null, facets: null };
        const q = {};
        ['risk', 'os', 'group', 'search', 'sort', 'dir', 'page', 'pageSize'].forEach((k) => { if (params[k] != null && String(params[k]).length) q[k] = Array.isArray(params[k]) ? params[k].join(',') : params[k]; });
        const body = await httpGet('/threats-patches/api/highlyVulnerable', q);
        return { rows: (body && body.rows) || [], total: (body && body.total) || 0, kpis: (body && body.kpis) || null, facets: (body && body.facets) || null };
      },
    },

    /* Interactive auth — used by the login page. Token stored in localStorage
       ('uems-token') and sent as `Authorization: Bearer <token>` by CONFIG.headers().
       (If your EC expects a cookie/other header instead, adjust CONFIG.headers().) */
    auth: {
      getToken() { try { return localStorage.getItem('uems-token') || ''; } catch (_) { return ''; } },
      /* Synchronous, best-effort check (token present). For a real check use
         verify()/whoami(), which actually asks the backend. */
      isAuthenticated() { return !!this.getToken(); },
      logout() { try { localStorage.removeItem('uems-token'); } catch (_) {} },

      /* Who am I — resolves the current session to a user (or null). In mock mode
         returns a demo user. Live: GET userMeta; 401/any error ⇒ null (not signed in). */
      async whoami() {
        if (useMock()) return { name: 'Demo admin', login: 'admin', role: 'Administrator', email: '', isAdmin: true };
        const A = CONFIG.auth;
        try {
          const res = await fetch(buildUrl(A.whoamiEndpoint, {}), {
            headers: { ...CONFIG.headers(), 'Accept': A.whoamiAccept }, credentials: CONFIG.credentials,
          });
          if (!res.ok) return null;
          return A.readUser(await res.json());
        } catch (_) { return null; }
      },
      /* True iff the backend confirms a live session (via whoami). */
      async verify() { return !!(await this.whoami()); },

      /* Step 1: fetch the login metadata (RSA publicKey + product details). */
      async fetchLoginMeta() {
        const A = CONFIG.auth;
        const res = await fetch(buildUrl(A.metaEndpoint, {}), {
          headers: { ...CONFIG.headers(), 'Accept': A.metaAccept }, credentials: CONFIG.credentials,
        });
        if (!res.ok) throw new Error('loginMeta failed (' + res.status + ' ' + res.statusText + ')');
        return res.json();
      },
      async login(username, password) {
        if (useMock()) { try { localStorage.setItem('uems-token', 'mock-token'); } catch (_) {} return 'mock-token'; }
        const A = CONFIG.auth;
        /* Demo auth — until the real EC login endpoint is wired (CONFIG.auth.endpoint),
           accept any non-empty credentials so the sign-in flow works end-to-end
           against the demo backend. Checked BEFORE fetchLoginMeta so it doesn't hit
           the (unimplemented) loginMeta endpoint. To go live: set CONFIG.auth.endpoint
           (+ the RSA step below) and this branch no longer runs. */
        if (!A.endpoint) {
          if (!username || !password) throw new Error('Enter your username and password.');
          if (typeof console !== 'undefined') console.warn('[PrismAPI.auth] Demo sign-in (no live login endpoint wired) — any credentials are accepted.');
          try { localStorage.setItem('uems-token', 'demo-token'); } catch (_) {}
          return 'demo-token';
        }
        const meta = await this.fetchLoginMeta();            // step 1 — publicKey
        const publicKey = A.readPublicKey(meta);
        /* TODO (pending the real request shape + encryption scheme): RSA-encrypt
           `password` with `publicKey`, then POST A.form(username, encrypted). */
        const res = await fetch(buildUrl(A.endpoint, {}), {
          method: A.method || 'POST',
          headers: { ...CONFIG.headers(), 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: CONFIG.credentials,
          body: new URLSearchParams(A.form(username, password)),
        });
        if (!res.ok) throw new Error('Login failed (' + res.status + ' ' + res.statusText + ')');
        let body = {}; try { body = await res.json(); } catch (_) {}
        const token = A.readToken(body);
        if (!token) throw new Error('Authenticated, but no token found in the response — check CONFIG.auth.readToken.');
        try { localStorage.setItem('uems-token', token); } catch (_) {}
        return token;
      },
    },

    /* Product branding — resolves the logo + name from ?product=<id> (the same ids
       the shell uses), so the login page rebrands like the header nav. Logo files
       match header-nav's variant→logo mapping under window.UEMS_LOGO_BASE. */
    branding: {
      _map: {
        ec:  { logo: 'endpoint-central',           name: 'Endpoint Central' },
        pmp: { logo: 'patch-manager-plus',         name: 'Patch Manager Plus' },
        vmp: { logo: 'vulnerability-manager-plus', name: 'Vulnerability Manager Plus' },
        mdm: { logo: 'mdm',                        name: 'Mobile Device Manager Plus' },
        bsp: { logo: 'browser-security-plus',      name: 'Browser Security Plus' },
        acp: { logo: 'application-control-plus',   name: 'Application Control Plus' },
        dcp: { logo: 'device-control-plus',        name: 'Device Control Plus' },
        dxm: { logo: 'dex-manager-plus',           name: 'DEX Manager Plus' },
        dlp: { logo: 'endpoint-dlp-plus',          name: 'Endpoint DLP Plus' },
        mpp: { logo: 'malware-protection-plus',    name: 'Malware Protection Plus' },
        osd: { logo: 'os-deployer',                name: 'OS Deployer' },
        pcp: { logo: 'patch-connect-plus',         name: 'Patch Connect Plus' },
        rpp: { logo: 'ransomware-protection-plus', name: 'Ransomware Protection Plus' },
        rap: { logo: 'remote-access-plus',         name: 'Remote Access Plus' },
        ad360:  { logo: 'ad360',  name: 'AD360' },
        log360: { logo: 'log360', name: 'Log360' },
        pam360: { logo: 'pam360', name: 'PAM360' },
        sdp:    { logo: 'sdp',    name: 'ServiceDesk Plus' },
      },
      product() { try { return new URLSearchParams(location.search).get('product') || 'ec'; } catch (_) { return 'ec'; } },
      info(id)  { return this._map[id || this.product()] || this._map.ec; },
      logoSrc(id) { const base = (typeof window !== 'undefined' && window.UEMS_LOGO_BASE) || '/logos'; return base + '/' + this.info(id).logo + '.svg'; },
      name(id)  { return this.info(id).name; },
    },
  };

  function deriveStats(rows) {
    const byStatus = {}, byPlatform = {};
    rows.forEach((r) => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; byPlatform[r.platform] = (byPlatform[r.platform] || 0) + 1; });
    return { total: rows.length, byStatus, byPlatform };
  }

  /* ── Mock server (in-JS) — mirrors the real API contract exactly ─────────── */
  const Mock = (function () {
    const _PLAT = [
      { platform: 'Windows', os: 'Windows 11 Pro' }, { platform: 'Windows', os: 'Windows 10 Ent' },
      { platform: 'macOS', os: 'macOS 14 Sonoma' }, { platform: 'macOS', os: 'macOS 13 Ventura' },
      { platform: 'Linux', os: 'Ubuntu 22.04 LTS' }, { platform: 'Linux', os: 'Fedora 39' },
    ];
    const _STATUS = ['Managed', 'Managed', 'Pending', 'Managed', 'Retired', 'Error'];
    const _OWNERS = ['Kumaran M R', 'Priya N', 'Karthik S', 'Divya R', 'Naveen K', 'Sandhya V', 'Rahul T', 'Meera J'];
    const _EMAILS = ['user@company.com', 'priya.n@zohocorp.com', 'karthik.s@zohocorp.com', 'divya.r@zohocorp.com', 'naveen.k@zohocorp.com', 'sandhya.v@zohocorp.com', 'rahul.t@zohocorp.com', 'meera.j@zohocorp.com'];
    const _DATES = ['2 min ago', '18 min ago', '1 hr ago', '3 hrs ago', 'Yesterday', 'Jun 12, 2026', 'Jun 9, 2026', 'Jun 3, 2026'];
    const pick = (a, i) => a[i % a.length];
    const DB = [];
    for (let i = 1; i <= 48; i++) {
      const p = pick(_PLAT, i + 2);
      DB.push({ id: i, device: 'EC2AMAZ-' + (1000 + i * 7).toString(36).toUpperCase() + '.corp.zoho.internal',
        platform: p.platform, os: p.os, status: pick(_STATUS, i), owner: pick(_OWNERS, i), email: pick(_EMAILS, i), lastSeen: pick(_DATES, i) });
    }
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    async function list(p) {
      await wait(180);                       // simulate network latency
      let rows = DB.slice();
      const s = (p.search || '').trim().toLowerCase();
      if (s) rows = rows.filter((r) => (r.device + ' ' + r.owner + ' ' + r.os).toLowerCase().includes(s));
      if (p.platform && p.platform.length) rows = rows.filter((r) => p.platform.includes(r.platform));
      if (p.status && p.status.length)     rows = rows.filter((r) => p.status.includes(r.status));
      if (p.sort) {
        const [col, dir] = String(p.sort).split(':'); const k = dir === 'desc' ? -1 : 1;
        rows.sort((a, b) => String(a[col]).localeCompare(String(b[col])) * k);
      }
      const total = rows.length;
      const page = Math.max(1, p.page || 1), size = p.pageSize || total || 1;
      rows = rows.slice((page - 1) * size, (page - 1) * size + size);
      return { rows: rows.map(CONFIG.mapDevice), total };  // map runs in mock too → identical shape
    }
    async function stats() { await wait(120); return deriveStats(DB); }
    return { list, stats };
  })();

  global.PrismAPI = PrismAPI;
})(window);
