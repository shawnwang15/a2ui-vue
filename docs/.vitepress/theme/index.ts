// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'

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
} satisfies Theme
