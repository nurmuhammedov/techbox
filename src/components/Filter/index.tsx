import useData from 'hooks/useData'
import useSearchParams from 'hooks/useSearchParams'
import React, { FC, useEffect, useState } from 'react'
import { Input, MaskInput, Select } from 'components'
import { ISelectOption } from 'interfaces/form.interface'
import { getSelectValue } from 'utilities/common'
import { activityOptions } from 'helpers/options'
import { useTranslation } from 'react-i18next'
import styles from './styles.module.scss'
import { Search as SearchIcon } from 'assets/icons'


export type FilterFieldType =
	| 'store'
	| 'search'
	| 'from_date'
	| 'to_date'
	| 'customer'
	| 'price_type'
	| 'service_type'
	| 'currency'
	| 'single_currency'
	| 'product_type'
	| 'brand'
	| 'country'
	| 'format'
	| 'expiry'
	| 'is_user'
	| 'region'
	| 'name'
	| 'purchase_date'
	| 'product'
	| 'material'
	| 'companyName'
	| 'activity'

interface DynamicFilterProps {
	fieldsToShow: FilterFieldType[];
	width?: boolean;
}

const fieldLabels: Record<FilterFieldType, string> = {
	store: 'Store',
	search: 'Search',
	from_date: 'From',
	to_date: 'To',
	customer: 'Customer',
	price_type: 'Price type',
	service_type: 'Service type',
	currency: 'Currency',
	single_currency: 'Currency',
	product_type: 'Type',
	brand: 'Brand',
	country: 'Country',
	format: 'Format',
	expiry: 'Expiry deadline',
	is_user: 'Employee',
	region: 'Region',
	purchase_date: 'Date',
	name: 'Name',
	product: 'Product',
	material: 'Material', // Yangi qo'shildi
	companyName: 'Company name',
	activity: 'Activity'
}

function useDebouncedValue<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)
		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])
	return debouncedValue
}

const formatDateToURL = (dateStr_ddMMyyyy: string): string | undefined => {
	if (!dateStr_ddMMyyyy || dateStr_ddMMyyyy.length !== 10 || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr_ddMMyyyy)) {
		return undefined
	}
	const parts = dateStr_ddMMyyyy.split('.')
	const day = parseInt(parts[0], 10)
	const month = parseInt(parts[1], 10)
	const year = parseInt(parts[2], 10)

	if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined
	const dateObj = new Date(year, month - 1, day)
	if (dateObj.getFullYear() === year && dateObj.getMonth() === month - 1 && dateObj.getDate() === day) {
		return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
	}
	return undefined
}

const formatDateFromURL = (dateStr_yyyyMMdd: string | undefined): string => {
	if (!dateStr_yyyyMMdd || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr_yyyyMMdd)) return ''
	const parts = dateStr_yyyyMMdd.split('-')
	if (parts.length !== 3) return ''
	return `${parts[2]}.${parts[1]}.${parts[0]}`
}

const DynamicFilter: FC<DynamicFilterProps> = ({ fieldsToShow, width = true }) => {
	const { t } = useTranslation()
	const { paramsObject, addParams } = useSearchParams()

	const [searchText, setSearchText] = useState(paramsObject.search || '')
	const [nameText, setNameText] = useState(paramsObject.name || '')
	const [companyNameText, setCompanyNameText] = useState(paramsObject.companyName || '')
	const debouncedSearchText = useDebouncedValue(searchText, 500)
	const debouncedNameText = useDebouncedValue(nameText, 500)
	const debouncedCompanyNameText = useDebouncedValue(companyNameText, 500)

	const [fromDateText, setFromDateText] = useState(() => formatDateFromURL(paramsObject.from_date as unknown as string))
	const [toDateText, setToDateText] = useState(() => formatDateFromURL(paramsObject.to_date as unknown as string))
	const [purchaseDateText, setPurchaseDateText] = useState(() => formatDateFromURL(paramsObject.purchase_date as unknown as string))

	useEffect(() => {
		const currentSearchInParams = paramsObject.search || ''
		if (debouncedSearchText !== currentSearchInParams) {
			addParams({ search: debouncedSearchText || undefined }, 'page')
		}
	}, [debouncedSearchText, paramsObject.search, addParams])

	useEffect(() => {
		const currentSearchInParams = paramsObject.name || ''
		if (debouncedNameText !== currentSearchInParams) {
			addParams({ name: debouncedNameText || undefined }, 'page')
		}
	}, [debouncedNameText, paramsObject.name, addParams])

	useEffect(() => {
		setSearchText(paramsObject.search || '')
	}, [paramsObject.search])

	useEffect(() => {
		setNameText(paramsObject.name || '')
	}, [paramsObject.name])

	useEffect(() => {
		setFromDateText(formatDateFromURL(paramsObject.from_date as unknown as string))
	}, [paramsObject.from_date])

	useEffect(() => {
		setToDateText(formatDateFromURL(paramsObject.to_date as unknown as string))
	}, [paramsObject.to_date])

	useEffect(() => {
		setPurchaseDateText(formatDateFromURL(paramsObject.purchase_date as unknown as string))
	}, [paramsObject.purchase_date])

	useEffect(() => {
		const currentSearchInParams = paramsObject.companyName || ''
		if (debouncedCompanyNameText !== currentSearchInParams) {
			addParams({ companyName: debouncedCompanyNameText || undefined }, 'page')
		}
	}, [debouncedCompanyNameText, paramsObject.companyName, addParams])

	useEffect(() => {
		setCompanyNameText(paramsObject.companyName || '')
	}, [paramsObject.companyName])

	// Fetch options
	const { data: storesOptions = [], isPending: storesLoading } = useData<ISelectOption[]>(
		'stores/select',
		fieldsToShow.includes('store')
	)
	const { data: productsOptions = [], isPending: productsLoading } = useData<ISelectOption[]>(
		'products/select',
		fieldsToShow.includes('product')
	)
	const { data: customersOptions = [], isPending: customersLoading } = useData<ISelectOption[]>(
		'customers/select',
		fieldsToShow.includes('customer')
	)
	const { data: priceTypesOptions = [], isPending: priceTypesLoading } = useData<ISelectOption[]>(
		'price-types/select',
		fieldsToShow.includes('price_type')
	)
	const { data: serviceTypesOptions = [], isPending: serviceTypesLoading } = useData<ISelectOption[]>(
		'service-types/select',
		fieldsToShow.includes('service_type')
	)
	const { data: productTypesOptions = [], isPending: productTypesLoading } = useData<ISelectOption[]>(
		'product-types/select',
		fieldsToShow.includes('product_type')
	)
	const { data: brandOptions = [], isPending: brandLoading } = useData<ISelectOption[]>(
		'brands/select',
		fieldsToShow.includes('brand')
	)
	const { data: countryOptions = [], isPending: countryLoading } = useData<ISelectOption[]>(
		'countries/select',
		fieldsToShow.includes('country')
	)
	const { data: formats = [], isPending: formatLoading } = useData<ISelectOption[]>(
		'products/formats/select',
		fieldsToShow.includes('format')
	)
	// Materiallar uchun ma'lumotni yuklash
	const { data: materialsOptions = [], isPending: materialsLoading } = useData<ISelectOption[]>(
		'products/materials/select',
		fieldsToShow.includes('material')
	)

	const handleDateChange = (
		value: React.ChangeEvent<HTMLInputElement>,
		paramKey: 'from_date' | 'to_date' | 'purchase_date',
		setDateTextState: React.Dispatch<React.SetStateAction<string>>
	) => {
		const maskedValue = value.target.value
		setDateTextState(maskedValue)
		const formattedForURL = formatDateToURL(maskedValue)
		addParams({ [paramKey]: formattedForURL }, 'page')
	}

	const parseMultiValue = (paramValue: string | number | boolean | null | undefined) => {
		return paramValue?.toString()?.split(',')?.map((i: string) => isNaN(Number(i)) ? i : Number(i))
	}

	const handleMultiChange = (paramKey: FilterFieldType) => (selectedValue: string | number | boolean | string[] | number[] | boolean[] | null) => {
		addParams({ [paramKey]: selectedValue?.toString() ?? undefined }, 'page')
	}

	const renderField = (field: FilterFieldType) => {
		const placeholderText = t(fieldLabels[field])
		const commonSelectProps = {
			isClearable: true,
			placeholder: placeholderText
		}
		const selectId = `${field}_filter_select`
		const inputId = `${field}_filter_input`

		switch (field) {
			case 'search':
				return (
					<div>
						<Input
							id={inputId}
							radius={true}
							style={width ? { width: '20rem', maxWidth: '100%' } : {}}
							placeholder={placeholderText}
							value={searchText as unknown as string}
							onChange={(e) => setSearchText(e.target.value)}
							icon={<SearchIcon />}
							iconPosition="left"
						/>
					</div>
				)
			case 'name':
				return (
					<div>
						<Input
							id={inputId}
							placeholder={placeholderText}
							value={nameText as unknown as string}
							onChange={(e) => setNameText(e.target.value)}
						/>
					</div>
				)
			case 'store':
				return (
					<Select
						id={selectId}
						isMulti={true}
						options={storesOptions}
						value={getSelectValue(storesOptions, parseMultiValue(paramsObject.store))}
						handleOnChange={handleMultiChange('store')}
						isLoading={storesLoading}
						{...commonSelectProps}
					/>
				)
			case 'product':
				return (
					<Select
						id={selectId}
						isMulti={true}
						options={productsOptions}
						value={getSelectValue(productsOptions, parseMultiValue(paramsObject.product))}
						handleOnChange={handleMultiChange('product')}
						isLoading={productsLoading}
						{...commonSelectProps}
					/>
				)
			case 'customer':
				return (
					<Select
						id={selectId}
						isMulti={true}
						options={customersOptions}
						value={getSelectValue(customersOptions, parseMultiValue(paramsObject.customer))}
						handleOnChange={handleMultiChange('customer')}
						isLoading={customersLoading}
						{...commonSelectProps}
					/>
				)
			case 'price_type':
				return (
					<Select
						id={selectId}
						isMulti={true}
						options={priceTypesOptions}
						value={getSelectValue(priceTypesOptions, parseMultiValue(paramsObject.price_type))}
						handleOnChange={handleMultiChange('price_type')}
						isLoading={priceTypesLoading}
						{...commonSelectProps}
					/>
				)
			case 'service_type':
				return (
					<Select
						id={selectId}
						isMulti={true}
						options={serviceTypesOptions}
						value={getSelectValue(serviceTypesOptions, parseMultiValue(paramsObject.service_type))}
						handleOnChange={handleMultiChange('service_type')}
						isLoading={serviceTypesLoading}
						{...commonSelectProps}
					/>
				)
			case 'product_type':
				return (
					<Select
						id={selectId}
						isMulti={true}
						options={productTypesOptions}
						value={getSelectValue(productTypesOptions, parseMultiValue(paramsObject.product_type))}
						handleOnChange={handleMultiChange('product_type')}
						isLoading={productTypesLoading}
						{...commonSelectProps}
					/>
				)
			case 'brand':
				return (
					<Select
						id={selectId}
						isMulti={true}
						options={brandOptions}
						value={getSelectValue(brandOptions, parseMultiValue(paramsObject.brand))}
						handleOnChange={handleMultiChange('brand')}
						isLoading={brandLoading}
						{...commonSelectProps}
					/>
				)
			case 'country':
				return (
					<Select
						id={selectId}
						isMulti={true}
						options={countryOptions}
						value={getSelectValue(countryOptions, parseMultiValue(paramsObject.country))}
						handleOnChange={handleMultiChange('country')}
						isLoading={countryLoading}
						{...commonSelectProps}
					/>
				)
			case 'format':
				return (
					<Select
						id={selectId}
						options={formats}
						isLoading={formatLoading}
						value={getSelectValue(formats, paramsObject.format)}
						handleOnChange={(selectedValue) => addParams({ format: selectedValue as unknown as string ?? undefined }, 'page')}
						{...commonSelectProps}
					/>
				)
			case 'material':
				return (
					<Select
						id={selectId}
						isMulti={true}
						options={materialsOptions}
						value={getSelectValue(materialsOptions, parseMultiValue(paramsObject.material))}
						handleOnChange={handleMultiChange('material')}
						isLoading={materialsLoading}
						{...commonSelectProps}
					/>
				)
			case 'from_date':
				return (
					<MaskInput
						id={inputId}
						placeholder={placeholderText}
						value={fromDateText}
						onChange={(e) => handleDateChange(e, 'from_date', setFromDateText)}
						mask="99.99.9999"
					/>
				)
			case 'to_date':
				return (
					<MaskInput
						id={inputId}
						placeholder={placeholderText}
						value={toDateText}
						onChange={(e) => handleDateChange(e, 'to_date', setToDateText)}
						mask="99.99.9999"
					/>
				)
			case 'purchase_date':
				return (
					<MaskInput
						id={inputId}
						placeholder={placeholderText}
						value={purchaseDateText}
						onChange={(e) => handleDateChange(e, 'purchase_date', setPurchaseDateText)}
						mask="99.99.9999"
					/>
				)
			case 'companyName':
				return (
					<div>
						<Input
							id={inputId}
							placeholder={placeholderText}
							value={companyNameText as unknown as string}
							onChange={(e) => setCompanyNameText(e.target.value)}
						/>
					</div>
				)
			case 'activity':
				return (
					<Select
						id={selectId}
						options={activityOptions}
						value={getSelectValue(activityOptions, paramsObject.activity)}
						handleOnChange={(val) => addParams({ activity: val as string ?? undefined }, 'page')}
						{...commonSelectProps}
					/>
				)
			default:
				return null
		}
	}

	return (
		<div className={styles.filterContainer}>
			{fieldsToShow.map((field) => (
				<div key={field} className={styles.filterItem}>
					{renderField(field)}
				</div>
			))}
		</div>
	)
}

export default DynamicFilter