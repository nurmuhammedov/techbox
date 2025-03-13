import {IIDName} from 'interfaces/configuration.interface'
import {IOrderDetail} from 'interfaces/orders.interface'


interface IGroupOrder {
	id: number;
	orders: IOrderDetail[];
	separated_raw_materials_format: {
		id: number;
		format: string;
	};
	has_addition?: boolean;
	x?: number;
	y?: number;

	deadline: string;
	count: string;
	invalid_material_in_processing: string;
	count_after_processing: string;
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

	stages_to_passed?: 'gofra' | 'ym01' | 'fleksa' | 'tikish' | 'yelimlash';

	weight_material: { material: IIDName, weight: string }[]
}

export type {
	IGroupOrder
}