/**
 * Example custom theme built on top of the package defaultTheme.
 *
 * To apply globally in this examples app, replace `theme` in `main.ts`:
 *
 *   import { customTheme } from './customTheme'
 *   provideA2UI({ app, catalog: DEFAULT_CATALOG, theme: customTheme })
 *
 * In a consumer app:
 *
 *   import { provideA2UI, DEFAULT_CATALOG, defaultTheme } from 'a2ui-vue'
 *   import type { A2UITheme } from 'a2ui-vue'
 *   // …spread defaultTheme and override additionalStyles / components as below
 */

import type { A2UITheme } from '@/config'
import { theme as defaultTheme } from '@/theme'

const warmGradient =
  'linear-gradient(135deg, light-dark(#e11d48, #fb7185) 0%, light-dark(#f97316, #fb923c) 100%)'

export const customTheme: A2UITheme = {
  ...defaultTheme,
  additionalStyles: {
    ...defaultTheme.additionalStyles,
    Button: {
      ...defaultTheme.additionalStyles?.Button,
      background: warmGradient,
      boxShadow: '0 4px 15px rgba(225, 29, 72, 0.35)',
      '--p-30': '#e11d48',
      '--p-40': '#f97316',
    },
    Text: {
      ...defaultTheme.additionalStyles?.Text,
      h1: {
        color: 'transparent',
        background: warmGradient,
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
      },
      h2: {
        color: 'transparent',
        background: warmGradient,
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
      },
      h3: {
        color: '#e11d48',
      },
    },
    Card: {
      background:
        'radial-gradient(circle at top left, light-dark(rgba(225, 29, 72, 0.12), rgba(251, 113, 133, 0.2)), transparent 40%), radial-gradient(circle at bottom right, light-dark(rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.2)), transparent 40%), linear-gradient(135deg, light-dark(rgba(255, 255, 255, 0.85), rgba(30, 41, 59, 0.7)), light-dark(rgba(255, 247, 237, 0.9), rgba(15, 23, 42, 0.8)))',
    },
  },
}
