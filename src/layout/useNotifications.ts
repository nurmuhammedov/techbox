import { useQuery } from '@tanstack/react-query'
import { api, Page } from '@/api/client'
import type { Notification } from '@/api/types'

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => api.get<Page<Notification> & { unread: number }>('/notifications/', { page, page_size: 20 }),
    refetchInterval: 120000,
  })
}
