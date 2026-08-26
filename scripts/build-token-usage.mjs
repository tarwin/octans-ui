// Builds the component → tokens map that the Theme Builder filters by.
//
// Derived by reading the component sources rather than hand-maintained: a map
// like this is only worth having if it is right, and a hand-written one goes
// stale the first time somebody swaps a token in a stylesheet without thinking
// about a docs page. Run with `node scripts/build-token-usage.mjs`, or
// `--check` to fail when the checked-in file has drifted.
//
// Writes src/utils/tokenUsage.ts.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

// Node strips the types on import, the same way check-contrast.mjs does.
import { TOKEN_GROUPS, TOKEN_NAMES } from '../src/utils/tokens.ts'

const COMPONENTS_DIR = resolve('src/components')
const OUT = resolve('src/utils/tokenUsage.ts')

const registered = new Set(TOKEN_NAMES)

/**
 * Primitive ramp steps (`--octans-success-700`, `--octans-neutral-0`).
 *
 * Excluded when EXPANDING derivations, though still listed when a component
 * names one itself. Following a semantic token down to its ramp step is
 * technically true and practically noise: it turned Badge's list from 14
 * entries into 35, 20 of which were palette steps nobody reaches for when
 * they want to restyle a badge.
 */
const PRIMITIVES = new Set(
  TOKEN_GROUPS.filter((g) => g.tier === 'primitive').flatMap((g) =>
    g.tokens.map((t) => t.name)
  )
)

/**
 * token -> the tokens its own VALUE references, read from tokens.scss.
 *
 * Needed because a component rarely names the knob you actually want. Badge
 * reads `--octans-badge-success-surface`, but the number worth turning is
 * `--octans-badge-surface-strength`, which appears only in the stylesheet —
 * filter to Badge without this and the dial that controls it is missing.
 */
function derivationGraph() {
  const css = readFileSync(resolve('src/styles/tokens.scss'), 'utf8')
  const graph = {}
  for (const m of css.matchAll(/--octans-([a-z0-9-]+):\s*([^;]+);/g)) {
    const refs = [...m[2].matchAll(/var\(--octans-([a-z0-9-]+)/g)].map(
      (r) => r[1]
    )
    graph[m[1]] = [...new Set([...(graph[m[1]] ?? []), ...refs])]
  }
  return graph
}

const DERIVES_FROM = derivationGraph()

/**
 * One level of derivation, not the full closure.
 *
 * Transitively, almost every semantic token reaches a primitive and then the
 * seed, so a closure would answer "Badge uses 60 tokens" — true, useless. One
 * step surfaces the knob immediately behind what the component names and stops
 * there.
 */
function withDerivations(names) {
  const out = new Set(names)
  for (const name of names) {
    for (const ref of DERIVES_FROM[name] ?? []) {
      if (registered.has(ref) && !PRIMITIVES.has(ref)) out.add(ref)
    }
  }
  return out
}

/** Every file under `dir` whose contents could name a token. */
function sourceFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      out.push(...sourceFiles(path))
    } else if (
      /\.(vue|scss|css|ts)$/.test(entry) &&
      !/\.test\.ts$/.test(entry)
    ) {
      // Stories are documentation, not the component: a token named only in a
      // story is not a token the component reads.
      if (!/\.stories\.ts$/.test(entry)) out.push(path)
    }
  }
  return out
}

/**
 * Token names appearing in `source`.
 *
 * Deliberately NOT limited to `var(--octans-…)`. Banner passes bare custom
 * property names into a Sass mixin (`@include bannerColor(--octans-text-info,
 * …)`), and Tabs sets `--octans-tabs-*` as an override rather than reading it —
 * both are real relationships between a component and a token, and matching
 * only `var(` would miss them.
 */
function tokensIn(source) {
  return [...source.matchAll(/--octans-([a-z0-9-]+)/g)]
    .map((m) => m[1])
    .filter((name) => registered.has(name))
}

function build() {
  const usage = {}
  for (const name of readdirSync(COMPONENTS_DIR)) {
    const dir = join(COMPONENTS_DIR, name)
    if (!statSync(dir).isDirectory()) continue
    const found = new Set()
    for (const file of sourceFiles(dir)) {
      for (const token of tokensIn(readFileSync(file, 'utf8'))) found.add(token)
    }
    if (found.size) usage[name] = [...withDerivations(found)].sort()
  }
  return usage
}

function render(usage) {
  // Quoting matches .prettierrc (single quotes, no trailing commas) so the
  // generated file passes `format:check` without a formatting pass of its own.
  const q = (v) => `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  // Prettier drops quotes from keys that are valid identifiers, and every
  // component directory name is one.
  const key = (v) => (/^[A-Za-z_$][\w$]*$/.test(v) ? v : q(v))
  const entries = Object.keys(usage)
    .sort()
    .map(
      (component) =>
        `  ${key(component)}: [\n` +
        usage[component].map((t) => `    ${q(t)}`).join(',\n') +
        `\n  ]`
    )
    .join(',\n')

  return `// GENERATED by scripts/build-token-usage.mjs — do not edit by hand.
// Run \`pnpm tokens:usage\` after changing which tokens a component reads.

/**
 * Which \`--octans-*\` tokens each component names in its own source.
 *
 * Drives the Theme Builder's component filter, so you can ask "what does Badge
 * actually read?" instead of guessing from a token's name. Includes tokens a
 * component OVERRIDES as well as ones it reads — both are reasons a change to
 * that token shows up in that component.
 */
export const TOKEN_USAGE: Record<string, string[]> = {
${entries}
}

/** Component names that read at least one token, sorted. */
export const TOKEN_USAGE_COMPONENTS: string[] = Object.keys(TOKEN_USAGE)
`
}

const usage = build()
const rendered = render(usage)

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(OUT, 'utf8')
  } catch {
    // Missing file falls through to the mismatch branch below.
  }
  if (current !== rendered) {
    console.error(
      'token usage map is out of date — run `pnpm tokens:usage` and commit the result.'
    )
    process.exit(1)
  }
  const components = Object.keys(usage).length
  const tokens = new Set(Object.values(usage).flat()).size
  console.log(
    `✓ token usage — ${components} components, ${tokens} tokens, in sync`
  )
} else {
  writeFileSync(OUT, rendered)
  console.log(
    `wrote ${OUT} — ${Object.keys(usage).length} components, ` +
      `${new Set(Object.values(usage).flat()).size} tokens`
  )
}
