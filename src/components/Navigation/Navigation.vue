<script lang="ts" setup>
import { useAppFrameLayout } from '@/components/AppFrame/context'
import { Icon } from '@/components/Icon'
import { computed, ref, watch } from 'vue'
import Section from './components/Section.vue'
import type {
  NavigationProps,
  NavigationPrimaryItemType,
  NavigationSubMenuType
} from './types'

const props = withDefaults(defineProps<NavigationProps>(), {
  theme: 'light',
  allowMinimize: false,
  preventDefault: false,
  logo: false,
  backLabel: 'Back',
  highlight: false,
  minimizePosition: 'edge',
  accentStripe: false
})

const emit = defineEmits<{
  (e: 'toggle-min', v: boolean): void
  (e: 'click-item', item: NavigationPrimaryItemType, event: MouseEvent): void
  (e: 'update:location', id: string): void
  (e: 'clickLogo'): void
  (e: 'open-menu', item: NavigationPrimaryItemType): void
  (e: 'back'): void
}>()

// Inside an `AppFrame`, the collapsed state is shared through the layout
// context: the chevron here narrows the frame's column, and the frame's
// `sidebarMin` prop narrows this menu — no wiring in between.
const frame = useAppFrameLayout()

// With `sidebarCollapse: 'hide'`, collapsed means the whole sidebar is gone —
// this menu never rails down, so a hover-peek shows it at full width.
const railed = (value: boolean | undefined) =>
  (frame?.sidebarCollapse !== 'hide' && value) ?? false

const min = ref(railed(frame?.sidebarMin))
// Lags `min` on expand so labels reappear after the width animation.
const childMin = ref(min.value)

const hasPrimaryIcons = computed(() => {
  return props.sections?.some((section) => {
    return section.items?.some((item) => item.icon)
  })
})

// In a frame with `sidebarCollapse: 'hide'`, the show/hide control lives in
// the GlobalNav — this menu's own button stands down.
const showMinButton = computed(
  () => props.allowMinimize && frame?.sidebarCollapse !== 'hide'
)

const hasTitleGroup = computed(
  () =>
    !!props.title ||
    props.logo ||
    (showMinButton.value && props.minimizePosition === 'top')
)

/**
 * On the rail, the toggle sits OVER the brand mark and reveals on hover
 * instead of taking a row of its own.
 *
 * Taking a row caused both of the bugs this replaces: `edge` pushed the title
 * group down 48px the moment you collapsed, so the logo moved between states,
 * and `top` left button and logo sharing a 64px flex row, where they
 * overlapped and the transparent button swallowed clicks meant for the logo.
 * `bottom` is pinned away from the header and keeps its own place.
 *
 * While this is on, the button renders INSIDE the title group whichever
 * position is configured — that is what lets one rule centre it, rather than
 * offsetting the absolutely-positioned `edge` variant by a hard-coded guess at
 * where the group happens to be.
 */
const railOverlay = computed(
  () =>
    childMin.value &&
    hasTitleGroup.value &&
    showMinButton.value &&
    props.minimizePosition !== 'bottom'
)

// `highlight` and `accentStripe` double as colours: `true` leaves the default
// (primary), a string becomes the colour via the custom property each reads.
const rootStyle = computed(() => ({
  ...(typeof props.highlight === 'string'
    ? { '--ui-nav-highlightColor': props.highlight }
    : {}),
  ...(typeof props.accentStripe === 'string'
    ? { '--ui-nav-accentStripeColor': props.accentStripe }
    : {})
}))

function applyMin(value: boolean) {
  min.value = value
  if (value) {
    // Collapse at once — labels must not overflow a narrowing rail.
    childMin.value = true
  } else {
    // Expanding lags so labels reappear after the width animation.
    setTimeout(() => (childMin.value = false), 200)
  }
}

watch(
  () => railed(frame?.sidebarMin),
  (value) => {
    if (value !== min.value) applyMin(value)
  }
)

function toggleMin() {
  if (!props.allowMinimize) return
  applyMin(!min.value)
  frame?.setSidebarMin(min.value)
  emit('toggle-min', min.value)
}

// The drill-down stack. Empty means the top-level `sections`; a click on an
// item with `subMenu` pushes, Back pops. `direction` steers which way the
// panels slide.
const menuStack = ref<NavigationSubMenuType[]>([])
const direction = ref<'forward' | 'back'>('forward')
const currentMenu = computed(
  () => menuStack.value[menuStack.value.length - 1] ?? null
)
const currentSections = computed(
  () => currentMenu.value?.sections ?? props.sections ?? []
)

function goBack() {
  direction.value = 'back'
  menuStack.value.pop()
  emit('back')
}

function onClickItem(item: NavigationPrimaryItemType, event: MouseEvent) {
  if (item.subMenu) {
    // Opening the menu IS the action — no navigation, no location change.
    event.preventDefault()
    direction.value = 'forward'
    menuStack.value.push(item.subMenu)
    emit('open-menu', item)
    return
  }
  if (props.preventDefault) {
    event.preventDefault()
  }
  emit('click-item', item, event)
  emit('update:location', item.id)
  item.onAction?.(item)
}
</script>

<template>
  <div
    :class="[
      'UIElement',
      $style.Navigation,
      theme === 'dark' && $style.Dark,
      childMin && $style.NavMin,
      showMinButton &&
        minimizePosition === 'edge' &&
        $style.Navigation__edgeButton,
      showMinButton &&
        minimizePosition === 'edge' &&
        !hasTitleGroup &&
        $style.Navigation__edgePad,
      railOverlay && $style.Navigation__railOverlay,
      accentStripe && $style.Navigation__stripe
    ]"
    :style="rootStyle"
  >
    <!-- Reachable in both states, out of the content's way. -->
    <button
      v-if="showMinButton && minimizePosition === 'edge' && !railOverlay"
      :class="[$style.Min_Button, $style.Min_Button__edge]"
      type="button"
      :aria-label="childMin ? 'Expand menu' : 'Collapse menu'"
      @click="toggleMin"
    >
      <Icon :icon="childMin ? 'mdi:chevron-right' : 'mdi:chevron-left'" />
    </button>

    <div
      v-if="hasTitleGroup"
      :class="$style.TitleGroup"
    >
      <div
        v-if="title"
        :class="$style.Title"
      >
        {{ title }}
      </div>
      <div
        v-else-if="logo"
        :class="$style.LogoWrap"
        @click.prevent="$emit('clickLogo')"
      >
        <!--
          Supply your own brand mark. `theme` is exposed so the slot can swap
          between a light and dark variant; `logoMin` is the square mark for
          the minimized rail.
        -->
        <slot
          v-if="!childMin"
          name="logo"
          :theme="theme"
        ></slot>
        <slot
          v-else
          name="logoMin"
          :theme="theme"
        ></slot>
      </div>
      <button
        v-if="showMinButton && (minimizePosition === 'top' || railOverlay)"
        :class="$style.Min_Button"
        type="button"
        :aria-label="childMin ? 'Expand menu' : 'Collapse menu'"
        @click="toggleMin"
      >
        <Icon :icon="childMin ? 'mdi:chevron-right' : 'mdi:chevron-left'" />
      </button>
    </div>

    <div :class="$style.Body">
      <div :class="$style.Menus">
        <Transition
          :enter-active-class="$style.Slide_enterActive"
          :leave-active-class="$style.Slide_leaveActive"
          :enter-from-class="
            direction === 'forward'
              ? $style.SlideFwd_enterFrom
              : $style.SlideBack_enterFrom
          "
          :leave-to-class="
            direction === 'forward'
              ? $style.SlideFwd_leaveTo
              : $style.SlideBack_leaveTo
          "
        >
          <div :key="menuStack.length">
            <template v-if="currentMenu">
              <div
                :class="$style.Back"
                role="button"
                tabindex="0"
                @click="goBack"
                @keydown.enter="goBack"
              >
                <Icon icon="mdi:arrow-left" />
                <span
                  v-if="!childMin"
                  :class="$style.Back_label"
                >
                  {{ backLabel }}
                </span>
              </div>
              <div
                v-if="currentMenu.title && !childMin"
                :class="$style.SubMenuTitle"
              >
                {{ currentMenu.title }}
              </div>
            </template>
            <div
              v-for="(section, ind) in currentSections"
              :key="section.id"
            >
              <div
                v-if="ind > 0"
                :class="$style.Section_Divider"
              />
              <Section
                :theme="theme"
                :section="section"
                :location="location"
                :has-primary-icons="hasPrimaryIcons"
                :highlight="!!highlight"
                @click-item="onClickItem"
                :min="childMin"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>
    <!-- .Body -->

    <!-- Pinned below the scrolling sections — a user card, notifications. -->
    <div
      v-if="$slots.footer"
      :class="$style.Footer"
    >
      <slot
        name="footer"
        :min="childMin"
      ></slot>
    </div>

    <button
      v-if="showMinButton && minimizePosition === 'bottom'"
      :class="[$style.Min_Button, $style.Min_Button__bottom]"
      type="button"
      :aria-label="childMin ? 'Expand menu' : 'Collapse menu'"
      @click="toggleMin"
    >
      <Icon :icon="childMin ? 'mdi:chevron-right' : 'mdi:chevron-left'" />
    </button>
  </div>
</template>

<style lang="scss" module>
@import '@/styles/variables';

.Navigation {
  --nav-bgColor: var(--octans-surface-app);
  --nav-textColor: var(--octans-text-subdued);
  --nav-focusColor: #{$focusColor};

  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  // With an edge button and no title row, the button would overlap the first
  // section — reserve its lane.
  &.Navigation__edgePad .Body {
    padding-top: 48px;
  }

  &.Dark {
    --nav-bgColor: var(--octans-surface-sunken);
    --nav-textColor: var(--octans-text-subdued);
    --nav-focusColor: var(--octans-surface-selected);
    --nav-focusTextColor: var(--octans-text);
    .Section_Divider {
      // width: 100%;
      position: absolute;
      left: 15px;
      right: 15px;
      height: 2px;
      border-radius: var(--octans-radius-field);
      background: var(--nav-focusColor);
    }
  }
}

// The brand stripe down the far-left edge — 10px of the organisation's
// colour running the full height, with everything else padded past it.
.Navigation__stripe {
  padding-left: 10px;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    z-index: 2;
    background: var(--ui-nav-accentStripeColor, var(--octans-primary));
  }
}

// The scrolling middle: sections roll under the pinned title row and footer.
// Bottom padding ensures that content at the bottom of long menus is not
// obscured by the browser's link location preview in the bottom-left corner
// of the browser. E.g. in Google Chrome.
.Body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 30px;
}

.TitleGroup {
  display: flex;
  flex: 0 0 auto;
  margin: 10px 12px 4px 12px;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;

  .Title {
    padding: 5px 8px;
    color: var(--nav-textColor);
    font-weight: 500;
  }
  .LogoWrap {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 4px 8px;
    // The edge button floats at the top right; keep wide logos out from
    // under it.
    max-width: calc(100% - 40px);
    :global(img),
    :global(svg) {
      max-width: 100%;
      max-height: 40px;
    }
    &:hover {
      cursor: pointer;
    }
  }
}

// On the icon rail there is no room beside the edge button, so the (square)
// logo centres beneath it instead.
.NavMin .TitleGroup {
  justify-content: center;
  .LogoWrap {
    max-width: none;
    // No side padding on the rail. The wrap is only as wide as the rail
    // allows, so 8px each side leaves a content box narrower than the square
    // mark — which then overflows anchored to the left and sits ~4px right of
    // centre, taking the overlaid toggle off-centre with it.
    padding-left: 0;
    padding-right: 0;
    justify-content: center;
    :global(img),
    :global(svg) {
      max-width: none;
    }
  }
}
// Room for the edge button, which floats above the title group. Not needed
// once the button is overlaid on the group instead of sitting above it — and
// leaving it on is what kept the logo dropping 38px on collapse.
.Navigation__edgeButton.NavMin:not(.Navigation__railOverlay) .TitleGroup {
  margin-top: 48px;
}

// --- the rail's overlaid toggle ---------------------------------------------
// The brand mark keeps the top slot in both states — collapsing must not move
// it — and the toggle sits on top, appearing on hover or keyboard focus. It
// already carries a surface, border and shadow, so it reads over a logo.
.Navigation__railOverlay {
  .TitleGroup {
    position: relative;
    // Cancels the row the edge button used to claim.
    margin-top: 10px;
  }

  .Min_Button {
    z-index: 4;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--octans-border);
    background: var(--octans-surface);
    color: var(--octans-text-subdued);
    box-shadow: var(--octans-shadow-sm);
    font-size: 16px;
    opacity: 0;
    // Not just invisible — unclickable. An `opacity: 0` button still takes
    // the pointer, which is what made the logo un-clickable under the `top`
    // position: you aimed at the brand mark and collapsed the menu instead.
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  // Both positions render the button inside the title group here, so one rule
  // centres it on whatever the group contains.
  .TitleGroup .Min_Button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    // The base button tints itself with the nav's own focus colour on hover —
    // but hover is the only state this is ever SEEN in, so that tint would be
    // its whole appearance: a coloured block over the logo with a washed-out
    // chevron. Keep it reading as the raised chrome control it is.
    &:hover {
      background: var(--octans-surface-hover);
      color: var(--octans-text);
    }
  }

  // Keyboard included: tabbing to the button reveals it rather than moving
  // focus somewhere invisible.
  &:hover .Min_Button,
  &:focus-within .Min_Button {
    opacity: 1;
    pointer-events: auto;
  }
}

.Min_Button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border: none;
  background: transparent;
  color: var(--nav-textColor);
  border-radius: var(--octans-radius-field);
  font-size: 18px;
  &:hover {
    cursor: pointer;
    background-color: var(--nav-focusColor);
  }
}

// Floating on the sidebar's right edge, straddling the border. Styled as a
// small raised control so it reads as chrome, not as a menu item.
.Min_Button__edge {
  position: absolute;
  top: 16px;
  right: 8px;
  z-index: 3;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--octans-border);
  background: var(--octans-surface);
  color: var(--octans-text-subdued);
  box-shadow: var(--octans-shadow-sm);
  font-size: 16px;
  &:hover {
    background: var(--octans-surface-hover);
  }
}

// Centred on the icon rail — there is no "right side" worth hugging at 64px.
.NavMin .Min_Button__edge {
  right: 50%;
  transform: translateX(50%);
}

.Min_Button__bottom {
  flex: 0 0 auto;
  margin: 0 12px 10px 12px;
  padding: 6px;
  border-top: 1px solid var(--octans-border);
  border-radius: 0;
}

.Footer {
  flex: 0 0 auto;
  padding: 10px 0;
  border-top: 1px solid var(--octans-border);
}

// Panels slide over each other while a drill-down transitions, so the wrapper
// anchors the absolutely-positioned leaving panel.
.Menus {
  position: relative;
  overflow-x: hidden;
}

.Slide_enterActive {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.Slide_leaveActive {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.SlideFwd_enterFrom {
  transform: translateX(30px);
  opacity: 0;
}
.SlideFwd_leaveTo {
  transform: translateX(-30px);
  opacity: 0;
}
.SlideBack_enterFrom {
  transform: translateX(-30px);
  opacity: 0;
}
.SlideBack_leaveTo {
  transform: translateX(30px);
  opacity: 0;
}

.Back {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 13px 0px 13px;
  padding: 5px 7px;
  border-radius: var(--octans-radius-field);
  color: var(--nav-textColor);
  font-size: 14px;
  font-weight: 500;
  &:hover {
    cursor: pointer;
    background: var(--octans-surface-hover);
    color: var(--octans-text);
  }
}

.SubMenuTitle {
  margin: 8px 13px 0px 13px;
  padding: 0 7px;
  color: var(--nav-textColor);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}
</style>
