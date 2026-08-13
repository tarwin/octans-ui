### With simple items

```vue
<template>
  <ActionList
    :items="[
      { label: 'Action1', onAction: click, tooltip: 'I am a tooltip!' },
      { label: 'Action2', onAction: click }
    ]"
  >
    <Button dropdown>Acquired Date</Button>
  </ActionList>
</template>

<script>
export default {
  methods: {
    click() {
      console.log('clicked action')
    }
  }
}
</script>
```

### With icons

```vue
<template>
  <ActionList
    :items="[
      {
        label: 'Action1',
        disabled: true,
        url: 'https://www.google.com/',
        external: false,
        type: 'primary',
        icon: 'fa fa-plus',
        onAction: click
      },
      {
        label: 'Action2',
        icon: 'fas fa-arrow-right',
        onAction: click
      }
    ]"
  >
    <Button dropdown>Acquired Date</Button>
  </ActionList>
</template>

<script>
export default {
  methods: {
    click() {
      console.log('clicked action')
    }
  }
}
</script>
```

### With urls

```vue
<template>
  <ActionList
    :items="[
      {
        label: 'Example',
        url: 'https://example.com',
        onAction: click
      },
      {
        label: 'Example [external]',
        url: 'https://example.com',
        external: true,
        onAction: click
      },
      {
        label: 'Example [disabled]',
        url: 'https://example.com',
        disabled: true,
        onAction: click
      }
    ]"
  >
    <Button dropdown>Links</Button>
  </ActionList>
</template>

<script>
export default {
  methods: {
    click() {
      console.log('clicked action')
    }
  }
}
</script>
```

### With help text

```vue
<template>
  <ActionList
    :items="[
      {
        label: 'Duplicate',
        helpText:
          'Duplicates the exhibition including all works and wall labels.'
      },
      {
        label: 'Close exhibition',
        helpText: 'Removes the exhibition from the public schedule.'
      },
      {
        label: 'Close exhibition [link]',
        helpText: 'Removes the exhibition from the public schedule.',
        url: 'https://example.com'
      }
    ]"
  >
    <Button dropdown>Options</Button>
  </ActionList>
</template>
```

### With sections

```vue
<template>
  <ActionList
    :sections="[
      {
        title: 'Section 1',
        items: [{ label: 'Action1' }, { label: 'Action2' }]
      },
      {
        title: 'Section 2',
        items: [{ label: 'Action1' }, { label: 'Action2' }]
      }
    ]"
  >
    <Button dropdown>Acquired Date</Button>
  </ActionList>
</template>
```

### With subitems

```vue
<template>
  <ActionList
    :items="[
      {
        label: 'Action1'
      },
      {
        label: 'Action2',
        items: [{ label: 'SubAction1' }, { label: 'SubAction2' }]
      },
      {
        label: 'Action3'
      }
    ]"
  >
    <Button dropdown>Acquired Date</Button>
  </ActionList>
</template>
```

### In button group

```vue
<template>
  <ButtonGroup segmented>
    <ActionList :items="[{ label: 'Action1' }, { label: 'Action2' }]">
      <Button dropdown>Acquired Date</Button>
    </ActionList>
    <ActionList :items="[{ label: 'Action1' }, { label: 'Action2' }]">
      <Button dropdown>Acquired Date</Button>
    </ActionList>
  </ButtonGroup>
</template>
```

### Inline without a trigger

```vue
<template>
  <div>
    <ActionList
      :items="[{ label: 'Action1' }, { label: 'Action2', disabled: true }]"
    />
    <ActionList
      :sections="[
        {
          title: 'Section 1',
          items: [{ label: 'Action1' }, { label: 'Action2' }]
        },
        {
          title: 'Section 2',
          items: [{ label: 'Action1' }, { label: 'Action2' }]
        }
      ]"
    />
    <ActionList
      :items="[
        {
          label: 'Action1'
        },
        {
          label: 'Action2',
          items: [{ label: 'SubAction1' }, { label: 'SubAction2' }]
        },
        {
          label: 'Action2',
          sections: [
            {
              title: 'Sub Section',
              items: [{ label: 'SubAction1' }, { label: 'SubAction2' }]
            }
          ]
        }
      ]"
    />
  </div>
</template>
```
