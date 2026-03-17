# Sample: Restaurant Finder

**Restaurant Finder** is an LLM-driven restaurant recommendation Agent.  
Users describe their preferences (cuisine, area, price range, etc.), the Agent retrieves matching restaurants from a local dataset, and renders beautiful restaurant cards via A2UI.

::: tip Note
UI generation speed depends on model and network conditions, and generated UIs may vary slightly based on model capabilities.
:::

## Video Demo

<div class="video-placeholder">
  <video controls autoplay src="../../samples/videos/restaurant.mp4"></video>
</div>

## Features

- Natural language preference description (e.g., "Recommend a Sichuan restaurant under $30 per person")
- Agent uses Tool Calling to invoke restaurant search tools
- Results displayed as A2UI cards or lists, including restaurant name, rating, address, images, and more
- Supports multi-turn conversation to progressively refine filter criteria

## Directory Structure

```
samples/
├── agent/restaurant_finder/    # Agent side (port 10002)
│   ├── package.json
│   ├── .env.example
│   ├── restaurant_data.json    # Restaurant dataset
│   ├── src/
│   └── ...
└── client/restaurant/          # Vue frontend (port 4000)
    ├── package.json
    ├── src/
    │   ├── App.vue
    │   ├── client.ts           # A2A protocol client
    │   ├── theme.ts            # A2UI theme configuration
    │   └── styles.css
    └── ...
```

## Getting Started

### Prerequisites: Configure LLM API Key

```bash
cd samples/agent/restaurant_finder
cp .env.example .env
```

Edit `.env` with your LLM configuration:

```dotenv
LLM_API_KEY=your_api_key_here
LLM_MODEL_SERIES=qwen          # Options: gpt / qwen / gemini / minimax
```

### Method 1: Step-by-step

**Step 1: Start the Agent**

```bash
cd samples/agent/restaurant_finder
npm install
npm start
# Agent Card: http://localhost:10002/.well-known/agent-card.json
```

**Step 2: Start the frontend client**

```bash
cd samples/client/restaurant
npm install
npm run dev
# Visit http://localhost:4000
```

### Method 2: One-click (pnpm workspace)

```bash
# From the project root
pnpm install
pnpm run build:lib
pnpm run dev:restaurant    # Start Agent + frontend concurrently
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
Restaurant Finder Agent (Node.js / TypeScript)
   │  LLM Tool Calling
   ▼
Restaurant Dataset (restaurant_data.json)
   │  A2UI JSON messages
   ▼
a2ui-vue Renderer
   │
   ▼
Restaurant recommendation cards displayed on page
```

## Theme Customization

The Restaurant Demo shows how to customize the A2UI theme via `src/theme.ts`, matching the visual style of a food-focused app:

```ts
// samples/client/restaurant/src/theme.ts
export const restaurantTheme = {
  primaryColor: '#f97316',   // Orange palette — communicates appetite
  backgroundColor: '#fafaf9',
  textColor: '#292524',
  borderRadius: '12px',
}
```

```ts
// App.vue
import { provideA2UI, DEFAULT_CATALOG } from 'a2ui-vue'
import { restaurantTheme } from './theme'

provideA2UI({ catalog: DEFAULT_CATALOG, theme: restaurantTheme })
```
