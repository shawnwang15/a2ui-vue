

<script setup lang="ts">
import { computed } from 'vue';
import * as Primitives from '@a2ui/web_core/types/primitives';
import * as Types from '@a2ui/web_core/types/types';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';

const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.IconNode;
  weight: string | number;
  name: Primitives.StringValue | null;
}>();

const { theme, resolvePrimitive } = useDynamicComponent(props);

const resolvedName = computed(() => resolvePrimitive(props.name));
</script>

<template>
  <a2ui-icon aria-hidden="true" tabindex="-1">
    <section v-if="resolvedName" :class="theme.components.Icon" :style="theme.additionalStyles?.Icon">
      <span class="g-icon">{{ resolvedName }}</span>
    </section>
  </a2ui-icon>
</template>

<style scoped>
a2ui-icon {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
  overflow: auto;
}
</style>
