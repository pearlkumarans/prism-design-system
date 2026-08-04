# Prism Design System 3.0

A unified design system for every endpoint experience — token-driven, accessible,
framework-agnostic web components plus the shell, patterns, and docs that power
Endpoint Central.

- **69 web components** (`ds-*`), built on CSS custom-property design tokens, with
  light/dark theming and accessibility wired in at the component level.
- A composable **app shell** (`Layout/Shell.html`) that hosts generated pages.
- A live **documentation site** (`docs/`) with a page per component and foundation.

## Repository layout

| Path | What it is |
|---|---|
| `design-system-library/` | The component library — source (`src/components/`), tests, and Vite build. Its own `package.json`. |
| `docs/` | Documentation site — one HTML page per component / foundation. |
| `Layout/` | The app shell (`Shell.html`) + dual-mode view files injected via the `?view=` router. |
| `projects/` | Generated pages, grouped by project (see the `generate-layout` skill). |
| `server/` | `dev-proxy.mjs` — forwards `/proxy/*` to the live data backend. |
| `serve.py` | No-cache static file server for previewing over HTTP. |
| `index.html` | Landing page. |
| `AGENTS.md` | **Single source of truth** — architecture, page-generation contract, conventions. Read this first. |
| `CLAUDE.md` · `GENERATING-PAGES.md` · `WORKFLOW.md` | Tooling, page-generation guide, and workflow docs. |
| `memory/` | Project design notes and gotchas. |

## Getting started

### Prerequisites
- **Node.js ≥ 18** (developed on 20) and **npm**
- **Python 3** (for the static preview server)

### 1. Preview the design system (no build)
Components load as native ES modules, so everything must be served over HTTP
(opening files directly won't work):

```bash
python3 serve.py           # no-cache static server on http://localhost:4599
```

Then open:
- `http://localhost:4599/index.html` — landing page
- `http://localhost:4599/Layout/Shell.html` — the app shell
- `http://localhost:4599/docs/Button.html` — a component doc page

### 2. Work on the component library

```bash
cd design-system-library
npm install
npm run dev                # Vite dev server for the component demos
npm run build              # production build → dist/
```

### 3. Run the tests

The component suite runs in a **real headless browser** (custom elements and
observers behave for real):

```bash
cd design-system-library
npm test                   # run once
npm run test:watch         # re-run on change
```

Enable the local **pre-commit test gate** (runs the suite before a commit that
touches the library) — once per clone:

```bash
npm run hooks:install
```

Full testing docs: [`design-system-library/test/README.md`](design-system-library/test/README.md).

### Continuous integration
GitHub Actions runs the same suite on every push / PR that touches
`design-system-library/**` — see [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Conventions

Build **only** from the `ds-*` components and design tokens — never hand-rolled
markup or hardcoded colors/spacing. New components require confirmation. The full
rules (page-generation contract, filter placement, casing, breadcrumbs) live in
**[`AGENTS.md`](AGENTS.md)**; start there.

## Highlights

- **Light & dark themes** across every page, driven by design tokens
- **Token-driven** styling via CSS custom properties (`--uems-*` / DS variables)
- **Accessibility** — ARIA, roles, visible focus, and reduced-motion built in
- **Vanilla web components** — no framework runtime; works anywhere

## Tech stack

HTML5 · CSS3 (custom properties, theming) · vanilla JavaScript web components ·
Vite (library build) · @web/test-runner (tests) · Zoho Puvi font family.

## License

Internal — Endpoint Central / Zoho.
