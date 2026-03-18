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
    v-for="[surfaceId, surface] in surfaces"
    :key="surfaceId"
    :surface-id="surfaceId"
    :surface="surface"
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

// 向渲染器推送一条示例消息
processor.processMessages([
  {
    "surfaceUpdate": {
      "surfaceId": "main",
      "components": [
        {
          "id": "root",
          "component": {
            "Column": {
              "children": {
                "explicitList": [
                  "heading",
                  "text",
                  "button"
                ]
              },
              "alignment": "start"
            }
          }
        },
        {
          "id": "heading",
          "component": {
            "Text": {
              "text": {
                "literalString": "Hello, A2UI!"
              },
              "usageHint": "h1"
            }
          }
        },
        {
          "id": "text",
          "component": {
            "Text": {
              "text": {
                "literalString": "Welcome to the a2ui-vue . Copy and Edit the JSON  to see changes in real-time."
              },
              "usageHint": "body"
            }
          }
        },
        {
          "id": "button",
          "component": {
            "Button": {
              "child": "button-text",
              "primary": true,
              "action": {
                "name": "hello-click"
              }
            }
          }
        },
        {
          "id": "button-text",
          "component": {
            "Text": {
              "text": {
                "literalString": "Get Started"
              }
            }
          }
        }
      ]
    }
  },
  {
    "beginRendering": {
      "surfaceId": "main",
      "root": "root"
    }
  }
])

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
:::
## Next Steps

- Dive deeper into [Vue Renderer Core Concepts](/en/guide/vue-renderer)
- Browse all [Built-in Components](/en/guide/components)
- Check out real-running [Sample Demos](/en/samples/overview)
