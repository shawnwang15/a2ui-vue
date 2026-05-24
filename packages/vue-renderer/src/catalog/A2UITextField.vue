

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

type TextFieldVariant = 'text' | 'number';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  value: unknown;
  label: unknown;
  variant: TextFieldVariant | null;
}>();

const { theme, resolvePrimitive, getUniqueId, setData, getBindingPath } = useDynamicComponent(props);

const inputValue = computed(() => resolvePrimitive(props.value) || '');
const resolvedLabel = computed(() => resolvePrimitive(props.label));
const inputId = getUniqueId('a2ui-input');

function handleInput(event: Event) {
  const path = getBindingPath(props.value);

  if (!(event.target instanceof HTMLInputElement) || !path) {
    return;
  }

  setData(props.component, path, event.target.value, props.surfaceId);
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

      <input
        autocomplete="off"
        :class="theme.components.TextField.element"
        :style="theme.additionalStyles?.TextField"
        @input="handleInput"
        :id="inputId"
        :value="inputValue as string | number"
        placeholder="Please enter a value"
        :type="variant === 'number' ? 'number' : 'text'"
      />
    </section>
  </a2ui-text-field>
</template>

<style scoped>
a2ui-text-field {
  display: flex;
  flex: v-bind(props.weight);
}

section,
input,
label {
  box-sizing: border-box;
}

input {
  display: block;
  width: 100%;
}

label {
  display: block;
  margin-bottom: 4px;
}
</style>
