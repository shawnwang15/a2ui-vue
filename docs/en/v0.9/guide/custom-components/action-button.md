---
description: "Custom action button example: useDynamicComponent, bound.action, child rendering, and Catalog registration."
---

# Action Component Example (Button)

This example shows how to implement a custom action button, following the logic of the built-in `A2UIButton.vue`: read the wrapped `action` callback from `bound`, apply styles via `theme`, disable interaction when `checks` fail, and render child nodes through `A2UiRenderer`.

---

## 1. Vue Component

`src/components/MyActionButton.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useDynamicComponent, A2UiRenderer, type VueComponentNode } from 'a2ui-vue'

const props = defineProps<{
  surfaceId: string | null
  component: VueComponentNode
  weight: string | number
  action: unknown
  variant?: string
}>()

const { theme, bound } = useDynamicComponent(props)

// Button's child is STATIC — the processor expands it into a renderable node
const child = computed<VueComponentNode | null>(
  () => ((props.component.properties as any).child as VueComponentNode) ?? null,
)

const isInvalid = computed(() => bound.value.isValid === false)
const validationErrors = computed<string[]>(() => bound.value.validationErrors ?? [])

function handleClick() {
  if (isInvalid.value) return
  const action = bound.value.action
  if (typeof action === 'function') action()
}
</script>

<template>
  <a2ui-button>
    <button
      :class="[theme.components.Button, { 'a2ui-invalid': isInvalid }]"
      :style="theme.additionalStyles?.Button"
      :disabled="isInvalid"
      :aria-invalid="isInvalid"
      @click="handleClick"
    >
      <A2UiRenderer
        v-if="child"
        :surface-id="surfaceId!"
        :component="child"
      />
    </button>
    <p v-if="validationErrors.length" class="a2ui-field-error" role="alert">
      <span>{{ validationErrors.join(', ') }}</span>
    </p>
  </a2ui-button>
</template>

<style scoped>
a2ui-button {
  display: block;
  flex: v-bind(weight);
  min-height: 0;
}

button.a2ui-invalid {
  cursor: not-allowed;
  opacity: 0.65;
}

.a2ui-field-error {
  margin: 6px 0 0;
  color: #d92d20;
  font-size: 0.75rem;
}
</style>
```

---

## 2. Catalog Registration

Register the type name `MyActionButton` in `src/catalog.ts` (must match the `component` field in Agent JSON):

```ts
import type { Catalog } from 'a2ui-vue'
import { DEFAULT_CATALOG } from 'a2ui-vue'

export const myCatalog: Catalog = {
  ...DEFAULT_CATALOG,

  MyActionButton: {
    type: () => import('./components/MyActionButton.vue').then((m) => m.default),
    props: (node) => ({
      action: (node.properties as any).action,
      variant: (node.properties as any).variant,
    }),
  },
}
```

The `props` function extracts fields from `node.properties` and passes them to the Vue component. `surfaceId`, `component`, and `weight` are injected automatically by `A2UiRenderer` — no need to declare them here.

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
  "id": "submit-btn",
  "component": "MyActionButton",
  "variant": "primary",
  "checks": [
    {
      "condition": {
        "call": "required",
        "args": { "value": { "path": "/form/name" } },
        "returnType": "boolean"
      },
      "message": "Name is required"
    }
  ],
  "action": {
    "event": {
      "name": "submit_form",
      "context": { "name": { "path": "/form/name" } }
    }
  },
  "child": "btn-label"
}
```

When all `checks` pass, clicking the button calls `bound.value.action()`, and `processor.onEvent` receives the `submit_form` event.

---

[← Back to Custom Components overview](/en/v0.9/guide/custom-components/)
