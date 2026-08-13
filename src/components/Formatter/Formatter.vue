<script lang="ts">
import { format } from '@/utils/format'
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  name: 'Formatter',
  setup(props) {
    const style = useCssModule()

    return () => {
      const { type, value, locale, currency } = props
      const context = {
        locale: locale,
        currency: currency
      }
      let title
      if (type && type.indexOf('date') >= 0) {
        title = format(value, 'dateIso', context)
      }
      const result = format(value, type, context)
      return h(
        'span',
        {
          class: [style.Formatter],
          title
        },
        [result]
      )
    }
  },
  props: {
    type: {
      type: String,
      required: true
    },
    // can be passed as default slot
    value: {
      type: null,
      required: true
    },
    // used with Intl.NumberFormat
    locale: {
      type: String,
      default: 'en'
    },
    // used with Intl.NumberFormat
    currency: {
      type: String,
      default: 'USD'
    }
  }
})
</script>

<style lang="scss" module>
.Formatter {
  font-size: inherit;
}
</style>
