import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'a2ui-vue',
  description: 'A Vue 3 renderer for the A2UI (Agent-to-UI) protocol — let AI agents render rich, interactive UIs inside your Vue apps.',
  lang: 'zh-CN',
  lastUpdated: true,
  appearance: 'force-dark',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap', rel: 'stylesheet' }],
  ],

  themeConfig: {
    logo: { src: '/logo.svg', width: 28, height: 28 },

    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: '示例', link: '/samples/overview', activeMatch: '/samples/' },
      { text: 'GitHub', link: 'https://github.com/shawnjs/a2ui-vue' },
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
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/shawnjs/a2ui-vue' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Community Contributors',
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
})
