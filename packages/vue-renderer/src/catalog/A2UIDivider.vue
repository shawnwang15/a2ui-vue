

<script setup lang="ts">
import * as Types from '@a2ui/web_core/types/types';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';

const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.DividerNode;
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
