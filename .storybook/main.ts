import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  // Serves the brand assets (sidebar wordmark, favicon) at the site root.
  staticDirs: ['./public'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  async viteFinal(config) {
    config.build = config.build ?? {}
    config.build.target = 'es2022'
    return config
  }
}
export default config
