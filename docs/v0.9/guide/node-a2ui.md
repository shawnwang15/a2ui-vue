---
description: "在 Node.js 中使用 @a2ui/agent-sdks 构建符合 A2UI 协议的 AI Agent 服务端，与 a2ui-vue 前端渲染器无缝对接。"
---

# Node A2UI 与 Agent 简要说明



## 为什么除了 Vue Renderer 还需要 node-a2ui？

`a2ui-vue` 解决的是 **客户端渲染** 把 A2UI 消息渲染成 Vue 组件树。  
而在一个完整的 Agent 系统里，还需要服务端来负责：

- 接收用户请求
- 调用模型或工具
- 组织数据查询逻辑
- 生成合法的 A2UI JSON 消息
- 通过 A2A / HTTP 等方式返回给客户端

`node-a2ui/` 就是这个服务端层的 Node.js 实现基础。

## 目录结构

```text
node-a2ui/
├── agent_sdks/
│   ├── src/index.ts
│   └── src/a2ui/
│       ├── core/
│       ├── basicCatalog/
│       └── a2a.ts
└── a2a_agents/
    ├── src/index.ts
    └── src/a2ui_agent/
        └── agent.ts
```

## agent_sdks：Node.js Agent SDK

`node-a2ui/agent_sdks` 对应 npm 包 `@a2ui/agent-sdk`，是写 Node Agent 时复用的基础能力层。

从源码导出的内容看，它主要提供了这些模块：

| 模块 | 用途 |
|------|------|
| `core/schema/*` | Schema 常量、Catalog Provider、Schema Manager、Validator |
| `core/parser/*` | A2UI Payload 修复与解析逻辑 |
| `core/inferenceStrategy` | 推理策略相关能力 |
| `basicCatalog/*` | 基础组件目录与 Provider |
| `a2a.ts` | A2A 相关工具函数 |

这意味着你在写 Agent 时，不需要手工拼接所有消息结构，可以直接复用 SDK 做：

- 消息结构校验
- Catalog 组织
- 协议层解析与修复
- 与 A2A 通信格式相关的适配

## a2a_agents：示例 Agent 包

`node-a2ui/a2a_agents` 对应包 `@a2ui/a2ui-agent`，它不是通用 SDK，而是一个更接近“可运行 Agent”形态的示例实现。

它的定位是：

- 演示如何在 Node.js 中基于 SDK 组织 Agent 逻辑
- 提供一个最小但完整的 Agent 封装方式
- 让业务 sample 可以参考其结构继续扩展

你可以把它理解成：

```text
@a2ui/agent-sdk     -> 基础设施层
@a2ui/a2ui-agent    -> 示例封装层
samples/agent/*     -> 具体业务 Agent 应用层
```  

## sample agent 说明

### component_gallery

这是一个 **静态展示型 Agent**。

- 不依赖 LLM
- 重点是展示 A2UI 基础组件能渲染出什么效果
- 非常适合做 Catalog、Renderer、交互联调

### contact_lookup

这是一个 **查询型 Agent**。

- 依赖 LLM 和工具调用
- 面向联系人查找场景
- 会把查询结果整理成联系人卡片、字段列表等 A2UI 结构

### restaurant_finder

这是一个 **推荐型 Agent**。

- 依赖 LLM 和工具调用
- 面向餐厅推荐与筛选
- 会返回更丰富的结果卡片与列表结构

## 一次完整的数据流

从目录职责上，可以把整个工程理解成下面这条链路：

```text
用户输入
  -> samples/client/*    前端发起请求并接收消息
  -> samples/agent/*     业务 Agent 处理请求
  -> node-a2ui/*         SDK / Agent 基础能力支持
  -> 生成 A2UI JSON
  -> a2ui-vue            Vue Renderer 渲染成页面
```


