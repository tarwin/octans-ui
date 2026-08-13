<script lang="ts">
import { defineComponent, h, type PropType, useCssModule } from 'vue'
import { Choice } from '../Choice'
import CheckboxControl from './CheckboxControl.vue'

export default defineComponent({
  name: 'Checkbox',
  emits: ['update:modelValue', 'change'],
  setup(props, context) {
    return () => {
      const style = useCssModule()

      const isChecked = props.modelValue === props.trueValue || props.checked
      const controlMarkup = h(
        'div',
        {
          class: style.Checkbox
        },
        [
          h(CheckboxControl, {
            name: props.name,
            checked: isChecked,
            indeterminate: props.indeterminate,
            disabled: props.disabled,
            readonly: props.readonly,
            error: !!props.error,
            onChange(event: any) {
              if (props.readonly) {
                return
              }
              const value = event.target.checked
                ? props.trueValue
                : props.falseValue
              context.emit('update:modelValue', value)
              context.emit('change', value)
            }
          })
        ]
      )

      return h(
        Choice,
        {
          ...context.attrs,
          label: props.label,
          error: props.error,
          helpText: props.helpText,
          helpLink: props.helpLink,
          disabled: props.disabled,
          readonly: props.readonly,
          tooltip: props.tooltip,
          tooltipPosition: props.tooltipPosition
        },
        {
          default: () => [controlMarkup],
          content: () => {
            if (isChecked && context.slots.default) {
              return h(
                'div',
                {
                  class: style.Content
                },
                context.slots.default && context.slots.default()
              )
            }
          }
        }
      )
    }
  },
  props: {
    label: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    error: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    helpText: {
      type: [String, Boolean] as PropType<string | false | null>,
      required: false
    },
    /**
     * Renders a help icon next to the label which links to an external page.
     */
    helpLink: {
      type: [String, Boolean] as PropType<string | false | null>,
      required: false
    },
    name: {
      type: String
    },
    /**
     * The bound value / v-model.
     */
    modelValue: {
      type: null
    },
    /**
     * The model value to use when checked.
     */
    trueValue: {
      type: null,
      default: true
    },
    /**
     * The model value to use when not checked.
     */
    falseValue: {
      type: null,
      default: false
    },
    /**
     * When `true` the checkbox will be checked. This is an alternative
     * to assigning `value` to be `trueValue`.
     */
    checked: {
      type: Boolean,
      default: false
    },
    /**
     * Renders the checkbox in the indeterminate state.
     */
    indeterminate: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
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
    }
  }
})
</script>

<style lang="scss" module>
.Checkbox {
  position: relative;
  width: 100%;
}

.Content {
  padding-left: 24px;
}
</style>
