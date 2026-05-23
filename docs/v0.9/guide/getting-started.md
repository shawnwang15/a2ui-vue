---
description: 三步将 a2ui-vue(A2UI、a2ui) 接入你的 Vue 3 应用——安装、配置 provideA2UI、使用 useMessageProcessor 处理 Agent 消息。
---

# 快速上手

## 安装

在你的 Vue 3 项目中安装 `a2ui-vue`：

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

> **前置要求**：Vue 3.4+，Node.js 18+

## 基础用法

### 1. 提供配置（provideA2UI）

在应用入口文件 `main.ts` 中调用 `provideA2UI`，注入 Catalog 和主题：

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import 'a2ui-vue/dist/a2ui-vue.css'

const app = createApp(App)

// 注入 A2UI 配置（必须在 mount 之前调用）
provideA2UI({
  app,
  catalog: DEFAULT_CATALOG,
  theme: defaultTheme,
})

app.mount('#app')
```

::: tip 提示
`provideA2UI` 必须传入 `app` 实例，并且在 `app.mount()` 之前调用。这样所有子组件都能通过 `useA2UIConfig()` 消费配置。
:::

### 2. 处理 Agent 消息（useMessageProcessor）

`useMessageProcessor` 接收来自 Agent 的原始消息流，解析后产出可渲染的 **Surface** 列表：

```vue
<script setup lang="ts">
import { useMessageProcessor } from 'a2ui-vue'

const processor = useMessageProcessor()

// 模拟接收 Agent 推送的消息（通常来自 A2A/SSE 流）
function onAgentMessage(rawPayload: unknown) {
  processor.processMessages(rawPayload)
}

// 获取所有 Surface（响应式 Map）
const surfaces = processor.getSurfaces()
</script>
```

### 3. 渲染 Surface（A2UISurface）

将 `surfaces` 中的每个条目交给 `<A2UISurface>` 渲染：

```vue
<template>
  <A2UISurface
    v-for="[surfaceId] in surfaces"
    :key="surfaceId"
    :surface-id="surfaceId"
  />
</template>
```

## 完整示例

以下是参考 `samples/client/restaurant` 的完整接入示例：

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

// 向渲染器推送 A2UI v0.9 协议消息
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

## 下一步

- 深入了解 [Vue Renderer 核心概念](/v0.9/guide/vue-renderer)
- 浏览所有 [内置组件](/v0.9/guide/components)
- 查看真实运行的 [示例 Demo](/v0.9/samples/overview)
