# Visual Style Spec — Locked Output Design

This is the approved, locked visual system for ALL framework outputs. Read this file before rendering any visual output. The goal: every output looks like it came from the same design system — light, subtle, card-based, severity-colored.

## Foundation

**Container:** `background:#f8fafc; border-radius:12px; padding:1.25rem;` — the page/widget surface is ALWAYS this quiet neutral. Never plain white, never dark, never saturated.

**Typography:** system font stack. Title 16–17px weight 500 color `#0f172a` · context/subtitle line 12px `#64748b` · card title 14px weight 500 (darkest ramp stop) · body 13px line-height 1.5–1.55 · micro/labels 11–12px · stat numbers 18px weight 500. Sentence case everywhere; small-caps feel via `letter-spacing:0.4px` on section labels.

**Icons:** Tabler icons (`<i class="ti ti-...">`) at 18px, colored to the card's mid-ramp text tone. Pairings: sev4/sev3 → `ti-alert-octagon` · sev2/warning → `ti-alert-triangle` · sev1/info → `ti-info-circle` · wins/verdict → `ti-check` / `ti-shield-check` · attacks → `ti-sword` · task success → `ti-target` · adoption → `ti-users` · happiness → `ti-mood-smile` · guardrails → `ti-shield-half`. Never emoji inside rendered widgets (emoji only in markdown fallback).

## The color system (light pastel, fixed)

| Role | Card bg | 4px left border | Title/darkest text | Mid text/icon |
|---|---|---|---|---|
| Critical / sev 4–3 / fatal / must-be / push force | `#fef2f2` | `#dc2626` | `#7f1d1d` | `#a32d2d` |
| Warning / sev 2 / survivable / guardrail / anxiety / decay | `#fffbeb` | `#ca8a04` | `#713f12` | `#854f0b` |
| Notice / tension / reverse / segment-split | `#fff7ed` | `#ea580c` | `#7c2d12` | — |
| Info / sev 1 / rhetorical / performance / metrics / verdict-neutral | `#eff6ff` | `#2563eb` | `#1e3a8a` | `#185fa5` |
| Positive / wins / steelman / delighter / pull force / QBR | `#f0fdf4` | `#16a34a` | `#14532d` | `#3b6d11` |
| Neutral / habit / indifferent / cut list | `#f1f5f9` | `#64748b` | `#0f172a` | `#475569` |

**Hard rules:** text is ALWAYS the darkest stop of the card's own ramp — never white, never light, never a different ramp. Cards are square-cornered with the 4px left border (the border IS the corner treatment); standalone container cards (job cards, claim cards) are `#ffffff` with `border:0.5px solid #e2e8f0; border-radius:10px`.

## Reusable components (use these exact patterns)

**Header row (every output):** title left + count pills right (`display:flex; justify-content:space-between; flex-wrap:wrap`). Count pills: pastel bg + darkest text, `font-size:11px; padding:3px 10px; border-radius:10px; font-weight:500` — e.g. "2 critical" red pill, "3 minor" amber pill.

**Context line:** one 12px `#64748b` line under the title: scope, evidence basis, exclusions, date. Always present.

**Card header row:** icon (18px) + UPPERCASE-feel label (`12px weight 500, letter-spacing 0.4px`, darkest text, e.g. "Sev 4 · catastrophe · #1") + ID pill. ID pills on colored cards: `background:#ffffff` + `border:0.5px solid` (light ramp tone: red `#f0b5b5`, amber `#ecd9a0`, blue `#b8cff0`, green `#bbe3c4`) + darkest text, `11px; padding:2px 9px; border-radius:10px`.

**Action pill (solid):** for hard decisions like "P0 — spec now": solid darkest bg (`#7f1d1d`) + white text — the ONLY place light-on-dark is allowed, because it's a button-like emphasis chip.

**Scannable body rows (NEVER paragraphs):** card bodies use a label-column layout, not flowing prose. Each section is `display:flex; gap:10px` — left: fixed label `flex:0 0 78px; font-size:11px; font-weight:500; letter-spacing:0.4px` in the mid-ramp tone (WRONG / IMPACT / FIX / GOAL / SIGNAL / METRIC / MITIGATION / VERDICT…); right: 1–3 short lines, each its own 13px row, 7px gap between sections.

Writing rules for body lines:
- Fragments over sentences — "4 badge colors beside Patch ID — zero explanation anywhere", not "Every row carries a badge but no column header explains what each means"
- Max ~12 words per line; a line needing more becomes two lines
- Bold ONLY the decision-critical phrase (one per line max)
- Mid-dot separators for enumerations: "No column header · no tooltip · no legend"
- Max 2 lines per section, except FIX
- **FIX as tiered checklist:** each option its own row with `ti-arrow-right` (13px) + bold tier label — "**Best:** … / **Good:** … / **Minimum:** …" (single arrow row when only one fix)
- The reasoning depth stays (frequency/impact/persistence, consequence chains) — compressed into fragments, never deleted

**Stat boxes:** white mini-cards in a flex row: `background:#ffffff; border:0.5px solid <light ramp tone>; border-radius:8px; padding:8px 14px` — 11px label over 18px weight-500 number. Used for baseline/target/window, n-counts, scores.

**Mini thumbnail:** UI recreation inside a finding card: `background:#ffffff; border:0.5px solid #e2e8f0 (or var tertiary); border-radius:6px; padding:10px 12px; margin:8px 0`, ~80px tall, with a 10px `#94a3b8`-tone caption ("↑ current dialog — no device count"). Recreate faithfully including flaws. Skip for absence/conceptual issues.

**Scorecard tile grid:** `display:grid; grid-template-columns:repeat(auto-fit, minmax(54px,1fr)); gap:6px` — tiles `border-radius:6px; padding:6px 4px; text-align:center`, ID 12px weight 500 darkest + status 11px mid-tone. Color by worst severity; cleared = green.

**Verbatim quotes:** 12px italic `#64748b`, attributed: `"…" — P3, IT admin, 5k endpoints`.

**Chips inline in prose:** pastel bg + darkest same-ramp text, `11px; padding:2px 9px; border-radius:10px; font-weight:500` (e.g., hiring-criteria chips, heuristic ID chips in wins).

## Per-framework layout blueprints

### Nielsen heuristic audit
Header + count pills → context line → **scorecard tile grid (all 10, H1–H10 order, cleared = green)** → finding cards in severity order (each: header row → title → optional thumbnail → WRONG / IMPACT / FIX rows) → wins green card (chip per heuristic ID + one-liners) → coverage card (white/neutral, includes recommended fix order, with cross-link notes like "#4 fix shrinks #1's risk").

### JTBD research synthesis
Header + source pill → exec-summary context line → per job: **white container card** holding: job label + n-pill + evidence-strength pill → job statement as 14px line with `border-left:3px solid #2563eb; padding-left:12px` and bold When/I want to/so I can markers → italic attributed verbatim → **forces 2×2 grid** (`repeat(auto-fit, minmax(150px,1fr))`; push=red, pull=green, anxiety=amber, habit=neutral; each: 11px force label + 12px evidence line) → verdict blue card ("switch likely/blocked, because…") → hiring-criteria chip row (table stakes red, performance blue, delighter green). After jobs: tension card in orange `#fff7ed`, thin-evidence ⚠ flags inline.

### Double Diamond (Mode B)
Header → mode context line → **claim card** (white container: "The claim" micro-label + one-sentence claim + gray load-bearing assumptions) → **steelman green card** (`ti-shield-check`) → attack cards in severity order, each with `ti-sword` + severity label (Fatal if true = red / Survivable = amber / Rhetorical = blue) + **voice pill** ("Engineer voice", "PM voice", "Skeptic exec voice") + quoted attack in their voice + bold Mitigation line (or prepared answer for rhetorical) → **verdict card** (green container: verdict + reasoning + Kill criteria line). Mode A uses the same system: theme cards colored by confidence, HMW statements in white containers, discarded framings in neutral.

### Kano classification
Header + **category count pills** (must-be red, performance blue, delighter green, cut gray) → evidence-basis context line with re-run date → cards grouped: unmet must-bes first (red, with evidence-tier pill + solid "P0 — spec now" pill + "Bar is met when:" line), performance ranked (blue, rank in label; T3 items get "T3 ⚠ validate" pill + cheapest-validation line), selected delighter (green; decay watch = amber pill inside the green card), **cut card last** (neutral gray, "Cut — with reasons", each cut item one bold-name line with the reason).

### HEART metrics
Header + decision pill → scope context line (in-scope AND excluded-with-reasons) → per-dimension blue card: dimension icon + label + **instrumentation status pill** ("logged ✓" white-bordered / "derivable" white-bordered / "NEW events needed" red pill) → **G→S→M as one inline chain** (GOAL / SIGNAL / METRIC as label-column rows) → stat-box row (baseline / target / eval window) for the primary metric → instrumentation line (event names + props) where NEW → **guardrails amber card** (each line: "Pushing X → watch Y (reason)") → **QBR paragraph green card** (business language, placeholders like [x] where data pending, attribution method stated).

## Composition rules

- EVERY issue/finding/item is a colored card — no plain bullets anywhere in rendered output, regardless of severity.
- Stack order: severity/priority first, category second. Wins and verdicts close the stack; coverage/cut/meta cards last.
- Cross-link between cards and between pipeline stages in body text ("the stress-test 🔴 mitigation didn't make it into this screen") — traceability is rendered, not just claimed.
- Spacing: 8–10px between cards, 14–18px after header/scorecard blocks.
- Density: body sections are scannable rows (see Scannable body rows), never paragraphs; a card needing more than ~8 body lines is two findings.
- One widget per framework output; when chaining frameworks, one widget per stage with brief connecting prose between.
