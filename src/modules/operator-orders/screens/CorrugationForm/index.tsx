import {yupResolver} from '@hookform/resolvers/yup'
import {Corrugation} from 'assets/icons'
import {Button, Card, Form, Input, NumberFormattedInput, PageIcon, PageTitle, Select} from 'components'
import {BUTTON_THEME} from 'constants/fields'
import {booleanOptions} from 'helpers/options'
import {useDetail, useUpdate} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import {IGroupOrder} from 'interfaces/groupOrders.interface'
import {FC, useEffect} from 'react'
import {Controller, useFieldArray, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import {decimalToInteger, getSelectValue} from 'utilities/common'
import * as yup from 'yup'
import HighGroupOrders from 'components/HighGroupOrders'
import {IIDName} from 'interfaces/configuration.interface'


interface IDetailData {
	id: number
	group_order: IGroupOrder[]
	warehouse?: number
	glue?: number
	glue_amount?: number
	materials?: IIDName[]
}

interface ICorrugationProperties {
	detail?: boolean
}

interface IFormOrder {
	order_id: number
	count: string
}

interface IFormItem {
	id: number
	has_addition: boolean
	format: number | string
	pallet: string
	orders: IFormOrder[]
}

interface ILeftoverItem {
	id: number
	weight: string
}

interface IFormValues {
	items: IFormItem[]
	leftover: ILeftoverItem[]
}

const schema = yup.object().shape({
	items: yup.array().of(
		yup.object().shape({
			id: yup.number().required(),
			has_addition: yup.boolean(),
			pallet: yup.string().when('has_addition', {
				is: true,
				then: (schema) => schema.required('This field is required'),
				otherwise: (schema) => schema.notRequired()
			}),
			orders: yup.array().of(
				yup.object().shape({
					order_id: yup.number().required(),
					count: yup.string().required('This field is required')
				})
			)
		})
	),
	leftover: yup.array().of(
		yup.object().shape({
			id: yup.number().required('This field is required'),
			weight: yup.string().required('This field is required')
		})
	)
})

const CorrugationOrder: FC<ICorrugationProperties> = ({detail = false}) => {
	const {t} = useTranslation()
	const navigate = useNavigate()
	const {id} = useParams()

	const {data: responseData} = useDetail<IDetailData>('services/consecutive-orders/', id)

	const {
		mutateAsync: updateOrders,
		isPending: isPendingOrders
	} = useUpdate('services/consecutive-orders/', id, 'patch')
	const {
		mutateAsync: updateWeights,
		isPending: isPendingWeights
	} = useUpdate('products/', 'base-material-update-weight', 'put')

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: {errors}
	} = useForm<IFormValues>({
		mode: 'onTouched',
		defaultValues: {
			items: [],
			leftover: []
		},
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		resolver: yupResolver(schema)
	})

	const {fields: itemFields} = useFieldArray({
		control,
		name: 'items'
	})

	const {fields: leftoverFields} = useFieldArray({
		control,
		name: 'leftover'
	})

	useEffect(() => {
		if (responseData?.group_order) {
			const mappedItems: IFormItem[] = responseData.group_order.map((groupOrder) => ({
				id: groupOrder.id,
				has_addition: !!groupOrder.has_addition,
				format: groupOrder.separated_raw_materials_format?.format || 0,
				pallet: String(groupOrder.pallet_count_after_gofra || '0'),
				orders: groupOrder.orders.map((order) => ({
					order_id: order.id,
					count: String(order.count_after_processing || '')
				}))
			}))

			const uniqueMaterialIds = new Set<number>()

			responseData.group_order.forEach(group => {
				group.orders.forEach(order => {
					order.layer?.forEach(layerId => {
						uniqueMaterialIds.add(Number(layerId))
					})
				})
			})

			const mappedLeftovers: ILeftoverItem[] = responseData?.materials?.map(matId => ({
				id: matId?.id,
				weight: ''
			})) || []

			reset({
				items: mappedItems,
				leftover: mappedLeftovers
			})
		}
	}, [responseData, reset])

	const onSubmit = async (data: IFormValues) => {
		const countAfterProcessing: { order: number, count: string }[] = []
		const countAfterGofra: { group_order: number, count: string }[] = []

		data.items.forEach((item) => {
			item.orders.forEach((order) => {
				countAfterProcessing.push({
					order: order.order_id,
					count: order.count
				})
			})

			if (item.has_addition) {
				countAfterGofra.push({
					group_order: item.id,
					count: item.pallet
				})
			}
		})

		const mainPayload = {
			count_after_processing: countAfterProcessing,
			count_after_gofra: countAfterGofra
		}

		const leftoverPayload = data.leftover
			.filter(item => item.weight && Number(item.weight) > 0)
			.map(item => ({
				id: Number(item.id),
				weight: Number(item.weight)
			}))

		try {
			const promises = []
			promises.push(updateOrders(mainPayload))

			if (leftoverPayload.length > 0) {
				promises.push(updateWeights(leftoverPayload))
			}

			await Promise.all(promises)
			navigate(-1)
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<>
			<PageTitle title="Send order">
				<div className="flex gap-sm justify-center align-center">
					<Button
						onClick={() => navigate(-1)}
						theme={BUTTON_THEME.OUTLINE}
					>
						Back
					</Button>
					{
						!detail &&
						<Button
							onClick={handleSubmit(onSubmit)}
							disabled={isPendingOrders || isPendingWeights}
						>
							Send
						</Button>
					}
				</div>
			</PageTitle>

			<Card className="span-12" screen={false} style={{padding: '1.5rem'}}>
				<Form className="grid gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
					{itemFields.map((groupField, groupIndex) => (
						<div key={groupField.id} className="grid gap-lg span-12"
						     style={{borderBottom: '1px solid #eee', paddingBottom: '2rem'}}>
							<PageIcon className="span-2">
								<Corrugation/>
							</PageIcon>
							<div className="span-3">
								<Input
									id={`items.${groupIndex}.format`}
									disabled={true}
									label={`${t('Production format')} (${t('mm')})`}
									value={decimalToInteger(Number(responseData?.group_order?.[groupIndex]?.separated_raw_materials_format?.format || 0))}
								/>
							</div>
							<div className="span-3">
								<Select
									id={`items.${groupIndex}.has_addition`}
									label="Cutting"
									disabled={true}
									options={booleanOptions as unknown as ISelectOption[]}
									value={getSelectValue(booleanOptions as unknown as ISelectOption[], groupField.has_addition)}
								/>
							</div>

							{groupField.has_addition && (
								<div className="span-4">
									<Controller
										control={control}
										name={`items.${groupIndex}.pallet`}
										render={({field}) => (
											<NumberFormattedInput
												id={`items.${groupIndex}.pallet`}
												maxLength={12}
												disableGroupSeparators={false}
												allowDecimals={true}
												label="Pallet count"
												disabled={detail}
												error={errors?.items?.[groupIndex]?.pallet?.message}
												{...field}
											/>
										)}
									/>
								</div>
							)}

							<div className="span-12 grid gap-lg">
								{groupField.orders.map((orderField, orderIndex) => (
									<div className="grid gap-lg span-12" key={orderField.order_id}>
										<div className="span-4">
											<Input
												id={`items.${groupIndex}.orders.${orderIndex}.order_id`}
												disabled={true}
												label="Order number"
												value={`#${orderField.order_id}`}
											/>
										</div>
										<div className="span-4">
											<Controller
												control={control}
												name={`items.${groupIndex}.orders.${orderIndex}.count`}
												render={({field}) => (
													<NumberFormattedInput
														id={`items.${groupIndex}.orders.${orderIndex}.count`}
														maxLength={12}
														disableGroupSeparators={false}
														allowDecimals={true}
														label="Count"
														disabled={detail}
														error={errors?.items?.[groupIndex]?.orders?.[orderIndex]?.count?.message}
														{...field}
													/>
												)}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					))}

					{!detail && leftoverFields.length > 0 && (
						<div className="grid gap-lg span-12"
						     style={{marginTop: '1rem'}}>


							{leftoverFields.map((field, index) => {
								const materialLabel = responseData?.materials?.find(m => m.id == watch(`leftover.${index}.id`))?.name || '-'
								return (
									<div key={field.id} className="grid gap-lg span-12 align-end">
										<div className="span-4">
											<Input
												id={`leftover.${index}.name`}
												label={t('Material')}
												value={String(materialLabel)}
												disabled={true}
											/>
										</div>
										<div className="span-4">
											<Controller
												control={control}
												name={`leftover.${index}.weight`}
												render={({field}) => (
													<NumberFormattedInput
														id={`leftover.${index}.weight`}
														label={`${t('Excess roll')} (${t('kg')})`}
														maxLength={12}
														allowDecimals={true}
														{...field}
														error={errors?.leftover?.[index]?.weight?.message}
													/>
												)}
											/>
										</div>
									</div>
								)
							})}
						</div>
					)}
				</Form>
			</Card>
			<HighGroupOrders groupOrders={responseData?.group_order || []} detail={true}/>
		</>
	)
}

export default CorrugationOrder