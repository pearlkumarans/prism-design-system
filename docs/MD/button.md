# Button Component

**Design System:** UEMS Design System 3.0
**Figma Node:** `15897:18750` (Component Set)
**Page:** Button
**Total Variants:** 320 (excluding Split Button)

---

## Overview

The Button is the primary interactive element for triggering actions. It supports multiple visual variants for semantic meaning, four sizes for layout flexibility, and five interaction states. Buttons can include optional prefix and suffix icons alongside a text label.

> **Note:** The "Primary Split" variant (split button with dropdown) is a separate pattern and is excluded from this documentation.

---

## Anatomy

```
┌────────────────────────────────────┐
│  [Prefix Icon]  Label  [Suffix Icon] │
└────────────────────────────────────┘
```

| Part | Node Type | Description |
|------|-----------|-------------|
| **Container** | Auto-layout Frame | Horizontal layout with padding and rounded corners. Background changes per variant and state. |
| **Prefix Icon** | Instance Swap | Optional leading icon. Toggled via `Prefix` boolean. |
| **Label** | Text | The button text content. Defaults to "Button". |
| **Suffix Icon** | Instance Swap | Optional trailing icon (chevron, arrow, etc.). Toggled via `Suffix` boolean. |

---

## Variant Axes

| Property | Values | Description |
|----------|--------|-------------|
| **Variant** | `Primary`, `Secondary`, `Tertiary`, `Outline`, `Destructive`, `Success`, `Warning`, `Secondary Color` | Controls the visual style and semantic meaning of the button. |
| **Size** | `Large`, `Medium`, `Small`, `Xsmall` | Controls height, padding, font size, icon size, and gap. |
| **State** | `Default`, `Hover`, `Focus`, `Loading`, `Disabled` | Interaction state of the button. |
| **RTL** | `True`, `False` | Mirrors layout for right-to-left languages. |

### Variant Count Breakdown

8 (Variant) x 4 (Size) x 5 (State) x 2 (RTL) = **320 variants**

---

## Component Properties

These are overridable instance-level properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Label` | Text | `"Button"` | The display text of the button. |
| `Prefix` | Boolean | `false` | Toggles the leading icon visibility. |
| `Suffix` | Boolean | `false` | Toggles the trailing icon visibility. |
| `Prefix Icon` | Instance Swap | Default icon | Swappable leading icon instance. Only visible when Prefix is on. |
| `Suffix Icon` | Instance Swap | Chevron icon | Swappable trailing icon instance. Only visible when Suffix is on. |

---

## Variants (Color & Style Mapping)

### Primary

| Property | Token | Value |
|----------|-------|-------|
| Background (Default) | `Gradients/Primary` | `linear-gradient(bg-button-primary #006AFF -> bg-button-primary-hover #1E52BB)` |
| Background (Hover) | `Gradients/Primary-hover` | `linear-gradient(bg-button-primary-hover #1E52BB -> bg-button-primary #006AFF)` (reversed) |
| Text Color | `text/text-white` | `white` |
| Icon Color | White | Matches text |

### Secondary

| Property | Token | Value |
|----------|-------|-------|
| Background | `background/bg-secondary` | `#F0F2F5` |
| Text Color | `text/text-primary` | `#15181E` |
| Icon Color | Dark | Matches text |

### Tertiary

| Property | Token | Value |
|----------|-------|-------|
| Background | Transparent | No fill |
| Text Color | `text/text-accent-link` | `#006AFF` |
| Icon Color | Accent blue | Matches text |

### Outline

| Property | Token | Value |
|----------|-------|-------|
| Background | Transparent | No fill |
| Border | `border/border-secondary` | `1px solid #C3C9D6` |
| Text Color | `text/text-primary` | `#15181E` |
| Icon Color | Dark | Matches text |

### Destructive

| Property | Token | Value |
|----------|-------|-------|
| Background | `background/bg-error-solid` | `#E42527` |
| Text Color | `text/text-white` | `white` |
| Icon Color | White | Matches text |

### Success

| Property | Token | Value |
|----------|-------|-------|
| Background | `background/bg-success-solid` | `#0C8844` |
| Text Color | `text/text-white` | `white` |
| Icon Color | White | Matches text |

### Warning

| Property | Token | Value |
|----------|-------|-------|
| Background | `background/bg-warning-solid` | `#E65100` |
| Text Color | `text/text-white` | `white` |
| Icon Color | White | Matches text |

### Secondary Color

| Property | Token | Value |
|----------|-------|-------|
| Background | `background/bg-accent-primary` | `#EAF0FC` |
| Text Color | `text/text-accent-primary` | `#0E2553` |
| Icon Color | Accent dark | Matches text |

---

## Sizes

| Size | Height | Padding (H x V) | Gap | Font Size | Line Height | Icon Size | Typography Token |
|------|--------|------------------|-----|-----------|-------------|-----------|------------------|
| **Large** | 48px | 16px x 16px | 8px | 16px | 24px | 20px | `body/Large/Medium` |
| **Medium** | 40px | 16px x 12px | 8px | 14px | 20px | 20px | `body/Default/Medium` |
| **Small** | 36px | 12px x 8px | 4px | 14px | 20px | 16px | `body/Default/Medium` |
| **Xsmall** | 28px | 8px x 4px | 4px | 12px | 16px | 16px | `body/Small/Medium` |

### Spacing Tokens

| Size | Horizontal Padding | Vertical Padding | Gap |
|------|--------------------|------------------|-----|
| Large | `spacing/16px` | `spacing/16px` | `spacing/8px` |
| Medium | `spacing/16px` | `spacing/12px` | `spacing/8px` |
| Small | `spacing/12px` | `spacing/8px` | `spacing/4px` |
| Xsmall | `spacing/8px` | `spacing/4px` | `spacing/4px` |

### Border Radius

- All sizes: `radius/radius-s` = **8px**

---

## States

### Default
Standard resting state with variant-specific background and text colors.

### Hover
- **Primary:** Gradient direction reverses (`Gradients/Primary-hover`)
- **Other variants:** Background color shifts slightly (darker or lighter tint)

### Focus
- Outer wrapper with **2px solid border** using the variant's accent color
- Border color (Primary): `background/bg-button-primary` (`#006AFF`)
- Outer border radius: **12px**
- Inner button container with **4px padding** from focus ring
- Inner container retains the Default state gradient/background

### Loading
- Same background as Default state
- Label text is replaced by a spinner/loading indicator
- Icons may be hidden during loading

### Disabled
- All variants share the same disabled appearance:
  - Background: `background/bg-disabled` = `#E1E4EB`
  - Text: `text/text-disabled` = `#8893AD`
  - Icon color: Disabled grey matching text
  - No pointer interaction

---

## Typography

All button labels use the **Zoho Puvi Medium** font family (weight 500).

| Size | Token | Font Size | Line Height |
|------|-------|-----------|-------------|
| Large | `body/Large/Medium` | 16px | 24px |
| Medium | `body/Default/Medium` | 14px | 20px |
| Small | `body/Default/Medium` | 14px | 20px |
| Xsmall | `body/Small/Medium` | 12px | 16px |

---

## RTL Support

When `RTL = True`:
- Layout direction is mirrored (prefix icon moves to trailing, suffix to leading)
- Text direction set to `auto`
- All spacing and padding values are mirrored
- Icon positions swap accordingly

---

## Usage Guidelines

### Do
- Use **Primary** for the main call-to-action on a page
- Use **Secondary** or **Outline** for secondary actions alongside a Primary button
- Use **Tertiary** for low-emphasis or inline text-like actions
- Use **Destructive** only for irreversible or high-risk actions (delete, remove)
- Use **Success** for positive confirmation actions (approve, complete)
- Use **Warning** for cautionary actions that require attention
- Use **Secondary Color** for branded accent actions that are not the primary CTA
- Keep label text concise (1-3 words)
- Use prefix icons to reinforce the action meaning
- Use suffix icons (chevrons) to indicate dropdown or navigation behavior

### Don't
- Don't use more than one Primary button per section/view
- Don't use Destructive for non-destructive actions
- Don't mix too many button variants in the same button group
- Don't use Loading state without disabling user interaction
- Don't use overly long labels that cause the button to stretch excessively
- Don't rely solely on color to communicate meaning (pair with clear label text)

---

## Related Components

| Component | Relationship |
|-----------|-------------|
| **Icon Button** | Icon-only button for compact actions. Use when the action is universally understood by icon alone. |
| **Split Button** | Primary Split variant combines a button with a dropdown trigger. Use for actions with multiple sub-options. |
| **Tag** | Interactive label with dismiss action. Not for triggering actions. |
| **Action Dropdown** | Dropdown menu for multiple action options. Often triggered by a button. |

---

## Figma Usage

```
Component Set: Button
Node ID: 15897:18750
File: UEMS - Design System 3.0

Example variant string:
Variant=Primary, Size=Large, State=Default, RTL=False
```

### Instance Overrides
1. Select the button instance
2. Change **Variant** to set the visual style (Primary, Secondary, etc.)
3. Change **Size** to match layout requirements
4. Toggle **Prefix** / **Suffix** to show/hide icons
5. Swap **Prefix Icon** or **Suffix Icon** to any icon from the icon library
6. Edit the **Label** text directly
