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

在应用根组件（通常是 `App.vue`）中调用 `provideA2UI`，注入 Catalog 和主题：

```vue
<script setup lang="ts">
import { provideA2UI, DEFAULT_CATALOG } from 'a2ui-vue'
import 'a2ui-vue/dist/vue.css'

// 使用内置默认配置
provideA2UI({
  catalog: DEFAULT_CATALOG,
  theme: {
    primaryColor: '#4f46e5',
    // 更多主题选项见「主题系统」章节
  },
})
</script>

<template>
  <RouterView />
</template>
```

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
    v-for="[surfaceId, surface] in surfaces"
    :key="surfaceId"
    :surface-id="surfaceId"
    :surface="surface"
  />
</template>
```

### 完整示例

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

// 向渲染器推送一条示例消息
processor.processMessages({
  surface_id: 'main',
  content: {
    type: 'card',
    title: 'Hello A2UI',
    body: [{ type: 'text', content: '你好，这是一张 A2UI 卡片！' }],
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

## 在 Vite 项目中使用

如果你使用 Vite，`a2ui-vue` 可直接按需引入，无需任何额外配置：

```ts
// vite.config.ts 无需特殊处理
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

## 下一步

- 深入了解 [Vue Renderer 核心概念](/guide/vue-renderer)
- 浏览所有 [内置组件](/guide/components)
- 查看真实运行的 [示例 Demo](/samples/overview)
