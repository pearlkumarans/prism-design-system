# Skills index — routing guide

How Claude decides which skill to run for a given prompt, and how the skills chain.

> **How routing actually works:** Claude routes by each skill's `description` frontmatter
> (in `<skill>/SKILL.md`), which the harness loads at session start. This file is the human-
> readable map of that routing; the condensed table also lives in `CLAUDE.md` so it is loaded
> into context every session. **After editing any `description` or this index, restart the
> session (or `/reload` in an interactive terminal) — the skill list is snapshotted at startup.**

## Intent → skill

| The prompt is about… | Run |
|---|---|
| **Building an actual page/view file** in the shell — "add a page", "create a list/form/dashboard/detail view", "make a screen", "wire it into the router" | `generate-layout` |
| **Endpoint Central product / domain knowledge** — where a feature lives, module behavior, the navigation flow, approval/scan/deployment workflows, edition or platform gating, "design a screen for <EC feature>", how it works technically, troubleshooting, how to position/sell it, "I don't know where to start" | `ec-ux` |
| **Visual design feedback** on a UI — a screenshot, Figma link, or described screen; "review this", "critique", "roast my UI", "is this good", "feedback on this layout" | `ec-critique` |
| **UX strategy / process artifacts** — JTBD synthesis, affinity/theme clustering, steelman / stress-test a direction, Kano prioritization, **Nielsen heuristic audit** (severity-rated, forwardable), HEART metrics | `ec-strategy` |

## Disambiguation (the overlaps that cause mis-routing)

- **`ec-critique` vs `ec-strategy`** — both give design feedback. Use `ec-critique` for fast,
  holistic, subjective review (first impression, hierarchy, polish, quick a11y flags). Use
  `ec-strategy` → **Nielsen** when the user wants a *formal, rubric-scored, forwardable* audit —
  cues: "heuristic evaluation", "Nielsen", "severity ratings", "documented audit". Casual
  "review / roast / what do you think" → critique; "formal audit / heuristics / severities" → strategy.
- **`ec-ux` vs `generate-layout`** — `ec-ux` answers *what* to build and *where it lives* (a
  domain brief + deep nav flow); it creates **no files**. `generate-layout` *builds and wires the
  file*. When a prompt names an EC feature and asks to build a page, run `ec-ux` first to ground
  the design, then `generate-layout` to create it.
- **`ec-ux` vs `ec-critique` / `ec-strategy`** — `ec-ux` carries product/domain knowledge;
  the other two evaluate a design regardless of domain. To review an EC screen you may ground with
  `ec-ux` first, then critique or audit.

## Chaining patterns

- **Build an EC page end-to-end:** `ec-ux` (ground the domain — statuses, workflow, where it lives)
  → `generate-layout` (build + wire the file) → `ec-critique` or `ec-strategy`/Nielsen (evaluate).
- **Research → metrics pipeline** (inside `ec-strategy`): JTBD → Double Diamond → Kano → Nielsen → HEART.

## The skills

| Skill | Folder | Files |
|---|---|---|
| `generate-layout` | `.claude/skills/generate-layout/` | `SKILL.md` |
| `ec-ux` | `.claude/skills/ec-ux/` | `SKILL.md` + `references/` (50+ file EC knowledge base) |
| `ec-critique` | `.claude/skills/ec-critique/` | `SKILL.md` |
| `ec-strategy` | `.claude/skills/ec-strategy/` | `SKILL.md` + `references/` (framework refs + visual-style) |
