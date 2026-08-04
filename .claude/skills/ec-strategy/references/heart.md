
# HEART Metrics

Google's HEART framework (Rodden, Hutchinson & Fu, 2010) exists because "the design feels better" loses every budget argument, and because the default alternative — vanity counts like page views — measures traffic, not experience. HEART turns UX quality into five measurable dimensions, and the **Goals → Signals → Metrics** discipline keeps the numbers honest.

## The five dimensions

| Dim | What it measures | Typical instruments | Watch out |
|---|---|---|---|
| **Happiness** | Attitude: satisfaction, perceived ease, likelihood to recommend | CSAT, NPS, SUS, SEQ, in-product micro-surveys | Lags behavior; novelty effects after redesigns (expect a dip, then recovery — measure at 2+ points) |
| **Engagement** | Depth/frequency/intensity of voluntary use | Sessions per user per week, actions per session, feature usage depth | **Mostly wrong for enterprise admin tools** — more time in an endpoint console often means something is broken. Often the right call is engagement-as-efficiency: *less* time = better. Justify direction explicitly |
| **Adoption** | New users/accounts starting to use the product or feature | % of target population using feature within X days of exposure, new-account activation rate | Define the denominator precisely (eligible users, not all users) and the "used it" threshold (one click ≠ adoption) |
| **Retention** | Do they come back / keep using | Cohort retention at 1/4/12 weeks, feature repeat-use rate, churn of usage | Use cohorts, never blended averages; for enterprise, seat-level usage retention beats account renewal (renewal lags reality by a contract cycle) |
| **Task success** | Effectiveness & efficiency on critical tasks | Completion rate, time-on-task, error rate, abandonment point, path deviation | Requires defined task start/end events — the instrumentation prerequisite most teams skip |

Not every project needs all five. **Choosing which dimensions matter is itself the analysis** — a settings-page redesign is Task success + Happiness; a new module launch is Adoption + Retention; forcing all five produces dashboard sludge. State which dimensions are in scope and why the others aren't.

## The Goals → Signals → Metrics discipline

Never jump from dimension to metric. For each chosen dimension, build the chain:

1. **Goal** — what does success *mean* here, in plain language, tied to the user's job? ("Admins can confirm patch compliance without building manual reports.")
2. **Signal** — what user behavior or attitude would change if the goal were met? Signals are observable human actions/feelings, not numbers yet. ("Fewer CSV exports for offline analysis; report scheduled instead of run manually.")
3. **Metric** — the signal made countable, with a precise definition: numerator, denominator, time window, segment. ("% of weekly-active admins with ≥1 scheduled report, by week, excluding trial accounts.")

The chain is what makes the metric defensible: when a stakeholder asks "why this number?", the answer walks backward through signal to goal. A metric without its chain is a vanity number with better branding.

## Workflow

1. **Anchor on the decision.** Ask (or infer and state): what decision will these metrics inform — ship/iterate/kill? Budget defense? QBR narrative? The decision determines the metric's required sensitivity and timeline.
2. **Pick dimensions** (usually 2–3) with explicit reasoning for inclusions AND exclusions.
3. **Build the G→S→M table** per dimension. Every metric gets: precise definition, current baseline (or "instrument first — no baseline exists", flagged), target with rationale, measurement cadence, and owner-readable name.
4. **Map to existing instrumentation.** For each metric, state whether the signal is already logged, derivable from existing events, or needs new instrumentation — and for new ones, specify the exact events to log (event name, properties, trigger point). A measurement plan that ignores instrumentation reality is fiction. If the user has analytics context, use it; if not, ask once or mark assumptions.
5. **Add guardrails and counter-metrics.** Every target metric needs at least one metric that catches the perverse optimization: pushing task-completion speed → watch error rate; pushing adoption → watch 4-week retention of adopters; pushing fewer support tickets → watch CSAT (silence ≠ satisfaction).
6. **Write the executive translation.** One short paragraph per dimension in business language — what moved, why it matters, what it's worth. This is the part the VP actually reads.

## Output format

ALWAYS use this exact structure:

```
# HEART Measurement Plan: [feature/redesign/product]
**Decision this informs:** …
**Dimensions in scope:** [e.g., Task success, Happiness, Retention] — excluded: [Engagement — efficiency tool, time-in-product is inverse; Adoption — existing-user redesign]

## Goals → Signals → Metrics
| Dim | Goal | Signal | Metric (precise) | Baseline | Target | Cadence |
|---|---|---|---|---|---|---|

## Metric definitions (the fine print)
[per metric: numerator/denominator/window/segment/exclusions]

## Instrumentation plan
| Metric | Status (logged / derivable / NEW) | Events needed |

## Guardrails & counter-metrics
## Executive summary (the QBR paragraph)
## Review cadence & kill criteria for the metrics themselves
```

## Quality bar

- Max ~2 metrics per dimension, ~6–8 total. A 20-metric plan is an unread plan.
- Every metric has numerator, denominator, window, and segment — "user satisfaction" is not a metric; "median SEQ score on the policy-creation task, monthly, admins with >30 days tenure" is.
- Engagement direction explicitly justified for the product type (especially enterprise/utility products).
- No metric without a counter-metric. No target without a baseline or a flagged plan to establish one.
- Distinguish movement attributable to the design from seasonality/marketing/sales motions — recommend cohort comparison or holdback where attribution matters.
- For PULSE-vs-HEART context, the original paper's worked examples, and enterprise-specific signal libraries (admin consoles, B2B SaaS), read the DEEP REFERENCE section below.
-e 

---

# DEEP REFERENCE

# HEART — Deep Reference

## Origin & contrast with PULSE

Google ran PULSE (Page views, Uptime, Latency, Seven-day actives, Earnings) — business/technical health metrics. They're necessary but say nothing about *experience quality*: page views rise when users are lost; seven-day actives counts logins, not progress. HEART (CHI 2010 paper "Measuring the User Experience on a Large Scale") was built as the user-centered complement. The practical takeaway: HEART metrics sit alongside business metrics, not instead of them — the strongest QBR slide pairs one HEART metric with the PULSE/business metric it drives.

## Enterprise / admin-console signal library

Signals that work for B2B SaaS and IT-management products specifically:

### Happiness
- In-product micro-survey after task completion (SEQ: "How difficult was this task?" 1–7) — far better response quality than periodic NPS blasts
- Support-ticket sentiment on a specific surface, before/after
- "Would you be disappointed if this feature went away?" (Sean Ellis question) for feature-level happiness
- Caution: enterprise NPS conflates product, pricing, and account-team experience — use product-scoped CSAT/SEQ for design decisions

### Engagement (usually inverted: efficiency)
- Time from login → first meaningful action (lower = better information scent)
- % of sessions that touch search vs. navigation (rising search share on a console often = navigation failure)
- Repeat visits to the same settings page within a day (often = the setting didn't stick / confidence gap)
- Scheduled/automated usage replacing manual usage (automation adoption = highest-trust engagement signal in admin tools)

### Adoption
- % of eligible accounts/seats using the new capability within 30/60/90 days of release (define eligibility: right plan, right role, agent version supports it)
- Depth threshold: "adopted" = completed the core loop once (e.g., created AND deployed a policy), not opened the page
- For redesigns with opt-in/preview toggles: opt-in rate AND opt-out (reversion) rate — reversion is the louder signal

### Retention
- Feature repeat-use: of seats that used it in week 1, % using in week 4
- Workflow displacement: % still using the old path / export-to-Excel workaround after the new path shipped (workaround persistence = the new design hasn't earned trust)
- Seat-level weekly active within accounts (account renewals lag 12 months; seat usage leads)

### Task success
- Funnel completion on instrumented critical tasks (policy creation: started → configured → scoped → deployed), with abandonment step
- Error/validation-failure rate per form submission
- Rework rate: % of created objects edited within 24h of creation (high = the form didn't help users get it right first time)
- Time-to-task for benchmark tasks, measured in moderated tests pre/post (small n, paired with funnel data at scale)
- Support tickets per 1,000 active seats on the redesigned surface

## Worked example (condensed)

Redesign: policy-creation form (enterprise endpoint product).
Decision: did the redesign reduce misconfiguration and effort — iterate or move on?

| Dim | Goal | Signal | Metric |
|---|---|---|---|
| Task success | Admins configure policies correctly first time | Fewer validation errors; less post-create editing | Validation failures per submission; % policies edited <24h after creation (target −30%) |
| Task success | Less effort | Faster completion, fewer abandonments | Funnel completion rate started→deployed, weekly; median time-to-deploy |
| Happiness | Form feels manageable | Better task-level ease ratings | SEQ micro-survey on deploy success screen, monthly median |

Excluded: Adoption (same users, mandatory surface), Engagement (utility surface — time is cost), Retention (no opt-out exists).
Guardrails: deployment rollback rate (speed must not produce bad policies); support tickets tagged "policy".

## Metric pathologies

1. **The denominator dodge** — "feature usage up 40%" with no denominator. Always per-eligible-user or per-account.
2. **Blended cohorts** — averaging week-1 users with week-40 users hides that new cohorts behave differently. Cohort everything.
3. **Survey timing bias** — surveying only on success screens samples only successful users. Trigger on abandonment too, or weight accordingly.
4. **Novelty/disruption conflation** — every redesign dips efficiency metrics for 2–4 weeks (relearning). Pre-register the evaluation window (e.g., weeks 5–8 post-launch) so the dip isn't read as failure or the recovery as win.
5. **Goodhart drift** — once a metric becomes a target, behavior optimizes the metric, not the goal. The counter-metric requirement and an annual "do these metrics still measure the goal?" review are the antidotes.
6. **Attribution theater** — claiming a design caused a number that marketing, sales comp changes, or seasonality moved. Holdback groups, staged rollouts, or at minimum honest confounder notes.

## QBR translation patterns

- Pair every UX metric with its cost/revenue shadow: rework rate → support cost; task time → admin hours saved across the install base; retention of feature use → renewal-risk leading indicator.
- One number per dimension on the slide; the precise definitions live in the appendix.
- Report deltas with baselines and windows ("policy rework −34%, weeks 5–8 post-launch vs. trailing quarter"), never bare absolutes.

## Visual presentation (mandatory)

Before rendering, read `references/visual-style.md` — it contains the locked design system AND this framework's specific layout blueprint (component patterns, card colors, stacking order). The skeleton in this file defines CONTENT and ORDER; visual-style.md defines the LOOK. Markdown skeleton is the fallback only, for surfaces with no rendering.
