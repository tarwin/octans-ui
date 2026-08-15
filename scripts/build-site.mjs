// Assembles what gets published to octans.dev:
//
//   site-dist/
//     index.html          ← site/index.html, the landing page
//     octans-logo.svg     ← SVG favicon and header mark
//     octans-icon.png     ← PNG favicon fallback and iOS home-screen icon,
//                           shared with Storybook, which reaches it as ../
//     octans-og-image.png ← the og:image both the landing page and Storybook
//                           point at, by absolute URL
//     storybook/          ← already written here by `storybook build -o`
//
// Storybook used to be the whole site, served from the root. It is now one
// destination among three (quick start, kitchen sink, source), so it moves down
// a level and the landing page takes the root. `pnpm build-site` runs the
// Storybook build first and this script second — see package.json.
//
// The assets are copied rather than committed twice: octans-logo.svg is the
// repo's canonical copy (the README renders it), and octans-og-image.png is
// only ever wanted at the site root.

import { cp, mkdir, rm, stat } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'site-dist')

/** Root-level files the landing page references by name. */
const ROOT_ASSETS = [
  'octans-logo.svg',
  'octans-icon.png',
  'octans-og-image.png'
]

const exists = async (path) => {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

const storybook = join(out, 'storybook')
if (!(await exists(storybook))) {
  console.error(
    `✗ ${relative(root, storybook)} is missing.\n` +
      '  Run `pnpm build-site`, which builds Storybook into it first.'
  )
  process.exit(1)
}

// Everything except site-dist/storybook, which was just built and must survive.
for (const entry of ['index.html', ...ROOT_ASSETS]) {
  await rm(join(out, entry), { force: true })
}

await mkdir(out, { recursive: true })
await cp(join(root, 'site'), out, { recursive: true })

for (const asset of ROOT_ASSETS) {
  const from = join(root, asset)
  if (!(await exists(from))) {
    // A missing og:image is invisible until someone pastes a link into Slack
    // and gets a bare grey card, so it fails the build instead.
    console.error(`✗ ${asset} not found at the repository root.`)
    process.exit(1)
  }
  await cp(from, join(out, asset))
}

console.log(
  `✓ site assembled in ${relative(root, out)}/ — landing page at /, Storybook at /storybook/`
)
