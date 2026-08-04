---
name: Tab Bar Vertical
description: Vertical tab bar wrapper that stacks tab items into a 200px-wide column for sidebar navigation, vertical menu pickers, and step lists.
type: component
status: stable
category: Navigation
figma:
  file: UEMS – Design System 3.0
  fileKey: DahIgbIJrSkzyP3OoHaDaG
  nodeId: "18645:314737"
variants:
  axes:
    - { name: Type,  values: [Fill, Underline] }
    - { name: Count, values: ["2","3","4","5","6","7","8","9","10"] }
    - { name: RTL,   values: [False, True] }
  total: 36
---

# Tab Bar Vertical

A vertical tab bar wrapper that stacks tab items into a fixed 200px column. Reach for it when navigation needs to live alongside the content rather than above it — settings panes, profile sections, step lists, vertical menu pickers.

| Meta | Value |
|------|-------|
| Container width | 200px (fixed) |
| Container height | hug |
| Default | `Type=Fill, RTL=False` |
| Inner item | 36px tall, 8px padding |

## Web Component API

```html
<ds-tab-bar-vertical
  type="fill|underline"
  active-id="general"
  rtl
  aria-label="Settings sections"></ds-tab-bar-vertical>
```

```js
el.items = [
  { id: 'general',  label: 'General',       icon: 'config' },
  { id: 'notify',   label: 'Notifications', icon: 'bell',   badge: '12' },
  { id: 'security', label: 'Security',      icon: 'shield' },
  { id: 'audit',    label: 'Audit logs',    icon: 'file-report', disabled: true },
];
```

### Item shape

| Property | Type | Notes |
|----------|------|-------|
| `id` | `string` | Required. Used as the active key. |
| `label` | `string` | Required. |
| `labelRtl` | `string` | Optional override used when `rtl` is set. |
| `icon` | `string` | Optional icon name (20px). |
| `badge` | `string \| number \| false` | Optional badge content. |
| `disabled` | `boolean` | Skipped by keyboard navigation. |
| `panelId` | `string` | Optional `aria-controls` target — the id of the tabpanel this row reveals. |

### Variants

| Type | When to use |
|------|-------------|
| **Fill** *(default)* | Pills inside a 4px-padded column. Best for menu pickers and grouped sub-navigation. |
| **Underline** | Flush rows with a 2px leading-edge bar on the active row. Best for sidebar navigation. |

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-tab-change` | `{ id, item }` | Active row changed via click or keyboard. |

### Boolean attribute defaults

| Attribute | Default |
|-----------|---------|
| `rtl` | `false` |

---

## Anatomy

```
LTR · Fill                       LTR · Underline
┌───────────────────────┐         ┌───────────────────────┐
│ ┌───────────────────┐ │         ┃ ●  Active        12   │  ← 2px leading bar
│ │ ●  Active     12  │ │         │    Default            │
│ └───────────────────┘ │         │    Default            │
│   ●  Default          │         │    Disabled           │
│   ●  Default          │         └───────────────────────┘
└───────────────────────┘
container pad 4 / gap 4          container pad 0 / gap 0
```

Inside every row:

```
┌───────────────────────────────────────────┐
│  [Icon 20]   Label                Badge   │ ← 36px tall, 8px padding
└───────────────────────────────────────────┘
   ◀── 8px gap ──▶                  ▲
                                    └ optional pill
```

---

## Per-state Color (Medium)

| State | Type | Background | Label / Icon |
|-------|------|-----------|--------------|
| Default | Fill / Underline | transparent | `--text-primary` |
| Hover | Fill / Underline | `--bg-secondary-hover` | `--text-primary` |
| Focus | both | (unchanged) | 2px `--border-accent-focus` inset ring |
| Active | Fill | `--bg-accent-primary-subtle` | `--text-accent-link` (Medium weight) |
| Active | Underline | transparent + 2px leading bar `--bg-button-primary` | `--text-accent-link` (Medium weight) |
| Disabled | both | transparent | 38% opacity, `cursor: not-allowed` |

---

## Accessibility

| Concern | Implementation |
|---------|---------------|
| **Role** | Wrapper: `role="tablist"` with `aria-orientation="vertical"`. Each row: `role="tab"`. The panel each row reveals: `role="tabpanel"` with `aria-labelledby`. |
| **Active state** | Active tab: `aria-selected="true"`, `tabindex="0"`. All others: `aria-selected="false"`, `tabindex="-1"` (roving tabindex). |
| **Focus order** | The tablist is a single tab stop. Inside it, ↑/↓ move the active selection. |
| **Keyboard** | `↑/↓` move selection between rows (wraps). `Home`/`End` jump to first/last. `Enter`/`Space` activate. `←/→` are no-ops (vertical tablist). |
| **Color contrast** | Active label and icon (`--text-accent-link`) on Fill background ≥ 4.5:1. Default label on white ≥ 12:1. |
| **Indicator** | Active state is conveyed by **two channels** — color and shape (Fill background or leading bar). Don't rely on color alone. |
| **Touch target** | Each row 36px tall. Pad the parent column to ensure ≥ 44px effective hit area on touch surfaces. |
| **RTL** | Set `rtl` to mirror layout. Underline indicator and label alignment flip. |
| **Reduced motion** | Transitions disabled under `prefers-reduced-motion: reduce`. |

---

## Usage Guidelines

### Do
- Use **Underline** for sidebar nav — it reads as a list of destinations.
- Use **Fill** for grouped pickers and embedded navigation on a neutral parent surface.
- Keep labels short — 1–3 words, sentence case (≤ 18 characters).
- Use icons consistently — every row or no row.
- Persist the selected tab in the URL or query string.

### Don't
- Don't render this when `items.length < 2`. A single-tab tab bar is a styling bug.
- Don't use for more than ~10 destinations. The wrapper isn't scrollable — switch to a side navigation pattern.
- Don't use it for top-level product navigation — that belongs in the app shell sidebar.
- Don't add icons to only some rows; the bar will look misaligned.
- Don't put it on a tinted parent surface for `Fill` — the variant relies on a neutral backdrop.

---

## Related Components

| Component | Use it for |
|-----------|-----------|
| **Tab Bar Horizontal** *(future)* | Same control, laid out across the top of content. |
| **Sidebar L1 / L2** | Top-level product nav with sections, dividers, and collapse. |
| **Status Indicator** | Inline status pills inside content, not navigation. |
