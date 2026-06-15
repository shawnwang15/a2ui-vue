---
description: "Implement and register custom Catalog components in a2ui-vue using useDynamicComponent for theming, data binding, and action dispatch."
---

# Custom Components

After registering a type name in the [Catalog (component registry)](/en/v0.9/guide/vue-renderer#catalog-component-registry), you still need to implement the corresponding Vue component. Every built-in component (e.g. `A2UIButton`, `A2UITextField`) wires into the rendering pipeline through the **`useDynamicComponent`** composable — it encapsulates theming, data binding, and action dispatch so you can focus on UI presentation.

This section provides two complete examples:

- [Action component (Button)](/en/v0.9/guide/custom-components/action-button) — trigger `action`, render child nodes, respond to `checks` validation
- [Input component (TextField)](/en/v0.9/guide/custom-components/text-field) — two-way data binding, `label` association, validation display

---

## useDynamicComponent

### Basic Usage

Every Catalog component should accept three **fixed props** (passed automatically by `A2UiRenderer`):

| Prop        | Type               | Description                                                       |
|-------------|--------------------|-------------------------------------------------------------------|
| `surfaceId` | `string \| null`   | The current Surface id — used to read/write the data model and dispatch actions |
| `component` | `VueComponentNode` | The current component node (`id`, `type`, `properties`, etc.)     |
| `weight`    | `string \| number` | Flex grow weight in layout containers — typically bound to CSS `flex` |

The Catalog entry's `props` function can extract additional props from `node.properties` (e.g. `label`, `variant`).

```ts
import { useDynamicComponent, type VueComponentNode } from 'a2ui-vue'

const props = defineProps<{
  surfaceId: string | null
  component: VueComponentNode
  weight: string | number
  // Passed by the Catalog props extractor
  action?: unknown
  variant?: string
}>()

const { theme, processor, bound, getUniqueId } = useDynamicComponent(props)
```

### Destructured Return Values

| Return value   | Type                           | Purpose                                                                 |
|----------------|--------------------------------|-------------------------------------------------------------------------|
| `theme`        | `A2UITheme`                    | The theme object injected via `provideA2UI`. Use `theme.components.Xxx` for CSS classes and `theme.additionalStyles?.Xxx` for inline styles to stay visually consistent with built-in components |
| `processor`    | `MessageProcessor`             | The message processor instance. Call `getData` / `setData` / `resolveValue` to read/write the data model, or `dispatch` to emit client actions. In most cases prefer the convenience fields on `bound` |
| `bound`        | `Ref<Record<string, any>>`     | A **reactive property snapshot** maintained by GenericBinder. Dynamic values (`{ path }`, function calls, etc.) are resolved to runtime values; `action` is wrapped as a `() => void` callback; data-bound props get matching `setXxx` writers; `checks` results surface as `isValid` and `validationErrors` |
| `getUniqueId`  | `(prefix: string) => string`   | Generates a page-unique DOM id (e.g. `a2ui-input-0`) for `<label for>` ↔ control `id` associations, supporting accessibility |


---

## Registering a Custom Catalog

When extending the default Catalog, each entry is a **loader function** (or an object with a `props` extractor). The key must match the `component` field in Agent messages:

```ts
// catalog.ts
import type { Catalog } from 'a2ui-vue'
import { DEFAULT_CATALOG } from 'a2ui-vue'

export const myCatalog: Catalog = {
  ...DEFAULT_CATALOG,

  // Action button: extract action / variant from node.properties
  MyActionButton: {
    type: () => import('./components/MyActionButton.vue').then((m) => m.default),
    props: (node) => ({
      action: (node.properties as any).action,
      variant: (node.properties as any).variant,
    }),
  },

  // Text input: extract value / label / variant from node.properties
  MyTextField: {
    type: () => import('./components/MyTextField.vue').then((m) => m.default),
    props: (node) => ({
      value: (node.properties as any).value ?? null,
      label: (node.properties as any).label,
      variant: (node.properties as any).variant,
    }),
  },
}
```

Inject at the app entry:

```ts
import { createApp } from 'vue'
import { provideA2UI, defaultTheme } from 'a2ui-vue'
import App from './App.vue'
import { myCatalog } from './catalog'

const app = createApp(App)

provideA2UI({
  app,
  catalog: myCatalog,
  theme: defaultTheme,
})

app.mount('#app')
```

On the Agent side, use the registered type name in `updateComponents` messages:

```json
{
  "component": "MyActionButton",
  "id": "submit-btn",
  "variant": "primary",
  "action": {
    "event": { "name": "submit_form", "context": {} }
  },
  "child": "btn-label"
}
```

::: tip Tip
When implementing custom components, read the built-in Catalog source as a reference: `packages/vue-renderer/src/catalog/A2UIButton.vue` (actions + child rendering) and `A2UITextField.vue` (two-way binding + validation display). If you customize the theme, add class mappings under `A2UITheme.components` for your component name.
:::
