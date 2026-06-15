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
  app,                        // Vue 应用实例（必填）
  catalog: DEFAULT_CATALOG,   // 组件目录
  theme: defaultTheme,        // 主题对象
  catalogId: 'default',       // 可选，匹配 createSurface 消息的 catalogId，默认 'default'
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

主题对象遵循渲染器在本地定义的 `A2UITheme` 接口（不再依赖 v0.8 协议类型），用于统一控制颜色、字体等设计 Token：

```ts
export interface A2UITheme {
  additionalStyles?: Record<string, any>
  components: Record<string, any>
  elements?: Record<string, any>
  markdown?: Record<string, string[]>
}
```

`defaultTheme` 是内置的默认实现，可直接传入 `provideA2UI`：

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
3. 维护 **Surface 映射表**（`ReadonlyMap<surfaceId, SurfaceModel>`）
4. 暴露响应式 `getSurfaces()` 供模板绑定

```ts
const processor = useMessageProcessor()

// 处理一批 v0.9 服务端消息（参数为 A2uiMessage[] 数组）
processor.processMessages(messages)

// 获取响应式 Surface Map（可直接在 v-for 中使用）
const surfaces = processor.getSurfaces()

// 清空所有 Surface 并重建处理器
processor.clearSurfaces()
```

### A2UI 消息结构

`processMessages` 接收的是 v0.9 协议的 `A2uiMessage[]`。对于经由 A2A 传输层封装的载荷，渲染器另外导出了以下辅助类型（供示例应用拆包使用）：

| 类型                 | 形状                                                            | 说明                                |
|--------------------|----------------------------------------------------------------|-----------------------------------|
| `A2TextPayload`    | `{ kind: 'text'; text: string }`                               | 纯文本载荷                          |
| `A2DataPayload`    | `{ kind: 'data'; data: A2uiMessage }`                          | 结构化数据载荷，内含单条 `A2uiMessage` |
| `A2AServerPayload` | `Array<A2DataPayload \| A2TextPayload> \| { error: string }`   | A2A 服务端载荷：上述载荷的数组，或错误对象 |

> 从这些载荷中提取出 `A2uiMessage` 后，再交给 `processor.processMessages([...])` 处理。

---

## 处理用户动作（Action）

当用户与组件交互（点击 `Button`、提交表单等）时，组件会触发其 `action` 定义并由处理器**派发（dispatch）**一个动作事件。你可以通过 `processor.onEvent` 订阅这些事件，把它们转发给 Agent，或在本地做出响应。

### 两种 Action 来源

组件的 `action` 属性支持两种写法：

| 写法            | JSON 片段                                                                 | 说明                                    |
|---------------|-------------------------------------------------------------------------|---------------------------------------|
| `event`       | `"action": { "event": { "name": "submit_form", "context": { ... } } }`  | 触发一个**服务端事件**，通常转发给 Agent      |
| `functionCall`| `"action": { "functionCall": { "call": "call", "args": { ... } } }`     | 触发一个**本地函数调用**（如拨号、打开弹窗等）   |

`event` 中的数据绑定（如 `{"path": "/phone"}`）会在派发前**自动解析**为真实值。

::: warning 注意
当前实现中，**只有 `event` 形式的动作会通过 `onEvent` 管线派发**；`functionCall` 由 binder/渲染器在本地处理，不会经由 `surface.dispatchAction` 转发到 `onEvent`。因此你在 `onEvent` 回调里收到的都是 `event` 动作。
:::

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

### 客户端校验（checks）

A2UI v0.9 把客户端逻辑统一抽象为**函数（Functions）**，校验便是其中一种用途。支持校验的组件（如 `TextField`、`CheckBox`、`Slider`、`ChoicePicker`、`DateTimeInput`，以及 `Button`）可以声明一个 `checks` 数组，每条规则在数据模型变化时**响应式地重新求值**，未通过时把对应的错误信息暴露给渲染层。

> 参考官方规范：[A2UI v0.9.1 — Client-side logic & validation](https://a2ui.org/specification/v0.9.1-a2ui/#client-side-logic-validation)

#### check 规则结构

渲染器内部使用的校验规则（`CheckRule`）形如：

```ts
interface CheckRule {
  // 一个返回 boolean 的 DynamicBoolean，通常是 FunctionCall。true 表示通过
  condition: { call: string; args: Record<string, unknown>; returnType: 'boolean' }
  // 校验失败时显示的错误信息
  message: string
}
```

对应的 JSON 写法（取自 `contact-card.json` 中的 `field-name`）：

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

常用的内置校验函数：`required`（非空）、`length`（长度，`min` / `max`）、`numeric`（数值范围，`min` / `max`）、`regex`（正则）、`email`（邮箱），以及用于组合多条条件的 `and` / `or` / `not`。

#### 求值结果：isValid / validationErrors

绑定器（binder）会对每条规则的 `condition` 求值，并向组件注入两个派生字段：

| 字段                | 类型         | 含义                                          |
|--------------------|------------|---------------------------------------------|
| `isValid`          | `boolean`  | 所有 `checks` 是否全部通过                       |
| `validationErrors` | `string[]` | 所有未通过规则的 `message` 列表（顺序与 `checks` 一致） |

输入类组件据此实时展示错误并标记 `aria-invalid`，例如 `TextField` 会在输入框下方显示首条错误信息。

#### checks 与 Action 的关系

`Button` 同样支持 `checks`：**只要任一条件不满足，按钮即被禁用，且不会派发 `action`**。这使得"提交"按钮可以依赖整个表单的有效性。下例（取自 `contact-card.json` 的 `submit-btn`）汇总了多个字段的校验，全部通过后才允许触发 `submit_contact_form` 事件：

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

::: warning 注意
正因为校验未通过的组件不会派发动作，你在 `onEvent` 回调中收到的都是**已通过本地校验**的有效动作，通常无需再做重复的必填/格式校验。
:::

---

## Catalog（组件目录）

Catalog 是**组件类型名 → 组件加载器**的映射表，决定了 `type: "Card"` 这样的 JSON 描述最终由哪个 Vue 组件来渲染。

每个条目（`CatalogEntry`）有两种写法：

```ts
type CatalogLoader = () =>
  | Promise<Component | DefineComponent>
  | Component
  | DefineComponent

type CatalogEntry =
  | CatalogLoader                                          // 直接返回（或异步导入）一个 Vue 组件
  | {
      type: CatalogLoader                                  // 组件加载器
      props: (node: VueComponentNode) => Record<string, any> // 从节点属性中提取传给组件的 props
    }

interface Catalog {
  [type: string]: CatalogEntry
}
```

### DEFAULT_CATALOG

内置目录包含所有官方组件的注册（`Row` / `Column` / `Card` / `Text` / `Button` / `Image` / `List` / `Tabs` / `Modal` 等）：

```ts
import { DEFAULT_CATALOG } from 'a2ui-vue'
// DEFAULT_CATALOG: Catalog（Record<string, CatalogEntry>）
```

### 自定义 Catalog

你可以扩展或完全替换默认 Catalog。注意每个条目是一个**加载器函数**，而不是组件本身：

```ts
import { createApp } from 'vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import MyCustomCard from './MyCustomCard.vue'

const myCatalog = {
  ...DEFAULT_CATALOG,
  // 注册自定义组件类型（值为返回组件的加载器）
  MyCard: () => MyCustomCard,
  // 或带 props 提取：
  // MyCard: { type: () => MyCustomCard, props: (node) => ({ title: node.properties.title }) },
}

const app = createApp(App)
provideA2UI({ app, catalog: myCatalog, theme: defaultTheme })
app.mount('#app')
```

注册类型名之后，还需实现对应的 Vue 组件。详见 **[自定义组件](/v0.9/guide/custom-components/)** 章节，其中包含 `useDynamicComponent` API 说明，以及动作按钮与文本输入的完整示例（含 Catalog 注册代码）。

---

## 渲染管线

A2UI 消息从进入到输出页面的完整流程如下：

```
Agent JSON 消息（A2uiMessage[]）
      │
      ▼
useMessageProcessor.processMessages(messages)
      │  交由 web_core v0.9 处理器构建 Surface 状态
      ▼
Surface Map（响应式 Map<surfaceId, SurfaceModel>）
      │
      ▼
<A2UISurface :surface-id="surfaceId" />
      │  从 'root' 组件构建 VueComponentNode 树
      ▼
<A2UiRenderer :surface-id :component />
      │  查找 catalog[component.type]
      ▼
具体组件（A2UICard / A2UIText / A2UIButton ...）
```

### A2UiRenderer

`A2UiRenderer` 是递归渲染的核心，根据 `component.type` 在 Catalog 中查找加载器并渲染。它接收 `surfaceId` 与 `component`（一个 `VueComponentNode`）两个 prop：

```vue
<A2UiRenderer :surface-id="surfaceId" :component="node" />
```

---

## Markdown 渲染

`useMarkdownRenderer()` 返回一个基于 `markdown-it` 的单例渲染器，通过其 `render()` 方法把 Markdown 字符串渲染为 HTML：

```ts
import { useMarkdownRenderer } from 'a2ui-vue'

const renderer = useMarkdownRenderer()
const html = renderer.render('**Hello** _World_')
// → '<p><strong>Hello</strong> <em>World</em></p>'
```

`render(value, tagClassMap?)` 还支持传入第二个参数，为指定标签（如 `p`、`h1`、`a` 等）追加自定义 class：

```ts
const html = renderer.render('# 标题', { h1: ['title', 'mb-2'] })
```

> 代码块中标记为 `html` 的内容会被渲染到带 `sandbox` 限制的 `<iframe>` 中以隔离脚本执行。
