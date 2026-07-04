---
layout: home

hero:
  name: "a2ui-vue"
  text: "Vue 3 Renderer for A2UI Protocol"
  tagline: Let AI Agents render rich, interactive UIs directly in your Vue apps — with nothing but structured JSON messages
  image:
    src: /logo.svg
    alt: a2ui-vue
  actions:
    - theme: brand
      text: Get Started
      link: /en/v0.9/guide/getting-started
    - theme: alt
      text: View Samples
      link: /en/v0.9/samples/overview
    - theme: alt
      text: GitHub
      link: https://github.com/shawnwang15/a2ui-vue


features:
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="10" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/></svg>'
    title: Agent-to-UI Protocol
    details: Based on the open A2UI protocol, AI Agents describe UI intent via structured JSON messages — no knowledge of frontend implementation required.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 4 14 11 14 10 22 19 10 12 10 13 2"/></svg>'
    title: Vue 3 Native
    details: Built with Composition API and &lt;script setup&gt;, full TypeScript support, seamlessly integrated with the Vue ecosystem.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/></svg>'
    title: Rich Component Library
    details: 20+ built-in components covering layout, content, media, and input — extensible with custom Catalog support.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18Z"/><path d="M3 12h18"/></svg>'
    title: Theme System
    details: Built-in defaultTheme with custom theme injection via provideA2UI, easily adapting to your product design system.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/><rect x="7" y="7" width="10" height="10" rx="2"/></svg>'
    title: Easy Integration
    details: Published in both ESM and CJS formats — just three lines of code to add A2UI rendering to any Vue app.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>'
    title: Monorepo Project
    details: Includes Vue Renderer, Web Core, Node.js Agent SDK, and multiple full-featured demo applications.
---

<div class="home-description">

This project brings complete **Vue 3 support** to the A2UI protocol — a brand-new Vue 3 renderer built with the Composition API, along with multiple sample applications. It maintains protocol spec and component parity with the official Angular and Lit implementations by Google. See the sample videos or download to try it out.

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
    <h2>Three lines to A2UI rendering</h2>
    <p>Install the package, wire up the config in your entry file, and you're ready to render agent-driven surfaces.</p>
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
  <h2>Ready to let an Agent drive your UI?</h2>
  <p>Read the full guide, or jump straight into the Playground to try live A2UI JSON rendering.</p>
</div>
