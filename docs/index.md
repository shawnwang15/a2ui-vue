---
layout: home

hero:
  name: "a2ui-vue"
  text: "Vue 3 Renderer for A2UI Protocol"
  tagline: 让 AI Agent 只用结构化 JSON 消息，就能在你的 Vue 应用中直接渲染丰富、可交互的用户界面
  image:
    src: /logo.svg
    alt: a2ui-vue
  actions:
    - theme: brand
      text: 快速上手
      link: /v0.9/guide/getting-started
    - theme: alt
      text: 查看示例
      link: /v0.9/samples/overview
    - theme: alt
      text: GitHub
      link: https://github.com/shawnwang15/a2ui-vue


features:
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="10" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/></svg>'
    title: Agent-to-UI 协议
    details: 基于 A2UI 开放协议，AI Agent 通过结构化 JSON 消息描述 UI 意图，无需关心前端实现细节。
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 4 14 11 14 10 22 19 10 12 10 13 2"/></svg>'
    title: Vue 3 原生
    details: 使用 Composition API 与 &lt;script setup&gt;，完整 TypeScript 类型支持，与 Vue 生态无缝集成。
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/></svg>'
    title: 丰富组件库
    details: 内置布局、内容、媒体、输入等 20+ 个开箱即用的组件，支持自定义 Catalog 扩展。
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18Z"/><path d="M3 12h18"/></svg>'
    title: 主题系统
    details: 内建 defaultTheme，支持通过 provideA2UI 注入自定义主题，轻松适配产品设计规范。
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/><rect x="7" y="7" width="10" height="10" rx="2"/></svg>'
    title: 易于集成
    details: ESM / CJS 双格式发布，仅需三行代码即可在任意 Vue 应用中接入 A2UI 渲染能力。
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>'
    title: Monorepo 工程
    details: 包含 Vue Renderer、Web Core、Node.js Agent SDK 及多个全功能 Demo 应用。
---

<div class="home-description">

本项目为 A2UI 协议带来完整的 **Vue 3 支持**——基于 Vue 3 Composition API 实现全新的 Vue 3 渲染器，并提供多个配套示例应用，与Google官方现有的 Angular 及 Lit 实现保持一致的协议规范与组件体验，具体请观看示例视频或下载体验。

</div>

<div class="home-badges">
  <a href="https://www.npmjs.com/package/a2ui-vue" target="_blank" rel="noopener"><img src="https://img.shields.io/npm/v/a2ui-vue?color=4f46e5&amp;label=npm" alt="npm version"></a>
  <a href="https://github.com/shawnwang15/a2ui-vue/blob/main/LICENSE" target="_blank" rel="noopener"><img src="https://img.shields.io/npm/l/a2ui-vue?color=059669" alt="license"></a>
  <a href="https://github.com/shawnwang15/a2ui-vue" target="_blank" rel="noopener"><img src="https://img.shields.io/github/stars/shawnwang15/a2ui-vue?style=flat&amp;color=db2777&amp;label=GitHub" alt="GitHub stars"></a>
  <a href="https://github.com/shawnwang15/a2ui-vue" target="_blank" rel="noopener"><img src="https://img.shields.io/badge/Vue-3.4%2B-42b883" alt="Vue 3.4+"></a>
</div>

<div class="home-quickstart">
  <div class="home-quickstart-header">
    <span class="home-quickstart-eyebrow">Quick Start</span>
    <h2>三行代码，接入 A2UI 渲染能力</h2>
    <p>安装依赖，在入口文件注入配置，即可开始渲染 Agent 推送的界面。</p>
  </div>
  <div class="home-quickstart-grid">

```bash
npm install a2ui-vue
```

```ts
// main.ts
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'

provideA2UI({ app, catalog: DEFAULT_CATALOG, theme: defaultTheme })
```

  </div>
</div>

<div class="home-cta">
  <h2>准备好让 Agent 驱动你的界面了吗？</h2>
  <p>查看完整指南，或者直接在 Playground 中体验 A2UI JSON 实时渲染。</p>
</div>
