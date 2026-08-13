import type { Meta, StoryObj } from '@storybook/vue3-vite'
import StatGroup from './StatGroup.vue'
import Stat from './Stat.vue'

/**
 * The StatGroup component uses a CSS Grid to layout Stat child components.
 */
const meta = {
  title: 'Components/Data Display/StatGroup',
  component: StatGroup,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof StatGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { StatGroup, Stat },
    template: `
      <div>
        <StatGroup>
          <Stat
            label="Date with value"
            type="dateTimeLong"
            value="2019-09-27 14:44:29"
          />
          <Stat
            label="Currency with undefined"
            type="currency"
            :value="undefined"
          />
          <Stat multiline label="Only label"></Stat>

          <Stat label="Value as a child" multiline
            >In publishing and graphic design, Lorem ipsum is a placeholder text
            commonly used to demonstrate the visual form of a document or a typeface
            without relying on meaningful content. Lorem ipsum may be used as a
            placeholder before final copy is available.
          </Stat>

          <Stat label="Number as a child" type="number">12384945</Stat>
          <Stat label="Value without a type" value="23748822" />
          <Stat label="No value or child" />
          <Stat label="Empty child"></Stat>
          <Stat label="Child with only whitespace"> </Stat>
          <Stat label="Test long unbroken string" multiline>Loremipsummaybeusedasa
            placeholderbeforefinalcopyisavailable.</Stat>
        </StatGroup>
      </div>
    `
  })
}
