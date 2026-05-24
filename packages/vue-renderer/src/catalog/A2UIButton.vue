

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';
import A2UIRenderer from '@/rendering/A2UIRenderer.vue';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  action: unknown;
  variant?: string;
}>();

const { theme, sendAction } = useDynamicComponent(props);

const child = computed<VueComponentNode | null>(
  () => ((props.component.properties as any).child as VueComponentNode) ?? null,
);

function handleClick() {
  if (props.action) {
    sendAction(props.action);
  }
}
</script>

<template>
  <a2ui-button>
    <button
      :class="theme.components.Button"
      :style="theme.additionalStyles?.Button"
      @click="handleClick"
    >
      <A2UIRenderer
        v-if="child"
        :surface-id="surfaceId!"
        :component="child"
      />
    </button>
  </a2ui-button>
</template>

<style scoped>
a2ui-button {
  display: block;
  flex: v-bind(weight);
  min-height: 0;
}
</style>
