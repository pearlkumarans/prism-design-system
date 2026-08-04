# UX laws & principles (applied to Endpoint Central)

> The "why" behind design decisions. Cite the relevant law in a brief or critique — it turns an opinion
> ("this feels cluttered") into a defensible rationale ("Hick's law: 12 interlocking controls with no
> defaults slow every deployment setup"). Each law below is paired with its concrete Endpoint Central move.
> Use 1–2 that genuinely apply; don't sprinkle law names for decoration.

## Core interaction laws

- **Fitts's law** — time to hit a target ∝ distance ÷ size. → Make the primary action large and reachable;
  keep destructive actions **away from** safe ones (don't put Delete next to Save); min 44×44px touch targets;
  put frequent bulk actions where the cursor already is (the selection bar).
- **Hick's law** — decision time grows with the number/complexity of choices. → The Deployment-policy /
  APD screens are the classic offender: reduce visible choices with **sensible defaults + progressive
  disclosure**, hide conditional fields, and offer a "quick" path. Fewer options = faster, safer admins.
- **Jakob's law** — users expect your product to work like the others they already use. → Follow platform +
  admin-console conventions: Save on the right, ⋯ row menus, checkbox multi-select + bulk bar, breadcrumb,
  standard status colors. Don't invent novel patterns for standard jobs.
- **Miller's law** — people hold ~5–9 chunks in working memory. → Chunk long forms and tables into labeled
  groups; don't show 20 ungrouped fields; summarize a complex schedule in one plain-language line.
- **Tesler's law (conservation of complexity)** — every system has irreducible complexity; someone bears it.
  → Patch/deploy logic is genuinely complex — the *product* should carry it (smart defaults, Test & Approve,
  wizards, previews), not dump it on the admin as a wall of required fields.
- **Doherty threshold** — productivity soars when response is < 400ms. → Respond fast or show **skeleton /
  progress / optimistic** state; never a frozen screen. For scans/deploys, surface live progress so the
  wait feels controlled.

## Perception & memory (Gestalt + memory effects)

- **Law of proximity / common region** — things placed close (or in one card) read as related. → Group
  related settings in fieldsets/cards; use whitespace, not just lines, to show structure.
- **Law of similarity** — similar-looking things read as the same kind. → Style the same action the same way
  everywhere (every "Deploy" looks like a Deploy); don't make two unrelated things look alike.
- **Von Restorff (isolation) effect** — the one different item is remembered. → Make the **single primary
  action** stand out (ties to the one-primary-button rule); if everything is loud, nothing is. Use it for the
  most critical tile, not decoration.
- **Serial position (primacy & recency)** — first and last items are best recalled. → Put the most important
  nav/actions at the start or end of a list; worst-first ordering on health tiles.
- **Aesthetic-usability effect** — clean design is *perceived* as more usable (and users forgive minor flaws).
  → Worth the polish — but don't let a pretty screen hide a real usability failure; validate, don't assume.

## Motivation & flow

- **Goal-gradient effect** — motivation rises closer to the goal. → Show wizard progress ("Step 1 of 4",
  completed checks) so admins finish multi-step setup.
- **Zeigarnik effect** — unfinished tasks nag at memory. → Surface incomplete setup ("2 of 5 prerequisites
  done · resume"); let admins resume, don't lose their place.
- **Peak-end rule** — an experience is judged by its peak and its end. → Make the end of a risky flow
  reassuring: a clear success confirmation, what happened, and an Undo/next step — the last impression of a
  deploy shouldn't be uncertainty.

## Robustness & restraint

- **Postel's law (robustness)** — be liberal in what you accept, conservative in what you produce. → Forgive
  input (trim spaces, accept flexible date/time/CSV formats, paste-friendly fields); output clean, consistent
  data. Don't reject a valid intent over formatting.
- **Occam's razor / KISS** — prefer the simplest design that works. → Fewer controls, clearer defaults; "too
  cluttered" is the most common enterprise-console note.
- **Pareto principle (80/20)** — most use concentrates on a few paths. → Optimize the common admin journey
  first (scan → review → approve → deploy); make rare options available but not front-and-center.

## How to use in a brief or critique
Name the law only when it sharpens the point, and tie it to the fix: *"Hick's law — 12 required controls with
no defaults; add defaults + an Advanced section to cut choice load."* One or two well-chosen laws beat a
list. Nielsen heuristics (in the ec-strategy skill) are the audit rubric; these laws are the design rationale.
