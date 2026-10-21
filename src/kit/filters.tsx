import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useOptions } from '@/kit/fields'
import { useListState } from '@/kit/list-state'
import { FilterCombo, FilterDates, FilterSelect } from '@/ui/column-filters'

type Row = Record<string, unknown>

export type FilterSpec =
  | { kind: 'remote'; param: string; url: string; label: (row: Row) => string; params?: Record<string, string | number> }
  | { kind: 'select'; param: string; options: { value: string; label: string }[] }
  | { kind: 'dates'; from: string; to: string }

function RemoteFilter({ url, params, label, value, onChange }: { url: string; params?: Record<string, string | number>; label: (row: Row) => string; value: string | undefined; onChange: (v: string | undefined) => void }) {
  const rows = (useOptions(url, params).data ?? []) as Row[]
  return <FilterCombo value={value ?? null} onChange={(v) => onChange(v ?? undefined)} options={rows.map((r) => ({ value: String(r.id), label: label(r) }))} />
}

/**
 * Filters kept in the address, so a filtered list can be shared or reloaded: gives the request
 * parameters and the controls shown under the column headers, keyed by column id.
 */
export function useUrlFilters(specs: Record<string, FilterSpec>) {
  const { t } = useTranslation()
  const state = useListState()
  const params: Record<string, string | undefined> = {}
  const filters: Record<string, ReactNode> = {}
  for (const [column, spec] of Object.entries(specs)) {
    if (spec.kind === 'dates') {
      const from = state.filter(spec.from)
      const to = state.filter(spec.to)
      params[spec.from] = from
      params[spec.to] = to
      filters[column] = <FilterDates from={from} to={to} onChange={(r) => state.set({ [spec.from]: r.from, [spec.to]: r.to })} />
      continue
    }
    const value = state.filter(spec.param)
    params[spec.param] = value
    filters[column] =
      spec.kind === 'remote' ? (
        <RemoteFilter url={spec.url} params={spec.params} label={spec.label} value={value} onChange={(v) => state.set({ [spec.param]: v })} />
      ) : (
        <FilterSelect value={value ?? 'all'} onChange={(v) => state.set({ [spec.param]: v === 'all' ? undefined : v })} options={[{ value: 'all', label: t('all') }, ...spec.options]} />
      )
  }
  return { params, filters }
}
