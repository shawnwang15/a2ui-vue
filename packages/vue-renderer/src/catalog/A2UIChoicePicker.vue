

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  options: { label: unknown; value: string }[];
  value: unknown;
  description: string;
}>();

const { theme, resolvePrimitive, getUniqueId, processor, getBindingPath } = useDynamicComponent(props);

const selectId = getUniqueId('a2ui-choice-picker');
const selectValue = computed(() => resolvePrimitive(props.value));

function handleChange(event: Event) {
  const path = getBindingPath(props.value);

  if (!(event.target instanceof HTMLSelectElement) || !event.target.value || !path) {
    return;
  }

  processor.setData(
    props.component,
    processor.resolvePath(path, props.component.dataContextPath),
    event.target.value,
    props.surfaceId,
  );
}
</script>

<template>
  <a2ui-choice-picker>
    <section :class="theme.components.ChoicePicker.container">
      <label :class="theme.components.ChoicePicker.label" :for="selectId">
        {{ description }}
      </label>

      <select
        @change="handleChange"
        :id="selectId"
        :value="selectValue as string | number"
        :class="theme.components.ChoicePicker.element"
        :style="theme.additionalStyles?.ChoicePicker"
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ resolvePrimitive(option.label) }}
        </option>
      </select>
    </section>
  </a2ui-choice-picker>
</template>

<style scoped>
a2ui-choice-picker {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
  overflow: auto;
}

select {
  width: 100%;
  box-sizing: border-box;
}
</style>
