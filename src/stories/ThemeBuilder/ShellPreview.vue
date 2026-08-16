<script lang="ts" setup>
/**
 * The application shell, previewed under the theme being edited.
 *
 * The card sampler next to this covers the tokens that appear inside a page.
 * The shell has its own, and nothing else on the page shows them:
 * `--octans-surface-nav` and `--octans-text-on-nav` (the bar's own chrome
 * colours, which do not follow the app surface), the sidebar's border and
 * selected-item treatment, and `--octans-surface-app` behind the content —
 * which a page-level preview paints over.
 *
 * Fixed height rather than the `100vh` the AppFrame stories use: this is one
 * block inside a scrolling editor, and the frame is a grid of
 * `auto 1fr` rows that needs a height from its container to resolve at all.
 *
 * Items carry `active` instead of relying on route matching, because the
 * builder has no router and matching would leave every item unselected —
 * which is exactly the state a theme author needs to see.
 */
import { AppFrame } from '@/components/AppFrame'
import { Card, CardSection } from '@/components/Card'
import { GlobalNav } from '@/components/GlobalNav'
import { Navigation, type NavigationSectionType } from '@/components/Navigation'
import { Page } from '@/components/Page'

const sections: NavigationSectionType[] = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'mdi:chart-line',
        active: true
      },
      { id: 'exhibitions', label: 'Exhibitions', icon: 'mdi:bullhorn' },
      { id: 'artists', label: 'Artists', icon: 'mdi:account-group' }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    items: [
      { id: 'account', label: 'Account', icon: 'mdi:cog' },
      { id: 'billing', label: 'Billing', icon: 'mdi:credit-card-outline' }
    ]
  }
]
</script>

<template>
  <AppFrame :class="$style.Shell">
    <template #topbar>
      <GlobalNav title="Dashboard" />
    </template>
    <template #sidebar>
      <Navigation
        :sections="sections"
        :logo="false"
        highlight
      />
    </template>

    <Page title="Dashboard">
      <Card title="Overview">
        <CardSection>
          The bar and sidebar draw in their own chrome colours, so they keep
          their contrast whichever way the rest of the theme goes.
        </CardSection>
      </Card>
    </Page>
  </AppFrame>
</template>

<style lang="scss" module>
.Shell {
  // Sits below the card sampler, which ends flush with its last column.
  margin-top: 16px;
  height: 380px;
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-box);
  // The frame's grid already clips its own children; this keeps the rounded
  // corners from being painted over by the bar and sidebar inside it.
  overflow: hidden;
}
</style>
