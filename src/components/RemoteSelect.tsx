import { MultiSelect, Select, SelectProps } from '@mantine/core'
import { useMemo } from 'react'
import { useList } from '@/lib/queries'

type Row = Record<string, unknown> & { id: number }

interface Props extends Omit<SelectProps, 'data' | 'value' | 'onChange'> {
  url: string
  labelOf?: (row: Row) => string
  value: number | null | undefined
  onChange: (value: number | null, row?: Row) => void
  rowFilter?: (row: Row) => boolean
  params?: Record<string, string | number | boolean | undefined>
}

function unwrap(data: unknown): Row[] {
  if (Array.isArray(data)) return data as Row[]
  if (data && typeof data === 'object' && 'results' in data) return (data as { results: Row[] }).results
  return []
}

export function RemoteSelect({ url, labelOf, value, onChange, rowFilter, params, ...rest }: Props) {
  const query = useList<Row>(url, { page_size: 500, ...params })
  const rows = useMemo(() => unwrap(query.data).filter((r) => (rowFilter ? rowFilter(r) : true)), [query.data, rowFilter])
  const label = labelOf ?? ((r: Row) => String(r.name ?? r.company ?? r.full_name ?? r.id))
  return (
    <Select
      searchable
      clearable
      nothingFoundMessage="—"
      {...rest}
      data={rows.map((r) => ({ value: String(r.id), label: label(r) }))}
      value={value ? String(value) : null}
      onChange={(v) => onChange(v ? Number(v) : null, rows.find((r) => String(r.id) === v))}
    />
  )
}

interface MultiProps extends Omit<Props, 'value' | 'onChange'> {
  value: number[]
  onChange: (value: number[]) => void
}

export function RemoteMultiSelect({ url, labelOf, value, onChange, params, label, placeholder, error }: MultiProps) {
  const query = useList<Row>(url, { page_size: 500, ...params })
  const rows = unwrap(query.data)
  const toLabel = labelOf ?? ((r: Row) => String(r.name ?? r.id))
  return (
    <MultiSelect
      searchable
      label={label}
      placeholder={placeholder}
      error={error}
      data={rows.map((r) => ({ value: String(r.id), label: toLabel(r) }))}
      value={value.map(String)}
      onChange={(v) => onChange(v.map(Number))}
    />
  )
}

export function useRows<T = Row>(url: string, params?: Record<string, string | number | boolean | undefined>) {
  const query = useList<T>(url, { page_size: 500, ...params })
  return unwrap(query.data) as unknown as T[]
}
