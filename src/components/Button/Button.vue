<script lang="ts">
import {
  computed,
  defineComponent,
  h,
  useCssModule,
  type PropType,
  type VNode
} from 'vue'
import { capitalize, vnodeHasContent } from '../../utils'
import { Icon, iconBadgeConfig } from '../Icon'
import { UnstyledLink } from '../UnstyledLink'
import type {
  ActionColorType,
  ActionTooltipPositionType,
  ActionTypeType,
  IconBadgeStatusType,
  IconBadgeType
} from '../types'

const badgeStatuses: IconBadgeStatusType[] = [
  'info',
  'success',
  'warning',
  'error'
]

/**
 * Buttons are used primarily for actions, such as “Add”, “Close”, “Cancel”, or
 * “Save”. Plain buttons, which look similar to links, are used for less
 * important or less commonly used actions, such as “view more details”.
 */
export default defineComponent({
  name: 'Button',
  props: {
    /**
     * The type of button:
     *
     *   - default
     *   - primary - Extra visual weight and identifies the button as the
     *     primary action.
     *   - secondary - The tonal button: a tinted, borderless fill. Use where a
     *     button should read as a real action but not compete with the
     *     primary one.
     *   - destructive - Indicates a dangerous or potentially negative action.
     *   - outline - Gives the button a subtle alternative to the default button
     *     styling, appropriate for certain backdrops.
     *   - plain - A text button: normal button box, no fill or outline.
     *   - link - Hugs its content like an inline link — no button box at all —
     *     while still supporting icons, badges and the dropdown caret.
     */
    type: {
      type: String as PropType<ActionTypeType>,
      default: 'default'
    },
    /**
     * An Iconify name (`mdi:plus`).
     * @see [Icon](/#/Components/Icon) for more details.
     */
    icon: {
      type: String
    },
    /**
     * A badge to overlay on the button. Either:
     *
     *   - a status — `badge="warning"` — drawn as a small glyph on the icon
     *   - some text — `badge="3"` — drawn as a pill on the top-right corner,
     *     coloured by `badgeStatus`
     *   - an object — `:badge="{ text: '3', status: 'error' }"` — for full
     *     control, including a custom `icon` or `color`
     */
    badge: {
      type: [String, Number, Object] as PropType<
        string | number | IconBadgeType
      >
    },
    /**
     * Colours a text badge. Ignored when `badge` is given as an object.
     */
    badgeStatus: {
      type: String as PropType<IconBadgeStatusType>
    },
    /**
     * Disables the button, preventing all interaction.
     */
    disabled: {
      type: Boolean
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
      type: String as PropType<ActionTooltipPositionType>,
      default: 'bottom'
    },
    /**
     * Shortcut to append a dropdown icon to the button.
     */
    dropdown: {
      type: Boolean,
      default: false
    },
    /**
     * Allows the button to grow to the width of its container.
     */
    fullWidth: {
      type: Boolean,
      default: false
    },
    /**
     * Changes the size of the button, giving it more or less paadding.
     *
     * Sizes:
     *
     *   - small
     *   - medium
     *   - large
     */
    size: {
      type: String,
      default: 'medium'
    },
    /**
     * If provided the button will be rendered as a link and this value will be
     * used as the href attribute.
     */
    url: {
      type: String
    },
    /**
     * When used with `url` it forces the link to open in a new tab.
     */
    external: {
      type: Boolean
    },
    /**
     * This makes the button such that the color is applied to the text and outline instead of the body of the button.
     */
    invert: {
      type: Boolean,
      default: false
    },
    /**
     * The colour role the button draws from, keeping its type's structure:
     * `type="primary" color="secondary"` is a solid secondary fill,
     * `type="secondary" color="tertiary"` a tonal tertiary,
     * `type="outline" color="tertiary"` a tertiary-inked outline, and so on.
     * TYPE sets the weight, COLOR sets the hue — the two never fight.
     */
    color: {
      type: String as PropType<ActionColorType>
    },
    /**
     * Shorthand for `color="error"` — a dangerous or destructive action in
     * whatever weight the type gives it. `type="destructive"` likewise remains
     * the shorthand for the solid error fill.
     */
    destructive: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const style = useCssModule()

    // `badge` is deliberately loose — a bare status, some text, or the full
    // object. Normalise the three down to one shape before rendering.
    const badge = computed<IconBadgeType | null>(() => {
      if (props.badge === undefined || props.badge === null) return null
      if (typeof props.badge === 'object') return props.badge
      const value = String(props.badge)
      if (!value) return null
      // `badge="warning"` means the status, not the word "warning".
      if (
        !props.badgeStatus &&
        badgeStatuses.includes(value as IconBadgeStatusType)
      ) {
        return { status: value as IconBadgeStatusType }
      }
      return { text: value, status: props.badgeStatus }
    })

    // Text is drawn as a corner pill; a bare status is drawn as a glyph on the
    // icon, which only works if there's an icon to sit on.
    const badgeAsPill = computed(
      () =>
        !!badge.value &&
        (badge.value.text !== undefined || (!props.icon && !props.dropdown))
    )

    const renderBadgePill = () => {
      const { text, status, icon, color } = badge.value || {}
      const background =
        color ||
        (status && iconBadgeConfig[status].color) ||
        'var(--octans-text-subdued)'
      const children: any[] = []
      if (icon) {
        children.push(
          h(Icon, {
            icon,
            style: [text !== undefined && 'margin-right: 3px']
          })
        )
      }
      if (text !== undefined) {
        children.push(String(text))
      }
      return h(
        'span',
        { class: style.badge, style: { backgroundColor: background } },
        children
      )
    }

    return () => {
      const renderDefaultSlot = () => {
        const children = slots.default ? slots.default() : []
        // only space the icons when there's actual content next to them
        const hasContent = children.some(vnodeHasContent)
        const contentChildren: VNode[] = []
        const glyph = !badgeAsPill.value ? badge.value : null
        if (props.icon) {
          contentChildren.push(
            h(Icon, {
              style: [hasContent && 'margin-right: 6px'],
              icon: props.icon,
              badge: glyph?.status,
              badgeIcon: glyph?.icon,
              badgeColor: glyph?.color
            })
          )
        }
        contentChildren.push(...children)
        if (props.dropdown) {
          // With no leading icon the caret is the only thing a glyph can sit on.
          const onCaret = glyph && !props.icon ? glyph : null
          contentChildren.push(
            h(Icon, {
              style: [(hasContent || props.icon) && 'margin-left: 6px'],
              icon: 'mdi:menu-down',
              badge: onCaret?.status,
              badgeIcon: onCaret?.icon,
              badgeColor: onCaret?.color
            })
          )
        }
        const content = h(
          'div',
          {
            class: style.content
          },
          contentChildren
        )
        return badgeAsPill.value ? [content, renderBadgePill()] : [content]
      }

      const element: any =
        props.url && !props.disabled ? UnstyledLink : 'button'
      // Type and colour are orthogonal axes: type picks the STRUCTURE class,
      // colour picks the role-slot class the structure reads its colours
      // from. The two shorthands normalise onto them — `destructive` means
      // `color="error"`, and `type="destructive"` means the error role on the
      // primary structure.
      const structure = props.type === 'destructive' ? 'primary' : props.type
      const color = props.destructive
        ? 'error'
        : (props.color ?? (props.type === 'destructive' ? 'error' : undefined))
      return h(
        element,
        {
          class: [
            'UIElement',
            style.Button,
            style[
              `type${capitalize(structure)}${props.invert ? '_invert' : ''}`
            ],
            color && [style['color-' + color], style.hasColor],
            style['size' + capitalize(props.size)],
            props.fullWidth && style.fullWidth
          ],
          disabled: props.disabled,
          href: props.url,
          target: props.external ? '_blank' : undefined,
          'data-ui-tooltip': props.tooltip,
          'data-ui-tooltip-position': props.tooltipPosition,
          onClick(event) {
            if (
              event.currentTarget &&
              event.currentTarget instanceof HTMLElement
            ) {
              event.currentTarget.blur()
            }
          }
        },
        {
          default: renderDefaultSlot
        }
      )
    }
  }
})
</script>

<style lang="scss" module>
$shadow: var(--octans-shadow-control);
// The hover shadow: a resting hairline growing into a soft small shadow.
$shadowHover: var(--octans-shadow-sm);

// The mixins below take CUSTOM PROPERTY NAMES (e.g. `--octans-primary`), not
// colours. Shades are derived with CSS `color-mix()` rather than Sass
// `darken()`/`lighten()`, because Sass cannot compute from a `var()` reference
// — see styles/variables.scss.
@function tone($name) {
  @return var(#{$name});
}

@mixin buttonBase {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 5px 12px;
  border: 1px solid transparent;
  border-radius: var(--octans-radius-field);
  color: var(--octans-text);
  font-size: 14px;
  font-weight: normal;
  line-height: 16px;
  text-decoration: none;
  // The lift is a custom property so a container that must keep its buttons
  // coplanar — the segmented ButtonGroup, whose seams would split — can zero
  // it for every child with one declaration.
  transform: translateY(var(--octans-button-lift, 0));
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease,
    box-shadow 120ms ease,
    transform 120ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  &:focus {
    z-index: 1;
    outline: none;
  }
}

// `$textColor` defaults to the white-on-accent label every loud fill wants. It
// is a parameter because a fill is not always dark — the secondary button is a
// pale neutral, and white on that is unreadable.
@mixin buttonFilled(
  $buttonColor,
  $focusColor,
  $textColor: --octans-text-on-primary
) {
  padding: 5px 12px;
  background: tone($buttonColor);
  border-color: color-mix(in srgb, tone($buttonColor) 88%, black);
  box-shadow: $shadow;
  color: tone($textColor);

  // Hover lifts the button a hair and deepens the shadow with it; press sets
  // it back down flat. Small on purpose — the reactivity should register in
  // the hand, not the eye.
  &:hover:not(:disabled) {
    --octans-button-lift: -1px;
    background: color-mix(in srgb, tone($buttonColor) 92%, black);
    box-shadow: $shadowHover;
    text-decoration: none;
    cursor: pointer;
  }

  &:focus:not(:active) {
    border-color: tone($focusColor);
    box-shadow: 0 0 0 1px tone($focusColor);
  }

  &:active:not(:disabled) {
    --octans-button-lift: 0px;
    background: color-mix(in srgb, tone($buttonColor) 85%, black);
    border-color: color-mix(in srgb, tone($buttonColor) 80%, black);
    box-shadow: none;
  }
}

@mixin buttonFilledDisabled($buttonColor) {
  // Deliberately low contrast: a disabled control should read as unavailable,
  // and WCAG exempts disabled elements from the contrast minimums. Keeping the
  // white label here made disabled buttons look merely dimmer than enabled
  // ones, especially in dark mode.
  background: color-mix(in srgb, tone($buttonColor) 22%, transparent);
  border-color: transparent;
  box-shadow: none;
  color: var(--octans-text-disabled);
}

@mixin buttonOutline($color) {
  padding: 5px 12px;
  background: transparent;
  border: 1px solid color-mix(in srgb, tone($color) 40%, transparent);
  box-shadow: none;

  // The lift without the shadow — a shadow cast by a transparent body reads
  // as a floating rectangle.
  &:hover:not(:disabled) {
    --octans-button-lift: -1px;
    background: color-mix(in srgb, tone($color) 8%, transparent);
    border-color: color-mix(in srgb, tone($color) 55%, transparent);
    cursor: pointer;
  }

  &:focus:not(:active) {
    border-color: color-mix(in srgb, tone($color) 80%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, tone($color) 80%, transparent);
  }

  &:active {
    --octans-button-lift: 0px;
    background: color-mix(in srgb, tone($color) 14%, transparent);
    box-shadow: none;
  }
}

@mixin buttonOutlineDisabled($color) {
  background: transparent;
  border-color: color-mix(in srgb, tone($color) 25%, transparent);
  box-shadow: none;
  color: var(--octans-text-disabled);
}

@mixin buttonInvert($color) {
  padding: 5px 12px;
  background: transparent;
  border: 1px solid color-mix(in srgb, tone($color) 80%, transparent);
  box-shadow: none;
  color: tone($color);

  &:hover:not(:disabled) {
    background: color-mix(in srgb, tone($color) 8%, transparent);
    cursor: pointer;
  }

  &:focus:not(:active) {
    box-shadow: 0 0 0 1px color-mix(in srgb, tone($color) 80%, transparent);
  }

  &:active {
    background: color-mix(in srgb, tone($color) 14%, transparent);
    box-shadow: none;
  }
}

@mixin buttonInvertDisabled($color) {
  background: transparent;
  border-color: color-mix(in srgb, tone($color) 40%, transparent);
  box-shadow: none;
  color: var(--octans-text-disabled);
}

.Button {
  @include buttonBase;

  // The role slots. Structures read their colours from these four, and the
  // `.color*` classes (defined LAST, so they win the source-order tie against
  // the secondary structure's own defaults) repoint them at another role.
  --_role-fill: var(--octans-primary);
  --_role-on-fill: var(--octans-text-on-primary);
  --_role-soft: var(--octans-primary-surface);
  --_role-ink: var(--octans-text-primary);
}

[data-buttongroup-segmented] .Button {
  border-radius: 0;
}
[data-buttongroup-segmented] > :first-child .Button {
  border-top-left-radius: var(--octans-radius-field);
  border-bottom-left-radius: var(--octans-radius-field);
}
[data-buttongroup-segmented] > :last-child .Button {
  border-top-right-radius: var(--octans-radius-field);
  border-bottom-right-radius: var(--octans-radius-field);
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Sits over the top-right corner of the button, half outside it, so it reads
// as an annotation on the button rather than part of its label.
.badge {
  position: absolute;
  top: -7px;
  right: -7px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border: 2px solid var(--octans-surface);
  border-radius: var(--octans-radius-full);
  color: var(--octans-text-on-primary);
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
}

.sizeSmall .badge {
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  font-size: 10px;
}
.sizeLarge .badge {
  top: -8px;
  right: -8px;
  min-width: 22px;
  height: 22px;
  border-radius: var(--octans-radius-full);
  font-size: 12px;
}

.typeDefault,
.typeDefault_invert {
  @include buttonFilled(--octans-surface-control, --octans-focus-ring);
  border-color: var(--octans-border-input);
  color: var(--octans-text);

  &:disabled {
    background: var(--octans-surface-disabled);
    box-shadow: none;
    color: var(--octans-text-disabled);
  }
}

.typePrimary_invert {
  @include buttonInvert(--_role-fill);

  &:disabled {
    @include buttonInvertDisabled(--_role-fill);
  }
}

.typePrimary {
  @include buttonFilled(--_role-fill, --octans-focus-ring, --_role-on-fill);

  &:disabled {
    @include buttonFilledDisabled(--_role-fill);
  }
}

// The tonal button (M3 would say "filled tonal"): a role's container tint
// under its readable ink, with NO outline — borderlessness is what separates
// it from the outlined default at a glance, and the tint is what separates it
// from a disabled fill. Less weight than primary, more than the outlined
// default. Its slots default to the SECONDARY role rather than the shared
// primary default — that is what `type="secondary"` means.
.typeSecondary,
.typeSecondary_invert {
  --_role-soft: var(--octans-secondary-surface);
  --_role-ink: var(--octans-text-secondary);
}

.typeSecondary {
  @include buttonFilled(--_role-soft, --octans-focus-ring, --_role-ink);
  border-color: transparent;
  box-shadow: none;

  &:active:not(:disabled) {
    border-color: transparent;
  }

  &:disabled {
    @include buttonFilledDisabled(--_role-soft);
  }
}
// The inverted variant draws the role as text on a transparent body, so it
// wants the readable ink, not the pale surface.
.typeSecondary_invert {
  @include buttonInvert(--_role-ink);

  &:disabled {
    @include buttonInvertDisabled(--_role-ink);
  }
}

.typeOutline,
.typeOutline_invert {
  @include buttonOutline(--octans-text-subdued);

  &:disabled {
    @include buttonOutlineDisabled(--octans-text-subdued);
  }
}

// The text button (M3's "text"): a real button box — same height, padding and
// alignment as every other type — with no fill or outline at rest. For a
// control that should sit flush with running text instead, see `link` below.
.typePlain,
.typePlain_invert {
  background: transparent;
  border: none;
  box-shadow: none;
  color: var(--octans-text-link);

  &:hover:not(:disabled) {
    color: var(--octans-text-link-hover);
    background: color-mix(in srgb, var(--octans-text-link) 8%, transparent);
    cursor: pointer;
  }
  &:active:not(:disabled) {
    background: color-mix(in srgb, var(--octans-text-link) 14%, transparent);
    box-shadow: none;
  }
  &:focus:not(:active) {
    box-shadow: 0 0 0 1px var(--octans-focus-ring);
  }
  &:disabled {
    background: transparent;
    color: var(--octans-text-disabled);
  }
}

// The inline link: hugs its content like an `<a>` in a sentence — the
// negative margins cancel the base padding so the text sits flush — while
// still supporting icons, badges and the dropdown caret. The focus treatment
// wraps the CONTENT rather than the (invisible) button box, because a ring
// around empty padding reads as misaligned.
.typeLink,
.typeLink_invert {
  margin: -5px -12px;
  padding-left: 12px;
  padding-right: 12px;
  min-height: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  color: var(--octans-text-link);

  &:hover:not(:disabled) {
    color: var(--octans-text-link-hover);
    background: transparent;
    cursor: pointer;
    text-decoration: underline;
  }
  &:active {
    background: transparent;
    box-shadow: none;
  }
  &:focus {
    .content {
      margin: -2px -5px;
      padding: 2px 5px;
      background: var(--octans-surface-hover);
      border-radius: var(--octans-radius-field);
    }
  }
  &:disabled {
    color: var(--octans-text-disabled);
  }
}

// --- the `color` axis --------------------------------------------------------
// `.hasColor` recolours the NEUTRAL structures (default, outline, plain,
// link) with whichever role the slots hold — without a colour class those
// structures keep their neutral inks, so the slots' primary default never
// leaks into them. The filled and tonal structures read the slots
// unconditionally and need nothing here.

.hasColor.typeDefault,
.hasColor.typeDefault_invert {
  color: var(--_role-ink);

  &:disabled {
    color: var(--octans-text-disabled);
  }
}

.hasColor.typeOutline,
.hasColor.typeOutline_invert {
  @include buttonOutline(--_role-ink);
  color: var(--_role-ink);

  &:disabled {
    @include buttonOutlineDisabled(--_role-ink);
    color: var(--octans-text-disabled);
  }
}

.hasColor.typePlain,
.hasColor.typePlain_invert {
  color: var(--_role-ink);

  &:hover:not(:disabled) {
    color: var(--_role-ink);
    background: color-mix(in srgb, var(--_role-ink) 8%, transparent);
  }
  &:active:not(:disabled) {
    background: color-mix(in srgb, var(--_role-ink) 14%, transparent);
  }
  &:disabled {
    color: var(--octans-text-disabled);
  }
}

.hasColor.typeLink,
.hasColor.typeLink_invert {
  color: var(--_role-ink);

  &:hover:not(:disabled) {
    color: var(--_role-ink);
  }
  &:disabled {
    color: var(--octans-text-disabled);
  }
}

// The role slot assignments. These sit AFTER every structure class on
// purpose: `.typeSecondary` declares its own slot defaults at equal
// specificity, and source order is what lets an explicit colour win.
@each $role in (primary, secondary, tertiary, info, success, warning, error) {
  .color-#{$role} {
    --_role-fill: var(--octans-#{$role});
    --_role-on-fill: var(--octans-text-on-#{$role});
    --_role-soft: var(--octans-#{$role}-surface);
    --_role-ink: var(--octans-text-#{$role});
  }
}

.sizeSmall {
  min-height: 30px;
  padding: 4px 12px;
}
.sizeLarge {
  min-height: 44px;
  min-width: 44px;
  padding: 11px 24px;

  .content {
    font-size: 16px;
  }
}

.fullWidth {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
