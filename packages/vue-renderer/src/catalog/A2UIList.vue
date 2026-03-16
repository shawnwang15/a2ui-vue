

<script setup lang="ts">
import * as Types from '@a2ui/web_core/types/types';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.ListNode;
  weight: string | number;
  direction?: 'vertical' | 'horizontal';
}>();

const { theme } = useDynamicComponent(props);
</script>

<template>
  <a2ui-list
    :data-direction="direction ?? 'vertical'"
  >
    <section :class="theme.components.List" :style="theme.additionalStyles?.List">
      <div class="a2ui-list-item" v-for="(child, index) in component.properties.children">
        <A2UiRenderer
            :key="child.id || index"
            :surface-id="surfaceId!"
            :component="child"
        />
      </div>
    </section>
  </a2ui-list>
</template>

<style scoped>
a2ui-list {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
}

a2ui-list[data-direction='vertical'] section {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow-y: auto;
}

a2ui-list[data-direction='horizontal'] section {
  display: flex;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.a2ui-list-item {
  display: flex;
  cursor: pointer;
  box-sizing: border-box;
}
</style>
