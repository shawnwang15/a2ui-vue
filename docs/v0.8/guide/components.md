---
description: A2UI v0.8 组件参考文档。
---

# 组件参考 (v0.8)

::: warning 版本提示
此文档对应 A2UI 协议 **v0.8** 版本。最新版本请参阅 [v0.9 文档](/v0.9/guide/components)。
:::

## 组件列表

v0.8 版本支持以下组件：

| 类别 | 组件 |
|------|------|
| 布局 | `Card` · `Row` · `Column` · `List` · `Tabs` |
| 内容 | `Text` · `Image` · `Icon` · `Divider` |
| 媒体 | `Video` · `Audio` |
| 输入 | `Button` · `TextField` · `Checkbox` · `Slider` · `MultipleChoice` |

## 消息格式 (v0.8)

v0.8 使用 `type` 字段标识组件类型：

```json
{
  "surface_id": "main",
  "content": [
    {
      "type": "card",
      "title": "示例卡片",
      "body": [
        { "type": "text", "content": "Hello from v0.8!" }
      ]
    }
  ]
}
```

> 完整组件 API 和最新更新请参阅 [v0.9 组件参考](/v0.9/guide/components)。
