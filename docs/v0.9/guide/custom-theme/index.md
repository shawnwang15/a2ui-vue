---
description: "如何基于 defaultTheme 自定义 a2ui-vue 主题颜色：A2UITheme 字段、色板 CSS 变量、additionalStyles 覆盖，以及可交互效果预览。"
---

# 自定义主题

主题负责控制颜色、字体等设计 Token。`provideA2UI` 的 `theme` 需要传入完整的 **`A2UITheme`**，而不是 `{ primaryColor, backgroundColor }` 这类扁平色值对象：

```ts
export interface A2UITheme {
  additionalStyles?: Record<string, any>  // 按组件名挂内联样式 / CSS 变量覆盖
  components: Record<string, any>         // utility class 映射（含 color-*）
  elements?: Record<string, any>          // 原生 HTML 元素 class
  markdown?: Record<string, string[]>
}
```

内置实现通过 `defaultTheme` 导出，可直接传入或在其基础上浅合并覆盖。

## 效果预览

下面是 `theme-example.json` 消息流经 `<A2UISurface>`、并以 `customTheme` 注入后的实时效果：

<ThemeCustomDemo />

## 改色的三条路径

```
宿主 CSS: --p-* / --n-*
        → components 里的 color-* class（如 color-bgc-p30）

theme.additionalStyles
        → 组件 :style 内联覆盖（Button 渐变、Text 标题色等）

createSurface.theme.primaryColor（协议层）
        → Surface 根节点动态生成 --p-* 色阶
```

### 1. 宿主色板 CSS 变量（改全局主色最有效）

utility class（如 `color-bgc-p30`）最终解析为 `background-color: var(--p-30)`。在入口 CSS 定义色板：

```css
:root {
  --n-100: #ffffff;
  --n-10: #1b1b1b;
  --n-0: #000000;
  --p-100: #ffffff;
  --p-60: #8487ea;
  --p-50: #6a6dcd;
  --p-40: #5154b3;
  --p-30: #383b99;
  --p-10: #06006c;
  --p-0: #000000;
}
```

完整色板可参考 [`samples/client/gallery/src/styles.css`](https://github.com/shawnwang15/a2ui-vue/blob/main/samples/client/gallery/src/styles.css)。

### 2. `theme.additionalStyles`（改单个组件外观）

默认主题已在 `additionalStyles.Button` / `Text` / `Card` 等字段写了渐变与阴影。覆盖这些字段即可改变「默认主题的颜色感」：

```ts
import { createApp } from 'vue'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import type { A2UITheme } from 'a2ui-vue'
import App from './App.vue'
import 'a2ui-vue/dist/a2ui-vue.css'
import './a2ui-palette.css'

const customTheme: A2UITheme = {
  ...defaultTheme,
  additionalStyles: {
    ...defaultTheme.additionalStyles,
    Button: {
      ...defaultTheme.additionalStyles?.Button,
      background: 'linear-gradient(135deg, #e11d48 0%, #f97316 100%)',
      boxShadow: '0 4px 15px rgba(225, 29, 72, 0.35)',
      '--p-30': '#e11d48',
    },
    Text: {
      ...defaultTheme.additionalStyles?.Text,
      h1: {
        color: 'transparent',
        background: 'linear-gradient(135deg, #e11d48 0%, #f97316 100%)',
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
      },
      h3: { color: '#e11d48' },
    },
    Card: {
      background:
        'radial-gradient(circle at top left, rgba(225, 29, 72, 0.12), transparent 40%), linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 247, 237, 0.9))',
    },
  },
}

const app = createApp(App)
provideA2UI({ app, catalog: DEFAULT_CATALOG, theme: customTheme })
app.mount('#app')
```

完整文件见 [`packages/vue-renderer/src/examples/customTheme.ts`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/customTheme.ts)。

### 3. `theme.components.*.color-*`（换用哪一级 Token）

例如把 Button 的 `'color-bgc-p30': true` 改成 `'color-bgc-s30': true`，或调整 Text 的 `'color-c-n10'`，从而切换组件绑定的色板台阶。

## 与协议层 `createSurface.theme` 的区别

| 层级 | 入口 | 作用 |
|------|------|------|
| 应用主题 | `provideA2UI({ theme })` | 全应用的 `A2UITheme`：utility class + `additionalStyles` |
| Surface 主题 | `createSurface.theme.primaryColor` / `font` | 由 `<A2UISurface>` 在根节点生成 `--p-*`、`--font-family` |

两者可叠加：应用主题决定组件如何映射 Token，Surface 主题可在单个 Surface 上覆盖主色色阶。

完整讲解、双色对比预览与 examples 对齐的 JSON，见 **[协议层主题](/v0.9/guide/custom-theme/surface-theme)**。

## 在 examples 中体验

```bash
cd packages/vue-renderer
npm run dev
```

- **Custom Theme** — 应用级 `customTheme.ts`
- **Surface Theme** — 协议层 `createSurface.theme`

或把 `main.ts` 里的 `theme` 换成 `customTheme` 即可全局生效：

```ts
import { customTheme } from './customTheme'

provideA2UI({
  app,
  catalog: DEFAULT_CATALOG,
  theme: customTheme,
})
```

::: tip 文字要正确显示
Button / Theme 等示例必须使用 v0.9 消息流（`createSurface` + `updateComponents` + `processMessages`），再经 `A2UISurface` 渲染。直接把组件树传给 `A2UiRenderer` 且没有对应 Surface 时，binder 无法解析 Text，按钮上会看不到文字。
:::

## 相关文档

- [协议层主题](/v0.9/guide/custom-theme/surface-theme) — `createSurface.theme` 与双色预览
- [核心概念 · 主题](/v0.9/guide/vue-renderer#主题-theme) — `A2UITheme` 接口速览
- [自定义组件](/v0.9/guide/custom-components/) — 扩展 Catalog 组件类型
- [组件列表示例](/v0.9/samples/component-list/) — 色板与 `provideA2UI` 最小复现
