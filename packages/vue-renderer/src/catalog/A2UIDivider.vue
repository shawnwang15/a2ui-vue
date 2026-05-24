

<script setup lang="ts">
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
}>();

const { theme } = useDynamicComponent(props);
</script>

<template>
  <a2ui-divider>
    <hr :class="theme.components.Divider" :style="theme.additionalStyles?.Divider" />
  </a2ui-divider>
</template>

<style scoped>
a2ui-divider {
  display: block;
  min-height: 0;
  overflow: auto;
}

hr {
  height: 1px;
  background: #ccc;
  border: none;
}
</style>
