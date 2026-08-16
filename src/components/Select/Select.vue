<script lang="ts">
import { CheckboxControl } from '@/components/Checkbox'
import { Icon } from '@/components/Icon'
import { Labelled } from '@/components/Labelled'
import { MaybeMountingPortal } from '@/components/MaybeMountingPortal'
import { ScrollPane } from '@/components/ScrollPane'
import { Spinner } from '@/components/Spinner'
import { Tag } from '@/components/Tag'
import { positionPanel, type PanelPosition } from '@/utils/positionPanel'
import { fuzzyFilter } from '@/utils/fuzzy'
import { defineComponent, type PropType, useCssModule } from 'vue'

/** Default search: case-insensitive substring on the label or description. */
function substringFilter(searchText: string, options: any[]) {
  const text = searchText.toLowerCase()
  return options.filter(
    (d: any) =>
      d.label.toLowerCase().indexOf(text) >= 0 ||
      (d.description && d.description.toLowerCase().indexOf(text) >= 0)
  )
}

/** `fuzzy` search: subsequence match, best matches first. */
function fuzzySearchFilter(searchText: string, options: any[]) {
  return fuzzyFilter(searchText, options, (option: any) => [
    option.label,
    option.description
  ])
}

// Monotonic counter for generating unique teleport ids per Select instance.
let teleportIdCounter = 0

export interface SelectOptionType {
  label: string
  value: any
  archived?: boolean
  disabled?: boolean
  description?: string
}

export interface SelectOptionGroupType {
  title: string
  options: SelectOptionType[]
}

function scrollIntoViewIfNeeded(el: any) {
  if (el.scrollIntoViewIfNeeded) {
    el.scrollIntoViewIfNeeded()
  } else if (el.scrollIntoView) {
    el.scrollIntoView({
      block: 'center',
      inline: 'nearest'
    })
  }
}

export default defineComponent({
  name: 'Select',
  emits: ['update:modelValue', 'change'],
  inheritAttrs: false,
  components: {
    Icon,
    ScrollPane,
    Labelled,
    Tag,
    CheckboxControl,
    Spinner,
    MaybeMountingPortal
  },
  setup() {
    const style = useCssModule()
    return {
      style
    }
  },
  props: {
    /**
     * Label for the control.
     */
    label: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Error text to show below the control.
     */
    error: {
      type: [String, Boolean] as PropType<string | false | null>,
      required: false
    },
    /**
     * Help text to show below the control.
     */
    helpText: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders help text as raw HTML. Use with caution.
     */
    helpTextHtml: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders a help icon next to the label which links to an external page.
     */
    helpLink: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * A array of values when using the `multiple` mode, otherwise a single
     * value of any type.
     */
    modelValue: {
      type: null as any
    },
    /**
     * The value to consider as "empty". When `value` is equal to this the
     * placeholder option will be shown. If an array is provided then any of its
     * values will be considered as empty.
     */
    emptyValue: {
      type: null,
      default: () => [null, undefined]
    },
    /**
     * An array with Option or OptionGroup object.
     *
     * ```ts
     * interface Option {
     *   label: string
     *   value: any
     *   // Archived options are hidden from the user unless the current control
     *   // value is equal to the option value, OR if the user has selected the
     *   // archived value previously since the component was created.
     *   archived?: boolean
     *   disabled?: boolean
     *   description?: string
     * }
     * ```
     */
    options: {
      type: Array as () => SelectOptionType[],
      default: () => []
    },
    /**
     * Use as an alternative to `options`.
     *
     * ```ts
     * interface OptionGroup {
     *   label: string
     *   options: Option[]
     * }
     * ```
     */
    optionGroups: {
      type: Array as () => SelectOptionGroupType[]
    },
    /**
     * Placeholder text to display when the input has no value.
     */
    placeholder: {
      type: String,
      default: 'Select'
    },
    /**
     * Whether to allow multiple values.
     */
    multiple: {
      type: Boolean,
      default: false
    },
    /**
     * Text to display when no options are provided.
     */
    noOptions: {
      type: String
    },
    /**
     * Text to display when the user's search query matches no options.
     */
    noResults: {
      type: String
    },
    /**
     * Text to show the number of additional options selected when there are
     * more than 3 options are chosen. The `{count}` variable will be
     * substituted with the remaining number of options.
     */
    additionalOptions: {
      type: String
    },
    /**
     * Whether to show tags represented selected options at the bottom
     * of the control.
     */
    tags: {
      type: Boolean,
      default: false
    },
    /**
     * Shows the selected option description. Only applies to single-value
     * controls.
     */
    showDescription: {
      type: Boolean,
      default: false
    },
    /**
     * Function to customize how options are filtered for Selects using the
     * `searchable` prop. Overrides `fuzzy`.
     *
     * The function has the following signature:
     *
     * `(searchText: string, options: Option[]) => Option[]`
     *
     * Defaults to a case-insensitive substring match on each option's label or
     * description.
     */
    filterFn: {
      type: Function,
      default: null
    },
    /**
     * Matches loosely: every character of the query must appear in the label
     * or description in order, but not necessarily together — so `gwp` finds
     * "Girl with a Pearl Earring". Results are re-ordered best-match first,
     * which a substring filter has no need to do.
     *
     * Worth turning on for long lists of things people half-remember, and
     * worth leaving off for short lists where it only adds noise.
     *
     * Ignored when `filterFn` is set.
     */
    fuzzy: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to show the filter input in the dropdown.
     *
     * - `auto`: Automatically show the search filter when there are more than
     *  10 items.
     * - `true`: Always show.
     * - `false`: Never show.
     *
     * Adding the `searchable` prop without a value is the same as setting it
     * to `true`.
     */
    searchable: {
      type: [Boolean, String],
      default: 'auto'
    },
    /**
     * Whether to show the loading spinner.
     */
    loading: {
      type: Boolean,
      default: false
    },
    /**
     * Disables the control and prevents all interaction.
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Prevents the user from editing the control value.
     */
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * Allows clearing the selected value(s).
     *
     * - `multiple`: Only allow clearing multi-select inputs (default).
     * - `true`: Always allow clearing.
     * - `false`: Always disable clearing.
     */
    clearable: {
      type: [Boolean, String],
      default: 'multiple'
    },
    /**
     * When used with `multiple` it adds a "Toggle All" option at the top of the
     * option list. This special option toggles all/none of the currently
     * filtered options.
     */
    toggleAll: {
      type: Boolean,
      default: false
    },
    dropdownMinWidth: {
      type: String,
      default: ''
    },
    /**
     * Whether to use a portal to render the dropdown list.
     */
    teleport: {
      type: Boolean,
      default: true
    },
    /**
     * Open the menu on press and let a held pointer drag straight onto an
     * option, committing it on release — the way a native `<select>` behaves.
     *
     * Purely additive: a plain click still opens the menu and leaves it open,
     * because a release that has not travelled at least a few pixels from where
     * it started is treated as a click, not a drag. Without that rule the menu
     * would open under your pointer and the release that opened it would pick
     * whatever happened to appear there.
     *
     * Set `:drag-select="false"` to require a separate click for each step.
     */
    dragSelect: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      didJustFocusSearch: false,
      isSearchFocused: false,
      findText: '',
      findTextTimeout: null as any | null,
      onDocClick: null as any,
      popper: null as PanelPosition | null,

      isOpen: false,
      teleportId: `Select_Teleport_${++teleportIdCounter}`,
      searchText: '',
      selected: null as any | any[] | null,
      popperPlacement: 'bottom-start',
      activeIndex: 0,
      prevSelected: new Set(),
      controlWidth: null as null | number,
      resizeObserver: null as null | ResizeObserver,

      // --- press-and-drag selection (see the `dragSelect` prop) ------------
      /** Where the pointer went down, or null when no button is held. */
      dragOrigin: null as { x: number; y: number } | null,
      /** True once the pointer has moved far enough to count as a drag. */
      isDragArmed: false,
      /**
       * Set when this press opened the menu, so the trailing click can be
       * stopped from reaching the document handler that would close it again.
       */
      openedByPress: false,
      /** Makes the document handler ignore exactly one click. */
      ignoreNextDocClick: false
    }
  },
  mounted() {
    const $control = this.$refs.control as HTMLElement
    this.resizeObserver = new ResizeObserver(() => {
      if ($control) {
        this.controlWidth = $control.offsetWidth
      }
    })
    this.resizeObserver.observe($control)
  },
  watch: {
    modelValue: {
      handler(value) {
        if (this.multiple) {
          this.selected = value || []
          for (const val of this.selected) {
            this.prevSelected.add(val)
          }
        } else {
          this.selected = value
          this.prevSelected.add(value)
        }
        // console.log('value', value)
        // console.log('prevSelected', this.prevSelected)
      },
      immediate: true
    },
    numCurrentOptions: {
      handler() {
        this.activeIndex = 0
      }
    }
  },
  computed: {
    // The positioner reports the full placement ("bottom-start", "top-end", …)
    // but the seam styling only cares about which side the dropdown landed on,
    // so strip the alignment suffix. vue2 opened on a bare "bottom" and matched
    // `.popperPlacement_bottom` directly; vue3 always opens "bottom-start",
    // which produced a `popperPlacement_bottom-start` key that doesn't exist in
    // the stylesheet — so the control never flattened its corners.
    popperPlacementSide(): string {
      return this.popperPlacement.split('-')[0]
    },
    dropdownStyle() {
      let style = ''
      if (this.teleport) {
        // const controlWidth = this.$refs.control.offsetWidth
        if (this.controlWidth) {
          style += `width: ${this.controlWidth}px;`
        }
      }
      if (this.dropdownMinWidth) {
        style += `min-width: ${this.dropdownMinWidth};`
      }
      return style
    },
    hasInvalidValue() {
      // if (process.env.NODE_ENV === 'development') {
      //   const {isEmpty, multiple, selected, selectedOptions} = this
      //   const isInvalid = multiple
      //     ? selected.length !== selectedOptions.length
      //     : !isEmpty && !selectedOptions.length
      //   if (isInvalid) {
      //     if (multiple) {
      //       // eslint-disable-next-line no-console
      //       console.error(
      //         '<Select> model contains one or more invalid values.'
      //       )
      //     } else {
      //       // eslint-disable-next-line no-console
      //       console.error('<Select> model has invalid value.')
      //     }
      //   }
      //   return isInvalid
      // }
      return false
    },
    displayText() {
      const { selectedOptions } = this
      if (this.isEmpty) {
        return this.placeholder
      }
      const count: number = selectedOptions.length
      if (!count) {
        // `value` does not match a valid option.
        return ''
      }
      if (this.multiple) {
        let html = selectedOptions
          .slice(0, 3)
          .map((opt: any) => opt.label)
          .join(', ')
        const remaining = count - 3
        if (remaining > 0) {
          let extraText = this.additionalOptions
          if (extraText) {
            extraText = extraText.replace('{count}', `${remaining}`)
          } else {
            extraText = `+ ${remaining}`
          }
          html += ` <span class="${this.style.more}">${extraText}</span>`
        }
        return html
      } else {
        const option = selectedOptions[0]
        let html = option.label
        if (this.showDescription && option.description) {
          html = `<div class="${this.style.DisplayText_label}">${option.label}</div>`
          html += `<div class="${this.style.DisplayText_desc}">${option.description}</div>`
        }
        return html
      }
    },
    selectedMap() {
      if (this.isEmpty) {
        return {}
      }
      if (this.multiple) {
        return this.selected.reduce((map: any, val: any) => {
          map[val] = true
          return map
        }, {})
      }
      return {
        [this.selected]: true
      }
    },
    isEmpty() {
      const { emptyValue, multiple, selected } = this
      if (multiple) {
        return !selected.length
      }
      return Array.isArray(emptyValue)
        ? emptyValue.indexOf(selected) >= 0
        : emptyValue === selected
    },
    resolvedOptions() {
      if (this.optionGroups) {
        return this.optionGroups.reduce(function (list: any, group: any) {
          return list.concat(group.options)
        }, [])
      }

      return this.options
    },
    resolvedOptionGroups() {
      if (this.optionGroups) {
        return this.optionGroups
      }
      if (this.options.length) {
        return [
          {
            title: '',
            options: this.options
          }
        ]
      }
      return []
    },
    selectedOptions() {
      return (this.resolvedOptions as any).filter(
        (opt: any) => this.selectedMap[opt.value]
      )
    },
    /**
     * An explicit `filterFn` wins; otherwise `fuzzy` picks between the two
     * built-ins. Resolved here rather than as the prop's default so that
     * default can depend on another prop.
     */
    activeFilterFn(): (
      searchText: string,
      options: any[],
      group?: any
    ) => any[] {
      if (this.filterFn) return this.filterFn as any
      return this.fuzzy ? fuzzySearchFilter : substringFilter
    },
    filteredGroups(): any {
      const trimmedSearchText = this.searchText && this.searchText.trim()
      // All the options in the final output need to have an `index` property
      // to indicate their order in the dropdown to allow keyboard navigation.
      let optionIndex = 0
      return this.resolvedOptionGroups.reduce((groups: any, group: any) => {
        let options = group.options
        if (trimmedSearchText) {
          // Filter options for search text
          options = this.activeFilterFn(trimmedSearchText, options, group)
        }
        // Hide archived options unless they have been previously selected
        options = options.filter((opt: any) => {
          return !opt.archived || this.prevSelected.has(opt.value)
        })
        // Cache the indicies of visible options for keyboard navigation
        options = options.map((opt: any) => {
          // Create new objects to avoid mutating the original options
          return {
            ...opt,
            index: optionIndex++
          }
        })
        if (options.length) {
          // Only return option groups that have at least one option
          groups.push({
            title: group.title,
            options
          })
        }
        return groups
      }, [])
    },
    /**
     * All options from `filteredGroups` merged together excluding the special
     * "Select All" option.
     */
    filteredOptions() {
      return (this.filteredGroups as any).reduce((options: any, group: any) => {
        return options.concat(group.options)
      }, [])
    },
    numCurrentOptions() {
      return this.filteredOptions.length
    },
    showSearch() {
      return (
        this.searchable === true ||
        (this.searchable === 'auto' &&
          (this.resolvedOptions as any).length > 10)
      )
    },
    canClear() {
      return (
        (this.clearable === true ||
          (this.clearable === 'multiple' && this.multiple)) &&
        !this.loading &&
        !this.isEmpty &&
        !this.readonly &&
        !this.disabled
      )
    },
    toggleAllState() {
      const numSelected = this.selected ? this.selected.length : 0
      return {
        checked: numSelected !== 0,
        indeterminate: numSelected > 0 && numSelected !== this.numCurrentOptions
      }
    }
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    this.destroyPopper()
    this.setDocClickHandler(false)
    this.endDragTracking()
  },
  methods: {
    // --- press-and-drag selection -----------------------------------------
    // A native select opens on press and stays "live" while the button is held:
    // move over the list and the highlight follows, release and that option is
    // chosen. Reproducing that means opening on `mousedown` rather than
    // `click`, and deciding on release whether the gesture was a drag or a
    // plain click.

    onControlMousedown(event: MouseEvent) {
      // Only the primary button; a right-click is for the context menu.
      if (!this.dragSelect || event.button !== 0) return
      if (this.disabled || this.readonly) return

      // Dragging with the button held would otherwise sweep a text selection
      // across the page, which no native select does. Suppressing that also
      // suppresses the default focus, so the control focuses itself — the same
      // trade the options already make with `@mousedown.prevent`.
      event.preventDefault()
      ;(this.$refs.control as HTMLElement).focus()

      // Remembered for the trailing click, which would otherwise reach the
      // document handler and close what this press just opened.
      this.openedByPress = !this.isOpen
      if (!this.isOpen) this.open()

      this.dragOrigin = { x: event.clientX, y: event.clientY }
      this.isDragArmed = false
      document.addEventListener('mousemove', this.onDragMove)
      document.addEventListener('mouseup', this.onDragEnd)
    },

    onControlClick(event: MouseEvent) {
      if (this.openedByPress) {
        this.openedByPress = false
        // The menu is already open from the press. Keeping this click off the
        // document is what stops it closing again immediately.
        event.stopPropagation()
        return
      }
      // Either drag-select is off, or the menu was already open — in which case
      // this click opens it and the document handler closes it, which is how
      // clicking an open Select has always toggled it shut.
      this.open()
    },

    onDragMove(event: MouseEvent) {
      if (this.isDragArmed || !this.dragOrigin) return
      const dx = event.clientX - this.dragOrigin.x
      const dy = event.clientY - this.dragOrigin.y
      // A click wobbles by a pixel or two; reaching the list below the control
      // takes far more than this. Anything under the threshold is a click, and
      // a click must leave the menu open rather than picking something.
      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
        this.isDragArmed = true
      }
    },

    onDragEnd(event: MouseEvent) {
      const wasArmed = this.isDragArmed
      this.endDragTracking()
      if (!wasArmed || !this.isOpen) return

      const option = this.optionAtPoint(event.clientX, event.clientY)
      if (!option || option.disabled) return

      // In multiple mode the menu stays open, so the click that follows this
      // release has to be kept away from the document handler. Its target is
      // the common ancestor of the press and the release — `body`, once the
      // dropdown is teleported — so `stopPropagation` on the control cannot
      // reach it and a flag is the only way.
      if (this.multiple) this.ignoreNextDocClick = true
      this.toggleOption(option)
    },

    endDragTracking() {
      document.removeEventListener('mousemove', this.onDragMove)
      document.removeEventListener('mouseup', this.onDragEnd)
      this.dragOrigin = null
      this.isDragArmed = false
    },

    /** The option under the pointer, if the release landed on one. */
    optionAtPoint(x: number, y: number) {
      // Optional: hit-testing needs a layout engine, and environments without
      // one (jsdom, and anything server-rendered) simply do not provide it.
      const el = document.elementFromPoint?.(x, y)
      const optionEl = el && (el as HTMLElement).closest('[data-option-index]')
      if (!optionEl) return undefined
      const index = Number(optionEl.getAttribute('data-option-index'))
      return this.findOption((opt: any) => opt.index === index)
    },

    onBlur() {
      this.$nextTick(() => {
        if (this.isOpen && !this.didJustFocusSearch) {
          this.close()
        }
      })
    },
    focus() {
      ;(this.$refs.control as HTMLElement).focus()
    },
    searchFocus() {
      this.didJustFocusSearch = true
      this.isSearchFocused = true
      this.$nextTick(() => {
        this.didJustFocusSearch = false
      })
    },
    searchBlur() {
      this.isSearchFocused = false
      if (this.isOpen) {
        this.close()
      }
    },
    // Bound to both `control` and `searchInput` refs.
    onKeydown(event: KeyboardEvent) {
      const code = event.code
      if (!this.isOpen) {
        if (code === 'Enter' || code === 'ArrowDown' || code === 'ArrowUp') {
          event.preventDefault()
          this.open()
        } else if (isSearchableKey(event.key)) {
          // User is starting to type a value. We need to open the dropdown and
          // start searching for the best option.
          event.preventDefault()
          this.open()
          if (this.showSearch) {
            // The search input is visible so iniitalize it with the initial
            // key. Subsequent keystrokes will continue to populate the input as
            // it will be focused after the dropdown opens.
            this.searchText = event.key
          } else {
            // No search input. Set the closest matching option to the active
            // index.
            this.findText = event.key.toLowerCase()
            const option = this.findOptionWithLabelStart(this.findText.trim())
            this.activeIndex = option ? option.index : 0
            this.scrollActiveOptionIntoView()
          }
        }
      } else {
        // Dropdown is open.
        if (code === 'Enter') {
          // Toggle active option.
          event.preventDefault()
          const option = this.findOption(
            (opt: any) => opt.index === this.activeIndex
          )
          if (option) {
            this.toggleOption(option)
          }
        } else if (code === 'ArrowDown') {
          // Navigate down/forwards in the list.
          event.preventDefault()
          this.activeIndex += 1
          if (this.activeIndex > this.numCurrentOptions - 1) {
            this.activeIndex = this.numCurrentOptions - 1
          }
          this.scrollActiveOptionIntoView()
        } else if (code === 'ArrowUp') {
          // Navigate up/backwards in the list.
          event.preventDefault()
          this.activeIndex -= 1
          if (this.activeIndex < 0) this.activeIndex = 0
          this.scrollActiveOptionIntoView()
        } else if (code === 'Escape') {
          // Close the dropdown.
          this.close()
          // Ensure the main control is focused in case the search input had
          // focus. This is so that the focus outline appears.
          ;(this.$refs.control as HTMLElement).focus()
        } else if (isSearchableKey(event.key)) {
          // The user has continued to type searchable keystrokes. Add this to a
          // search buffer to narrow down the active option chosen.
          this.findText += event.key.toLowerCase()
          // Clear the search buffer after 500ms so the user can initiate a
          // fresh search after pausing.
          if (this.findTextTimeout) clearTimeout(this.findTextTimeout)
          this.findTextTimeout = setTimeout(() => {
            this.findText = ''
          }, 500)
          const option = this.findOptionWithLabelStart(this.findText.trim())
          if (option) {
            this.activeIndex = option.index
            this.scrollActiveOptionIntoView()
          }
          // Prevent the page from jumping if there is no search input as the
          // user might press the SPACE key.
          if (!this.showSearch) {
            event.preventDefault()
          }
        }
      }
    },
    findOption(predicate: any) {
      for (const group of this.filteredGroups) {
        for (const option of group.options) {
          if (predicate(option)) {
            return option
          }
        }
      }
    },
    findOptionWithLabelStart(label: any) {
      return this.findOption(
        (opt: any) => opt.label.toLowerCase().trim().indexOf(label) === 0
      )
    },
    scrollActiveOptionIntoView() {
      this.$nextTick(() => {
        // `$el` is only an element for a single-root component, and ScrollPane
        // opens its template with a comment — which makes it a fragment
        // wherever comments are preserved, leaving `$el` pointing at the
        // comment node. Fall back to the dropdown, which contains the list
        // either way, rather than throwing inside a `$nextTick` where nothing
        // is there to catch it.
        const listEl = (this.$refs.list as any)?.$el
        const root: Element | undefined =
          listEl instanceof Element
            ? listEl
            : (this.$refs.dropdown as HTMLElement | undefined)
        const activeOptionEl = root?.querySelector(
          'div[class*="Option__active"]'
        )
        if (activeOptionEl) {
          scrollIntoViewIfNeeded(activeOptionEl)
        }
      })
    },
    open() {
      if (this.disabled || this.readonly) {
        return
      }
      // Reset find buffer
      clearTimeout(this.findTextTimeout)
      this.findText = ''
      this.searchText = ''

      this.isOpen = true
      this.setDocClickHandler(true)

      // For single value mode, reset the active index to the selected option,
      // defaulting to the first visible option if none is currently selected.
      this.activeIndex = 0
      const selected = this.selected
      if (!this.multiple && selected) {
        const selectedOption = this.findOption(
          (opt: any) => opt.value === selected
        )
        if (selectedOption) {
          this.activeIndex = selectedOption.index
        }
      }

      // Position the dropdown.
      this.$nextTick(() => {
        this.destroyPopper()
        this.popper = positionPanel(
          this.$refs.control as HTMLElement,
          this.$refs.dropdown as HTMLElement,
          {
            placement: 'bottom-start',
            onPlacement: (placement) => {
              this.popperPlacement = placement
            },
            onFirstUpdate: () => {
              if (this.showSearch) {
                ;(this.$refs.searchInput as HTMLElement).focus()
              }
              // Scroll list to active item after showing the dropdown.
              this.scrollActiveOptionIntoView()
            }
          }
        )
      })
    },
    close() {
      this.setDocClickHandler(false)
      this.isOpen = false
      // The dropdown is `v-if`d away, so the element being tracked is about to
      // leave the document. Left running, the observers would keep firing at a
      // detached node until the next open replaced them.
      this.destroyPopper()
    },
    destroyPopper() {
      if (this.popper) {
        this.popper.destroy()
        this.popper = null
      }
    },
    updatePopper() {
      if (this.popper) {
        this.popper.update()
      }
    },
    clearSelected() {
      if (this.multiple) {
        this.selected = []
      } else {
        this.selected = Array.isArray(this.emptyValue)
          ? this.emptyValue[0]
          : null
      }
      this.emitChange(this.selected)
    },
    setDocClickHandler(doAdd: any) {
      if (doAdd && !this.onDocClick) {
        setTimeout(() => {
          this.onDocClick = () => {
            if (this.ignoreNextDocClick) {
              this.ignoreNextDocClick = false
              return
            }
            this.close()
          }
          document.addEventListener('click', this.onDocClick)
        })
      } else if (!doAdd && this.onDocClick) {
        document.removeEventListener('click', this.onDocClick)
        this.onDocClick = null
      }
    },
    getOptionState(option: any) {
      if (this.multiple) {
        return this.selected.indexOf(option.value) >= 0
      }
      return this.selected === option.value
    },
    toggleOption(option: any) {
      if (option.disabled) {
        return
      }
      const isSelected = this.getOptionState(option)
      if (this.multiple) {
        if (isSelected) {
          // Deselect an option
          const newSelected = this.selected.filter(
            (val: any) => val !== option.value
          )
          this.selected = newSelected
          this.emitChange(this.selected)
        } else {
          // Select an option
          const newSelected = this.selected.slice(0)
          newSelected.push(option.value)
          this.selected = newSelected
          this.emitChange(this.selected)
          // Add to list of previously selected values so that archived options
          // are respected.
          this.prevSelected.add(option.value)
        }
      } else {
        this.close()
        this.selected = option.value
        // Ensure the that control regains focus after choosing an option in a
        // searchable list.
        ;(this.$refs.control as HTMLElement).focus()
        this.emitChange(this.selected)
      }
    },
    toggleAllOptions() {
      const allValues = this.filteredOptions.map((option: any) => option.value)
      if (this.selected.length !== allValues.length) {
        this.selected = allValues
      } else {
        this.selected = []
      }
      this.emitChange(this.selected)
    },
    emitChange(selected: any | any[]) {
      this.$emit('update:modelValue', selected)
      this.$emit('change', selected)
      // console.log('emitChange', selected)
      this.updatePopper()
    }
  }
})

/**
 * How far the pointer must travel before a press counts as a drag rather than a
 * click. Small enough that any deliberate move onto the list clears it, large
 * enough that the shake in an ordinary click does not.
 */
const DRAG_THRESHOLD = 6

function isSearchableKey(char: string) {
  return (
    char === ' ' || (char >= '0' && char <= '9') || (char >= 'a' && char <= 'z')
  )
}
</script>

<template>
  <Labelled
    :label="label"
    :error="error"
    :help-text="helpText"
    :help-text-html="helpTextHtml"
    :help-link="helpLink"
  >
    <div
      class="UIElement"
      :class="[
        $style.Select,
        error && $style.hasError,
        isEmpty && $style.isEmpty,
        isOpen && $style.isOpen,
        multiple && $style.isMultiple,
        disabled && $style.isDisabled,
        readonly && $style.isReadonly,
        showDescription && $style.showDescription,
        $style['popperPlacement_' + popperPlacementSide]
      ]"
    >
      <div
        ref="control"
        :class="$style.control"
        :tabindex="disabled ? -1 : 0"
        @mousedown="onControlMousedown"
        @click="onControlClick"
        @blur="onBlur"
        @keydown="onKeydown"
      >
        <div :class="$style.DisplayText">
          <slot
            name="display"
            :displayText="displayText"
            :selectedOptions="selectedOptions"
          >
            <span v-html="displayText"></span>
          </slot>
        </div>
        <Spinner
          v-if="loading"
          size="small"
        />
        <Icon
          v-if="canClear"
          :class="$style.ClearButton"
          icon="mdi:close-circle"
          @click.stop="clearSelected"
        />
        <Icon
          v-if="!loading"
          :class="$style.caret"
          icon="mdi:menu-down"
        />
      </div>
      <div
        v-if="multiple && tags && selectedOptions.length > 0"
        :class="$style.Tags"
      >
        <slot
          name="tags"
          :selectedOptions="selectedOptions"
          :removeFn="toggleOption"
        >
          <Tag
            :class="$style.Tag"
            v-for="option in selectedOptions"
            :key="option.value"
            @remove="toggleOption(option)"
          >
            {{ option.label }}
          </Tag>
        </slot>
      </div>
      <MaybeMountingPortal
        v-if="isOpen"
        mount-to="body"
        :teleport="teleport"
      >
        <div
          ref="dropdown"
          :class="[
            'UIElement',
            $style.Dropdown,
            dropdownMinWidth && $style.Dropdown__minWidthSet
          ]"
          style="z-index: 10000"
          :style="dropdownStyle"
          @click.stop
        >
          <div
            v-if="showSearch"
            :class="$style.Dropdown_search"
          >
            <Icon
              :class="$style.Dropdown_searchIcon"
              icon="mdi:magnify"
            />
            <input
              :class="$style.Dropdown_searchInput"
              v-model="searchText"
              ref="searchInput"
              placeholder="Search"
              tabindex="-1"
              @focus="searchFocus"
              @blur="searchBlur"
              @keydown="onKeydown"
            />
            <Icon
              :class="$style.Dropdown_searchCloseIcon"
              icon="mdi:close"
              @click="searchText = ''"
              v-show="searchText"
            />
          </div>
          <div
            v-if="multiple && toggleAll && numCurrentOptions"
            :class="$style.ToggleAll"
            @mousedown.prevent="toggleAllOptions"
            @mouseover="activeIndex = -1"
          >
            <CheckboxControl
              :class="$style.Option_check"
              :checked="toggleAllState.checked"
              :indeterminate="toggleAllState.indeterminate"
              tabindex="-1"
            />
            Toggle All ({{ numCurrentOptions }})
          </div>
          <ScrollPane
            :class="$style.Dropdown_content"
            ref="list"
          >
            <div
              v-for="(group, groupIndex) in filteredGroups"
              :key="groupIndex"
              :class="$style.OptionGroup"
            >
              <div
                v-if="group.title"
                :class="$style.OptionGroup_title"
              >
                {{ group.title }}
              </div>
              <div
                v-for="option in group.options"
                :key="option.value"
                :class="[
                  $style.Option,
                  selectedMap[option.value] && $style.Option__selected,
                  option.disabled && $style.Option__disabled,
                  activeIndex === option.index && $style.Option__active
                ]"
                :data-option-index="option.index"
                @mousedown.prevent="toggleOption(option)"
                @mouseover="activeIndex = option.index"
              >
                <slot
                  name="option"
                  :option="option"
                  :group="group"
                  :selected="selectedMap[option.value]"
                >
                  <CheckboxControl
                    v-if="multiple"
                    :class="$style.Option_check"
                    :checked="selectedMap[option.value]"
                    :disabled="option.disabled"
                    tabindex="-1"
                  />
                  <div :class="$style.Option_content">
                    <div :class="$style.Option_label">{{ option.label }}</div>
                    <div
                      v-if="option.description"
                      :class="$style.Option_desc"
                    >
                      {{ option.description }}
                    </div>
                  </div>
                </slot>
              </div>
            </div>
          </ScrollPane>
          <div
            v-if="!filteredGroups.length && searchText"
            :class="$style.NoResults"
          >
            {{ noResults || 'No Results' }}
          </div>
          <div
            v-else-if="!filteredGroups.length && !searchText"
            :class="$style.NoResults"
          >
            {{ noOptions || 'No Options' }}
          </div>
        </div>
      </MaybeMountingPortal>
    </div>
    <!-- <pre>value: {{value}}</pre> -->
    <!-- <pre>isEmpty: {{isEmpty}}</pre> -->
    <!-- <pre>selected: {{selected}}</pre> -->
    <!-- <pre>selectedMap: {{selectedMap}}</pre> -->
    <!-- <pre>selectedOptions: {{selectedOptions}}</pre> -->
    <!-- <pre>options: {{options}}</pre> -->
    <!-- <pre>activeIndex: {{activeIndex}}</pre> -->
  </Labelled>
</template>

<style lang="scss" module>
// @import '../../styles/variables';

$borderColor: var(--octans-border-input);
$inputReadonlyCursor: not-allowed;
$inputDisabledCursor: not-allowed;
$focusColor: var(--octans-focus-ring);
$errorColor: var(--octans-error);

.Select {
  position: relative;
  // z-index: 100;
}

.isReadonly {
  &,
  * {
    cursor: $inputReadonlyCursor !important;
  }
  .control {
    background: var(--octans-surface);
    box-shadow: none;
  }
}
.isDisabled {
  &,
  * {
    cursor: $inputDisabledCursor !important;
  }
}

.control {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 5px 12px;
  background: var(--octans-surface);
  border: 1px solid $borderColor;
  border-radius: var(--octans-radius-field);
  box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
  font-size: 14px;

  &:focus {
    border-color: $focusColor;
    box-shadow: 0 0 0 1px $focusColor;
    outline: none;
  }

  .hasError & {
    border-color: $errorColor;
    background: var(--octans-error-surface);
    &:focus {
      box-shadow: 0 0 0 1px $errorColor;
    }
  }

  .isDisabled & {
    background: var(--octans-surface-sunken);
    box-shadow: none;
    border-color: $borderColor;
    color: var(--octans-text-disabled);
  }

  .isOpen & {
    border: 1px solid $focusColor;
    box-shadow: none;
  }
  .isOpen.popperPlacement_top & {
    border-top: 1px solid $borderColor !important;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    box-shadow: 0 1px 5px 0 rgba(22, 29, 37, 0.2);
  }
  .isOpen.popperPlacement_bottom & {
    border-bottom: 1px solid $borderColor !important;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0 -1px 5px 0 rgba(22, 29, 37, 0.2);
  }
  .isOpen.hasError & {
    border: 1px solid $errorColor;
  }
}

.DisplayText {
  flex: 1;
  cursor: default;

  .isEmpty & {
    color: var(--octans-text-subdued);
  }
}
.more {
  color: var(--octans-text-subdued);
}

.caret {
  color: var(--octans-text-subdued);

  .isDisabled & {
    color: var(--octans-text-disabled);
  }
}

.showDescription {
  .control {
    padding: 8px 12px;
  }
  .DisplayText {
    line-height: 1.5;
    min-width: 0;
  }
}

.DisplayText_label {
  font-size: 13px;
  font-weight: 500;
}
.DisplayText_desc {
  // Was a hard-coded translucent black, which is invisible on a dark surface.
  color: var(--octans-text-subdued);
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  :global(.UILayoutSectionAnnotated) & {
    // HACK: The maximum width of LayoutSectionAnnotated content.
    max-width: 480px;
  }
}

.ClearButton {
  margin-right: 6px;
  color: var(--octans-text-subdued);

  &:hover {
    color: var(--octans-text);
    cursor: pointer;
  }
}

.Dropdown {
  position: absolute;
  top: 36px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  width: 100%;
  // no gap — the dropdown butts straight onto the control to form the seam
  background: var(--octans-surface);
  border: 1px solid $focusColor;
  border-radius: var(--octans-radius-field);

  .hasError & {
    border-color: $errorColor;
  }

  &[data-placement='top-start'] {
    border-bottom-width: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0 -3px 5px 0 rgba(22, 29, 37, 0.2);
  }
  &[data-placement='bottom-start'] {
    border-top-width: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    box-shadow: 0 3px 5px 0 rgba(22, 29, 37, 0.2);
  }
  &.Dropdown__minWidthSet {
    // because top-start / bottom-start is used don't need to override?
    &[data-placement='top-start'] {
      box-shadow: 0 -3px 5px 0 rgba(22, 29, 37, 0.2);
    }
    &[data-placement='bottom-start'] {
      box-shadow: 0 3px 5px 0 rgba(22, 29, 37, 0.2);
    }
  }
}

.Dropdown_search {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--octans-border);
}
.Dropdown_searchIcon {
  margin-left: 10px;
  color: var(--octans-text-disabled);
  font-size: 14px;
}
.Dropdown_searchCloseIcon {
  padding: 4px 10px;
  color: var(--octans-text-disabled);
  font-size: 18px;

  &:hover {
    color: var(--octans-text);
    cursor: pointer;
  }
}
.Dropdown_searchInput {
  width: 100%;
  padding: 8px 5px;
  border: none;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  // Inputs inherit neither background nor colour from the theme.
  background: transparent;
  color: var(--octans-text);

  &::placeholder {
    color: var(--octans-text-subdued);
  }
}
.Dropdown_content {
  flex: 1 1 auto;
  max-height: 200px;
}

.NoResults {
  padding: 10px;
  color: var(--octans-text);
  font-size: 14px;
}

.OptionGroup {
  & + & {
    margin-top: 2px;
  }
}

.OptionGroup_title {
  padding: 8px 8px 2px 10px;
  color: var(--octans-text-subdued);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
}

.Option,
.ToggleAll {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  font-size: 14px;

  &:hover {
    cursor: pointer;
  }
}
.Option_check {
  // Prevent long labels from squashing checkbox.
  flex: 0 0 auto;
  margin-right: 10px !important;
  // Prevent interaction as checkbox is toggled programmatically.
  pointer-events: none;
}
.Option_desc {
  margin-top: 3px;
  color: var(--octans-text-subdued);
  font-size: 12px;
  line-height: 1.2;
}
.Option__disabled {
  opacity: 0.5;
  pointer-events: none;
}
.Option__active {
  background: var(--octans-surface-hover);
}

.ToggleAll {
  border-bottom: 1px solid var(--octans-border);

  &:hover {
    background: var(--octans-surface-hover);
  }
}

.Tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  margin-bottom: -8px; // Undo tag bottom margin
}
.Tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
