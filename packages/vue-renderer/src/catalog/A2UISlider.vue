

<script setup lang="ts">
import { computed } from 'vue';
import * as Primitives from '@a2ui/web_core/types/primitives';
import * as Types from '@a2ui/web_core/types/types';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';

const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.SliderNode;
  weight: string | number;
  value: Primitives.NumberValue | null;
  label?: string;
  minValue: number | undefined;
  maxValue: number | undefined;
}>();

const { theme, resolvePrimitive, getUniqueId, setData } = useDynamicComponent(props);

const inputId = getUniqueId('a2ui-slider');
const resolvedValue = computed(() => resolvePrimitive(props.value) ?? 0);

const percentComplete = computed(() => computePercentage(resolvedValue.value));

function computePercentage(value: number): number {
  const min = props.minValue ?? 0;
  const max = props.maxValue ?? 100;
  const range = max - min;
  return range > 0 ? Math.max(0, Math.min(100, ((value - min) / range) * 100)) : 0;
}

function handleInput(event: Event) {
  const path = props.value?.path;

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
        {{ label }}
      </label>

      <input
        autocomplete="off"
        type="range"
        :value="resolvedValue"
        :min="minValue"
        :max="maxValue"
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
