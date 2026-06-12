

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  value: unknown;
  enableDate: boolean;
  enableTime: boolean;
  label?: unknown;
}>();

const { theme, bound, getUniqueId } = useDynamicComponent(props);

const inputId = getUniqueId('a2ui-datetime-input');

const enableDate = computed(() => Boolean(bound.value.enableDate ?? props.enableDate));
const enableTime = computed(() => Boolean(bound.value.enableTime ?? props.enableTime));

const enabled = computed(() => enableDate.value || enableTime.value);

const inputType = computed(() => {
  if (enableDate.value && enableTime.value) {
    return 'datetime-local';
  } else if (enableDate.value) {
    return 'date';
  } else if (enableTime.value) {
    return 'time';
  }

  return 'datetime-local';
});

const label = computed(() => {
  // Use provided label if available
  const provided = bound.value.label ?? props.label;
  if (provided) {
    return provided as string;
  }
  const type = inputType.value;

  if (type === 'date') {
    return 'Date';
  } else if (type === 'time') {
    return 'Time';
  }

  return 'Date & Time';
});

/**
 * Normalizes an incoming ISO or partial date/time value into a format accepted
 * by HTML5 inputs. HTML5 date/time/datetime-local inputs reject timezone
 * indicators (`Z`, `+00:00`) and trailing seconds/milliseconds in `.value` and
 * will reset to empty. This strips those without shifting timezones.
 */
function normalizeDateTimeValue(value: string | null | undefined, type: string): string {
  if (!value) return '';

  const hasT = value.includes('T');
  const split = value.split('T');

  const datePart = (hasT ? split[0] : value)?.substring(0, 10) ?? '';
  const timePart = (hasT ? split[1] : value)?.substring(0, 5) ?? '';

  switch (type) {
    case 'date':
      return datePart;
    case 'time':
      return timePart;
    case 'datetime-local':
      return `${datePart}T${timePart}`;
  }
  return '';
}

const inputValue = computed(() =>
  normalizeDateTimeValue((bound.value.value as string | null | undefined) ?? '', inputType.value),
);

function handleInput(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }
  const setValue = bound.value.setValue;
  if (typeof setValue === 'function') {
    setValue(event.target.value);
  }
}
</script>

<template>
  <a2ui-datetime-input v-if="enabled">
    <section :class="theme.components.DateTimeInput.container">
      <label :for="inputId" :class="theme.components.DateTimeInput.label">
        {{ label }}
      </label>

      <input
        autocomplete="off"
        :type="inputType"
        :id="inputId"
        :class="theme.components.DateTimeInput.element"
        :style="theme.additionalStyles?.DateTimeInput"
        :value="inputValue"
        @input="handleInput"
      />
    </section>
  </a2ui-datetime-input>
</template>

<style scoped>
a2ui-datetime-input {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
  overflow: auto;
}

input {
  display: block;
  width: 100%;
  box-sizing: border-box;
}
</style>
