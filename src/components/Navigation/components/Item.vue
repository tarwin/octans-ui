<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import { MaybeRouterLink } from '@/components/MaybeRouterLink'
import { Popper } from '@/components/Popper'
import { Tooltip } from '@/components/Tooltip'
import { computed, ref } from 'vue'
import type { NavigationItemProps, NavigationSecondaryItemType } from '../types'

const props = withDefaults(defineProps<NavigationItemProps>(), {
  theme: 'light',
  isSubItem: false,
  hasPrimaryIcons: false,
  min: false,
  highlight: false
})

const iconSubMenuState = ref({
  onSub: false,
  onIcon: false
})

const hasChildren = computed(() => {
  return !props.isSubItem && Array.isArray(props.item.items)
})

const simpleMatch = computed(() => {
  const { location, item } = props
  const match = {
    isActive: false,
    isExactActive: false
  }
  if (item.active) {
    match.isActive = true
    match.isExactActive = true
  } else if (location) {
    if (item.id === location) {
      match.isActive = true
      match.isExactActive = true
    } else if (!props.isSubItem && item.items) {
      for (const child of item.items) {
        if (child.id === location) {
          match.isActive = true
          break
        }
      }
    }
  }
  return match
})

function mouseEnterIcon(show: () => void) {
  show()
  iconSubMenuState.value.onIcon = true
}
function mouseLeaveIcon(hide: () => void) {
  setTimeout(() => {
    if (!iconSubMenuState.value.onSub) {
      hide()
    }
  }, 100)
  iconSubMenuState.value.onIcon = false
}
function mouseEnterSub() {
  iconSubMenuState.value.onSub = true
}
function mouseLeaveSub(hide: () => void) {
  setTimeout(() => {
    if (!iconSubMenuState.value.onIcon) {
      hide()
    }
  }, 100)
  iconSubMenuState.value.onSub = false
}
</script>

<template>
  <MaybeRouterLink
    :to="item.url"
    :match-routes="!location"
    custom
  >
    <template #default="{ href, isActive, isExactActive }">
      <div
        :class="[
          'UIElement',
          $style.ItemContainer,
          isSubItem && $style.isSubItem,
          hasChildren && $style.hasChildren,
          (isActive || simpleMatch.isActive) && $style.isActive,
          (isExactActive || simpleMatch.isExactActive) && $style.isExactActive,
          min && $style.min
        ]"
      >
        <Tooltip
          v-if="min && (!item.items || !item.items.length)"
          :content="item.label"
          placement="right"
        >
          <a
            :class="[
              $style.Item,
              theme === 'dark' && $style.Dark,
              highlight &&
                (isExactActive || simpleMatch.isExactActive) &&
                $style.Item__highlight
            ]"
            :href="href"
            @click="(event) => $emit('click', item, event)"
          >
            <Icon
              v-if="hasPrimaryIcons && item.icon"
              :icon="item.icon"
              :class="[$style.Item_icon, $style.Item_icon_min]"
            />
          </a>
        </Tooltip>

        <a
          v-else-if="!min"
          :class="[
            $style.Item,
            theme === 'dark' && $style.Dark,
            highlight &&
              (isExactActive || simpleMatch.isExactActive) &&
              $style.Item__highlight
          ]"
          :href="href"
          @click="(event) => $emit('click', item, event)"
        >
          <Icon
            v-if="hasPrimaryIcons && item.icon"
            :icon="item.icon"
            :class="[$style.Item_icon, $style.Item_icon_max]"
          />
          <span :class="$style.Item_label">{{ item.label }}</span>
          <span
            v-if="item.badge"
            :class="[
              $style.Item_badge,
              theme === 'dark' && $style.Item_badge_dark
            ]"
          >
            {{ item.badge }}
          </span>
          <!-- This item opens a whole sub-menu rather than navigating. -->
          <Icon
            v-if="item.subMenu"
            icon="mdi:chevron-right"
            :class="$style.Item_chevron"
          />
        </a>

        <Popper
          v-else-if="min && item.items && item.items.length"
          placement="right"
          :auto-trigger-toggle="false"
        >
          <template #trigger="{ show, hide }">
            <a
              @click="(event) => $emit('click', item, event)"
              :href="href"
              @mouseenter="mouseEnterIcon(show)"
              @mouseleave="mouseLeaveIcon(hide)"
              :class="[$style.Item, theme === 'dark' && $style.Dark]"
            >
              <Icon
                v-if="hasPrimaryIcons && item.icon"
                :icon="item.icon"
                :class="[$style.Item_icon, $style.Item_icon_min]"
              />
            </a>
          </template>
          <template #default="{ hide }">
            <div
              @mouseenter="mouseEnterSub"
              @mouseleave="mouseLeaveSub(hide)"
              :class="[
                $style.Content,
                $style.SubItemContent,
                theme === 'dark' && $style.SubItemContent_Dark,
                min && $style.SubItemContent_min
              ]"
            >
              <Item
                v-for="child in item.items"
                :key="child.id"
                :item="child"
                :theme="theme"
                :location="location"
                @click="
                  (child: NavigationSecondaryItemType, event: Event) =>
                    $emit('click', child, event)
                "
              />
            </div>
          </template>
        </Popper>

        <div
          v-if="!isSubItem && (isActive || simpleMatch.isActive) && !min"
          :class="$style.Content"
        >
          <Item
            v-for="child in item.items"
            :key="child.id"
            :item="child"
            :theme="theme"
            :location="location"
            is-sub-item
            @click="
              (child: NavigationSecondaryItemType, event: Event) =>
                $emit('click', child, event)
            "
          />
        </div>
      </div>
    </template>
  </MaybeRouterLink>
</template>

<style lang="scss" module>
@import '@/styles/variables';

$itemXPadding: 12px;

.ItemContainer {
  position: relative;
  margin-top: 2px;
}

.Item {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0px $itemXPadding;
  padding: 7px 8px;
  background: transparent;
  border-radius: var(--octans-radius-field);
  font-size: 14px;
  color: var(--octans-text);
  text-decoration: none;

  .isSubItem & {
    padding-left: 40px;
    color: var(--octans-text-subdued);
  }

  .isExactActive:not(.hasChildren) > &:not(.Item__highlight) {
    color: var(--nav-focusColor);
    background: var(--octans-surface-hover);
  }

  &:hover {
    background: var(--octans-surface-hover);
    cursor: pointer;
  }

  // The highlight treatment: the whole active row takes the accent — text and
  // icon in the accent colour, a soft accent-tinted fill, and a small bar on
  // the row's own left edge. Colour via `--ui-nav-highlightColor`.
  &.Item__highlight {
    color: var(--ui-nav-highlightColor, var(--octans-primary));
    background: color-mix(
      in srgb,
      var(--ui-nav-highlightColor, var(--octans-primary)) 10%,
      transparent
    );
    .Item_icon {
      color: inherit;
    }
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--ui-nav-highlightColor, var(--octans-primary));
    }
    &:hover {
      background: color-mix(
        in srgb,
        var(--ui-nav-highlightColor, var(--octans-primary)) 15%,
        transparent
      );
    }
  }

  &.Dark {
    color: var(--nav-textColor);
    .Item_icon {
      color: var(--nav-textColor);
    }
    .isExactActive,
    .isActive.min & {
      background: var(--nav-focusColor);
      color: var(--nav-focusTextColor);
      .Item_icon {
        color: var(--nav-focusTextColor);
      }
    }
    .isSubItem & {
      padding-left: 20px;
      background: none;
      color: var(--nav-textColor);
    }
    .isExactActive:not(.hasChildren) > &:not(.Item__highlight) {
      background-color: var(--nav-focusColor);
      color: var(--nav-focusTextColor);
      .Item_icon {
        color: var(--nav-focusTextColor);
      }
    }
    &:hover {
      background-color: var(--nav-focusColor);
      color: var(--nav-focusTextColor);
      .Item_icon {
        color: var(--nav-focusTextColor);
      }
    }
    .isExactActive:not(.hasChildren).isSubItem & {
      background-color: var(--nav-focusColor);
      color: var(--nav-focusTextColor);
    }
  }
}

.Item_icon {
  // `content-box`, against the global border-box reset: the SVG draws at
  // `1em` of this font-size, and under border-box the padding would eat into
  // that em — a "20px" icon whose glyph is actually 12px.
  box-sizing: content-box;
  flex: 0 0 20px;
  padding: 2px;
  border-radius: var(--octans-radius-field);
  color: var(--nav-textColor);
  font-size: 20px;
  &.Item_icon_max {
    margin-right: 10px;
  }
}

.Item_label {
  flex: 1;
  font-weight: 500;
}

.Item_badge {
  padding: 2px 8px;
  background: var(--octans-surface-selected);
  border-radius: var(--octans-radius-full);
  font-size: 12px;
  &.Item_badge_dark {
    color: var(--octans-text);
  }
}

.Item_chevron {
  color: var(--nav-textColor);
  font-size: 16px;
}

.SubItemContent {
  padding-top: 8px;
  padding-bottom: 8px;
  border-radius: var(--octans-radius-field);
  margin-left: 5px;

  &.SubItemContent_Dark {
    background: var(--octans-surface-sunken);
    .Item {
      color: var(--octans-text-subdued);
    }
  }

  &.SubItemContent_Dark.SubItemContent_min {
    .Item {
      // padding-left: 30px;
      &:hover {
        background-color: var(--octans-surface-selected);
        color: var(--octans-text);
      }

      &::before {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        left: 10px;
        border-radius: 50%;
        background: transparent;
      }
    }
    .isExactActive .Item {
      background-color: var(--octans-surface-selected);
      color: var(--octans-text);
    }
  }
}
</style>
