# a2ui-vue
[![A2UI Protocol](https://img.shields.io/badge/A2UI-v0.8.x-646cff.svg)](https://a2ui.org/)
[![docs](https://img.shields.io/badge/docs-online-brightgreen)](https://shawnwang15.github.io/a2ui-vue/en/)

A Vue 3 renderer for A2UI (Agent-to-UI) protocol.
> **a2ui-vue** is a community **Vue 3 renderer** for the [A2UI (Agent-to-UI) open protocol](https://a2ui.org/).  
> It enables AI agents to express UI intent as structured JSON and have it rendered as rich, interactive components inside any Vue 3 application — with no HTML/CSS knowledge required by the agent.

**[📖 Documentation](https://shawnwang15.github.io/a2ui-vue/en/)** · **[⚡ Quick Start](https://shawnjs.github.io/a2ui-vue/en/guide/getting-started)** ·  **[🌐 中文说明](README.zh-CN.md)**

![项目截图](images/gallery.jpeg)![项目截图](images/restaurants.jpeg)

## Usage

```vue
<script setup lang="ts">
import { A2UISurface, useMessageProcessor, provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue';
import 'a2ui-vue/dist/vue.css';
// Provide A2UI configuration
provideA2UI({
  catalog: DEFAULT_CATALOG,
  theme: defaultTheme,
});

const processor = useMessageProcessor();

// Process messages from your agent
processor.processMessages(messages);

// Get surfaces to render
const surfaces = processor.getSurfaces();
</script>

<template>
  <A2UISurface
    v-for="[surfaceId, surface] in surfaces"
    :key="surfaceId"
    :surface-id="surfaceId"
    :surface="surface"
  />
</template>
```

## Components

The library provides the following components:

- `A2UISurface` - The main surface component
- `A2UIRenderer` - Dynamic component renderer
- Layout: `A2UIRow`, `A2UIColumn`, `A2UICard`, `A2UIList`
- Content: `A2UIText`, `A2UIImage`, `A2UIIcon`, `A2UIVideo`, `A2UIAudio`
- Input: `A2UIButton`, `A2UITextField`, `A2UICheckbox`, `A2UISlider`, `A2UIMultipleChoice`, `A2UIDateTimeInput`
- Navigation: `A2UITabs`, `A2UIModal`
- Utility: `A2UIDivider`

## Development & Examples

To view interactive examples of all components:

```bash
# Install dependencies
pnpm  install

# Start development server with examples
pnpm run dev

```
### Building

```bash
# Build the library
npm run build
```
