---
description: "Custom text input example: useDynamicComponent, bound two-way binding, getUniqueId, and Catalog registration."
---

# Input Component Example (TextField)

This example shows how to implement a custom text input, following the logic of the built-in `A2UITextField.vue`: read the current value from `bound.value.value`, write back via `bound.value.setValue`, link labels with controls using `getUniqueId`, and display `checks` validation errors.

---

## 1. Vue Component

`src/components/MyTextField.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useDynamicComponent, type VueComponentNode } from 'a2ui-vue'

type TextFieldVariant = 'text' | 'number' | 'obscured' | 'longText'

const props = defineProps<{
  surfaceId: string | null
  component: VueComponentNode
  weight: string | number
  value: unknown
  label: unknown
  variant: TextFieldVariant | null
  validationRegexp?: string
}>()

const { theme, bound, getUniqueId } = useDynamicComponent(props)

const inputValue = computed(() => (bound.value.value as string | number | null) ?? '')
const resolvedLabel = computed(() => bound.value.label as string | null)
const resolvedVariant = computed(
  () => (bound.value.variant ?? props.variant) as TextFieldVariant | null,
)
const isLongText = computed(() => resolvedVariant.value === 'longText')
const inputType = computed(() => {
  if (resolvedVariant.value === 'number') return 'number'
  if (resolvedVariant.value === 'obscured') return 'password'
  return 'text'
})

const isInvalid = computed(() => bound.value.isValid === false)
const validationErrors = computed<string[]>(() => bound.value.validationErrors ?? [])
const firstError = computed<string | null>(() =>
  isInvalid.value && validationErrors.value.length ? validationErrors.value[0] : null,
)
const inputId = getUniqueId('a2ui-input')

function handleInput(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) return
  const setValue = bound.value.setValue
  if (typeof setValue === 'function') setValue(target.value)
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
        :id="inputId"
        autocomplete="off"
        :class="[theme.components.TextField.element, { 'a2ui-invalid': isInvalid }]"
        :style="theme.additionalStyles?.TextField"
        :value="inputValue as string"
        :aria-invalid="isInvalid"
        @input="handleInput"
      />

      <input
        v-else
        :id="inputId"
        autocomplete="off"
        :class="[theme.components.TextField.element, { 'a2ui-invalid': isInvalid }]"
        :style="theme.additionalStyles?.TextField"
        :value="inputValue as string | number"
        :type="inputType"
        :aria-invalid="isInvalid"
        @input="handleInput"
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
  flex-wrap: wrap;
}

input,
textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

input.a2ui-invalid,
textarea.a2ui-invalid {
  border: 1.5px solid #d92d20;
  background-color: #fef3f2;
}

.a2ui-field-error {
  flex-basis: 100%;
  margin: 5px 0 0;
  color: #d92d20;
  font-size: 0.75rem;
}
</style>
```

---

## 2. Catalog Registration

Register the type name `MyTextField` in `src/catalog.ts`:

```ts
import type { Catalog } from 'a2ui-vue'
import { DEFAULT_CATALOG } from 'a2ui-vue'

export const myCatalog: Catalog = {
  ...DEFAULT_CATALOG,

  MyTextField: {
    type: () => import('./components/MyTextField.vue').then((m) => m.default),
    props: (node) => ({
      value: (node.properties as any).value ?? null,
      label: (node.properties as any).label,
      variant: (node.properties as any).variant,
      validationRegexp: (node.properties as any).validationRegexp,
    }),
  },
}
```

The field mapping matches the built-in `TextField` entry (see `packages/vue-renderer/src/catalog/default.ts`), ensuring Agent-sent `value`, `label`, `variant`, and other properties reach the component correctly.

---

## 3. App Entry

```ts
import { createApp } from 'vue'
import { provideA2UI, defaultTheme } from 'a2ui-vue'
import App from './App.vue'
import { myCatalog } from './catalog'

const app = createApp(App)
provideA2UI({ app, catalog: myCatalog, theme: defaultTheme })
app.mount('#app')
```

---

## 4. Agent JSON Example

```json
{
  "id": "field-name",
  "component": "MyTextField",
  "label": "Full Name",
  "value": { "path": "/form/name" },
  "checks": [
    {
      "condition": {
        "call": "required",
        "args": { "value": { "path": "/form/name" } },
        "returnType": "boolean"
      },
      "message": "Name is required"
    }
  ]
}
```

On user input, `handleInput` calls `bound.value.setValue`, syncing the data model at `/form/name`. `checks` re-evaluate reactively and errors surface through `validationErrors`.

---

[← Back to Custom Components overview](/en/v0.9/guide/custom-components/)
