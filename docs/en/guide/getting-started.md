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
import { provideA2UI, DEFAULT_CATALOG } from 'a2ui-vue'
import 'a2ui-vue/dist/vue.css'

// Use built-in default configuration
provideA2UI({
  catalog: DEFAULT_CATALOG,
  theme: {
    primaryColor: '#4f46e5',
    // More theme options in the "Theme System" section
  },
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
    v-for="[surfaceId, surface] in surfaces"
    :key="surfaceId"
    :surface-id="surfaceId"
    :surface="surface"
  />
</template>
```

### Complete Example

```vue
<script setup lang="ts">
import {
  A2UISurface,
  useMessageProcessor,
  provideA2UI,
  DEFAULT_CATALOG,
} from 'a2ui-vue'
import 'a2ui-vue/dist/vue.css'

provideA2UI({ catalog: DEFAULT_CATALOG, theme: {} })

const processor = useMessageProcessor()

// Push a sample message to the renderer
processor.processMessages({
  surface_id: 'main',
  content: {
    type: 'card',
    title: 'Hello A2UI',
    body: [{ type: 'text', content: 'Hello, this is an A2UI card!' }],
  },
})

const surfaces = processor.getSurfaces()
</script>

<template>
  <div class="app">
    <A2UISurface
      v-for="[id, surface] in surfaces"
      :key="id"
      :surface-id="id"
      :surface="surface"
    />
  </div>
</template>
```

## Using with Vite

If you're using Vite, `a2ui-vue` can be imported directly with no extra configuration:

```ts
// vite.config.ts — no special setup needed
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

## Next Steps

- Dive deeper into [Vue Renderer Core Concepts](/en/guide/vue-renderer)
- Browse all [Built-in Components](/en/guide/components)
- Check out real-running [Sample Demos](/en/samples/overview)
