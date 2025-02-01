import {IMenuItem} from 'interfaces/configuration.interface'
import {ROLE_LIST} from 'constants/roles'


export const menu: IMenuItem[] = [
	{
		id: '/home',
		label: 'Home',
		href: '/admin/home',
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 1
		}
	},
	{
		id: '/clients',
		label: 'Clients',
		href: '/admin/clients',
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 1
		}
	},
	{
		id: '/products',
		label: 'Products',
		href: '/admin/products',
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 1
		}
	},
	{
		id: '/stores',
		label: 'Stores',
		href: '/admin/stores',
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 1
		}
	},
	{
		id: '/database',
		label: 'Database',
		href: '/admin/database',
		allowedRoles: [
			ROLE_LIST.ADMIN
		],
		order: {
			[ROLE_LIST.ADMIN]: 1
		}
	}
]
