# UX design brief — output template

> The default deliverable. Fill every section with product-grounded specifics (real menu paths, real
> component names, real states). Omit a section only if it genuinely doesn't apply, and say why. Mark
> anything not confirmed by the KB as "(assumption — verify)". Keep prose tight; use small tables where
> they help. Scale the depth to the ask — a "where does this live" question needs only §1–§3.

---

## Template

```markdown
# UX Design Brief — <feature / screen name>

## 1. What & why
One paragraph: the job this screen does and for whom. New screen, redesign, or placement question?
The core user problem it solves. Key assumptions (and what to verify).

## 2. Product context — where it lives
- Owning module(s): <module> (KB: `<file>.md`)
- Console location: `<Tab> > <Submenu> > <Screen>` (verbatim from KB; note dual entry in Security edition)
- Edition / platform gating: <Free/Pro/Enterprise/UEM/Security; Windows/Mac/Linux/mobile; cloud vs on-prem>
- Neighbours: what sits beside it in the left-nav / how it relates to adjacent screens
- Cross-cutting concepts in play: <SoM, Custom Groups, Deployment Policy, Test & Approve, RBAC, DS, SSP, Zia…>

## 3. Users & jobs-to-be-done
Primary persona(s) and their JTBD for this screen; secondary personas. (Ground in personas-and-friction.md
and the module's own UX lens.) What does success look like for each?

## 4. Navigation flow (deep)
Follow nav-flow-guide.md. Cover: all entry points; the path in; wizard steps with Next/Back/Save/Cancel;
branches; drill-downs; cross-module handoffs; and the state at each node. Use the arrow notation.

## 5. Screen inventory & layout regions
List each screen/view/modal this feature touches. For the main screen, describe layout regions
(header/breadcrumb, filters/toolbar, primary content — list/table/wizard/dashboard, detail/side panel,
action bar) and what belongs in each. Reference existing product patterns to reuse.

## 6. Key components & patterns
The specific components to use (wizard stepper, list-view with filters + Action ⋯ menu, target-selection
tree, dashboard tiles + drill-down, grouped settings panels, status badges, notification config block,
confirmation modals). Name them; reuse existing components (flag, don't invent). For each action and message, also state the **feedback/disclosure pattern** (modal / side panel / tooltip / toast / inline banner / inline validation) per `references/interaction-patterns.md`, and the **confirmation** for any destructive/fleet-scale action.

## 7. States & edge cases
Empty / loading·in-progress / partial·mixed / error / success / blocked-by-edition — for each relevant
one, what the user sees and the next action offered. (See console-ia.md §5.)

## 7.5 Success metric (data-analyst lens)
How we'd know this design works: the primary success metric and what to instrument (task success, time-on-task, error/misconfig rate, adoption). Keep it to 1–3 measures.

## 8. Content & microcopy notes
Follow `references/ux-writing.md`; give **exact copy** for buttons, key labels, empty state, error (what happened + fix + Read KB), and confirmation wording.
Labels, key messages, empty-state copy, error explanations (cause + fix + "Read KB"), confirmation
wording for high-impact actions. Keep it consistent with the product's voice.

## 9. Friction to design against / opportunities
The documented friction at play here (from the module's UX hooks + personas-and-friction.md) and how
this design mitigates it. If the ask is "improve/rethink", pull relevant "product expansion
opportunities" from the module's PM lens.

## 10. Open questions & to-verify
Assumptions to confirm against the live console or internal specs; decisions the user needs to make.
```

---

## Notes on using the template
- **Menu paths must be real.** Copy them from the KB module file; don't paraphrase into something that
  doesn't exist.
- **Reuse beats invention.** If a pattern already exists for this kind of task, name it and reuse it;
  flag genuinely new UI and say why it's needed.
- **The flow (§4) is the centerpiece** — give it the most space. The user specifically wants depth here.
- **Right-size it.** "Where should this go?" → §1–§3. "Design the screen" → all sections. "What's the
  flow?" → §2 + §4. A full new feature → everything, saved as a markdown file.
