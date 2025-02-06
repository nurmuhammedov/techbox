interface IMaterialItemDetail {
	id: number;
	warehouse?: number | null;
	name: string;
	weight_1x1: string;
	weight: string;
	format: string;
}

export type {
	IMaterialItemDetail
}