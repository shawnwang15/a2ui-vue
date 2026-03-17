---
description: "Build A2UI-compliant AI agent servers in Node.js using @a2ui/agent-sdks and connect them seamlessly to the a2ui-vue frontend renderer."
---

# Node A2UI & Agents

## Why node-a2ui in addition to the Vue Renderer?

`a2ui-vue` solves **client-side rendering** — turning A2UI messages into a Vue component tree.  
But in a complete Agent system, a server is also needed to handle:

- Receiving user requests
- Calling models or tools
- Organizing data query logic
- Generating valid A2UI JSON messages
- Returning them to the client via A2A / HTTP or similar

`node-a2ui/` is the Node.js implementation of this server-side layer.

## Directory Structure

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

## agent_sdks: Node.js Agent SDK

`node-a2ui/agent_sdks` corresponds to the npm package `@a2ui/agent-sdk` — the foundational capability layer reused when writing Node Agents.

Looking at the source exports, it mainly provides these modules:

| Module | Purpose |
|------|------|
| `core/schema/*` | Schema constants, Catalog Provider, Schema Manager, Validator |
| `core/parser/*` | A2UI payload repair and parsing logic |
| `core/inferenceStrategy` | Inference strategy capabilities |
| `basicCatalog/*` | Basic component catalog and provider |
| `a2a.ts` | A2A-related utility functions |

This means when writing an Agent, you don't need to manually assemble all message structures — you can reuse the SDK for:

- Message structure validation
- Catalog organization
- Protocol-level parsing and repair
- Adapters for A2A communication format

## a2a_agents: Sample Agent Package

`node-a2ui/a2a_agents` corresponds to the package `@a2ui/a2ui-agent`. It's not a general SDK, but rather a sample implementation closer to a "runnable Agent."

Its purpose is to:

- Demonstrate how to organize Agent logic in Node.js using the SDK
- Provide a minimal but complete Agent encapsulation
- Give business samples a reference structure to build upon

Think of it as:

```text
@a2ui/agent-sdk     -> Infrastructure layer
@a2ui/a2ui-agent    -> Sample encapsulation layer
samples/agent/*     -> Concrete business Agent application layer
```  

## Sample Agent Overview

### component_gallery

This is a **static showcase Agent**.

- Does not rely on an LLM
- Focuses on demonstrating what A2UI built-in components can render
- Ideal for Catalog, Renderer, and interaction integration testing

### contact_lookup

This is a **query-type Agent**.

- Depends on LLM and tool calling
- Designed for contact search scenarios
- Organizes query results into contact cards, field lists, and other A2UI structures

### restaurant_finder

This is a **recommendation-type Agent**.

- Depends on LLM and tool calling
- Designed for restaurant recommendation and filtering
- Returns richer result cards and list structures

## A Complete Data Flow

Based on directory responsibilities, the entire project can be understood as this chain:

```text
User Input
  -> samples/client/*    Frontend sends requests and receives messages
  -> samples/agent/*     Business Agent processes requests
  -> node-a2ui/*         SDK / Agent foundational capability support
  -> Generates A2UI JSON
  -> a2ui-vue            Vue Renderer renders into the page
```
