import {Button, Card, Form, Input, Loader, MaskInput, NumberFormattedInput, PageTitle, Select} from 'components'
import {yupResolver} from '@hookform/resolvers/yup'
import {employeeSchema} from 'helpers/yup'
import {useAdd, useData, useDetail, useUpdate} from 'hooks'
import {IEmployeesItemDetail} from 'interfaces/employees.interface'
import {ISelectOption} from 'interfaces/form.interface'
import {FC, useEffect} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {getSelectValue} from 'utilities/common'
import {getDate} from 'utilities/date'


interface IProperties {
	edit?: boolean;
}

const Index: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {id = undefined} = useParams()
	const {data: positions = []} = useData<ISelectOption[]>('accounts/positions/select')

	const {
		handleSubmit,
		control,
		register,
		reset,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			lastname: '',
			firstname: '',
			middle_name: '',
			position: undefined,
			phone: '',
			address: '',
			passport: '',
			birthday: '',
			card_number: '',
			pinfl: ''
		},
		resolver: yupResolver(employeeSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('accounts/employees')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('accounts/employees/', id)
	const {
		data,
		isPending: isDetailLoading
	} = useDetail<IEmployeesItemDetail>('accounts/employees/', id, edit)

	useEffect(() => {
		if (data && edit) {
			reset({
				lastname: data.lastname,
				firstname: data.firstname,
				middle_name: data.middle_name,
				pinfl: data.pinfl,
				position: data.position?.id,
				phone: data.phone,
				birthday: getDate(data.birthday),
				address: data.address,
				passport: data.passport,
				card_number: data.card_number
			})
		}
	}, [data, edit, reset])


	if (isDetailLoading && edit) {
		return <Loader/>
	}

	return (
		<>
			<PageTitle title={edit ? 'Edit' : 'Add employee'}>
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
											reset()
											navigate(-1)
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
						{edit ? 'Edit' : 'Save'}
					</Button>
				</div>
			</PageTitle>
			<Card style={{padding: '1.5rem'}}>
				<Form style={{flex: 0}} className="grid gap-xl" onSubmit={e => e.preventDefault()}>
					<div className="span-4">
						<Input
							id="lastname"
							type={FIELD.TEXT}
							label="LastName"
							error={errors?.lastname?.message}
							{...register('lastname')}
						/>
					</div>
					<div className="span-4">
						<Input
							id="firstname"
							type={FIELD.TEXT}
							label="FirstName"
							error={errors?.firstname?.message}
							{...register('firstname')}
						/>
					</div>
					<div className="span-4">
						<Input
							id="middle_name"
							type={FIELD.TEXT}
							label="MiddleName"
							error={errors?.middle_name?.message}
							{...register('middle_name')}
						/>
					</div>
					<div className="span-4">
						<Controller
							control={control}
							name="pinfl"
							render={({field}) => (
								<NumberFormattedInput
									id="pinfl"
									maxLength={14}
									disableGroupSeparators={true}
									allowDecimals={false}
									label="Pinfl"
									error={errors?.pinfl?.message}
									{...field}
								/>
							)}
						/>
					</div>
					<div className="span-4">
						<Controller
							name="position"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									ref={ref}
									id="position"
									options={positions}
									onBlur={onBlur}
									label="Position"
									error={errors?.position?.message}
									value={getSelectValue(positions, value)}
									defaultValue={getSelectValue(positions, value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>
					<div className="span-4">
						<Input
							id="address"
							type={FIELD.TEXT}
							label="Address"
							error={errors?.address?.message}
							{...register('address')}
						/>
					</div>
					<div className="span-4">
						<Controller
							name="birthday"
							control={control}
							render={({field}) => (
								<MaskInput
									id="birthday"
									label="Birthday"
									placeholder={getDate()}
									mask="99.99.9999"
									error={errors?.birthday?.message}
									{...field}
								/>
							)}
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
							name="passport"
							control={control}
							render={({field: {onChange: change, ...rest}}) => (
								<MaskInput
									id="passport"
									label="Passport"
									mask="aa 9999999"
									placeholder="AA 7777777"
									error={errors?.passport?.message}
									onChange={e => change(e?.target?.value?.toString()?.toUpperCase())}
									{...rest}
								/>
							)}
						/>
					</div>
					<div className="span-4">
						<Controller
							name="card_number"
							control={control}
							render={({field}) => (
								<MaskInput
									id="card_number"
									label="Card number"
									mask="9999 9999 9999 9999"
									error={errors?.card_number?.message}
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
