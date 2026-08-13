<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  name: 'StackItem',
  setup(props, context) {
    return () => {
      const styles = useCssModule()
      return h(
        'div',
        {
          ...context.attrs,
          class: [styles.Item, props.fill && styles.Item__fill]
        },
        context.slots
      )
    }
  },
  props: {
    /**
     * Fill available horizontal space in the stack with this item.
     */
    fill: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
@import './Stack.module.scss';
</style>
