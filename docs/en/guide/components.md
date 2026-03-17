# Component Reference

`a2ui-vue` comes with 20+ built-in components covering four categories: layout, content, media, and input.  
All components can be driven by A2UI JSON messages or imported directly as Vue components.

---

## Layout Components

### A2UICard

A card container — the most common content-bearing unit.

```json
{
  "type": "card",
  "title": "Card Title",
  "subtitle": "Subtitle (optional)",
  "body": []
}
```

---

### A2UIRow / A2UIColumn

Horizontal / vertical layout containers supporting `gap`, `align`, `justify`, and other layout properties.

```json
{ "type": "row", "items": [...] }
{ "type": "column", "items": [...] }
```

---

### A2UIList

A list container that arranges child items vertically with optional dividers.

```json
{
  "type": "list",
  "items": [
    { "type": "text", "content": "Item 1" },
    { "type": "text", "content": "Item 2" }
  ]
}
```

---

### A2UITabs

A tabbed container supporting multiple tab switching.

```json
{
  "type": "tabs",
  "tabs": [
    { "label": "Overview", "content": [...] },
    { "label": "Details", "content": [...] }
  ]
}
```

---

### A2UIModal

A modal dialog triggered by events.

```json
{
  "type": "modal",
  "title": "Confirm Action",
  "trigger": { "type": "button", "label": "Open" },
  "content": [...]
}
```

---

## Content Components

### A2UIText

Text component with Markdown rendering support.

```json
{ "type": "text", "content": "**Bold** and _italic_ both work" }
```

---

### A2UIImage

Image component.

```json
{
  "type": "image",
  "src": "https://example.com/photo.jpg",
  "alt": "Sample image",
  "width": 400
}
```

---

### A2UIIcon

Icon component (based on built-in icon set).

```json
{ "type": "icon", "name": "star", "size": 24, "color": "#f59e0b" }
```

---

### A2UIDivider

Divider line.

```json
{ "type": "divider" }
```

---

## Media Components

### A2UIVideo

Video player.

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

Audio player.

```json
{
  "type": "audio",
  "src": "https://example.com/audio.mp3",
  "controls": true
}
```

---

## Input Components

All input components emit `action` events that send user input back to the Agent.

### A2UIButton

```json
{
  "type": "button",
  "label": "Click Me",
  "variant": "primary",
  "action": { "type": "click", "payload": { "value": "confirm" } }
}
```

---

### A2UITextField

Single-line / multi-line text input.

```json
{
  "type": "text_field",
  "label": "Search",
  "placeholder": "Enter keywords...",
  "multiline": false
}
```

---

### A2UICheckbox

Checkbox.

```json
{
  "type": "checkbox",
  "label": "Agree to Terms of Service",
  "checked": false
}
```

---

### A2UISlider

Slider input.

```json
{
  "type": "slider",
  "label": "Rating",
  "min": 0,
  "max": 10,
  "step": 1,
  "value": 5
}
```

---

### A2UIMultipleChoice

Single or multiple choice group.

```json
{
  "type": "multiple_choice",
  "label": "Choose spice level",
  "options": ["Spicy", "Mild", "Not spicy"],
  "multiple": false
}
```

---

### A2UIDateTimeInput

Date and time picker.

```json
{
  "type": "datetime_input",
  "label": "Appointment time",
  "mode": "datetime"
}
```

---

## Navigation Components

### A2UISurface

Surface is the top-level rendering container. It is typically not declared directly in JSON — `useMessageProcessor` creates it automatically based on `surface_id`.

```vue
<A2UISurface
  :surface-id="id"
  :surface="surface"
/>
```

---

## Component Summary

| Category | Component Names                                                                                          |
|------|-------------------------------------------------------------------------------------------------|
| Layout   | `A2UICard` · `A2UIRow` · `A2UIColumn` · `A2UIList` · `A2UITabs` · `A2UIModal`                |
| Content  | `A2UIText` · `A2UIImage` · `A2UIIcon` · `A2UIDivider`                                         |
| Media    | `A2UIVideo` · `A2UIAudio`                                                                      |
| Input    | `A2UIButton` · `A2UITextField` · `A2UICheckbox` · `A2UISlider` · `A2UIMultipleChoice` · `A2UIDateTimeInput` |
| Core     | `A2UISurface` · `A2UiRenderer`                                                                  |
