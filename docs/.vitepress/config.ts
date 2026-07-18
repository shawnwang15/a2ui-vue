import { resolve } from 'node:path'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { demoblockPlugin, demoblockVitePlugin } from 'vitepress-theme-demoblock'
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const vueRendererSrc = resolve(repoRoot, 'packages/vue-renderer/src')
const vueRendererEntry = resolve(vueRendererSrc, 'index.ts')
const webCoreV08Src = resolve(repoRoot, 'packages/web_core/src/v0_8')

const LATEST_VERSION = 'v0.9'
const SITE_BASE = '/a2ui-vue'

// Pages that need version redirect
const REDIRECT_PAGES = [
  'guide/introduction',
  'guide/getting-started',
  'guide/node-a2ui',
  'guide/vue-renderer',
  'guide/custom-components',
  'guide/components',
  'samples/overview',
  'samples/component-gallery',
  'samples/component-list',
  'samples/contact-lookup',
  'samples/contact-form',
  'samples/restaurant-finder',
]

// Shared: build redirect target URL for a given page + locale
function getRedirectTarget(locale: string, page: string) {
  return locale
    ? `${SITE_BASE}/${locale}/${LATEST_VERSION}/${page}.html`
    : `${SITE_BASE}/${LATEST_VERSION}/${page}.html`
}

// Vite plugin: handles redirects in both dev server and production build
function versionRedirectPlugin() {
  return {
    name: 'a2ui-version-redirect',
    // Dev server: 302 redirect via middleware
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0] ?? ''
        for (const page of REDIRECT_PAGES) {
          if (url === `${SITE_BASE}/${page}.html` || url === `${SITE_BASE}/${page}`) {
            res.writeHead(302, { Location: getRedirectTarget('', page) })
            res.end()
            return
          }
          if (url === `${SITE_BASE}/en/${page}.html` || url === `${SITE_BASE}/en/${page}`) {
            res.writeHead(302, { Location: getRedirectTarget('en', page) })
            res.end()
            return
          }
        }
        next()
      })
    },
  }
}

const viteConfig = {
  plugins: [demoblockVitePlugin(), versionRedirectPlugin()],
  resolve: {
    alias: {
      '@': vueRendererSrc,
      // Use renderer source in docs so embedded demos match the examples app.
      'a2ui-vue': vueRendererEntry,
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
  appearance: false,
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
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@100..900&display=swap', rel: 'stylesheet' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=account_circle,add,arrow_back,arrow_drop_down,arrow_forward,attach_file,calendar_today,call,camera,check,check_circle,close,communication,content_copy,dark_mode,delete,download,draw,edit,error,event,favorite,favorite_off,folder,help,home,info,light_mode,location_on,lock,lock_open,mail,menu,mobile_layout,more_horiz,more_vert,notifications,notifications_off,payment,pen_size_1,person,phone,photo,print,progress_activity,rectangle,refresh,search,send,settings,share,shopping_cart,star,star_half,star_off,upload,visibility,visibility_off,warning' }],
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
          {
            text: 'v0.9',
            items: [
              { text: 'v0.9 (当前)', link: '/v0.9/guide/introduction' },
              { text: 'v0.8', link: '/v0.8/guide/introduction' },
            ],
          },
          { text: '指南', link: '/v0.9/guide/introduction', activeMatch: '/v0.9/guide/' },
          { text: '示例', link: '/v0.9/samples/overview', activeMatch: '/v0.9/samples/' },
          // { text: 'Playground', link: '/playground/', activeMatch: '/playground/' },
          { text: 'GitHub', link: 'https://github.com/shawnwang15/a2ui-vue' },
        ],
        sidebar: {
          '/v0.9/guide/': [
            {
              text: '开始',
              items: [
                { text: '简介', link: '/v0.9/guide/introduction' },
                { text: '快速上手', link: '/v0.9/guide/getting-started' },
                { text: 'Node A2UI 与 Agent', link: '/v0.9/guide/node-a2ui' },
              ],
            },
            {
              text: 'Vue Renderer',
              items: [
                { text: '核心概念', link: '/v0.9/guide/vue-renderer' },
                { text: '组件参考', link: '/v0.9/guide/components' },
              ],
            },
            {
              text: '自定义组件',
              items: [
                { text: '概述', link: '/v0.9/guide/custom-components/' },
                { text: '动作组件示例', link: '/v0.9/guide/custom-components/action-button' },
                { text: '输入组件示例', link: '/v0.9/guide/custom-components/text-field' },
              ],
            },
          ],
          '/v0.9/samples/': [
            {
              text: '示例演示',
              items: [
                { text: '总览', link: '/v0.9/samples/overview' },
                { text: '组件画廊', link: '/v0.9/samples/component-gallery' },
                { text: '组件列表示例', link: '/v0.9/samples/component-list/' },
                { text: '联系人查询', link: '/v0.9/samples/contact-lookup' },
                { text: '联系人表单', link: '/v0.9/samples/contact-form/' },
                { text: '餐厅查找', link: '/v0.9/samples/restaurant-finder' },
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
          '/v0.8/guide/': [
            {
              text: '开始',
              items: [
                { text: '简介', link: '/v0.8/guide/introduction' },
                { text: '快速上手', link: '/v0.8/guide/getting-started' },
              ],
            },
            {
              text: '参考',
              items: [
                { text: '组件参考', link: '/v0.8/guide/components' },
              ],
            },
          ],
          '/v0.8/samples/': [
            {
              text: '示例',
              items: [
                { text: '总览', link: '/v0.8/samples/overview' },
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
          {
            text: 'v0.9',
            items: [
              { text: 'v0.9 (Current)', link: '/en/v0.9/guide/introduction' },
              { text: 'v0.8', link: '/en/v0.8/guide/introduction' },
            ],
          },
          { text: 'Guide', link: '/en/v0.9/guide/introduction', activeMatch: '/en/v0.9/guide/' },
          { text: 'Samples', link: '/en/v0.9/samples/overview', activeMatch: '/en/v0.9/samples/' },
          // { text: 'Playground', link: '/en/playground/', activeMatch: '/en/playground/' },
          { text: 'GitHub', link: 'https://github.com/shawnwang15/a2ui-vue' },
        ],
        sidebar: {
          '/en/v0.9/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/en/v0.9/guide/introduction' },
                { text: 'Quick Start', link: '/en/v0.9/guide/getting-started' },
                { text: 'Node A2UI & Agents', link: '/en/v0.9/guide/node-a2ui' },
              ],
            },
            {
              text: 'Vue Renderer',
              items: [
                { text: 'Core Concepts', link: '/en/v0.9/guide/vue-renderer' },
                { text: 'Component Reference', link: '/en/v0.9/guide/components' },
              ],
            },
            {
              text: 'Custom Components',
              items: [
                { text: 'Overview', link: '/en/v0.9/guide/custom-components/' },
                { text: 'Action Button Example', link: '/en/v0.9/guide/custom-components/action-button' },
                { text: 'Text Field Example', link: '/en/v0.9/guide/custom-components/text-field' },
              ],
            },
          ],
          '/en/v0.9/samples/': [
            {
              text: 'Samples',
              items: [
                { text: 'Overview', link: '/en/v0.9/samples/overview' },
                { text: 'Component Gallery', link: '/en/v0.9/samples/component-gallery' },
                { text: 'Component List', link: '/en/v0.9/samples/component-list/' },
                { text: 'Contact Lookup', link: '/en/v0.9/samples/contact-lookup' },
                { text: 'Contact Form', link: '/en/v0.9/samples/contact-form/' },
                { text: 'Restaurant Finder', link: '/en/v0.9/samples/restaurant-finder' },
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
          '/en/v0.8/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/en/v0.8/guide/introduction' },
                { text: 'Quick Start', link: '/en/v0.8/guide/getting-started' },
              ],
            },
            {
              text: 'Reference',
              items: [
                { text: 'Component Reference', link: '/en/v0.8/guide/components' },
              ],
            },
          ],
          '/en/v0.8/samples/': [
            {
              text: 'Samples',
              items: [
                { text: 'Overview', link: '/en/v0.8/samples/overview' },
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

  buildEnd(siteConfig) {
    // Production build: generate static HTML redirect files (for GitHub Pages etc.)
    const locales = ['', 'en']
    for (const locale of locales) {
      for (const page of REDIRECT_PAGES) {
        const from = locale ? `${locale}/${page}` : page
        const to = getRedirectTarget(locale, page)

        const outFile = resolve(siteConfig.outDir, `${from}.html`)
        const dir = resolve(outFile, '..')
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

        const html = [
          '<!DOCTYPE html>',
          '<html>',
          '<head>',
          '  <meta charset="utf-8">',
          `  <meta http-equiv="refresh" content="0;url=${to}">`,
          `  <link rel="canonical" href="${to}">`,
          '</head>',
          '<body>',
          `  <p>Redirecting to <a href="${to}">${to}</a></p>`,
          '</body>',
          '</html>',
        ].join('\n')

        writeFileSync(outFile, html)
      }
    }
  },
})
