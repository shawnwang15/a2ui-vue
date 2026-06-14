# Sample: Component List

This page embeds the **Component Gallery** demo from the `vue-renderer` examples app: it renders the `component-gallery.json` message stream through `<A2UISurface>`, exercising every component in the default catalog.

No Agent or API Key is required — you can interact with the preview directly in the docs.

## Live Preview

Below is the live output of `component-gallery.json` through `<A2UISurface>`, matching what you see when running `ComponentGalleryExample` in the `vue-renderer` examples app:

<ComponentGalleryDemo />

## Reproduce in Any Vue 3 Project

Follow these steps to recreate the live preview above in **any Vue 3 + Vite** app (same behavior as the `vue-renderer` examples app).

### 1. Install dependencies

::: code-group

```bash [npm]
npm install a2ui-vue
```

```bash [pnpm]
pnpm add a2ui-vue
```

:::

> Requires Vue 3.4+. `a2ui-vue` ships with the v0.9 default catalog and theme — no separate `@a2ui/web_core` install needed.

### 2. Copy the sample JSON

Download [`component-gallery.json`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/public/component-gallery.json) into your project `public/` folder:

```
your-vue-app/
└── public/
    └── component-gallery.json
```

### 3. Configure `index.html` (icon font)

Add Material Symbols Outlined to `<head>` (required by the `Icon` component):

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=home,favorite,star,settings,search"
/>
```

### 4. Theme palette `src/a2ui-palette.css`

Default theme utility classes rely on `--p-*` / `--n-*` variables — import this file from your entry:

```css
:root {
  --n-100: #ffffff;
  --n-10: #1b1b1b;
  --n-0: #000000;
  --p-100: #ffffff;
  --p-60: #8487ea;
  --p-50: #6a6dcd;
  --p-40: #5154b3;
  --p-30: #383b99;
  --p-10: #06006c;
  --p-0: #000000;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-flex: 'Outfit', var(--font-family);
}
```

For the full palette see [`samples/client/gallery/src/styles.css`](https://github.com/shawnwang15/a2ui-vue/blob/main/samples/client/gallery/src/styles.css) in the repo.

### 5. Entry `src/main.ts`

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import 'a2ui-vue/dist/a2ui-vue.css'
import './a2ui-palette.css'

const app = createApp(App)

provideA2UI({
  app,
  catalog: DEFAULT_CATALOG,
  theme: defaultTheme,
})

app.mount('#app')
```

### 6. Page component `src/components/ComponentGalleryDemo.vue`

```vue
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { A2UISurface, useMessageProcessor, type A2uiMessage } from 'a2ui-vue'

const processor = useMessageProcessor()

const loading = ref(true)
const error = ref<string | null>(null)
const lastAction = ref<string | null>(null)

const surfaces = computed(() => {
  void processor.version.value
  return Array.from(processor.getSurfaces().keys())
})

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  unsubscribe = processor.onEvent(({ message, resolve }) => {
    const { name, context } = message.action
    lastAction.value = `${name}(${JSON.stringify(context)})`
    resolve([])
  })

  try {
    const response = await fetch('/component-gallery.json')
    if (!response.ok) {
      error.value = `Failed to load component-gallery.json: ${response.status}`
      return
    }
    const messages = (await response.json()) as A2uiMessage[]
    processor.clearSurfaces()
    processor.processMessages(messages)
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <div class="a2ui-demo">
    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="a2ui-demo-error">{{ error }}</p>

    <template v-else>
      <A2UISurface
        v-for="surfaceId in surfaces"
        :key="surfaceId"
        :surface-id="surfaceId"
      />
      <p v-if="lastAction" class="a2ui-demo-action">
        Last action: <code>{{ lastAction }}</code>
      </p>
    </template>
  </div>
</template>

<style scoped>
.a2ui-demo {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  color-scheme: light;
  color: #333;
}
.a2ui-demo-error {
  color: #d32f2f;
}
.a2ui-demo-action {
  margin-top: 12px;
  color: #2e7d32;
}
</style>
```

### 7. Mount in `src/App.vue`

```vue
<script setup lang="ts">
import ComponentGalleryDemo from './components/ComponentGalleryDemo.vue'
</script>

<template>
  <ComponentGalleryDemo />
</template>
```

Run `npm run dev` — the result should match the embedded preview above.

## Components Covered

### Layout
Card · Column · Divider · List · Modal · Row · Tabs · Text

### Media
AudioPlayer · Icon · Image · Video

### Input
Button · CheckBox · DateTimeInput · ChoicePicker · Slider · TextField

## Data Source

Sample data lives at `packages/vue-renderer/src/examples/public/component-gallery.json`, shared with `ComponentGalleryExample` in the examples app.

## Related Links

- [Component Gallery](/en/v0.9/samples/component-gallery) — Full-stack demo (Agent + client)
- [Component Reference](/en/v0.9/guide/components) — Per-component API docs
