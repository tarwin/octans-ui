<script lang="ts" setup>
import debounce from '@/utils/debounce'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch as vueWatch,
  type CSSProperties
} from 'vue'
import type { ScrollPaneProps } from './types'

/**
 * Scrolls its content as necessary and fades the edges where content overflows,
 * so it is obvious there is more to see.
 */
const props = withDefaults(defineProps<ScrollPaneProps>(), {
  direction: 'vertical',
  contain: false,
  disabled: false,
  indicators: true
})

const container = ref<HTMLElement>()
const content = ref<HTMLElement>()

const showTop = ref(false)
const showBottom = ref(false)
const showLeft = ref(false)
const showRight = ref(false)

// An indicator promises "there is more this way, scroll to see it". A disabled
// pane cannot be scrolled, so the promise would be a lie — the content is
// simply clipped. Hence `disabled` suppresses them rather than leaving a
// permanent bottom fade sitting there.
const showsIndicators = computed(() => props.indicators && !props.disabled)

const scrollsY = computed(
  () => props.direction === 'vertical' || props.direction === 'both'
)
const scrollsX = computed(
  () => props.direction === 'horizontal' || props.direction === 'both'
)

const containerStyles = computed<CSSProperties>(() => ({
  padding: props.padding,
  overflowX: props.disabled || !scrollsX.value ? 'hidden' : 'auto',
  overflowY: props.disabled || !scrollsY.value ? 'hidden' : 'auto',
  // `contain` stops the scroll from chaining to the page once this pane hits
  // its end. It also suppresses the bounce/pull-to-refresh gesture, which is
  // the same thing seen from the other side.
  overscrollBehavior: props.contain ? 'contain' : undefined,
  ...(props.containerStyle || {})
}))

function updateImmediate() {
  const el = container.value
  // May fire while the component is being torn down.
  if (!el) return

  const { clientHeight, scrollHeight, scrollTop } = el
  const { clientWidth, scrollWidth, scrollLeft } = el

  // Scroll offsets are fractional at non-integer zoom and on HiDPI, so an
  // exact comparison leaves the end indicator stuck on at the very bottom.
  const epsilon = 1

  const y = showsIndicators.value && scrollsY.value
  const x = showsIndicators.value && scrollsX.value

  showTop.value = y && scrollTop > epsilon
  showBottom.value =
    y &&
    scrollHeight > clientHeight &&
    scrollTop + clientHeight < scrollHeight - epsilon

  showLeft.value = x && scrollLeft > epsilon
  showRight.value =
    x &&
    scrollWidth > clientWidth &&
    scrollLeft + clientWidth < scrollWidth - epsilon
}

const update = debounce(updateImmediate, 100, { leading: true })

vueWatch(
  () => [props.watch, props.direction, props.disabled, props.indicators],
  () => {
    // Let the DOM settle before measuring it.
    requestAnimationFrame(updateImmediate)
  }
)

let observer: ResizeObserver | undefined

onMounted(() => {
  window.addEventListener('resize', update)
  // Replaces the old `watch` prop as the way to keep up with content that
  // changes size — that prop remains for cases the observer cannot see, like
  // content whose box is unchanged but whose scroll extent is not.
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(update)
    if (container.value) observer.observe(container.value)
    if (content.value) observer.observe(content.value)
  }
  updateImmediate()
})

onBeforeUnmount(() => {
  // The Options API version of this component listed the teardown under
  // `onBeforeDestroy`, which is not a Vue 3 option name — so the resize
  // listener was never removed.
  window.removeEventListener('resize', update)
  observer?.disconnect()
})

function scrollTo(x: number, y: number) {
  container.value?.scrollTo(x, y)
}

defineExpose({ scrollTo, update: updateImmediate })
</script>

<template>
  <!--
    `UIElement` themes the slot content the way every other container in the
    library does. Without it, bare text handed to the pane keeps the browser
    default black and disappears against a dark theme.
  -->
  <div :class="['UIElement', $style.ScrollPane]">
    <div
      v-show="showTop"
      :class="[$style.indicator, $style.indicatorTop]"
    ></div>
    <div
      v-show="showLeft"
      :class="[$style.indicator, $style.indicatorLeft]"
    ></div>
    <div
      ref="container"
      :class="[$style.container, containerClass]"
      :style="containerStyles"
      @scroll="update"
    >
      <div ref="content">
        <!-- @slot The content to render in the scrollable container -->
        <slot></slot>
      </div>
    </div>
    <div
      v-show="showRight"
      :class="[$style.indicator, $style.indicatorRight]"
    ></div>
    <div
      v-show="showBottom"
      :class="[$style.indicator, $style.indicatorBottom]"
    ></div>
  </div>
</template>

<style lang="scss" module>
.ScrollPane {
  position: relative;
  display: flex;
}
.container {
  flex-direction: column;
  flex: 1;
  position: relative;
  // The wrapper below is what a horizontal pane measures, so it must be free
  // to exceed the container rather than being squashed to fit it.
  min-width: 0;
}
.indicator {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  // Themed, because the fade has to darken a light surface and lighten a dark
  // one. Override per-pane with `--ScrollPane-indicatorColor` where the pane
  // sits on a surface the token was not tuned for.
  --indicator: var(--ScrollPane-indicatorColor, var(--octans-shadow-overflow));
}
.indicatorTop,
.indicatorBottom {
  left: 0;
  width: 100%;
  height: 20px;
}
.indicatorLeft,
.indicatorRight {
  top: 0;
  height: 100%;
  width: 20px;
}
.indicatorTop {
  top: 0;
  background: linear-gradient(to top, transparent 0%, var(--indicator) 100%);
}
.indicatorBottom {
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, var(--indicator) 100%);
}
.indicatorLeft {
  left: 0;
  background: linear-gradient(to left, transparent 0%, var(--indicator) 100%);
}
.indicatorRight {
  right: 0;
  background: linear-gradient(to right, transparent 0%, var(--indicator) 100%);
}
</style>
