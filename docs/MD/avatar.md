---
name: Avatar
description: Circular representation of a user or entity. Renders a photo, two-letter initials, or a placeholder person icon at three fixed sizes, with an editable hover overlay and a disabled state. Always circular; RTL-safe via Auto Layout.
type: component
status: stable
category: Data
figma:
  file: UEMS — Design System 3.0
  fileKey: DahIgbIJrSkzyP3OoHaDaG
  nodeId: "16021:26134"
  url: https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16021-26134
variants:
  axes:
    - { name: Size,  values: [Small, Medium, Large] }
    - { name: Type,  values: [Image, Initials, Placeholder Icon, Hover] }
    - { name: State, values: [Default, Disabled] }
  total: 24
properties:
  - { name: Initials Text, type: TEXT, default: "JD" }
  - { name: Icon, type: INSTANCE_SWAP, appliesTo: [Placeholder Icon, Hover] }
---

# Avatar

> A circular stand-in for a person or entity. When a profile photo exists, the Avatar shows it; when it doesn't, it gracefully degrades to the user's **initials**, and failing that to a neutral **placeholder icon**. A dark **hover** overlay turns the avatar into an "edit / change photo" affordance, and a muted **disabled** state covers inactive accounts. It comes in three fixed sizes and is always a perfect circle.

| Meta | Value |
|---|---|
| Component name | `Avatar` |
| Type | `COMPONENT_SET` |
| Variants | 24 (full cube — 3 × 4 × 2) |
| Default | `Size=Small, Type=Image, State=Default` |
| Shape | Always circular (`border-radius: 9999`) |
| Figma node | `16021:26134` |

---

## At a glance

An Avatar answers *"who is this?"* in the smallest possible footprint. It has a strict fallback ladder:

1. **Image** — the user's photo (preferred).
2. **Initials** — two letters on a solid fill when there's no photo.
3. **Placeholder Icon** — a neutral person glyph when there's neither photo nor name.

Plus two overlay/condition states layered on top of any of the above:

- **Hover** — a dark scrim + icon shown while pointing at an editable avatar (upload / change photo).
- **Disabled** — a muted treatment for inactive or non-interactive accounts.

The set spans three independent axes:

- **Size** controls the diameter — `Small` (24px), `Medium` (32px), `Large` (52px).
- **Type** controls *what fills the circle* — Image, Initials, Placeholder Icon, or the Hover overlay.
- **State** is `Default` or `Disabled`.

All 24 cells of the 3 × 4 × 2 cube exist — every Size/Type combination has both a Default and a Disabled variant.

---

## Variants

### Size — diameter

| Value | Diameter | Initials type | Icon glyph |
|---|---|---|---|
| **Small** | `24px` | Zoho Puvi Medium · 10 / 14 | ~16px |
| **Medium** | `32px` | Zoho Puvi Medium · 12 / 16 | `20px` |
| **Large** | `52px` | Zoho Puvi Medium · 16 / 24 | ~24px |

Sizes are fixed — the Avatar does not stretch. Pick the size that matches its context (see [Choosing a size](#choosing-a-size)).

### Type — circle content

| Value | What fills the circle | Default background | Foreground |
|---|---|---|---|
| **Image** | A profile photo, cover-cropped to the circle | photo | the photo itself |
| **Initials** | Two-letter initials (e.g. "JD") | `BG-Quaternary-Solid` (`#5F6C89`) | white text |
| **Placeholder Icon** | A neutral person glyph | `BG-Quaternary-Solid` (`#5F6C89`) | white icon |
| **Hover** | A dark scrim + action icon over the avatar | `BG-Overlay` (`#0A0B0F`) | white icon (camera / image) |

> **Hover is an overlay, not a separate user state.** It's the editable affordance shown when a user points at their own avatar to replace the photo. In code this is a `:hover`/`:focus-within` treatment, not a distinct data type.

### State — condition

| Value | Background | Foreground | Use |
|---|---|---|---|
| **Default** | per Type (photo / `#5F6C89` / overlay) | full color | Active, normal account |
| **Disabled** | `BG-Disabled` (`#E1E4EB`) | `Text-Disabled` / `Icon-Disabled` (`#8893AD`); image dimmed | Inactive / non-interactive account |

### Variant matrix

The 24 variants form a complete cube — no missing cells: **3 sizes × 4 types × 2 states = 24**, every Size/Type combination has both a Default and a Disabled variant.

---

## Anatomy

```
Type=Image            Type=Initials         Type=Placeholder      Type=Hover
  ( photo )             (  JD  )              (  person )           ( camera )
 photo, cover-          white initials on     white person glyph    white icon on a
 cropped to circle      #5F6C89 fill          on #5F6C89 fill       #0A0B0F dark scrim
```

### Slot inventory

| Slot | Present in | Owned by |
|---|---|---|
| Image fill | `Type=Image` | photo source (cover-cropped, clipped to circle) |
| Initials text | `Type=Initials` | `Initials Text` property (default `JD`) |
| Placeholder glyph | `Type=Placeholder Icon` | `Icon` instance-swap property |
| Hover overlay + icon | `Type=Hover` | `Icon` instance-swap property over a `BG-Overlay` scrim |

---

## Component properties

| Axis / Property | Type | Default | Values / Notes |
|---|---|---|---|
| `Size` | VARIANT | `Small` | Small, Medium, Large |
| `Type` | VARIANT | `Image` | Image, Initials, Placeholder Icon, Hover |
| `State` | VARIANT | `Default` | Default, Disabled |
| `Initials Text` | TEXT | `JD` | Editable two-letter initials. Used by `Type=Initials`. |
| `Icon` | INSTANCE_SWAP | person / image glyph | Swappable icon for `Type=Placeholder Icon` and `Type=Hover`. |

---

## Design tokens

> ⚠️ **Correction vs. the Figma description note.** The component's authored description references `BG-Accent-Secondary` / `BG-Accent-Sec-Solid`, but the **live, rendered** bindings are different (verified against the published variants). The table below reflects the *actual* token bindings. Values shown are the **Light theme** resolution; every token also resolves in Dark / Night / Green themes.

### Surface & foreground

| Element | Token | Light value | CSS var |
|---|---|---|---|
| Initials / Placeholder background (Default) | `Background/BG-Quaternary-Solid` | `#5F6C89` | `--bg-quaternary-solid` |
| Initials text (Default) | `Text/Text-White` | `#FFFFFF` | `--text-white` |
| Placeholder / Hover icon (Default) | `Border/Icon/Icon-White` | `#FFFFFF` | `--icon-white` |
| Hover overlay scrim | `Background/BG-Overlay` | `#0A0B0F` | `--bg-overlay` |
| Disabled background | `Background/BG-Disabled` | `#E1E4EB` | `--bg-disabled` |
| Disabled text | `Text/Text-Disabled` | `#8893AD` | `--text-disabled` |
| Disabled icon | `Border/Icon/Icon-Disabled` | `#8893AD` | `--icon-disabled` |
| Image fill | — | the photo, `object-fit: cover` | — |

### Geometry

| Property | Value | Notes |
|---|---|---|
| Shape | `border-radius: 9999` | Always a perfect circle |
| Size · Small | `24 × 24px` | |
| Size · Medium | `32 × 32px` | |
| Size · Large | `52 × 52px` | |
| Image crop | cover (image sized larger than the frame, centered, clipped) | No distortion |

### Typography (initials)

| Size | Token spec | Font |
|---|---|---|
| Small | `10 / 14` | Zoho Puvi · Medium |
| Medium | `12 / 16` | Zoho Puvi · Medium |
| Large | `16 / 24` | Zoho Puvi · Medium |

### Icon glyph

| Size | Glyph |
|---|---|
| Small | ~16px |
| Medium | `20px` (measured) |
| Large | ~24px |

---

## States & interaction

| State | Trigger | Appearance |
|---|---|---|
| **Default** | Resting | Photo, initials, or placeholder per Type |
| **Hover** | Pointer over an *editable* avatar | `BG-Overlay` (`#0A0B0F`) scrim + white camera/image icon — the "change photo" affordance |
| **Disabled** | Inactive / non-interactive account | `BG-Disabled` surface, `Text-Disabled`/`Icon-Disabled` foreground; image fill dimmed |

- The **Hover** type is only meaningful when the avatar is the user's *own*, editable photo. For read-only avatars (showing other people), don't render a hover overlay.
- Avatars are **not interactive by default**. If an avatar opens a menu or profile, wrap it in a button/link and apply that control's focus ring — the Avatar itself has no focus state.

---

## Usage

### When to use

- **Identifying a user** in lists, tables, comments, mentions, assignee fields, and headers.
- **Account / profile entry points** — the current user in a top bar or settings page.
- **Editable profile photo** — pair `Type=Image` with the `Hover` overlay to let users replace their picture.
- **Stacked groups** — overlap multiple Avatars to represent a set of collaborators (build the stack in the parent, not in this component).

### When **not** to use

| Situation | Use instead |
|---|---|
| Representing a file, app, or non-person entity with a logo | App / product icon, not a person Avatar |
| A status dot or count | Badge / Counter (can be layered *on* an Avatar) |
| A large hero profile image | A dedicated image component — Avatar maxes out at 52px |
| Decorative imagery | Plain `<img>` |

### Choosing a size

| Context | Size |
|---|---|
| Dense tables, comment threads, mention chips, multi-avatar stacks | `Small` (24) |
| Default lists, cards, toolbars, assignee pickers | `Medium` (32) |
| Profile headers, account menus, "current user" emphasis | `Large` (52) |

### Best practices

| ✅ Do | ❌ Don't |
|---|---|
| Follow the fallback ladder: photo → initials → placeholder. | Show a placeholder icon when initials are available. |
| Use exactly **two** uppercase initials (first + last). | Cram three+ letters or lowercase into the circle. |
| Cover-crop photos so faces stay centered. | Distort or letterbox the image — it must fill the circle. |
| Reserve the `Hover` overlay for the user's *own*, editable avatar. | Show an edit overlay on read-only avatars of other people. |
| Keep one consistent size within a single list or row. | Mix sizes in the same row — it breaks visual rhythm. |
| Pair the Avatar with the user's name in text nearby. | Rely on the avatar alone to identify someone. |
| Generate the initials fill deterministically (or use the single `BG-Quaternary-Solid` token). | Randomize colors so the same user looks different across pages. |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Alt text** | `Type=Image` needs a meaningful `alt` — the person's name (`alt="Jane Doe"`). Don't write `alt="avatar"`. |
| **Initials / placeholder** | When the visual is initials or a placeholder, expose the full name via `aria-label` or adjacent visible text — initials alone aren't sufficient for screen readers. |
| **Decorative duplication** | If the user's name already appears as visible text right next to the avatar, mark the avatar `aria-hidden="true"` / `alt=""` to avoid double announcement. |
| **Contrast** | White text/icon on `#5F6C89` and white icon on the `#0A0B0F` overlay both meet WCAG AA. Disabled foreground (`#8893AD` on `#E1E4EB`) is intentionally low-contrast — never use it to convey essential info. |
| **Interaction** | If the avatar triggers an action, wrap it in a real `<button>`/`<a>` with an accessible name and a visible focus ring; don't attach click handlers to the bare circle. |
| **Hover affordance** | The "change photo" overlay must also be reachable on keyboard focus (`:focus-within`), not hover only. |
| **RTL** | Built with Auto Layout, so it mirrors cleanly. In avatar+name rows the avatar moves to the right edge in RTL. |

---

## API (engineering)

```ts
type AvatarSize  = 'small' | 'medium' | 'large';      // 24 | 32 | 52 px
type AvatarType  = 'image' | 'initials' | 'placeholder';

interface AvatarProps {
  size?: AvatarSize;                 // default: 'small'
  /** Photo URL. If present and it loads → image type. */
  src?: string;
  /** Full name — drives alt text AND the initials fallback. */
  name?: string;
  /** Override the derived initials (max 2 chars). */
  initials?: string;                 // default: derived from `name`
  /** Custom placeholder glyph when neither src nor name exist. */
  icon?: React.ReactNode;
  /** Show the editable "change photo" overlay (own avatar only). */
  editable?: boolean;
  disabled?: boolean;
  /** Promote to an interactive control. */
  onClick?: () => void;
  'aria-label'?: string;
}
```

### Implementation notes

- **Type is derived, not passed.** Resolve at render time: `src` that loads → image; else `name`/`initials` → initials; else → placeholder. Don't make consumers pick the type manually.
- **Handle image load failure.** If the `<img>` errors, fall back to initials, then placeholder — never show a broken-image glyph.
- **`editable` ≠ a Figma "Hover" type.** Implement the Hover variant as a CSS `:hover, :focus-within` overlay (`BG-Overlay` scrim + camera icon) shown only when `editable` is true.
- **Always clip to a circle** with `border-radius: 50%` and `object-fit: cover` on the image so non-square photos don't distort.
- **Initials:** uppercase, first letter of first + last name; one letter if only a single name is supplied.

---

## Related components

| Component | Use it for |
|---|---|
| `Badge` / `Counter` | A status dot or number layered on top of an Avatar (online dot, notification count). |
| `Avatar Group` | An overlapping stack of avatars representing multiple people — composed from this component. |
| `Icon Button` | An interactive icon action, when you need a control rather than an identity. |
| `Tag` / `Chip` | A user mention with a small avatar + name in running text. |

---

## Changelog

| Date | Change |
|---|---|
| 2026-06-09 | Initial documentation generated from Figma node `16021:26134` (24-variant set). Token bindings verified against live variants and corrected from the authored description (`BG-Quaternary-Solid` / `BG-Overlay`, not `BG-Accent-Secondary`). |
