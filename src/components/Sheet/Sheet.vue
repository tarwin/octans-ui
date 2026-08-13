<script lang="ts" setup>
import { Button, ButtonGroup } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { ScrollPane } from '@/components/ScrollPane'
import { Spinner } from '@/components/Spinner'
import debounce from 'lodash-es/debounce'
import { computed, onBeforeUnmount, ref, useCssModule } from 'vue'
import { SheetInstance, createSheetManager } from './manager'
import type { SheetProps } from './types'
import type { ActionType } from '../types'

const manager = createSheetManager()

const props = withDefaults(defineProps<SheetProps>(), {
  edge: 'right',
  size: 700,
  peek: 100,
  minIndex: 1000,
  loading: false,
  visible: false,
  animateInDuration: 700,
  animateOutDuration: 700
})

const emit = defineEmits<{
  /**
   * Emitted before the open animation starts.
   */
  (e: 'before-open'): void
  /**
   * Emitted after the open animation finishes.
   */
  (e: 'after-open'): void
  /**
   * Emitted before the close animation starts.
   */
  (e: 'before-close'): void
  /**
   * Emitted after the close animation finishes.
   */
  (e: 'after-close'): void
  /**
   * Emitted with `false` when the user requests to close the sheet.
   * Useful for `v-model`-style usage alongside `:visible`.
   */
  (e: 'update', v: boolean): void
  /**
   * Emitted when the user requests to close the sheet (backdrop or close
   * button). Not emitted while `loading` is `true`.
   */
  (e: 'close'): void
}>()

const styles = useCssModule()

/**
 * All four edges are one problem in one dimension: the sheet slides along a
 * MAIN AXIS, entering from either the high end of it (right, bottom) or the low
 * end (left, top). Everything below is expressed as a distance along that axis,
 * and only `transformFor` knows which CSS axis it turns into.
 */
const isHorizontal = computed(
  () => props.edge === 'left' || props.edge === 'right'
)
/** +1 when the sheet enters from the high end of the axis, -1 from the low. */
const direction = computed(() =>
  props.edge === 'right' || props.edge === 'bottom' ? 1 : -1
)

const index = ref<number>(0)
const isActive = ref<boolean>(false)
const disableScroll = ref<boolean>(true)
const screenWidth = ref<number>(window.innerWidth)
const screenHeight = ref<number>(window.innerHeight)

/** The screen's extent along the main axis. */
const screenSize = computed(() =>
  isHorizontal.value ? screenWidth.value : screenHeight.value
)

const offset = ref<number>(0)

const inst = new SheetInstance({
  index,
  // Read once, at mount: the manager keeps a plain number, so changing `peek`
  // on an already-open sheet has no effect.
  peek: props.peek,
  isActive,
  offset
})

/** Where the sheet rests when it is the foreground sheet. */
const restPosition = computed(() =>
  direction.value > 0 ? Math.max(0, screenSize.value - finalSize.value) : 0
)

/** Where the sheet sits while closed — just past the edge it came from. */
const hiddenPosition = computed(() =>
  direction.value > 0 ? screenSize.value : -finalSize.value
)

function transformFor(position: number) {
  return isHorizontal.value
    ? `translate(${position}px, 0)`
    : `translate(0, ${position}px)`
}

const containerStyle = computed(() => {
  const rv: Record<string, string> = isHorizontal.value
    ? { width: finalSize.value + 'px' }
    : { height: finalSize.value + 'px' }
  /**
   * This currently solves a bug with the starting position of
   * sheets in Filters. If you see more issues, this is the place to start looking.
   */
  // apply offset if sheet is in background
  if (!isActive.value && offset.value) {
    // A backgrounded sheet is pushed toward the middle of the screen so it
    // peeks out from behind whatever covers it — which is the low direction
    // for a right/bottom sheet and the high direction for a left/top one.
    const pushed = restPosition.value - direction.value * offset.value
    const limit = Math.max(0, screenSize.value - finalSize.value)
    rv.transform = transformFor(Math.min(Math.max(pushed, 0), limit))
  } else if (isActive.value) {
    // need to reset position after potentially moving it with the code above
    rv.transform = transformFor(restPosition.value)
  }
  return rv
})

const finalSize = computed(() => {
  if (isActive.value) {
    return Math.min(props.size, screenSize.value)
  }
  return props.size
})

const actions = computed(() => {
  const actions: ActionType[] = []
  if (props.secondaryActions) {
    actions.push(...props.secondaryActions)
  }
  if (props.primaryAction) {
    actions.push({
      type: 'primary',
      ...props.primaryAction
    })
  }
  return actions
})

function beforeEnter(el: Element) {
  index.value = Math.max(props.minIndex, manager.getNextZIndex())
  // For some reason Safari on Mac does not like a scrollable container
  // inside a fixed position element. The container cannot be scrolled with
  // the mouse without first manually dragging the scrollbar. Might have
  // something to do with GPU rendering bug. A workaround is to change from
  // overflow `hidden` to `scroll` after the animation.
  disableScroll.value = true
  manager.add(inst)
  if (el instanceof HTMLElement) {
    el.style.transitionDuration = `${props.animateInDuration}ms`
    el.style.transform = transformFor(hiddenPosition.value)
  }
  emit('before-open')
}

function enter(el: Element, done: () => void) {
  if (el instanceof HTMLElement) {
    el.style.transform = transformFor(restPosition.value)
  }
  isActive.value = true
  setTimeout(done, props.animateInDuration)
}

function afterEnter() {
  // Enable scrolling for workaround in `beforeEnter` hook.
  disableScroll.value = false
  emit('after-open')
}

function beforeLeave(el: Element) {
  if (el instanceof HTMLElement) {
    el.style.transitionDuration = `${props.animateOutDuration}ms`
    el.style.transform = transformFor(hiddenPosition.value)
  }
  manager.beforeRemove(inst)
  emit('before-close')
}

function leave(_el: Element, done: () => void) {
  setTimeout(done, props.animateOutDuration)
}

function afterLeave() {
  manager.remove(inst)
  disableScroll.value = true
  emit('after-close')
}

function close() {
  if (!props.loading) {
    emit('update', false)
    emit('close')
  }
}

if (!document.getElementById('sheetManager')) {
  const container = document.createElement('div')
  container.id = 'sheetManager'
  document.body.appendChild(container)
}

manager.setOverflowClass(styles.preventScroll)
const onResize = debounce(
  () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
  },
  250,
  { leading: true }
)
window.addEventListener('resize', onResize)
onBeforeUnmount(() => {
  if (onResize) {
    window.removeEventListener('resize', onResize)
  }
  manager.remove(inst)
})
</script>

<template>
  <Teleport to="#sheetManager">
    <div
      :class="[
        'UIElement',
        $style.sheet,
        index === 0 && $style.foreground,
        index > 0 && $style.background
      ]"
      :style="{
        zIndex: index,
        '--sheet-in-duration': `${animateInDuration}ms`,
        '--sheet-out-duration': `${animateOutDuration}ms`
      }"
    >
      <!-- @slot Rendered outside the sheet container (e.g. for nested sheets). -->
      <slot name="external"></slot>
      <transition
        name="Sheet-backdrop"
        :enter-active-class="$style.backdropEnterActive"
        :leave-active-class="$style.backdropLeaveActive"
        :enter-class="$style.backdropEnter"
        :leave-to-class="$style.backdropLeaveTo"
      >
        <div
          :class="$style.backdrop"
          @click="close"
          v-if="visible"
        ></div>
      </transition>
      <transition
        name="Sheet-container"
        @before-enter="beforeEnter"
        @enter="enter"
        @after-enter="afterEnter"
        @before-leave="beforeLeave"
        @leave="leave"
        @after-leave="afterLeave"
      >
        <div
          :class="[
            $style.container,
            $style[`container__${edge}`],
            containerClass
          ]"
          v-if="visible"
          :style="containerStyle"
        >
          <div
            v-if="loading"
            :class="$style.loader"
          >
            <Spinner
              color="blue"
              size="large"
            />
          </div>
          <div
            :class="$style.header"
            :style="color ? { borderTopColor: color } : undefined"
          >
            <div
              :class="$style.close"
              @click="close"
            >
              <Icon icon="mdi:close" />
            </div>
            <div :class="$style.title">{{ title }}</div>
            <div :class="$style.actions">
              <!-- @slot Custom content in the header, shown left of the action buttons. -->
              <slot name="actions"></slot>
              <ButtonGroup
                v-if="actions.length"
                :style="[$slots.actions && 'margin-left: 8px']"
              >
                <Button
                  v-for="(action, index) in actions"
                  :key="index"
                  :type="action.type"
                  :disabled="action.disabled"
                  :url="action.url"
                  :external="action.external"
                  :icon="action.icon"
                  @click="() => action.onAction?.()"
                >
                  {{ action.label }}
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <ScrollPane
            :class="$style.contentWrapper"
            :disabled="disableScroll"
            :padding="padded ? '30px' : '0'"
            contain
          >
            <div
              :class="[
                $style.content,
                padded && $style.contentPadded,
                contentClass
              ]"
            >
              <!-- @slot The main sheet content. -->
              <slot></slot>
            </div>
          </ScrollPane>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<style lang="scss" module>
$slideDuration: 0.7s;

// Added to <body> when sheet is open.
.preventScroll {
  // Safari on Mac does not respect `overflow-y: hidden`.
  overflow: hidden;
}

.sheet {
  position: fixed;
  z-index: 1000;
}
.backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--octans-text);
  opacity: 0.32;
  will-change: opacity;
}
// Every edge anchors the container at the top-left and moves it with a
// transform, so one set of transition rules covers all four. Only the axis it
// stretches along differs — the size on the sliding axis comes from the inline
// style, since it depends on the screen.
.container {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  background: var(--octans-surface-sunken);
  box-shadow: var(--octans-shadow-lg);
  transform: translate(0, 0);
  transition: transform $slideDuration ease;
  will-change: transform;
}
.container__right,
.container__left {
  bottom: 0;
}
.container__top,
.container__bottom {
  right: 0;
}
.loader {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  padding-top: 100px;
  background: var(--octans-scrim);
}
.header {
  display: flex;
  align-items: center;
  min-height: 65px;
  padding-left: 10px;
  padding-right: 16px;
  // Accent strip, shown when the `color` prop is set (see borderTopColor binding).
  border-top: 3px solid transparent;
  border-bottom: 1px solid var(--octans-border);
  background: var(--octans-surface);
}
.close {
  padding: 10px 15px;
  color: var(--octans-text-subdued);
  font-size: 20px;
  &:hover {
    color: var(--octans-text);
    cursor: pointer;
  }
}
.title {
  flex: 1 1 auto;
  font-size: 20px;
}
.actions {
  display: flex;
  flex: 0 0 auto;
}

.contentWrapper {
  flex: 1;
  overflow-y: hidden;
  // padding: 25px;
}

.contentPadded {
  max-width: 900px;
  margin: 0px auto;
}

.backdropEnterActive {
  transition: opacity var(--sheet-in-duration, #{$slideDuration}) ease;
}
.backdropLeaveActive {
  transition: opacity var(--sheet-out-duration, #{$slideDuration}) ease;
}
.backdropEnter,
.backdropLeaveTo {
  opacity: 0;
}
</style>
