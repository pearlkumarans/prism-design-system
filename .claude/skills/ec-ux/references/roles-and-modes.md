# Roles & output modes

> One skill, many readers. This file tells you, for each role: how to recognize it, **which KB
> lens/section to read (the minimum)**, which bundled references to pull, and the **output template** to
> produce. Combine with the golden rule in SKILL.md — route to one module, then read only the section
> named here. Read only the row you need.

## Guided intake (use when the role/goal is unclear or the user says "I don't know")

Ask in ONE step (a compact multiple-choice is ideal), then route:
1. **Your role?** UX/UI designer · Product manager · Manager · Developer/architect · Support/SE · Marketer · Other
2. **What's the subject?** name a module/feature (e.g. "patch approval", "BitLocker", "geo-fencing"),
   or describe the problem/goal in a sentence.
3. **What do you want out?** a screen/flow design · where it lives + how it works · edition/gating ·
   technical detail · troubleshooting · positioning/messaging · not sure (I'll pick based on your role).

If they still can't answer #2, offer the module list from `module-catalog.md` (grouped Foundations / UEM
Core / Security Suite) so they can point. Never dump the whole KB — help them pick, then go surgical.

---

## UX designer / UI designer
- **Recognize:** "design a screen/layout", "wireframe", "what's the navigation flow", "where should this
  live", "rethink this UI", "empty/error states", mentions Figma/mockups.
- **Read (minimum):** the module's **§1 "Console navigation paths"** + **§2 "UX lens"** (personas,
  workflows, UI patterns, friction hooks). Add `console-ia.md` (placement/patterns/states),
  `nav-flow-guide.md`, `personas-and-friction.md`, and `support-kb-map.md` (for real error/empty states). For any dashboard/tile/chart, also read `design-cases.md` (severity→semantic color; equal-priority→monotone).
- **Deliverable:** the **UX design brief** in `design-brief-template.md` — with a *deep* navigation flow.
  UI designers: emphasize layout regions, components, states, and visual hierarchy; UX designers:
  emphasize flow, JTBD, and friction mitigation.

## Product manager
- **Recognize:** "value", "positioning", "roadmap", "should we build", "prioritize", "personas",
  "what edition", "competitive", "expansion".
- **Read (minimum):** the module's **§3 "PM lens"** (value, personas, competitive, edition gating,
  expansion) + a skim of §1 for what it is. Add the `module-catalog.md` capsule, `kb/edition-gating.md`,
  and `kb/00-product-overview.md` for positioning.
- **Deliverable — Product brief:**
  ```
  # Product Brief — <feature/module>
  ## Problem & opportunity
  ## What it is (today) & where it lives
  ## Target personas & jobs-to-be-done
  ## Edition / platform gating (cite kb/edition-gating.md)
  ## Competitive angle & differentiators
  ## Expansion opportunities / gaps (from §3)
  ## Success metrics
  ## Open questions
  ```

## Manager (engineering / IT)
- **Recognize:** "give me the summary", "scope/effort", "what's involved", "risks", "decision".
- **Read (minimum):** §3 PM lens + skim §1/§2; `module-catalog.md` capsule, `kb/edition-gating.md`.
- **Deliverable — Decision brief (tight):**
  ```
  # Decision Brief — <feature/module>
  ## What it is & where it lives (1–2 lines)
  ## Who it's for / why it matters
  ## Scope & rough effort (screens/flows or components touched)
  ## Dependencies & gating (edition, platform, cross-module)
  ## Risks / known friction
  ## Recommendation & next step
  ```

## Developer / architect
- **Recognize:** "API/ports", "architecture", "data model", "agent", "integration", "how is it built",
  "limits/constraints".
- **Read (minimum):** the module's **§4 "Developer / Technical lens"** + §1 for context. Add
  `kb/01-architecture-agent-deployment.md` (server/agent/DS/SGS, ports, scaling) and `kb/integrations.md`
  if integration-related.
- **Deliverable — Tech spec:**
  ```
  # Technical Spec — <feature/module>
  ## Overview & components
  ## Architecture / data flow (server, agent, DS/SGS as relevant)
  ## Ports / protocols / APIs
  ## Data model / key objects
  ## Constraints & limitations
  ## Security / gating considerations
  ## Open questions to verify
  ```

## Support / SE
- **Recognize:** "troubleshoot", "error", "not working", "failed", "why does X fail", "common issues".
- **Read (minimum):** the module's **§5 "Support / Troubleshooting lens"** + the matching category in
  `support-kb-map.md`.
- **Deliverable — Troubleshooting guide:**
  ```
  # Troubleshooting — <feature/module or symptom>
  ## Symptom → likely cause → resolution (table)
  ## Prerequisites & common misconfigurations
  ## Diagnostics (where to look: status views, logs, agent health)
  ## Escalation / KB references
  ```

## Marketer
- **Recognize:** "messaging", "value prop", "one-pager", "battlecard", "positioning vs <competitor>",
  "customer proof", "campaign".
- **Read (minimum):** the module's **§3 "PM lens"** (value, differentiators, proof, competitive) +
  `kb/point-products.md` (standalone-vs-suite story) + `kb/00-product-overview.md` (positioning) +
  `kb/edition-gating.md` (what's included where).
- **Deliverable — Messaging brief:**
  ```
  # Messaging Brief — <feature/module>
  ## One-line value proposition
  ## Who it's for (persona + pain)
  ## Key benefits (outcome-led, not feature-led)
  ## Differentiators & proof points
  ## Competitive framing (incl. point-product vs suite)
  ## Edition / availability note
  ## Suggested headlines / CTAs
  ```

## Companion skills (refer out at the right moment)
Chain to the two companion skills so the reader gets an end-to-end flow (see SKILL.md → "Companion skills"):
- **After a UX/UI design brief or a mockup exists → `ec-critique`** for structured visual feedback
  (offer it proactively to designers).
- **When the ask is really research/prioritization/measurement → `ec-strategy`** (JTBD, Nielsen, Double
  Diamond, Kano, HEART) first, then return here to design the solution.
- Marketers/PMs asking "does this land / review the page" can also use `ec-critique` on landing pages.

## Notes
- **Cross-role requests happen.** A PM may want the UX flow too — read both lenses, but still only the
  sections needed, and combine the deliverables.
- **Right-size the output.** A quick "where does X live?" needs 2–3 lines, not a full brief. Scale to the
  ask; save briefs as a markdown file only when they're substantial.
- **Always verify gating** against `kb/edition-gating.md` regardless of role — it's the matrix-verified
  source of truth.
