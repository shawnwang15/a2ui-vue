import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { demoblockPlugin, demoblockVitePlugin } from 'vitepress-theme-demoblock'
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const vueRendererSrc = resolve(repoRoot, 'packages/vue-renderer/src')
const webCoreV08Src = resolve(repoRoot, 'packages/web_core/src/v0_8')

const viteConfig = {
  plugins: [demoblockVitePlugin()],
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

const SITE_HOSTNAME = 'https://github.com/shawnwang15'
const SITE_BASE = '/a2ui-vue'
const SITE_URL = `${SITE_HOSTNAME}${SITE_BASE}`
const OG_IMAGE = `${SITE_URL}/og-image.png`

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'a2ui-vue',
      url: SITE_URL,
      description:
        'A Vue 3 renderer for the A2UI (Agent-to-UI) open protocol. Enables AI agents to render rich, interactive UIs inside any Vue 3 application via structured JSON messages.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      programmingLanguage: ['JavaScript', 'TypeScript', 'Vue'],
      license: 'https://opensource.org/licenses/MIT',
      codeRepository: 'https://github.com/shawnwang15/a2ui-vue',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      keywords: [
        'a2ui', 'agent-to-ui', 'vue3', 'vue renderer', 'AI agent', 'AI UI',
        'A2UI protocol', 'generative UI', 'agentic UI', 'vue component',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'a2ui-vue',
      inLanguage: ['zh-CN', 'en-US'],
      about: { '@id': `${SITE_URL}/#software` },
    },
  ],
}

export default defineConfig({
  title: 'a2ui-vue',
  base: '/a2ui-vue/',
  description: 'A Vue 3 renderer for the A2UI (Agent-to-UI) protocol — let AI agents render rich, interactive UIs inside your Vue apps.',
  lastUpdated: true,
  appearance: 'force-dark',
  markdown: {
    config(md) {
      md.use(demoblockPlugin)
    },
  },
  sitemap: {
    hostname: SITE_URL,
  },

  vite: viteConfig as never,

  transformPageData(pageData) {
    const path = pageData.relativePath
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')
    const canonical = `${SITE_URL}/${path}`

    const title = pageData.title
      ? `${pageData.title} | a2ui-vue`
      : 'a2ui-vue — Vue 3 Renderer for A2UI Protocol'
    const description =
      (pageData.frontmatter.description as string | undefined) ||
      pageData.description ||
      'A Vue 3 renderer for the A2UI (Agent-to-UI) protocol. Let AI agents render rich, interactive UIs inside your Vue apps.'

    pageData.frontmatter.head ??= []
    ;(pageData.frontmatter.head as unknown[]).push(
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
    )
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/a2ui-vue/logo.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap', rel: 'stylesheet' }],
    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'a2ui-vue' }],
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:locale:alternate', content: 'en_US' }],
    // Twitter / X Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }],
    ['meta', { name: 'twitter:site', content: '@a2ui_vue' }],
    // Additional SEO
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' }],
    // JSON-LD Structured Data
    ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)],
    [
      'script',
      { defer: '', src: 'https://events.vercount.one/js' }
    ],
  ],

  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
          { text: '示例', link: '/samples/overview', activeMatch: '/samples/' },
          // { text: 'Playground', link: '/playground/', activeMatch: '/playground/' },
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
          pattern: 'https://github.com/shawnwang15/a2ui-vue/edit/main/docs/:path',
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
          // { text: 'Playground', link: '/en/playground/', activeMatch: '/en/playground/' },
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
          pattern: 'https://github.com/shawnwang15/a2ui-vue/edit/main/docs/:path',
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
      { icon: 'github', link: 'https://github.com/shawnwang15/a2ui-vue' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Community Contributors',
    },
  },
})
