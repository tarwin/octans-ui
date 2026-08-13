<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  setup(props, { slots }) {
    const style = useCssModule()
    return () =>
      h(
        'p',
        {
          class: ['UIElement', style.Caption]
        },
        slots.default?.()
      )
  }
})
</script>

<style lang="scss" module>
.Caption {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;

  @media (min-width: 400px) {
    font-size: 12px;
    line-height: 16px;
  }
}
</style>
