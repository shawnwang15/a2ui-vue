---
description: "深入了解 a2ui-vue(A2UI、a2ui) 的核心抽象：Config 配置系统、MessageProcessor 消息处理器与 Catalog 组件目录，以及主题定制方法。"
---

# Vue Renderer 核心概念

`a2ui-vue` 的设计围绕三个核心抽象展开：**Config（配置）**、**MessageProcessor（消息处理器）** 和 **Catalog（组件目录）**。

## 配置系统

### provideA2UI / useA2UIConfig

`provideA2UI` 将全局配置注入 Vue 的 provide/inject 树，所有子组件均可通过 `useA2UIConfig()` 消费：

```ts
import { createApp } from 'vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import App from './App.vue'

const app = createApp(App)

// 在 mount 之前提供配置
provideA2UI({
  app,                        // Vue 应用实例
  catalog: DEFAULT_CATALOG,   // 组件目录
  theme: defaultTheme,        // 主题对象
})

app.mount('#app')
```

在任意子组件中消费配置：

```ts
import { useA2UIConfig } from 'a2ui-vue'

const config = useA2UIConfig()
console.log(config.catalog, config.theme)
```

::: warning 注意
`provideA2UI()` 必须传入 `app` 实例并在 `app.mount()` 之前调用。`useA2UIConfig()` 必须在其后代组件中调用，否则会抛出异常。
:::

### 主题（Theme）

主题对象遵循 `@a2ui/web_core` 中定义的 `Types.Theme` 结构，用于统一控制颜色、字体、圆角等设计 Token：

```ts
import { createApp } from 'vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'

const app = createApp(App)

provideA2UI({ app, catalog: DEFAULT_CATALOG, theme: defaultTheme })
app.mount('#app')
```

---

## 消息处理器

### useMessageProcessor

`useMessageProcessor` 是核心的响应式状态管理器，负责：

1. 接收来自 Agent 的原始 A2UI 消息
2. 解析并校验消息格式
3. 维护 **Surface 映射表**（`Map<surfaceId, Surface>`）
4. 暴露响应式 `getSurfaces()` 供模板绑定

```ts
const processor = useMessageProcessor()

// 处理单条消息或消息数组
processor.processMessages(payload)

// 获取响应式 Surface Map（可直接在 v-for 中使用）
const surfaces = processor.getSurfaces()
```

### A2UI 消息结构

Agent 发送的消息分为三种形式：

| 类型                 | 说明                                 |
|--------------------|------------------------------------|
| `A2AServerPayload` | 标准 A2A 服务端载荷，含 `parts` 数组      |
| `A2TextPayload`    | 纯文本载荷，渲染为 Markdown             |
| `A2DataPayload`    | 结构化数据载荷，含 `surface_id` + `content` |

---

## 处理用户动作（Action）

当用户与组件交互（点击 `Button`、提交表单等）时，组件会触发其 `action` 定义并由处理器**派发（dispatch）**一个动作事件。你可以通过 `processor.onEvent` 订阅这些事件，把它们转发给 Agent，或在本地做出响应。

### 两种 Action 来源

组件的 `action` 属性支持两种写法，二者最终都会进入同一套 `onEvent` 管线：

| 写法            | JSON 片段                                                                 | 说明                                    |
|---------------|-------------------------------------------------------------------------|---------------------------------------|
| `event`       | `"action": { "event": { "name": "submit_form", "context": { ... } } }`  | 触发一个**服务端事件**，通常转发给 Agent      |
| `functionCall`| `"action": { "functionCall": { "call": "call", "args": { ... } } }`     | 触发一个**本地函数调用**（如拨号、打开弹窗等）   |

无论哪种写法，`context` / `args` 中的数据绑定（如 `{"path": "/phone"}`）都会在派发前**自动解析**为真实值。

### 事件结构（DispatchedEvent）

`onEvent` 的回调会收到一个 `DispatchedEvent`：

```ts
interface DispatchedEvent {
  // 标准 A2UI 客户端消息信封
  message: {
    version: 'v0.9'
    action: {
      name: string              // 动作名（来自 event.name 或 functionCall.call）
      surfaceId: string         // 触发事件的 Surface id
      sourceComponentId: string // 触发事件的组件 id
      timestamp: string         // ISO 8601 时间戳
      context: Record<string, unknown> // 已解析数据绑定后的键值对
    }
  }
  // 把后续要渲染的 A2UI 消息回传给处理器（无后续则传空数组）
  resolve: (messages: A2uiMessage[]) => void
  // 处理失败时回传错误
  reject: (error: Error) => void
}
```

> 校验（`checks`）未通过的组件不会派发动作，因此你在 `onEvent` 中收到的都是已通过本地校验的有效动作。

### 使用 processor.onEvent 订阅动作

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useMessageProcessor, type A2uiMessage } from 'a2ui-vue'

const processor = useMessageProcessor()

let unsubscribe: (() => void) | null = null

onMounted(() => {
  // onEvent 返回一个取消订阅函数
  unsubscribe = processor.onEvent(({ message, resolve, reject }) => {
    const { name, context, surfaceId } = message.action

    try {
      switch (name) {
        case 'call':
          // 本地 functionCall：例如发起拨号
          window.location.href = `tel:${context.number}`
          resolve([]) // 没有后续 UI 更新
          break

        case 'submit_contact_form':
          // 服务端 event：转发给 Agent，并把返回的 A2UI 消息回传给处理器渲染
          sendToAgent(surfaceId, context).then((followUpMessages: A2uiMessage[]) => {
            resolve(followUpMessages)
          })
          break

        default:
          resolve([]) // 未知动作：直接结束
      }
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)))
    }
  })
})

// 组件卸载时务必取消订阅，避免重复回调
onUnmounted(() => {
  unsubscribe?.()
})

declare function sendToAgent(
  surfaceId: string,
  context: Record<string, unknown>,
): Promise<A2uiMessage[]>
</script>
```

::: tip 提示
`resolve(messages)` 接收的数组会被处理器当作来自 Agent 的后续消息处理（例如 `updateComponents` / `updateDataModel`），从而实现“点击 → 调用后端 → 局部刷新 UI”的闭环。若本次交互无需更新界面，传入空数组 `resolve([])` 即可。
:::

---

## Catalog（组件目录）

Catalog 是**组件类型名 → Vue 组件**的映射表，决定了 `type: "card"` 这样的 JSON 描述最终由哪个 Vue 组件来渲染。

### DEFAULT_CATALOG

内置目录包含所有官方组件的注册：

```ts
import { DEFAULT_CATALOG } from 'a2ui-vue'
// DEFAULT_CATALOG: Record<string, Component>
```

### 自定义 Catalog

你可以扩展或完全替换默认 Catalog：

```ts
import { DEFAULT_CATALOG } from 'a2ui-vue'
import MyCustomCard from './MyCustomCard.vue'

const myCatalog = {
  ...DEFAULT_CATALOG,
  // 注册自定义组件类型
  my_card: MyCustomCard,
}

provideA2UI({ catalog: myCatalog, theme: defaultTheme })
```

---

## 渲染管线

A2UI 消息从进入到输出页面的完整流程如下：

```
Agent JSON 消息
      │
      ▼
useMessageProcessor.processMessages()
      │  解析 parts，提取 surface_id
      ▼
Surface Map（响应式 Map）
      │
      ▼
<A2UISurface :surface-id :surface />
      │  遍历 surface.content
      ▼
<A2UiRenderer :component-data />
      │  查找 Catalog[component.type]
      ▼
具体组件（A2UICard / A2UIText / A2UIButton ...）
```

### A2UiRenderer

`A2UiRenderer` 是递归渲染的核心，根据 `componentData.type` 动态加载并渲染对应的 Catalog 条目：

```vue
<A2UiRenderer :component-data="node" />
```

---

## Markdown 渲染

`useMarkdownRenderer` 提供将 Markdown 字符串安全渲染为 HTML 的能力（基于 `markdown-it` + `dompurify`）：

```ts
import { useMarkdownRenderer } from 'a2ui-vue'

const { renderMarkdown } = useMarkdownRenderer()
const html = renderMarkdown('**Hello** _World_')
// → '<p><strong>Hello</strong> <em>World</em></p>'
```

> 所有输出均经过 DOMPurify 净化，防止 XSS 注入。
