

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
  min?: unknown;
  max?: unknown;
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

const inputMin = computed(() => {
  const raw = (bound.value.min ?? props.min) as string | null | undefined;
  return raw ? normalizeDateTimeValue(raw, inputType.value) : undefined;
});
const inputMax = computed(() => {
  const raw = (bound.value.max ?? props.max) as string | null | undefined;
  return raw ? normalizeDateTimeValue(raw, inputType.value) : undefined;
});

const isInvalid = computed(() => bound.value.isValid === false);
const validationErrors = computed<string[]>(() => bound.value.validationErrors ?? []);
const firstError = computed<string | null>(() =>
  isInvalid.value && validationErrors.value.length ? validationErrors.value[0] : null,
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
        :class="[theme.components.DateTimeInput.element, { 'a2ui-invalid': isInvalid }]"
        :style="theme.additionalStyles?.DateTimeInput"
        :value="inputValue"
        :min="inputMin"
        :max="inputMax"
        :aria-invalid="isInvalid"
        @input="handleInput"
      />

      <p v-if="firstError" class="a2ui-field-error" role="alert">

        <span>{{ firstError }}</span>
      </p>
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

/* Invalid state: clear red border, soft red fill and focus halo. */
input.a2ui-invalid {
  border: 1.5px solid #d92d20 !important;
  background-color: #fef3f2 !important;
  animation: a2ui-invalid-shake 0.28s ease-in-out;
}

input.a2ui-invalid:focus {
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(217, 45, 32, 0.18) !important;
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

@keyframes a2ui-invalid-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
</style>
