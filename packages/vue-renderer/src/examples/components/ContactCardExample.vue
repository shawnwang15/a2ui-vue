<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { A2UISurface, useMessageProcessor, type A2uiMessage } from '../../index';

const processor = useMessageProcessor();

const loading = ref(true);
const error = ref<string | null>(null);
const lastAction = ref<string | null>(null);

const surfaces = computed(() => {
  // Subscribe to processor updates so the list refreshes after messages load.
  void processor.version.value;
  return Array.from(processor.getSurfaces().keys());
});

// Handle client-side actions dispatched by components (e.g. Button's
// `functionCall`). The processor wraps each action in a `{ version, action }`
// envelope; `action.name` is the function name (`call` / `message`) and
// `action.context` holds the resolved args.
let unsubscribe: (() => void) | null = null;

onMounted(async () => {
  unsubscribe = processor.onEvent(({ message, resolve }) => {
    debugger
    const { name, context } = message.action;
    lastAction.value = `${name}(${JSON.stringify(context)})`;
    // No backend in this demo: resolve immediately with no follow-up messages.
    resolve([]);
  });

  try {
    const response = await fetch('/contact-card.json');
    if (!response.ok) {
      error.value = `Failed to load contact-card.json: ${response.status}`;
      return;
    }
    const messages = (await response.json()) as A2uiMessage[];
    // Reset any surfaces from a previous mount (tab switch / HMR) so the
    // `createSurface` message doesn't fail with "Surface ... already exists".
    processor.clearSurfaces();
    processor.processMessages(messages);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>

<template>
  <div class="example-section">
    <h2>Contact Card (A2UISurface)</h2>
    <p class="example-description">
      Renders the <code>contact-card.json</code> A2UI message stream through
      <code>A2UISurface</code>.
    </p>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="example-error">{{ error }}</p>

    <div v-else class="example-demo">
      <A2UISurface
        v-for="surfaceId in surfaces"
        :key="surfaceId"
        :surface-id="surfaceId"
      />

      <p v-if="lastAction" class="example-action">
        Last action: <code>{{ lastAction }}</code>
      </p>
    </div>
  </div>
</template>

<style scoped>
.example-error {
  color: #d32f2f;
}
.example-action {
  margin-top: 12px;
  color: #2e7d32;
}
</style>


