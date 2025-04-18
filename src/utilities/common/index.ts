import {roleOptions} from 'helpers/options'
import {TFunction} from 'i18next'
import {IFIle, ISelectOption} from 'interfaces/form.interface'
import {IOrderDetail} from 'interfaces/orders.interface'
import {ISearchParams} from 'interfaces/params.interface'
import {showMessage} from 'utilities/alert'


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

const getSelectOptionsByKey = (data: ISearchParams[], key: string = 'name'): ISelectOption[] => {
	return data.map((item) => ({value: Number(item?.id || 0), label: String(item?.[key] || '')}))
}


function decimalToInteger(value?: string | number | null | undefined): string {
	if (!value) return ''
	const intValue = Math.floor(Number(value || 0))
	return intValue.toLocaleString('en-US').split(',').join(' ')
}

function decimalToPrice(value?: string | number): string {
	return new Intl.NumberFormat('de-DE', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(Number(value || 0))
}


function areAllFieldsPresent(orders: IOrderDetail[]): boolean {
	return !orders.every(order => Boolean(order.l0))
}

const formatSelectOptions = (options: ISelectOption[], id?: number | string): ISelectOption[] => {
	const s = options as unknown as ISearchParams[]
	return s?.filter(option => option?.material == id)?.map(option => ({
		value: option.value,
		label: `${option?.name} (${option?.made_in}) - ${decimalToInteger(option?.label?.toString())} kg`
	})) as unknown as ISelectOption[] || [] as unknown as ISelectOption[]
}

const getLayerSellerArray = (layer: string[] | null | undefined) => {
	const length = layer?.length ?? 0
	return length > 0 ? new Array(length).fill(undefined) : []
}

function hasDifferentLayers(orders: { layer?: (number | string)[] }[]): boolean {
	if (orders.length === 0) return false

	const normalize = (arr: (number | string)[] = []) => arr.map(Number) // har ehtimolga qarshi stringni numberga aylantiramiz

	const base = normalize(orders[0].layer)

	return orders.some(order => {
		const current = normalize(order.layer)
		if (current.length !== base.length) return true
		return current.some((val, i) => val !== base[i])
	})
}

function calculateTotalMaterialUsageInKg(
	orders: IOrderDetail[],
	weight1x1_grams: number,
	hasAddition: boolean = false,
	addition?: { x: number; y: number; count: number }
): string {
	let totalAreaM2 = 0
	for (const order of orders) {
		const width = parseFloat(order.width || '0')
		const length = parseFloat(order.length || '0')
		const format = parseFloat(order.format?.name || '1')
		const count = parseFloat(order.count_entered_leader || order.count || '0')

		const areaMm2 = (2 * (width + length) + 70) * format
		const areaM2 = areaMm2 / 1_000_000

		totalAreaM2 += areaM2 * count
	}

	if (hasAddition && addition) {
		const {x, y, count} = addition
		const areaMm2 = x * y
		const areaM2 = areaMm2 / 1_000_000
		totalAreaM2 += areaM2 * count
	}

	const weight1x1_kg = weight1x1_grams / 1000
	const totalWeightKg = totalAreaM2 * weight1x1_kg


	return String(Number(totalWeightKg)?.toFixed(2))
}


export {
	noop,
	isObject,
	noopAsync,
	hasDifferentLayers,
	calculateTotalMaterialUsageInKg,
	joinArray,
	getLayerSellerArray,
	cleanParams,
	getSelectValue,
	decimalToPrice,
	decimalToInteger,
	modifyObjectField,
	formatSelectOptions,
	areAllFieldsPresent,
	getSelectOptionsByKey
}