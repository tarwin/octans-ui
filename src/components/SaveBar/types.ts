/**
 * Where the save-bar flow stands.
 *
 * - `unchanged` — nothing to save; the bar is hidden.
 * - `changed` — there are unsaved edits; the bar shows Save and Discard.
 * - `saving` — a save is in flight; the buttons disable and Save spins.
 */
export type SaveBarStateType = 'unchanged' | 'changed' | 'saving'

export interface SaveBarTranslationsType {
  save?: string
  discard?: string
  unsavedChanges?: string
  discardModal?: {
    title?: string
    content?: string
    primaryActionLabel?: string
    secondaryActionLabel?: string
  }
}

export interface SaveBarProps {
  /**
   * Show the bar for this state instead of following `$ui.saveBar`. Leave it
   * unset — the global state is what keeps one bar, one truth, no matter who
   * set it.
   */
  state?: SaveBarStateType
  /**
   * Matches `GlobalNav`'s `layoutMode`, so the bar's content aligns with the
   * page when the sidebar owns the full height of the window.
   */
  layoutMode?: 'default' | 'alternate'
  /** Overrides for the bar's built-in strings. */
  translations?: SaveBarTranslationsType
  /**
   * Ask "Discard all unsaved changes?" before announcing a discard. Turn it
   * off when the edits at stake are trivial enough that the modal is more
   * friction than the loss — the discard then announces immediately.
   *
   * @default true
   */
  confirmDiscard?: boolean
}
