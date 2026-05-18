import {ROLE_LIST} from 'constants/roles'


type IRole = ROLE_LIST

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
	categories: string[]
}

export type{
	ILogin,
	IUser,
	IRole
}