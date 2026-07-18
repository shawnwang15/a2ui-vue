---
description: "How to customize a2ui-vue theme colors from defaultTheme: A2UITheme fields, palette CSS variables, additionalStyles overrides, and a live preview."
---

# Custom Theme

The theme controls design tokens such as colors and fonts. The `theme` argument of `provideA2UI` must be a full **`A2UITheme`**, not a flat object like `{ primaryColor, backgroundColor }`:

```ts
export interface A2UITheme {
  additionalStyles?: Record<string, any>  // per-component inline styles / CSS variable overrides
  components: Record<string, any>         // utility class maps (including color-*)
  elements?: Record<string, any>          // native HTML element classes
  markdown?: Record<string, string[]>
}
```

The built-in implementation is exported as `defaultTheme`. Pass it as-is, or shallow-merge overrides on top of it.

## Live Preview

Below is the live result of the `theme-example.json` message stream rendered through `<A2UISurface>` with `customTheme` injected:

<ThemeCustomDemo />

## Three Ways to Change Colors

```
Host CSS: --p-* / --n-*
        → color-* classes in components (e.g. color-bgc-p30)

theme.additionalStyles
        → inline :style overrides (Button gradients, Text heading colors, …)

createSurface.theme.primaryColor (protocol layer)
        → Surface root generates a --p-* ramp
```

### 1. Host palette CSS variables (best for global primary color)

Utility classes such as `color-bgc-p30` resolve to `background-color: var(--p-30)`. Define the palette in your entry CSS:

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

See the full palette in [`samples/client/gallery/src/styles.css`](https://github.com/shawnwang15/a2ui-vue/blob/main/samples/client/gallery/src/styles.css).

### 2. `theme.additionalStyles` (per-component look)

The default theme already sets gradients and shadows on `additionalStyles.Button` / `Text` / `Card`. Override those fields to change the default look:

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

Full example: [`packages/vue-renderer/src/examples/customTheme.ts`](https://github.com/shawnwang15/a2ui-vue/blob/main/packages/vue-renderer/src/examples/customTheme.ts).

### 3. `theme.components.*.color-*` (which token step to use)

For example, change Button’s `'color-bgc-p30': true` to `'color-bgc-s30': true`, or adjust Text’s `'color-c-n10'`, to bind a different palette step.

## vs Protocol `createSurface.theme`

| Layer | Entry | Role |
|-------|--------|------|
| App theme | `provideA2UI({ theme })` | App-wide `A2UITheme`: utility classes + `additionalStyles` |
| Surface theme | `createSurface.theme.primaryColor` / `font` | `<A2UISurface>` sets `--p-*` and `--font-family` on the root |

They can stack: the app theme maps components to tokens; the Surface theme can override the primary ramp for one surface.

Full guide, dual-color live preview, and examples-aligned JSON: **[Protocol Theme](/en/v0.9/guide/custom-theme/surface-theme)**.

## Try It in Examples

```bash
cd packages/vue-renderer
npm run dev
```

- **Custom Theme** — app-level `customTheme.ts`
- **Surface Theme** — protocol `createSurface.theme`

Or swap `theme` in `main.ts` for a global custom theme:

```ts
import { customTheme } from './customTheme'

provideA2UI({
  app,
  catalog: DEFAULT_CATALOG,
  theme: customTheme,
})
```

::: tip Text must resolve correctly
Button / Theme examples must use the v0.9 message stream (`createSurface` + `updateComponents` + `processMessages`) and render via `A2UISurface`. Passing a component tree directly to `A2UiRenderer` without a matching Surface leaves the binder unable to resolve Text, so button labels appear empty.
:::

## Related

- [Protocol Theme](/en/v0.9/guide/custom-theme/surface-theme) — `createSurface.theme` and dual-color preview
- [Core Concepts · Theme](/en/v0.9/guide/vue-renderer#theme) — `A2UITheme` overview
- [Custom Components](/en/v0.9/guide/custom-components/) — extend Catalog component types
- [Component List sample](/en/v0.9/samples/component-list/) — minimal palette + `provideA2UI` setup
