

<script setup lang="ts">
import { ref, computed } from 'vue';
import { provideA2UI, DEFAULT_CATALOG, A2UISurface } from 'a2ui-vue';
import * as Types from '@a2ui/web_core/types/types';
import { useClient } from './client';
import { theme } from './theme';

// Provide A2UI configuration
provideA2UI({
  catalog: DEFAULT_CATALOG,
  theme,
});

const { isLoading, makeRequest, processor } = useClient();

const hasData = ref(false);
const inputValue = ref('Casey Smith');

const surfaces = computed(() => {
  return Array.from(processor.getSurfaces());
});

async function handleSubmit(event: Event) {
  event.preventDefault();

  if (inputValue.value) {
    const message = inputValue.value as unknown as Types.A2UIClientEventMessage;
    await makeRequest(message);
    hasData.value = true;
  }
}
</script>

<template>
  <div class="app">
    <!-- Loading state -->
    <div v-if="isLoading" class="pending">
      <span class="g-icon filled-heavy rotate">progress_activity</span>
      Awaiting an answer...
    </div>

    <!-- Form state -->
    <form v-else-if="!hasData" @submit="handleSubmit">
      <h1>Contact Finder</h1>
      <div>
        <input
          required
          v-model="inputValue"
          autocomplete="off"
          id="body"
          name="body"
          type="text"
          :disabled="isLoading"
        />
        <button type="submit" :disabled="isLoading">
          <span class="g-icon filled-heavy">send</span>
        </button>
      </div>
    </form>

    <!-- Results state -->
    <div v-else class="surfaces">
      <A2UISurface
        v-for="[surfaceId, surface] in surfaces"
        :key="surfaceId"
        :surface-id="surfaceId"
        :surface="surface"
      />
    </div>
  </div>
</template>

<style scoped>
.app {
  display: block;
  max-width: 640px;
  margin: 0 auto;
  min-height: 100%;
}

.surfaces {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--bb-grid-size-3) 0;
  animation: fadeIn 1s cubic-bezier(0, 0, 0.3, 1) 0.3s backwards;
}

.surfaces :deep(a2ui-surface) {
  align-items: center;
}

form {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  animation: fadeIn 1s cubic-bezier(0, 0, 0.3, 1) 1s backwards;
}

form > div {
  display: flex;
  flex: 1;
  gap: 16px;
  align-items: center;
  width: 100%;
}

form > div > input {
  display: block;
  flex: 1;
  border-radius: 32px;
  padding: 16px 24px;
  border: 1px solid var(--p-60);
  font-size: 16px;
}

form > div > button {
  display: flex;
  align-items: center;
  background: var(--p-40);
  color: var(--n-100);
  border: none;
  padding: 8px 16px;
  border-radius: 32px;
  opacity: 0.5;
  cursor: pointer;
}

form > div > button:not([disabled]) {
  opacity: 1;
}

h1 {
  font-weight: 400;
  font-family: var(--font-family-flex, var(--default-font-family));
  font-optical-sizing: auto;
  color: var(--p-30);
}

.rotate {
  animation: rotate 1s linear infinite;
}

.pending {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 1s cubic-bezier(0, 0, 0.3, 1) 0.3s backwards;
}

.pending .g-icon {
  margin-right: 8px;
}

.g-icon {
  font-family: "Google Symbols";
  font-weight: normal;
  font-style: normal;
  font-size: 20px;
  width: 1em;
  height: 1em;
  user-select: none;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  overflow-wrap: normal;
  direction: ltr;
  font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

.g-icon.filled-heavy {
  font-variation-settings: "FILL" 1, "wght" 700, "GRAD" 0, "opsz" 48, "ROND" 100;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes rotate {
  from { rotate: 0deg; }
  to { rotate: 360deg; }
}
</style>
