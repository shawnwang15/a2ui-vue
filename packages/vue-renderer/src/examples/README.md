# A2UI Vue Components Examples

这个目录包含了 A2UI Vue 核心组件的交互式示例。

## 快速开始

在 `packages/vue-renderer` 目录下运行：

```bash
# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

这将启动 Vite 开发服务器，自动在浏览器中打开示例页面（默认地址：http://localhost:5173）。

## 构建示例

如果需要构建examples用于部署：

```bash
npm run build:examples
```

构建后的文件将输出到 `dist-examples` 目录。

## 预览构建后的示例

```bash
npm run preview:examples
```

## 可用的组件示例

示例页面包含以下 A2UI 组件的交互式演示：

- **Text** - 文本显示组件，支持不同样式和Markdown
- **Button** - 可点击的按钮组件（`button-example.json` → `processMessages` + `A2UISurface`）
- **Card** - 卡片容器组件
- **Row** - 水平布局容器
- **Column** - 垂直布局容器
- **List** - 列表组件
- **Divider** - 分割线
- **Custom Theme** - 应用级主题改色（`theme-example.json` + `customTheme.ts`）
- **Surface Theme** - 协议层主题（`surface-theme-example.json` 的 `createSurface.theme`）

## 自定义主题颜色

### 应用级（provideA2UI）

`provideA2UI` 的 `theme` 需要传入完整的 `A2UITheme`（不是扁平的 `primaryColor` 对象）。

1. 在 `style.css`（或宿主应用）中定义 `--p-*` / `--n-*` 色板
2. 参考 [`customTheme.ts`](./customTheme.ts)：spread `defaultTheme`，覆盖 `additionalStyles.Button` / `Text` / `Card` 等
3. 全局生效时，在 `main.ts` 中替换主题：

```ts
import { customTheme } from './customTheme'

provideA2UI({
  app,
  catalog: DEFAULT_CATALOG,
  theme: customTheme, // 替换默认 theme
})
```

### 协议层（createSurface.theme）

在消息流里为单个 Surface 指定 `primaryColor` / `font`，由 `A2UISurface` 生成 `--p-*` 色阶。见 [`surface-theme-example.json`](./public/surface-theme-example.json) 与导航中的 **Surface Theme**。

Button / Theme / Surface Theme 示例使用 v0.9 消息流（`createSurface` + `updateComponents`），经 `processMessages` 后由 `A2UISurface` 渲染，这样 Text/Button 上的文字才能被 binder 正确解析。

## 项目结构

```
src/examples/
├── index.html          # HTML入口文件
├── main.ts            # TypeScript入口（provideA2UI + theme）
├── App.vue            # 主应用组件（包含导航）
├── style.css          # 全局样式 + A2UI 色板变量
├── customTheme.ts     # 自定义主题示例（可替换进 provideA2UI）
├── public/
│   ├── button-example.json
│   ├── theme-example.json
│   ├── surface-theme-example.json
│   ├── contact-card.json
│   └── component-gallery.json
└── components/        # 各组件示例
    ├── TextExample.vue
    ├── ButtonExample.vue
    ├── CardExample.vue
    ├── ThemeExample.vue
    ├── SurfaceThemeExample.vue
    └── ...
```

## 开发说明

- 每个组件示例都是独立的 Vue 组件
- 可以通过顶部导航切换查看不同组件的示例
- 选择 "All Examples" 可以查看所有组件的示例
- 「Custom Theme」页演示改色写法；默认仍使用包内 `theme`，避免影响其它示例外观
- 所有交互式组件（如输入框、滑块等）都是实时响应的

## 构建库文件

如果需要构建 A2UI Vue 库本身（而不是示例）：

```bash
npm run build
```

这将在 `dist` 目录中生成库文件。
