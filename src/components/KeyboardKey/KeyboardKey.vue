<script lang="ts" setup>
/**
 * A single key on a keyboard, for documenting a shortcut in running text:
 *
 * ```vue
 * Press <KeyboardKey>⌘</KeyboardKey><KeyboardKey>K</KeyboardKey> to search.
 * ```
 *
 * It renders a real `<kbd>`, which is what says "keyboard input" to anything
 * reading the page rather than looking at it — the styling is the smaller
 * half of the job.
 */
export interface KeyboardKeyProps {
  /**
   * The key to draw. The default slot works too and wins if both are given.
   */
  label?: string
  /**
   * A smaller key, for a shortcut sitting inside a menu row or a table cell
   * rather than in prose.
   */
  size?: 'small' | 'medium'
}

withDefaults(defineProps<KeyboardKeyProps>(), {
  label: undefined,
  size: 'medium'
})
</script>

<template>
  <kbd
    :class="[
      'UIElement',
      $style.KeyboardKey,
      size === 'small' && $style.KeyboardKey__small
    ]"
  >
    <slot>{{ label }}</slot>
  </kbd>
</template>

<style lang="scss" module>
.KeyboardKey {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  // Square-ish for a single character, and still legible for `Esc` or `Ctrl`.
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  border: 1px solid var(--octans-border);
  // The hairline under the key is the whole reason this reads as a key rather
  // than a code span: it is the near edge of a physical keycap.
  border-bottom-width: 2px;
  border-radius: var(--octans-radius-field);
  background: var(--octans-surface-raised);
  color: var(--octans-text-subdued);
  font-family: var(--octans-font-mono);
  font-size: 12px;
  line-height: 1;
  // A `<kbd>` sits inline with text, so it aligns to the running baseline
  // rather than the line box.
  vertical-align: baseline;
}

// Keys in a sequence sit next to each other, so they need air between them
// without the caller putting it there.
.KeyboardKey + .KeyboardKey {
  margin-left: 3px;
}

.KeyboardKey__small {
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 11px;
}
</style>
