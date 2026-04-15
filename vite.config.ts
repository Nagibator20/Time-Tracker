import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile({
    overrideConfig: {
      build: {
        assetsInlineLimit: (filePath: string) => {
          return !filePath.endsWith('.ttf');
        },
        assetsDir: 'fonts',
      },
    },
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/_variables.scss";
          @import "@/styles/_mixins.scss";
        `,
        silenceDeprecations: ['legacy-js-api', 'import', 'color-functions', 'global-builtin']
      }
    }
  }
});
