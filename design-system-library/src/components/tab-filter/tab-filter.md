---
name: Tab Filter
description: Segmented filter control that lets the user pick one option from a small, mutually-exclusive set — sits in a tinted track with the active option raised as a white card.
type: component
status: stable
category: Navigation
figma:
  file: UEMS – Design System 3.0
  fileKey: DahIgbIJrSkzyP3OoHaDaG
  nodeId: "18679:331531"
variants:
  axes:
    - { name: Count, values: ["2","3","4","5","7"] }
    - { name: RTL,   values: [False, True] }
  total: 10
---

# Tab Filter

A compact segmented filter that sits in a tinted track. One option is always selected; the active option lifts to a white "card" on top of the track. Use Tab Filter to slice a single dataset by a small set of mutually-exclusive choices — All / Open / Closed, Day / Week / Month, List / Grid.

| Meta | Value |
|------|-------|
| Container width | hug |
| Container height | 40px |
| Default | `Count=2, RTL=False` |
| Inner option | 36px tall, 8px padding, 6px radius |

---

## Web Component API

```html
<ds-tab-filter value="open" rtl aria-label="Filter status"></ds-tab-filter>
```

```js
el.options = [
  { value: 'all',    label: 'All',    badge: 99 },
  { value: 'open',   label: 'Open',   badge: 12 },
  { value: 'closed', label: 'Closed', badge: 7 },
];
```

### Option shape

| Property | Type | Notes |
|----------|------|-------|
| `value` | `string` | Required. Used as the selected key. |
| `label` | `string` | Required. |
| `labelRtl` | `string` | Optional override used when `rtl` is set. |
| `icon` | `string` | Optional 20px icon name. |
| `badge` | `string \| number \| false` | Optional badge content (numeric counters preferred). |
| `disabled` | `boolean` | Skipped by keyboard navigation. |

### Boolean attribute defaults

| Attribute | Default |
|-----------|---------|
| `rtl` | `false` |
| `disabled` | `false` (whole-control disable) |

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-tab-filter-change` | `{ value, option }` | Selection changes via click or keyboard. Commits immediately on `←/→`. |

---

## Anatomy

```
LTR
┌────────────────────────────────────────────────────────┐  ← container
│ ┌──────────────┐                                       │    (--bg-tertiary track,
│ │ ● Active  12 │   ● Default 12   ● Default            │     6px radius, 2px pad, 4px gap)
│ └──────────────┘                                       │
└────────────────────────────────────────────────────────┘
       ▲
   Active = white surface + 1px subtle border + 6px radius (the "card")
```

Per option:

```
┌──────────────────────────────────┐
│  [Icon 20]  Label   Badge        │   ← 36px tall, 8px padding, 8px gap
└──────────────────────────────────┘
```

---

## Per-state Color

| State | Background | Border | Label / Icon |
|-------|-----------|--------|--------------|
| Default | transparent | none | `--text-tertiary` (subtle) |
| Hover | `--bg-secondary-hover` | none | `--text-primary` |
| Focus | unchanged | unchanged | unchanged + 2px `--border-accent-focus` outer ring at 2px offset |
| **Active** | `--bg-base` (white) | 1px `--border-tertiary` | `--text-primary` (Medium weight) |
| Disabled | transparent | none | 38% opacity, `cursor: not-allowed` |

The active state is what makes Tab Filter feel like a "card on track": white surface + subtle border + same 6px radius as the container.

---

## Tab Filter vs Tab Bar Horizontal — quick decision

| | Tab Filter | Tab Bar Horizontal |
|---|------------|---------------------|
| Purpose | Filter one dataset | Switch between sections of content |
| Has track background? | Yes (tinted) | No |
| Active treatment | White card on grey track | Soft-blue pill (Fill) or 2px underline |
| Default selection | Always one | Always one (a tab) |
| URL pattern | Query param (`?status=open`) | Path or tab param (`?tab=members`) |
| Max options | 7 | 10 |
| Effect | Re-queries the same data | Loads peer-level different content |

---

## Accessibility

| Concern | Implementation |
|---------|---------------|
| **Role** | Wrapper: `role="radiogroup"`. Each option: `role="radio"` with `aria-checked` reflecting selection. |
| **Labels** | The radiogroup needs an accessible name — pass `aria-label` ("Filter status") or `aria-labelledby` pointing at a visible heading. |
| **Active state** | Active option: `aria-checked="true"`, `tabindex="0"`. All others: `aria-checked="false"`, `tabindex="-1"` (roving tabindex). |
| **Keyboard** | `←/→` move and **commit** selection (RTL flips). `Home`/`End` jump to first/last. `Enter`/`Space` re-commit (no-op if already selected). `↑/↓` are no-ops. |
| **Color contrast** | Active label on white ≥ 12:1. Default label `--text-tertiary` on the tinted track ≥ 7:1. |
| **Indicator** | Selection conveyed by **two channels** — surface (white card) and weight (Medium vs Regular). Don't rely on color alone. |
| **Touch target** | Each option 36px tall. Pad surrounding container to ≥ 44px effective hit area on touch surfaces. |
| **RTL** | Set `rtl` to mirror order and arrow-key behavior. |
| **Reduced motion** | Transitions disabled under `prefers-reduced-motion: reduce`. |

---

## Usage Guidelines

### Do
- Always have one option selected — pick a sensible default like "All".
- Keep labels parallel — same part of speech, similar length, ≤ 12 characters.
- Reflect the selected filter in the URL (`?status=open`) so deep links and browser-back work.
- Place the most general option ("All") on the leading edge.
- Use a numeric badge to show result size (`Open · 12`).

### Don't
- Don't render Tab Filter without an active option.
- Don't use it for switching between *destinations* — use `<ds-tab-bar-horizontal>` for that.
- Don't allow more than 7 options. If you have more, switch to a Single Select dropdown.
- Don't use textual badges (`Open · New!`) — the badge slot is for counts.
- Don't add an Apply button — the white-card metaphor means "this is your current view," and the change must commit immediately.
- Don't put a Tab Filter on a tinted parent surface — the track depends on a neutral backdrop.

---

## Related Components

| Component | Use it for |
|-----------|-----------|
| **Tab Bar Horizontal** | Switching between sections of content (different data, not different filters of the same data). |
| **Tab Bar Vertical** | Same control, stacked vertically. |
| **Single Select** | When you have more than 7 options or labels are long. |
| **Radio Group** | Vertical layout, longer descriptions per option. |
