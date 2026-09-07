# Handoff Spec: Item list

**Figma:** *none — no source node.* Unlike the rest of the library, this component
was not exported from UEMS Design System 3.0. It was **derived from the product**:
eight hand-rolled copies of the same row shape found across shipped pages, each
with its own class prefix, its own spacing, and its own idea of what a row is.
Take it back to Figma as a component set when the pattern settles.

**Related:** `list.md` (the `<ul>`/`<ol>` marker list — a different thing entirely) ·
Theme tokens → `uems-theme-tokens.md`

---

## Overview

A stacked list of **things that happened or need attention** — activity feeds,
approval queues, search results, release notes, execution steps. Each row is three
regions: a **leading rail**, **content**, and an optional **trailing action**.

This is not `ds-list`. `ds-list` is a bulleted/numbered prose list — markers and
text. `ds-item-list` is a record list — status, metadata, and an action per row.
They share no anatomy, and neither replaces the other.

### The evidence — six shapes

Audited 2026-09-06 by reading every call site, not by pattern-matching class names.
Counts are files carrying the markup, excluding `docs/` and build output.
**Re-counted 2026-09-07 during the migration; three rows below were wrong and are
corrected in place.**

| Call site | Class | Files | Rail | Notes |
|---|---|---:|---|---|
| Home dashboard — recent activity | `.hd-act-row` | 1 | tinted circle 28 | `ds-badge` + time in the meta line, `ds-text-link` trailing |
| Enrollment dashboard | `.act-row` | 1 | tinted circle **24** | **not live markup** — it exists only inside a serialized saved-dashboard JSON payload in `ec-custom-dashboard.html`. Not a migration target: that is stored data, not a call site |
| Watchlist / stat rows | `.wl-row` | 2 | rounded tile 28 | **was claimed as 16 files; it is 2** (6 occurrences). Trailing is a **static value** or a `ds-badge` — not an action. Per-row icon colour is set inline from data |
| Pending updates | `.pu-item` | 1 | rounded tile **34** | badge **above** the title, inline link in the body, grouped under `.pu-ghead` date headers. Tints are *categories* (platform/performance/feature), not our five statuses |
| ~~App search results~~ | `.as-row` | **0** | — | **does not exist.** No file in `projects/` or `Layout/views` carries this class; the original audit invented it |
| Global search results | `.srch-row` | 1 | rounded tile | `<mark>` highlighting; trailing is a static value **or** a `ds-badge`; grouped under `.srch-sec__head` |
| Execution timeline | `.tl-node` | 2 | dot + connector | 32px indent, `::before` line. Body text can be **monospace** command output |

**`.rm-row` is not on this list.** The original table claimed it was "release/module
notes"; it is actually a rail-popover **link row** — a `ds-text-link` and an external-link
icon at `justify-content: space-between`, with no title/meta/description anatomy. It is a
link list, not a record list, and is out of scope for this component.

See "Migration coverage" below for what this component does and does not yet express.

## Migration coverage

What the component expresses today, per call site. **Slot** = works when you author
`<ds-item>` markup; **data** = works from the `items` array, which is what these call
sites actually use.

| Call site | Covered | Blocked on |
|---|---|---|
| `.hd-act-row` | **MIGRATED** | — |
| `.tl-node` | **MIGRATED** | — |
| `.edition__item` | **MIGRATED** | — (tile normalised to the DS 28px neutral box) |
| `.act-row` | n/a | serialized JSON data, not markup |
| `.wl-row` | **MIGRATED** | — |
| `.pu-item` | **MIGRATED** | — |
| `.srch-row` | **MIGRATED** | — |
| `.hd-lib-row` | **MIGRATED** | — |
| `.sup-upg__item` | **MIGRATED** | — |
| `.as-row` | n/a | does not exist |

### Migrated (2026-09-07)

| Was | Now | Where |
|---|---|---|
| `.tl-node` ×6 rows | `variant="timeline"` `timeline-marker="dot"`, `output` + `mono` | `projects/deployments/layout-deployment-device.html` |
| `.hd-act-row` ×9 rows | `size="small" divider="dashed"`, `lead="circle"` + `status`, `badge` + `meta`, `action` | `projects/screens/home-dashboard.html` |
| `.edition__item` ×3 rows | `lead="box"`, `text` + `description` | `projects/screens/osd-cloud-storage.html` |
| `.wl-row` ×3 lists (18 rows) | `lead="box"` + `status`, `trailing` value **or** `{ badge }`, `href` | `Layout/views/layout-module-dashboard.html` |
| `.wl-row` ×1 list (5 rows) | same, chip-only trailing | `projects/bitlocker/layout-summary-dashboard.html` |
| `.pu-item` ×3 groups (6 rows) | `tone` per category, `metaPosition: 'above'`, `description`, inline `link` | `Layout/views/updates.html` |
| `.srch-row` ×4 lists | `match` highlighting, `lead="box"`, `trailing` value **or** chip | `Layout/views/search.html` |
| `.hd-lib-row` ×6 rows | `framed`, `action` + `ds-item-action` | `projects/screens/home-dashboard.html` |
| `.sup-upg__item` ×12 rows | `href` title, `trailing` chip, `meta`, error note via `rest` | `Layout/views/support.html` |

**Every audited call site is now on the component.**

Two things learned doing it, both worth knowing before the next call site:

- **A row's disc tint and its badge state are independent.** Recent Activity pairs a
  green "enrolled" disc with a grey `macOS` platform chip, so those rows name
  `badge.state` explicitly instead of letting it follow `status`. Had they relied on
  the `status`→badge mapping, three of nine chips would have changed colour.
- **`items` is a property, not an attribute, so it does not survive `cloneNode`.**
  Home dashboard's Edit Layout duplicates a widget by cloning its card; the cloned
  list came back empty until the handler re-seeded `items` from the source (and
  dropped the duplicated `id`). Any page that clones markup containing a
  `ds-item-list` has to do the same.
- **`.wl-row` was hiding hardcoded colour.** Its rail tint was raw hex set inline
  from data — and the hex *was* the token value, so `lead="box"` + `status` renders
  five of the six tiles pixel-identical (`#EAF0FC`, `#E7F3ED`, `#FDEBEB` all match
  exactly) while deleting eight hardcoded colours from two views. The sixth,
  "Under Licensed", was `#FEF8EB` = `--uems-bg-alert-primary`; with no `alert`
  status it takes `warning` (`#FFEEE5`), a deliberate and visible hue shift.
- **Migrating found three badges rendering the wrong colour.** The BitLocker view
  asked for `state="warning"`, which `ds-badge` does not have — it warned once
  (deduped) and silently painted three chips grey: "In progress", "Prereq failed",
  "Pending reboot". `important` is its warning-coloured state. Same mistake class
  as the three visual-regression tests; worth grepping for on any new call site.
- **A fourth wrong-coloured badge, same mistake.** `.srch-row`'s device data used
  `tone: 'warning'` for the badge state — grey again. That is now four instances of
  `warning`-instead-of-`important` found by migrating. Grep for it.
- **`.hd-lib-row` had no padding at all.** It asked for `var(--spacing-10)` for both
  `gap` and `padding`, and that token does not exist, so the whole padding shorthand
  was invalid and the rows rendered flush. Exactly the failure this component's own
  `.ds-item` comment warns about. Migrating fixed it, which is why those rows now
  look roomier — that is the bug going away, not a design change.
- **`.srch-row` was fake-clickable.** `cursor: pointer` and a hover wash, with **no
  click handler anywhere**. The component refuses row-level click by design, so the
  pointer went with it and the row lost nothing real. Six identical "Add" buttons in
  `.hd-lib-row` also gained distinct accessible names ("Add — Agent Version"), which
  the component derives from the row text.

### Closed

- **Trailing static value or badge, from data** — `trailing: '412' | { text } | { badge }`.
  A value, not a control: no focus stop, no accessible name, no pointer. This unblocked
  `.wl-row` and `.srch-row`'s trailing column.
- **A tintable `box` rail** (2026-09-07) — `circle` and `box` now share one `status` tint
  ladder, so shape and colour are independent choices and a tinted rounded tile no longer
  means hand-rolling one. `box` keeps its own darker default icon rather than joining the
  ladder at `default`, so the change is purely additive: nothing already on a page moved.
  It also corrected two of this component's *own* docs demos, which passed
  `lead: 'box', status: 'critical'` and had been silently rendering grey.
- **`ds-badge` shape passthrough** (2026-09-07) — `badge: { shape: 'rounded' }` reaches
  `ds-badge`. Omit it and `ds-badge` keeps its own `pill` default, which is why `.wl-row`'s
  `shape="pill"` never actually needed this — an earlier note here claiming otherwise was
  wrong. `.pu-item` and `.sup-upg__item` are the real callers.
- **Rail `tone`, separate from row `status`** (2026-09-07) — `tone` colours only the
  leading tile; `status` keeps driving the badge state and the timeline dot. Tone
  defaults to status, so no existing row moved.

  This is the distinction `.pu-item` needed: it tints by *category*
  (platform/performance/feature/security/integration/fix) on rows that have no state
  at all. Folding those into `STATUSES` would have made `status` lie to the badge it
  drives — a "Security" release note would have claimed a critical state.

  The vocabulary follows the one the system already had for this exact job,
  `ds-fullscreen-modal`'s `leading-tone` (`info`/`warning`/`success`/`brand`), plus
  `alert` and `critical` so it is a superset of the statuses it falls back to.
  `alert` and `brand` are the two tints the status ladder never had.

  Note `brand` and `info` share a background in the LIGHT theme —
  `--uems-bg-accent-primary` and `--uems-bg-info-primary` are both `--cobalt-25` —
  and are told apart by the glyph colour. The hand-rolled `.pu-item` had the identical
  collision (both `--cobalt-50`), so this is inherited from the token system, not
  introduced here.
- **`match` — search-match highlighting** (2026-09-07) — `match: 'query'` marks the
  first case-insensitive hit in `text` and `description`. The `<mark>` is built as a
  DOM node around a slice of `textContent`, never an HTML sink; that is precisely why
  `.srch-row`'s own `highlight()` could not be lifted in — it returned markup, and
  these strings are device names off an API. Server-supplied offsets, or marking every
  occurrence, would be a superset and can be added without touching call sites.
- **`framed` — bordered rows** (2026-09-07) — each row becomes its own tile with a
  border and radius, for `.hd-lib-row`'s widget picker. The frame replaces the
  divider (drawing both would double the rule where two rows meet), so `divider` is
  forced to `none` while framed. Naming follows `ds-content [framed]` and
  `ds-popover header-style="framed"`.
- **Monospace output** — `output: '…'` renders a `pre-wrap` block (newlines and alignment
  are the content), and `mono: true` switches it to the monospace stack, matching `.tl-out`.
- **Inline body link** — `link: 'Read more'` puts a continuation link at the end of the
  body (`.pu-item__more`), where the text it continues ends. The trailing column stays
  reserved for acting *on* the row, so a row can carry both.

### Still open

1. ~~**Search-match highlighting.**~~ **Closed** — see `match` under Closed.
2. ~~**Group headers.**~~ **Not a component gap after all.** Both `.pu-item` (date
   headers) and `.srch-row` (section headers) migrated with **one list per group** and the
   header between them. A group header is page chrome, not a row, so it stays with the
   page; the component still renders a flat list and needs no grouping layer. It remains
   the trigger for splitting `timeline` out only if a timeline ever needs *collapsible*
   date ranges, which is a different requirement.
3. ~~**Category tints that are not statuses.**~~ **Closed** — see `tone` under Closed.

Gap 1 needs a design decision, gap 2 is a new structural layer, and gap 3 is a
data-mapping exercise per call site.

## Variants

| Axis | Values | Default |
|---|---|---|
| `variant` | `default`, `timeline` | `default` |
| `timeline-marker` | `dot`, `icon` | `dot` |
| `divider` | `none`, `line`, `dashed` | `none` |
| `size` | `small`, `medium` | `medium` |
| `rtl` | boolean | off |

### The timeline marker

`timeline-marker` picks what sits on the connector:

| Value | Marker | Indent | Use it when |
|---|---|---:|---|
| `dot` (default) | 14px dot, tinted by `status` | 32px | the steps are uniform — position and colour carry everything |
| `icon` | 28px status-tinted disc holding the row's `icon` | 40px | each step is a *different kind* of event, and the glyph says which |

It is a **container** choice, not per-item. The connector has to meet every marker
it passes, so they must share a width — mixing 14px dots and 28px discs down one
list leaves the line missing its anchors.

`icon` reuses the `circle` rail rather than defining a second tinted marker, so the
status colours are literally the same rules the default variant uses and cannot
drift. Every geometry value — indent, marker box, vertical centring, both connector
ends — derives from one `--_il-marker-size`, so the two modes cannot desync.

A row with no `icon` under `marker="icon"` renders an empty tinted disc; give every
row an icon when you choose this marker.

### Why timeline is a variant and not its own component

The DOM is identical. `.tl-node` differs from `.hd-act-row` by an indent, a dot in
place of an icon, and a connector line — a **skin on the leading rail**, nothing
more. A separate component would duplicate the content and trailing regions to
change the rail.

**Split it out** the day timeline needs any of these, because each one changes the
anatomy rather than the skin:

- timestamps on the opposite rail (two-column axis)
- date-group headers between rows
- collapsible ranges ("12 more events")
- a horizontal axis

## Per-item properties

| Property | Type | Default | Notes |
|---|---|---|---|
| `text` | string | — | the primary line |
| `description` | string | — | secondary line under the title |
| `icon` | icon name | — | leading glyph; presence defaults `lead` to `circle` |
| `status` | `default` `info` `success` `warning` `critical` | `default` | tints the circle rail / timeline dot |
| `lead` | `circle` `plain` `box` `dot` `none` | derived | `circle` if `icon` is set, else `none` |
| `meta` | string | — | actor · timestamp strip |
| `badge` | string \| object | — | a status chip in the meta strip — **always a real `ds-badge`**; `'Security'` or `{ text, state, variant, icon }` |
| `meta-position` | `below`, `above` | `below` | `above` reproduces `.pu-item` |
| `href` | string | — | renders the primary line as a real `<a>` |
| `value` | string | — | echoed on `data-value` and in the event detail |
| `trailing` | string \| number \| object | — | a **value**, not a control: `'412'`, `{ text }`, or `{ badge }`. Renders left of `action` |
| `link` | string \| object | — | inline continuation link at the **end of the body** — `'Read more'` or `{ text, href, icon }`. Not a row action |
| `output` | string | — | a `pre-wrap` block under the description — script/command output |
| `mono` | boolean | off | renders `output` in the monospace stack |
| `disabled` | boolean | off | dims the row, disables the trailing control |

A chip's **size is positional**: `small` in the meta strip, where it is an aside
among 12px text, and `medium` in the trailing column, where it stands in for the
row's value (matching `.wl-row`). Pass `{ size }` to override.

Status chips are never hand-tinted here: `badge` renders a `ds-badge`, and its
state is derived from the row's `status` unless you name one —
`info → active`, `warning → important`, `success`/`critical`/`default` pass through.
(Declaratively, slot a `ds-badge` into `meta` instead.)

Slots: `leading`, `meta`, `trailing`. Anything unslotted becomes free-form body
content (this is how `.pu-item`'s inline link survives).

## Layout

```
┌────────────────────────────────────────────────────────────┐
│ ( ! )  23 devices pending enrollment            [Approve]  │  ← rail · content · trailing
│        Security · 3 mins ago                               │
└────────────────────────────────────────────────────────────┘
   28px   flex:1, min-width:0                       auto

timeline:
   ●──   Deployment created                          10:02 AM
   │     Package distributed to 412 devices          10:14 AM
   ●──   9 devices failed                            10:31 AM
```

| | Small | Medium |
|---|---|---|
| Row padding | `--spacing-6` block | `--spacing-12` block |
| Rail → content gap | `--spacing-8` | `--spacing-12` |
| Title | `--font-size-13` | `--font-size-14` (line-height `--line-height-normal`) |
| Description / meta | `--font-size-12` | `--font-size-12` |
| Circle + box rail | 28×28 | 28×28 |
| Timeline dot | 14×14 | 14×14 |
| Timeline indent | `--spacing-32` | `--spacing-32` |

## Design tokens used

| Region | Token |
|---|---|
| Row hover / focus-within | `--uems-bg-primary-hover` |
| Divider | `--uems-border-tertiary` |
| Title | `--uems-text-primary` |
| Title (as link) | `--uems-text-accent-link` |
| Description | `--uems-text-tertiary` |
| Meta strip | `--uems-text-quaternary` |
| Box rail | `--uems-bg-secondary` + `--uems-icon-secondary` |
| Circle rail — status | `--uems-bg-{info,success,warning,error}-primary` + `--uems-text-{info,success,warning,error}` |
| Timeline dot — status | `--uems-bg-{tertiary,info,success,warning,error}-solid` |
| Dot halo | `--uems-bg-primary` (punches the connector) |

No hardcoded values. The 2px connector width and the 3px dot halo are the two
literals — both are hairline geometry with no token on the scale.

## States and interactions

**The row is not a click target.** This is the load-bearing decision in the
component, and it is deliberate:

- no `cursor: pointer` on the row
- no `tabindex` on the row
- no selection model — bulk-select is `ds-data-table`'s job, and half a selection
  model is worse than none

Row hover (and `:focus-within`) exists to say *"this action belongs to this row"* —
association, not affordance. `:focus-within` is what gives a keyboard user tabbing
to the trailing control the same grouping a mouse user gets for free.

The trailing control must be a **real `<a>` or `<button>`** (inside `ds-text-link`
/ `ds-button` / `ds-icon-button`). The component names it with its subject —
`aria-label="Approve — 23 devices pending enrollment"` — because "Approve" alone is
meaningless in a screen reader's list of controls, where rows give no context.

Timeline rows carry no hover wash at all: a timeline row is a record, not a target.

## Responsive behavior

| Constraint | Behavior |
|---|---|
| Narrow | Content is `flex:1; min-width:0`; long device names break via `overflow-wrap: anywhere` |
| Very narrow | The meta strip wraps rather than truncating — the timestamp is usually the point |
| Long descriptions | Trailing control is top-aligned, so it stays put as text wraps |

## Edge cases

- **No title** — the row still renders; description and meta carry it.
- **Icon with `lead="none"`** — the rail is dropped, the icon is ignored. Explicit beats inferred.
- **`divider` + `timeline`** — the variant wins and forces `divider-none`; the connector already separates rows, and a rule on top reads as a second, competing line.
- **Mixed `lead` in a timeline** — ignored, every row uses `dot`: the connector needs one fixed anchor.
- **Late children** — `<ds-item>` inserted after upgrade (frameworks do this) is merged via `watchLateChildren`.
- **Attribute change** — repaints the class list only; slotted trailing controls are never re-parsed, so their listeners survive.

## Accessibility

| Concern | Guidance |
|---|---|
| Semantics | `role="list"` / `role="listitem"` on the rendered rows |
| Leading rail | `aria-hidden` — the glyph restates the text |
| Status | Never carried by colour alone; the text or a badge carries it |
| Trailing control | Real link/button, auto-labelled with the row subject |
| Focus | Only the trailing control is focusable; the row is not |
| Contrast | Verified in all six themes (light, dark, night, green-light, green-dark, green-night) |

## Developer handoff (`ds-item-list` — this codebase)

```html
<ds-item-list divider="line">
  <ds-item icon="exclamation-circle" status="critical"
           text="23 devices pending enrollment"
           meta="Security · 3 mins ago">
    <ds-text-link slot="trailing" href="#">Approve</ds-text-link>
  </ds-item>
</ds-item-list>
```

Or from data:

```js
list.items = [
  { text: '23 devices pending enrollment', icon: 'exclamation-circle',
    status: 'critical', meta: 'Security · 3 mins ago' },
];
```

Event: `ds-item-action` → `{ actionId, value, item }`.

---

*Derived from eight product call sites, 2026-09-06. No Figma source node — see Overview.*
