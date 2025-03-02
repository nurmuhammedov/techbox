import {
	useAdd,
	useData
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
import {operatorOrderSchema} from 'helpers/yup'
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
	detail?: IGroupOrder
}

const Index: FC<IProperties> = ({retrieve = false, detail}) => {
	const {t} = useTranslation()
	const {id} = useParams()
	const navigate = useNavigate()
	const {data: materials = []} = useData<ISelectOption[]>('products/materials/select')

	const {
		reset,
		control,
		handleSubmit,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			data: [
				{
					material: undefined,
					weight: ''
				}
			]
		},
		resolver: yupResolver(operatorOrderSchema)
	})

	const {fields} = useFieldArray({
		control,
		name: 'data' as never
	})

	const {mutateAsync: addGroupOrder, isPending: isAddLoading} = useAdd('services/weight-material')

	useEffect(() => {
		if (detail) {
			reset({
				data: [...new Set(detail?.orders?.flatMap(order => order.layer) || [])].map(item => ({
					material: Number(item),
					weight: ''
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
								const newData = {
									group_order: id,
									data: data?.data
								}

								addGroupOrder(newData)
									.then(() => {
										navigate(-1)
										reset({
											data: [
												{
													material: undefined,
													weight: ''
												}
											]
										})
									})
							})
						}
						disabled={isAddLoading}
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
								id="count"
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
									<Controller
										name={`data.${index}.material`}
										control={control}
										render={({field: {value, ref, onChange, onBlur}}) => (
											<Select
												ref={ref}
												top={true}
												id={`payment.${index}.material`}
												label={`${t('Format')} (${t('mm')})`}
												options={materials}
												onBlur={onBlur}
												isDisabled={true}
												error={errors?.data?.[index]?.material?.message}
												value={getSelectValue(materials, value)}
												defaultValue={getSelectValue(materials, value)}
												handleOnChange={(e) => onChange(e as string)}
											/>
										)}
									/>
								</div>

								<div className="span-4">
									<Controller
										control={control}
										name={`data.${index}.weight`}
										render={({field}) => (
											<NumberFormattedInput
												id={`data.${index}.weight`}
												maxLength={12}
												disableGroupSeparators={false}
												allowDecimals={true}
												disabled={retrieve}
												label={`${t('Weight')} (${t('kg')})`}
												error={errors?.data?.[index]?.weight?.message}
												{...field}
											/>
										)}
									/>
								</div>
							</div>
						))
					}
				</Form>
			</Card>
		</>
	)
}


const HOF = GroupOrderDetail<IProperties>(Index)

export default HOF