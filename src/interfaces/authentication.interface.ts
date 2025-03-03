import {ROLE_LIST} from 'constants/roles'


type IRole = ROLE_LIST.EMPLOYEE | ROLE_LIST.ADMIN | ROLE_LIST.HEAD_DEPARTMENT

interface IRoleType {
	label: string
	value: IRole
	categories: string[]
}

interface ILogin {
	id: number
	fullname: string
	role: IRoleType
}

interface IUser {
	fullName: string
	role: IRole
	roleLabel: string
	permissions: string[]
}

export type{
	ILogin,
	IUser,
	IRole
}