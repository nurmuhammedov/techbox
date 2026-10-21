import { ImageOff } from 'lucide-react'
import { useState, type ImgHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export function Picture({ src, className, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [broken, setBroken] = useState(false)
  if (!src) return null
  if (broken) {
    return (
      <span className={cn('flex items-center justify-center bg-sunken text-ink-3/60', className)}>
        <ImageOff className="size-1/2 max-h-6 max-w-6" />
      </span>
    )
  }
  return <img src={src} alt="" onError={() => setBroken(true)} className={className} {...rest} />
}
