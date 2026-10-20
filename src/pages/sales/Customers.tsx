import { CrudPage } from '@/components/CrudPage'
import type { Customer } from '@/api/types'
import { useTranslation } from 'react-i18next'

export default function Customers() {
  const { t } = useTranslation()
  return (
    <CrudPage<Customer>
      title="menu.customers"
      url="/sales/customers"
      writePermission="customers.manage"
      columns={[
        { key: 'company', title: t('customer.company') },
        { key: 'contact_name', title: t('customer.contact') },
        { key: 'phone', title: t('phone') },
        { key: 'tin', title: t('customer.tin'), hideOnMobile: true },
        { key: 'orders_count', title: t('menu.orders'), align: 'right' },
      ]}
      fields={[
        { name: 'company', label: 'customer.company', required: true },
        { name: 'contact_name', label: 'customer.contact', span: 6 },
        { name: 'phone', label: 'phone', span: 6 },
        { name: 'tin', label: 'customer.tin', span: 6 },
        { name: 'since_year', label: 'customer.since', type: 'number', span: 6 },
        { name: 'note', label: 'note', type: 'textarea' },
      ]}
    />
  )
}
