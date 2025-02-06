import {User, Users} from 'assets/icons'
import {IMenuItem} from 'interfaces/configuration.interface'
import {ROLE_LIST} from 'constants/roles'


export const menu: IMenuItem[] = [
	{
		id: 'employees',
		label: 'Employees',
		href: '/employees',
		icon: Users,
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
		icon: Users,
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
		icon: Users,
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
	}
]
