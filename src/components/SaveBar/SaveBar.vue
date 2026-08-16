<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import { confirmModal } from '@/components/Modal'
import { computed } from 'vue'
import { saveBar } from './store'
import type { SaveBarProps } from './types'

const defaultTranslations = {
  save: 'Save',
  discard: 'Discard',
  unsavedChanges: 'Unsaved Changes',
  discardModal: {
    title: 'Discard all unsaved changes?',
    content:
      "If you discard changes, you'll delete any edits you made since you last saved.",
    primaryActionLabel: 'Discard changes',
    secondaryActionLabel: 'Continue editing'
  }
}

const props = withDefaults(defineProps<SaveBarProps>(), {
  state: undefined,
  layoutMode: 'default',
  translations: () => ({}),
  confirmDiscard: true
})

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'discard'): void
}>()

// The prop is an override for a bar someone drives directly; unset, the bar
// follows the global state, which is what `GlobalNav` relies on.
const effectiveState = computed(() => props.state ?? saveBar.state)

const i18n = computed(() => {
  return {
    ...defaultTranslations,
    ...props.translations
  }
})

function saveChanges() {
  emit('save')
  saveBar.save()
}

function discardChanges() {
  if (!props.confirmDiscard) {
    emit('discard')
    saveBar.discard()
    return
  }
  confirmModal({
    ...i18n.value.discardModal,
    primaryActionType: 'destructive',
    onConfirm: () => {
      emit('discard')
      saveBar.discard()
    }
  })
}
</script>

<template>
  <transition
    :enter-active-class="$style.Fade_enterActive"
    :leave-active-class="$style.Fade_leaveActive"
    :enter-from-class="$style.Fade_enterFrom"
    :leave-to-class="$style.Fade_leaveTo"
  >
    <div
      v-if="effectiveState !== 'unchanged'"
      :class="[
        'UIElement',
        $style.SaveBar,
        effectiveState === 'saving' && $style.saving,
        layoutMode === 'alternate' && $style.SaveBar__alternate
      ]"
    >
      <div :class="$style.Content">
        <div :class="$style.Title">
          {{ i18n.unsavedChanges }}
        </div>
        <div :class="$style.Actions">
          <button
            :class="[$style.Action, $style.Action__discard]"
            :disabled="effectiveState === 'saving'"
            @click="discardChanges"
          >
            {{ i18n.discard }}
          </button>
          <button
            :class="[$style.Action, $style.Action__save]"
            :disabled="effectiveState === 'saving'"
            @click="saveChanges"
          >
            <span :class="$style.Action_content">{{ i18n.save }}</span>
            <Icon
              v-if="effectiveState === 'saving'"
              :class="$style.Action_spinner"
              icon="mdi:loading"
            />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" module>
.SaveBar {
  --textColor: var(--octans-text-on-primary);
  --bgColor: var(--octans-primary);
  --hoverBgColor: rgba(255, 255, 255, 0.3);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--ui-globalNav-height, 40px);
  background: var(--bgColor);
  color: var(--textColor);
}
.SaveBar__alternate {
  .Content {
    margin-left: 0px;
  }
}
.Content {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: var(--ui-sideNav-width, 0px);
  max-width: var(--octans-page-current-width);
  padding: 0 var(--octans-page-padding-x);
}

.Title {
  font-weight: 500;
  font-size: 16px;
}
.Actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}
.Action {
  // A `<button>` inherits no typography of its own. This rule sets no size, so
  // inheriting also lifts the labels off the user agent's 13.33px onto the
  // bar's own 14px, which is what the rest of the library uses.
  font: inherit;
  position: relative;
  appearance: none;
  padding: 6px 16px;
  border: none;
  border-radius: var(--octans-radius-field);
  & + & {
    margin-left: 8px;
  }
  &:hover:not(:disabled) {
    cursor: pointer;
  }
  &:disabled {
    opacity: 0.5;
  }
}
.Action_content {
  .saving & {
    opacity: 0;
  }
}

.Action_spinner {
  position: absolute;
  left: 50%;
  animation: spinner 0.5s infinite linear;
}
@keyframes spinner {
  from {
    transform: translate(-50%, 0) rotate(0deg);
  }
  to {
    transform: translate(-50%, 0) rotate(360deg);
  }
}

.Action__save {
  background: var(--textColor);
  color: var(--bgColor);
  &:hover:not(:disabled) {
    opacity: 0.85;
  }
}
.Action__discard {
  background: transparent;
  color: var(--textColor);
  &:hover:not(:disabled) {
    background: var(--hoverBgColor);
  }
}

.Fade_enterActive,
.Fade_leaveActive {
  transition: opacity 0.3s ease;
}
.Fade_enterFrom,
.Fade_leaveTo {
  opacity: 0;
}
</style>
