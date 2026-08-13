```js
<Button>Default</Button>
<Button disabled tooltip="I am disabled!">Default</Button>
<Button icon="fa fa-plus">Default</Button>
<Button type="primary">Primary</Button>
<Button type="primary" disabled>Primary</Button>
<Button type="primary" invert>Primary</Button>
<Button type="primary" invert disabled>Primary</Button>
<Button type="secondary">Secondary</Button>
<Button type="secondary" disabled>Secondary</Button>
<Button type="secondary" invert>Secondary</Button>
<Button type="secondary" invert disabled>Secondary</Button>
<Button type="destructive">Destructive</Button>
<Button type="destructive" invert>Destructive</Button>
<Button type="destructive" disabled>Destructive</Button>
<Button type="outline">Outline</Button>
<Button type="outline" disabled>Outline</Button>
<Button type="plain">Plain</Button>
<Button type="plain" disabled>Plain</Button>
<Button type="plain" icon="fa fa-times-circle"></Button>
<Button dropdown>Dropdown</Button>
```

### Icons

`icon` takes a Font Awesome class string or an Iconify name — they're told
apart by the `:`.

```js
<Button icon="fa fa-plus">Font Awesome</Button>
<Button icon="mdi:plus">Iconify</Button>
<Button icon="not:mdi:bell">Negated with a not: prefix</Button>
```

### Badges

A status is drawn as a small glyph on the button's icon; text is drawn as a
pill on the top-right corner. The object form gives full control.

```js
<Button icon="mdi:cloud-sync" badge="warning">Status</Button>
<Button icon="mdi:bell" badge="3">Count</Button>
<Button icon="mdi:bell" badge="12" badge-status="error">Coloured count</Button>
<Button icon="mdi:server" :badge="{ text: 'beta', color: '#46417d' }">Object</Button>
```

### Sizes

```vue
<template>
  <div>
    <Button size="small">Small</Button>
    <Button size="medium">Medium</Button>
    <Button size="large">Large</Button>
  </div>
</template>
```

### Simple tooltips

```vue
<template>
  <div>
    <Button
      tooltip="I'm on the top!"
      tooltip-position="top"
      >Top</Button
    >
    <Button
      tooltip="I'm on the right!"
      tooltip-position="right"
      >Right</Button
    >
    <Button
      tooltip="I'm on the bottom!"
      tooltip-position="bottom"
      >Bottom</Button
    >
    <Button
      tooltip="I'm on the left!"
      tooltip-position="left"
      >Left</Button
    >
    <br /><br />
    <Button
      tooltip="This is a test to show what really long tooltip text looks like!"
      >Really long tooltip</Button
    >
  </div>
</template>
```

### Full-width

```vue
<template>
  <Button fullWidth>Hello</Button>
</template>
```

### Button as a link

```vue
<template>
  <div>
    <Button @click="log('click normal')">A normal button</Button>
    <Button
      @click="log('click link')"
      url="https://example.com"
      >A link</Button
    >
    <Button
      @click="log('click external link')"
      url="https://example.com"
      external
      >An external link</Button
    >
    <Button
      @click="log('click disabled link')"
      url="https://example.com"
      disabled
      >A disabled link</Button
    >
    <Button
      @click="log('click disabled')"
      disabled
      >A disabled button</Button
    >
  </div>
</template>

<script>
export default {
  methods: {
    log() {
      console.log(...arguments)
    }
  }
}
</script>
```
