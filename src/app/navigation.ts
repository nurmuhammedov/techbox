import {
  AlertTriangle,
  Building2,
  CalendarClock,
  ClipboardList,
  Droplets,
  Factory,
  FlaskConical,
  History,
  KanbanSquare,
  Layers,
  LayoutGrid,
  ListChecks,
  Package,
  PackageCheck,
  PackageOpen,
  Printer,
  Recycle,
  Scissors,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  SplitSquareHorizontal,
  Truck,
  UserCog,
  Users,
  UsersRound,
  Warehouse,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  perms: string[]
}

export interface NavGroup {
  key: string
  label: string
  icon: LucideIcon
  items: NavItem[]
}

export const NAVIGATION: NavGroup[] = [
  {
    key: 'work',
    label: 'menu.work',
    icon: Factory,
    items: [
      { to: '/work/gofra', label: 'stage.gofra', icon: Layers, perms: ['production.gofra'] },
      { to: '/work/fleksa', label: 'stage.fleksa', icon: Printer, perms: ['production.fleksa'] },
      { to: '/work/tikish', label: 'stage.tikish', icon: Scissors, perms: ['production.tikish'] },
      { to: '/work/yelimlash', label: 'stage.yelimlash', icon: Droplets, perms: ['production.yelimlash'] },
    ],
  },
  {
    key: 'production',
    label: 'menu.production',
    icon: KanbanSquare,
    items: [
      { to: '/production', label: 'menu.board', icon: KanbanSquare, perms: ['production.board', 'production.plan'] },
      { to: '/production/plan', label: 'menu.plan', icon: SplitSquareHorizontal, perms: ['production.plan'] },
      {
        to: '/production/batches',
        label: 'menu.batches',
        icon: LayoutGrid,
        perms: ['production.plan', 'production.board', 'inventory.allocate'],
      },
      {
        to: '/production/semi',
        label: 'menu.semi',
        icon: PackageOpen,
        perms: ['production.board', 'production.plan'],
      },
      {
        to: '/production/stock',
        label: 'menu.finished',
        icon: PackageCheck,
        perms: ['production.board', 'sales.manage', 'production.plan'],
      },
    ],
  },
  {
    key: 'sales',
    label: 'menu.sales',
    icon: ShoppingCart,
    items: [
      {
        to: '/sales/orders',
        label: 'menu.orders',
        icon: ClipboardList,
        perms: ['orders.view', 'orders.view_all', 'orders.manage'],
      },
      { to: '/sales/customers', label: 'menu.customers', icon: UsersRound, perms: ['customers.view', 'customers.manage'] },
      { to: '/sales/products', label: 'menu.products', icon: Package, perms: ['products.view', 'products.manage'] },
      { to: '/sales/sales', label: 'menu.sales_list', icon: Wallet, perms: ['sales.manage'] },
    ],
  },
  {
    key: 'inventory',
    label: 'menu.inventory',
    icon: Warehouse,
    items: [
      {
        to: '/inventory',
        label: 'menu.stock',
        icon: Warehouse,
        perms: ['inventory.view', 'inventory.manage', 'inventory.allocate'],
      },
      { to: '/inventory/allocate', label: 'menu.allocate', icon: ListChecks, perms: ['inventory.allocate'] },
      { to: '/inventory/outlays', label: 'menu.outlays', icon: Truck, perms: ['inventory.manage'] },
      { to: '/inventory/waste', label: 'menu.waste', icon: Recycle, perms: ['waste.manage'] },
    ],
  },
  {
    key: 'chemicals',
    label: 'menu.chemicals',
    icon: FlaskConical,
    items: [{ to: '/chemicals', label: 'menu.chemicals', icon: FlaskConical, perms: ['chemicals.manage'] }],
  },
  {
    key: 'communal',
    label: 'menu.communal',
    icon: Zap,
    items: [{ to: '/communal', label: 'menu.communal', icon: Zap, perms: ['communal.manage'] }],
  },
  {
    key: 'hr',
    label: 'menu.hr',
    icon: Users,
    items: [
      { to: '/hr/employees', label: 'menu.employees', icon: Users, perms: ['hr.view', 'hr.manage'] },
      { to: '/hr/safety', label: 'menu.safety', icon: ShieldCheck, perms: ['hr.view', 'hr.manage'] },
      { to: '/hr/incidents', label: 'menu.incidents', icon: AlertTriangle, perms: ['hr.view', 'hr.manage'] },
      { to: '/hr/attendance', label: 'menu.attendance', icon: CalendarClock, perms: ['hr.view', 'hr.manage'] },
    ],
  },
  {
    key: 'admin',
    label: 'menu.admin',
    icon: Settings2,
    items: [
      { to: '/admin/users', label: 'menu.users', icon: UserCog, perms: ['users.manage'] },
      { to: '/admin/roles', label: 'menu.roles', icon: ShieldCheck, perms: ['roles.manage'] },
      {
        to: '/admin/reference',
        label: 'menu.reference',
        icon: Building2,
        perms: ['catalog.manage', 'warehouses.manage'],
      },
      { to: '/admin/settings', label: 'menu.settings', icon: SlidersHorizontal, perms: ['settings.manage'] },
      { to: '/admin/audit', label: 'menu.audit', icon: History, perms: ['audit.view'] },
    ],
  },
]

export function homeFor(can: (...codes: string[]) => boolean, roleHome?: string | null) {
  if (roleHome) return roleHome
  for (const group of NAVIGATION) for (const item of group.items) if (can(...item.perms)) return item.to
  return '/profile'
}

/** Whether `item` is the screen in view; `/production` and `/inventory` match only themselves, not their children. */
export function isActive(item: NavItem, all: NavItem[], pathname: string) {
  if (pathname === item.to) return true
  if (!pathname.startsWith(`${item.to}/`)) return false
  return !all.some((other) => other !== item && other.to.startsWith(`${item.to}/`) && pathname.startsWith(other.to))
}
