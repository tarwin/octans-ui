<script lang="ts">
import { defineComponent, h, useCssModule } from 'vue'

export default defineComponent({
  name: 'SkeletonDisplayText',
  setup(props) {
    const style = useCssModule()

    return () =>
      h('div', {
        class: [style.SkeletonDisplayText, style[props.size]]
      })
  },
  props: {
    size: {
      type: String,
      default: 'medium'
    }
  }
})
</script>

<style lang="scss" module>
@import '../../styles/variables';

.SkeletonDisplayText {
  max-width: 12rem;
  background: $skeletonColor;
  border-radius: var(--octans-radius-field);
  animation: SkeletonShimmerAnimation 0.8s linear infinite alternate;
  backface-visibility: hidden;
  will-change: opacity;
}

.tiny {
  height: 20px;
}
.small {
  height: 28px;
}
.medium {
  height: 32px;
}
.large {
  height: 44px;
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
