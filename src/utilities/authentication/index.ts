import {ROLE_LABEL, ROLE_LIST} from 'constants/roles'
import {ILogin, IRole, IUser} from 'interfaces/authentication.interface'


function buildUser(userData: ILogin | undefined): IUser | null {
	if (!userData) return null
	return {
		fullName: userData?.fullname,
		roleLabel: [ROLE_LIST.ADMIN, ROLE_LIST, ROLE_LIST.HEAD_DEPARTMENT].includes(userData?.role?.value) ? ROLE_LABEL[userData?.role?.value] : userData?.role?.label ?? 'Employee',
		role: userData?.role?.value ?? ROLE_LIST.EMPLOYEE,
		permissions: userData?.role?.categories ?? []
	}
}

const routeByRole = (role: IRole = ROLE_LIST.EMPLOYEE): string => {
	switch (role) {
		case ROLE_LIST.HEAD_DEPARTMENT:
		case ROLE_LIST.EMPLOYEE:
		case ROLE_LIST.ADMIN:
			return '/'
		default:
			return '/'
	}
}

export {
	buildUser,
	routeByRole
}