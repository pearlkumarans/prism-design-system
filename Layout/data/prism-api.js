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

    /* While wiring: if a live call fails (wrong path / proxy down / auth), fall back
       to mock data + a console warning so the page still renders. Set false once the
       live endpoint is confirmed so real errors surface. */
    fallbackToMock: true,

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
