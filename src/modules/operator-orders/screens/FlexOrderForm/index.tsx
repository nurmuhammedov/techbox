import {yupResolver} from '@hookform/resolvers/yup'
import {Corrugation, Flex} from 'assets/icons'
import {Button, Card, Form, NumberFormattedInput, PageTitle, OrderDetailHOC, PageIcon} from 'components'
import {BUTTON_THEME} from 'constants/fields'
import {flexOperatorsOrderSchema} from 'helpers/yup'
import {useUpdate} from 'hooks'
import {IOrderDetail} from 'interfaces/orders.interface'
import {FC, useEffect} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'


interface IProperties {
	retrieve?: boolean
	type?: 'flex' | 'sewing' | 'gluing'
	detail?: IOrderDetail
}

const Index: FC<IProperties> = ({retrieve = false, detail, type = 'flex'}) => {
	const {id} = useParams()
	// const {t} = useTranslation()
	const navigate = useNavigate()
	// const {data: warehouses = []} = useData<ISelectOption[]>((type === 'flex' && !(!detail?.stages_to_passed?.includes('ymo2') && detail?.stages_to_passed?.includes('is_last'))) ? 'accounts/warehouses/same-finished-select' : 'accounts/warehouses/finished-select')
	const {
		reset,
		control,
		handleSubmit,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			percentage: '',
			weight: '',
			area: '',
			warehouse: undefined,
			count: ''
		},
		resolver: yupResolver(flexOperatorsOrderSchema)
	})

	const {
		mutateAsync: update,
		isPending: isUpdate
	} = useUpdate('services/orders/', id, 'patch')

	useEffect(() => {
		if (retrieve) {
			if (type === 'flex') {
				reset({
					// percentage: detail?.percentage_after_flex,
					// weight: detail?.invalid_material_in_flex,
					// area: detail?.mkv_after_flex,
					// warehouse: detail?.warehouse_same_finished?.id,
					count: detail?.count_after_flex
				})
			} else if (type === 'sewing') {
				reset({
					// percentage: detail?.percentage_after_bet,
					// weight: detail?.invalid_material_in_bet,
					// warehouse: detail?.warehouse_finished?.id,
					// area: detail?.mkv_after_bet,
					count: detail?.count_after_bet
				})
			} else if (type === 'gluing') {
				reset({
					// percentage: detail?.percentage_after_gluing,
					// weight: detail?.invalid_material_in_gluing,
					// warehouse: detail?.warehouse_finished?.id,
					// area: detail?.mkv_after_gluing,
					count: detail?.count_after_gluing
				})
			}
		} else if (detail) {
			reset({
				percentage: '',
				weight: '',
				area: '',
				warehouse: undefined,
				count: ''
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
									if (type === 'flex') {
										newData = {
											// invalid_material_in_flex: data?.weight,
											// percentage_after_flex: data?.percentage,
											// warehouse: data?.warehouse,
											// mkv_after_flex: data?.area,
											count_after_flex: data?.count
										}
									} else if (type === 'sewing') {
										newData = {
											// invalid_material_in_bet: data?.weight,
											// warehouse_finished: data?.warehouse,
											// percentage_after_bet: data?.percentage,
											// mkv_after_bet: data?.area,
											count_after_bet: data?.count
										}
									} else if (type === 'gluing') {
										newData = {
											// invalid_material_in_gluing: data?.weight,
											// warehouse_finished: data?.warehouse,
											// percentage_after_gluing: data?.percentage,
											// mkv_after_gluing: data?.area,
											count_after_gluing: data?.count
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
												count: undefined
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
					<PageIcon className="span-2">
						{type == 'flex' ? <Flex/> : <Corrugation/>}
					</PageIcon>
					{/*<div className="span-4">*/}
					{/*	<Controller*/}
					{/*		name="warehouse"*/}
					{/*		control={control}*/}
					{/*		render={({field: {value, ref, onChange, onBlur}}) => (*/}
					{/*			<Select*/}
					{/*				id="warehouse"*/}
					{/*				label={(type === 'flex' && !(!detail?.stages_to_passed?.includes('ymo2') && detail?.stages_to_passed?.includes('is_last'))) ? `Semi-finished warehouse` : 'Ready-made warehouse'}*/}
					{/*				options={warehouses}*/}
					{/*				disabled={retrieve}*/}
					{/*				error={errors?.warehouse?.message}*/}
					{/*				value={getSelectValue(warehouses, value)}*/}
					{/*				ref={ref}*/}
					{/*				onBlur={onBlur}*/}
					{/*				defaultValue={getSelectValue(warehouses, value)}*/}
					{/*				handleOnChange={(e) => onChange(e as string)}*/}
					{/*			/>*/}
					{/*		)}*/}
					{/*	/>*/}
					{/*</div>*/}

					<div className="span-4">
						<Controller
							control={control}
							name={`count`}
							render={({field}) => (
								<NumberFormattedInput
									id={`count`}
									maxLength={12}
									disableGroupSeparators={false}
									allowDecimals={true}
									disabled={retrieve}
									label="Count"
									error={errors?.count?.message}
									{...field}
								/>
							)}
						/>
					</div>

					{/*<div className="span-4">*/}
					{/*	<Controller*/}
					{/*		control={control}*/}
					{/*		name="weight"*/}
					{/*		render={({field}) => (*/}
					{/*			<NumberFormattedInput*/}
					{/*				id="weight"*/}
					{/*				maxLength={12}*/}
					{/*				disableGroupSeparators={false}*/}
					{/*				allowDecimals={true}*/}
					{/*				disabled={retrieve}*/}
					{/*				label={`${t('Waste paper')} (${t('kg')})`}*/}
					{/*				error={errors?.weight?.message}*/}
					{/*				{...field}*/}
					{/*			/>*/}
					{/*		)}*/}
					{/*	/>*/}
					{/*</div>*/}

					{/*<div className="span-4">*/}
					{/*	<Controller*/}
					{/*		control={control}*/}
					{/*		name="percentage"*/}
					{/*		render={({field}) => (*/}
					{/*			<NumberFormattedInput*/}
					{/*				id="percentage"*/}
					{/*				maxLength={12}*/}
					{/*				disableGroupSeparators={false}*/}
					{/*				allowDecimals={true}*/}
					{/*				disabled={retrieve}*/}
					{/*				label={`${t('Waste paper percentage')} (${t('%')})`}*/}
					{/*				error={errors?.percentage?.message}*/}
					{/*				{...field}*/}
					{/*			/>*/}
					{/*		)}*/}
					{/*	/>*/}
					{/*</div>*/}

					{/*<div className="span-4">*/}
					{/*	<Controller*/}
					{/*		control={control}*/}
					{/*		name="area"*/}
					{/*		render={({field}) => (*/}
					{/*			<NumberFormattedInput*/}
					{/*				id="area"*/}
					{/*				maxLength={12}*/}
					{/*				disableGroupSeparators={false}*/}
					{/*				allowDecimals={false}*/}
					{/*				disabled={retrieve}*/}
					{/*				label={`${t('Waste paper area')} (${t('m²')})`}*/}
					{/*				error={errors?.area?.message}*/}
					{/*				{...field}*/}
					{/*			/>*/}
					{/*		)}*/}
					{/*	/>*/}
					{/*</div>*/}

				</Form>
			</Card>
		</>
	)
}


const HOF = OrderDetailHOC<IProperties>(Index)

export default HOF