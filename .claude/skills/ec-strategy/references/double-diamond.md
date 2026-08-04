
# Double Diamond Synthesis

Two diamonds, four moves: **Discover** (diverge on the problem) → **Define** (converge on the right problem) → **Develop** (diverge on solutions) → **Deliver** (converge on the right solution). The most common design failure is converging too early on the wrong problem and then defending a solution to it brilliantly. This skill forces the diverge before permitting the converge.

Detect which mode the user is in and run the matching half. Run both halves when given raw findings AND a direction to test.


## Mode A — Diverge: cluster findings into themes (Diamond 1)

Input: raw findings, observations, feedback, ideas, complaints — any unstructured pile.

### A1. Atomize
Break the input into atomic findings — one observation per item, stripped of solution language. "Users want a bigger button" → atomize to the observation underneath: "3 users missed the primary action on first attempt." Keep source attribution per atom.

### A2. Cluster bottom-up
Group atoms by *underlying cause or need*, never by surface feature or screen. Let clusters emerge from the data; do NOT start with categories and sort into them (that's how you find only what you expected). Rules:
- A cluster needs ≥2 independent sources, or it's flagged `⚠ single-source`.
- An atom that fits two clusters is a signal — note the bridge; bridges often ARE the insight.
- Resist the orphan-bin temptation: an "Other" pile >15% of atoms means the clustering cut is wrong — re-cut.

### A3. Name themes as insights, not topics
"Navigation" is a topic. "Admins can't predict which module owns a task, so they search instead of navigate" is an insight. Theme name template: **[who] [struggles/needs/believes] [what] because [why]** — falsifiable and arguable.

### A4. Converge: problem statement(s)
Rank themes by evidence strength × impact. Write 1–3 candidate **How Might We** problem statements from the top themes. For each HMW state: what's deliberately in scope, what's deliberately OUT (a problem statement that excludes nothing defines nothing), and what evidence supports the framing.

**Mode A output skeleton:**
```
# Theme Map: [topic]
## Atoms processed: N (from M sources)
## Theme 1: [insight-form name]  (n=X sources)
Evidence: … | Bridges to: … | Confidence: strong/moderate/⚠
## Theme 2 … (max 6–7 themes)
## Candidate problem statements
HMW 1: … (scope in/out, evidence) — RECOMMENDED because …
HMW 2: …
## Discarded framings & why
```


## Mode B — Converge: steelman + strawman a direction (Diamond 2)

Input: a chosen direction, design decision, or proposal heading to stakeholders.

The goal is for the user to encounter every serious objection here, in private, before encountering it in the review. Run both passes at full strength — a weak strawman is flattery, and flattery before a design review is sabotage.

### B1. State the direction precisely
Rewrite the proposal as one falsifiable sentence + the 2–3 load-bearing assumptions it stands on. If the user's framing is fuzzy, sharpen it first and confirm — you cannot stress-test fog.

### B2. Steelman (the best case)
Build the strongest honest argument FOR:
- Which evidence/themes directly support it (cite, don't gesture)
- Which user job or business goal it serves and how directly
- Why it beats the strongest *alternative* (not the weakest)
- What it costs to NOT do this (inaction has a price; name it)

### B3. Strawman → real attack (the best case against)
Don't build a literal strawman — build the **strongest opposition**, in the voices that will actually be in the room:
- **The PM:** scope, timeline, "what's the smallest version", metric impact
- **The engineer:** feasibility, performance, migration, edge cases
- **The skeptical stakeholder/exec:** "users haven't complained", "competitor doesn't do this", risk aversion
- **The data critic:** sample size, evidence quality, "n=5 interviews?"
- **The user advocate:** which user segment does this direction quietly harm?

For each attack, rate it: 🔴 **fatal if true** / 🟡 **survivable with mitigation** / ⚪ **rhetorical, easily answered**.

### B4. Verdict + armor
- **Verdict:** proceed / proceed-with-changes / reframe / kill — committed and justified. Refusing to call it is refusing to do the job.
- **Mitigations** for every 🔴 and 🟡 (a design change, a phased rollout, a measurement plan, an explicit accepted-risk)
- **Prepared responses:** for the top 3–5 likely objections, a 2–3 sentence answer the user can deliver verbatim in the meeting
- **Kill criteria:** what evidence, if it appeared, should change this decision — committing to these in advance is what separates conviction from stubbornness

**Mode B output skeleton:**
```
# Direction Stress Test: [proposal]
## The claim (one sentence) + load-bearing assumptions
## Steelman — the case FOR
## The attack — strongest case AGAINST
🔴 … | 🟡 … | ⚪ …
## Verdict: [proceed / modify / reframe / kill] because …
## Mitigations
## Prepared responses (top objections, verbatim-ready)
## Kill criteria
```


## Quality bar

- Diverge fully before converging — in Mode A, never propose solutions inside themes; in Mode B, never soften the attack to be agreeable.
- Steelman and attack must be **asymmetric in content, symmetric in effort**. If the FOR section is 3× the AGAINST, the test is rigged.
- Every theme, argument, and attack ties to evidence or a named assumption. Label inference as inference.
- A direction that survives only ⚪ attacks wasn't tested — go harder, or state honestly that the available evidence can't generate a serious objection (rare, and itself informative).
- See the DEEP REFERENCE section below for clustering pitfalls, the diamond-skipping failure modes, and stakeholder-voice calibration.
-e 

---

# DEEP REFERENCE

# Double Diamond — Deep Reference

## The four phases (Design Council, 2005)

| Phase | Mode | Question | Failure if skipped |
|---|---|---|---|
| Discover | Diverge | What's actually going on? | Solving symptoms |
| Define | Converge | Which problem matters most? | Boiling the ocean / vague briefs |
| Develop | Diverge | What are the possible answers? | First-idea bias |
| Deliver | Converge | Which answer survives contact with reality? | Shipping the favorite, not the fittest |

The diamonds are a discipline, not a ceremony: each phase's output is the next phase's input, and the most expensive failures come from converging during a diverge phase (judging ideas while generating them) or diverging during a converge phase (reopening the problem during delivery).

## Clustering pitfalls (Mode A)

1. **Top-down sorting** — starting with categories ("Navigation", "Performance", "Visual") guarantees you find exactly those categories. Always bottom-up.
2. **Screen-shaped clusters** — grouping by which screen the feedback mentions clusters by geography, not cause. Two complaints about different screens often share one cause (e.g., inconsistent button order).
3. **Frequency = importance fallacy** — 8 mild mentions of label wording can outrank 2 reports of data loss only if you count instead of weigh. Weigh by severity × frequency, and show both numbers.
4. **The premature insight** — falling in love with a theme after 30% of atoms are placed, then sorting the rest to confirm it. Finish atomizing before naming anything.
5. **Solution contamination** — atoms phrased as solutions ("add export button") smuggle convergence into divergence. Always strip to the observation.

## Insight quality ladder

- Level 1 (weak): "Users had trouble with X" — describes
- Level 2: "Users had trouble with X because Y" — explains
- Level 3 (target): "Users [behavior] because [cause], which means [implication for design]" — directs
- A theme stuck at Level 1 needs more evidence or merging, not a better name.

## Stakeholder-voice calibration (Mode B)

Write each attack the way that person would actually say it in the meeting, including the rhetorical moves:

- **PM:** "I love it, but can we ship the table-only version first and add the panel in Q3?" (scope salami) · "What's the metric this moves?" · "Support tickets don't mention this."
- **Engineering:** "The current API doesn't return that — that's a backend change, different team, different quarter." · "What happens with 50k rows?" · "This breaks the mobile client."
- **Exec/skeptic:** "Has anyone actually asked for this?" · "[Competitor] doesn't do it and they're winning." · "Sounds like a v2 thing." · "How much does it cost if we're wrong?"
- **Data critic:** "Five interviews is an anecdote, not evidence." · "Were these all power users?" · "Correlation — did you control for tenure?"
- **User advocate:** "This optimizes for the daily admin and quietly punishes the once-a-quarter auditor." · "What about the air-gapped customers?"

The test of a good attack section: the user reads it and winces at least once. No wince → too soft.

## Attack severity calibration

- 🔴 **Fatal if true**: invalidates a load-bearing assumption, makes the direction unshippable, or harms a segment irreversibly. Must have a mitigation or the verdict cannot be "proceed".
- 🟡 **Survivable**: real cost, but bounded — answerable with a phased rollout, a measurement plan, a scope cut, or an explicit accepted-risk memo.
- ⚪ **Rhetorical**: sounds sharp in a meeting, dissolves under a prepared 2-sentence answer. Still worth preparing the answer — meetings are won on ⚪s more often than anyone admits.

## Verdict discipline

The four verdicts and what each obligates:
- **Proceed** — all 🔴s mitigated; prepared responses written; kill criteria stated.
- **Proceed with changes** — name the changes precisely; the modified direction should be restated as a new one-sentence claim.
- **Reframe** — the attack revealed the problem statement, not the solution, is wrong. Loop back to Diamond 1 with the specific reframe.
- **Kill** — say it plainly and say what was learned. A clean kill with documented reasoning is a design win, not a failure; it's the cheapest possible version of being wrong.

## Visual presentation (mandatory)

Before rendering, read `references/visual-style.md` — it contains the locked design system AND this framework's specific layout blueprint (component patterns, card colors, stacking order). The skeleton in this file defines CONTENT and ORDER; visual-style.md defines the LOOK. Markdown skeleton is the fallback only, for surfaces with no rendering.
