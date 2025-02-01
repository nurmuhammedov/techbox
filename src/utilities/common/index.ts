import {ISelectOption} from 'interfaces/form.interface'
import {ISearchParams} from 'interfaces/params.interface'


const noop = (): void => {}
const noopAsync = async (): Promise<undefined> => {}

// function ensureHttps(url: string | undefined | null): string | undefined | null {
// 	if (url?.startsWith('http://')) {
// 		return url.replace('http://', 'https://')
// 	}
// 	return url
// }

const cleanParams = (params: ISearchParams) => {
	const filteredParams: ISearchParams = {}
	Object.keys(params).forEach(key => {
		const value = params[key]
		if (value !== null && value !== undefined && value !== '') {
			filteredParams[key] = value
		}
	})
	return filteredParams
}

function isString(val: unknown): val is string {
	return typeof val === 'string'
}

function isObject(val: unknown): val is ISearchParams {
	return typeof val === 'object' && val !== null
}

function getSelectValue(options: ISelectOption[], value: string | number | boolean | (string | number | boolean)[] | undefined | null): ISelectOption[] | null | ISelectOption {
	if (Array.isArray(value)) {
		return options.filter((item) => value.includes(item.value))
	}
	return options.find((item) => item?.value == value) ?? null
}

export {
	noop,
	isString,
	isObject,
	noopAsync,
	cleanParams,
	getSelectValue

	// ensureHttps
}