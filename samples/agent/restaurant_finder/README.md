# Restaurant Finder Agent (Node.js)

A Node.js/TypeScript port of the Python Restaurant Finder ADK sample agent.

Uses an OpenAI-compatible LLM endpoint with tool calling to find restaurants and render A2UI cards.

## Prerequisites

```bash
npm install
```

Copy `.env.example` to `.env` and set your API key + model series:

```bash
cp .env.example .env
# Edit .env and set LLM_API_KEY + LLM_MODEL_SERIES
```

## Running

```bash
npm start
```

The agent card will be served at `http://localhost:10002/.well-known/agent-card.json`.

## Configuration

| Variable             | Default                                                         | Description              |
|----------------------|-----------------------------------------------------------------|--------------------------|
| `LLM_API_KEY`        | _(required)_                                                    | API key for LLM endpoint |
| `LLM_API_BASE`       | `https://dashscope.aliyuncs.com/compatible-mode/v1`            | API base URL             |
| `LLM_MODEL_SERIES`   | `qwen`                                                          | Model family             |
| `GPT_MODEL`          | `gpt-4.1-mini`                                                  | Default GPT model        |
| `QWEN_MODEL`         | `qwen3.5-plus`                                                  | Default Qwen model       |
| `GEMINI_MODEL`       | `gemini-2.0-flash`                                              | Default Gemini model     |
| `LITELLM_MODEL`      | _(optional)_                                                    | Explicit override        |
| `HOST`               | `localhost`                                                     | Bind host                |
| `PORT`               | `10002`                                                         | Listen port              |
