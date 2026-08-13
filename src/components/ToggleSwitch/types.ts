export interface ToggleSwitchProps {
  /**
   * The bound value / v-model.
   */
  modelValue?: any
  /**
   * The model value to use when checked.
   */
  trueValue?: any
  /**
   * The model value to use when not checked.
   */
  falseValue?: any
  /**
   * When `true` the checkbox will be checked. This is an alternative
   * to assigning `value` to be `trueValue`.
   */
  checked?: boolean
  disabled?: boolean
  /**
   * Shorthand for `colorOn` — the track colour when checked. `colorOn` wins if
   * both are given.
   */
  color?: string
  /**
   * Track colour when checked. Any CSS colour.
   *
   * Defaults to `var(--octans-primary)`, so it follows the active theme.
   */
  colorOn?: string
  /**
   * Track colour when unchecked. Any CSS colour.
   *
   * Defaults to `var(--octans-border-input)`. Setting this also colours the
   * off icon, which otherwise stays subdued grey — the default track is too
   * pale to read as an icon against the white knob.
   */
  colorOff?: string
  /**
   * Visual size of the switch. All dimensions scale proportionally.
   *
   * - `"small"` — 42×24
   * - `"medium"` — 60×34 (default)
   * - `"large"` — 78×44
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * Shows a tick / cross inside the knob. **On by default** — state then reads
   * at a glance instead of relying on position and colour alone, which is the
   * more accessible default and the one most people want.
   *
   * Set `:icons="false"` for a plain knob.
   */
  icons?: boolean
  /**
   * Icon shown in the knob when checked. Any name the `Icon` component
   * accepts. Defaults to `mdi:check`.
   */
  iconOn?: string
  /**
   * Icon shown in the knob when unchecked. Any name the `Icon` component
   * accepts. Defaults to `mdi:close`.
   */
  iconOff?: string
  /**
   * Shorthand for both icon colours. `iconColorOn` / `iconColorOff` win over
   * this for the state they name.
   */
  iconColor?: string
  /**
   * Colour of the knob icon when checked.
   *
   * Defaults to the on track colour, which ties the knob to the track. Worth
   * overriding if you give the knob a non-white background.
   */
  iconColorOn?: string
  /**
   * Colour of the knob icon when unchecked.
   *
   * Defaults to `colorOff` when you set one, otherwise subdued grey — the
   * default off track is too pale to read against the white knob.
   */
  iconColorOff?: string
}
