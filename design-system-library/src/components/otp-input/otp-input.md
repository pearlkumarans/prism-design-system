# `<ds-otp-input>`

One-time-code input. 4 or 6 digit boxes, three sizes, five states, RTL.

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `length` | `4` \| `6` | `6` | Number of boxes. |
| `size` | `small` \| `medium` \| `large` | `medium` | Box dimensions and font. |
| `label` | string | — | Group label (rendered as `<label>`). |
| `label-position` | `none` \| `top` | `top` | `top` shows the label above the boxes; `none` hides it — the text stays as the field group's `aria-label`. |
| `helper` | string | — | Helper / error text below the boxes. |
| `state` | `''` \| `filled` \| `error` \| `disabled` | `''` | Visual state. |
| `disabled` | boolean | — | Same as `state="disabled"`. |
| `rtl` | boolean | — | Right-to-left layout. |
| `value` | string | — | Programmatic value. Setting it fills the boxes. |

## Properties

- `el.value` — get/set the joined digit string. Setter trims to length.

## Events

- `ds-otp-change` — `detail: { value }` on every keystroke.
- `ds-otp-complete` — fired once all boxes are filled.

## Behavior

- Numeric-only (`inputmode="numeric"`); non-digit input is dropped.
- Auto-advance to next box on input.
- Backspace on an empty box moves focus left and clears the previous digit.
- Paste distributes digits across remaining boxes from the focused position.
- `autocomplete="one-time-code"` enables SMS autofill on mobile.

## Accessibility

- Each `<input>` has `aria-label="Digit N of M"`.
- The fields container has `role="group"` named by the label (falling back to "One-time code"). With `label-position="none"` the label is hidden but still supplies this name.
- Focus ring meets WCAG 2.4.7 (visible 2 px brand border + glow).
