import {Button, Card, Form, Loader, NumberFormattedInput, PageTitle, Select} from 'components'
import {yupResolver} from '@hookform/resolvers/yup'
import {tariffsSchema} from 'helpers/yup'
import {useAdd, useDetail, useUpdate, useData} from 'hooks'
import {FC, useEffect} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {getSelectValue} from 'utilities/common'
import {ICommunalTariff} from 'interfaces/communals.interface'
import {useTranslation} from 'react-i18next'
import {ISelectOption} from 'interfaces/form.interface'


interface IProperties {
	edit?: boolean;
}

const Index: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {id = undefined} = useParams()

	const {data: resources = []} = useData<ISelectOption[]>('communal/resources-select')

	const {
		handleSubmit,
		control,
		reset,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			resource: undefined,
			price: '',
			from_value: 0,
			to_value: null
		},
		resolver: yupResolver(tariffsSchema)
	})

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
				from_value: data.from_value,
				to_value: data.to_value
			})
		}
	}, [data, edit, reset])


	if (isDetailLoading && edit) {
		return <Loader/>
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
									label={t('To value')}
									error={errors?.to_value?.message}
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
