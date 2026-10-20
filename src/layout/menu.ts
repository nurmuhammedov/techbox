import {
  IconAdjustments,
  IconBoxSeam,
  IconBuildingFactory2,
  IconBuildingWarehouse,
  IconCalendarTime,
  IconCash,
  IconClipboardList,
  IconDroplet,
  IconFlask,
  IconHistory,
  IconLayersIntersect,
  IconLayoutKanban,
  IconListCheck,
  IconNeedleThread,
  IconPackage,
  IconPrinter,
  IconRecycle,
  IconShieldCheck,
  IconShieldLock,
  IconTruckDelivery,
  IconUserCircle,
  IconUsers,
  IconUsersGroup,
  IconAlertTriangle,
  IconBolt,
  IconStack2,
  IconArrowsSplit,
} from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'

export interface MenuItem {
  label: string
  to: string
  icon: Icon
  perms: string[]
}

export interface MenuGroup {
  label: string
  items: MenuItem[]
}

export const MENU: MenuGroup[] = [
  {
    label: 'menu.work',
    items: [
      { label: 'stage.gofra', to: '/work/gofra', icon: IconLayersIntersect, perms: ['production.gofra'] },
      { label: 'stage.fleksa', to: '/work/fleksa', icon: IconPrinter, perms: ['production.fleksa'] },
      { label: 'stage.tikish', to: '/work/tikish', icon: IconNeedleThread, perms: ['production.tikish'] },
      { label: 'stage.yelimlash', to: '/work/yelimlash', icon: IconDroplet, perms: ['production.yelimlash'] },
    ],
  },
  {
    label: 'menu.production',
    items: [
      { label: 'menu.board', to: '/production', icon: IconLayoutKanban, perms: ['production.board', 'production.plan'] },
      { label: 'menu.plan', to: '/production/plan', icon: IconArrowsSplit, perms: ['production.plan'] },
      { label: 'menu.batches', to: '/production/batches', icon: IconStack2, perms: ['production.plan', 'production.board', 'inventory.allocate'] },
      { label: 'menu.finished', to: '/production/stock', icon: IconPackage, perms: ['production.board', 'sales.manage', 'production.plan'] },
    ],
  },
  {
    label: 'menu.sales',
    items: [
      { label: 'menu.orders', to: '/sales/orders', icon: IconClipboardList, perms: ['orders.view', 'orders.view_all', 'orders.manage'] },
      { label: 'menu.customers', to: '/sales/customers', icon: IconUsersGroup, perms: ['customers.view', 'customers.manage'] },
      { label: 'menu.products', to: '/sales/products', icon: IconBoxSeam, perms: ['products.view', 'products.manage'] },
      { label: 'menu.sales_list', to: '/sales/sales', icon: IconCash, perms: ['sales.manage'] },
    ],
  },
  {
    label: 'menu.inventory',
    items: [
      { label: 'menu.stock', to: '/inventory', icon: IconBuildingWarehouse, perms: ['inventory.view', 'inventory.manage', 'inventory.allocate'] },
      { label: 'menu.allocate', to: '/inventory/allocate', icon: IconListCheck, perms: ['inventory.allocate'] },
      { label: 'menu.outlays', to: '/inventory/outlays', icon: IconTruckDelivery, perms: ['inventory.manage'] },
      { label: 'menu.waste', to: '/inventory/waste', icon: IconRecycle, perms: ['waste.manage'] },
    ],
  },
  {
    label: 'menu.chemicals',
    items: [
      { label: 'menu.chemicals', to: '/chemicals', icon: IconFlask, perms: ['chemicals.manage'] },
      { label: 'menu.communal', to: '/communal', icon: IconBolt, perms: ['communal.manage'] },
    ],
  },
  {
    label: 'menu.hr',
    items: [
      { label: 'menu.employees', to: '/hr/employees', icon: IconUsers, perms: ['hr.view', 'hr.manage'] },
      { label: 'menu.safety', to: '/hr/safety', icon: IconShieldCheck, perms: ['hr.view', 'hr.manage'] },
      { label: 'menu.incidents', to: '/hr/incidents', icon: IconAlertTriangle, perms: ['hr.view', 'hr.manage'] },
      { label: 'menu.attendance', to: '/hr/attendance', icon: IconCalendarTime, perms: ['hr.view', 'hr.manage'] },
    ],
  },
  {
    label: 'menu.admin',
    items: [
      { label: 'menu.users', to: '/admin/users', icon: IconUserCircle, perms: ['users.manage'] },
      { label: 'menu.roles', to: '/admin/roles', icon: IconShieldLock, perms: ['roles.manage'] },
      { label: 'menu.reference', to: '/admin/reference', icon: IconBuildingFactory2, perms: ['catalog.manage', 'warehouses.manage'] },
      { label: 'menu.settings', to: '/admin/settings', icon: IconAdjustments, perms: ['settings.manage'] },
      { label: 'menu.audit', to: '/admin/audit', icon: IconHistory, perms: ['audit.view'] },
    ],
  },
]

export function homeFor(can: (...codes: string[]) => boolean, roleHome?: string | null) {
  if (roleHome) return roleHome
  for (const group of MENU) for (const item of group.items) if (can(...item.perms)) return item.to
  return '/profile'
}
