import {User} from 'assets/icons'
import {ROLE_LIST} from 'constants/roles'
import {IMenuItem} from 'interfaces/configuration.interface'


export const menu: IMenuItem[] = [
	{
		id: 'employees',
		label: 'Employees',
		href: '/employees',
		icon: User,
		allowedRoles: [
			ROLE_LIST.HEAD_DEPARTMENT
		],
		order: {
			[ROLE_LIST.HEAD_DEPARTMENT]: 1
		}
	},
	{
		id: 'roles',
		label: 'Roles',
		href: '/roles',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 1
		}
	},
	{
		id: 'materials',
		label: 'Material types',
		href: '/materials',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 2
		}
	},
	{
		id: 'formats',
		label: 'Formats',
		href: '/formats',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 3
		}
	},
	{
		id: 'permissions',
		label: 'Permissions',
		href: '/permissions',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 4
		}
	},
	{
		id: 'warehouses',
		label: 'Warehouses',
		href: '/warehouses',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 5
		}
	},
	{
		id: 'products',
		label: 'Products',
		href: '/products',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 6
		}
	},
	{
		id: 'clients',
		label: 'Clients',
		href: '/clients',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 7
		}
	},
	{
		id: 'orders',
		label: 'Orders',
		href: '/orders',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 8
		}
	},
	{
		id: 'warehouses-man',
		label: 'Materials',
		href: '/warehouses-man',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 9
		}
	},
	{
		id: 'director-orders',
		label: 'Director orders',
		href: '/director-orders',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 10
		}
	},
	{
		id: 'operator-orders',
		label: 'Operator orders',
		href: '/operator-orders',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 11
		}
	},
	{
		id: 'corrugation-orders',
		label: 'Corrugation orders',
		href: '/corrugation-orders',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 12
		}
	},
	{
		id: 'flex-orders',
		label: 'Flex orders',
		href: '/flex-orders',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 13
		}
	},
	{
		id: 'sewing-orders',
		label: 'Sewing orders',
		href: '/sewing-orders',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 14
		}
	},
	{
		id: 'gluing-orders',
		label: 'Gluing orders',
		href: '/gluing-orders',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 15
		}
	}
]

