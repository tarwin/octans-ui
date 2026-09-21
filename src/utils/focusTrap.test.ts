import { afterEach, describe, expect, it } from 'vitest'
import { tabbableWithin, trapTab } from './focusTrap'

let root: HTMLElement

const build = (html: string) => {
  root = document.createElement('div')
  root.tabIndex = -1
  root.innerHTML = html
  document.body.appendChild(root)
  return root
}

const tab = (shiftKey = false) => {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    cancelable: true
  })
  const handled = trapTab(event, root)
  return { handled, prevented: event.defaultPrevented }
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('tabbableWithin', () => {
  it('lists the controls Tab visits, in order', () => {
    build(`
      <div tabindex="-1">root-like</div>
      <button id="a">A</button>
      <input id="b" />
      <button id="c" disabled>C</button>
      <input id="d" type="hidden" />
      <a id="e" href="#">E</a>
      <span id="f" tabindex="0">F</span>
      <div hidden><button id="g">G</button></div>
    `)
    expect(tabbableWithin(root).map((el) => el.id)).toEqual([
      'a',
      'b',
      'e',
      'f'
    ])
  })
})

describe('trapTab', () => {
  it('wraps Tab from the last control round to the first', () => {
    build('<button id="a">A</button><button id="b">B</button>')
    root.querySelector<HTMLElement>('#b')!.focus()
    expect(tab()).toEqual({ handled: true, prevented: true })
    expect(document.activeElement?.id).toBe('a')
  })

  it('wraps Shift+Tab from the first control round to the last', () => {
    build('<button id="a">A</button><button id="b">B</button>')
    root.querySelector<HTMLElement>('#a')!.focus()
    expect(tab(true)).toEqual({ handled: true, prevented: true })
    expect(document.activeElement?.id).toBe('b')
  })

  it('leaves a Tab in the middle to the browser', () => {
    build(
      '<button id="a">A</button><button id="b">B</button><button id="c">C</button>'
    )
    root.querySelector<HTMLElement>('#b')!.focus()
    expect(tab()).toEqual({ handled: false, prevented: false })
  })

  it('goes to the last control on Shift+Tab from the root itself', () => {
    // The overlay is focused as a whole when it opens, so the first key a
    // keyboard user presses lands here.
    build('<button id="a">A</button><button id="b">B</button>')
    root.focus()
    expect(tab(true).handled).toBe(true)
    expect(document.activeElement?.id).toBe('b')
    expect(tab().handled).toBe(true)
    expect(document.activeElement?.id).toBe('a')
  })

  it('keeps focus on the root when there is nothing to go to', () => {
    build('<p>Just text</p>')
    root.focus()
    expect(tab().handled).toBe(true)
    expect(document.activeElement).toBe(root)
  })

  it('ignores keys other than Tab', () => {
    build('<button id="a">A</button>')
    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    expect(trapTab(event, root)).toBe(false)
  })
})
