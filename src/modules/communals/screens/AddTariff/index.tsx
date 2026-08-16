import {Button, Card, Form, Input, Loader, NumberFormattedInput, PageTitle, Select} from 'components'
import {yupResolver} from '@hookform/resolvers/yup'
import {tariffsSchema} from 'helpers/yup'
import {useAdd, useDetail, useUpdate, usePaginatedData} from 'hooks'
import {FC, useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {getSelectValue} from 'utilities/common'
import {ICommunalResource, ICommunalTariff} from 'interfaces/communals.interface'
import {currencyOptions} from 'helpers/options'
import {useTranslation} from 'react-i18next'


interface IProperties {
	edit?: boolean;
}

const Index: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {id = undefined} = useParams()

	// Resurs turini bilish uchun to'liq ro'yxat kerak (resources-select faqat value/label beradi)
	const {data: resources = []} = usePaginatedData<ICommunalResource[]>(
		'communal/resources',
		{page: 1, page_size: 200}
	)

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
			price: '',
			currency: 'uzs',
			is_time_based: false,
			from_value: null,
			to_value: null,
			from_time: '',
			to_time: '',
			time_range: ''
		},
		resolver: yupResolver(tariffsSchema)
	})

	const selectedResource = watch('resource')
	const isTimeBased = watch('is_time_based')

	// Elektr resursi tanlansa — tarif vaqt oralig'i bo'yicha beriladi
	useEffect(() => {
		const resource = resources.find((item) => item.id === Number(selectedResource))
		if (!resource) return

		setValue('is_time_based', resource.type === 'electric')
		setValue('currency', resource.currency)
	}, [selectedResource, resources, setValue])

	const {mutateAsync, isPending: isAdding} = useAdd('communal/tariffs')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('communal/tariffs/', id)
	const {
		data,
		isPending: isDetailLoading
	} = useDetail<ICommunalTariff>('communal/tariffs/', id, edit)

	useEffect(() => {
		if (data && edit) {
			reset({
				resource: typeof data.resource === 'object' ? data.resource.id : data.resource,
				price: String(data.price),
				currency: data.currency || 'uzs',
				is_time_based: !!(data.from_time || data.to_time),
				from_value: data.from_value,
				to_value: data.to_value,
				from_time: data.from_time || '',
				to_time: data.to_time || '',
				time_range: data.time_range || ''
			})
		}
	}, [data, edit, reset])


	if (isDetailLoading && edit) {
		return <Loader/>
	}

	// `is_time_based` faqat forma ichidagi bayroq — backendga yuborilmaydi,
	// bo'sh oraliq maydonlari ham tozalanadi
	const buildPayload = (values: Record<string, unknown>) => {
		const {is_time_based, ...rest} = values

		if (is_time_based) {
			return {...rest, from_value: null, to_value: null}
		}

		return {...rest, from_time: null, to_time: null, time_range: null}
	}

	return (
		<>
			<PageTitle title={edit ? t('Edit tariff') : t('Add tariff')}>
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
							name="price"
							control={control}
							render={({field}) => (
								<NumberFormattedInput
									id="price"
									label={t('Price')}
									error={errors?.price?.message}
									{...field}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="currency"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									ref={ref}
									id="currency"
									options={currencyOptions}
									onBlur={onBlur}
									label={t('Currency')}
									error={errors?.currency?.message}
									value={getSelectValue(currencyOptions, value)}
									defaultValue={getSelectValue(currencyOptions, value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>

					{
						isTimeBased ? (
							<>
								<div className="span-4">
									<Controller
										name="from_time"
										control={control}
										render={({field}) => (
											<Input
												id="from_time"
												type={FIELD.TIME}
												label={t('From time')}
												error={errors?.from_time?.message}
												{...field}
												value={field.value ?? ''}
											/>
										)}
									/>
								</div>

								<div className="span-4">
									<Controller
										name="to_time"
										control={control}
										render={({field}) => (
											<Input
												id="to_time"
												type={FIELD.TIME}
												label={t('To time')}
												error={errors?.to_time?.message}
												{...field}
												value={field.value ?? ''}
											/>
										)}
									/>
								</div>

								<div className="span-4">
									<Controller
										name="time_range"
										control={control}
										render={({field}) => (
											<Input
												id="time_range"
												type={FIELD.TEXT}
												label={t('Tariff name')}
												error={errors?.time_range?.message}
												{...field}
												value={field.value ?? ''}
											/>
										)}
									/>
								</div>
							</>
						) : (
							<>
								<div className="span-4">
									<Controller
										name="from_value"
										control={control}
										render={({field}) => (
											<NumberFormattedInput
												id="from_value"
												label={t('From value')}
												error={errors?.from_value?.message}
												{...field}
											/>
										)}
									/>
								</div>

								<div className="span-4">
									<Controller
										name="to_value"
										control={control}
										render={({field}) => (
											<NumberFormattedInput
												id="to_value"
												label={`${t('To value')} (${t('bo‘sh = cheksiz')})`}
												error={errors?.to_value?.message}
												{...field}
											/>
										)}
									/>
								</div>
							</>
						)
					}
				</Form>
			</Card>
		</>
	)
}

export default Index
