export interface ThumbnailProps {
  /**
   * Title of the thumbnail, having the highest visual priority.
   */
  title?: string
  /**
   * Subtitle of the thumbnail, having a secondary visual priority.
   */
  subtitle?: string
  /**
   * Thumbnail image URL.
   */
  url?: string
  /**
   * The `alt` attribute to provide to the underlying `img` element.
   */
  alt?: string
  /**
   * The size of the thumbnail:
   *
   *   - extraSmall
   *   - small
   *   - medium
   *   - large
   *   - extraLarge
   */
  size?: 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge'
  /**
   * Removes the border around the thumbnail image.
   */
  noBorder?: boolean
}
