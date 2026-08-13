<script lang="ts">
import {
  defineComponent,
  h,
  useCssModule,
  useId,
  watchEffect,
  type PropType
} from 'vue'
import { Checkbox } from '@/components/Checkbox'
import { Labelled } from '@/components/Labelled'
import { RadioButton } from '@/components/RadioButton'
import { SegmentedControl } from '@/components/SegmentedControl'
import type { ChoiceListAppearanceType, ChoiceListOptionType } from './types'

export default defineComponent({
  name: 'ChoiceList',
  emits: ['update:modelValue'],
  setup(props, context) {
    const $style = useCssModule()

    // Radios only behave as one group — a single tab stop, arrow keys moving
    // between them, "2 of 3" announced — when they share a `name`. Without one
    // each radio is its own group of one, which looks identical and is not.
    const generatedName = useId()

    watchEffect(() => {
      if (props.appearance === 'segmented' && props.multiple) {
        console.warn(
          'ChoiceList: appearance="segmented" cannot show more than one selection — rendering checkboxes instead. A segmented control is a radio group.'
        )
      }
    })

    const renderSegmented = () => {
      const selected = props.options.find(
        (choice) => choice.value === props.modelValue
      )
      const revealed = selected && selected.revealedContent

      return [
        h(SegmentedControl, {
          options: props.options.map((choice) => ({
            value: choice.value,
            label: choice.label,
            disabled: choice.disabled,
            // A segment is one line high, so per-choice help becomes the thing
            // you get on hover. `helpLink` has nowhere to go at all — an anchor
            // inside a radio's label is a link nobody can reach — so it is
            // dropped here, and a choice needing one wants the list appearance.
            tooltip: choice.helpText
          })),
          modelValue: props.modelValue,
          disabled: props.disabled,
          readonly: props.readonly,
          // The visible label belongs to the Labelled wrapper below, so the
          // group is named after it rather than growing a second one.
          ariaLabel: typeof props.label === 'string' ? props.label : undefined,
          'onUpdate:modelValue'(value: any) {
            context.emit('update:modelValue', value)
          }
        }),
        // Revealed content sits under the whole row rather than under one
        // choice — there is nowhere else for it to go, and it reads the same
        // way: the follow-up question the current answer opens up.
        revealed == null
          ? null
          : h('div', { class: [$style.Revealed, 'ChoiceList-revealed'] }, [
              revealed as never
            ])
      ]
    }

    const renderChoices = () =>
      props.options.map((choice) => {
        // Passed as the choice's default slot, which Checkbox / RadioButton
        // reveal only while that choice is selected. Left undefined when there
        // is nothing to reveal, so no empty wrapper is rendered.
        const revealed = choice.revealedContent
        const revealedSlot =
          revealed == null ? undefined : () => [revealed as never]
        if (props.multiple) {
          const isChecked =
            props.modelValue && props.modelValue.indexOf(choice.value) > -1
          return h(
            Checkbox,
            {
              label: choice.label,
              helpText: choice.helpText,
              helpLink: choice.helpLink,
              disabled: choice.disabled || props.disabled,
              readonly: choice.readonly || props.readonly,
              checked: isChecked,
              onChange(val: any) {
                // `multiple` expects an array model, but an unset one is a
                // normal starting state — treat it as empty rather than
                // throwing on the first click.
                const newValue = Array.isArray(props.modelValue)
                  ? props.modelValue.slice(0)
                  : []
                const index = newValue.indexOf(choice.value)
                if (val) {
                  if (index === -1) {
                    newValue.push(choice.value)
                  }
                } else if (index >= 0) {
                  newValue.splice(index, 1)
                }
                context.emit('update:modelValue', newValue)
              }
            },
            revealedSlot
          )
        }
        return h(
          RadioButton,
          {
            // Shared by every radio in this list, and nothing else — that is
            // what makes them a group.
            name: props.name || `ChoiceList-${generatedName}`,
            label: choice.label,
            helpText: choice.helpText,
            helpLink: choice.helpLink,
            disabled: choice.disabled || props.disabled,
            readonly: choice.readonly || props.readonly,
            trueValue: choice.value,
            modelValue: props.modelValue,
            onChange(newVal: any) {
              context.emit('update:modelValue', newVal)
            }
          },
          revealedSlot
        )
      })

    return () => {
      const segmented = props.appearance === 'segmented' && !props.multiple

      return h(
        Labelled,
        {
          // ...context.attrs,
          label: props.label,
          error: props.error,
          helpText: props.helpText,
          helpLink: props.helpLink
        },
        () => [segmented ? renderSegmented() : renderChoices()]
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
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders a help icon next to the label which links to an external page.
     */
    helpLink: {
      type: String
    },
    /**
     * The choices to render. See `ChoiceListOptionType`, which is exported.
     *
     * ```ts
     * interface ChoiceListOptionType {
     *   label: string
     *   value: any
     *   helpText?: string
     *   helpLink?: string
     *   disabled?: boolean
     *   readonly?: boolean
     *   // shown only while this choice is selected
     *   revealedContent?: string | VNode
     * }
     * ```
     */
    options: {
      type: Array as PropType<ChoiceListOptionType[]>,
      // Defaulted rather than `required`: a list whose options are still
      // loading renders as its label and nothing else, instead of throwing.
      default: () => []
    },
    /**
     * How the choices are drawn.
     *
     *   - `list` — one control per line, which is what most questions want.
     *   - `segmented` — a joined row of segments, for two to five short labels
     *     where showing them all at once is worth the width.
     *
     * `segmented` is the same radio group underneath, so the model and the
     * events are unchanged. It has no room for `helpLink` or per-choice
     * `readonly`, and per-choice `helpText` becomes a tooltip. For icons in
     * the segments, reach for `SegmentedControl` directly.
     */
    appearance: {
      type: String as PropType<ChoiceListAppearanceType>,
      default: 'list'
    },
    /**
     * If `true`, renders using a list of checkboxes and expects `value` to
     * be an array.
     *
     * Ignored by `appearance="segmented"`, which is a radio group and can only
     * hold one answer — it falls back to the list and warns.
     */
    multiple: {
      type: Boolean,
      default: false
    },
    /**
     * The `name` shared by the radios this renders, so they behave as one
     * group. Generated when unset; only worth setting to submit the value with
     * a plain HTML form. Unused by `multiple`, whose checkboxes are unrelated
     * to each other.
     */
    name: {
      type: String
    },
    /**
     * Disable all the options.
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Makes all options readonly.
     */
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * An array if using `multiple`, otherwise any value.
     */
    modelValue: {
      type: null
    }
  }
})
</script>

<style lang="scss" module>
@import '../../styles/variables';

.Revealed {
  margin-top: $s2;
}
</style>
