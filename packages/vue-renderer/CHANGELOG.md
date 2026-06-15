## 0.9.3

### Core Architecture

#### Introducing the `GenericBinder` Binding System

- Added **`useBinder`** composable as the Vue counterpart to Lit's `A2uiController`, bridging component property bindings to Vue reactive `bound` refs via `GenericBinder` from `@a2ui/web_core`.
- Added **`SCHEMA_REGISTRY`**, mapping each component type in the v0.9 base catalog to its real Zod schema so `GenericBinder` can correctly classify properties as DYNAMIC / ACTION / STRUCTURAL / CHECKABLE, etc.
- **`useDynamicComponent`** now integrates `useBinder` and returns `bound` and `resolveChildren`; existing APIs such as `sendAction`, `resolveDynamicValue`, and `resolvePrimitive` may be removed in v1.0—migrate to `bound` ahead of time.

#### New Public APIs

```ts
export { useBinder } from './rendering/useBinder';
export type { ChildRef, UseBinderResult } from './rendering/useBinder';
export { SCHEMA_REGISTRY } from './rendering/schemas';
```

### A2UI Protocol: Action Support

In v0.9, a component's `action` property describes behavior triggered by user interaction. `GenericBinder` resolves it into a callable `() => void` callback; components invoke it via `bound.value.action`.

The protocol defines two action forms:

| Form | JSON Structure | Behavior |
|------|--------------|----------|
| **Server event** | `{ "event": { "name": "submit_booking", "context": { ... } } }` | The renderer validates the action and dispatches it via `surface.onAction`; `MessageProcessor` forwards it to the application-layer `onEvent`, handled by the Agent / server |
| **Client function call** | `{ "functionCall": { "call": "openUrl", "args": { ... } } }` | Executes a catalog-registered function locally on the client (e.g. `openUrl`) without sending to the server |

**Example: Button with action**

```json
{
  "id": "submit-button",
  "component": "Button",
  "child": "submit-text",
  "action": {
    "event": {
      "name": "submit_booking",
      "context": {
        "partySize": { "path": "/partySize" }
      }
    }
  }
}
```

On click, `GenericBinder` resolves `DynamicValue` entries in `context` (data bindings or literals) and produces a client-to-server message like:

```json
{
  "version": "v0.9",
  "action": {
    "name": "submit_booking",
    "surfaceId": "booking-surface",
    "sourceComponentId": "submit-button",
    "timestamp": "2026-02-25T10:40:00Z",
    "context": { "partySize": 4 }
  }
}
```

**vue-renderer implementation notes:**

- `A2UIButton` triggers actions via `bound.value.action()`; the button is disabled when validation fails and does not fire the action.
- `MessageProcessor` subscribes to `surface.onAction` and forwards v0.9 surface-dispatched actions into the renderer `dispatch` pipeline; sample apps can receive them via `onEvent`.
- `useDynamicComponent.sendAction` now resolves `DynamicValue` in v0.9 `functionCall.args` (this API is planned for deprecation in v1.0—use `bound` instead).

### A2UI Protocol: Checks Validation Support

In v0.9, components supporting the `Checkable` trait can declare a `checks` array for client-side reactive validation. Each rule includes:

- **`condition`**: A boolean `DynamicValue`, typically a `FunctionCall` (e.g. `required`, `regex`, `min_length`); the function returns `true` when validation passes.
- **`message`**: Error text shown when validation fails.

```json
{
  "checks": [
    {
      "condition": {
        "call": "required",
        "args": { "value": { "path": "/formData/zip" } }
      },
      "message": "Zip code is required"
    },
    {
      "condition": {
        "call": "regex",
        "args": {
          "value": { "path": "/formData/zip" },
          "pattern": "^[0-9]{5}$"
        }
      },
      "message": "Must be a 5-digit zip code"
    }
  ]
}
```

`GenericBinder` recognizes `checks` as a **CHECKABLE** property, subscribes to data changes for each `condition`, and injects into `bound`:

- **`isValid`**: `true` when all rules pass
- **`validationErrors`**: A list of `message` values from failed rules

**Components supporting `checks`:**

| Component | UI behavior on validation failure |
|-----------|-----------------------------------|
| **Button** | Button disabled; shows `validationErrors`; `action` only fires after validation passes |
| **TextField** | Sets `aria-invalid`, shows the first error; merged with `validationRegexp` results |
| **CheckBox** | Shows validation error message |
| **ChoicePicker** | Shows validation error message |
| **Slider** | Shows validation error message |
| **DateTimeInput** | Shows validation error message |

**Example: Button with checks (auto-disabled when validation fails)**

```json
{
  "id": "submit-button",
  "component": "Button",
  "child": "submit-text",
  "checks": [
    {
      "condition": {
        "call": "required",
        "args": { "value": { "path": "/partySize" } }
      },
      "message": "Party size is required"
    }
  ],
  "action": { "event": { "name": "submit_booking" } }
}
```

When `/partySize` is empty, the button is automatically disabled; after a valid value is entered, it becomes clickable and can trigger the action.

### Component Migration & Enhancements

All base-catalog components now read bound values via `bound`, replacing the manual `resolvePrimitive` / `setData` pattern.

| Component | Key changes |
|-----------|-------------|
| **TextField** | Supports `obscured` (password) and `longText` (multiline textarea); `checks` and `validationRegexp` error display; writes data back via `bound.setValue` |
| **ChoicePicker** | Major rewrite: multi-select, filterable, chips display, dropdown interaction, `checks` validation state |
| **Checkbox** | Migrated to `bound`; `checks` validation display; style improvements |
| **Button** | Migrated to `bound`; `checks`-linked disable and `action` triggering; style and interaction improvements |
| **Slider** | Migrated to `bound`; `checks` validation display; style improvements |
| **DateTimeInput** | Migrated to `bound`; `checks` validation display; style improvements |
| **List** | Added `align` and `listStyle` (`ordered` / `unordered` / `none`); semantic rendering with `<ol>` / `<ul>` |
| **Tabs** | Style refactor (tablist / tabpanel semantics, selected-state styling); fixed tab titles to resolve reactively from `bound.value.tabs[i].title` |
| **Modal** | Centered dialog, frosted-glass backdrop, enter animation, accessible close button with hover styles |
| **Text / Image / Icon / Video / Audio / Divider / Row / Column** | Migrated to `bound` binding pattern |
