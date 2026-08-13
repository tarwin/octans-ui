<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  name: 'SkeletonBodyText',
  setup(props) {
    const style = useCssModule()
    return () => {
      const lines = props.lines
      const children = []
      for (let i = 0; i < lines; i++) {
        children.push(
          h('div', {
            class: style.SkeletonBodyTextLine
          })
        )
      }
      return h('div', props, children)
    }
  },
  props: {
    lines: {
      type: Number,
      default: 3
    }
  }
})
</script>

<style lang="scss" module>
@import '../../styles/variables';

.SkeletonBodyTextLine {
  height: 8px;
  background: $skeletonColor;
  border-radius: var(--octans-radius-field);
  animation: SkeletonShimmerAnimation 0.8s linear infinite alternate;
  backface-visibility: hidden;
  will-change: opacity;

  & + & {
    margin-top: 12px;
  }

  &:last-child {
    width: 80%;
  }
}

@keyframes SkeletonShimmerAnimation {
  0% {
    opacity: 0.45;
  }
  100% {
    opacity: 0.9;
  }
}
</style>
