<script lang="ts">
import { defineComponent, h, type PropType, useCssModule } from 'vue'
import { Icon } from '../Icon'
import { InlineError } from '../InlineError'

export default defineComponent({
  name: 'Labelled',
  setup(props, context) {
    return () => {
      const $style = useCssModule()

      // The tooltip needs a position or the global tooltip CSS has nothing to
      // offset against and the bubble lands on top of the icon. `top` rather
      // than `bottom` so it does not cover the control the label introduces.
      const helpLinkMarkup =
        props.helpLink &&
        h(
          'a',
          {
            href: props.helpLink,
            target: '_blank',
            'data-ui-tooltip': props.helpLinkTooltip || undefined,
            'data-ui-tooltip-position': props.helpLinkTooltip
              ? 'top'
              : undefined
          },
          [
            h(Icon, {
              class: $style.helpIcon,
              icon: props.helpLinkIcon
            })
          ]
        )

      // `aria-hidden`: the asterisk is a convention a sighted reader knows to
      // read as "required". A screen reader gets the real thing instead —
      // `aria-required` on the control, which the form components set when
      // they forward `required` here.
      const requiredMarkup =
        props.required &&
        h('span', { class: $style.requiredMark, 'aria-hidden': 'true' }, '*')

      let labelMarkup: any =
        props.label &&
        h(
          'div',
          {
            class: $style.label
          },
          [props.label, requiredMarkup, helpLinkMarkup]
        )

      const labelScopedSlot = context.slots.label
      if (labelScopedSlot) {
        labelMarkup = labelScopedSlot({
          label: props.label,
          helpLink: props.helpLink,
          required: props.required,
          className: $style.label
        })
      }

      const errorMarkup =
        props.error &&
        h(InlineError, {
          message: props.error
        })

      // The slot WRAPS the styled block rather than replacing it: help text is
      // rich inline copy that still has to read as help text. That is the
      // opposite of the `label` slot, which hands out `className` and lets the
      // caller build its own row, because a label often needs a control beside
      // it. When both the slot and the prop are given, the slot wins.
      const helpTextSlot = context.slots.helpText
      const helpText = helpTextSlot
        ? h('div', { class: $style.helpText }, helpTextSlot())
        : props.helpText &&
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
          class: 'UIElement'
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
     * The icon drawn for `helpLink` — any name the `Icon` component takes.
     *
     * Defaults to an information symbol. Change it where the link means
     * something narrower than "help": `mdi:language-markdown` beside a field
     * that accepts markdown says what the link is about before it is clicked.
     */
    helpLinkIcon: {
      type: String,
      default: 'mdi:information'
    },
    /**
     * Text shown on hovering the `helpLink` icon.
     *
     * Worth setting whenever the icon is not self-evident. The link opens in a
     * new tab, so this is the reader's only chance to find out where it goes
     * before they lose their place in the form.
     */
    helpLinkTooltip: {
      type: String,
      required: false
    },
    /**
     * Marks the field as required, drawing an asterisk after the label.
     *
     * This is the VISUAL half only. The control that owns the field is
     * responsible for the other half — `aria-required` on the input itself —
     * which every form component in the library does when it forwards this.
     *
     * It used to bold the entire field instead, which was marked deprecated
     * and did not survive: the bold inherited down into help text and the
     * control, and said nothing about the field being required.
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
.requiredMark {
  margin-left: 2px;
  color: var(--octans-text-error);
}
</style>
