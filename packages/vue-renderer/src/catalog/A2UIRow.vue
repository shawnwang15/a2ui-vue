

<script setup lang="ts">
import { computed } from 'vue';
import type { VueComponentNode } from '@/rendering/catalog';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

type RowAlign = 'start' | 'center' | 'end' | 'stretch';
type RowJustify = 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  align?: RowAlign;
  justify?: RowJustify;
}>();

const { theme } = useDynamicComponent(props);

const classes = computed(() => {
  const align = props.align ?? 'stretch';
  const justify = props.justify ?? 'start';

  return {
    ...theme.components.Row,
    [`align-${align}`]: true,
    [`justify-${justify}`]: true,
  };
});

const children = computed<VueComponentNode[]>(
  () => ((props.component.properties as any).children as VueComponentNode[]) ?? [],
);
</script>

<template>
  <a2ui-row
    :data-align="align"
    :data-justify="justify"
  >
    <section :class="classes" :style="theme.additionalStyles?.Row">
      <A2UiRenderer
        v-for="(child, index) in children"
        :key="child.id || index"
        :surface-id="surfaceId!"
        :component="child"
      />
    </section>
  </a2ui-row>
</template>

<style scoped>
a2ui-row {
  display: flex;
  flex: v-bind(props.weight);
}

section {
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 100%;
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
