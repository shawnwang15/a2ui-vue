

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
}>();

const { theme } = useDynamicComponent(props);

const content = computed<VueComponentNode | null>(
  () => ((props.component.properties as any).content as VueComponentNode) ?? null,
);
const trigger = computed<VueComponentNode | null>(
  () => ((props.component.properties as any).trigger as VueComponentNode) ?? null,
);

const showDialog = ref(false);
const dialogRef = ref<HTMLDialogElement | null>(null);

watch(showDialog, async (show) => {
  if (show) {
    await nextTick();
    dialogRef.value?.showModal();
  }
});

function handleDialogClick(event: MouseEvent) {
  if (event.target instanceof HTMLDialogElement) {
    closeDialog();
  }
}

function closeDialog() {
  if (dialogRef.value?.open) {
    dialogRef.value.close();
  }
  showDialog.value = false;
}
</script>

<template>
  <dialog
      v-if="showDialog"
      ref="dialogRef"
      class="a2ui-modal__dialog"
      :class="theme.components.Modal.backdrop"
      @click="handleDialogClick"
  >
    <section class="a2ui-modal__panel" :class="theme.components.Modal.element" :style="theme.additionalStyles?.Modal">
      <div class="controls">
        <button type="button" aria-label="Close" @click="closeDialog">
          <span class="g-icon">close</span>
        </button>
      </div>

      <div class="a2ui-modal__body">
        <A2UiRenderer
            v-if="content"
            :surface-id="surfaceId!"
            :component="content"
        />
      </div>
    </section>
  </dialog>
  <a2ui-modal>
    <section class="a2ui-modal__trigger" @click="showDialog = true">
      <A2UiRenderer
          v-if="trigger"
          :surface-id="surfaceId!"
          :component="trigger"
        />
    </section>
  </a2ui-modal>
</template>

<style scoped>
dialog {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  overflow: visible;
}

.a2ui-modal__dialog {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 24px;
}

.a2ui-modal__dialog::backdrop {
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
}

.a2ui-modal__panel {
  position: relative;
  box-sizing: border-box;
  width: min(560px, 100%);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: light-dark(#ffffff, #1e293b);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
  padding: 20px;
  overflow: hidden;
  animation: a2ui-modal-in 0.18s ease-out;
}

@keyframes a2ui-modal-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.a2ui-modal__body {
  overflow-y: auto;
  min-height: 0;
}

dialog section .controls {
  display: flex;
  justify-content: end;
  margin-bottom: 4px;
}

dialog section .controls button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: light-dark(rgba(15, 23, 42, 0.06), rgba(255, 255, 255, 0.08));
  color: light-dark(#475569, #cbd5e1);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

dialog section .controls button:hover {
  background: light-dark(rgba(15, 23, 42, 0.12), rgba(255, 255, 255, 0.16));
  color: light-dark(#1e293b, #f1f5f9);
}

dialog section .controls button:focus-visible {
  outline: 2px solid light-dark(#818cf8, #06b6d4);
  outline-offset: 2px;
}

.a2ui-modal__trigger {
  display: inline-flex;
  cursor: pointer;
}
</style>
