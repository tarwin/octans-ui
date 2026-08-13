<script lang="ts" setup>
import { flattenSlotChildren } from '@/utils'
import { h, useSlots, type VNode } from 'vue'
import styles from './List.module.scss'
import ListItem from './ListItem.vue'
import type { ListItemType, ListProps } from './types'
import { $t } from '@/utils/translate'

// `emptyText` and `moreItemsText` are deliberately left without defaults here.
// `withDefaults` compiles to a plain defaults object built when this module is
// evaluated - i.e. at import time - so a `$t()` default would be resolved once
// against whatever locale was active then and frozen in forever, ignoring any
// later `setTranslationLocale()`. They are resolved inside `render()` instead,
// which also restores the vue2 behaviour where `undefined` means "use the
// default" and `''` suppresses the text entirely.
const props = withDefaults(defineProps<ListProps>(), {
  type: 'bullet',
  maxItems: Infinity,
  tight: false,
  inCard: false,
  inCardSection: false,
  selectable: false
})

const emit = defineEmits<{
  (e: 'select-item', item: ListItemType): void
}>()

const slots = useSlots()
const render = () => {
  const children = slots.default?.()
  // console.log('children', children)
  // Either the caller passed data items, or the list is built from the slot.
  const usingDataItems = !!props.items
  // Reassigned below when the list is truncated to `maxItems`.
  let items: ListItemType[] | VNode[] = props.items
    ? props.items
    : flattenSlotChildren(children || [])

  const leftover = items.length - props.maxItems
  let bottomText = ''
  if (!items.length) {
    bottomText =
      props.emptyText === undefined
        ? $t('ui.lang.noItems')
        : props.emptyText || ''
  } else if (leftover > 0) {
    items = items.slice(0, props.maxItems)
    const moreItemsText =
      props.moreItemsText === undefined
        ? $t('ui.lang.countMoreItems', { count: '{count}' })
        : props.moreItemsText || ''
    bottomText = moreItemsText.replace('{count}', `${leftover}`)
  }

  // Wrap data items if necessary
  const renderItems: VNode[] = usingDataItems
    ? items.map((d: ListItemType) =>
        h(ListItem, {
          item: d,
          listType: props.type,
          onClick: () => emit('select-item', d)
        })
      )
    : (items as VNode[])

  // Append 'more items...' if necessary
  if (bottomText) {
    renderItems.push(
      h(
        ListItem,
        {
          class: styles.ListItem__summary
        },
        () => bottomText
      )
    )
  }

  const tag = props.type === 'bullet' ? 'ul' : 'ol'
  return h(
    tag,
    {
      class: [
        'UIElement',
        styles.List,
        props.type === 'number' && styles.number,
        props.type === 'error' && styles.List__errorList,
        props.tight && styles.List__tight,
        (props.inCard || props.inCardSection) && styles.List__inCard,
        props.inCardSection && styles.List__inCardSection,
        props.selectable && styles.List__canSelect
      ]
    },
    renderItems
  )
}
</script>

<template>
  <!--
    `render()` is called here, inside List's own render function, rather than
    being mounted as `<render />`. As a child component it has no props and no
    children, so `shouldUpdateComponent()` always bails and List can never push
    an update into it - it would only ever re-render off deps its own last
    render happened to touch, going stale whenever content changes in place.
  -->
  <component :is="render()" />
</template>
