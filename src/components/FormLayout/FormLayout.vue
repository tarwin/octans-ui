<script lang="ts">
import { flattenSlotChildren } from '@/utils'
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  name: 'FormLayout',
  setup(_, { slots }) {
    const style = useCssModule()
    return () => {
      return h(
        'div',
        {
          class: style.FormLayout
        },
        {
          default: () => {
            const children = slots.default?.()
            if (!children) return

            const flattened = flattenSlotChildren(children)

            return flattened.map((child) =>
              h('div', { class: style.FormLayoutItem }, [child])
            )
          }
        }
      )
    }
  }
})
</script>

<style lang="scss" module>
.FormLayout + .FormLayout {
  margin-top: 16px;
}
.FormLayoutItem + .FormLayoutItem {
  margin-top: 16px;
}
</style>
