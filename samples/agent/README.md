# Node.js Agent Samples

Node.js/TypeScript ports of the Python ADK agent samples in `samples/agent/adk/`.

Each agent implements the [A2A protocol](https://a2a-protocol.org) (JSON-RPC 2.0 over HTTP) and is A2UI-aware.

## Agents

| Directory           | Port  | Description                                                |
|---------------------|-------|------------------------------------------------------------|
| `component_gallery/`| 10005 | Static component gallery — no LLM required                 |
| `contact_lookup/`   | 10003 | LLM-powered contact finder with A2UI cards                 |
| `restaurant_finder/`| 10002 | LLM-powered restaurant finder with A2UI cards              |

## Quick start

```bash
# Install dependencies for each agent
cd component_gallery && npm install

cd ../contact_lookup && npm install

cd ../restaurant_finder && npm install
```

### Component Gallery (no API key needed)

```bash
cd component_gallery
npm start
# → http://localhost:10005
```

### Contact Lookup / Restaurant Finder (requires LLM API key)

```bash
cd contact_lookup
cp .env.example .env   # set LLM_API_KEY and LLM_MODEL_SERIES
npm start
# → http://localhost:10003

cd ../restaurant_finder
cp .env.example .env   # set LLM_API_KEY and LLM_MODEL_SERIES
npm start
# → http://localhost:10002
```

## Architecture

Each agent follows the same pattern:

```
src/
  index.ts        — entry point (Express server startup)
  server.ts       — A2A protocol handler (JSON-RPC 2.0, agent card endpoint)
  agent.ts        — agent logic (LLM calls, tool execution, A2UI validation)
  tools.ts        — tool implementations (contact lookup / restaurant search)
  promptBuilder.ts— system prompt construction (LLM agents only)
```

The A2A server:
- `GET  /.well-known/agent-card.json` → returns the AgentCard JSON  
- `POST /` → handles `message/send` JSON-RPC requests  
- Detects A2UI extension support via the `X-A2A-Extensions` header  
- Returns `Task` objects in A2A wire format

## Key technologies

| Library            | Purpose                                 |
|--------------------|-----------------------------------------|
| `@a2ui/agent-sdk`  | A2UI schema, prompt generation, parsing |
| `express`          | HTTP server                             |
| `openai`           | OpenAI-compatible LLM API client        |
| `tsx`              | TypeScript execution without build step |
