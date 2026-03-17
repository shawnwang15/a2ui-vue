# Sample: Contact Lookup

**Contact Lookup** is an LLM-driven intelligent contact search Agent.  
Users enter a name or keyword in the frontend, the Agent calls tools to query contact information, and renders the results as A2UI cards on the page.

::: tip Note
UI generation speed depends on model and network conditions, and generated UIs may vary slightly based on model capabilities.
:::

## Video Demo

<div class="video-placeholder">
  <video controls autoplay src="../../samples/videos/contact.mp4"></video>
</div>

## Features

- Natural language contact search (e.g., "Find Alice's contact info for me")
- Agent autonomously calls internal tools to query the contact database
- Results displayed as A2UI Cards including avatar, name, phone, email, and other fields
- Responsive design with A2UI theme customization support

## Directory Structure

```
samples/
├── agent/contact_lookup/    # Agent side (port 10003)
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   └── ...
└── client/contact/          # Vue frontend (port 4000)
    ├── package.json
    ├── src/
    │   ├── App.vue
    │   ├── client.ts        # A2A protocol client
    │   └── ...
    └── ...
```

## Getting Started

### Prerequisites: Configure LLM API Key

```bash
cd samples/agent/contact_lookup
cp .env.example .env
```

Edit `.env` with your LLM configuration:

```dotenv
LLM_API_KEY=your_api_key_here
LLM_MODEL_SERIES=qwen          # Options: gpt / qwen / gemini
```

### Method 1: Step-by-step

**Step 1: Start the Agent**

```bash
cd samples/agent/contact_lookup
npm install
npm start
# Agent Card: http://localhost:10003/.well-known/agent-card.json
```

**Step 2: Start the frontend client**

```bash
cd samples/client/contact
npm install
npm run dev
# Visit http://localhost:4000
```

### Method 2: One-click (pnpm workspace)

```bash
# From the project root
pnpm install
pnpm run build:lib
pnpm run dev:contact    # Start Agent + frontend concurrently
```

## Agent Configuration Reference

| Variable            | Default                                                      | Description                               |
|-------------------|----------------------------------------------------------|----------------------------------|
| `LLM_API_KEY`     | _(required)_                                              | API Key for the LLM service               |
| `LLM_API_BASE`    | `https://dashscope.aliyuncs.com/compatible-mode/v1`      | API Base URL (defaults to Aliyun compatible endpoint) |
| `LLM_MODEL_SERIES`| `qwen`                                                   | Model series: `gpt` / `qwen` / `gemini` / `minimax` |
| `MODEL_NAME`      | _(optional)_                                              | Explicitly specify a model (overrides series default) |


## Architecture

```
User Input
   │
   ▼
Vue Frontend (src/client.ts)
   │  A2A protocol (SSE stream)
   ▼
Contact Lookup Agent (Node.js / TypeScript)
   │  LLM Tool Calling
   ▼
Contact Database (contact_data.json)
   │  A2UI JSON messages
   ▼
a2ui-vue Renderer
   │
   ▼
Contact cards displayed on page
```
