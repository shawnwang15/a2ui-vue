# Introduction

## What is A2UI?

**A2UI (Agent-to-UI)** is an open protocol that defines the communication standard between AI Agents and frontend rendering layers.  
Agents send structured JSON messages to express "what UI they want to display," and the frontend renderer translates these intents into real visual components.

```
AI Agent  ──(A2UI JSON message)──►  Vue Renderer  ──►  User Interface
```

This decoupled design provides the following advantages:

- **Agents don't need to know UI frameworks**: Just output valid A2UI JSON — the rendering solution can be swapped at any time
- **Frontend is reusable**: The same Vue Renderer can connect to any protocol-compliant Agent
- **Protocol versioning**: Currently supports v0.8 / v0.9 / v0.10 with smooth migration paths

## What is a2ui-vue?

**a2ui-vue** is the **community Vue 3 renderer** for the A2UI protocol — a Vue wrapper layer on top of `@a2ui/web_core`.

| Layer           | Package                | Responsibility                              |
|--------------|----------------------|----------------------------------|
| Protocol Core  | `@a2ui/web_core`     | JSON Schema, type definitions, message parsing logic |
| Vue Renderer   | `a2ui-vue`           | Vue 3 component implementation, theme system, Catalog management |
| Agent SDK      | `@a2ui/agent-sdks`   | Node.js Agent development toolkit |

## Monorepo Structure

```
a2ui-vue/
├── packages/
│   ├── vue-renderer/       # a2ui-vue — Vue 3 Renderer main package
│   └── web_core/           # @a2ui/web_core — Protocol core & types
├── node-a2ui/
│   ├── agent_sdks/         # Node.js Agent SDK
│   └── a2a_agents/         # Agent implementation examples
├── samples/
│   ├── agent/              # Agent samples (component-gallery / contact / restaurant)
│   └── client/             # Frontend client samples (gallery / contact / restaurant)
├── specification/          # A2UI protocol specification (v0.8 ~ v0.10)
└── docs/                   # This documentation site (VitePress)
```

## What is node-a2ui?

`node-a2ui/` is the collection of **Node.js Agent-side** implementations in this repository, containing two main parts:

| Directory | Package | Purpose |
|------|------|------|
| `node-a2ui/agent_sdks` | `@a2ui/agent-sdk` | Provides Schema, Catalog, Parser, A2A utilities to help Node.js Agents generate valid A2UI messages |
| `node-a2ui/a2a_agents` | `@a2ui/a2ui-agent` | A sample Agent package based on the SDK, demonstrating how to organize Agent logic in Node.js |

In terms of responsibility, `packages/vue-renderer` solves "**how to render A2UI messages**," while `node-a2ui` solves "**how to generate those messages on the server**."

Think of it this way:

```
node-a2ui (Node Agent / SDK)
	└── Generates A2UI JSON messages
				│
				▼
a2ui-vue (Vue Renderer)
	└── Renders messages into pages
```

For more details, see [Node A2UI & Agents](/en/guide/node-a2ui).

## What do the sample agents do?

The samples under `samples/agent/` are actual runnable Agent services. They expose Agent Cards, receive client requests, and return A2UI messages to the frontend renderer.

- `component_gallery`: Static component showcase Agent — no LLM required
- `contact_lookup`: Contact search Agent — uses tool calls to query contact data and return card UI
- `restaurant_finder`: Restaurant recommendation Agent — generates restaurant recommendation UI via tools and datasets

These Agents correspond one-to-one with the Vue frontend samples in `samples/client/`, forming complete "Agent + Renderer" integration scenarios.

## Version Notes

The current release is **v0.8.x**, published as npm package `a2ui-vue` in both ESM and CJS formats.

> Licensed under MIT. Vue Renderer is a community contribution.
