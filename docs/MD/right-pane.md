# Right Pane

The Right Pane is a fixed **48 px-wide vertical rail** anchored to the right edge of an application layout. It holds two stacks of icon buttons — a **Top Section** for primary utilities (Ask ZIA, Help, Help Videos, Road Map, SDP) and a **Bottom Section** for supporting actions (Announcement, Accessibility, Tickets, Chat, theme toggle). A flexible spacer between the two sections keeps them anchored to the top and bottom as the rail grows vertically.

**Figma source:** [UEMS Design System 3.0 — Right Pane](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16359-74562)
**Component node:** `16359:74562` (Right Pane — single component, not a variant set)
**Last updated:** 2026-04-19

---

## Anatomy

```
┌──┐  ← 48 px wide, full viewport height
│⊕ │  Ask ZIA
│  │
│? │  Help
│  │
│▷ │  Help Videos
│  │
│⇋ │  Road Map
│  │
│☐ │  SDP
│  │
│  │  ← flex spacer (pushes bottom section down)
│  │
│  │
│☾ │  Dark Theme  (or ☼ Light Theme)
│  │
│📣│  Announcement
│  │
│♿│  Accessibility
│  │
│🎟│  Tickets
│  │
│💬│  Chat
└──┘
```

| Part | Description |
|---|---|
| **Container** | 48 px fixed width, fills the viewport height vertically, `BG-Base-White`, 1 px left border (`Border-Secondary`). |
| **Top Section** | Vertical stack of up to 5 primary icon buttons, anchored to the top of the rail. |
| **Spacer** | Flexible fill frame between the two sections — expands to push the bottom section down. |
| **Bottom Section** | Vertical stack of up to 13 utility icon buttons (5 fixed + 8 "Other" slots + theme toggle), anchored to the bottom of the rail. |
| **Icon Button** | Each slot is an instance of `Icon Button` — `Tertiary`, `Square`, `Large` (24 × 24 icon in a 24 × 24 button). Supports hover, focus, and active states. |

---

## Sections & Icon Slots

### Top Section — primary utilities

| Slot | Boolean prop | Default | Typical icon | Purpose |
|---|---|---|---|---|
| 1 | `showAskZIA` | `true` | Zia / AI prompt | Launch the Zia AI assistant |
| 2 | `showHelp` | `true` | Question mark | Open the in-app help centre |
| 3 | `showHelpVideos` | `true` | Play button | Open help-video library |
| 4 | `showRoadMap` | `true` | Branching / share | Open the product roadmap |
| 5 | `showSDP` | `true` | ServiceDesk Plus logo | Jump to SDP cross-sell / quick-access |

### Bottom Section — supporting actions

| Slot | Boolean prop | Default | Typical icon | Purpose |
|---|---|---|---|---|
| 1 | `showDarkTheme` | `true` | Moon | Toggle to dark theme |
| 2 | `showLightTheme` | `false` | Sun | Toggle to light theme (alternate of slot 1 — only one visible at a time) |
| 3 | `showAnnouncement` | `true` | Megaphone | Show product announcements / what's new |
| 4 | `showAccessibility` | `true` | Accessibility glyph | Accessibility settings / statement |
| 5 | `showTickets` | `true` | Ticket | Create or view support tickets |
| 6 | `showChat` | `true` | Chat bubble | Launch live chat / support conversation |
| 7–14 | `showOther1` … `showOther8` | `false` | User-supplied | Product-specific extension slots. Use `otherNSwap` to inject a custom `Icon Button`. |

> **Note:** `showDarkTheme` and `showLightTheme` are mutually exclusive — surface one at a time based on the active theme. All `Other N` slots are hidden by default.

---

## Props / API

### Right Pane

| Prop | Type | Default | Description |
|---|---|---|---|
| `showAskZIA` | `boolean` | `true` | Show the Zia AI assistant launcher in the top section. |
| `showHelp` | `boolean` | `true` | Show the help-centre launcher. |
| `showHelpVideos` | `boolean` | `true` | Show the help-videos launcher. |
| `showRoadMap` | `boolean` | `true` | Show the product-roadmap launcher. |
| `showSDP` | `boolean` | `true` | Show the ServiceDesk Plus quick-access icon. |
| `showDarkTheme` | `boolean` | `true` | Show the dark-theme toggle. Set to `false` and flip `showLightTheme` to render the sun icon instead. |
| `showLightTheme` | `boolean` | `false` | Show the light-theme toggle (alternate of `showDarkTheme`). |
| `showAnnouncement` | `boolean` | `true` | Show the announcement icon. |
| `showAccessibility` | `boolean` | `true` | Show the accessibility icon. |
| `showTickets` | `boolean` | `true` | Show the tickets icon. |
| `showChat` | `boolean` | `true` | Show the chat icon. |
| `showOther1` … `showOther8` | `boolean` | `false` | Product-specific extension slots. |
| `askZiaSwap` | `ReactNode` | Icon Button | Instance-swap slot for the Ask ZIA icon button. |
| `helpSwap` | `ReactNode` | Icon Button | Instance-swap slot for the Help icon button. |
| `helpVideosSwap` | `ReactNode` | Icon Button | Instance-swap slot for the Help Videos icon button. |
| `roadMapSwap` | `ReactNode` | Icon Button | Instance-swap slot for the Road Map icon button. |
| `sdpSwap` | `ReactNode` | Icon Button | Instance-swap slot for the SDP icon button. |
| `darkThemeSwap` / `lightThemeSwap` | `ReactNode` | Icon Button | Instance-swap slots for theme toggle icon buttons. |
| `announcementSwap` | `ReactNode` | Icon Button | Instance-swap slot for the Announcement icon button. |
| `accessibilitySwap` | `ReactNode` | Icon Button | Instance-swap slot for the Accessibility icon button. |
| `ticketsSwap` | `ReactNode` | Icon Button | Instance-swap slot for the Tickets icon button. |
| `chatSwap` | `ReactNode` | Icon Button | Instance-swap slot for the Chat icon button. |
| `other1Swap` … `other8Swap` | `ReactNode` | Icon Button | Instance-swap slots for each extension slot. |
| `onThemeToggle` | `() => void` | — | Fires when the theme icon is activated. |

Each icon button also forwards the standard [Icon Button](./icon-button.md) props (`onClick`, `tooltip`, `aria-label`) through its instance.

---

## Design Tokens

### Colour

| Token | Role |
|---|---|
| `Background/BG-Base-White` | Rail background |
| `Border/Border-Secondary` | Left border separating the rail from the app canvas |
| `Border/Icon/Icon-Tertiary` | Default icon colour (inherited from Icon Button — Tertiary) |
| `Border/Icon/Icon-Primary` | Icon colour when the button is active / selected |
| `Background/BG-Hover` | Icon-button hover background |
| `Shadow/Shadow-Focus-Blue` | Focus ring on keyboard focus (Icon Button default) |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing/12` | 12 px | Rail horizontal padding (left / right inside the 48 px rail) |
| `spacing/16` | 16 px | Vertical gap between adjacent icon buttons |
| `spacing/20` | 20 px | Rail vertical padding (top and bottom) |

### Layout

| Property | Value |
|---|---|
| Rail width | **48 px** (fixed) |
| Rail height | **Fill container** (full viewport height) |
| Left border | 1 px, `Border-Secondary` |
| Horizontal padding | 12 px |
| Vertical padding | 20 px |
| Icon button size | 24 × 24 px (inside a 48 − 2×12 = 24 px column) |
| Icon-button spacing | 16 px |
| Top / Bottom section alignment | Top section: top-anchored · Bottom section: bottom-anchored · Spacer fills remainder |

---

## Usage

### When to use

- As a **persistent right-hand rail** in an application shell that exposes always-available utilities (AI assistant, help, support, theme, announcements).
- When primary product navigation lives in the left sidebar and secondary / contextual affordances belong on the right.
- When you need a **dense, low-chrome** entry point for utilities — each icon opens a panel, popover, modal, or external destination.

### When not to use

- For **primary navigation** between major app sections → use [Left Sidebar Navigation (Level 1)](./left-sidebar-navigation-level-1.md).
- For **contextual actions** tied to a selected record → use an inline action bar or [Split Button](./split-button.md).
- When the viewport is below ~768 px wide (tablet portrait and narrower) — hide the rail and move its items into a help menu in the [Header Navigation](./header-navigation.md) instead.
- For **rich content panes** (comments, activity, details) → use a collapsible right drawer anchored to this rail, not the rail itself.

### Do / Don't

| Do | Don't |
|---|---|
| Keep the rail at 48 px wide — it is a design-system constant | Widen the rail to accommodate labels; use tooltips instead |
| Show a tooltip on hover/focus for every icon ("Help", "Tickets", etc.) | Rely on icons alone — un-labelled icons fail accessibility |
| Cap the top section at 5 icons and the bottom section at ~6 visible icons | Stack more than 6–7 icons per section — the rail becomes noisy and the flex spacer shrinks |
| Swap `showDarkTheme` ⇄ `showLightTheme` to reflect the current theme | Show both theme icons at the same time |
| Use the `Other 1–8` slots for genuinely product-specific utilities | Repurpose the named slots (Help, Tickets, Chat) for unrelated actions |
| Open content in an overlay, popover, or external destination — never navigate away in-place | Treat rail icons as navigation tabs that replace the main canvas |
| Keep icon-button state (`active`) in sync with the currently open panel | Leave all icons inactive when an associated panel is open |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Landmark role** | Wrap the rail in `<nav aria-label="Utilities">` or `<aside aria-label="Utilities">` so it appears as a landmark in screen-reader rotor lists. |
| **Icon-only buttons** | Every icon button must expose an `aria-label` matching its tooltip text (e.g. `aria-label="Help"`). Do not rely on the tooltip alone. |
| **Tooltips** | Tooltips appear on hover and keyboard focus, positioned to the **left** of the rail. Use the design system's [Tooltip](./tooltip.md). |
| **Keyboard order** | `Tab` moves top-to-bottom through visible icon buttons (top section first, then bottom). `Shift+Tab` reverses. |
| **Active state** | When a panel triggered by the rail is open, set `aria-expanded="true"` (for popovers) or `aria-pressed="true"` (for toggles like theme) on the icon button. |
| **Focus ring** | Use the Icon Button focus ring (blue, 2 px) — do not remove it. The rail's white background makes the ring clearly visible. |
| **Contrast** | Icon glyphs at `Icon-Tertiary` must meet WCAG AA 3:1 contrast against `BG-Base-White`. Active glyphs at `Icon-Primary` should meet 4.5:1. |
| **Theme toggle** | Announce the resulting state (`"Switch to light theme"` / `"Switch to dark theme"`) in the `aria-label`, not the current state. |
| **RTL** | In RTL layouts, the rail swaps to the **left** edge and the border moves to the right side. Tooltips anchor to the right of the rail. |
| **Responsive** | Below ~768 px viewport width, hide the rail and surface its contents in a help menu within [Header Navigation](./header-navigation.md). |

---

## Code Examples

### Default — all core icons visible

```tsx
<RightPane />
```

### Minimal — only Help and Chat

```tsx
<RightPane
  showAskZIA={false}
  showHelpVideos={false}
  showRoadMap={false}
  showSDP={false}
  showAnnouncement={false}
  showAccessibility={false}
  showTickets={false}
/>
```

### Light-theme toggle visible

```tsx
<RightPane
  showDarkTheme={false}
  showLightTheme
  onThemeToggle={() => setTheme('dark')}
/>
```

### With a product-specific extension slot

```tsx
<RightPane
  showOther1
  other1Swap={<IconButton icon={<ShortcutIcon />} aria-label="Keyboard shortcuts" onClick={openShortcuts} />}
/>
```

### Active state (a panel is open)

```tsx
<RightPane
  helpSwap={<IconButton icon={<HelpIcon />} aria-label="Help" aria-expanded={isHelpOpen} state={isHelpOpen ? 'active' : 'default'} onClick={toggleHelp} />}
/>
```

### App-shell placement

```tsx
<div className="app-shell">
  <LeftSidebarNavigation />
  <main className="app-main">{children}</main>
  <RightPane />
</div>
```

```css
.app-shell { display: grid; grid-template-columns: auto 1fr 48px; min-height: 100vh; }
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Left Sidebar Navigation (Level 1)](./left-sidebar-navigation-level-1.md) | Primary app navigation between major sections |
| [Header Navigation](./header-navigation.md) | Top-of-page global actions, search, profile menu |
| [Icon Button](./icon-button.md) | Individual icon-button primitive used inside the rail |
| [Tooltip](./tooltip.md) | Labelling the rail's icon-only buttons on hover/focus |
