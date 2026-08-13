import { UiProvider } from '@/components/UiProvider'
import type { Decorator } from '@storybook/vue3-vite'

const decorator: Decorator = () => ({
  components: { UiProvider },
  template: `
    <UiProvider>
      <story/>
    </UiProvider>
  `
})

export default decorator
