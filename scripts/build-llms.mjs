// Publishes the documentation as plain markdown, plus the /llms.txt index that
// points at it (https://llmstxt.org).
//
// Why this exists: Storybook is a single-page app. `?path=…` is a QUERY, so
// every docs URL returns the same ~8KB manager shell with none of the page's
// text in it. An llms.txt pointing at `octans.dev/storybook/?path=/docs/…`
// would hand a crawler nothing at all. So the same sources Storybook renders
// are also written out as flat markdown under /llms/, and llms.txt links
// those — same domain, same deploy, no dependency on a GitHub branch name.
//
// The MDX → markdown conversion below is deliberately small and syntactic. It
// is not an MDX parser and does not need to be: these five files use a handful
// of constructs, listed in STRIP_TAGS. If a doc grows something this cannot
// handle, the fix is to teach this file about it, not to reach for a
// general-purpose transform.

import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'site-dist')
const llmsDir = join(out, 'llms')

const SITE = 'https://octans.dev'

/**
 * Components rendered by the docs that have no meaning as text.
 *
 * `Canvas` is a live story embed and `Meta` is Storybook page config; both
 * become nothing. The rest are the small helpers the MDX files define for
 * themselves (tabbed code, a translations table), whose CONTENT we keep and
 * whose wrapper we drop.
 */
const STRIP_TAGS = [
  'Meta',
  'Canvas',
  'CodeTabs',
  'TranslationTable',
  'CopyableJson'
]

/** Everything that gets published, in the order llms.txt lists it. */
const DOCS = [
  {
    file: 'llms/quick-start.md',
    title: 'Quick start',
    source: 'src/stories/QuickStart.mdx',
    note: 'Install, UiProvider setup, theming, icons and i18n'
  },
  {
    file: 'llms/design-tokens.md',
    title: 'Design tokens',
    source: 'src/stories/Tokens.mdx',
    note: 'The three-tier token system and every semantic token'
  },
  {
    file: 'llms/color-system.md',
    title: 'Colour system',
    source: 'docs/color-system.md',
    note: 'How the ramps, roles and dark theme are derived'
  },
  {
    file: 'llms/global-ui.md',
    title: 'Global UI ($ui)',
    source: 'src/stories/GlobalUI.mdx',
    note: 'Toasts, modals, the loader overlay and the save bar'
  },
  {
    file: 'llms/translations.md',
    title: 'Translations',
    source: 'src/stories/Translations.mdx',
    note: 'Registering dictionaries and switching locale'
  },
  {
    file: 'llms/overview.md',
    title: 'Overview',
    source: 'README.md',
    note: 'What the library is, and the project layout'
  },
  {
    file: 'llms/agent-skill.md',
    title: 'Agent skill',
    source: 'skills/octans-ui/SKILL.md',
    note:
      'The same guidance packaged as an Agent Skill, including the ' +
      'inheritance traps that break dark mode'
  }
]

/** Strips MDX down to the markdown underneath it. */
export function mdxToMarkdown(source) {
  const lines = source.split('\n')
  const kept = []
  let inFence = false
  let skipDepth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // A fence toggles verbatim mode. Everything inside is sample code — the
    // Vue examples are full of `<Button>` and `import`, which the rules below
    // would happily destroy.
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      kept.push(line)
      continue
    }
    if (inFence) {
      kept.push(line)
      continue
    }

    // Inside a multi-line `export const …` we are discarding: count brackets
    // until the declaration closes.
    if (skipDepth > 0) {
      skipDepth += bracketDepth(line)
      continue
    }

    if (/^import\s/.test(line)) continue

    // Both `=> {` and `=> (` are used as the body, so braces alone are not
    // enough to find the end — parentheses count too.
    if (/^export\s+(const|function|default)\s/.test(line)) {
      skipDepth = bracketDepth(line)
      if (skipDepth <= 0) skipDepth = 1
      continue
    }

    // `{/* … */}`. Scanned for its literal terminator rather than counted:
    // the prose inside is free to contain unbalanced brackets, and counting
    // them is how this swallowed entire documents during development.
    if (/^\s*\{\/\*/.test(line)) {
      if (!/\*\/\}/.test(line)) {
        while (i + 1 < lines.length && !/\*\/\}/.test(lines[i])) i++
      }
      continue
    }

    // Capitalised components from STRIP_TAGS, plus the decorative `<img>` the
    // Quick Start opens with — it carries a JSX `style={{…}}` that means
    // nothing as text, and it is `aria-hidden` anyway.
    const tag = line.match(/^\s*<\/?([A-Z][A-Za-z0-9]*|img)\b/)
    if (tag && (STRIP_TAGS.includes(tag[1]) || tag[1] === 'img')) {
      // Multi-line opening tag: swallow to the `>` that ends it.
      if (!/\/?>\s*$/.test(line)) {
        while (i + 1 < lines.length && !/\/?>\s*$/.test(lines[i])) i++
      }
      continue
    }

    kept.push(line)
  }

  return collapseBlankRuns(kept.join('\n')).trim() + '\n'
}

/** Net opening minus closing brackets on a line. Naive about strings. */
function bracketDepth(line) {
  let depth = 0
  for (const ch of line) {
    if (ch === '{' || ch === '(' || ch === '[') depth++
    else if (ch === '}' || ch === ')' || ch === ']') depth--
  }
  return depth
}

function collapseBlankRuns(text) {
  return text.replace(/\n{3,}/g, '\n\n')
}

/**
 * A flat list of every component, grouped the way the sidebar groups them.
 *
 * Generated rather than written by hand so it cannot drift from the barrel
 * file that decides what the package actually exports.
 */
async function componentsDoc() {
  const barrel = await readFile(join(root, 'src/components/all.ts'), 'utf8')
  const names = [...barrel.matchAll(/^export \* from '\.\/([A-Za-z0-9]+)'/gm)]
    .map((m) => m[1])
    .sort()

  const withDocs = []
  for (const name of names) {
    try {
      const files = await readdir(join(root, 'src/components', name))
      if (files.includes(`${name}.md`)) withDocs.push(name)
    } catch {
      // A barrel entry with no directory of its own — nothing to note.
    }
  }

  return [
    '# Components',
    '',
    `${names.length} components are exported from \`@octans/ui\`. Every one has`,
    `a page with props and live examples at ${SITE}/storybook/.`,
    '',
    ...names.map((n) => `- \`${n}\``),
    '',
    '## Longer notes',
    '',
    'These have prose docs in the repository under `src/components/<name>/`:',
    '',
    ...withDocs.map((n) => `- \`${n}\` — \`src/components/${n}/${n}.md\``),
    ''
  ].join('\n')
}

function llmsIndex(published) {
  const groups = {
    Documentation: published.filter((d) => d.file !== 'llms/components.md'),
    Reference: published.filter((d) => d.file === 'llms/components.md')
  }

  const lines = [
    '# Octans UI',
    '',
    '> An opinionated Vue 3 component library: accessible, themeable UI ' +
      'primitives and the application shell pieces (nav, frame, sheets, ' +
      'toasts) that usually get rebuilt from scratch in every project.',
    '',
    'Everything below is plain markdown. The component browser at ' +
      `${SITE}/storybook/ is a single-page app, so fetching one of its ` +
      '`?path=` URLs returns the shell rather than the page — read these ' +
      'files instead, and use Storybook for live examples.',
    ''
  ]

  for (const [heading, docs] of Object.entries(groups)) {
    if (!docs.length) continue
    lines.push(`## ${heading}`, '')
    for (const doc of docs) {
      lines.push(`- [${doc.title}](${SITE}/${doc.file}): ${doc.note}`)
    }
    lines.push('')
  }

  lines.push(
    '## Optional',
    '',
    `- [Storybook](${SITE}/storybook/): live component browser, prop tables ` +
      'and the interactive theme builder (renders with JavaScript)',
    '- [Source](https://github.com/tarwin/octans-ui): issues and pull ' +
      'requests welcome',
    ''
  )

  return lines.join('\n')
}

export async function buildLlms() {
  await rm(llmsDir, { recursive: true, force: true })
  await mkdir(llmsDir, { recursive: true })

  const published = []

  for (const doc of DOCS) {
    const from = join(root, doc.source)
    let text
    try {
      text = await readFile(from, 'utf8')
    } catch {
      // Fails loudly: a doc silently missing from llms.txt is worse than a
      // broken build, because nothing about the site looks wrong afterwards.
      console.error(`✗ ${doc.source} not found — llms.txt would link a 404.`)
      process.exit(1)
    }
    const markdown = doc.source.endsWith('.mdx') ? mdxToMarkdown(text) : text

    // The conversion above discards multi-line constructs, and a mistake in
    // where one ends silently eats the rest of the file. Every one of these
    // documents has headings and prose, so an output with neither means the
    // stripper ran away — fail rather than publish a file of bare code
    // fences that reads as though the doc were simply thin.
    const headings = (markdown.match(/^#{1,3} /gm) ?? []).length
    const prose = markdown
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[^A-Za-z]/g, '').length
    if (headings < 1 || prose < 400) {
      console.error(
        `✗ ${doc.source} converted to ${headings} heading(s) and ${prose} ` +
          'characters of prose — the MDX stripper has eaten the document.'
      )
      process.exit(1)
    }

    await writeFile(join(out, doc.file), markdown)
    published.push(doc)
  }

  const components = {
    file: 'llms/components.md',
    title: 'Component list',
    note: 'Every exported component, generated from the package barrel'
  }
  await writeFile(join(out, components.file), await componentsDoc())
  published.push(components)

  await writeFile(join(out, 'llms.txt'), llmsIndex(published))

  // The skill itself, served whole so it can be downloaded and dropped into
  // a `.claude/skills/` directory.
  await mkdir(join(out, 'skill'), { recursive: true })
  await cp(join(root, 'skills/octans-ui/SKILL.md'), join(out, 'skill/SKILL.md'))

  console.log(
    `✓ ${published.length} docs → ${relative(root, llmsDir)}/, indexed by llms.txt`
  )
}
