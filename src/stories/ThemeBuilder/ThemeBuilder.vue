<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  TOKEN_GROUPS,
  TOKEN_NAMES,
  TOKEN_RAMP_BY_PREFIX,
  TOKEN_RAMPS,
  tokenVar,
  type TokenDefinition,
  type TokenGroup
} from '@/utils/tokens'
import { rampColors } from '@/utils/colorRamp'
import { createGradient, type Gradient } from '@/utils/gradient'
import { GradientPicker } from '@/components/GradientPicker'
import { ColorSelector } from '@/components/ColorSelector'
import { Icon } from '@/components/Icon'
import {
  applyCustomTheme,
  clearCustomTheme,
  createThemeId,
  deleteCustomTheme,
  exportCustomTheme,
  getResolvedTokenValue,
  importCustomTheme,
  listCustomThemes,
  saveCustomTheme,
  type CustomTheme
} from '@/utils/customTheme'
import {
  createTheme,
  THEME_SEED_ROLES,
  type ThemeRadiusPresetType,
  type ThemeSeedRoleType
} from '@/utils/createTheme'
import { setTheme, type ThemeType } from '@/utils/theme'
import KitchenSink from './KitchenSink.vue'

/**
 * NOTE ON STYLING: the editor chrome uses Octans tokens like everything else,
 * but your in-progress overrides are applied to the *preview element only*
 * rather than to `<html>`. Custom properties inherit, so the preview shows the
 * real thing while the editor keeps the untouched base theme — setting
 * `surface` to the same colour as `text` can't lock you out of the controls
 * you'd need to undo it.
 *
 * The base light/dark choice is an attribute on `<html>`, so that one does
 * apply to the editor too. That's the intent: the editor follows the theme, it
 * just doesn't follow the edit.
 */

const preview = ref<HTMLElement>()
const themeName = ref('My theme')
const base = ref<ThemeType>('light')
const overrides = ref<Record<string, string>>({})
const defaults = ref<Record<string, string>>({})
const savedThemes = ref<CustomTheme[]>([])
const activeId = ref<string | null>(null)
const jsonText = ref('')
const jsonError = ref('')
const copied = ref(false)
const filter = ref('')

const changedCount = computed(() => Object.keys(overrides.value).length)

// --- tokens panel height -----------------------------------------------------
// The token list's max-height is draggable (the bar under it) and remembered
// per browser, like the themes themselves.

const TOKENS_HEIGHT_KEY = 'octans-theme-builder-tokens-height'
const TOKENS_HEIGHT_MIN = 240
const TOKENS_HEIGHT_MAX = 2000

const tokensHeight = ref(readTokensHeight())

function readTokensHeight(): number {
  try {
    const saved = Number(window.localStorage.getItem(TOKENS_HEIGHT_KEY))
    if (Number.isFinite(saved) && saved >= TOKENS_HEIGHT_MIN) {
      return Math.min(saved, TOKENS_HEIGHT_MAX)
    }
  } catch {
    // Disabled storage — fall through to the default.
  }
  return 620
}

function startTokensResize(event: PointerEvent) {
  const handle = event.currentTarget as HTMLElement
  const startY = event.clientY
  const startHeight = tokensHeight.value
  // Capturing keeps the drag alive when the pointer outruns the handle —
  // without it, one fast upward flick drops the drag.
  handle.setPointerCapture(event.pointerId)

  const move = (ev: PointerEvent) => {
    tokensHeight.value = Math.min(
      TOKENS_HEIGHT_MAX,
      Math.max(TOKENS_HEIGHT_MIN, startHeight + ev.clientY - startY)
    )
  }
  const up = () => {
    handle.removeEventListener('pointermove', move)
    handle.removeEventListener('pointerup', up)
    try {
      window.localStorage.setItem(TOKENS_HEIGHT_KEY, String(tokensHeight.value))
    } catch {
      // Private browsing / quota — the drag still works for this session.
    }
  }
  handle.addEventListener('pointermove', move)
  handle.addEventListener('pointerup', up)
}

const visibleGroups = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return TOKEN_GROUPS
  return TOKEN_GROUPS.map((g) => ({
    ...g,
    tokens: g.tokens.filter((t) => t.name.includes(q))
  })).filter((g) => g.tokens.length)
})

/** Reads the browser's current value for every token, as the theme baseline. */
function captureDefaults() {
  const next: Record<string, string> = {}
  for (const name of TOKEN_NAMES) next[name] = getResolvedTokenValue(name)
  defaults.value = next
}

/** Swaps to the chosen base theme, then re-reads the baseline from it. */
function applyBase(next: ThemeType) {
  clearCustomTheme(preview.value)
  setTheme(next)
  // Let the stylesheet settle before reading computed values back.
  requestAnimationFrame(() => {
    captureDefaults()
    reapply()
  })
}

function reapply() {
  applyCustomTheme(currentTheme(), preview.value)
}

function currentTheme(): CustomTheme {
  return {
    id: activeId.value ?? createThemeId(themeName.value),
    name: themeName.value,
    base: base.value,
    tokens: { ...overrides.value },
    ramps: { ...rampGradient.value }
  }
}

function valueFor(name: string) {
  return overrides.value[name] ?? defaults.value[name] ?? ''
}

function setToken(name: string, value: string) {
  setTokens({ [name]: value })
}

/**
 * Applies several tokens as one edit.
 *
 * A ramp writes a dozen tokens at once, and doing that through twelve separate
 * `setToken` calls would re-serialise the JSON and re-apply the theme twelve
 * times for one user action.
 */
function setTokens(patch: Record<string, string>) {
  const next = { ...overrides.value }
  for (const [name, value] of Object.entries(patch)) {
    // Matching the base theme is not an override — dropping it here is what
    // keeps an exported theme inheriting future changes to the base.
    if (!value || value === defaults.value[name]) delete next[name]
    else next[name] = value
  }
  overrides.value = next
  reapply()
  syncJson()
}

// --- seeds ------------------------------------------------------------------
// The fast path: one colour per role, and `createTheme` derives the whole
// ramp — the editor below is then for fine-tuning, not data entry. Generated
// gradients are stored into `rampGradient`, so each ramp's panel opens on the
// gradient that produced it rather than a reconstruction.

const emptySeeds = (): Record<ThemeSeedRoleType, string> =>
  Object.fromEntries(THEME_SEED_ROLES.map((r) => [r, ''])) as Record<
    ThemeSeedRoleType,
    string
  >

const seeds = ref(emptySeeds())
const seedRadius = ref<'' | ThemeRadiusPresetType>('')
const seedError = ref('')

const hasSeeds = computed(
  () => seedRadius.value !== '' || THEME_SEED_ROLES.some((r) => seeds.value[r])
)

function generateFromSeeds() {
  try {
    const theme = createTheme({
      name: themeName.value,
      base: base.value,
      ...Object.fromEntries(
        THEME_SEED_ROLES.filter((r) => seeds.value[r].trim()).map((r) => [
          r,
          seeds.value[r].trim()
        ])
      ),
      ...(seedRadius.value ? { radius: seedRadius.value } : {})
    })
    setTokens(theme.tokens)
    if (theme.ramps) {
      rampGradient.value = { ...rampGradient.value, ...theme.ramps }
    }
    seedError.value = ''
  } catch (error) {
    seedError.value = (error as Error).message
  }
}

function clearSeeds() {
  seeds.value = emptySeeds()
  seedRadius.value = ''
  seedError.value = ''
}

// --- ramp generation ------------------------------------------------------
// A ramp is a dozen tokens that ought to be one decision. Each one gets a
// gradient editor: place as many stops as you like, choose how they blend, and
// every step is sampled off the result at its own numeric position.
//
// The panel is COLLAPSED by default. There are five ramps and a hundred-odd
// tokens on this page, and an expanded generator above each group buries the
// steps it generates.

/**
 * The gradient each ramp is being edited with, once the user has touched one.
 *
 * Absent until then, which is deliberate: with nothing stored, `gradientFor`
 * derives a two-stop gradient from the ramp's own first and last tokens, read
 * live. So before you edit anything the panel always agrees with the tokens
 * below it — after loading a theme, after switching base, after hand-editing a
 * step. State only appears once there is something a token cannot express.
 */
const rampGradient = ref<Record<string, Gradient>>({})
/** Which generators are expanded. */
const rampOpen = ref<Record<string, boolean>>({})
/** Set when a stop is something `rampColors` cannot parse. */
const rampError = ref<Record<string, string>>({})

function rampTokens(prefix: string) {
  const { steps } = TOKEN_RAMP_BY_PREFIX[prefix]
  return steps.map((step) => `${prefix}-${step}`)
}

function gradientFor(prefix: string): Gradient {
  const stored = rampGradient.value[prefix]
  if (stored) return stored

  const names = rampTokens(prefix)
  return createGradient({
    stops: [
      { color: valueFor(names[0]), position: 0 },
      { color: valueFor(names[names.length - 1]), position: 100 }
    ]
  })
}

function toggleRamp(prefix: string) {
  rampOpen.value = {
    ...rampOpen.value,
    [prefix]: !rampOpen.value[prefix]
  }
}

/** The ramps whose tokens are actually on screen, honouring the filter. */
function rampsIn(group: TokenGroup) {
  if (group.tier !== 'primitive') return []
  const present = new Set(group.tokens.map((t) => t.name))
  return TOKEN_RAMPS.filter((r) =>
    r.steps.some((s) => present.has(`${r.prefix}-${s}`))
  )
}

function setRampGradient(prefix: string, gradient: Gradient) {
  rampGradient.value = { ...rampGradient.value, [prefix]: gradient }
  generateRamp(prefix)
}

/** Re-samples every step of a ramp off its gradient. */
function generateRamp(prefix: string) {
  const { steps } = TOKEN_RAMP_BY_PREFIX[prefix]
  const colors = rampColors(gradientFor(prefix), steps)

  if (!colors) {
    rampError.value = {
      ...rampError.value,
      [prefix]:
        'Every stop needs to be a plain colour — a token holding ' +
        'something like var() or color-mix() cannot be sampled.'
    }
    return
  }

  const { [prefix]: _dropped, ...rest } = rampError.value
  rampError.value = rest
  setTokens(Object.fromEntries(steps.map((s) => [`${prefix}-${s}`, colors[s]])))
}

function resetRamp(prefix: string) {
  const next = { ...overrides.value }
  for (const name of rampTokens(prefix)) {
    delete next[name]
    preview.value?.style.removeProperty(tokenVar(name))
  }
  overrides.value = next
  // Drop the gradient too, so the panel goes back to describing the base
  // theme's own ramp rather than the one that has just been thrown away.
  const { [prefix]: _dropped, ...rest } = rampGradient.value
  rampGradient.value = rest
  reapply()
  syncJson()
}

function resetToken(name: string) {
  delete overrides.value[name]
  overrides.value = { ...overrides.value }
  preview.value?.style.removeProperty(tokenVar(name))
  reapply()
  syncJson()
}

function resetAll() {
  overrides.value = {}
  rampGradient.value = {}
  rampError.value = {}
  clearCustomTheme(preview.value)
  setTheme(base.value)
  syncJson()
}

function isColorToken(token: TokenDefinition) {
  return token.kind === 'color'
}

// --- saved themes ---------------------------------------------------------
function refreshSaved() {
  savedThemes.value = listCustomThemes()
  // The editor previews into its own element, which is never remembered across
  // page loads, so the selection lives here rather than in storage. Drop it if
  // the theme has gone, otherwise Duplicate/Delete would light up for a theme
  // that isn't in the list.
  if (!savedThemes.value.some((t) => t.id === activeId.value)) {
    activeId.value = null
  }
}

function save() {
  const theme = currentTheme()
  activeId.value = theme.id
  saveCustomTheme(theme)
  applyCustomTheme(theme, preview.value)
  refreshSaved()
}

function saveAsNew() {
  const theme: CustomTheme = {
    ...currentTheme(),
    id: createThemeId(themeName.value),
    name: `${themeName.value} copy`
  }
  themeName.value = theme.name
  activeId.value = theme.id
  saveCustomTheme(theme)
  applyCustomTheme(theme, preview.value)
  refreshSaved()
}

function load(theme: CustomTheme) {
  themeName.value = theme.name
  base.value = theme.base
  activeId.value = theme.id
  overrides.value = { ...theme.tokens }
  rampGradient.value = { ...theme.ramps }
  rampError.value = {}
  clearCustomTheme(preview.value)
  setTheme(theme.base)
  requestAnimationFrame(() => {
    captureDefaults()
    applyCustomTheme(theme, preview.value)
    syncJson()
  })
}

function remove(theme: CustomTheme) {
  deleteCustomTheme(theme.id)
  if (activeId.value === theme.id) {
    activeId.value = null
    resetAll()
  }
  refreshSaved()
}

function startFresh() {
  activeId.value = null
  themeName.value = 'My theme'
  resetAll()
}

// --- JSON -----------------------------------------------------------------
function syncJson() {
  jsonText.value = exportCustomTheme(currentTheme())
  jsonError.value = ''
}

function applyJson() {
  try {
    const theme = importCustomTheme(jsonText.value)
    themeName.value = theme.name
    base.value = theme.base
    overrides.value = { ...theme.tokens }
    rampGradient.value = { ...theme.ramps }
    rampError.value = {}
    activeId.value = theme.id
    clearCustomTheme(preview.value)
    setTheme(theme.base)
    requestAnimationFrame(() => {
      captureDefaults()
      applyCustomTheme(theme, preview.value)
    })
    jsonError.value = ''
  } catch (error) {
    jsonError.value = (error as Error).message
  }
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(jsonText.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard blocked (insecure context / permissions) — the textarea is
    // right there, so this is not worth an error state.
  }
}

watch(base, (next) => applyBase(next))

onMounted(() => {
  captureDefaults()
  refreshSaved()
  syncJson()
})

onBeforeUnmount(() => {
  // The preview element goes with us, so there is nothing to unstyle — but a
  // theme applied document-wide by a consuming app (or an earlier build of
  // this page) would outlive us.
  clearCustomTheme()
})
</script>

<template>
  <div :class="$style.Root">
    <header :class="$style.Bar">
      <div :class="$style.Field">
        <label :class="$style.Label">Theme name</label>
        <input
          v-model="themeName"
          :class="$style.Input"
          @input="syncJson()"
        />
      </div>

      <div :class="$style.Field">
        <label :class="$style.Label">Based on</label>
        <select
          v-model="base"
          :class="$style.Input"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div :class="$style.Field">
        <label :class="$style.Label">Saved themes</label>
        <select
          :class="$style.Input"
          :value="activeId ?? ''"
          @change="
            (e) => {
              const id = (e.target as HTMLSelectElement).value
              const found = savedThemes.find((t) => t.id === id)
              found ? load(found) : startFresh()
            }
          "
        >
          <option value="">— new theme —</option>
          <option
            v-for="theme in savedThemes"
            :key="theme.id"
            :value="theme.id"
          >
            {{ theme.name }} ({{ theme.base }})
          </option>
        </select>
      </div>

      <div :class="$style.Actions">
        <button
          :class="[$style.Btn, $style.BtnPrimary]"
          @click="save"
        >
          Save
        </button>
        <button
          :class="$style.Btn"
          :disabled="!activeId"
          @click="saveAsNew"
        >
          Duplicate
        </button>
        <button
          :class="$style.Btn"
          @click="resetAll"
        >
          Reset changes
        </button>
        <button
          :class="[$style.Btn, $style.BtnDanger]"
          :disabled="!activeId"
          @click="
            () => {
              const t = savedThemes.find((s) => s.id === activeId)
              if (t) remove(t)
            }
          "
        >
          Delete
        </button>
      </div>

      <p :class="$style.Meta">
        <strong>{{ changedCount }}</strong>
        token{{ changedCount === 1 ? '' : 's' }} overridden. Themes are stored
        in this browser's <code>localStorage</code> only.
      </p>
    </header>

    <section :class="$style.Seeds">
      <h3 :class="$style.H3">Start from seeds</h3>
      <p :class="$style.SeedsHelp">
        One colour per role — Generate turns each into a full ramp (your colour
        lands on step 500), dark mode included. Blank roles keep the base
        theme; fine-tune any token below afterwards.
      </p>
      <div :class="$style.SeedsGrid">
        <div
          v-for="role in THEME_SEED_ROLES"
          :key="role"
          :class="$style.SeedField"
        >
          <label :class="$style.Label">{{ role }}</label>
          <div :class="$style.Controls">
            <ColorSelector
              :model-value="seeds[role]"
              :show-value="false"
              :placement="'bottom-end'"
              @update:model-value="seeds[role] = $event as string"
            />
            <input
              :class="[$style.Input, $style.SeedInput]"
              :value="seeds[role]"
              placeholder="—"
              @change="
                seeds[role] = ($event.target as HTMLInputElement).value
              "
            />
          </div>
        </div>
        <div :class="$style.SeedField">
          <label :class="$style.Label">radius</label>
          <select
            v-model="seedRadius"
            :class="$style.Input"
          >
            <option value="">— keep —</option>
            <option value="none">none (square)</option>
            <option value="small">small</option>
            <option value="medium">medium (default)</option>
            <option value="large">large</option>
          </select>
        </div>
      </div>
      <div :class="$style.Actions">
        <button
          :class="[$style.Btn, $style.BtnPrimary]"
          :disabled="!hasSeeds"
          @click="generateFromSeeds"
        >
          Generate
        </button>
        <button
          :class="$style.Btn"
          :disabled="!hasSeeds"
          @click="clearSeeds"
        >
          Clear seeds
        </button>
      </div>
      <p
        v-if="seedError"
        :class="$style.JsonError"
      >
        {{ seedError }}
      </p>
    </section>

    <div :class="$style.Columns">
      <div :class="$style.TokensColumn">
      <section
        :class="$style.Tokens"
        :style="{ maxHeight: tokensHeight + 'px' }"
      >
        <div :class="$style.TokensHead">
          <h3 :class="$style.H3">Tokens</h3>
          <input
            v-model="filter"
            :class="[$style.Input, $style.Filter]"
            placeholder="Filter tokens…"
          />
        </div>

        <div
          v-for="group in visibleGroups"
          :key="group.title"
          :class="$style.Group"
        >
          <h4 :class="$style.H4">
            {{ group.title }}
            <span :class="$style.Tier">{{ group.tier }}</span>
            <!--
              One toggle per ramp, tinted with that ramp's own mid step. The
              Status group holds three of them, so the tint is what tells them
              apart at a glance — a row of identical icons would need the
              tooltip read out three times.
            -->
            <button
              v-for="ramp in rampsIn(group)"
              :key="ramp.prefix"
              :class="[
                $style.RampToggle,
                rampOpen[ramp.prefix] && $style.RampToggle__open
              ]"
              :style="{ color: valueFor(`${ramp.prefix}-500`) }"
              :aria-expanded="!!rampOpen[ramp.prefix]"
              :aria-label="`Generate the ${ramp.title.toLowerCase()} ramp from a gradient`"
              :title="`Generate the ${ramp.title.toLowerCase()} ramp from a gradient`"
              @click="toggleRamp(ramp.prefix)"
            >
              <Icon icon="mdi:auto-fix" />
            </button>
          </h4>
          <p
            v-if="group.description"
            :class="$style.GroupDesc"
          >
            {{ group.description }}
          </p>

          <template
            v-for="ramp in rampsIn(group)"
            :key="ramp.prefix"
          >
            <div
              v-if="rampOpen[ramp.prefix]"
              :class="$style.Ramp"
            >
              <div :class="$style.RampHead">
                <span :class="$style.RampName">{{ ramp.title }}</span>
                <button
                  :class="[$style.Btn, $style.BtnGhost]"
                  title="Drop every override on this ramp, and its gradient"
                  @click="resetRamp(ramp.prefix)"
                >
                  Reset ramp
                </button>
              </div>

              <!--
                `hide-shape` because nothing here is ever painted as a gradient:
                the ramp only samples positions along it, so a shape and an
                angle would be controls with no effect. The ends are pinned
                because the lowest step IS the left end — a stop dragged inward
                would make several steps come out identical.
              -->
              <GradientPicker
                :model-value="gradientFor(ramp.prefix)"
                hide-shape
                alpha
                pin-start
                pin-end
                @update:model-value="setRampGradient(ramp.prefix, $event)"
              />

              <p
                v-if="rampError[ramp.prefix]"
                :class="$style.JsonError"
              >
                {{ rampError[ramp.prefix] }}
              </p>
            </div>
          </template>

          <div
            v-for="token in group.tokens"
            :key="token.name"
            :class="$style.Row"
          >
            <div :class="$style.RowMain">
              <code :class="$style.TokenName">--octans-{{ token.name }}</code>
              <span
                v-if="token.description"
                :class="$style.TokenDesc"
              >
                {{ token.description }}
              </span>
            </div>

            <div :class="$style.Controls">
              <!--
                The text field stays alongside the picker rather than being
                replaced by it: a token may legitimately hold something the
                picker cannot show — `var()`, `color-mix()`, a gradient — and
                that has to remain typeable.
              -->
              <ColorSelector
                v-if="isColorToken(token)"
                :model-value="valueFor(token.name)"
                :show-value="false"
                alpha
                :placement="'bottom-end'"
                @update:model-value="setToken(token.name, $event as string)"
              />
              <input
                :class="[$style.Input, $style.ValueInput]"
                :value="valueFor(token.name)"
                @change="
                  setToken(
                    token.name,
                    ($event.target as HTMLInputElement).value
                  )
                "
              />
              <button
                :class="[$style.Btn, $style.BtnGhost]"
                :disabled="!(token.name in overrides)"
                title="Reset to the base theme's value"
                @click="resetToken(token.name)"
              >
                ↺
              </button>
            </div>
          </div>
        </div>
      </section>
      <div
        :class="$style.ResizeHandle"
        title="Drag to resize the token list"
        aria-label="Drag to resize the token list"
        role="separator"
        aria-orientation="horizontal"
        @pointerdown="startTokensResize"
      >
        <span :class="$style.ResizeGrip"></span>
      </div>
      </div>
      <!-- .TokensColumn -->

      <section :class="$style.Json">
        <h3 :class="$style.H3">JSON</h3>
        <p :class="$style.JsonHelp">
          Only overridden tokens are stored, so your theme keeps inheriting
          future changes to the base theme. Paste a theme here and press Apply.
        </p>
        <textarea
          v-model="jsonText"
          :class="$style.TextArea"
          spellcheck="false"
        ></textarea>
        <p
          v-if="jsonError"
          :class="$style.JsonError"
        >
          {{ jsonError }}
        </p>
        <div :class="$style.Actions">
          <button
            :class="[$style.Btn, $style.BtnPrimary]"
            @click="applyJson"
          >
            Apply JSON
          </button>
          <button
            :class="$style.Btn"
            @click="copyJson"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </section>
    </div>

    <h3 :class="[$style.H3, $style.PreviewHeading]">Preview</h3>
    <!--
      The overrides land on this element, not on <html>, so everything inside
      is themed and everything above it is not. See the note in the script.
    -->
    <section
      ref="preview"
      :class="$style.Preview"
    >
      <KitchenSink />
    </section>
  </div>
</template>

<style lang="scss" module>
// Ordinary Octans tokens. Safe to use here because the theme being edited is
// applied to `.Preview` alone — see the note at the top of the script block.
.Root {
  font-family: var(--octans-font);
  font-size: 13px;
  color: var(--octans-text);
}

.Bar,
.Seeds,
.Tokens,
.Json {
  background: var(--octans-surface);
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-box);
  padding: 14px;
}

.Seeds {
  margin-bottom: 12px;
}

.SeedsHelp {
  margin: 4px 0 10px;
  color: var(--octans-text-subdued);
  font-size: 12px;
  max-width: 640px;
}

.SeedsGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-bottom: 10px;
}

.SeedField {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.SeedInput {
  width: 88px;
}

.Bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 12px;
}

.Field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.Label {
  color: var(--octans-text-subdued);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.Input {
  min-height: 30px;
  padding: 4px 8px;
  background: var(--octans-surface-sunken);
  color: var(--octans-text);
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  font: inherit;

  &:focus {
    outline: 2px solid var(--octans-focus-ring);
    outline-offset: 1px;
  }
}

.Actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.Btn {
  min-height: 30px;
  padding: 4px 12px;
  background: var(--octans-surface-sunken);
  color: var(--octans-text);
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  font: inherit;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--octans-surface-hover);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}
.BtnPrimary {
  background: var(--octans-primary);
  border-color: var(--octans-primary);
  color: var(--octans-text-on-primary);
  &:hover:not(:disabled) {
    background: var(--octans-primary-hover);
  }
}
.BtnDanger {
  background: var(--octans-error);
  border-color: var(--octans-error);
  color: var(--octans-text-on-primary);
  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--octans-error) 88%, black);
  }
}
.BtnGhost {
  min-width: 30px;
  padding: 4px 8px;
  background: transparent;
}

.Meta {
  flex-basis: 100%;
  margin: 0;
  color: var(--octans-text-subdued);

  code {
    font-family: var(--octans-font-mono);
  }
}

.Columns {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 12px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.TokensColumn {
  min-width: 0;
}

.Tokens {
  // The working max-height lives on the element (dragged via the handle
  // below, remembered in localStorage); this is only the pre-mount fallback.
  max-height: 620px;
  overflow-y: auto;
}

.ResizeHandle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 14px;
  margin-top: 2px;
  cursor: row-resize;
  // Without this, a touch drag scrolls the page instead of resizing.
  touch-action: none;
  user-select: none;

  &:hover .ResizeGrip,
  &:active .ResizeGrip {
    background: var(--octans-text-subdued);
  }
}

.ResizeGrip {
  width: 36px;
  height: 4px;
  background: var(--octans-border-strong);
  border-radius: var(--octans-radius-full);
}

.TokensHead {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.Filter {
  width: 200px;
}

.H3 {
  margin: 0 0 8px;
  font-size: 14px;
}
.H4 {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 16px 0 2px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--octans-text-subdued);
}
.Tier {
  padding: 1px 6px;
  background: var(--octans-surface-sunken);
  border-radius: var(--octans-radius-full);
  font-size: 10px;
  letter-spacing: 0;
  text-transform: none;
}
.GroupDesc {
  margin: 0 0 8px;
  color: var(--octans-text-subdued);
  font-size: 11px;
  max-width: 60ch;
}

.Group {
  border-top: 1px solid var(--octans-border);
  padding-top: 4px;
}

// The ramp generator sits above the steps it writes, inset so it reads as a
// control *for* the list below rather than another row in it.
.Ramp {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 8px 0 12px;
  padding: 10px;
  background: var(--octans-surface-sunken);
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-box);
}

// The generator is collapsed to a single icon in the group heading. The token
// rows below already show every colour in the ramp, so a preview strip up here
// was showing the same thing twice.
.RampToggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--octans-radius-field);
  font-size: 15px;
  cursor: pointer;

  &:hover {
    background: var(--octans-surface-hover);
    border-color: var(--octans-border);
  }
  &:focus-visible {
    outline: 2px solid var(--octans-focus-ring);
    outline-offset: 1px;
  }
}

.RampToggle__open {
  background: var(--octans-surface-sunken);
  border-color: var(--octans-border-strong);
}

.RampHead {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.RampName {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  color: var(--octans-text);
}

.Row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid var(--octans-border);
}

.RowMain {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.TokenName {
  font-family: var(--octans-font-mono);
  font-size: 11.5px;
}
.TokenDesc {
  color: var(--octans-text-subdued);
  font-size: 11px;
}

.Controls {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

.ValueInput {
  width: 190px;
  font-family: var(--octans-font-mono);
  font-size: 11.5px;
}

.Json {
  position: sticky;
  top: 12px;
}
.JsonHelp {
  margin: 0 0 8px;
  color: var(--octans-text-subdued);
  font-size: 11px;
}
.TextArea {
  width: 100%;
  height: 120px;
  padding: 8px;
  background: var(--octans-surface-sunken);
  color: var(--octans-text);
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  font-family: var(--octans-font-mono);
  font-size: 11.5px;
  resize: vertical;
}
.JsonError {
  margin: 6px 0;
  color: var(--octans-text-error);
  font-size: 11.5px;
}

.PreviewHeading {
  margin: 16px 0 8px;
}

// The preview is where the edited theme lands, so it needs its own app
// background rather than showing the page's — otherwise a changed
// `surface-app` would have nothing to paint.
.Preview {
  padding: 16px;
  background: var(--octans-surface-app);
  // Re-resolve here rather than inheriting: `color` inherits as a computed
  // value, so text would otherwise keep the editor's base-theme colour even
  // when `--octans-text` is overridden on this element.
  color: var(--octans-text);
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-box);
}
</style>
