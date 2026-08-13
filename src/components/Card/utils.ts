import { h, type VNode } from 'vue'
import { Button } from '@/components/Button'
import { ActionList } from '@/components/ActionList'
import type { ActionType } from '../types'

const noop = () => {}

export function renderHeader(
  data: any,
  $styles: Record<string, string>,
  scopedSlots = {} as any
) {
  const visibleActions = (data.actions || []).filter(
    (d: ActionType) => d.visible !== false
  )
  let actionsMarkup = null
  if (visibleActions.length) {
    if (data.collapseActions) {
      actionsMarkup = h(
        'div',
        {
          class: $styles.actions
        },
        [
          h(
            ActionList,
            {
              items: visibleActions,
              placement: 'bottom-end',
              popperOffset: -10
            },
            [
              h(Button, {
                type: 'link',
                icon: 'mdi:dots-horizontal'
              })
            ]
          )
        ]
      )
    } else {
      actionsMarkup = h(
        'div',
        {
          class: $styles.actions
        },
        visibleActions.map((d: any) =>
          h(
            Button,
            {
              class: $styles.action,
              type: 'link',
              icon: d.icon,
              disabled: d.disabled,
              tooltip: d.tooltip,
              tooltipPosition: d.tooltipPosition,
              url: d.url,
              external: d.external,
              // Wrapped rather than passed straight through: bound directly,
              // `onAction` would receive the MouseEvent as its first argument,
              // which is not what `ActionType` promises.
              onClick: () => (d.onAction || noop)()
            },
            () => d.label
          )
        )
      )
    }
  }

  if (data.title || scopedSlots.title || actionsMarkup) {
    const content = [] as VNode[]

    if (scopedSlots.title) {
      content.push(
        h(
          'div',
          {
            class: $styles.title__custom
          },
          [scopedSlots.title()]
        )
      )
    } else if (data.title) {
      content.push(
        h(
          'div',
          {
            class: $styles.title
          },
          data.title
        )
      )
    }

    if (actionsMarkup) {
      content.push(actionsMarkup)
    }

    return h(
      'div',
      {
        class: $styles.header,
        'data-card-header': true
      },
      content
    )
  }
}
