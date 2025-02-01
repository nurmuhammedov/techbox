import {ROLE_LIST} from 'constants/roles'
import {ILogin, IRole, IUser} from 'interfaces/authentication.interface'


function buildUser(userData: ILogin | undefined): IUser | null {
	if (!userData) return null
	return {
		fullName: userData?.full_name,
		role: userData?.role ?? ROLE_LIST.USER
	}
}

const routeByRole = (role: IRole = ROLE_LIST.ADMIN): string => {
	switch (role) {
		case ROLE_LIST.USER:
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