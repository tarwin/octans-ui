<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'
import { flattenSlotChildren } from '@/utils'

export default defineComponent({
  name: 'FormLayoutGroup',
  props: {
    condensed: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    return () => {
      const style = useCssModule()
      return h(
        'div',
        {
          class: [
            style.FormLayoutGroup,
            props.condensed && style.FormLayoutGroup__condensed
          ]
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
$gutter: 16px;

.FormLayoutGroup {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  margin-top: -$gutter;
  margin-left: -$gutter;
}

.FormLayoutItem {
  flex: 1 1 220px;
  margin-top: $gutter;
  margin-left: $gutter;
}

.FormLayoutGroup__condensed .FormLayoutItem {
  flex-basis: 110px;
}
</style>
