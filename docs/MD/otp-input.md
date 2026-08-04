# OTP Input

A one-time password entry field that presents individual digit boxes for verification code input. Supports 4-digit and 6-digit codes, three sizes, five interaction states, and full RTL layout.

**Figma source:** [UEMS — Design System 3.0](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=18019-574607) · Node `18019:574607`

---

## Variants

The component set contains **60 variants** across four axes:

| Axis | Values | Description |
|------|--------|-------------|
| `Size` | `Small`, `Medium`, `Large` | Controls box dimensions, font size, gap, and radius |
| `State` | `Default`, `Focus`, `Filled`, `Error`, `Disabled` | Interaction / validation state |
| `Length` | `4`, `6` | Number of digit boxes |
| `RTL` | `False`, `True` | Reverses visual order; Arabic label and helper text |

---

## Anatomy

```
Verification Code                          ← Label (Show Label=ON)
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  0  │ │  0  │ │  0  │ │  0  │          ← OTP digit boxes
└─────┘ └─────┘ └─────┘ └─────┘
ⓘ  Help text                              ← Helper Row (Show Helper Row=ON)
```

6-digit variant:
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  0  │ │  0  │ │  0  │ │  0  │ │  0  │ │  0  │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
```

RTL layout (Arabic label, right-aligned):
```
                              رمز التحقق  ← Arabic label, right-aligned
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  0  │ │  0  │ │  0  │ │  0  │
└─────┘ └─────┘ └─────┘ └─────┘
                         نص مساعد  ⓘ
```

---

## States

### Default
Empty boxes with `Border-Secondary` stroke. Digit placeholder (`0`) shown in muted `Text-Disabled` colour.

### Focus
The active (first) box gets a 2px `Border-Accent` stroke and a blue shadow ring. A cursor `|` indicator appears inside the active box. Remaining boxes stay in secondary border.

### Filled
All boxes contain entered digits in `Text-Primary`. Border switches to `Border-Primary` (slightly darker than Default).

### Error
All boxes switch to `Border-Error` stroke with a red shadow ring. Digit text changes to `Text-Error`. The Helper Row displays an error icon with an error message.

### Disabled
Boxes receive `BG-Disabled` fill and `Border-Disabled` stroke. All content is rendered at **50% opacity**. Not interactive.

---

## Size Specifications

| Property | Small | Medium | Large |
|----------|-------|--------|-------|
| Box size | 36 × 36 px | 40 × 40 px | 48 × 48 px |
| Digit font size | 16 px | 18 px | 22 px |
| Inter-box gap | 8 px | 10 px | 12 px |
| Corner radius | 6 px (`radius-6`) | 8 px (`radius-8`) | 8 px (`radius-8`) |
| Label font size | 12 px | 13 px | 14 px |
| Root vertical gap | 8 px | 8 px | 8 px |

---

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Label` | Text | `"Verification Code"` | Label text (LTR). RTL label is always Arabic: `"رمز التحقق"` |
| `Show Label` | Boolean | `ON` | Toggles the label row |
| `Show Helper Row` | Boolean | `ON` | Toggles the helper text row below the boxes |
| `Digit 1` | Text | `"0"` | Individual digit override for box 1 (LTR only) |
| `Digit 2` | Text | `"0"` | Individual digit override for box 2 |
| `Digit 3` | Text | `"0"` | Individual digit override for box 3 |
| `Digit 4` | Text | `"0"` | Individual digit override for box 4 |
| `Digit 5` | Text | `"0"` | Individual digit override for box 5 (Length=6 only) |
| `Digit 6` | Text | `"0"` | Individual digit override for box 6 (Length=6 only) |

> `Digit 1–6` properties are for Figma design-time overrides only. In production, digits are controlled by component state.

---

## Design Tokens

### Box Fill

| State | Token | Resolves (Light) |
|-------|-------|-----------------|
| Default, Focus, Filled, Error | `Background/BG-Base-White` | `#FFFFFF` |
| Disabled | `Background/BG-Disabled` | `#E1E4EB` |

### Box Border

| State | Token | Resolves (Light) |
|-------|-------|-----------------|
| Default | `Border/Border-Secondary` | `#C3C9D6` |
| Focus (active box) | `Border/Border-Accent` (2px) | `#006AFF` |
| Filled | `Border/Border-Primary` | `#B4BBCC` |
| Error | `Border/Border-Error` | `#E42527` |
| Disabled | `Border/Border-Disabled` | `#E1E4EB` |

### Box Shadow

| State | Effect |
|-------|--------|
| Focus | Blue shadow ring (accent glow) |
| Error | Red shadow ring (error glow) |
| Others | None |

### Digit Text

| State | Token | Resolves (Light) |
|-------|-------|-----------------|
| Default (placeholder) | `Text/Text-Disabled` | `#8893AD` |
| Focus | `Text/Text-Primary` | `#15181E` |
| Filled | `Text/Text-Primary` | `#15181E` |
| Error | `Text/Text-Error` | `#C1181B` |
| Disabled | `Text/Text-Disabled` | `#8893AD` |

### Label Text

| State | Token |
|-------|-------|
| All non-disabled | `Text/Text-Primary` |
| Disabled | `Text/Text-Disabled` at 50% |

---

## Component Structure

```
OTP Input (VERTICAL auto-layout, 8px gap)
├── Label Row (HORIZONTAL, 4px gap)
│   └── Label text (Semibold, Text-Primary)
├── OTP Fields (HORIZONTAL, gap varies by size)
│   ├── Digit Box 1 (FIXED square, centered)
│   │   └── Digit (Bold, centered text)
│   ├── Digit Box 2
│   │   └── Digit
│   ├── Digit Box 3
│   │   └── Digit
│   ├── Digit Box 4
│   │   └── Digit
│   ├── [Digit Box 5]  ← Length=6 only
│   └── [Digit Box 6]  ← Length=6 only
└── Helper Row (Form Field Helper Row — node 17905:5403)
```

---

## Sub-component: Form Field Helper Row

The Helper Row (`17905:5403`) is shared with other form components (Text Input, Select, etc.). It renders:
- **Default state**: Info icon (ⓘ) + helper text in `Text-Tertiary`
- **Error state**: Error icon (⊗) + error message in `Text-Error`

Control its visibility with `Show Helper Row=OFF` when contextual help is not needed.

---

## Keyboard Behaviour

| Action | Result |
|--------|--------|
| Numeric key (0–9) | Enters digit in focused box and auto-advances focus to next box |
| `Backspace` on filled box | Clears digit, stays on current box |
| `Backspace` on empty box | Moves focus to previous box |
| `Tab` | Moves focus to next box |
| `Shift+Tab` | Moves focus to previous box |
| Paste (full code) | Distributes pasted digits across all boxes from the focused position |
| `ArrowLeft` / `ArrowRight` | Moves focus to adjacent box |

---

## Developer Handoff

Each digit box renders as:

```html
<input
  type="text"
  inputmode="numeric"
  pattern="[0-9]*"
  maxlength="1"
  autocomplete="one-time-code"
  aria-label="Digit 1 of 4"
/>
```

Implementation notes:
- Use `inputmode="numeric"` (not `type="number"`) to avoid browser spinner controls and ensure correct mobile keyboard.
- Use `autocomplete="one-time-code"` to enable SMS autofill on mobile browsers.
- Auto-advance: on `input` event, if the value is a single digit, call `nextInput.focus()`.
- Backspace navigation: on `keydown`, if `key === 'Backspace'` and `input.value === ''`, call `prevInput.focus()`.
- Paste: listen on the first input for `paste`, split the pasted value, and fill each input sequentially.
- Validation: all fields must be non-empty and numeric before form submission.

### RTL Implementation

```html
<div dir="rtl">
  <label>رمز التحقق</label>
  <div class="otp-fields">
    <!-- Inputs rendered in DOM order (1→4/6) but visually reversed by dir="rtl" -->
    <input ... aria-label="رقم 1 من 4" />
    ...
  </div>
</div>
```

> Do not manually reverse the DOM order. Use `dir="rtl"` on the wrapper and let the browser handle visual mirroring.

---

## Usage Guidelines

### When to use

- To verify identity via a numeric code sent by SMS, email, or authenticator app.
- For 2FA (two-factor authentication) flows.
- For PIN entry where each digit is individually confirmed.

### When NOT to use

- For passwords — use a password input field instead.
- For codes longer than 6 digits — consider a single text input with `inputmode="numeric"`.
- When the user needs to enter alphanumeric codes — extend the component or use a standard text input.

### Choosing Length

| Scenario | Length |
|----------|--------|
| Standard SMS OTP, email verification | `6` |
| PIN / short code | `4` |
| Authenticator app TOTP | `6` |

### Choosing Size

| Context | Size |
|---------|------|
| Dense forms, compact UI | `Small` |
| Default web UI | `Medium` |
| Prominent / hero placement (e.g. login page) | `Large` |

### Do / Don't

| Do | Don't |
|----|-------|
| Set `Length` to match the actual code length sent to the user | Show a 6-box OTP for a 4-digit code — mismatched lengths confuse users |
| Display the Error state + helper text immediately on incorrect code | Only reveal errors after the user submits the full form |
| Use `autocomplete="one-time-code"` for SMS autofill | Disable paste — it frustrates users switching from SMS |
| Show a clear helper text (e.g. "Code sent to +91 ••••••7890") | Leave the helper row empty — context reduces re-send rates |
| Use `Show Label=OFF` only when the label is already provided by surrounding page content | Hide the label without another visible indication of what the field expects |
| Clear all boxes and show Error state on wrong code | Keep entered digits in Error state without clearing — users should re-enter cleanly |

---

## Accessibility

| Concern | Guidance |
|---------|----------|
| Group label | Wrap all digit inputs in a `<fieldset>` with a `<legend>` matching the label text |
| Per-input label | Each `<input>` must have `aria-label="Digit N of M"` (e.g. `"Digit 1 of 4"`) |
| Error announcement | When Error state activates, update an `aria-live="assertive"` region with the error message |
| Helper text association | Associate the helper text with the group using `aria-describedby` on the `<fieldset>` |
| Focus ring | The 2px blue border + shadow on Focus must not be overridden — it is the visible focus indicator (WCAG 2.4.7) |
| Disabled | Disabled inputs must have the `disabled` attribute, not just visual styling |
| Auto-advance | Auto-advance on input must not trap keyboard users; `Tab` must still work as expected |
| Contrast | `Text-Primary` on `BG-Base-White` meets WCAG AA (4.5:1). Error red on white meets AA. Disabled at 50% is exempt (disabled UI) |
| RTL | Set `dir="rtl"` on the wrapper; do not reorder DOM inputs |
| Mobile autofill | `autocomplete="one-time-code"` enables OS-level SMS autofill without ARIA intervention |
| Screen reader paste | Ensure paste events are accessible — do not intercept `paste` without reflecting the result back through value changes the SR can detect |

---

## All Variants Reference

| Variant | Node ID |
|---------|---------|
| Size=Small, State=Default, Length=4, RTL=False | `18019:572694` |
| Size=Small, State=Default, Length=4, RTL=True | `18019:572716` |
| Size=Small, State=Default, Length=6, RTL=False | `18019:572738` |
| Size=Small, State=Default, Length=6, RTL=True | `18019:572764` |
| Size=Small, State=Focus, Length=4, RTL=False | `18019:572790` |
| Size=Small, State=Focus, Length=6, RTL=False | `18019:572834` |
| Size=Small, State=Filled, Length=4, RTL=False | `18019:572886` |
| Size=Small, State=Filled, Length=6, RTL=False | `18019:572930` |
| Size=Small, State=Error, Length=4, RTL=False | `18019:572982` |
| Size=Small, State=Error, Length=6, RTL=False | `18019:573026` |
| Size=Small, State=Disabled, Length=4, RTL=False | `18019:573078` |
| Size=Small, State=Disabled, Length=6, RTL=False | `18019:573122` |
| Size=Medium, State=Default, Length=4, RTL=False | `18019:573174` |
| Size=Medium, State=Default, Length=4, RTL=True | `18019:573196` |
| Size=Medium, State=Default, Length=6, RTL=False | `18019:573218` |
| Size=Medium, State=Default, Length=6, RTL=True | `18019:573244` |
| Size=Medium, State=Focus, Length=4, RTL=False | `18019:573270` |
| Size=Medium, State=Focus, Length=6, RTL=False | `18019:573314` |
| Size=Medium, State=Filled, Length=4, RTL=False | `18019:573366` |
| Size=Medium, State=Filled, Length=6, RTL=False | `18019:573410` |
| Size=Medium, State=Error, Length=4, RTL=False | `18019:573462` |
| Size=Medium, State=Error, Length=6, RTL=False | `18019:573506` |
| Size=Medium, State=Disabled, Length=4, RTL=False | `18019:573558` |
| Size=Medium, State=Disabled, Length=6, RTL=False | `18019:573602` |
| Size=Large, State=Default, Length=4, RTL=False | `18019:573654` |
| Size=Large, State=Default, Length=4, RTL=True | `18019:573676` |
| Size=Large, State=Default, Length=6, RTL=False | `18019:573698` |
| Size=Large, State=Default, Length=6, RTL=True | `18019:573724` |
| Size=Large, State=Focus, Length=4, RTL=False | `18019:573750` |
| Size=Large, State=Focus, Length=6, RTL=False | `18019:573794` |
| Size=Large, State=Filled, Length=4, RTL=False | `18019:573846` |
| Size=Large, State=Filled, Length=6, RTL=False | `18019:573890` |
| Size=Large, State=Error, Length=4, RTL=False | `18019:573942` |
| Size=Large, State=Error, Length=6, RTL=False | `18019:573986` |
| Size=Large, State=Disabled, Length=4, RTL=False | `18019:574038` |
| Size=Large, State=Disabled, Length=6, RTL=False | `18019:574082` |

> RTL variants exist for all Size × State × Length combinations. Only LTR node IDs are listed above for brevity; add 22 to the last segment for the RTL counterpart is not accurate — reference Figma directly for RTL node IDs.

---

## Related Components

- **Form Field Helper Row** (`17905:5403`) — shared helper/error row used below OTP boxes
- **Text Input** — use instead when the code is alphanumeric or longer than 6 characters
- **PIN Input** — conceptually identical; OTP Input with `Length=4` covers this use case

---

*Generated from UEMS Design System 3.0 · Figma node `18019:574607`*
