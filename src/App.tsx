import { Center, Loader, Stack, Text, Title } from '@mantine/core'
import { lazy, ReactNode, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { homeFor } from '@/layout/menu'
import { Shell } from '@/layout/Shell'
import { RealtimeProvider } from '@/realtime/RealtimeProvider'

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

const Audit = lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.Audit })))
const Reference = lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.Reference })))
const Roles = lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.Roles })))
const Settings = lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.Settings })))
const Users = lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.Users })))
const Chemicals = lazy(() => import('@/pages/chemicals/Chemicals'))
const Communal = lazy(() => import('@/pages/communal/Communal'))
const Attendance = lazy(() => import('@/pages/hr/Hr').then((m) => ({ default: m.Attendance })))
const Employees = lazy(() => import('@/pages/hr/Hr').then((m) => ({ default: m.Employees })))
const Incidents = lazy(() => import('@/pages/hr/Hr').then((m) => ({ default: m.Incidents })))
const Safety = lazy(() => import('@/pages/hr/Hr').then((m) => ({ default: m.Safety })))
const AllocateBatch = lazy(() => import('@/pages/inventory/Allocate').then((m) => ({ default: m.AllocateBatch })))
const AllocateList = lazy(() => import('@/pages/inventory/Allocate').then((m) => ({ default: m.AllocateList })))
const Outlays = lazy(() => import('@/pages/inventory/Other').then((m) => ({ default: m.Outlays })))
const Waste = lazy(() => import('@/pages/inventory/Other').then((m) => ({ default: m.Waste })))
const Stock = lazy(() => import('@/pages/inventory/Stock'))
const Login = lazy(() => import('@/pages/Login'))
const BatchDetail = lazy(() => import('@/pages/production/Batches').then((m) => ({ default: m.BatchDetail })))
const BatchList = lazy(() => import('@/pages/production/Batches').then((m) => ({ default: m.BatchList })))
const Board = lazy(() => import('@/pages/production/Board'))
const FinishedStock = lazy(() => import('@/pages/production/Items').then((m) => ({ default: m.FinishedStock })))
const ItemDetail = lazy(() => import('@/pages/production/Items').then((m) => ({ default: m.ItemDetail })))
const Plan = lazy(() => import('@/pages/production/Plan'))
const Notifications = lazy(() => import('@/pages/Profile').then((m) => ({ default: m.Notifications })))
const Profile = lazy(() => import('@/pages/Profile').then((m) => ({ default: m.Profile })))
const Customers = lazy(() => import('@/pages/sales/Customers'))
const Orders = lazy(() => import('@/pages/sales/Orders'))
const Products = lazy(() => import('@/pages/sales/Products'))
const Sales = lazy(() => import('@/pages/sales/Sales'))
const StageWork = lazy(() => import('@/pages/work/StageWork'))

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
        <Route path="*" element={<Suspense fallback={null}><Login /></Suspense>} />
      </Routes>
    )
  const home = homeFor(can, user.role?.home)
  const g = (perms: string[], el: ReactNode) => (
    <Guard perms={perms}>
      <Suspense fallback={<Center h="40vh"><Loader /></Center>}>{el}</Suspense>
    </Guard>
  )
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
          <Route path="profile" element={g([], <Profile />)} />
          <Route path="notifications" element={g([], <Notifications />)} />
          <Route path="*" element={<Navigate to={home} replace />} />
        </Route>
      </Routes>
    </RealtimeProvider>
  )
}
