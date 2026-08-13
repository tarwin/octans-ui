/**
 * A structural stand-in for vue-router's `RouteLocationRaw`.
 *
 * Declared locally on purpose: `vue-router` is an *optional* peer dependency,
 * so importing its types here would put an unresolvable import in the published
 * `.d.ts` and break typechecking for consumers who don't use a router. This
 * shape is assignable from a real `RouteLocationRaw`.
 */
export type RouteLocationType =
  | string
  | ({
      path?: string
      name?: string | symbol
      params?: Record<string, any>
      query?: Record<string, any>
      hash?: string
      replace?: boolean
      /** Forces the link to be treated as external. */
      external?: boolean
    } & Record<string, any>)

export interface MaybeRouterLinkProps {
  /**
   * The target location of the route. See https://router.vuejs.org/api/#to
   * for usage.
   * TODO:
   * // Location type?
   */
  to?: RouteLocationType
  /**
   * Render the link as another tag type, e.g. `<div>`.
   */
  tag?: string
  /**
   * Enables custom rendering of the link and prevents the default output
   * which wraps the slot content with `tag`.
   */
  custom?: boolean
  /**
   * Allows matching only using the path section of the url, effectively
   * ignoring the query and the hash sections.
   */
  exactPath?: boolean
  /**
   * Removes the defaylt link styling of `<a>` tags.
   */
  plain?: boolean
  /**
   * Set to `false` to disable route-based matching to determine active states.
   */
  matchRoutes?: boolean
}
