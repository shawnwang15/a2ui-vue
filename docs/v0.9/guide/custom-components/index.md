---
description: "在 a2ui-vue 中实现并注册自定义 Catalog 组件，使用 useDynamicComponent 接入主题、数据绑定与动作派发。"
---

# 自定义组件

在 [Catalog（组件目录）](/v0.9/guide/vue-renderer#catalog-组件目录) 中注册类型名之后，还需要实现对应的 Vue 组件。所有内置组件（如 `A2UIButton`、`A2UITextField`）都通过 **`useDynamicComponent`** 这一组合式 API 接入渲染管线——它封装了主题、数据绑定、动作派发等通用逻辑，让你只需关注 UI 呈现。

本章节提供两个完整示例：

- [动作组件（Button）](/v0.9/guide/custom-components/action-button) — 触发 `action`、渲染子节点、响应 `checks` 校验
- [输入组件（TextField）](/v0.9/guide/custom-components/text-field) — 双向数据绑定、`label` 关联、校验展示

---

## useDynamicComponent

### 基本用法

每个 Catalog 组件都应接收三个**固定 prop**（由 `A2UiRenderer` 自动传入）：

| Prop        | 类型                  | 说明                                      |
|-------------|---------------------|-----------------------------------------|
| `surfaceId` | `string \| null`    | 当前 Surface 的 id，用于读写数据模型与派发动作     |
| `component` | `VueComponentNode`  | 当前组件节点（含 `id`、`type`、`properties` 等） |
| `weight`    | `string \| number`  | 在 Flex 布局中的伸缩权重，通常绑定到 CSS `flex`     |

在此基础上，Catalog 条目的 `props` 函数还可以从 `node.properties` 中提取额外 prop（如 `label`、`variant`）。

```ts
import { useDynamicComponent, type VueComponentNode } from 'a2ui-vue'

const props = defineProps<{
  surfaceId: string | null
  component: VueComponentNode
  weight: string | number
  // 以下由 Catalog props 提取函数传入
  action?: unknown
  variant?: string
}>()

const { theme, processor, bound, getUniqueId } = useDynamicComponent(props)
```

### 解构参数的用途

| 返回值          | 类型                              | 用途                                                                 |
|----------------|----------------------------------|--------------------------------------------------------------------|
| `theme`        | `A2UITheme`                      | 通过 `provideA2UI` 注入的主题对象。用 `theme.components.Xxx` 获取 CSS class，`theme.additionalStyles?.Xxx` 获取内联样式，保持与内置组件一致的视觉风格 |
| `processor`    | `MessageProcessor`               | 消息处理器实例。可直接调用 `getData` / `setData` / `resolveValue` 读写数据模型，或通过 `dispatch` 派发客户端动作。多数场景下优先使用 `bound` 提供的便捷字段 |
| `bound`        | `Ref<Record<string, any>>`       | 由 GenericBinder 维护的**响应式属性快照**。动态值（`{ path }`、函数调用等）已解析为运行时值；`action` 被包装为 `() => void` 回调；带数据绑定的 prop 会附带 `setXxx` 写回函数；`checks` 校验结果体现在 `isValid` 与 `validationErrors` 中 |
| `getUniqueId`  | `(prefix: string) => string`     | 生成页面内唯一的 DOM id（如 `a2ui-input-0`），用于 `<label for>` 与表单控件的 `id` 关联，满足无障碍要求 |


---

## 注册自定义 Catalog

扩展默认 Catalog 时，每个条目是一个**加载器函数**（或带 `props` 提取器的对象），键名需与 Agent 消息中的 `component` 字段一致：

```ts
// catalog.ts
import type { Catalog } from 'a2ui-vue'
import { DEFAULT_CATALOG } from 'a2ui-vue'

export const myCatalog: Catalog = {
  ...DEFAULT_CATALOG,

  // 动作按钮：从 node.properties 提取 action / variant
  MyActionButton: {
    type: () => import('./components/MyActionButton.vue').then((m) => m.default),
    props: (node) => ({
      action: (node.properties as any).action,
      variant: (node.properties as any).variant,
    }),
  },

  // 文本输入：从 node.properties 提取 value / label / variant
  MyTextField: {
    type: () => import('./components/MyTextField.vue').then((m) => m.default),
    props: (node) => ({
      value: (node.properties as any).value ?? null,
      label: (node.properties as any).label,
      variant: (node.properties as any).variant,
    }),
  },
}
```

在应用入口注入：

```ts
import { createApp } from 'vue'
import { provideA2UI, defaultTheme } from 'a2ui-vue'
import App from './App.vue'
import { myCatalog } from './catalog'

const app = createApp(App)

provideA2UI({
  app,
  catalog: myCatalog,
  theme: defaultTheme,
})

app.mount('#app')
```

Agent 侧在 `updateComponents` 消息中使用已注册的类型名即可渲染自定义组件：

```json
{
  "component": "MyActionButton",
  "id": "submit-btn",
  "variant": "primary",
  "action": {
    "event": { "name": "submit_form", "context": {} }
  },
  "child": "btn-label"
}
```

::: tip 提示
实现自定义组件时，建议直接阅读内置 Catalog 源码作为参考：`packages/vue-renderer/src/catalog/A2UIButton.vue`（动作 + 子节点渲染）与 `A2UITextField.vue`（双向绑定 + 校验展示）。自定义主题时，记得在 `A2UITheme.components` 中为对应组件名添加 class 映射。
:::
