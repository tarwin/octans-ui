// Tags the current commit `v<version>`, reading the version straight out of
// package.json, and pushes the tag.
//
// This replaces `package-version-git-tag`, which built the tag name as
// `${prefix}${version}` where the prefix came from
// `npm config get tag-version-prefix`. That is fine until something sits
// between you and npm: a shim redirecting `npm` to `pnpm` answers that key
// with the literal string "undefined" — and prints a banner line ahead of it —
// so 1.2.0 was tagged `undefined1.2.0` and pushed before anyone looked.
//
// The prefix is a constant here. There is only one right answer for this
// repo, and no lookup means nothing to intercept.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const DRY_RUN = process.argv.includes('--dry-run')

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

/** `git` for a probe that is EXPECTED to fail — its stderr is not news. */
const gitQuiet = (...args) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim()

const { version } = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../package.json', import.meta.url)),
    'utf8'
  )
)

if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error(`✗ package.json version is not a version: "${version}"`)
  process.exit(1)
}

const tag = `v${version}`
const head = git('rev-parse', 'HEAD')

// `rev-parse <tag>^{}` peels an annotated tag to the commit it points at, so
// this compares commits rather than the tag object's own hash.
let existing = null
try {
  existing = gitQuiet('rev-parse', `${tag}^{}`)
} catch {
  // No such tag — the normal case.
}

if (existing && existing !== head) {
  console.error(
    `✗ ${tag} already exists and points at ${existing.slice(0, 7)}, ` +
      `not HEAD (${head.slice(0, 7)}).\n` +
      `  A published version's tag must not move. Bump the version instead.`
  )
  process.exit(1)
}

if (DRY_RUN) {
  console.log(`Dry run: would tag ${head.slice(0, 7)} as ${tag} and push it.`)
  process.exit(0)
}

// Idempotent: re-running after a failed push tags nothing and pushes again.
if (!existing) {
  git('tag', '-a', tag, '-m', tag)
  console.log(`✓ tagged ${head.slice(0, 7)} as ${tag}`)
} else {
  console.log(`• ${tag} already on HEAD`)
}

git('push', 'origin', tag)
console.log(`✓ pushed ${tag}`)
