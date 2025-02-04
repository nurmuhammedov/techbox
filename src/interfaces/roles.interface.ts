interface IRoleItemDetail {
	readonly id: number;
	name: string;
	categories: string[];
	comment: string;
}


interface IPositionDetail {
	readonly id: number;
	name: string;
	experience: string;
}

export type  {
	IPositionDetail,
	IRoleItemDetail
}