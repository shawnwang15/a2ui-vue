---
description: A2UI v0.8 快速上手指南。
---

# 快速上手 (v0.8)

::: warning 版本提示
此文档对应 A2UI 协议 **v0.8** 版本。最新版本请参阅 [v0.9 文档](/v0.9/guide/getting-started)。
:::

## 安装

```bash
npm install a2ui-vue@0.8
```

## 基础用法

### 1. 提供配置

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

### 2. 处理消息

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

### 3. 渲染 Surface

```vue
<template>
  <A2UISurface
    v-for="[surfaceId] in surfaces"
    :key="surfaceId"
    :surface-id="surfaceId"
  />
</template>
```

## 下一步

- 查看 [v0.8 组件参考](/v0.8/guide/components)
- 升级至 [v0.9](/v0.9/guide/getting-started) 获取最新功能
