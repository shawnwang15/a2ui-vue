

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  value: unknown;
  label?: unknown;
  min: number | undefined;
  max: number | undefined;
}>();

const { theme, resolvePrimitive, getUniqueId, setData, getBindingPath } = useDynamicComponent(props);

const inputId = getUniqueId('a2ui-slider');
const resolvedValue = computed(() => Number(resolvePrimitive(props.value) ?? 0));
const resolvedLabel = computed(() => (props.label ? resolvePrimitive(props.label) : ''));

const percentComplete = computed(() => computePercentage(resolvedValue.value));

function computePercentage(value: number): number {
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const range = max - min;
  return range > 0 ? Math.max(0, Math.min(100, ((value - min) / range) * 100)) : 0;
}

function handleInput(event: Event) {
  const path = getBindingPath(props.value);

  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }

  const newValue = event.target.valueAsNumber;
  const percent = computePercentage(newValue);

  // Inject CSS variable directly to avoid change detection lag/snapback
  event.target.style.setProperty('--slider-percent', percent + '%');

  if (path) {
    setData(props.component, path, newValue, props.surfaceId);
  }
}
</script>

<template>
  <a2ui-slider>
    <section :class="theme.components.Slider.container">
      <label :class="theme.components.Slider.label" :for="inputId">
        {{ resolvedLabel }}
      </label>

      <input
        autocomplete="off"
        type="range"
        :value="resolvedValue"
        :min="min"
        :max="max"
        :id="inputId"
        @input="handleInput"
        :class="theme.components.Slider.element"
        :style="[theme.additionalStyles?.Slider, { '--slider-percent': percentComplete + '%' }]"
      />
    </section>
  </a2ui-slider>
</template>

<style scoped>
a2ui-slider {
  display: block;
  flex: v-bind(props.weight);
  width: 100%;
}

input {
  display: block;
  width: 100%;
  box-sizing: border-box;
}
</style>
