<script lang="ts" setup>
import { computed, onMounted, onUnmounted, type CSSProperties } from 'vue'
import Toast from './Toast.vue'
import type { ToastManagerItemType, ToastPosition } from './types'
import { manager } from './manager'

const props = withDefaults(
  defineProps<{
    position?: ToastPosition
    offset?: number | { x?: number; y?: number }
    contrasting?: boolean
  }>(),
  {
    position: 'se',
    offset: 0,
    contrasting: true
  }
)

const POSITIONS: ToastPosition[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']

// Items live on the module singleton, not here, so `toast()` can add to them
// with nothing mounted and every host renders the same list. Registering makes
// `toast()` skip its own auto-mounted host, which would otherwise draw a
// second copy of every toast.
onMounted(() => manager.addHost())
onUnmounted(() => manager.removeHost())

// `toast.configure()` values win over props: the auto-mounted host has no way
// to receive props, so that is the only channel it has. Props cover whatever
// has not been configured.
const config = computed(() => {
  const offset = manager.config.offset ?? props.offset
  return {
    position: manager.config.position ?? props.position,
    offset:
      typeof offset === 'number'
        ? { x: offset, y: offset }
        : { x: offset.x || 0, y: offset.y || 0 },
    contrasting: manager.config.contrasting ?? props.contrasting
  }
})

const stacks = computed(() => {
  return POSITIONS.map((position) => {
    let items = manager.items.filter(
      (item) => (item.position || config.value.position) === position
    )
    // The newest toast should sit nearest the viewport edge, as it always
    // has at the bottom right — so north stacks render newest-first.
    if (position.startsWith('n')) {
      items = items.slice().reverse()
    }
    return { position, items }
  }).filter((stack) => stack.items.length)
})

function stackStyle(position: ToastPosition): CSSProperties {
  const { x, y } = config.value.offset
  const style: CSSProperties = {}
  if (position.startsWith('n')) {
    style.top = y + 'px'
  } else if (position.startsWith('s')) {
    style.bottom = y + 'px'
  } else {
    // e/w: vertically centered, y shifts off center
    style.top = `calc(50% + ${y}px)`
  }
  if (position.endsWith('e')) {
    style.right = x + 'px'
  } else if (position.endsWith('w')) {
    style.left = x + 'px'
  } else {
    // n/s: horizontally centered, x shifts off center
    style.left = `calc(50% + ${x}px)`
  }
  return style
}

function removeItem(item: ToastManagerItemType) {
  manager.removeItem(item)
}
function pauseItem(item: ToastManagerItemType) {
  manager.pauseTimer(item)
}
function resumeItem(item: ToastManagerItemType) {
  manager.resumeTimer(item)
}
</script>

<template>
  <transition-group
    v-for="stack in stacks"
    :key="stack.position"
    tag="div"
    role="status"
    aria-live="polite"
    :class="['UIElement', $style.Stack, $style['Stack_' + stack.position]]"
    :style="stackStyle(stack.position)"
    :enter-active-class="$style.enterActive"
    :leave-active-class="$style.leaveActive"
    :enter-from-class="$style.enter"
    :leave-to-class="$style.leaveTo"
    :move-class="$style.moveTo"
  >
    <Toast
      v-for="item in stack.items"
      :key="item._id"
      :item="item"
      :contrasting="item.contrasting ?? config.contrasting"
      @remove="removeItem"
      @pause="pauseItem"
      @resume="resumeItem"
    />
  </transition-group>
</template>

<style lang="scss" module>
.Stack {
  position: fixed;
  z-index: 9999;
  width: 432px;

  @media (max-width: 500px) {
    max-width: calc(100vw - 32px);
  }
}

// The n/s and e/w stacks anchor at the viewport center; pull them back by
// half their own size. Offsets shift off center via the inline calc().
.Stack_n,
.Stack_s {
  transform: translateX(-50%);
}
.Stack_e,
.Stack_w {
  transform: translateY(-50%);
}

.enterActive,
.leaveActive {
  transition-duration: 0.3s;
  transition-property: transform, opacity;
  transition-timing-function: ease;
}
.enter,
.leaveTo {
  opacity: 0;
  transform: translateY(100px);
}
// Toasts animate in from the viewport edge their stack anchors to.
.Stack_nw .enter,
.Stack_n .enter,
.Stack_ne .enter,
.Stack_nw .leaveTo,
.Stack_n .leaveTo,
.Stack_ne .leaveTo {
  transform: translateY(-100px);
}
.Stack_e .enter,
.Stack_e .leaveTo {
  transform: translateX(100px);
}
.Stack_w .enter,
.Stack_w .leaveTo {
  transform: translateX(-100px);
}
.moveTo {
  transition: transform 0.3s;
}
</style>
