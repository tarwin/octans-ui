<template>
  <div :class="['UIElement', $style.TextContainer]">
    <slot></slot>
  </div>
</template>

<style lang="scss" module>
.TextContainer {
  > :not(:first-child) {
    margin-top: 16px;
  }
}
</style>
