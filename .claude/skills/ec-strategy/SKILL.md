---
name: ec-strategy
description: Unified UX strategy toolkit with five frameworks — JTBD research synthesis, Nielsen heuristic audit, Double Diamond diverge/converge, Kano feature classification, and HEART metrics — usable individually or chained as a pipeline. Use whenever the user needs UX strategy or design-process work beyond visual critique — interview transcripts or research to synthesize ("jobs map", "JTBD", "what did we learn", "why are users churning"); clustering findings into themes ("affinity map", "real problem"); stress-testing a direction before stakeholders ("steelman", "poke holes", "prep for review"); prioritizing a backlog ("Kano", "must-have or nice-to-have", "everything is P0"); formal usability audits ("heuristic evaluation", "Nielsen", "severity ratings"); or UX measurement ("HEART", "success metrics", "prove the redesign worked", "QBR numbers"). Also use when the user asks which framework fits, or wants to chain stages from research to metrics.
---

# UX Strategy Toolkit

> **Output enforcement — every run, environment-aware.** Produce the full formatted output (scorecard with
> named chips, severity colours, cards). Render inline if a widget tool exists; in a **local project with no
> widget tool, write a self-contained `.html` file** instead. Never skip or degrade; give every text element
> an **explicit colour** so it's readable in light and dark mode.


Five frameworks, one pipeline. Each framework lives in its own reference file containing the complete workflow, locked output format, quality bar, and deep reference material. This router does three jobs: **pick the right framework(s) from the input**, **load only what's needed**, and **chain outputs when the task spans stages**.

## Framework selection

Match the input and intent, then read ONLY the relevant reference file(s) before doing any work:

| Input / intent looks like… | Framework | Read |
|---|---|---|
| Raw interview transcripts, support tickets, survey verbatims, sales notes → "what do users actually need / why do they switch or churn" | **JTBD research synthesis** | `references/jtbd.md` |
| Pile of findings/observations/ideas → "cluster into themes / find the real problem / write a problem statement" | **Double Diamond, Mode A** (diverge) | `references/double-diamond.md` |
| A chosen direction or decision → "stress test / steelman / what will stakeholders attack / prep me for review" | **Double Diamond, Mode B** (converge) | `references/double-diamond.md` |
| Feature list / backlog / roadmap candidates → "prioritize / must-have vs nice-to-have / end the P0 fight / design a Kano survey" | **Kano classification** | `references/kano.md` |
| A screen, flow, or spec → "formal usability audit / severity-ranked violations / documented evaluation" | **Nielsen heuristic audit** | `references/nielsen.md` |
| A launch, redesign, or experiment → "how do we measure UX / metrics plan / prove it worked / QBR numbers" | **HEART metrics** | `references/heart.md` |

Ambiguous input? Decide by **artifact type**: transcripts → JTBD; unstructured findings → DD Mode A; a proposal → DD Mode B; a list of features → Kano; a UI → Nielsen; a question about numbers → HEART. If genuinely torn between two, say which two and why, recommend one, and ask once.

**Boundary with visual critique:** if the user shares a screenshot/mockup and uses visual-review language ("review", "paaru", "feedback", "roast it"), a dedicated visual-critique skill (ux-review) takes precedence if installed. This toolkit's Nielsen audit is the formal documented companion to visual critique — use it when the user wants a rubric-scored, forwardable audit. The two combine well: Nielsen severities (0–4) map to annotation marker colors (4/3 → 🔴, 2 → 🟡/🟠, 1 → 💡).

## The pipeline (when chaining)

The frameworks form a product-lifecycle sequence, and their outputs are designed to feed forward:

```
JTBD ──jobs, forces──▶ DD Mode A ──problem statement──▶ Kano ──spec list──▶
DD Mode B ──stress-tested direction──▶ Nielsen ──audited design──▶ HEART ──proof──
```

Specific hand-offs to honor when running multiple stages:

- **JTBD → Kano**: JTBD hiring criteria (table stakes / performance criteria / delighters) are Tier 2 evidence for Kano categories — carry them over explicitly with their verbatim support.
- **JTBD → HEART**: JTBD outcome language ("how the user knows it's done") seeds HEART Goals; struggling moments seed Signals.
- **DD Mode A → DD Mode B**: the converged HMW problem statement becomes the "claim" that Mode B stress-tests.
- **Kano → Nielsen**: unmet must-bes raise audit stakes — a violation blocking a must-be capability defaults to severity 4 territory.
- **DD Mode B → HEART**: Mode B kill criteria become HEART metrics with thresholds ("if X drops below Y, the direction was wrong").
- **Nielsen → HEART**: severity-3/4 findings define the Task-success metrics the redesign must move.

When chaining, produce one combined document with clearly separated stage sections, and a short "traceability" note at the top mapping final recommendations back to their originating evidence (quote → job → problem → feature → metric). Traceability is the entire point of running the chain.

## Anti-theater rule

Do not run more stages than the task warrants. A button-order fix needs zero frameworks. A single form redesign needs at most Nielsen. The full pipeline is for big bets only — module redesigns, navigation restructures, new-capability launches. If the user asks for "everything" on a small task, run the one right framework and say why the rest would be ceremony.

## Visual output layer (default ON when rendering is available)

Plain markdown tables with colored dots are the fallback, not the default. Whenever an HTML rendering surface exists (inline widget tool, HTML artifact, or HTML file output), present results as **styled card-based output**. People forward these to PMs and stakeholders — the visual quality is part of the deliverable's credibility.

**MANDATORY: before rendering any visual output, read `references/visual-style.md`** — it contains the locked design system (exact palette, reusable component patterns, and a per-framework layout blueprint) that every rendered output must follow. Summary of the system (the spec file is authoritative):

**Card system (light pastel HEX always — in every theme, every surface):**

Cards stay light and subtle: soft pastel backgrounds, 4px left border, text in the darkest stop of the same ramp. Page/container background is a quiet neutral (`#f8fafc`) so cards sit gently on it — nothing saturated, nothing loud.

| Meaning | Card background | 4px left border | Text color (darkest stop, same ramp) |
|---|---|---|---|
| Critical / SEV 4–3 / unmet must-be / 🔴 fatal | `#fef2f2` | `#dc2626` | `#7f1d1d` |
| Warning / SEV 2 / 🟡 survivable / decay watch | `#fffbeb` | `#ca8a04` | `#713f12` |
| Notice / reverse / segment-split | `#fff7ed` | `#ea580c` | `#7c2d12` |
| Info / SEV 1 / ⚪ rhetorical / performance | `#eff6ff` | `#2563eb` | `#1e3a8a` |
| Positive / wins / delighter / met must-be | `#f0fdf4` | `#16a34a` | `#14532d` |
| Neutral / indifferent / cut list | `#f1f5f9` | `#64748b` | `#0f172a` |

**Layout rules:**
- **EVERY issue/finding renders as a colored card — no exceptions.** Never demote lower-severity findings (SEV 1, ⚪ rhetorical, indifferent features) to plain bullets or text lists while higher ones get cards. Mixed formats read as half-finished; every item in the stack gets its severity/category color treatment.
- Page/widget background must NOT be plain white — use a soft neutral (`#f8fafc` or similar) so cards lift off the surface.
- Each finding/job/feature = one card: header row (severity/category icon + UPPERCASE label + ID pill, e.g. `H5` / `JOB 2` / `MUST-BE`) → bold title → body sections → fix/action.
- Chip/pill text follows the contrast rule above — NEVER white or light text on pastel backgrounds.
- A summary strip at the top (scorecard, category counts, or verdict banner) before the cards.
- Stack cards in severity/priority order.
- Typography: system font stack, 13–14px body, generous padding (16–20px), 12px card radius, subtle shadow.

Markdown fallback (no rendering surface): keep the locked formats from each reference file, using the emoji severity markers.

## Shared quality bar (applies to every framework)

- Every claim traces to evidence (quote, data point, or a named, flagged assumption). Inference labeled as inference.
- Locked output formats from each reference file are non-negotiable — they're what makes outputs forwardable and comparable across rounds.
- Confidence flags (⚠ thin evidence / Tier 3 / single-source) are mandatory, never cosmetic.
- Every analysis ends with a committed verdict or recommendation — refusing to call it is refusing to do the job — plus the evidence that would change it.
