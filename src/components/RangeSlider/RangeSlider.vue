<script lang="ts">
import { Labelled } from '@/components/Labelled'
import { TextField } from '@/components/TextField'
import { clamp } from '@/utils'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'RangeSlider',
  components: {
    Labelled,
    TextField
  },
  props: {
    /**
     * Label for the control.
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
     * Renders help text as raw HTML. Use with caution.
     */
    helpTextHtml: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders a help icon next to the label which links to an external page.
     */
    helpLink: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Disables the control and prevents all interaction.
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Prevents the control value from being edited.
     */
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * The value of the control.
     */
    modelValue: {
      type: Number,
      default: 0
    },
    /**
     * The minimum value allowed.
     */
    min: {
      type: Number
    },
    /**
     * The maximum value allowed.
     */
    max: {
      type: Number
    },
    /**
     * Passes this value to the step attribute of the input element.
     *
     * If it's a float number the tooltip will show decimal values.
     */
    step: {
      type: Number
    },
    /**
     * Shows a text input field next to the slider for direct value entry.
     */
    showInput: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localValue: 0
    }
  },
  computed: {
    cssVars() {
      const { localValue, min, max } = this
      const clamped = clamp(localValue, min || 0, max || 100)
      const factor = (clamped - (min || 0)) / ((max || 100) - (min || 0))
      const progress =
        ((clamped - (min || 0)) * 100) / ((max || 100) - (min || 0))
      return {
        '--factor': `${factor}`,
        '--progress': `${progress}%`
      }
    }
  },
  beforeMount() {
    this.$watch('modelValue', (value) => {
      this.localValue = value
    })
    this.localValue = this.modelValue
  },
  methods: {
    changeValue(value: any) {
      let rangeSliderValue
      if (this.step && !Number.isInteger(this.step)) {
        rangeSliderValue = parseFloat(value)
      } else {
        rangeSliderValue = parseInt(value, 10)
      }
      this.localValue = rangeSliderValue
      this.$emit('update:modelValue', rangeSliderValue)
    },
    onInput(event: any) {
      this.changeValue((event.target as HTMLInputElement).value)
    },
    onChange(event: any) {
      this.changeValue((event.target as HTMLInputElement).value)
    },
    onTextInput(value: any, event: Event) {
      const number = value || 0
      const clamped = clamp(number, this.min || 0, this.max || 100)
      ;(event.target as HTMLInputElement).value = String(clamped)
      this.localValue = clamped
      this.$emit('update:modelValue', clamped)
    }
  }
})
</script>

<template>
  <Labelled
    :label="label"
    :error="error"
    :help-text="helpText"
    :help-text-html="helpTextHtml"
    :help-link="helpLink"
  >
    <div :class="$style.InputGroup">
      <div
        :class="[
          $style.RangeSlider,
          disabled && $style.disabled,
          readonly && $style.readonly
        ]"
        :style="cssVars"
      >
        <input
          type="range"
          :class="[$style.Input, readonly && $style.Input_readonly]"
          :min="min"
          :step="step"
          :max="max"
          :value="localValue"
          :disabled="disabled || readonly"
          @input="onInput"
          @change="onChange"
        />
        <output :class="$style.Output">{{ localValue }}</output>
      </div>
      <TextField
        v-if="showInput"
        :class="$style.TextField"
        :model-value="localValue"
        type="number"
        :min="min"
        :step="step"
        :max="max"
        :disabled="disabled"
        :readonly="readonly"
        @input="onTextInput"
      />
    </div>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';
$trackHeight: 4px;
$thumbSize: 24px;
$progressEmptyColor: var(--octans-border-input);
$progressFullColor: $focusColor;

@mixin track {
  height: $trackHeight;
  box-sizing: border-box;
  border: none;
  border-radius: var(--octans-radius-field);
  background: $progressEmptyColor;
  background: linear-gradient(
    to right,
    $progressFullColor 0%,
    $progressFullColor var(--progress, 0%),
    $progressEmptyColor var(--progress, 0%),
    $progressEmptyColor 100%
  );
}

@mixin thumb {
  box-sizing: border-box;
  border: none;
  width: $thumbSize;
  height: $thumbSize;
  border-radius: 50%;
  box-shadow: 0 0 2px var(--octans-text);
  background: linear-gradient(
    to bottom,
    var(--octans-surface),
    var(--octans-surface-sunken)
  );
  &:hover {
    cursor: grab;
  }
  &:active {
    cursor: grabbing;
  }
}

@mixin thumbFocus {
  box-shadow: 0 0 0 2px $focusColor;
}

@mixin trackContent {
  &::-webkit-slider-runnable-track {
    @content;
  }
  &::-moz-range-track {
    @content;
  }
  &::-ms-track {
    @content;
  }
}

@mixin thumbContent {
  &::-webkit-slider-thumb {
    @content;
  }
  &::-moz-range-thumb {
    @content;
  }
  &::-ms-thumb {
    @content;
  }
}

.InputGroup {
  display: flex;
  gap: 16px;
  align-items: center;
}

.RangeSlider {
  flex: 1;
  position: relative;

  &:not(.disabled),
  &:not(.disabled).readonly {
    &:hover .Output,
    &:focus-within .Output {
      opacity: 1;
    }
  }
}

/* https://css-tricks.com/sliding-nightmare-understanding-range-input/ */
.Input {
  flex: 1;
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: $thumbSize;
  background: transparent;
  outline: none;
  cursor: pointer;
  font: inherit;

  &,
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
  }

  &::-webkit-slider-runnable-track {
    @include track;
  }
  &::-moz-range-track {
    @include track;
  }
  &::-ms-track {
    @include track;
  }

  &::-webkit-slider-thumb {
    margin-top: 0.5 * ($trackHeight - $thumbSize);
    @include thumb;
  }
  &::-moz-range-thumb {
    @include thumb;
  }
  &::-ms-thumb {
    margin-top: 0;
    @include thumb;
  }

  &::-ms-tooltip {
    display: none;
  }

  &:focus {
    &::-webkit-slider-thumb {
      @include thumbFocus;
    }
    &::-webkit-slider-thumb {
      @include thumbFocus;
    }
    &::-moz-range-thumb {
      @include thumbFocus;
    }
    &::-ms-thumb {
      @include thumbFocus;
    }
  }

  &:disabled.Input_readonly {
    cursor: $inputReadonlyCursor;
    @include trackContent {
      cursor: $inputReadonlyCursor;
    }
    @include thumbContent {
      cursor: $inputReadonlyCursor;
    }
  }
  &:disabled:not(.Input_readonly) {
    cursor: $inputDisabledCursor;
    @include trackContent {
      background: $progressEmptyColor;
      cursor: $inputDisabledCursor;
    }
    @include thumbContent {
      box-shadow: 0 0 0 2px $progressEmptyColor;
      cursor: $inputDisabledCursor;
    }
  }
}

.Output {
  display: block;
  position: absolute;
  left: 0.5 * $thumbSize;
  top: 0;
  padding: 0.25em 0.5em;
  border-radius: var(--octans-radius-field);
  left: var(--progress, 0%);
  transform: translate(calc((-100% * var(--factor, 0))), -35px);
  background: var(--octans-text);
  color: var(--octans-surface-hover);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.TextField {
  flex: 0 1 40px;
  div {
    min-height: 0 !important;
  }
  input {
    min-height: 0;
    text-align: center;
    padding: 4px 6px;
  }

  // https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }
}
</style>
