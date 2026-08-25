<script lang="ts" setup>
import { Page } from '@/components/Page'
import { SkeletonCard } from '@/components/SkeletonCard'
import { SkeletonDisplayText } from '@/components/SkeletonDisplayText'
import { $t } from '@/utils/translate'
import type { SkeletonPageProps } from './types'

/**
 * The page-shaped placeholder: a `Page` with a title bar and some cards drawn
 * as skeletons, for the moment before the real page's data arrives.
 *
 * The point is that it stands in the same PLACE. It renders a real `Page`, so
 * `size` picks the same width preset the real page will use and the content
 * does not jump sideways when it swaps in:
 *
 * ```vue
 * <SkeletonPage v-if="loading" size="wide" />
 * <Page v-else size="wide" title="Orders">…</Page>
 * ```
 *
 * `<Page loading>` is the other option, and they are for different moments:
 * that one dims a page whose content you ALREADY have while something
 * refreshes, this one stands in for content you do not have yet.
 */
/**
 * ACCESSIBILITY: the `Page` root carries `role="status"`, `aria-busy` and an
 * accessible name, and the shapes themselves are hidden. A screen reader is
 * told the page is loading, once, rather than being walked through a dozen
 * decorative rectangles.
 *
 * Note the template starts with the element and no comment: a comment ahead of
 * the root makes the component a FRAGMENT, and then the fallthrough attributes
 * have no single root to land on.
 */
withDefaults(defineProps<SkeletonPageProps>(), {
  size: 'default',
  title: true,
  primaryAction: false,
  cards: 1
})
</script>

<template>
  <Page
    :size="size"
    role="status"
    aria-busy="true"
    :aria-label="$t('ui.lang.loading')"
  >
    <template
      v-if="title"
      #title
    >
      <SkeletonDisplayText :class="$style.Title" />
    </template>
    <template
      v-if="primaryAction"
      #primaryAction
    >
      <div :class="$style.Action"></div>
    </template>
    <div
      :class="$style.Body"
      aria-hidden="true"
    >
      <!-- @slot The page's body. Replaces the skeleton cards entirely. -->
      <slot>
        <SkeletonCard
          v-for="index in cards"
          :key="index"
        />
      </slot>
    </div>
  </Page>
</template>

<style lang="scss" module>
@import '../../styles/variables';

// `.Page_title` is a flex row, so the placeholder's `max-width: 12rem` gives
// it nothing to be — a flex item with no width sizes to its content, and this
// one has none. The basis has to be stated.
.Title {
  flex: 0 0 12rem;
}

// Cards stack with the same gap `Layout` puts between its sections, so a
// skeleton of two cards measures the same as the two cards it stands for.
.Body {
  display: flex;
  flex-direction: column;
  gap: var(--octans-layout-gutter);
}

// Roughly a medium Button: the header should not change height when the real
// action arrives.
.Action {
  width: 96px;
  height: 36px;
  background: $skeletonColor;
  border-radius: var(--octans-radius-field);
  animation: SkeletonShimmerAnimation 0.8s linear infinite alternate;
  backface-visibility: hidden;
  will-change: opacity;
}

@keyframes SkeletonShimmerAnimation {
  0% {
    opacity: 0.45;
  }
  100% {
    opacity: 0.9;
  }
}
</style>
