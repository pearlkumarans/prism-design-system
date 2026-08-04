# Split Button Component

**Design System:** UEMS Design System 3.0
**Figma Node:** `15897:18750` (within Button Component Set, Variant = "Primary Split")
**Page:** Button
**Total Variants:** 40

---

## Overview

The Split Button is a compound action component that combines a primary action button with a secondary dropdown trigger (chevron). It allows users to execute a default action with one click, while also providing access to additional related actions via the dropdown chevron. The Split Button is implemented as the "Primary Split" variant within the Button component set.

---

## Anatomy

```
┌──────────────────────────┬─────────┐
│  [Prefix Icon]  Label    │   [V]   │
│       Button Part        │ Chevron │
│                          │  Part   │
└──────────────────────────┴─────────┘
         ↑ divider border
```

| Part | Node Name | Description |
|------|-----------|-------------|
| **Container** | Root Frame | Horizontal flex layout holding both parts side by side. No gap between parts. |
| **Button Part** | `Button Part` | The primary action area. Contains a prefix icon and label text. Has left-side rounded corners (`border-radius: 8px` on top-left and bottom-left). |
| **Divider** | Right border on Button Part | A `1px` right border using `border/border-accent-secondary` (`#6B94E7`) that visually separates the two parts. |
| **Chevron Part** | `Chevron Part` | The dropdown trigger area. Contains a single chevron-down icon. Has right-side rounded corners (`border-radius: 8px` on top-right and bottom-right). |
| **Prefix Icon** | `Prefix Icon` | Leading icon in the Button Part. Always visible (not togglable like standard Button). |
| **Label** | Text | The button text content. Defaults to "Button". |
| **Suffix Icon** | `Suffix Icon` | Chevron-down icon in the Chevron Part. Always visible. |

---

## Variant Axes

| Property | Values | Description |
|----------|--------|-------------|
| **Variant** | `Primary Split` | Fixed — this is the only split button variant. |
| **Size** | `Large`, `Medium`, `Small`, `Xsmall` | Controls height, padding, font size, and icon size for both parts. |
| **State** | `Default`, `Hover`, `Focus`, `Loading`, `Disabled` | Interaction state applied to the entire split button. |
| **RTL** | `True`, `False` | Mirrors layout for right-to-left languages. |

### Variant Count Breakdown

1 (Variant) x 4 (Size) x 5 (State) x 2 (RTL) = **40 variants**

---

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Label` | Text | `"Button"` | The display text of the primary action. |
| `Prefix Icon` | Instance Swap | Add (+) icon | Swappable leading icon in the Button Part. Always visible. |
| `Suffix Icon` | Instance Swap | Chevron-down icon | Dropdown trigger icon in the Chevron Part. Always visible. |

> **Note:** Unlike the standard Button, the Split Button does not have `Prefix` / `Suffix` boolean toggles — both icons are always shown.

---

## Color & Style Tokens

### Default State

| Part | Property | Token | Value |
|------|----------|-------|-------|
| **Button Part** | Background | `Gradients/Primary` | `linear-gradient(bg-button-primary #006AFF -> bg-button-primary-hover #1E52BB)` |
| **Chevron Part** | Background | `background/bg-button-primary` | `#006AFF` (solid) |
| **Divider** | Border | `border/border-accent-secondary` | `1px solid #6B94E7` |
| **Label** | Color | `text/text-white` | `white` |
| **Icons** | Color | White | Matches label |

### Hover State

| Part | Property | Token | Value |
|------|----------|-------|-------|
| **Button Part** | Background | `Gradients/Primary` | Same gradient as Default (unchanged) |
| **Chevron Part** | Background | `background/bg-button-primary-hover` | `#1E52BB` (darker) |
| **Divider** | Border | `border/border-accent-secondary` | `1px solid #6B94E7` |
| **Label** | Color | `text/text-white` | `white` |

### Focus State

| Part | Property | Token | Value |
|------|----------|-------|-------|
| **Outer Ring** | Border | `background/bg-button-primary` | `2px solid #006AFF` |
| **Outer Ring** | Border Radius | — | `12px` |
| **Outer Ring** | Padding | `spacing/4px` | `4px` (between ring and inner container) |
| **Split Container** | — | — | Inner container holds both Button Part and Chevron Part |
| **Button Part** | Background | `Gradients/Primary` | Same gradient as Default |
| **Chevron Part** | Background | `background/bg-button-primary` | `#006AFF` |

### Loading State

| Property | Token | Value |
|----------|-------|-------|
| Content | — | Both Button Part and Chevron Part are replaced by a centered `Spinner-Round` loading indicator |
| Container | — | Fixed width matching the Default state dimensions |

### Disabled State

| Part | Property | Token | Value |
|------|----------|-------|-------|
| **Button Part** | Background | `background/bg-disabled` | `#E1E4EB` |
| **Chevron Part** | Background | `background/bg-disabled` | `#E1E4EB` |
| **Divider** | Border | `border/border-secondary` | `1px solid #C3C9D6` |
| **Label** | Color | `text/text-disabled` | `#8893AD` |
| **Icons** | Color | Disabled grey | Matches label |

---

## Sizes

### Button Part Dimensions

| Size | Height | Padding (H x V) | Gap | Font Size | Line Height | Icon Size | Typography Token |
|------|--------|------------------|-----|-----------|-------------|-----------|------------------|
| **Large** | 48px | 16px x 16px | 4px | 16px | 24px | 20px | `body/Large/Medium` |
| **Medium** | 40px | 16px x 12px | 4px | 14px | 20px | 20px | `body/Default/Medium` |
| **Small** | 36px | 12px x 8px | 4px | 14px | 20px | 16px | `body/Default/Medium` |
| **Xsmall** | 28px | 8px x 4px | 4px | 12px | 16px | 16px | `body/Small/Medium` |

### Chevron Part Dimensions

| Size | Height | Padding (H x V) | Icon Size |
|------|--------|------------------|-----------|
| **Large** | 48px | 12px x 16px | 20px |
| **Medium** | 40px | 8px x 12px | 20px |
| **Small** | 36px | 8px x 8px | 16px |
| **Xsmall** | 28px | 4px x 4px | 16px |

### Overall Dimensions (Default State, LTR)

| Size | Total Width | Total Height |
|------|-------------|--------------|
| **Large** | 152px | 48px |
| **Medium** | 137px | 40px |
| **Small** | 121px | 36px |
| **Xsmall** | 99px | 28px |

### Border Radius

- **Button Part:** `8px` on left corners only (`border-top-left-radius: 8px`, `border-bottom-left-radius: 8px`)
- **Chevron Part:** `8px` on right corners only (`border-top-right-radius: 8px`, `border-bottom-right-radius: 8px`)
- **Focus Outer Ring:** `12px` on all corners

---

## Typography

All labels use the **Zoho Puvi Medium** font family (weight 500).

| Size | Token | Font Size | Line Height |
|------|-------|-----------|-------------|
| Large | `body/Large/Medium` | 16px | 24px |
| Medium | `body/Default/Medium` | 14px | 20px |
| Small | `body/Default/Medium` | 14px | 20px |
| Xsmall | `body/Small/Medium` | 12px | 16px |

---

## RTL Support

When `RTL = True`:
- The layout order is mirrored: **Chevron Part** appears on the **left**, **Button Part** on the **right**
- The divider border moves from the Button Part's right edge to its **left** edge (`border-left` instead of `border-right`)
- Rounded corners swap: Chevron Part gets left-side rounding, Button Part gets right-side rounding
- The prefix icon moves to the trailing (left) side of the label within the Button Part
- Label text direction is set to `auto` with right-to-left alignment
- Label defaults to Arabic text ("زر")
- The gradient direction in the Button Part reverses to maintain correct visual flow

---

## States Behavior

### Default
Both parts are visually distinct but appear as a unified control. The Button Part uses the Primary gradient background, while the Chevron Part uses a solid primary blue. A subtle lighter blue divider separates the two parts.

### Hover
The Chevron Part darkens to `bg-button-primary-hover` (`#1E52BB`), providing visual feedback that the dropdown trigger is interactive. The Button Part gradient remains unchanged.

### Focus
A **2px focus ring** wraps the entire split button (both parts) with a `4px` gap between the ring and the inner content. The ring uses the primary blue color (`#006AFF`) with a `12px` border radius. The inner "Split Container" frame holds both parts.

### Loading
The entire split button content (both parts) is replaced by a **Spinner-Round** loading indicator centered within a container that maintains the same width as the Default state. This prevents layout shift during loading.

### Disabled
Both parts adopt the same disabled appearance: grey background (`#E1E4EB`), grey text/icons (`#8893AD`), and a neutral grey divider (`#C3C9D6`). No pointer interaction is allowed.

---

## Usage Guidelines

### Do
- Use Split Button for a primary action that has related secondary options (e.g., "Save" + "Save As...", "Save & Close")
- Always pair with an Action Dropdown or menu that opens from the Chevron Part
- Keep the primary action label concise (1-2 words)
- Use the prefix icon to reinforce the primary action meaning (e.g., "+" for create/add)
- Position the Split Button where you would normally place a Primary button

### Don't
- Don't use Split Button when there is no secondary action — use a standard Primary button instead
- Don't use more than one Split Button per view/section
- Don't use Split Button for navigation actions
- Don't hide the only/critical action behind the chevron — the primary action should always be the most common one
- Don't use the Loading state without disabling the dropdown interaction
- Don't mix Split Button with other Primary-styled buttons in the same button group

---

## Related Components

| Component | Relationship |
|-----------|-------------|
| **Button (Primary)** | Standard single-action button. Use when no secondary options are needed. |
| **Icon Button** | Icon-only compact button. Not suitable for split actions. |
| **Action Dropdown** | The dropdown menu that opens from the Chevron Part. Pair with Split Button for the full pattern. |
| **Button (Secondary / Outline)** | Use alongside Split Button for lower-emphasis complementary actions. |

---

## Figma Usage

```
Component Set: Button
Node ID: 15897:18750
File: UEMS - Design System 3.0

Example variant string:
Variant=Primary Split, Size=Large, State=Default, RTL=False
```

### Instance Overrides
1. Select the split button instance
2. Change **Size** to match layout requirements (Large, Medium, Small, Xsmall)
3. Swap **Prefix Icon** to the appropriate action icon (e.g., add, save, download)
4. Edit the **Label** text to match the primary action
5. The **Suffix Icon** (chevron) should generally remain as the default chevron-down

### Key Differences from Standard Button
- The Split Button has **two distinct interactive zones** (Button Part + Chevron Part)
- Icons are **always visible** — no boolean toggle to hide them
- The **divider** between parts is a structural element, not a decorative one
- The **Focus state** wraps the entire component with an outer ring, unlike the standard button which wraps just the single button area
- The **Loading state** replaces the entire component content with a spinner, not just the label
