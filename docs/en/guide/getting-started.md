---
description: Get started with a2ui-vue(A2UI、a2ui) in three steps — install, configure provideA2UI, and use useMessageProcessor to render AI agent messages in your Vue 3 app.
---

# Quick Start

## Installation

Install `a2ui-vue` in your Vue 3 project:

::: code-group

```bash [npm]
npm install a2ui-vue
```

```bash [pnpm]
pnpm add a2ui-vue
```

```bash [yarn]
yarn add a2ui-vue
```

:::

> **Prerequisites**: Vue 3.4+, Node.js 18+

## Basic Usage

### 1. Provide Configuration (provideA2UI)

Call `provideA2UI` in your root component (typically `App.vue`) to inject the Catalog and theme:

```vue
<script setup lang="ts">
import { provideA2UI, DEFAULT_CATALOG ,defaultTheme} from 'a2ui-vue'
import 'a2ui-vue/dist/a2ui-vue.css'

// Use built-in default configuration
provideA2UI({
  catalog: DEFAULT_CATALOG,
  theme: defaultTheme,
})
</script>

<template>
  <RouterView />
</template>
```

### 2. Process Agent Messages (useMessageProcessor)

`useMessageProcessor` receives the raw message stream from the Agent, parses it, and produces a renderable list of **Surfaces**:

```vue
<script setup lang="ts">
import { useMessageProcessor } from 'a2ui-vue'

const processor = useMessageProcessor()

// Simulate receiving messages pushed by the Agent (typically from A2A/SSE stream)
function onAgentMessage(rawPayload: unknown) {
  processor.processMessages(rawPayload)
}

// Get all Surfaces (reactive Map)
const surfaces = processor.getSurfaces()
</script>
```

### 3. Render Surfaces (A2UISurface)

Pass each entry from `surfaces` to `<A2UISurface>` for rendering:

```vue
<template>
  <A2UISurface
    v-for="[surfaceId] in surfaces"
    :key="surfaceId"
    :surface-id="surfaceId"
  />
</template>
```

## Complete Example
:::demo
```vue
<script setup lang="ts">
import {
  A2UISurface,
  useMessageProcessor,
  provideA2UI,
  DEFAULT_CATALOG,
  defaultTheme
} from 'a2ui-vue'
import 'a2ui-vue/dist/a2ui-vue.css'
provideA2UI({ catalog: DEFAULT_CATALOG, theme: defaultTheme })

const processor = useMessageProcessor()

// Push a sample message to the renderer (A2UI v0.9 protocol)
processor.processMessages([
  {
    "createSurface": {
      "surfaceId": "main",
      "root": "root"
    }
  },
  {
    "updateComponents": {
      "surfaceId": "main",
      "components": [
        {
          "id": "root",
          "component": "Column",
          "children": ["heading", "text", "button"],
          "align": "start"
        },
        {
          "id": "heading",
          "component": "Text",
          "text": "Hello, A2UI!",
          "variant": "h1"
        },
        {
          "id": "text",
          "component": "Text",
          "text": "Welcome to a2ui-vue. Copy and edit the JSON to see changes in real-time.",
          "variant": "body"
        },
        {
          "id": "button",
          "component": "Button",
          "child": "button-text",
          "variant": "primary",
          "action": { "event": { "name": "hello-click" } }
        },
        {
          "id": "button-text",
          "component": "Text",
          "text": "Get Started"
        }
      ]
    }
  }
])

const surfaces = processor.getSurfaces()
</script>

<template>
  <div class="app">
    <A2UISurface
        v-for="[id] in surfaces"
        :key="id"
        :surface-id="id"
    />
  </div>
</template>

```
:::
## Next Steps

- Dive deeper into [Vue Renderer Core Concepts](/en/guide/vue-renderer)
- Browse all [Built-in Components](/en/guide/components)
- Check out real-running [Sample Demos](/en/samples/overview)
