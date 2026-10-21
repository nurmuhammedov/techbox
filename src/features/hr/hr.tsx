import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { FileSignature, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { api } from '@/api/client'
import type { Employee } from '@/api/types'
import { ResourceForm, ResourceList } from '@/kit/resource'
import { date, dateTime, formatPhone } from '@/lib/format'
import { useTab } from '@/features/chemicals/chemicals'
import { TabPanel, Tabs } from '@/ui/controls'
import { Badge } from '@/ui/feedback'
import { Page } from '@/ui/page'

const EMPLOYEE = (r: Record<string, unknown>) => String(r.full_name)

export function EmployeesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useTab('list')
  const columns: ColumnDef<Employee, unknown>[] = [
    {
      id: 'name',
      header: t('hr.full_name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-ink">
            {(row.original.last_name[0] ?? '') + (row.original.first_name[0] ?? '')}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.full_name}</p>
            {row.original.blacklisted ? <Badge tone="bad">{t('hr.blacklisted')}</Badge> : null}
          </div>
        </div>
      ),
      meta: { sortKey: 'last_name', fixed: true, export: (r: Employee) => r.full_name },
    },
    { id: 'position', header: t('hr.position'), cell: ({ row }) => row.original.position_name ?? '—', meta: { export: (r: Employee) => r.position_name } },
    { id: 'phone', header: t('phone'), cell: ({ row }) => <span className="tabular">{formatPhone(row.original.phone)}</span>, meta: { export: (r: Employee) => r.phone } },
    { id: 'hired', header: t('hr.hired_at'), cell: ({ row }) => <span className="tabular">{date(row.original.hired_at)}</span> },
    { id: 'login', header: t('login.username'), cell: ({ row }) => (row.original.username ? <span className="font-code">{row.original.username}</span> : <span className="text-ink-3">—</span>) },
    { id: 'status', header: t('status'), cell: ({ row }) => <Badge tone={row.original.is_active ? 'ok' : 'neutral'}>{row.original.is_active ? t('active') : t('inactive')}</Badge> },
  ]
  return (
    <Page title={t('menu.employees')}>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'list', label: t('menu.employees') }, { value: 'contracts', label: t('hr.contracts') }, { value: 'positions', label: t('ref.positions') }]}>
        <TabPanel value="list">
          <ResourceList<Employee> embedded title="menu.employees" url="/core/employees" base="/hr/employees" columns={columns} writePermission="hr.manage" defaultSort="last_name"
            rowMenu={(e) => [{ label: t('hr.add_contract'), icon: <FileSignature />, onSelect: () => navigate(`/hr/contracts/new?employee=${e.id}`) }]}
            toolbar={<AddButton to="/hr/employees/new" />} />
        </TabPanel>
        <TabPanel value="contracts"><ContractsList /></TabPanel>
        <TabPanel value="positions">
          <ResourceList<{ id: number; name: string }> embedded title="ref.positions" url="/core/positions" base="/hr/positions" paginated={false} writePermission="hr.manage"
            columns={[{ id: 'name', header: t('name'), cell: ({ row }) => row.original.name }]} toolbar={<AddButton to="/hr/positions/new" />} />
        </TabPanel>
      </Tabs>
    </Page>
  )
}

function AddButton({ to }: { to: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return <button type="button" onClick={() => navigate(to)} className="h-8.5 rounded-md bg-accent px-3.5 text-[13px] font-medium text-on-accent hover:bg-accent-hover">+ {t('add')}</button>
}

interface Contract { id: number; employee_name: string; number: string; start_date: string; end_date: string | null; file: string | null; is_active: boolean }

function ContractsList() {
  const { t } = useTranslation()
  const columns: ColumnDef<Contract, unknown>[] = [
    { id: 'employee', header: t('hr.employee'), cell: ({ row }) => <span className="font-medium">{row.original.employee_name}</span> },
    { id: 'number', header: t('hr.contract_number'), cell: ({ row }) => <span className="font-code">{row.original.number}</span> },
    { id: 'start', header: t('hr.start'), cell: ({ row }) => <span className="tabular">{date(row.original.start_date)}</span> },
    { id: 'end', header: t('hr.end'), cell: ({ row }) => <span className="tabular">{date(row.original.end_date)}</span> },
    { id: 'file', header: t('file'), cell: ({ row }) => (row.original.file ? <a className="text-accent hover:underline" href={row.original.file} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{t('file.open')}</a> : '—') },
    { id: 'active', header: t('status'), cell: ({ row }) => <Badge tone={row.original.is_active ? 'ok' : 'neutral'}>{row.original.is_active ? t('active') : t('inactive')}</Badge> },
  ]
  return <ResourceList<Contract> embedded title="hr.contracts" url="/hr/contracts" base="/hr/contracts" columns={columns} writePermission="hr.manage" toolbar={<AddButton to="/hr/contracts/new" />} />
}

export const EmployeeForm = () => (
  <ResourceForm
    title="hr.employee"
    url="/core/employees"
    back="/hr/employees"
    defaults={{ is_active: true }}
    sections={[
      {
        title: 'hr.section_main',
        fields: [
          { name: 'last_name', label: 'hr.last_name', required: true, span: 6 },
          { name: 'first_name', label: 'hr.first_name', required: true, span: 6 },
          { name: 'middle_name', label: 'hr.middle_name', span: 6 },
          { name: 'phone', label: 'phone', type: 'phone', span: 6 },
          { name: 'position', label: 'hr.position', type: 'remote', url: '/core/positions', span: 6 },
          { name: 'hired_at', label: 'hr.hired_at', type: 'date', span: 6 },
        ],
      },
      {
        title: 'hr.section_docs',
        fields: [
          { name: 'birthday', label: 'hr.birthday', type: 'date', span: 6 },
          { name: 'passport', label: 'hr.passport', span: 6, placeholder: 'AA1234567' },
          { name: 'pinfl', label: 'hr.pinfl', span: 6, placeholder: '14 xonali' },
          { name: 'card_number', label: 'hr.card', span: 6 },
          { name: 'address', label: 'hr.address' },
        ],
      },
      {
        title: 'status',
        fields: [
          { name: 'is_active', label: 'active', type: 'switch', span: 6 },
          { name: 'blacklisted', label: 'hr.blacklisted', type: 'switch', span: 6 },
          { name: 'blacklist_reason', label: 'hr.blacklist_reason', hidden: (v) => !v.blacklisted },
        ],
      },
    ]}
  />
)

export const ContractForm = () => {
  const employee = new URLSearchParams(location.search).get('employee')
  return (
    <ResourceForm title="hr.contract" url="/hr/contracts" back="/hr/employees?tab=contracts" defaults={{ employee: employee ? Number(employee) : null, is_active: true }} sections={[{ fields: [
      { name: 'employee', label: 'hr.employee', type: 'remote', url: '/core/employees', labelOf: EMPLOYEE, required: true },
      { name: 'number', label: 'hr.contract_number', required: true, span: 6 },
      { name: 'start_date', label: 'hr.start', type: 'date', required: true, span: 6 },
      { name: 'end_date', label: 'hr.end', type: 'date', span: 6 },
      { name: 'is_active', label: 'hr.contract_active', type: 'switch', span: 6, hint: 'hr.contract_active_hint' },
      { name: 'file', label: 'hr.contract_file', type: 'file' },
    ] }]} />
  )
}

export const PositionForm = () => (
  <ResourceForm title="hr.position" url="/core/positions" back="/hr/employees?tab=positions" sections={[{ fields: [{ name: 'name', label: 'name', required: true }] }]} />
)

interface Cert { id: number; employee_name: string; number: string; issued_at: string | null; valid_until: string; is_daily: boolean; expired: boolean; file: string | null }

export function SafetyPage() {
  const { t } = useTranslation()
  const alerts = useQuery({ queryKey: ['hr', 'alerts'], queryFn: () => api.get<{ certificates: unknown[] }>('/hr/alerts') })
  const columns: ColumnDef<Cert, unknown>[] = [
    { id: 'employee', header: t('hr.employee'), cell: ({ row }) => <span className="font-medium">{row.original.employee_name}</span> },
    { id: 'number', header: t('hr.cert_number'), cell: ({ row }) => <span className="font-code">{row.original.number}</span> },
    { id: 'issued', header: t('hr.issued'), cell: ({ row }) => <span className="tabular">{date(row.original.issued_at)}</span> },
    { id: 'valid', header: t('hr.valid_until'), cell: ({ row }) => <span className={`tabular ${row.original.expired ? 'font-semibold text-bad' : ''}`}>{date(row.original.valid_until)}</span>, meta: { sortKey: 'valid_until' } },
    { id: 'daily', header: t('hr.daily'), cell: ({ row }) => (row.original.is_daily ? <Badge tone="info">{t('hr.daily')}</Badge> : null) },
    { id: 'file', header: t('file'), cell: ({ row }) => (row.original.file ? <a className="text-accent hover:underline" href={row.original.file} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{t('file.open')}</a> : '—') },
  ]
  return (
    <ResourceList<Cert>
      title="menu.safety"
      url="/hr/certificates"
      base="/hr/safety"
      columns={columns}
      writePermission="hr.manage"
      defaultSort="valid_until"
      above={alerts.data?.certificates.length ? (
        <p className="mb-3 flex items-center gap-2 rounded-md bg-warn-soft px-3 py-2 text-[13px] text-warn"><ShieldAlert className="size-4" />{t('hr.cert_alert', { n: alerts.data.certificates.length })}</p>
      ) : null}
    />
  )
}

export const SafetyForm = () => (
  <ResourceForm title="hr.certificate" url="/hr/certificates" back="/hr/safety" sections={[{ fields: [
    { name: 'employee', label: 'hr.employee', type: 'remote', url: '/core/employees', labelOf: EMPLOYEE, required: true },
    { name: 'number', label: 'hr.cert_number', required: true, span: 6 },
    { name: 'issued_at', label: 'hr.issued', type: 'date', span: 6 },
    { name: 'valid_until', label: 'hr.valid_until', type: 'date', required: true, span: 6 },
    { name: 'is_daily', label: 'hr.daily', type: 'switch', span: 6, hint: 'hr.daily_hint' },
    { name: 'file', label: 'file', type: 'file' },
  ] }]} />
)

interface Incident { id: number; employee_name: string | null; type_name: string | null; happened_at: string; description: string }

export function IncidentsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useTab('list')
  const columns: ColumnDef<Incident, unknown>[] = [
    { id: 'date', header: t('date'), cell: ({ row }) => <span className="tabular whitespace-nowrap">{dateTime(row.original.happened_at)}</span>, meta: { sortKey: 'happened_at' } },
    { id: 'employee', header: t('hr.employee'), cell: ({ row }) => row.original.employee_name ?? '—' },
    { id: 'type', header: t('type'), cell: ({ row }) => (row.original.type_name ? <Badge tone="warn">{row.original.type_name}</Badge> : '—') },
    { id: 'description', header: t('description'), cell: ({ row }) => <span className="line-clamp-2">{row.original.description}</span> },
  ]
  return (
    <Page title={t('menu.incidents')}>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'list', label: t('menu.incidents') }, { value: 'types', label: t('ref.incident-types') }]}>
        <TabPanel value="list"><ResourceList<Incident> embedded title="menu.incidents" url="/hr/incidents" base="/hr/incidents" columns={columns} writePermission="hr.manage" defaultSort="happened_at" defaultOrder="desc" toolbar={<AddButton to="/hr/incidents/new" />} /></TabPanel>
        <TabPanel value="types"><ResourceList<{ id: number; name: string }> embedded title="ref.incident-types" url="/hr/incident-types" base="/hr/incident-types" paginated={false} writePermission="hr.manage" columns={[{ id: 'name', header: t('name'), cell: ({ row }) => row.original.name }]} toolbar={<AddButton to="/hr/incident-types/new" />} /></TabPanel>
      </Tabs>
    </Page>
  )
}

export const IncidentForm = () => (
  <ResourceForm title="hr.incident" url="/hr/incidents" back="/hr/incidents" sections={[{ fields: [
    { name: 'employee', label: 'hr.employee', type: 'remote', url: '/core/employees', labelOf: EMPLOYEE, span: 6 },
    { name: 'incident_type', label: 'type', type: 'remote', url: '/hr/incident-types', span: 6 },
    { name: 'happened_at', label: 'date', type: 'date', required: true },
    { name: 'description', label: 'description', type: 'textarea', required: true },
  ] }]} transform={(p) => ({ ...p, happened_at: p.happened_at && String(p.happened_at).length === 10 ? `${p.happened_at}T09:00:00` : p.happened_at })} />
)

export const IncidentTypeForm = () => (
  <ResourceForm title="type" url="/hr/incident-types" back="/hr/incidents?tab=types" sections={[{ fields: [{ name: 'name', label: 'name', required: true }] }]} />
)

interface Attendance { id: number; employee_name: string; date: string; arrived_at: string | null; left_at: string | null; late: boolean; late_reason: string }

export function AttendancePage() {
  const { t } = useTranslation()
  const columns: ColumnDef<Attendance, unknown>[] = [
    { id: 'date', header: t('date'), cell: ({ row }) => <span className="tabular">{date(row.original.date)}</span>, meta: { sortKey: 'date' } },
    { id: 'employee', header: t('hr.employee'), cell: ({ row }) => <span className="font-medium">{row.original.employee_name}</span> },
    { id: 'arrived', header: t('hr.arrived'), cell: ({ row }) => <span className="tabular">{row.original.arrived_at?.slice(0, 5) ?? '—'}</span> },
    { id: 'left', header: t('hr.left'), cell: ({ row }) => <span className="tabular">{row.original.left_at?.slice(0, 5) ?? '—'}</span> },
    { id: 'late', header: t('hr.late'), cell: ({ row }) => (row.original.late ? <Badge tone="warn">{row.original.late_reason || t('hr.late')}</Badge> : null) },
  ]
  return <ResourceList<Attendance> title="menu.attendance" url="/hr/attendance" base="/hr/attendance" columns={columns} writePermission="hr.manage" defaultSort="date" defaultOrder="desc" />
}

export const AttendanceForm = () => (
  <ResourceForm title="hr.attendance" url="/hr/attendance" back="/hr/attendance" defaults={{ date: new Date().toISOString().slice(0, 10) }} sections={[{ fields: [
    { name: 'employee', label: 'hr.employee', type: 'remote', url: '/core/employees', labelOf: EMPLOYEE, required: true },
    { name: 'date', label: 'date', type: 'date', required: true, span: 4 },
    { name: 'arrived_at', label: 'hr.arrived', type: 'time', span: 4 },
    { name: 'left_at', label: 'hr.left', type: 'time', span: 4 },
    { name: 'late', label: 'hr.late', type: 'switch', span: 4 },
    { name: 'late_reason', label: 'hr.late_reason', hidden: (v) => !v.late, span: 8 },
  ] }]} />
)
