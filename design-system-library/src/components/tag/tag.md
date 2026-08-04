# Handoff Spec: Tag

**Figma:** [UEMS — Design System 3.0 · node `16462:101691`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16462-101691) · Component set, **432 variants**

**Related:** Theme tokens — [`uems-theme-tokens.md`](../uems-theme-tokens.md) · Primitives — [`primitive-colors.md`](../primitive-colors.md) · Siblings — [`badge.md`](./badge.md), [`status-indicator.md`](./status-indicator.md)

---

## Overview

A compact, **interactive** chip for user-applied metadata: filters, selected values in multi-selects, categories, recipients. Unlike Badge (system status, read-only), a Tag is created/removed by the user — it has hover, focus, and disabled states and a built-in close button. Optional leading element (status indicator dot or icon) and full RTL support with a dedicated Arabic label property.

## Variants

| Axis | Values | Count |
|------|--------|------:|
| `Variant` | Neutral (default), Primary, Success, Warning, Error, Outline | 6 |
| `Size` | Small (default), Medium, Large | 3 |
| `State` | Default, Hover, Focus, Disabled | 4 |
| `RTL` | False, True | 2 |
| `Leading Element` | None (default), Status Indicator, Icon | 3 |

**Total:** 6 × 3 × 4 × 2 × 3 = **432 variants**

### Component properties

| Property | Type | Default | Maps to |
|---|---|---|---|
| `Label` | Text | `"Tag"` | Tag text |
| `RTL Label` | Text | `"وسم"` | Text used by RTL variants (separate content, not a mirror) |
| `Show Close` | Boolean | `true` | Renders the close button |
| `Status Indicator` | Instance swap | Success/Small | The dot shown when Leading Element = Status Indicator |
| `Leading Icon` | Instance swap | tag icon | The icon shown when Leading Element = Icon |

## Layout

```
┌────────────────────────────────────┐
│ [leading] gap-2 Label gap-2 [✕]    │   height: 16 / 20 / 24px
└────────────────────────────────────┘   close button: 16×16 in ALL sizes
   width: hug content
```

### Size metrics

| Size | Height | Text-side pad | Close-side pad | Gap | Radius | Font (Zoho Puvi Medium) |
|---|---|---|---|---|---|---|
| Small | 16px | 4px | 4px | 2px | 4px (`--uems-radius-xs`) | 10px / 14px line-height |
| Medium | 20px | 6px | 4px | 2px | 4px | 12px / 16px line-height |
| Large | 24px | 8px | 4px | 2px | 6px (`--uems-radius-default`) | 14px / 20px line-height |

Padding adjustments by leading element (verified across all 432 variants):

| Leading element | Text-side pad | Close-side pad |
|---|---|---|
| None | 4 / 6 / 8 | 4 / 4 / 4 |
| Status Indicator | 4 / 4 / 4 | 4 / 4 / 4 |
| Icon | 4 / 6 / 8 | 4 / **6** / **8** (symmetric) |

> ⚠️ **Small height quirk (same family as Badge):** the 16×16 close button is fixed-size in every size — at Small it bleeds through the declared 2px vertical padding and spans the full 16px height. Don't implement vertical padding; set the fixed height and center with flexbox (`align-items: center`).

### Leading element sizes

| Size | Status Indicator | Leading Icon | Close button |
|---|---|---|---|
| Small | 10×10 | 12×12 | 16×16 |
| Medium | 14×14 | 16×16 | 16×16 |
| Large | 14×14 | 16×16 | 16×16 |

The close button is an embedded **Icon Button** instance (`Tertiary Grey / XSmall`) with its own interaction states (extracted from the Icon Button component set):

| Close state | Background | Icon | Shape |
|---|---|---|---|
| Default | transparent | `--uems-icon-tertiary` (tag-level override; the icon button's own default is `Icon-Secondary`) | Small: square 2px radius · Medium/Large: circle (see flag 8) |
| Hover | `--uems-bg-primary-hover` | `--uems-icon-tertiary` | — |
| Active | `--uems-bg-secondary` | `--uems-icon-accent-button` | — |
| Disabled | transparent | `--uems-icon-disabled` | — |

### Leading element colors

The **leading icon** is variant-colored (stroke-drawn, same token in Disabled — dimming comes from the tag's 50% opacity; exception: `Outline / Small / Disabled / Icon` binds `--uems-icon-disabled` in Figma, see flag 11):

| Variant | Leading icon |
|---|---|
| Neutral, Outline | `--uems-icon-primary` |
| Primary | `--uems-icon-accent` |
| Success | `--uems-icon-success` |
| Warning | `--uems-icon-warning` |
| Error | `--uems-icon-error` |

The **status indicator** renders dot-only (its label is hidden): instance 10/14/14px per tag size, dot fill comes from whichever status is swapped in (default: Success → `--uems-bg-success-solid`). See [`status-indicator.md`](./status-indicator.md) for the dot color matrix.

## Design Tokens Used

Hex comments = Light theme. Close icon is `--uems-icon-tertiary` in all non-disabled states, `--uems-icon-disabled` when disabled.

### Variant × State matrix

| Variant | Default bg | Hover bg | Border | Label |
|---|---|---|---|---|
| Neutral | `--uems-bg-secondary` /* #F0F2F5 */ | `--uems-bg-secondary-hover` /* #E1E4EB */ | — | `--uems-text-primary` /* #15181E */ |
| Primary | `--uems-bg-accent-primary` /* #EAF0FC */ | `--uems-bg-accent-primary-hover` /* #D5E0F8 */ | — | `--uems-text-accent-secondary` /* #184091 */ |
| Success | `--uems-bg-success-primary` /* #E7F3ED */ | `--uems-bg-success-secondary` /* #CEE7DA */ | — | `--uems-text-success` /* #0A7138 */ |
| Warning | `--uems-bg-warning-primary` /* #FFEEE5 */ | `--uems-bg-warning-secondary` /* #FFDECC */ | — | `--uems-text-warning` /* #BC4200 */ |
| Error | `--uems-bg-error-primary` /* #FDEBEB */ | `--uems-bg-error-secondary` /* #FAD7D8 */ | — | `--uems-text-error` /* #C1181B */ |
| Outline | transparent | `--uems-bg-primary-hover` /* #F0F2F5 */ | `--uems-border-secondary` 1px /* #C3C9D6 */ | `--uems-text-primary` |

### Focus (all variants)

A **ring around the tag**, not a style change on it: in Figma the tag sits inside a wrapper with a 2px `--uems-border-accent` border and 4px padding. The inner tag *should* be unchanged — one remaining Figma drift says otherwise (Neutral fill, flag 2; the Outline border loss in flag 10 was fixed in Figma); code ignores it and only adds the ring. In CSS:

```css
outline: 2px solid var(--uems-border-accent-focus);
outline-offset: 2px;
```

### Disabled (all variants)

- Whole tag at **50% opacity**, close icon → `--uems-icon-disabled`, no hover
- Neutral additionally swaps to `--uems-bg-disabled` + `--uems-border-disabled` 1px + `--uems-text-disabled`
- Outline swaps to `--uems-border-disabled` + `--uems-text-disabled`
- Colored variants (Primary/Success/Warning/Error) keep their Default colors, dimmed by the opacity

## Developer Handoff

### Suggested API

```
<uems-tag
  variant="neutral | primary | success | warning | error | outline"  (default: neutral)
  size="small | medium | large"                                      (default: small)
  disabled                                                            (boolean)
  removable                                                           (default: true → close button)
  leading="none | status | icon"                                      (default: none)
  status="..."                                                        (forwarded to embedded status dot)
>Tag</uems-tag>
<!-- events: remove (close click / Backspace / Delete) -->
```

### HTML structure

```html
<span class="tag tag--neutral tag--medium" tabindex="0">
  <svg class="tag__leading-icon" aria-hidden="true"><!-- optional --></svg>
  <span class="tag__label">Marketing</span>
  <button class="tag__close" type="button" aria-label="Remove Marketing" tabindex="-1">
    <svg aria-hidden="true"><!-- ✕ --></svg>
  </button>
</span>
```

### CSS

```css
.tag {
  display: inline-flex;
  align-items: center;            /* vertical centering replaces V padding */
  box-sizing: border-box;
  gap: 2px;
  width: fit-content;
  border-radius: var(--uems-radius-xs, 4px);
  font-family: 'Zoho Puvi', sans-serif;
  font-weight: 500;
  white-space: nowrap;
  background: var(--tag-bg, transparent);
  color: var(--tag-fg);
  border: var(--tag-border, none);
}

/* sizes — logical properties so dir="rtl" mirrors padding automatically */
.tag--small  { height: 16px; font-size: var(--uems-font-size-10); line-height: 14px;
               padding-inline: 4px 4px; }
.tag--medium { height: 20px; font-size: var(--uems-font-size-12); line-height: 16px;
               padding-inline: 6px 4px; }
.tag--large  { height: 24px; font-size: var(--uems-font-size-14); line-height: 20px;
               padding-inline: 8px 4px; border-radius: var(--uems-radius-default, 6px); }

/* leading-element padding adjustments */
.tag--leading-status { padding-inline-start: 4px; }
.tag--medium.tag--leading-icon { padding-inline-end: 6px; }
.tag--large.tag--leading-icon  { padding-inline-end: 8px; }

/* variants */
.tag--neutral { --tag-bg: var(--uems-bg-secondary);        --tag-fg: var(--uems-text-primary); }
.tag--primary { --tag-bg: var(--uems-bg-accent-primary);   --tag-fg: var(--uems-text-accent-secondary); }
.tag--success { --tag-bg: var(--uems-bg-success-primary);  --tag-fg: var(--uems-text-success); }
.tag--warning { --tag-bg: var(--uems-bg-warning-primary);  --tag-fg: var(--uems-text-warning); }
.tag--error   { --tag-bg: var(--uems-bg-error-primary);    --tag-fg: var(--uems-text-error); }
.tag--outline { --tag-bg: transparent;                     --tag-fg: var(--uems-text-primary);
                --tag-border: 1px solid var(--uems-border-secondary); }

/* hover */
.tag--neutral:hover:not(.tag--disabled) { --tag-bg: var(--uems-bg-secondary-hover); }
.tag--primary:hover:not(.tag--disabled) { --tag-bg: var(--uems-bg-accent-primary-hover); }
.tag--success:hover:not(.tag--disabled) { --tag-bg: var(--uems-bg-success-secondary); }
.tag--warning:hover:not(.tag--disabled) { --tag-bg: var(--uems-bg-warning-secondary); }
.tag--error:hover:not(.tag--disabled)   { --tag-bg: var(--uems-bg-error-secondary); }
.tag--outline:hover:not(.tag--disabled) { --tag-bg: var(--uems-bg-primary-hover); }

/* focus — ring, tag itself unchanged */
.tag:focus-visible {
  outline: 2px solid var(--uems-border-accent-focus);
  outline-offset: 2px;
}

/* disabled */
.tag--disabled { opacity: 0.5; pointer-events: none; }
.tag--disabled.tag--neutral { --tag-bg: var(--uems-bg-disabled); --tag-fg: var(--uems-text-disabled);
                              --tag-border: 1px solid var(--uems-border-disabled); }
.tag--disabled.tag--outline { --tag-fg: var(--uems-text-disabled);
                              --tag-border: 1px solid var(--uems-border-disabled); }

/* close button — 16×16 in every size; full-bleed at Small */
.tag__close {
  width: 16px; height: 16px;
  display: grid; place-items: center;
  flex-shrink: 0;
  border: none; background: transparent; padding: 0;
  border-radius: var(--uems-radius-pill);      /* Medium/Large: circular */
  color: var(--uems-icon-tertiary);
  cursor: pointer;
}
.tag--small .tag__close { border-radius: 2px; } /* Small: square — see flag 8 */
.tag__close:hover  { background: var(--uems-bg-primary-hover); }
.tag__close:active { background: var(--uems-bg-secondary); color: var(--uems-icon-accent-button); }
.tag--disabled .tag__close { color: var(--uems-icon-disabled); }

/* leading icon — variant-colored stroke icon */
.tag__leading-icon { stroke: var(--tag-icon, var(--uems-icon-primary)); fill: none; flex-shrink: 0; }
.tag--primary { --tag-icon: var(--uems-icon-accent); }
.tag--success { --tag-icon: var(--uems-icon-success); }
.tag--warning { --tag-icon: var(--uems-icon-warning); }
.tag--error   { --tag-icon: var(--uems-icon-error); }
```

## States and Interactions

| Event | Behavior |
|---|---|
| Hover (tag) | Background deepens one step (matrix above); cursor default unless the tag itself triggers an action |
| Close click | Emits `remove`; consumer removes the tag. Move focus to the next tag (or the input) after removal |
| `Backspace` / `Delete` while tag focused | Same as close click |
| Focus | Accent ring (outline, 2px offset); tag is one tab stop — the close button is `tabindex="-1"` and reached via the tag (roving pattern) |
| Disabled | 50% opacity, token swaps for Neutral/Outline, no hover, no remove, skipped in tab order |
| RTL | `dir="rtl"` + logical properties mirror layout (close becomes visually leading); supply translated label content — Figma maintains a separate `RTL Label` |

## Edge Cases

- **Long label:** single line, `nowrap`; in constrained containers truncate the **label** with ellipsis — never shrink the close button (`flex-shrink: 0`).
- **No close (`Show Close=false`):** close-side padding stays 4px (or symmetric for Icon leading); width simply shrinks.
- **Many tags:** consumer wraps in a flex row with its own gap; tag never grows to fill.
- **Tag + status dot:** forward `status` to the embedded indicator; the dot is decorative (see Status Indicator spec).
- **Empty label:** not supported — minimum content is one character.

## Animation / Motion

Not specified in Figma. Suggested: 120ms ease-out background transition on hover; on removal, no exit animation required (instant reflow is acceptable). Respect `prefers-reduced-motion`.

## Accessibility

| Concern | Guidance |
|---|---|
| Tag semantics | `<span tabindex="0">` in a list (`role="listbox"`/`listitem` patterns per context); if the tag triggers navigation/filtering, use a `<button>` |
| Close button | Real `<button>` with `aria-label="Remove {label}"`; `tabindex="-1"` so each tag is a single tab stop |
| Keyboard removal | `Backspace`/`Delete` on the focused tag mirrors close-click; required for parity |
| Focus visibility | `:focus-visible` ring as specced — never remove the outline without replacement |
| Disabled | `aria-disabled="true"`; remove from tab order |
| Color | Variant color is supplementary — the label text carries meaning |
| RTL | `dir` attribute + logical properties; don't mirror icons that imply reading direction |
| Contrast | All variant label-on-bg pairs are dark-on-tint; Small text is 10px Medium — avoid Small on non-standard backgrounds |

## Verification

All **432 variants** were programmatically checked: per-size geometry (heights 16/20/24, text-side/close-side padding incl. leading-element adjustments, gap, radius), full Variant × State token matrix (bg/border/label/close), Focus ring structure (2px accent border, 4px pad, +8px envelope), Disabled opacity 0.5 + token swaps, typography (Zoho Puvi Medium 10/14, 12/16, 14/20), close button sizing and `Show Close` binding, leading-element visibility and sizing per axis, and RTL child order + `RTL Label` usage. After the 2026-06-11 fixes, **424/432 conform geometrically; 405/432 conform on every checked property** (see tally below). Property wiring was inspected and is fully bound: `Label` → LTR text characters, `RTL Label` → RTL text characters, `Show Close` → close visibility, `Leading Icon` / `Status Indicator` → their instance swaps. The embedded Icon Button's own state set (hover/active/disabled) and the leading icon + status dot color tokens were extracted from the source components rather than assumed. A 2026-06-11 re-verification against the live file found two drifts missed by the original pass (flags 10–11) and one icon-padding exception (flag 7). The 18 Outline Focus missing borders and the icon-padding exception were **fixed in Figma the same day**, leaving **8 geometry anomalies** (2 zero-V-padding + 4 oversized Small Focus + 2 malformed rings) and **21 token inconsistencies** (1 stray Neutral Default fill + 18 Neutral Focus fills + 2 disabled leading-icon swaps, pending the flag-11 decision) — 27 distinct drifted variants. All are Figma-side authoring drift, listed below — none change this spec's code.

## Flags for design

1. **One stray Default background** — `Neutral / Small / Default / LTR / None` (the set's *default variant*) uses `BG-Secondary-alt`; the other 17 Neutral Default/Hover-family variants use `BG-Secondary`. Identical in Light theme, one step apart in Dark. Code uses `BG-Secondary`.
2. **Neutral Focus inners use `BG-Secondary-alt`** (all 18) while Neutral Default uses `BG-Secondary` — focusing a neutral tag shouldn't change its fill. Code keeps `BG-Secondary` and adds only the ring.
3. **Two Small Focus variants declare 0 vertical padding** (`Neutral/Small/Focus/None`, both RTL) vs 2px everywhere else — no visual impact (the 16px close bleeds anyway).
4. **Four oversized Small Focus variants** — `Warning / Small / Focus` with Status Indicator and Icon (both RTL) contain a 20px-tall (Medium-height) tag inside the ring. Should be 16px.
5. **Two malformed focus rings** — `Success / Medium / Focus / Status Indicator` (both RTL) have ~2px ring padding instead of 4px (ring envelope 24px instead of 28px).
6. **Close button bleeds Small padding** — by design or not, the 16×16 close occupies Small's full height; documented here as the implementation rule (height + centering, no vertical padding).
7. **Icon-leading symmetric padding** — Icon variants use 6/6 and 8/8 horizontal padding on Medium/Large (close-side loses its 4px rule). Treated as intentional; confirm. One drifted variant (`Outline / Medium / Default / LTR / Icon` at 8/8 instead of 6/6) was **fixed in Figma 2026-06-11**; all 144 Icon variants now conform.
8. **Close button shape differs by size** — Small embeds the `Shape=Square` icon button (2px radius); Medium and Large embed `Shape=Circle` (pill). Possibly intentional (a circle reads poorly at 16px-tight Small), but worth confirming; code follows the drawing.
9. **Close icon token override** — the tag overrides the icon button's default `Icon-Secondary` to `Icon-Tertiary`. Intentional-looking (softer ✕ inside a tinted chip), recorded so implementers don't "fix" it back.
10. **Outline Focus dropped its border** — all 18 `Outline / Focus` variants had **no stroke** on the inner tag (the 1px `Border-Secondary` was missing; only the wrapper's 2px accent ring remained). Same drift family as flag 2: focusing a tag shouldn't restyle it. **Fixed in Figma 2026-06-11** — the `Border-Secondary` 1px inside stroke was restored on all 18 inner frames; code keeps the border and adds only the ring.
11. **Two disabled leading-icon token swaps** — `Outline / Small / Disabled / Icon` (both RTL) bind the leading icon to `Icon-Disabled` instead of `Icon-Primary`; the Medium/Large Outline Disabled Icon variants keep `Icon-Primary`. Code follows the majority (variant token, dimmed by the tag's 50% opacity); confirm whether the explicit `Icon-Disabled` swap is the intended end state.

---

*Generated from UEMS Design System 3.0 · Figma node `16462:101691` · 2026-06-11 · all 432 variants + property wiring verified · re-verified against live file 2026-06-11 (flags 10–11 added, flag 7 amended; flag 10 + flag 7 drift fixed in Figma, comment posted on the component set for flag 11)*
