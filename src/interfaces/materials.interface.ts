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
	weight: string;
	format: {
		id: number;
		format: string;
	};
}

export type {
	IMaterialItemDetail,
	IBaseMaterialList
}