// Entry for the UMD/CDN build only.
//
// Re-export ONLY the default export so the UMD global `UI` IS the plugin object
// directly — `window.UI.install`, `window.UI.toast`, `window.UI.components`,
// etc. This matches the Vue2 build (webpack `libraryExport: 'default'`) and
// avoids the `.default` indirection you get when an entry mixes named + default
// exports. npm consumers keep using src/lib.ts (named + default) via dist/ui.js.
export { default } from './lib'
