

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as Types from '@a2ui/web_core/types/types';
import * as Styles from '@a2ui/web_core/styles/index';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.TabsNode;
  weight: string | number;
  tabs: Types.ResolvedTabItem[];
}>();

const { theme, resolvePrimitive } = useDynamicComponent(props);

const selectedIndex = ref(0);

const buttonClasses = computed(() => {
  const index = selectedIndex.value;

  return props.tabs.map((_, i) => {
    return i === index
      ? Styles.merge(
          theme.components.Tabs.controls.all,
          theme.components.Tabs.controls.selected,
        )
      : theme.components.Tabs.controls.all;
  });
});
</script>

<template>
  <a2ui-tabs>
    <section :class="theme.components.Tabs.container" :style="theme.additionalStyles?.Tabs">
      <div :class="theme.components.Tabs.element">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="selectedIndex = index"
          :disabled="selectedIndex === index"
          :class="buttonClasses[index]"
        >
          {{ resolvePrimitive(tab.title) }}
        </button>
      </div>

      <A2UiRenderer
        :surface-id="surfaceId!"
        :component="tabs[selectedIndex].child"
      />
    </section>
  </a2ui-tabs>
</template>

<style scoped>
a2ui-tabs {
  display: block;
  flex: v-bind(props.weight);
  width: 100%;
}
</style>
