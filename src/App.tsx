import { Center, Loader, Stack, Text, Title } from '@mantine/core'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { homeFor } from '@/layout/menu'
import { Shell } from '@/layout/Shell'
import { RealtimeProvider } from '@/realtime/RealtimeProvider'
import { Audit, Reference, Roles, Settings, Users } from '@/pages/admin/Admin'
import Chemicals from '@/pages/chemicals/Chemicals'
import Communal from '@/pages/communal/Communal'
import { Attendance, Employees, Incidents, Safety } from '@/pages/hr/Hr'
import { AllocateBatch, AllocateList } from '@/pages/inventory/Allocate'
import { Outlays, Waste } from '@/pages/inventory/Other'
import Stock from '@/pages/inventory/Stock'
import Login from '@/pages/Login'
import { BatchDetail, BatchList } from '@/pages/production/Batches'
import Board from '@/pages/production/Board'
import { FinishedStock, ItemDetail } from '@/pages/production/Items'
import Plan from '@/pages/production/Plan'
import { Notifications, Profile } from '@/pages/Profile'
import Customers from '@/pages/sales/Customers'
import Orders from '@/pages/sales/Orders'
import Products from '@/pages/sales/Products'
import Sales from '@/pages/sales/Sales'
import StageWork from '@/pages/work/StageWork'

function Guard({ perms, children }: { perms: string[]; children: ReactNode }) {
  const { can } = useAuth()
  const { t } = useTranslation()
  if (!can(...perms))
    return (
      <Center h="60vh">
        <Stack align="center" gap={4}>
          <Title order={3}>403</Title>
          <Text c="dimmed">{t('forbidden')}</Text>
        </Stack>
      </Center>
    )
  return <>{children}</>
}

const STAGE_PERMS = ['production.gofra', 'production.fleksa', 'production.tikish', 'production.yelimlash', 'production.plan', 'production.board']

export default function App() {
  const { user, loading, can } = useAuth()
  if (loading)
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  if (!user)
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  const home = homeFor(can, user.role?.home)
  const g = (perms: string[], el: ReactNode) => <Guard perms={perms}>{el}</Guard>
  return (
    <RealtimeProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Navigate to={home} replace />} />
          <Route path="work/:stage" element={g(STAGE_PERMS, <StageWork />)} />
          <Route path="production" element={g(['production.board', 'production.plan'], <Board />)} />
          <Route path="production/plan" element={g(['production.plan'], <Plan />)} />
          <Route path="production/plan/:id" element={g(['production.plan'], <Plan />)} />
          <Route path="production/batches" element={g(['production.plan', 'production.board', 'inventory.allocate'], <BatchList />)} />
          <Route path="production/batches/:id" element={g(['production.plan', 'production.board', 'inventory.allocate', 'production.gofra'], <BatchDetail />)} />
          <Route path="production/items/:id" element={g([...STAGE_PERMS, 'sales.manage', 'orders.view', 'orders.view_all'], <ItemDetail />)} />
          <Route path="production/stock" element={g(['production.board', 'sales.manage', 'production.plan'], <FinishedStock />)} />
          <Route path="sales/orders" element={g(['orders.view', 'orders.view_all', 'orders.manage'], <Orders />)} />
          <Route path="sales/customers" element={g(['customers.view', 'customers.manage'], <Customers />)} />
          <Route path="sales/products" element={g(['products.view', 'products.manage'], <Products />)} />
          <Route path="sales/sales" element={g(['sales.manage'], <Sales />)} />
          <Route path="inventory" element={g(['inventory.view', 'inventory.manage', 'inventory.allocate'], <Stock />)} />
          <Route path="inventory/allocate" element={g(['inventory.allocate'], <AllocateList />)} />
          <Route path="inventory/allocate/:id" element={g(['inventory.allocate'], <AllocateBatch />)} />
          <Route path="inventory/outlays" element={g(['inventory.manage'], <Outlays />)} />
          <Route path="inventory/waste" element={g(['waste.manage'], <Waste />)} />
          <Route path="chemicals" element={g(['chemicals.manage'], <Chemicals />)} />
          <Route path="communal" element={g(['communal.manage'], <Communal />)} />
          <Route path="hr/employees" element={g(['hr.view', 'hr.manage'], <Employees />)} />
          <Route path="hr/safety" element={g(['hr.view', 'hr.manage'], <Safety />)} />
          <Route path="hr/incidents" element={g(['hr.view', 'hr.manage'], <Incidents />)} />
          <Route path="hr/attendance" element={g(['hr.view', 'hr.manage'], <Attendance />)} />
          <Route path="admin/users" element={g(['users.manage'], <Users />)} />
          <Route path="admin/roles" element={g(['roles.manage'], <Roles />)} />
          <Route path="admin/reference" element={g(['catalog.manage', 'warehouses.manage'], <Reference />)} />
          <Route path="admin/settings" element={g(['settings.manage'], <Settings />)} />
          <Route path="admin/audit" element={g(['audit.view'], <Audit />)} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="*" element={<Navigate to={home} replace />} />
        </Route>
      </Routes>
    </RealtimeProvider>
  )
}
