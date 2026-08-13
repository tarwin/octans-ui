import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite-plus'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  fmt: {
    semi: false,
    tabWidth: 2,
    singleQuote: true,
    printWidth: 80,
    trailingComma: 'none',
    singleAttributePerLine: true,
    htmlWhitespaceSensitivity: 'ignore',
    importOrder: ['<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
    importOrderSeparation: false,
    importOrderSortSpecifiers: false,
    sortPackageJson: false,
    ignorePatterns: []
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      external: ['vue']
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
