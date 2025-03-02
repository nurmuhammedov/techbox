import {IProductDetail} from 'interfaces/products.interface'
import {IFIle} from 'interfaces/form.interface'


interface IOrderDetail {
	id: number;
	product: IProductDetail;
	count: string;
	comment: string;
	customer: string;
	company_name: string;
	price: string;
	deadline: string;
	money_paid: string;

	logo?: IFIle;
	name: string;
	width: string;
	height: string;
	length: string;
	size: string;
	layer: string[];
	layers: number;
	box_ear: string;

	format: {
		id: number;
		format: string;
		name: string;
	};

	count_after_processing: string;
	count_after_flex: string;
	count_after_gluing: string;
	count_after_bet: string;

	status?: 'new' | 'in_process' | 'finished' | 'in_line';
	l0: string;
	l1: string;
	l2: string;
	l3: string;
	l4: string;
	l5: string;
	activity?: 'gofra' | 'ym01' | 'fleksa' | 'tikish' | 'yelimlash';
	stages_to_passed?: 'gofra' | 'ym01' | 'fleksa' | 'tikish' | 'yelimlash';
}


export type {
	IOrderDetail
}