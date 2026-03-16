

<script setup lang="ts">
import { computed } from 'vue';
import * as Types from '@a2ui/web_core/types/types';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.CardNode;
  weight: string | number;
}>();

const { theme } = useDynamicComponent(props);

const children = computed(() => {
  const properties = props.component.properties;
  return properties.children || [properties.child];
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
