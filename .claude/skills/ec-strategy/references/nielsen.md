
# Nielsen Heuristic Audit

A formal, rubric-driven usability evaluation. The output is a documented audit — heuristic IDs, severity scores, evidence — that survives being forwarded to a PM, attached to a Jira ticket, or defended in a design review. This complements visual annotation reviews; it does not replace them.

## The rubric: Nielsen's 10 (1994, still the standard)

| ID | Heuristic | One-line test |
|---|---|---|
| H1 | Visibility of system status | Does the user always know what's happening, within an appropriate time? |
| H2 | Match between system & real world | Does it speak the user's language and follow real-world conventions? |
| H3 | User control & freedom | Clear emergency exits — undo, redo, cancel, back — without long detours? |
| H4 | Consistency & standards | Same words/actions mean the same thing; platform & product conventions followed? |
| H5 | Error prevention | Are error-prone conditions eliminated or confirmed before commit? |
| H6 | Recognition rather than recall | Are options, actions, and context visible instead of memorized? |
| H7 | Flexibility & efficiency of use | Accelerators for experts (shortcuts, defaults, bulk ops) without burdening novices? |
| H8 | Aesthetic & minimalist design | Does every element earn its place, or does irrelevant info compete with relevant? |
| H9 | Help users recognize, diagnose, recover from errors | Plain-language errors that state the problem and a constructive fix? |
| H10 | Help & documentation | Is help searchable, task-focused, concrete, and available in context? |

**Chip / tile short labels (use these on the scorecard strip — always name + ID, never a bare `H1`):**
`H1 Visibility` · `H2 Match real world` · `H3 User control` · `H4 Consistency` · `H5 Error prevention` · `H6 Recognition` · `H7 Flexibility` · `H8 Minimalist design` · `H9 Error recovery` · `H10 Help & docs`.

Deeper interpretation per heuristic — including enterprise/admin-console specific readings (e.g., H1 = scan lifecycle states, H5 = enforcement-mode confirmations, H3 = bulk-action undo) — lives in the DEEP REFERENCE section below. Read it before any audit of an enterprise/IT-management product.

## Severity scale (Nielsen's 0–4)

| Score | Label | Meaning | Review framing |
|---|---|---|---|
| 4 | Catastrophe | Blocks task completion or causes data loss/wrong destructive action | Must fix before release |
| 3 | Major | High frequency or high impact; users will struggle repeatedly | Fix this release |
| 2 | Minor | Noticeable friction; workaround exists | Fix when convenient |
| 1 | Cosmetic | Polish; noticed but doesn't impede | Backlog |
| 0 | Not a problem | Evaluated and cleared | Document to pre-empt debate |

Severity = **frequency** (how often hit) × **impact** (how hard to overcome) × **persistence** (one-time learnable vs. repeated). When scoring, state which of the three drove the number — "Severity 3 mainly on persistence: admins hit this every scan cycle" is arguable; a bare "3" is not.

## Workflow

1. **Establish context first.** Who is the user (admin? end-user? auditor?), what task is this screen serving, what's the expected frequency of use? A severity score without task context is a guess. If a screenshot arrives with zero context, infer it from the UI, state your inference explicitly, and invite correction.

2. **Sweep all 10, in order.** Walk H1→H10 against the screen/flow. Forcing the full sweep is the point of the method — it catches what intuition-led review misses (H7 and H10 are the most commonly skipped, and the most commonly violated in enterprise UIs). Record "no violation found" for clean heuristics too.

3. **One violation = one finding.** Each finding gets: heuristic ID, location (be pixel-specific: "the Save button in the sticky footer", not "the form"), evidence (what the UI shows/lacks), severity with the driving factor, and a concrete fix. A finding without a fix is a complaint.

4. **Rank by severity, then group by heuristic.** Catastrophes first, regardless of which heuristic.

5. **Note positives.** 3–5 things the design does right, with heuristic IDs. This isn't politeness — it documents what must NOT regress in the redesign.

## Output format

**Default: visual card output** (when an HTML rendering surface exists — see the router's Visual output layer for the exact color system). Structure of the rendered audit:

1. **Header banner** — screen name, "Nielsen Heuristic Audit · Severity 0–4", context-assumed line. Soft neutral page background (`#f8fafc`), never plain white.
2. **Scorecard strip** — all 10 heuristics as compact tiles, each labelled with its **short name, never a bare ID** (e.g. `H1 Visibility`, `H5 Error prevention` — not just `H1`), showing violation count and worst severity; clean heuristics in green tint so coverage is visible at a glance. Use the short-label list under the rubric table.
3. **Finding cards**, stacked in severity order. Each card uses the severity color system (SEV 4–3 red `#fef2f2`/`#dc2626`/`#7f1d1d`, SEV 2 amber, SEV 1 blue) and ALWAYS contains these five labeled sections — this is what makes a finding argue-able instead of a taste opinion:
   - **Header row:** severity icon + `SEV N` uppercase label + `H5 · ERROR PREVENTION` pill
   - **Title:** the violation in one plain sentence
   - **What's wrong:** the observable evidence — exactly what the UI shows or lacks, pixel-specific location ("the Save button in the sticky footer")
   - **Why it hurts:** the consequence chain in user terms — who hits it, how often, what it costs them (this is the frequency × impact × persistence reasoning written as a story, e.g. "every scan cycle, the admin can't tell if deployment started or hung — so they re-trigger it, doubling load")
   - **Fix:** concrete, actionable, with the heuristic principle it restores
   - Optional mini-thumbnail (~80px, white bg) recreating the problem element — skip for absence/conceptual issues
4. **What's working** — green cards, 3–5 items with heuristic IDs (documents what must not regress)
5. **Coverage note** — heuristics swept and cleared

Markdown fallback (no rendering surface) — same content, this skeleton:

```
# Heuristic Evaluation: [screen/flow name]
**Context assumed:** [user, task, frequency — flag if inferred]

## Summary scorecard
| Heuristic | Violations | Worst severity |  ← all ten rows, including zeros

## Findings (severity order)
### 🔴 SEV 4 — [Finding title]  `H5 · Error prevention`
**What's wrong:** …
**Why it hurts:** [who, how often, what it costs — the consequence chain]
**Fix:** …

## What's working (don't regress)
## Coverage note
```

If the user wants screenshot annotation (markers ON the image), hand the findings to the ux-review output flow using these severity scores to drive marker colors: SEV 4/3 → 🔴, SEV 2 → 🟡/🟠, SEV 1 → 💡.

## Quality bar

- 10/10 heuristics explicitly swept every time — coverage is the method's whole value over ad-hoc review.
- No severity without the frequency/impact/persistence justification.
- Fixes must be specific enough to act on ("add a 'Scanning… started 14:02' state row" not "improve feedback").
- Multiple violations of the same heuristic stay separate findings — don't merge "missing loading state on table" with "missing progress on export" just because both are H1.
- A heuristic audit evaluates against the rubric, not personal taste. If something bothers you but maps to no heuristic, put it in a clearly-labeled "Outside rubric" footnote.


---

# DEEP REFERENCE

# Nielsen's 10 — Deep Interpretation (Enterprise / Admin Console Lens)

For each heuristic: what it really means, the enterprise-specific reading, and the highest-frequency violations seen in IT-management / endpoint / admin products.

## H1 — Visibility of system status
**Core:** feedback within appropriate time; the system never goes silent.
**Enterprise reading:** long-running operations are the norm (scans, deployments, syncs). Status must be a *lifecycle*, not a binary: queued → in progress (with start time / % / count) → completed (with timestamp) → failed (with reason). "Last scan: 3 days ago" is status; a green dot alone is not.
**Frequent violations:** spinner with no time estimate on multi-minute ops; table refresh with no indication data changed; bulk action fires with no per-item progress; agent status shown as color-only dot (also an accessibility fail); policy "saved" but no indication of when it reaches endpoints.

## H2 — Match between system and the real world
**Core:** user's vocabulary, natural mapping, real-world conventions.
**Enterprise reading:** the "real world" is the admin's mental model and the industry's vocabulary (CVE, ring deployment, quarantine), NOT the product team's internal architecture names. Module names that leak org structure ("UEMS Agent Framework Settings") fail H2.
**Frequent violations:** internal jargon in UI labels; icons that don't match operation semantics; date formats ignoring locale; "Associate" / "Map" / "Link" / "Bind" used interchangeably for the same concept.

## H3 — User control and freedom
**Core:** undo/redo, clearly marked exit, no trap states.
**Enterprise reading:** stakes are higher — a wrong bulk action hits 4,000 machines. Control means: cancel an in-flight deployment, roll back a policy version, leave a wizard with a draft saved, recover a deleted config (soft delete + retention window).
**Frequent violations:** no Cancel button in forms; wizard with no Back; destructive bulk action with no undo AND no preview of affected scope; modal that loses 20 fields of input on accidental dismiss; "enforce" actions that take effect instantly with no grace/test mode.

## H4 — Consistency and standards
**Core:** internal consistency + platform/industry conventions (Jakob's Law: users spend most of their time on other products).
**Enterprise reading:** suites are the killer — same action must look the same across modules (Patch / Vuln / MDM / EDR). Button order, terminology, table interaction patterns, empty-state structure should be system-level decisions.
**Frequent violations:** primary button left in one module, right in another; "Create" vs "Add" vs "New" for identical operations; different date filters per module; same severity colors meaning different things across dashboards.

## H5 — Error prevention
**Core:** eliminate error-prone conditions or catch them before commit. Two classes: **slips** (right intent, wrong execution → fix with constraints, confirmations, good defaults) and **mistakes** (wrong mental model → fix with previews, explanations).
**Enterprise reading:** the most important heuristic in admin tools. Prevent: deploying to "All Computers" when you meant a test group (show affected count + require typed confirmation past a threshold); enabling Block/Enforce mode without an Audit-mode trial; schedule fields accepting input when On-Demand is selected; conflicting policies silently overriding.
**Frequent violations:** destructive confirm dialogs that don't state scope ("Delete policy?" vs "Delete policy applied to 312 devices?"); no dry-run/preview for rule changes; free-text where a validated picker should be.

## H6 — Recognition rather than recall
**Core:** minimize memory load; options and context visible.
**Enterprise reading:** admins juggle dozens of IDs, group names, and policy names. Show context inline: when selecting a target group, show its member count; when referencing a policy, show its key settings on hover; in step 4 of a wizard, summarize choices from steps 1–3.
**Frequent violations:** dropdown of bare policy names with no metadata; confirmation dialogs that don't restate what was configured; forcing users to remember which exclusion list a hash was added to; search that requires exact names.

## H7 — Flexibility and efficiency of use
**Core:** accelerators for experts, invisible to novices.
**Enterprise reading:** the daily-driver users are experts. They need: bulk operations everywhere a single operation exists, saved filters/views, keyboard navigation in tables, CSV import where manual entry exists, cloneable policies, API parity with UI actions, sensible remembered defaults.
**Frequent violations:** one-by-one operations on lists with thousands of rows; filters that reset on every visit; no "duplicate" on complex configs; wizards that can't be pre-filled from an existing object.

## H8 — Aesthetic and minimalist design
**Core:** every unit of information competes with every other; irrelevant info dilutes relevant.
**Enterprise reading:** NOT "make it pretty" — it's signal-to-noise ratio in dense UIs. Default views show what drives decisions; everything else is progressive disclosure. A 14-column default table where admins use 5 columns fails H8.
**Frequent violations:** dashboards where every widget shouts equally; forms showing all advanced options expanded; redundant copy ("Click the button below to…"); decorative severity badges on every row drowning the actual critical ones.

## H9 — Help users recognize, diagnose, and recover from errors
**Core:** plain language, precise problem, constructive solution.
**Enterprise reading:** error messages are debugging interfaces. Good shape: what failed + on which targets + why (specific) + what to do + a path to act (link/button) + correlation ID for support. "Deployment failed on 12 of 312 devices — agent unreachable. [View affected devices] [Retry failed]".
**Frequent violations:** raw error codes with no translation; "Something went wrong"; failure counts with no drill-down to *which* items failed; errors shown as transient toasts that vanish before reading.

## H10 — Help and documentation
**Core:** ideally none needed; when needed — searchable, contextual, task-focused, concrete steps, short.
**Enterprise reading:** complex domains legitimately need help, so make it *in-context*: field-level tooltips explaining consequences ("Audit mode logs but does not block"), prerequisite banners with links ("Requires agent 11.2+ — see upgrade guide"), empty states that teach the first action, "Learn more" links that deep-link to the exact doc section.
**Frequent violations:** help link goes to documentation homepage instead of the relevant page; tooltips that restate the label ("Name: the name of the policy"); no explanation of irreversible-consequence settings; onboarding empty states that say "No data" with no next step.

---

## Sweep order tip
H1 and H5 catch the catastrophes. H4 and H7 catch the death-by-thousand-cuts. H10 and H2 catch why support tickets exist. If time-boxed, sweep in this order: H5 → H1 → H3 → H9 → H4 → H6 → H7 → H8 → H2 → H10 — but always complete all ten.

## Visual presentation (mandatory)

Before rendering, read `references/visual-style.md` — it contains the locked design system AND this framework's specific layout blueprint (component patterns, card colors, stacking order). The skeleton in this file defines CONTENT and ORDER; visual-style.md defines the LOOK. Markdown skeleton is the fallback only, for surfaces with no rendering.
