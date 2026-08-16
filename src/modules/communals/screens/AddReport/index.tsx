import {Button, Card, Form, Loader, NumberFormattedInput, PageTitle, Select} from 'components'
import {yupResolver} from '@hookform/resolvers/yup'
import {reportsSchema} from 'helpers/yup'
import {useAdd, useDetail, useUpdate, usePaginatedData} from 'hooks'
import {FC, useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {getSelectValue} from 'utilities/common'
import {ICommunalReport, ICommunalResource} from 'interfaces/communals.interface'
import {currencySymbols} from 'helpers/options'
import {useTranslation} from 'react-i18next'
import {generateYearList} from 'utilities/date'


interface IProperties {
	edit?: boolean;
}

const Index: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()

	const monthOptions = [
		{label: t('Yanvar'), value: 1},
		{label: t('Fevral'), value: 2},
		{label: t('Mart'), value: 3},
		{label: t('Aprel'), value: 4},
		{label: t('May'), value: 5},
		{label: t('Iyun'), value: 6},
		{label: t('Iyul'), value: 7},
		{label: t('Avgust'), value: 8},
		{label: t('Sentabr'), value: 9},
		{label: t('Oktabr'), value: 10},
		{label: t('Noyabr'), value: 11},
		{label: t('Dekabr'), value: 12}
	]
	const {id = undefined} = useParams()

	// Maydonlar to'plami resurs turiga bog'liq — to'liq ro'yxat kerak
	const {data: resources = []} = usePaginatedData<ICommunalResource[]>(
		'communal/resources',
		{page: 1, page_size: 200}
	)
	const years = generateYearList(2020)

	const resourceOptions = useMemo(
		() => resources.map((item) => ({value: item.id, label: item.name})),
		[resources]
	)

	const {
		handleSubmit,
		control,
		watch,
		setValue,
		reset,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			resource: undefined,
			resource_type: '',
			year: new Date().getFullYear(),
			month: new Date().getMonth() + 1,
			meter_value: '',
			consumption: '',
			total_price: '',
			amount_paid: ''
		},
		resolver: yupResolver(reportsSchema)
	})

	const selectedResource = watch('resource')

	const resource = useMemo(
		() => resources.find((item) => item.id === Number(selectedResource)),
		[resources, selectedResource]
	)

	const resourceType = resource?.type
	const unitLabel = resource?.unit_of_details?.symbol || resource?.unit_of_details?.name || ''
	const currencyLabel = currencySymbols[resource?.currency || 'uzs']

	// Yup shartli tekshiruvi shu maydonga tayanadi
	useEffect(() => {
		setValue('resource_type', resourceType || '')
	}, [resourceType, setValue])

	const {mutateAsync, isPending: isAdding} = useAdd('communal/reports')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('communal/reports/', id, 'patch')
	const {
		data,
		isPending: isDetailLoading
	} = useDetail<ICommunalReport>('communal/reports/', id, edit)

	useEffect(() => {
		if (data && edit) {
			reset({
				resource: typeof data.resource === 'object' ? data.resource.id : data.resource,
				resource_type: '',
				year: data.year,
				month: data.month,
				meter_value: data.meter_value != null ? String(data.meter_value) : '',
				consumption: data.consumption != null ? String(data.consumption) : '',
				total_price: data.total_price != null ? String(data.total_price) : '',
				amount_paid: String(data.amount_paid)
			})
		}
	}, [data, edit, reset])


	if (isDetailLoading && edit) {
		return <Loader/>
	}

	// Turga tegishli bo'lmagan maydonlar yuborilmaydi:
	//   meter    → summa va sarf backendda tarif bo'yicha hisoblanadi
	//   electric → summa qo'lda, sarf hisoblagichdan
	//   fixed    → sarf qo'lda, hisoblagich yo'q
	const buildPayload = (values: Record<string, unknown>) => {
		const {resource_type, meter_value, consumption, total_price, ...rest} = values

		if (resource_type === 'meter') {
			return {...rest, meter_value}
		}

		if (resource_type === 'electric') {
			return {...rest, meter_value, total_price}
		}

		return {...rest, consumption}
	}

	return (
		<>
			<PageTitle title={edit ? t('Edit report') : t('Add report')}>
				<div className="flex justify-center gap-lg align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						{t('Back')}
					</Button>
					<Button
						type={FIELD.BUTTON}
						theme={BUTTON_THEME.PRIMARY}
						disabled={isAdding || isUpdating}
						onClick={() => {
							if (!edit) {
								handleSubmit((values) =>
									mutateAsync(buildPayload(values))
										.then(async () => {
											navigate(-1)
											reset()
										})
								)()
							} else {
								handleSubmit((values) =>
									update(buildPayload(values))
										.then(async () => {
											reset()
											navigate(-1)
										})
								)()
							}
						}}
					>
						{t('Save')}
					</Button>
				</div>
			</PageTitle>
			<Card style={{padding: '1rem'}}>
				<Form style={{flex: 0}} className="grid gap-xl" onSubmit={e => e.preventDefault()}>

					<div className="span-4">
						<Controller
							name="resource"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									ref={ref}
									id="resource"
									options={resourceOptions}
									onBlur={onBlur}
									label={t('Resource')}
									error={errors?.resource?.message}
									value={getSelectValue(resourceOptions, value)}
									defaultValue={getSelectValue(resourceOptions, value)}
									handleOnChange={(e) => onChange(e as number)}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="year"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									ref={ref}
									id="year"
									options={years}
									onBlur={onBlur}
									label={t('Year')}
									error={errors?.year?.message}
									value={getSelectValue(years, value)}
									defaultValue={getSelectValue(years, value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="month"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									ref={ref}
									id="month"
									options={monthOptions}
									onBlur={onBlur}
									label={t('Month')}
									error={errors?.month?.message}
									value={getSelectValue(monthOptions, value)}
									defaultValue={getSelectValue(monthOptions, value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>

					{
						(resourceType === 'meter' || resourceType === 'electric') && (
							<div className="span-4">
								<Controller
									name="meter_value"
									control={control}
									render={({field}) => (
										<NumberFormattedInput
											id="meter_value"
											label={unitLabel ? `${t('Meter value')} (${unitLabel})` : t('Meter value')}
											error={errors?.meter_value?.message}
											{...field}
										/>
									)}
								/>
							</div>
						)
					}

					{
						resourceType === 'fixed' && (
							<div className="span-4">
								<Controller
									name="consumption"
									control={control}
									render={({field}) => (
										<NumberFormattedInput
											id="consumption"
											label={unitLabel ? `${t('Usage')} (${unitLabel})` : t('Usage')}
											error={errors?.consumption?.message}
											{...field}
										/>
									)}
								/>
							</div>
						)
					}

					{
						resourceType === 'electric' && (
							<div className="span-4">
								<Controller
									name="total_price"
									control={control}
									render={({field}) => (
										<NumberFormattedInput
											id="total_price"
											label={`${t('Total price')} (${currencyLabel})`}
											error={errors?.total_price?.message}
											{...field}
										/>
									)}
								/>
							</div>
						)
					}

					<div className="span-4">
						<Controller
							name="amount_paid"
							control={control}
							render={({field}) => (
								<NumberFormattedInput
									id="amount_paid"
									label={`${t('Amount paid')} (${currencyLabel})`}
									error={errors?.amount_paid?.message}
									{...field}
								/>
							)}
						/>
					</div>
				</Form>
			</Card>
		</>
	)
}

export default Index
