import {User} from 'assets/icons'
import {ROLE_LIST} from 'constants/roles'
import {IMenuItem} from 'interfaces/configuration.interface'


export const menu: IMenuItem[] = [
	{
		id: 'human_resources',
		label: 'Employees',
		href: '/employees',
		icon: User,
		allowedRoles: [
			ROLE_LIST.HEAD_DEPARTMENT,
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.HEAD_DEPARTMENT]: 1,
			[ROLE_LIST.EMPLOYEE]: 1
		}
	},
	{
		id: 'role',
		label: 'Roles',
		href: '/roles',
		icon: User,
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
		icon: User,
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
		icon: User,
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
		icon: User,
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
		icon: User,
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
		icon: User,
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
		icon: User,
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
		icon: User,
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
		icon: User,
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
		icon: User,
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
		label: 'Operator orders',
		href: '/operator-orders',
		icon: User,
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
		icon: User,
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
		icon: User,
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
		icon: User,
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
		icon: User,
		allowedRoles: [
			ROLE_LIST.EMPLOYEE
		],
		order: {
			[ROLE_LIST.ADMIN]: 16,
			[ROLE_LIST.EMPLOYEE]: 16
		}
	}
]

