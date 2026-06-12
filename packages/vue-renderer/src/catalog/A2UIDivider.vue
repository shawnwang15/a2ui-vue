

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  axis?: unknown | null;
}>();

const { theme, bound } = useDynamicComponent(props);

const isVertical = computed(() => bound.value.axis === 'vertical');
</script>

<template>
  <a2ui-divider>
    <div
      v-if="isVertical"
      class="a2ui-divider vertical"
      :class="theme.components.Divider"
      :style="theme.additionalStyles?.Divider"
    ></div>
    <hr
      v-else
      class="a2ui-divider horizontal"
      :class="theme.components.Divider"
      :style="theme.additionalStyles?.Divider"
    />
  </a2ui-divider>
</template>

<style scoped>
a2ui-divider {
  display: block;
  min-height: 0;
  overflow: auto;
}

.a2ui-divider.horizontal {
  height: 1px;
  background: #ccc;
  border: none;
}

.a2ui-divider.vertical {
  width: 1px;
  height: 100%;
  background: #ccc;
  align-self: stretch;
}
</style>
