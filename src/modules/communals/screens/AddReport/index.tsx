import {Button, Card, Form, Loader, NumberFormattedInput, PageTitle, Select} from 'components'
import {yupResolver} from '@hookform/resolvers/yup'
import {reportsSchema} from 'helpers/yup'
import {useAdd, useDetail, useUpdate, useData} from 'hooks'
import {FC, useEffect} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {getSelectValue} from 'utilities/common'
import {ICommunalReport} from 'interfaces/communals.interface'
import {useTranslation} from 'react-i18next'
import {ISelectOption} from 'interfaces/form.interface'
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

	const {data: resources = []} = useData<ISelectOption[]>('communal/resources-select/')
	const years = generateYearList(2020)

	const {
		handleSubmit,
		control,
		reset,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			resource: undefined,
			year: new Date().getFullYear(),
			month: new Date().getMonth() + 1,
			meter_value: '',
			amount_paid: ''
		},
		resolver: yupResolver(reportsSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('communal/reports/')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('communal/reports/', id)
	const {
		data,
		isPending: isDetailLoading
	} = useDetail<ICommunalReport>('communal/reports/', id, edit)

	useEffect(() => {
		if (data && edit) {
			reset({
				resource: typeof data.resource === 'object' ? data.resource.id : data.resource,
				year: data.year,
				month: data.month,
				meter_value: String(data.meter_value),
				amount_paid: String(data.amount_paid)
			})
		}
	}, [data, edit, reset])


	if (isDetailLoading && edit) {
		return <Loader/>
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
								handleSubmit((data) =>
									mutateAsync(data)
										.then(async () => {
											navigate(-1)
											reset()
										})
								)()
							} else {
								handleSubmit((data) =>
									update(data)
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
									options={resources}
									onBlur={onBlur}
									label={t('Resource')}
									error={errors?.resource?.message}
									value={getSelectValue(resources, value)}
									defaultValue={getSelectValue(resources, value)}
									handleOnChange={(e) => onChange(e as string)}
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

					<div className="span-4">
						<Controller
							name="meter_value"
							control={control}
							render={({field}) => (
								<NumberFormattedInput
									id="meter_value"
									label={t('Meter value')}
									error={errors?.meter_value?.message}
									{...field}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="amount_paid"
							control={control}
							render={({field}) => (
								<NumberFormattedInput
									id="amount_paid"
									label={t('Amount paid')}
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
