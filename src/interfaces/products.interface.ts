import {IFIle} from 'interfaces/form.interface'


interface IProductDetail {
	id: number;
	logo?: IFIle;
	name: string;
	is_list: boolean;
	width: string;
	height: string;
	length: string;
	size: string;
	layer: string[];
	layers: number;
	box_ear: string;
	customer: string;
	format: number;
}


export type {
	IProductDetail
}