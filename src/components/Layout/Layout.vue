<template>
  <div :class="$style.Layout">
    <slot></slot>
  </div>
</template>

<style lang="scss" module>
// The gap is a token so applications can retune section spacing globally, or
// per subtree — custom properties inherit.
.Layout {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-self: flex-start;
  gap: var(--octans-layout-gutter);
}
</style>
