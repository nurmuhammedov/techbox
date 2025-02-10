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
		id: 'permissions',
		label: 'Permissions',
		href: '/permissions',
		icon: User,
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 3
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
			[ROLE_LIST.ADMIN]: 4
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
			[ROLE_LIST.ADMIN]: 5
		}
	}
]