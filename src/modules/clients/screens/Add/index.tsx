import {Button, Card, Form, Input, Loader, MaskInput, NumberFormattedInput, PageTitle, Select} from 'components'
import {yupResolver} from '@hookform/resolvers/yup'
import {clientsSchema} from 'helpers/yup'
import {useAdd, useDetail, useUpdate} from 'hooks'
import {FC, useEffect} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {getSelectValue} from 'utilities/common'
import {IClientDetail} from 'interfaces/clients.interface'
import {generateYearList} from 'utilities/date'


interface IProperties {
	edit?: boolean;
}

const Index: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {id = undefined} = useParams()

	const {
		handleSubmit,
		control,
		register,
		reset,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			company_name: '',
			fullname: '',
			partnership_year: undefined,
			phone: '',
			stir: ''
		},
		resolver: yupResolver(clientsSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('services/customers')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('services/customers/', id)
	const {
		data,
		isPending: isDetailLoading
	} = useDetail<IClientDetail>('services/customers/', id, edit)

	useEffect(() => {
		if (data && edit) {
			reset({
				fullname: data.fullname,
				company_name: data.company_name,
				stir: data.stir,
				partnership_year: data.partnership_year,
				phone: data.phone
			})
		}
	}, [data, edit, reset])


	if (isDetailLoading && edit) {
		return <Loader/>
	}

	return (
		<>
			<PageTitle title={edit ? 'Edit' : 'Add client'}>
				<div className="flex justify-center gap-lg align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
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
						{edit ? 'Save' : 'Save'}
					</Button>
				</div>
			</PageTitle>
			<Card style={{padding: '1.5rem'}}>
				<Form style={{flex: 0}} className="grid gap-xl" onSubmit={e => e.preventDefault()}>

					<div className="span-4">
						<Input
							id="company_name"
							type={FIELD.TEXT}
							label="Company name"
							error={errors?.company_name?.message}
							{...register('company_name')}
						/>
					</div>

					<div className="span-4">
						<Input
							id="fullname"
							type={FIELD.TEXT}
							label="Full name"
							error={errors?.fullname?.message}
							{...register('fullname')}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="phone"
							control={control}
							render={({field}) => (
								<MaskInput
									id="phone"
									label="Phone number"
									error={errors?.phone?.message}
									{...field}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="partnership_year"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									ref={ref}
									id="partnership_year"
									options={generateYearList(1990)}
									onBlur={onBlur}
									label="Partnership year"
									error={errors?.partnership_year?.message}
									value={getSelectValue(generateYearList(1990), value)}
									defaultValue={getSelectValue(generateYearList(1990), value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							control={control}
							name="stir"
							render={({field}) => (
								<NumberFormattedInput
									id="stir"
									maxLength={9}
									disableGroupSeparators={true}
									allowDecimals={false}
									label="TIN"
									error={errors?.stir?.message}
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
