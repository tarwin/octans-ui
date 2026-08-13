import { createWildcardRegExp } from '@/utils'

export type FileInputFileItemType = {
  name: string
  size: number
  error?: string
  lastModified: number
  icon: string
  type?: string
}

export function getMimeTypeInfo(mimeType: string) {
  if (/image/.test(mimeType)) {
    return {
      mimeType,
      type: 'image',
      icon: 'mdi:file-image-outline'
    }
  }
  if (/video/.test(mimeType)) {
    return {
      mimeType,
      type: 'video',
      icon: 'mdi:file-video-outline'
    }
  }
  if (/audio/.test(mimeType)) {
    return {
      mimeType,
      type: 'audio',
      icon: 'mdi:file-music-outline'
    }
  }
  if (/text\/csv/.test(mimeType)) {
    return {
      mimeType,
      type: 'csv',
      icon: 'mdi:file-delimited-outline'
    }
  }
  if (/spreadsheet/.test(mimeType)) {
    return {
      mimeType,
      type: 'spreadsheet',
      icon: 'mdi:file-table-outline'
    }
  }
  if (/application\/(zip|x-gzip)/.test(mimeType)) {
    return {
      mimeType,
      type: 'archive',
      icon: 'mdi:folder-zip-outline'
    }
  }
  if (/text\/plain/.test(mimeType)) {
    return {
      mimeType,
      type: 'text',
      icon: 'mdi:file-document-outline'
    }
  }
  if (/application\/.*(msword|wordprocessingml)/.test(mimeType)) {
    return {
      mimeType,
      type: 'text',
      icon: 'mdi:file-word-outline'
    }
  }
  if (/presentation/.test(mimeType)) {
    return {
      mimeType,
      type: 'text',
      icon: 'mdi:file-powerpoint-outline'
    }
  }
  if (/application\/pdf/.test(mimeType)) {
    return {
      mimeType,
      type: 'text',
      icon: 'mdi:file-pdf-box'
    }
  }
  return {
    mimeType,
    type: 'other',
    icon: 'mdi:file-outline'
  }
}

export function createAcceptFileMatcher(accept: string) {
  const matchers = accept
    .trim()
    .split(/\s*,+\s*/)
    .filter((d) => d.trim())
    .map((specifier) => {
      // File extension match e.g. `.ext`
      const extensionMatch = /^\.(.+)/.exec(specifier)
      if (extensionMatch) {
        const extRE = /\.([^.]+)$/
        return function (file: FileInputFileItemType) {
          const match = extRE.exec(file.name)
          return match && match[1] === extensionMatch[1]
        }
      }
      // MIME type match e.g. `image/*`
      const typeRE = createWildcardRegExp(specifier)
      return function (file: FileInputFileItemType) {
        return typeRE.test(file.type!)
      }
    })
  return function (file: FileInputFileItemType) {
    return !matchers.length || matchers.some((fn) => fn(file))
  }
}

// Debug method which extracts common File object properties so they can be
// stringified in demo output.
export function debugFileObject(file: File): any {
  if (!file) {
    return file
  }
  if (Array.isArray(file)) {
    return file.map((f) => debugFileObject(f))
  }
  return [
    'name',
    'size',
    'type',
    'lastModified',
    'lastModifiedDate',
    'error'
  ].reduce((obj, prop) => {
    // @ts-expect-error indexing `File` by a string key it cannot narrow
    obj[prop] = file[prop]
    return obj
  }, {} as any)
}
