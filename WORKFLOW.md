# WORKFLOW.md — Prism page-generation pipeline

**Prompt / PR / HLD document → designed → built → wired → verified → UX-evaluated pages.**

This is the repeatable end-to-end flow for turning a request (a plain prompt or a requirements
document) into shipped, reachable, evaluated pages in the Prism Endpoint-Central shell
(`Layout/Shell.html`). It composes the installed skills — `ec-ux`, `generate-layout`, `ux-copy`,
`ec-critique`, `ec-strategy` — in a fixed order, with a **gate** at each step (what must be true to
move on). See also `AGENTS.md` (contract) and `GENERATING-PAGES.md` (plain-language intro).

---

## The skill chain in one line

`ec-ux` (ground the domain + design) → **confirm scope** → `generate-layout` (build + wire) →
**verify in preview** → `ux-copy` (words) + `ec-critique` (visual review) + `ec-strategy`
(heuristics / JTBD / Kano / HEART) → **fix + re-verify** → memory / skill updates.

---

## Phase 0 — Intake (understand the ask)

**Step 1 — Read the input literally.**
- **PR / HLD / requirements doc:** extract to text first (e.g. `pypdf` when no poppler/pdftotext is
  installed), then read every page. Pull out the **discrete units of work** — for the BitLocker HLD
  that was 5 use cases (UC-BL-01…06), each with *business problem → proposed solution → user journey
  → additional scenarios (API, roles, scope, edge cases)*.
- **Plain prompt** ("add a list page for X"): the unit of work is the prompt itself.
- **Output:** a bullet list of concrete capabilities to design/build.
- **Gate:** for each unit I can name *who* the user is, *what* they need to do, and *what outcome*
  they expect.

## Phase 1 — Ground in the product domain (`ec-ux` skill)

**Step 2 — Route to the owning module, surgically.**
- Invoke **`ec-ux`**. Use `references/module-map.md` (keyword → file) to land on the **one** KB file
  (e.g. `references/kb/bitlocker-management.md`).
- Read only the lens needed — **§1 Feature detail** (real console nav paths), **§2 UX lens**
  (workflows, research hooks), edition/gating if relevant. Don't vacuum the whole file.
- Read `memory/` for prior context on this work.
- **Output:** true product IA, terminology, personas, and where each unit *actually lives* in the console.
- **Gate:** every unit has a home in a real module area (no invented placement).

## Phase 2 — Design the flow (still `ec-ux`, all senior lenses)

**Step 3 — Map units → screens → states → components.**
- Reason as PM + UX + UI + product designer + UX writer + reviewer + data analyst at once.
- Run each screen through the **screen-design checklist**: primary action; entry/exit nav; *every*
  state (empty / loading / partial / error / blocked-by-edition); the right feedback pattern
  (modal vs side-panel vs toast vs inline banner vs inline validation); destructive-action
  confirmation (consequence + count); reuse-before-invent; a11y; edition gating; success metric;
  microcopy; hierarchy & right-sizing.
- Consult the craft refs (`interaction-patterns.md`, `design-cases.md`, `visual-foundations.md`,
  `ux-writing.md`, `ux-laws.md`). The KB says *what* it is; these say *how* to design it.
- **Output:** a written **UX design brief** — screen set, archetype per screen, nav flow, states,
  reuse map.
- **Gate:** the design is expressible entirely in existing `ds-*` components + `--uems-*` tokens.

**Step 4 — Confirm scope with the user.**
- Before writing several large files, surface the plan and ask how much to build in this pass
  (`AskUserQuestion`).
- **Gate:** explicit go-ahead on the page set.

## Phase 3 — Reuse recon (pre-build)

**Step 5 — Find the closest existing thing; never start from scratch.**
- Read `Layout/layouts.md` (archetype catalogue) and the closest base template(s)
  (`layout-list-view.html`, `layout-list-detail.html`, …).
- Scan `design-system-library/src/components/`; gather **exact component APIs** (attributes, events, methods) for the
  interactive pieces (modal, dropdown-menu, radio-group, inline-alert, date-picker, search-field).
  An `Explore` subagent is good for this — precise signatures without guessing.
- Verify **icon names** exist in the sprite before using them.
- **Gate:** I know the real API for every component I'll touch. New components require explicit user
  confirmation (hard rule).

## Phase 4 — Build the pages (`generate-layout` skill)

**Step 6 — Write each page to the dual-mode contract.**
- Invoke **`generate-layout`**. Per page: pick archetype → copy its structure → fill slots with
  `ds-*` components + tokens only.
- Follow the contract exactly: `projects/<project>/layout-<slug>.html`; `<base href="../../">`;
  root id `<slug>-pop` hidden by default; **scope every query to `root`** (never `document`);
  register `window.ShellDrawers['<project>-<slug>']` under the **router slug**; standalone harness at
  the bottom.
- Slug describes **purpose** (`managed-systems`), not archetype.
- **Gate:** the file works both injected and opened directly.

## Phase 5 — Wire the pages (reachable, not just routable) — **default work**

**Step 7 — Router.** Add each view to `CONTENT_VIEWS` in `Shell.html`; set `TAB_DEFAULT_VIEW` for
the landing page.

**Step 8 — Left nav (L1/L2).** In `design-system-library/src/data/ec-menus.js`, add `view: '<slug>'` to the *matching
real* menu item (`active: true` for the landing). **Never rename/remove real product menu items to
fit a page** — leave unbuilt features as placeholders (no `view`). The shell's generic
`ds-sidebar-l2-select → openView` handler + `syncL2Active` make any `view:`-tagged item clickable and
highlight-tracked.

**Step 9 — Breadcrumbs.** Give parent crumbs real file hrefs + a `crumbNav` click interceptor on the
page-header that routes via `openContentView` in-shell and falls back to the href when standalone.

- **Gate:** registering ≠ done — a page isn't finished until you can *click* to it from the nav and
  breadcrumb.

## Phase 6 — Verify in the real app (preview tools)

**Step 10 — Serve over http and drive it.**
- Start a static server (http, not `file://`); open each page **injected** (`Shell.html?view=<slug>`)
  and **standalone**.
- Check console for errors; inspect structure; screenshot the visual.
- Exercise interactions: modals, adaptive alerts, row ⋯ menus, tab swaps, filters, and **every** nav
  + breadcrumb path.
- Fix bugs **at the source** and re-verify.
- **Gate:** every path works, no console errors, screenshots prove it.

## Phase 7 — UX evaluation loop (is it actually good?)

**Step 11 — UX copy pass (`ux-copy` / `ec-ux` writing lens).** Review every label, button verb
(footer vocabulary), helper text, empty/error state, confirmation wording, toast — sentence case,
plain, consistent with real product terminology.

**Step 12 — Visual critique (`ec-critique`).** Hand the built screens to `ec-critique`: first
impression, usability, visual hierarchy, consistency, accessibility → ranked, actionable fixes.

**Step 13 — UX strategy (`ec-strategy`), as needed.** For rigor: severity-rated **Nielsen** heuristic
audit; **JTBD** synthesis; **Kano** prioritization; **HEART** success metrics. Use when the question
is "which matter / prep for review / prove it works," not just "does it look right."

- **Gate:** findings triaged → fixes applied → re-verified (loop back to Phase 6 if non-trivial).

## Phase 8 — Persist knowledge

**Step 14 — Memory + skill updates.** Record durable facts in `memory/` (what's built, gotchas,
conventions) and update the index; fold reusable process learnings back into the skills themselves
(e.g. *Step 4b — wire the nav by default* now lives in `generate-layout`).

---

## Three standing rules baked in

1. **Components + tokens only** — reproduce *intent*, never pixel-match with hardcoded values; new
   components need explicit approval.
2. **Reachable, not just routable** — nav + breadcrumb wiring is part of "done," and don't disturb
   real product menu items.
3. **Verify in the running app** — drive every state and path, prove with screenshots, fix bugs at
   the source.

---

## Worked example — BitLocker Management (Virtusa HLD)

| HLD use case | Screen(s) built | Archetype |
|---|---|---|
| UC-BL-01 encryption timestamp | Managed Systems col + filter; Device detail timestamps | L03, L04 |
| UC-BL-02 authentication method + policy mismatch | Managed Systems badges + filter; Device detail protectors | L03, L04 |
| UC-BL-03 decryption detection + Activity Report | Activity Report (RPT-BL-03-01); Device Audit tab (RPT-BL-03-02) | L15-on-L03, L04 |
| UC-BL-04 remote credential rotation | Rotate Credentials modal + rotation-status col | L09 modal |
| UC-BL-06 progressive encryption | Compliance-split KPIs + status states + banner | L02/L03 |

Files: `projects/bitlocker/layout-managed-systems.html`, `layout-device-detail.html`,
`layout-activity-report.html`. Wired in `Shell.html` (`CONTENT_VIEWS`, `TAB_DEFAULT_VIEW`) and
`design-system-library/src/data/ec-menus.js` (BitLocker L2 with `view:` slugs).
