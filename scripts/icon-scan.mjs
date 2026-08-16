// Finds every Iconify name used in src/, and splits them by who needs them.
//
// Shared by build-icon-bundle.mjs (which fetches and writes the bundles) and
// check-icon-bundle.mjs (which asserts the committed bundles still match).
// One scan, two consumers — if they each had their own copy the check would
// eventually start passing on a bundle the build would no longer produce.

import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = fileURLToPath(new URL('..', import.meta.url))
export const srcDir = join(root, 'src')

// Icons the library itself renders. Ships to consumers inside dist/ui.js.
export const RUNTIME_BUNDLE = join(srcDir, 'components/Icon/iconBundle.ts')
// Icons that only ever appear in stories or fixtures. Registered by
// .storybook/preview.ts, so Storybook still renders offline and instantly
// without those icons costing every consumer bytes they will never draw.
export const STORY_BUNDLE = join(root, '.storybook/storyIconBundle.ts')

// Names reachable only at runtime, so the scan below can't see them.
const alwaysInclude = ['la:slash']

// Matches any quoted string that is EXACTLY an Iconify name, wherever it
// appears — `icon="mdi:alert"`, but also inside ternaries, object maps and
// arrays, which an icon-position-only pattern silently misses. (It used to
// require the name to sit directly after `icon:` / `icon=`, and quietly skipped
// eight icons that were written as ternary branches or config values.)
//
// Anchoring both ends to the quotes is not enough on its own — an inline style
// like `"height:100vh"` has the same shape — so the prefix must also be a
// collection we actually use. Add to KNOWN_PREFIXES when adopting a new one;
// that is deliberately a conscious step rather than a silent guess.
export const KNOWN_PREFIXES = ['mdi', 'la', 'lucide']

export const iconNamePattern = new RegExp(
  `["'\`](?:not:)?((?:${KNOWN_PREFIXES.join('|')}):[a-z0-9-]+)["'\`]`,
  'g'
)

// A name in a comment is documentation, not usage — `Icon.vue`'s doc block
// cites `la:home` and `lucide:camera` as examples of the naming format, and
// bundling those cost real bytes for icons nothing renders.
//
// Deliberately line-level: it drops whole comment lines rather than parsing
// out inline trailing comments. Every comment in this repo is Prettier-
// formatted, so continuation lines start with `*`, and a name sitting after
// code on the same line is almost always the code, not the comment.
const COMMENT_STARTS = ['*', '//', '/*', '<!--']
const isCommentLine = (line) => {
  const trimmed = line.trimStart()
  return COMMENT_STARTS.some((marker) => trimmed.startsWith(marker))
}

// Stories and fixtures are Storybook-only; tests never render to a real screen.
// None of them are reasons to ship an icon.
//
// src/stories/ counts whole: nothing in it is reachable from src/lib.ts, and it
// holds plain .vue helpers (ShellPreview, KitchenSink) that a `.stories.`
// filename test misses — which is how five ThemeBuilder-only icons ended up
// looking like shipped ones.
const isDocsOnly = (path) =>
  /\.stories\./.test(path) ||
  /[/\\]stories[/\\]/.test(path) ||
  /[/\\]styleguide[/\\]/.test(path) ||
  /\.(test|spec)\.ts$/.test(path)

const walk = async (dir) => {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(path)))
    } else if (/\.(vue|ts|tsx|js|mjs)$/.test(entry.name)) {
      files.push(path)
    }
  }
  return files
}

/**
 * Returns { runtime, story }, each a Map of icon name → the files citing it.
 * A name used anywhere outside stories/fixtures/tests is runtime, even if it
 * also appears in a story.
 */
export const scanIcons = async () => {
  const runtime = new Map()
  const story = new Map()

  for (const name of alwaysInclude) {
    runtime.set(name, ['<runtime>'])
  }

  for (const file of await walk(srcDir)) {
    // The generated bundle would otherwise re-declare everything already in it,
    // making removals impossible to ever take effect.
    if (file === RUNTIME_BUNDLE) continue

    const source = await readFile(file, 'utf8')
    const target = isDocsOnly(file) ? story : runtime

    for (const line of source.split('\n')) {
      if (isCommentLine(line)) continue
      for (const match of line.matchAll(iconNamePattern)) {
        const name = match[1]
        if (!target.has(name)) target.set(name, [])
        target.get(name).push(relative(root, file))
      }
    }
  }

  // A name earns its place in the shipped bundle as soon as one non-story file
  // uses it, so runtime always wins the tie.
  for (const name of runtime.keys()) story.delete(name)

  return { runtime, story }
}

/** The `prefix:name` pairs currently registered by a generated bundle file. */
export const readBundledNames = async (file) => {
  let source
  try {
    source = await readFile(file, 'utf8')
  } catch {
    throw new Error(
      `${relative(root, file)} does not exist — run \`pnpm icons:bundle\`.`
    )
  }
  const start = source.indexOf('[')
  const end = source.lastIndexOf(']')
  if (start === -1 || end === -1) {
    throw new Error(
      `${relative(root, file)} is not a generated icon bundle — run \`pnpm icons:bundle\`.`
    )
  }
  const collections = JSON.parse(source.slice(start, end + 1))
  return new Set(
    collections.flatMap((collection) =>
      Object.keys(collection.icons).map(
        (icon) => `${collection.prefix}:${icon}`
      )
    )
  )
}
