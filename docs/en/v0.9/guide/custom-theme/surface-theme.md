---
description: "Customize theme per Surface via protocol createSurface.theme (primaryColor / font), with a live dual-color preview matching the examples app."
---

# Protocol Theme (createSurface.theme)

Besides injecting a full [`A2UITheme`](/en/v0.9/guide/custom-theme/) with `provideA2UI({ theme })`, you can attach a `theme` object on the v0.9 **`createSurface`** message to override primary color and font for a **single Surface**.

`<A2UISurface>` reads that payload and sets CSS variables on the Surface root:

| Field | Effect |
|-------|--------|
| `primaryColor` | Builds a full `--p-*` ramp |
| `font` | Sets `--font-family` / `--font-family-flex` |

This matches the **Surface Theme** example in the examples app: [`surface-theme-example.json`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/public/surface-theme-example.json).

## Live Preview

The two panels share the same component tree and differ only in `createSurface.theme.primaryColor` / `font` (rose vs blue):

<SurfaceThemeDemo />

## Message Example

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

Follow up with `updateComponents` / `updateDataModel` on the same `surfaceId`. The preview (and the examples app) also create a second Surface with `primaryColor: "#2563eb"` for comparison.

## vs App-Level Theme

| Layer | Entry | Scope |
|-------|--------|--------|
| App theme | `provideA2UI({ theme })` | App-wide: utility classes + `additionalStyles` |
| Surface theme | `createSurface.theme` | `--p-*` / font on one Surface |

They can stack: the app theme maps components to tokens; the protocol theme overrides the primary ramp on that Surface.

::: tip If Button does not follow primaryColor
The default theme hardcodes `additionalStyles.Button.background` as a gradient, which overrides `color-bgc-p30` (`var(--p-30)`). To let Button pick up `primaryColor`, set:

```ts
Button: {
  ...defaultTheme.additionalStyles?.Button,
  background: undefined,
}
```

The preview above and the examples **Surface Theme** page already do this.
:::

## Try It in Examples

```bash
cd packages/vue-renderer
npm run dev
```

Open **Surface Theme** in the nav. Implementation:

- [`SurfaceThemeExample.vue`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/components/SurfaceThemeExample.vue)
- [`surface-theme-example.json`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/public/surface-theme-example.json)

## Related

- [Custom Theme (app-level)](/en/v0.9/guide/custom-theme/) — `A2UITheme` / `additionalStyles`
- [Core Concepts · Theme](/en/v0.9/guide/vue-renderer#theme)
