<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from 'vue'
import { A2UISurface, useMessageProcessor } from 'a2ui-vue'
import { A2UI_CONFIG_KEY, useA2UIConfig, type A2UITheme } from '@/config'
import { theme as defaultTheme } from '@/theme'
import surfaceThemeMessages from '@/examples/public/surface-theme-example.json'

const SURFACE_ROSE = 'example-surface-theme-rose'
const SURFACE_BLUE = 'example-surface-theme-blue'

const processor = useMessageProcessor()
const parentConfig = useA2UIConfig()

/**
 * Default theme hardcodes Button.background as a gradient, which masks
 * createSurface.theme.primaryColor (--p-*). Bind Button to the palette token
 * so rose/blue primaryColor is visible on the button (same as examples).
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

const lastAction = ref<string | null>(null)

const ready = computed(() => {
  void processor.version.value
  return !!processor.getSurface(SURFACE_ROSE) && !!processor.getSurface(SURFACE_BLUE)
})

let unsubscribe: (() => void) | null = null

type A2UIActionEvent = {
  message: {
    version: 'v0.9'
    action: { name: string; surfaceId?: string; context: Record<string, unknown> }
  }
  resolve: (messages: unknown[]) => void
}

onMounted(() => {
  unsubscribe = processor.onEvent(({ message, resolve }: A2UIActionEvent) => {
    const { surfaceId, name, context } = message.action
    if (surfaceId === SURFACE_ROSE || surfaceId === SURFACE_BLUE) {
      lastAction.value = `${name}(${JSON.stringify(context)})`
    }
    resolve([])
  })

  processor.clearSurfaces()
  processor.processMessages(surfaceThemeMessages as never)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <ClientOnly>
    <div class="a2ui-example-section">
      <p v-if="!ready" class="a2ui-theme-loading">Loading…</p>

      <div v-else class="a2ui-surface-theme-compare">
        <div class="a2ui-surface-theme-panel">
          <h3 class="a2ui-surface-theme-panel__title">primaryColor: #e11d48</h3>
          <div class="a2ui-example-demo">
            <A2UISurface :surface-id="SURFACE_ROSE" />
          </div>
        </div>
        <div class="a2ui-surface-theme-panel">
          <h3 class="a2ui-surface-theme-panel__title">primaryColor: #2563eb</h3>
          <div class="a2ui-example-demo">
            <A2UISurface :surface-id="SURFACE_BLUE" />
          </div>
        </div>
      </div>

      <p v-if="lastAction" class="a2ui-example-action">
        Last action: <code>{{ lastAction }}</code>
      </p>
    </div>
  </ClientOnly>
</template>

<style scoped>
.a2ui-example-section {
  margin: 16px 0 24px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  color: #333;
  color-scheme: light;
}

.a2ui-theme-loading {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.a2ui-surface-theme-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 720px) {
  .a2ui-surface-theme-compare {
    grid-template-columns: 1fr;
  }
}

.a2ui-surface-theme-panel__title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #444;
}

.a2ui-example-demo {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #eee;
}

.a2ui-example-action {
  margin-top: 12px;
  color: #2e7d32;
}
</style>
