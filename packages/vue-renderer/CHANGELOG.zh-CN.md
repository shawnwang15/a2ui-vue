## 0.9.3

### 核心架构

#### 引入 `GenericBinder` 绑定体系

- 新增 **`useBinder`** composable，作为 Lit 版 `A2uiController` 的 Vue 对应实现，通过 `@a2ui/web_core` 的 `GenericBinder` 将组件属性绑定桥接到 Vue 响应式 `bound` ref。
- 新增 **`SCHEMA_REGISTRY`**，将 v0.9 基础目录中各组件类型映射到真实 Zod schema，供 `GenericBinder` 正确分类 DYNAMIC / ACTION / STRUCTURAL / CHECKABLE 等属性。
- **`useDynamicComponent`** 集成 `useBinder`，新增返回 `bound` 与 `resolveChildren`；原有 `sendAction`、`resolveDynamicValue`、`resolvePrimitive` 等 API 在 v1.0 可能会考虑移除，请提前迁移到 `bound`。

#### 新增公开 API

```ts
export { useBinder } from './rendering/useBinder';
export type { ChildRef, UseBinderResult } from './rendering/useBinder';
export { SCHEMA_REGISTRY } from './rendering/schemas';
```

### A2UI 协议：Action 支持

v0.9 中，组件的 `action` 属性描述用户交互触发后的行为。`GenericBinder` 将其解析为可直接调用的 `() => void` 回调，组件通过 `bound.value.action` 触发。

协议定义两种 action 形态：

| 形态 | JSON 结构 | 行为 |
|------|-----------|------|
| **服务端事件** | `{ "event": { "name": "submit_booking", "context": { ... } } }` | 渲染器将 action 校验后通过 `surface.onAction` 派发；`MessageProcessor` 转发至应用层 `onEvent`，由 Agent / 服务端处理 |
| **客户端函数调用** | `{ "functionCall": { "call": "openUrl", "args": { ... } } }` | 在客户端本地执行 catalog 中注册的函数（如 `openUrl`），不发送到服务端 |

**示例：带 action 的 Button**

```json
{
  "id": "submit-button",
  "component": "Button",
  "child": "submit-text",
  "action": {
    "event": {
      "name": "submit_booking",
      "context": {
        "partySize": { "path": "/partySize" }
      }
    }
  }
}
```

点击时，`GenericBinder` 会解析 `context` 中的 `DynamicValue`（数据绑定或字面量），生成如下 client-to-server 消息：

```json
{
  "version": "v0.9",
  "action": {
    "name": "submit_booking",
    "surfaceId": "booking-surface",
    "sourceComponentId": "submit-button",
    "timestamp": "2026-02-25T10:40:00Z",
    "context": { "partySize": 4 }
  }
}
```

**vue-renderer 实现要点：**

- `A2UIButton` 通过 `bound.value.action()` 触发 action；校验未通过时按钮禁用，不触发 action。
- `MessageProcessor` 订阅 `surface.onAction`，将 v0.9 surface 派发的 action 转发到渲染器 `dispatch` 管道，示例应用可通过 `onEvent` 接收。
- `useDynamicComponent.sendAction` 已增强对 v0.9 `functionCall.args` 的 `DynamicValue` 解析（该 API 计划在 v1.0 弃用，请改用 `bound`）。

### A2UI 协议：Checks 校验支持

v0.9 中，支持 `Checkable` trait 的组件可声明 `checks` 数组，实现客户端响应式校验。每条规则包含：

- **`condition`**：布尔型 `DynamicValue`，通常为 `FunctionCall`（如 `required`、`regex`、`min_length`），函数返回 `true` 表示通过。
- **`message`**：校验失败时展示的错误文案。

```json
{
  "checks": [
    {
      "condition": {
        "call": "required",
        "args": { "value": { "path": "/formData/zip" } }
      },
      "message": "Zip code is required"
    },
    {
      "condition": {
        "call": "regex",
        "args": {
          "value": { "path": "/formData/zip" },
          "pattern": "^[0-9]{5}$"
        }
      },
      "message": "Must be a 5-digit zip code"
    }
  ]
}
```

`GenericBinder` 将 `checks` 识别为 **CHECKABLE** 属性，订阅每条 `condition` 的数据变化，并向 `bound` 注入：

- **`isValid`**：所有规则均通过时为 `true`
- **`validationErrors`**：失败规则的 `message` 列表

**支持 `checks` 的组件：**

| 组件 | 校验失败时的 UI 行为 |
|------|-------------------|
| **Button** | 按钮禁用（`disabled`），展示 `validationErrors`；校验通过后才可触发 `action` |
| **TextField** | 设置 `aria-invalid`，展示首条错误；与 `validationRegexp` 结果合并 |
| **CheckBox** | 展示校验错误提示 |
| **ChoicePicker** | 展示校验错误提示 |
| **Slider** | 展示校验错误提示 |
| **DateTimeInput** | 展示校验错误提示 |

**示例：带 checks 的 Button（校验未通过时自动禁用）**

```json
{
  "id": "submit-button",
  "component": "Button",
  "child": "submit-text",
  "checks": [
    {
      "condition": {
        "call": "required",
        "args": { "value": { "path": "/partySize" } }
      },
      "message": "Party size is required"
    }
  ],
  "action": { "event": { "name": "submit_booking" } }
}
```

当 `/partySize` 为空时，按钮自动禁用；填写有效值后恢复可点击并允许触发 action。

### 组件迁移与功能增强

所有基础目录组件已迁移为通过 `bound` 读取绑定值，替代手动 `resolvePrimitive` / `setData` 模式。

| 组件 | 主要变化 |
|------|----------|
| **TextField** | 支持 `obscured`（密码）、`longText`（多行 textarea）；`checks` 与 `validationRegexp` 校验错误展示；通过 `bound.setValue` 写回数据 |
| **ChoicePicker** | 大幅重写：多选、可筛选、chips 展示样式、下拉交互、`checks` 校验状态 |
| **Checkbox** | 迁移至 `bound`；`checks` 校验展示；样式优化 |
| **Button** | 迁移至 `bound`；`checks` 联动禁用与 `action` 触发；样式与交互优化 |
| **Slider** | 迁移至 `bound`；`checks` 校验展示；样式优化 |
| **DateTimeInput** | 迁移至 `bound`；`checks` 校验展示；样式优化 |
| **List** | 新增 `align`、`listStyle`（`ordered` / `unordered` / `none`）；支持 `<ol>` / `<ul>` 语义化渲染 |
| **Tabs** | 样式重构（tablist / tabpanel 语义、选中态样式）；修复 tab 标题改为从 `bound.value.tabs[i].title` 响应式解析 |
| **Modal** | 居中弹窗、毛玻璃 backdrop、入场动画、关闭按钮无障碍与 hover 样式 |
| **Text / Image / Icon / Video / Audio / Divider / Row / Column** | 迁移至 `bound` 绑定模式 |
