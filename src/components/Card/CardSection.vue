<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'
import { renderHeader } from './utils'

export default defineComponent({
  name: 'CardSection',
  setup(props, { slots }) {
    const $style = useCssModule()

    return () => {
      const header = renderHeader(props, $style, slots)
      // See Card.vue: props are intentionally not spread onto the root element,
      // so `title` doesn't become a native tooltip over the whole section.
      return h(
        'div',
        {
          class: [
            'UIElement',
            $style.CardSection,
            props.subdued && $style.subdued,
            header && $style.CardSection__header,
            !props.padded && $style.CardSection__noPadding
          ],
          'data-card-section': true
        },
        [header, slots.default && slots.default()]
      )
    }
  },
  props: {
    /**
     * The title heading of the section.
     */
    title: {
      type: String
    },
    /**
     * Renders the section with a subtle background color.
     */
    subdued: {
      type: Boolean
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
      type: Array
    },
    collapseActions: {
      type: Boolean
    },
    /**
     * By default padding is included in the section. Use this to disable it.
     */
    padded: {
      type: Boolean,
      default: true
    }
  }
})
</script>

<style lang="scss" module>
@import '../../styles/variables';

$padding: $s4;

.CardSection {
  padding: $padding;
}

.CardSection + .CardSection {
  border-top: 1px solid var(--octans-border);
}

.header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
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
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}
.title__custom {
  flex: 1 1 auto;
  color: var(--octans-text);
  font-size: 13px;
}

.subdued {
  background: var(--octans-surface-sunken);
}

.CardSection__noPadding {
  padding: $padding 0;

  .header {
    padding: $padding;
    padding-bottom: 0;
  }

  .title {
    margin-bottom: 0;
  }

  &.CardSection__header {
    padding-top: 0;
  }
}
</style>
