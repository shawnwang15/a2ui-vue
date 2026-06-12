

<script setup lang="ts">
import { computed } from 'vue';
import * as Styles from '@a2ui/web_core/styles/index';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

type ImageVariant = 'icon' | 'avatar' | 'header' | 'smallFeature' | 'mediumFeature' | 'largeFeature';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  url: unknown;
  altText: unknown;
  description?: unknown;
  variant?: ImageVariant;
  fit?: unknown;
}>();

const { theme, bound } = useDynamicComponent(props);

const resolvedUrl = computed(() => bound.value.url ?? null);
const resolvedAltText = computed(() => {
  const value = bound.value.description ?? bound.value.altText;
  return (value ?? '') as string;
});
const objectFit = computed(() => (bound.value.fit ?? 'fill') as string);

const variantClass = computed<ImageVariant | undefined>(
  () => ((bound.value.variant ?? props.variant) as ImageVariant | null) || undefined,
);

const classes = computed(() => {
  const variant = (bound.value.variant ?? props.variant) as ImageVariant | null;

  return Styles.merge(
    theme.components.Image.all,
    variant ? (theme.components.Image as Record<string, any>)[variant] : {},
  );
});
</script>

<template>
  <a2ui-image>
    <section v-if="resolvedUrl" :class="classes" :style="theme.additionalStyles?.Image">
      <img
        :src="resolvedUrl as string"
        :alt="resolvedAltText"
        :class="variantClass"
        :style="`object-fit: ${objectFit}`"
      />
    </section>
  </a2ui-image>
</template>

<style scoped>
a2ui-image {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
  overflow: auto;
}

img {
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>
