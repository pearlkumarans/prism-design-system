# Text Link Component

**Design System:** UEMS Design System 3.0
**Figma Node:** `17646:374198` (Component Set)
**Page:** TextLink
**Total Variants:** 864

---

## Overview

TextLink is an interactive inline or standalone text-based navigation component. It supports multiple visual styles (Primary, Secondary, Subtle, Danger), three layout types (inline, standalone, with icons), configurable underline behavior, and full RTL support. Use TextLink for navigating to other pages, triggering contextual actions, or linking related content within body text or as standalone call-to-action elements.

---

## Anatomy

### Default (Inline)

```
  Text Link
  ─────────   <- underline (optional)
```

### Standalone

```
  Text Link ›
```

### WithIcon

```
  [Leading Icon]  Text Link  [Trailing Icon]
```

### Parts

| Part | Node Type | Description |
|------|-----------|-------------|
| **Container** | Auto-layout Frame | Horizontal layout wrapping icon(s) and label. Inline by default; standalone has independent spacing. |
| **Leading Icon** | Instance Swap | Optional icon before the link text. Toggled via `Show Leading Icon`. Only active in `WithIcon` type. |
| **Label** | Text | The clickable link text. Defaults to `"Text Link"`. Font size and weight vary by Size. |
| **Trailing Icon** | Instance Swap | Optional icon after the link text. Toggled via `Show Trailing Icon`. Only active in `WithIcon` type. |
| **Underline** | Text decoration | Persistent, hover-only, or hidden underline. Controlled by the `Underline` variant axis — not a separate layer. |

---

## Variant Axes

| Property | Values | Description |
|----------|--------|-------------|
| **Type** | `Default`, `Standalone`, `WithIcon` | Controls the structural layout and intended use context of the link. |
| **Style** | `Primary`, `Secondary`, `Subtle`, `Danger` | Controls the semantic color of the link text and underline. |
| **State** | `Default`, `Hover`, `Focus`, `Disabled` | Interaction state of the link. |
| **Size** | `Small`, `Medium`, `Large` | Controls font size and icon size. |
| **Underline** | `Always`, `HoverOnly`, `None` | Controls when the underline text decoration is visible. |
| **RTL** | `False`, `True` | Mirrors layout direction for right-to-left languages. |

### Variant Count Breakdown

3 (Type) × 4 (Style) × 4 (State) × 3 (Size) × 3 (Underline) × 2 (RTL) = **864 variants**

---

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Label` | Text | `"Text Link"` | The visible link text. |
| `Show Leading Icon` | Boolean | `true` | Toggles the leading icon. Only applicable when `Type = WithIcon`. |
| `Show Trailing Icon` | Boolean | `true` | Toggles the trailing icon. Only applicable when `Type = WithIcon`. |
| `Leading Icon` | Instance Swap | Default link icon | Swappable icon instance before the label. |
| `Trailing Icon` | Instance Swap | Default arrow icon | Swappable icon instance after the label. |

---

## Types

| Type | Layout | Use Case |
|------|--------|----------|
| **Default** | Inline text only, no icons | Use within body copy or flowing text. Blends into surrounding content and relies on color and underline for affordance. |
| **Standalone** | Text only, exists outside of body copy | Use as a standalone navigation or action element — e.g., "View all", "See details", "Learn more" — separate from paragraph text. |
| **WithIcon** | Text with leading and/or trailing icon | Use when additional visual context is needed — e.g., external link icon, download arrow, or category icon alongside the label. |

---

## Styles (Color Mapping)

| Style | Color | Use Case |
|-------|-------|----------|
| **Primary** | Accent blue | Default. Standard navigation links, page links, hyperlinks within content. |
| **Secondary** | Muted/subdued color | Lower-emphasis links — footnotes, secondary actions, supplemental navigation. |
| **Subtle** | Quaternary text color (`--uems-text-quaternary`) | Links that visually blend with surrounding text. Relies on underline for affordance. Use sparingly. |
| **Danger** | Red/destructive | Links that trigger destructive or irreversible actions — e.g., "Delete account", "Remove access". |

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Resting state. Color and underline behavior are determined by Style and Underline variant. |
| **Hover** | Color stays the same as Default/Focus (no color shift). Underline appears if `Underline = HoverOnly`. Cursor changes to pointer. |
| **Focus** | 2px accent ring (`--uems-border-accent-focus`) visible around the link for keyboard navigation. Meets WCAG focus indicator requirements. |
| **Disabled** | Color → `--uems-text-disabled` + 50% opacity. Non-interactive. No hover or focus feedback. Cursor is default (not pointer). |

---

## Sizes

| Size | Font Size | Typical Use |
|------|-----------|-------------|
| **Small** | 12px / 16px line-height (default) | Compact UI, table cells, helper text areas, footnotes |
| **Medium** | 14px / 20px line-height | Standard body copy, form contexts, most UI surfaces |
| **Large** | 16px / 24px line-height | Prominent standalone links, marketing sections, feature callouts |

---

## Underline Behavior

| Value | When Visible | Guidance |
|-------|--------------|----------|
| **Always** | Underline is always shown | Use within dense body text where color alone may not clearly distinguish the link. Maximizes discoverability. |
| **HoverOnly** | Underline appears only on hover | Use for standalone links or navigation menus where persistent underlines would create visual noise. |
| **None** | Underline is never shown | Use only when the link's interactive nature is clearly established by context (e.g., a dedicated "Links" section or navigation list). Requires sufficient color contrast to communicate affordance. |

---

## RTL Support

When `RTL = True`:
- Text is right-aligned
- Leading and trailing icons are mirrored (leading icon appears on the right, trailing on the left)
- Layout direction is fully reversed

---

## Usage Guidelines

### Do
- Use `Default` type for links inside body copy or descriptive text
- Use `Standalone` type for call-to-action links that appear outside of paragraphs
- Use `WithIcon` type when an icon adds meaningful context (e.g., external link, download, back navigation)
- Use `Primary` style as the default for all standard navigation links
- Use `Danger` style only for irreversible or destructive actions
- Use `Underline = Always` inside body text to help distinguish links from surrounding content
- Use `Underline = HoverOnly` for standalone or grouped links to reduce visual noise
- Keep link labels concise and descriptive — the label alone should convey the destination or action
- Ensure disabled links communicate why they are inactive via surrounding context

### Don't
- Don't use TextLink as a substitute for a Button when the action doesn't navigate anywhere (use Button instead)
- Don't use `Subtle` style in body text where color contrast alone won't distinguish it from non-link text
- Don't use `Underline = None` in flowing text where context does not clearly establish interactivity
- Don't use vague labels like "click here" or "read more" — link labels should be self-descriptive
- Don't mix multiple link styles within the same sentence or paragraph
- Don't use `Danger` style for standard navigation; reserve it strictly for destructive actions
- Don't use the `WithIcon` type inside dense body text — it disrupts reading flow

---

## Accessibility

| Aspect | Implementation |
|--------|---------------|
| **Color Contrast** | Primary, Secondary, and Danger styles meet WCAG 2.1 AA contrast ratio (4.5:1) against standard backgrounds. |
| **Keyboard Navigation** | Links are natively focusable via Tab. Focus state provides a visible 2px accent ring. |
| **Screen Reader** | Label text is read as a link. Descriptive labels are critical — avoid "click here". Icons should have accessible `aria-label` or be marked decorative (`aria-hidden`). |
| **Disabled State** | Disabled links should use `aria-disabled="true"` and remove href to prevent interaction. `--uems-text-disabled` color + 50% opacity convey the visual disabled state. |
| **Underline** | `Underline = Always` is the most accessible option inside body text. `None` should only be used when interactive affordance is clearly established by other means. |
| **RTL** | Full RTL layout support with reversed icon order and right-aligned text. |

---

## Related Components

| Component | Relationship |
|-----------|-------------|
| **Button** | Use Button for actions that do not navigate (submit, save, open modal). Use TextLink for navigation or contextual in-text actions. |
| **Icon Button** | Use Icon Button for icon-only actions. Use `WithIcon` TextLink when both a label and icon are needed. |
| **Navigation Item** | Use Navigation Item for structured menu and sidebar navigation. Use TextLink for inline or supplemental navigation within content. |

---

## Figma Usage

```
Component Set: TextLink
Node ID: 17646:374198
File: UEMS - Design System 3.0

Example variant string:
Type=Default, Style=Primary, State=Default, Size=Medium, Underline=Always, RTL=False
```

### Instance Overrides
1. Select the TextLink instance
2. Edit the **Label** text to set the link content
3. Change **Type** to `WithIcon` and toggle **Show Leading Icon** / **Show Trailing Icon**
4. Swap **Leading Icon** or **Trailing Icon** to any icon from the icon library
5. Adjust **Style** for semantic color (Primary, Secondary, Subtle, Danger)
6. Set **Underline** based on context (Always for inline text, HoverOnly for standalone)
7. Toggle **RTL** for right-to-left language layouts
