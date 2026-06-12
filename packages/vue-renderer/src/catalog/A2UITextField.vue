

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
const isInvalid = computed(() => bound.value.isValid === false);
const validationErrors = computed<string[]>(() => bound.value.validationErrors ?? []);
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
        :class="theme.components.TextField.element"
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
        :class="theme.components.TextField.element"
        :style="theme.additionalStyles?.TextField"
        :aria-invalid="isInvalid"
        @input="handleInput"
        :id="inputId"
        :value="inputValue as string | number"
        placeholder="Please enter a value"
        :type="inputType"
      />

      <p v-if="firstError" class="a2ui-text-field-errors">
        {{ firstError }}
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

.a2ui-text-field-errors {
  flex-basis: 100%;
  width: 100%;
  min-width: 0;
  margin: 4px 0 0;
  white-space: normal;
  overflow-wrap: anywhere;
  color: #b3261e;
  font-size: 0.75rem;
}
</style>
