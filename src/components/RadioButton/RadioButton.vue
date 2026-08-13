<script lang="ts">
import { Choice } from '@/components/Choice'
import { defineComponent, h, type PropType, useCssModule } from 'vue'
import RadioButtonControl from './RadioButtonControl.vue'

export default defineComponent({
  name: 'RadioButton',
  emits: ['change', 'update:modelValue'],
  setup(props, context) {
    return () => {
      const $style = useCssModule()

      // `trueValue` has no default, so a radio bound to neither prop would
      // compare `undefined === undefined` and render itself checked. Requiring
      // a defined `trueValue` is what keeps an unbound radio empty; `checked`
      // is the deliberate way to show one filled in, as on Checkbox.
      const isChecked =
        (props.trueValue !== undefined &&
          props.modelValue === props.trueValue) ||
        props.checked
      const controlMarkup = h(
        'div',
        {
          class: $style.RadioButton
        },
        [
          h(RadioButtonControl, {
            name: props.name,
            checked: isChecked,
            disabled: props.disabled,
            readonly: props.readonly,
            error: !!props.error,
            onChange() {
              context.emit('change', props.trueValue)
              context.emit('update:modelValue', props.trueValue)
            }
          })
        ]
      )

      return h(
        Choice,
        {
          label: props.label,
          error: props.error,
          helpText: props.helpText,
          helpLink: props.helpLink,
          disabled: props.disabled,
          readonly: props.readonly
        },
        {
          default: () => [controlMarkup],
          content: () => {
            if (isChecked && context.slots.default) {
              return h(
                'div',
                {
                  class: $style.Content
                },
                context.slots.default()
              )
            }
          }
        }
      )
    }
  },
  props: {
    /**
     * Label for the radio button.
     */
    label: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Error text to show below the control.
     */
    error: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Help text to show below the control.
     */
    helpText: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders a help icon next to the label which links to an external page.
     */
    helpLink: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Radio buttons with the same name will form a group.
     */
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
      type: null
    },
    /**
     * When `true` the radio button will be checked. This is an alternative
     * to assigning `modelValue` to be `trueValue`.
     */
    checked: {
      type: Boolean,
      default: false
    },
    /**
     * Disables the control visually and prevents all interaction.
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Prevents changing the control state.
     */
    readonly: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
.RadioButton {
  position: relative;
  width: 100%;
}

.Content {
  padding-left: 24px;
}
</style>
