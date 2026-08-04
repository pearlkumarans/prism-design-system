---
name: Tab Bar Horizontal
description: Horizontal tab bar wrapper that lays out tab items in a row — used for in-page section switchers, content-level navigation, and panel tabs.
type: component
status: stable
category: Navigation
figma:
  file: UEMS – Design System 3.0
  fileKey: DahIgbIJrSkzyP3OoHaDaG
  nodeId: "18679:328076"
variants:
  axes:
    - { name: Type,  values: [Fill, Underline] }
    - { name: Count, values: ["2","3","4","5","6","7","8","9","10"] }
    - { name: RTL,   values: [False, True] }
  total: 36
---

# Tab Bar Horizontal

Horizontal tab bar wrapper that arranges tab items in a row. Use it for switching between sibling sections of content within a page or panel — never for global product navigation.

| Meta | Value |
|------|-------|
| Container width | hug (sized by inner items) |
| Container height | hug — 36px item height |
| Default | `Type=Fill, RTL=False` |
| Inner item | 36px tall, 20px icon, 8px inner gap |

## Web Component API

```html
<ds-tab-bar-horizontal
  type="fill|underline"
  active-id="overview"
  rtl
  aria-label="Page sections"></ds-tab-bar-horizontal>
```

```js
el.items = [
  { id: 'overview', label: 'Overview',  icon: 'home' },
  { id: 'activity', label: 'Activity',  icon: 'activity', badge: '12' },
  { id: 'members',  label: 'Members',   icon: 'mail-user' },
  { id: 'settings', label: 'Settings',  icon: 'file-setting', disabled: true },
];
```

### Item shape

| Property | Type | Notes |
|----------|------|-------|
| `id` | `string` | Required. Active key. |
| `label` | `string` | Required. |
| `labelRtl` | `string` | Optional override used when `rtl` is set. |
| `icon` | `string` | Optional 20px icon name. |
| `badge` | `string \| number \| false` | Optional badge content. |
| `disabled` | `boolean` | Skipped by keyboard navigation. |
| `panelId` | `string` | Optional `aria-controls` target — id of the tabpanel this tab reveals. |

### Variants

| Type | When to use |
|------|-------------|
| **Fill** *(default)* | Pills inside a 4px-padded row. Best for grouped pickers (Day / Week / Month). |
| **Underline** | Flush row sitting on a 1px container divider; active tab gets a 2px bottom bar. Best for in-page section navigation. |

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-tab-change` | `{ id, item }` | Active tab changed via click or keyboard. |

---

## Anatomy

```
LTR · Fill                                          LTR · Underline
┌──────────────────────────────────────────┐        ┌─────────┐ ┌─────────┐ ┌─────────┐
│ ┌──────────┐  Default     Default        │        │ Active  │ │ Default │ │ Default │
│ │ Active 12│                              │        │ ▔▔▔▔▔   │ │         │ │         │
│ └──────────┘                              │        └─────────┘ └─────────┘ └─────────┘
└──────────────────────────────────────────┘        ───────────────────────────────────  ← 1px divider
   pad 4 / gap 4                                       gap 16 / pad 8/4
```

Per row:

```
┌──────────────────────────────────┐
│  [Icon 20]  Label   Badge        │   ← 36px tall
└──────────────────────────────────┘
```

---

## Per-state Color

| State | Type | Background | Label / Icon | Indicator |
|-------|------|-----------|--------------|-----------|
| Default | Fill / Underline | transparent | `--text-primary` | — |
| Hover | Fill | `--bg-secondary-hover` | `--text-primary` | — |
| Hover | Underline | (cursor only) | `--text-primary` | — |
| Focus | both | unchanged | unchanged | 2px `--border-accent-focus` outer ring, 2px offset |
| Active | Fill | `--bg-accent-primary-subtle` | `--text-accent-link` (Medium) | — |
| Active | Underline | transparent | `--text-accent-link` (Medium) | 2px `--bg-button-primary` bottom bar (overlaps container divider) |
| Disabled | both | transparent | 38% opacity, `cursor: not-allowed` | — |

---

## Accessibility

| Concern | Implementation |
|---------|---------------|
| **Role** | Wrapper: `role="tablist"` with `aria-orientation="horizontal"`. Each tab: `role="tab"`. Each panel: `role="tabpanel"` with `aria-labelledby`. |
| **Active state** | Active tab: `aria-selected="true"`, `tabindex="0"`. All others: `aria-selected="false"`, `tabindex="-1"` (roving tabindex). |
| **Focus order** | The tablist is a single tab stop. Inside it, ←/→ move the active selection. |
| **Keyboard** | `←/→` move selection (RTL flips them — `→` always moves visually forward). `Home`/`End` jump to first/last. `Enter`/`Space` activate. `↑/↓` are no-ops (horizontal tablist). |
| **Color contrast** | Active label/icon (`--text-accent-link`) on Fill background ≥ 4.5:1. Default label on white ≥ 12:1. Underline 2px indicator on white ≥ 3:1 (non-text). |
| **Indicator** | Active state is conveyed by **two channels** — color and shape (Fill background or 2px bottom bar). Don't rely on color alone. |
| **Touch target** | Each tab ≥ 36px tall. Pad surrounding container to ≥ 44px effective hit area on touch. |
| **RTL** | Set `rtl` to mirror order and arrow-key behavior. |
| **Reduced motion** | Transitions disabled under `prefers-reduced-motion: reduce`. |

---

## Usage Guidelines

### Do
- Use **Fill** for grouped pickers (Day / Week / Month, List / Grid).
- Use **Underline** for in-page section navigation under a heading.
- Persist the selected tab in the URL (`?tab=members`) so deep links work.
- Use icons consistently — every tab or no tab.
- Cap labels at ~18 characters; use a Tooltip for longer hints.

### Don't
- Don't render this when `items.length < 2`.
- Don't use this for top-level product navigation.
- Don't let the bar overflow its container — switch to a scrollable tab pattern or overflow menu instead of using a wider variant.
- Don't mix textual and numeric badges in the same bar.
- Don't add icons to only some tabs.

---

## Related Components

| Component | Use it for |
|-----------|-----------|
| **Tab Bar Vertical** | Same control, stacked vertically (sidebar nav, settings panes). |
| **Sidebar L1 / L2** | Top-level product navigation. |
| **Status Indicator** | Inline status pills inside content, not navigation. |
