<script lang="ts">
import {
  defineComponent,
  h,
  mergeProps,
  useCssModule,
  type PropType
} from 'vue'
import { capitalize } from '../../utils'
import StackItem from './StackItem.vue'

type StackAlignmentType =
  'leading' | 'trailing' | 'center' | 'fill' | 'baseline'

type StackDistributionType =
  'equalSpacing' | 'leading' | 'trailing' | 'center' | 'fill' | 'fillEvenly'

type StackSpacingType = 'extraTight' | 'tight' | 'loose' | 'extraLoose' | 'none'

export default defineComponent({
  name: 'Stack',
  inheritAttrs: false,
  setup(props, context) {
    return () => {
      const styles = useCssModule()
      return h(
        'div',
        mergeProps(context.attrs, {
          class: [
            'UIElement',
            styles.Stack,
            props.alignment &&
              styles['alignment' + capitalize(props.alignment)],
            props.distribution &&
              styles['distribution' + capitalize(props.distribution)],
            props.spacing && styles['spacing' + capitalize(props.spacing)],
            props.vertical && styles.vertical,
            !props.wrap && styles.noWrap
          ],
          style:
            props.gap !== undefined
              ? {
                  gap:
                    typeof props.gap === 'number' ? `${props.gap}px` : props.gap
                }
              : undefined
        }),
        {
          default: () => {
            const children = context.slots.default && context.slots.default()
            if (!children) return
            const updatedChildren = children.map((child: any) => {
              if (child.type !== StackItem) {
                return h(StackItem, null, { default: () => child })
              }
            })
            return updatedChildren
          }
        }
      )
    }
  },
  props: {
    /**
     * Aligns items along the stack's cross axis.
     *
     * - leading
     * - trailing
     * - center
     * - fill
     * - baseline
     */
    alignment: {
      type: String as PropType<StackAlignmentType>
      // validator(value:string) {
      //   return alignmentProps.indexOf(value) >= 0
      // }
    },
    /**
     * Aligns items along the stack's main axis.
     *
     * - equalSpacing
     * - leading
     * - trailing
     * - center
     * - fill
     * - fillEvenly
     */
    distribution: {
      type: String as PropType<StackDistributionType>
      // validator(value:string) {
      //   return distributionProp.indexOf(value) >= 0
      // }
    },
    /**
     * The margin to add between items.
     *
     * - extraTight
     * - tight
     * - loose
     * - extraLoose
     * - none
     */
    spacing: {
      type: String as PropType<StackSpacingType>
      // validator(value:string) {
      //   return spacingProp.indexOf(value) >= 0
      // }
    },
    /**
     * An exact gap between items — a number of pixels or any CSS length —
     * when none of the `spacing` presets fits. Wins over `spacing`.
     */
    gap: {
      type: [Number, String]
    },
    /**
     * Flip the main axis so that items are rendered vertically.
     */
    vertical: {
      type: Boolean,
      default: false
    },
    /**
     * Prevent items from wrapping when there is limited space.
     */
    wrap: {
      type: Boolean,
      default: true
    }
  }
})
</script>

<style lang="scss" module>
@import './Stack.module.scss';
</style>
