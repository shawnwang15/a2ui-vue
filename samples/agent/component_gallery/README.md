# Component Gallery Agent (Node.js)

A Node.js/TypeScript port of the Python Component Gallery ADK sample agent.

Demonstrates A2UI components via a static, non-LLM A2A agent.

## Prerequisites

```bash
npm install
```

## Running

```bash
# default port 10005
npm start

# custom port
PORT=10005 npm start
```

The agent card will be served at `http://localhost:10005/.well-known/agent-card.json`.

## Configuration

Copy `.env.example` to `.env` and adjust if needed.

| Variable | Default      | Description      |
|----------|-------------|------------------|
| `HOST`   | `localhost` | Bind host        |
| `PORT`   | `10005`     | Listen port      |
