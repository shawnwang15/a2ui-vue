

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as Styles from '@a2ui/web_core/styles/index';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

interface ResolvedTab {
  child: VueComponentNode;
}

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  tabs: ResolvedTab[];
}>();

const { theme, bound } = useDynamicComponent(props);

const selectedIndex = ref(0);

const resolvedTabs = computed(() =>
  props.tabs.map((tab, i) => ({
    title: (bound.value.tabs?.[i]?.title ?? '') as string,
    child: tab.child,
  })),
);

const buttonClasses = computed(() => {
  const index = selectedIndex.value;

  return resolvedTabs.value.map((_, i) => {
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
    <section class="a2ui-tabs" :class="theme.components.Tabs.container" :style="theme.additionalStyles?.Tabs">
      <div class="a2ui-tabs__bar" role="tablist" :class="theme.components.Tabs.element">
        <button
          v-for="(tab, index) in resolvedTabs"
          :key="index"
          type="button"
          role="tab"
          :aria-selected="index === selectedIndex"
          @click="selectedIndex = index"
          class="a2ui-tabs__tab"
          :class="[buttonClasses[index], { 'a2ui-tabs__tab--selected': index === selectedIndex }]"
        >
          {{ tab.title }}
        </button>
      </div>

      <div class="a2ui-tabs__panel" role="tabpanel">
        <A2UiRenderer
          :surface-id="surfaceId!"
          :component="resolvedTabs[selectedIndex].child"
        />
      </div>
    </section>
  </a2ui-tabs>
</template>

<style scoped>
a2ui-tabs {
  display: block;
  flex: v-bind(props.weight);
  width: 100%;
}

.a2ui-tabs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.a2ui-tabs__bar {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: light-dark(rgba(15, 23, 42, 0.05), rgba(255, 255, 255, 0.06));
  overflow-x: auto;
  scrollbar-width: none;
}

.a2ui-tabs__bar::-webkit-scrollbar {
  display: none;
}

.a2ui-tabs__tab {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  padding: 8px 18px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.2;
  color: light-dark(#475569, #cbd5e1);
  transition: color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.a2ui-tabs__tab:hover {
  color: light-dark(#1e293b, #f1f5f9);
  background: light-dark(rgba(15, 23, 42, 0.06), rgba(255, 255, 255, 0.08));
}

.a2ui-tabs__tab:focus-visible {
  outline: 2px solid light-dark(#818cf8, #06b6d4);
  outline-offset: 2px;
}

.a2ui-tabs__tab--selected,
.a2ui-tabs__tab--selected:hover {
  color: #ffffff;
  background: linear-gradient(
    135deg,
    light-dark(#818cf8, #06b6d4) 0%,
    light-dark(#a78bfa, #3b82f6) 100%
  );
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

.a2ui-tabs__panel {
  min-width: 0;
}
</style>
