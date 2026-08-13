import type { PopperPlacementType } from '@/components/Popper'
import type { PopoverContentProps } from 'reka-ui'

export function getRadixPopperPlacement(placement: PopperPlacementType | ''): {
  side: PopoverContentProps['side']
  align: PopoverContentProps['align']
} {
  let align: PopoverContentProps['align'] = 'start'
  if (placement.includes('-start')) {
    align = 'start'
  } else if (placement.includes('-end')) {
    align = 'end'
  } else if (placement) {
    align = 'center'
  }

  let side: PopoverContentProps['side'] = 'bottom'
  if (placement.includes('top')) {
    side = 'top'
  } else if (placement.includes('right')) {
    side = 'right'
  } else if (placement.includes('bottom')) {
    side = 'bottom'
  } else if (placement.includes('left')) {
    side = 'left'
  }
  return {
    align,
    side
  }
}
