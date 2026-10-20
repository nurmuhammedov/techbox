import { Alert, Badge, Stack, Text } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import type { Employee } from '@/api/types'
import { CrudPage } from '@/components/CrudPage'
import { date, dateTime } from '@/lib/format'

const EMPLOYEE_NAME = (r: Record<string, unknown>) => String(r.full_name)

export function Employees() {
  const { t } = useTranslation()
  return (
    <CrudPage<Employee>
      title="menu.employees"
      subtitle="hr.employees_hint"
      url="/core/employees"
      writePermission="hr.manage"
      columns={[
        { key: 'full_name', title: t('hr.full_name'), render: (e) => <Stack gap={0}><Text size="sm" fw={500}>{e.full_name}</Text>{e.blacklisted && <Badge color="red" size="xs">{t('hr.blacklisted')}</Badge>}</Stack> },
        { key: 'position_name', title: t('hr.position') },
        { key: 'phone', title: t('phone') },
        { key: 'username', title: t('login.username'), hideOnMobile: true, render: (e) => e.username ?? '—' },
        { key: 'is_active', title: t('status'), render: (e) => <Badge color={e.is_active ? 'teal' : 'gray'} variant="light">{e.is_active ? t('active') : t('inactive')}</Badge> },
      ]}
      fields={[
        { name: 'last_name', label: 'hr.last_name', required: true, span: 6 },
        { name: 'first_name', label: 'hr.first_name', required: true, span: 6 },
        { name: 'middle_name', label: 'hr.middle_name', span: 6 },
        { name: 'phone', label: 'phone', span: 6 },
        { name: 'position', label: 'hr.position', type: 'remote', url: '/core/positions', span: 6 },
        { name: 'hired_at', label: 'hr.hired_at', type: 'date', span: 6 },
        { name: 'birthday', label: 'hr.birthday', type: 'date', span: 6 },
        { name: 'passport', label: 'hr.passport', span: 6 },
        { name: 'pinfl', label: 'hr.pinfl', span: 6 },
        { name: 'card_number', label: 'hr.card', span: 6 },
        { name: 'address', label: 'hr.address' },
        { name: 'is_active', label: 'active', type: 'switch', span: 6 },
        { name: 'blacklisted', label: 'hr.blacklisted', type: 'switch', span: 6 },
        { name: 'blacklist_reason', label: 'hr.blacklist_reason', hidden: (v) => !v.blacklisted },
      ]}
      defaults={{ is_active: true }}
    />
  )
}

export function Safety() {
  const { t } = useTranslation()
  const alerts = useQuery({ queryKey: ['hr', 'alerts'], queryFn: () => api.get<{ certificates: unknown[]; contracts: unknown[] }>('/hr/alerts') })
  return (
    <>
      {!!alerts.data?.certificates.length && (
        <Alert color="orange" mb="md">
          {t('hr.cert_alert', { n: alerts.data.certificates.length })}
        </Alert>
      )}
      <CrudPage<{ id: number; employee_name: string; number: string; issued_at: string; valid_until: string; is_daily: boolean; expired: boolean }>
        title="menu.safety"
        url="/hr/certificates"
        writePermission="hr.manage"
        columns={[
          { key: 'employee_name', title: t('hr.employee') },
          { key: 'number', title: t('hr.cert_number') },
          { key: 'issued_at', title: t('hr.issued'), render: (c) => date(c.issued_at) },
          { key: 'valid_until', title: t('hr.valid_until'), render: (c) => <Text size="sm" c={c.expired ? 'red' : undefined}>{date(c.valid_until)}</Text> },
          { key: 'is_daily', title: t('hr.daily'), render: (c) => (c.is_daily ? '✓' : '') },
        ]}
        fields={[
          { name: 'employee', label: 'hr.employee', type: 'remote', url: '/core/employees', labelOf: EMPLOYEE_NAME, required: true },
          { name: 'number', label: 'hr.cert_number', required: true, span: 6 },
          { name: 'issued_at', label: 'hr.issued', type: 'date', span: 6 },
          { name: 'valid_until', label: 'hr.valid_until', type: 'date', required: true, span: 6 },
          { name: 'is_daily', label: 'hr.daily', type: 'switch', span: 6 },
          { name: 'file', label: 'file', type: 'file' },
        ]}
      />
    </>
  )
}

export function Incidents() {
  const { t } = useTranslation()
  return (
    <CrudPage<{ id: number; employee_name: string | null; type_name: string | null; happened_at: string; description: string }>
      title="menu.incidents"
      url="/hr/incidents"
      writePermission="hr.manage"
      columns={[
        { key: 'happened_at', title: t('date'), render: (i) => dateTime(i.happened_at) },
        { key: 'employee_name', title: t('hr.employee') },
        { key: 'type_name', title: t('type') },
        { key: 'description', title: t('description') },
      ]}
      fields={[
        { name: 'employee', label: 'hr.employee', type: 'remote', url: '/core/employees', labelOf: EMPLOYEE_NAME, span: 6 },
        { name: 'incident_type', label: 'type', type: 'remote', url: '/hr/incident-types', span: 6 },
        { name: 'happened_at', label: 'date', type: 'datetime', required: true },
        { name: 'description', label: 'description', type: 'textarea', required: true },
      ]}
    />
  )
}

export function Attendance() {
  const { t } = useTranslation()
  return (
    <CrudPage<{ id: number; employee_name: string; date: string; arrived_at: string | null; left_at: string | null; late: boolean; late_reason: string }>
      title="menu.attendance"
      url="/hr/attendance"
      writePermission="hr.manage"
      columns={[
        { key: 'date', title: t('date'), render: (a) => date(a.date) },
        { key: 'employee_name', title: t('hr.employee') },
        { key: 'arrived_at', title: t('hr.arrived'), render: (a) => a.arrived_at?.slice(0, 5) ?? '—' },
        { key: 'left_at', title: t('hr.left'), render: (a) => a.left_at?.slice(0, 5) ?? '—' },
        { key: 'late', title: t('hr.late'), render: (a) => (a.late ? <Badge color="orange" variant="light">{a.late_reason || t('hr.late')}</Badge> : '') },
      ]}
      fields={[
        { name: 'employee', label: 'hr.employee', type: 'remote', url: '/core/employees', labelOf: EMPLOYEE_NAME, required: true },
        { name: 'date', label: 'date', type: 'date', required: true, span: 4 },
        { name: 'arrived_at', label: 'hr.arrived', type: 'time', span: 4 },
        { name: 'left_at', label: 'hr.left', type: 'time', span: 4 },
        { name: 'late', label: 'hr.late', type: 'switch', span: 4 },
        { name: 'late_reason', label: 'hr.late_reason', hidden: (v) => !v.late, span: 8 },
      ]}
      defaults={{ date: new Date().toISOString() }}
    />
  )
}
