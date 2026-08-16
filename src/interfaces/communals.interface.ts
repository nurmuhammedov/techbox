export type ICommunalResourceType = 'meter' | 'fixed' | 'electric'
export type ICommunalCurrency = 'uzs' | 'usd'

export interface ICommunalUnit {
	id: number;
	name: string;
	symbol: string | null;
}

export interface ICommunalResource {
	id: number;
	name: string;
	unit_of: number | null;
	unit_of_details?: ICommunalUnit | null;
	type: ICommunalResourceType;
	currency: ICommunalCurrency;
}

// Tariflar va hisobotlar ro'yxatida `resource` to'liq obyekt bo'lib keladi
export interface ICommunalResourceBrief {
	id: number;
	name: string;
	type?: ICommunalResourceType;
	currency?: ICommunalCurrency;
	unit_of?: ICommunalUnit | null;
}

export interface ICommunalTariff {
	id: number;
	resource: number | ICommunalResourceBrief;
	from_value: number | null;
	to_value: number | null;
	price: number;
	currency: ICommunalCurrency;
	from_time: string | null;
	to_time: string | null;
	time_range: string | null;
}

export interface ICommunalReport {
	id: number;
	resource: number | ICommunalResourceBrief;
	year: number;
	month: number;
	meter_value: number | null;
	consumption?: number;
	total_price?: number;
	amount_paid: number;
	debt?: number;
	created_at?: string;
}
