<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { A2UISurface, useMessageProcessor } from 'a2ui-vue'
import galleryMessages from '@/examples/public/component-gallery.json'

const processor = useMessageProcessor()

const lastAction = ref<string | null>(null)

const surfaces = computed(() => {
  // Touch the processor version so the list re-evaluates after messages load.
  void processor.version.value
  return Array.from(processor.getSurfaces().keys())
})

// Subscribe to client-side actions dispatched by components (Button's
// `functionCall` / `event`). The processor wraps each action in a
// `{ version, action }` envelope; `action.name` is the action name and
// `action.context` holds the resolved args.
let unsubscribe: (() => void) | null = null

type A2UIActionEvent = {
  message: { version: 'v0.9'; action: { name: string; context: Record<string, unknown> } }
  resolve: (messages: unknown[]) => void
}

onMounted(() => {
  unsubscribe = processor.onEvent(({ message, resolve }: A2UIActionEvent) => {
    const { name, context } = message.action
    lastAction.value = `${name}(${JSON.stringify(context)})`
    // No backend in this demo: resolve immediately with no follow-up messages.
    resolve([])
  })

  // Reset any surfaces from a previous mount (page navigation / HMR) so the
  // `createSurface` message doesn't fail with "Surface ... already exists".
  processor.clearSurfaces()
  processor.processMessages(galleryMessages as never)
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
/* Mirrors the look of packages/vue-renderer/src/examples/style.css so the
   embedded demo matches how it runs in the examples app. */
.a2ui-example-section {
  margin: 16px 0 24px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  color: #333;
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
