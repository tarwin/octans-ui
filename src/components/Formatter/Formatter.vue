<script lang="ts">
import { format } from '@/utils/format'
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  name: 'Formatter',
  setup(props) {
    const style = useCssModule()

    return () => {
      const { type, value, locale, currency, timezone, inputTimezone } = props
      const context = {
        locale: locale,
        currency: currency,
        // `undefined`, not `''`, so an unset prop falls through to the
        // library-wide zone rather than pinning this one to UTC-nothing.
        timezone: timezone || undefined,
        inputTimezone: inputTimezone || undefined
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
    },
    /**
     * IANA time zone to render a date in, e.g. `America/Los_Angeles`.
     *
     * Usually you want `setTimezone` instead — one call at app start and
     * every date in the app follows. This is the per-instance override.
     */
    timezone: {
      type: String
    },
    /**
     * IANA time zone a `value` that names no zone of its own is READ in.
     *
     * `timezone` is the clock the date is shown on; this is the clock it was
     * written on. `'2024-03-15 02:00:00'` straight out of a MySQL `DATETIME`
     * names no instant, so without this it is taken as the viewer's own local
     * time and the same row reads as a different moment in every country.
     *
     * Usually you want `setInputTimezone('UTC')` at app start. This is the
     * per-instance override, for the one feed that disagrees.
     */
    inputTimezone: {
      type: String
    }
  }
})
</script>

<style lang="scss" module>
.Formatter {
  font-size: inherit;
}
</style>
