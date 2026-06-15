# Restaurant Finder Agent (Node.js)

A Node.js/TypeScript port of the Python Restaurant Finder ADK sample agent.

Uses [Mastra](https://mastra.ai) with tool calling to find restaurants and render A2UI cards.

## Prerequisites

```bash
pnpm install
```

Copy `.env.example` to `.env` and set the model and API key:

```bash
cp .env.example .env
```

## Running

```bash
pnpm start
# or from workspace root:
pnpm dev:restaurant
```

The agent card will be served at `http://localhost:10002/.well-known/agent-card.json`.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_NAME` | `alibaba-cn/qwen-flash` | Mastra model id (`provider/model`) |
| `DASHSCOPE_API_KEY` | — | For `alibaba-cn/*` models |
| `OPENAI_API_KEY` | — | For `openai/*` models |
| `GOOGLE_API_KEY` | — | For `google/*` models |
| `MINIMAX_API_KEY` | — | For `minimax-cn/*`, `minimax/*` models |
| `XIAOMI_API_KEY` | — | For `xiaomi/*` models |
| `HOST` | `localhost` | Bind host |
| `PORT` | `10002` | Listen port |

Mastra's model router resolves the provider from `MODEL_NAME` and reads the matching API key from the environment automatically (e.g. `minimax-cn/MiniMax-M3` → `MINIMAX_API_KEY`).

### Examples

```bash
MODEL_NAME=alibaba-cn/qwen-flash
DASHSCOPE_API_KEY=sk-...

MODEL_NAME=openai/gpt-4.1-mini
OPENAI_API_KEY=sk-...

MODEL_NAME=google/gemini-2.0-flash
GOOGLE_API_KEY=...

MODEL_NAME=minimax-cn/MiniMax-M3
MINIMAX_API_KEY=...

MODEL_NAME=xiaomi/mimo-v2-flash
XIAOMI_API_KEY=...
```
