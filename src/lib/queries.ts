import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, Page } from '@/api/client'
import { fail, ok } from './notify'

type Params = Record<string, string | number | boolean | null | undefined | (string | number)[]>

export function keyOf(url: string) {
  const parts = url.split('/').filter(Boolean)
  const map: Record<string, string> = {
    'production/queue': 'queue',
    'production/board': 'board',
    'production/batches': 'batches',
    'production/items': 'items',
    'sales/orders': 'orders',
    'sales/sales': 'sales',
    'inventory/rolls': 'rolls',
    'inventory/stock': 'stock',
    'inventory/waste': 'waste',
  }
  const two = parts.slice(0, 2).join('/')
  return map[two] ?? two
}

export function useList<T>(url: string, params?: Params, enabled = true) {
  return useQuery({
    queryKey: [keyOf(url), url, params],
    queryFn: () => api.get<T[]>(url, params),
    enabled,
  })
}

export function usePage<T>(url: string, params?: Params, enabled = true) {
  return useQuery({
    queryKey: [keyOf(url), url, params],
    queryFn: () => api.get<Page<T>>(url, params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useOne<T>(url: string | null) {
  return useQuery({
    queryKey: [keyOf(url ?? ''), url],
    queryFn: () => api.get<T>(url!),
    enabled: !!url,
  })
}

export function useAction<TBody = unknown, TResult = unknown>(
  fn: (body: TBody) => Promise<TResult>,
  options: { success?: string | false; invalidate?: string[]; onSuccess?: (r: TResult) => void } = {},
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (result) => {
      if (options.success !== false) ok(options.success)
      for (const key of options.invalidate ?? []) void qc.invalidateQueries({ queryKey: [key] })
      options.onSuccess?.(result)
    },
    onError: fail,
  })
}
