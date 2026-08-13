<script lang="ts">
import { Teleport, defineComponent, h } from 'vue'

export default defineComponent({
  setup(props, { slots }) {
    return () => {
      if (props.teleport) {
        return h(
          Teleport,
          {
            to: props.mountTo,
            defer: props.defer
          },
          slots
        )
      }
      return h(
        'div',
        {
          'data-mounting-portal-disabled': true
        },
        slots
      )
    }
  },
  props: {
    /**
     * Renders the content in a `<MountingPortal>` if `true` otherwise renders
     * the content in a `<div>`.
     */
    teleport: {
      type: Boolean,
      default: true
    },
    mountTo: {
      type: String,
      default: 'body'
    },
    /**
     * Defers mounting the teleported content until the rest of the app has
     * rendered, so `mountTo` can point at a target that only exists after the
     * same render cycle. Content is still in the DOM by `nextTick()`.
     */
    defer: {
      type: Boolean,
      default: true
    }
  }
})
</script>
