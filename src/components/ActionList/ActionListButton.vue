<script lang="ts">
import {
  defineComponent,
  h,
  useCssModule,
  type PropType,
  type VNode
} from 'vue'
import { Icon } from '../Icon'
import { TextStyle } from '../TextStyle'
import { UnstyledLink } from '../UnstyledLink'

export default defineComponent({
  props: {
    label: {
      type: String
    },
    helpText: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Tooltip to show when hovering the button.
     */
    tooltip: {
      type: String
    },
    /**
     * Tooltip position, "top", "bottom", "right" or "left".
     */
    tooltipPosition: {
      type: String,
      default: 'bottom'
    },
    dropdown: {
      type: Boolean,
      default: false
    },
    url: {
      type: String
    },
    external: {
      type: Boolean
    },
    icon: {
      type: String as PropType<string | null>
    }
  },
  setup(props) {
    const $style = useCssModule()
    return () => {
      const renderDefaultSlot = () => {
        const children: VNode[] = []

        if (props.icon) {
          children.push(
            h(Icon, {
              icon: props.icon,
              style: 'margin-right: 10px'
            })
          )
        }

        if (props.helpText) {
          children.push(
            h('div', [
              h('div', props.label),
              h(
                TextStyle,
                {
                  props: {
                    type: 'subdued'
                  }
                },
                {
                  default: () => props.helpText
                }
              )
            ])
          )
        } else {
          children.push(h('div', props.label))
        }

        if (props.dropdown) {
          children.push(
            h(Icon, {
              icon: 'mdi:menu-right',
              style: 'margin-left: 10px'
            })
          )
        }
        return children
      }
      const element: any =
        props.url && !props.disabled ? UnstyledLink : 'button'
      return h(
        element,
        {
          class: $style.ActionListButton,
          href: props.url,
          target: props.external ? '_blank' : undefined,
          disabled: props.disabled,
          'data-ui-tooltip': props.tooltip,
          'data-ui-tooltip-position': props.tooltipPosition
        },
        {
          default: renderDefaultSlot
        }
      )
    }
  }
})
</script>

<style lang="scss" module>
@import '../../styles/variables';

.ActionListButton {
  display: flex;
  align-items: center;
  // justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  background: var(--octans-surface);
  border: 0;
  font-size: 14px;
  text-align: left;
  text-decoration: none;

  &:not(:disabled) {
    &:hover {
      background: var(--octans-surface-hover);
      cursor: pointer;
    }
    &:active {
      background: var(--octans-surface-selected);
    }
    &:focus {
      outline: 0;
    }
  }

  &:disabled {
    color: $buttonDisabledTextColor;
  }
}
</style>
