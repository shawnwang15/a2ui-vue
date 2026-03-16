# 简介

## 什么是 A2UI？

**A2UI（Agent-to-UI）** 是一个开放协议，定义了 AI Agent 与前端渲染层之间的通信规范。  
Agent 通过发送结构化的 JSON 消息来表达"我想展示什么样的 UI"，前端渲染器负责将这些意图翻译为真实的可视组件。

```
AI Agent  ──(A2UI JSON 消息)──►  Vue Renderer  ──►  用户界面
```

这种解耦设计带来了以下优势：

- **Agent 无需了解 UI 框架**：只需输出合规的 A2UI JSON，渲染方案随时可切换
- **前端可复用**：同一个 Vue Renderer 可以接入任意符合协议的 Agent
- **协议版本化**：当前支持 v0.8 / v0.9 / v0.10，可平滑迁移

## 什么是 a2ui-vue？

**a2ui-vue** 是 A2UI 协议的 **社区 Vue 3 渲染器**，是对 `@a2ui/web_core` 的 Vue 封装层。

| 层次           | 包名                   | 职责                              |
|--------------|----------------------|----------------------------------|
| 协议核心       | `@a2ui/web_core`     | JSON Schema、类型定义、消息解析逻辑    |
| Vue 渲染器    | `a2ui-vue`  | Vue 3 组件实现、主题系统、Catalog 管理 |
| Agent SDK   | `@a2ui/agent-sdks`   | Node.js Agent 开发工具包            |

## Monorepo 结构

```
a2ui-vue/
├── packages/
│   ├── vue-renderer/       # a2ui-vue — Vue 3 渲染器主包
│   └── web_core/           # @a2ui/web_core   — 协议核心与类型
├── node-a2ui/
│   ├── agent_sdks/         # Node.js Agent SDK
│   └── a2a_agents/         # Agent 实现示例
├── samples/
│   ├── agent/              # Agent 端示例（component-gallery / contact / restaurant）
│   └── client/             # 前端客户端示例（gallery / contact / restaurant）
├── specification/          # A2UI 协议规范（v0.8 ~ v0.10）
└── docs/                   # 本文档站（VitePress）
```

## node-a2ui 是什么？

`node-a2ui/` 是这个仓库里和 **Node.js Agent 端** 相关的实现集合，主要包含两部分：

| 目录 | 包名 | 作用 |
|------|------|------|
| `node-a2ui/agent_sdks` | `@a2ui/agent-sdk` | 提供 Schema、Catalog、Parser、A2A 工具等能力，用来帮助 Node.js Agent 生成合法的 A2UI 消息 |
| `node-a2ui/a2a_agents` | `@a2ui/a2ui-agent` | 一个基于 SDK 的示例 Agent 包，用来演示如何在 Node.js 中组织 Agent 逻辑 |

从职责上看，`packages/vue-renderer` 解决的是“**怎么把 A2UI 消息渲染出来**”，而 `node-a2ui` 解决的是“**怎么在服务端生成这些消息**”。

你可以把它理解成这样：

```
node-a2ui (Node Agent / SDK)
	└── 生成 A2UI JSON 消息
				│
				▼
a2ui-vue (Vue Renderer)
	└── 把消息渲染成页面
```

更多细节可继续阅读 [Node A2UI 与 Agent](/guide/node-a2ui)。

## samples 中的 agent 做什么？

`samples/agent/` 下的示例是实际可运行的 Agent 服务端，它们会对外暴露 Agent Card、接收客户端请求，并返回 A2UI 消息给前端渲染器。

- `component_gallery`：静态组件展示型 Agent，不依赖 LLM
- `contact_lookup`：联系人查询型 Agent，通过工具查询联系人数据并返回卡片 UI
- `restaurant_finder`：餐厅推荐型 Agent，通过工具和数据集生成餐厅推荐 UI

这些 Agent 会和 `samples/client/` 里的 Vue 前端示例一一对应，组成完整的“Agent + Renderer”联调场景。

## 版本说明

当前发布版本为 **v0.8.x**，npm 包名为 `a2ui-vue`，以 ESM / CJS 双格式分发。

> 遵循 MIT 协议。Vue Renderer 为社区贡献。
