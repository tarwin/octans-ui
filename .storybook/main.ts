import type { StorybookConfig } from '@storybook/vue3-vite'

// `title` is a real preset — the manager builder reads it to render the
// <title> in the generated index.html ("Octans UI - Storybook") — but it is
// missing from the exported StorybookConfig type, hence the intersection. It
// is the title a crawler sees, since crawlers do not run the manager bundle
// that rewrites the title on navigation (see manager-head.html).
const config: StorybookConfig & { title?: string } = {
  title: 'Octans UI',
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
