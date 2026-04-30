export interface ICommunalResource {
	id: number;
	name: string;
	unit_of: 'l' | 'mkv' | 'kw';
	type: 'meter' | 'fixed';
}

export interface ICommunalTariff {
	id: number;
	resource: number | ICommunalResource;
	from_value: number;
	to_value: number | null;
	price: number;
}

export interface ICommunalReport {
	id: number;
	resource: number | ICommunalResource;
	year: number;
	month: number;
	meter_value: number;
	amount_paid: number;
	total_price?: number;
	consumption?: number;
	created_at?: string;
}
