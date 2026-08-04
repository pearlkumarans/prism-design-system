# Rich Text Editor

A Rich Text Editor lets users write and format long-form content with inline styles (bold, italic, underline, strikethrough), headings, lists, links, images, and tables. The component supports two toolbar styles — a persistent **Fixed** toolbar pinned to the editor chrome, and a contextual **Floating** popover that appears on text selection — plus a chrome-free **Hidden** mode for minimal interfaces.

**Figma source:** [UEMS Design System 3.0 — Rich Text Editor](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=18028-832135)
**Component node:** `18028:832135` (Rich Text Editor component set)
**Last updated:** 2026-04-18

---

## Anatomy

**Default — Fixed toolbar**
```
┌─ Rich Text Editor ──────────────────────────────────────────────────────────┐
│  Label                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Normal ▾ │ B  I  U  S │ A ▾ │ • ▾  ≡ ▾ │ 🔗 ⊞ ─ ▤ ▾ │                ⋮ │ │ ← Fixed toolbar
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  Start typing...                                                       │ │
│  │                                                                        │ │
│  │                                                                      ↘ │ │ ← Resize grip
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ⓘ  Type $ to add variables                                                │ ← Helper row
└─────────────────────────────────────────────────────────────────────────────┘
```

**Floating toolbar (visible on selection / Focus / Filled)**
```
┌─ Rich Text Editor ──────────────────────────────────────────────────────────┐
│  Label                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  The quick brown ▮fox jumps▮ over the lazy dog.                        │ │
│  │          ┌──────────────────────────────────┐                          │ │
│  │          │ 🔗 │ B  I  U │ A ▾ │ Normal ▾    │  ← Floating popover       │ │
│  │          └───────────────▼──────────────────┘                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ⓘ  Type $ to add variables                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Hidden toolbar (no chrome)**
```
┌─ Rich Text Editor ──────────────────────────────────────────────────────────┐
│  Label                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Start typing...                                                       │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ⓘ  Type $ to add variables                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Label Row** | Field label. Semibold, 13 px. Toggleable via `Show Label`. |
| **Editor Frame** | Outer container: 640 px min-width, 8 px corner radius, 1 px border, `overflow: hidden`. |
| **Fixed Toolbar** | Persistent formatting controls pinned to the top of the editor frame. Full width, bottom border, `BG-Base-White`. |
| **Floating Toolbar** | Compact popover overlaid on the editor body. Visible only in `Focus` and `Filled` states, anchored to the current selection with an arrow. `BG-Base-White` + `Shadow-Medium`. |
| **Editor Body** | The editable content surface. `BG-Primary-alt`, 16 px padding, 160 px min-height. Holds placeholder text or user content. |
| **Resize Grip** | Diagonal handle at the bottom-right corner for vertical drag-resize (design affordance; implement via CSS `resize: vertical` in code). |
| **Helper Row** | Instance of `Form Field Helper Row` below the editor. Icon + helper text (default: `Type $ to add variables`). Toggleable via `Show Helper Row`. |

---

## Variants

### State

| State | Description | Border token |
|---|---|---|
| `Default` | Empty editor with placeholder text. Fixed toolbar visible; Floating toolbar hidden. | `Border/Border-Secondary` |
| `Focus` | Editor has keyboard focus. 2 px accent border + blue focus shadow. Floating toolbar visible. | `Border/Border-Accent` (2 px) |
| `Filled` | Editor contains content but is not focused. Floating toolbar visible (last known position). | `Border/Border-Secondary` |
| `Error` | Validation error. Red border + error shadow + negative helper row. Toolbar remains interactive. | `Border/Border-Error` |
| `Disabled` | Non-interactive, 50 % opacity, `BG-Disabled`, toolbar removed. | `Border/Border-Disabled` |
| `Read Only` | Content displayed without editing affordances. `BG-Secondary` editor body, toolbar removed. | `Border/Border-Disabled` |

### Toolbar

| Value | Description |
|---|---|
| `Fixed` | Persistent toolbar pinned to the top of the editor. Best for content-heavy, long-form editing (descriptions, articles, knowledge-base entries). |
| `Floating` | Contextual popover anchored to the current selection. Best for inline editing where chrome would distract (comments, chat, compact forms). |
| `Hidden` | No toolbar rendered. Use when formatting is controlled by keyboard shortcuts only, or when the field is effectively a styled `textarea`. |

### RTL

| Value | Description |
|---|---|
| `False` | Left-to-right reading order (default). Label `"Label"`, placeholder `"Start typing..."`. |
| `True` | Right-to-left layout (Arabic, Hebrew). Label/placeholder/toolbar order all mirror. Localised strings: label `"التسمية"`, placeholder `"ابدأ الكتابة..."`, helper `"اكتب $ لإضافة المتغيرات"`. |

---

## Variant Matrix

All combinations of variant axes:

- **6 states** × **3 toolbar styles** × **2 directions** = **36 Rich Text Editor variants**

---

## Props / API

### Rich Text Editor

| Prop | Type | Default | Description |
|---|---|---|---|
| `state` | `'Default' \| 'Focus' \| 'Filled' \| 'Error' \| 'Disabled' \| 'Read Only'` | `'Default'` | Interaction / validation state of the editor. Normally driven by focus, value, and validation in code — only passed explicitly for `Disabled`, `Read Only`, or forced `Error`. |
| `toolbar` | `'fixed' \| 'floating' \| 'hidden'` | `'fixed'` | Toolbar presentation style. See [Variants → Toolbar](#toolbar). |
| `rtl` | `boolean` | `false` | Switches to right-to-left layout mode. |
| `showLabel` | `boolean` | `true` | Shows or hides the label row. |
| `label` | `string` | `"Label"` | Field label text. |
| `placeholder` | `string` | `"Start typing..."` | Placeholder shown when the editor is empty. |
| `showHelperRow` | `boolean` | `true` | Shows or hides the helper text row below the editor. |
| `helperText` | `string` | `"Type $ to add variables"` | Contextual hint / validation message in the helper row. |
| `helperIconSwap` | `ReactNode` | Info icon | Instance-swap slot for the helper-row icon. |
| `value` | `string` (HTML / JSON) | `""` | Controlled value of the editor, as HTML or the serialised format your engine uses (e.g. ProseMirror JSON, Lexical state). |
| `onChange` | `(value: string) => void` | — | Fires whenever the document changes. |
| `onFocus` | `() => void` | — | Fires on editor focus. Use to show the floating toolbar. |
| `onBlur` | `() => void` | — | Fires on editor blur. |
| `minHeight` | `number` | `160` | Minimum height (px) of the editor body. |
| `minWidth` | `number` | `640` | Minimum width (px) of the editor frame. |
| `resizable` | `boolean` | `true` | Allows vertical drag-resize via the bottom-right grip. |
| `readOnly` | `boolean` | `false` | Convenience alias for `state="Read Only"`. |
| `isDisabled` | `boolean` | `false` | Convenience alias for `state="Disabled"`. |

### Fixed Toolbar (sub-component)

| Group | Controls |
|---|---|
| **Block style** | `Normal ▾` paragraph style picker (Normal, H1, H2, H3, Quote, Code block) |
| **Inline format** | `B` Bold · `I` Italic · `U` Underline · `S` Strikethrough |
| **Colour** | `A ▾` text/highlight colour picker |
| **Lists** | `• ▾` bullet / numbered / todo list · `≡ ▾` alignment |
| **Insert** | `🔗` link · `⊞` table · `─` divider · `▤ ▾` image / embed |
| **Overflow** | `⋮` more-actions menu |

### Floating Toolbar (sub-component)

Compact selection toolbar: `B` · `I` · `U` · separator · `🔗` link · separator · `Normal ▾` block style. Includes a 6 px arrow pointing to the selection.

---

## Design Tokens

### Colour

| Token | Role |
|---|---|
| `Background/BG-Primary-alt` | Editor body background (Default, Focus, Filled, Error) |
| `Background/BG-Base-White` | Fixed toolbar background; Floating toolbar background |
| `Background/BG-Secondary` | Editor body background (Read Only) |
| `Background/BG-Disabled` | Editor body + toolbar background (Disabled) |
| `Border/Border-Secondary` | Editor frame border (Default, Filled) |
| `Border/Border-Accent` | Editor frame border (Focus — 2 px stroke) |
| `Border/Border-Error` | Editor frame border (Error) |
| `Border/Border-Disabled` | Editor frame border (Disabled, Read Only) |
| `Text/Text-Primary` | Editor content text |
| `Text/Text-Placeholder` | Placeholder text |
| `Text/Text-Tertiary` | Label, helper text (default) |
| `Text/Text-Disabled` | Label, helper text, content (Disabled) |
| `Text/Text-Error` | Helper text (Error) |
| `Border/Icon/Icon-Tertiary` | Toolbar icon buttons (default) |
| `Border/Icon/Icon-Primary` | Toolbar icon buttons (active / selected) |
| `Shadow/Shadow-Focus-Blue` | Focus ring on editor frame |
| `Shadow/Shadow-Focus-Red` | Error glow on editor frame |
| `Shadow/Shadow-Medium` | Floating-toolbar drop shadow |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing/4` | 4 px | Toolbar button gap |
| `spacing/8` | 8 px | Root vertical gap (label ↔ editor ↔ helper) |
| `spacing/16` | 16 px | Editor body padding |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `border-radius/radius-8` | 8 px | Editor frame corners |
| `border-radius/radius-6` | 6 px | Floating toolbar popover corners |
| `border-radius/radius-4` | 4 px | Toolbar icon-button corners |

---

## Typography

| Element | Font | Size | Weight | Line Height | Token |
|---|---|---|---|---|---|
| Label | Zoho Puvi | 13 px | Semibold (600) | 20 px | `body/Small/Medium` |
| Editor content | Zoho Puvi | 14 px | Regular (400) | 22 px | `body/Default/Regular` |
| Placeholder | Zoho Puvi | 14 px | Regular (400) | 22 px | `body/Default/Regular` |
| Helper text | Zoho Puvi | 12 px | Regular (400) | 16 px | `body/Small/Default` |
| Toolbar block-style label | Zoho Puvi | 13 px | Regular (400) | 20 px | `body/Small/Default` |
| Heading 1 (inside editor) | Zoho Puvi | 24 px | Semibold (600) | 32 px | `heading/H1` |
| Heading 2 (inside editor) | Zoho Puvi | 20 px | Semibold (600) | 28 px | `heading/H2` |
| Heading 3 (inside editor) | Zoho Puvi | 16 px | Semibold (600) | 24 px | `heading/H3` |

---

## Spacing & Sizing Reference

| Property | Value |
|---|---|
| Editor frame min-width | **640 px** |
| Editor body min-height | **160 px** |
| Editor body padding | 16 px (`spacing/16`) |
| Fixed toolbar height | 40 px |
| Fixed toolbar padding | 8 px horizontal / 4 px vertical |
| Floating toolbar padding | 4 px |
| Floating toolbar arrow size | 6 px |
| Toolbar icon-button size | 28 × 28 px |
| Toolbar group separator | 1 px × 16 px, `Border/Border-Secondary` |
| Corner radius (frame) | 8 px (`border-radius/radius-8`) |
| Corner radius (toolbar button) | 4 px (`border-radius/radius-4`) |
| Default border stroke | 1 px |
| Focus border stroke | **2 px** |
| Root vertical gap | 8 px (`spacing/8`) |

---

## Usage

### When to use

- For **long-form, formatted content** — descriptions, knowledge-base articles, announcements, email bodies, release notes.
- When users need **inline styles** (bold/italic), **block structures** (headings, lists, quotes), or **embedded objects** (links, images, tables).
- When content must be **rendered later** in a non-editable view (e.g. published post, preview pane).
- When variable/token insertion (`$variable$`) is part of the authoring flow.

### When not to use

- **Short single-line input** → use [Text Input Field](./text-input.md).
- **Plain multi-line free text** without formatting → use [Text Area](./text-area.md).
- **Code or scripting input** with syntax highlighting → use [Script Editor](./script-editor.md).
- **Markdown-only** input where live preview is required → use a dedicated markdown editor pattern.

### Toolbar style decision

| Situation | Recommended toolbar |
|---|---|
| Dedicated authoring surface (article editor, compose screen) | `Fixed` |
| Inline edit zone inside a form with many other fields | `Floating` |
| Comments / chat / reply boxes where chrome is distracting | `Floating` or `Hidden` |
| Read-only rendering of rich content | `Hidden` + `state="Read Only"` |
| Mobile / very narrow viewport | `Floating` (Fixed toolbar wraps awkwardly below 640 px) |

### Do / Don't

| Do | Don't |
|---|---|
| Keep the editor at 640 px or wider so the Fixed toolbar fits on one row | Shrink below 640 px — the Fixed toolbar will wrap; switch to `Floating` instead |
| Use `Floating` toolbar for compact inline editors (comments, chat) | Use `Fixed` inside a narrow side panel or drawer |
| Pair `Error` state with a helper-row message that explains the problem | Show the red error border without helper text |
| Use `Read Only` to display rich content outside an edit flow | Use `Disabled` to show read-only content — `Disabled` communicates "cannot interact right now" |
| Persist formatting in a structured format (HTML or editor JSON) | Store pasted rich content as raw HTML without sanitisation |
| Allow vertical resize for long-form editing | Allow horizontal resize — widths should be layout-driven |
| Use the Floating toolbar's arrow to point at the active selection | Leave the arrow floating over unrelated content when selection is cleared |
| Localise the placeholder, label, and helper strings in RTL mode | Force English chrome inside an Arabic/Hebrew layout |
| Sanitise and paste-clean external content (strip styles, scripts) | Allow arbitrary HTML and inline `<script>` from pasted content |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Element** | Use a proper editor runtime (ProseMirror, Lexical, TipTap, Slate). A bare `contenteditable` div without a framework will not meet WCAG. |
| **Label association** | Connect the visible label to the editable region via `aria-labelledby`. Do not rely on `<label for>` — `contenteditable` is not a form control. |
| **Role** | The editable region should expose `role="textbox"` with `aria-multiline="true"`. |
| **Validation** | Set `aria-invalid="true"` in Error state; link the helper-row message via `aria-describedby`. |
| **Read Only** | Set `aria-readonly="true"` and remove edit controls. Use `contenteditable="false"` (or the editor's read-only mode). |
| **Disabled** | Set `aria-disabled="true"` and remove from the tab sequence. The editor is announced as "disabled" and cannot be focused. |
| **Keyboard** | `Tab` moves focus into the editor. Inside: standard editing keys + common shortcuts — `⌘/Ctrl+B` bold, `⌘/Ctrl+I` italic, `⌘/Ctrl+U` underline, `⌘/Ctrl+K` link, `Enter` new paragraph, `Shift+Enter` soft break. `Tab` inside the editor should **not** trap focus by default — use it to indent lists only when a list item has focus. |
| **Toolbar keyboard access** | Toolbar buttons must be keyboard-reachable via a dedicated shortcut (e.g. `Alt+F10` to focus the toolbar, `Esc` to return to the editor). Buttons expose `aria-pressed="true"` when the current selection has that format applied. |
| **Floating toolbar** | When the floating toolbar appears, it must not steal focus. Announce the toolbar presence to screen readers only when the user explicitly opens it (`Alt+F10` or similar). |
| **Contrast** | Placeholder (`Text/Text-Placeholder`) ≥ 4.5:1 against `BG-Primary-alt`. Focus border (`Border/Border-Accent`, 2 px) must be visible independent of colour. |
| **Focus ring** | The 2 px accent border + blue focus shadow serves as the focus indicator. Do not remove either. |
| **RTL** | Set `dir="rtl"` on the root; the editor runtime must mirror toolbar order, list markers, and cursor movement. |
| **Screen reader output** | Expose headings as `role="heading"` with the correct `aria-level`, lists as `role="list"`/`role="listitem"`. These come for free from semantic HTML output — verify your editor emits `<h1>`/`<h2>`/`<h3>`, `<ul>`, `<ol>`, `<li>`. |

---

## Code Examples

### Basic usage — Fixed toolbar

```tsx
<RichTextEditor
  label="Description"
  placeholder="Start typing..."
  helperText="Type $ to add variables"
  toolbar="fixed"
/>
```

### Floating toolbar (inline / compact)

```tsx
<RichTextEditor
  label="Comment"
  toolbar="floating"
  placeholder="Write a reply..."
  helperText="Markdown shortcuts supported"
  minHeight={96}
/>
```

### Hidden toolbar (keyboard-only formatting)

```tsx
<RichTextEditor
  label="Notes"
  toolbar="hidden"
  placeholder="Start typing..."
  showHelperRow={false}
/>
```

### Error state

```tsx
<RichTextEditor
  label="Announcement body"
  state="Error"
  helperText="Announcement body is required."
  toolbar="fixed"
/>
```

### Read Only (rendering rich content)

```tsx
<RichTextEditor
  label="Previous revision"
  state="Read Only"
  toolbar="hidden"
  value={savedHtml}
  showHelperRow={false}
/>
```

### Disabled

```tsx
<RichTextEditor
  label="Body"
  state="Disabled"
  toolbar="fixed"
  value={draftHtml}
/>
```

### Controlled value with variables

```tsx
const [body, setBody] = useState<string>("");

<RichTextEditor
  label="Email body"
  toolbar="fixed"
  value={body}
  onChange={setBody}
  helperText="Type $ to add variables"
/>
```

### RTL

```tsx
<RichTextEditor
  rtl
  label="التسمية"
  placeholder="ابدأ الكتابة..."
  helperText="اكتب $ لإضافة المتغيرات"
  toolbar="fixed"
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Text Area](./text-area.md) | Plain multi-line free text without formatting |
| [Text Input](./text-input.md) | Single-line input (name, email, subject line) |
| [Script Editor](./script-editor.md) | Code or scripting input with syntax highlighting |
| [Inline Alert Message](./inline-alert-message.md) | Rendered read-only rich messages inside a form flow |
