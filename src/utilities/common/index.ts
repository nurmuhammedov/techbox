import {IFIle, ISelectOption} from 'interfaces/form.interface'
import {ISearchParams} from 'interfaces/params.interface'
import {showMessage} from 'utilities/alert'
import {roleOptions} from 'helpers/options'
import {TFunction} from 'i18next'


const noop = (): void => {}
const noopAsync = async (): Promise<undefined> => {}

function joinArray(arr: string[], t: TFunction) {
	if (!Array.isArray(arr)) {
		showMessage('Data must be an array of strings', 'error')
	}
	if (arr.length !== 0) {
		const newArr = arr.map(item => {
			return t(roleOptions?.find(i => i.value == item)?.label?.toString() || '')
		})
		return newArr?.join(' | ')
	}

	return ''
}

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

function isObject(val: unknown): val is ISearchParams {
	return typeof val === 'object' && val !== null
}

function getSelectValue(options: ISelectOption[], value: string | number | boolean | (string | number | boolean)[] | undefined | null): ISelectOption[] | null | ISelectOption {
	if (Array.isArray(value)) {
		return options.filter((item) => value.includes(item.value))
	}
	return options.find((item) => item?.value == value) ?? null
}

function modifyObjectField(obj: ISearchParams, key: string): ISearchParams {
	const updatedObj = {...obj}

	if (updatedObj[key]) {
		const field = updatedObj[key] as unknown as IFIle

		updatedObj[key] = field && typeof field === 'object' && 'id' in field ? field.id ?? null : null
	}

	return updatedObj
}

export {
	noop,
	isObject,
	noopAsync,
	joinArray,
	cleanParams,
	getSelectValue,
	modifyObjectField
}