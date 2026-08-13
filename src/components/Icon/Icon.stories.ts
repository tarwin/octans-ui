import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Icon from './Icon.vue'

/**
 * Icon names are Iconify `prefix:name` pairs — `mdi:alert`, `la:home`,
 * `lucide:camera`. Every name the library itself renders is bundled at build
 * time, so those appear instantly and offline; anything you pass resolves
 * through the Iconify API the first time it is used.
 *
 * To bundle your own too, run `npx octans-icons` before a build — it scans
 * your source and generates a file registering just the icons you use. See
 * **Quick Start → Icons**.
 *
 * Prefix any name with `not:` to draw a slash through it.
 */
const meta = {
  title: 'Components/Data Display/Icon',
  component: Icon,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  args: {
    icon: 'mdi:star'
  }
  // argTypes: {
  //   size: { control: 'select', options: ['small', 'medium', 'large'] },
  //   backgroundColor: { control: 'color' },
  // },
  // args: {
  //   primary: false,
  //   // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  //   onClick: fn(),
  // },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  args: {
    icon: 'mdi:star'
    // primary: true,
    // label: 'Button',
  }
}

export const Iconify: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <div>Any Iconify name works in <code>icon</code>, from any
          collection</div>
          <Icon icon="mdi:home" />
          <Icon icon="mdi:cog" />
          <Icon icon="mdi:bell" />
          <Icon icon="la:rocket" />
          <Icon icon="lucide:camera" />
        </div>

        <div>
          <div>Sizing</div>
          <Icon icon="mdi:camera" size="100%" />
          <Icon icon="mdi:camera" size="150%" />
          <Icon icon="mdi:camera" size="2em" />
          <Icon icon="mdi:camera" size="48px" />
        </div>

        <div>
          <div>Negated with a <code>not:</code> prefix</div>
          <Icon icon="mdi:bell" size="150%" />
          <Icon icon="not:mdi:bell" size="150%" />
          <Icon icon="not:mdi:eye" size="150%" />
        </div>

        <div>
          <div>Status badges</div>
          <Icon icon="mdi:cloud-sync" size="200%" badge="info" />
          <Icon icon="mdi:cloud-sync" size="200%" badge="success" />
          <Icon icon="mdi:cloud-sync" size="200%" badge="warning" />
          <Icon icon="mdi:cloud-sync" size="200%" badge="error" />
          <Icon icon="mdi:cloud-sync" size="200%" badge-icon="mdi:lock" badge-color="#46417d" />
        </div>

        <div>
          <div><code>contained</code> keeps the box at 1em so the icon can
          overflow without shifting the layout</div>
          <span style="background: #f4f6f7">
            Text <Icon icon="mdi:star" size="250%" contained /> text
          </span>
        </div>
      </div>
    `
  })
}

/**
`size` takes any CSS length. A **percentage is resolved against the surrounding
font size**, not the parent's box — so `150%` means "half again as big as the
text next to it", which is almost always what you want for an icon sitting in a
line of copy. The two rows below are the same percentages against different
font sizes.

Absolute units (`px`, `em`, `rem`) are passed through untouched.
*/
export const Sizing: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      const percents = ['100%', '150%', '200%', '300%']
      const lengths = ['12px', '24px', '48px', '3em']
      return { percents, lengths }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <div>Percentages, in 14px text</div>
          <div style="font-size: 14px">
            Text
            <Icon
              v-for="size in percents"
              :key="size"
              icon="mdi:camera"
              :size="size"
            />
            text
          </div>
        </div>

        <div>
          <div>The same percentages, in 24px text — they scale with it</div>
          <div style="font-size: 24px">
            Text
            <Icon
              v-for="size in percents"
              :key="size"
              icon="mdi:camera"
              :size="size"
            />
            text
          </div>
        </div>

        <div>
          <div>Absolute lengths, unaffected by the surrounding font size</div>
          <div style="font-size: 14px">
            Text
            <Icon
              v-for="size in lengths"
              :key="size"
              icon="mdi:camera"
              :size="size"
            />
            text
          </div>
        </div>
      </div>
    `
  })
}
