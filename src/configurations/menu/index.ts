import { 
    Users, 
    ShieldCheck, 
    Boxes, 
    Layout, 
    Key, 
    Warehouse, 
    Package, 
    Contact, 
    ShoppingCart, 
    Container, 
    ClipboardList, 
    ListTodo, 
    Layers, 
    Printer, 
    Scissors, 
    Droplets, 
    Activity, 
    FlaskConical, 
    TestTube2, 
    Sticker, 
    Columns, 
    Zap,
    ShieldAlert,
    Calendar,
    AlertTriangle,
    Clock,
    Truck,
    PackageCheck,
    Wallet
} from 'lucide-react'
import { ROLE_LIST } from 'constants/roles'
import { IMenuItem } from 'interfaces/configuration.interface'

export const menu: IMenuItem[] = [
	{
		id: 'human_resources',
		label: 'Employees',
		href: '/employees',
		icon: Users,
		allowedRoles: [
			ROLE_LIST.HEAD_DEPARTMENT,
			ROLE_LIST.EMPLOYEE,
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.HEAD_DEPARTMENT]: 1,
			[ROLE_LIST.EMPLOYEE]: 1,
			[ROLE_LIST.ADMIN]: 1
		}
	},
	{
		id: 'role',
		label: 'Roles',
		href: '/roles',
		icon: ShieldCheck,
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 2,
			[ROLE_LIST.EMPLOYEE]: 2
		}
	},
	{
		id: 'material_type',
		label: 'Material types',
		href: '/materials',
		icon: Boxes,
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 3,
			[ROLE_LIST.EMPLOYEE]: 3
		}
	},
	{
		id: 'format',
		label: 'Formats',
		href: '/formats',
		icon: Layout,
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 4,
			[ROLE_LIST.EMPLOYEE]: 4
		}
	},
	{
		id: 'permissions',
		label: 'Permissions',
		href: '/permissions',
		icon: Key,
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 5,
			[ROLE_LIST.EMPLOYEE]: 5
		}
	},
	{
		id: 'storekeeper',
		label: 'Warehouses',
		href: '/warehouses',
		icon: Warehouse,
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 6,
			[ROLE_LIST.EMPLOYEE]: 6
		}
	},
	{
		id: 'products',
		label: 'Products',
		href: '/products',
		icon: Package,
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 8,
			[ROLE_LIST.EMPLOYEE]: 7
		}
	},
	{
		id: 'customers',
		label: 'Clients',
		href: '/clients',
		icon: Contact,
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 7,
			[ROLE_LIST.EMPLOYEE]: 8
		}
	},
	{
		id: 'orders',
		label: 'Orders',
		href: '/orders',
		icon: ShoppingCart,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 9,
			[ROLE_LIST.EMPLOYEE]: 9
		}
	},
	{
		id: 'materials',
		label: 'Materials',
		href: '/warehouses-man',
		icon: Container,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 10,
			[ROLE_LIST.EMPLOYEE]: 10
		}
	},
	{
		id: 'leader',
		label: 'Director orders',
		href: '/director-orders',
		icon: ClipboardList,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 11,
			[ROLE_LIST.EMPLOYEE]: 11
		}
	},
	{
		id: 'operator',
		label: 'Orders',
		href: '/operator-orders',
		icon: ListTodo,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 12,
			[ROLE_LIST.EMPLOYEE]: 12
		}
	},
	{
		id: 'operator_gofra',
		label: 'Corrugation orders',
		href: '/corrugation-orders',
		icon: Layers,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 13,
			[ROLE_LIST.EMPLOYEE]: 13
		}
	},
	{
		id: 'operator_fleksa',
		label: 'Flex orders',
		href: '/flex-orders',
		icon: Printer,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 14,
			[ROLE_LIST.EMPLOYEE]: 14
		}
	},
	{
		id: 'operator_tikish',
		label: 'Sewing orders',
		href: '/sewing-orders',
		icon: Scissors,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 15,
			[ROLE_LIST.EMPLOYEE]: 15
		}
	},
	{
		id: 'operator_yelimlash',
		label: 'Gluing orders',
		href: '/gluing-orders',
		icon: Droplets,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 16,
			[ROLE_LIST.EMPLOYEE]: 16
		}
	},
	{
		id: 'company_operations',
		label: 'Company operations',
		href: '/company-operations',
		icon: Activity,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.EMPLOYEE]: 17
		}
	},
	{
		id: 'chemical_types',
		label: 'Chemical types',
		href: '/chemical-types',
		icon: FlaskConical,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.EMPLOYEE]: 18
		}
	},
	{
		id: 'chemicals',
		label: 'Chemicals',
		href: '/chemicals',
		icon: TestTube2,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.EMPLOYEE]: 19
		}
	},
	{
		id: 'glue',
		label: 'Glue',
		href: '/glue',
		icon: Sticker,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.EMPLOYEE]: 20
		}
	},
	{
		id: 'pallet_leader',
		label: 'Paddonlar',
		href: '/pallet-leader',
		icon: Columns,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.EMPLOYEE]: 21
		}
	},
	{
		id: 'pallet_flex',
		label: 'Paddonlar',
		href: '/pallet-flex',
		icon: Columns,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.EMPLOYEE]: 22
		}
	},
	{
		id: 'pallet_glue',
		label: 'Paddonlar',
		href: '/pallet-glue',
		icon: Columns,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.EMPLOYEE]: 23
		}
	},
	{
		id: 'pallet_bet',
		label: 'Paddonlar',
		href: '/pallet-bet',
		icon: Columns,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.EMPLOYEE]: 24
		}
	},
	{
		id: 'communal',
		label: 'Komunallar',
		href: '/communals',
		icon: Zap,
		items: [
			{label: 'Dashboard', href: '/communals?tab=dashboard'},
			{label: 'Resources', href: '/communals?tab=resources'},
			{label: 'Units', href: '/communals?tab=units'},
			{label: 'Tariflar', href: '/communals?tab=tariffs'},
			{label: 'Hisobotlar', href: '/communals?tab=reports'}
		],
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 25,
			[ROLE_LIST.EMPLOYEE]: 25
		}
	},
	{
		id: 'shipments',
		label: 'Jo‘natmalar',
		href: '/shipments',
		icon: PackageCheck,
		items: [
			{label: 'Umumiy', href: '/shipments?stage=overview'},
			{label: 'Barcha jo‘natmalar', href: '/shipments?stage=all'},
			{label: 'Tayyorlash', href: '/shipments?stage=planned'},
			{label: 'Qadoqlash', href: '/shipments?stage=packing'},
			{label: 'Yuklash', href: '/shipments?stage=loading'},
			{label: 'Haydovchiga topshirish', href: '/shipments?stage=handover'},
			{label: 'Yo‘lda', href: '/shipments?stage=road'},
			{label: 'Yakunlangan', href: '/shipments?stage=done'},
			{label: 'Qaytarilgan tovarlar', href: '/shipments?stage=returns'}
		],
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 26,
			[ROLE_LIST.EMPLOYEE]: 26
		}
	},
	{
		id: 'logistics',
		label: 'Logistika',
		href: '/logistics',
		icon: Truck,
		items: [
			{label: 'Umumiy', href: '/logistics?tab=dashboard'},
			{label: 'Mashinalar', href: '/logistics?tab=transports'},
			{label: 'Haydovchilar', href: '/logistics?tab=drivers'},
			{label: 'Biriktirish', href: '/logistics?tab=assignments'},
			{label: 'Mijoz zavodlari', href: '/logistics?tab=factories'},
			{label: 'Yoqilg‘i', href: '/logistics?tab=fuel'},
			{label: 'Nosozliklar', href: '/logistics?tab=incidents'},
			{label: 'Texnik xizmat', href: '/logistics?tab=maintenance'},
			{label: 'Modellar', href: '/logistics?tab=models'},
			{label: 'Markalar', href: '/logistics?tab=brands'}
		],
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 27,
			[ROLE_LIST.EMPLOYEE]: 27
		}
	},
	{
		id: 'accounting',
		label: 'Buxgalteriya',
		href: '/accounting',
		icon: Wallet,
		items: [
			{label: 'Xarajatlar', href: '/accounting?tab=reports'},
			{label: 'Xarajat turlari', href: '/accounting?tab=types'}
		],
		allowedRoles: [
			ROLE_LIST.ADMIN,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 28,
			[ROLE_LIST.EMPLOYEE]: 28
		}
	},
	{
		id: 'labor_protection',
		label: 'labor_protection',
		href: '/labor-protection',
		icon: ShieldAlert,
		allowedRoles: [
			ROLE_LIST.HEAD_DEPARTMENT
		],
		order: {
			[ROLE_LIST.HEAD_DEPARTMENT]: 2
		}
	},
	{
		id: 'events',
		label: 'events',
		href: '/events',
		icon: Calendar,
		allowedRoles: [
			ROLE_LIST.HEAD_DEPARTMENT
		],
		order: {
			[ROLE_LIST.HEAD_DEPARTMENT]: 3
		}
	},
	{
		id: 'accidents',
		label: 'accidents',
		href: '/accidents',
		icon: AlertTriangle,
		allowedRoles: [
			ROLE_LIST.HEAD_DEPARTMENT
		],
		order: {
			[ROLE_LIST.HEAD_DEPARTMENT]: 4
		}
	},
	{
		id: 'participation',
		label: 'participation',
		href: '/participation',
		icon: Clock,
		allowedRoles: [
			ROLE_LIST.HEAD_DEPARTMENT
		],
		order: {
			[ROLE_LIST.HEAD_DEPARTMENT]: 5
		}
	}
]

// The submenu entry this URL points to; a bare section URL means its first entry
export const activeChild = (item: IMenuItem, pathname: string, search: string) => {
	if (!item.items || !pathname.startsWith(item.href)) return undefined
	const params = new URLSearchParams(search)
	const exact = item.items.find(child => {
		const [path, query] = child.href.split('?')
		return path === pathname && [...new URLSearchParams(query)].every(([key, value]) => params.get(key) === value)
	})
	return exact ?? (pathname === item.href ? item.items[0] : undefined)
}
