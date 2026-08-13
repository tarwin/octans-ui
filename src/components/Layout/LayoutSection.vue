<script lang="ts" setup>
export interface LayoutSectionProps {
  size?: 'full' | 'half' | 'third' | 'primary' | 'secondary'
}
defineProps<LayoutSectionProps>()
</script>

<template>
  <div
    :class="[$style.LayoutSection, size && $style['LayoutSection__' + size]]"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss" module>
// The flex-basis of each size is a token with an inline default, so an
// application can retune where sections start wrapping without new CSS —
// e.g. `--octans-layout-basis-half: 380px` lets halves stay side by side on
// narrower pages. Wrapping is driven by the section's own width against these
// bases, which makes the layout container-driven by nature: it responds to
// the space it is IN, not to the viewport.
.LayoutSection {
  flex: 1 1 auto;
  max-width: 100%;
}

.LayoutSection__full {
  flex: 1 1 auto;
  min-width: 51%;
}

.LayoutSection__half {
  flex: 1 1 var(--octans-layout-basis-half, 450px);
}

.LayoutSection__third {
  flex: 1 1 var(--octans-layout-basis-third, 240px);
}

.LayoutSection__primary {
  flex: 100 100 var(--octans-layout-basis-primary, 680px);
}

.LayoutSection__secondary {
  flex: 1 1 var(--octans-layout-basis-secondary, 300px);
}
</style>
