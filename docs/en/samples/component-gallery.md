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


### Method : One-click from project root

```bash
# From the project root (pnpm workspace)
pnpm install
pnpm run build:lib
pnpm run dev:gallery
```


## Components by Category

### Layout
Card · Column · Divider · List · Modal · Row · Tabs · Text

### Media
AudioPlayer · Icon · Image · Video

### Input
Button · CheckBox · DateTimeInput · MultipleChoice · Slider · TextField

---

> For the full component API, see [Component Reference](/en/guide/components).
