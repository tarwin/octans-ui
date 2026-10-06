<script setup lang="ts">
// Test fixture: compiled-template fields with static labels around a v-if,
// the shape that used to show the wrong labels once the v-if toggled.
import { defineComponent, h, ref } from 'vue'
import FormLayout from './FormLayout.vue'

const Field = defineComponent({
  props: { label: String, value: String },
  setup: (props) => () =>
    h('label', { 'data-field': '' }, `${props.label}: ${props.value}`)
})

const showConnection = ref(false)
const first = ref('David')
const last = ref('Ogburn')
defineExpose({ showConnection })
</script>

<template>
  <FormLayout>
    <div
      v-if="showConnection"
      data-connection
    >
      Connection
    </div>
    <Field
      label="Type"
      value="Contact"
    />
    <Field
      label="First Name"
      :value="first"
    />
    <Field
      label="Last Name"
      :value="last"
    />
  </FormLayout>
</template>
