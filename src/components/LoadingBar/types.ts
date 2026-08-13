export interface LoadingBarProps {
  /**
   * Pin the bar to the top of the viewport rather than the top of its nearest
   * positioned ancestor. This is what the auto-mounted bar uses; set it when
   * placing your own bar outside any chrome.
   *
   * @default false
   */
  fixed?: boolean
  /**
   * Thickness of the bar — a number of pixels, or any CSS length.
   *
   * @default 4
   */
  height?: number | string
}
