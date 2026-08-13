<script lang="ts" setup>
import { computed, watch } from 'vue'
import { ActionList } from '../ActionList'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { useSaveBar } from '../SaveBar'
import { Spinner } from '../Spinner'
import type { PageProps } from './types'

const props = withDefaults(defineProps<PageProps>(), {
  breadcrumbs: () => [],
  secondaryActions: () => [],
  actionGroups: () => [],
  loading: false,
  changed: false,
  saving: false,
  size: 'default'
})

const emit = defineEmits<{
  (e: 'clickHelp'): void
  (e: 'save'): void
  (e: 'discard'): void
}>()

const { setState } = useSaveBar({
  onSave: () => emit('save'),
  onDiscard: () => emit('discard')
})

const collapsedActionSections = computed(() => {
  const sections = []
  if (props.secondaryActions.length) {
    sections.push({
      title: '',
      items: props.secondaryActions
    })
  }
  for (const group of props.actionGroups) {
    sections.push({
      title: group.title,
      items: group.actions
    })
  }
  return sections
})

const saveBarState = computed(() => {
  if (props.saving && props.changed) return 'saving'
  if (props.changed) return 'changed'
  return 'unchanged'
})

watch(saveBarState, setState, { immediate: true })

// Mirrors this page's width preset onto `<html>` so fixed-position chrome
// that wants to line up with the page — the GlobalNav save bar — can read it.
// Fixed elements cannot inherit from the page, so a global property is the
// only channel; the cost is that two simultaneously mounted Pages would fight
// over it, which is also true of the save bar itself.
const CURRENT_WIDTH: Record<NonNullable<PageProps['size']>, string> = {
  narrow: 'var(--octans-page-width-narrow)',
  default: 'var(--octans-page-width)',
  wide: 'var(--octans-page-width-wide)',
  fullWidth: 'none'
}

watch(
  () => props.size,
  (size: PageProps['size']) => {
    document.documentElement.style.setProperty(
      '--octans-page-current-width',
      CURRENT_WIDTH[size ?? 'default']
    )
  },
  { immediate: true }
)
</script>

<template>
  <div :class="['UIElement', $style.Page, size && $style['Page__' + size]]">
    <div
      v-if="loading"
      :class="$style.Page_loader"
    >
      <Spinner
        color="blue"
        size="large"
      />
    </div>
    <!--
      The query container for everything the page lays out. A separate wrapper
      rather than `.Page` itself: `container-type: inline-size` implies layout
      containment, which would trap the `position: fixed` loader above inside
      the page box.
    -->
    <div :class="$style.Page_container">
      <div
        v-if="breadcrumbs.length"
        :class="$style.Page_breadcrumbs"
      >
        <span
          v-for="(item, index) in breadcrumbs"
          :key="index"
          :class="$style.Breadcrumb"
        >
          <Button
            :class="$style.Breadcrumb_button"
            :url="item.url"
            :disabled="item.disabled || (!item.url && !item.onAction)"
            type="link"
            @click="() => item.onAction?.()"
          >
            {{ item.label }}
          </Button>
        </span>
      </div>
      <div :class="$style.Page_header">
        <div :class="$style.Page_headerMain">
          <div :class="$style.Page_titleWrapper">
            <div :class="$style.Page_title">
              {{ title }}
              <Icon
                v-if="includeHelp"
                :class="$style.Page_helpIcon"
                icon="mdi:information"
                @click="$emit('clickHelp')"
              />
              <template v-if="$slots['badge']">
                <div :class="$style.Page_badge">
                  <slot name="badge"></slot>
                </div>
              </template>
              <Badge
                v-else-if="badge"
                :class="$style.Page_badge"
                :progress="badge.progress"
                :size="badge.size"
                :status="badge.status"
              >
                {{ badge.label }}
              </Badge>
            </div>
            <div
              v-if="subtitle"
              :class="$style.Page_subtitle"
            >
              {{ subtitle }}
            </div>
          </div>
          <div :class="$style.PageActions">
            <div
              v-for="(action, index) in secondaryActions"
              :key="'secondary' + index"
              :class="$style.PageAction"
            >
              <Button
                :class="$style.PageAction_button"
                :icon="action.icon"
                :disabled="action.disabled"
                :type="action.type || 'plain'"
                :url="action.url"
                :external="action.external"
                :tooltip="action.tooltip"
                :tooltipPosition="action.tooltipPosition"
                @click="() => action.onAction?.()"
              >
                {{ action.label }}
              </Button>
            </div>
            <div
              v-for="(group, index) in actionGroups"
              :key="'group' + index"
              :class="$style.PageAction"
            >
              <ActionList :items="group.actions">
                <Button
                  :icon="group.icon"
                  :class="$style.PageAction_button"
                  type="plain"
                  dropdown
                >
                  {{ group.title }}
                </Button>
              </ActionList>
            </div>
          </div>
          <!-- .PageActions -->
        </div>
        <div
          v-if="collapsedActionSections.length"
          :class="$style.PageActions_collapsed"
        >
          <ActionList
            placement="bottom-end"
            :sections="collapsedActionSections"
          >
            <Button
              :class="$style.PageAction_button"
              type="plain"
              icon="mdi:dots-horizontal"
            ></Button>
          </ActionList>
        </div>
        <div
          v-if="primaryAction || $slots['primaryAction']"
          :class="$style.Page_headerPrimaryActionWrapper"
        >
          <slot name="primaryAction">
            <template v-if="primaryAction">
              <Button
                v-if="primaryAction.label"
                :type="primaryAction.type || 'primary'"
                :icon="primaryAction.icon"
                :disabled="primaryAction.disabled"
                :url="primaryAction.url"
                :tooltip="primaryAction.tooltip"
                :tooltipPosition="primaryAction.tooltipPosition"
                :external="primaryAction.external"
                @click="() => primaryAction?.onAction?.()"
              >
                {{ primaryAction.label }}
              </Button>
              <Button
                v-else
                :type="primaryAction.type || 'primary'"
                :icon="primaryAction.icon"
                :disabled="primaryAction.disabled"
                :url="primaryAction.url"
                :tooltip="primaryAction.tooltip"
                :tooltipPosition="primaryAction.tooltipPosition"
                :external="primaryAction.external"
                @click="() => primaryAction?.onAction?.()"
              />
            </template>
          </slot>
        </div>
      </div>
      <div :class="$style.Page_content">
        <slot />
      </div>
    </div>
    <!-- .Page_container -->
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';
@import '../../styles/mixins';

.Page {
  max-width: var(--octans-page-width);
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  padding: var(--octans-page-padding-y) var(--octans-page-padding-x);
}

.Page__narrow {
  max-width: var(--octans-page-width-narrow);
}

.Page__wide {
  max-width: var(--octans-page-width-wide);
}

.Page__fullWidth {
  max-width: none;
}

.Page_container {
  container: octans-page / inline-size;
}

.Page_loader {
  position: fixed;
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

@include inStyleguide {
  .Page_loader {
    position: absolute;
    // border: 2px solid red;
  }
}

.Page_header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.Page_headerMain {
  flex: 1;
}

.Page_titleWrapper {
  margin-bottom: 8px;
}
.Page_title {
  display: flex;
  align-items: center;
  font-size: 30px;
}
.Page_subtitle {
  color: var(--octans-text);
  font-size: 14px;
}

.Page_helpIcon {
  margin-left: 5px;
  font-size: 14px;
  height: 30px;
  color: var(--octans-text-subdued);
  &:hover {
    color: var(--octans-text);
    cursor: pointer;
  }
}

.Page_badge {
  margin-left: 16px;
}

.PageActions {
  display: flex;
}
// Tight: plain buttons carry their own padding now, so most of the visual
// gap comes from inside the buttons themselves.
.PageAction + .PageAction {
  margin-left: 4px;
}

.PageAction_button {
  color: var(--octans-text);

  &:hover:not(:disabled) {
    color: var(--octans-text);
  }
}

.Breadcrumb {
  & + &::before {
    content: '\00a0\00a0/\00a0\00a0';
    color: var(--octans-text-subdued);
  }
}
.Breadcrumb_button {
  color: var(--octans-text);
  &:hover:not(:disabled) {
    color: var(--octans-text);
    cursor: pointer;
  }
}

.PageActions_collapsed {
  display: none;
}

.Page_content {
  margin-top: 20px;
}

// Queries the PAGE's width, not the viewport's — a page inside an AppFrame
// has already lost 240px to the nav, so a viewport breakpoint would collapse
// the actions too late. 960px is where the old 1000px viewport breakpoint fired
// for a standalone page, so the bare-page behaviour is unchanged.
@container octans-page (max-width: 960px) {
  .Page_headerPrimaryActionWrapper {
    width: 100%;
  }

  .PageActions {
    display: none;
  }

  .PageActions_collapsed {
    display: block;
  }
}
</style>
