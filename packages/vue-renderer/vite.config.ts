

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';
  const projectRoot = __dirname;

  return {
    plugins: [
      vue(
          {
              template: {
                  compilerOptions: {
                      // 将所有带短横线的标签名都视为自定义元素
                      isCustomElement: (tag) => tag.includes('a2ui-')
                  }
              }
          }
      ),
      ...(isLib
        ? [dts({
            rollupTypes: true,
            exclude: ['src/examples/**'],
            bundledPackages: ['@a2ui/web_core','zod']
          })]
        : []),
    ],
    root: isLib ? '.' : resolve(projectRoot, 'src/examples'),
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'A2UIVue',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              globals: {
                vue: 'Vue'
              },
            },
          }
        }
      : {
          outDir: resolve(__dirname, 'dist-examples'),
        },
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src')
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
