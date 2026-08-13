### Banner

List of all banner types

```vue
<template>
  <div>
    <Banner title="Default"> How's things with you?</Banner>
    <br />
    <Banner
      title="Info"
      status="info"
      >How's things with you?</Banner
    >
    <br />
    <Banner
      title="Success"
      status="success"
    >
      How's things with you?
    </Banner>
    <br />
    <Banner
      title="Warning"
      status="warning"
    >
      How's things with you?
    </Banner>
    <br />
    <Banner
      title="Error"
      status="error"
    >
      How's things with you?
    </Banner>
    <br />
    <Banner
      title="New"
      status="new"
    >
      How's things with you?
    </Banner>
    <br />
  </div>
</template>
```

### Banner with close button

```vue
<template>
  <Banner
    v-if="visible"
    status="info"
    @close="visible = false"
    >How's things with you?</Banner
  >
</template>

<script>
export default {
  data() {
    return {
      visible: true
    }
  },
  watch: {
    visible(val) {
      if (val === false) {
        setTimeout(() => (this.visible = true), 2000)
      }
    }
  }
}
</script>
```

### Banner with no title and no icon

```vue
<template>
  <Banner :icon="false">How's things with you?</Banner>
</template>
```
