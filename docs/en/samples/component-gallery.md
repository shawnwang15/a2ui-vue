# Sample: Component Gallery

**Component Gallery** is a static, non-LLM Agent that requires no API Key to run.  
It showcases the appearance and interactive behavior of all built-in `a2ui-vue` components, making it the best starting point for understanding the A2UI component system.

## Video Demo

<div class="video-placeholder">
    <video controls autoplay src="../../samples/videos/gallery.mp4"></video>
</div>

## Features

- **Library View**: Browse all A2UI components by category (layout / media / input)
- **Gallery View**: Multi-component combination display, showing real UI scenarios
- **Interactive Preview**: Click any component to view its corresponding JSON configuration

## Directory Structure

```
samples/
├── agent/component_gallery/    # Agent side (port 10005)
│   ├── package.json
│   ├── src/
│   └── ...
└── client/gallery/             # Vue frontend (port 4000)
    ├── package.json
    ├── src/
    │   ├── App.vue
    │   └── ...
    └── ...
```

## Starting the Demo

### Method 1: Step-by-step

**Step 1: Start the Agent**

```bash
cd samples/agent/component_gallery
npm install
npm start
# Agent served at http://localhost:10005
# Agent Card: http://localhost:10005/.well-known/agent-card.json
```

**Step 2: Start the frontend client**

```bash
cd samples/client/gallery
npm install
npm run dev
# Visit http://localhost:4000
```

### Method 2: One-click from project root

```bash
# From the project root (pnpm workspace)
pnpm install
pnpm run build:lib

# Gallery has no root-level shortcut script yet — use the step-by-step method above
```

## Environment Variables

Component Gallery **does not** require an LLM API Key. Only the following optional configs are supported:

| Variable | Default     | Description           |
|--------|------------|------------|
| `HOST` | `localhost` | Agent bind address |
| `PORT` | `10005`     | Agent listen port  |

## Components by Category

### Layout
Card · Column · Divider · List · Modal · Row · Tabs · Text

### Media
AudioPlayer · Icon · Image · Video

### Input
Button · CheckBox · DateTimeInput · MultipleChoice · Slider · TextField

---

> For the full component API, see [Component Reference](/en/guide/components).
