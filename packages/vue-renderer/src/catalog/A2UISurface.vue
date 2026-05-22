


<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';
import { useMessageProcessor } from '../data/processor';

/**
 * Renders the root component tree for a single A2UI surface.
 *
 * Resolves the underlying v0.9 `SurfaceModel` through the injected
 * `MessageProcessor` and rebuilds the root `VueComponentNode` whenever the
 * processor's internal `version` ref changes (component / data updates).
 */
const props = defineProps<{
  surfaceId: string | null;
}>();

const processor = useMessageProcessor();

const surface = computed(() => {
  // Subscribe to processor updates.
  void processor.version.value;
  return props.surfaceId ? processor.getSurface(props.surfaceId) : undefined;
});

const rootNode = computed(() => {
  void processor.version.value;
  if (!props.surfaceId) return null;
  return processor.buildVueNode(props.surfaceId, 'root', '/');
});

const styles = computed<CSSProperties>(() => {
  // Theme on a v0.9 SurfaceModel is `any` (forwarded from the
  // `createSurface.theme` payload). The legacy renderer reads `primaryColor`
  // and `font` keys; preserve that behavior, looking under either the theme
  // root or a `styles` sub-object for compatibility with both shapes.
  const themeRaw = (surface.value?.theme ?? {}) as Record<string, unknown>;
  const styleSource =
    (themeRaw.styles as Record<string, unknown> | undefined) ?? themeRaw;
  const result: CSSProperties = {};

  for (const [key, value] of Object.entries(styleSource ?? {})) {
    switch (key) {
      case 'primaryColor': {
        (result as any)['--p-100'] = '#ffffff';
        (result as any)['--p-99'] = `color-mix(in srgb, ${value} 2%, white 98%)`;
        (result as any)['--p-98'] = `color-mix(in srgb, ${value} 4%, white 96%)`;
        (result as any)['--p-95'] = `color-mix(in srgb, ${value} 10%, white 90%)`;
        (result as any)['--p-90'] = `color-mix(in srgb, ${value} 20%, white 80%)`;
        (result as any)['--p-80'] = `color-mix(in srgb, ${value} 40%, white 60%)`;
        (result as any)['--p-70'] = `color-mix(in srgb, ${value} 60%, white 40%)`;
        (result as any)['--p-60'] = `color-mix(in srgb, ${value} 80%, white 20%)`;
        (result as any)['--p-50'] = value;
        (result as any)['--p-40'] = `color-mix(in srgb, ${value} 80%, black 20%)`;
        (result as any)['--p-35'] = `color-mix(in srgb, ${value} 70%, black 30%)`;
        (result as any)['--p-30'] = `color-mix(in srgb, ${value} 60%, black 40%)`;
        (result as any)['--p-25'] = `color-mix(in srgb, ${value} 50%, black 50%)`;
        (result as any)['--p-20'] = `color-mix(in srgb, ${value} 40%, black 60%)`;
        (result as any)['--p-15'] = `color-mix(in srgb, ${value} 30%, black 70%)`;
        (result as any)['--p-10'] = `color-mix(in srgb, ${value} 20%, black 80%)`;
        (result as any)['--p-5'] = `color-mix(in srgb, ${value} 10%, black 90%)`;
        (result as any)['--0'] = '#00000';
        break;
      }

      case 'font': {
        (result as any)['--font-family'] = value;
        (result as any)['--font-family-flex'] = value;
        break;
      }
    }
  }

  return result;
});
</script>

<template>
  <a2ui-surface :style="styles">
    <A2UiRenderer
      v-if="surfaceId && rootNode"
      :surface-id="surfaceId"
      :component="rootNode"
    />
  </a2ui-surface>
</template>

<style scoped>
a2ui-surface {
  display: flex;
  min-height: 0;
  max-height: 100%;
  flex-direction: column;
  gap: 16px;
}
</style>
