---
description: a2ui-vue(A2UI、a2ui) Three full-stack demo apps — Component Gallery, Contact Lookup, and Restaurant Finder — showing end-to-end a2ui-vue integration with real AI agents.
---

# Samples Overview

This section provides three complete demo applications showing how to integrate `a2ui-vue` with real AI Agents.

If you want to edit A2UI JSON directly and observe the rendering result, head to the [Playground](/en/playground/).

::: tip Note
UI generation speed depends on model and network conditions, and generated UIs may vary slightly based on model capabilities.
:::

## Demo List

| Demo               | Description                                          | Agent Port | Client Port |
|--------------------|---------------------------------------------|-----------|-----------|
| [Component Gallery](/en/samples/component-gallery) | Showcases all built-in A2UI components | `10005`   | `4000`    |
| [Contact Lookup](/en/samples/contact-lookup)  | LLM-driven contact search and display  | `10003`   | `4000`    |
| [Restaurant Finder](/en/samples/restaurant-finder) | LLM-driven restaurant recommendation and display | `10002`   | `4000`    |

## Monorepo Directory Mapping

```
samples/
├── agent/                  # Node.js Agent side (separate process)
│   ├── component_gallery/  # Component Gallery Agent
│   ├── contact_lookup/     # Contact Lookup Agent
│   └── restaurant_finder/  # Restaurant Finder Agent
└── client/                 # Vue 3 Frontend (separate process)
    ├── gallery/            # Component Gallery client
    ├── contact/            # Contact Lookup client
    └── restaurant/         # Restaurant Finder client
```

## How are the sample Agents divided?

The `samples/agent/*` directories are not just demo data — they are fully launchable Node.js Agent services. They are responsible for:

- Exposing Agent Cards (for client discovery and connection)
- Receiving user input or A2A requests
- Organizing internal tool calls, data queries, or LLM inference
- Generating A2UI JSON messages and returning them to the `a2ui-vue` frontend

In other words, `samples/client/*` handles "rendering and interaction," while `samples/agent/*` handles "inference, data fetching, and returning UI descriptions."

## Differences Between the Three Sample Agents

| Agent | Type | LLM Required | Data Source | Main Output |
|------|------|--------------|----------|----------|
| `component_gallery` | Static showcase Agent | No | Built-in component configs | Component library display page, JSON preview |
| `contact_lookup` | Query Agent | Yes | Contact dataset / tool queries | Contact cards, contact information display |
| `restaurant_finder` | Recommendation Agent | Yes | Restaurant dataset / tool queries | Restaurant list, recommendation cards, filtered results |

## Relationship with node-a2ui

If `samples/agent/*` represents the "business Agent applications in a specific project," then `node-a2ui/` is more like their reusable infrastructure layer underneath:

- `@a2ui/agent-sdk` provides Schema, Catalog, Parser, and A2A utilities
- Sample Agents wrap specific business logic on top of these capabilities
- Results are ultimately handed to the Vue Renderer in `samples/client/` for rendering

The recommended reading order is: start with the samples to understand how Agents work, then look at `node-a2ui` to understand how the underlying capabilities are reused.

## Quick Start for Any Demo

Each Demo can be launched with the following commands. The Agent and frontend run concurrently:

```bash
# From the project root
pnpm run dev:restaurant   # Start the Restaurant Finder Demo
pnpm run dev:contact      # Start the Contact Lookup Demo
```

> The Component Gallery requires no LLM API Key and can be run directly.

## General Prerequisites

- **Node.js 18+**
- **pnpm** (`npm install -g pnpm`)
- Install Monorepo dependencies:

```bash
# From the project root
pnpm install
pnpm run build:lib   # Build vue-renderer dependency first
```
