export interface TimezonePickerProps {
  /** The selected IANA timezone id, e.g. `Australia/Sydney`. */
  modelValue?: string
  label?: string
  error?: string
  /** Help text to show below the control. */
  helpText?: string
  /** Renders help text as raw HTML. Use with caution. */
  helpTextHtml?: string
  /** Renders a help icon next to the label which links to an external page. */
  helpLink?: string
  disabled?: boolean
  readonly?: boolean
  /**
   * When `true` and `modelValue` is empty, the picker guesses the user's
   * timezone on mount and emits it.
   */
  guess?: boolean
  /**
   * Shows a Location field above the timezone field and narrows the list to
   * that country's zones. **On by default** — picking a country first turns
   * ~420 zones into a handful, which is what makes the picker feel manageable.
   *
   * Set to `false` for a single searchable list of every zone, which suits
   * users who already know the city they want. That also avoids loading the
   * bundled zone → country map, which is imported on demand.
   */
  groupByCountry?: boolean
  /**
   * Renders the fields directly instead of behind a summary field and a modal.
   *
   * Use this when the picker already sits inside a form that has its own save
   * action — the modal's Update/Cancel would then be a second, redundant
   * commit step.
   *
   * **Changes emit immediately.** There is no Update button to press, so
   * `update:modelValue` fires as soon as a selection is made. Selecting a
   * country also emits, because it moves the value to that country's first
   * zone.
   */
  inline?: boolean
  /**
   * Narrows the fields so they stay side by side in tighter containers.
   *
   * Inline fields already sit side by side and wrap when there isn't room;
   * this lowers the width at which they wrap. Only applies when `inline` and
   * `groupByCountry` are both on.
   */
  condensed?: boolean
}
