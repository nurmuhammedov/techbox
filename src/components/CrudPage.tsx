import {
  ActionIcon,
  Button,
  Drawer,
  FileInput,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core'
import { DateInput, DateTimePicker, TimeInput } from '@mantine/dates'
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { IconPencil, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { fail, ok } from '@/lib/notify'
import { keyOf, usePage } from '@/lib/queries'
import { useQueryClient } from '@tanstack/react-query'
import { Column, DataTable } from './DataTable'
import { PageHeader } from './PageHeader'
import { RemoteSelect } from './RemoteSelect'

export interface Field {
  name: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'date' | 'time' | 'datetime' | 'select' | 'remote' | 'switch' | 'file'
  options?: { value: string; label: string }[]
  url?: string
  params?: Record<string, string | number | boolean | undefined>
  labelOf?: (row: Record<string, unknown>) => string
  required?: boolean
  span?: number
  decimal?: boolean
  hidden?: (values: Record<string, unknown>) => boolean
}

interface Props<T> {
  title: string
  subtitle?: string
  url: string
  columns: Column<T>[]
  fields: Field[]
  writePermission: string | string[]
  defaults?: Record<string, unknown>
  params?: Record<string, string | number | boolean | undefined>
  filters?: ReactNode
  searchable?: boolean
  canDelete?: boolean
  paginated?: boolean
  rowActions?: (row: T) => ReactNode
  onRowClick?: (row: T) => void
  embedded?: boolean
  onEdit?: (row: T | 'new') => void
}

function toForm(fields: Field[], row: Record<string, unknown> | null, defaults: Record<string, unknown>) {
  const values: Record<string, unknown> = {}
  for (const f of fields) {
    const v = row ? row[f.name] : defaults[f.name]
    if (f.type === 'file') values[f.name] = null
    else if (f.type === 'date' || f.type === 'datetime') values[f.name] = v ? dayjs(v as string).toDate() : null
    else if (f.type === 'switch') values[f.name] = v ?? false
    else values[f.name] = v ?? (f.type === 'number' || f.type === 'remote' ? null : '')
  }
  return values
}

function toPayload(fields: Field[], values: Record<string, unknown>) {
  const hasFile = fields.some((f) => f.type === 'file' && values[f.name])
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    let v = values[f.name]
    if (f.type === 'file') {
      if (!v) continue
    } else if (f.type === 'date') v = v ? dayjs(v as Date).format('YYYY-MM-DD') : null
    else if (f.type === 'datetime') v = v ? dayjs(v as Date).toISOString() : null
    else if ((f.type === 'number' || f.type === 'remote') && (v === '' || v === undefined)) v = null
    else if (f.type === 'time' && v === '') v = null
    out[f.name] = v
  }
  if (!hasFile) return out
  const form = new FormData()
  for (const [k, v] of Object.entries(out)) {
    if (v === null || v === undefined) continue
    form.append(k, v instanceof File ? v : String(v))
  }
  return form
}

export function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: Field
  value: unknown
  onChange: (v: unknown) => void
  error?: string
}) {
  const { t } = useTranslation()
  const common = { label: t(field.label), required: field.required, error }
  switch (field.type) {
    case 'number':
      return (
        <NumberInput
          {...common}
          value={(value as number) ?? ''}
          onChange={(v) => onChange(v === '' ? null : v)}
          decimalScale={field.decimal ? 3 : 0}
          thousandSeparator=" "
          hideControls
        />
      )
    case 'textarea':
      return <Textarea {...common} autosize minRows={2} value={(value as string) ?? ''} onChange={(e) => onChange(e.currentTarget.value)} />
    case 'date':
      return <DateInput {...common} clearable valueFormat="DD.MM.YYYY" value={(value as Date) ?? null} onChange={onChange} />
    case 'datetime':
      return <DateTimePicker {...common} clearable valueFormat="DD.MM.YYYY HH:mm" value={(value as Date) ?? null} onChange={onChange} />
    case 'time':
      return <TimeInput {...common} value={((value as string) ?? '').slice(0, 5)} onChange={(e) => onChange(e.currentTarget.value)} />
    case 'select':
      return (
        <Select
          {...common}
          data={(field.options ?? []).map((o) => ({ value: o.value, label: t(o.label) }))}
          value={(value as string) ?? null}
          onChange={onChange}
        />
      )
    case 'remote':
      return <RemoteSelect {...common} url={field.url!} params={field.params} labelOf={field.labelOf as never} value={value as number} onChange={(v) => onChange(v)} />
    case 'switch':
      return <Switch mt="lg" label={t(field.label)} checked={!!value} onChange={(e) => onChange(e.currentTarget.checked)} />
    case 'file':
      return <FileInput {...common} clearable value={(value as File) ?? null} onChange={onChange} />
    default:
      return <TextInput {...common} value={(value as string) ?? ''} onChange={(e) => onChange(e.currentTarget.value)} />
  }
}

export function EntityForm({
  fields,
  initial,
  onSubmit,
  submitLabel,
}: {
  fields: Field[]
  initial: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => Promise<void>
  submitLabel?: string
}) {
  const { t } = useTranslation()
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const missing: Record<string, string> = {}
    for (const f of fields) {
      const v = values[f.name]
      if (f.required && !f.hidden?.(values) && (v === null || v === undefined || v === '')) missing[f.name] = t('required')
    }
    setErrors(missing)
    if (Object.keys(missing).length) return
    setBusy(true)
    try {
      await onSubmit(values)
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.fieldErrors())
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack>
      <Grid>
        {fields
          .filter((f) => !f.hidden?.(values))
          .map((f) => (
            <Grid.Col key={f.name} span={{ base: 12, sm: f.span ?? 12 }}>
              <FieldInput field={f} value={values[f.name]} error={errors[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
            </Grid.Col>
          ))}
      </Grid>
      <Group justify="flex-end">
        <Button loading={busy} onClick={submit}>
          {submitLabel ?? t('save')}
        </Button>
      </Group>
    </Stack>
  )
}

export function CrudPage<T extends { id: number }>({
  title,
  subtitle,
  url,
  columns,
  fields,
  writePermission,
  defaults = {},
  params = {},
  filters,
  searchable = true,
  canDelete = true,
  paginated = true,
  rowActions,
  onRowClick,
  embedded,
  onEdit,
}: Props<T>) {
  const { t } = useTranslation()
  const { can } = useAuth()
  const qc = useQueryClient()
  const mobile = useMediaQuery('(max-width: 48em)')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced] = useDebouncedValue(search, 300)
  const [editing, setEditingState] = useState<T | 'new' | null>(null)
  const setEditing = (row: T | 'new' | null) => (onEdit && row !== null ? onEdit(row) : setEditingState(row))
  const writable = can(...(Array.isArray(writePermission) ? writePermission : [writePermission]))
  const query = usePage<T>(url, { ...params, page, search: debounced || undefined })
  const data = query.data as unknown
  const rows = Array.isArray(data) ? (data as T[]) : query.data?.results
  const refresh = () => qc.invalidateQueries({ queryKey: [keyOf(url)] })

  const save = async (values: Record<string, unknown>) => {
    const payload = toPayload(fields, values)
    if (editing === 'new') await api.post(url, payload)
    else if (editing) await api.patch(`${url}/${editing.id}`, payload)
    ok()
    setEditing(null)
    await refresh()
  }

  const remove = (row: T) =>
    modals.openConfirmModal({
      title: t('confirm.delete'),
      labels: { confirm: t('delete'), cancel: t('cancel') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.delete(`${url}/${row.id}`)
          ok(t('deleted'))
          await refresh()
        } catch (e) {
          fail(e)
        }
      },
    })

  const actionColumn: Column<T>[] =
    writable || rowActions
      ? [
          {
            key: '_actions',
            title: '',
            width: 110,
            align: 'right',
            render: (row) => (
              <Group gap={4} justify="flex-end" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                {rowActions?.(row)}
                {writable && (
                  <ActionIcon variant="subtle" onClick={() => setEditing(row)} aria-label={t('edit')}>
                    <IconPencil size={18} />
                  </ActionIcon>
                )}
                {writable && canDelete && (
                  <ActionIcon variant="subtle" color="red" onClick={() => remove(row)} aria-label={t('delete')}>
                    <IconTrash size={18} />
                  </ActionIcon>
                )}
              </Group>
            ),
          },
        ]
      : []

  return (
    <>
      {!embedded && (
        <PageHeader
          title={t(title)}
          subtitle={subtitle && t(subtitle)}
          actions={
            writable && (
              <Button leftSection={<IconPlus size={18} />} onClick={() => setEditing('new')}>
                {t('add')}
              </Button>
            )
          }
        />
      )}
      {(searchable || filters || embedded) && (
        <Group mb="sm" gap="sm" wrap="wrap">
          {searchable && (
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder={t('search')}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value)
                setPage(1)
              }}
              w={{ base: '100%', sm: 280 }}
            />
          )}
          {filters}
          {embedded && writable && (
            <Button ml="auto" leftSection={<IconPlus size={18} />} onClick={() => setEditing('new')}>
              {t('add')}
            </Button>
          )}
        </Group>
      )}
      <DataTable
        columns={[...columns, ...actionColumn]}
        rows={rows}
        loading={query.isLoading}
        page={page}
        pages={paginated ? query.data?.pages : undefined}
        total={query.data?.count}
        onPage={setPage}
        onRowClick={onRowClick}
      />
      <Drawer
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? t('add') : t('edit')}
        position={mobile ? 'bottom' : 'right'}
        size={mobile ? '92%' : 'lg'}
      >
        {editing !== null && (
          <EntityForm
            fields={fields}
            initial={toForm(fields, editing === 'new' ? null : (editing as unknown as Record<string, unknown>), defaults)}
            onSubmit={save}
          />
        )}
      </Drawer>
    </>
  )
}
