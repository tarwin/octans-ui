import { Button } from '@/components/Button'
import { Card, CardSection } from '@/components/Card'
import { FormLayout } from '@/components/FormLayout'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import FileInput from './FileInput.vue'
import { debugFileObject } from './utils'

const meta = {
  title: 'Components/Forms/FileInput',
  component: FileInput,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof FileInput>

export default meta
type Story = StoryObj<typeof meta>

/**
- By default only a single file is allowed.
- An error message is shown if a user attempts to drop multiple files.
- Like native file input controls, the model value of this component is always
  an array regardless of whether `multiple` is allowed.
- For single inputs, the drop zone is hidden after a file is chosen.
 */
export const SingleFile: Story = {
  render: () => ({
    components: { FileInput },
    setup() {
      const files = ref([])
      return { files, debugFileObject }
    },
    template: `
      <FileInput
        label="Product image"
        v-model="files"
      />
      <pre>files: {{debugFileObject(files)}}</pre>
    `
  })
}

/**
- Add the `multiple` to allow multiple files to be chosen.
- The drop zone is always visible.
 */
export const MultipleFiles: Story = {
  render: () => ({
    components: { FileInput },
    setup() {
      const files = ref([])
      return { files, debugFileObject }
    },
    template: `
      <FileInput
        label="Product image"
        v-model="files"
        multiple
      />
      <pre>files: {{debugFileObject(files)}}</pre>
    `
  })
}

/**
## Accept only image files less than 100 kB
- Use `accept` to specify a list of valid mime types.
- Use `max-bytes` to specify the maximum bytes and individual file can be.
- Non-compliant files will show an error.
 */
export const FileSize: Story = {
  render: () => ({
    components: { FileInput },
    setup() {
      const files = ref([])
      return { files, debugFileObject }
    },
    template: `
      <FileInput
        label="Images"
        help-text="Images must be less than 100 kB."
        v-model="files"
        multiple
        accept="image/*"
        :max-bytes="100000"
      />
      <pre>files: {{debugFileObject(files)}}</pre>
    `
  })
}

/**
- Use a custom validator when `accept` and `max-bytes` are not enough.
- Validators should return an error.
  - All truthy results will be considered an error.
  - If the result is a string, it will be used as the error message.
- Validators can return promises.
 */
export const CustomValidator: Story = {
  render: () => ({
    components: { FileInput },
    setup() {
      const files = ref([])
      const validator = (file: File) => {
        return new Promise((resolve) => {
          console.log('validating: ' + file.name)
          setTimeout(() => resolve('File is too filey'), 6000)
        })
      }
      return { files, validator, debugFileObject }
    },
    template: `
      <FileInput
        label="Custom validator"
        v-model="files"
        multiple
        :validator="validator"
      />
      <pre>files: {{debugFileObject(files)}}</pre>
    `
  })
}

export const Uploading: Story = {
  render: () => ({
    components: { FileInput, Button },
    setup() {
      const files = ref([] as File[])
      const upload = () => {
        fetch('https://hookb.in/pzGwoL7VEmHXNNqwabZd', {
          method: 'POST',
          headers: {
            'Content-Type': files.value[0].type
          },
          body: files.value[0]
        })
      }
      return { files, upload, debugFileObject }
    },
    template: `
      <FileInput
        label="Choose file"
        v-model="files"
      />
      <br>
      <Button
        @click="upload"
        :disabled="!files.length"
      >Upload</Button>
      <pre>files: {{debugFileObject(files)}}</pre>
    `
  })
}

export const InACard: Story = {
  render: () => ({
    components: { FileInput, Card, CardSection, FormLayout },
    setup() {
      const input1 = ref([
        {
          name: 'image.png',
          type: 'image/png',
          lastModified: Date.now(),
          size: 234344
        }
      ])
      const input2 = ref([
        {
          name: 'image.png',
          type: 'image/png',
          lastModified: Date.now(),
          size: 234344
        },
        {
          name: 'document.txt',
          type: 'text/plain',
          lastModified: Date.now() - 86400000,
          error: 'File must be less than 100 MB.',
          size: 4389
        }
      ])
      return { input1, input2, debugFileObject }
    },
    template: `
      <Card title="Card title">
        <CardSection>
          <FormLayout>
            <FileInput
              label="Single file drop zone"
              help-text="Accepted file types: .doc"
              v-model="input1"
            />
            <FileInput
              label="Multiple file drop zone"
              help-text="Accepted file types: .doc"
              v-model="input2"
              multiple
            />
          </FormLayout>
        </CardSection>
        <CardSection>
          <pre>input1: {{debugFileObject(input1)}}</pre>
          <pre>input2: {{debugFileObject(input2)}}</pre>
        </CardSection>
      </Card>
    `
  })
}
