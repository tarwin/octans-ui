<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties
} from 'vue'
import type { StickyProps } from './types'

/**
 * Pins its content against an edge while the rest of the container scrolls
 * past, and reports whether it is currently pinned.
 *
 * Two things decide whether `position: sticky` does anything, and neither is
 * this component's to fix: the element travels within its own parent, so a
 * parent shrunk to its height has nowhere to move it; and any ancestor with
 * `overflow: hidden` clips it out of the scroll it was meant to follow.
 */
const props = withDefaults(defineProps<StickyProps>(), {
  offset: 0,
  position: 'top',
  disabled: false
})

const emit = defineEmits<{
  /** Fired when the content pins against the edge, and again when it lets go. */
  (e: 'update:stuck', stuck: boolean): void
}>()

// The sentinel below is a second root node, so attributes have to be placed by
// hand rather than falling through to whichever comes first.
defineOptions({ inheritAttrs: false })

const rootEl = ref<HTMLElement>()
const sentinelEl = ref<HTMLElement>()
const stuck = ref(false)

const styles = computed<CSSProperties>(() => {
  if (props.disabled) return {}
  const offset =
    typeof props.offset === 'number' ? `${props.offset}px` : props.offset
  return props.position === 'bottom'
    ? { position: 'sticky', bottom: offset }
    : { position: 'sticky', top: offset }
})

/**
 * The element scrolls within the nearest ancestor that scrolls, or the page if
 * there is none — which is also the box its pinned edge is measured against.
 */
function findScrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement
  while (node) {
    const style = getComputedStyle(node)
    if (/(auto|scroll|overlay)/.test(style.overflowY + style.overflowX)) {
      return node
    }
    node = node.parentElement
  }
  return null
}

let scrollParent: HTMLElement | null = null
let frame = 0

function setStuck(value: boolean) {
  if (stuck.value === value) return
  stuck.value = value
  emit('update:stuck', value)
}

function measure() {
  const el = rootEl.value
  const sentinel = sentinelEl.value
  if (!el || !sentinel || props.disabled) {
    setStuck(false)
    return
  }

  // Measure the sentinel, not the element. The element is flush against the
  // edge from the very first frame when it starts there, so measuring it would
  // report a permanently pinned header — and a shadow that never turns off.
  // The sentinel stays in normal flow, so the comparison below is really
  // "has the content been displaced from where it belongs".
  //
  // Read the offset back off the element rather than off the prop, so a string
  // offset — `2rem`, a custom property, a `calc()` — is resolved by the browser
  // instead of parsed here. On a positioned element this is the used value, in
  // pixels.
  const style = getComputedStyle(el)
  const edge = props.position === 'bottom' ? style.bottom : style.top
  const distance = parseFloat(edge) || 0

  const rect = sentinel.getBoundingClientRect()
  // `clientTop` is the border width, so this lands on the padding box — the
  // edge content actually scrolls against.
  const bounds = scrollParent?.getBoundingClientRect()
  // Rects are fractional at non-integer zoom and on HiDPI, so an exact
  // comparison flickers at the moment of pinning.
  const epsilon = 0.5

  if (props.position === 'bottom') {
    const limit = bounds
      ? bounds.bottom - (scrollParent as HTMLElement).clientTop
      : window.innerHeight
    setStuck(rect.bottom > limit - distance + epsilon)
  } else {
    const limit = bounds
      ? bounds.top + (scrollParent as HTMLElement).clientTop
      : 0
    setStuck(rect.top < limit + distance - epsilon)
  }
}

function schedule() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    measure()
  })
}

function listen() {
  stopListening()
  const el = rootEl.value
  if (!el || props.disabled) {
    setStuck(false)
    return
  }
  scrollParent = findScrollParent(el)
  // A scroll event does not bubble, so it has to be heard on the element that
  // scrolls. `window` covers the page-level case, and also catches the page
  // moving under an inner scroller that has not itself scrolled.
  scrollParent?.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  measure()
}

function stopListening() {
  scrollParent?.removeEventListener('scroll', schedule)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  scrollParent = null
}

onMounted(listen)

onBeforeUnmount(() => {
  stopListening()
  if (frame) cancelAnimationFrame(frame)
})

// The scrolling ancestor can change with the content, and the edge being
// watched changes with the props, so rebind rather than only re-measuring.
watch(() => [props.disabled, props.position, props.offset], listen)

defineExpose({ measure })
</script>

<template>
  <div
    v-if="position === 'top'"
    ref="sentinelEl"
    :class="$style.sentinel"
    aria-hidden="true"
  ></div>
  <div
    ref="rootEl"
    v-bind="$attrs"
    :class="['UIElement', $style.Sticky, stuck && 'Sticky-stuck']"
    :style="styles"
  >
    <!--
      `Sticky-stuck` above is deliberately not a CSS-module class: it is the
      styling hook consumers use to raise a shadow while pinned, and a hashed
      name could not be written in their stylesheet.

      @slot The content to pin.
      @binding {boolean} stuck Whether the content is currently pinned.
    -->
    <slot :stuck="stuck" />
  </div>
  <div
    v-if="position === 'bottom'"
    ref="sentinelEl"
    :class="$style.sentinel"
    aria-hidden="true"
  ></div>
</template>

<style lang="scss" module>
.Sticky {
  // Sticky elements are routinely overlapped by content that comes after them,
  // which reads as the pinning being broken. Low enough to sit under the
  // library's overlays, and easy to override per instance.
  z-index: 1;
}

// Marks where the content sits when it is not pinned, so `stuck` can mean
// "displaced" rather than "touching the edge". Zero height, so it adds nothing
// to normal flow — but it is still a box, so it counts as a flex or grid item.
// Putting a `<Sticky>` directly inside a container with `gap` therefore costs
// one extra gap; wrap it in a plain element if that matters.
.sentinel {
  height: 0;
}
</style>
