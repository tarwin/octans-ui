<script lang="ts" setup>
import { computed, useCssModule, useSlots, type CSSProperties } from 'vue'
import { capitalize } from '../../utils'
import type { DividerProps } from './types'

/**
 * A rule between two groups of content, optionally with a label sitting in it.
 *
 * Spacing is margin rather than padding, which is what lets it drop into a
 * container that already spaces its children — `FormLayout`, a `Stack` — and
 * take the room that is already there instead of adding a second gap.
 *
 * A plain divider is a `separator` to assistive technology. A labelled one is
 * not: `separator` makes its children presentational, so the label would be
 * announced by nobody. There the visible text does the separating, which is
 * what a sighted reader is getting from it too.
 */
const props = withDefaults(defineProps<DividerProps>(), {
  vertical: false,
  spacing: undefined,
  placement: 'center',
  dashed: false,
  bleed: false
})

const slots = useSlots()
const $style = useCssModule()

const hasLabel = computed(() => Boolean(slots.default))

const bleeding = computed(() => props.bleed !== false)

const placementClass = computed(() =>
  hasLabel.value ? $style[`placement${capitalize(props.placement)}`] : undefined
)

const spacingClass = computed(() =>
  props.spacing ? $style[`spacing${capitalize(props.spacing)}`] : undefined
)

const styles = computed<CSSProperties>(() => {
  const { bleed } = props
  // `true` leans on the CSS default, which is CardSection's padding.
  if (bleed === false || bleed === true) return {}
  const length = typeof bleed === 'number' ? `${bleed}px` : bleed
  return { '--Divider-bleed': length } as CSSProperties
})
</script>

<template>
  <div
    :class="[
      'UIElement',
      $style.Divider,
      vertical ? $style.vertical : $style.horizontal,
      hasLabel && $style.labelled,
      placementClass,
      spacingClass,
      dashed && $style.dashed,
      bleeding && $style.bleed
    ]"
    :style="styles"
    :role="hasLabel ? undefined : 'separator'"
    :aria-orientation="!hasLabel && vertical ? 'vertical' : undefined"
  >
    <!--
      `start` and `end` drop the line on the label's near side rather than
      shortening it, which is the whole difference between them and
      `left`/`right`. Leaving a zero-width line in place would not do: the gap
      between the two would still push the label off the edge.
    -->
    <template v-if="hasLabel">
      <span
        v-if="placement !== 'start'"
        :class="$style.line"
      />
      <span :class="[$style.label, 'Divider-label']"><slot /></span>
      <span
        v-if="placement !== 'end'"
        :class="$style.line"
      />
    </template>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

// Every value below is read through a custom property with the default written
// as its fallback, rather than declared on `.Divider` itself. Declaring them
// here would look equivalent and quietly break the useful case: a property set
// on the root beats one inherited from an ancestor, so a container setting
// `--Divider-color` for all the dividers inside it would have no effect.
// Prop-driven classes still override, because those are declared on the root.
$rule-color: var(--Divider-color, var(--octans-border));
$rule-thickness: var(--Divider-thickness, 1px);
$rule-style: var(--Divider-style, solid);
$spacing: var(--Divider-spacing, #{$s4});
$bleed: var(--Divider-bleed, #{$s4});
$label-gap: var(--Divider-labelGap, #{$s3});
// How much line is left on the short side of an off-centre label.
$label-inset: var(--Divider-labelInset, 32px);

.Divider {
  border: 0;
}

.dashed {
  --Divider-style: dashed;
}

// --- horizontal --------------------------------------------------------------

.horizontal {
  // The element IS the line when there is no label — one box, nothing nested.
  display: block;
  margin-block: $spacing;
  border-top: $rule-thickness $rule-style $rule-color;
}

.horizontal.labelled {
  display: flex;
  align-items: center;
  gap: $label-gap;
  border-top: 0;

  .line {
    flex: 1 1 auto;
    border-top: $rule-thickness $rule-style $rule-color;
  }
}

.horizontal.placementLeft .line:first-child,
.horizontal.placementRight .line:last-child {
  flex: 0 0 $label-inset;
}

// --- vertical ----------------------------------------------------------------

.vertical {
  display: inline-block;
  // Three fallbacks, because there are three ways it gets used: stretched by a
  // flex parent, filling a parent with a height of its own, or standing among
  // inline text with nothing to measure against.
  align-self: stretch;
  height: 100%;
  min-height: 1em;
  margin-inline: $spacing;
  vertical-align: middle;
  border-left: $rule-thickness $rule-style $rule-color;
}

.vertical.labelled {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: $label-gap;
  border-left: 0;

  .line {
    flex: 1 1 auto;
    border-left: $rule-thickness $rule-style $rule-color;
  }
}

.vertical.placementLeft .line:first-child,
.vertical.placementRight .line:last-child {
  flex: 0 0 $label-inset;
}

// --- shared ------------------------------------------------------------------

.label {
  // A flex row so an icon beside the text lines up on its centre. Left inline,
  // an icon sits on the text baseline and reads a couple of pixels low.
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  // Between an icon and its text, not between the label and the lines — that
  // one is `--Divider-labelGap`. Relative, so it tracks the label's own size.
  gap: 0.4em;
  color: var(--Divider-labelColor, var(--octans-text-subdued));
  white-space: nowrap;
}

.bleed.horizontal {
  margin-inline: calc(-1 * #{$bleed});
}

.bleed.vertical {
  margin-block: calc(-1 * #{$bleed});
}

.spacingNone {
  --Divider-spacing: 0px;
}
.spacingExtraTight {
  --Divider-spacing: 4px;
}
.spacingTight {
  --Divider-spacing: 8px;
}
.spacingLoose {
  --Divider-spacing: 20px;
}
.spacingExtraLoose {
  --Divider-spacing: 32px;
}
</style>
