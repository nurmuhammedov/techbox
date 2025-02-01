import {ROLE_LIST} from 'constants/roles'


type IRole = ROLE_LIST.USER | ROLE_LIST.ADMIN

interface ILogin {
	full_name: string;
	role: IRole;
}

interface IUser {
	fullName: string;
	role: IRole;
}

export type{
	ILogin,
	IUser,
	IRole
}