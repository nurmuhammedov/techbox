import {IProductDetail} from 'interfaces/products.interface'


interface IOrderDetail {
	id: number;
	product: IProductDetail;
	count: string;
	comment: string;
	customer: string;
	price: string;
	deadline: string;
	money_paid: string;
}


export type {
	IOrderDetail
}