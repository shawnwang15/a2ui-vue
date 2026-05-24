---
description: "Deep dive into a2ui-vue core abstractions: the Config system, MessageProcessor, Catalog, and theme customization."
---

# Vue Renderer Core Concepts

`a2ui-vue`'s design revolves around three core abstractions: **Config**, **MessageProcessor**, and **Catalog**.

## Configuration System

### provideA2UI / useA2UIConfig

`provideA2UI` injects global configuration into Vue's provide/inject tree. All child components can consume it via `useA2UIConfig()`:

```ts
import { provideA2UI, useA2UIConfig, defaultTheme } from 'a2ui-vue'

// Provide configuration in the root component
provideA2UI({
  catalog: DEFAULT_CATALOG, // component catalog
  theme: defaultTheme,      // theme object
})

// Consume in any child component
const config = useA2UIConfig()
console.log(config.catalog, config.theme)
```

::: warning Note
`useA2UIConfig()` must be called in a descendant component of `provideA2UI()`, otherwise it will throw an exception.
:::

### Theme

The theme object follows the `Types.Theme` structure defined in `@a2ui/web_core`, used to uniformly control design tokens like colors, fonts, and border-radius:

```ts
import { defaultTheme } from 'a2ui-vue'
// See defaultTheme for the default example

provideA2UI({ catalog: DEFAULT_CATALOG, theme: defaultTheme })
```

---

## Message Processor

### useMessageProcessor

`useMessageProcessor` is the core reactive state manager, responsible for:

1. Receiving raw A2UI messages from the Agent
2. Parsing and validating message format
3. Maintaining the **Surface map** (`Map<surfaceId, Surface>`)
4. Exposing a reactive `getSurfaces()` for template binding

```ts
const processor = useMessageProcessor()

// Process a single message or an array of messages
processor.processMessages(payload)

// Get the reactive Surface Map (can be used directly in v-for)
const surfaces = processor.getSurfaces()
```

### A2UI Message Structure

Messages sent by Agents come in three forms:

| Type                 | Description                                 |
|--------------------|------------------------------------|
| `A2AServerPayload` | Standard A2A server payload containing a `parts` array |
| `A2TextPayload`    | Plain text payload, rendered as Markdown    |
| `A2DataPayload`    | Structured data payload with `surface_id` + `content` |

---

## Catalog (Component Registry)

The Catalog is a mapping from **component type names → Vue components**, determining which Vue component renders JSON like `type: "card"`.

### DEFAULT_CATALOG

The built-in catalog includes registrations for all official components:

```ts
import { DEFAULT_CATALOG } from 'a2ui-vue'
// DEFAULT_CATALOG: Record<string, Component>
```

### Custom Catalog

You can extend or fully replace the default Catalog:

```ts
import { DEFAULT_CATALOG } from 'a2ui-vue'
import MyCustomCard from './MyCustomCard.vue'

const myCatalog = {
  ...DEFAULT_CATALOG,
  // Register a custom component type
  my_card: MyCustomCard,
}

provideA2UI({ catalog: myCatalog, theme: defaultTheme })
```

---

## Rendering Pipeline

The complete flow from an A2UI message arriving to being output on the page:

```
Agent JSON message
      │
      ▼
useMessageProcessor.processMessages()
      │  Parse parts, extract surface_id
      ▼
Surface Map (reactive Map)
      │
      ▼
<A2UISurface :surface-id :surface />
      │  Iterate surface.content
      ▼
<A2UiRenderer :component-data />
      │  Look up Catalog[component.type]
      ▼
Specific component (A2UICard / A2UIText / A2UIButton ...)
```

### A2UiRenderer

`A2UiRenderer` is the core of recursive rendering — it dynamically loads and renders the corresponding Catalog entry based on `componentData.type`:

```vue
<A2UiRenderer :component-data="node" />
```

---

## Markdown Rendering

`useMarkdownRenderer` provides the ability to safely render Markdown strings to HTML (based on `markdown-it` + `dompurify`):

```ts
import { useMarkdownRenderer } from 'a2ui-vue'

const { renderMarkdown } = useMarkdownRenderer()
const html = renderMarkdown('**Hello** _World_')
// → '<p><strong>Hello</strong> <em>World</em></p>'
```

> All output is sanitized by DOMPurify to prevent XSS injection.
