

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

const { theme, bound, getUniqueId } = useDynamicComponent(props);

const inputChecked = computed(() => Boolean(bound.value.value ?? false));
const resolvedLabel = computed(() => bound.value.label as string | null);
const isInvalid = computed(() => bound.value.isValid === false);
const validationErrors = computed<string[]>(() => bound.value.validationErrors ?? []);
const firstError = computed<string | null>(() =>
  isInvalid.value && validationErrors.value.length ? validationErrors.value[0] : null,
);
const inputId = getUniqueId('a2ui-checkbox');

function handleChange(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) return;
  const setValue = bound.value.setValue;
  if (typeof setValue === 'function') {
    setValue(event.target.checked);
  }
}
</script>

<template>
  <a2ui-checkbox>
    <section
      :class="theme.components.CheckBox.container"
      :style="theme.additionalStyles?.CheckBox"
    >
      <div class="a2ui-checkbox-row">
        <input
          autocomplete="off"
          type="checkbox"
          :id="inputId"
          :checked="inputChecked"
          :aria-invalid="isInvalid"
          :class="theme.components.CheckBox.element"
          @change="handleChange"
        />

        <label :for="inputId" :class="theme.components.CheckBox.label">
          {{ resolvedLabel }}
        </label>
      </div>

      <p v-if="firstError" class="a2ui-checkbox-errors">
        {{ firstError }}
      </p>
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

.a2ui-checkbox-row {
  display: flex;
  align-items: center;
}

input {
  flex: none;
  width: auto;
}

.a2ui-checkbox-errors {
  flex-basis: 100%;
  margin: 4px 0 0;
  color: #b3261e;
  font-size: 0.75rem;
}
</style>
