<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'

/**
 * A band of content inside a `Modal`, divided from the next by a rule — the
 * same relationship `CardSection` has with `Card`, and deliberately the same
 * shape, so knowing one is knowing the other.
 *
 * Modal's body is a plain slot, so sections are simply the children you put
 * in it:
 *
 * ```vue
 * <Modal :visible="visible" title="Settings">
 *   <ModalSection title="Account">…</ModalSection>
 *   <ModalSection title="Notifications">…</ModalSection>
 * </Modal>
 * ```
 *
 * The body's own padding steps aside when sections are present — see
 * `data-modal-section` in Modal.vue — so a sectioned modal is not padded
 * twice.
 */
export default defineComponent({
  name: 'ModalSection',
  setup(props, { slots }) {
    const $style = useCssModule()

    return () => {
      const title =
        (slots.title || props.title) &&
        h('div', { class: $style.title }, [
          slots.title ? slots.title() : props.title
        ])

      return h(
        'div',
        {
          class: [
            'UIElement',
            $style.ModalSection,
            props.subdued && $style.subdued,
            !props.padded && $style.ModalSection__noPadding
          ],
          // What Modal's body looks for. An attribute rather than a class
          // because the class is hashed by CSS modules, and Modal's own
          // stylesheet is a different module with a different hash.
          'data-modal-section': true
        },
        [title, slots.default && slots.default()]
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
     * Renders the section with a subtle background colour, for a band that
     * should read as secondary to the ones around it.
     */
    subdued: {
      type: Boolean
    },
    /**
     * Sections are padded by default. Turn it off for content that has to run
     * to the section's edges — a table, a full-bleed image.
     */
    padded: {
      type: Boolean,
      default: true
    }
  }
})
</script>

<style lang="scss" module>
.ModalSection {
  padding: 20px;
}

// The divider belongs to the section BELOW, so the first one never draws a
// rule against the modal's header.
.ModalSection + .ModalSection {
  border-top: 1px solid var(--octans-border);
}

.title {
  margin-bottom: 8px;
  color: var(--octans-text);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}

.subdued {
  background: var(--octans-surface-sunken);
}

// Vertical padding only: the content runs to the edges, the title does not.
.ModalSection__noPadding {
  padding: 20px 0;

  .title {
    padding: 0 20px;
  }
}
</style>
