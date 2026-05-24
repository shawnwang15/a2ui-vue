


<script setup lang="ts">
import { ref, watch, shallowRef, onMounted, type Component } from 'vue';
import * as Styles from '@a2ui/web_core/styles/index';
import { useA2UIConfig } from '../config';
import type { VueComponentNode } from './catalog';

/**
 * Loads and renders a single component from the catalog using the supplied
 * `VueComponentNode`. The node is produced by the v0.9 processor (see
 * `MessageProcessor.buildVueNode`) and carries an absolute `dataContextPath`
 * for relative path resolution within the data model.
 */
const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
}>();

const { catalog } = useA2UIConfig();

const loadedComponent = shallowRef<Component | null>(null);
const componentProps = ref<Record<string, any>>({});

let hasInsertedStyles = false;

async function loadComponent() {
  const config = catalog[props.component.type];

  if (!config) {
    console.warn(`No component registered for type: ${props.component.type}`);
    loadedComponent.value = null;
    return;
  }

  let component: Component;
  let extraProps: Record<string, any> = {};

  if (typeof config === 'function') {
    const result = await config();
    component = (result as any).default ?? result;
  } else {
    const result = await config.type();
    component = (result as any).default ?? result;
    extraProps = config.props(props.component);
  }

  componentProps.value = {
    surfaceId: props.surfaceId,
    component: props.component,
    weight: props.component.weight ?? 'initial',
    ...extraProps,
  };

  loadedComponent.value = component;
}

watch(
  () => [props.surfaceId, props.component],
  () => loadComponent(),
  { immediate: true, deep: true }
);

onMounted(() => {
  if (!hasInsertedStyles && typeof document !== 'undefined') {
    const styles = document.createElement('style');
    styles.textContent = Styles.structuralStyles;
    document.head.appendChild(styles);
    hasInsertedStyles = true;
  }
});
</script>

<template>
  <component
    v-if="loadedComponent"
    :is="loadedComponent"
    v-bind="componentProps"
  />
</template>
