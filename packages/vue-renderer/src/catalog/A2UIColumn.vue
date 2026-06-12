

<script setup lang="ts">
import { computed } from 'vue';
import type { VueComponentNode } from '@/rendering/catalog';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

type ColumnAlign = 'start' | 'center' | 'end' | 'stretch';
type ColumnJustify = 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  align?: ColumnAlign;
  justify?: ColumnJustify;
}>();

const { theme, bound } = useDynamicComponent(props);

const classes = computed(() => {
  const align = (bound.value.align ?? props.align ?? 'stretch') as ColumnAlign;
  const justify = (bound.value.justify ?? props.justify ?? 'start') as ColumnJustify;

  return {
    ...theme.components.Column,
    [`align-${align}`]: true,
    [`justify-${justify}`]: true,
  };
});

const children = computed<VueComponentNode[]>(
  () => ((props.component.properties as any).children as VueComponentNode[]) ?? [],
);
</script>

<template>
  <a2ui-column>
    <section :class="classes" :style="theme.additionalStyles?.Column">
      <A2UiRenderer
        v-for="(child, index) in children"
        :key="child.id || index"
        :surface-id="surfaceId!"
        :component="child"
      />
    </section>
  </a2ui-column>
</template>

<style scoped>
a2ui-column {
  display: flex;
  flex: v-bind(props.weight);
  align-self: stretch;
}

section {
  display: flex;
  flex-direction: column;
  min-width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.align-start {
  align-items: start;
}

.align-center {
  align-items: center;
}

.align-end {
  align-items: end;
}

.align-stretch {
  align-items: stretch;
}

.justify-start {
  justify-content: start;
}

.justify-center {
  justify-content: center;
}

.justify-end {
  justify-content: end;
}

.justify-spaceBetween {
  justify-content: space-between;
}

.justify-spaceAround {
  justify-content: space-around;
}

.justify-spaceEvenly {
  justify-content: space-evenly;
}
</style>
