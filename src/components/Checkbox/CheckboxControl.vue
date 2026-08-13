<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  name: 'CheckboxControl',
  setup(props, context) {
    return () => {
      const style = useCssModule()
      return h('input', {
        ...context.attrs,
        class: [
          style.CheckboxControl,
          props.error && style.error,
          props.readonly && style.readonly
        ],
        name: props.name,
        type: 'checkbox',
        checked: props.checked,
        disabled: props.disabled,
        indeterminate: props.indeterminate,
        onClick: (e: MouseEvent) => {
          if (props.readonly) {
            e.preventDefault()
            return
          }
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
    },
    indeterminate: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
@import '../../styles/variables';
@import '../../styles/mixins';

$shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
$disabledColor: var(--octans-text-disabled);

.CheckboxControl {
  position: relative;
  display: inline-block;
  width: 16px;
  height: 16px;
  padding: 0;
  margin: 0;
  border: 1px solid var(--octans-border-input);
  border-radius: var(--octans-radius-field);
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
  &:indeterminate,
  &:focus {
    border-color: $focusColor;
  }

  &:checked:after {
    content: '';
    position: absolute;
    top: 3px;
    left: 2px;
    display: inline-block;
    height: 6px;
    width: 10px;
    border-left: 2px solid $focusColor;
    border-bottom: 2px solid $focusColor;
    transform: rotate(-45deg);
  }

  &:indeterminate:after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    display: inline-block;
    height: 6px;
    width: 10px;
    border-bottom: 2px solid $focusColor;
  }

  &:focus {
    box-shadow:
      0 0 0 1px $focusColor,
      $shadow;
    outline: none !important;
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
      border-left-color: $errorColor;
      border-bottom-color: $errorColor;
    }
  }

  &:disabled:not(.readonly) {
    background: var(--octans-surface-sunken);
    box-shadow: none;
    border-color: $disabledColor;
    cursor: $inputDisabledCursor;
    &:after {
      border-left-color: $disabledColor;
      border-bottom-color: $disabledColor;
    }
  }

  &.readonly {
    cursor: $inputReadonlyCursor;
  }
}

@include compatMode {
  .CheckboxControl {
    margin-top: 0 !important;
  }
}
</style>
