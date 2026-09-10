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
            props.flush && $style.CardSection__flush,
            !props.padded && !props.flush && $style.CardSection__noPadding
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
     *
     * This drops the HORIZONTAL padding only — the section keeps its vertical
     * rhythm, so a list of rows still breathes against the sections above and
     * below it. For a section with no padding at all, use `flush`.
     */
    padded: {
      type: Boolean,
      default: true
    },
    /**
     * Removes the section's padding entirely, so its content runs to the edges
     * of the card. Wins over `padded`.
     *
     * The reason to reach for it is a component that fills the section — a
     * `DataTable`, an image, a map. Those already cancel the padding by
     * reaching out of it with a negative margin, which works but means the
     * component has to know what its parent's padding is; `flush` is the
     * version that says so from the outside.
     */
    flush: {
      type: Boolean
    }
  }
})
</script>

<style lang="scss" module>
@import '../../styles/variables';

$padding: $s4;

/**
 * The padding is published as a custom property, not just applied.
 *
 * Anything that has to cancel it — a `DataTable` running edge to edge inside a
 * card — can then read the real number rather than restating `16px` and
 * drifting the first time this changes. Two axes rather than one, because
 * `padded={false}` zeroes the horizontal padding and keeps the vertical, and a
 * single value made a table in one of those sections overhang the card by
 * 16px on each side.
 */
.CardSection {
  --octans-card-section-padding-x: #{$padding};
  --octans-card-section-padding-y: #{$padding};
  padding: var(--octans-card-section-padding-y)
    var(--octans-card-section-padding-x);
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
  --octans-card-section-padding-x: 0px;

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

.CardSection__flush {
  --octans-card-section-padding-x: 0px;
  --octans-card-section-padding-y: 0px;
}
</style>
