import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Resolved from the project root, not `import.meta.url` — under the jsdom
// environment that is an http URL, not a file one.
const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8')

const reset = read('src/styles/reset.css')
const global = read('src/styles/global.scss')

/**
 * `reset.css` is opt-in, so nothing imports it and no story renders it. That
 * makes it the one stylesheet in the library that can drift without anything
 * going red — which is exactly what these assertions are for.
 *
 * The interesting one is the font size: `.UIElement` and the reset have to
 * agree, or app-authored markup renders a different size to the components
 * standing next to it. Nobody editing `global.scss` would think to check a
 * file that nothing imports.
 */
describe('reset.css', () => {
  it('matches the `.UIElement` font size', () => {
    const baseline = global.match(
      /\.UIElement\s*\{[\s\S]*?font-size:\s*(\S+?);/
    )
    expect(baseline, 'no font-size found on .UIElement').toBeTruthy()
    expect(reset).toContain(`font-size: ${baseline![1]};`)
  })

  it('is plain CSS — it is copied to dist/ without a compile step', () => {
    expect(reset).not.toMatch(/@use|@include|\$[a-z]/i)
  })

  it('gives every token it reads a literal fallback', () => {
    const vars = [...reset.matchAll(/var\(\s*(--octans-[a-z-]+)([^)]*)/g)]
    expect(vars.length).toBeGreaterThan(0)
    for (const [, name, rest] of vars) {
      expect(rest.trim().startsWith(','), `${name} has no fallback`).toBe(true)
    }
  })

  it('states the four things the user agent gets wrong for a full-page app', () => {
    expect(reset).toMatch(/box-sizing:\s*border-box/)
    expect(reset).toMatch(/body\s*\{[\s\S]*?margin:\s*0/)
    expect(reset).toMatch(/body\s*\{[\s\S]*?min-height:\s*100%/)
    expect(reset).toMatch(/font:\s*inherit/)
  })
})
