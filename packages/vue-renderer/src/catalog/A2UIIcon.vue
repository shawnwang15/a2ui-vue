

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  name: unknown;
}>();

const { theme, bound } = useDynamicComponent(props);

const ICON_NAME_OVERRIDES: Record<string, string> = {
  play: 'play_arrow',
  rewind: 'fast_rewind',
  favoriteOff: 'favorite_border',
  starOff: 'star_border',
};

function toMaterialSymbol(name: string): string {
  if (ICON_NAME_OVERRIDES[name]) return ICON_NAME_OVERRIDES[name];
  return name.replace(/[A-Z]/g, (letter) => '_' + letter.toLowerCase());
}

const resolvedName = computed(() => bound.value.name ?? null);

const svgPath = computed<string | null>(() => {
  const name = resolvedName.value;
  if (typeof name === 'object' && name !== null && 'svgPath' in name) {
    return (name as { svgPath: string }).svgPath;
  }
  return null;
});

const symbolName = computed<string>(() => {
  const name = resolvedName.value;
  return typeof name === 'string' ? toMaterialSymbol(name) : '';
});
</script>

<template>
  <a2ui-icon aria-hidden="true" tabindex="-1">
    <section
      v-if="svgPath || symbolName"
      :class="theme.components.Icon"
      :style="theme.additionalStyles?.Icon"
    >
      <svg v-if="svgPath" class="svg" viewBox="0 0 24 24">
        <path :d="svgPath"></path>
      </svg>
      <span v-else class="g-icon material-symbol">{{ symbolName }}</span>
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
.material-symbol {
  font-family: var(--a2ui-icon-font-family, 'Material Symbols Outlined', sans-serif);
  font-size: var(--_icon-size);
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  color: var(--a2ui-icon-color, inherit);
  font-variation-settings: var(--a2ui-icon-font-variation-settings, 'FILL' 1);
}
.svg {
  fill: currentColor;
  width: var(--_icon-size, var(--a2ui-icon-size, 24px));
  height: var(--_icon-size, var(--a2ui-icon-size, 24px));
}
</style>
