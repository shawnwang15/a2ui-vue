

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';

interface ChoiceOption {
  label: unknown;
  value: string;
}

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  options: ChoiceOption[];
  value: unknown;
  label?: unknown;
  description?: unknown;
  filterable?: boolean;
  variant?: string;
  displayStyle?: string;
}>();

const { theme, bound } = useDynamicComponent(props);

const filter = ref('');
const open = ref(false);
const rootEl = ref<HTMLElement | null>(null);

const resolvedLabel = computed(
  () => (bound.value.label ?? bound.value.description ?? props.description ?? '') as string,
);
const isMulti = computed(() => bound.value.variant === 'multipleSelection');
const filterable = computed(() => Boolean(bound.value.filterable));
const isChips = computed(
  () => (bound.value.displayStyle ?? props.displayStyle) === 'chips',
);

const isInvalid = computed(() => bound.value.isValid === false);
const validationErrors = computed<string[]>(() => bound.value.validationErrors ?? []);
const firstError = computed<string | null>(() =>
  isInvalid.value && validationErrors.value.length ? validationErrors.value[0] : null,
);

const selected = computed<string[]>(() =>
  Array.isArray(bound.value.value) ? (bound.value.value as string[]) : [],
);

const allOptions = computed<ChoiceOption[]>(
  () => (bound.value.options as ChoiceOption[]) ?? props.options ?? [],
);

const options = computed<ChoiceOption[]>(() =>
  allOptions.value.filter(
    (opt) =>
      !filterable.value ||
      filter.value === '' ||
      String(opt.label).toLowerCase().includes(filter.value.toLowerCase()),
  ),
);

const placeholder = computed(() => (filterable.value ? 'Select…' : 'Select…'));

const triggerText = computed(() => {
  if (!selected.value.length) return placeholder.value;
  const labels = selected.value.map((v) => {
    const opt = allOptions.value.find((o) => o.value === v);
    return opt ? String(opt.label) : v;
  });
  return labels.join(', ');
});

function isSelected(value: string): boolean {
  return selected.value.includes(value);
}

function toggle(value: string) {
  const setValue = bound.value.setValue;
  if (typeof setValue !== 'function') return;

  if (isMulti.value) {
    if (selected.value.includes(value)) {
      setValue(selected.value.filter((v) => v !== value));
    } else {
      setValue([...selected.value, value]);
    }
  } else {
    setValue([value]);
    open.value = false;
  }
}

function toggleOpen() {
  open.value = !open.value;
  if (!open.value) filter.value = '';
}

function handleOutside(event: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    open.value = false;
    filter.value = '';
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutside));
</script>

<template>
  <a2ui-choice-picker>
    <section :class="theme.components.ChoicePicker.container" :style="theme.additionalStyles?.ChoicePicker">
      <label v-if="resolvedLabel" :class="theme.components.ChoicePicker.label">
        {{ resolvedLabel }}
      </label>

      <!-- Chips display style: render options as inline toggleable pills. -->
      <div
        v-if="isChips"
        class="a2ui-choice-picker-chips"
        :class="{ 'a2ui-invalid': isInvalid }"
        role="listbox"
        :aria-invalid="isInvalid"
      >
        <input
          v-if="filterable"
          type="text"
          class="a2ui-choice-picker-filter chips-filter"
          placeholder="Filter options..."
          aria-label="Filter options"
          :value="filter"
          @input="filter = ($event.target as HTMLInputElement).value"
        />
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="a2ui-choice-picker-chip"
          :class="{ selected: isSelected(option.value) }"
          role="option"
          :aria-selected="isSelected(option.value)"
          @click="toggle(option.value)"
        >
          {{ option.label }}
        </button>
        <span v-if="!options.length" class="a2ui-choice-picker-empty">No options</span>
      </div>

      <div v-else ref="rootEl" class="a2ui-choice-picker-dropdown">
        <button
          type="button"
          class="a2ui-choice-picker-trigger"
          :class="{ open, 'a2ui-invalid': isInvalid }"
          :aria-expanded="open"
          :aria-invalid="isInvalid"
          aria-haspopup="listbox"
          @click="toggleOpen"
        >
          <span
            class="a2ui-choice-picker-trigger-text"
            :class="{ placeholder: !selected.length }"
          >
            {{ triggerText }}
          </span>
          <span class="a2ui-choice-picker-arrow" aria-hidden="true">▾</span>
        </button>

        <div v-if="open" class="a2ui-choice-picker-panel" role="listbox">
          <input
            v-if="filterable"
            type="text"
            class="a2ui-choice-picker-filter"
            placeholder="Filter options..."
            aria-label="Filter options"
            :value="filter"
            @input="filter = ($event.target as HTMLInputElement).value"
          />

          <ul class="a2ui-choice-picker-list">
            <li
              v-for="option in options"
              :key="option.value"
              class="a2ui-choice-picker-option"
              :class="{ selected: isSelected(option.value) }"
              role="option"
              :aria-selected="isSelected(option.value)"
              @click="toggle(option.value)"
            >
              <input
                v-if="isMulti"
                type="checkbox"
                tabindex="-1"
                :checked="isSelected(option.value)"
                @click.stop="toggle(option.value)"
              />
              <span class="a2ui-choice-picker-option-label">{{ option.label }}</span>
              <span v-if="!isMulti && isSelected(option.value)" class="a2ui-choice-picker-check">✓</span>
            </li>

            <li v-if="!options.length" class="a2ui-choice-picker-empty">No options</li>
          </ul>
        </div>
      </div>

      <p v-if="firstError" class="a2ui-field-error" role="alert">

        <span>{{ firstError }}</span>
      </p>
    </section>
  </a2ui-choice-picker>
</template>

<style scoped>
a2ui-choice-picker {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
  overflow: visible;
}

.a2ui-choice-picker-dropdown {
  position: relative;
  width: 100%;
}

.a2ui-choice-picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  text-align: left;
}

.a2ui-choice-picker-trigger:hover {
  border-color: #999;
}

.a2ui-choice-picker-trigger.open {
  border-color: #007bff;
}

.a2ui-choice-picker-trigger-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a2ui-choice-picker-trigger-text.placeholder {
  color: #999;
}

.a2ui-choice-picker-arrow {
  flex: none;
  color: #666;
  font-size: 0.75rem;
}

.a2ui-choice-picker-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 240px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.a2ui-choice-picker-filter {
  box-sizing: border-box;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-bottom: 1px solid #eee;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
}

.a2ui-choice-picker-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
}

.a2ui-choice-picker-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 0.875rem;
}

.a2ui-choice-picker-option:hover {
  background-color: #f2f6ff;
}

.a2ui-choice-picker-option.selected {
  background-color: #eaf1ff;
}

.a2ui-choice-picker-option-label {
  flex: 1;
}

.a2ui-choice-picker-check {
  color: #007bff;
}

.a2ui-choice-picker-empty {
  padding: 8px 10px;
  color: #999;
  font-size: 0.875rem;
}

.a2ui-choice-picker-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.a2ui-choice-picker-chips .chips-filter {
  flex: 1 1 120px;
  min-width: 120px;
  box-sizing: border-box;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
}

.a2ui-choice-picker-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border: 1px solid #ccc;
  border-radius: 999px;
  background-color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  color: #333;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.a2ui-choice-picker-chip:hover {
  border-color: #999;
}

.a2ui-choice-picker-chip.selected {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

/* Invalid state: red border on the trigger / chips container. */
.a2ui-choice-picker-trigger.a2ui-invalid {
  border-color: #d92d20;
  background-color: #fef3f2;
  animation: a2ui-invalid-shake 0.28s ease-in-out;
}

.a2ui-choice-picker-trigger.a2ui-invalid:hover {
  border-color: #d92d20;
}

.a2ui-choice-picker-chips.a2ui-invalid {
  padding: 6px;
  border: 1.5px dashed #d92d20;
  border-radius: 8px;
  background-color: #fef3f2;
  animation: a2ui-invalid-shake 0.28s ease-in-out;
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
