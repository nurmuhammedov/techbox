interface IClientDetail {
	id: number;
	created_by: string;
	updated_by: string;
	created_at: string;
	updated_at: string;
	fullname?: string;
	company_name: string;
	phone: string;
	partnership_year: string;
	stir?: string | null;
}

export type {
	IClientDetail
}