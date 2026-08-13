<script lang="ts" setup>
import { computed, nextTick, ref, useCssModule, useId } from 'vue'
import { Icon } from '@/components/Icon'
import { Labelled } from '@/components/Labelled'
import { capitalize } from '../../utils'
import type { SegmentedControlProps, SegmentedOptionType } from './types'

/**
 * A joined row of segments where exactly one is selected — the control for
 * picking between a handful of mutually exclusive values with all of them on
 * screen: Day / Week / Month, list / grid, Light / Dark / System.
 *
 * It is a `<input type="radio">` per segment, visually hidden inside its label.
 * That is deliberate and it is what the whole component rests on: the browser
 * then gives us one tab stop for the group, arrow keys between the segments
 * that skip disabled ones and wrap, "selected, 2 of 4" announced, and a value
 * that submits with a plain form. Hand-rolling `role="radiogroup"` and a roving
 * tabindex would be eighty lines reimplementing all of that slightly worse.
 *
 * The one consequence worth knowing: native radios mean SELECTION FOLLOWS
 * FOCUS, so arrowing across the control emits at every stop. That is the
 * correct behaviour for a radio group — and what a macOS segmented control
 * does — but a consumer swapping an expensive view on each change will want to
 * debounce it.
 *
 * It is a CONTROLLED component: what is selected is whatever `modelValue` says,
 * and a control with nothing bound to it will not move when clicked. That is
 * the price of the visible state and the announced state always agreeing.
 *
 * Not to be confused with `Tabs`, which switches which panel of content you are
 * looking at, or `ButtonGroup segmented`, which joins actions and selects
 * nothing.
 */
const props = withDefaults(defineProps<SegmentedControlProps>(), {
  options: () => [],
  modelValue: undefined,
  size: 'medium',
  fullWidth: false,
  vertical: false,
  disabled: false,
  readonly: false,
  name: undefined,
  // The global tooltip CSS gives a bubble no coordinates at all unless it is
  // told a side, which lands it at its static position — squarely on top of the
  // segment it is describing.
  tooltipPosition: 'top',
  ariaLabel: undefined,
  label: undefined,
  error: undefined,
  helpText: undefined,
  helpLink: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  /**
   * The same change as `update:modelValue`, with the whole option alongside it
   * — for the common case of needing the label or icon of what was picked.
   */
  (e: 'change', value: any, option: SegmentedOptionType): void
}>()

const $style = useCssModule()

// Radios only behave as a group when they share a `name`. Unnamed ones are
// each their own group of one: every segment becomes a tab stop and the arrow
// keys do nothing. Generating a name means nobody has to know that.
const generatedName = useId()
const groupName = computed(
  () => props.name || `SegmentedControl-${generatedName}`
)

const inputs = ref<HTMLInputElement[]>([])

const isSelected = (option: SegmentedOptionType) =>
  option.value === props.modelValue

const isDisabled = (option: SegmentedOptionType) =>
  props.disabled || Boolean(option.disabled)

const sizeClass = computed(() => $style[`size${capitalize(props.size)}`])

/**
 * An icon with no label is a picture to a screen reader. `tooltip` is the only
 * text such a segment has, so it stands in as the name — and a segment with
 * neither is left nameless rather than given a fabricated one.
 */
const accessibleName = (option: SegmentedOptionType) =>
  option.label ? undefined : option.tooltip

function onChange(option: SegmentedOptionType) {
  if (!props.readonly && !isDisabled(option) && !isSelected(option)) {
    emit('update:modelValue', option.value)
    emit('change', option.value, option)
  }
  // Whatever came of that, the checkmark the browser has ALREADY moved has to
  // end up where the model says. When the model doesn't follow — readonly, or
  // simply nothing bound — the two halves of the control would otherwise
  // disagree: what you see is painted from the model, and what a screen reader
  // announces is read off the radio. One saying "Week" while the other says
  // "Day" is the worst of the available outcomes.
  //
  // On `nextTick`, so it runs after any re-render the emit caused. Sooner and
  // it would put the checkmark back on the old segment moments before the new
  // model arrives to move it again.
  nextTick(syncChecked)
}

function syncChecked() {
  inputs.value.forEach((input, index) => {
    const option = props.options[index]
    if (input && option) input.checked = isSelected(option)
  })
}
</script>

<template>
  <Labelled
    :label="label"
    :error="error"
    :help-text="helpText"
    :help-link="helpLink"
  >
    <div
      role="radiogroup"
      :aria-label="typeof label === 'string' ? label : ariaLabel"
      :aria-orientation="vertical ? 'vertical' : 'horizontal'"
      :aria-readonly="readonly || undefined"
      :class="[
        $style.SegmentedControl,
        sizeClass,
        fullWidth && $style.fullWidth,
        vertical && $style.vertical,
        readonly && $style.readonly,
        Boolean(error) && $style.error
      ]"
      :aria-invalid="error ? 'true' : undefined"
    >
      <label
        v-for="(option, index) in options"
        :key="index"
        :class="[
          $style.segment,
          'SegmentedControl-segment',
          isSelected(option) && [$style.selected, 'SegmentedControl-selected'],
          isDisabled(option) && $style.optionDisabled
        ]"
        :data-ui-tooltip="option.tooltip || undefined"
        :data-ui-tooltip-position="option.tooltip ? tooltipPosition : undefined"
      >
        <input
          ref="inputs"
          type="radio"
          :class="$style.input"
          :name="groupName"
          :checked="isSelected(option)"
          :disabled="isDisabled(option)"
          :aria-label="accessibleName(option)"
          @change="onChange(option)"
        />
        <span :class="$style.content">
          <!--
            The slot replaces the segment's contents rather than adding to
            them, so a consumer rendering their own can still lean on the
            label / icon defaults for the segments they don't.
          -->
          <slot
            name="option"
            :option="option"
            :index="index"
            :selected="isSelected(option)"
          >
            <Icon
              v-if="option.icon"
              :icon="option.icon"
              :class="$style.icon"
            />
            <span
              v-if="option.label != null"
              :class="$style.label"
              >{{ option.label }}</span
            >
          </slot>
        </span>
      </label>
    </div>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';

// Defaults are written as usage-site fallbacks rather than declared on the
// root, the same as `Divider`: a property declared on the root BEATS the same
// property inherited from an ancestor, so a container setting
// `--SegmentedControl-selectedColor` for everything inside it would silently
// do nothing.
$track-color: var(--SegmentedControl-trackColor, var(--octans-surface-sunken));
$selected-color: var(
  --SegmentedControl-selectedColor,
  var(--octans-surface-raised)
);
// Paired with the two above: a track or a selected segment recoloured to
// something strong needs its label recoloured with it, and leaving that to a
// hashed class name would mean nobody could.
$text-color: var(--SegmentedControl-textColor, var(--octans-text-subdued));
$selected-text-color: var(
  --SegmentedControl-selectedTextColor,
  var(--octans-text)
);
// Set this to `transparent` alongside a strong `selectedColor` — an outline in
// the neutral border colour around a saturated fill reads as a mistake.
$selected-border-color: var(
  --SegmentedControl-selectedBorderColor,
  var(--octans-border)
);
$radius: var(--octans-radius-field);
// The track's own padding, which is also the gap between the selected segment
// and the track's edge.
$inset: 2px;

.SegmentedControl {
  display: inline-flex;
  padding: $inset;
  background: $track-color;
  border-radius: $radius;
}

// The message from `Labelled` says what is wrong; this says which control it is
// about, the same way a `TextField` in error takes a red border rather than
// leaving the sentence beneath it to be matched up by eye. Drawn as a ring so
// it costs no layout — a real border would move the segments by a pixel.
.error {
  box-shadow: 0 0 0 1px $inputErrorBorderColor;
}

.segment {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  min-height: 32px;
  // Inner corners sit inside the track's, or the selected segment's fill
  // shoulders past it at the ends. `max()` because a square theme sets the
  // field radius to 0 and this would go negative.
  border-radius: max(0px, calc(#{$radius} - #{$inset}));
  color: $text-color;
  font-size: 14px;
  line-height: 16px;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  // A wash under the segment being pointed at, not just a darker label. It also
  // keeps hover and selected apart: hover goes DOWN from the track, selected
  // goes up off it.
  &:hover {
    background: var(--octans-surface-hover);
    color: $selected-text-color;
  }
}

.selected,
.selected:hover {
  background: $selected-color;
  // The ring is doing most of the work, and it has to. In the light theme the
  // selected segment is `surface` (#fff) sitting on `surface-sunken` (#f8f9fb)
  // — about two percent of luminance between them — and `shadow-control` is a
  // 5% hairline, which is right for seating a button on a page and far too
  // quiet to be the only thing marking a selection. Dark had no such problem:
  // neutral-800 on neutral-950 is a real step. So: an outline plus the deeper
  // `shadow-sm`, and the light theme stops relying on a difference nobody can
  // see. `box-shadow` rather than `border`, so nothing moves by a pixel.
  box-shadow:
    0 0 0 1px $selected-border-color,
    var(--octans-shadow-sm);
  color: $selected-text-color;
  cursor: default;
}

.optionDisabled,
.optionDisabled:hover {
  color: var(--octans-text-disabled);
  cursor: not-allowed;
}

.readonly .segment,
.readonly .segment:hover {
  cursor: default;
}

// Fills the segment, so it — and not the label box — is what the focus ring is
// drawn around. `:focus-visible` rather than `:focus` is what keeps the ring
// off a segment picked with the mouse.
.content {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  padding: 5px 10px;
  border-radius: inherit;
}

.input:focus-visible + .content {
  box-shadow: 0 0 0 2px $focusColor;
}

.input {
  // Hidden, NOT removed: `display: none` and `visibility: hidden` both take the
  // radio out of the tab order, and every keyboard behaviour this component
  // exists to inherit goes with it.
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  border: 0;
  clip-path: inset(50%);
  white-space: nowrap;
}

.icon {
  flex: 0 0 auto;
  font-size: 1.15em;
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// --- layout ------------------------------------------------------------------

.fullWidth {
  display: flex;
  width: 100%;

  .segment {
    // `0` basis, not `auto`: equal shares of the container regardless of how
    // long each label is.
    flex: 1 1 0;
    min-width: 0;
  }
}

.vertical {
  flex-direction: column;
}

// --- sizes -------------------------------------------------------------------
//
// Segment heights are Button's, less the track's padding top and bottom, so a
// segmented control and a button of the same size are the same height overall:
// 30, 36 and 44px.

.sizeSmall {
  .segment {
    min-height: 26px;
  }
  .content {
    padding: 4px 8px;
  }
}

.sizeLarge {
  .segment {
    min-height: 40px;
  }
  .content {
    padding: 11px 22px;
    font-size: 16px;
  }
}
</style>
