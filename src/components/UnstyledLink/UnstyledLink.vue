<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  setup(_, { slots }) {
    const $style = useCssModule()
    return () => {
      return h(
        'a',
        {
          class: ['UIElement', $style.UnstyledLink]
        },
        slots
      )
    }
  }
})
</script>

<style lang="scss" module>
.UnstyledLink {
  color: currentColor;
}
</style>
