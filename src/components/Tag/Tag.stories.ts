import { type Meta, type StoryObj } from '@storybook/vue3-vite'
import Tag from './Tag.vue'
import { ref } from 'vue'

const meta = {
  title: 'Components/Data Display/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => ({
    components: { Tag },

    template: `
      <div class="Tags">
        <Tag>Option 1 is really quite long!</Tag>
        <Tag required tooltip="This filter is required">Required</Tag>
        <Tag>Option 2 is also really long - not sure why really ...</Tag>
      </div>
      <component is="style">
        .Tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
          margin-bottom: 8px;
        }
      </component>
    `
  })
}

export const Removing: Story = {
  render: () => ({
    components: { Tag },
    setup() {
      const tags = ref([
        { label: 'Option 1', tooltip: 'Hello!' },
        {
          label: 'Option 2',
          required: true,
          tooltip: 'This filter is required'
        },
        { label: 'Option 3' }
      ])
      return {
        remove: (tag: any) => {
          tags.value = tags.value.filter((t) => t !== tag)
        },
        tags
      }
    },
    template: `
      <div class="Tags">
        <Tag
          v-for="tag of tags"
          :key="tag.label"
          @remove="remove(tag)"
          :required="tag.required"
          :tooltip="tag.tooltip"
          tooltip-position="bottom"
        >{{ tag.label }}</Tag>
      </div>
      <component is="style">
        .Tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
          margin-bottom: 8px;
        }
      </component>
    `
  })
}

/**
 * ### With styled default slot
 * Note that a `.Tags` class is used to wrap the tags in a flexbox container.
 */
export const StyledDefaultSlot: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div class="Tags">
        <Tag>
          Option 1 No Style
        </Tag>
        <Tag required tooltip="This filter is required">
          <div style="background: color: #eee; border: 1px solid green; padding: 16px;">Option 2</div>
        </Tag>
        <Tag>
          <div style="background: color: #eee; border: 1px solid blue; padding: 16px;">Option 3</div>
        </Tag>
      </div>
      <component is="style">
        .Tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
          margin-bottom: 8px;
        }
      </component>
    `
  })
}
