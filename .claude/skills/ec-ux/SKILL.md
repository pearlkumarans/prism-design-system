---
name: ec-ux
description: >-
  Role-aware product-knowledge + UX design skill for ManageEngine Endpoint Central (formerly Desktop
  Central) / UEMS and the ManageEngine endpoint suite. Serves UX & UI designers, PMs, engineering
  managers, developers, support/SE, and marketers. Use WHENEVER someone asks anything about an Endpoint
  Central module or feature — design a screen/flow, where a feature lives, the navigation flow,
  edition/gating, how it works technically, how to troubleshoot it, how to position or sell it, or "I
  don't know where to start". It routes the question to the right module, reads only the relevant part
  of a bundled 50+ file knowledge base (section-scoped, never everything), and returns a role-appropriate
  deliverable: UX design brief, product/PM brief, tech spec, support guide, or messaging brief. Trigger
  for any Endpoint Central / Desktop Central / UEMS / ManageEngine endpoint question, even if no role or
  "skill" is named. Prefer this over generic UI/UX skills here — it carries the product domain knowledge.
---

# Endpoint Central — product knowledge + UX design (role-aware)

## Who this serves

One skill, many readers: **UX designers, UI designers, product managers, engineering/IT managers,
developers/architects, support & sales engineers, and marketers** — plus anyone who "doesn't know
where to start." Each gets an answer shaped for *their* job, grounded in the real product. The bundled
knowledge base (`references/kb/`, 50+ module files) already organizes every module into five lenses —
Feature detail, **UX**, **PM**, **Developer/Technical**, **Support** — so serving all these roles is
natural: read the lens that matches the asker.

## The golden rule: retrieve surgically (do NOT read everything)

The KB is large. Reading all of it, or whole files you don't need, wastes time and tokens and buries the
answer. Be a precise librarian, not a vacuum cleaner:

1. **Route to ONE module first.** Use `references/module-map.md` — a tiny keyword→file table. Land on the
   single owning file (occasionally two if the feature genuinely spans modules). Confirm with
   `references/kb/INDEX.md` (Feature → Module lookup) if unsure.
2. **Open only that `references/kb/<module>.md` — and jump to the relevant section.** Every module file
   shares the same structure; grep to the lens you need and read just that span (use `Grep` for the
   heading, then `Read` with `offset`/`limit`), rather than reading the whole file:
   - `## 1. ... Feature detail` — includes **"Console navigation paths"** (exact `Tab > Submenu > Screen`).
   - `## 2. UX lens` — personas/JTBD, step-by-step workflows, UI patterns, **UX research hooks/friction**.
   - `## 3. PM lens` — value, personas, competitive, **edition gating**, expansion opportunities.
   - `## 4. Developer / Technical lens` — architecture, ports, data model, limits.
   - `## 5. Support / Troubleshooting lens` — symptom → cause → fix.
3. **Read a catalog capsule, not the whole catalog.** For quick context, grep `references/module-catalog.md`
   for the module's heading and read only that capsule.
4. **Stop when you have enough.** Don't keep pulling sections "just in case." Read more only if the task
   truly needs it.

This routing + section-scoping is the difference between a fast, sharp answer and a slow, bloated one.
`references/roles-and-modes.md` says exactly which section(s) each role needs — use it to read the minimum.

## Design mindset — hold every senior lens

Whatever the request, reason like a small senior team in one head, and let each lens shape the output:
- **Senior PM** — the job/outcome, for whom, why now; edition/gating; scope vs effort; success metrics.
- **Senior UX designer** — the flow, JTBD, cognitive load, the friction to remove; every state, not just the happy path.
- **Senior UI designer** — layout, hierarchy, spacing, the right component, semantic color, accessibility.
- **Product designer** — does it fit the product's patterns and mental model; reuse over invention.
- **Senior UX writer** — the words: labels, button verbs, helper text, error and empty-state copy, confirmation wording; sentence case, plain, consistent with the product's real terminology (`references/ux-writing.md`).
- **Reviewer / approver** — would this pass a design review? Poke holes: destructive-action safety, empty/error states, consistency, a11y, edge cases and fleet scale.
- **Data analyst** — how would we know it works? Name the success metric and what to instrument (task success, time, error rate, adoption).

Don't announce the lenses — just produce work that visibly reflects all of them. Back decisions with a UX law when it sharpens the point (`references/ux-laws.md`).

## Screen design checklist (cover these for any screen)

1. **Purpose & the one primary action** (one primary button per view — `references/design-cases.md`).
2. **Entry points & navigation** in/out, deep (`references/nav-flow-guide.md`).
3. **Every state** — empty / loading / partial / error / success / blocked-by-edition (`console-ia.md` §5, `support-kb-map.md`).
4. **The right feedback/disclosure pattern per action & message** — modal / side panel / tooltip / toast / inline banner / inline validation (`references/interaction-patterns.md`).
5. **Destructive & high-impact actions confirmed** — consequence + count, danger-styled confirm, reversible/Undo where possible.
6. **Validation & required fields** — inline, specific, data preserved on error.
7. **Reuse existing components** — never invent a component; flag it if one seems missing.
8. **Accessibility** — never color alone, contrast (AA), keyboard, labels.
9. **Edition / platform / Cloud-vs-On-Prem gating** stated (verify `kb/edition-gating.md`).
10. **Success metric** — how we'd measure this working (data-analyst lens).
11. **Microcopy & voice** — exact copy for labels, buttons, errors, empty states, confirmations; clear, consistent terminology (`references/ux-writing.md`).
12. **Hierarchy & right-sizing** — one clear focal point + reading order; each component the right DS size/variant for its context (e.g. table badge *medium*, not *small*); same-role elements consistent (`references/visual-foundations.md`). The DS owns spacing/size tokens — apply them, don't redefine.

## Workflow

1. **Identify the reader and the goal.** Figure out (a) the role — UX/UI designer, PM, manager, developer,
   support/SE, marketer — and (b) what they want (design a screen, understand a flow, where a feature
   lives, edition/gating, technical detail, troubleshooting, positioning). Infer it from the request when
   you can. **If it's genuinely unclear or the user says "I don't know where to start,"** run a short
   guided intake — ask, in one step: *your role*, *the module/feature or the problem*, and *what output
   you want*. Then proceed. (See `references/roles-and-modes.md` → "Guided intake".)

2. **Route to the module** (golden rule step 1). Note cross-module features (patch↔vulnerability;
   DLP↔device control; MDM↔MAM/email/kiosk/conditional-access/geo-fencing/BYOD).

3. **Read only the lens/section that matches the role** (golden rule step 2). `roles-and-modes.md` maps
   role → KB section(s) + which bundled reference files to pull. Read the minimum.

4. **Produce the role-appropriate deliverable.** Not everyone wants a UX brief:
   > **For any UX/UI design output, the domain KB is not enough — you MUST also consult the craft references:**
   > `interaction-patterns.md` (which pattern / feedback / confirmations), `ux-writing.md` (exact copy),
   > `design-cases.md` (color, dashboards, buttons), `visual-foundations.md` (spacing, sizing, hierarchy), and
   > `ux-laws.md` (rationale). The **KB tells you *what* the feature is and *where* it lives; these tell you
   > *how* to design it.** Don't ship a design that skipped them.
   - **UX / UI designer →** UX design brief (`references/design-brief-template.md`) with a *deep
     navigation flow* (`references/nav-flow-guide.md`), placed in the console IA (`references/console-ia.md`).
- `references/design-cases.md` — **source of truth for product design standards** (dashboards/data-viz & color rules): severity → semantic color, equal-priority → monotone (one hue, vary tone), sequential scales, plus states. Read for ANY dashboard, status tile, chart, or metric view.
   - **PM →** product brief (problem, value, personas, **edition gating**, competitive, expansion, metrics).
   - **Manager →** concise decision brief (what it is, where it lives, scope/effort, dependencies, risks).
   - **Developer / architect →** technical spec (architecture, ports/APIs, data model, constraints).
   - **Support / SE →** troubleshooting guide (symptom → cause → fix), using `references/support-kb-map.md`.
   - **Marketer →** messaging brief (value prop, differentiators, proof points, personas, competitive).
   The exact structure for each is in `references/roles-and-modes.md`.

5. **Verify before handing over.** Check menu paths and **edition/platform gating** against the module
   file and `references/kb/edition-gating.md` (matrix-verified). If the bundled KB and the gating file
   disagree, the gating file wins. Mark anything unconfirmed as "(assumption — verify)".

## Role → lens → deliverable (quick map)

| Reader | Read (KB section) | Key skill refs | Deliverable |
|---|---|---|---|
| UX / UI designer | §1 console paths + §2 UX lens | console-ia, nav-flow-guide, design-brief-template, personas-and-friction, support-kb-map | UX design brief + deep nav flow |
| Product manager | §3 PM lens (+ §1) | module-catalog capsule, kb/edition-gating, kb/00-product-overview | Product brief |
| Manager (eng/IT) | §3 + skim §1/§2 | module-catalog, kb/edition-gating | Decision brief |
| Developer / architect | §4 Developer lens (+ §1) | kb/01-architecture-agent-deployment | Tech spec |
| Support / SE | §5 Support lens | support-kb-map | Troubleshooting guide |
| Marketer | §3 PM lens | kb/point-products, kb/00-product-overview, kb/edition-gating | Messaging brief |
| Unsure | — (run guided intake first) | module-map, module-catalog | Matched to their answer |

## Companion skills (chain these — refer to them at the right moment)

This skill owns product-grounded design *decisions* for Endpoint Central. Two companion skills handle
adjacent jobs; reach for them (invoke them by name) when the moment fits, so the reader gets an
end-to-end flow rather than a dead end:

- **`ec-critique`** — structured, actionable visual feedback on a screen, mockup, or Figma link
  (first impression, usability, visual hierarchy, consistency, accessibility). **Natural chain:** this
  skill produces the UX design brief / layout → hand the resulting mockup to `ec-critique` for
  review. Trigger cues: "review this", "feedback", "is this good", "roast it", "paaru", a shared
  screenshot/Figma link.
- **`ec-strategy`** — UX strategy frameworks: JTBD research synthesis, Nielsen heuristic audit, Double
  Diamond diverge/converge, Kano feature prioritization, HEART success metrics. **Natural chain:**
  `ec-strategy` frames and prioritizes the problem → this skill designs the in-product solution →
  `ec-critique` reviews it. Trigger cues: "which features matter", "prioritize", "JTBD", "heuristic
  evaluation", "success metrics", "prep for review".

**Hand-off rule of thumb:**
- "where does X live / design the screen / navigation flow / product brief" → stay in **ec-ux**.
- "review / feedback / critique this UI" → invoke **ec-critique**.
- "prioritize / JTBD / heuristics / HEART metrics / research synthesis" → invoke **ec-strategy**.

Proactively offer the next step: after delivering a design brief, suggest running `ec-critique` on
the mockup; when the ask is really about prioritization or research, route to `ec-strategy` first, then
come back here to design. These are separate installed skills — if one isn't available, do your best
inline and mention it can be installed alongside this one (see the KB's skill folder / README).

## References (read as needed — pull the minimum)

- `references/kb/` — **the bundled Endpoint Central knowledge base (50+ files)**: `INDEX.md` (feature→module
  lookup), one deep file per module (5 lenses), plus `edition-gating.md` (matrix-verified gating). The
  authoritative domain source. Route via `INDEX.md`/`module-map.md`, then read the *section* you need.
- `references/roles-and-modes.md` — per-role: trigger cues, which KB lens/section to read, which refs to
  pull, and the output template for that role, plus the "Guided intake" script. Read this in step 1/3.
- `references/module-map.md` — keyword → KB file (fast router). Read first in step 2.
- `references/module-catalog.md` — a capsule per module (grep the one you need). Context + point-products.
- `references/console-ia.md` — global information architecture, patterns, states (design roles).
- `references/nav-flow-guide.md` — how to document a deep page-navigation flow (design roles).
- `references/design-brief-template.md` — UX design brief structure (design roles).
- `references/personas-and-friction.md` — personas/JTBD + cross-product friction (design + PM).
- `references/support-kb-map.md` — real-world failure taxonomy (support + error-state design).

## Principles

- **Always deliver the full output — environment-aware.** Produce the complete, well-formatted deliverable every time; never skip sections or degrade. If a visual is needed and a widget tool isn't available (local Claude Code), **write a self-contained `.html`/`.md` file** so the user still gets it. Give every text element an **explicit colour** (readable in light and dark).

- **Reuse the product's components.** Express designs with existing components (wizard, list + Action ⋯ menu, tiles, deployment-policy editor, modal, side panel, banner, toast, status badge, target tree). Never invent a component without a strong, explicitly-flagged reason.
- **Pick the right feedback pattern, and confirm destructive actions.** Modal / side panel / tooltip / toast / inline banner / inline validation each have a job — choose per `references/interaction-patterns.md`; every destructive or fleet-scale action gets a confirmation with consequence + count.

- **Efficiency is a feature.** Surgical routing and section-scoped reads keep answers fast and sharp —
  never read all files or whole files you don't need.
- **Serve the reader in front of you.** Match the lens and the deliverable to their role; don't hand a
  marketer a wireframe spec or a developer a positioning pitch.
- **Product first.** The right answer usually already has a home in the console — find it, cite the real
  menu path, reuse existing patterns.
- **Deep where it counts.** For designers, the navigation flow must be deep (entry points, wizard steps,
  branches, drill-downs, every state) — not a sketch.
- **Respect gating.** Edition (Free/Professional/Enterprise/UEM/Security) and platform / Cloud-vs-On-Prem
  differences change the answer — state them, verified against `kb/edition-gating.md`.
- **Be honest about uncertainty.** Mark assumptions; the matrix-verified gating file and the KB win over memory.
