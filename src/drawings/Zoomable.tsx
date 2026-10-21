import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'
import { Button } from '@/ui/button'
import { Dialog } from '@/ui/dialog'

const STEPS = [1, 1.5, 2, 3]

/**
 * A drawing with a button that opens it big, to read small sizes on the shop floor.
 * `large` draws the same thing again without its on-screen height limit.
 */
export function Zoomable({ title, children, large }: { title: string; children: ReactNode; large?: ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  return (
    <div className="group relative">
      {children}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute top-0 right-0 inline-flex h-7 items-center gap-1 rounded-md border border-line bg-surface/90 px-2 text-xs text-ink-2 shadow-card backdrop-blur transition-colors hover:border-accent hover:text-accent"
      >
        <Maximize2 className="size-3.5" />
        {t('drawing.zoom')}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} size="xl">
        <div className="mb-3 flex items-center justify-end gap-1.5">
          <Button size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} aria-label={t('drawing.zoom_out')}><ZoomOut /></Button>
          <span className="tabular w-12 text-center text-xs text-ink-2">{Math.round(STEPS[step] * 100)}%</span>
          <Button size="sm" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1} aria-label={t('drawing.zoom_in')}><ZoomIn /></Button>
        </div>
        <div className="overflow-auto">
          <div className={cn('mx-auto')} style={{ width: `${STEPS[step] * 100}%` }}>
            {large ?? children}
          </div>
        </div>
      </Dialog>
    </div>
  )
}
