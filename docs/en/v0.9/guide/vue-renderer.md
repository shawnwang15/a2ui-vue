---
description: "Deep dive into a2ui-vue core abstractions: the Config system, MessageProcessor, Catalog, and theme customization."
---

# Vue Renderer Core Concepts

`a2ui-vue`'s design revolves around three core abstractions: **Config**, **MessageProcessor**, and **Catalog**.

## Configuration System

### provideA2UI / useA2UIConfig

`provideA2UI` injects global configuration into Vue's provide/inject tree. All child components can consume it via `useA2UIConfig()`:

```ts
import { createApp } from 'vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import App from './App.vue'

const app = createApp(App)

// Provide configuration before mount
provideA2UI({
  app,                        // Vue application instance (required)
  catalog: DEFAULT_CATALOG,   // component catalog
  theme: defaultTheme,        // theme object
  catalogId: 'default',       // optional, matches the catalogId of createSurface messages, defaults to 'default'
})

app.mount('#app')
```

Consume the config in any child component:

```ts
import { useA2UIConfig } from 'a2ui-vue'

const config = useA2UIConfig()
console.log(config.catalog, config.theme)
```

::: warning Note
`provideA2UI()` must receive the `app` instance and be called before `app.mount()`. `useA2UIConfig()` must be called in a descendant component, otherwise it will throw an exception.
:::

### Theme

The theme object follows the renderer's locally defined `A2UITheme` interface (it no longer depends on v0.8 protocol types), used to uniformly control design tokens like colors and fonts:

```ts
export interface A2UITheme {
  additionalStyles?: Record<string, any>
  components: Record<string, any>
  elements?: Record<string, any>
  markdown?: Record<string, string[]>
}
```

`defaultTheme` is the built-in default implementation and can be passed directly to `provideA2UI`:

```ts
import { createApp } from 'vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'

const app = createApp(App)

provideA2UI({ app, catalog: DEFAULT_CATALOG, theme: defaultTheme })
app.mount('#app')
```

---

## Message Processor

### useMessageProcessor

`useMessageProcessor` is the core reactive state manager, responsible for:

1. Receiving raw A2UI messages from the Agent
2. Parsing and validating message format
3. Maintaining the **Surface map** (`ReadonlyMap<surfaceId, SurfaceModel>`)
4. Exposing a reactive `getSurfaces()` for template binding

```ts
const processor = useMessageProcessor()

// Process a batch of v0.9 server messages (the argument is an A2uiMessage[] array)
processor.processMessages(messages)

// Get the reactive Surface Map (can be used directly in v-for)
const surfaces = processor.getSurfaces()

// Dispose all surfaces and rebuild the processor
processor.clearSurfaces()
```

### A2UI Message Structure

`processMessages` accepts the v0.9 protocol's `A2uiMessage[]`. For payloads wrapped by the A2A transport layer, the renderer also exports the following helper types (for sample apps to unpack):

| Type                 | Shape                                                          | Description                          |
|--------------------|----------------------------------------------------------------|--------------------------------------|
| `A2TextPayload`    | `{ kind: 'text'; text: string }`                               | Plain text payload                   |
| `A2DataPayload`    | `{ kind: 'data'; data: A2uiMessage }`                          | Structured data payload wrapping a single `A2uiMessage` |
| `A2AServerPayload` | `Array<A2DataPayload \| A2TextPayload> \| { error: string }`   | A2A server payload: an array of the above payloads, or an error object |

> After extracting the `A2uiMessage` from these payloads, hand them to `processor.processMessages([...])`.

---

## Handling User Actions

When a user interacts with a component (clicks a `Button`, submits a form, etc.), the component triggers its `action` definition and the processor **dispatches** an action event. You can subscribe to these events via `processor.onEvent`, forward them to the Agent, or respond locally.

### Two Action Sources

A component's `action` property supports two forms:

| Form           | JSON snippet                                                            | Description                            |
|---------------|-------------------------------------------------------------------------|----------------------------------------|
| `event`       | `"action": { "event": { "name": "submit_form", "context": { ... } } }`  | Triggers a **server event**, usually forwarded to the Agent |
| `functionCall`| `"action": { "functionCall": { "call": "call", "args": { ... } } }`     | Triggers a **local function call** (e.g. dialing, opening a modal) |

Data bindings inside `event` (e.g. `{"path": "/phone"}`) are **resolved automatically** to real values before dispatch.

::: warning Note
In the current implementation, **only `event`-form actions are dispatched through the `onEvent` pipeline**; `functionCall` is handled locally by the binder/renderer and is not forwarded to `onEvent` via `surface.dispatchAction`. So everything you receive in the `onEvent` callback is an `event` action.
:::

### Event Structure (DispatchedEvent)

The `onEvent` callback receives a `DispatchedEvent`:

```ts
interface DispatchedEvent {
  // Standard A2UI client message envelope
  message: {
    version: 'v0.9'
    action: {
      name: string              // action name (from event.name)
      surfaceId: string         // id of the surface that triggered the event
      sourceComponentId: string // id of the component that triggered the event
      timestamp: string         // ISO 8601 timestamp
      context: Record<string, unknown> // key-value pairs after data-binding resolution
    }
  }
  // Pass subsequent A2UI messages back to the processor for rendering (pass an empty array if none)
  resolve: (messages: A2uiMessage[]) => void
  // Pass back an error on failure
  reject: (error: Error) => void
}
```

> Components that fail validation (`checks`) do not dispatch actions, so everything you receive in `onEvent` is a valid action that already passed local validation.

### Subscribing to actions with processor.onEvent

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useMessageProcessor, type A2uiMessage } from 'a2ui-vue'

const processor = useMessageProcessor()

let unsubscribe: (() => void) | null = null

onMounted(() => {
  // onEvent returns an unsubscribe function
  unsubscribe = processor.onEvent(({ message, resolve, reject }) => {
    const { name, context, surfaceId } = message.action

    try {
      switch (name) {
        case 'submit_contact_form':
          // Server event: forward to the Agent and pass the returned A2UI messages back to the processor for rendering
          sendToAgent(surfaceId, context).then((followUpMessages: A2uiMessage[]) => {
            resolve(followUpMessages)
          })
          break

        default:
          resolve([]) // Unknown action: just finish
      }
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)))
    }
  })
})

// Always unsubscribe on unmount to avoid duplicate callbacks
onUnmounted(() => {
  unsubscribe?.()
})

declare function sendToAgent(
  surfaceId: string,
  context: Record<string, unknown>,
): Promise<A2uiMessage[]>
</script>
```

::: tip Tip
The array passed to `resolve(messages)` is processed as follow-up messages from the Agent (e.g. `updateComponents` / `updateDataModel`), closing the "click → call backend → partial UI refresh" loop. If the interaction needs no UI update, just pass an empty array `resolve([])`.
:::

### Client-side validation (checks)

A2UI v0.9 generalizes client-side logic into **Functions**, and validation is one of their uses. Components that support validation (such as `TextField`, `CheckBox`, `Slider`, `ChoicePicker`, `DateTimeInput`, and `Button`) can declare a `checks` array. Each rule is **re-evaluated reactively** whenever the data model changes, exposing an error message to the rendering layer when it fails.

> See the official spec: [A2UI v0.9.1 — Client-side logic & validation](https://a2ui.org/specification/v0.9.1-a2ui/#client-side-logic-validation)

#### Check rule structure

The check rule (`CheckRule`) used internally by the renderer looks like:

```ts
interface CheckRule {
  // A DynamicBoolean returning a boolean, usually a FunctionCall. true means it passes
  condition: { call: string; args: Record<string, unknown>; returnType: 'boolean' }
  // The error message to display when the check fails
  message: string
}
```

The corresponding JSON form (from `field-name` in `contact-card.json`):

```json
{
  "id": "field-name",
  "component": "TextField",
  "label": "Full Name",
  "value": { "path": "/form/name" },
  "checks": [
    {
      "condition": {
        "call": "required",
        "args": { "value": { "path": "/form/name" } },
        "returnType": "boolean"
      },
      "message": "Name is required"
    }
  ]
}
```

Common built-in validation functions: `required` (non-empty), `length` (length, `min` / `max`), `numeric` (numeric range, `min` / `max`), `regex` (regular expression), `email`, plus `and` / `or` / `not` for combining multiple conditions.

#### Evaluation result: isValid / validationErrors

The binder evaluates each rule's `condition` and injects two derived fields into the component:

| Field              | Type       | Meaning                                        |
|--------------------|------------|------------------------------------------------|
| `isValid`          | `boolean`  | Whether all `checks` passed                    |
| `validationErrors` | `string[]` | The `message` list of all failed rules (in the same order as `checks`) |

Input components use these to show errors in real time and set `aria-invalid` — for example, `TextField` displays the first error message below the input.

#### Relationship between checks and Action

`Button` also supports `checks`: **if any condition is unmet, the button is disabled and does NOT dispatch its `action`**. This lets a "submit" button depend on the validity of the whole form. The example below (from `submit-btn` in `contact-card.json`) aggregates checks across multiple fields, only allowing the `submit_contact_form` event once they all pass:

```json
{
  "id": "submit-btn",
  "component": "Button",
  "variant": "primary",
  "checks": [
    {
      "condition": {
        "call": "required",
        "args": { "value": { "path": "/form/name" } },
        "returnType": "boolean"
      },
      "message": "Name is required"
    },
    {
      "condition": {
        "call": "equals",
        "args": { "a": { "path": "/form/acceptTerms" }, "b": true },
        "returnType": "boolean"
      },
      "message": "You must accept the terms"
    }
  ],
  "action": {
    "event": {
      "name": "submit_contact_form",
      "context": { "name": { "path": "/form/name" } }
    }
  }
}
```

::: warning Note
Because components that fail validation do not dispatch actions, everything you receive in the `onEvent` callback is a valid action that **already passed local validation** — you usually don't need to repeat required/format checks.
:::

---

## Catalog (Component Registry)

The Catalog is a mapping from **component type name → component loader**, determining which Vue component renders JSON like `type: "Card"`.

Each entry (`CatalogEntry`) has two forms:

```ts
type CatalogLoader = () =>
  | Promise<Component | DefineComponent>
  | Component
  | DefineComponent

type CatalogEntry =
  | CatalogLoader                                          // directly return (or async import) a Vue component
  | {
      type: CatalogLoader                                  // the component loader
      props: (node: VueComponentNode) => Record<string, any> // extract props from the node's properties
    }

interface Catalog {
  [type: string]: CatalogEntry
}
```

### DEFAULT_CATALOG

The built-in catalog includes registrations for all official components (`Row` / `Column` / `Card` / `Text` / `Button` / `Image` / `List` / `Tabs` / `Modal`, etc.):

```ts
import { DEFAULT_CATALOG } from 'a2ui-vue'
// DEFAULT_CATALOG: Catalog (Record<string, CatalogEntry>)
```

### Custom Catalog

You can extend or fully replace the default Catalog. Note that each entry is a **loader function**, not the component itself:

```ts
import { createApp } from 'vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import MyCustomCard from './MyCustomCard.vue'

const myCatalog = {
  ...DEFAULT_CATALOG,
  // Register a custom component type (value is a loader returning the component)
  MyCard: () => MyCustomCard,
  // Or with props extraction:
  // MyCard: { type: () => MyCustomCard, props: (node) => ({ title: node.properties.title }) },
}

const app = createApp(App)
provideA2UI({ app, catalog: myCatalog, theme: defaultTheme })
app.mount('#app')
```

After registering a type name, you still need to implement the corresponding Vue component. See the **[Custom Components](/en/v0.9/guide/custom-components/)** section for the `useDynamicComponent` API reference and complete examples for action buttons and text inputs (including Catalog registration code).

---

## Rendering Pipeline

The complete flow from an A2UI message arriving to being output on the page:

```
Agent JSON messages (A2uiMessage[])
      │
      ▼
useMessageProcessor.processMessages(messages)
      │  Builds surface state via the web_core v0.9 processor
      ▼
Surface Map (reactive Map<surfaceId, SurfaceModel>)
      │
      ▼
<A2UISurface :surface-id="surfaceId" />
      │  Builds a VueComponentNode tree starting from the 'root' component
      ▼
<A2UiRenderer :surface-id :component />
      │  Look up catalog[component.type]
      ▼
Specific component (A2UICard / A2UIText / A2UIButton ...)
```

### A2UiRenderer

`A2UiRenderer` is the core of recursive rendering — it looks up the loader in the Catalog based on `component.type` and renders it. It accepts two props, `surfaceId` and `component` (a `VueComponentNode`):

```vue
<A2UiRenderer :surface-id="surfaceId" :component="node" />
```

---

## Markdown Rendering

`useMarkdownRenderer()` returns a singleton `markdown-it`-based renderer; use its `render()` method to render a Markdown string to HTML:

```ts
import { useMarkdownRenderer } from 'a2ui-vue'

const renderer = useMarkdownRenderer()
const html = renderer.render('**Hello** _World_')
// → '<p><strong>Hello</strong> <em>World</em></p>'
```

`render(value, tagClassMap?)` also accepts a second argument to append custom classes to specific tags (e.g. `p`, `h1`, `a`):

```ts
const html = renderer.render('# Title', { h1: ['title', 'mb-2'] })
```

> Content in code blocks marked as `html` is rendered into a sandboxed `<iframe>` to isolate script execution.
