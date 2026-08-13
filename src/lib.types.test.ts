import { describe, expect, it } from 'vitest'
import type {
  // Props of components the package exports.
  ModalProps,
  DatePickerProps,
  StickyProps,
  SplitterProps,
  SplitterResizeType,
  DividerProps,
  DividerSpacingType,
  SegmentedControlProps,
  SegmentedOptionType,
  ChoiceListAppearanceType,
  // Arguments to the imperative modal API.
  ModalOptions,
  ModalActionType,
  AlertModalOptions,
  ConfirmModalOptions,
  GenericModalOptions,
  PromptModalOptions,
  // The toast API's surface.
  ToastItemType,
  ToastManagerItemType,
  ToastManagerConfig,
  ToastActionType,
  ToastPosition,
  ToastTone
} from './lib'

/**
 * These types reach consumers only because each component's `index.ts`
 * re-exports them and `lib.ts` does `export * from './components/all'`. Drop a
 * re-export and the API keeps working while becoming impossible to describe:
 * `alertModal(opts)` still type-checks, but nobody can name the type of `opts`
 * to write a wrapper around it. Nothing else in the suite would notice, so the
 * imports above are the guard — this file fails `type-check` if one goes.
 *
 * Twenty-one component types were unreachable this way. The seven that still
 * are describe internal components (`Toast.vue`, the four in `Modal/api`) that
 * are never exported, so there is nothing a consumer could hold them against.
 */
describe('public type surface', () => {
  it('lets a consumer name the argument to each modal helper', () => {
    const alert: AlertModalOptions = { title: 'Saved' }
    const confirm: ConfirmModalOptions = {
      title: 'Delete?',
      onConfirm() {}
    }
    const prompt: PromptModalOptions = {
      title: 'Name',
      inputValidator: (input) => input.length > 0
    }
    const action: ModalActionType = { label: 'Save' }
    const generic: GenericModalOptions = { primaryAction: action }
    // `ModalOptions` is the shape they all narrow from, so a wrapper can take
    // it without caring which helper it ends up calling.
    const base: ModalOptions = alert
    expect([alert, confirm, prompt, generic, base]).toHaveLength(5)
  })

  it('lets a consumer name the toast API', () => {
    const config: ToastManagerConfig = { position: 'se', offset: 8 }
    const tone: ToastTone = 'success'
    const position: ToastPosition = 'nw'
    const action: ToastActionType = { label: 'Undo' }
    const item: ToastItemType = {
      title: 'Saved',
      tone,
      position,
      actions: [action]
    }
    // What `toast()` hands back — the reactive handle with `remove()`.
    const handle: ToastManagerItemType = {
      ...item,
      _id: 1,
      duration: 4500,
      remove() {}
    }
    expect(handle.remove).toBeTypeOf('function')
    expect(config.position).toBe('se')
  })

  it('lets a consumer name the props of exported components', () => {
    const modal: ModalProps = { visible: true }
    const datePicker: DatePickerProps = {}
    const sticky: StickyProps = { offset: 16, position: 'bottom' }
    const splitter: SplitterProps = { size: '30%', min: 120, collapsible: true }
    // What `resize` hands back — both units, so nobody has to convert.
    const resize: SplitterResizeType = {
      px: 240,
      percent: 30,
      collapsed: false
    }
    // The spacing scale is shared with `Stack`, so a wrapper can pass one
    // value to both only if it can name the type.
    const spacing: DividerSpacingType = 'tight'
    const divider: DividerProps = { spacing, placement: 'left', bleed: true }
    // A wrapper building the segments from its own data needs to name the
    // option shape, and `ChoiceList`'s appearance needs naming to be passed
    // through by a form rendered from config.
    const segment: SegmentedOptionType = { label: 'Day', value: 'day' }
    const appearance: ChoiceListAppearanceType = 'segmented'
    const segmented: SegmentedControlProps = {
      options: [segment],
      size: 'small',
      fullWidth: true
    }
    expect(modal.visible).toBe(true)
    expect(segmented.options?.[0].value).toBe('day')
    expect(appearance).toBe('segmented')
    expect(datePicker).toBeTypeOf('object')
    expect(sticky.position).toBe('bottom')
    expect(splitter.size).toBe('30%')
    expect(resize.percent).toBe(30)
    expect(divider.spacing).toBe('tight')
  })
})
