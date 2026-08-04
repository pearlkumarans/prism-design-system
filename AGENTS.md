# AGENTS.md — Prism Design System (Endpoint Central)

Instructions for any AI/code agent working in this repo. `AGENTS.md` is the cross-tool
convention (read by many agents); Claude Code additionally auto-loads `CLAUDE.md` and the
`.claude/skills/generate-layout` skill, which automates the workflow below.

> Human looking for how to *use* this (and prompt well)? See `GENERATING-PAGES.md`.

## Architecture: shell + dual-mode views

- **`Layout/Shell.html`** — the app chrome (header nav, L1/L2 sidebars, right pane) plus a
  small **router** that lazy-injects page content into `<ds-content>`.
- **`Layout/views/layout-*.html`** — the built-in **dual-mode** page templates. Each works
  two ways from one source: opened directly in a browser (a standalone harness mounts it) or
  fetched by the shell (`injectDrawer` extracts its `<template id="drawer-fragment">`).
- **`projects/<project>/layout-<slug>.html`** — generated per-project/task pages. Same
  contract; they run inside the shared shell. See `projects/README.md`.
- **The contract**: a view exposes `window.ShellDrawers[slug] = { show, hide }`; the shell
  exposes services via `window.ShellCtx` (lang, theme, dir, nav mode, content element).
- **The router**: `CONTENT_VIEWS` maps `slug → { file, tab }`; `TAB_DEFAULT_VIEW` maps a
  module tab to the view it lands on. Deep link with `Shell.html?view=<slug>`.

Pattern catalogue: `Layout/layouts.md`.

## Generating a new page (the contract)

> Claude Code: just invoke the **`generate-layout`** skill. Other agents: follow these steps.

1. **Pick an archetype** from `Layout/views/`: `layout-sectioned-form`, `layout-tabbed-form`,
   `layout-list-view`, `layout-list-detail`, or `layout-module-dashboard`. Copy its structure.
2. **Identifiers** (keep consistent — top footgun): project `<project>` + slug `<slug>`.
   - File: `projects/<project>/layout-<slug>.html`
   - Router slug (`CONTENT_VIEWS` key) **and** the `window.ShellDrawers` key: `<project>-<slug>`
     (project-prefixed — slugs are global). The shell calls `ShellDrawers[slug].show()`;
     registering under the file name or an unprefixed slug = "injects but never shows".
   - Root element id: `<slug>-pop`.
3. **Create the dual-mode file** — `<template id="drawer-fragment">` holding `<style>`, a
   root `<div id="<slug>-pop" hidden>`, and an IIFE `<script>` that defines `show()`/`hide()`
   and registers `window.ShellDrawers['<project>-<slug>'] = { show, hide }`; followed by a
   standalone harness `<script>` and a `<head>` with `<base href="../../">` + `design-system-library/...`
   asset paths (depth for `projects/<project>/`). Full scaffold:
   `.claude/skills/generate-layout/SKILL.md`.
4. **Register in `Layout/Shell.html`** — add to `CONTENT_VIEWS`:
   `'<project>-<slug>': { file: '../projects/<project>/layout-<slug>', tab: '<module-tab-id>' }`.
   (`injectDrawer` treats any `file` containing `/` as a path relative to `Shell.html`.)
   For a module landing page, also add to `TAB_DEFAULT_VIEW`.

## Hard rules (apply everywhere)

- **Design tokens only** — `ds-*` components + `--uems-*` / design-system variables; no
  hardcoded hex/px where a token exists.
- **Scope every DOM query to the view's `root`**, never `document.querySelector` — injected
  views share one DOM and class names (`.lay__scroll` etc.), so global queries hit the wrong
  (often hidden) view.
- **Register `ShellDrawers` under the router slug**, not the file name.
- **Serve over http** to preview (`python3 -m http.server 8790`) — `fetch()` fails on `file://`.

## Verify

- Standalone: `http://localhost:8790/projects/<project>/layout-<slug>.html`
- Injected: `http://localhost:8790/Layout/Shell.html?view=<project>-<slug>`
