import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Page } from './index'

const ACTIONS = [{ label: 'Duplicate' }, { label: 'Archive' }]

function mountPage(options: Record<string, any> = {}) {
  return mount(Page, options)
}

/**
 * Every slot on `Page` falls back to the markup it replaced, so adding them
 * changed nothing for anyone who does not use them. These assertions are that
 * promise, slot by slot: the fallback still renders, and the override wins.
 */
describe('Page slots', () => {
  it('falls back to the built-in header', () => {
    const wrapper = mountPage({ props: { title: 'Orders' } })
    expect(wrapper.text()).toContain('Orders')
  })

  it('replaces the whole header', () => {
    const wrapper = mountPage({
      props: { title: 'Orders', subtitle: 'All of them' },
      slots: { header: '<h1>Mine</h1>' }
    })
    expect(wrapper.text()).toContain('Mine')
    expect(wrapper.text()).not.toContain('Orders')
    expect(wrapper.text()).not.toContain('All of them')
  })

  it('replaces just the title, keeping the badge beside it', () => {
    const wrapper = mountPage({
      props: { title: 'Orders', badge: { label: 'Draft' } },
      slots: { title: '<em>Custom</em>' }
    })
    expect(wrapper.text()).toContain('Custom')
    expect(wrapper.text()).not.toContain('Orders')
    expect(wrapper.text()).toContain('Draft')
  })

  it('hands the title and subtitle props to their slots', () => {
    const wrapper = mountPage({
      props: { title: 'Orders', subtitle: 'All of them' },
      slots: {
        title: '<template #default="{ title }">[{{ title }}]</template>',
        subtitle:
          '<template #default="{ subtitle }">({{ subtitle }})</template>'
      }
    })
    expect(wrapper.text()).toContain('[Orders]')
    expect(wrapper.text()).toContain('(All of them)')
  })

  it('renders a subtitle slot even with no subtitle prop', () => {
    // The wrapper is gated on the prop, so without this the slot would be
    // silently dropped on exactly the pages that need it most.
    const wrapper = mountPage({ slots: { subtitle: 'Custom' } })
    expect(wrapper.text()).toContain('Custom')
  })

  it('renders a breadcrumbs slot even with no breadcrumbs prop', () => {
    const wrapper = mountPage({ slots: { breadcrumbs: '<a>Back</a>' } })
    expect(wrapper.text()).toContain('Back')
  })

  it('keeps the built-in breadcrumbs when the slot is absent', () => {
    const wrapper = mountPage({
      props: { breadcrumbs: [{ label: 'Home', url: '/' }] }
    })
    expect(wrapper.text()).toContain('Home')
  })

  it('replaces the secondary actions', () => {
    const wrapper = mountPage({
      props: { secondaryActions: ACTIONS },
      slots: { secondaryActions: '<button>Only mine</button>' }
    })
    expect(wrapper.text()).toContain('Only mine')
    expect(wrapper.text()).not.toContain('Duplicate')
  })

  it('hands the actions to the slot that replaces them', () => {
    const wrapper = mountPage({
      props: { secondaryActions: ACTIONS },
      slots: {
        secondaryActions:
          '<template #default="{ actions }">{{ actions.length }} actions</template>'
      }
    })
    expect(wrapper.text()).toContain('2 actions')
  })

  it('replaces the collapsed action menu separately', () => {
    // It is hidden until the page is narrow, so it is easy to override the
    // visible actions and leave this one still showing the props.
    const wrapper = mountPage({
      props: { secondaryActions: ACTIONS },
      slots: { collapsedActions: '<button>Menu</button>' }
    })
    expect(wrapper.text()).toContain('Menu')
  })

  it('replaces the help affordance, and draws none by default', () => {
    expect(mountPage({ props: { title: 'X' } }).findAll('svg')).toHaveLength(0)
    const wrapper = mountPage({
      props: { title: 'X', includeHelp: true },
      slots: { help: '<button>Help</button>' }
    })
    expect(wrapper.text()).toContain('Help')
    expect(wrapper.findAll('svg')).toHaveLength(0)
  })

  it('replaces the loader, and only while loading', () => {
    expect(
      mountPage({ slots: { loader: '<p>Wait</p>' } }).text()
    ).not.toContain('Wait')
    const wrapper = mountPage({
      props: { loading: true },
      slots: { loader: '<p>Wait</p>' }
    })
    expect(wrapper.text()).toContain('Wait')
  })
})

/**
 * A source assertion rather than a rendered one: jsdom does not resolve custom
 * properties, so the only place the wiring is observable is the stylesheet
 * itself. The risk being guarded against is someone reaching for a literal
 * again — which renders identically today and takes the knob away.
 */
describe('Page theming', () => {
  const style = readFileSync(
    resolve(process.cwd(), 'src/components/Page/Page.vue'),
    'utf8'
  ).split('<style')[1]

  const tokens = readFileSync(
    resolve(process.cwd(), 'src/styles/global.scss'),
    'utf8'
  )

  const MEASUREMENTS = [
    ['margin-top', '--octans-page-margin-top'],
    ['padding-top', '--octans-page-loader-offset'],
    ['font-size', '--octans-page-title-size'],
    ['font-weight', '--octans-page-title-weight'],
    ['font-size', '--octans-page-subtitle-size'],
    ['margin-left', '--octans-page-badge-gap'],
    ['margin-left', '--octans-page-action-gap'],
    ['margin-bottom', '--octans-page-title-gap'],
    ['margin-bottom', '--octans-page-breadcrumb-gap'],
    ['margin-top', '--octans-page-content-gap']
  ] as const

  it.each(MEASUREMENTS)('reads %s from %s', (property, token) => {
    expect(style).toContain(`${property}: var(${token})`)
    expect(tokens).toContain(`${token}:`)
  })

  it('leaves the container query as a literal', () => {
    // A container query condition cannot read a custom property — the browser
    // resolves it before custom properties exist. Tokenising it would compile
    // fine and silently never match.
    expect(style).toContain('@container octans-page (max-width: 960px)')
  })
})
