

<script setup lang="ts">
import { computed } from 'vue';
import * as Primitives from '@a2ui/web_core/types/primitives';
import * as Types from '@a2ui/web_core/types/types';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.AudioPlayerNode;
  weight: string | number;
  url: Primitives.StringValue | null;
}>();

const { theme, resolvePrimitive } = useDynamicComponent(props);

const resolvedUrl = computed(() => resolvePrimitive(props.url));
</script>

<template>
  <a2ui-audio>
    <section v-if="resolvedUrl" :class="theme.components.AudioPlayer" :style="theme.additionalStyles?.AudioPlayer">
      <audio is="audio" controls :src="resolvedUrl" />
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
