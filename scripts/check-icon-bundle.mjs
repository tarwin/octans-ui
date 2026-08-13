// Fails if the committed icon bundles no longer match the Iconify names in
// src/. Runs offline, so it belongs in `verify` and CI where `icons:bundle`
// itself cannot go (that one needs api.iconify.design).
//
// This is the guard that was missing: `mdi:share-variant` sat in src/ for a
// while with no bundle entry, silently falling back to a runtime API call,
// because nothing ever re-ran the generator. A missing entry is not a build
// error — it just quietly costs a network round trip, or renders nothing at
// all offline — so it needs checking rather than waiting to be noticed.

import { relative } from 'node:path'

import {
  RUNTIME_BUNDLE,
  STORY_BUNDLE,
  readBundledNames,
  root,
  scanIcons
} from './icon-scan.mjs'

const compare = async (label, file, expected) => {
  const actual = await readBundledNames(file)
  const missing = [...expected].filter((name) => !actual.has(name)).sort()
  const extra = [...actual].filter((name) => !expected.has(name)).sort()

  if (!missing.length && !extra.length) {
    console.log(`✓ ${label} — ${expected.size} icons, in sync`)
    return true
  }

  console.error(`✗ ${label} (${relative(root, file)})`)
  if (missing.length) {
    console.error(`  used in src/ but not bundled: ${missing.join(', ')}`)
  }
  if (extra.length) {
    console.error(`  bundled but no longer used:   ${extra.join(', ')}`)
  }
  return false
}

const { runtime, story } = await scanIcons()

const results = [
  await compare('shipped bundle', RUNTIME_BUNDLE, new Set(runtime.keys())),
  await compare('story bundle', STORY_BUNDLE, new Set(story.keys()))
]

if (results.includes(false)) {
  console.error('\nRun `pnpm icons:bundle` and commit the result.')
  process.exit(1)
}
