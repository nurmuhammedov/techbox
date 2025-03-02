import {
	useUpdate
} from 'hooks'
import {
	Button,
	Card,
	Form,
	Input,
	NumberFormattedInput,
	PageTitle,
	Select
} from 'components'
import {GroupOrderDetail} from 'components/HOC'
import {Controller, useFieldArray, useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {operatorsOrderSchema} from 'helpers/yup'
import {decimalToInteger, getSelectValue} from 'utilities/common'
import {ISelectOption} from 'interfaces/form.interface'
import {useTranslation} from 'react-i18next'
import {BUTTON_THEME} from 'constants/fields'
import {FC, useEffect} from 'react'
import {booleanOptions} from 'helpers/options'
import {useNavigate, useParams} from 'react-router-dom'
import {IGroupOrder} from 'interfaces/groupOrders.interface'


interface IProperties {
	retrieve?: boolean
	type?: 'corrugation' | 'flex' | 'sewing' | 'gluing'
	detail?: IGroupOrder
}

const Index: FC<IProperties> = ({retrieve = false, detail, type = 'corrugation'}) => {
	const {id} = useParams()
	const {t} = useTranslation()
	const navigate = useNavigate()

	const {
		reset,
		control,
		register,
		handleSubmit,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			percentage: '',
			weight: '',
			area: '',
			data: [
				{
					order: undefined,
					count: ''
				}
			]
		},
		resolver: yupResolver(operatorsOrderSchema)
	})

	const {fields} = useFieldArray({
		control,
		name: 'data' as never
	})

	const {mutateAsync: update, isPending: isUpdate} = useUpdate('services/group-orders/', id, 'patch')

	useEffect(() => {
		if (retrieve) {
			reset({
				percentage: '',
				weight: '',
				area: '',
				data: [...new Set(detail?.orders?.flatMap(order => order.id) || [])].map(item => ({
					order: Number(item),
					count: ''
				}))
			})
		} else if (detail) {
			reset({
				percentage: '',
				weight: '',
				area: '',
				data: [...new Set(detail?.orders?.flatMap(order => order.id) || [])].map(item => ({
					order: Number(item),
					count: ''
				}))
			})
		}
	}, [detail])


	return (
		<>
			<PageTitle title="Send order">
				<div className="flex gap-sm justify-center align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
					<Button
						onClick={
							handleSubmit((data) => {
								let newData = undefined
								if (type === 'corrugation') {
									newData = {
										invalid_material_in_processing: data?.weight,
										percentage_after_processing: data?.percentage,
										mkv_after_processing: data?.area,
										count_after_processing: data?.data
									}
								} else if (type === 'flex') {
									newData = {
										invalid_material_in_flex: data?.weight,
										percentage_after_flex: data?.percentage,
										mkv_after_flex: data?.area,
										count_after_flex: data?.data
									}
								} else if (type === 'sewing') {
									newData = {
										invalid_material_in_bet: data?.weight,
										percentage_after_bet: data?.percentage,
										count_after_bet: data?.area,
										count_after_flex: data?.data
									}
								} else if (type === 'gluing') {
									newData = {
										invalid_material_in_gluing: data?.weight,
										percentage_after_gluing: data?.percentage,
										mkv_after_gluing: data?.area,
										count_after_gluing: data?.data
									}
								}


								update(newData)
									.then(() => {
										navigate(-1)
										reset({
											percentage: '',
											weight: '',
											area: '',
											data: [
												{
													order: undefined,
													count: ''
												}
											]
										})
									})
							})
						}
						disabled={isUpdate}
					>
						Send
					</Button>
				</div>
			</PageTitle>
			<Card className="span-12" screen={false} style={{padding: '1.5rem'}}>
				<Form className="grid  gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
					<div className="grid gap-lg span-12">
						<div className="span-4">
							<Input
								id="totoal"
								disabled={true}
								label={`${t('Total')} (${t('Count')?.toLowerCase()})`}
								value={decimalToInteger(detail?.orders?.reduce((acc, order) => acc + Number(order.count || 0), 0) || 0)}
							/>
						</div>
						<div className="span-4">
							<Input
								id="format"
								disabled={true}
								label={`${t('Production format')} (${t('mm')})`}
								value={decimalToInteger(Number(detail?.separated_raw_materials_format?.format || 0))}
							/>
						</div>
						<div className="span-4">
							<Select
								id="has_addition"
								label="Cutting"
								disabled={true}
								options={booleanOptions as unknown as ISelectOption[]}
								value={getSelectValue(booleanOptions as unknown as ISelectOption[], detail?.has_addition)}
								defaultValue={getSelectValue(booleanOptions as unknown as ISelectOption[], detail?.has_addition)}
							/>
						</div>
					</div>
					{
						fields?.map((field, index) => (
							<div className="grid gap-lg span-12" key={field.id}>
								<div className="span-4">
									<Input
										id="order"
										disabled={true}
										label="Order number"
										{...register(`data.${index}.order`)}
									/>
								</div>

								<div className="span-4">
									<Controller
										control={control}
										name={`data.${index}.count`}
										render={({field}) => (
											<NumberFormattedInput
												id={`data.${index}.count`}
												maxLength={12}
												disableGroupSeparators={false}
												allowDecimals={true}
												disabled={retrieve}
												label="Count"
												error={errors?.data?.[index]?.count?.message}
												{...field}
											/>
										)}
									/>
								</div>
							</div>
						))
					}
					<div className="grid gap-lg span-12">
						<div className="span-4">
							<Controller
								control={control}
								name="weight"
								render={({field}) => (
									<NumberFormattedInput
										id="weight"
										maxLength={12}
										disableGroupSeparators={false}
										allowDecimals={true}
										disabled={retrieve}
										label={`${t('Waste paper')} (${t('kg')})`}
										error={errors?.weight?.message}
										{...field}
									/>
								)}
							/>
						</div>
						<div className="span-4">
							<Controller
								control={control}
								name="percentage"
								render={({field}) => (
									<NumberFormattedInput
										id="percentage"
										maxLength={12}
										disableGroupSeparators={false}
										allowDecimals={true}
										disabled={retrieve}
										label={`${t('Waste paper percentage')} (${t('%')})`}
										error={errors?.percentage?.message}
										{...field}
									/>
								)}
							/>
						</div>
						<div className="span-4">
							<Controller
								control={control}
								name="area"
								render={({field}) => (
									<NumberFormattedInput
										id="area"
										maxLength={12}
										disableGroupSeparators={false}
										allowDecimals={false}
										disabled={retrieve}
										label={`${t('Waste paper area')} (${t('m²')})`}
										error={errors?.area?.message}
										{...field}
									/>
								)}
							/>
						</div>
					</div>
				</Form>
			</Card>
		</>
	)
}


const HOF = GroupOrderDetail<IProperties>(Index)

export default HOF