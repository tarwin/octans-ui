import UI from './lib'

export {}

declare module 'vue' {
  export interface ComponentCustomProperties {
    $ui: typeof UI
  }
}
