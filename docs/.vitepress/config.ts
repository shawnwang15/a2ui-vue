import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const vueRendererSrc = resolve(repoRoot, 'packages/vue-renderer/src')
const webCoreV08Src = resolve(repoRoot, 'packages/web_core/src/v0_8')

const viteConfig = {
  resolve: {
    alias: {
      '@': vueRendererSrc,
      '@a2ui/web_core/v0_8': resolve(webCoreV08Src, 'index.ts'),
      '@a2ui/web_core/types/types': resolve(webCoreV08Src, 'types/types.ts'),
      '@a2ui/web_core/types/primitives': resolve(webCoreV08Src, 'types/primitives.ts'),
      '@a2ui/web_core/styles/index': resolve(webCoreV08Src, 'styles/index.ts'),
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => tag.includes('a2ui-'),
      },
    },
  },
}

export default defineConfig({
  title: 'a2ui-vue',
  base: '/a2ui-vue/',
  description: 'A Vue 3 renderer for the A2UI (Agent-to-UI) protocol — let AI agents render rich, interactive UIs inside your Vue apps.',
  lastUpdated: true,
  appearance: 'force-dark',

  vite: viteConfig as never,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap', rel: 'stylesheet' }],
  ],

  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
          { text: '示例', link: '/samples/overview', activeMatch: '/samples/' },
          { text: 'Playground', link: '/playground/', activeMatch: '/playground/' },
          { text: 'GitHub', link: 'https://github.com/shawnwang15/a2ui-vue' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: '开始',
              items: [
                { text: '简介', link: '/guide/introduction' },
                { text: '快速上手', link: '/guide/getting-started' },
                { text: 'Node A2UI 与 Agent', link: '/guide/node-a2ui' },
              ],
            },
            {
              text: 'Vue Renderer',
              items: [
                { text: '核心概念', link: '/guide/vue-renderer' },
                { text: '组件参考', link: '/guide/components' },
              ],
            },
          ],
          '/samples/': [
            {
              text: '示例演示',
              items: [
                { text: '总览', link: '/samples/overview' },
                { text: '组件画廊', link: '/samples/component-gallery' },
                { text: '联系人查询', link: '/samples/contact-lookup' },
                { text: '餐厅查找', link: '/samples/restaurant-finder' },
              ],
            },
          ],
          '/playground/': [
            {
              text: 'Playground',
              items: [
                { text: '实时渲染', link: '/playground/' },
              ],
            },
          ],
        },
        editLink: {
          pattern: 'https://github.com/shawnjs/a2ui-vue/edit/main/docs/:path',
          text: '在 GitHub 上编辑此页',
        },
        docFooter: {
          prev: '上一页',
          next: '下一页',
        },
        outline: {
          label: '页面导航',
        },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/introduction', activeMatch: '/en/guide/' },
          { text: 'Samples', link: '/en/samples/overview', activeMatch: '/en/samples/' },
          { text: 'Playground', link: '/en/playground/', activeMatch: '/en/playground/' },
          { text: 'GitHub', link: 'https://github.com/shawnwang15/a2ui-vue' },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/en/guide/introduction' },
                { text: 'Quick Start', link: '/en/guide/getting-started' },
                { text: 'Node A2UI & Agents', link: '/en/guide/node-a2ui' },
              ],
            },
            {
              text: 'Vue Renderer',
              items: [
                { text: 'Core Concepts', link: '/en/guide/vue-renderer' },
                { text: 'Component Reference', link: '/en/guide/components' },
              ],
            },
          ],
          '/en/samples/': [
            {
              text: 'Samples',
              items: [
                { text: 'Overview', link: '/en/samples/overview' },
                { text: 'Component Gallery', link: '/en/samples/component-gallery' },
                { text: 'Contact Lookup', link: '/en/samples/contact-lookup' },
                { text: 'Restaurant Finder', link: '/en/samples/restaurant-finder' },
              ],
            },
          ],
          '/en/playground/': [
            {
              text: 'Playground',
              items: [
                { text: 'Live Renderer', link: '/en/playground/' },
              ],
            },
          ],
        },
        editLink: {
          pattern: 'https://github.com/shawnjs/a2ui-vue/edit/main/docs/:path',
          text: 'Edit this page on GitHub',
        },
        docFooter: {
          prev: 'Previous',
          next: 'Next',
        },
        outline: {
          label: 'On this page',
        },
        returnToTopLabel: 'Return to top',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Appearance',
        lightModeSwitchTitle: 'Switch to light mode',
        darkModeSwitchTitle: 'Switch to dark mode',
      },
    },
  },

  themeConfig: {
    logo: { src: '/logo.svg', width: 28, height: 28 },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/shawnjs/a2ui-vue' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Community Contributors',
    },
  },
})
