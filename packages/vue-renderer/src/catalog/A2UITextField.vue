

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

type TextFieldVariant = 'text' | 'number' | 'obscured' | 'longText';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  value: unknown;
  label: unknown;
  variant: TextFieldVariant | null;
  validationRegexp?: string;
}>();

const { theme, bound, getUniqueId } = useDynamicComponent(props);

const inputValue = computed(() => (bound.value.value as string | number | null) ?? '');
const resolvedLabel = computed(() => bound.value.label as string | null);
const resolvedVariant = computed(
  () => (bound.value.variant ?? props.variant) as TextFieldVariant | null,
);
const isLongText = computed(() => resolvedVariant.value === 'longText');
const inputType = computed(() => {
  if (resolvedVariant.value === 'number') return 'number';
  if (resolvedVariant.value === 'obscured') return 'password';
  return 'text';
});
// `validationRegexp` is a schema-level convenience that validates the field
// against a regular expression. It is combined with any `checks` results.
const regexError = computed<string | null>(() => {
  const pattern = (bound.value.validationRegexp ?? props.validationRegexp) as string | undefined;
  if (!pattern) return null;
  const value = inputValue.value;
  if (value === '' || value == null) return null;
  try {
    if (!new RegExp(pattern).test(String(value))) {
      return 'Invalid format';
    }
  } catch {
    return null;
  }
  return null;
});

const checksInvalid = computed(() => bound.value.isValid === false);
const checksErrors = computed<string[]>(() => bound.value.validationErrors ?? []);
const isInvalid = computed(() => checksInvalid.value || regexError.value !== null);
const validationErrors = computed<string[]>(() =>
  regexError.value ? [...checksErrors.value, regexError.value] : checksErrors.value,
);
const firstError = computed<string | null>(() =>
  isInvalid.value && validationErrors.value.length ? validationErrors.value[0] : null,
);
const inputId = getUniqueId('a2ui-input');

function handleInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) return;
  const setValue = bound.value.setValue;
  if (typeof setValue === 'function') {
    setValue(target.value);
  }
}
</script>

<template>
  <a2ui-text-field>
    <section :class="theme.components.TextField.container">
      <label
        v-if="resolvedLabel"
        :for="inputId"
        :class="theme.components.TextField.label"
      >
        {{ resolvedLabel }}
      </label>

      <textarea
        v-if="isLongText"
        autocomplete="off"
        :class="[theme.components.TextField.element, { 'a2ui-invalid': isInvalid }]"
        :style="theme.additionalStyles?.TextField"
        :aria-invalid="isInvalid"
        @input="handleInput"
        :id="inputId"
        :value="inputValue as string"
        placeholder="Please enter a value"
      ></textarea>

      <input
        v-else
        autocomplete="off"
        :class="[theme.components.TextField.element, { 'a2ui-invalid': isInvalid }]"
        :style="theme.additionalStyles?.TextField"
        :aria-invalid="isInvalid"
        @input="handleInput"
        :id="inputId"
        :value="inputValue as string | number"
        placeholder="Please enter a value"
        :type="inputType"
      />

      <p v-if="firstError" class="a2ui-field-error" role="alert">

        <span>{{ firstError }}</span>
      </p>
    </section>
  </a2ui-text-field>
</template>

<style scoped>
a2ui-text-field {
  display: flex;
  flex: v-bind(props.weight);
}

section {
  /* 让错误信息换到下一行，不与输入框争夺横向空间，消除出现/消失时的抖动 */
  flex-wrap: wrap;
}

section,
input,
textarea,
label {
  box-sizing: border-box;
}

input,
textarea {
  display: block;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
}

label {
  display: block;
  margin-bottom: 4px;
}

/* Invalid state: clear red border, soft red fill and focus halo. */
input.a2ui-invalid,
textarea.a2ui-invalid {
  border: 1.5px solid #d92d20 !important;
  background-color: #fef3f2 !important;
  animation: a2ui-invalid-shake 0.28s ease-in-out;
}

input.a2ui-invalid:focus,
textarea.a2ui-invalid:focus {
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(217, 45, 32, 0.18) !important;
}

.a2ui-field-error {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  flex-basis: 100%;
  width: 100%;
  min-width: 0;
  margin: 5px 0 0;
  white-space: normal;
  overflow-wrap: anywhere;
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
