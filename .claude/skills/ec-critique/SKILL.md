---
name: ec-critique
description: "Give structured, actionable design feedback on UI screens, mockups, and prototypes across first impression, usability, visual hierarchy, consistency, and accessibility. Use this skill whenever the user shares a screenshot of a UI, pastes a Figma link, describes a design in words, or asks phrases like \"review this design,\" \"critique this mockup,\" \"what do you think of this screen,\" \"roast my UI,\" \"is this good,\" \"feedback on this layout,\" or any variant of asking for design feedback — even when they don't explicitly say \"critique.\" Covers web/SaaS product UI, mobile apps, and marketing/landing pages, at any stage from early exploration to final polish."
---

# Design Critique

> **MANDATORY visual output — read `references/visual-review.md` first, every time.** Produce the FULL
> **annotated + corrected** visual review (severity colours, colour-coded issue cards, readable *explicit*
> text). If a visual-widget tool is available (Cowork/claude.ai) render it inline; in a **local project with
> no widget tool, WRITE a self-contained `.html` file** with the same output and tell the user to open it.
> Never skip the corrected view, never degrade to a one-line summary, never let text inherit colour.


Give the user structured, specific, actionable design feedback. Balance consistency of format with tailoring to the specific design, and always include concrete fixes — not just observations.

## Step 1: Gather context before critiquing

**Always ask for context before giving feedback.** A critique without context is guessing. If any of the following are missing from the user's message, ask for them in a single concise message (one question with multiple parts, not a back-and-forth):

1. **What is it?** — product type, what the screen does (e.g., "checkout flow for a B2B SaaS," "onboarding for a mobile fitness app," "landing page for a dev tool")
2. **Who is it for?** — target user
3. **What stage?** — early exploration / mid refinement / final polish. This matters a lot: early-stage work gets feedback on direction and concept; final-stage gets feedback on pixel-level polish.
4. **Focus area (optional)** — "just look at the nav," "mobile only," "does the CTA work?"

If the user has already provided some of this context in their message, don't re-ask — just confirm and ask for what's missing.

**Exception:** If the user explicitly says "just dive in" or "skip the questions," respect that and give a critique based on reasonable assumptions (state the assumptions at the top of your critique).

## Step 2: Access the design

- **Figma URL** → If the Figma MCP is connected, use `Figma:get_design_context` or related Figma tools to pull the actual design data (components, tokens, layers). If not connected, ask the user to share a screenshot or describe the design.
- **Screenshot** → Look carefully. Describe what you see briefly at the top of your critique so the user knows you're seeing what they're seeing.
- **Text description** → Work from the description, but flag that your feedback is limited without visuals.
- **Multiple screens** → Critique each individually, then comment on flow/consistency across them.

## Step 3: Apply the critique framework

Run through these five lenses. Not every one will have findings for every design — skip dimensions that don't apply rather than padding with weak observations.

### 1. First Impression (the 2-second test)
- What does the eye land on first? Is that the intended focal point?
- Is the purpose of the screen immediately clear?
- What's the emotional/tonal read? (professional, playful, trustworthy, generic, etc.)

### 2. Usability
- Can the user accomplish the primary goal? What's in their way?
- Are interactive elements obviously interactive?
- Is the navigation intuitive? Any dead ends or unclear states?
- Are there unnecessary steps or cognitive load?

### 3. Visual Hierarchy
- Is there a clear reading order? Does it match importance?
- Are the right elements emphasized — or is everything fighting for attention?
- Is whitespace doing work, or is the layout cramped/sparse?
- Is typography creating hierarchy (size, weight, color) or flattening it?

### 4. Consistency
- Spacing, color, typography — are they systematic or ad hoc?
- Do similar elements look and behave similarly?
- If a design system exists (visible in Figma or mentioned), does this follow it?

### 5. Accessibility
- Color contrast on key text (aim WCAG AA: 4.5:1 for body, 3:1 for large text)
- Touch target size (min 44×44pt on mobile)
- Text size and line height for readability
- Information conveyed by color alone? (flag if yes)
- Alt text / labels for non-text content (if visible/applicable)


### 6. Product rules — Endpoint Central dashboards & color (if applicable)
When the design is an Endpoint Central (or UEMS/ManageEngine) dashboard, status tile, chart, or metric
view, also check it against these Endpoint Central product design rules (source of truth: the ec-ux skill's `references/design-cases.md`):
- **Severity/status data uses SEMANTIC color** (one meaning per color — Critical=danger/red, High=warning,
  Medium=caution, Low=info, Healthy=success/green, Unknown=neutral), consistent across the product, with
  icon + label (never color alone). Flag rainbow-coded severity or inconsistent status colors.
- **Equal-priority / same-category series use MONOTONE** (one hue, vary tone only — e.g. distribution by
  OS/department/vendor). Flag it when peers are given different hues (implies meaning that isn't there).
- Sequential magnitude → single-hue light→dark; reserve diverging/2-hue for a meaningful target midpoint.
- **One primary button per view** — only the single most important action is a filled/primary
  button; Cancel/Back/alternatives are secondary/tertiary; destructive = danger + confirm.
  Flag multiple primary buttons competing in one view.
- **Right feedback pattern** — modal/side-panel/tooltip/toast/inline-banner/inline-validation used for the
  right job; destructive/fleet-scale actions have a confirmation (consequence + count); no essential info
  hidden in a tooltip, no toast for a long-running op, no reinvented component where one exists; toasts appear **top-center** of the screen (product standard). Flag misuse.
- **Hierarchy & right-sizing** — one clear focal point; each component the right DS size/variant for its context (e.g. a table status badge should be **medium**, not **small**); same-role elements consistent. Flag under-/over-sized components and flat hierarchy.
- Verify contrast (AA), most-critical-first ordering, and drill-down affordance. Cite the case number.

## Step 4: Write the critique

Use this output structure. Adapt section lengths to what the design actually needs — don't force findings where there aren't any.

```markdown
## Design Critique: [Brief name or description of what you're reviewing]

**Context:** [1 line summarizing what this is, who it's for, what stage]

### Overall Impression
[2–3 sentences. What works, what the biggest opportunity is. This should feel like a senior designer's gut reaction, not a generic summary.]

### Usability
[Prose for 1–2 big findings, OR a table if there are multiple discrete issues:]

| Finding | Severity | Recommendation |
|---------|----------|----------------|
| [Specific issue] | 🔴 Critical / 🟡 Moderate / 🟢 Minor | [Concrete fix] |
Other instructions

UX review skill — trigger: Activate immediately on screenshots, mockups, or Figma links, or on keywords "review" / "feedback" / "paaru" / "check pannu" / "roast it" / "ithu ok va" / "enna feedback". Never ask "do you want feedback?" — the screenshot alone is the signal. Match language: Tanglish in = Tanglish out. Direct not harsh ("intha typo iruku" beats "I noticed a concern"). Use "da" / "yaar" naturally.
UX review output flow: (1) 1-line reaction, (2) ANNOTATED UI WIDGET with 3 layers — Layer 1 canvas with numbered markers 🔴#dc2626 / 🟡#ca8a04 / 🟠#ea580c / 💡#2563eb, Layer 2 legend strip (1-line TOC), Layer 3 COLOR-CODED ISSUE CARDS (bg #fef2f2 / #fffbeb / #fff7ed / #eff6ff + matching left border, icon + severity label + #N ref + title + optional thumbnail + Why + Fix sections), (3) Wins 3–6 specific or skip, (4) Priority 3–6 items, (5) CORRECTED UI WIDGET with ✓N badges, (6) Continuation.
### Visual Hierarchy
- **What draws the eye first:** [Element] — [is this correct for the goal?]
- **Reading flow:** [How the eye moves through the layout]
- **Emphasis issues:** [What's over- or under-emphasized]

### Consistency
[Table if multiple issues, otherwise prose. Skip if the design is consistent.]

### Accessibility
[Concrete findings with specifics — "body text is #999 on white, ~2.8:1, fails AA" beats "check contrast."]

### What Works Well
- [Specific positive — not generic praise]
- [Another one]

### Priority Recommendations
1. **[Most impactful change]** — [Why it matters and how to do it]
2. **[Second priority]** — [Why and how]
3. **[Third priority]** — [Why and how]
```

## Critique principles

These shape *how* you give feedback, not just *what*.

- **Be specific.** "The CTA competes with the top nav for attention because both are high-saturation blue" beats "the layout is confusing." Name the element, name the problem, name the cause.
- **Explain the why.** Tie feedback to a principle (Fitts's Law, hierarchy, Gestalt), user need, or business goal. Don't just pronounce.
- **Propose, don't just diagnose.** Every problem gets at least one concrete alternative. If you genuinely don't know the fix, say so — but try first.
- **Match the stage.**
  - *Exploration:* feedback on concept, direction, information architecture. Don't nitpick spacing.
  - *Refinement:* balance of concept and execution.
  - *Polish:* pixel-level, edge cases, microcopy, motion, accessibility.
- **Acknowledge what works.** Not as throat-clearing — call out specific good decisions. This helps the designer know what to preserve.
- **Pick your battles.** Don't list 20 minor issues. 3–5 substantive findings + priorities is more useful than an exhaustive audit.
- **Respect the designer.** Assume they made choices for reasons you might not see. Frame feedback as "I noticed X — was that intentional?" when you're unsure, not "this is wrong."

## When to push back vs. follow the user's lead

- If the user asks you to focus on one thing, focus on that — don't critique the whole screen anyway.
- If they say "this is final, just tell me if it ships" — give go/no-go with the top 1–2 blockers only.
- If they're clearly attached to a choice you'd question, voice the concern once, then let it go. Respect their call.
- If you see a **critical** issue outside their requested focus (accessibility failure, broken flow), flag it briefly even if unasked — then return to their focus.
