# Sidebar Navigation — Level 1

A vertical icon-based sidebar navigation panel (Left Navigation Level 1) used across all UEMS product modules. Supports two display modes — expanded (icon + label) and collapsed (icon only) — with up to 8 configurable item slots and a fixed bottom action row.

**Figma source:** [UEMS — Design System 3.0](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16780-88270) · Frame `16780:88270`

---

## Overview

The Level 1 sidebar navigation is a product-specific component. Fifteen pre-configured sets are provided — one per UEMS product module. Each set shares the same structure and variant axes; only the nav item content (icons, labels) differs per product.

| Product Module | Component Set Node |
|----------------|--------------------|
| Configurations | `16779:87979` |
| Threats & Patches | `16780:88289` |
| Software Deployment | `16780:88438` |
| Inventory | `16794:88915` |
| OS Deployment | `16796:89085` |
| MDM | `16805:89241` |
| Agent | `16806:89366` |
| Tools | `16806:89494` |
| Browsers | `16807:89606` |
| Application Control | `16807:89709` |
| Malware Protection | `16809:89782` |
| Endpoint DLP | `16809:90001` |
| BitLocker Management | `16809:90097` |
| Device Control | `16809:90188` |
| DEX | `16812:90274` |

---

## Variants

Each product component set exposes one variant axis:

| Axis | Values | Description |
|------|--------|-------------|
| `Type` | `Icon with Text`, `Icon Only` | Expanded (72px wide, icon + label) vs. collapsed (44px wide, icon only) |

---

## Types

### Icon with Text

Fully expanded navigation. Each item shows a centred icon above a short text label. Item width is 72px fixed.

```
┌──────────┐
│    ●     │  ← Active item: blue rounded-square icon bg + blue icon + blue label
│ Dashboard│
├──────────┤
│    ○     │  ← Default item: outline icon, dark label
│ Threats  │
├──────────┤
│    ○     │
│ Patches  │
├──────────┤
│    ○     │
│ Systems  │
│   ...    │
├──────────┤
│   < =    │  ← Collapse toggle (Bottom Item 2)
└──────────┘
```

- Width: **72px** fixed
- Items centred horizontally
- Label sits directly below icon, wraps if needed

### Icon Only

Collapsed navigation. Labels are hidden; only icons are visible. Width drops to **44px**. Tooltips should be used to expose item names on hover.

```
┌──────┐
│  ●   │  ← Active icon (blue rounded-square bg)
├──────┤
│  ○   │
├──────┤
│  ○   │
│  ... │
├──────┤
│  <=  │  ← Collapse toggle
└──────┘
```

- Width: **44px** fixed
- All `Show Label=False` variants of Left Nav Item L1
- Bottom collapse toggle also becomes icon-only

---

## Anatomy

```
┌─────────────────────────────────────┐
│  [Item 1]   ← Slot 1 (Show/hide)    │  ┐
│  [Item 2]   ← Slot 2               │  │ Scrollable item area
│  [Item 3]                           │  │ (vertical auto-layout)
│  [Item 4]                           │  │ padding: 8px top/bottom
│  [Item 5]                           │  │ gap: 0px
│  [Item 6]                           │  │
│  [Item 7]   (hidden by default)     │  │
│  [Item 8]   (hidden by default)     │  ┘
│  ─────────────────────────────────  │
│  [Bottom Item 1]  (optional)        │  ┐ Bottom section
│  [Bottom Item 2]  = Collapse toggle │  ┘ (pinned to bottom)
└─────────────────────────────────────┘
```

### Sub-component: Left Nav Item L1

Each slot is an instance of the `Left Nav Item L1` base component (`_base_Left Nav Item L1`). The item has its own variant axis for **State**, **Show Label**, and **RTL**.

```
┌──────────────┐
│  ╭────────╮  │  ← Icon Wrap (state-based background)
│  │  Icon  │  │    24px icon, centred in wrap
│  ╰────────╯  │
│    Label     │  ← Text label (hidden when Show Label=False)
└──────────────┘
```

---

## Item States

| State | Visual description |
|-------|--------------------|
| **Default** | Outline icon in dark navy (`Text-Primary`), label in dark navy. No background on icon wrap |
| **Active** | Light blue rounded-square background on icon wrap (`BG-Accent-Subtle`), icon filled in accent blue (`#006AFF`), label in accent blue (`Text-Accent-Link`) |
| **Hover** | Subtle light gray background on icon wrap, icon and label in dark navy |
| **Disabled** | Icon and label in `Text-Disabled` (muted), not interactive |
| **Add** | Special: renders a filled blue circle with a `+` icon (Button Primary style) instead of an outline icon. Used for primary creation actions (e.g. "Add Config") |

### Active state in detail

```
┌──────────┐
│ ╭──────╮ │
│ │  ▦   │ │  ← Rounded-square bg: BG-Accent-Subtle (~#E8F0FE)
│ │(icon)│ │    Icon fill: #006AFF (Icon-Accent)
│ ╰──────╯ │
│Dashboard │  ← Label: Text-Accent-Link (#006AFF)
└──────────┘
```

---

## Component Properties

### Item slots (all product sets)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Item 1` | Boolean | `ON` | Show/hide slot 1 |
| `Item 2` | Boolean | `ON` | Show/hide slot 2 |
| `Item 3` | Boolean | `ON` | Show/hide slot 3 |
| `Item 4` | Boolean | `ON` | Show/hide slot 4 |
| `Item 5` | Boolean | `ON` | Show/hide slot 5 |
| `Item 6` | Boolean | `ON` | Show/hide slot 6 |
| `Item 7` | Boolean | `OFF` | Show/hide slot 7 (hidden by default) |
| `Item 8` | Boolean | `OFF` | Show/hide slot 8 (hidden by default) |
| `Item 1 Swap` | Instance Swap | Active state item | Swap slot 1 to any Left Nav Item L1 variant |
| `Item 2–8 Swap` | Instance Swap | Default state item | Swap slots 2–8 independently |

> **Note:** Threats & Patches and some other product sets support additional slots (Items 9–11) to accommodate longer navigation lists.

### Bottom section (all product sets)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Bottom Item 1` | Boolean | `OFF` | Optional additional bottom action (e.g. home/help) |
| `Bottom Item 1 Swap` | Instance Swap | Default state item | Swap Bottom Item 1 content |
| `Bottom Item 2` | Boolean | `ON` | The collapse/expand toggle — always visible by default |
| `Bottom Item 2 Swap` | Instance Swap | Collapse icon item | Swap Bottom Item 2 content |

### Left Nav Item L1 properties (per slot)

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `State` | Variant | `Default`, `Active`, `Hover`, `Disabled`, `Add` | Item interaction/selection state |
| `Show Label` | Variant | `True`, `False` | Whether text label is visible. Drives Icon with Text vs. Icon Only |
| `RTL` | Variant | `False`, `True` | Right-to-left layout for Arabic/Hebrew |

---

## Structure & Spacing

| Property | Value |
|----------|-------|
| Width (Icon with Text) | `72px` fixed |
| Width (Icon Only) | `44px` fixed |
| Layout | Vertical auto-layout |
| Top padding | `8px` |
| Bottom padding | `8px` |
| Item gap | `0px` (items are flush) |
| Item height (approx.) | `~64px` (icon wrap + label) |
| Icon size | `24px × 24px` |
| Icon wrap (active background) | Rounded square, `radius-8`, `~36px × 36px` |
| Height | `640px` (full sidebar height) |

---

## Design Tokens

### Item — Default state

| Element | Token | Resolves (Light mode) |
|---------|-------|----------------------|
| Icon | `Border/Icon/Icon-Primary` | `#15181E` |
| Label | `Text/Text-Primary` | `#15181E` |
| Icon wrap background | none | — |

### Item — Active state

| Element | Token | Resolves (Light mode) |
|---------|-------|----------------------|
| Icon wrap background | `Background/BG-Accent-Subtle` | `~#E8F0FE` |
| Icon | `Border/Icon/Icon-Accent` | `#006AFF` |
| Label | `Text/Text-Accent-Link` | `#006AFF` |

### Item — Hover state

| Element | Token | Resolves (Light mode) |
|---------|-------|----------------------|
| Icon wrap background | `Background/BG-Secondary-alt` | `#F0F2F5` |
| Icon | `Border/Icon/Icon-Primary` | `#15181E` |
| Label | `Text/Text-Primary` | `#15181E` |

### Item — Disabled state

| Element | Token | Resolves (Light mode) |
|---------|-------|----------------------|
| Icon | `Border/Icon/Icon-Disabled` | `#8893AD` |
| Label | `Text/Text-Disabled` | `#8893AD` |

### Item — Add state

| Element | Token | Resolves (Light mode) |
|---------|-------|----------------------|
| Circle background | `Background/BG-Button-Primary` | `#006AFF` |
| Plus icon | `Border/Icon/Icon-Inverse` | `#FFFFFF` |
| Label | `Text/Text-Primary` | `#15181E` |

### Container

| Element | Token | Resolves (Light mode) |
|---------|-------|----------------------|
| Sidebar background | `Background/BG-Base-White` | `#FFFFFF` |
| Right border (if present) | `Border/Border-Secondary` | `#C3C9D6` |

---

## Product Navigation Items Reference

Item lists below are sourced from each product's component set in Figma (UEMS — Design System 3.0). `State` reflects the default variant configuration: `Item 1` is preset to `Active` (except Configurations, where `Item 1` is the `Add` action). Consuming layouts must swap the active item to match the current page.

### Configurations
| Slot | Item | State |
|------|------|-------|
| Item 1 | Add Config | `Add` |
| Item 2 | Configurations | `Default` |
| Item 3 | Library | `Default` |
| Item 4 | Reports | `Default` |
| Item 5 | Settings | `Default` |
| Item 6 | Trash | `Default` |

### Threats & Patches
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Threats | `Default` |
| Item 3 | Patches | `Default` |
| Item 4 | Systems | `Default` |
| Item 5 | Deployment | `Default` |
| Item 6 | Compliance | `Default` |
| Item 7 | Reports | `Default` |
| Item 8 | Settings | `Default` |
| Item 9 | Update Now | `Default` |

### Software Deployment
| Slot | Item | State |
|------|------|-------|
| Item 1 | Packages | `Active` |
| Item 2 | Library | `Default` |
| Item 3 | Deployment | `Default` |
| Item 4 | Reports | `Default` |
| Item 5 | Settings | `Default` |

### Inventory
| Slot | Item | State |
|------|------|-------|
| Item 1 | Computers | `Active` |
| Item 2 | Hardware | `Default` |
| Item 3 | Software | `Default` |
| Item 4 | Alerts | `Default` |
| Item 5 | Prohibit Software | `Default` |
| Item 6 | Block Executable | `Default` |
| Item 7 | Reports | `Default` |
| Item 8 | Settings | `Default` |

### OS Deployment
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Online Imaging | `Default` |
| Item 3 | Backup User Profile | `Default` |
| Item 4 | Customize | `Default` |
| Item 5 | Deploy | `Default` |
| Item 6 | Repository | `Default` |
| Item 7 | Settings | `Default` |

### MDM
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Management | `Default` |
| Item 3 | Inventory | `Default` |
| Item 4 | Enrollment | `Default` |
| Item 5 | Reports | `Default` |
| Item 6 | Settings | `Default` |
| Item 7 | Audit | `Default` |

### Agent
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Domain | `Default` |
| Item 3 | Remote Offices | `Default` |
| Item 4 | Computers | `Default` |
| Item 5 | Auto Discovery | `Default` |
| Item 6 | Settings | `Default` |

### Tools
The Tools module has no Dashboard landing page — `Remote Control` is the default Active item.

| Slot | Item | State |
|------|------|-------|
| Item 1 | Remote Control | `Active` |
| Item 2 | System Manager | `Default` |
| Item 3 | Remote Shutdown | `Default` |
| Item 4 | Wake On LAN | `Default` |
| Item 5 | Chat | `Default` |
| Item 6 | Announcement | `Default` |
| Item 7 | System Tools | `Default` |

### Browsers
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Manage | `Default` |
| Item 3 | Policies | `Default` |
| Item 4 | Insights | `Default` |
| Item 5 | Compliance | `Default` |
| Item 6 | Add-on settings | `Default` |

### Application Control
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Manage | `Default` |
| Item 3 | Deployment | `Default` |
| Item 4 | Privilege Management | `Default` |
| Item 5 | Reports | `Default` |
| Item 6 | Settings | `Default` |

### Malware Protection
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Incidents | `Default` |
| Item 3 | Devices | `Default` |
| Item 4 | Anti-Ransomware | `Default` |
| Item 5 | Next-Gen Antivirus | `Default` |
| Item 6 | Settings | `Default` |

### Endpoint DLP
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Data Classification | `Default` |
| Item 3 | Policy Deployment | `Default` |
| Item 4 | Insights | `Default` |

### BitLocker Management
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Policy Creation | `Default` |
| Item 3 | Policy Deployment | `Default` |
| Item 4 | Insights | `Default` |
| Item 5 | Reports | `Default` |
| Item 6 | Recovery Key | `Default` |

### Device Control
| Slot | Item | State |
|------|------|-------|
| Item 1 | Dashboard | `Active` |
| Item 2 | Policies | `Default` |
| Item 3 | Insights | `Default` |
| Item 4 | Reports | `Default` |
| Item 5 | Settings | `Default` |

### DEX
| Slot | Item | State |
|------|------|-------|
| Item 1 | Home | `Active` |
| Item 2 | Devices | `Default` |
| Item 3 | Insights | `Default` |
| Item 4 | Alerts | `Default` |
| Item 5 | Sensors | `Default` |
| Item 6 | Workflows | `Default` |
| Item 7 | Deployments | `Default` |
| Item 8 | Dashboards | `Default` |
| Item 9 | Extensions | `Default` |
| Item 10 | Settings | `Default` |

---

## Collapse / Expand Toggle

The bottom of every navigation panel contains a **collapse toggle** (Bottom Item 2), visible in both Type variants. It shows a `< =` icon (left-pointing chevron with lines).

- In `Icon with Text` mode: renders full-width at 72px
- In `Icon Only` mode: renders at 44px, icon only
- On click: switches the parent sidebar between `Icon with Text` and `Icon Only` states
- The toggle itself does not change state — the consuming layout handles the type switch

---

## Usage Guidelines

### When to use

- As the primary navigation for any UEMS product module page.
- Use `Icon with Text` by default to give all users clear navigation labels.
- Switch to `Icon Only` when the user explicitly collapses the sidebar to maximise content area.
- Only one item should be in `Active` state at a time — it reflects the current page.

### When NOT to use

- Do not use Level 1 navigation as a secondary/contextual navigation within a page — use a Tab Bar or Level 2 navigation instead.
- Do not show more items than the product's defined set — use the item visibility booleans to hide unused slots rather than adding extra items.
- Do not place the Level 1 navigation horizontally — it is strictly a vertical sidebar component.

### Choosing the right product set

Always use the component set that matches the product context. Do not use the Configurations nav inside an MDM screen. Each product set has curated icons and labels that match its information architecture.

### Item slot management

| Scenario | How to handle |
|----------|--------------|
| Product has fewer than 6 items | Set excess Item slots to `OFF` |
| Product needs 7–8 items | Set `Item 7` / `Item 8` to `ON` |
| A nav item should not be accessible | Set `State=Disabled` via the Item Swap |
| Current page changes | Set the matching item's Swap to `State=Active` |

### Do / Don't

| Do | Don't |
|----|-------|
| Always set exactly one item to `Active` to reflect the current page | Leave all items in `Default` — users need a clear location indicator |
| Use the `Add` state only for primary creation actions (e.g. "Add Config") | Use `Add` state for regular navigation destinations |
| Use `Icon Only` only as the collapsed state, toggled by the user | Default to `Icon Only` — expanded labels aid discoverability |
| Show tooltips on all items when in `Icon Only` mode | Hide labels in collapsed mode without providing a hover tooltip |
| Keep all items from the product's defined set — disable rather than hide items users shouldn't access | Remove items from the nav list for items that are merely restricted — use `Disabled` state with a tooltip explaining why |

---

## Keyboard Behaviour

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the next nav item |
| `Shift+Tab` | Move focus to the previous nav item |
| `Enter` / `Space` | Activate the focused nav item |
| `Home` | Move focus to the first nav item |
| `End` | Move focus to the last nav item |
| `Enter` on collapse toggle | Toggle between `Icon with Text` and `Icon Only` |

---

## Developer Handoff

### HTML structure

```html
<nav
  class="sidebar-nav sidebar-nav--expanded"
  aria-label="Main navigation"
>
  <ul class="sidebar-nav__list" role="list">
    <!-- Active item -->
    <li class="sidebar-nav__item">
      <a
        href="/dashboard"
        class="nav-item nav-item--active"
        aria-current="page"
        aria-label="Dashboard"
      >
        <span class="nav-item__icon-wrap" aria-hidden="true">
          <!-- Icon SVG -->
        </span>
        <span class="nav-item__label">Dashboard</span>
      </a>
    </li>

    <!-- Default item -->
    <li class="sidebar-nav__item">
      <a
        href="/threats"
        class="nav-item"
        aria-label="Threats"
      >
        <span class="nav-item__icon-wrap" aria-hidden="true">
          <!-- Icon SVG -->
        </span>
        <span class="nav-item__label">Threats</span>
      </a>
    </li>

    <!-- Disabled item -->
    <li class="sidebar-nav__item">
      <a
        href="#"
        class="nav-item nav-item--disabled"
        aria-disabled="true"
        tabindex="-1"
        aria-label="Patches (not available)"
      >
        <span class="nav-item__icon-wrap" aria-hidden="true">
          <!-- Icon SVG -->
        </span>
        <span class="nav-item__label">Patches</span>
      </a>
    </li>
  </ul>

  <!-- Bottom section -->
  <div class="sidebar-nav__bottom">
    <button
      class="nav-item nav-item--collapse"
      aria-label="Collapse navigation"
      aria-expanded="true"
      aria-controls="sidebar"
    >
      <span class="nav-item__icon-wrap" aria-hidden="true">
        <!-- collapse icon SVG -->
      </span>
    </button>
  </div>
</nav>
```

### CSS

```css
/* Sidebar container */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  width: 72px;
  height: 640px;
  background: #ffffff;
  border-right: 1px solid #C3C9D6;
  padding: 8px 0;
}

.sidebar-nav--collapsed {
  width: 44px;
}

/* Item list */
.sidebar-nav__list {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Nav item */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  text-decoration: none;
  color: #15181E;
  cursor: pointer;
}

/* Icon wrap */
.nav-item__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

/* Active state */
.nav-item--active .nav-item__icon-wrap {
  background: #E8F0FE;
}
.nav-item--active .nav-item__icon-wrap svg {
  color: #006AFF;
}
.nav-item--active .nav-item__label {
  color: #006AFF;
}

/* Hover state */
.nav-item:hover:not(.nav-item--active):not(.nav-item--disabled) .nav-item__icon-wrap {
  background: #F0F2F5;
}

/* Disabled state */
.nav-item--disabled {
  pointer-events: none;
  color: #8893AD;
}
.nav-item--disabled .nav-item__icon-wrap svg {
  color: #8893AD;
}

/* Label */
.nav-item__label {
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  color: inherit;
}

/* Icon Only — hide labels */
.sidebar-nav--collapsed .nav-item__label {
  display: none;
}

/* Bottom section */
.sidebar-nav__bottom {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 1px solid #F0F2F5;
}
```

### Collapse toggle pattern

```js
const toggleBtn = document.querySelector('.nav-item--collapse');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
  const isExpanded = sidebar.classList.toggle('sidebar-nav--collapsed');
  toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
  toggleBtn.setAttribute('aria-label', isExpanded ? 'Expand navigation' : 'Collapse navigation');
});
```

---

## Accessibility

| Concern | Guidance |
|---------|----------|
| **Landmark** | Wrap in `<nav>` with `aria-label="Main navigation"` |
| **Current page** | Set `aria-current="page"` on the active item's `<a>` tag |
| **Icon Only mode** | Add `aria-label` to each nav item containing the full item name. Provide visible tooltip on hover/focus |
| **Disabled items** | Set `aria-disabled="true"` and `tabindex="-1"`. Include a tooltip explaining unavailability |
| **Collapse toggle** | Use `aria-expanded` (`true`/`false`) and `aria-controls` pointing to the sidebar container |
| **Icons** | Mark icon SVGs `aria-hidden="true"` — labels carry the semantic meaning |
| **Keyboard** | Full keyboard navigation via `Tab`/`Shift+Tab`; `Enter`/`Space` to activate; `Home`/`End` to jump to first/last item |
| **Focus ring** | Do not remove the default focus outline — use `:focus-visible` to style a custom 2px ring matching `Border-Accent` (`#006AFF`) |
| **RTL** | Set `dir="rtl"` on the `<nav>` element for Arabic/Hebrew layouts; icon wrap and label stack direction invert automatically |
| **Add item** | The "Add" state button should be a `<button>` element (not `<a>`), as it opens a creation dialog rather than navigating to a page |

---

## Related Components

- **Left Nav Item L1** (`_base_Left Nav Item L1`) — The individual nav item base component used inside each slot
- **Sidebar Navigation Level 2** — The secondary navigation that appears to the right of Level 1, showing sub-pages within the selected Level 1 section
- **Header Navigation** — The top horizontal navigation bar; works alongside Level 1 sidebar
- **Tooltip** — Use for item labels in `Icon Only` (collapsed) mode

---

*Generated from UEMS Design System 3.0 · Figma frame `16780:88270`*
