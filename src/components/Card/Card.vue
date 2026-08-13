<script lang="ts">
import { defineComponent, h, useCssModule, type PropType } from 'vue'
import type { ActionType } from '../types'
import { renderHeader } from './utils'

/**
 * Cards are used to group similar concepts and tasks together to make screens
 * easier for users to scan, read, and get things done.
 *
 * @requires ./CardSection.vue
 */
export default defineComponent({
  name: 'Card',
  setup(props, { slots }) {
    const $style = useCssModule()
    return () => {
      const header = renderHeader(props, $style, slots)
      // Note: props are intentionally not spread onto the root element. Doing so
      // put `title` in the DOM, which showed a native tooltip when hovering
      // anywhere in the card. The title is rendered as visible text in the
      // header instead. Non-prop attrs still fall through automatically.
      return h(
        'div',
        {
          class: ['UIElement', $style.Card, props.subdued && $style.subdued]
        },
        [header, slots.default && slots.default()]
      )
    }
  },
  props: {
    /**
     * The title heading of the card.
     */
    title: {
      type: String
    },
    /**
     * An array of action objects:
     *
     * ```ts
     * interface Action {
     *   label: string
     *   icon: string
     *   disabled: boolean
     *   url: string
     *   external: boolean
     *   onAction(): void
     * }
     * ```
     */
    actions: {
      type: Array as PropType<ActionType[]>
    },
    collapseActions: {
      type: Boolean
    },
    /**
     * Renders the card with a subtle background color.
     */
    subdued: {
      type: Boolean
    }
  }
})
</script>

<style lang="scss" module>
@import '../../styles/variables';

.Card {
  // overflow: hidden;
  background: var(--octans-surface);
  // border: 1px solid #e7e9ec;
  border-radius: var(--octans-radius-box);
  box-shadow:
    0 0 0 1px rgba(63, 63, 68, 0.05),
    0 1px 3px 0 rgba(63, 63, 68, 0.15);
}

.header {
  display: flex;
  align-items: center;
  padding: $s4 $s4 0;
}

.actions {
  margin-left: auto;
}

.action + .action {
  margin-left: 4px;
}

.title {
  flex: 1 1 auto;
  color: var(--octans-text);
  font-size: 17px;
  font-weight: 500;
}
.title__custom {
  flex: 1 1 auto;
  color: var(--octans-text);
  font-size: 17px;
}

.subdued {
  background: var(--octans-surface-sunken);
}

.Card + .Card {
  margin-top: 20px;
}
</style>
