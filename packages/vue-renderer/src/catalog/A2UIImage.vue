

<script setup lang="ts">
import { computed } from 'vue';
import * as Primitives from '@a2ui/web_core/types/primitives';
import * as Styles from '@a2ui/web_core/styles/index';
import * as Types from '@a2ui/web_core/types/types';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';

const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.ImageNode;
  weight: string | number;
  url: Primitives.StringValue | null;
  altText: Primitives.StringValue | null;
  usageHint: Types.ResolvedImage['usageHint'] | null;
}>();

const { theme, resolvePrimitive } = useDynamicComponent(props);

const resolvedUrl = computed(() => resolvePrimitive(props.url));
const resolvedAltText = computed(() => {
  const raw = props.altText;
  return raw ? resolvePrimitive(raw) : '';
});

const classes = computed(() => {
  const usageHint = props.usageHint;

  return Styles.merge(
    theme.components.Image.all,
    usageHint ? theme.components.Image[usageHint] : {},
  );
});
</script>

<template>
  <a2ui-image>
    <section v-if="resolvedUrl" :class="classes" :style="theme.additionalStyles?.Image">
      <img :src="resolvedUrl" :alt="resolvedAltText??''" />
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
