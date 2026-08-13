<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'
import styles from './TextStyle.module.scss'

type TextStyleType =
  'positive' | 'negative' | 'strong' | 'subdued' | 'code' | 'link'

export default defineComponent({
  name: 'TextStyle',
  props: {
    type: {
      type: String as PropType<TextStyleType>
    }
  },
  setup(props, { slots }) {
    return () => {
      const tag = props.type === 'code' ? 'code' : 'span'
      return h(
        tag,
        {
          class: ['UIElement', styles[props.type || '']]
        },
        slots
      )
    }
  }
})
</script>
