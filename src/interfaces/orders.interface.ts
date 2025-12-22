import {IIDName} from 'interfaces/configuration.interface'
import {IProductDetail} from 'interfaces/products.interface'
import {IFIle} from 'interfaces/form.interface'


interface IOrderDetail {
	id: number;
	product: IProductDetail;
	count: string;
	count_entered_leader: string;
	comment: string;
	customer: IIDName;
	company_name: string;
	order: IIDName;
	price: string;
	deadline: string;
	money_paid: string;
	count_last: string;
	backlog: number;
	weight: string;
	piece: string;

	logo?: IFIle;
	name: string;
	width: string;
	end_date: string;
	height: string;
	length: string;
	size: string;
	layer: string[];
	layer_seller: string[];
	layers: number;
	box_ear: string;


	invalid_material_in_processing: string;
	warehouse_same_finished: IIDName;
	warehouse_finished: IIDName;
	percentage_after_processing: string;
	mkv_after_processing: string;

	invalid_material_in_flex: string;
	count_after_flex: string;
	percentage_after_flex: string;
	mkv_after_flex: string;

	invalid_material_in_gluing: string;
	count_after_gluing: string;
	percentage_after_gluing: string;
	mkv_after_gluing: string;

	invalid_material_in_bet: string;
	count_after_bet: string;
	percentage_after_bet: string;
	mkv_after_bet: string;
	warehouse: IIDName;


	format: {
		id: number;
		format: string;
		name: string;
	};

	count_after_processing: string;

	status?: 'new' | 'in_process' | 'in_proces' | 'finished' | 'in_line';
	l0: string;
	l1: string;
	l2: string;
	l3: string;
	l4: string;
	l5: string;
	activity?: 'gofra' | 'ymo1' | 'fleksa' | 'ymo2' | 'tikish' | 'yelimlash' | 'is_last';
	stages_to_passed?: 'gofra' | 'ym01' | 'fleksa' | 'ymo2' | 'tikish' | 'yelimlash' | 'is_last';
}


export type {
	IOrderDetail
}