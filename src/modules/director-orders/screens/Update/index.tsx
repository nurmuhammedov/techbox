import {yupResolver} from '@hookform/resolvers/yup'
import classNames from 'classnames'
import {
	Button,
	Card,
	CutDiagram,
	Diagram,
	EditModal,
	Form,
	Input,
	Loader,
	MaskInput,
	NumberFormattedInput,
	PageTitle,
	Select
} from 'components'
import styles from 'components/HOC/GroupOrderDetail/styles.module.scss'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {activityOptions, booleanOptions, cutOptions} from 'helpers/options'
import {groupOrdersSchema, temporaryOrderSchema} from 'helpers/yup'
import {useActions, useData, useDetail, useSearchParams, useTypedSelector, useUpdate} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import {IOrderDetail} from 'interfaces/orders.interface'
import {IGroupOrder} from 'interfaces/groupOrders.interface'
import {useEffect} from 'react'
import {Controller, useFieldArray, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import {decimalToInteger, getSelectValue} from 'utilities/common'
import {formatDateToISO, getDate} from 'utilities/date'


const UpdateDirectorOrder = () => {
	const {t} = useTranslation()
	const navigate = useNavigate()
	const {id} = useParams()
	const {
		removeParams,
		addParams,
		paramsObject: {updateId = undefined}
	} = useSearchParams()
	const {addOrder, updateOrder, clearOrders} = useActions()
	const {orders} = useTypedSelector(state => state.orders)
	const {data: formats = []} = useData<ISelectOption[]>('products/formats/select')
	const {data: materials = []} = useData<ISelectOption[]>('products/materials/select')

	const {
		data: groupDetail,
		isPending: isGroupDetailLoading
	} = useDetail<IGroupOrder>('services/group-orders/', id, !!id)
	const {mutateAsync: updateGroupOrder, isPending: isUpdateLoading} = useUpdate('services/group-orders/', id, 'patch')

	const {
		handleSubmit,
		control: controlAdd,
		reset,
		watch,
		formState: {errors}
	} = useForm({
		resolver: yupResolver(groupOrdersSchema),
		mode: 'onTouched',
		defaultValues: {
			separated_raw_materials_format: undefined,
			y: '',
			x: '',
			deadline: '',
			count: '',
			glue_square: '0.05',
			gofra: false,
			ymo1: false,
			fleksa: false,
			ymo2: false,
			tikish: false,
			yelimlash: false,
			is_list: false,
			has_addition: false
		}
	})

	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		control,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			deadline: '',
			count_entered_leader: '',
			piece: undefined,
			layer: [],
			l0: '',
			l1: '',
			l2: '',
			l3: '',
			l4: '',
			l5: '',
			gofra: false,
			ymo1: false,
			fleksa: false,
			ymo2: false,
			tikish: false,
			yelimlash: false,
			is_list: false,
			length: ''
		},
		resolver: yupResolver(temporaryOrderSchema)
	})

	const {fields} = useFieldArray({
		control,
		name: 'layer' as never
	})

	const {
		mutateAsync: updateOrderApi,
		isPending: isUpdatingOrder
	} = useUpdate('services/orders/', updateId, 'patch')

	const {
		data: orderDetail,
		isPending: isOrderDetailLoading
	} = useDetail<IOrderDetail>('services/orders/', updateId, !!updateId)

	useEffect(() => {
		if (groupDetail) {
			reset({
				separated_raw_materials_format: groupDetail.separated_raw_materials_format?.id,
				y: groupDetail.y?.toString() || '',
				x: groupDetail.x?.toString() || '',
				deadline: groupDetail.deadline ? getDate(groupDetail.deadline) : '',
				count: groupDetail.count?.toString() || '',
				glue_square: groupDetail.glue_square || '0.05',
				has_addition: groupDetail.has_addition || false,
				gofra: groupDetail.stages_to_passed?.includes('gofra'),
				ymo1: groupDetail.stages_to_passed?.includes('ymo1'),
				fleksa: groupDetail.stages_to_passed?.includes('fleksa'),
				ymo2: groupDetail.stages_to_passed?.includes('ymo2'),
				tikish: groupDetail.stages_to_passed?.includes('tikish'),
				yelimlash: groupDetail.stages_to_passed?.includes('yelimlash'),
				is_list: groupDetail.stages_to_passed?.includes('is_list')
			})

			clearOrders()
			groupDetail.orders?.forEach(order => {
				addOrder(order)
			})
		}
	}, [groupDetail, reset, clearOrders, addOrder])

	useEffect(() => {
		if (orderDetail && updateId) {
			resetEdit({
				layer: orderDetail?.layer || [],
				deadline: orderDetail?.deadline ? getDate(orderDetail?.deadline) : '',
				count_entered_leader: orderDetail?.count_entered_leader || orderDetail?.count || '0',
				piece: orderDetail?.piece?.toString() || cutOptions[0].value?.toString() || undefined,
				l0: orderDetail?.l0 || '',
				l1: orderDetail?.l1 || '',
				l2: orderDetail?.l2 || '',
				l3: orderDetail?.l3 || '',
				l4: orderDetail?.l4 || '',
				l5: orderDetail?.l5 || '',
				gofra: orderDetail?.stages_to_passed?.includes('gofra'),
				ymo1: orderDetail?.stages_to_passed?.includes('ymo1'),
				fleksa: orderDetail?.stages_to_passed?.includes('fleksa'),
				ymo2: orderDetail?.stages_to_passed?.includes('ymo2'),
				tikish: orderDetail?.stages_to_passed?.includes('tikish'),
				yelimlash: orderDetail?.stages_to_passed?.includes('yelimlash'),
				is_list: orderDetail?.stages_to_passed?.includes('is_list'),
				length: orderDetail?.length || ''
			})
		}
	}, [orderDetail, updateId, resetEdit])

	const onSubmit = (data: any) => {
		const updateData = {
			separated_raw_materials_format: data?.separated_raw_materials_format,
			glue_square: data?.glue_square,
			y: data?.y,
			x: data?.x,
			has_addition: data?.has_addition,
			stages_to_passed: Object.keys(data).filter((key) => data[key as keyof typeof data] === true)?.filter(i => i !== 'has_addition')?.reverse(),
			deadline: formatDateToISO(data?.deadline as string | undefined) || null,
			count: data?.count
		}

		updateGroupOrder(updateData)
			.then(() => {
				navigate(-1)
			})
	}

	if (isGroupDetailLoading) return <Loader/>

	return (
		<>
			<PageTitle title="Buyurtmani tahrirlash">
				<div className="flex gap-sm justify-center align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
					<Button onClick={handleSubmit(onSubmit)} disabled={isUpdateLoading}>
						Save
					</Button>
				</div>
			</PageTitle>
			<div className={classNames(styles.root, 'grid gap-lg')}>
				<Card className="span-12" screen={false} style={{padding: '1.5rem'}}>
					<Form className="grid-10 gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
						<div className="span-3">
							<Controller
								name="separated_raw_materials_format"
								control={controlAdd}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										id="separated_raw_materials_format"
										label="Production format"
										options={formats}
										error={errors?.separated_raw_materials_format?.message}
										value={getSelectValue(formats, value)}
										ref={ref}
										onBlur={onBlur}
										defaultValue={getSelectValue(formats, value)}
										handleOnChange={(e) => onChange(e as string)}
									/>
								)}
							/>
						</div>
						<div className="span-2">
							<Controller
								name="has_addition"
								control={controlAdd}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										id="has_addition"
										label="Cutting"
										options={booleanOptions as unknown as ISelectOption[]}
										error={errors?.has_addition?.message}
										value={getSelectValue(booleanOptions as unknown as ISelectOption[], value)}
										ref={ref}
										onBlur={onBlur}
										defaultValue={getSelectValue(booleanOptions as unknown as ISelectOption[], value)}
										handleOnChange={(e) => onChange(e as boolean)}
									/>
								)}
							/>
						</div>
						<div className="span-2">
							<Controller
								name="glue_square"
								control={controlAdd}
								render={({field}) => (
									<Input id="glue_square" {...field} type="text"
									       label={`${t('Glue amount')} ${t('(m²)')} `}
									       error={errors?.glue_square?.message}/>
								)}
							/>
						</div>
					</Form>
				</Card>

				<div className="grid gap-lg span-12">
					{
						orders?.map((order) => (
							<Card
								key={order.id}
								screen={false}
								style={{padding: '1.5rem'}}
								className="span-6"
							>
								<div className="grid gap-md">
									<div
										style={{marginBottom: '1.5rem'}}
										className="flex span-12 justify-between gap-lg align-center"
									>
										<div className={styles.title}>
											{order.company_name}
										</div>
										<div className="flex gap-xs align-center">
											<div className={styles.order}>
												{t('Order number')}
											</div>
											<div className={styles.number}>
												#{order.id}
											</div>
										</div>
									</div>
									<div className="span-4">
										<Input
											id="sizes"
											disabled={true}
											label={order.is_list ? t('Length') : `${t('Sizes')} (${t('mm')})`}
											value={order.is_list ? order.length : `${order.width}*${order.length}${order.height ? `*${order.height}` : ''}`}
										/>
									</div>
									{!order.is_list && (
										<div className="span-4">
											<Input
												id="L"
												disabled={true}
												label={`L (${t('mm')})`}
												value={`${decimalToInteger(2 * Number(order.width || 0) + 70 + 2 * Number(order.length || 0))}`}
											/>
										</div>
									)}
									<div className="span-4">
										<Input
											id="prod-count"
											disabled={true}
											label="Production count"
											value={decimalToInteger(order?.count_entered_leader || order?.count || 0)}
										/>
									</div>
									<div className="span-4">
										<Select
											id="format"
											disabled={true}
											label="Format"
											options={formats}
											value={getSelectValue(formats, order?.format?.id)}
											defaultValue={getSelectValue(formats, order?.format?.id)}
										/>
									</div>

									<div className="span-4">
										<Input
											id="layer"
											disabled={true}
											label="Layer"
											value={order?.layer?.length || 0}
										/>
									</div>

									<div className="span-4">
										<Input
											id="count-deadline"
											disabled={true}
											label="Deadline"
											value={order?.deadline ? getDate(order?.deadline) : ''}
											placeholder=" "
										/>
									</div>

									{
										(order?.piece && order?.piece != 'total' && !order.is_list) &&
										<div className="grid span-12" style={{marginTop: '.75rem'}}>
											<CutDiagram
												sections={cutOptions?.find(i => i.value == order?.piece)?.material || 2}
												count={
													<Input
														id="l0"
														mini={true}
														disabled={true}
														value={`${Math.ceil((order?.count_entered_leader || order?.count || 0) as unknown as number / (cutOptions?.find(i => i.value == order?.piece)?.material || 2))} tadan`}
														placeholder=" "
													/>
												}
												x={
													<Input
														id="l3"
														mini={true}
														disabled={true}
														value={`${formats?.find(i => i?.value == watch('separated_raw_materials_format'))?.label || ''} mm`}
														placeholder=" "
													/>
												}
												className="span-12"
											/>
										</div>
									}

									{!order.is_list && (
										<div className="grid span-12" style={{marginTop: '.75rem'}}>
											<Diagram
												l0={
													<Input
														id="l0"
														mini={true}
														disabled={true}
														value={order?.l0 || ''}
														placeholder="mm"
													/>
												}
												l1={
													<Input
														id="l1"
														mini={true}
														disabled={true}
														value={order?.l1 || ''}
														placeholder="mm"
													/>
												}
												l2={
													<Input
														id="l2"
														mini={true}
														disabled={true}
														value={order?.l2 || ''}
														placeholder="mm"
													/>
												}
												l3={
													<Input
														id="l3"
														mini={true}
														disabled={true}
														value={order?.l3 || ''}
														placeholder="mm"
													/>
												}
												l4={
													<Input
														id="l4"
														mini={true}
														disabled={true}
														value={order?.l4 || ''}
														placeholder="mm"
													/>
												}
												l5={
													<Input
														id="l5"
														mini={true}
														disabled={true}
														value={order?.l5 || ''}
														placeholder="mm"
													/>
												}
												className="span-12"
											/>
										</div>
									)}

									<div
										className="span-12 flex gap-md"
										style={{marginTop: '.75rem', whiteSpace: 'wrap', marginBottom: '1.5rem'}}
									>
										<div className="span-4 flex gap-md align-end justify-start">
											<input
												readOnly
												type="checkbox"
												className="checkbox"
												checked={order?.stages_to_passed?.includes('gofra')}
											/>
											<p className="checkbox-label">{t(activityOptions[0].label?.toString() || '')}</p>
										</div>
										<div className="span-4 flex gap-md align-end justify-start">
											<input
												readOnly
												type="checkbox"
												className="checkbox"
												checked={order?.stages_to_passed?.includes('ymo1')}
											/>
											<p className="checkbox-label">{t(activityOptions[1].label?.toString() || '')}</p>
										</div>
										<div className="span-4 flex gap-md align-end justify-start">
											<input
												readOnly
												type="checkbox"
												className="checkbox"
												checked={order?.stages_to_passed?.includes('fleksa')}
											/>
											<p className="checkbox-label">{t(activityOptions[2].label?.toString() || '')}</p>
										</div>
										<div className="span-4 flex gap-md align-end justify-start">
											<input
												readOnly
												type="checkbox"
												className="checkbox"
												checked={order?.stages_to_passed?.includes('ymo2')}
											/>
											<p className="checkbox-label">{t(activityOptions[3].label?.toString() || '')}</p>
										</div>
										<div className="span-4 flex gap-md align-end justify-start">
											<input
												readOnly
												type="checkbox"
												className="checkbox"
												checked={order?.stages_to_passed?.includes('tikish')}
											/>
											<p className="checkbox-label">{t(activityOptions[4].label?.toString() || '')}</p>
										</div>
										<div className="span-4 flex gap-md align-end justify-start">
											<input
												readOnly
												type="checkbox"
												className="checkbox"
												checked={order?.stages_to_passed?.includes('yelimlash')}
											/>
											<p className="checkbox-label">{t(activityOptions[5].label?.toString() || '')}</p>
										</div>
										<div className="span-4 flex gap-md align-end justify-start">
											<input
												readOnly
												type="checkbox"
												className="checkbox"
												checked={order?.stages_to_passed?.includes('is_list')}
											/>
											<p className="checkbox-label">{t(activityOptions[6].label?.toString() || '')}</p>
										</div>
									</div>

									<div className="flex justify-end gap-lg" style={{marginTop: 'auto'}}>
										<Button onClick={() => addParams({updateId: order.id, modal: 'edit'})}>
											Update
										</Button>
									</div>
								</div>
							</Card>
						))
					}
				</div>
			</div>

			<EditModal
				isLoading={isOrderDetailLoading && !orderDetail}
				title={`${t('Order number')}: #${updateId}`}
				style={{height: '45rem'}}
			>
				<Form
					onSubmit={
						handleEditSubmit((data) => {
							const newData = {
								deadline: formatDateToISO(data?.deadline),
								count_entered_leader: data?.count_entered_leader,
								layer: data?.layer,
								piece: data?.piece,
								l0: data?.l0,
								l1: data?.l1,
								l2: data?.l2,
								l3: data?.l3,
								l4: data?.l4,
								l5: data?.l5,
								length: data?.length,
								stages_to_passed: Object.keys(data).filter((key) => data[key as keyof typeof data] === true && key !== 'length')?.reverse()
							}

							updateOrderApi(newData).then(async (data) => {
								updateOrder({
									...data as any,
									id: +(updateId || 0)
								})
								resetEdit({deadline: '', layer: [], l0: '', l1: '', l2: '', l3: '', l4: '', l5: ''})
								removeParams('modal', 'updateId')
							})
						})
					}
				>
					<div className="grid gap-lg">
						{
							fields?.map((field, index) => (
								<div className="span-6" key={field.id}>
									<Controller
										name={`layer.${index}`}
										control={control}
										render={({field: {value, ref, onChange, onBlur}}) => (
											<Select
												id={`layer-${index + 1}`}
												label={`${index + 1}-${t('layer')}`}
												options={materials}
												error={editErrors?.layer?.[index]?.message}
												value={getSelectValue(materials, value)}
												ref={ref}
												onBlur={onBlur}
												defaultValue={getSelectValue(materials, value)}
												handleOnChange={(e) => onChange(e as string)}
											/>
										)}
									/>
								</div>
							))
						}


						{
							!watch('is_list') && (
								<div className="grid span-12" style={{marginTop: '.75rem'}}>
									<Diagram
										l0={<Input id="l0" mini={true} placeholder="mm"
										           err={!!editErrors?.l0?.message} {...registerEdit('l0')} />}
										l1={<Input id="l1" mini={true} placeholder="mm"
										           err={!!editErrors?.l1?.message} {...registerEdit('l1')} />}
										l2={<Input id="l2" mini={true} placeholder="mm"
										           err={!!editErrors?.l2?.message} {...registerEdit('l2')} />}
										l3={<Input id="l3" mini={true} placeholder="mm"
										           err={!!editErrors?.l3?.message} {...registerEdit('l3')} />}
										l4={<Input id="l4" mini={true} placeholder="mm"
										           err={!!editErrors?.l4?.message} {...registerEdit('l4')} />}
										l5={<Input id="l5" mini={true} placeholder="mm"
										           err={!!editErrors?.l5?.message} {...registerEdit('l5')} />}
										className="span-12"
									/>
								</div>
							)
						}
					</div>

					<div className="span-12 flex gap-md" style={{marginTop: '.75rem', marginBottom: '1.5rem'}}>
						<div className="span-4 flex gap-md align-end justify-start">
							<input id={activityOptions[0].value as string} type="checkbox"
							       className="checkbox" {...registerEdit('gofra')} />
							<p className="checkbox-label">{t(activityOptions[0].label as string)}</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input id={activityOptions[1].value as string} type="checkbox"
							       className="checkbox" {...registerEdit('ymo1')} />
							<p className="checkbox-label">{t(activityOptions[1].label as string)}</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input id={activityOptions[2].value as string} type="checkbox"
							       className="checkbox" {...registerEdit('fleksa')} />
							<p className="checkbox-label">{t(activityOptions[2].label as string)}</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input id={activityOptions[3].value as string} type="checkbox"
							       className="checkbox" {...registerEdit('ymo2')} />
							<p className="checkbox-label">{t(activityOptions[3].label as string)}</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input id={activityOptions[4].value as string} type="checkbox"
							       className="checkbox" {...registerEdit('tikish')} />
							<p className="checkbox-label">{t(activityOptions[4].label as string)}</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input id={activityOptions[5].value as string} type="checkbox"
							       className="checkbox" {...registerEdit('yelimlash')} />
							<p className="checkbox-label">{t(activityOptions[5].label as string)}</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input id={activityOptions[6].value as string} type="checkbox"
							       className="checkbox" {...registerEdit('is_list')} />
							<p className="checkbox-label">{t(activityOptions[6].label as string)}</p>
						</div>
					</div>

					<div className="span-12 grid gap-lg">
						<div className="span-4">
							<Controller
								name="deadline"
								control={control}
								render={({field}) => (
									<MaskInput
										id="deadline"
										label="Deadline"
										placeholder={getDate()}
										mask="99.99.9999"
										error={editErrors?.deadline?.message}
										{...field}
									/>
								)}
							/>
						</div>
						<div className="span-4">
							<Controller
								name="count_entered_leader"
								control={control}
								render={({field}) => (
									<NumberFormattedInput
										id="count_entered_leader"
										maxLength={9}
										disableGroupSeparators={false}
										allowDecimals={false}
										label="Production count"
										error={editErrors?.count_entered_leader?.message}
										{...field}
									/>
								)}
							/>
						</div>
						{!watch('is_list') && (
							<div className="span-4">
								<Controller
									name={`piece`}
									control={control}
									render={({field: {value, ref, onChange, onBlur}}) => (
										<Select
											id={`piece`}
											label={`Cut`}
											top={true}
											options={cutOptions}
											error={editErrors?.piece?.message}
											value={getSelectValue(cutOptions, value)}
											ref={ref}
											onBlur={onBlur}
											defaultValue={getSelectValue(cutOptions, value)}
											handleOnChange={(e) => onChange(e as string)}
										/>
									)}
								/>
							</div>
						)}
						<div className="span-4">
							<Controller
								name="length"
								control={control}
								render={({ field }) => (
									<NumberFormattedInput
										id="length"
										maxLength={9}
										disableGroupSeparators
										allowDecimals={false}
										label={`${t('Uzunligi')} (${t('mm')})`}
										error={editErrors?.length?.message}
										{...field}
									/>
								)}
							/>
						</div>
					</div>
					<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isUpdatingOrder}>
						Save
					</Button>
				</Form>
			</EditModal>
		</>
	)
}

export default UpdateDirectorOrder
