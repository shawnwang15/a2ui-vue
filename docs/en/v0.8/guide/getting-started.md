---
description: A2UI v0.8 Quick Start guide.
---

# Quick Start (v0.8)

::: warning Version Notice
This documentation is for A2UI protocol **v0.8**. For the latest version, see [v0.9 docs](/en/v0.9/guide/getting-started).
:::

## Installation

```bash
npm install a2ui-vue@0.8
```

## Basic Usage

### 1. Provide Configuration

```vue
<script setup lang="ts">
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import 'a2ui-vue/dist/a2ui-vue.css'

provideA2UI({
  catalog: DEFAULT_CATALOG,
  theme: defaultTheme,
})
</script>
```

### 2. Process Messages

```vue
<script setup lang="ts">
import { useMessageProcessor } from 'a2ui-vue'

const processor = useMessageProcessor()

function onAgentMessage(rawPayload: unknown) {
  processor.processMessages(rawPayload)
}

const surfaces = processor.getSurfaces()
</script>
```

### 3. Render Surfaces

```vue
<template>
  <A2UISurface
    v-for="[surfaceId] in surfaces"
    :key="surfaceId"
    :surface-id="surfaceId"
  />
</template>
```

## Next Steps

- Browse [v0.8 Component Reference](/en/v0.8/guide/components)
- Upgrade to [v0.9](/en/v0.9/guide/getting-started) for latest features
