import {IFIle} from 'interfaces/form.interface'


interface ILayer {
	material: number;
	queue: number;
}


interface IProductDetail {
	id: number;
	logo?: IFIle;
	name: string;
	width: string;
	height: string;
	length: string;
	size: string;
	layers: ILayer[];
	box_ear: string;
	format: string;
}


export type {
	IProductDetail,
	ILayer
}