import { useTranslation } from 'react-i18next'

import type { ItemShape, Shape } from '@/api/types'
import { cn } from '@/lib/cn'

import { Box3D } from './Box3D'
import { BoxBlank } from './BoxBlank'
import { PartsDrawing, SheetDrawing } from './SimpleSheets'

type AnyShape = (Partial<Shape> & { kind: Shape['kind'] }) | ItemShape

/**
 * Everything an operator needs to see about one item: the box in 3D, its blank with the score sizes,
 * and how it is split; or the sheet; or the pallet piece.
 */
export function ShapeView({
  shape,
  quantity = 0,
  logo,
  compact,
  className,
}: {
  shape: AnyShape
  quantity?: number
  logo?: string | null
  compact?: boolean
  className?: string
}) {
  const { t } = useTranslation()
  if (shape.kind === 'pallet') {
    return <SheetDrawing width={shape.width ?? null} length={shape.length ?? null} hatched title={t('item.kind.pallet')} className={cn('max-w-md', className)} />
  }
  if (shape.kind === 'sheet') {
    return <SheetDrawing width={shape.sheet_width ?? null} length={shape.sheet_length ?? null} title={t('product.kind.sheet')} className={cn('max-w-md', className)} />
  }
  const size = {
    length: shape.length ?? null,
    width: shape.width ?? null,
    height: shape.height ?? null,
    joint: shape.joint ?? null,
    l0: shape.l0,
    l1: shape.l1,
    l2: shape.l2,
    l3: shape.l3,
    l4: shape.l4,
    l5: shape.l5,
  }
  const parts = 'parts' in shape ? shape.parts : 1
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className={cn('grid items-center gap-4', compact ? 'grid-cols-1' : 'sm:grid-cols-[180px_minmax(0,1fr)]')}>
        {!compact ? <Box3D length={size.length} width={size.width} height={size.height} logo={logo} className="max-w-[180px]" /> : null}
        <BoxBlank size={size} />
      </div>
      {parts > 1 ? <PartsDrawing size={size} parts={parts} quantity={quantity} /> : null}
    </div>
  )
}
