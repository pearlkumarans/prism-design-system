# CLAUDE.md — Prism Design System (Endpoint Central)

The full architecture overview, page-generation contract, and conventions live in
**[`AGENTS.md`](AGENTS.md)** (cross-tool, single source of truth). Read it first.

New here as a *human*? **[`GENERATING-PAGES.md`](GENERATING-PAGES.md)** explains what this is
and how to prompt for good pages, in plain language.

Claude-specific:

- To **generate a new page**, use the **`generate-layout`** skill
  (`.claude/skills/generate-layout/`). It automates the contract described in `AGENTS.md` —
  just describe the page (project name + what it does), e.g. *"add a sectioned-form page for
  Software Deployment under project 'acme', default view for the SD tab."*
- It creates `projects/<project>/layout-<slug>.html` and wires it into `Layout/Shell.html`.

Conventions in one line (see `AGENTS.md` for detail): design tokens only; scope DOM queries
to the view's root (never `document`); register `ShellDrawers` under the project-prefixed
router slug; **all filters live in one filter surface (Tab filter / Filter sidebar /
`ds-filter-panel`) — never loose beside the table; a date range is a filter; search is the only
exception; default the panel open if filters are primary** (full rule: `Layout/layouts.md` →
"Filter placement"); **no breadcrumb on dashboards or first-level nav landing pages — only on
drill-down pages** (full rule: `Layout/layouts.md` → "Breadcrumbs"); **sentence case for all
titles/labels — never ALL CAPS or `text-transform: uppercase`** (full rule: `Layout/layouts.md` →
"Casing"); serve over http to preview.

## Component & token policy (hard rule)

Build every page from **our own web components (`ds-*` / Prism) and design tokens (`--uems-*` /
design-system variables) only** — never hand-roll bespoke markup or CSS to reproduce a design.
This holds **even when the request is a screenshot, Figma frame, or image**: reproduce the
*intent* with existing components + tokens, never by pixel-matching with hardcoded colors,
spacing, fonts, radii, or shadows.

- **Reuse first.** Before building anything, find the closest existing component (scan
  `design-system-library/src/components/` and the root `*.html` demos) and use it — adapt via props/slots +
  tokens, not new CSS. A close match that needs minor adaptation always beats a new component.
- **Always use the built-in variant if available.** When a component already offers a
  variant/prop/mode for what you need, use it — never hand-roll or compose a custom equivalent
  beside it. Examples: a date filter uses `ds-date-picker`'s built-in `show-presets` (not a
  separate presets radio); bulk actions use `ds-data-table`'s built-in `bulkActions` (not a
  hand-built bar); a badge icon uses `ds-badge icon="…"` (not a sibling `ds-icon`); sizing uses
  the component's `size` prop (not a CSS override). Only extend a component when it has no
  built-in way to do the thing — and that's a component change requiring confirmation.
- **No hardcoded values where a token exists** — color, spacing, radius, type, and elevation
  all come from design-system variables.
- **New components require confirmation.** Only if no existing component fits *at all* may you
  propose a new one, and you MUST get explicit user confirmation before creating it. State what
  you looked at, why nothing fits, and what you'd build. Once approved, build it to a standard,
  global component anatomy using design-system tokens only (no hardcoded values), matching the
  conventions of the existing `ds-*` components.

## Skills — routing

Match the prompt to the right skill (full guide + chaining in
[`.claude/skills/INDEX.md`](.claude/skills/INDEX.md)):

| The prompt is about… | Run |
|---|---|
| Building an actual page/view file in the shell ("add a page", "create a list/form/dashboard/detail", "make a screen") | `generate-layout` |
| Endpoint Central domain knowledge — where a feature lives, module behavior, nav flow, workflows, edition gating, "design a screen for <EC feature>", troubleshooting, positioning | `ec-ux` |
| Visual design feedback on a UI — "review", "critique", "roast", "is this good", a screenshot/Figma/described screen | `ec-critique` |
| UX strategy/process — JTBD, affinity/themes, steelman/stress-test, Kano prioritization, Nielsen heuristic audit (severity-rated), HEART metrics | `ec-strategy` |

Disambiguation: casual design feedback → `ec-critique`; a **formal, severity-rated Nielsen
audit** → `ec-strategy`. `ec-ux` says *what* to build and *where it lives* (no files);
`generate-layout` *builds and wires* the file. To build an EC page, chain `ec-ux` (ground the
domain) → `generate-layout` (build) → `ec-critique`/`ec-strategy` (evaluate).
