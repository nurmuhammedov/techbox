import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { api, ApiError, type Page as ApiPage } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { fetchAll } from '@/lib/excel'
import { fail, ok } from '@/lib/notify'
import { keyOf } from '@/lib/queries'
import { Button } from '@/ui/button'
import { Menu } from '@/ui/controls'
import { DataTable } from '@/ui/data-table'
import { useConfirm } from '@/ui/dialog'
import { EmptyState, Skeleton } from '@/ui/feedback'
import { Form } from '@/ui/form'
import { Card, Page, SearchInput } from '@/ui/page'

import { FieldGrid, type FieldSpec } from './fields'
import { useListState } from './list-state'

type Row = { id: number }

// ───────────────────────────── List ─────────────────────────────

interface ResourceListProps<T extends Row> {
  title: string
  url: string
  columns: ColumnDef<T, unknown>[]
  /** Base path of the screens: `${base}/new` and `${base}/:id`. */
  base: string
  writePermission?: string | string[]
  deletable?: boolean
  params?: Record<string, string | number | boolean | undefined>
  filters?: Record<string, ReactNode>
  toolbar?: ReactNode
  actions?: ReactNode
  paginated?: boolean
  defaultSort?: string
  defaultOrder?: 'asc' | 'desc'
  onRowOpen?: (row: T) => void
  rowMenu?: (row: T) => { label: string; icon?: ReactNode; onSelect: () => void; tone?: 'danger' }[]
  addLabel?: string
  above?: ReactNode
  embedded?: boolean
}

export function ResourceList<T extends Row>({
  title,
  url,
  columns,
  base,
  writePermission,
  deletable = true,
  params,
  filters,
  toolbar,
  actions,
  paginated = true,
  defaultSort,
  defaultOrder,
  onRowOpen,
  rowMenu,
  addLabel,
  above,
  embedded,
}: ResourceListProps<T>) {
  const { t } = useTranslation()
  const { can } = useAuth()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const qc = useQueryClient()
  const state = useListState({ sort: defaultSort, order: defaultOrder })
  const writable = writePermission ? can(...[writePermission].flat()) : false
  const query = useQuery({
    queryKey: [keyOf(url), url, 'list', state.query, params],
    queryFn: () => api.get<ApiPage<T> | T[]>(url, { ...(paginated ? state.query : { search: state.query.search, ordering: state.query.ordering }), ...params }),
    placeholderData: (previous) => previous,
  })
  const rows = Array.isArray(query.data) ? query.data : query.data?.results
  const total = Array.isArray(query.data) ? query.data.length : (query.data?.count ?? 0)

  const remove = async (row: T) => {
    if (!(await confirm({ title: t('confirm.delete'), confirmLabel: t('delete'), tone: 'danger' }))) return
    try {
      await api.delete(`${url}/${row.id}`)
      ok(t('deleted'))
      await qc.invalidateQueries({ queryKey: [keyOf(url)] })
    } catch (e) {
      fail(e)
    }
  }

  const menuColumn: ColumnDef<T, unknown>[] =
    writable || rowMenu
      ? [
          {
            id: 'actions',
            header: '',
            meta: { fixed: true, className: 'w-px' },
            cell: ({ row }) => {
              const items = [
                ...(rowMenu?.(row.original) ?? []),
                ...(writable ? [{ label: t('edit'), icon: <Pencil />, onSelect: () => navigate(`${base}/${row.original.id}/edit`) }] : []),
                ...(writable && deletable
                  ? [{ label: t('delete'), icon: <Trash2 />, tone: 'danger' as const, onSelect: () => void remove(row.original) }]
                  : []),
              ]
              return items.length ? (
                <span onClick={(e) => e.stopPropagation()}>
                  <Menu
                    trigger={
                      <Button variant="ghost" size="iconSm" tabIndex={-1} aria-label={t('actions')}>
                        <MoreHorizontal />
                      </Button>
                    }
                    items={items}
                  />
                </span>
              ) : null
            },
          },
        ]
      : []

  const table = (
    <>
      {above}
      <DataTable
        columns={[...columns, ...menuColumn]}
        data={rows}
        loading={query.isFetching}
        rowId={(row) => String(row.id)}
        onRowOpen={onRowOpen ?? (writable ? (row) => navigate(`${base}/${row.id}/edit`) : undefined)}
        sort={state.sort}
        order={state.order}
        onSortChange={(sort, order) => state.set({ sort, order })}
        preferenceKey={url}
        toolbar={
          <>
            <SearchInput value={state.search} onChange={(q) => state.set({ q })} className="w-full sm:w-64" />
            {toolbar}
          </>
        }
        filters={filters}
        exportAs={{ fileName: t(title), rows: () => fetchAll<T>(url, { ...params, search: state.query.search, ordering: state.query.ordering }) }}
        pagination={
          paginated
            ? {
                page: state.page,
                size: state.size,
                total,
                onPageChange: (page) => state.set({ page }, true),
                onSizeChange: (size) => state.set({ size }),
              }
            : undefined
        }
        empty={<EmptyState icon={Plus} title={t('empty')} hint={writable ? t('empty_hint') : undefined} />}
      />
    </>
  )

  if (embedded) return table
  return (
    <Page
      title={t(title)}
      actions={
        <>
          {actions}
          {writable ? (
            <Button variant="primary" onClick={() => navigate(`${base}/new`)}>
              <Plus />
              {addLabel ? t(addLabel) : t('add')}
            </Button>
          ) : null}
        </>
      }
    >
      {table}
    </Page>
  )
}

// ───────────────────────────── Form ─────────────────────────────

export interface Section {
  title?: string
  fields: FieldSpec[]
}

function initialValues(sections: Section[], record: Record<string, unknown> | null, defaults: Record<string, unknown>) {
  const values: Record<string, unknown> = {}
  for (const spec of sections.flatMap((s) => s.fields)) {
    if (spec.type === 'image' || spec.type === 'file') values[spec.name] = undefined
    else if (spec.type === 'password') values[spec.name] = ''
    else values[spec.name] = record ? (record[spec.name] ?? null) : (defaults[spec.name] ?? (spec.type === 'switch' ? false : null))
  }
  return values
}

/** JSON normally; multipart when a file is attached. A removed file is sent as null in JSON. */
export function toPayload(specs: FieldSpec[], values: Record<string, unknown>) {
  const body: Record<string, unknown> = {}
  const files: Record<string, File> = {}
  for (const spec of specs) {
    const value = values[spec.name]
    if (spec.type === 'image' || spec.type === 'file') {
      if (value instanceof File) files[spec.name] = value
      else if (value === null) body[spec.name] = null
      continue
    }
    if (spec.type === 'password' && !value) continue
    body[spec.name] = value === '' ? null : value
  }
  if (!Object.keys(files).length) return body
  const form = new FormData()
  for (const [k, v] of Object.entries(body)) {
    if (v === null || v === undefined) continue
    if (Array.isArray(v)) v.forEach((x) => form.append(k, String(x)))
    else form.append(k, String(v))
  }
  for (const [k, f] of Object.entries(files)) form.append(k, f)
  return form
}

interface ResourceFormProps {
  title: string
  url: string
  sections: Section[]
  /** Where to go after saving or cancelling. */
  back: string
  defaults?: Record<string, unknown>
  /** Extra content beside the form (a drawing, a summary). */
  aside?: (values: Record<string, unknown>) => ReactNode
  validate?: (values: Record<string, unknown>) => Record<string, string>
  transform?: (payload: Record<string, unknown>) => Record<string, unknown>
}

/** A whole page for adding or editing one record: sections of fields, Save and Cancel at the bottom. */
export function ResourceForm({ title, url, sections, back, defaults = {}, aside, validate, transform }: ResourceFormProps) {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const editing = !!id && id !== 'new'
  const record = useQuery({
    queryKey: [keyOf(url), url, 'one', id],
    queryFn: () => api.get<Record<string, unknown>>(`${url}/${id}`),
    enabled: editing,
  })
  const [values, setValues] = useState<Record<string, unknown> | null>(editing ? null : initialValues(sections, null, defaults))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (editing && record.data && values === null) setValues(initialValues(sections, record.data, defaults))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.data])

  const specs = sections.flatMap((s) => s.fields)

  const submit = async () => {
    if (!values) return
    const missing: Record<string, string> = {}
    for (const spec of specs) {
      const v = values[spec.name]
      if (spec.required && !spec.hidden?.(values) && (v === null || v === undefined || v === '')) missing[spec.name] = t('required')
    }
    Object.assign(missing, validate?.(values) ?? {})
    setErrors(missing)
    if (Object.keys(missing).length) return
    setBusy(true)
    try {
      let payload = toPayload(specs, values)
      if (transform && !(payload instanceof FormData)) payload = transform(payload)
      if (editing) await api.patch(`${url}/${id}`, payload)
      else await api.post(url, payload)
      ok()
      await qc.invalidateQueries({ queryKey: [keyOf(url)] })
      navigate(back)
    } catch (e) {
      if (e instanceof ApiError && e.fields) setErrors(e.fields)
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  const heading = editing ? t('edit_of', { name: t(title) }) : t('new_of', { name: t(title) })
  return (
    <Page title={heading} flow width={aside ? 'full' : 'narrow'}>
      {!values ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <Form onSubmit={submit}>
          <div className={aside ? 'grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : 'flex flex-col gap-4'}>
            <div className="flex flex-col gap-4">
              {sections.map((section, i) => (
                <Card key={i} title={section.title ? t(section.title) : undefined}>
                  <FieldGrid
                    specs={section.fields}
                    values={values}
                    errors={errors}
                    record={record.data}
                    onChange={(name, value) => setValues((s) => ({ ...s!, [name]: value }))}
                  />
                </Card>
              ))}
            </div>
            {aside ? <div className="flex flex-col gap-4 lg:sticky lg:top-4">{aside(values)}</div> : null}
          </div>
          <FormFooter busy={busy} onCancel={() => navigate(back)} />
        </Form>
      )}
    </Page>
  )
}

export function FormFooter({ busy, onCancel, label }: { busy?: boolean; onCancel: () => void; label?: string }) {
  const { t } = useTranslation()
  return (
    <div className="sticky bottom-3 z-10 mt-2 flex items-center justify-between gap-2 rounded-lg border border-line bg-surface/95 px-3 py-2.5 shadow-float backdrop-blur">
      <Button variant="ghost" onClick={onCancel}>
        <ArrowLeft />
        {t('back')}
      </Button>
      <div className="flex gap-2">
        <Button onClick={onCancel}>{t('cancel')}</Button>
        <Button type="submit" variant="primary" loading={busy}>
          {label ?? t('save')}
        </Button>
      </div>
    </div>
  )
}
