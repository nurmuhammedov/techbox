import { notifications } from '@mantine/notifications'
import i18n from '@/i18n'
import { ApiError } from '@/api/client'

export function ok(message?: string) {
  notifications.show({ color: 'teal', message: message ?? i18n.t('saved') })
}

export function fail(error: unknown) {
  const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : String(error)
  notifications.show({ color: 'red', title: i18n.t('error'), message })
}
