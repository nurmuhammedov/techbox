import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { api } from '@/api/client'
import { Combobox, type ComboOption } from '@/ui/combobox'
import { Segments, Select, Switch } from '@/ui/controls'
import { DateInput } from '@/ui/date-input'
import { Field } from '@/ui/field'
import { Input, Textarea } from '@/ui/input'
import { NumberInput } from '@/ui/number-input'
import { PasswordInput } from '@/ui/password-input'
import { PhoneInput } from '@/ui/phone-input'

import { ImageField } from './ImageField'

type Row = Record<string, unknown> & { id: number }

export interface FieldSpec {
  name: string
  label: string
  type?:
    | 'text'
    | 'textarea'
    | 'number'
    | 'decimal'
    | 'money'
    | 'date'
    | 'time'
    | 'select'
    | 'segments'
    | 'remote'
    | 'switch'
    | 'image'
    | 'file'
    | 'phone'
    | 'password'
  options?: { value: string; label: string }[]
  url?: string
  params?: Record<string, string | number | boolean | undefined>
  labelOf?: (row: Row) => string
  hintOf?: (row: Row) => string | undefined
  required?: boolean
  /** Columns out of 12 on wide screens. */
  span?: 3 | 4 | 6 | 8 | 12
  suffix?: string
  hint?: string
  placeholder?: string
  /** The saved picture's URL comes from this key of the record (for image fields). */
  currentKey?: string
  hidden?: (values: Record<string, unknown>) => boolean
}

function unwrap(data: unknown): Row[] {
  if (Array.isArray(data)) return data as Row[]
  if (data && typeof data === 'object' && 'results' in data) return (data as { results: Row[] }).results
  return []
}

/** Rows of a reference list for a picker; cached by URL. */
export function useOptions(url: string | undefined, params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: [url?.split('/').filter(Boolean).slice(0, 2).join('/'), url, 'options', params],
    queryFn: () => api.get<unknown>(url!, { page_size: 500, ...params }),
    enabled: !!url,
    staleTime: 60_000,
    select: unwrap,
  })
}

export function RemoteCombo({
  id,
  url,
  params,
  value,
  onChange,
  labelOf,
  hintOf,
  invalid,
  disabled,
  placeholder,
}: {
  id?: string
  url: string
  params?: Record<string, string | number | boolean | undefined>
  value: number | null | undefined
  onChange: (value: number | null, row?: Row) => void
  labelOf?: (row: Row) => string
  hintOf?: (row: Row) => string | undefined
  invalid?: boolean
  disabled?: boolean
  placeholder?: string
}) {
  const { data: rows = [] } = useOptions(url, params)
  const label = labelOf ?? ((r: Row) => String(r.name ?? r.company ?? r.full_name ?? r.username ?? r.id))
  const options: ComboOption[] = useMemo(
    () => rows.map((r) => ({ value: String(r.id), label: label(r), hint: hintOf?.(r) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows],
  )
  return (
    <Combobox
      id={id}
      value={value ? String(value) : null}
      onChange={(v) => onChange(v ? Number(v) : null, rows.find((r) => String(r.id) === v))}
      options={options}
      invalid={invalid}
      disabled={disabled}
      placeholder={placeholder}
    />
  )
}

export function FieldControl({
  spec,
  value,
  onChange,
  invalid,
  id,
  current,
}: {
  spec: FieldSpec
  value: unknown
  onChange: (value: unknown) => void
  invalid?: boolean
  id: string
  current?: string | null
}) {
  const { t } = useTranslation()
  switch (spec.type) {
    case 'textarea':
      return <Textarea id={id} invalid={invalid} value={(value as string) ?? ''} placeholder={spec.placeholder} onChange={(e) => onChange(e.target.value)} />
    case 'number':
    case 'decimal':
    case 'money':
      return (
        <NumberInput
          id={id}
          invalid={invalid}
          value={value === '' || value === undefined ? null : (value as number | null)}
          onChange={onChange}
          decimals={spec.type === 'decimal' ? 3 : 0}
          suffix={spec.suffix ?? (spec.type === 'money' ? t('currency.som') : undefined)}
          placeholder={spec.placeholder}
        />
      )
    case 'date':
      return <DateInput id={id} invalid={invalid} value={(value as string) ?? ''} onChange={onChange} />
    case 'time':
      return <Input id={id} type="time" invalid={invalid} value={((value as string) ?? '').slice(0, 5)} onChange={(e) => onChange(e.target.value)} />
    case 'select':
      return (
        <Select
          id={id}
          invalid={invalid}
          value={value === null || value === undefined ? '' : String(value)}
          onChange={onChange}
          options={(spec.options ?? []).map((o) => ({ value: o.value, label: t(o.label) }))}
          placeholder={spec.placeholder ?? t('common.select')}
        />
      )
    case 'segments':
      return (
        <Segments
          id={id}
          value={value === null || value === undefined ? null : String(value)}
          onChange={onChange}
          options={(spec.options ?? []).map((o) => ({ value: o.value, label: t(o.label) }))}
        />
      )
    case 'remote':
      return (
        <RemoteCombo
          id={id}
          url={spec.url!}
          params={spec.params}
          value={value as number | null}
          onChange={(v) => onChange(v)}
          labelOf={spec.labelOf}
          hintOf={spec.hintOf}
          invalid={invalid}
          placeholder={spec.placeholder}
        />
      )
    case 'switch':
      return <Switch id={id} checked={!!value} onChange={onChange} label={t(spec.label)} hint={spec.hint ? t(spec.hint) : undefined} />
    case 'image':
      return <ImageField id={id} current={current} value={value as File | null | undefined} onChange={onChange} invalid={invalid} />
    case 'file':
      return <FileInput id={id} current={current} value={value as File | null | undefined} onChange={onChange} />
    case 'phone':
      return <PhoneInput id={id} invalid={invalid} value={(value as string) ?? ''} onChange={onChange} />
    case 'password':
      return <PasswordInput id={id} invalid={invalid} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />
    default:
      return (
        <Input id={id} invalid={invalid} value={(value as string) ?? ''} placeholder={spec.placeholder} suffix={spec.suffix} onChange={(e) => onChange(e.target.value)} />
      )
  }
}

function FileInput({
  id,
  current,
  value,
  onChange,
}: {
  id: string
  current?: string | null
  value: File | null | undefined
  onChange: (file: File | null | undefined) => void
}) {
  const { t } = useTranslation()
  const [key, setKey] = useState(0)
  const name = value ? value.name : value === null ? '' : current ? decodeURIComponent(current.split('/').pop() ?? '') : ''
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={id}
        className="flex h-8.5 min-w-0 flex-1 cursor-pointer items-center rounded-md border border-dashed border-line-strong bg-surface px-2.5 text-[13px] hover:border-accent"
      >
        <span className={name ? 'truncate text-ink' : 'text-ink-3'}>{name || t('file.choose')}</span>
      </label>
      <input key={key} id={id} type="file" className="sr-only" onChange={(e) => onChange(e.target.files?.[0])} />
      {current && value !== null ? (
        <a href={current} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
          {t('file.open')}
        </a>
      ) : null}
      {name ? (
        <button
          type="button"
          className="text-xs text-bad hover:underline"
          onClick={() => {
            setKey(key + 1)
            onChange(current ? null : undefined)
          }}
        >
          {t('delete')}
        </button>
      ) : null}
    </div>
  )
}

const SPAN: Record<number, string> = {
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
  6: 'sm:col-span-6',
  8: 'sm:col-span-8',
  12: 'sm:col-span-12',
}

/** Fields laid out on a 12-column grid; each takes its span on wide screens and the full width on phones. */
export function FieldGrid({
  specs,
  values,
  errors,
  onChange,
  record,
  children,
}: {
  specs: FieldSpec[]
  values: Record<string, unknown>
  errors: Record<string, string>
  onChange: (name: string, value: unknown) => void
  record?: Record<string, unknown> | null
  children?: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-12">
      {specs
        .filter((spec) => !spec.hidden?.(values))
        .map((spec) => (
          <div key={spec.name} className={cn12(spec)}>
            {spec.type === 'switch' ? (
              <FieldControl spec={spec} id={spec.name} value={values[spec.name]} onChange={(v) => onChange(spec.name, v)} />
            ) : (
              <Field label={t(spec.label)} required={spec.required} error={errors[spec.name]} hint={spec.hint ? t(spec.hint) : undefined}>
                {(id) => (
                  <FieldControl
                    spec={spec}
                    id={id}
                    value={values[spec.name]}
                    invalid={!!errors[spec.name]}
                    onChange={(v) => onChange(spec.name, v)}
                    current={spec.currentKey ? ((record?.[spec.currentKey] as string) ?? null) : ((record?.[spec.name] as string) ?? null)}
                  />
                )}
              </Field>
            )}
          </div>
        ))}
      {children}
    </div>
  )
}

const cn12 = (spec: FieldSpec) => `col-span-1 ${SPAN[spec.span ?? 12]}`
