import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

/**
 * `styles/reset.css` is the opt-in page reset, published as
 * `@octans/ui/reset.css`. Nothing imports it — that is the whole point, it is
 * opt-in — so it is not in the JS graph and the library build would never
 * emit it. Copy it verbatim.
 *
 * `readFileSync` outside a try: if the file moves or is renamed, the BUILD
 * fails here rather than quietly publishing a package whose documented
 * `reset.css` export 404s.
 */
// Return type widened to `any`: spelling it as vite-plus' `Plugin` makes
// `defineConfig` recurse deep enough on the plugins array to hit TS2321.
function emitResetCss(): any {
  return {
    name: 'octans-emit-reset-css',
    generateBundle(this: any) {
      const source = readFileSync(
        fileURLToPath(new URL('./src/styles/reset.css', import.meta.url)),
        'utf8'
      )
      this.emitFile({ type: 'asset', fileName: 'reset.css', source })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    emitResetCss(),
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
