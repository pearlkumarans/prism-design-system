
# Kano Feature Classification

Noriaki Kano's 1984 insight: features don't trade off on one "importance" axis. They behave in fundamentally different ways — some only hurt when absent, some scale satisfaction linearly, some only delight. Treating them as one ranked list is why every prioritization meeting becomes a P0 fight. Classification first; ranking second.

## The five categories

| Category | Present → | Absent → | Behavior | Investment rule |
|---|---|---|---|---|
| **Must-be** (basic) | Nothing — expected | Anger / disqualification | Asymmetric: can only lose | Meet the bar fully, then STOP investing |
| **Performance** | Proportional satisfaction | Proportional dissatisfaction | Linear: more is better | Invest to competitive position; this is where "how much" matters |
| **Attractive** (delighter) | Delight | Nothing — not missed | Asymmetric: can only win | Invest selectively for differentiation; cheap delighters first |
| **Indifferent** | Nothing | Nothing | Flat | **Do not build.** Every indifferent feature shipped is a must-be left unfixed |
| **Reverse** | Dissatisfaction (for some) | Satisfaction | Negative / segment-split | Don't build, or gate behind opt-in for the segment that wants it |

Two laws that change roadmap math:
1. **Decay**: delighters become performance features become must-bes over time (auto-update was a delighter in 2010; it's a must-be now). Classifications expire — date them.
2. **Segment split**: one feature can be a delighter for admins and a reverse for end-users (e.g., detailed activity telemetry). When evidence splits, classify per segment, never on the average.

## Workflow

### Step 1 — Inventory and atomize
List every candidate feature as a single capability stated in user-outcome language. "Reporting improvements" is not classifiable; "schedule a compliance report to email the CISO monthly" is. Split bundles.

### Step 2 — Classify with stated evidence basis
For each feature, assign a category AND declare which evidence tier the call rests on:

- **Tier 1 — Kano survey data** (functional/dysfunctional question pairs; see the DEEP REFERENCE section below for the survey instrument and the evaluation table). Strongest.
- **Tier 2 — Behavioral/indirect evidence**: support tickets (anger at absence → must-be signal), competitive table-stakes analysis, churn reasons, usage data on similar features, sales-loss notes.
- **Tier 3 — Expert inference**: reasoned classification from domain knowledge. Legitimate, but every Tier 3 call gets a confidence flag and the question that would settle it.

Never present a Tier 3 guess with Tier 1 confidence. The honesty is what makes the output survive the meeting.

Classification heuristics when no survey exists:
- "Users would be *angry*, not just disappointed, if missing" → must-be
- "Users compare vendors on this number" (speed, scale, coverage %) → performance
- "Users wouldn't think to ask, but would tell colleagues about it" → attractive
- "Only we [the product team] are excited about this" → indifferent until proven otherwise — the most common self-deception in backlogs
- "One loud customer wants it; others would complain" → reverse / segment-gate

### Step 3 — Apply the investment rules
Translate categories into the spec/no-spec decision:

1. **Unmet must-bes are automatic P0** — nothing else matters while a basic expectation is broken. This is the sentence that ends most P0 fights.
2. **Met must-bes get zero further investment** — gold-plating a basic is pure waste; redirect to performance.
3. **Performance features get ranked among themselves** by competitive gap × user impact — this is the only group where classic prioritization scoring applies.
4. **Pick 1–2 attractives per cycle**, favoring low-cost/high-surprise. Delighters are seasoning, not the meal.
5. **Indifferents and reverses get explicitly cut**, with the reasoning documented — "cut with reasons" prevents zombie resurrection next quarter.

### Step 4 — Flag decay and disputes
- Mark features likely to decay within 1–2 years ("competitor X just shipped this — delighter → performance migration underway").
- Where the team's belief and the evidence disagree, surface it as a named dispute with the cheapest experiment that would resolve it.

## Output format

ALWAYS use this exact structure:

```
# Kano Classification: [backlog name]
**Evidence basis:** [survey n=X / behavioral / expert inference — mixed per item below]
**Classified:** [date] — classifications decay; re-run in 6–12 months.

## Verdict summary
| # | Feature | Category | Evidence tier | Confidence | Decision |
|---|---|---|---|---|---|
| 1 | … | Must-be (unmet) | T2 | High | **P0 — spec now** |
| 2 | … | Performance | T3 ⚠ | Low | Validate first |
| 3 | … | Indifferent | T3 | Med | **Cut** |

## P0 — Unmet must-bes (spec immediately)
[per feature: why it's a must-be, the evidence, what "meeting the bar" means concretely — must-bes need a defined "done" or they absorb infinite polish]

## Performance features (ranked)
[ranked among themselves with the competitive-gap reasoning]

## Selected delighters (max 1–2) + delighter bench (good ideas, not now)
## Cut list — indifferent & reverse, with reasons
## Decay watch
## Disputes & cheapest validating experiments
```

## Quality bar

- Every feature lands in exactly one category per segment — "sort of a must-have" is a refusal to decide; decide and flag confidence instead.
- The cut list is mandatory. A Kano analysis that cuts nothing classified nothing.
- Must-bes get a concrete "bar is met when…" definition.
- If >40% of the backlog classifies as must-be, the atomization is too coarse or the product is genuinely on fire — say which.
- When asked, generate the actual Kano survey (question pairs + evaluation matrix) from the DEEP REFERENCE section below rather than describing it.
-e 

---

# DEEP REFERENCE

# Kano Model — Deep Reference

## The survey instrument

Each feature gets a **pair** of questions:

- **Functional:** "If [feature is present / works well], how do you feel?"
- **Dysfunctional:** "If [feature is absent / works poorly], how do you feel?"

Both answered on the same 5-point scale:
1. I like it that way
2. I expect it to be that way ("must-be" phrasing)
3. I am neutral
4. I can live with it that way
5. I dislike it that way

### The evaluation table

Rows = functional answer, columns = dysfunctional answer:

| Func ↓ / Dysf → | 1 Like | 2 Expect | 3 Neutral | 4 Live with | 5 Dislike |
|---|---|---|---|---|---|
| **1 Like** | Q | A | A | A | P |
| **2 Expect** | R | I | I | I | M |
| **3 Neutral** | R | I | I | I | M |
| **4 Live with** | R | I | I | I | M |
| **5 Dislike** | R | R | R | R | Q |

A = Attractive · P = Performance · M = Must-be · I = Indifferent · R = Reverse · Q = Questionable (contradictory answers — discard or re-ask; >10% Q rate means the feature description was ambiguous).

### Classification from responses
- **Discrete (mode) method**: each respondent → one category via the table; feature category = most frequent. Simple, loses nuance.
- **Better — category strength**: report the full distribution. A 40% M / 35% P split is a different decision than 75% M. If the top two categories are within ~6 points, report both and treat as mixed/transitioning.
- **Continuous (Better–Worse coefficients)**, the most useful chart:
  - Satisfaction coefficient (Better) = (A + P) / (A + P + M + I) — how much presence increases satisfaction (0 to 1)
  - Dissatisfaction coefficient (Worse) = −(P + M) / (A + P + M + I) — how much absence hurts (0 to −1)
  - Plot features on Better (y) vs |Worse| (x): top-right = performance, bottom-right = must-be, top-left = attractive, bottom-left = indifferent.

### Survey craft
- Describe features as user outcomes, not implementation ("get an alert when a policy fails to apply on any device" not "policy failure webhook").
- 15–20 feature pairs max per survey; fatigue corrupts the back half.
- Add a self-stated importance question (1–9) per feature to break ties among same-category features.
- Segment before averaging: run the table per segment (admin vs. auditor vs. end-user). Averages across segments manufacture Indifferent classifications from opposing strong opinions.
- n≥30 per segment for stable proportions; below that, treat as directional Tier 2 evidence.

## Behavioral proxies (when you can't survey)

| Signal | Likely category |
|---|---|
| Angry support tickets / escalations when broken or missing | Must-be |
| Appears in every competitor's comparison table | Must-be (or performance if quantitative) |
| Sales lost with a stated, measurable gap ("they scan 2× faster") | Performance |
| Users demo it to colleagues unprompted; "wow" in usability tests | Attractive |
| Shipped, announced, and usage flatlined | Indifferent (confirmed) |
| Feature requests from one vocal segment + complaints from another | Reverse / segment-gate |
| Nobody mentions it in research, ever, but the team loves it | Indifferent until evidence says otherwise |

## Decay patterns to watch

- **Attractive → Performance**: competitors copy it; users start comparing quality of it.
- **Performance → Must-be**: the market converges on a standard level (e.g., TLS, SSO, mobile support).
- **Trigger events for re-classification**: major competitor launch, platform-vendor building it in (the "Sherlocked" event), regulation making it mandatory (→ instant must-be), price-tier changes.
- Rule of thumb: re-run classification yearly, or immediately after any trigger event.

## Common analysis mistakes

1. **Averaging across segments** — produces fake Indifferents (see above). Per-segment always.
2. **Treating Must-be as "most important to invest in"** — must-bes are pass/fail gates, not investment magnets. The investment question only ranks performance features.
3. **Delighter hoarding** — shipping 5 delighters while a must-be is broken reads to users as a frivolous product.
4. **Ignoring Questionable rates** — high Q means respondents didn't understand the feature description; the data is noise, not signal.
5. **Using Kano output as the final roadmap** — Kano answers "what kind of thing is this"; sequencing still needs effort/cost, dependencies, and strategy on top. Say so in the output.

## Visual presentation (mandatory)

Before rendering, read `references/visual-style.md` — it contains the locked design system AND this framework's specific layout blueprint (component patterns, card colors, stacking order). The skeleton in this file defines CONTENT and ORDER; visual-style.md defines the LOOK. Markdown skeleton is the fallback only, for surfaces with no rendering.
