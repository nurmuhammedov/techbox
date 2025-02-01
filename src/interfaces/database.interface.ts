interface IDatabaseItemDetail {
	readonly id: number;
	name: string;
	organization?: {
		readonly id: number;
		name: string;
	};
	created_at: string;
}


interface IMeasureItemDetail {
	readonly id: number;
	name: string;
	created_at: string;
	value_type: 'int' | 'float';
}

interface IPackageItemDetail {
	readonly id: number;
	name: string;
	measure_name: string;
	measure: {
		readonly id: string;
		name: string;
	}
	amount: string;
	quantity: string;
	created_at: string;
}

export type  {
	IDatabaseItemDetail,
	IMeasureItemDetail,
	IPackageItemDetail
}