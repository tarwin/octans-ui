<script lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
import { computed, defineComponent, h, useCssModule, type PropType } from 'vue'
import type { IconBadgeStatusType } from '../types'
// Registers the icons this library renders itself, so they appear offline and
// without a round trip. Anything else resolves through the Iconify API.
// Icons used only by stories live in .storybook/storyIconBundle.ts instead, so
// consumers don't download them — `pnpm icons:bundle` maintains the split.
import './iconBundle'

/**
 * Icon names are Iconify `prefix:name` pairs: `mdi:alert`, `la:home`,
 * `lucide:camera`. Any of Iconify's collections work — names this library
 * renders are bundled at build time (see `./iconBundle`), and anything else
 * resolves through the Iconify API on first use. Consumers can bundle their
 * own with `npx octans-icons`.
 *
 * Prefix a name with `not:` to draw a slash through it: `not:mdi:bell`.
 */
export const iconBadgeConfig: Record<
  IconBadgeStatusType,
  { icon: string; color: string }
> = {
  info: { icon: 'mdi:information', color: 'var(--octans-info)' },
  success: { icon: 'mdi:check-circle', color: 'var(--octans-success)' },
  warning: { icon: 'mdi:alert', color: 'var(--octans-warning)' },
  error: { icon: 'mdi:alert-circle', color: 'var(--octans-error)' }
}

/**
 * Percentages are relative to the parent's *font size*, not its box, so
 * convert them to `em` rather than handing them to the browser as-is.
 */
const normalizeSize = (size: string) => {
  if (size.endsWith('%')) {
    const percent = parseFloat(size)
    if (!isNaN(percent)) {
      return `${percent / 100}em`
    }
  }
  return size
}

const splitSize = (size: string) => {
  const match = normalizeSize(size).match(/^([\d.]+)(.*)$/)
  if (!match) return null
  return { value: parseFloat(match[1]), unit: match[2] || 'em' }
}

export default defineComponent({
  name: 'Icon',
  props: {
    /**
     * An Iconify name (`mdi:alert`). Prefix with `not:` to draw a slash
     * through it.
     */
    icon: {
      type: String
    },
    /**
     * Icon size — e.g. `120%`, `24px`, `1.5em`. Percentages are resolved
     * against the surrounding font size.
     */
    size: {
      type: String
    },
    /**
     * Holds the container at its base size so an oversized icon overflows
     * instead of pushing the layout around.
     */
    contained: {
      type: Boolean
    },
    /**
     * Overlays a small status glyph on the corner of the icon:
     *
     *   - `info`
     *   - `success`
     *   - `warning`
     *   - `error`
     */
    badge: {
      type: String as PropType<IconBadgeStatusType>
    },
    /**
     * An Iconify name to use for the badge glyph instead of the status default.
     */
    badgeIcon: {
      type: String
    },
    /**
     * A colour to use for the badge glyph instead of the status default.
     */
    badgeColor: {
      type: String
    }
  },
  setup(props) {
    const style = useCssModule()

    const details = computed(() => {
      const name = props.icon || ''
      const negated = name.startsWith('not:')
      return {
        icon: negated ? name.substring(4) : name,
        negated
      }
    })

    const badge = computed(() => {
      if (!props.badge && !props.badgeIcon) return null
      const config = props.badge ? iconBadgeConfig[props.badge] : undefined
      return {
        icon: props.badgeIcon || config?.icon || iconBadgeConfig.info.icon,
        color: props.badgeColor || config?.color || iconBadgeConfig.info.color
      }
    })

    // The badge grows more slowly than the icon it sits on, so it stays a
    // badge rather than becoming a second icon.
    const badgeSize = computed(() => {
      const size = props.size && splitSize(props.size)
      if (!size) return '0.6em'
      return `${Math.max(0.6, 0.6 + (size.value - 1) * 0.4)}${size.unit}`
    })

    const badgeStyle = computed(() => {
      const style: Record<string, string> = { color: badge.value?.color || '' }
      // When contained, the icon is centred in a 1em box, so the corner of the
      // box is no longer the corner of the icon — offset back out to find it.
      const size = props.contained && props.size && splitSize(props.size)
      if (size) {
        const offset = size.value / 2 - 0.15
        style.top = `calc(20% - ${offset}${size.unit})`
        style.right = `calc(20% - ${offset}${size.unit})`
      }
      return style
    })

    const render = (extra?: Record<string, any>) => {
      const size = props.size ? normalizeSize(props.size) : undefined
      return h(IconifyIcon, {
        icon: details.value.icon,
        inline: false,
        width: size,
        height: size,
        ...extra
      })
    }

    return () => {
      if (!details.value.icon) return null

      const children = [render()]

      if (details.value.negated) {
        // Fade the icon and lay a slash over the top of it. The fade is a
        // class rather than an inline `style`, because Iconify's component
        // builds its own style object from `rotate`/`flip` and drops whatever
        // was passed in — so an inline opacity silently never arrived.
        children[0] = render({ class: style.faded })
        children.unshift(
          // Same size and position as the icon underneath, so it scales with it.
          render({ icon: 'la:slash', class: style.overlay })
        )
      }

      if (badge.value) {
        children.push(
          h('span', { class: style.badge, style: badgeStyle.value }, [
            h(IconifyIcon, {
              icon: badge.value.icon,
              inline: false,
              width: badgeSize.value,
              height: badgeSize.value
            })
          ])
        )
      }

      // Nothing stacked on top of it — no wrapper needed.
      if (children.length === 1 && !props.contained) {
        return children[0]
      }

      return h(
        'span',
        {
          class: [style.wrapper, props.contained && style.contained]
        },
        children
      )
    }
  }
})
</script>

<style lang="scss" module>
.wrapper {
  position: relative;
  display: inline-block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
}

.faded {
  opacity: 0.4;
}

.contained {
  width: 1em;
  height: 1em;
  vertical-align: middle;

  > svg,
  > i {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.badge {
  position: absolute;
  top: -3px;
  right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  // A white keyline so the badge reads against the icon underneath it.
  // Outlines the badge so it stays legible over any icon beneath it.
  filter: drop-shadow(1px 0 0 var(--octans-surface))
    drop-shadow(-1px 0 0 var(--octans-surface))
    drop-shadow(0 1px 0 var(--octans-surface))
    drop-shadow(0 -1px 0 var(--octans-surface));
}
</style>
