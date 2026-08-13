import { describe, expect, it } from 'vitest'
import { parseColor, relativeLuminance } from './color'
import {
  createGradient,
  INTERPOLATION_SPACES,
  type InterpolationSpace
} from './gradient'
import { rampColors, stepPositions } from './colorRamp'

const SPACES = INTERPOLATION_SPACES.map((s) => s.value)
const STEPS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const lightToDark = (space: InterpolationSpace = 'oklch') =>
  createGradient({
    space,
    stops: [
      { color: '#ffffff', position: 0 },
      { color: '#11151a', position: 100 }
    ]
  })

describe('stepPositions', () => {
  it('spaces steps by their number, not by their index', () => {
    // 500 is halfway along a 0–1000 ramp regardless of how many steps sit
    // either side of it. An index-based generator would place it at 2/3.
    expect(stepPositions([0, 100, 500, 1000])).toEqual([
      { step: 0, t: 0 },
      { step: 100, t: 0.1 },
      { step: 500, t: 0.5 },
      { step: 1000, t: 1 }
    ])
  })

  it('survives a ramp with no span to divide by', () => {
    expect(stepPositions([500])).toEqual([{ step: 500, t: 0 }])
    expect(stepPositions([500, 500])).toEqual([
      { step: 500, t: 0 },
      { step: 500, t: 0 }
    ])
    expect(stepPositions([])).toEqual([])
  })

  it('does not care what order the steps arrive in', () => {
    expect(stepPositions([1000, 0]).map((p) => p.t)).toEqual([1, 0])
  })
})

describe('rampColors', () => {
  it('pins the first and last steps to the ends of the gradient', () => {
    const ramp = rampColors(lightToDark(), STEPS)!
    expect(ramp[0]).toBe('#ffffff')
    expect(ramp[950]).toBe('#11151a')
  })

  it.each(SPACES)('gets monotonically darker in %s', (space) => {
    const ramp = rampColors(lightToDark(space), STEPS)!
    const lums = STEPS.map((s) => relativeLuminance(parseColor(ramp[s])!))
    for (let i = 1; i < lums.length; i++) {
      expect(lums[i]).toBeLessThan(lums[i - 1])
    }
  })

  it('samples the intermediate stops of a multi-stop gradient', () => {
    // The whole point of a gradient over two endpoints: a stop placed in the
    // middle has to actually show up in the ramp.
    const ramp = rampColors(
      createGradient({
        space: 'srgb',
        stops: [
          { color: '#000000', position: 0 },
          { color: '#ff0000', position: 50 },
          { color: '#ffffff', position: 100 }
        ]
      }),
      [0, 500, 1000]
    )!
    expect(ramp[500]).toBe('#ff0000')
  })

  it('writes the requested format', () => {
    const ramp = rampColors(lightToDark('srgb'), [0, 1000], 'oklch')!
    expect(ramp[0]).toMatch(/^oklch\(/)
  })

  it('carries alpha into the generated steps', () => {
    const ramp = rampColors(
      createGradient({
        space: 'srgb',
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#ff000000', position: 100 }
        ]
      }),
      [0, 500, 1000]
    )!
    expect(ramp[500]).toMatch(/^#ff0000[0-9a-f]{2}$/)
  })

  it('returns null rather than guessing at a stop it cannot parse', () => {
    expect(
      rampColors(
        createGradient({ stops: [{ color: 'nope', position: 0 }] }),
        STEPS
      )
    ).toBeNull()
  })

  it('survives a degenerate ramp', () => {
    expect(rampColors(lightToDark(), [])).toBeNull()
    expect(rampColors(lightToDark(), [500])).toEqual({ 500: '#ffffff' })
  })
})
