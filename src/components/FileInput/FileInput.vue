<script lang="ts">
import { Icon } from '@/components/Icon'
import { Labelled } from '@/components/Labelled'
import { Spinner } from '@/components/Spinner'
import { format } from '@/utils/format'
import { defineComponent, type PropType } from 'vue'
import DropZone from './DropZone.vue'
import ItemList from './ItemList.vue'
import { claimPageDrop, releasePageDrop } from './pageDrop'
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
    Icon,
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
     * Marks the field as required, drawing an asterisk after the label.
     *
     * Unlike the other form controls this sets no `aria-required`: the
     * `<input type="file">` is visually hidden and so is not in the
     * accessibility tree, and the drop zone is a plain region rather than a
     * control that could carry it.
     */
    required: {
      type: Boolean,
      default: false
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
    },
    /**
     * Makes the WHOLE PAGE a drop target, not just the zone — dropping a file
     * anywhere on the window adds it here, and an overlay says so while a
     * drag is in progress. The zone stays where it is and keeps working.
     *
     * There is only one page, so only one input can have it: if a second one
     * sets this, the first to mount keeps the page and the second warns and
     * falls back to its own zone.
     */
    dropOnPage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isValidating: false,
      isDraggingOnPage: false
    }
  },
  mounted() {
    this.syncPageDrop()
  },
  beforeUnmount() {
    releasePageDrop(this)
  },
  watch: {
    // Readonly and full both mean the input cannot take another file, and a
    // page-wide target that silently drops what you give it is worse than no
    // target at all — so the claim is released rather than held and ignored.
    canAcceptFiles: {
      handler() {
        this.syncPageDrop()
      }
    }
  },
  computed: {
    canAcceptFiles(): boolean {
      return (
        this.dropOnPage &&
        !this.readonly &&
        (this.multiple || !this.modelValue.length)
      )
    },
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
    },
    syncPageDrop() {
      if (!this.canAcceptFiles) {
        this.isDraggingOnPage = false
        releasePageDrop(this)
        return
      }
      const claimed = claimPageDrop(this, {
        onDragChange: (dragging: boolean) => {
          this.isDraggingOnPage = dragging
        },
        onDrop: (files: FileList) => {
          this.appendFiles(files)
        }
      })
      if (!claimed) this.isDraggingOnPage = false
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
    :required="required"
  >
    <!--
      Forwarded rather than left to the props alone: a label often needs a
      control beside it, and help text is often rich copy. Both are guarded,
      because `Labelled` prefers a slot that merely EXISTS over the matching
      prop — forwarding unconditionally would blank out `label` and
      `help-text` for every caller that uses them as props.
    -->
    <template
      v-if="$slots.label"
      #label="labelProps"
    >
      <slot
        name="label"
        v-bind="labelProps"
      ></slot>
    </template>
    <template
      v-if="$slots.helpText"
      #helpText
    >
      <slot name="helpText"></slot>
    </template>
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
    <!--
      Teleported: the overlay covers the WINDOW, and a `position: fixed`
      element is trapped inside the nearest ancestor with a transform, filter
      or containment — of which an app shell has several.
    -->
    <Teleport to="body">
      <div
        v-if="isDraggingOnPage"
        :class="['UIElement', $style.PageOverlay]"
      >
        <div :class="$style.PageOverlay_message">
          <Icon
            icon="mdi:file-upload-outline"
            style="margin-right: 8px"
          />
          {{ $t('ui.fileInput.dropHere') }}
        </div>
      </div>
    </Teleport>
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

// `dropOnPage`, while a file is over the window.
.PageOverlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: color-mix(in srgb, var(--octans-surface) 82%, transparent);
  // The overlay is a SIGN, not a target: the listeners are on `window`, so
  // letting the pointer through means the drag events keep coming from the
  // real elements underneath and the enter/leave counting stays honest.
  pointer-events: none;
}

.PageOverlay_message {
  display: flex;
  align-items: center;
  padding: 24px 32px;
  border: 2px dashed var(--octans-primary);
  border-radius: var(--octans-radius-box);
  background: var(--octans-surface);
  color: var(--octans-text-primary);
  font-size: 18px;
}
</style>
