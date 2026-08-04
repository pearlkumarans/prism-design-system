# Avatar Component

**Design System:** UEMS Design System 3.0
**Figma Node:** `16021:26134` (Component Set)
**Total Variants:** 24

## Overview

Compact visual representation of a user or entity. Displays a profile photo, user initials, or a generic placeholder. An interactive `editable` mode supports avatar-upload contexts.

## Custom Element API

```html
<ds-avatar size="medium" name="Jane Doe" src="/photos/jane.jpg"></ds-avatar>
<ds-avatar size="large" name="Javier"></ds-avatar>             <!-- initials -->
<ds-avatar size="small"></ds-avatar>                            <!-- placeholder -->
<ds-avatar size="large" editable name="Jane Doe" src="…"></ds-avatar>
```

### Attributes

| Attribute | Values | Default | Description |
|---|---|---|---|
| `size` | `small`, `medium`, `large` | `medium` | 24 / 32 / 52 px diameter |
| `type` | `image`, `initials`, `placeholder`, `hover` | auto | Override the auto-resolved type. `hover` = solid black surface + white image icon (matches the editable hover state). |
| `src` | URL | — | Profile photo URL |
| `name` | string | — | Used for initials and accessible label |
| `editable` | boolean | unset | Adds the camera-icon hover overlay |
| `disabled` | boolean | unset | Disabled surface + faded foreground, non-interactive |

### Auto type-resolution

When `type` is not set:

```
src present → image
else name present → initials
else → placeholder
```

If a provided `src` fails to load, the element strips the `src` attribute and re-renders, naturally falling back to initials (if `name`) or placeholder.

### Initials rule

| Name | Initials |
|---|---|
| `Jane Doe` | `JD` |
| `Javier` | `J` |
| `Jane Marie Doe` | `JD` (first + last word) |
| empty | falls back to placeholder |

## BEM Classes (no-JS path)

```html
<span class="ds-avatar ds-avatar--medium">
  <img class="ds-avatar__image" src="/photos/jane.jpg" alt="Jane Doe">
</span>

<span class="ds-avatar ds-avatar--medium" aria-label="Javier avatar">
  <span class="ds-avatar__initials">J</span>
</span>

<span class="ds-avatar ds-avatar--medium ds-avatar--editable" role="button" tabindex="0" aria-label="Change profile photo">
  <img class="ds-avatar__image" src="/photos/jane.jpg" alt="">
  <span class="ds-avatar__overlay">
    <svg width="16" height="16"><use href="/icons.svg#icon-image"/></svg>
  </span>
</span>
```

## Tokens Used

| Token | Where |
|---|---|
| `--bg-tertiary` | Base surface (before content) |
| `--bg-quaternary-solid` | Initials + placeholder background (#5F6C89) |
| `--border-accent-subtle` | Initials + placeholder ring (1px, #C0D1F5) — default only |
| `--text-white` | Initials text color |
| `--icon-white` | Placeholder / hover image icon color |
| `--grey-modern-950` | Hover surface + editable overlay scrim (solid black) |
| `--bg-disabled` | Disabled surface (initials / placeholder / hover) |
| `--text-disabled` / `--icon-disabled` | Disabled foreground |
| `--border-accent-focus` | Focus ring (editable) |
| `--radius-full` | Circular crop |

## Accessibility

- Image avatars use `<img alt="{name}">`.
- Non-image avatars get `aria-label="{name} avatar"`.
- Editable avatars become `role="button"`, focusable (`tabindex="0"`), with `aria-label="Change profile photo"` and a visible focus ring.
- `disabled` removes from tab order, applies `aria-disabled="true"`, fades to 50%.
- Initials background pair (`--bg-accent-primary` + `--text-accent-primary`) meets WCAG AA across all four themes.
