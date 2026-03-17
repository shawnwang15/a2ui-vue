# a2ui-vue

[![A2UI Protocol](https://img.shields.io/badge/A2UI-v0.8.x-646cff.svg)](https://a2ui.org/)
[![docs](https://img.shields.io/badge/文档-在线阅读-brightgreen)](https://shawnwang15.github.io/a2ui-vue/)

> **a2ui-vue** 是 [A2UI（Agent-to-UI）开放协议](https://a2ui.org/) 的社区 **Vue 3 渲染器**。  
> 让 AI Agent 通过结构化 JSON 表达 UI 意图，在任意 Vue 3 应用中渲染出丰富的、可交互的用户界面——无需 Agent 了解任何 HTML/CSS。

**[📖 文档](https://shawnwang15.github.io/a2ui-vue/)** · **[🌐 English](README.md)**

## 一页速览

- 产品定位：A2UI（Agent-to-UI）协议的 Vue 3 渲染器
- 输入：AI Agent 或后端服务生成的结构化 A2UI JSON 消息
- 输出：丰富的、可交互的 Vue 用户界面
- 适用场景：生成式 UI、Agent 工作流、AI Copilot、工具驱动型前端界面
- 技术栈：Vue 3、TypeScript、Composition API、可扩展组件 Catalog
- 协议兼容：A2UI v0.8、v0.9、v0.10

## 导航

- [为什么选择 a2ui-vue？](#为什么选择-a2ui-vue)
- [什么是 A2UI？](#什么是-a2ui)
- [安装](#安装)
- [三行代码快速接入](#三行代码快速接入)
- [适用场景](#适用场景)
- [文档地图](#文档地图)
- [常见问题](#常见问题)
- [Monorepo 结构](#monorepo-结构)
- [常用命令](#常用命令)
- [示例应用](#示例应用)

---

## 为什么选择 a2ui-vue？

- 把 Agent 逻辑和前端实现细节解耦
- 让 AI Agent 用结构化 JSON 描述界面，而不是直接拼 HTML
- 为 Vue 团队提供原生的 TypeScript、主题系统和组件复用能力
- 让 Agent 生成 UI 更可控、更可维护、更容易调试

## 什么是 A2UI？

**A2UI（Agent-to-UI）** 是一个开放协议，定义了 AI Agent 与前端渲染层之间的通信规范。  
Agent 通过发送结构化 JSON 消息表达 UI 意图，无需关心 HTML/CSS 实现，前端渲染器负责将消息转换为真实的可视组件。

```
AI Agent  ──(A2UI JSON 消息)──►  a2ui-vue 渲染器  ──►  用户界面
```

**a2ui-vue** 是 A2UI 协议的社区 Vue 3 实现：
- 20+ 内置组件（布局、内容、媒体、输入）
- Composables：`provideA2UI`、`useMessageProcessor`、`useA2UIConfig`
- 可扩展的组件 Catalog 与主题系统
- 完整 TypeScript 支持，ESM + CJS 双格式发布
- 与 Google 官方 Angular / Lit 实现兼容同一协议规范

## 安装

```bash
npm install a2ui-vue
# 或
pnpm add a2ui-vue
```

> **前置要求**：Vue 3.4+、Node.js 18+

## 三行代码快速接入

```vue
<!-- App.vue -->
<script setup lang="ts">
import { provideA2UI, DEFAULT_CATALOG } from 'a2ui-vue'
import 'a2ui-vue/dist/vue.css'

provideA2UI({ catalog: DEFAULT_CATALOG })
</script>
```

```vue
<!-- YourPage.vue -->
<script setup lang="ts">
import { useMessageProcessor, A2UIRenderer } from 'a2ui-vue'

const processor = useMessageProcessor()
// 接入 Agent 消息：processor.processMessage(msg)
</script>

<template>
  <A2UIRenderer :surfaces="processor.surfaces" />
</template>
```

## 适用场景

- 需要渲染卡片、列表、表单、媒体内容的 AI 对话应用
- 需要根据工具输出动态生成任务界面的内部 Copilot
- 需要在 Vue 3 中落地协议驱动型 Generative UI 的 Agent 平台
- 希望跨模型、跨 Agent 实现保持一致渲染结果的系统

## 文档地图

| 主题 | 链接 |
|------|------|
| 项目简介 | [文档：简介](https://shawnwang15.github.io/a2ui-vue/) |
| 快速上手 | [文档：快速上手](https://shawnwang15.github.io/a2ui-vue/guide/getting-started.html) |
| 渲染器核心概念 | [文档：Vue Renderer](https://shawnwang15.github.io/a2ui-vue/guide/vue-renderer.html) |
| 组件参考 | [文档：组件参考](https://shawnwang15.github.io/a2ui-vue/guide/components.html) |


## 常见问题

### a2ui-vue 是什么？

a2ui-vue 是 A2UI 开放协议的 Vue 3 渲染器，负责把 AI Agent 输出的结构化 JSON 消息渲染成真实的可交互 Vue 组件。

### A2UI 是什么？

A2UI 是 Agent-to-UI 的缩写，是一种用结构化数据描述 UI 意图的开放协议，与具体渲染框架解耦。

### 它和直接生成 HTML 有什么区别？

Agent 输出的是结构化 UI 数据，不是原始 HTML。渲染器统一负责组件表现、主题和交互行为，因此一致性和可维护性更高。

### 可以和任意 LLM 或 Agent 框架一起使用吗？

可以。只要模型或 Agent 系统能够输出符合 A2UI 协议的 JSON，就可以接入 a2ui-vue。

### 支持自定义组件吗？

支持。你可以在默认 Catalog 基础上扩展自己的组件，并通过配置注入到渲染器中。

## Monorepo 结构

```
a2ui-vue/
├── packages/
│   ├── vue-renderer/       # a2ui-vue — Vue 3 渲染器主包
│   └── web_core/           # @a2ui/web_core — 协议核心与类型
├── node-a2ui/
│   ├── agent_sdks/         # @a2ui/agent-sdks — Node.js Agent 工具包
│   └── a2a_agents/         # Agent 实现示例
├── samples/
│   ├── agent/              # 服务端 Agent 示例
│   │   ├── component_gallery/
│   │   ├── contact_lookup/
│   │   └── restaurant_finder/
│   └── client/             # Vue 前端客户端示例
│       ├── gallery/
│       ├── contact/
│       └── restaurant/
├── specification/          # A2UI 协议规范（v0.8 ~ v0.10）
└── docs/                   # VitePress 文档站
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm run build:lib` | 构建所有库包 |
| `pnpm run build:doc` | 构建 VitePress 文档站 |
| `pnpm run dev:gallery` | 启动组件画廊 Demo（Agent + 前端） |
| `pnpm run dev:contact` | 启动联系人查询 Demo（Agent + 前端） |
| `pnpm run dev:restaurant` | 启动餐厅查找 Demo（Agent + 前端） |

## 示例应用

| Demo | 说明 |
|------|------|
| **组件画廊** | 展示所有 20+ 内置组件，无需 LLM |
| **联系人查询** | AI Agent 查询联系人并返回卡片 UI |
| **餐厅查找** | AI Agent 推荐餐厅并生成结构化 UI |

## 许可证

[MIT](LICENSE)
