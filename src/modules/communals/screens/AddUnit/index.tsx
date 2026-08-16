import {Button, Card, Form, Input, Loader, PageTitle} from 'components'
import {yupResolver} from '@hookform/resolvers/yup'
import {unitsSchema} from 'helpers/yup'
import {useAdd, useDetail, useUpdate} from 'hooks'
import {FC, useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {ICommunalUnit} from 'interfaces/communals.interface'
import {useTranslation} from 'react-i18next'


interface IProperties {
	edit?: boolean;
}

const Index: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {id = undefined} = useParams()

	const {
		handleSubmit,
		register,
		reset,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			name: '',
			symbol: ''
		},
		resolver: yupResolver(unitsSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('communal/units')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('communal/units/', id)
	const {
		data,
		isPending: isDetailLoading
	} = useDetail<ICommunalUnit>('communal/units/', id, edit)

	useEffect(() => {
		if (data && edit) {
			reset({
				name: data.name,
				symbol: data.symbol || ''
			})
		}
	}, [data, edit, reset])


	if (isDetailLoading && edit) {
		return <Loader/>
	}

	return (
		<>
			<PageTitle title={edit ? t('Edit unit') : t('Add unit')}>
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
									mutateAsync(values)
										.then(async () => {
											navigate(-1)
											reset()
										})
								)()
							} else {
								handleSubmit((values) =>
									update(values)
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
						<Input
							id="symbol"
							type={FIELD.TEXT}
							label={t('Symbol')}
							error={errors?.symbol?.message}
							{...register('symbol')}
						/>
					</div>
				</Form>
			</Card>
		</>
	)
}

export default Index
