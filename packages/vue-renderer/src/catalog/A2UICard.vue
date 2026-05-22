

<script setup lang="ts">
import { computed } from 'vue';
import type { VueComponentNode } from '@/rendering/catalog';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
}>();

const { theme } = useDynamicComponent(props);

const children = computed<VueComponentNode[]>(() => {
  const properties = props.component.properties as any;
  const list: VueComponentNode[] = (properties.children as VueComponentNode[]) ?? [];
  if (list.length > 0) return list;
  return properties.child ? [properties.child as VueComponentNode] : [];
});
</script>

<template>
  <a2ui-card>
    <section :class="theme.components.Card" :style="theme.additionalStyles?.Card">
      <A2UiRenderer
        v-for="(child, index) in children"
        :key="child.id || (child.type + '-' +index)"
        :surface-id="surfaceId!"
        :component="child"
      />
    </section>
  </a2ui-card>
</template>

<style scoped>
a2ui-card {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
  overflow: auto;
}

a2ui-card > section {
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: auto;
}

a2ui-card > section > :deep(*) {
  height: 100%;
  width: 100%;
}
</style>
