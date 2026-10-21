import { Lock } from 'lucide-react'
import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'

import { homeFor } from '@/app/navigation'
import { Shell } from '@/app/shell'
import { useAuth } from '@/auth/AuthContext'
import { LoginPage } from '@/features/auth/login'
import { RealtimeProvider } from '@/realtime/RealtimeProvider'
import { EmptyState, Spinner } from '@/ui/feedback'

const page = <T,>(load: () => Promise<T>, name: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[name] as unknown as ComponentType })))

const sales = () => import('@/features/sales/orders')
const catalog = () => import('@/features/sales/catalog')
const production = () => import('@/features/production/batches')
const work = () => import('@/features/work/work')
const inventory = () => import('@/features/inventory/inventory')
const chemicals = () => import('@/features/chemicals/chemicals')
const communal = () => import('@/features/communal/communal')
const hr = () => import('@/features/hr/hr')
const admin = () => import('@/features/admin/admin')
const profile = () => import('@/features/auth/profile')

const P = {
  Board: page(() => import('@/features/production/board'), 'BoardPage'),
  Plan: page(() => import('@/features/production/plan'), 'PlanPage'),
  Batches: page(production, 'BatchesPage'),
  Batch: page(production, 'BatchDetailPage'),
  Finished: page(production, 'FinishedStockPage'),
  Semi: page(production, 'SemiStockPage'),
  Item: page(production, 'ItemDetailPage'),
  Sell: page(production, 'SellPage'),
  Split: page(production, 'SplitPage'),
  Return: page(production, 'ReturnPage'),
  Work: page(work, 'StageWorkPage'),
  ItemFinish: page(work, 'ItemFinishPage'),
  BatchFinish: page(work, 'BatchFinishPage'),
  Orders: page(sales, 'OrdersPage'),
  OrderForm: page(sales, 'OrderFormPage'),
  Order: page(sales, 'OrderDetailPage'),
  Customers: page(catalog, 'CustomersPage'),
  CustomerForm: page(catalog, 'CustomerFormPage'),
  Products: page(catalog, 'ProductsPage'),
  ProductForm: page(catalog, 'ProductFormPage'),
  Sales: page(catalog, 'SalesPage'),
  Stock: page(inventory, 'StockPage'),
  RollForm: page(inventory, 'RollFormPage'),
  RollAdjust: page(inventory, 'RollAdjustPage'),
  AllocateList: page(inventory, 'AllocateListPage'),
  Allocate: page(inventory, 'AllocateBatchPage'),
  Outlays: page(inventory, 'OutlaysPage'),
  OutlayForm: page(inventory, 'OutlayFormPage'),
  Waste: page(inventory, 'WastePage'),
  WasteSell: page(inventory, 'WasteSellPage'),
  Chemicals: page(chemicals, 'ChemicalsPage'),
  LotForm: page(chemicals, 'ChemicalLotForm'),
  ChemTypeForm: page(chemicals, 'ChemicalTypeForm'),
  GlueTypeForm: page(chemicals, 'GlueTypeForm'),
  GlueMake: page(chemicals, 'GlueMakePage'),
  Communal: page(communal, 'CommunalPage'),
  ReportForm: page(communal, 'ReportForm'),
  ResourceForm: page(communal, 'ResourceFormPage'),
  TariffForm: page(communal, 'TariffForm'),
  UnitForm: page(communal, 'UnitForm'),
  Employees: page(hr, 'EmployeesPage'),
  EmployeeForm: page(hr, 'EmployeeForm'),
  ContractForm: page(hr, 'ContractForm'),
  PositionForm: page(hr, 'PositionForm'),
  Safety: page(hr, 'SafetyPage'),
  SafetyForm: page(hr, 'SafetyForm'),
  Incidents: page(hr, 'IncidentsPage'),
  IncidentForm: page(hr, 'IncidentForm'),
  IncidentTypeForm: page(hr, 'IncidentTypeForm'),
  Attendance: page(hr, 'AttendancePage'),
  AttendanceForm: page(hr, 'AttendanceForm'),
  Users: page(admin, 'UsersPage'),
  UserForm: page(admin, 'UserForm'),
  Roles: page(admin, 'RolesPage'),
  RoleForm: page(admin, 'RoleFormPage'),
  Reference: page(admin, 'ReferencePage'),
  ReferenceForm: page(admin, 'ReferenceFormPage'),
  Settings: page(admin, 'SettingsPage'),
  Audit: page(admin, 'AuditPage'),
  Profile: page(profile, 'ProfilePage'),
  Notifications: page(profile, 'NotificationsPage'),
}

const STAGES = ['production.gofra', 'production.fleksa', 'production.tikish', 'production.yelimlash', 'production.plan', 'production.board']
const ORDERS = ['orders.view', 'orders.view_all', 'orders.manage', 'production.plan', 'production.board']

function Guard({ perms, children }: { perms: string[]; children: ReactNode }) {
  const { can } = useAuth()
  const { t } = useTranslation()
  if (perms.length && !can(...perms)) return <div className="p-10"><EmptyState icon={Lock} title={t('forbidden')} /></div>
  return <Suspense fallback={<div className="flex h-60 items-center justify-center"><Spinner /></div>}>{children}</Suspense>
}

export default function App() {
  const { user, loading, can } = useAuth()
  if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>
  if (!user) return <Routes><Route path="*" element={<LoginPage />} /></Routes>
  const home = homeFor(can, user.role?.home)
  const r = (path: string, perms: string[], el: ReactNode) => <Route key={path} path={path} element={<Guard perms={perms}>{el}</Guard>} />
  return (
    <RealtimeProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Navigate to={home} replace />} />
          {r('work/:stage', STAGES, <P.Work />)}
          {r('work/gofra/:id/finish', ['production.gofra', 'production.plan'], <P.BatchFinish />)}
          {r('work/:stage/:id/finish', STAGES, <P.ItemFinish />)}
          {r('production', ['production.board', 'production.plan'], <P.Board />)}
          {r('production/plan', ['production.plan'], <P.Plan />)}
          {r('production/plan/:id', ['production.plan'], <P.Plan />)}
          {r('production/batches', ['production.plan', 'production.board', 'inventory.allocate'], <P.Batches />)}
          {r('production/batches/:id', ['production.plan', 'production.board', 'inventory.allocate', 'production.gofra'], <P.Batch />)}
          {r('production/semi', ['production.board', 'production.plan'], <P.Semi />)}
          {r('production/stock', ['production.board', 'sales.manage', 'production.plan'], <P.Finished />)}
          {r('production/items/:id', [...STAGES, 'sales.manage', 'orders.view', 'orders.view_all'], <P.Item />)}
          {r('production/items/:id/sell', ['sales.manage'], <P.Sell />)}
          {r('production/items/:id/split', ['production.plan'], <P.Split />)}
          {r('sales/orders', ORDERS, <P.Orders />)}
          {r('sales/orders/new', ['orders.manage'], <P.OrderForm />)}
          {r('sales/orders/:id', ORDERS, <P.Order />)}
          {r('sales/orders/:id/edit', ['orders.manage'], <P.OrderForm />)}
          {r('sales/customers', ['customers.view', 'customers.manage'], <P.Customers />)}
          {r('sales/customers/new', ['customers.manage'], <P.CustomerForm />)}
          {r('sales/customers/:id/edit', ['customers.manage'], <P.CustomerForm />)}
          {r('sales/products', ['products.view', 'products.manage'], <P.Products />)}
          {r('sales/products/new', ['products.manage'], <P.ProductForm />)}
          {r('sales/products/:id/edit', ['products.manage'], <P.ProductForm />)}
          {r('sales/sales', ['sales.manage'], <P.Sales />)}
          {r('sales/sales/:id/return', ['sales.manage'], <P.Return />)}
          {r('inventory', ['inventory.view', 'inventory.manage', 'inventory.allocate'], <P.Stock />)}
          {r('inventory/rolls/new', ['inventory.manage'], <P.RollForm />)}
          {r('inventory/rolls/:id/edit', ['inventory.manage'], <P.RollForm />)}
          {r('inventory/rolls/:id/adjust', ['inventory.manage'], <P.RollAdjust />)}
          {r('inventory/allocate', ['inventory.allocate'], <P.AllocateList />)}
          {r('inventory/allocate/:id', ['inventory.allocate'], <P.Allocate />)}
          {r('inventory/outlays', ['inventory.manage'], <P.Outlays />)}
          {r('inventory/outlays/new', ['inventory.manage'], <P.OutlayForm />)}
          {r('inventory/waste', ['waste.manage'], <P.Waste />)}
          {r('inventory/waste/sell', ['waste.manage'], <P.WasteSell />)}
          {r('chemicals', ['chemicals.manage'], <P.Chemicals />)}
          {r('chemicals/lots/new', ['chemicals.manage'], <P.LotForm />)}
          {r('chemicals/types/new', ['chemicals.manage'], <P.ChemTypeForm />)}
          {r('chemicals/types/:id/edit', ['chemicals.manage'], <P.ChemTypeForm />)}
          {r('chemicals/glue-types/new', ['chemicals.manage'], <P.GlueTypeForm />)}
          {r('chemicals/glue-types/:id/edit', ['chemicals.manage'], <P.GlueTypeForm />)}
          {r('chemicals/glue/new', ['chemicals.manage'], <P.GlueMake />)}
          {r('communal', ['communal.manage'], <P.Communal />)}
          {r('communal/reports/new', ['communal.manage'], <P.ReportForm />)}
          {r('communal/reports/:id/edit', ['communal.manage'], <P.ReportForm />)}
          {r('communal/resources/new', ['communal.manage'], <P.ResourceForm />)}
          {r('communal/resources/:id/edit', ['communal.manage'], <P.ResourceForm />)}
          {r('communal/tariffs/new', ['communal.manage'], <P.TariffForm />)}
          {r('communal/tariffs/:id/edit', ['communal.manage'], <P.TariffForm />)}
          {r('communal/units/new', ['communal.manage'], <P.UnitForm />)}
          {r('communal/units/:id/edit', ['communal.manage'], <P.UnitForm />)}
          {r('hr/employees', ['hr.view', 'hr.manage'], <P.Employees />)}
          {r('hr/employees/new', ['hr.manage'], <P.EmployeeForm />)}
          {r('hr/employees/:id/edit', ['hr.manage'], <P.EmployeeForm />)}
          {r('hr/contracts/new', ['hr.manage'], <P.ContractForm />)}
          {r('hr/contracts/:id/edit', ['hr.manage'], <P.ContractForm />)}
          {r('hr/positions/new', ['hr.manage'], <P.PositionForm />)}
          {r('hr/positions/:id/edit', ['hr.manage'], <P.PositionForm />)}
          {r('hr/safety', ['hr.view', 'hr.manage'], <P.Safety />)}
          {r('hr/safety/new', ['hr.manage'], <P.SafetyForm />)}
          {r('hr/safety/:id/edit', ['hr.manage'], <P.SafetyForm />)}
          {r('hr/incidents', ['hr.view', 'hr.manage'], <P.Incidents />)}
          {r('hr/incidents/new', ['hr.manage'], <P.IncidentForm />)}
          {r('hr/incidents/:id/edit', ['hr.manage'], <P.IncidentForm />)}
          {r('hr/incident-types/new', ['hr.manage'], <P.IncidentTypeForm />)}
          {r('hr/incident-types/:id/edit', ['hr.manage'], <P.IncidentTypeForm />)}
          {r('hr/attendance', ['hr.view', 'hr.manage'], <P.Attendance />)}
          {r('hr/attendance/new', ['hr.manage'], <P.AttendanceForm />)}
          {r('hr/attendance/:id/edit', ['hr.manage'], <P.AttendanceForm />)}
          {r('admin/users', ['users.manage'], <P.Users />)}
          {r('admin/users/new', ['users.manage'], <P.UserForm />)}
          {r('admin/users/:id/edit', ['users.manage'], <P.UserForm />)}
          {r('admin/roles', ['roles.manage'], <P.Roles />)}
          {r('admin/roles/new', ['roles.manage'], <P.RoleForm />)}
          {r('admin/roles/:id/edit', ['roles.manage'], <P.RoleForm />)}
          {r('admin/reference', ['catalog.manage', 'warehouses.manage'], <P.Reference />)}
          {r('admin/reference/:section', ['catalog.manage', 'warehouses.manage'], <P.Reference />)}
          {r('admin/reference/:section/new', ['catalog.manage', 'warehouses.manage'], <P.ReferenceForm />)}
          {r('admin/reference/:section/:id/edit', ['catalog.manage', 'warehouses.manage'], <P.ReferenceForm />)}
          {r('admin/settings', ['settings.manage'], <P.Settings />)}
          {r('admin/audit', ['audit.view'], <P.Audit />)}
          {r('profile', [], <P.Profile />)}
          {r('notifications', [], <P.Notifications />)}
          <Route path="*" element={<Navigate to={home} replace />} />
        </Route>
      </Routes>
    </RealtimeProvider>
  )
}
