# `<ds-rich-text-editor>`

Visual chrome + minimal `contenteditable` surface for prototyping. Wire a real editor runtime (ProseMirror, Lexical, TipTap, Slate) for production — sanitisation, structured output, and undo/redo are out of scope here.

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `label` | string | `Label` | Field label. |
| `placeholder` | string | `Start typing...` | Body placeholder. |
| `helper` | string | — | Helper / error text below the editor. |
| `toolbar` | `fixed` \| `hidden` | `fixed` | Floating-toolbar mode is left to a real editor runtime. |
| `state` | `default` \| `error` \| `disabled` \| `readonly` | `default` | |
| `show-label` | `false` to hide | shown | |
| `show-helper-row` | `false` to hide | shown | |
| `rtl` | boolean | — | Right-to-left layout. |

## Properties

- `editor.value` — get/set the HTML inside the body. Initial light-DOM children are accepted as the starting value.

## Events

- `ds-rte-change` — `detail: { value }` on input or toolbar action.

## Toolbar buttons

Block-style picker (Normal / H1 / H2 / H3 / Quote), bold / italic / underline, bulleted / numbered list, align left / center / right, link, image, more. Buttons call `document.execCommand` so they work without a runtime — replace this layer with a proper editor for production.

## Accessibility

- Body has `role="textbox"` + `aria-multiline="true"` + the field label as its accessible name.
- `aria-invalid="true"` in the error state, `aria-disabled` / `aria-readonly` for the inactive states.
