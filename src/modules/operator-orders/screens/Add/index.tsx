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
import {
	calculateTotalGlueUsageInL,
	calculateTotalMaterialUsageInKg,
	decimalToInteger,
	formatSelectOptions,
	getSelectValue
} from 'utilities/common'
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
	const {data: warehouses = []} = useData<ISelectOption[]>('accounts/warehouses-select')


	const {
		reset,
		control,
		handleSubmit,
		watch,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			data: [],
			warehouse: undefined,
			glue: undefined,
			glue_amount: undefined
		},
		resolver: yupResolver(operatorOrderSchema)
	})

	const {data: glues = []} = useData<ISelectOption[]>('chemicals/glues-select', !!watch('warehouse'), {
		warehouse: watch('warehouse')
	})

	const {fields} = useFieldArray({
		control,
		name: 'data' as never
	})

	const {mutateAsync: addGroupOrder, isPending: isAddLoading} = useAdd('services/weight-material')

	useEffect(() => {
		if (retrieve) {
			reset({
				warehouse: detail?.warehouse?.id,
				glue: detail?.glue?.id,
				glue_amount: detail?.glue_amount,
				data: detail?.weight_material?.map(item => ({
					material: item?.material || [],
					layer: item?.layer || undefined,
					weight: item?.weight || ''
				})) || []
			})
		} else if (detail) {
			const initialLayers = (detail?.orders?.[0]?.layer || []).map(Number)
			const seen: number[] = [...initialLayers]

			const restLayers = detail?.orders?.slice(1)
				.flatMap(order => (order.layer || []).map(Number)) || []

			const finalLayers = [...initialLayers]

			for (const layer of restLayers) {
				if (!seen.includes(layer)) {
					seen.push(layer)
					finalLayers.push(layer)
				}
			}

			reset({
				glue_amount: String(calculateTotalGlueUsageInL(detail?.orders || [], detail?.separated_raw_materials_format?.format) * Number(detail?.glue_square || 0.5)),
				data: finalLayers.map((item, index) => ({
					material: undefined,
					layer: item,
					weight: calculateTotalMaterialUsageInKg(detail?.orders || [], materials?.find(i => i?.value == item)?.weight_1x1 as unknown as number || 0, detail?.separated_raw_materials_format?.format, index)
				}))
			})
		}
	}, [detail])

	const {data: rolls = []} = useData<ISelectOption[]>(retrieve ? 'services/weight-material-list-by-group-order' : 'products/base-materials/select', !!watch('warehouse') && !!detail?.separated_raw_materials_format?.id, {
		format_: detail?.separated_raw_materials_format?.id,
		warehouse: watch('warehouse'),
		group_order: detail ? id : null
	})

	const watchedData = watch('data')

	return (
		<>
			<PageTitle title="Send order">
				<div className="flex gap-sm justify-center align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
					{
						!retrieve &&
						<Button
							onClick={
								handleSubmit((data) => {
									const newData = {
										group_order: Number(id),
										data: data?.data?.map(i => ({
											material: i?.material,
											weight: i?.weight,
											layer: i?.layer
										})),
										warehouse: data?.warehouse,
										glue: data?.glue,
										glue_amount: data?.glue_amount
									}

									addGroupOrder(newData)
										.then(() => {
											navigate(-1)
											reset({
												data: [],
												warehouse: undefined,
												glue: undefined,
												glue_amount: undefined
											})
										})
								})
							}
							disabled={isAddLoading}
						>
							Send
						</Button>
					}
				</div>
			</PageTitle>
			<Card className="span-12" screen={false} style={{padding: '1.5rem'}}>
				<Form className="grid  gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
					<div className="grid gap-lg span-12">

						<div className="span-3">
							<Input
								id="format"
								disabled={true}
								label={`${t('Production format')} (${t('mm')})`}
								value={decimalToInteger(Number(detail?.separated_raw_materials_format?.format || 0))}
							/>
						</div>
						<div className="span-3">
							<Select
								id="has_addition"
								label="Cutting"
								disabled={true}
								options={booleanOptions as unknown as ISelectOption[]}
								value={getSelectValue(booleanOptions as unknown as ISelectOption[], detail?.has_addition)}
								defaultValue={getSelectValue(booleanOptions as unknown as ISelectOption[], detail?.has_addition)}
							/>
						</div>
						<div className="span-3">
							<Controller
								name="warehouse"
								control={control}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										id="warehouse"
										label="Material warehouse"
										options={warehouses}
										isDisabled={retrieve}
										error={errors?.warehouse?.message}
										value={getSelectValue(warehouses, value)}
										ref={ref}
										onBlur={onBlur}
										defaultValue={getSelectValue(warehouses, value)}
										handleOnChange={(e) => onChange(e as string)}
									/>
								)}
							/>
						</div>
					</div>
					{
						fields?.map((field, index) => {
							// BOSHQA qatorlarda tanlangan "Roll" qiymatlarini yig'ib olamiz
							const otherSelectedRolls = watchedData
								?.filter((_, i) => i !== index) // Joriy qatorni hisobga olmaymiz
								.flatMap(item => item.material || []) // Boshqa qatorlardagi tanlangan rollarni bir massivga yig'amiz

							// Joriy qator uchun mavjud bo'lgan variantlarni filtrlash
							const availableRollOptions = formatSelectOptions(rolls, watchedData?.[index]?.layer)
								.filter(option => !otherSelectedRolls.includes(option.value))

							return (
								<div className="grid gap-lg span-12" key={field.id}>
									<div className="span-4">
										<Controller
											name={`data.${index}.layer`}
											control={control}
											render={({field: {value, ref, onChange, onBlur}}) => (
												<Select
													ref={ref}
													top={true}
													id={`payment.${index}.layer`}
													label={`${index + 1}-${t('Layer')?.toString()?.toLowerCase()}`}
													options={materials}
													onBlur={onBlur}
													isDisabled={true}
													error={errors?.data?.[index]?.layer?.message}
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

									<div className="span-4">
										<Controller
											name={`data.${index}.material`}
											control={control}
											render={({field: {value, ref, onChange, onBlur}}) => (
												<Select
													ref={ref}
													id={`payment.${index}.material`}
													label={`${t('Roll')}`}
													options={availableRollOptions}
													onBlur={onBlur}
													isMulti={true}
													isDisabled={retrieve}
													error={errors?.data?.[index]?.material?.message}
													value={getSelectValue(availableRollOptions, value)}
													defaultValue={getSelectValue(availableRollOptions, value)}
													handleOnChange={(e) => onChange(e as string[])}
												/>
											)}
										/>
									</div>
								</div>
							)
						})
					}
					<div className="grid gap-lg span-12">
						<div className="span-4">
							<Controller
								name="glue"
								control={control}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										id="glue"
										label="Glue"
										options={glues}
										isDisabled={retrieve}
										error={errors?.glue?.message}
										value={getSelectValue(glues, value)}
										ref={ref}
										onBlur={onBlur}
										defaultValue={getSelectValue(glues, value)}
										handleOnChange={(e) => onChange(e as string)}
									/>
								)}
							/>
						</div>
						<div className="span-4">
							<Controller
								control={control}
								name={`glue_amount`}
								render={({field}) => (
									<NumberFormattedInput
										id={`glue_amount`}
										maxLength={12}
										disableGroupSeparators={false}
										allowDecimals={true}
										disabled={retrieve}
										label={t('Glue amount')}
										error={errors?.glue_amount?.message}
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