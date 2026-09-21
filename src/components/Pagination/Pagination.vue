<script lang="ts" setup>
import { Button } from '@/components/Button'
import { Formatter } from '@/components/Formatter'
import { Icon } from '@/components/Icon'
import { Popover } from '@/components/Popover'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { pageItems } from './pageItems'

const emit = defineEmits(['change', 'update-limit'])

type PaginationProps = {
  offset: number
  limit: number
  total: number
  /**
   * How many positions the run of page numbers takes up. The first page, the
   * last page, each ellipsis and each number fill one, so the strip is the
   * same width whichever page is current. Odd numbers keep the current page
   * centred. `0` leaves the numbers out and keeps only previous/next.
   *
   * Defaults to 11.
   */
  pageSlots?: number
  /**
   * @deprecated Use `pageSlots`. Treated as `pageSlots: maxPages + 1`, which
   * is what the old strip showed on its first page.
   */
  maxPages?: number
  pageSizes?: number[] | false
  /**
   * Whether the rows-per-page select shows. `true` shows it with the full
   * strip only, so it never wraps under the compact form on a phone;
   * `'always'` keeps it in the compact form too; `false` leaves it out.
   */
  showPageSize?: boolean | 'always'
  /**
   * The compact form — `« ‹ 3 / 20 › »` — in place of the run of page
   * numbers. `'auto'` uses it whenever the full strip would not fit the
   * component's container: the strip is measured as rendered, so the slot
   * count, the length of the page numbers, the page-size select and the
   * "Go to" field all count, and a pagination in a sidebar or a card compacts
   * on a desktop too. `true` uses it everywhere; `false` never does.
   */
  compact?: boolean | 'auto'
  /**
   * A container width, in pixels, under which `compact: 'auto'` uses the
   * compact form — in place of measuring whether the full strip fits. For
   * when the switch should happen at a known width, or before the strip
   * actually overflows.
   */
  compactBelow?: number
  /** Leave the first/last-page buttons out of the compact form. */
  hideFirstLast?: boolean
  /**
   * Lets the reader type a page number: a "Go to" field after the full strip,
   * and a popover from the `3 / 20` readout in the compact form.
   */
  jumpTo?: boolean
  /**
   * Where the controls sit within the component's width. The component fills
   * its container, so this is how it lines up with what is next to it.
   */
  align?: 'left' | 'center' | 'right'
}

const props = withDefaults(defineProps<PaginationProps>(), {
  offset: 0,
  limit: 25,
  total: 0,
  pageSlots: undefined,
  maxPages: undefined,
  pageSizes: () => [5, 10, 25, 50, 100],
  showPageSize: true,
  compact: 'auto',
  compactBelow: undefined,
  hideFirstLast: false,
  jumpTo: false,
  align: 'left'
})

const numPages = computed(() => {
  return Math.ceil(props.total / props.limit)
})
const pageIndex = computed(() => {
  return props.offset / props.limit
})
const hasPrev = computed(() => {
  return pageIndex.value > 0
})
const hasNext = computed(() => {
  return pageIndex.value < numPages.value - 1
})
// The compact form reads `1 / 1` for an empty result rather than `1 / 0`.
const lastPageIndex = computed(() => Math.max(numPages.value - 1, 0))

const slots = computed(() => {
  if (props.pageSlots !== undefined) return props.pageSlots
  if (props.maxPages !== undefined) {
    return props.maxPages > 0 ? props.maxPages + 1 : 0
  }
  return 11
})
const items = computed(() =>
  pageItems(pageIndex.value + 1, numPages.value, slots.value)
)

/**
 * Every page button is as wide as the widest number in the list, so `1` and
 * `100` take the same slot and the strip's width never depends on which
 * numbers happen to be showing. Counted in characters — including the
 * thousands separators the formatter adds — and turned into a width in CSS.
 */
const digits = computed(() => {
  const length = String(Math.max(numPages.value, 1)).length
  return length + Math.floor((length - 1) / 3)
})

const setPageIndex = (index: number) => {
  emit('change', index * props.limit)
}
const changePageSize = (event: Event) => {
  const size = parseInt((event.target as HTMLInputElement).value, 10)
  emit('update-limit', size)
}

// ---- Which form -------------------------------------------------------------

const root = ref<HTMLElement>()
const fullStrip = ref<HTMLElement>()
const pageSizeEl = ref<HTMLElement>()
/** The container's width, or null until it has been measured. */
const containerWidth = ref<number | null>(null)
/** What the full form — strip plus page-size select — needs, as rendered. */
const neededWidth = ref(0)

// The full form stays in the DOM while the compact one shows, hidden but laid
// out (see `.hidden`), so it can be measured at any time and the decision does
// not depend on which form is currently showing — otherwise switching to
// compact would make the full strip unmeasurable and the choice flip back.
const measure = () => {
  if (!root.value) return
  containerWidth.value = root.value.clientWidth
  neededWidth.value =
    (fullStrip.value?.offsetWidth ?? 0) +
    // The select carries a left margin its offsetWidth leaves out.
    (pageSizeEl.value ? pageSizeEl.value.offsetWidth + 8 : 0)
}

const isCompact = computed(() => {
  if (props.compact !== 'auto') return props.compact
  // Not laid out yet (or no ResizeObserver, as in tests): the full form,
  // which is also what a server render gives.
  if (containerWidth.value === null) return false
  if (props.compactBelow !== undefined) {
    return containerWidth.value < props.compactBelow
  }
  return containerWidth.value < neededWidth.value
})

// ResizeObserver delivers its first notification after layout and before
// paint, and re-runs layout for any change made in the callback, so the
// switch to compact on a narrow screen happens before anything is drawn.
let observer: ResizeObserver | null = null
onMounted(() => {
  // Once by hand, for a tab that is not rendering (a background tab delivers
  // no observer callbacks until it is shown) and for anywhere without the
  // observer at all.
  measure()
  if (typeof ResizeObserver === 'undefined' || !root.value) return
  observer = new ResizeObserver(measure)
  observer.observe(root.value)
  // The strip's own width changes with the page count and slot count.
  if (fullStrip.value) observer.observe(fullStrip.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

const showsPageSize = computed(() => {
  if (!props.pageSizes || !props.showPageSize) return false
  // With the compact form forced there is no full strip to sit beside.
  return props.compact !== true || props.showPageSize === 'always'
})
const sizes = computed(() => props.pageSizes || [])

// What the full form needs changes with the page count, the slot count and
// the fields shown; re-measure after the DOM has caught up.
watch([numPages, slots, () => props.jumpTo, showsPageSize], async () => {
  await nextTick()
  measure()
})

// ---- Go to page -----------------------------------------------------------

const jumpValue = ref('')
const jumpOpen = ref(false)
const jumpInput = ref<HTMLInputElement>()

/** Reads the typed page, clamps it to the list and goes there. */
const jump = (hide?: () => void) => {
  const wanted = parseInt(jumpValue.value, 10)
  jumpValue.value = ''
  if (hide) hide()
  if (isNaN(wanted)) return
  const index = Math.min(Math.max(wanted, 1), Math.max(numPages.value, 1)) - 1
  if (index !== pageIndex.value) setPageIndex(index)
}

// Popover leaves focus alone on open (it disables Radix's auto-focus), so put
// it in the field ourselves: on a phone the numeric keypad then comes up with
// the popover, which is the point of it.
watch(jumpOpen, async (open) => {
  if (!open) return
  await nextTick()
  jumpInput.value?.focus()
})
</script>

<template>
  <div
    ref="root"
    :class="[
      'UIElement',
      $style.Pagination,
      align === 'center' && $style.Pagination__center,
      align === 'right' && $style.Pagination__right
    ]"
    :style="{ '--pagination-digits': digits }"
  >
    <!--
      `UIElement` carries the library's typographic baseline, and every sibling
      component's root already has it. Without it the `font: inherit` on the
      buttons below would reach past the component to the host page's font.
      (The comment lives inside the root on purpose: before it, a dev build
      keeps it and the component becomes a fragment.)
    -->
    <div
      v-if="isCompact"
      :class="$style.Pages"
      data-compact
    >
      <button
        v-if="!hideFirstLast"
        :class="$style.Button"
        :disabled="!hasPrev"
        aria-label="First page"
        @click="setPageIndex(0)"
      >
        <Icon icon="mdi:chevron-double-left" />
      </button>
      <button
        :class="$style.Button"
        :disabled="!hasPrev"
        aria-label="Previous page"
        @click="setPageIndex(pageIndex - 1)"
      >
        <Icon icon="mdi:chevron-left" />
      </button>
      <Popover
        v-if="jumpTo"
        :visible="jumpOpen"
        placement="top"
        surface
        auto-hide
        @update:visible="(open: boolean) => (jumpOpen = open)"
      >
        <template #trigger>
          <button
            :class="[$style.Button, $style.Status, $style.Status__button]"
            aria-label="Go to page"
          >
            <Formatter
              :value="Math.min(pageIndex, lastPageIndex) + 1"
              type="integer"
            />
            /
            <Formatter
              :value="lastPageIndex + 1"
              type="integer"
            />
          </button>
        </template>
        <template #default="{ hide }">
          <form
            :class="$style.Jump"
            @submit.prevent="jump(hide)"
          >
            <label :class="$style.Jump_field">
              <span :class="$style.Jump_label">Go to page</span>
              <input
                ref="jumpInput"
                v-model="jumpValue"
                :class="$style.Jump_input"
                type="number"
                inputmode="numeric"
                min="1"
                :max="lastPageIndex + 1"
                :placeholder="`1 – ${lastPageIndex + 1}`"
              />
            </label>
            <Button type="primary">Go</Button>
          </form>
        </template>
      </Popover>
      <div
        v-else
        :class="$style.Status"
      >
        <Formatter
          :value="Math.min(pageIndex, lastPageIndex) + 1"
          type="integer"
        />
        /
        <Formatter
          :value="lastPageIndex + 1"
          type="integer"
        />
      </div>
      <button
        :class="$style.Button"
        :disabled="!hasNext"
        aria-label="Next page"
        @click="setPageIndex(pageIndex + 1)"
      >
        <Icon icon="mdi:chevron-right" />
      </button>
      <button
        v-if="!hideFirstLast"
        :class="$style.Button"
        :disabled="!hasNext"
        aria-label="Last page"
        @click="setPageIndex(lastPageIndex)"
      >
        <Icon icon="mdi:chevron-double-right" />
      </button>
    </div>
    <div
      v-if="compact !== true"
      ref="fullStrip"
      :class="[$style.Pages, isCompact && $style.hidden]"
    >
      <button
        :class="$style.Button"
        :disabled="!hasPrev"
        aria-label="Previous page"
        @click="setPageIndex(pageIndex - 1)"
      >
        <Icon icon="mdi:chevron-left" />
      </button>
      <template
        v-for="(item, index) in items"
        :key="index"
      >
        <button
          v-if="item.type === 'page'"
          :class="[
            $style.Button,
            $style.Page,
            item.page - 1 === pageIndex && $style.selected
          ]"
          :aria-current="item.page - 1 === pageIndex ? 'page' : undefined"
          @click="setPageIndex(item.page - 1)"
        >
          <Formatter
            :value="item.page"
            type="integer"
          />
        </button>
        <button
          v-else
          :class="[$style.Button, $style.Page, $style.Gap]"
          :aria-label="`Page ${item.to}`"
          @click="setPageIndex(item.to - 1)"
        >
          <span :class="$style.Gap_dots">…</span>
          <Icon
            :class="$style.Gap_icon"
            :icon="
              item.to < pageIndex + 1
                ? 'mdi:chevron-double-left'
                : 'mdi:chevron-double-right'
            "
          />
        </button>
      </template>
      <button
        :class="$style.Button"
        :disabled="!hasNext"
        aria-label="Next page"
        @click="setPageIndex(pageIndex + 1)"
      >
        <Icon icon="mdi:chevron-right" />
      </button>
      <label
        v-if="jumpTo"
        :class="$style.Jump__inline"
      >
        <span>Go to</span>
        <input
          v-model="jumpValue"
          :class="$style.Jump_input"
          type="number"
          inputmode="numeric"
          min="1"
          :max="lastPageIndex + 1"
          aria-label="Go to page"
          @keydown.enter.prevent="jump()"
          @change="jump()"
        />
      </label>
    </div>
    <div
      v-if="showsPageSize"
      ref="pageSizeEl"
      :class="[
        $style.PageSize,
        isCompact && showPageSize !== 'always' && $style.hidden
      ]"
    >
      <select
        :value="limit"
        :class="$style.PageSize_select"
        aria-label="Rows per page"
        @change="changePageSize"
      >
        <option
          v-for="size in sizes"
          :key="size"
          :value="size"
        >
          {{ size }}
        </option>
      </select>
      <Icon
        :class="$style.PageSize_icon"
        icon="mdi:menu-down"
      />
    </div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/mixins';

.Pagination {
  position: relative;
  display: flex;
  align-items: center;
  // Should a forced full strip still not fit, the page-size select drops to
  // its own line rather than off the edge of the screen.
  flex-wrap: wrap;
  row-gap: 4px;
  // The component fills its container, which is what `align` works within
  // and what the width it measures to choose a form means. Inline-size
  // containment makes its own intrinsic width zero, so it never sizes its
  // parent to its content — without this a content-sized grid track or flex
  // parent grows to hold the full strip, the measured width is never "too
  // narrow", and the strip overflows instead of compacting. In block flow it
  // then fills by itself; in a flex row `flex: 1` claims the space left
  // beside its siblings.
  contain: inline-size;
  flex: 1 1 auto;
  min-width: 0;
}
.Pagination__center {
  justify-content: center;
}
.Pagination__right {
  justify-content: flex-end;
}

.Pages {
  display: flex;
  align-items: center;
}

// The full form while the compact one shows: out of the flow and invisible,
// but laid out at its natural width so it can still be measured.
.hidden {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
}

.Status {
  display: flex;
  gap: 4px;
  // Room for the widest `current / total` the list can produce (two numbers
  // and the slash, in characters), so the readout stays one width and its
  // neighbours stay put as the page changes.
  min-width: calc((var(--pagination-digits, 1) * 2 + 3) * 1ch + 16px);
  min-height: 30px;
  padding: 0 8px;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  white-space: nowrap;
}
.Status__button {
  // Reads as the tappable thing it is, in the same idiom as the arrows.
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}

.Button {
  // A `<button>` inherits neither font nor colour from its surroundings — it
  // starts from the user agent's, which is Arial here. The `font-size` below
  // still wins, being the later declaration.
  font: inherit;
  // Flex centring rather than the button's own line box: the chevron SVGs sit
  // on the text baseline, and the descender space under it left them 1.5px
  // above the digits next door.
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  min-height: 30px;
  padding: 0 5px;
  background: transparent;
  border: 0;
  border-radius: var(--octans-radius-field);
  font-size: 14px;
  // A `<button>` does not inherit `color` — it starts from the user agent's
  // `buttontext`, which left the page numbers black on a dark surface.
  color: var(--octans-text);

  &:disabled {
    // Explicit, because setting `color` above also opts out of the user
    // agent's own dimming of a disabled control.
    color: var(--octans-text-disabled);
  }

  &:hover:not([disabled]) {
    background: var(--octans-surface-hover);
    cursor: pointer;
  }

  &:focus {
    outline: 0;
    box-shadow: inset 0 0 0 2px var(--octans-text-disabled);
  }

  &.selected,
  &.selected:hover {
    background: var(--octans-primary);
    // The token that exists for exactly this: content on a primary fill.
    // `--octans-surface` used to stand in for it, which worked in light (near
    // white) but went dark-on-dark once the surface flipped.
    color: var(--octans-text-on-primary);
  }
  &.selected:focus {
    box-shadow: inset 0 0 0 2px
      color-mix(in srgb, var(--octans-primary) 85%, black);
  }
}

// One slot in the run of numbers: wide enough for the longest page number in
// the list (set by the component, in characters), never narrower than a
// square, so every slot is the same width and the strip holds still.
.Page {
  min-width: max(30px, calc(var(--pagination-digits, 1) * 1ch + 14px));
}

// The ellipsis is a button too — it goes to the nearest page it hides — and
// says so on hover by turning into a double chevron.
.Gap {
  .Gap_icon {
    display: none;
  }
  &:hover {
    .Gap_dots {
      display: none;
    }
    .Gap_icon {
      display: block;
    }
  }
}

.Jump {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}
.Jump_field {
  display: flex;
  align-items: center;
  gap: 8px;
}
.Jump_label {
  @include inputLabel;
  white-space: nowrap;
}
.Jump_input {
  @include input;
  width: 72px;
  min-height: 30px;
  padding: 0 8px;
  text-align: center;
  -moz-appearance: textfield;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
  }
}
.Jump__inline {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  font-size: 14px;
  white-space: nowrap;

  .Jump_input {
    width: 56px;
  }
}

.PageSize {
  display: flex;
  align-items: center;
  min-height: 30px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--octans-border);
}
.PageSize_select {
  // Form controls inherit neither background, colour nor font, so these must
  // be explicit or the control keeps the user agent's light default in dark
  // mode — and its Arial.
  font: inherit;
  background: transparent;
  color: var(--octans-text);

  &::placeholder {
    color: var(--octans-text-subdued);
  }
  appearance: none;
  width: 45px;
  min-height: 30px;
  margin-right: -16px;
  padding: 0 10px 0 5px;
  border: none;
  border-radius: var(--octans-radius-field);
  background: transparent;
  font-size: 14px;
  @include inputNoZoom;
  text-align: center;
  cursor: pointer;

  &:hover {
    background: var(--octans-surface-hover);
  }
  &:focus {
    outline: 0;
    box-shadow: inset 0 0 0 2px var(--octans-text-disabled);
  }
}
.PageSize_icon {
  pointer-events: none;
}
</style>
