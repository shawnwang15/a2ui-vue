---
description: "自定义动作按钮组件示例：useDynamicComponent、bound.action、子节点渲染与 Catalog 注册。"
---

# 动作组件示例（Button）

本示例演示如何实现一个自定义动作按钮，逻辑参考内置 `A2UIButton.vue`：从 `bound` 读取已包装的 `action` 回调，用 `theme` 应用样式，在 `checks` 未通过时禁用点击，并通过 `A2UiRenderer` 渲染子节点。

---

## 1. Vue 组件

`src/components/MyActionButton.vue`：

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

// Button 的 child 是 STATIC 类型，processor 会将其展开为可渲染子节点
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
      <span>{{ validationErrors.join('，') }}</span>
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

## 2. Catalog 注册

在 `src/catalog.ts` 中注册组件类型名 `MyActionButton`（需与 Agent JSON 中的 `component` 字段一致）：

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

`props` 函数从 `node.properties` 提取字段并传给 Vue 组件。`surfaceId`、`component`、`weight` 由 `A2UiRenderer` 自动注入，无需在此声明。

---

## 3. 应用入口

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

## 4. Agent JSON 示例

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

当 `checks` 全部通过时，用户点击按钮会触发 `bound.value.action()`，最终由 `processor.onEvent` 收到 `submit_form` 事件。

---

[← 返回自定义组件概述](/v0.9/guide/custom-components/)
