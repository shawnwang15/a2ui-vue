<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from 'vue'
import { A2UISurface, useMessageProcessor, type A2uiMessage } from '../../index'
import { A2UI_CONFIG_KEY, useA2UIConfig, type A2UITheme } from '@/config'
import { theme as defaultTheme } from '@/theme'

const SURFACE_ROSE = 'example-surface-theme-rose'
const SURFACE_BLUE = 'example-surface-theme-blue'

const processor = useMessageProcessor()
const parentConfig = useA2UIConfig()

/**
 * Default theme hardcodes Button.background as a gradient, which masks
 * createSurface.theme.primaryColor (--p-*). For this demo, bind Button to
 * the palette token so rose/blue primaryColor is visible on the button too.
 */
const surfaceDemoTheme: A2UITheme = {
  ...defaultTheme,
  additionalStyles: {
    ...defaultTheme.additionalStyles,
    Button: {
      ...defaultTheme.additionalStyles?.Button,
      background: undefined,
      boxShadow: '0 4px 15px color-mix(in srgb, var(--p-30) 40%, transparent)',
    },
  },
}

provide(A2UI_CONFIG_KEY, {
  ...parentConfig,
  theme: surfaceDemoTheme,
})

const loading = ref(true)
const error = ref<string | null>(null)
const lastAction = ref<string | null>(null)

const ready = computed(() => {
  void processor.version.value
  return !!processor.getSurface(SURFACE_ROSE) && !!processor.getSurface(SURFACE_BLUE)
})

const codeSnippet = `{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "example-surface-theme-rose",
    "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json",
    "theme": {
      "primaryColor": "#e11d48",
      "font": "Georgia, 'Times New Roman', serif"
    }
  }
}`

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  unsubscribe = processor.onEvent(({ message, resolve }) => {
    const { surfaceId, name, context } = message.action
    if (surfaceId === SURFACE_ROSE || surfaceId === SURFACE_BLUE) {
      lastAction.value = `${name}(${JSON.stringify(context)})`
    }
    resolve([])
  })

  try {
    // One JSON creates both surfaces; skip if the first already exists.
    if (!processor.getSurface(SURFACE_ROSE)) {
      const response = await fetch('/surface-theme-example.json')
      if (!response.ok) {
        error.value = `Failed to load surface-theme-example.json: ${response.status}`
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
    <h2>Surface Theme (createSurface.theme)</h2>
    <p class="example-description">
      协议层主题：在 <code>createSurface.theme</code> 里传 <code>primaryColor</code> /
      <code>font</code>，由 <code>A2UISurface</code> 生成 <code>--p-*</code> 色阶与字体变量。
      与应用级 <code>provideA2UI({ theme })</code>（Custom Theme 示例）是不同一层。
      本示例将 Button 的 <code>additionalStyles.background</code> 设为
      <code>var(--p-30)</code>，否则默认主题的硬编码渐变会盖住协议层主色。
    </p>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="example-error">{{ error }}</p>

    <template v-else-if="ready">
      <div class="surface-theme-compare">
        <div class="surface-theme-panel">
          <h3>primaryColor: #e11d48</h3>
          <A2UISurface :surface-id="SURFACE_ROSE" />
        </div>
        <div class="surface-theme-panel">
          <h3>primaryColor: #2563eb</h3>
          <A2UISurface :surface-id="SURFACE_BLUE" />
        </div>
      </div>

      <p v-if="lastAction" class="example-action">
        Last action: <code>{{ lastAction }}</code>
      </p>
    </template>

    <h3>createSurface.theme 片段</h3>
    <pre class="surface-theme-code"><code>{{ codeSnippet }}</code></pre>
  </div>
</template>

<style scoped>
.example-description code {
  font-size: 12px;
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 3px;
}

.example-error {
  color: #d32f2f;
}

.example-action {
  margin: 12px 0 16px;
  color: #2e7d32;
}

.surface-theme-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 720px) {
  .surface-theme-compare {
    grid-template-columns: 1fr;
  }
}

.surface-theme-panel {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.surface-theme-panel h3 {
  margin: 0 0 12px;
  font-size: 15px;
  color: #444;
}

.surface-theme-code {
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
