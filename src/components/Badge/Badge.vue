<script lang="ts">
import type { PopperPlacementType } from '@/components/Popper'
import { Tooltip } from '@/components/Tooltip'
import {
  defineComponent,
  h,
  mergeProps,
  useCssModule,
  type PropType
} from 'vue'
import { capitalize, vnodeHasContent } from '../../utils'
import { Icon } from '../Icon'
import type {
  BadgeProgressType,
  BadgeSizeType,
  BadgeStatusType
} from '../types'

/**
 * Badges are used to inform users of the status of an object or an action
 * that's been taken.
 */
export default defineComponent({
  props: {
    /**
     * - `info`
     * - `success`
     * - `warning` — amber; something needs a look
     * - `error` — red; something is wrong
     * - `new`
     *
     * `attention` is accepted as an alias of `warning` for compatibility.
     */
    status: {
      type: String as PropType<BadgeStatusType>
    },
    /**
     * - `incomplete`
     * - `partiallyComplete`
     * - `complete`
     */
    progress: {
      type: String as PropType<BadgeProgressType>
    },
    /**
     * - `small`
     * - `medium`
     */
    size: {
      type: String as PropType<BadgeSizeType>,
      default: 'medium'
    },
    /**
     * An optional leading icon — an Iconify name (`mdi:plus`).
     * @see [Icon](/#/Components/Icon) for more details.
     */
    icon: {
      type: String
    },
    /**
     * An optional tooltip to display when the user hovers over the badge.
     */
    tooltip: {
      type: String
    },
    /**
     * Placement of the tooltip if rendered
     */
    tooltipPosition: {
      type: String as PropType<PopperPlacementType>
    },
    /**
     * An optional radius value for the badge edges
     */
    radius: {
      type: String,
      default: 'var(--octans-radius-full)'
    }
  },
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const style = useCssModule()
    return () => {
      const classes = ['UIElement', style.Badge]
      const children = slots.default ? slots.default() : []
      // only space the icon when there's actual content next to it
      const hasContent = children.some(vnodeHasContent)
      if (props.status) {
        classes.push(style['status' + capitalize(props.status)])
      }
      if (props.progress) {
        classes.push(style['progress' + capitalize(props.progress)])
        children.unshift(
          h('span', {
            class: style.pip
          })
        )
      }
      if (props.size) {
        classes.push(style['size' + capitalize(props.size)])
      }
      if (props.icon) {
        children.unshift(
          h(Icon, {
            icon: props.icon,
            style: [hasContent && 'margin-right: 4px']
          })
        )
      }
      const content = h(
        'span',
        mergeProps(attrs, {
          class: classes,
          style: [`border-radius: ${props.radius};`]
        }),
        children
      )
      if (props.tooltip) {
        return h(
          Tooltip,
          {
            content: props.tooltip,
            placement: props.tooltipPosition
          },
          () => content
        )
      }
      return content
    }
  }
})
</script>

<style lang="scss" module>
.Badge {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  background-color: var(--octans-surface-sunken);
  border: 2px solid var(--octans-surface);
  font-size: 13px;
  line-height: 20px;
  color: var(--octans-text);
  cursor: default;
  .pip {
    color: var(--octans-text-disabled);
  }
}

.pip {
  height: 10px;
  width: 10px;
  margin: 0 4px 0 -3px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.statusInfo {
  background-color: var(--octans-info-surface);
  color: var(--octans-text-info);
  .pip {
    color: var(--octans-text-info);
  }
}
.statusSuccess {
  background-color: var(--octans-success-surface);
  color: var(--octans-text-success);
  .pip {
    color: var(--octans-text-success);
  }
}
// `attention` is the pre-rename word for the amber state — kept as an alias so
// old call sites keep meaning what they meant.
.statusWarning,
.statusAttention {
  background-color: var(--octans-warning-surface);
  color: var(--octans-text-warning);
  .pip {
    color: var(--octans-text-warning);
  }
}
.statusError {
  background-color: var(--octans-error-surface);
  color: var(--octans-text-error);
  .pip {
    color: var(--octans-text-error);
  }
}
.statusNew {
  background-color: var(--octans-surface-sunken);
  color: var(--octans-text);
  font-weight: 500;
  border: none;
  .pip {
    color: var(--octans-text-error);
  }
}

.progressIncomplete {
  .pip {
    background: transparent;
  }
}
.progressPartiallyComplete {
  .pip {
    background: linear-gradient(
      0deg,
      currentColor,
      currentColor 50%,
      transparent 0,
      transparent
    );
  }
}
.progressComplete {
  .pip {
    background: currentColor;
  }
}

.sizeSmall {
  font-size: 12px;
  line-height: 18px;
}
</style>
