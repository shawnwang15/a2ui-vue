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

Call `provideA2UI` in your app entry file `main.ts` to inject the Catalog and theme:

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import 'a2ui-vue/dist/a2ui-vue.css'

const app = createApp(App)

// Inject A2UI config (must be called before mount)
provideA2UI({
  app,
  catalog: DEFAULT_CATALOG,
  theme: defaultTheme,
})

app.mount('#app')
```

::: tip
`provideA2UI` requires the `app` instance and must be called before `app.mount()`. This ensures all child components can consume the config via `useA2UIConfig()`.
:::

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

Here's a complete integration example based on `samples/client/restaurant`:

### main.ts

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import 'a2ui-vue/dist/a2ui-vue.css'

const app = createApp(App)

provideA2UI({
  app,
  catalog: DEFAULT_CATALOG,
  theme: defaultTheme,
})

app.mount('#app')
```

### App.vue

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { A2UISurface, useMessageProcessor } from 'a2ui-vue'

const processor = useMessageProcessor()

// Push A2UI v0.9 protocol messages to the renderer
processor.processMessages([
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "main",
      "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
    }
  },
  {
    "version": "v0.9",
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
          "text": "Welcome to a2ui-vue.",
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

const surfaces = computed(() => Array.from(processor.getSurfaces()))
</script>

<template>
  <A2UISurface
    v-for="[surfaceId] in surfaces"
    :key="surfaceId"
    :surface-id="surfaceId"
  />
</template>
```

## Next Steps

- Dive deeper into [Vue Renderer Core Concepts](/en/v0.9/guide/vue-renderer)
- Browse all [Built-in Components](/en/v0.9/guide/components)
- Check out real-running [Sample Demos](/en/v0.9/samples/overview)
