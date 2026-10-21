import i18n from '@/i18n'
import { ApiError } from '@/api/client'
import { toast } from './toast'

export function ok(message?: string) {
  toast.success(message ?? i18n.t('saved'))
}

export function fail(error: unknown) {
  const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : String(error)
  toast.error(message)
}
