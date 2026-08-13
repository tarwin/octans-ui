<script lang="ts">
import {
  defineComponent,
  useCssModule,
  h,
  mergeProps,
  type PropType
} from 'vue'
import { Icon } from '@/components/Icon'
import { InlineError } from '@/components/InlineError'

export default defineComponent({
  name: 'Choice',
  setup(props, context) {
    return () => {
      const styles = useCssModule()
      const slots = context.slots

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
              class: styles.HelpIcon,
              icon: 'mdi:information'
            })
          ]
        )

      const labelMarkup = h(
        'label',
        {
          class: [
            'UIElement',
            styles.Label_wrapper,
            props.disabled && styles.disabled,
            props.readonly && styles.readonly
          ],
          'data-ui-tooltip': props.tooltip,
          'data-ui-tooltip-position': props.tooltipPosition
        },
        [
          h(
            'span',
            {
              class: styles.Control
            },
            slots.default && slots.default()
          ),
          h(
            'span',
            {
              class: styles.Label
            },
            [props.label, helpLinkMarkup]
          )
        ]
      )

      const helpTextMarkup =
        props.helpText &&
        h(
          'div',
          {
            class: styles.HelpText
          },
          props.helpText
        )

      const errorMarkup =
        props.error &&
        h(InlineError, {
          class: styles.Error,
          message: props.error
        })

      return h(
        'div',
        // mergeProps so an external class/style merges with (rather than
        // overwrites) the UIElement + Choice classes.
        mergeProps({ class: ['UIElement', styles.Choice] }, context.attrs),
        [
          labelMarkup,
          errorMarkup,
          helpTextMarkup,
          slots.content && slots.content()
        ]
      )
    }
  },
  props: {
    label: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    helpText: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders a help icon next to the label which links to an external page.
     */
    helpLink: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    error: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    type: {
      type: String,
      default: 'checkbox'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    value: {
      type: null,
      default: undefined
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

<style module lang="scss">
@import '../../styles/mixins';
@import '../../styles/variables';

.Label_wrapper {
  display: inline-flex;
  justify-content: flex-start;
  padding: 4px 0;
}

.disabled {
  cursor: $inputDisabledCursor;
}
.readonly {
  cursor: $inputReadonlyCursor;
}

.Control {
  display: flex;
  align-items: stretch;
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  margin-right: 8px;
  // border: 1px solid red;
}

.Label {
  @include inputLabel;

  .disabled & {
    color: var(--octans-text-disabled);
  }
}

.Error,
.HelpText {
  padding-left: 24px;
}

.Error {
  margin: 0;
}

.HelpText {
  @include inputHelpText;
}

.HelpIcon {
  margin-left: 5px;
  color: var(--octans-text-subdued);
  &:hover {
    color: var(--octans-text);
    cursor: pointer;
  }
}
</style>
