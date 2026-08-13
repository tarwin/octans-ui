<script lang="ts" setup>
import { Button, ButtonGroup } from '@/components/Button'
import { Spinner } from '@/components/Spinner'
import { computed, inject, ref } from 'vue'
import { EventDelegator } from '../EventDelegator'
import ModalBackdrop from './ModalBackdrop.vue'
import { MODAL_STACK, type ModalStackContext } from './manager'
import type { ModalProps } from './types'

const props = withDefaults(defineProps<ModalProps>(), {
  loading: false,
  noHeader: false,
  overflowVisible: false
})

// NOTE: `close` is deliberately NOT declared here. It collides with the
// `onClose` prop (Vue can't tell `onClose` and `@close` apart), and a declared
// emit makes Vue's optimized prop-update path skip the key forever — so
// `props.onClose` would stay stuck at its mount value in production builds and
// the "X" button / ESC handler would never appear for handlers bound after
// mount. `@close` still works: `close()` invokes the `onClose` prop, which is
// what the compiler produces for that listener.
const emit = defineEmits<{
  (e: 'afterEnter'): void
  (e: 'afterLeave'): void
}>()

const bodyMaxHeight = ref<string | null>(null)
const header = ref<HTMLElement>()
const preBody = ref<HTMLElement>()
const footer = ref<HTMLElement>()
const dialog = ref<HTMLElement>()

/**
 * Set when a `<ModalHost>` is rendering this modal as part of a stack. The host
 * owns the things that only make sense once for the whole stack — the backdrop
 * and the ESC key — so a managed modal draws neither, and instead hands back
 * the two behaviours the host cannot work out for itself.
 *
 * A `<Modal>` written into a template is unmanaged and unchanged: no host, no
 * injection, everything as it was.
 */
const stack = inject<ModalStackContext | null>(MODAL_STACK, null)

stack?.register({
  // Closing means different things to different modals — a confirm resolves
  // `false`, a prompt cancels — so the host asks rather than decides.
  requestClose: () => close(),
  focus: () => dialog.value?.focus()
})

/**
 * Offset each modal in a stack a little further down the page, and put it above
 * the one it opened over. Uses the margin rather than the transform, which the
 * enter and leave transitions already own.
 */
const stackStyle = computed(() => {
  if (!stack) return undefined
  const depth = stack.depth.value
  if (depth === 0) return { zIndex: 2001 }
  return {
    marginTop: `${100 + depth * 24}px`,
    zIndex: 2001 + depth
  }
})

const actions = computed(() => {
  const _actions = []
  if (props.secondaryActions) {
    _actions.push(...props.secondaryActions)
  }
  if (props.primaryAction) {
    _actions.push({
      type: props.primaryAction.type || 'primary',
      ...props.primaryAction
    })
  }
  return _actions
})

function enter() {
  updateBodyMaxHeight()
}

function afterEnter() {
  /**
   * Emitted after the modal is shown.
   */
  emit('afterEnter')
}

function afterLeave() {
  /**
   * Emitted after the modal is hidden.
   */
  emit('afterLeave')
}

function close() {
  /**
   * Emitted when the modal's "X" button is clicked, or ESC is pressed.
   * `props.onClose` is what `@close` compiles to, so this covers both the
   * listener and the explicit prop.
   */
  if (props.onClose) {
    props.onClose()
  }
}

function updateBodyMaxHeight() {
  const fixedHeight =
    ((header.value && header.value.clientHeight) || 0) +
    ((preBody.value && preBody.value.clientHeight) || 0) +
    ((footer.value && footer.value.clientHeight) || 0)
  // Screen height - dialog margin - fixed height
  bodyMaxHeight.value = `calc(100vh - 200px - ${fixedHeight}px)`
}
</script>

<template>
  <Teleport to="body">
    <div :class="['UIElement', overflowVisible && $style.overflowVisible]">
      <EventDelegator
        v-if="visible && onClose && !stack"
        @keydown.esc="close"
      />
      <ModalBackdrop
        v-if="!stack"
        :visible="visible"
      />
      <transition
        :enter-active-class="$style.dialogEnterActive"
        :leave-active-class="$style.dialogLeaveActive"
        :enter-from-class="$style.dialogEnterFrom"
        :leave-to-class="$style.dialogLeaveTo"
        @enter="enter"
        @after-enter="afterEnter"
        @after-leave="afterLeave"
      >
        <div
          ref="dialog"
          tabindex="-1"
          :class="$style.dialog"
          :style="[stackStyle, dialogStyle]"
          v-show="visible"
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
            v-if="!noHeader"
            :class="$style.header"
            ref="header"
          >
            <div :class="$style.title">{{ title }}</div>
            <Button
              v-if="onClose"
              :class="$style.close"
              type="link"
              icon="mdi:close"
              @click="close"
            />
          </div>
          <div
            v-if="$slots.preBody"
            :class="$style.preBody"
            :style="preBodyStyle"
            ref="preBody"
          >
            <!-- @slot Pre-body content, appears between header and body. -->
            <slot name="preBody"></slot>
          </div>
          <div
            :class="$style.body"
            :style="[{ maxHeight: bodyMaxHeight }, bodyStyle]"
          >
            <!-- @slot Body content, appears between header and footer. -->
            <slot></slot>
          </div>
          <div
            v-if="actions.length || $slots.footer"
            :class="$style.footer"
            ref="footer"
          >
            <!-- @slot Footer. -->
            <slot
              v-if="$slots.footer"
              name="footer"
            ></slot>
            <template v-else>
              <div :class="$style.footerWrapper">
                <div :class="$style.footerWrapperLeft">
                  <ButtonGroup>
                    <Button
                      v-for="(action, index) in tertiaryActions"
                      :key="index"
                      :icon="action.icon"
                      :type="action.type"
                      :disabled="action.disabled"
                      :url="action.url"
                      :external="action.external"
                      :tooltip="action.tooltip"
                      :tooltipPosition="action.tooltipPosition"
                      @click="() => action.onAction?.()"
                    >
                      {{ action.label }}
                    </Button>
                  </ButtonGroup>
                </div>
                <div :class="$style.footerWrapperRight">
                  <ButtonGroup>
                    <Button
                      v-for="(action, index) in actions"
                      :key="index"
                      :icon="action.icon"
                      :type="action.type"
                      :disabled="action.disabled"
                      :url="action.url"
                      :external="action.external"
                      :tooltip="action.tooltip"
                      :tooltipPosition="action.tooltipPosition"
                      @click="() => action.onAction?.()"
                    >
                      {{ action.label }}
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<style lang="scss" module>
.dialog {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  width: 620px;
  max-width: calc(100vw - 32px);
  margin: 100px auto 0;
  background: var(--octans-surface-raised);
  border-radius: var(--octans-radius-box);
  box-shadow:
    0 31px 41px 0 rgba(32, 42, 53, 0.2),
    0 2px 16px 0 rgba(32, 42, 54, 0.08);
  transform: translate(-50%, 0);
  overflow: hidden;

  .overflowVisible & {
    overflow: visible;
  }
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
  border-radius: var(--octans-radius-box);
}
.header {
  display: flex;
  align-items: center;
  min-height: 60px;
  border-bottom: 1px solid var(--octans-border);
}
.title {
  flex: 1 1 auto;
  padding: 0 20px;
  color: var(--octans-text);
  font-size: 20px;
  line-height: 28px;
}
.close {
  margin-right: 10px;
  color: var(--octans-text-subdued);
  font-size: 25px;
}

.preBody {
  padding: 20px;
  padding-bottom: 0;
}

.body {
  padding: 20px;
  overflow: auto;

  .overflowVisible & {
    overflow: visible;
  }
}

.footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 18px;
  border-top: 1px solid var(--octans-border);

  .footerWrapper {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;

    .footerWrapperLeft {
      flex: 1 1 auto;
    }
    .footerWrapperRight {
      flex: none;
    }
  }
}

.dialogEnterActive,
.dialogLeaveActive {
  transition-property: transform, opacity;
  transition-duration: 0.15s;
  transition-timing-function: cubic-bezier(0.645, 0.045, 0.355, 1);
}
.dialogEnterFrom,
.dialogLeaveTo {
  transform: translate(-50%, 200px);
  opacity: 0;
}
</style>
