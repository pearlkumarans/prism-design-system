# Deep page-navigation flow guide

> The navigation flow is the heart of the brief. A flow that only lists the happy path is not enough —
> document where the user comes *from*, every step, every branch, every state, and where each action
> takes them *to*. Ground it in the module's real "Console navigation paths" from the KB.

## What "deep" means (checklist)

A navigation flow is deep when it covers:

1. **Entry points** — *all* the ways a user reaches this screen (top-level tab + left-nav; a
   dashboard tile drill-down; an Action ⋯ menu on a list; a link from a related module; the mobile app;
   Zia). Endpoint Central usually has several — patch workflows, for example, are reachable from both
   `Patch Mgmt` and `Threats & Patches`, and from dashboard tiles.
2. **The path in** — the exact `Tab > Submenu > Screen` breadcrumb (copy from the KB).
3. **On-screen actions** — every primary and secondary action and where it leads (opens a wizard? a
   modal? a detail view? an inline edit?).
4. **Wizard steps** — if it's a multi-step flow, list each step, its purpose, its key fields, and the
   Next/Back/Save/Cancel behavior. Note the review-before-save step.
5. **Drill-downs** — count/tile → filtered list → per-item detail → sub-detail. Show each hop.
6. **Branches** — decisions that fork the flow (Deploy vs Publish-to-SSP; Install vs Uninstall; per-OS
   selectors Windows/Mac/Linux; corporate vs BYOD enrollment).
7. **States at each node** — empty, loading/in-progress, partial, error, success, blocked-by-edition
   (see console-ia.md §5). What does the user see and what can they do next in each?
8. **Exits** — where Save / Cancel / Back / breadcrumb take them; what confirmation guards destructive
   or high-impact actions (Deploy Immediately, Move to Trash, Suspend).
9. **Cross-module handoffs** — when the flow sends the user to or pulls data from another module
   (a vulnerability → its patch; an EDR incident → quarantine/patch; an asset → remote control).

## Notation

Use simple, readable arrows and indentation. Keep it text — it renders anywhere and is easy to edit.

```
Entry: Patch Mgmt (or Threats & Patches) > Deployment > Automate Patch Deployment
  └─ [Automate Task] ─▶ APD wizard
       Step 1 Define ─▶ pick OS (Windows | Mac | Linux)                     ┐ Next/Back
       Step 2 Select Applications ─▶ severities / all / specific / except   │ each step
       Step 3 Deployment Settings ─▶ branch:                                │ validates
            ├─ Deploy ─▶ pick Deployment Policy (+ optional SSP, grace)     │
            └─ Publish to Self-Service Portal                               ┘
       Step 4 Target + Notify ─▶ include/exclude groups; notify config
       [Save] ─▶ task created ─▶ returns to APD list (row shows status badge)

Alt entry: Dashboard tile "Highly Vulnerable" ─▶ drill to systems list ─▶ select ─▶ Install/Publish
Empty state (no approved patches): "No Missing Patches Found" ─▶ link to Test & Approve
Error state (download failed): status "Failed" + Detail View + Read KB link
```

For a bird's-eye view you can also give a **screen map** (nodes = screens, edges = transitions) and,
if the user wants a diagram, describe it so a Mermaid `flowchart` can be generated from it.

## Method

1. Open the module's KB file → its **"Console navigation paths"** table and **"Step-by-step"**
   workflows in the UX lens. These already encode the real flow — build on them, don't guess.
2. List entry points first (there are usually several). If you only find one, look again — check the
   dashboard, the Action ⋯ menu, related modules' cross-references, and the mobile app.
3. Walk the primary task end to end, then walk each branch. Add the state at every node.
4. Note reused patterns by name (wizard stepper, target-selection tree, Action ⋯ menu) so the designer
   knows to reuse existing components, not design new ones.
5. Call out friction the KB documents at specific nodes (e.g., "Step 3 Deploy-vs-SSP is a known
   decision point where admins hesitate") so the flow can be improved, not just described.

## Good vs weak (illustrative)

**Weak:** "User goes to Patch Mgmt, creates an APD task, saves." (No entry variety, no steps, no
branches, no states — a designer can't build from this.)

**Good:** the block above — multiple entry points, each wizard step with its decision, the Deploy-vs-SSP
branch, the empty and error states, the confirmation on deploy, and the return destination.
