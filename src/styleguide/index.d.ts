// needed so ComponentCustomProperties not overwritten?
// https://vuejs.org/guide/typescript/options-api.html#augmenting-global-properties
export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    /**
     * Available on any component that exposes it via `methods: { $t }`, and on
     * every component once the library is installed with `app.use(Octans)`.
     */
    $t: (key: string, args?: Record<string, any>) => string
  }
}
