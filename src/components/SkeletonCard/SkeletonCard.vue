<script lang="ts">
import { Card, CardSection } from '@/components/Card'
import { SkeletonBodyText } from '@/components/SkeletonBodyText'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'SkeletonCard',
  props: {
    title: {
      type: String
    },
    subdued: {
      type: Boolean
    },
    /**
     * Number of sections to show.
     */
    sections: {
      type: Number,
      default: 1
    }
  },
  render() {
    const sectionMarkup = [] as any[]
    for (let i = 0; i < this.sections; i++) {
      sectionMarkup.push(
        h(CardSection, () => [
          h(SkeletonBodyText, {
            props: {
              lines: 3
            }
          })
        ])
      )
    }
    return h(
      Card,
      {
        title: this.title,
        subdued: this.subdued
      },
      () => sectionMarkup
    )
  }
})
</script>
