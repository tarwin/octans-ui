<script lang="ts" setup>
import { computed } from 'vue'
import type { SyntaxHighlighterProps } from './types'

declare global {
  interface Window {
    Prism?: {
      languages: Record<string, any>
      highlight: (code: string, grammar: any, language: string) => string
    }
  }
}

const props = defineProps<SyntaxHighlighterProps>()

const highlightedCode = computed(() => {
  if (!props.code || !props.language) {
    return null
  }

  const Prism = window.Prism
  if (!Prism) {
    console.warn('SyntaxHighlighter: Prism.js is not loaded')
    return null
  }

  const grammar = Prism.languages[props.language]
  if (!grammar) {
    throw new Error(
      `SyntaxHighlighter: Unsupported Prism grammar "${props.language}"`
    )
  }

  return Prism.highlight(props.code, grammar, props.language)
})

const className = computed(() => `language-${props.language}`)
</script>

<template>
  <div v-if="!code">No code</div>
  <pre
    v-else
    :class="['Prism', className]"
  ><code
      :class="className"
      v-html="highlightedCode"
    /></pre>
</template>
