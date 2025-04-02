import {IFIle} from 'interfaces/form.interface'


interface IProductDetail {
	id: number;
	logo?: IFIle;
	name: string;
	width: string;
	height: string;
	length: string;
	size: string;
	layer: string[];
	layer_seller: string[];
	layers: number;
	box_ear: string;
	format: number;
}


export type {
	IProductDetail
}