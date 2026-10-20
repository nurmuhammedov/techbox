import { Badge, Button, Card, Checkbox, Drawer, Grid, Group, NumberInput, Select, SimpleGrid, Stack, Text, TextInput, Textarea, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import type { Role, User } from '@/api/types'
import { CrudPage } from '@/components/CrudPage'
import { PageHeader } from '@/components/PageHeader'
import { MENU } from '@/layout/menu'
import { dateTime } from '@/lib/format'
import { useAction } from '@/lib/queries'
import { LANGUAGES } from '@/i18n'

export function Users() {
  const { t } = useTranslation()
  return (
    <CrudPage<User>
      title="menu.users"
      subtitle="users.subtitle"
      url="/core/users"
      writePermission="users.manage"
      columns={[
        { key: 'username', title: t('login.username'), render: (u) => <Text fw={600} size="sm">{u.username}</Text> },
        { key: 'display_name', title: t('hr.full_name') },
        { key: 'role_name', title: t('role'), render: (u) => (u.is_superuser ? <Badge color="red">{t('admin')}</Badge> : u.role_name ?? '—') },
        { key: 'is_active', title: t('status'), render: (u) => <Badge color={u.is_active ? 'teal' : 'gray'} variant="light">{u.is_active ? t('active') : t('inactive')}</Badge> },
        { key: 'last_login', title: t('users.last_login'), render: (u) => dateTime(u.last_login), hideOnMobile: true },
      ]}
      fields={[
        { name: 'username', label: 'login.username', required: true, span: 6 },
        { name: 'password', label: 'users.password', span: 6 },
        { name: 'employee', label: 'hr.employee', type: 'remote', url: '/core/employees', labelOf: (r) => String(r.full_name) },
        { name: 'first_name', label: 'hr.first_name', span: 6, hidden: (v) => !!v.employee },
        { name: 'last_name', label: 'hr.last_name', span: 6, hidden: (v) => !!v.employee },
        { name: 'role', label: 'role', type: 'remote', url: '/core/roles', span: 6 },
        { name: 'language', label: 'language', type: 'select', options: LANGUAGES.map((l) => ({ value: l.value, label: l.label })), span: 6 },
        { name: 'is_active', label: 'active', type: 'switch', span: 6 },
        { name: 'is_superuser', label: 'users.superuser', type: 'switch', span: 6 },
      ]}
      defaults={{ is_active: true, language: 'uz' }}
    />
  )
}

interface PermGroup {
  group: string
  items: { code: string; label: string }[]
}

function RoleForm({ role, onDone }: { role: Role | null; onDone: () => void }) {
  const { t } = useTranslation()
  const catalog = useQuery({ queryKey: ['core/permissions'], queryFn: () => api.get<PermGroup[]>('/core/permissions') })
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [perms, setPerms] = useState<string[]>(role?.permissions ?? [])
  const [home, setHome] = useState<string | null>(role?.home || null)
  const save = useAction(
    () => (role ? api.patch(`/core/roles/${role.id}`, { name, description, permissions: perms, home: home ?? '' }) : api.post('/core/roles', { name, description, permissions: perms, home: home ?? '' })),
    { invalidate: ['core/roles'], onSuccess: onDone },
  )
  const toggle = (code: string, on: boolean) => setPerms((p) => (on ? [...new Set([...p, code])] : p.filter((x) => x !== code)))
  const pages = MENU.flatMap((g) => g.items).filter((i) => i.perms.some((p) => perms.includes(p)))
  useEffect(() => {
    if (home && !pages.some((p) => p.to === home)) setHome(null)
  }, [perms]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack>
      <TextInput label={t('name')} value={name} onChange={(e) => setName(e.currentTarget.value)} required />
      <Textarea label={t('description')} value={description} onChange={(e) => setDescription(e.currentTarget.value)} />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {catalog.data?.map((g) => {
          const all = g.items.every((i) => perms.includes(i.code))
          return (
            <Card key={g.group} withBorder padding="sm" radius="md">
              <Checkbox
                label={<Text fw={600}>{g.group}</Text>}
                checked={all}
                indeterminate={!all && g.items.some((i) => perms.includes(i.code))}
                onChange={(e) => g.items.forEach((i) => toggle(i.code, e.currentTarget.checked))}
                mb="xs"
              />
              <Stack gap={6} pl="md">
                {g.items.map((i) => (
                  <Checkbox key={i.code} size="sm" label={i.label} checked={perms.includes(i.code)} onChange={(e) => toggle(i.code, e.currentTarget.checked)} />
                ))}
              </Stack>
            </Card>
          )
        })}
      </SimpleGrid>
      <Select
        label={t('roles.home')}
        description={t('roles.home_hint')}
        data={pages.map((p) => ({ value: p.to, label: t(p.label) }))}
        value={home}
        onChange={setHome}
        clearable
      />
      <Group justify="flex-end">
        <Button disabled={!name} loading={save.isPending} onClick={() => save.mutate(undefined)}>
          {t('save')}
        </Button>
      </Group>
    </Stack>
  )
}

export function Roles() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const mobile = useMediaQuery('(max-width: 48em)')
  const [editing, setEditing] = useState<Role | 'new' | null>(null)
  const catalog = useQuery({ queryKey: ['core/permissions'], queryFn: () => api.get<PermGroup[]>('/core/permissions') })
  const label = (code: string) => catalog.data?.flatMap((g) => g.items).find((i) => i.code === code)?.label ?? code
  return (
    <>
      <CrudPage<Role>
        title="menu.roles"
        subtitle="roles.subtitle"
        url="/core/roles"
        writePermission="roles.manage"
        paginated={false}
        onEdit={setEditing}
        fields={[]}
        columns={[
          { key: 'name', title: t('name'), render: (r) => <Stack gap={0}><Text fw={600} size="sm">{r.name}</Text><Text size="xs" c="dimmed">{r.description}</Text></Stack> },
          { key: 'permissions', title: t('roles.permissions'), render: (r) => <Group gap={4}>{r.permissions.map((p) => <Badge key={p} size="xs" variant="light">{label(p)}</Badge>)}</Group> },
          { key: 'users_count', title: t('menu.users'), align: 'right' },
        ]}
      />
      <Drawer opened={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? t('add') : t('edit')} position={mobile ? 'bottom' : 'right'} size={mobile ? '94%' : 'xl'}>
        {editing !== null && (
          <RoleForm
            role={editing === 'new' ? null : editing}
            onDone={() => {
              setEditing(null)
              void qc.invalidateQueries({ queryKey: ['core/roles'] })
            }}
          />
        )}
      </Drawer>
    </>
  )
}

const SECTIONS = [
  { key: 'formats', url: '/catalog/formats', columns: [{ key: 'width_mm', title: 'format' }], fields: [{ name: 'width_mm', label: 'format', type: 'number' as const, required: true }] },
  { key: 'materials', url: '/catalog/materials', columns: [{ key: 'name', title: 'name' }, { key: 'seller_name', title: 'material.seller_name' }, { key: 'gsm', title: 'material.gsm' }], fields: [{ name: 'name', label: 'name', required: true }, { name: 'seller_name', label: 'material.seller_name', span: 6 }, { name: 'gsm', label: 'material.gsm', type: 'number' as const, required: true, span: 6 }] },
  { key: 'suppliers', url: '/catalog/suppliers', columns: [{ key: 'name', title: 'name' }, { key: 'phone', title: 'phone' }], fields: [{ name: 'name', label: 'name', required: true }, { name: 'phone', label: 'phone' }] },
  { key: 'countries', url: '/catalog/countries', columns: [{ key: 'name', title: 'name' }], fields: [{ name: 'name', label: 'name', required: true }] },
  { key: 'warehouses', url: '/inventory/warehouses', columns: [{ key: 'name', title: 'name' }, { key: 'kind', title: 'type' }, { key: 'address', title: 'hr.address' }], fields: [{ name: 'name', label: 'name', required: true }, { name: 'kind', label: 'type', type: 'select' as const, options: [{ value: 'raw', label: 'warehouse.raw' }, { value: 'semi', label: 'warehouse.semi' }, { value: 'finished', label: 'warehouse.finished' }], required: true, span: 6 }, { name: 'area', label: 'warehouse.area', type: 'number' as const, span: 6 }, { name: 'address', label: 'hr.address' }] },
  { key: 'positions', url: '/core/positions', columns: [{ key: 'name', title: 'name' }], fields: [{ name: 'name', label: 'name', required: true }] },
  { key: 'organizations', url: '/inventory/organizations', columns: [{ key: 'name', title: 'name' }], fields: [{ name: 'name', label: 'name', required: true }] },
  { key: 'service-types', url: '/inventory/service-types', columns: [{ key: 'name', title: 'name' }], fields: [{ name: 'name', label: 'name', required: true }] },
  { key: 'incident-types', url: '/hr/incident-types', columns: [{ key: 'name', title: 'name' }], fields: [{ name: 'name', label: 'name', required: true }] },
]

export function Reference() {
  const { t } = useTranslation()
  const [section, setSection] = useState('formats')
  const s = SECTIONS.find((x) => x.key === section)!
  return (
    <>
      <PageHeader title={t('menu.reference')} />
      <Grid>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card withBorder radius="md" p="xs">
            <Stack gap={2}>
              {SECTIONS.map((x) => (
                <Button key={x.key} variant={x.key === section ? 'light' : 'subtle'} justify="flex-start" onClick={() => setSection(x.key)}>
                  {t(`ref.${x.key}`)}
                </Button>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Title order={4} mb="sm">
            {t(`ref.${s.key}`)}
          </Title>
          <CrudPage
            key={s.key}
            embedded
            title={`ref.${s.key}`}
            url={s.url}
            writePermission={['catalog.manage', 'warehouses.manage', 'hr.manage', 'inventory.manage']}
            paginated={false}
            columns={s.columns.map((c) => ({ key: c.key, title: t(c.title), render: c.key === 'kind' ? (r: Record<string, unknown>) => t(`warehouse.${r.kind}`) : undefined }))}
            fields={s.fields}
          />
        </Grid.Col>
      </Grid>
    </>
  )
}

export function Settings() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['core/settings'], queryFn: () => api.get<{ key: string; value: number; description: string }[]>('/core/settings') })
  const [values, setValues] = useState<Record<string, number | string>>({})
  useEffect(() => {
    if (data) setValues(Object.fromEntries(data.map((d) => [d.key, d.value])))
  }, [data])
  const save = useAction(() => api.put('/core/settings', Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Number(v)]))), {
    onSuccess: () => qc.invalidateQueries({ queryKey: ['core/settings'] }),
  })
  return (
    <>
      <PageHeader title={t('menu.settings')} subtitle={t('settings.subtitle')} />
      <Card withBorder radius="md" maw={720}>
        <Stack>
          {data?.map((d) => (
            <NumberInput key={d.key} label={t(`settings.${d.key}`)} description={d.description} value={values[d.key] ?? ''} onChange={(v) => setValues((s) => ({ ...s, [d.key]: v }))} decimalScale={3} />
          ))}
          <Group justify="flex-end">
            <Button loading={save.isPending} onClick={() => save.mutate(undefined)}>
              {t('save')}
            </Button>
          </Group>
        </Stack>
      </Card>
    </>
  )
}

export function Audit() {
  const { t } = useTranslation()
  return (
    <CrudPage<{ id: number; user_name: string | null; action: string; entity: string; entity_id: string; summary: string; created_at: string }>
      title="menu.audit"
      url="/core/audit"
      writePermission="__none__"
      fields={[]}
      columns={[
        { key: 'created_at', title: t('date'), render: (a) => dateTime(a.created_at) },
        { key: 'user_name', title: t('created_by'), render: (a) => a.user_name ?? '—' },
        { key: 'action', title: t('audit.action'), render: (a) => <Badge variant="light">{t(`audit.${a.action}`, { defaultValue: a.action })}</Badge> },
        { key: 'entity', title: t('audit.entity'), render: (a) => `${a.entity.split('.').pop()} #${a.entity_id}`, hideOnMobile: true },
        { key: 'summary', title: t('description') },
      ]}
    />
  )
}
