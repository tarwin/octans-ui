import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // api-extractor (bundleTypes) collapses .vue re-exports to `export {}`,
    // so emit per-file declarations like the old vue-tsc flow did
    dts({
      tsconfigPath: './tsconfig.app-dts.json',
      entryRoot: 'src'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // There is no root public/ any more — Storybook's assets live in
  // .storybook/public. Kept as a standing guard: Vite's default publicDir is
  // `<root>/public`, so the day one reappears it would be copied into dist/
  // and shipped to npm without anyone noticing.
  publicDir: false,
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/lib.ts', import.meta.url)),
      name: 'UI',
      // ES build for npm consumers (dist/ui.js). The UMD/CDN build is a
      // separate config (vite.config-umd.ts) so its global can be the default
      // export directly — see src/lib.umd.ts.
      formats: ['es'],
      // Vite 6+ names the css after the lib; keep the historical style.css path
      cssFileName: 'style'
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue'
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
