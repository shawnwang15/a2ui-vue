

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
  variant: ImageVariant | null;
}>();

const { theme, resolvePrimitive } = useDynamicComponent(props);

const resolvedUrl = computed(() => resolvePrimitive(props.url));
const resolvedAltText = computed(() => {
  const raw = props.altText;
  return raw ? resolvePrimitive(raw) : '';
});

const classes = computed(() => {
  const variant = props.variant;

  return Styles.merge(
    theme.components.Image.all,
    variant ? (theme.components.Image as Record<string, any>)[variant] : {},
  );
});
</script>

<template>
  <a2ui-image>
    <section v-if="resolvedUrl" :class="classes" :style="theme.additionalStyles?.Image">
      <img :src="resolvedUrl as string" :alt="(resolvedAltText as string) ?? ''" />
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
