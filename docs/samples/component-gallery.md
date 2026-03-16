# 示例：组件画廊

**Component Gallery** 是一个静态的非 LLM Agent，无需配置 API Key 即可运行。  
它展示了 `a2ui-vue` 全部内置组件的外观与交互效果，是了解 A2UI 组件体系的最佳起点。

## 视频演示

<div class="video-placeholder">
  <div class="video-placeholder-inner">
    <div class="video-placeholder-icon">🎬</div>
    <div class="video-placeholder-label">组件画廊 · 视频演示</div>
    <div class="video-placeholder-sublabel">即将上线，敬请期待</div>
  </div>
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

### 方式一：分步启动

**第一步：启动 Agent**

```bash
cd samples/agent/component_gallery
npm install
npm start
# Agent 在 http://localhost:10005 提供服务
# Agent Card: http://localhost:10005/.well-known/agent-card.json
```

**第二步：启动前端客户端**

```bash
cd samples/client/gallery
npm install
npm run dev
# 访问 http://localhost:4000
```

### 方式二：从根目录一键启动

```bash
# 在项目根目录（pnpm workspace）
pnpm install
pnpm run build:lib

# gallery 暂无根目录快捷脚本，请分步启动（见上）
```

## 环境变量

组件画廊 **不需要** LLM API Key，仅支持以下可选配置：

| 变量     | 默认值        | 说明         |
|--------|------------|------------|
| `HOST` | `localhost` | Agent 绑定地址 |
| `PORT` | `10005`     | Agent 监听端口 |

## 组件分类展示

### 布局类
Card · Column · Divider · List · Modal · Row · Tabs · Text

### 媒体类
AudioPlayer · Icon · Image · Video

### 输入类
Button · CheckBox · DateTimeInput · MultipleChoice · Slider · TextField

---

> 完整组件 API 参见 [组件参考](/guide/components)。
