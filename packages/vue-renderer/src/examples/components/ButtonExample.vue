<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { A2UISurface, useMessageProcessor, type A2uiMessage } from '../../index';

const SURFACE_ID = 'example-button';

const processor = useMessageProcessor();

const loading = ref(true);
const error = ref<string | null>(null);
const lastAction = ref<string | null>(null);
const clickCount = ref(0);

const ready = computed(() => {
  void processor.version.value;
  return !!processor.getSurface(SURFACE_ID);
});

let unsubscribe: (() => void) | null = null;

onMounted(async () => {
  unsubscribe = processor.onEvent(({ message, resolve }) => {
    if (message.action.surfaceId === SURFACE_ID) {
      clickCount.value += 1;
      const { name, context } = message.action;
      lastAction.value = `${name}(${JSON.stringify(context)})`;
    }
    resolve([]);
  });

  try {
    // Avoid clearSurfaces() so other examples on "All Examples" keep their surfaces.
    if (!processor.getSurface(SURFACE_ID)) {
      const response = await fetch('/button-example.json');
      if (!response.ok) {
        error.value = `Failed to load button-example.json: ${response.status}`;
        return;
      }
      const messages = (await response.json()) as A2uiMessage[];
      processor.processMessages(messages);
    }
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
    <h2>Button Component</h2>
    <p class="example-description">
      Interactive buttons that trigger actions when clicked. Click count:
      {{ clickCount }}
    </p>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="example-error">{{ error }}</p>

    <div v-else-if="ready" class="example-demo">
      <A2UISurface :surface-id="SURFACE_ID" />

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
