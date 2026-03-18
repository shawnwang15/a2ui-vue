<script setup>
const galleryDemo = {
  type: 'Column',
  id: 'gallery-demo-root',
  properties: {
    children: [
      {
        type: 'Text',
        id: 'gallery-demo-heading',
        properties: { text: { literal: 'A2UI 组件总览' }, usageHint: 'h3' }
      },
      {
        type: 'Row',
        id: 'gallery-demo-row',
        properties: {
          children: [
            {
              type: 'Card',
              id: 'gallery-card-layout',
              weight: 1,
              properties: {
                children: [
                  { type: 'Text', id: 'gcl-title', properties: { text: { literal: '📐 布局组件' }, usageHint: 'h4' } },
                  { type: 'Divider', id: 'gcl-div', properties: {} },
                  { type: 'Text', id: 'gcl-body', properties: { text: { literal: 'Card · Row · Column · List · Tabs · Modal · Divider' }, usageHint: 'body' } }
                ]
              }
            },
            {
              type: 'Card',
              id: 'gallery-card-media',
              weight: 1,
              properties: {
                children: [
                  { type: 'Text', id: 'gcm-title', properties: { text: { literal: '🖼 媒体组件' }, usageHint: 'h4' } },
                  { type: 'Divider', id: 'gcm-div', properties: {} },
                  { type: 'Text', id: 'gcm-body', properties: { text: { literal: 'Image · Video · AudioPlayer · Icon' }, usageHint: 'body' } }
                ]
              }
            },
            {
              type: 'Card',
              id: 'gallery-card-input',
              weight: 1,
              properties: {
                children: [
                  { type: 'Text', id: 'gci-title', properties: { text: { literal: '✏️ 输入组件' }, usageHint: 'h4' } },
                  { type: 'Divider', id: 'gci-div', properties: {} },
                  { type: 'Text', id: 'gci-body', properties: { text: { literal: 'Button · TextField · CheckBox · Slider · DateTimeInput · MultipleChoice' }, usageHint: 'body' } }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
</script>

# 示例：组件画廊

**Component Gallery** 是一个静态的非 LLM Agent，无需配置 API Key 即可运行。  
它展示了 `a2ui-vue` 全部内置组件的外观与交互效果，是了解 A2UI 组件体系的最佳起点。

## 效果预览

<A2UIDemoBlock :component="galleryDemo" />

## 视频演示

<div class="video-placeholder">
    <video controls autoplay src="./videos/gallery.mp4"></video>
</div>

## 功能特性

- **Library 视图**：按分类浏览所有 A2UI 组件（布局 / 媒体 / 输入）
- **Gallery 视图**：多组件组合展示，呈现真实 UI 场景
- **交互预览**：点击任意组件可查看对应的 JSON 配置

## 目录结构

```
samples/
├── agent/component_gallery/    # Agent 端（端口 10005）
│   ├── package.json
│   ├── src/
│   └── ...
└── client/gallery/             # Vue 前端（端口 4000）
    ├── package.json
    ├── src/
    │   ├── App.vue
    │   └── ...
    └── ...
```

## 启动方式

### 从根目录一键启动

```bash
# 在项目根目录（pnpm workspace）
pnpm install
pnpm run build:lib
pnpm run dev:gallery
```

## 组件分类展示

### 布局类
Card · Column · Divider · List · Modal · Row · Tabs · Text

### 媒体类
AudioPlayer · Icon · Image · Video

### 输入类
Button · CheckBox · DateTimeInput · MultipleChoice · Slider · TextField

---

> 完整组件 API 参见 [组件参考](/guide/components)。
