

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
  step?: number;
}>();

const { theme, bound, getUniqueId } = useDynamicComponent(props);

const inputId = getUniqueId('a2ui-slider');
const resolvedMin = computed(() => Number(bound.value.min ?? props.min ?? 0));
const resolvedMax = computed(() => Number(bound.value.max ?? props.max ?? 100));
const resolvedStep = computed(() => {
  const step = bound.value.step ?? props.step;
  return step == null ? undefined : Number(step);
});
const resolvedValue = computed(() => Number(bound.value.value ?? 0));
const resolvedLabel = computed(() => (bound.value.label ?? '') as string);
const isInvalid = computed(() => bound.value.isValid === false);
const validationErrors = computed<string[]>(() => bound.value.validationErrors ?? []);
const firstError = computed<string | null>(() =>
  isInvalid.value && validationErrors.value.length ? validationErrors.value[0] : null,
);

const percentComplete = computed(() => computePercentage(resolvedValue.value));

function computePercentage(value: number): number {
  const min = resolvedMin.value;
  const max = resolvedMax.value;
  const range = max - min;
  return range > 0 ? Math.max(0, Math.min(100, ((value - min) / range) * 100)) : 0;
}

function handleInput(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }

  const newValue = event.target.valueAsNumber;
  const percent = computePercentage(newValue);

  // Inject CSS variable directly to avoid change detection lag/snapback
  event.target.style.setProperty('--slider-percent', percent + '%');

  const setValue = bound.value.setValue;
  if (typeof setValue === 'function') {
    setValue(newValue);
  }
}
</script>

<template>
  <a2ui-slider>
    <section :class="theme.components.Slider.container">
      <div class="a2ui-slider-header">
        <label v-if="resolvedLabel" :class="theme.components.Slider.label" :for="inputId">
          {{ resolvedLabel }}
        </label>
        <span class="a2ui-slider-value">{{ resolvedValue }}</span>
      </div>

      <input
        autocomplete="off"
        type="range"
        :value="resolvedValue"
        :min="resolvedMin"
        :max="resolvedMax"
        :step="resolvedStep"
        :id="inputId"
        :aria-invalid="isInvalid"
        @input="handleInput"
        :class="[theme.components.Slider.element, { 'a2ui-invalid': isInvalid }]"
        :style="[theme.additionalStyles?.Slider, { '--slider-percent': percentComplete + '%' }]"
      />

      <p v-if="firstError" class="a2ui-field-error" role="alert">

        <span>{{ firstError }}</span>
      </p>
    </section>
  </a2ui-slider>
</template>

<style scoped>
a2ui-slider {
  display: block;
  flex: v-bind(props.weight);
  width: 100%;
}

.a2ui-slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

input {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

/* Invalid state: red accent on the track/thumb. */
input.a2ui-invalid {
  accent-color: #d92d20;
}

.a2ui-field-error {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin: 5px 0 0;
  color: #d92d20;
  font-size: 0.75rem;
  font-weight: 500;
}

.a2ui-field-error__icon {
  flex: none;
  line-height: 1.1;
}
</style>
