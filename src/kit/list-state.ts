import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * A list's page, size, search, sort and filters live in the address, so a link or a reload
 * opens the same view and Back returns to it.
 */
export function useListState(defaults: { sort?: string; order?: 'asc' | 'desc'; size?: number } = {}) {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const size = Number(params.get('size') || defaults.size || 20)
  const search = params.get('q') ?? ''
  const sort = params.get('sort') ?? defaults.sort
  const order = (params.get('order') as 'asc' | 'desc' | null) ?? defaults.order ?? 'asc'

  const set = useCallback(
    (patch: Record<string, string | number | undefined | null>, keepPage = false) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === null || value === '') next.delete(key)
            else next.set(key, String(value))
          }
          if (!keepPage && !('page' in patch)) next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const filter = useCallback((key: string) => params.get(key) ?? undefined, [params])

  const query = useMemo(
    () => ({
      page,
      page_size: size,
      search: search || undefined,
      ordering: sort ? `${order === 'desc' ? '-' : ''}${sort}` : undefined,
    }),
    [page, size, search, sort, order],
  )

  return { page, size, search, sort, order, set, filter, query }
}
