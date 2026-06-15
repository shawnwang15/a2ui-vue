

<script setup lang="ts">
import { computed } from 'vue';
import type { VueComponentNode } from '@/rendering/catalog';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

type ListAlign = 'start' | 'center' | 'end' | 'stretch';
type ListStyle = 'ordered' | 'unordered' | 'none';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  direction?: 'vertical' | 'horizontal';
  align?: ListAlign;
  listStyle?: ListStyle;
}>();

const { theme, bound } = useDynamicComponent(props);

const direction = computed<'vertical' | 'horizontal'>(
  () => (bound.value.direction ?? props.direction ?? 'vertical') as 'vertical' | 'horizontal',
);

const align = computed<ListAlign>(
  () => (bound.value.align ?? props.align ?? 'stretch') as ListAlign,
);

const listStyle = computed<ListStyle | null>(
  () => (bound.value.listStyle ?? props.listStyle ?? null) as ListStyle | null,
);

const listTag = computed(() => {
  switch (listStyle.value) {
    case 'ordered':
      return 'ol';
    case 'unordered':
      return 'ul';
    default:
      return 'div';
  }
});

const alignItems = computed(() => {
  switch (align.value) {
    case 'start':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    default:
      return 'stretch';
  }
});

const children = computed<VueComponentNode[]>(
  () => ((props.component.properties as any).children as VueComponentNode[]) ?? [],
);
</script>

<template>
  <a2ui-list
    :data-direction="direction"
    :data-list-style="listStyle ?? 'none'"
  >
    <component
      :is="listTag"
      :class="theme.components.List"
      :style="[theme.additionalStyles?.List, { alignItems }]"
    >
      <component
        :is="listStyle === 'ordered' || listStyle === 'unordered' ? 'li' : 'div'"
        class="a2ui-list-item"
        v-for="(child, index) in children"
        :key="child.id || index"
      >
        <A2UiRenderer
            :surface-id="surfaceId!"
            :component="child"
        />
      </component>
    </component>
  </a2ui-list>
</template>

<style scoped>
a2ui-list {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
}

a2ui-list > * {
  margin: 0;
}

/*
 * Plain (no marker) lists use flex layout so `direction` and child weights
 * behave like the other layout containers.
 */
a2ui-list[data-direction='vertical'] > div {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow-y: auto;
}

a2ui-list[data-direction='horizontal'] > div {
  display: flex;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

a2ui-list > div {
  list-style: none;
  padding-left: 0;
}

/*
 * Ordered/unordered lists keep normal block flow so the native list markers
 * remain visible (flex containers suppress list-item markers).
 */
a2ui-list > ol,
a2ui-list > ul {
  padding-left: 1.5rem;
  max-height: 100%;
  overflow-y: auto;
}

a2ui-list[data-list-style='ordered'] > ol {
  list-style: decimal;
}

a2ui-list[data-list-style='unordered'] > ul {
  list-style: disc;
}

.a2ui-list-item {
  display: flex;
  cursor: pointer;
  box-sizing: border-box;
}

/* Keep the native marker visible for ordered/unordered lists. */
li.a2ui-list-item {
  display: list-item;
}

li.a2ui-list-item > * {
  display: inline-flex;
  width: 100%;
}
</style>
