

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';
const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  url: unknown;
  description?: unknown;
}>();

const { theme, bound } = useDynamicComponent(props);

const resolvedUrl = computed(() => bound.value.url ?? null);
const resolvedDescription = computed(() => (bound.value.description ?? null) as string | null);
</script>

<template>
  <a2ui-audio>
    <section v-if="resolvedUrl" :class="theme.components.AudioPlayer" :style="theme.additionalStyles?.AudioPlayer">
      <p v-if="resolvedDescription" class="a2ui-audio-description">{{ resolvedDescription }}</p>
      <audio is="audio" controls :src="resolvedUrl as string" />
    </section>
  </a2ui-audio>
</template>

<style scoped>
a2ui-audio {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
  overflow: auto;
}

audio {
  display: block;
  width: 100%;
  box-sizing: border-box;
}
</style>
