<script lang="ts">
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'ButtonGroupItem',
  setup(_, { slots }) {
    return () => {
      const children = slots.default ? slots.default() : []
      return h(
        'div',
        {
          'data-button-group-item': true
        },
        children
      )
    }
  }
})
</script>
