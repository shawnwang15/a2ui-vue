

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  url: unknown;
}>();

const { theme, bound } = useDynamicComponent(props);

const resolvedUrl = computed(() => bound.value.url ?? null);
</script>

<template>
  <a2ui-video>
    <section v-if="resolvedUrl" :class="theme.components.Video" :style="theme.additionalStyles?.Video">
      <video controls :src="resolvedUrl as string" />
    </section>
  </a2ui-video>
</template>

<style scoped>
a2ui-video {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
  overflow: auto;
}

video {
  display: block;
  width: 100%;
  box-sizing: border-box;
}
</style>
