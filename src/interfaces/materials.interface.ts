import {IIDName} from 'interfaces/configuration.interface'


interface IMaterialItemDetail {
	id: number;
	warehouse?: number | null;
	name: string;
	weight_1x1: string;
	weight: string;
	format: string;
}


interface IBaseMaterialList {
	id: number;
	material: IMaterialItemDetail;
	count: string;
	remaining_weight: string;
	created_at: string;
	weight: {
		made_in: number,
		supplier: number,
		weight: string,
		remaining_weight: string,
		sum_price: string,
		name: string
	}[];
	format: {
		id: number;
		format: string;
	};
	warehouse: IIDName;
}

export type {
	IMaterialItemDetail,
	IBaseMaterialList
}