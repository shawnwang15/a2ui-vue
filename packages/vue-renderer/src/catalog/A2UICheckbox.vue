

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  value: unknown;
  label: unknown;
}>();

const { theme, resolvePrimitive, getUniqueId, setData, getBindingPath } = useDynamicComponent(props);

const inputChecked = computed(() => Boolean(resolvePrimitive(props.value) ?? false));
const resolvedLabel = computed(() => resolvePrimitive(props.label));
const inputId = getUniqueId('a2ui-checkbox');

function handleChange(event: Event) {
  const path = getBindingPath(props.value);

  if (!(event.target instanceof HTMLInputElement) || !path) {
    return;
  }

  setData(props.component, path, event.target.checked, props.surfaceId);
}
</script>

<template>
  <a2ui-checkbox>
    <section
      :class="theme.components.CheckBox.container"
      :style="theme.additionalStyles?.CheckBox"
    >
      <input
        autocomplete="off"
        type="checkbox"
        :id="inputId"
        :checked="inputChecked"
        :class="theme.components.CheckBox.element"
        @change="handleChange"
      />

      <label :for="inputId" :class="theme.components.CheckBox.label">
        {{ resolvedLabel }}
      </label>
    </section>
  </a2ui-checkbox>
</template>

<style scoped>
a2ui-checkbox {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
  overflow: auto;
}

input {
  display: block;
  width: 100%;
}
</style>
