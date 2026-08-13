#!/usr/bin/env node
//
// octans-icons — bundle the Iconify icons your app actually uses.
//
// @octans/ui ships only the icons the library itself renders. Anything else you
// pass to `<Icon icon="...">` is fetched from api.iconify.design on first use.
// That is a fine default — you get all 200k+ icons with no build step — but it
// means a network round trip per collection, nothing at all offline, and a
// third-party dependency at runtime.
//
// This scans your source for Iconify names, fetches just those, and writes a
// file you import once at startup. Run it before a build; commit the output.
//
//   npx octans-icons                     # scans ./src, writes src/octansIcons.ts
//   npx octans-icons app --out app/icons.ts
//   npx octans-icons --dry-run           # list what it finds, write nothing
//
// Deliberately standalone — no imports from the rest of the package, so it
// keeps working regardless of what the library's own build is doing.

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'

const HELP = `octans-icons — bundle the Iconify icons your app uses

Usage
  npx octans-icons [dir...] [options]

Options
  --out <file>   Where to write the bundle. Default: <first dir>/octansIcons.ts
                 A .js extension emits JavaScript instead of TypeScript.
  --dry-run      Print the icons found and exit without writing.
  --quiet        Only print errors.
  -h, --help     Show this.

Then import it once, before anything renders:

  import './octansIcons'

Re-run it whenever you add an icon. Names built at runtime (\`\\\`mdi:\${name}\\\`\`)
can't be seen by a source scan — those keep resolving through the API, which
still works. Pass them explicitly by putting the literal names in an array.
`

const args = process.argv.slice(2)
if (args.includes('-h') || args.includes('--help')) {
  console.log(HELP)
  process.exit(0)
}

const takeFlag = (name) => {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  const value = args[index + 1]
  if (value === undefined || value.startsWith('-')) {
    console.error(`octans-icons: ${name} needs a value`)
    process.exit(1)
  }
  args.splice(index, 2)
  return value
}

const outFlag = takeFlag('--out')
const dryRun = args.includes('--dry-run')
const quiet = args.includes('--quiet')
const dirs = args.filter((arg) => !arg.startsWith('-'))
const roots = dirs.length ? dirs : ['src']
const outFile = resolve(outFlag ?? join(roots[0], 'octansIcons.ts'))

const say = (message) => {
  if (!quiet) console.log(message)
}

const SCANNABLE = /\.(vue|ts|tsx|js|jsx|mjs|cjs|svelte|astro|html)$/
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage'])

const walk = async (dir) => {
  const files = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    console.error(`octans-icons: cannot read ${dir}`)
    process.exit(1)
  }
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (SCANNABLE.test(entry.name)) files.push(path)
  }
  return files
}

// A name in a comment is documentation, not usage. Line-level on purpose: it
// drops whole comment lines rather than trying to parse a trailing `//` out of
// a line that may well contain one inside a string.
const isCommentLine = (line) => {
  const trimmed = line.trimStart()
  return ['*', '//', '/*', '<!--'].some((marker) => trimmed.startsWith(marker))
}

// Any quoted `prefix:name` is a candidate. `prefix` alone is far too loose —
// "height:100vh" and "grid:1 / 3" have the same shape — so candidates are kept
// only if the prefix is a real Iconify collection, which the API can tell us.
const CANDIDATE =
  /["'`](?:not:)?([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)["'`]/g

const fetchJson = async (url) => {
  let response
  try {
    response = await fetch(url)
  } catch (error) {
    console.error(
      `octans-icons: could not reach api.iconify.design — ${error.message}`
    )
    process.exit(1)
  }
  if (!response.ok) {
    console.error(
      `octans-icons: ${url} — ${response.status} ${response.statusText}`
    )
    process.exit(1)
  }
  return response.json()
}

const files = (await Promise.all(roots.map((dir) => walk(dir)))).flat()
if (!files.length) {
  console.error(`octans-icons: no source files under ${roots.join(', ')}`)
  process.exit(1)
}

const candidates = new Map()
for (const file of files) {
  if (resolve(file) === outFile) continue
  const source = await readFile(file, 'utf8')
  for (const line of source.split('\n')) {
    if (isCommentLine(line)) continue
    for (const [, prefix, icon] of line.matchAll(CANDIDATE)) {
      if (!candidates.has(prefix)) candidates.set(prefix, new Set())
      candidates.get(prefix).add(icon)
    }
  }
}

say(`Scanned ${files.length} files in ${roots.join(', ')}`)

const collectionList = await fetchJson('https://api.iconify.design/collections')
const known = [...candidates].filter(([prefix]) => prefix in collectionList)

if (!known.length) {
  console.error('octans-icons: no Iconify names found — nothing to bundle.')
  process.exit(1)
}

const collections = []
const skipped = []
for (const [prefix, icons] of known.sort()) {
  const names = [...icons].sort()
  const data = await fetchJson(
    `https://api.iconify.design/${prefix}.json?icons=${names.join(',')}`
  )
  // A miss is not fatal here: the candidate pattern is greedy by design, so an
  // unknown name is as likely to be a false positive as a typo. Those keep
  // working through the API, so warn and carry on rather than break a build.
  for (const name of names) {
    if (!data.icons?.[name]) skipped.push(`${prefix}:${name}`)
  }
  if (data.icons && Object.keys(data.icons).length) {
    collections.push(data)
    say(`  ${prefix}: ${Object.keys(data.icons).sort().join(', ')}`)
  }
}

const total = collections.reduce((n, c) => n + Object.keys(c.icons).length, 0)
if (skipped.length) {
  console.warn(
    `\noctans-icons: not in Iconify, left to resolve at runtime — ${skipped.join(', ')}`
  )
}

if (dryRun) {
  say(`\n${total} icons found. Nothing written (--dry-run).`)
  process.exit(0)
}

const isTs = extname(outFile) === '.ts'
const contents = `// GENERATED by \`npx octans-icons\` — do not edit by hand.
//
// Iconify data for every icon name found in this project's source, so they
// render instantly and offline instead of being fetched from the Iconify API.
// Import this once at startup, before anything renders.
//
// Re-run \`npx octans-icons\` after adding an icon.
import { addCollection } from '@octans/ui'

const collections = ${JSON.stringify(collections, null, 2)}

collections.forEach((collection) => addCollection(collection${isTs ? ' as any' : ''}))
`

await writeFile(outFile, contents)
say(
  `\nWrote ${relative(process.cwd(), outFile)} — ${total} icons in ` +
    `${collections.length} collection(s).\n\nImport it once at startup:\n` +
    `  import './${relative(dirname(outFile), outFile).replace(/\.(ts|js)$/, '')}'`
)
