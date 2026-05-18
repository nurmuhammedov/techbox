import {ROLE_LABEL, ROLE_LIST} from 'constants/roles'
import {ILogin, IRole, IUser} from 'interfaces/authentication.interface'
import {menu} from 'configurations/menu'
import {IMenuItem} from 'interfaces/configuration.interface'


function buildUser(userData: ILogin | undefined): IUser | null {
	if (!userData) return null
	return {
		fullName: userData?.fullname,
		roleLabel: [ROLE_LIST.ADMIN, ROLE_LIST.EMPLOYEE, ROLE_LIST.HEAD_DEPARTMENT].includes(userData?.role?.value) ? ROLE_LABEL[userData?.role?.value] : userData?.role?.label ?? 'Employee',
		role: userData?.role?.value ?? ROLE_LIST.EMPLOYEE,
		categories: userData?.role?.categories ?? []
	}
}

const pickOnlyAllowedMenu = (menuItem: IMenuItem, role: IRole, categories: string[]) => {
	const isAllowedRole = menuItem.allowedRoles?.includes(role)
	if (role === ROLE_LIST.ADMIN || role === ROLE_LIST.HEAD_DEPARTMENT) {
		return isAllowedRole
	}
	const isAllowedPermission = menuItem.id ? categories.includes(menuItem.id) : true
	return isAllowedRole && isAllowedPermission
}

const sortMenu = (a: IMenuItem, b: IMenuItem, role: IRole) => {
	const orderA = a?.order?.[role] ?? 999
	const orderB = b?.order?.[role] ?? 999
	return orderA - orderB
}

const routeByRole = (role?: IRole, categories: string[] = []): string => {
	if (!role) return '/login'

	const allowedMenu = menu
		.filter((menuItem) => pickOnlyAllowedMenu(menuItem, role, categories))
		.sort((a, b) => sortMenu(a, b, role))

	return allowedMenu[0]?.href ?? '/login'
}

export {
	buildUser,
	routeByRole
}