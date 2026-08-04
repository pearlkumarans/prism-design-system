# Header Navigation

A fixed full-width top bar that provides product identity, primary navigation links, global search, and quick-access utility actions. Four product-specific variants share the same right-side utility cluster and component properties; they differ in branding and whether the centre zone carries tab navigation or a search bar.

**Figma source:** [UEMS — Design System 3.0](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16884-665483) · Node `16884:665483`

---

## Variants

The component set contains **4 variants** on a single `Property 1` axis:

| Variant | Node ID | Centre Zone | Nav Style |
|---------|---------|-------------|-----------|
| `Endpoint Central` | `16875:663624` | Horizontal tab navigation (Nav 1–8 + overflow `···`) | Top nav |
| `EC left only navigation` | `17601:296213` | Full-width search bar | Left sidebar |
| `MDM` | `16884:665484` | Full-width search bar | Left sidebar |
| `Patch Manager Plus` | `16886:665761` | Full-width search bar | Left sidebar |

The `EC left only navigation`, `MDM`, and `Patch Manager Plus` variants are designed for products where primary navigation lives in a **left sidebar** — the header's centre zone is freed up for global search.

---

## Anatomy

### Endpoint Central (top nav)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [✦] Endpoint Central  │ Home  Configs  Inventory  …  Tools  ···  │ [utility cluster] │
└─────────────────────────────────────────────────────────────────────────┘
  ↑ Logo zone             ↑ Tab navigation (Nav 1–8 + overflow)      ↑ Right zone
```

### EC left only / MDM / Patch Manager Plus (left nav)

```
┌────────────────────────────────────────────────────────────────────────┐
│  [logo] Product Name  │       🔍 Search...              ⌘K  │ [utility cluster] │
└────────────────────────────────────────────────────────────────────────┘
  ↑ Logo zone             ↑ Full-width search bar                ↑ Right zone
```

### Right Utility Cluster (all variants)

```
All Customers ˅   🔍  ⌘K   ⚙   🔖   🚀   🔔   [avatar]   ⠿
      ↑             ↑         ↑    ↑    ↑    ↑       ↑        ↑
Customer      Search     Settings Bookmark Link Notif  Avatar  Bento
Selector      (icon)
```

---

## Component Properties

All properties are **Boolean toggles** that show or hide slots in the header. They apply to every variant.

### Navigation Slots (Endpoint Central only)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Nav 1` | Boolean | `ON` | First nav tab slot |
| `Nav 2` | Boolean | `ON` | Second nav tab slot |
| `Nav 3` | Boolean | `ON` | Third nav tab slot |
| `Nav 4` | Boolean | `ON` | Fourth nav tab slot |
| `Nav 5` | Boolean | `ON` | Fifth nav tab slot |
| `Nav 6` | Boolean | `ON` | Sixth nav tab slot |
| `Nav 7` | Boolean | `ON` | Seventh nav tab slot |
| `Nav 8` | Boolean | `ON` | Eighth nav tab slot |

> Tabs beyond the visible count collapse into the `···` overflow menu automatically. Turn off unused slots (e.g. `Nav 7=OFF`, `Nav 8=OFF`) to reflect the actual link count in your design.

### Right Utility Cluster

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Search` | Boolean | `ON` | Toggles the search icon / search bar |
| `Show Notifications` | Boolean | `ON` | Toggles the bell (🔔) notification icon |
| `Show Settings` | Boolean | `ON` | Toggles the settings gear (⚙) icon |
| `Show Customer Selector` | Boolean | `ON` | Toggles the "All Customers ˅" dropdown |
| `Show Avatar` | Boolean | `ON` | Toggles the user avatar |
| `Show Bento` | Boolean | `ON` | Toggles the bento grid (⠿) icon |
| `Show Bookmark` | Boolean | `ON` | Toggles the bookmark (🔖) icon |
| `Show Link` | Boolean | `ON` | Toggles the rocket/link (🚀) icon |

---

## Visual Design

| Token | Value | Notes |
|-------|-------|-------|
| Height | `40px` | Compact — fits within a constrained chrome |
| Width | `1440px` | Full viewport; stretches to container |
| Background | `#FFFFFF` (BG-White) | Always white across all variants |
| Bottom border | `Border-Secondary` | Subtle separator from page content |
| Active tab text | `#0C66E4` (Brand Blue) | With 2px blue underline |
| Inactive tab text | `#292A2E` (Text Default) | No underline |
| Overflow `···` | Matches inactive tab style | Expands into a dropdown on click |
| Search placeholder | `#8993A4` (Text Subtlest) | Keyboard shortcut hint: ⌘K |
| Utility icons | `#626870` (Text Subtle) | 20px, outlined style |
| Customer Selector | Text + chevron, `#292A2E` | Dropdown trigger |

### Product Logos

| Variant | Logo description |
|---------|-----------------|
| Endpoint Central | Multi-coloured star/spark icon (`✦`) |
| EC left only navigation | Same Endpoint Central multi-coloured spark |
| MDM | Green square with rounded tablet device icon |
| Patch Manager Plus | Teal circular target/wheel icon |

---

## Behaviour

### Tab Navigation (Endpoint Central)

- The **active tab** is marked with a blue bottom underline and blue text. Only one tab is active at a time.
- Tabs that exceed horizontal space collapse into a `···` overflow menu (ellipsis button) at the end of the tab row.
- Turn off `Nav 7` / `Nav 8` slots in Figma when the product has fewer than 8 nav items to avoid phantom placeholders.

### Search

- **Endpoint Central** uses an icon-only search button in the right zone. Clicking it opens a search overlay/modal.
- **Left-nav variants** (EC left only, MDM, Patch Manager Plus) use a full-width inline search bar in the centre zone. The `⌘K` keyboard shortcut hint is always shown at the far right of the bar.

### Customer Selector

- The "All Customers ˅" dropdown appears in all four variants (when `Show Customer Selector=ON`).
- It allows switching between customer tenants / accounts in multi-tenant deployments.
- Toggling `Show Customer Selector=OFF` removes it entirely — useful for single-tenant contexts.

---

## Usage Guidelines

### When to use

- As the single persistent top bar for every page in a product.
- Use `Endpoint Central` when the product has top-level horizontal navigation (8 items or fewer).
- Use the left-nav variants (`EC left only navigation`, `MDM`, `Patch Manager Plus`) when primary navigation is in a left sidebar and the header should only carry branding + search + utilities.

### When NOT to use

- As a secondary navigation bar within a page — use Tabs or a Section Header instead.
- Inside a modal or flyout — navigation is not needed inside overlay contexts.
- As a mobile top bar — this component is designed for desktop/1440px viewports; use a dedicated mobile header.

### Do / Don't

| Do | Don't |
|----|-------|
| Keep the Nav slot count to the number of actual links; turn off unused `Nav N` props | Leave unused Nav slots ON — they create empty spacing in the tab row |
| Use the correct variant for the product's navigation architecture | Use `Endpoint Central` in a left-nav product or vice versa — this creates navigation confusion |
| Show `Customer Selector` for multi-tenant products | Show `Customer Selector` in single-tenant or personal-account products |
| Coordinate with the active page to set the correct active tab state | Leave all tabs in the inactive state — users lose wayfinding context |
| Use `Show Search=OFF` only when search is genuinely not available | Hide search purely for visual tidiness — it is a core utility |

---

## Accessibility

| Concern | Guidance |
|---------|----------|
| Landmark | Wrap in `<header>` with `role="banner"` |
| Nav landmark | The tab group must be in `<nav aria-label="Primary navigation">` |
| Active tab | Active tab link gets `aria-current="page"` |
| Overflow menu | `···` button needs `aria-label="More navigation items"` and `aria-expanded` toggled |
| Search | Search icon/bar must have `aria-label="Search"` (and `role="search"` on the containing element) |
| Keyboard shortcut | `⌘K` is a convention hint, not the only path — ensure search is Tab-reachable |
| Skip link | Provide a visually hidden "Skip to main content" link before the header for keyboard users |
| Icon-only buttons | Settings, Notifications, Bookmark, Link, Bento icons must each have `aria-label` |
| Avatar | Must have `aria-label="User menu"` or equivalent; opens a dropdown when activated |
| Customer Selector | Must use `aria-haspopup="listbox"` and `aria-expanded` on the trigger |
| Contrast | Active tab blue (`#0C66E4`) on white meets WCAG AA for text |
| Focus ring | All interactive items must have a visible `:focus-visible` outline |

---

## All Variants Reference

| Variant | Node ID |
|---------|---------|
| Property 1=Endpoint Central | `16875:663624` |
| Property 1=EC left only navigation | `17601:296213` |
| Property 1=MDM | `16884:665484` |
| Property 1=Patch Manager Plus | `16886:665761` |

---

## Related Components

- **Left Sidebar Navigation** — the companion sidebar used with `EC left only navigation`, `MDM`, and `Patch Manager Plus` variants
- **Dropdown Menu** — powers the Customer Selector and the `···` overflow nav menu
- **Avatar** — the user avatar in the right utility cluster
- **Search** — the search overlay/modal triggered by the search icon
- **Tabs** — standalone tab component; the nav tabs in this header share the same visual language

---

*Generated from UEMS Design System 3.0 · Figma node `16884:665483`*
