<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    /**
     * The color of the spinner:
     *
     *   - white
     *   - blue
     *   - teal
     */
    color: {
      type: String,
      default: ''
    },
    /**
     * The size of the spinner:
     *
     *   - small
     *   - large
     *   - relative
     */
    size: {
      type: String,
      default: 'large'
    }
  }
})
</script>

<template>
  <img
    :class="[$style.Spinner, color && $style[color], $style[size]]"
    src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDQgNDQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE1LjU0MiAxLjQ4N0EyMS41MDcgMjEuNTA3IDAgMDAuNSAyMmMwIDExLjg3NCA5LjYyNiAyMS41IDIxLjUgMjEuNSA5Ljg0NyAwIDE4LjM2NC02LjY3NSAyMC44MDktMTYuMDcyYTEuNSAxLjUgMCAwMC0yLjkwNC0uNzU2QzM3LjgwMyAzNC43NTUgMzAuNDczIDQwLjUgMjIgNDAuNSAxMS43ODMgNDAuNSAzLjUgMzIuMjE3IDMuNSAyMmMwLTguMTM3IDUuMy0xNS4yNDcgMTIuOTQyLTE3LjY1YTEuNSAxLjUgMCAxMC0uOS0yLjg2M3oiIGZpbGw9IiM5MTlFQUIiLz48L3N2Zz4K"
    alt=""
    draggable="false"
    role="status"
  />
</template>

<!-- data.staticClass -->
<!-- :style="data.staticStyle" -->

<!-- v-bind="data.attrs"
v-on="data.on" -->

<style lang="scss" module>
.Spinner {
  color: transparent;
  animation: spin 0.5s linear infinite;
}

.white {
  filter: brightness(0) saturate(100%) invert(100%);
}

.blue {
  filter: brightness(0) saturate(100%) invert(72%) sepia(8%) saturate(2838%)
    hue-rotate(130deg) brightness(92%) contrast(87%);
}

.teal {
  filter: brightness(0) saturate(100%) invert(72%) sepia(8%) saturate(2838%)
    hue-rotate(130deg) brightness(92%) contrast(87%);
}

.large {
  width: 44px;
  height: 44px;
}

.small {
  width: 20px;
  height: 20px;
}

.relative {
  width: 1em;
  height: 1em;
}

@keyframes spin {
  100% {
    transform: rotate(1turn);
  }
}
</style>
