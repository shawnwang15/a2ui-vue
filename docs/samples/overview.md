# 示例总览

本节提供三个完整的 Demo 应用，展示如何将 `a2ui-vue` 与真实的 AI Agent 集成。

如果你想先直接编辑 A2UI JSON 并观察渲染结果，可以前往 [Playground](/playground/)。

::: tip 提示
UI 生成速度受模型、网络影响，且因模型能力差异，生成的 UI 可能略有不同。
:::

## Demo 列表

| Demo               | 说明                                          | Agent 端口 | 客户端端口 |
|--------------------|---------------------------------------------|-----------|-----------|
| [组件画廊](/samples/component-gallery) | 展示所有内置 A2UI 组件     | `10005`   | `4000`    |
| [联系人查询](/samples/contact-lookup)  | LLM 驱动的联系人搜索与展示  | `10003`   | `4000`    |
| [餐厅查找](/samples/restaurant-finder) | LLM 驱动的餐厅推荐与展示   | `10002`   | `4000`    |

## Monorepo 目录对应关系

```
samples/
├── agent/                  # Node.js Agent 端（独立进程）
│   ├── component_gallery/  # 组件画廊 Agent
│   ├── contact_lookup/     # 联系人查询 Agent
│   └── restaurant_finder/  # 餐厅查找 Agent
└── client/                 # Vue 3 前端（独立进程）
    ├── gallery/            # 组件画廊客户端
    ├── contact/            # 联系人查询客户端
    └── restaurant/         # 餐厅查找客户端
```

## sample 里的 Agent 是怎么分工的？

这些 `samples/agent/*` 目录并不只是演示数据，它们本身就是可启动的 Node.js Agent 服务。它们负责：

- 暴露 Agent Card（供客户端发现和连接）
- 接收用户输入或 A2A 请求
- 组织内部工具调用、数据查询或 LLM 推理
- 生成 A2UI JSON 消息返回给 `a2ui-vue` 前端

也就是说，`samples/client/*` 负责“渲染和交互”，`samples/agent/*` 负责“推理、取数和返回 UI 描述”。

## 三个 sample agent 的区别

| Agent | 类型 | 是否依赖 LLM | 数据来源 | 主要输出 |
|------|------|--------------|----------|----------|
| `component_gallery` | 静态展示 Agent | 否 | 内置组件配置 | 组件库展示页面、JSON 预览 |
| `contact_lookup` | 查询型 Agent | 是 | 联系人数据集 / 工具查询 | 联系人卡片、联系方式展示 |
| `restaurant_finder` | 推荐型 Agent | 是 | 餐厅数据集 / 工具查询 | 餐厅列表、推荐卡片、筛选结果 |

## 与 node-a2ui 的关系

如果说 `samples/agent/*` 是“具体项目里的 Agent 应用”，那么 `node-a2ui/` 更像它们下层可复用的基础设施层：

- `@a2ui/agent-sdk` 提供 Schema、Catalog、Parser、A2A 工具
- 示例 Agent 则在这些能力上封装具体业务逻辑
- 最终都把结果交给 `samples/client/*` 中的 Vue Renderer 去渲染

因此阅读顺序通常建议是：先看 sample，理解 Agent 如何工作；再看 `node-a2ui`，理解底层能力如何复用。

## 快速启动任意 Demo

每个 Demo 均可通过以下方式一键启动，Agent 端和前端会并发运行：

```bash
# 在项目根目录
pnpm run dev:restaurant   # 启动餐厅查找 Demo
pnpm run dev:contact      # 启动联系人查询 Demo
```

> 组件画廊无需 LLM API Key，可直接运行。

## 通用前置条件

- **Node.js 18+**
- **pnpm**（`npm install -g pnpm`）
- 安装 Monorepo 依赖：

```bash
# 在项目根目录
pnpm install
pnpm run build:lib   # 先构建 vue-renderer 依赖
```
