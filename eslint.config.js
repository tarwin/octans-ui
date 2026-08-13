import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import {
  defineConfigWithVueTs,
  vueTsConfigs
} from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import storybook from 'eslint-plugin-storybook'

export default defineConfigWithVueTs(
  {
    name: 'octans/ignores',
    ignores: [
      'dist/**',
      'storybook-static/**',
      'public/tzData.js',
      'coverage/**'
    ]
  },

  js.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  storybook.configs['flat/recommended'],

  // Must come last: turns off every rule that would fight Prettier.
  skipFormatting,

  {
    // Build scripts, the published CLI and config files run in Node, not the
    // browser.
    name: 'octans/node-files',
    files: [
      'scripts/**/*.{js,mjs,ts}',
      'bin/**/*.{js,mjs}',
      '*.config.{js,ts}',
      'vite.config*.ts'
    ],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        __dirname: 'readonly'
      }
    }
  },

  {
    name: 'octans/rules',
    rules: {
      // Components are namespaced by directory here (Button/Button.vue), and
      // single-word names are the public API of the library.
      'vue/multi-word-component-names': 'off',
      // Several components intentionally shadow HTML element names (Link,
      // Select, Tabs) — that is the point of a UI kit.
      'vue/no-reserved-component-names': 'off',
      // `any` is load-bearing in a generic component library; revisit once the
      // public types are tightened up.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],

      // --- Pre-existing debt, tracked in TODO.md §7 ---------------------
      // These are `warn` rather than `error` on purpose: each needs a real
      // design decision (writing proper function signatures, changing public
      // types, migrating a Vue 2 API), not a mechanical fix. Keeping `lint`
      // green means a new error is visible instead of being lost in noise.
      // Promote each back to `error` as it gets cleared.

      // 17 uses of the bare `Function` type across 12 files. Needs real
      // parameter/return types, several of them in public prop types.
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      // Empty `interface X {}` in ResourceList/types.ts and Sticky/types.ts.
      '@typescript-eslint/no-empty-object-type': 'warn',
      // Vue 2 `model:` option in RadioButton — needs a real migration.
      'vue/no-deprecated-model-definition': 'warn',
      // `declare namespace` in Modal/types.ts.
      '@typescript-eslint/no-namespace': 'warn',
      // Dead-but-harmless assignments (e.g. defensive zeroing in format.ts).
      'no-useless-assignment': 'warn'
    }
  }
)
