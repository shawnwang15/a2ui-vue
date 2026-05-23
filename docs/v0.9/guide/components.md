---
description: "a2ui-vue(A2UI、a2ui) 内置 20+ 个 Vue 3 组件参考文档，涵盖布局（Card、Tabs、Accordion）、内容（Text、Table、List）、媒体与输入类组件。"
---

# 组件参考

`a2ui-vue` 内置了 20+ 个组件，覆盖布局、内容、媒体与输入四大类别。  
所有组件均可通过 A2UI JSON 消息驱动，也可直接作为 Vue 组件导入使用。

---

## 布局组件

### A2UICard

卡片容器，是最常见的内容承载单元。

```json
{
  "type": "card",
  "title": "卡片标题",
  "subtitle": "副标题（可选）",
  "body": []
}
```

---

### A2UIRow / A2UIColumn

水平 / 垂直布局容器，支持 `gap`、`align`、`justify` 等布局属性。

```json
{ "type": "row", "items": [...] }
{ "type": "column", "items": [...] }
```

---

### A2UIList

列表容器，将子项垂直排列并可添加分隔线。

```json
{
  "type": "list",
  "items": [
    { "type": "text", "content": "列表项 1" },
    { "type": "text", "content": "列表项 2" }
  ]
}
```

---

### A2UITabs

选项卡容器，支持多标签页切换。

```json
{
  "type": "tabs",
  "tabs": [
    { "label": "概览", "content": [...] },
    { "label": "详情", "content": [...] }
  ]
}
```

---

### A2UIModal

模态对话框，通过事件触发显示。

```json
{
  "type": "modal",
  "title": "确认操作",
  "trigger": { "type": "button", "label": "打开" },
  "content": [...]
}
```

---

## 内容组件

### A2UIText

文本组件，支持 Markdown 渲染。

```json
{ "type": "text", "content": "**粗体** 和 _斜体_ 都可以" }
```

---

### A2UIImage

图片组件。

```json
{
  "type": "image",
  "src": "https://example.com/photo.jpg",
  "alt": "示例图片",
  "width": 400
}
```

---

### A2UIIcon

图标组件（基于内置图标集）。

```json
{ "type": "icon", "name": "star", "size": 24, "color": "#f59e0b" }
```

---

### A2UIDivider

分割线。

```json
{ "type": "divider" }
```

---

## 媒体组件

### A2UIVideo

视频播放器。

```json
{
  "type": "video",
  "src": "https://example.com/video.mp4",
  "poster": "https://example.com/thumb.jpg",
  "controls": true
}
```

---

### A2UIAudio

音频播放器。

```json
{
  "type": "audio",
  "src": "https://example.com/audio.mp3",
  "controls": true
}
```

---

## 输入组件

所有输入组件均会触发 `action` 事件，将用户输入回传给 Agent。

### A2UIButton

```json
{
  "type": "button",
  "label": "点击我",
  "variant": "primary",
  "action": { "type": "click", "payload": { "value": "confirm" } }
}
```

---

### A2UITextField

单行 / 多行文本输入。

```json
{
  "type": "text_field",
  "label": "搜索",
  "placeholder": "请输入关键词...",
  "multiline": false
}
```

---

### A2UICheckbox

复选框。

```json
{
  "type": "checkbox",
  "label": "同意用户协议",
  "checked": false
}
```

---

### A2UISlider

滑块输入。

```json
{
  "type": "slider",
  "label": "评分",
  "min": 0,
  "max": 10,
  "step": 1,
  "value": 5
}
```

---

### A2UIMultipleChoice

单选 / 多选组。

```json
{
  "type": "multiple_choice",
  "label": "选择口味",
  "options": ["辣", "微辣", "不辣"],
  "multiple": false
}
```

---

### A2UIDateTimeInput

日期时间选择器。

```json
{
  "type": "datetime_input",
  "label": "预约时间",
  "mode": "datetime"
}
```

---

## 导航组件

### A2UISurface

Surface 是顶层渲染容器，通常不直接在 JSON 中声明，而是由 `useMessageProcessor` 根据 `surface_id` 自动创建。

```vue
<A2UISurface
  :surface-id="id"
  :surface="surface"
/>
```

---

## 组件汇总

| 类别   | 组件名称                                                                                          |
|------|-------------------------------------------------------------------------------------------------|
| 布局   | `A2UICard` · `A2UIRow` · `A2UIColumn` · `A2UIList` · `A2UITabs` · `A2UIModal`                |
| 内容   | `A2UIText` · `A2UIImage` · `A2UIIcon` · `A2UIDivider`                                         |
| 媒体   | `A2UIVideo` · `A2UIAudio`                                                                      |
| 输入   | `A2UIButton` · `A2UITextField` · `A2UICheckbox` · `A2UISlider` · `A2UIMultipleChoice` · `A2UIDateTimeInput` |
| 核心   | `A2UISurface` · `A2UiRenderer`                                                                  |
