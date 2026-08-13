export type ListType = 'bullet' | 'number' | 'error'

// Consumers pass their own richer objects through `items`, which carry the row/column each error belongs to so its
// `select-item` handler can act on them. Only these three keys are rendered;
// anything else on the item is passed back untouched.
export interface ListItemType {
  label?: string
  content?: string
  idLabel?: string | null
  [key: string]: any
}

export interface ListProps {
  /**
   * The style to render the list.
   */
  type?: ListType
  /**
   * Optionally bound the list to data.
   */
  items?: ListItemType[]
  /**
   * The maximum number of items to display. If  the list is truncated
   * `moreItemsText` will be added to the bottom.
   */
  maxItems?: number
  /**
   * The text to render when there are no items to display. Set to falsy
   * to disable.
   */
  emptyText?: string
  /**
   * The text to render when items are truncated. The `{count}` symbol is replaced
   * by the number of items that were truncated.
   */
  moreItemsText?: string
  /**
   * If enabled the list is rendered with condensed spacing.
   */
  tight?: boolean
  /**
   * Adds a separator between each item as well as padding so they can be
   * rendered in a card.
   */
  inCard?: boolean
  /**
   * Same as `inCard` but also negates the horizontal padding that the card
   * section provides.
   */
  inCardSection?: boolean
  selectable?: boolean
}

export interface ListItemProps {
  item?: ListItemType
  listType?: ListType
}
