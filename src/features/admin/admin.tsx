import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { api, ApiError } from '@/api/client'
import type { Role, User } from '@/api/types'
import { NAVIGATION } from '@/app/navigation'
import { LANGUAGES } from '@/i18n'
import type { FieldSpec } from '@/kit/fields'
import { FormFooter, ResourceForm, ResourceList } from '@/kit/resource'
import { cn } from '@/lib/cn'
import { dateTime } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { Button } from '@/ui/button'
import { Checkbox, Select } from '@/ui/controls'
import { Badge, Skeleton } from '@/ui/feedback'
import { Field } from '@/ui/field'
import { Form } from '@/ui/form'
import { Input, Textarea } from '@/ui/input'
import { NumberInput } from '@/ui/number-input'
import { Card, Page } from '@/ui/page'

export function UsersPage() {
  const { t } = useTranslation()
  const columns: ColumnDef<User, unknown>[] = [
    { id: 'username', header: t('login.username'), cell: ({ row }) => <span className="font-code font-medium">{row.original.username}</span>, meta: { sortKey: 'username', fixed: true, export: (r: User) => r.username } },
    { id: 'name', header: t('hr.full_name'), cell: ({ row }) => row.original.display_name, meta: { export: (r: User) => r.display_name } },
    { id: 'role', header: t('role'), cell: ({ row }) => (row.original.is_superuser ? <Badge tone="bad">{t('admin')}</Badge> : row.original.role_name ? <Badge tone="accent">{row.original.role_name}</Badge> : '—') },
    { id: 'status', header: t('status'), cell: ({ row }) => <Badge tone={row.original.is_active ? 'ok' : 'neutral'}>{row.original.is_active ? t('active') : t('inactive')}</Badge> },
    { id: 'last', header: t('users.last_login'), cell: ({ row }) => <span className="tabular text-xs text-ink-3">{dateTime(row.original.last_login)}</span> },
  ]
  return <ResourceList<User> title="menu.users" url="/core/users" base="/admin/users" columns={columns} writePermission="users.manage" defaultSort="username" />
}

export const UserForm = () => {
  const { id } = useParams()
  const editing = !!id && id !== 'new'
  return (
    <ResourceForm
      title="users.user"
      url="/core/users"
      back="/admin/users"
      defaults={{ is_active: true, language: 'uz' }}
      sections={[
        {
          title: 'users.section_login',
          fields: [
            { name: 'username', label: 'login.username', required: true, span: 6 },
            { name: 'password', label: editing ? 'users.password' : 'login.password', type: 'password', required: !editing, span: 6, hint: 'users.password_hint' },
            { name: 'role', label: 'role', type: 'remote', url: '/core/roles', span: 6 },
            { name: 'language', label: 'language', type: 'select', options: LANGUAGES.map((l) => ({ value: l.value, label: l.label })), span: 6 },
          ],
        },
        {
          title: 'users.section_person',
          fields: [
            { name: 'employee', label: 'hr.employee', type: 'remote', url: '/core/employees', labelOf: (r) => String(r.full_name), hint: 'users.employee_hint' },
            { name: 'first_name', label: 'hr.first_name', span: 6, hidden: (v) => !!v.employee },
            { name: 'last_name', label: 'hr.last_name', span: 6, hidden: (v) => !!v.employee },
          ],
        },
        {
          title: 'status',
          fields: [
            { name: 'is_active', label: 'active', type: 'switch', span: 6 },
            { name: 'is_superuser', label: 'users.superuser', type: 'switch', span: 6, hint: 'users.superuser_hint' },
          ],
        },
      ]}
    />
  )
}

interface PermGroup { group: string; items: { code: string; label: string }[] }

export function RolesPage() {
  const { t } = useTranslation()
  const catalog = useQuery({ queryKey: ['core/permissions'], queryFn: () => api.get<PermGroup[]>('/core/permissions') })
  const label = (code: string) => catalog.data?.flatMap((g) => g.items).find((i) => i.code === code)?.label ?? code
  const columns: ColumnDef<Role, unknown>[] = [
    { id: 'name', header: t('name'), cell: ({ row }) => <div><p className="font-medium">{row.original.name}</p>{row.original.description ? <p className="text-xs text-ink-3">{row.original.description}</p> : null}</div>, meta: { fixed: true } },
    { id: 'permissions', header: t('roles.permissions'), cell: ({ row }) => <div className="flex max-w-xl flex-wrap gap-1">{row.original.permissions.map((p) => <Badge key={p}>{label(p)}</Badge>)}</div> },
    { id: 'users', header: t('menu.users'), cell: ({ row }) => <span className="tabular">{row.original.users_count}</span>, meta: { className: 'text-right' } },
  ]
  return <ResourceList<Role> title="menu.roles" url="/core/roles" base="/admin/roles" columns={columns} writePermission="roles.manage" paginated={false} />
}

export function RoleFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const editing = !!id && id !== 'new'
  const catalog = useQuery({ queryKey: ['core/permissions'], queryFn: () => api.get<PermGroup[]>('/core/permissions') })
  const role = useQuery({ queryKey: ['core/roles', 'one', id], queryFn: () => api.get<Role>(`/core/roles/${id}`), enabled: editing })
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [perms, setPerms] = useState<string[]>([])
  const [home, setHome] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (role.data) {
      setName(role.data.name)
      setDescription(role.data.description)
      setPerms(role.data.permissions)
      setHome(role.data.home)
    }
  }, [role.data])

  const toggle = (code: string, on: boolean) => setPerms((p) => (on ? [...new Set([...p, code])] : p.filter((x) => x !== code)))
  const pages = NAVIGATION.flatMap((g) => g.items).filter((i) => i.perms.some((p) => perms.includes(p)))

  const submit = async () => {
    if (!name.trim()) return setError(t('required'))
    setBusy(true)
    try {
      const body = { name: name.trim(), description, permissions: perms, home: pages.some((p) => p.to === home) ? home : '' }
      if (editing) await api.patch(`/core/roles/${id}`, body)
      else await api.post('/core/roles', body)
      ok()
      await qc.invalidateQueries({ queryKey: ['core/roles'] })
      navigate('/admin/roles')
    } catch (e) {
      if (e instanceof ApiError && e.fields?.name) setError(e.fields.name)
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  if (editing && !role.data) return <Page title="…" flow><Skeleton className="h-96" /></Page>
  return (
    <Page title={editing ? `${t('edit')}: ${role.data?.name}` : t('new_of', { name: t('role') })} flow>
      <Form onSubmit={submit}>
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <Card className="xl:sticky xl:top-4">
            <div className="grid gap-3.5">
              <Field label={t('name')} required error={error}>{(fid) => <Input id={fid} value={name} onChange={(e) => setName(e.target.value)} invalid={!!error} />}</Field>
              <Field label={t('description')}>{(fid) => <Textarea id={fid} value={description} onChange={(e) => setDescription(e.target.value)} />}</Field>
              <Field label={t('roles.home')} hint={t('roles.home_hint')}>
                {(fid) => <Select id={fid} value={home} onChange={setHome} options={pages.map((p) => ({ value: p.to, label: t(p.label) }))} placeholder={t('roles.home_auto')} />}
              </Field>
              <p className="rounded-md bg-sunken px-3 py-2 text-xs text-ink-2">{t('roles.selected', { n: perms.length })}</p>
            </div>
          </Card>
          <div className="grid gap-3 md:grid-cols-2">
            {catalog.data?.map((g) => {
              const all = g.items.every((i) => perms.includes(i.code))
              const some = g.items.some((i) => perms.includes(i.code))
              return (
                <Card key={g.group}>
                  <div className="mb-2 flex items-center justify-between gap-2 border-b border-line pb-2">
                    <p className="font-semibold">{g.group}</p>
                    <button type="button" className={cn('text-xs font-medium', all ? 'text-bad' : 'text-accent')} onClick={() => g.items.forEach((i) => toggle(i.code, !all))}>
                      {all ? t('roles.none') : t('roles.all')}
                    </button>
                  </div>
                  <div className={cn('flex flex-col gap-2', !some && 'opacity-90')}>
                    {g.items.map((i) => <Checkbox key={i.code} checked={perms.includes(i.code)} onChange={(c) => toggle(i.code, c)} label={i.label} hint={<span className="font-code">{i.code}</span>} />)}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
        <FormFooter busy={busy} onCancel={() => navigate('/admin/roles')} />
      </Form>
    </Page>
  )
}

// ───────────────────────────── Reference ─────────────────────────────

interface RefSection { key: string; url: string; columns: { key: string; title: string; render?: (r: Record<string, unknown>) => React.ReactNode }[]; fields: FieldSpec[] }

const REF: RefSection[] = [
  { key: 'formats', url: '/catalog/formats', columns: [{ key: 'width_mm', title: 'format', render: (r) => `${r.width_mm} mm` }], fields: [{ name: 'width_mm', label: 'format', type: 'number', suffix: 'mm', required: true }] },
  { key: 'materials', url: '/catalog/materials', columns: [{ key: 'name', title: 'name' }, { key: 'seller_name', title: 'material.seller_name' }, { key: 'gsm', title: 'material.gsm', render: (r) => `${r.gsm} g/m²` }], fields: [{ name: 'name', label: 'name', required: true }, { name: 'seller_name', label: 'material.seller_name', span: 6 }, { name: 'gsm', label: 'material.gsm', type: 'number', suffix: 'g/m²', required: true, span: 6 }] },
  { key: 'suppliers', url: '/catalog/suppliers', columns: [{ key: 'name', title: 'name' }, { key: 'phone', title: 'phone' }], fields: [{ name: 'name', label: 'name', required: true }, { name: 'phone', label: 'phone', type: 'phone' }] },
  { key: 'countries', url: '/catalog/countries', columns: [{ key: 'name', title: 'name' }], fields: [{ name: 'name', label: 'name', required: true }] },
  { key: 'warehouses', url: '/inventory/warehouses', columns: [{ key: 'name', title: 'name' }, { key: 'kind', title: 'type' }, { key: 'area', title: 'warehouse.area', render: (r) => (r.area ? `${r.area} m²` : '—') }, { key: 'address', title: 'hr.address' }], fields: [{ name: 'name', label: 'name', required: true }, { name: 'kind', label: 'type', type: 'segments', options: [{ value: 'raw', label: 'warehouse.raw' }, { value: 'semi', label: 'warehouse.semi' }, { value: 'finished', label: 'warehouse.finished' }] }, { name: 'area', label: 'warehouse.area', type: 'number', suffix: 'm²', span: 6 }, { name: 'address', label: 'hr.address', span: 6 }] },
  { key: 'organizations', url: '/inventory/organizations', columns: [{ key: 'name', title: 'name' }], fields: [{ name: 'name', label: 'name', required: true }] },
  { key: 'service-types', url: '/inventory/service-types', columns: [{ key: 'name', title: 'name' }], fields: [{ name: 'name', label: 'name', required: true }] },
]

export function ReferencePage() {
  const { t } = useTranslation()
  const { section = 'formats' } = useParams()
  const s = REF.find((x) => x.key === section) ?? REF[0]
  const columns: ColumnDef<Record<string, unknown> & { id: number }, unknown>[] = s.columns.map((c) => ({
    id: c.key,
    header: t(c.title),
    cell: ({ row }) => (c.render ? c.render(row.original) : c.key === 'kind' ? t(`warehouse.${row.original.kind}`) : String(row.original[c.key] ?? '—')),
  }))
  return (
    <Page title={t('menu.reference')}>
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {REF.map((x) => (
            <Link key={x.key} to={`/admin/reference/${x.key}`} className={cn('rounded-md px-3 py-2 text-[13px] whitespace-nowrap transition-colors', x.key === s.key ? 'bg-accent-soft font-medium text-accent-ink' : 'text-ink-2 hover:bg-sunken')}>
              {t(`ref.${x.key}`)}
            </Link>
          ))}
        </nav>
        <div className="flex min-h-0 flex-col">
          <ResourceList key={s.key} embedded title={`ref.${s.key}`} url={s.url} base={`/admin/reference/${s.key}`} columns={columns} writePermission={['catalog.manage', 'warehouses.manage', 'inventory.manage']} paginated={false}
            toolbar={<Link to={`/admin/reference/${s.key}/new`} className="flex h-8.5 items-center rounded-md bg-accent px-3.5 text-[13px] font-medium text-on-accent hover:bg-accent-hover">+ {t('add')}</Link>} />
        </div>
      </div>
    </Page>
  )
}

export function ReferenceFormPage() {
  const { section = 'formats' } = useParams()
  const s = REF.find((x) => x.key === section) ?? REF[0]
  return <ResourceForm key={s.key} title={`ref.${s.key}`} url={s.url} back={`/admin/reference/${s.key}`} sections={[{ fields: s.fields }]} defaults={s.key === 'warehouses' ? { kind: 'raw' } : {}} />
}

export function SettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['core/settings'], queryFn: () => api.get<{ key: string; value: number; description: string }[]>('/core/settings') })
  const [values, setValues] = useState<Record<string, number | null>>({})
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (data) setValues(Object.fromEntries(data.map((d) => [d.key, d.value])))
  }, [data])
  const submit = async () => {
    setBusy(true)
    try {
      await api.put('/core/settings', values)
      ok()
      await qc.invalidateQueries({ queryKey: ['core/settings'] })
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Page title={t('menu.settings')} flow width="narrow">
      <Form onSubmit={submit}>
        <Card title={t('settings.subtitle')}>
          <div className="grid gap-4 sm:grid-cols-2">
            {data?.map((d) => (
              <Field key={d.key} label={t(`settings.${d.key}`)} hint={d.description}>
                {(fid) => <NumberInput id={fid} value={values[d.key] ?? null} onChange={(v) => setValues((s) => ({ ...s, [d.key]: v }))} decimals={3} />}
              </Field>
            ))}
          </div>
        </Card>
        <div className="flex justify-end"><Button type="submit" variant="primary" loading={busy}>{t('save')}</Button></div>
      </Form>
    </Page>
  )
}

interface AuditRow { id: number; user_name: string | null; action: string; entity: string; entity_id: string; summary: string; created_at: string }

export function AuditPage() {
  const { t } = useTranslation()
  const columns: ColumnDef<AuditRow, unknown>[] = [
    { id: 'date', header: t('date'), cell: ({ row }) => <span className="tabular">{dateTime(row.original.created_at)}</span>, meta: { sortKey: 'created_at', export: (r: AuditRow) => r.created_at } },
    { id: 'user', header: t('created_by'), cell: ({ row }) => row.original.user_name ?? '—', meta: { export: (r: AuditRow) => r.user_name } },
    { id: 'action', header: t('audit.action'), cell: ({ row }) => <Badge tone="accent">{t(`audit.${row.original.action}`, { defaultValue: row.original.action })}</Badge>, meta: { export: (r: AuditRow) => r.action } },
    { id: 'entity', header: t('audit.entity'), cell: ({ row }) => <span className="font-code text-xs">{row.original.entity.split('.').pop()} #{row.original.entity_id}</span> },
    { id: 'summary', header: t('description'), cell: ({ row }) => row.original.summary, meta: { export: (r: AuditRow) => r.summary } },
  ]
  return <ResourceList<AuditRow> title="menu.audit" url="/core/audit" base="/admin/audit" columns={columns} defaultSort="created_at" defaultOrder="desc" onRowOpen={() => undefined} />
}
