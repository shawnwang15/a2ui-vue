---
description: "深入了解 a2ui-vue(A2UI、a2ui) 的核心抽象：Config 配置系统、MessageProcessor 消息处理器与 Catalog 组件目录，以及主题定制方法。"
---

# Vue Renderer 核心概念

`a2ui-vue` 的设计围绕三个核心抽象展开：**Config（配置）**、**MessageProcessor（消息处理器）** 和 **Catalog（组件目录）**。

## 配置系统

### provideA2UI / useA2UIConfig

`provideA2UI` 将全局配置注入 Vue 的 provide/inject 树，所有子组件均可通过 `useA2UIConfig()` 消费：

```ts
import { provideA2UI, useA2UIConfig } from 'a2ui-vue'

// 在根组件提供配置
provideA2UI({
  catalog: DEFAULT_CATALOG, // 组件目录
  theme: defaultTheme,      // 主题对象
})

// 在任意子组件消费
const config = useA2UIConfig()
console.log(config.catalog, config.theme)
```

::: warning 注意
`useA2UIConfig()` 必须在 `provideA2UI()` 的后代组件中调用，否则会抛出异常。
:::

### 主题（Theme）

主题对象遵循 `@a2ui/web_core` 中定义的 `Types.Theme` 结构，用于统一控制颜色、字体、圆角等设计 Token：

```ts
const myTheme = {
  primaryColor: '#4f46e5',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  borderRadius: '8px',
}

provideA2UI({ catalog: DEFAULT_CATALOG, theme: myTheme })
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
