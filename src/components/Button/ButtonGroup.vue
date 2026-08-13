<script lang="ts">
import { cloneVNode, h, useCssModule } from 'vue'
import ButtonGroupItem from './ButtonGroupItem.vue'
import { flattenSlotChildren } from '@/utils'

/**
 * Button group displays multiple related actions stacked or in a horizontal row
 * to help with arrangement and spacing.
 */
export default {
  name: 'ButtonGroup',
  props: {
    /**
     * Join buttons as segmented group.
     */
    segmented: {
      type: Boolean
    },
    /**
     * Renders the background area of the button group to visually connect the
     * gaps between buttons. To be used in conjunction with the `segmented`
     * option.
     */
    fill: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const $style = useCssModule()
    return () => {
      const children = flattenSlotChildren(slots.default?.() ?? [])
      return h(
        'div',
        {
          class: [
            'UIElement',
            $style.ButtonGroup,
            props.segmented && $style.segmented,
            props.fill && $style.fill
          ],
          'data-buttongroup-segmented': props.segmented ? true : undefined
        },
        children.map((node) => {
          if (node.type === ButtonGroupItem) {
            return cloneVNode(node, {
              class: $style.item
            })
          }
          return h(
            'div',
            {
              class: $style.item
            },
            [node]
          )
        })
      )
    }
  }
}
</script>

<style lang="scss" module>
.ButtonGroup {
  display: flex;
  flex-wrap: nowrap;
}
.item + .item {
  margin-left: 8px;
}
.segmented {
  .item {
    margin: 0;
    // Segments share seams, so a hovered segment must not lift out of the
    // row. `!important` beats the button's own `:hover` declaration, which
    // otherwise wins on specificity.
    * {
      --octans-button-lift: 0px !important;
    }
    // * {
    //   border-radius: 0;
    // }
    // &:first-child > * {
    //   border-top-left-radius: 3px;
    //   border-bottom-left-radius: 3px;
    // }
    // &:last-child > * {
    //   border-top-right-radius: 3px;
    //   border-bottom-right-radius: 3px;
    // }
    &:not(:first-child) {
      margin-left: -1px;
    }
  }
}
.fill {
  background: var(--octans-surface);
  border-radius: var(--octans-radius-field);
  box-shadow: inset 0 0 0 1px var(--octans-border-input);
}
</style>
