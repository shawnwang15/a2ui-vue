# Sample: Contact Form

This page embeds the **Contact Card** demo from the `vue-renderer` examples app: it renders the `contact-card.json` message stream through `<A2UISurface>`, including a profile card and an interactive edit form.

No Agent or API Key is required — you can interact with the preview directly in the docs. Click buttons to see the corresponding Action callback at the bottom of the demo.

## Live Preview

Below is the live output of `contact-card.json` through `<A2UISurface>`, matching what you see when running `ContactCardExample` in the `vue-renderer` examples app:

<ContactCardDemo />

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

Download [`contact-card.json`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/public/contact-card.json) into your project `public/` folder:

```
your-vue-app/
└── public/
    └── contact-card.json
```

### 3. Configure `index.html` (icon font)

Add Material Symbols Outlined to `<head>` (required by `Icon` components in the contact card):

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=phone,mail,location_on,person"
/>
```

### 4. Theme palette `src/a2ui-palette.css`

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

### 6. Page component `src/components/ContactCardDemo.vue`

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
    const response = await fetch('/contact-card.json')
    if (!response.ok) {
      error.value = `Failed to load contact-card.json: ${response.status}`
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

::: tip Validation hints
`TextField` / `CheckBox` validation messages (e.g. `Password must be at least 8 characters`) are styled as `#b3261e` by the catalog components. Avoid global `p { color: ... }` rules that override `.a2ui-text-field-errors` and similar classes.
:::

### 7. Mount in `src/App.vue`

```vue
<script setup lang="ts">
import ContactCardDemo from './components/ContactCardDemo.vue'
</script>

<template>
  <ContactCardDemo />
</template>
```

Run `npm run dev` — the result should match the embedded preview above. Click buttons to see Action callbacks at the bottom; edit form fields to trigger validation hints.

## What It Demonstrates

- Contact avatar, name, title, and other profile fields
- Phone, email, and address rows with icons
- An editable form section with button interactions and Action callbacks

## Data Source

Sample data lives at `packages/vue-renderer/src/examples/public/contact-card.json`, shared with `ContactCardExample` in the examples app.

## Related Links

- [Contact Lookup](/en/v0.9/samples/contact-lookup) — Full-stack demo (LLM Agent + client)
- [Component Reference](/en/v0.9/guide/components) — Per-component API docs
