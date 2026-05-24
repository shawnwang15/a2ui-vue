

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
      :class="theme.components.Modal.backdrop"
      @click="handleDialogClick"
  >
    <section :class="theme.components.Modal.element" :style="theme.additionalStyles?.Modal">
      <div class="controls">
        <button @click="closeDialog">
          <span class="g-icon">close</span>
        </button>
      </div>

      <A2UiRenderer
          v-if="content"
          :surface-id="surfaceId!"
          :component="content"
      />
    </section>
  </dialog>
  <a2ui-modal>
    <section  @click="showDialog = true">
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

dialog section .controls {
  display: flex;
  justify-content: end;
  margin-bottom: 4px;
}

dialog section .controls button {
  padding: 0;
  background: none;
  width: 20px;
  height: 20px;
  border: none;
  cursor: pointer;
}
</style>
