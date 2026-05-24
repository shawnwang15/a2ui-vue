---
description: A2UI v0.8 Component Reference.
---

# Component Reference (v0.8)

::: warning Version Notice
This documentation is for A2UI protocol **v0.8**. For the latest version, see [v0.9 docs](/en/v0.9/guide/components).
:::

## Component List

v0.8 supports the following components:

| Category | Components |
|----------|-----------|
| Layout | `Card` · `Row` · `Column` · `List` · `Tabs` |
| Content | `Text` · `Image` · `Icon` · `Divider` |
| Media | `Video` · `Audio` |
| Input | `Button` · `TextField` · `Checkbox` · `Slider` · `MultipleChoice` |

## Message Format (v0.8)

v0.8 uses the `type` field to identify component types:

```json
{
  "surface_id": "main",
  "content": [
    {
      "type": "card",
      "title": "Example Card",
      "body": [
        { "type": "text", "content": "Hello from v0.8!" }
      ]
    }
  ]
}
```

> For the full component API and latest updates, see [v0.9 Component Reference](/en/v0.9/guide/components).
