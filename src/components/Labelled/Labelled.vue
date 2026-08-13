<script lang="ts">
import { defineComponent, h, type PropType, useCssModule } from 'vue'
import { Icon } from '../Icon'
import { InlineError } from '../InlineError'

export default defineComponent({
  name: 'Labelled',
  setup(props, context) {
    return () => {
      const $style = useCssModule()

      const helpLinkMarkup =
        props.helpLink &&
        h(
          'a',
          {
            href: props.helpLink,
            target: '_blank'
          },
          [
            h(Icon, {
              class: $style.helpIcon,
              icon: 'mdi:information'
            })
          ]
        )

      let labelMarkup: any =
        props.label &&
        h(
          'div',
          {
            class: $style.label
          },
          [props.label, helpLinkMarkup]
        )

      const labelScopedSlot = context.slots.label
      if (labelScopedSlot) {
        labelMarkup = labelScopedSlot({
          label: props.label,
          helpLink: props.helpLink,
          className: $style.label
        })
      }

      const errorMarkup =
        props.error &&
        h(InlineError, {
          message: props.error
        })

      const helpText =
        props.helpText &&
        h(
          'div',
          {
            class: $style.helpText
          },
          [props.helpText]
        )

      const helpTextHtml =
        props.helpTextHtml &&
        h('div', {
          class: $style.helpText,
          innerHTML: props.helpTextHtml
        })

      return h(
        'div',
        {
          ...context.attrs,
          class: ['UIElement', props.required && $style.required]
        },
        [
          labelMarkup,
          context.slots.default && context.slots.default(),
          errorMarkup,
          helpText,
          helpTextHtml
        ]
      )
    }
  },
  props: {
    /**
     * The title of the field. Also accepts `false` so it can be fed
     * directly from a condition, e.g. `:label="showLabel && 'Some label'"`.
     */
    label: {
      type: [String, Boolean] as PropType<string | false | null>,
      required: false
    },
    /**
     * Displays the value as an error message below the slot content. Also
     * accepts `false` so it can be fed directly from a condition, e.g.
     * `:error="hasError && 'Some message'"`.
     */
    error: {
      type: [String, Boolean] as PropType<string | false | null>,
      required: false
    },
    /**
     * Displays the value as help text below the slot content. Also accepts
     * `false` so it can be fed directly from a condition, e.g.
     * `:help-text="condition && 'Some text'"`.
     */
    helpText: {
      type: [String, Boolean] as PropType<string | false | null>,
      required: false
    },
    /**
     * Renders help text as raw HTML. Use with caution. Also accepts `false`
     * so it can be fed directly from a condition.
     */
    helpTextHtml: {
      type: [String, Boolean] as PropType<string | false | null>,
      required: false
    },
    /**
     * Renders a help icon next to the label which links to an external
     * page. Also accepts `false` so it can be fed directly from a
     * condition, e.g. `:help-link="condition && 'https://example.com'"`.
     */
    helpLink: {
      type: [String, Boolean] as PropType<string | false | null>,
      required: false
    },
    /**
     * @deprecated Makes the label title bold.
     */
    required: {
      type: Boolean,
      required: false
    }
  }
})
</script>

<style lang="scss" module>
.label {
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 20px;
}
.error {
  margin-top: 4px;
  color: var(--octans-text-error);
  font-size: 14px;
  line-height: 20px;
}
.helpIcon {
  margin-left: 5px;
  color: var(--octans-text-subdued);
  &:hover {
    color: var(--octans-text);
    cursor: pointer;
  }
}
.helpText {
  margin-top: 4px;
  color: var(--octans-text-subdued);
  font-size: 14px;
  line-height: 20px;
}
.required {
  font-weight: bold;
}
</style>
