<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { A2UISurface, useMessageProcessor, type A2uiMessage } from '../../index'
import { customTheme } from '../customTheme'

const SURFACE_ID = 'example-theme'

const processor = useMessageProcessor()

const loading = ref(true)
const error = ref<string | null>(null)
const lastAction = ref<string | null>(null)

const ready = computed(() => {
  void processor.version.value
  return !!processor.getSurface(SURFACE_ID)
})

const codeSnippet = `import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import type { A2UITheme } from 'a2ui-vue'

const myTheme: A2UITheme = {
  ...defaultTheme,
  additionalStyles: {
    ...defaultTheme.additionalStyles,
    Button: {
      ...defaultTheme.additionalStyles?.Button,
      background: 'linear-gradient(135deg, #e11d48 0%, #f97316 100%)',
      boxShadow: '0 4px 15px rgba(225, 29, 72, 0.35)',
      '--p-30': '#e11d48',
    },
    Text: {
      ...defaultTheme.additionalStyles?.Text,
      h1: { /* warm gradient text */ },
      h3: { color: '#e11d48' },
    },
    Card: { /* warm radial background */ },
  },
}

provideA2UI({ app, catalog: DEFAULT_CATALOG, theme: myTheme })
// Or in this examples app: theme: customTheme  (see ../customTheme.ts)`

/** Values from customTheme — used by :deep preview CSS (theme is global in main.ts). */
const previewButtonBg = String(customTheme.additionalStyles?.Button?.background ?? '')
const previewButtonShadow = String(customTheme.additionalStyles?.Button?.boxShadow ?? '')
const previewCardBg = String(customTheme.additionalStyles?.Card?.background ?? '')
const previewH3Color = String(
  (customTheme.additionalStyles?.Text as Record<string, { color?: string }> | undefined)?.h3
    ?.color ?? '#e11d48',
)

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  unsubscribe = processor.onEvent(({ message, resolve }) => {
    if (message.action.surfaceId === SURFACE_ID) {
      const { name, context } = message.action
      lastAction.value = `${name}(${JSON.stringify(context)})`
    }
    resolve([])
  })

  try {
    if (!processor.getSurface(SURFACE_ID)) {
      const response = await fetch('/theme-example.json')
      if (!response.ok) {
        error.value = `Failed to load theme-example.json: ${response.status}`
        return
      }
      const messages = (await response.json()) as A2uiMessage[]
      processor.processMessages(messages)
    }
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
  <div class="example-section">
    <h2>Custom Theme</h2>
    <p class="example-description">
      <code>theme</code> 传入的是完整 <code>A2UITheme</code>（<code>components</code> /
      <code>additionalStyles</code> 等），不是扁平的 <code>{ primaryColor }</code>。改色常见三条路：
    </p>
    <ol class="theme-steps">
      <li>
        宿主 CSS 定义 <code>--p-*</code> / <code>--n-*</code> 色板（供 <code>color-*</code> utility
        class 使用）
      </li>
      <li>覆盖 <code>theme.additionalStyles</code>（Button / Text / Card 的渐变与内联样式）</li>
      <li>调整 <code>theme.components</code> 里的 <code>color-bgc-p30</code> 等 class 映射</li>
    </ol>
    <p class="example-description">
      UI 通过 <code>theme-example.json</code> 的
      <code>createSurface</code> + <code>updateComponents</code> +
      <code>processMessages</code> 渲染。本页 <code>main.ts</code> 仍使用默认主题；右侧用局部样式模拟
      <code>customTheme.ts</code>。全局生效请把 <code>provideA2UI</code> 的
      <code>theme</code> 换成 <code>customTheme</code>。
    </p>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="example-error">{{ error }}</p>

    <template v-else-if="ready">
      <div class="theme-compare">
        <div class="theme-panel">
          <h3>Default theme</h3>
          <A2UISurface :surface-id="SURFACE_ID" />
        </div>

        <div
          class="theme-panel theme-panel--custom"
          :style="{
            '--p-30': '#e11d48',
            '--p-40': '#f97316',
            '--p-50': '#ea580c',
            '--p-60': '#fb923c',
          }"
        >
          <h3>Custom theme (preview)</h3>
          <A2UISurface :surface-id="SURFACE_ID" />
        </div>
      </div>

      <p v-if="lastAction" class="example-action">
        Last action: <code>{{ lastAction }}</code>
      </p>
    </template>

    <h3>provideA2UI 用法</h3>
    <pre class="theme-code"><code>{{ codeSnippet }}</code></pre>
  </div>
</template>

<style scoped>
.theme-steps {
  margin: 0 0 16px 1.25rem;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
}

.theme-steps code,
.example-description code {
  font-size: 12px;
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 3px;
}

.theme-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 720px) {
  .theme-compare {
    grid-template-columns: 1fr;
  }
}

.theme-panel {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.theme-panel h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #444;
}

.example-error {
  color: #d32f2f;
}

.example-action {
  margin-bottom: 16px;
  color: #2e7d32;
}

.theme-panel--custom :deep(a2ui-button button) {
  background: v-bind('previewButtonBg') !important;
  box-shadow: v-bind('previewButtonShadow') !important;
}

.theme-panel--custom :deep(a2ui-card > section) {
  background: v-bind('previewCardBg') !important;
}

.theme-panel--custom :deep(a2ui-text:has(h1) > section) {
  color: transparent !important;
  background: v-bind('previewButtonBg') !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.theme-panel--custom :deep(a2ui-text:has(h3) > section) {
  color: v-bind('previewH3Color') !important;
  background: none !important;
  -webkit-text-fill-color: v-bind('previewH3Color') !important;
}

.theme-code {
  margin: 0;
  padding: 16px;
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>
