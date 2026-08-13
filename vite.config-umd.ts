import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite-plus'
import vue from '@vitejs/plugin-vue'

// UMD build for <script src> CDN usage (Vue2 parity).
//
// Built from src/lib.umd.ts (default-only) so the global `UI` is the plugin
// object directly, with no `.default` indirection. Runs AFTER the ES build
// (vite.config-lib.ts) with emptyOutDir disabled, so it adds dist/ui.umd.js
// without wiping dist/ui.js or the generated .d.ts files. No dts plugin here —
// declarations come from the ES build.
//
// vue / vue-router stay external: the host page must provide window.Vue and
// window.VueRouter.
export default defineConfig({
  publicDir: false,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/lib.umd.ts', import.meta.url)),
      name: 'UI',
      formats: ['umd'],
      fileName: () => 'ui.umd.js',
      cssFileName: 'style'
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['color-functions', 'global-builtin', 'import']
      }
    }
  }
})
