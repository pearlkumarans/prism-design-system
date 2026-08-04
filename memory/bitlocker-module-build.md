---
name: bitlocker-module-build
description: BitLocker Management module screens built from the Virtusa HLD (UC-BL-01/02/03/04/06)
metadata:
  type: project
---

BitLocker Management module for Endpoint Central, built from the "Virtusa Requirements" HLD
(~/Downloads/Virtusa Requirements.pdf), 5 use cases: UC-BL-01 encryption timestamp, UC-BL-02 accurate
authentication method + policy mismatch, UC-BL-03 decryption detection + BitLocker Activity Report
(RPT-BL-03-01) + per-device Audit tab (RPT-BL-03-02), UC-BL-04 remote credential rotation, UC-BL-06
progressive encryption (encrypt-first-PIN-later).

Pages live under project slug `bitlocker` (projects/bitlocker/), wired into the `bitlocker` tab in
Shell.html (tab default = bitlocker-managed-systems).

**Done (2026-07-10 — all three pages built + verified in shell):**
- `projects/bitlocker/layout-managed-systems.html` — L03 List View hub, slug `bitlocker-managed-systems`
  (tab default). KPI compliance split (UC-06), encryption-status states, precise auth-method neutral
  badges + policy-mismatch warning badge (UC-02), encryption-timestamp col with "--" legacy fallback
  (UC-01), rotation-status col + Rotate Credentials modal (card radio + adaptive consequence alert,
  UC-04), row ⋯ menu, filter panel (status/auth/recency).
- `projects/bitlocker/layout-device-detail.html` — L04 drill-down, slug `bitlocker-device-detail`.
  Overview bento (encryption timestamps UC-01, all active protectors UC-02, policy compliance,
  recovery key) + progressive-encryption banner (UC-06) + Audit tab (RPT-BL-03-02, UC-03).
- `projects/bitlocker/layout-activity-report.html` — RPT-BL-03-01, slug `bitlocker-activity-report`.
  8 HLD columns, semantic event-type badges, HLD event-remark templates, date-range/event-type/static-CG
  filters, Export + Schedule Report modal (UC-03).
- `projects/bitlocker/layout-summary-dashboard.html` — L02 module dashboard, slug `bitlocker-dashboard`.
  Compliance-split KPIs + donut (UC-06), authentication-method column (UC-02, monotone), recovery-key
  escrow donut, prerequisite-readiness donut, decryption-events column (UC-03), recent-activity list,
  30-day activity column. **Now the BitLocker tab landing** (TAB_DEFAULT_VIEW.bitlocker = bitlocker-dashboard).
- `projects/bitlocker/layout-policy-creation.html` — L06 sectioned form, slug `bitlocker-policy-creation`.
  Sections: General (name/desc/encrypt-or-decrypt radio), Authentication (card radio: TPM only / TPM+PIN /
  TPM+Enhanced PIN / Passphrase, adaptive hint + hides Password settings for TPM-only), Encryption
  (scope + algorithm selects), Password settings, Advanced (recovery-key-to-AD + periodic-rotation
  accordions). Footer Cancel · Save as Draft · Save & Publish. Fields from the BitLocker settings table.

Menu (ec-menus.js bitlocker.groups) now fully wired: Overview>Dashboard→bitlocker-dashboard (active landing),
Policies>Policy Creation→bitlocker-policy-creation, Insights>Managed Computers→bitlocker-managed-systems,
Reports>BitLocker Activity Report→bitlocker-activity-report. All page breadcrumbs' "BitLocker Management"
crumb → the dashboard.

**ds-input-select default value**: an options[].selected flag does NOT set the shown value — set `el.value`
explicitly after assigning `.options` (inside `whenDefined('ds-input-select')`). See [[ds-component-gotchas]].

**Two gotchas hit + fixed (reusable):**
1. `ds-widget` DROPS `slot="header-action"` children when it upgrades in the shell (queryable standalone,
   null when injected) — attaching a listener to one threw and aborted the whole view init. Don't rely on
   widget header-action slots; guard all `$(id).addEventListener` with a null check.
2. Shell `openView` race: `selectTab` re-shows the tab's TAB_DEFAULT_VIEW via an async injectDrawer().then
   during openView's await, leaving the default view stacked under a non-default view of the same tab.
   Fixed in Shell.html openView by re-hiding all other views AFTER the await, right before show(). Only
   bites non-default views (prior session only built the default hub, so never exercised).

Data tables: `selection-mode="none"` on read-only log tables (activity report, audit tab); free-text is
the data-table's built-in toolbar search (don't add a second ds-search-field). Preview server: launch
config `static-bl` (port 8821). PDF text extraction on this Mac needs `python3 -m pip install pypdf`.

**Nav wiring (2026-07-10):** The shell's L1/L2 left nav (design-system-library/src/data/ec-menus.js) was presentational
only — no `view:` mapping, no select→open handler. Fixed generally:
- ec-menus.js `bitlocker.groups`: L2 = Overview>Dashboard · Policies>Policy Creation/Deployment ·
  Insights>Managed Computers(view: bitlocker-managed-systems, active)+Encryption Prerequisites ·
  Reports>BitLocker Activity Report(view: bitlocker-activity-report)+TPM Reports · Recovery Key>Retrieve.
  Rule (learned from feedback): DON'T rename/remove real-product menu items to fit a page — keep them as
  placeholders (no `view`) and add `view` to the closest one. Managed Computers + Encryption Prerequisites
  are real EC BitLocker features and must stay.
- Shell.html: added `ds-sidebar-l2-select` → `openView(item.view)`, and `syncL2Active(slug)` (called in
  openView) that clones+reassigns l2El.groups to highlight the matching item; unmapped views (drill-downs)
  keep the parent item highlighted. NEVER mutate the shared menu config — clone.
- Breadcrumbs: each page sets crumb `href` to the real standalone file (`projects/bitlocker/layout-*.html`)
  and a `crumbNav` click-interceptor on the page-header derives the slug (`bitlocker-` + `layout-(\w+)`)
  and routes via openContentView in-shell; standalone falls back to the href.

NOTE: the preview browser hard-caches ES modules — after editing ec-menus.js, a normal reload keeps the
old module; load from a different port (static-verify 8816) to force a fresh module map.
