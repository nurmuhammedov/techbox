import {Button, Card, Form, Input, Loader, PageTitle, Select} from 'components'
import {yupResolver} from '@hookform/resolvers/yup'
import {communalsSchema} from 'helpers/yup'
import {useAdd, useData, useDetail, useUpdate} from 'hooks'
import {FC, useEffect} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {getSelectValue} from 'utilities/common'
import {ICommunalResource} from 'interfaces/communals.interface'
import {ISelectOption} from 'interfaces/form.interface'
import {currencyOptions, resourceTypeOptions} from 'helpers/options'
import {useTranslation} from 'react-i18next'


interface IProperties {
	edit?: boolean;
}

const Index: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {id = undefined} = useParams()

	const {data: unitOptions = []} = useData<ISelectOption[]>('communal/units-select')

	const {
		handleSubmit,
		control,
		register,
		reset,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			name: '',
			unit_of: undefined,
			type: 'meter',
			currency: 'uzs'
		},
		resolver: yupResolver(communalsSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('communal/resources')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('communal/resources/', id)
	const {
		data,
		isPending: isDetailLoading
	} = useDetail<ICommunalResource>('communal/resources/', id, edit)

	useEffect(() => {
		if (data && edit) {
			reset({
				name: data.name,
				unit_of: data.unit_of ?? undefined,
				type: data.type,
				currency: data.currency
			})
		}
	}, [data, edit, reset])


	if (isDetailLoading && edit) {
		return <Loader/>
	}

	return (
		<>
			<PageTitle title={edit ? t('Edit') : t('Add')}>
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
						<Input
							id="name"
							type={FIELD.TEXT}
							label={t('Name')}
							error={errors?.name?.message}
							{...register('name')}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="unit_of"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									ref={ref}
									id="unit_of"
									options={unitOptions}
									onBlur={onBlur}
									label={t('Unit')}
									error={errors?.unit_of?.message}
									value={getSelectValue(unitOptions, value)}
									defaultValue={getSelectValue(unitOptions, value)}
									handleOnChange={(e) => onChange(e as number)}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="type"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									ref={ref}
									id="type"
									options={resourceTypeOptions}
									onBlur={onBlur}
									label={t('Type')}
									error={errors?.type?.message}
									value={getSelectValue(resourceTypeOptions, value)}
									defaultValue={getSelectValue(resourceTypeOptions, value)}
									handleOnChange={(e) => onChange(e as string)}
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
				</Form>
			</Card>
		</>
	)
}

export default Index
