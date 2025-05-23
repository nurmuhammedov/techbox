import {yupResolver} from '@hookform/resolvers/yup'
import {Corrugation} from 'assets/icons'
import {Button, Card, Form, Input, NumberFormattedInput, PageIcon, PageTitle, Select} from 'components'
import {GroupOrderDetail} from 'components/HOC'
import {BUTTON_THEME} from 'constants/fields'
import {booleanOptions} from 'helpers/options'
import {operatorsOrderSchema} from 'helpers/yup'
import {useUpdate} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import {IGroupOrder} from 'interfaces/groupOrders.interface'
import {FC, useEffect} from 'react'
import {Controller, useFieldArray, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import {decimalToInteger, getSelectValue} from 'utilities/common'


interface IProperties {
	retrieve?: boolean
	type?: 'corrugation' | 'flex' | 'sewing' | 'gluing'
	detail?: IGroupOrder
}

const Index: FC<IProperties> = ({retrieve = false, detail, type = 'corrugation'}) => {
	const {id} = useParams()
	const {t} = useTranslation()
	const navigate = useNavigate()
	// const {data: warehouses = []} = useData<ISelectOption[]>((type === 'corrugation' || type === 'flex') ? 'accounts/warehouses/same-finished-select' : 'accounts/warehouses/finished-select')
	// const {data: finished = []} = useData<ISelectOption[]>('accounts/warehouses/finished-select')

	const {
		reset,
		control,
		register,
		watch,
		handleSubmit,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			percentage: '',
			weight: '',
			area: '',
			pallet: '0',
			data: [
				{
					order: undefined,
					// warehouse: undefined,
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

	const {
		mutateAsync: update,
		isPending: isUpdate
	} = useUpdate(type === 'corrugation' ? 'services/group-orders/' : 'services/orders/', id, 'patch')

	useEffect(() => {
		if (retrieve) {
			if (type === 'corrugation') {
				reset({
					percentage: detail?.percentage_after_processing,
					weight: detail?.invalid_material_in_processing,
					area: detail?.mkv_after_processing,
					pallet: detail?.pallet_count_after_gofra,
					warehouse: detail?.pallet_warehouse?.id,
					data: detail?.count_after_processing?.length ? detail?.count_after_processing : []
				})
			} else if (type === 'flex') {
				reset({
					percentage: detail?.percentage_after_flex,
					weight: detail?.invalid_material_in_flex,
					area: detail?.mkv_after_flex,
					warehouse: detail?.warehouse_same_finished?.id,
					data: detail?.orders?.map(order => ({
						order: order.id,
						count: order.count_after_flex
					}))
				})
			} else if (type === 'sewing') {
				reset({
					percentage: detail?.percentage_after_bet,
					weight: detail?.invalid_material_in_bet,
					warehouse: detail?.warehouse?.id,
					area: detail?.mkv_after_bet,
					data: detail?.orders?.map(order => ({
						order: order.id,
						count: order.count_after_bet
					}))
				})
			} else if (type === 'gluing') {
				reset({
					percentage: detail?.percentage_after_gluing,
					weight: detail?.invalid_material_in_gluing,
					warehouse: detail?.warehouse?.id,
					area: detail?.mkv_after_gluing,
					data: detail?.orders?.map(order => ({
						order: order.id,
						count: order.count_after_gluing
					}))
				})
			}
		} else if (detail) {
			reset({
				percentage: '',
				weight: '',
				area: '',
				warehouse: undefined,
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
					{
						!retrieve &&
						<Button
							onClick={
								handleSubmit((data) => {
									let newData = undefined
									if (type === 'corrugation') {
										newData = {
											// invalid_material_in_processing: data?.weight,
											// percentage_after_processing: data?.percentage,
											// mkv_after_processing: data?.area,
											// pallet_warehouse: data?.warehouse,
											pallet_count_after_gofra: data?.pallet,
											count_after_processing: data?.data
										}
									} else if (type === 'flex') {
										newData = {
											// invalid_material_in_flex: data?.weight,
											// percentage_after_flex: data?.percentage,
											// warehouse_same_finished: data?.warehouse,
											// mkv_after_flex: data?.area,
											count_after_flex: data?.data
										}
									} else if (type === 'sewing') {
										newData = {
											// invalid_material_in_bet: data?.weight,
											// warehouse_finished: data?.warehouse,
											// percentage_after_bet: data?.percentage,
											// mkv_after_bet: data?.area,
											count_after_bet: data?.data
										}
									} else if (type === 'gluing') {
										newData = {
											// invalid_material_in_gluing: data?.weight,
											// warehouse_finished: data?.warehouse,
											// percentage_after_gluing: data?.percentage,
											// mkv_after_gluing: data?.area,
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
												warehouse: undefined,
												data: [
													{
														order: undefined,
														// warehouse: undefined,
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
					}
				</div>
			</PageTitle>
			<Card className="span-12" screen={false} style={{padding: '1.5rem'}}>
				<Form className="grid  gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
					<div className="grid gap-lg span-12">
						<PageIcon className="span-2">
							<Corrugation/>
						</PageIcon>
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
										value={`#${watch(`data.${index}.order`) as unknown as string || ''}`}
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

								{/*{*/}
								{/*	!retrieve &&*/}
								{/*	<div className="span-4">*/}
								{/*		<Controller*/}
								{/*			name={`data.${index}.warehouse`}*/}
								{/*			control={control}*/}
								{/*			render={({field: {value, ref, onChange, onBlur}}) => (*/}
								{/*				<Select*/}
								{/*					id="warehouse"*/}
								{/*					label={detail?.orders?.find(i => i.id == watch(`data.${index}.order`))?.stages_to_passed?.toString() === ['gofra', 'is_last']?.toString() ? 'Ready-made warehouse' : 'Semi-finished warehouse'}*/}
								{/*					options={detail?.orders?.find(i => i.id == watch(`data.${index}.order`))?.stages_to_passed?.toString() === ['gofra', 'is_last']?.toString() ? finished : warehouses}*/}
								{/*					disabled={retrieve}*/}
								{/*					error={errors?.data?.[index]?.warehouse?.message}*/}
								{/*					value={getSelectValue(detail?.orders?.find(i => i.id == watch(`data.${index}.order`))?.stages_to_passed?.toString() === ['gofra', 'is_last']?.toString() ? finished : warehouses, value)}*/}
								{/*					ref={ref}*/}
								{/*					onBlur={onBlur}*/}
								{/*					defaultValue={getSelectValue(detail?.orders?.find(i => i.id == watch(`data.${index}.order`))?.stages_to_passed?.toString() === ['gofra', 'is_last']?.toString() ? finished : warehouses, value)}*/}
								{/*					handleOnChange={(e) => onChange(e as string)}*/}
								{/*				/>*/}
								{/*			)}*/}
								{/*		/>*/}
								{/*	</div>*/}
								{/*}*/}
							</div>
						))
					}

					{
						detail?.has_addition &&
						<div className="grid gap-lg span-12">
							<div className="span-4">
								<Controller
									control={control}
									name={`pallet`}
									render={({field}) => (
										<NumberFormattedInput
											id={`pallet`}
											maxLength={12}
											disableGroupSeparators={false}
											allowDecimals={true}
											disabled={retrieve}
											label="Pallet count"
											error={errors?.pallet?.message}
											{...field}
										/>
									)}
								/>
							</div>
							{/*<div className="span-4">*/}
							{/*	<Controller*/}
							{/*		name="warehouse"*/}
							{/*		control={control}*/}
							{/*		render={({field: {value, ref, onChange, onBlur}}) => (*/}
							{/*			<Select*/}
							{/*				id="warehouse"*/}
							{/*				label={detail?.stages_to_passed?.toString() === ['gofra', 'is_last']?.toString() ? 'Ready-made warehouse' : 'Semi-finished warehouse'}*/}
							{/*				options={detail?.stages_to_passed?.toString() === ['gofra', 'is_last']?.toString() ? finished : warehouses}*/}
							{/*				disabled={retrieve}*/}
							{/*				error={errors?.warehouse?.message}*/}
							{/*				value={getSelectValue(detail?.stages_to_passed?.toString() === ['gofra', 'is_last']?.toString() ? finished : warehouses, value)}*/}
							{/*				ref={ref}*/}
							{/*				onBlur={onBlur}*/}
							{/*				defaultValue={getSelectValue(detail?.stages_to_passed?.toString() === ['gofra', 'is_last']?.toString() ? finished : warehouses, value)}*/}
							{/*				handleOnChange={(e) => onChange(e as string)}*/}
							{/*			/>*/}
							{/*		)}*/}
							{/*	/>*/}
							{/*</div>*/}
						</div>
					}

					{/*<div className="grid gap-lg span-12">*/}
					{/*	<div className="span-4">*/}
					{/*		<Controller*/}
					{/*			control={control}*/}
					{/*			name="weight"*/}
					{/*			render={({field}) => (*/}
					{/*				<NumberFormattedInput*/}
					{/*					id="weight"*/}
					{/*					maxLength={12}*/}
					{/*					disableGroupSeparators={false}*/}
					{/*					allowDecimals={true}*/}
					{/*					disabled={retrieve}*/}
					{/*					label={`${t('Waste paper')} (${t('kg')})`}*/}
					{/*					error={errors?.weight?.message}*/}
					{/*					{...field}*/}
					{/*				/>*/}
					{/*			)}*/}
					{/*		/>*/}
					{/*	</div>*/}
					{/*	<div className="span-4">*/}
					{/*		<Controller*/}
					{/*			control={control}*/}
					{/*			name="percentage"*/}
					{/*			render={({field}) => (*/}
					{/*				<NumberFormattedInput*/}
					{/*					id="percentage"*/}
					{/*					maxLength={12}*/}
					{/*					disableGroupSeparators={false}*/}
					{/*					allowDecimals={true}*/}
					{/*					disabled={retrieve}*/}
					{/*					label={`${t('Waste paper percentage')} (${t('%')})`}*/}
					{/*					error={errors?.percentage?.message}*/}
					{/*					{...field}*/}
					{/*				/>*/}
					{/*			)}*/}
					{/*		/>*/}
					{/*	</div>*/}
					{/*	<div className="span-4">*/}
					{/*		<Controller*/}
					{/*			control={control}*/}
					{/*			name="area"*/}
					{/*			render={({field}) => (*/}
					{/*				<NumberFormattedInput*/}
					{/*					id="area"*/}
					{/*					maxLength={12}*/}
					{/*					disableGroupSeparators={false}*/}
					{/*					allowDecimals={false}*/}
					{/*					disabled={retrieve}*/}
					{/*					label={`${t('Waste paper area')} (${t('m²')})`}*/}
					{/*					error={errors?.area?.message}*/}
					{/*					{...field}*/}
					{/*				/>*/}
					{/*			)}*/}
					{/*		/>*/}
					{/*	</div>*/}
					{/*</div>*/}
				</Form>
			</Card>
		</>
	)
}


const HOF = GroupOrderDetail<IProperties>(Index)

export default HOF
