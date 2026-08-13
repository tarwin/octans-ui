<script lang="ts">
import { ActionList } from '@/components/ActionList'
import { Button, ButtonGroup, ButtonGroupItem } from '@/components/Button'
import { defineComponent, type PropType } from 'vue'
import { $t } from '@/utils/translate'

export default defineComponent({
  methods: { $t },
  components: {
    ActionList,
    Button,
    ButtonGroup,
    ButtonGroupItem
  },
  props: {
    filters: {
      type: Array,
      default: () => []
    },
    shortcuts: {
      type: Array as () => { label: string; items: any[] }[],
      default: () => []
    },
    mode: {
      type: String as PropType<'single' | 'multi'>,
      default: 'multi'
    }
  }
})
</script>

<template>
  <ButtonGroup
    segmented
    fill
  >
    <ActionList
      v-for="(list, index) in shortcuts"
      :key="index"
      :items="list.items"
    >
      <Button dropdown>{{ list.label }}</Button>
    </ActionList>
    <ButtonGroupItem
      v-if="mode === 'multi'"
      style="margin-left: auto"
    >
      <Button
        v-if="filters.length"
        icon="mdi:format-list-checks"
        @click="$emit('open')"
      >
        {{ $t('ui.filters.moreFilters') }}
      </Button>
    </ButtonGroupItem>
  </ButtonGroup>
</template>
