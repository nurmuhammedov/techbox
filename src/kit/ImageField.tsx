import { ImagePlus, RefreshCw, Trash2, ZoomIn } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'
import { Button } from '@/ui/button'
import { Dialog } from '@/ui/dialog'

const MAX_MB = 8

interface Props {
  id?: string
  /** URL of the picture already saved, if any. */
  current?: string | null
  /** A new file chosen here, or null when the picture is to be removed, or undefined when untouched. */
  value: File | null | undefined
  onChange: (file: File | null | undefined) => void
  invalid?: boolean
  className?: string
}

/**
 * A picture: dropped or chosen, shown at once, replaced or removed. Big files and non-images are refused
 * before anything is sent.
 */
export function ImageField({ id, current, value, onChange, invalid, className }: Props) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    if (!value) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(value)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [value])

  const shown = value === null ? null : (preview ?? current ?? null)

  const take = (file: File | undefined) => {
    setError('')
    if (!file) return
    if (!file.type.startsWith('image/')) return setError(t('image.not_image'))
    if (file.size > MAX_MB * 1024 * 1024) return setError(t('image.too_big', { mb: MAX_MB }))
    onChange(file)
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(e) => {
          take(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {shown ? (
        <div className="group relative flex h-40 items-center justify-center overflow-hidden rounded-lg border border-line bg-sunken">
          <img src={shown} alt="" className="max-h-full max-w-full object-contain p-2" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <Button size="sm" onClick={() => setZoom(true)}>
              <ZoomIn />
              {t('image.view')}
            </Button>
            <Button size="sm" onClick={() => input.current?.click()}>
              <RefreshCw />
              {t('image.replace')}
            </Button>
            <Button size="sm" variant="danger" onClick={() => onChange(current ? null : undefined)}>
              <Trash2 />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            take(e.dataTransfer.files?.[0])
          }}
          onPaste={(e) => take(e.clipboardData.files?.[0])}
          aria-invalid={invalid || undefined}
          className={cn(
            'flex h-40 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-ink-3 transition-colors',
            over ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line-strong hover:border-accent hover:bg-sunken',
            invalid && 'border-bad',
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-sunken">
            <ImagePlus className="size-5" />
          </span>
          <span className="text-[13px] font-medium text-ink-2">{t('image.drop')}</span>
          <span className="text-xs">{t('image.hint', { mb: MAX_MB })}</span>
        </button>
      )}
      {error ? <p className="text-xs text-bad">{error}</p> : null}
      {zoom && shown ? (
        <Dialog open onClose={() => setZoom(false)} title={t('image.view')} size="lg">
          <img src={shown} alt="" className="mx-auto max-h-[70vh] object-contain" />
        </Dialog>
      ) : null}
    </div>
  )
}
