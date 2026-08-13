import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MaybeMountingPortal from './MaybeMountingPortal.vue'

const meta = {
  title: 'Components/Utilities/MaybeMountingPortal',
  component: MaybeMountingPortal,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof MaybeMountingPortal>

export default meta
type Story = StoryObj<typeof meta>

// Teleport False
// We set `teleport` to `false` and the content is mounted in a div in place.
export const TeleportFalse: Story = {
  render: () => ({
    components: { MaybeMountingPortal },
    template: `
      <div class="Main1">
        <div class="WrapDefault1">Wrap Default
          <MaybeMountingPortal :teleport="false">
            <div class="Content1">Mounted Content No Teleport</div>
          </MaybeMountingPortal>
        </div>
        <div class="WrapExternal1">Wrap External</div>
      </div>
      <component is="style">
        .Main1 {
          color: #fff;
          padding: 15px;
        }
        .WrapDefault1 {
          background: blue;
          padding: 15px;
        }
        .WrapExternal1 {
          background: green;
          padding: 15px;
        }
        .Content1 {
          background: red;
          padding: 15px;
        }
      </component>
    `
  })
}

// We set `teleport` to `true` and the content is mounted in a `MountingPortal`. The default target is `body`. You will see it at the bottom right of the screen.
export const TeleportTrue: Story = {
  render: () => ({
    components: { MaybeMountingPortal },
    template: `
      <div class="Main2">
        <div class="WrapDefault2">Wrap Default
          <MaybeMountingPortal>
            <div class="Content2">Mounted Content Teleported to Body</div>
          </MaybeMountingPortal>
        </div>
        <div class="WrapExternal2">Wrap External</div>
      </div>
      <component is="style">
        .Main2 {
          color: #fff;
          padding: 15px;
        }
        .WrapDefault2 {
          background: blue;
          padding: 15px;
        }
        .WrapExternal2 {
          background: green;
          padding: 15px;
        }
        .Content2 {
          background: red;
          padding: 15px;
          position: absolute;
          bottom: 15px;
          right: 15px;
        }
      </component>
    `
  })
}

// `defer` is on by default, so `#mount-to-wrapper` does not have to exist yet when
// the `MaybeMountingPortal` renders — it is only looked up once the surrounding
// content has rendered.
export const MountTo: Story = {
  render: () => ({
    components: { MaybeMountingPortal },
    template: `
      <div class="Main3">
        <div class="WrapDefault3">Wrap Default
          <MaybeMountingPortal mount-to="#mount-to-wrapper">
            <div class="Content3">Mounted Content Teleported to #mount-to-wrapper</div>
          </MaybeMountingPortal>
        </div>
        <div class="WrapExternal3">Wrap External<div id="mount-to-wrapper"></div></div>
      </div>
      <component is="style">
        .Main3 {
          color: #fff;
          padding: 15px;
        }
        .WrapDefault3 {
          background: blue;
          padding: 15px;
        }
        .WrapExternal3 {
          background: green;
          padding: 15px;
        }
        .Content3 {
          background: red;
          padding: 15px;
        }
      </component>
    `
  })
}
