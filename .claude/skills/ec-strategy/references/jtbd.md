
# JTBD Research Synthesis

Turn raw qualitative research into a Jobs to Be Done map that a PM can argue with — and that survives the argument because every claim traces back to a quote.

## Core principle

People don't buy products; they **hire** them to make progress in a specific circumstance. The unit of analysis is never the persona or the feature — it is the **job**: the progress a person is trying to make in a given context. A sysadmin doesn't want "a patch dashboard"; they want to *prove to their boss by Friday that no critical CVE is unpatched, without manually checking 4,000 endpoints*.

A job statement has three parts:

> **When** [circumstance], **I want to** [motivation], **so I can** [expected outcome].

If you can't fill all three from the evidence, you have a feature request, not a job. Park it and keep digging.

## Workflow

### Step 1 — Ingest and tag

Read every transcript/source fully before synthesizing anything. While reading, tag verbatims into these buckets (a quote can land in multiple):

- **Circumstance** — the triggering situation ("every quarter during audit season...", "when a zero-day drops on a Friday...")
- **Struggling moment** — friction with the current way ("I export to Excel and manually dedupe", "I keep three browser tabs open")
- **Workaround** — what they cobble together today (workarounds are the strongest job evidence that exists)
- **Outcome language** — how they describe "done" or "success"
- **Emotional/social signal** — fear of blame, desire to look competent, anxiety about breaking production
- **Switching trigger** — moments where they considered/adopted/abandoned a tool

Keep speaker attribution (e.g., `[P3, IT admin, 5k endpoints]`). Anonymous synthesis is unarguable synthesis.

### Step 2 — Cluster into jobs

Group tagged verbatims by *progress sought*, not by feature mentioned or by who said it. Two users asking for different features ("give me a CSV export" / "give me an API") often share one job ("get this data into the tool where my real workflow lives").

For each cluster, write:
1. The job statement (When / I want to / So I can)
2. **Job level**: Main job vs. related job vs. emotional/social job (see the DEEP REFERENCE section below for definitions)
3. Frequency: how many distinct participants gave evidence (n=X of Y)
4. 2–3 strongest supporting verbatims, attributed

### Step 3 — Map the four forces

For each main job, fill the Forces of Progress diagram. This is what makes the output strategic rather than descriptive:

| Force | Question it answers | What to mine for |
|---|---|---|
| **Push** (of the situation) | What's painful enough about today to make them move? | Struggling moments, workarounds, incident stories |
| **Pull** (of the new solution) | What attracts them to a better way? | Outcome language, "I wish", competitor envy |
| **Anxiety** (of the new) | What fears block adoption? | Migration risk, learning curve, "what if it breaks prod" |
| **Habit** (of the present) | What inertia keeps them where they are? | Sunk scripts, muscle memory, "we've always done it this way" |

**Switch happens only when Push + Pull > Anxiety + Habit.** State explicitly, per job, which side currently wins and what evidence says so. This single line is usually the most-debated and most valuable sentence in the whole report.

### Step 4 — Extract hiring criteria

List the criteria users actually use to "hire" a solution for this job, ranked by how often and how forcefully they appear. Distinguish:

- **Table stakes** — absence disqualifies ("must work without internet on air-gapped endpoints")
- **Performance criteria** — more is better ("time from CVE published → patched")
- **Delighters** — unprompted excitement when mentioned

Also list what users **fire**: tools/processes they've abandoned for this job, and the stated reason. Fired solutions are competitive intelligence.

### Step 5 — Flag tensions and gaps

- **Contradictions**: where participants disagree (e.g., admins want automation, security leads want manual approval gates). Don't average them away — name the tension; it usually marks a segmentation boundary.
- **Evidence gaps**: jobs with n=1 evidence, or forces with no data. Mark them `⚠ THIN EVIDENCE` so nobody builds a roadmap on one anecdote.
- **Unanswered questions**: 3–5 specific follow-up research questions the data raises.

## Output format

Default to a single structured document (markdown, or HTML if the user prefers visual output) with this exact skeleton:

```
# Jobs Map: [research topic]
**Sources:** N interviews / tickets / surveys · [date range]

## Executive summary
3–5 sentences: the dominant job, the strongest force, the headline tension.

## Job 1: [short name]  (n=X/Y participants)
> When …, I want to …, so I can …
**Type:** main / related / emotional
**Evidence:** [2–3 attributed verbatims]

### Forces of progress
Push / Pull / Anxiety / Habit — each with evidence
**Verdict:** Switch likely / blocked, because …

### Hiring criteria
Table stakes · Performance · Delighters
**Fired solutions:** …

## Job 2 … (repeat)

## Tensions & segmentation signals
## Evidence gaps (⚠)
## Recommended follow-up questions
```

Order jobs by evidence strength (n), not by which sounds most exciting.

## Quality bar

- Every job statement, force, and criterion cites at least one attributed verbatim. No quote → no claim.
- Verbatims stay verbatim — never paraphrase inside quote marks.
- Maximum 5–6 jobs. If you found 12, you clustered features, not jobs — merge upward.
- Never invent a persona. If segments emerge, derive them from differing circumstances/forces in the data.
- If the input is too thin to support synthesis (e.g., one short transcript), say so and produce a lighter "early signals" memo instead of a fake-confident jobs map.

For deeper framework grounding (job hierarchy, interview-question patterns to suggest, common anti-patterns), read the DEEP REFERENCE section below.
-e 

---

# DEEP REFERENCE

# JTBD Framework Reference

## Job hierarchy

- **Main job** — the big functional progress. "Keep every endpoint compliant without it consuming my week."
- **Related jobs** — adjacent progress done before/after/alongside. "Prove compliance to auditors." "Onboard new machines fast."
- **Emotional jobs** — how the person wants to feel. "Feel confident nothing slipped through."
- **Social jobs** — how they want to be perceived. "Look proactive to the CISO, not reactive."

Enterprise tools live and die on emotional/social jobs more than teams admit — blame avoidance and audit-defensibility drive admin behavior at least as much as efficiency. Always check for them; they hide inside throwaway lines ("...and then *I'm* the one who gets the call").

## The switch timeline (for switching-focused research)

When the research is about adoption/churn, reconstruct the timeline per participant:

1. **First thought** — when did the idea of a new way first occur?
2. **Passive looking** — noticing alternatives without acting
3. **Active looking** — comparing, trialing
4. **Deciding** — the event that forced a decision (budget cycle, incident, mandate)
5. **Consuming/using** — first-use experience, where anxiety materialized or dissolved

The gap between "first thought" and "deciding" is where forces are visible in their rawest form.

## Distinguishing job from feature request

| Signal | Feature request | Job evidence |
|---|---|---|
| Phrasing | "Add a column for X" | "I need to know X before I approve" |
| Stability | Changes with UI trends | Stable for years/decades |
| Test | Disappears if UI changes | Survives any solution form |

When a participant gives a feature request, the synthesis move is: *what progress would that feature create?* Note the request, record the inferred job, and mark the inference as such (don't pass inference off as quote-backed).

## Interview question patterns (to suggest as follow-ups)

- "Walk me through the last time [circumstance] happened — start from the moment you realized."
- "What did you try before this? Why did you stop?"
- "If [current tool] vanished tomorrow, what would you do at 9am?"
- "When you finished, how did you know it was done? Who did you tell?"
- "What almost stopped you from switching?"

## Anti-patterns to avoid in synthesis

1. **Persona laundering** — wrapping demographic stereotypes in JTBD vocabulary. Jobs are circumstance-based, not identity-based.
2. **Solution-shaped jobs** — "users want a dashboard" is not a job. Jobs are solution-agnostic.
3. **Averaging contradictions** — if half want automation and half fear it, that's two circumstances, not one lukewarm job.
4. **Frequency worship** — a job mentioned by 2/10 participants with intense emotion and elaborate workarounds can outweigh one mentioned blandly by 8/10. Weight by intensity × frequency, and say which.
5. **Quote mining** — picking the most dramatic verbatim regardless of representativeness. Pick the most *typical* strong quote; flag outliers as outliers.

## Severity of evidence ladder (strongest → weakest)

1. Observed workaround (they built/maintain something to cope)
2. Money/time already spent on alternatives
3. Detailed, unprompted incident story
4. Direct answer to a probing question
5. Agreement with interviewer's suggestion ("yeah, that'd be nice") — near-worthless; mark as such

## Visual presentation (mandatory)

Before rendering, read `references/visual-style.md` — it contains the locked design system AND this framework's specific layout blueprint (component patterns, card colors, stacking order). The skeleton in this file defines CONTENT and ORDER; visual-style.md defines the LOOK. Markdown skeleton is the fallback only, for surfaces with no rendering.
