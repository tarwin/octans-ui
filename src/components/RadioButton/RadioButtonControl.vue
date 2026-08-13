<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  name: 'RadioButtonControl',
  setup(props) {
    return () => {
      const $styles = useCssModule()

      return h('input', {
        // ...context.attrs,
        class: [
          $styles.RadioButtonControl,
          props.error && $styles.error,
          props.readonly && $styles.readonly
        ],
        name: props.name,
        type: 'radio',
        checked: props.checked,
        disabled: props.disabled,
        onClick:
          props.readonly &&
          function (event: MouseEvent) {
            event.preventDefault()
          }
      })
    }
  },
  props: {
    name: {
      type: String
    },
    checked: {
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
    error: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
@import '../../styles/variables';

$shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
$disabledColor: var(--octans-text-disabled);

.RadioButtonControl {
  position: relative;
  display: inline-block;
  width: 16px;
  height: 16px;
  padding: 0;
  margin: 0;
  border: 1px solid var(--octans-border-input);
  border-radius: 50%;
  background: linear-gradient(
    to bottom,
    var(--octans-surface),
    var(--octans-surface-sunken)
  );
  box-shadow:
    0 0 0 1px transparent,
    $shadow;
  appearance: none;
  outline: none;

  &:checked,
  &:focus {
    border-color: $focusColor;
  }

  &:checked:after {
    content: '';
    position: relative;
    top: 50%;
    left: 50%;
    display: block;
    width: 8px;
    height: 8px;
    transform: translate(-50%, -50%);
    background: $focusColor;
    border-radius: 50%;
  }

  &:focus {
    box-shadow:
      0 0 0 1px $focusColor,
      $shadow;
    outline: none;
  }

  &.error {
    background: var(--octans-error-surface);
    border-color: $errorColor;

    &:focus {
      box-shadow:
        0 0 0 1px $errorColor,
        $shadow;
    }

    &:after {
      background: $errorColor;
    }
  }

  &:disabled {
    background: var(--octans-surface-sunken);
    box-shadow: none;
    border-color: $disabledColor;
    cursor: $inputDisabledCursor;
    &:after {
      background: $disabledColor;
    }
  }

  &.readonly {
    cursor: $inputReadonlyCursor;
  }
}
</style>
