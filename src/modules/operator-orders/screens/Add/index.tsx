import { useActions, useAdd, useData, usePaginatedData, usePagination, useTypedSelector } from 'hooks'
import { Button, Card, Form, Input, NumberFormattedInput, PageTitle, Pagination, ReactTable, Select } from 'components'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { operatorOrderSchema } from 'helpers/yup'
import { calculateTotalGlueUsageInL, decimalToInteger, formatSelectOptions, getSelectValue } from 'utilities/common'
import { ISelectOption } from 'interfaces/form.interface'
import { useTranslation } from 'react-i18next'
import { BUTTON_THEME } from 'constants/fields'
import { FC, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IGroupOrder } from 'interfaces/groupOrders.interface'
import HighGroupOrders from 'components/HighGroupOrders'
import { Column } from 'react-table'
import { IOrderDetail } from 'interfaces/orders.interface'
import { getDate } from 'utilities/date'
import { cutOptions } from 'helpers/options'


const Index: FC = () => {
	const { t } = useTranslation()
	const { id } = useParams()
	const { groupOrders } = useTypedSelector(state => state.groupOrders)
	const navigate = useNavigate()
	const { data: materials = [] } = useData<ISelectOption[]>('products/materials/select')
	const { data: warehouses = [] } = useData<ISelectOption[]>('accounts/warehouses-select')
	const [isAdding, setIsAdding] = useState<boolean>(false)
	const { page, pageSize } = usePagination()
	const { addGroupOrder, clearGroupOrders } = useActions()

	const { data, totalPages, isPending: isLoading } = usePaginatedData<IGroupOrder[]>(`services/group-orders`,
		{
			page: page,
			page_size: pageSize
		},
		isAdding
	)

	const columns: Column<IGroupOrder>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IGroupOrder, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '3rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Order number'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order: IOrderDetail, index) => (
							<>
								<div>
									#{order.id}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</>
						))
					}
				</div>
			},
			{
				Header: t('Company name'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<>
								<div>
									{order?.company_name}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</>
						))
					}
				</div>
			},
			{
				Header: t('Name'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<>
								<div>
									{order?.name}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</>
						))
					}
				</div>
			},
			{
				Header: `${t('Sizes')} (${t('mm')})`,
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<>
								<div>
									{`${order.width}*${order.length}${order.height ? `*${order.height}` : ''}`}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</>
						))
					}
				</div>
			},
			{
				Header: t('Layer'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<>
								<div>
									{order?.layer?.length || order?.layer_seller?.length || 0}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</>
						))
					}
				</div>
			},
			{
				Header: t('Count'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<>
								<div>
									{decimalToInteger(order?.count_last || order?.count_after_bet || order?.count_after_gluing || order?.count_after_flex || order?.count_after_processing || order?.count_entered_leader || order?.count || 0)}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</>
						))
					}
				</div>
			},
			{
				Header: t('Deadline'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<>
								<div>
									{order?.deadline ? getDate(order?.deadline) : null}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</>
						))
					}
				</div>
			},
			{
				Header: `${t('Production format')} (${t('mm')})`,
				accessor: (row: IGroupOrder) => decimalToInteger(row.separated_raw_materials_format?.format)
			},
			{
				Header: t('Actions'),
				accessor: (row: IGroupOrder) => {
					const isSelected = !!groupOrders?.find(order => order?.id == row?.id)
					const firstSelectedFormat = groupOrders?.[0]?.separated_raw_materials_format?.id
					const isDifferentFormat = !!firstSelectedFormat && row?.separated_raw_materials_format?.id !== firstSelectedFormat

					return (
						<div className="flex items-start gap-lg">
							{
								<Button
									mini={true}
									disabled={isSelected || isDifferentFormat}
									onClick={() => {
										addGroupOrder({ ...row })
										setIsAdding(false)
									}}
								>
									Choosing
								</Button>
							}
						</div>
					)
				}
			}
		],
		[page, pageSize, groupOrders]
	)

	const {
		reset,
		control,
		handleSubmit,
		watch,
		getValues,
		register,
		formState: { errors }
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			data: [],
			warehouse: undefined,
			glue: undefined,
			glue_amount: undefined,
			comment: ''
		},
		resolver: yupResolver(operatorOrderSchema)
	})

	const { data: glues = [] } = useData<ISelectOption[]>('chemicals/glues-select', !!watch('warehouse'), {
		warehouse: watch('warehouse')
	})

	const { fields } = useFieldArray({
		control,
		name: 'data' as never
	})

	const { mutateAsync: addGroupOrderForm, isPending: isAddLoading } = useAdd('services/consecutive-orders')

	useEffect(() => {
		if (groupOrders?.length && materials?.length) {
			let totalGlue = 0
			const materialWeights = new Map<number, number>()

			groupOrders.forEach(groupOrder => {
				totalGlue += calculateTotalGlueUsageInL(groupOrder?.orders || [], groupOrder?.separated_raw_materials_format?.format) * Number(groupOrder?.glue_square || 0.5)

				const format = Number(groupOrder?.separated_raw_materials_format?.format || 0)

				groupOrder?.orders?.forEach(order => {
					const width = parseFloat(order?.width || '0')
					const length = parseFloat(order?.length || '0')
					const cutFactor = Number(cutOptions.find((item) => item?.value == order?.piece)?.material || 1)
					const count = Math.ceil(Number(order?.count_entered_leader || order?.count || 0) / cutFactor)

					const baseAreaMm2 = count * (2 * (width + length) + 70) * format
					const baseAreaM2 = baseAreaMm2 / 1_000_000

					order?.layer?.forEach((layerIdStr, layerIndex) => {
						const layerId = Number(layerIdStr)
						if (!layerId) return

						const materialInfo = materials.find(m => m.value == layerId)
						const weight1x1 = Number(materialInfo?.weight_1x1 || 0)

						const isFlute = layerIndex % 2 !== 0
						const areaFactor = isFlute ? 1.45 : 1.0

						const layerWeight = (baseAreaM2 * areaFactor * weight1x1 * 1.05) / 1000

						const currentWeight = materialWeights.get(layerId) || 0
						materialWeights.set(layerId, currentWeight + layerWeight)
					})
				})
			})

			const calculatedData = Array.from(materialWeights.entries()).map(([matId, weight]) => ({
				material: undefined,
				layer: matId,
				weight: String(weight.toFixed(2))
			}))

			reset({
				warehouse: getValues('warehouse'),
				glue: getValues('glue'),
				glue_amount: String(totalGlue.toFixed(2)),
				data: calculatedData
			})
		} else {
			reset({
				data: [],
				warehouse: undefined,
				glue: undefined,
				glue_amount: undefined
			})
		}
	}, [groupOrders, materials])

	const { data: rolls = [] } = useData<ISelectOption[]>('products/base-materials/select', !!watch('warehouse') && !!groupOrders?.[0]?.separated_raw_materials_format?.id, {
		format_: groupOrders?.[0]?.separated_raw_materials_format?.id,
		warehouse: watch('warehouse'),
		group_order: id ? id : null
	})

	const watchedData = watch('data')

	return (
		<>
			<PageTitle title="Send order">
				<div className="flex gap-sm justify-center align-center">
					<Button
						onClick={() => {
							navigate(-1)
							clearGroupOrders()
						}}
						theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
					<Button
						onClick={
							handleSubmit((data) => {
								const newData = {
									group_order: groupOrders?.map(item => item?.id),
									data: data?.data?.map(i => ({
										material: i?.material,
										weight: i?.weight,
										layer: i?.layer
									})),
									warehouse: data?.warehouse,
									glue: data?.glue,
									comment: data?.comment,
									glue_amount: (Number(data?.glue_amount) / groupOrders.length).toFixed(2)
								}
								addGroupOrderForm(newData)
									.then(() => {
										navigate(-1)
										reset({
											data: [],
											warehouse: undefined,
											glue: undefined,
											glue_amount: undefined
										})
										clearGroupOrders()
									})
							})
						}
						disabled={isAddLoading || groupOrders.length === 0}
					>
						Send
					</Button>
				</div>
			</PageTitle>
			<Card className="span-12" screen={false} style={{ padding: '1.5rem' }}>
				<Form className="grid  gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
					<div className="grid gap-lg span-12">
						<div className="span-3">
							<Controller
								name="warehouse"
								control={control}
								render={({ field: { value, ref, onChange, onBlur } }) => (
									<Select
										id="warehouse"
										label="Material warehouse"
										options={warehouses}
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
						<div className="span-3">
							<Controller
								name="glue"
								control={control}
								render={({ field: { value, ref, onChange, onBlur } }) => (
									<Select
										id="glue"
										label="Glue"
										options={glues}
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
						<div className="span-3">
							<Controller
								control={control}
								name={`glue_amount`}
								render={({ field }) => (
									<NumberFormattedInput
										id={`glue_amount`}
										maxLength={12}
										disableGroupSeparators={false}
										allowDecimals={true}
										label={t('Glue amount')}
										error={errors?.glue_amount?.message}
										{...field}
									/>
								)}
							/>
						</div>
						<div className="span-3 flex justify-end">
							<div>
								<Button style={{ marginTop: '1.9rem' }} onClick={() => setIsAdding(true)}>
									Add order
								</Button>
							</div>
						</div>
						<div className="span-12">
							<Input
								id={`comment`}
								label={t('Comment')}
								error={errors?.comment?.message}
								{...register('comment')}
							/>
						</div>
					</div>
					{
						fields?.map((field, index) => {
							const otherSelectedRolls = watchedData
								?.filter((_, i) => i !== index)
								.flatMap(item => item.material || [])

							const availableRollOptions = formatSelectOptions(rolls, watchedData?.[index]?.layer)
								.filter(option => !otherSelectedRolls.includes(option.value))

							return (
								<div className="grid gap-lg span-12" key={field.id}>
									<div className="span-4">
										<Controller
											name={`data.${index}.layer`}
											control={control}
											render={({ field: { value, ref, onChange, onBlur } }) => (
												<Select
													ref={ref}
													top={true}
													id={`payment.${index}.layer`}
													label={`${t('Material')}`}
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
											render={({ field }) => (
												<NumberFormattedInput
													id={`data.${index}.weight`}
													maxLength={12}
													disableGroupSeparators={false}
													allowDecimals={true}
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
											render={({ field: { value, ref, onChange, onBlur } }) => (
												<Select
													ref={ref}
													id={`payment.${index}.material`}
													label={`${t('Roll')}`}
													options={availableRollOptions}
													onBlur={onBlur}
													isMulti={true}
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
					</div>
				</Form>
			</Card>

			{
				isAdding ?
					<>
						<Card style={{ marginTop: '2rem' }}>
							<ReactTable
								columns={columns}
								data={data}
								isLoading={isLoading}
							/>
						</Card>
						<Pagination totalPages={totalPages} />
					</> :
					<HighGroupOrders groupOrders={groupOrders} />
			}
		</>
	)
}

export default Index