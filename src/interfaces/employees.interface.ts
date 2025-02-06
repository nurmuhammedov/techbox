import {IIDName} from 'interfaces/configuration.interface'
import {IRoleItemDetail} from 'interfaces/roles.interface'


interface IEmployeesItemDetail {
	id: number;
	firstname: string;
	lastname: string;
	middle_name: string;
	birthday: string; // ISO date (YYYY-MM-DD)
	phone: string;
	card_number: string;
	passport: string;
	pinfl: string;
	address: string;
	username: string;
	categories: string[];
	position: IIDName;
}

interface IUserItemDetail {
	readonly id: number;
	fullname: string;
	username: string;
	password: string;
	password_confirm: string;
	role: IRoleItemDetail;
	position: IIDName;
	employee: IIDName;
}

export type {
	IEmployeesItemDetail,
	IUserItemDetail
}