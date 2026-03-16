

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { createA2AMiddleware } from './server';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use(createA2AMiddleware());
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 4000,
  },
});
