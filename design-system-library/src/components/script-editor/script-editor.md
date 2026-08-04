# `<ds-script-editor>`

Code editor chrome (tabs / toolbar / gutter / status bar) over a basic contenteditable surface. Pair with CodeMirror / Monaco for production-grade syntax highlighting and editing.

| Attribute | Values | Default |
|---|---|---|
| `type` | `basic` \| `with-toolbar` \| `with-line-numbers` \| `with-tabs` \| `full-ide` | `basic` |
| `state` | `default` \| `error` \| `disabled` \| `readonly` | `default` |
| `size` | `small` \| `medium` \| `large` | `medium` |
| `language` | string | `TypeScript` |
| `value` | string | slotted text |
| `tabs` | comma-separated filenames | `index.ts` |
| `show-status` | `false` to hide | shown |
| `error-text` | string | — shown in status bar in error state |

Property: `el.value`. Event: `ds-script-change` — `detail: { value }`.
