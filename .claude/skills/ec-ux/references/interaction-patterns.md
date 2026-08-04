# UX interaction & feedback patterns — which one, when (deep)

> Choosing the *right* disclosure/feedback/input pattern is a senior design decision, as important as layout.
> For every action, message, control, and edge case on an Endpoint Central screen, decide the pattern
> deliberately. This is the decision layer — use it whenever you design or review interaction.
>
> **Rule zero — reuse, don't reinvent.** Express designs with the product's **existing components** (wizard,
> list + Action ⋯ menu, tiles, deployment-policy editor, modal, side panel, popover, banner, toast, tooltip,
> status badge, target tree). Change content/config, never the component. If a genuinely new component seems
> needed, **flag it as an open question** — don't silently invent one.
>
> **Rule one — hover is never the only way.** Anything revealed on hover (tooltips, row actions, truncated
> text, icon meaning) must ALSO be reachable by keyboard focus and by tap/long-press on touch. Hover-only =
> broken for keyboard and touch users. Never hide essential info or the only action behind hover.

## Decision cheat-sheet (pick by intent)

| The user needs to… | Use | Not this |
|---|---|---|
| Make one focused, blocking decision / short create-edit | **Modal dialog** | full page, toast |
| Confirm a destructive or fleet-scale action | **Confirmation dialog** (danger) | plain toast, nothing |
| See / quick-edit an item without losing the list | **Side panel / drawer** | modal, new page |
| Do a long or multi-step form | **Full page / wizard** | modal |
| See a rich, anchored bit of info/actions, non-blocking | **Popover** | modal, tooltip |
| Read a small hint about a control or term | **Tooltip** (hover + focus) | modal, banner |
| **Read text that's cut off (truncated)** | **Tooltip / reveal on hover + focus** showing the full value; or wrap | leave it clipped |
| **Understand an icon-only button** | **Tooltip + `aria-label`** (name on hover/focus) | icon alone |
| **Know why a control is disabled** | **Tooltip / helper on the disabled control** — or don't disable, act on click | silent disabled |
| Know a persistent page condition (prereq, edition lock, sync, error) | **Inline banner / alert** | toast (it vanishes) |
| Get transient confirmation an async action started/finished | **Toast / snackbar** (+ Undo) | banner, modal |
| Learn something completed while they were away | **Notification (bell) / email** | toast |
| Fix a field filled wrong | **Inline validation + helper text** | toast, top-only error |
| Act on many rows at once | **Multi-select + bulk action bar** | per-row round-trips |
| Find rows in a large fleet table | **Search + filters (+ saved views)** | scrolling only |
| Reveal rarely-used options | **Progressive disclosure ("Advanced")** | show everything |
| See / enter a secret (token, password) | **Masked field + show/hide toggle** | plain text, no toggle |
| Copy a value (ID, key, path) | **Copy-to-clipboard button** (+ "Copied" toast) | select-by-hand |
| Track a long operation (scan, deploy, replication) | **In-place progress state** (%, states) | toast, bare spinner |
| Choose one of few / many / a range | **radio / segmented / select / multi-select** (§C) | wrong control |
| Reorder items (rings, priority) | **Drag-and-drop with a handle** (+ keyboard move) | none |
| Undo a reversible action | **Undo snackbar / restore from Trash** | permanent commit |

## A. Disclosure & overlays

**Modal / dialog.** Focused, *blocking* task/decision to resolve before moving on (create/edit small object,
single-step confirmation, Deploy Immediately options, decline-patch reason). Avoid for long forms (→ full
page/wizard) and passive info (→ banner/toast). One primary action; Esc + Cancel close; trap + restore focus.

**Confirmation dialog (destructive / high-impact).** See §G.

**Side panel / drawer.** Contextual detail or quick-edit while keeping the list visible (device detail, edit
policy, patch details). Prefer over modal when context matters or content is medium. Slides from the right.

**Popover.** Lightweight, *anchored*, non-blocking overlay richer than a tooltip — a mini-form, a filter
builder, an inline confirm on a small action, a "details" card. Dismiss on outside-click/Esc. Use when a
tooltip is too small but a modal is too heavy. Must be keyboard-openable and focus-managed.

**Tooltip.** Brief, *supplemental* text on hover **and** focus — icon meaning, a term, a truncated value.
Never essential info, never the only action, never a form. Keep it short; ~300–500ms hover delay; dismissible.

**Inline banner / section alert.** *Persistent* status tied to a page/section that stays until resolved:
prerequisites unmet, edition lock, sync running, connectivity/DB error needing action. Semantic color +
icon + label + next action (see `design-cases.md` Case 1). Not for transient success.

**Toast / snackbar.** Transient confirmation an async action started/finished ("Deployment started", "Policy
saved"). Auto-dismiss ~4–6s; include **Undo** for reversible actions. **Position: always top-center of the screen**, consistent across the whole product, stacking downward so admins always look to the same spot; don't overlap. Not for errors
needing action (→ banner/inline) or long ops (→ progress).

**Notification center (bell) & email.** Async completion the admin may not be watching (APD finished, report
ready, deployment failures) → bell and/or email per settings, with a deep link back. Foreground feedback
stays a toast; background completion goes here.

**Full page / wizard.** Long or multi-step configuration (deployment policy, APD, imaging). See §E for stepper
nav.

## B. Hover, focus & reveal patterns (edge cases)

These are where designs quietly break for keyboard/touch — handle them explicitly.

- **Truncated text → reveal the full value.** Long values (paths, package names, group names, descriptions,
  KB URLs) truncate with an ellipsis to keep tables tidy — but the full value must be reachable: a **tooltip
  on hover + focus**, or expand-on-click, or wrap in the detail view. Never leave a value clipped with no way
  to read it. Add `title`/`aria-label` so screen readers get the full text. Prefer truncating the *middle* for
  IDs/paths (`ABC…XYZ`) so both ends stay meaningful.
- **Icon-only buttons → name them.** Every icon-only control (kebab ⋯, refresh, delete, filter, info ⓘ) needs
  a **tooltip on hover + focus AND an `aria-label`**. Icon alone is ambiguous and invisible to screen readers.
  In dense toolbars, tooltips are how the admin learns the icons.
- **Row-hover actions.** Revealing row actions (edit, delete, remote-control) only on row hover keeps tables
  clean — but they must also appear on **keyboard focus of the row** and be reachable on **touch** (show a
  persistent ⋯ menu on touch/narrow widths). Don't hide the *only* path to an action behind hover.
- **Disabled controls → explain, or don't disable.** A disabled button with no reason is a dead end. Either
  (a) keep it enabled and explain on click/submit what's missing, or (b) if truly disabled, attach a
  **tooltip/helper stating why** and how to enable it ("Deploy is disabled until at least one patch is
  approved"). Never a silent grey button. (Note: native disabled elements don't fire hover tooltips reliably —
  wrap them or use an aria-described helper.)
- **Hover intent & delay.** Use a short open delay (~300–500ms) and a small close grace so tooltips/menus
  don't flicker as the pointer passes; don't trigger heavy actions on hover.
- **Never gate essential info or actions on hover.** Status, required steps, and primary actions are always
  visible; hover only *supplements*.

## C. Forms & input controls

- **Inline validation & helper text.** Validate at the field, on blur and submit, with a specific fix
  ("Deployment window must be 3–24 hours") — not a bare red outline. Mark required fields; show format/limits
  in helper text *before* the user errs; summarize errors at top only *in addition to* inline markers;
  **preserve entered data** on error/navigation.
- **Control choice.** ≤2 options → **toggle/segmented**; 2–5 exclusive → **radio**; 6+ exclusive → **select**;
  multiple → **multi-select / checkbox list**; free + suggested → **combobox**. Match the existing component.
- **Inline edit.** For quick single-value changes in a table/detail (rename, retag), edit in place with clear
  save/cancel and a saving state — cheaper than opening a modal.
- **Autosave vs explicit save.** Settings/config that must be deliberate (policies, security rules) → explicit
  **Save** with a dirty-state indicator and unsaved-changes guard on navigation. Low-risk prefs → autosave
  with a subtle "Saved" confirmation. Be consistent per surface.
- **Progressive disclosure.** Hide rarely-used or expert options behind "Advanced settings" / an expander so
  the default path stays simple; keep defaults sensible so most admins never expand.
- **Secrets (token, password, key).** Masked field + **show/hide toggle** (eye icon, with aria-label);
  copy-to-clipboard where the admin needs the value; never echo the secret in errors/logs.
- **Copy-to-clipboard.** For IDs, keys, agent commands, paths: a copy button with a "Copied" micro-confirm.
- **Date/time & windows.** Use the product's picker; for ranges (deployment window) validate start<end and
  show the resulting duration; always state the **time zone** used.

## D. Tables & fleet-scale data

- **Multi-select + bulk action bar.** Checkbox column + a bar that appears on selection showing the **count**
  and the allowed bulk actions (Approve, Decline, Deploy, Delete). "Select all" spans filter, not just page —
  state whether it's "all 47 on this page" or "all matching". Bulk destructive actions confirm with the count
  (§G). (If a table offers multi-select checkboxes, it MUST offer a bulk action — else the checkboxes lie.)
- **Search, filter, saved views.** Large fleets need search + column filters; persist the admin's filter/sort
  (localStorage) and offer **saved views** for recurring scopes. Show active-filter chips with clear-all.
- **Sort.** Sortable columns with a visible sort indicator and a sensible default (worst-first for health).
- **Pagination vs load-more vs virtual scroll.** Known large sets an admin scans/audits → **pagination** (with
  page size + total). Feed-like → load-more/infinite. Very large in one view → virtualized rows. Always show
  the **total count**.
- **Expandable rows / detail.** Expand a row for sub-detail (per-device patch reasons) or open a side panel;
  don't cram everything into one row.
- **Chips overflow → "+N more".** When a cell has many tags/months/groups, show a few then "+3 more"
  revealing the rest on click/popover (not hover-only).
- **Empty cells show `—`,** never blank; density compact for 50+ rows; actions in a consistent column.

## E. Navigation & structure

- **Wizard / stepper.** Multi-step config: consistent button order across steps (`Cancel | Next` → `Back |
  Next` → `Back | Save`), completed steps show a check, Back preserves data, conditional steps/fields hide
  when irrelevant. One primary per step (`Next`/`Save`, right).
- **Tabs vs sub-nav.** Peer views of the same object → tabs; distinct sections of a module → left sub-nav.
  Don't put a sequential process in tabs (use a wizard).
- **Breadcrumb + back.** Deep console paths need a breadcrumb; cross-page flows ("Create credential" from a
  setup) need a "← Back to setup" and context banner + auto-return.
- **Accordion / tree expand-collapse.** SoM/OU trees, grouped settings: expandable with clear expanded state;
  remember expansion; keyboard-operable.

## F. Feedback & lifecycle

- **Loading: skeleton vs spinner vs progress.** Known layout loading → **skeleton**; short indeterminate wait →
  spinner; measurable work → **progress with % / count**. Don't block the whole screen for a section's load.
- **Optimistic vs pending.** Reflect quick reversible changes optimistically with a subtle pending indicator +
  rollback on failure; for high-stakes ops, show true pending state, don't fake success.
- **Long-running in-place state.** Scans/deploys/replication/imaging as distinct states: never-run / running
  (% or "38 of 120") / failed (error + retry) / completed — where the admin is looking. Set expectations
  ("agents check in every 90 min").
- **Real-time / auto-refresh vs manual.** Live operations can auto-refresh with a "last updated" timestamp and
  a manual refresh; don't silently mutate a table the admin is reading — indicate new data.
- **Undo / reversibility.** Prefer reversible: Undo snackbar (5–8s), Move to Trash + Restore, audit trail with
  one-click revert. Say what's reversible in the copy.
- **The state matrix (design every one).** empty / loading / partial-mixed / error / success / blocked-by-edition
  for every list, tile, form, and detail (see `console-ia.md` §5, `support-kb-map.md`). Distinguish
  cleared vs never-run for security checks (see `ux-writing.md`).

## G. Destructive & high-impact actions

Delete, Move to Trash, **Wipe / Corporate wipe**, **Quarantine**, Uninstall, **Decline**, Suspend, deploy to
many: **confirmation dialog** stating the **consequence + exact count**, **danger-styled** confirm (Cancel is
the focused default), **typed confirmation** for irreversible/fleet-scale, scope restated at the button and in
the dialog, and reversibility named (Undo / Restore). Never the quiet default-looking primary (ties to the
button-hierarchy case). Prefer reversible over hard delete.

## H. Common EC actions → pattern

- Delete / Trash / Suspend / Wipe / Quarantine / Uninstall → **confirmation dialog** (danger + count; typed for fleet-scale).
- Deploy Immediately (≤200 now, rest next refresh) → **modal** (scope/consequence) → **toast** "Deployment started" → **in-place progress**.
- Decline patch → **modal** with reason/remarks (audit).
- Approve patch(es) → inline/bulk action; bulk → **bulk action bar** with count.
- Prereq missing / edition locked / sync running → **inline banner**.
- Saved / started / approved → **toast** (+ Undo where reversible), shown **top-center** of the screen.
- Field errors (window, schedule, target) → **inline validation**.
- Long package/group name, KB URL, path in a table → **truncate + tooltip reveal** (middle-truncate IDs).
- Kebab ⋯ / refresh / info icons → **tooltip + aria-label**; row actions → hover **and** focus/touch.
- Advanced deployment options → **progressive disclosure**.
- Agent install command / API token → **copy-to-clipboard** (+ secret show/hide for the token).
- Scan / APD / imaging running → **in-place progress**, completion → **notification/email**.
- ⓘ on an option's meaning → **tooltip** (hover + focus).

## Accessibility rules across all patterns
- Hover-triggered content also opens on **focus** and works on **touch**; never hover-only for essential info/actions.
- Icon-only controls have an **`aria-label`**; tooltips are supplemental, not the accessible name.
- Overlays (modal/popover/drawer) trap focus, close on Esc, and restore focus to the trigger.
- Never color alone for status/severity — add icon + text (see `design-cases.md`).
- Truncated text exposes the full value to assistive tech (`title`/`aria-label`).

## When adding to a design brief
For each action, message, control, and edge case, state **which** pattern and **why**, confirm it maps to an
**existing component**, and note the **hover/focus/touch** behavior for anything revealed on hover. Flag any
new-component need as an open question — never assume one.
