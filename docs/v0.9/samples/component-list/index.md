# 示例：组件列表

本页展示 `vue-renderer` 示例工程中的 **Component Gallery** 嵌入演示：将 `component-gallery.json` 消息流通过 `<A2UISurface>` 渲染，覆盖默认目录中的全部内置组件。

无需启动 Agent 或配置 API Key，可直接在文档中交互预览。

## 效果预览

下面是 `component-gallery.json` 消息流经 `<A2UISurface>` 渲染后的实时效果，与在 `vue-renderer` 示例工程中运行时完全一致：

<ComponentGalleryDemo />

## 在 Vue 3 项目中复现

按以下步骤即可在**任意 Vue 3 + Vite** 项目中还原上方演示（与 `vue-renderer` examples 工程行为一致）。

### 1. 安装依赖

::: code-group

```bash [npm]
npm install a2ui-vue
```

```bash [pnpm]
pnpm add a2ui-vue
```

:::

> 需要 Vue 3.4+。`a2ui-vue` 已内置 v0.9 默认 Catalog 与主题，无需额外安装 `@a2ui/web_core`。

### 2. 复制示例 JSON

将仓库中的 [`component-gallery.json`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/public/component-gallery.json) 放到项目的 `public/` 目录：

```
your-vue-app/
└── public/
    └── component-gallery.json
```

### 3. 配置 `index.html`（图标字体）

在 `<head>` 中加入 Material Symbols Outlined（`Icon` 组件依赖）：

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=home,favorite,star,settings,search"
/>
```

### 4. 主题色板 `src/a2ui-palette.css`

默认主题类名依赖 `--p-*` / `--n-*` CSS 变量，在入口引入此文件：

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

完整色板可参考仓库 [`samples/client/gallery/src/styles.css`](https://github.com/shawnwang15/a2ui-vue/blob/main/samples/client/gallery/src/styles.css)。

### 5. 入口 `src/main.ts`

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

### 6. 页面组件 `src/components/ComponentGalleryDemo.vue`

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

### 7. 挂载到 `src/App.vue`

```vue
<script setup lang="ts">
import ComponentGalleryDemo from './components/ComponentGalleryDemo.vue'
</script>

<template>
  <ComponentGalleryDemo />
</template>
```

启动开发服务器（`npm run dev`）后，页面效果应与上方文档嵌入演示一致。

## 涵盖组件

### 布局类
Card · Column · Divider · List · Modal · Row · Tabs · Text

### 媒体类
AudioPlayer · Icon · Image · Video

### 输入类
Button · CheckBox · DateTimeInput · ChoicePicker · Slider · TextField

## 数据来源

示例数据位于 `packages/vue-renderer/src/examples/public/component-gallery.json`，与示例工程 `ComponentGalleryExample` 使用同一份 JSON。

## 相关链接

- [组件画廊](/v0.9/samples/component-gallery) — 完整全栈 Demo（Agent + 客户端）
- [组件参考](/v0.9/guide/components) — 各组件 API 说明
