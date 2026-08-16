<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import { Spinner } from '@/components/Spinner'
import { computed } from 'vue'
import ProgressBar from './ProgressBar.vue'
import { type ToastProps } from './types'

const props = withDefaults(defineProps<ToastProps>(), {
  contrasting: true
})

defineEmits(['remove', 'pause', 'resume'])

const showProgress = computed(() => {
  return typeof props.item.progress === 'number'
})
</script>

<template>
  <div
    :class="[
      $style.Toast,
      !contrasting && $style.Toast_light,
      item.tone && $style['Toast_tone_' + item.tone]
    ]"
    @mouseenter="$emit('pause', item)"
    @mouseleave="$emit('resume', item)"
  >
    <div :class="$style.Content">
      <div :class="$style.Header">
        <Icon
          v-if="item.icon"
          :class="$style.Header_icon"
          :icon="item.icon"
        />
        <div :class="$style.Header_title">
          {{ item.title }}
        </div>
        <div :class="$style.Header_right">
          <Spinner
            v-if="item.loading"
            size="small"
            :color="contrasting ? 'white' : ''"
          />
          <Icon
            v-else
            :class="$style.Header_close"
            icon="mdi:close"
            @click="$emit('remove', item)"
          />
        </div>
      </div>
      <div
        v-if="item.content"
        :class="$style.Body"
      >
        {{ item.content }}
      </div>
      <ProgressBar
        v-if="showProgress"
        :class="$style.ProgressBar"
        :value="item.progress || 0"
      />
      <div
        v-if="item.actions && item.actions.length"
        :class="$style.Actions"
      >
        <button
          v-for="(action, index) in item.actions"
          :key="index"
          :class="$style.Action"
          @click="() => action.onAction?.()"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

// Tone accents, saturated enough to read on both the dark and light toast.
$toneSuccess: var(--octans-success);
$toneWarning: var(--octans-warning);
$toneCritical: var(--octans-error);
$toneInfo: var(--octans-info);

.Toast {
  position: relative;
  display: flex;
  align-items: center;
  width: 400px;
  max-width: calc(100vw - 32px);
  margin: 16px;
  background: var(--octans-neutral-800);
  border-radius: var(--octans-radius-box);
  color: var(--octans-neutral-0);
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

  @media (max-width: 500px) {
    margin: 10px;
    right: 26px;
    bottom: 26px;
  }
}

.Toast_light {
  background: var(--octans-surface-raised);
  border: 1px solid var(--octans-border);
  color: var(--octans-text);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.Toast_tone_success {
  border-left: 3px solid $toneSuccess;
  .Header_icon {
    color: $toneSuccess;
  }
}
.Toast_tone_warning {
  border-left: 3px solid $toneWarning;
  .Header_icon {
    color: $toneWarning;
  }
}
.Toast_tone_error {
  border-left: 3px solid $toneCritical;
  .Header_icon {
    color: $toneCritical;
  }
}
.Toast_tone_info {
  border-left: 3px solid $toneInfo;
  .Header_icon {
    color: $toneInfo;
  }
}

.Content {
  flex: 1;
  padding: 14px 18px;
}

.Header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}
.Header_icon {
  margin-right: 8px;
}
.Header_title {
  flex: 1;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.Header_right {
  margin-left: auto;
}
.Header_close {
  font-size: 20px;
  opacity: 0.7;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }
}

.Body {
  margin-top: 6px;
  line-height: 1.3;
}

.ProgressBar {
  margin-top: 10px;
}

.Actions {
  margin-top: 10px;
  text-align: right;
}

.Action {
  // A `<button>` inherits no font of its own; the weight and size below still
  // win, being the later declarations.
  font: inherit;
  appearance: none;
  padding: 4px 8px;
  background: $focusColor;
  border: none;
  border-radius: var(--octans-radius-field);
  color: var(--octans-neutral-0);
  font-weight: 500;
  font-size: 14px;

  &:hover {
    cursor: pointer;
    background: color-mix(in srgb, var(--octans-primary) 80%, white);
  }

  &:focus {
    outline: none;
  }

  & + & {
    margin-left: 12px;
  }
}
</style>
