# Script Editor

A code editor component for scripting, configuration, and development workflows. Supports five progressive type configurations — from a bare editor to a full IDE layout — across three sizes and five interaction states.

**Figma source:** [UEMS — Design System 3.0](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=15914-18634) · Node `15914:18634`

---

## Variants

The component set contains **75 variants** across three axes:

| Axis | Values | Description |
|------|--------|-------------|
| `Type` | `Basic`, `WithToolbar`, `WithLineNumbers`, `WithTabs`, `FullIDE` | Progressive feature set — each type adds chrome to the editor |
| `State` | `Default`, `Focus`, `Disabled`, `Error`, `ReadOnly` | Interaction / validation state |
| `Size` | `Small`, `Medium`, `Large` | Overall editor height and density |

---

## Types

### Basic

The minimal editor: code area + status bar. Use when you need a lightweight, embedded code input without IDE affordances.

```
┌──────────────────────────────────────────────┐
│  import { useState } from "react";            │  ← Code area
│                                              │    (syntax-highlighted,
│  interface Props {                           │     scrollable)
│    title: string;                            │
│    count: number;                            │
│  }                                           │
│                                              │
│  export function Editor(props: Props) {      │
│    const [value, setValue] = useState("");   │
│  }                                           │
├──────────────────────────────────────────────┤
│ TypeScript          Ln 9, Col 38  UTF-8  Spaces: 2 │  ← Status Bar
└──────────────────────────────────────────────┘
```

### WithToolbar

Adds an action toolbar above the editor with **Run**, **Stop**, **Copy**, and **Settings** buttons, plus a language badge on the right. The language badge is now rendered as a **pill chip** (rounded rectangle with a subtle background fill), not bare text.

```
┌──────────────────────────────────────────────┐
│ ▷ Run  ⊡ Stop  ⎘ Copy  ⚙ Settings  ╭TypeScript╮│  ← Toolbar (badge = pill chip)
├──────────────────────────────────────────────┤
│  [code area]                                 │
├──────────────────────────────────────────────┤
│ TypeScript          Ln 9, Col 38  UTF-8  Spaces: 2 │
└──────────────────────────────────────────────┘
```

### WithLineNumbers

Adds a numbered gutter on the left edge of the code area. Line numbers are rendered in `Text-Secondary` (muted).

```
┌──────────────────────────────────────────────┐
│  1 │  import { useState } from "react";      │
│  2 │                                         │
│  3 │  interface Props {                      │
│  4 │    title: string;                       │
│  5 │    count: number;                       │
│  6 │  }                                      │
│    │                                         │
│ 13 │  }                                      │
├──────────────────────────────────────────────┤
│ TypeScript          Ln 9, Col 38  UTF-8  Spaces: 2 │
└──────────────────────────────────────────────┘
```

### WithTabs

Adds a file tab bar above the editor. Up to 3 file tabs are supported, each with a **document-style file icon** (square with a folded top-right corner). The active tab has a bottom underline indicator and its icon is rendered in the accent colour.

```
┌──────────────────────────────────────────────┐
│ ⌐index.ts  ⌐utils.ts  ⌐config.json           │  ← Tab Bar (folded-corner doc icons)
├──────────────────────────────────────────────┤
│  [code area]                                 │
├──────────────────────────────────────────────┤
│ TypeScript          Ln 9, Col 38  UTF-8  Spaces: 2 │
└──────────────────────────────────────────────┘
```

### FullIDE

The most complete configuration. Combines tab bar, toolbar, line numbers, a mini-map panel, and a bottom terminal/problems/output panel.

```
┌──────────────────────────────────────────────┐
│ ⌐index.ts  ⌐utils.ts  ⌐config.json           │  ← Tab Bar
├──────────────────────────────────────────────┤
│ ▷ Run  ⊡ Stop  ⎘ Copy  ⚙ Settings    TypeScript │  ← Toolbar
├──────────────────────────────────┬───────────┤
│  1 │  import { useState } ...    │   ░░░░░░  │  ← Code + Mini-map
│  2 │                             │   ░░░░░   │
│  3 │  interface Props {          │   ░░░░░░  │
│  4 │    title: string;           │           │
│  5 │    count: number;           │           │
│  6 │  }                          │           │
├──────────────────────────────────┴───────────┤
│ TERMINAL   PROBLEMS   OUTPUT                 │  ← Terminal Panel
│ $ npm run dev                                │
│ > vite --open                                │
│ VITE v5.2.0  ready in 342ms                  │
├──────────────────────────────────────────────┤
│ TypeScript          Ln 9, Col 38  UTF-8  Spaces: 2 │  ← Status Bar
└──────────────────────────────────────────────┘
```

---

## States

### Default
Standard interactive state. Editor code area background is pure white (`BG-Base-White`, `#FFFFFF`) with a `Border-Secondary` stroke. The status bar uses `BG-Button-Primary` (cobalt blue) fill with `Text-White`. An **active-line highlight** — a subtle gray row — is shown on the current cursor line in the code area.

### Focus
The entire editor container receives a 2px `Border-Accent` stroke (blue). A text cursor `|` is shown at the current insertion point in the code area. The active-line highlight remains visible. Keyboard focus is inside the editor.

### Error
The editor border switches to `Border-Error` (red). The status bar left section displays the `Error Text` value (e.g. "2 Errors") — the status bar background shifts to `BG-Error-Solid`. Use when script validation or syntax checking fails.

### Disabled
All text in the editor — code content, line numbers, status bar text, toolbar labels — is rendered in a **purple/violet tint** (rather than simply reducing opacity). The component is not interactive. Do not disable the editor mid-session; prefer ReadOnly.

### ReadOnly
The editor is not editable but remains fully legible. A **"READ ONLY"** badge appears at the bottom-left of the code area (above the status bar). Useful for displaying reference scripts or configuration that should not be modified by the current user.

---

## Syntax Highlighting Tokens

The code area and status bar render in a **monospace font** (Fira Code or equivalent system monospace). This applies to all code content, line numbers, the status bar metadata, and terminal output in FullIDE.

The code area applies syntax highlighting using UEMS semantic tokens (no hardcoded hex):

| Syntax role | UEMS Token | Resolves (Light) | Example |
|-------------|-----------|-----------------|---------|
| Keywords | `Text/Text-Accent-Link` | `#006AFF` | `import`, `export`, `interface`, `function`, `const`, `return` |
| String literals / values | `Text/Text-Primary` | `#15181E` | `"react"`, `42`, `""` |
| Comments | `Text/Text-Placeholder` | `#8893AD` | `// TODO: implement syntax highlighting` |
| Identifiers / general | `Text/Text-Primary` | `#15181E` | `Props`, `Editor`, `useState` |
| Line numbers | `Text/Text-Secondary` | `#2A303D` | `1`, `2`, `3` … |
| Active line highlight | `Background/BG-Secondary-alt` | `#F0F2F5` | Row fill on current cursor line |
| Disabled text tint | `Text/Text-Disabled` (purple/violet) | — | All text in Disabled state |

---

## Design Tokens

### Editor Container

| Element | State | Token | Resolves (Light) |
|---------|-------|-------|-----------------|
| Code area background | All | `Background/BG-Base-White` | `#FFFFFF` |
| Active line background | Default / Focus | `Background/BG-Secondary-alt` | `#F0F2F5` |
| Border | Default / ReadOnly | `Border/Border-Secondary` | `#C3C9D6` |
| Border | Focus | `Border/Border-Accent` (2px) | `#006AFF` |
| Border | Error | `Border/Border-Error` | `#E42527` |
| Border | Disabled | `Border/Border-Disabled` | `#E1E4EB` |
| Scrollbar thumb | All | `Background/BG-Tertiary` | `#E1E4EB` |
| Text (all) — Disabled | Disabled | `Text/Text-Disabled` (purple/violet) | — |

### Status Bar

| Element | Token | Resolves (Light) |
|---------|-------|-----------------|
| Background (default) | `Background/BG-Button-Primary` | `#006AFF` |
| Background (error) | `Background/BG-Error-Solid` | `#E42527` |
| Text | `Text/Text-White` | `#FFFFFF` |

### Toolbar

| Element | Token | Resolves (Light) |
|---------|-------|-----------------|
| Background | `Background/BG-Secondary-alt` | `#F0F2F5` |
| Button text / icons | `Text/Text-Primary` | `#15181E` |
| Language badge text | `Text/Text-Secondary` | `#2A303D` |
| Language badge background | `Background/BG-Tertiary` | `#E1E4EB` |
| Language badge border-radius | — | `radius-full` (pill shape) |

### Tab Bar

| Element | Token | Resolves (Light) |
|---------|-------|-----------------|
| Background | `Background/BG-Secondary-alt` | `#F0F2F5` |
| Active tab indicator (underline) | `Border/Border-Accent` | `#006AFF` |
| Active tab text | `Text/Text-Primary` | `#15181E` |
| Active tab file icon | `Border/Icon/Icon-Accent` | `#006AFF` |
| Inactive tab text | `Text/Text-Secondary` | `#2A303D` |
| Inactive tab file icon | `Border/Icon/Icon-Secondary` | `#2A303D` |
| File icon style | — | Document with folded top-right corner |

---

## Component Properties

### Status Bar

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Status Bar` | Boolean | `ON` | Toggles the bottom status bar entirely |
| `Language` | Text | `"TypeScript"` | Language indicator (left side of status bar) |
| `Line Info` | Text | `"Ln 9, Col 38"` | Cursor position display |
| `Encoding` | Text | `"UTF-8"` | File encoding display |
| `Indent` | Text | `"Spaces: 2"` | Indentation setting display |

### Toolbar (`WithToolbar` and `FullIDE` only)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Toolbar` | Boolean | `ON` | Toggles the entire toolbar |
| `Show Run` | Boolean | `ON` | Toggles the ▷ Run button |
| `Show Stop` | Boolean | `ON` | Toggles the ⊡ Stop button |
| `Show Copy` | Boolean | `ON` | Toggles the ⎘ Copy button |
| `Show Settings` | Boolean | `ON` | Toggles the ⚙ Settings button |

### Tab Bar (`WithTabs` and `FullIDE` only)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Tab Bar` | Boolean | `ON` | Toggles the entire tab bar |
| `Tab 1` | Text | `"index.ts"` | Label for the first (active) tab |
| `Tab 2` | Text | `"utils.ts"` | Label for the second tab |
| `Tab 3` | Text | `"config.json"` | Label for the third tab |
| `Show Tab 2` | Boolean | `ON` | Toggles second tab visibility |
| `Show Tab 3` | Boolean | `ON` | Toggles third tab visibility |

### Terminal & Errors (`FullIDE` only / Error state)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Terminal` | Boolean | `ON` | Toggles the TERMINAL / PROBLEMS / OUTPUT panel (FullIDE only) |
| `Error Text` | Text | `"2 Errors"` | Text shown in the status bar left zone during Error state |

---

## Type Feature Matrix

| Feature | Basic | WithToolbar | WithLineNumbers | WithTabs | FullIDE |
|---------|:-----:|:-----------:|:---------------:|:--------:|:-------:|
| Code area | ✓ | ✓ | ✓ | ✓ | ✓ |
| Status bar | ✓ | ✓ | ✓ | ✓ | ✓ |
| Toolbar (Run/Stop/Copy/Settings) | — | ✓ | — | — | ✓ |
| Line number gutter | — | — | ✓ | — | ✓ |
| File tab bar | — | — | — | ✓ | ✓ |
| Mini-map panel | — | — | — | — | ✓ |
| Terminal / Problems panel | — | — | — | — | ✓ |

---

## Property Scope per Type

Not all properties affect all types. Applying a toolbar property to `Basic` or `WithLineNumbers` has no visible effect.

| Property group | Affects |
|----------------|---------|
| Status Bar props | All types |
| Toolbar props | `WithToolbar`, `FullIDE` |
| Tab Bar props | `WithTabs`, `FullIDE` |
| `Show Terminal` | `FullIDE` only |
| `Error Text` | All types (in Error state) |

---

## Usage Guidelines

### Choosing a Type

| Scenario | Recommended type |
|----------|-----------------|
| Inline script input in a form or settings panel | `Basic` |
| Script execution with Run/Stop controls | `WithToolbar` |
| Long scripts where line references matter (e.g. debugging, logs) | `WithLineNumbers` |
| Multi-file project or config editing | `WithTabs` |
| Full scripting environment (developer-centric pages) | `FullIDE` |

### When to use

- To let users write, edit, or review configuration scripts, automation scripts, or code snippets.
- When the content requires syntax awareness that a plain textarea cannot convey.
- When the editor needs to integrate execution controls (Run/Stop) in the same surface.
- To display read-only code references, computed scripts, or system-generated configurations.

### When NOT to use

- For single-line command inputs — use a Text Input with `inputmode="text"` or a dedicated Command Input.
- For plain prose or markdown editing — use a rich text editor or a Textarea.
- For JSON/YAML form configuration — prefer structured form fields; use Script Editor only when raw editing is explicitly required.
- As a lightweight "code display" block — use a Code Block (read-only, non-interactive) instead.

### Do / Don't

| Do | Don't |
|----|-------|
| Set `Language` to the actual syntax (TypeScript, Python, JSON, etc.) so the status bar is informative | Leave `Language` as "TypeScript" for non-TypeScript scripts |
| Use `ReadOnly` for scripts users should inspect but not modify | Use `Disabled` for read-only display — Disabled implies unavailability, not protection |
| Show `Error Text` with a specific count or message ("3 syntax errors") | Use generic text like "Error" without context |
| Use `FullIDE` only on dedicated scripting pages with enough vertical space | Embed `FullIDE` inside a small card or sidebar panel |
| Toggle `Show Status Bar=OFF` for ultra-compact embeds where metadata is not needed | Hide the status bar in `Error` state — the error count lives there |
| Use `WithLineNumbers` whenever the editor content may be referenced by line number in error messages or logs | Add line numbers to Basic embeds where they add no informational value |

---

## Keyboard Behaviour

| Action | Result |
|--------|--------|
| `Tab` | Inserts indentation (spaces per indent setting), does not move focus out of editor |
| `Shift+Tab` | Decreases indentation |
| `Ctrl/⌘+A` | Select all |
| `Ctrl/⌘+C` | Copy selected text |
| `Ctrl/⌘+Z` | Undo |
| `Ctrl/⌘+Shift+Z` | Redo |
| `Ctrl/⌘+/` | Toggle line comment |
| `Ctrl/⌘+Enter` | Execute (when toolbar is present and Run is enabled) |
| `Escape` | Blur editor / return focus to parent context |
| `F1` | Open command palette (FullIDE only) |

> **Tab trap note:** By default, `Tab` inserts indentation rather than moving focus. Provide a documented keyboard escape (e.g. `Escape` then `Tab`) for keyboard-only users who need to exit the editor.

---

## Developer Handoff

### Implementation

The Script Editor maps to a code editor library instance (e.g. CodeMirror, Monaco Editor):

```html
<div
  class="script-editor"
  data-type="WithToolbar"
  data-state="default"
  data-size="medium"
  role="group"
  aria-label="Script editor"
>
  <!-- Toolbar -->
  <div class="editor-toolbar" role="toolbar" aria-label="Editor actions">
    <button aria-label="Run script">▷ Run</button>
    <button aria-label="Stop script">⊡ Stop</button>
    <button aria-label="Copy code">⎘ Copy</button>
    <button aria-label="Settings">⚙ Settings</button>
    <!-- Language badge: pill chip with background fill -->
    <span class="language-badge" aria-label="Language: TypeScript">TypeScript</span>
  </div>

  <!-- Code area (CodeMirror / Monaco target)
       Font: monospace (Fira Code preferred)
       Active line receives .cm-activeLine / editor-active-line class
       Thin scrollbar visible on right edge -->
  <div
    class="editor-code-area"
    role="textbox"
    aria-multiline="true"
    aria-label="Code editor"
    aria-readonly="false"
  ></div>

  <!-- Status bar: also rendered in monospace font -->
  <div class="editor-status-bar" aria-live="polite">
    <span class="status-language">TypeScript</span>
    <span class="status-position">Ln 9, Col 38</span>
    <span class="status-encoding">UTF-8</span>
    <span class="status-indent">Spaces: 2</span>
  </div>
</div>
```

**Key CSS:**

```css
/* Monospace font — code area and status bar */
.editor-code-area,
.editor-status-bar {
  font-family: 'Fira Code', ui-monospace, 'Cascadia Code', monospace;
  font-size: 13px;
}

/* Pure white editor background */
.editor-code-area {
  background: var(--BG-Base-White, #ffffff);
}

/* Active line highlight */
.editor-code-area .editor-active-line {
  background: var(--BG-Secondary-alt, #f0f2f5);
}

/* Thin visible scrollbar */
.editor-code-area {
  scrollbar-width: thin;
  scrollbar-color: var(--BG-Tertiary, #e1e4eb) transparent;
}

/* Language badge — pill chip */
.language-badge {
  background: var(--BG-Tertiary, #e1e4eb);
  color: var(--Text-Secondary, #2a303d);
  border-radius: 9999px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
}
```

### State mapping

| Figma State | CSS class / attribute | Editor behaviour |
|-------------|----------------------|-----------------|
| Default | — | Editable; active-line highlight on current row |
| Focus | `:focus-within` | Blue 2px border ring, cursor visible, active-line highlight |
| Disabled | `[disabled]` / `aria-disabled="true"` | Not editable, not focusable; all text rendered in purple/violet (`Text-Disabled` token) |
| Error | `[data-state="error"]` | Red border, error count in status bar with `BG-Error-Solid` fill |
| ReadOnly | `[readonly]` / `aria-readonly="true"` | Not editable but focusable; "READ ONLY" badge above status bar |

---

## Accessibility

| Concern | Guidance |
|---------|----------|
| Role | Wrap in `role="group"` with `aria-label="Script editor"` or `aria-labelledby` referencing a heading |
| Code area | The editable region should be a `contenteditable` div or a library-managed textarea with `role="textbox"` and `aria-multiline="true"` |
| ReadOnly | Set `aria-readonly="true"` on the code area; the "READ ONLY" badge should also be announced (`aria-live` or static label) |
| Disabled | Set `aria-disabled="true"` and remove from tab order (`tabindex="-1"`). The purple/violet text tint is a visual cue only — do not rely on it as the sole indicator of disabled state; always set `aria-disabled` |
| Error | Status bar should have `aria-live="polite"` so error count changes are announced without interrupting the user |
| Tab trap | Document the keyboard escape from the editor (`Escape` then `Tab`); optionally expose a setting to use `Tab` for focus navigation instead of indentation |
| Toolbar buttons | Each button must have `aria-label` (icon-only buttons) |
| Focus ring | The 2px blue focus ring must not be overridden by global reset styles |
| Contrast | `Text-Accent-Link` (keywords, blue) on the light editor background must meet WCAG AA (4.5:1) |
| Syntax colours | Do not rely solely on colour for syntax meaning — keywords should also be identifiable by context or font weight if colour is unavailable |

---

## All Variants Reference

| Variant | Node ID |
|---------|---------|
| Type=Basic, State=Default, Size=Small | `15914:9894` |
| Type=Basic, State=Focus, Size=Small | `15914:9928` |
| Type=Basic, State=Disabled, Size=Small | `15914:9963` |
| Type=Basic, State=Error, Size=Small | `15914:9997` |
| Type=Basic, State=ReadOnly, Size=Small | `15914:10031` |
| Type=Basic, State=Default, Size=Medium | `15914:10067` |
| Type=Basic, State=Focus, Size=Medium | `15914:10101` |
| Type=Basic, State=Disabled, Size=Medium | `15914:10136` |
| Type=Basic, State=Error, Size=Medium | `15914:10170` |
| Type=Basic, State=ReadOnly, Size=Medium | `15914:10204` |
| Type=Basic, State=Default, Size=Large | `15914:10240` |
| Type=Basic, State=Focus, Size=Large | `15914:10274` |
| Type=Basic, State=Disabled, Size=Large | `15914:10309` |
| Type=Basic, State=Error, Size=Large | `15914:10343` |
| Type=Basic, State=ReadOnly, Size=Large | `15914:10377` |
| Type=WithToolbar, State=Default, Size=Small | `15914:10932` |
| Type=WithToolbar, State=Focus, Size=Small | `15914:10983` |
| Type=WithToolbar, State=Disabled, Size=Small | `15914:11035` |
| Type=WithToolbar, State=Error, Size=Small | `15914:11086` |
| Type=WithToolbar, State=ReadOnly, Size=Small | `15914:11137` |
| Type=WithToolbar, State=Default, Size=Medium | `15914:11190` |
| Type=WithToolbar, State=Focus, Size=Medium | `15914:11241` |
| Type=WithToolbar, State=Disabled, Size=Medium | `15914:11293` |
| Type=WithToolbar, State=Error, Size=Medium | `15914:11344` |
| Type=WithToolbar, State=ReadOnly, Size=Medium | `15914:11395` |
| Type=WithToolbar, State=Default, Size=Large | `15914:11448` |
| Type=WithToolbar, State=Focus, Size=Large | `15914:11499` |
| Type=WithToolbar, State=Disabled, Size=Large | `15914:11551` |
| Type=WithToolbar, State=Error, Size=Large | `15914:11602` |
| Type=WithToolbar, State=ReadOnly, Size=Large | `15914:11653` |
| Type=WithLineNumbers, State=Default, Size=Small | `15914:12480` |
| Type=WithLineNumbers, State=Focus, Size=Small | `15914:12526` |
| Type=WithLineNumbers, State=Disabled, Size=Small | `15914:12573` |
| Type=WithLineNumbers, State=Error, Size=Small | `15914:12619` |
| Type=WithLineNumbers, State=ReadOnly, Size=Small | `15914:12665` |
| Type=WithLineNumbers, State=Default, Size=Medium | `15914:12713` |
| Type=WithLineNumbers, State=Focus, Size=Medium | `15914:12762` |
| Type=WithLineNumbers, State=Disabled, Size=Medium | `15914:12812` |
| Type=WithLineNumbers, State=Error, Size=Medium | `15914:12861` |
| Type=WithLineNumbers, State=ReadOnly, Size=Medium | `15914:12910` |
| Type=WithLineNumbers, State=Default, Size=Large | `15914:12961` |
| Type=WithLineNumbers, State=Focus, Size=Large | `15914:13012` |
| Type=WithLineNumbers, State=Disabled, Size=Large | `15914:13064` |
| Type=WithLineNumbers, State=Error, Size=Large | `15914:13115` |
| Type=WithLineNumbers, State=ReadOnly, Size=Large | `15914:13166` |
| Type=WithTabs, State=Default, Size=Small | `15914:13958` |
| Type=WithTabs, State=Focus, Size=Small | `15914:14003` |
| Type=WithTabs, State=Disabled, Size=Small | `15914:14049` |
| Type=WithTabs, State=Error, Size=Small | `15914:14094` |
| Type=WithTabs, State=ReadOnly, Size=Small | `15914:14139` |
| Type=WithTabs, State=Default, Size=Medium | `15914:14186` |
| Type=WithTabs, State=Focus, Size=Medium | `15914:14231` |
| Type=WithTabs, State=Disabled, Size=Medium | `15914:14277` |
| Type=WithTabs, State=Error, Size=Medium | `15914:14322` |
| Type=WithTabs, State=ReadOnly, Size=Medium | `15914:14367` |
| Type=WithTabs, State=Default, Size=Large | `15914:14414` |
| Type=WithTabs, State=Focus, Size=Large | `15914:14459` |
| Type=WithTabs, State=Disabled, Size=Large | `15914:14505` |
| Type=WithTabs, State=Error, Size=Large | `15914:14550` |
| Type=WithTabs, State=ReadOnly, Size=Large | `15914:14595` |
| Type=FullIDE, State=Default, Size=Small | `15914:15326` |
| Type=FullIDE, State=Focus, Size=Small | `15914:15433` |
| Type=FullIDE, State=Disabled, Size=Small | `15914:15541` |
| Type=FullIDE, State=Error, Size=Small | `15914:15648` |
| Type=FullIDE, State=ReadOnly, Size=Small | `15914:15755` |
| Type=FullIDE, State=Default, Size=Medium | `15914:15864` |
| Type=FullIDE, State=Focus, Size=Medium | `15914:15974` |
| Type=FullIDE, State=Disabled, Size=Medium | `15914:16085` |
| Type=FullIDE, State=Error, Size=Medium | `15914:16195` |
| Type=FullIDE, State=ReadOnly, Size=Medium | `15914:16305` |
| Type=FullIDE, State=Default, Size=Large | `15914:16417` |
| Type=FullIDE, State=Focus, Size=Large | `15914:16529` |
| Type=FullIDE, State=Disabled, Size=Large | `15914:16642` |
| Type=FullIDE, State=Error, Size=Large | `15914:16754` |
| Type=FullIDE, State=ReadOnly, Size=Large | `15914:16866` |

---

## Related Components

- **Textarea** — use for plain, unformatted multi-line text input with no syntax awareness
- **Text Input** — use for single-line command or query strings
- **Dropdown Menu** — used internally for the Settings action in the toolbar
- **Code Block** — a non-interactive, read-only code display surface; prefer over Script Editor when editing is never required

---

*Generated from UEMS Design System 3.0 · Figma node `15914:18634`*
