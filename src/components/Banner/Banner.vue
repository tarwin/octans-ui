<script lang="ts">
import { defineComponent } from 'vue'
import { Button } from '../Button'
import { Icon } from '../Icon'

/**
 * Informs users about important changes or persistent conditions. Use this
 * component if you need to communicate to users in a prominent way. Banners are
 * placed at the top of the page or section they apply to, and below the page or
 * section header.
 */
export default defineComponent({
  components: {
    Icon,
    Button
  },
  props: {
    /**
     * Title of the banner.
     */
    title: {
      type: String
    },
    /**
     * Status which determines the color scheme:
     *
     *   - `default`
     *   - `info`
     *   - `success`
     *   - `warning` — amber; something needs a look
     *   - `error` — red; something is wrong
     *   - `new`
     *
     * `attention` is accepted as an alias of `warning` for compatibility.
     */
    status: {
      type: String,
      default: 'default'
    },
    /**
     * Icon name. Set to `false` to omit the icon entirely.
     * @see [Icon](/#/Components/Icon) for more details.
     */
    icon: {
      type: [String, Boolean],
      default: 'mdi:information'
    }
  },
  methods: {
    close() {
      /**
       * Emitted when the banners's "X" button is clicked.
       *
       * @event close
       */
      this.$emit('close')
    }
  }
})
</script>

<template>
  <div :class="['UIElement', $style.Banner, $style[`status-${$props.status}`]]">
    <Icon
      v-if="typeof icon === 'string'"
      :class="$style.Icon"
      :icon="icon"
    />

    <div :class="$style.content">
      <div
        v-if="title"
        :class="$style.title"
      >
        {{ title }}
      </div>
      <p
        v-if="$slots.default"
        :class="$style.info"
        :style="[title ? { 'padding-top': '5px' } : '']"
      >
        <slot></slot>
      </p>
    </div>

    <Button
      v-if="$attrs.onClose"
      :class="$style.close"
      type="link"
      icon="mdi:close"
      @click="close"
    />
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.Banner {
  display: flex;
  border-radius: var(--octans-radius-box);
  padding: 10px 35px 9px 10px;
  position: relative;
}

.Icon {
  color: inherit;
  margin-right: 8px;
}

.content {
  flex-grow: 1;
  margin-top: -1px;

  & p {
    margin: 0;
    font-family: var(--octans-font);
  }
}

.title {
  font-weight: bold;
  font-family: var(--octans-font);
}

.close {
  position: absolute;
  top: 5px;
  right: 12px;
  font-size: 20px;
  color: inherit;
}

// Work out default theme
// Colors etc

// Then functionality
//

/**
 * `$surface` is the banner's OWN tint, not the shared
 * `--octans-<role>-surface`: seven components read that token, so tuning a
 * banner through it moved Badge and five form controls too. The two now run
 * off separate strength dials, because a panel wants far less tint than a
 * chip does.
 *
 * The border stays keyed to `$fontColor` — the role's own text colour — rather
 * than to `--octans-banner-ink`. Overriding the ink to black or white is a
 * choice about the LABEL; letting it drag the border along would erase the
 * one remaining edge that says which status this is.
 */
@mixin bannerColor($fontColor, $surface) {
  background-color: var(#{$surface});
  border: 1px solid color-mix(in srgb, var(#{$fontColor}) 25%, transparent);
  color: var(--octans-banner-ink, var(#{$fontColor}));
}

.status-default {
  @include bannerColor(--octans-text, --octans-surface-sunken);
}

.status-info {
  @include bannerColor(--octans-text-info, --octans-banner-info-surface);
}

.status-success {
  @include bannerColor(--octans-text-success, --octans-banner-success-surface);
}

// `attention` is the pre-rename word for the amber state — kept as an alias so
// old call sites keep meaning what they meant.
.status-warning,
.status-attention {
  @include bannerColor(--octans-text-warning, --octans-banner-warning-surface);
}

.status-error {
  @include bannerColor(--octans-text-error, --octans-banner-error-surface);
}

.status-new {
  @include bannerColor(--octans-text, --octans-surface-sunken);
}
</style>
