import { Eye } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'
import { Dialog } from '@/ui/dialog'

/** A small eye that opens a drawing in a window, for places with no room to show it in full. */
export function Peek({ title, children, label, className }: { title: string; children: ReactNode; label?: string; className?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        title={t('drawing.peek')}
        aria-label={`${t('drawing.peek')}: ${title}`}
        className={cn('inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-line px-1.5 text-xs text-ink-2 transition-colors hover:border-accent hover:text-accent', className)}
      >
        <Eye className="size-3.5" />
        {label}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} size="xl">
        {children}
      </Dialog>
    </>
  )
}
