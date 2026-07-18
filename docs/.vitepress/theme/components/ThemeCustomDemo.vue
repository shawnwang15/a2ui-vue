<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from 'vue'
import { A2UISurface, useMessageProcessor } from 'a2ui-vue'
import { A2UI_CONFIG_KEY, useA2UIConfig } from '@/config'
import themeMessages from '@/examples/public/theme-example.json'
import { customTheme } from '@/examples/customTheme'

const processor = useMessageProcessor()
const parentConfig = useA2UIConfig()

// Override theme for this demo subtree so Button/Text/Card use customTheme for real.
provide(A2UI_CONFIG_KEY, {
  ...parentConfig,
  theme: customTheme,
})

const lastAction = ref<string | null>(null)

const surfaces = computed(() => {
  void processor.version.value
  return Array.from(processor.getSurfaces().keys())
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
    const { name, context } = message.action
    lastAction.value = `${name}(${JSON.stringify(context)})`
    resolve([])
  })

  processor.clearSurfaces()
  processor.processMessages(themeMessages as never)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <ClientOnly>
    <div class="a2ui-example-section">
      <div class="a2ui-example-demo">
        <A2UISurface
          v-for="surfaceId in surfaces"
          :key="surfaceId"
          :surface-id="surfaceId"
        />

        <p v-if="lastAction" class="a2ui-example-action">
          Last action: <code>{{ lastAction }}</code>
        </p>
      </div>
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

.a2ui-example-demo {
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
}

.a2ui-example-action {
  margin-top: 12px;
  color: #2e7d32;
}
</style>
