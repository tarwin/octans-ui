<script lang="ts">
import { Labelled } from '@/components/Labelled'
import { Spinner } from '@/components/Spinner'
import { format } from '@/utils/format'
import { defineComponent, type PropType } from 'vue'
import DropZone from './DropZone.vue'
import ItemList from './ItemList.vue'
import {
  createAcceptFileMatcher,
  getMimeTypeInfo,
  type FileInputFileItemType
} from './utils'

import { $t } from '@/utils/translate'

export default defineComponent({
  name: 'FileInput',
  components: {
    DropZone,
    ItemList,
    Labelled,
    Spinner
  },
  props: {
    modelValue: {
      type: Array as PropType<FileInputFileItemType[]>,
      default: () => []
    },
    /**
     * Label to display above the input.
     */
    label: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Error text to display beneath the input.
     */
    error: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Additional help text to display.
     */
    helpText: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders help text as raw HTML. Use with caution.
     */
    helpTextHtml: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders a help icon next to the label which links to an external page.
     */
    helpLink: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * A string that defines the file types the file input should accept.
     *
     * This string is a comma-separated list of [unique file type specifiers](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers).
     */
    accept: {
      type: String,
      default: ''
    },
    /**
     * Maximum individual file size allowed in bytes.
     */
    maxBytes: {
      type: Number,
      default: Infinity
    },
    /**
     * Allow multiple files to be uploaded.
     */
    multiple: {
      type: Boolean,
      default: false
    },
    /**
     * Custom file validator which should return a custom error.
     *
     * - All truthy results will be considered an error. If the result is
     *  a string, it will be used as the error message.
     * - Supports promises.
     */
    validator: {
      type: Function
    },
    /**
     * Renders the file list in readonly mode without remove buttons or dropzone.
     */
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isValidating: false
    }
  },
  computed: {
    acceptFn() {
      return createAcceptFileMatcher(this.accept)
    },
    items() {
      return this.modelValue.map((file) => {
        return {
          name: file.name,
          size: file.size,
          // error: file.error,
          lastModified: file.lastModified,
          // A file with no MIME type gets the same fallback as an unrecognised
          // one, rather than a bare name that is not an icon at all.
          icon: getMimeTypeInfo(file.type || '').icon,
          type: file.type
        } as FileInputFileItemType
      })
    }
  },
  methods: {
    $t,
    openDialog(_event: MouseEvent) {
      ;(this.$refs.input as HTMLElement)?.click()
    },
    emitChange(files: FileInputFileItemType[]) {
      /**
       * An array of native `File` instances which is emitted when the the user
       * adds or removes files.
       *
       * **Note**: An additional `error` property is added to File instances which
       * is equal to any error message shown in the component.
       * @event update:modelValue
       * @property {File[]} files Current files in the list.
       */
      this.$emit('update:modelValue', files)
    },
    removeItemAt(index: number) {
      const files = this.modelValue.slice(0)
      files.splice(index, 1)
      this.emitChange(files)
    },
    async appendFiles(fileList: FileList) {
      const validator = this.validator || (() => undefined)
      const showProcessingTimeout = setTimeout(
        () => (this.isValidating = true),
        100
      )
      const files = await Promise.all(
        Array.from(fileList).map((_file: File) => {
          const file = _file as unknown as FileInputFileItemType
          return Promise.resolve(validator(file)).then((result) => {
            if (result) {
              file.error =
                typeof result === 'string'
                  ? result
                  : this.$t('ui.fileInput.invalidFile')
            }
            if (!file.error && !this.acceptFn(file)) {
              file.error = this.$t('ui.fileInput.invalidFileType')
            }
            if (!file.error && file.size > this.maxBytes) {
              const size = format(this.maxBytes, 'filesize')
              file.error = this.$t('ui.fileInput.mustBeLessThan', { size })
            }
            return Object.freeze(file)
          })
        })
      )
      clearTimeout(showProcessingTimeout)
      this.isValidating = false
      if (files.length) {
        if (this.multiple) {
          this.emitChange([...this.modelValue, ...files])
        } else {
          this.emitChange([files[0]])
        }
      }
      // Clear the input so changes can be detected later
      const inp = this.$refs.input as HTMLInputElement
      if (inp) inp.value = ''
    },
    onChangeFiles() {
      const files = (this.$refs.input as HTMLInputElement)?.files
      if (!files) return
      this.appendFiles(files)
    },
    onDropZoneDrop(fileList: FileList) {
      this.appendFiles(fileList)
    }
  }
})
</script>

<template>
  <Labelled
    :label="label"
    :error="error"
    :help-text="helpText"
    :help-text-html="helpTextHtml"
    :help-link="helpLink"
  >
    <div :class="['UIElement', $style.FileInput]">
      <input
        type="file"
        ref="input"
        :accept="accept"
        :multiple="multiple"
        @change="onChangeFiles"
      />
      <ItemList
        v-if="items.length"
        :items="items"
        :readonly="readonly"
        style="margin-bottom: 8px"
        @remove="removeItemAt"
      />
      <div
        :class="$style.Validation"
        v-if="isValidating"
      >
        <Spinner size="small" />
        <span style="padding-left: 10px">
          {{ $t('ui.fileInput.validatingFiles') }}
        </span>
      </div>
      <DropZone
        v-else-if="(multiple || !items.length) && !readonly"
        :multiple="multiple"
        @click="openDialog"
        @drop="onDropZoneDrop"
      />
    </div>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.FileInput {
  input[type='file'] {
    position: absolute;
    visibility: hidden;
  }
}

.Validation {
  display: flex;
  align-items: center;
  padding: 12px 12px;
  background: var(--octans-surface-app);
  border-radius: var(--octans-radius-field);
}
</style>
