<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
  type CSSProperties
} from 'vue'
import type {
  SplitterProps,
  SplitterResizeType,
  SplitterSizeType
} from './types'

/**
 * Two panes divided by a gutter the user can drag, with the keyboard, or by
 * double-clicking it.
 *
 * Only the START pane has a size; the end pane takes whatever is left. That is
 * what keeps the two halves adding up at any container width, and it is why
 * there is one `size` rather than one per pane.
 *
 * Three panes or more is a Splitter nested inside a pane of another one.
 */
const props = withDefaults(defineProps<SplitterProps>(), {
  size: '50%',
  direction: 'horizontal',
  min: undefined,
  max: undefined,
  disabled: false,
  collapsible: false,
  collapsed: false,
  snap: 40,
  deferred: false,
  storageKey: undefined,
  step: 10,
  snapTo: undefined,
  handle: 'line',
  hitArea: undefined,
  resetOnDoubleClick: true,
  label: 'Resize panes'
})

const emit = defineEmits<{
  /**
   * The start pane's new size, in whatever unit `size` was given in — so a
   * splitter driven by a percentage stays a percentage.
   */
  (e: 'update:size', size: SplitterSizeType): void
  /** Fired when the start pane is shut or reopened. */
  (e: 'update:collapsed', collapsed: boolean): void
  /**
   * The same move as `update:size`, reported in both units at once plus the
   * collapsed state, for consumers that need the one `size` is not in.
   */
  (e: 'resize', detail: SplitterResizeType): void
}>()

const containerEl = ref<HTMLElement>()
const startEl = ref<HTMLElement>()
const gutterEl = ref<HTMLElement>()
const paneId = useId()

// Mirrors of the two model props. Keeping local copies is what makes the
// splitter work when nobody binds `v-model` — it still drags, it just forgets
// on unmount. A bound parent stays authoritative through the watchers below.
const currentSize = ref<SplitterSizeType>(props.size)
const isCollapsed = ref(props.collapsed)

// Where the pane goes back to on double-click. The prop's value at mount
// rather than its value now, so a reset is "the size this was designed at"
// even after storage has restored something else.
const initialSize = props.size
// What a collapsed pane reopens to.
let restoreSize: SplitterSizeType = props.size

const dragging = ref(false)
const previewPx = ref<number | null>(null)

/**
 * Live geometry, in pixels. Kept in a ref rather than read on demand so the
 * ARIA values on the gutter update when the container resizes, not only when
 * someone drags it.
 */
const measured = ref({ px: 0, min: 0, max: 0, basis: 0, padStart: 0 })

const isHorizontal = computed(() => props.direction === 'horizontal')

/** A prop length as CSS: bare numbers are pixels, strings pass through. */
function cssLength(value: SplitterSizeType | undefined): string | undefined {
  if (value === undefined || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : value
}

const startStyles = computed<CSSProperties>(() => {
  const collapsed = isCollapsed.value
  const size = collapsed ? '0px' : cssLength(currentSize.value)
  // `min-width: auto` is the flex default, which would stop a pane shrinking
  // below its own content — an explicit zero is the floor when no `min` is
  // given. A collapsed pane drops the floor entirely, or `min` would hold it
  // open at exactly the width the user just dragged it shut past.
  const min = collapsed ? '0px' : (cssLength(props.min) ?? '0px')
  const max = collapsed ? undefined : cssLength(props.max)
  return isHorizontal.value
    ? { width: size, minWidth: min, maxWidth: max }
    : { height: size, minHeight: min, maxHeight: max }
})

const gutterStyles = computed<CSSProperties>(() =>
  // Left unset the band is the gutter's own width, so the default costs
  // nothing. The overhang itself is worked out in CSS, where the gutter's
  // width already lives.
  props.hitArea === undefined
    ? {}
    : ({ '--hit-area': cssLength(props.hitArea) } as CSSProperties)
)

const previewStyles = computed<CSSProperties>(() => {
  const at = `${(previewPx.value ?? 0) + measured.value.padStart}px`
  return isHorizontal.value ? { left: at } : { top: at }
})

// --- measuring ---------------------------------------------------------------

function axisSize(el: HTMLElement): number {
  const rect = el.getBoundingClientRect()
  return isHorizontal.value ? rect.width : rect.height
}

/**
 * Turns a resolved CSS length into pixels. Percentages are the only unit the
 * browser hands back unconverted, so they are the only one resolved here —
 * everything else has already been reduced to `px` by the time it is read off
 * a computed style.
 */
function lengthToPx(value: string, basis: number, fallback: number): number {
  // The unset values of `min-*` and `max-*`, plus jsdom's empty string.
  if (!value || value === 'auto' || value === 'none') return fallback
  const number = parseFloat(value)
  if (!Number.isFinite(number)) return fallback
  return value.endsWith('%') ? (number / 100) * basis : number
}

function measure() {
  const container = containerEl.value
  const start = startEl.value
  if (!container || !start) return

  const style = getComputedStyle(container)
  const padStart =
    parseFloat(isHorizontal.value ? style.paddingLeft : style.paddingTop) || 0
  const padEnd =
    parseFloat(isHorizontal.value ? style.paddingRight : style.paddingBottom) ||
    0
  // The content box along the split axis — the box a percentage width resolves
  // against, so the same one percentages have to be computed back into.
  const basis =
    Math.max(
      0,
      (isHorizontal.value ? container.clientWidth : container.clientHeight) -
        padStart -
        padEnd
    ) || 0

  const gutter = gutterEl.value ? axisSize(gutterEl.value) : 0
  const ceiling = Math.max(0, basis - gutter)

  // Read the bounds back off the pane rather than parsing the props, so `min`
  // and `max` can be any unit CSS understands: it has been applied as real CSS
  // and the browser has already resolved it.
  const paneStyle = getComputedStyle(start)
  const min = lengthToPx(
    isHorizontal.value ? paneStyle.minWidth : paneStyle.minHeight,
    basis,
    0
  )
  const max = lengthToPx(
    isHorizontal.value ? paneStyle.maxWidth : paneStyle.maxHeight,
    basis,
    ceiling
  )

  measured.value = {
    px: isCollapsed.value ? 0 : axisSize(start),
    min: Math.max(0, Math.min(min, ceiling)),
    max: Math.max(0, Math.min(max, ceiling)),
    basis,
    padStart
  }
}

// --- committing --------------------------------------------------------------

const round = (value: number) => Math.round(value * 100) / 100

/**
 * Expresses a pixel size in whatever unit the caller is using, so a two-way
 * bound `size` keeps the shape it was written in. See `SplitterSizeType` for
 * why only pixels and percentages survive the round trip.
 */
function toModelValue(px: number): SplitterSizeType {
  const current = currentSize.value
  if (typeof current === 'string') {
    const text = current.trim()
    if (text.endsWith('%')) {
      const { basis } = measured.value
      // A container with no measurable size has no percentage to express this
      // as, so fall back to pixels rather than dividing by zero.
      if (basis > 0) return `${round((px / basis) * 100)}%`
    } else if (text.endsWith('px')) {
      return `${Math.round(px)}px`
    }
  }
  return Math.round(px)
}

function emitResize(px: number, collapsed: boolean) {
  const { basis } = measured.value
  emit('resize', {
    px: round(px),
    percent: basis > 0 ? round((px / basis) * 100) : 0,
    collapsed
  })
}

function setCollapsed(value: boolean) {
  if (isCollapsed.value === value) return
  // Remember what to reopen to before the pane loses its size.
  if (value) restoreSize = currentSize.value
  else currentSize.value = restoreSize
  isCollapsed.value = value
  emit('update:collapsed', value)
}

/**
 * The single path everything takes — drag, keyboard, double-click. Takes a
 * desired pixel size, decides whether that means "shut", clamps the rest, and
 * tells everyone.
 */
function apply(raw: number) {
  const { min, max } = measured.value
  // Two ways to read "shut": dragged under the snap threshold outright, or
  // dragged that far past a minimum that would otherwise hold it open.
  if (props.collapsible && (raw < props.snap || min - raw > props.snap)) {
    setCollapsed(true)
    measured.value = { ...measured.value, px: 0 }
    emitResize(0, true)
    return
  }

  setCollapsed(false)
  const px = Math.min(max, Math.max(min, raw))
  const next = toModelValue(px)
  measured.value = { ...measured.value, px }
  if (next !== currentSize.value) {
    currentSize.value = next
    emit('update:size', next)
  }
  emitResize(px, false)
}

// --- dragging ----------------------------------------------------------------

/**
 * Rounds a dragged size to the nearest `snapTo` increment.
 *
 * Dragging only. The keyboard has `step`, `Home` and `End` mean the exact
 * bounds, and a reset means the exact size given — none of those are guesses
 * at where the user meant to stop, which is the only thing a grid improves.
 */
function quantise(px: number): number {
  const grid = props.snapTo
  if (grid === undefined || grid === '') return px
  const size =
    typeof grid === 'number'
      ? grid
      : grid.trim().endsWith('%')
        ? (parseFloat(grid) / 100) * measured.value.basis
        : parseFloat(grid)
  if (!Number.isFinite(size) || size <= 0) return px
  return Math.round(px / size) * size
}

function onPointerdown(event: PointerEvent) {
  if (props.disabled) return
  const handle = event.currentTarget as HTMLElement
  // Without capture, a fast drag that outruns the gutter is dropped. Optional
  // because the method is not universal — jsdom has none at all — and wrapped
  // because it throws on a pointer id the browser does not recognise, which a
  // synthetic event has. Losing capture costs one edge case; letting it throw
  // would cost the whole drag.
  try {
    handle.setPointerCapture?.(event.pointerId)
  } catch {
    // Nothing to do — the listeners below still run.
  }

  // `preventDefault` below stops the browser starting its own drag and
  // selection, but it also suppresses the focus a mousedown would normally
  // give a `tabindex` element — leaving the arrow keys dead immediately after
  // a mouse drag, which is the moment they are most likely to be reached for.
  // Focusing here is not treated as keyboard modality, so no ring appears.
  handle.focus?.()

  measure()
  const from = measured.value.px
  const origin = isHorizontal.value ? event.clientX : event.clientY
  dragging.value = true
  shield(true)
  if (props.deferred) previewPx.value = from

  const move = (moveEvent: PointerEvent) => {
    const delta =
      (isHorizontal.value ? moveEvent.clientX : moveEvent.clientY) - origin
    const raw = quantise(from + delta)
    if (props.deferred) {
      const { min, max } = measured.value
      previewPx.value = Math.min(max, Math.max(0, raw))
      if (!props.collapsible) previewPx.value = Math.max(min, previewPx.value)
    } else {
      apply(raw)
    }
  }

  const stop = () => {
    handle.removeEventListener('pointermove', move)
    handle.removeEventListener('pointerup', stop)
    handle.removeEventListener('pointercancel', stop)
    dragging.value = false
    shield(false)
    // In deferred mode this is the only moment the panes actually move.
    if (previewPx.value !== null) {
      const at = previewPx.value
      previewPx.value = null
      apply(at)
    }
    persist()
  }

  handle.addEventListener('pointermove', move)
  handle.addEventListener('pointerup', stop)
  handle.addEventListener('pointercancel', stop)
  event.preventDefault()
}

/**
 * Holds the resize cursor and kills text selection for the whole document
 * while dragging. Without it the cursor flickers back to an I-beam every time
 * the pointer leaves the few pixels of gutter, and the drag paints a selection
 * across both panes.
 */
let shielded: { cursor: string; userSelect: string } | null = null

function shield(on: boolean) {
  const body = typeof document === 'undefined' ? null : document.body
  if (!body) return
  if (on) {
    if (shielded) return
    shielded = { cursor: body.style.cursor, userSelect: body.style.userSelect }
    body.style.cursor = isHorizontal.value ? 'col-resize' : 'row-resize'
    body.style.userSelect = 'none'
  } else if (shielded) {
    body.style.cursor = shielded.cursor
    body.style.userSelect = shielded.userSelect
    shielded = null
  }
}

// --- keyboard and double-click -----------------------------------------------

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  measure()
  const { px, min, max } = measured.value
  const step = event.shiftKey ? props.step * 5 : props.step
  const forward = isHorizontal.value ? 'ArrowRight' : 'ArrowDown'
  const back = isHorizontal.value ? 'ArrowLeft' : 'ArrowUp'

  let next: number
  switch (event.key) {
    case forward:
      next = px + step
      break
    case back:
      next = px - step
      break
    case 'Home':
      next = min
      break
    case 'End':
      next = max
      break
    case 'Enter':
      // The WAI-ARIA window splitter's own binding, and the only way to shut a
      // collapsible pane without a pointer.
      if (!props.collapsible) return
      event.preventDefault()
      toggle()
      return
    default:
      // Anything else — the arrows across the other axis included — belongs to
      // the page, which may want to scroll.
      return
  }

  event.preventDefault()
  apply(next)
  persist()
}

/**
 * Re-reads the geometry once the browser has laid out the size just set, and
 * reports it.
 *
 * For the changes whose pixel result only CSS knows — reopening a pane to a
 * percentage, resetting to whatever `size` was — where measuring immediately
 * would read the size being replaced. `apply` needs none of this: it works in
 * pixels, so it already knows the answer.
 */
async function settle(collapsed: boolean) {
  await nextTick()
  measure()
  emitResize(collapsed ? 0 : measured.value.px, collapsed)
  persist()
}

function toggle() {
  const opening = isCollapsed.value
  setCollapsed(!opening)
  settle(!opening)
}

function onDblclick() {
  if (props.disabled || !props.resetOnDoubleClick) return
  restoreSize = initialSize
  setCollapsed(false)
  if (currentSize.value !== initialSize) {
    currentSize.value = initialSize
    emit('update:size', initialSize)
  }
  settle(false)
}

// --- persistence -------------------------------------------------------------

const STORAGE_PREFIX = 'octans-splitter:'

function persist() {
  if (!props.storageKey) return
  try {
    window.localStorage.setItem(
      STORAGE_PREFIX + props.storageKey,
      JSON.stringify({ size: currentSize.value, collapsed: isCollapsed.value })
    )
  } catch {
    // Private browsing, a full quota, a sandboxed frame — the splitter still
    // works for this session, it just will not be remembered.
  }
}

function restore() {
  if (!props.storageKey) return
  let stored: unknown
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + props.storageKey)
    if (!raw) return
    stored = JSON.parse(raw)
  } catch {
    // Unreadable or not JSON — anything written by an older version of this,
    // or by something else entirely. Fall through to the props.
    return
  }
  const value = stored as { size?: unknown; collapsed?: unknown }
  if (typeof value?.size === 'number' || typeof value?.size === 'string') {
    currentSize.value = value.size
    restoreSize = value.size
    // Emitting on mount so a bound parent agrees with what is on screen. It is
    // the price of restoring: the alternative is a `v-model` that silently
    // disagrees with the pane the user is looking at.
    emit('update:size', value.size)
  }
  if (typeof value?.collapsed === 'boolean' && value.collapsed) {
    isCollapsed.value = true
    emit('update:collapsed', true)
  }
}

// --- lifecycle ---------------------------------------------------------------

watch(
  () => props.size,
  (value) => {
    currentSize.value = value
    restoreSize = value
    measure()
  }
)
watch(
  () => props.collapsed,
  (value) => {
    isCollapsed.value = value
    measure()
  }
)
watch(() => [props.direction, props.min, props.max], measure)

let observer: ResizeObserver | null = null

onMounted(() => {
  restore()
  measure()
  // Both boxes, for two different reasons. The container because its width is
  // what `min`, `max` and any percentage are measured against, and it changes
  // without anything being dragged. The pane because it is the size the gutter
  // reports to assistive technology — and it settles after the browser lays
  // out, which is later than any code here can see.
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure)
    if (containerEl.value) observer.observe(containerEl.value)
    if (startEl.value) observer.observe(startEl.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  // A drag interrupted by an unmount would otherwise leave the whole document
  // stuck with a resize cursor and no text selection.
  shield(false)
})

defineExpose({
  /** Re-reads the geometry. For containers that resize without a resize event. */
  measure,
  /** Returns the split to the size it was given on mount. */
  reset: onDblclick,
  /** Shuts or reopens the start pane, when `collapsible`. */
  toggle
})
</script>

<template>
  <div
    ref="containerEl"
    :class="[
      'UIElement',
      $style.Splitter,
      isHorizontal ? $style.horizontal : $style.vertical,
      dragging && $style.dragging,
      // Deliberately not CSS-module classes: these are the styling hooks a
      // consumer's stylesheet reaches for, and a hashed name cannot be written
      // down. Same escape hatch as `Sticky-stuck`.
      dragging && 'Splitter-dragging',
      isCollapsed && 'Splitter-collapsed'
    ]"
  >
    <div
      :id="paneId"
      ref="startEl"
      :class="$style.pane"
      :style="startStyles"
    >
      <!-- @slot The first pane — left when horizontal, top when vertical. -->
      <slot
        name="start"
        :collapsed="isCollapsed"
      />
    </div>

    <div
      ref="gutterEl"
      :class="[$style.gutter, disabled && $style.gutterDisabled]"
      :style="gutterStyles"
      role="separator"
      :tabindex="disabled ? undefined : 0"
      :aria-label="label"
      :aria-controls="paneId"
      :aria-disabled="disabled || undefined"
      :aria-valuenow="Math.round(measured.px)"
      :aria-valuemin="Math.round(measured.min)"
      :aria-valuemax="Math.round(measured.max)"
      :aria-orientation="isHorizontal ? 'vertical' : 'horizontal'"
      @pointerdown="onPointerdown"
      @keydown="onKeydown"
      @dblclick="onDblclick"
    >
      <!--
        `aria-orientation` is the orientation of the GUTTER, not of the split:
        panes side by side are divided by a vertical line.

        @slot The gutter's contents, replacing whatever the `handle` PROP
        would have drawn. The prop picks between the built-in looks; this
        replaces them.
        @binding {boolean} collapsed Whether the start pane is shut.
        @binding {boolean} dragging Whether a drag is in progress.
      -->
      <slot
        name="handle"
        :collapsed="isCollapsed"
        :dragging="dragging"
      >
        <span
          v-if="handle !== 'none'"
          :class="$style.line"
          aria-hidden="true"
        ></span>
        <span
          v-if="handle === 'grip'"
          :class="$style.grip"
          aria-hidden="true"
        ></span>
      </slot>
    </div>

    <div :class="[$style.pane, $style.paneEnd]">
      <!-- @slot The second pane — right when horizontal, bottom when vertical. -->
      <slot
        name="end"
        :collapsed="isCollapsed"
      />
    </div>

    <div
      v-if="previewPx !== null"
      :class="$style.preview"
      :style="previewStyles"
      aria-hidden="true"
    ></div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.Splitter {
  display: flex;
  position: relative;
  // Panes are sized along the split axis and stretch across the other one, so
  // the splitter fills whatever box it is given rather than its content.
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;

  // The gutter's own width, and its three states. Overridable per splitter — a
  // denser layout can thin the target, and a gutter over a coloured surface
  // often needs its own line colour.
  --gutter-size: var(--Splitter-gutterSize, 9px);
  --gutter-color: var(--Splitter-gutterColor, #{$borderColor});
  --gutter-hover: var(--Splitter-gutterHoverColor, var(--octans-border-strong));
  --gutter-active: var(--Splitter-gutterActiveColor, var(--octans-primary));
  // How much of the panes either side the gutter also listens on. Set from the
  // `hitArea` prop; the gutter's own width by default, so no overhang.
  --hit-area: var(--gutter-size);
}

.horizontal {
  flex-direction: row;
}

.vertical {
  flex-direction: column;
}

.pane {
  // A flex item will not shrink below its content unless told to, which is how
  // a wide table in one pane silently wins an argument with the gutter.
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

// The start pane is sized; this one takes whatever is left, at any container
// width, which is why only one of the two carries a size.
.paneEnd {
  flex: 1 1 0;
}

.gutter {
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  // Or a drag on a touchscreen scrolls the page instead of moving the gutter.
  touch-action: none;
  background: transparent;
  padding: 0;
  border: 0;

  // The hit target, widened past the gutter's own width by `hitArea`. A
  // pseudo-element because hit-testing one counts as hitting the element it
  // belongs to, so the pointer handlers need to know nothing about it — and
  // because it overhangs the panes without taking any room in the layout.
  &::before {
    content: '';
    position: absolute;
    inset: calc((var(--gutter-size) - var(--hit-area)) / 2);
  }

  &:focus-visible {
    outline: 2px solid $focusColor;
    outline-offset: -2px;
  }

  &:hover .line,
  &:focus-visible .line,
  &:hover .grip,
  &:focus-visible .grip {
    background: var(--gutter-hover);
  }
}

.horizontal > .gutter {
  width: var(--gutter-size);
  cursor: col-resize;

  // Only along the split axis — overhanging the ends would reach past the
  // panes entirely.
  &::before {
    top: 0;
    bottom: 0;
  }
}

.vertical > .gutter {
  height: var(--gutter-size);
  cursor: row-resize;

  &::before {
    left: 0;
    right: 0;
  }
}

// The hairline: one pixel of paint inside nine pixels of target.
.line {
  background: var(--gutter-color);
  transition: background 120ms;
}

.horizontal > .gutter > .line {
  width: 1px;
  height: 100%;
}

.vertical > .gutter > .line {
  height: 1px;
  width: 100%;
}

// The grab bar, for gutters meant to be noticed. Sits on top of the hairline
// at the centre of the gutter rather than replacing it, so the division still
// reads as a continuous line.
.grip {
  // Taken out of flow so it sits ON the hairline rather than beside it — two
  // flex children would otherwise line up next to each other in a 9px box.
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: var(--gutter-color);
  transition: background 120ms;
}

.horizontal > .gutter > .grip {
  width: 3px;
  height: 28px;
}

.vertical > .gutter > .grip {
  height: 3px;
  width: 28px;
}

.gutterDisabled {
  cursor: default;
  opacity: 0.5;

  // A disabled gutter should not be quietly eating clicks meant for the pane
  // underneath the overhang.
  &::before {
    pointer-events: none;
  }

  &:hover .line,
  &:hover .grip {
    background: var(--gutter-color);
  }
}

.dragging .line,
.dragging .grip {
  background: var(--gutter-active);
}

// Where the split will land once a `deferred` drag is released. Sized and
// coloured like the gutter's own grip so the preview reads as the gutter's
// shadow rather than as a new piece of furniture.
.preview {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  background: var(--gutter-active);
}

.horizontal > .preview {
  top: 0;
  bottom: 0;
  width: var(--gutter-size);
  // Centred on the split, matching where the grip will be.
  transform: translateX(-50%);
  margin-left: calc(var(--gutter-size) / 2);
  background: linear-gradient(
    to right,
    transparent calc(50% - 0.5px),
    var(--gutter-active) calc(50% - 0.5px),
    var(--gutter-active) calc(50% + 0.5px),
    transparent calc(50% + 0.5px)
  );
}

.vertical > .preview {
  left: 0;
  right: 0;
  height: var(--gutter-size);
  transform: translateY(-50%);
  margin-top: calc(var(--gutter-size) / 2);
  background: linear-gradient(
    to bottom,
    transparent calc(50% - 0.5px),
    var(--gutter-active) calc(50% - 0.5px),
    var(--gutter-active) calc(50% + 0.5px),
    transparent calc(50% + 0.5px)
  );
}
</style>
