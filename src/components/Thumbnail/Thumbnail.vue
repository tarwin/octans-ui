<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Icon } from '@/components/Icon'
import { type ThumbnailProps } from './types'

const props = withDefaults(defineProps<ThumbnailProps>(), {
  noBorder: false,
  size: 'small'
})

const imgIsValid = ref(true)
watch(
  () => props.url,
  (imageUrl) => {
    if (!imgIsValid.value && imageUrl) {
      imgIsValid.value = true
    }
  }
)
</script>

<template>
  <div :class="['UIElement', $style.Thumbnail]">
    <div
      :class="[
        $style.Thumbnail__container,
        $style[`Thumbnail__${size}`],
        noBorder && $style.Thumbnail__no_border
      ]"
    >
      <!-- If dynamically updated check if its still valid -->
      <img
        v-if="imgIsValid"
        @error="imgIsValid = false"
        :class="$style.Thumbnail__image"
        :src="url"
        :alt="alt"
      />

      <div
        v-if="!url || !imgIsValid"
        :class="[
          $style.Thumbnail__placeholder,
          $style[`Thumbnail__placeholder__${size}`]
        ]"
      >
        <Icon icon="mdi:image" />
      </div>
    </div>

    <div :class="$style.Thumbnail__content">
      <div
        v-if="title"
        :class="$style.Thumbnail__heading"
      >
        {{ title }}
      </div>
      <div
        v-if="subtitle"
        :class="$style.Thumbnail__subtitle"
      >
        {{ subtitle }}
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.Thumbnail {
  display: flex;

  &__container {
    border: 1px solid var(--octans-border);
    border-radius: var(--octans-radius-field);
    margin-right: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--octans-surface);
  }

  &__image {
    max-height: 80%;
    max-width: 80%;
  }

  // Icon sizes itself in `em`, so the font-size here is what scales it.
  &__placeholder {
    height: 250px;
    width: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    color: var(--octans-text-disabled);

    &__medium {
      font-size: 1.4rem;
    }

    &__large {
      font-size: 2rem;
    }

    &__extraLarge {
      font-size: 2.6rem;
    }
  }

  &__no_border {
    background-color: transparent;
    border: none;

    & > img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  &__content {
    flex: 1 1 auto;
    margin-top: 0.2rem;
    font-family: var(--octans-font);
  }

  &__heading {
    font-weight: 600;
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
  }

  &__subtitle {
    color: $textSubduedColor;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  &__extraSmall {
    max-width: 50px;
    max-height: 50px;
  }

  &__small {
    max-width: 80px;
    max-height: 80px;
  }

  &__medium {
    max-width: 120px;
    max-height: 120px;
  }

  &__large {
    max-width: 200px;
    max-height: 200px;
  }

  &__extraLarge {
    max-width: 250px;
    max-height: 250px;
  }
}
</style>
