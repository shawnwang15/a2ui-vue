---
description: "通过协议层 createSurface.theme（primaryColor / font）按 Surface 修改主题，含与 examples 一致的可交互双色对比预览。"
---

# 协议层主题（createSurface.theme）

除了在应用入口用 `provideA2UI({ theme })` 注入完整 [`A2UITheme`](/v0.9/guide/custom-theme/)，还可以在 **v0.9 消息流** 的 `createSurface` 里带上 `theme`，按 **单个 Surface** 覆盖主色与字体。

`<A2UISurface>` 会读取该字段，并在 Surface 根节点生成 CSS 变量：

| 字段 | 作用 |
|------|------|
| `primaryColor` | 生成整组 `--p-*` 色阶 |
| `font` | 设置 `--font-family` / `--font-family-flex` |

完整示例与 examples 工程中的 **Surface Theme** 一致，见 [`surface-theme-example.json`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/public/surface-theme-example.json)。

## 效果预览

下面左右两栏使用同一套组件树，仅 `createSurface.theme.primaryColor` / `font` 不同（玫瑰红 vs 蓝色）：

<SurfaceThemeDemo />

## 消息示例

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "example-surface-theme-rose",
    "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json",
    "theme": {
      "primaryColor": "#e11d48",
      "font": "Georgia, 'Times New Roman', serif"
    }
  }
}
```

随后用同一 `surfaceId` 发送 `updateComponents` / `updateDataModel` 即可。文档预览与 examples 会并排创建第二个 Surface（`primaryColor: "#2563eb"`）做对比。

## 与应用级主题的关系

| 层级 | 入口 | 作用范围 |
|------|------|----------|
| 应用主题 | `provideA2UI({ theme })` | 全应用：utility class + `additionalStyles` |
| Surface 主题 | `createSurface.theme` | 单个 Surface 上的 `--p-*` / 字体 |

两者可叠加：应用主题决定组件如何映射 Token；协议层在该 Surface 上覆盖主色色阶。

::: tip Button 若看不出主色变化
默认主题把 `additionalStyles.Button.background` 写成了硬编码渐变，会盖住 `color-bgc-p30`（即 `var(--p-30)`）。要让 Button 跟随 `primaryColor`，可在应用主题中改为：

```ts
Button: {
  ...defaultTheme.additionalStyles?.Button,
  background: undefined,
}
```

上方预览与 examples 的 Surface Theme 页已按此方式处理。
:::

## 在 examples 中体验

```bash
cd packages/vue-renderer
npm run dev
```

打开导航中的 **Surface Theme**。实现参考：

- [`SurfaceThemeExample.vue`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/components/SurfaceThemeExample.vue)
- [`surface-theme-example.json`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/public/surface-theme-example.json)

## 相关文档

- [自定义主题（应用级）](/v0.9/guide/custom-theme/) — `A2UITheme` / `additionalStyles`
- [核心概念 · 主题](/v0.9/guide/vue-renderer#主题-theme)
