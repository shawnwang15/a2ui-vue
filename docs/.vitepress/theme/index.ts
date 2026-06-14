// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import './a2ui-demo-surface.css'
import Demo from 'vitepress-theme-demoblock/dist/client/components/Demo.vue'
import DemoBlock from 'vitepress-theme-demoblock/dist/client/components/DemoBlock.vue'
import 'vitepress-theme-demoblock/dist/theme/styles/index.css'
import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
import ContactCardDemo from './components/ContactCardDemo.vue'
import ComponentGalleryDemo from './components/ComponentGalleryDemo.vue'
export default {
  extends: DefaultTheme,
  Layout: () => {
    return h('div', { class: 'theme-shell' }, [
      h('div', { class: 'theme-fx', 'aria-hidden': 'true' }, [
        h('div', { class: 'fx-grid' }),
        h('div', { class: 'fx-orb fx-orb-a' }),
        h('div', { class: 'fx-orb fx-orb-b' }),
        h('div', { class: 'fx-beam' }),
        h('div', { class: 'fx-stars' }, Array.from({ length: 18 }, (_, index) =>
          h('span', { class: `fx-star fx-star-${index + 1}` })
        )),
      ]),
      h(DefaultTheme.Layout, null, {}),
    ])
  },
  enhanceApp({ app }) {
    app.component('Demo', Demo)
    app.component('DemoBlock', DemoBlock)
    app.component('ContactCardDemo', ContactCardDemo)
    app.component('ComponentGalleryDemo', ComponentGalleryDemo)
    // Wire the A2UI runtime once for the whole docs app so embedded demos can
    // use `useMessageProcessor()` / `<A2UISurface>` with the default catalog
    // and theme (matching the examples app).
    app.runWithContext(() => {
      provideA2UI({ app, catalog: DEFAULT_CATALOG, theme: defaultTheme })
    })
  },
} satisfies Theme
