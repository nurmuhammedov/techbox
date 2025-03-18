import {yupResolver} from '@hookform/resolvers/yup'
import classNames from 'classnames'
import {
	Button,
	Card,
	Diagram,
	EditModal,
	Form,
	Input,
	MaskInput,
	NumberFormattedInput,
	PageTitle,
	Pagination,
	ReactTable,
	Select
} from 'components'
import styles from 'components/HOC/GroupOrderDetail/styles.module.scss'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {activityOptions, booleanOptions, statusOptions} from 'helpers/options'
import {groupOrdersSchema, temporaryOrderSchema} from 'helpers/yup'
import {
	useActions,
	useAdd,
	useData,
	useDetail,
	usePaginatedData,
	usePagination,
	useSearchParams,
	useTypedSelector,
	useUpdate
} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import {IOrderDetail} from 'interfaces/orders.interface'
import {ISearchParams} from 'interfaces/params.interface'
import {useEffect, useMemo, useState} from 'react'
import {Controller, useFieldArray, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {showMessage} from 'utilities/alert'
import {areAllFieldsPresent, decimalToInteger, getSelectValue} from 'utilities/common'
import {getDate} from 'utilities/date'


const Index = () => {
	const {t} = useTranslation()
	const navigate = useNavigate()
	const {removeParams, addParams, paramsObject: {updateId = undefined}} = useSearchParams()
	const {deleteOrder, addOrder, updateOrder, clearOrders} = useActions()
	const [isAdding, setIsAdding] = useState<boolean>(false)
	const {page, pageSize} = usePagination()
	const {orders} = useTypedSelector(state => state.orders)
	const {data: formats = []} = useData<ISelectOption[]>('products/formats/select')
	const {data: materials = []} = useData<ISelectOption[]>('products/materials/select')

	const {data, totalPages, isPending: isLoading} = usePaginatedData<IOrderDetail[]>(
		`/services/orders-with-detail`,
		{
			page: page,
			page_size: pageSize,
			status: statusOptions[0].value
		},
		isAdding
	)


	const columns: Column<IOrderDetail>[] = useMemo(
		() => [
			{
				Header: t('Order number'),
				accessor: (row: IOrderDetail) => `#${row.id}`,
				style: {
					width: '14rem',
					textAlign: 'start'
				}
			},
			{
				Header: t('Company name'),
				accessor: (row: IOrderDetail) => row.company_name
			},
			{
				Header: t('Count'),
				accessor: (row: IOrderDetail) => decimalToInteger(row.count || '')
			},
			{
				Header: t('Deadline'),
				accessor: (row: IOrderDetail) => row.deadline ? getDate(row.deadline) : null
			},
			{
				Header: `${t('Sizes')} (${t('mm')})`,
				accessor: (row: IOrderDetail) => `${row.width}*${row.height}*${row.length}`
			},
			{
				Header: `${t('Format')} (${t('mm')})`,
				accessor: (row: IOrderDetail) => decimalToInteger(row.format?.name)
			},
			{
				Header: t('Layer'),
				accessor: (row: IOrderDetail) => row.layer?.length || 0
			},
			{
				Header: t('Actions'),
				accessor: (row: IOrderDetail) => (
					<div className="flex items-start gap-lg">
						<Button
							mini={true}
							disabled={!!orders?.find(order => order?.id == row?.id)}
							onClick={() => {
								addOrder({...row})
								setIsAdding(false)
							}}
						>
							Add
						</Button>
					</div>
				)
			}
		],
		[page, pageSize, orders]
	)


	const {
		handleSubmit,
		control: controlAdd,
		register,
		reset,
		setValue,
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
			gofra: false,
			ymo1: false,
			fleksa: false,
			ymo2: false,
			tikish: false,
			yelimlash: false,
			has_addition: false
		}
	})


	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		setValue: setValueEdit,
		control,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			deadline: '',
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
			yelimlash: false
		},
		resolver: yupResolver(temporaryOrderSchema)
	})


	const {fields} = useFieldArray({
		control,
		name: 'layer' as never
	})

	const {mutateAsync: addGroupOrder, isPending: isAddLoading} = useAdd('services/group-orders')


	const {
		mutateAsync: update,
		isPending: isUpdating
	} = useUpdate('services/orders/', updateId, 'patch')

	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IOrderDetail>('services/orders/', updateId, !!updateId)

	useEffect(() => {
		if (detail && updateId) {
			resetEdit({
				layer: detail?.layer || [],
				deadline: getDate(detail?.deadline || ''),
				l0: detail?.l0 || '',
				l1: detail?.l1 || '',
				l2: detail?.l2 || '',
				l3: detail?.l3 || '',
				l4: detail?.l4 || '',
				l5: detail?.l5 || '',
				gofra: detail?.stages_to_passed?.includes('gofra'),
				ymo1: detail?.stages_to_passed?.includes('ymo1'),
				fleksa: detail?.stages_to_passed?.includes('fleksa'),
				ymo2: detail?.stages_to_passed?.includes('ymo2'),
				tikish: detail?.stages_to_passed?.includes('tikish'),
				yelimlash: detail?.stages_to_passed?.includes('yelimlash')
			})
		}
	}, [detail, updateId])

	const onSubmit = (data: ISearchParams) => {
		if ((orders?.length || 0) <= 0) {
			showMessage('Select at least one order', 'error')
		} else if (areAllFieldsPresent(orders)) {
			showMessage('Draw a complete diagram of all selected orders', 'error')
		} else {
			const newData = {
				separated_raw_materials_format: data?.separated_raw_materials_format,
				orders: orders?.map(order => order.id),
				y: data?.y,
				x: data?.x,
				has_addition: data?.has_addition,
				stages_to_passed: Object.keys(data).filter((key) => data[key as keyof typeof data] === true)?.filter(i => i !== 'has_addition')?.reverse(),
				deadline: data?.deadline || null,
				count: data?.count
			}

			addGroupOrder(newData)
				.then(() => {
					clearOrders()
					navigate(-1)
					reset({
						separated_raw_materials_format: undefined,
						y: '',
						x: '',
						deadline: '',
						count: '',
						gofra: false,
						ymo1: false,
						fleksa: false,
						ymo2: false,
						tikish: false,
						yelimlash: false,
						has_addition: false
					})
				})
		}
	}

	console.log(errors)


	return (
		<>
			<PageTitle title="Send order">
				<div className="flex gap-sm justify-center align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
					<Button onClick={handleSubmit(onSubmit)} disabled={isAddLoading || isAdding}>
						Send
					</Button>
				</div>
			</PageTitle>
			<div className={classNames(styles.root, 'grid gap-lg')}>
				<Card className="span-12" screen={false} style={{padding: '1.5rem'}}>
					<Form className="grid  gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
						<div className="span-4">
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
						<div className="span-4">
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
										handleOnChange={(e) => onChange(e as string)}
									/>
								)}
							/>
						</div>
						<div className="span-4 flex gap-md align-start justify-end">
							{
								!isAdding ?
									<Button onClick={() => setIsAdding(true)}>
										Add order
									</Button> :
									<Button
										theme={BUTTON_THEME.DANGER}
										onClick={() => setIsAdding(false)}
									>
										Cancel
									</Button>
							}
						</div>
					</Form>
				</Card>

				{
					isAdding ?
						<>
							<Card style={{marginTop: '2rem'}}>
								<ReactTable
									columns={columns}
									data={data}
									isLoading={isLoading}
								/>
							</Card>
							<Pagination totalPages={totalPages}/>
						</> :

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
													label={`${t('Sizes')} (${t('mm')})`}
													value={`${order.width}*${order.height}*${order.length}`}
												/>
											</div>
											<div className="span-4">
												<Input
													id="L"
													disabled={true}
													label="L"
													value={`${order.width + order.height + order.length}`}
												/>
											</div>
											<div className="span-4">
												<Input
													id="format"
													disabled={true}
													label="Format"
													value={order?.format?.name}
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

											{
												order?.layer?.map((layer, index) => (
													<div className="span-4" key={index}>
														<Select
															id={`layer-${index + 1}`}
															label={`${index + 1}-${t('layer')}`}
															options={materials}
															disabled={true}
															value={getSelectValue(materials, layer)}
															defaultValue={getSelectValue(materials, layer)}
														/>

													</div>
												))
											}

											<div className="span-4">
												<Input
													id="count"
													disabled={true}
													label="Count"
													value={decimalToInteger(order?.count || 0)}
												/>
											</div>

											<div className="span-4">
												<Input
													id="count"
													disabled={true}
													label="Deadline"
													value={getDate(order?.deadline || '')}
												/>
											</div>

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

											<div
												className="span-12 flex gap-md"
												style={{marginTop: '.75rem', marginBottom: '1.5rem'}}
											>
												<div className="span-4 flex gap-md align-end justify-start">
													<input
														id={activityOptions[0].value as string}
														type="checkbox"
														className="checkbox"
														checked={order?.stages_to_passed?.includes(activityOptions[0].value as string) || false}
													/>
													<p className="checkbox-label">
														{t(activityOptions[0].label as string)}
													</p>
												</div>
												<div className="span-4 flex gap-md align-end justify-start">
													<input
														id={activityOptions[1].value as string}
														type="checkbox"
														className="checkbox"
														checked={order?.stages_to_passed?.includes(activityOptions[1].value as string) || false}
													/>
													<p className="checkbox-label">
														{t(activityOptions[1].label as string)}
													</p>
												</div>
												<div className="span-4 flex gap-md align-end justify-start">
													<input
														id={activityOptions[2].value as string}
														type="checkbox"
														className="checkbox"
														checked={order?.stages_to_passed?.includes(activityOptions[2].value as string) || false}
													/>
													<p className="checkbox-label">
														{t(activityOptions[2].label as string)}
													</p>
												</div>
												<div className="span-4 flex gap-md align-end justify-start">
													<input
														id={activityOptions[3].value as string}
														type="checkbox"
														className="checkbox"
														checked={order?.stages_to_passed?.includes(activityOptions[3].value as string) || false}
													/>
													<p className="checkbox-label">
														{t(activityOptions[3].label as string)}
													</p>
												</div>
												<div className="span-4 flex gap-md align-end justify-start">
													<input
														id={activityOptions[4].value as string}
														type="checkbox"
														className="checkbox"
														checked={order?.stages_to_passed?.includes(activityOptions[4].value as string) || false}
													/>
													<p className="checkbox-label">
														{t(activityOptions[4].label as string)}
													</p>
												</div>
												<div className="span-4 flex gap-md align-end justify-start">
													<input
														id={activityOptions[5].value as string}
														type="checkbox"
														className="checkbox"
														checked={order?.stages_to_passed?.includes(activityOptions[5].value as string) || false}
													/>
													<p className="checkbox-label">
														{t(activityOptions[5].label as string)}
													</p>
												</div>
											</div>
										</div>


										<div
											className="flex justify-between gap-lg"
											style={{marginTop: 'auto'}}
										>
											<Button
												theme={BUTTON_THEME.DANGER}
												onClick={() => deleteOrder(order.id)}
											>
												Delete
											</Button>
											<Button onClick={() => {addParams({updateId: order.id, modal: 'edit'})}}>
												Edit
											</Button>
										</div>
									</Card>
								))
							}
							{
								watch('has_addition') &&
								<div className="span-6">
									<Card
										screen={false}
										style={{padding: '1.5rem'}}
										className="grid gap-md"
									>
										<div className="span-12">
											<Diagram
												second={true}
												x={
													<Input
														id="x"
														mini={true}
														placeholder="mm"
														err={!!errors?.x?.message}
														{...register('x')}
													/>
												}
												y={
													<Input
														id="x"
														mini={true}
														placeholder="mm"
														err={!!errors?.y?.message}
														{...register('y')}
													/>
												}
											/>
										</div>

										<div className="span-4">
											<Controller
												name="count"
												control={controlAdd}
												render={({field}) => (
													<NumberFormattedInput
														id="count"
														maxLength={4}
														disableGroupSeparators={false}
														allowDecimals={false}
														label="Count"
														error={errors?.count?.message}
														{...field}
													/>
												)}
											/>
										</div>

										<div className="span-4">
											<Controller
												name="deadline"
												control={controlAdd}
												render={({field}) => (
													<MaskInput
														id="deadline"
														label="Deadline"
														placeholder={getDate()}
														mask="99.99.9999"
														error={errors?.deadline?.message}
														{...field}
													/>
												)}
											/>
										</div>


										<div
											className="span-12 flex gap-md"
											style={{marginTop: '.75rem', marginBottom: '1.5rem'}}
										>
											<div className="span-4 flex gap-md align-end justify-start">
												<input
													id={activityOptions[0].value as string}
													type="checkbox"
													className="checkbox"
													{...register('gofra')}
													onChange={(e) => {
														if (e.target.checked) {
															setValue('ymo1', true)
															setValue('fleksa', false)
															setValue('ymo2', false)
															setValue('tikish', false)
															setValue('yelimlash', false)
														} else {
															setValue('gofra', false)
															setValue('ymo1', false)
															setValue('fleksa', false)
															setValue('ymo2', false)
															setValue('tikish', false)
															setValue('yelimlash', false)
														}
													}}
												/>
												<p className="checkbox-label">
													{t(activityOptions[0].label as string)}
												</p>
											</div>
											<div className="span-4 flex gap-md align-end justify-start">
												<input
													id={activityOptions[1].value as string}
													type="checkbox"
													className="checkbox"
													{...register('ymo1')}
													onChange={(e) => {
														if (e.target.checked) {
															setValue('gofra', true)
															setValue('ymo1', true)
														} else {
															setValue('ymo1', true)
														}
													}}
												/>
												<p className="checkbox-label">
													{t(activityOptions[1].label as string)}
												</p>
											</div>
											<div className="span-4 flex gap-md align-end justify-start">
												<input
													id={activityOptions[2].value as string}
													type="checkbox"
													className="checkbox"
													{...register('fleksa')}
													onChange={(e) => {
														if (e.target.checked) {
															setValue('gofra', true)
															setValue('ymo1', true)
															setValue('ymo2', true)
															setValue('tikish', false)
															setValue('yelimlash', false)
														} else {
															setValue('fleksa', false)
															setValue('ymo2', false)
															setValue('tikish', false)
															setValue('yelimlash', false)
														}
													}}
												/>
												<p className="checkbox-label">
													{t(activityOptions[2].label as string)}
												</p>
											</div>
											<div className="span-4 flex gap-md align-end justify-start">
												<input
													id={activityOptions[3].value as string}
													type="checkbox"
													className="checkbox"
													{...register('ymo2')}
													onChange={(e) => {
														if (e.target.checked) {
															setValue('gofra', true)
															setValue('ymo1', true)
															setValue('fleksa', true)
															setValue('ymo2', true)
														} else {
															setValue('ymo2', true)
														}
													}}
												/>
												<p className="checkbox-label">
													{t(activityOptions[3].label as string)}
												</p>
											</div>
											<div className="span-4 flex gap-md align-end justify-start">
												<input
													id={activityOptions[4].value as string}
													type="checkbox"
													className="checkbox"
													{...register('tikish')}
													onChange={(e) => {
														if (e.target.checked) {
															setValue('gofra', true)
															setValue('ymo1', true)
															setValue('fleksa', true)
															setValue('ymo2', true)
															setValue('yelimlash', false)
														} else {
															setValue('tikish', false)
														}
													}}
												/>
												<p className="checkbox-label">
													{t(activityOptions[4].label as string)}
												</p>
											</div>
											<div className="span-4 flex gap-md align-end justify-start">
												<input
													id={activityOptions[5].value as string}
													type="checkbox"
													className="checkbox"
													{...register('yelimlash')}
													onChange={(e) => {
														if (e.target.checked) {
															setValue('gofra', true)
															setValue('ymo1', true)
															setValue('fleksa', true)
															setValue('ymo2', true)
															setValue('tikish', false)
														} else {
															setValue('yelimlash', false)
														}
													}}
												/>
												<p className="checkbox-label">
													{t(activityOptions[5].label as string)}
												</p>
											</div>
										</div>

										{/*<div className="span-12">*/}
										{/*	<Controller*/}
										{/*		name="deadline"*/}
										{/*		control={controlAdd}*/}
										{/*		render={({field}) => (*/}
										{/*			<MaskInput*/}
										{/*				id="deadline"*/}
										{/*				label="Deadline"*/}
										{/*				placeholder={getDate()}*/}
										{/*				mask="99.99.9999"*/}
										{/*				error={errors?.deadline?.message}*/}
										{/*				{...field}*/}
										{/*			/>*/}
										{/*		)}*/}
										{/*	/>*/}
										{/*</div>*/}
									</Card>
								</div>
							}
						</div>
				}
			</div>


			<EditModal
				isLoading={isDetailLoading && !detail}
				title={`${t('Order number')}: #${updateId}`}
				style={{height: '45rem'}}
			>
				<Form
					onSubmit={
						handleEditSubmit((data) => {
							const newData = {
								deadline: data?.deadline,
								layer: data?.layer,
								l0: data?.l0,
								l1: data?.l1,
								l2: data?.l2,
								l3: data?.l3,
								l4: data?.l4,
								l5: data?.l5,
								stages_to_passed: Object.keys(data).filter((key) => data[key as keyof typeof data] === true)?.reverse()
							}

							update(newData).then(async (data) => {
								const newData = data as unknown as IOrderDetail
								updateOrder({...newData, id: +(updateId || 0)})
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


						<div className="grid span-12" style={{marginTop: '.75rem'}}>
							<Diagram
								l0={
									<Input
										id="l0"
										mini={true}
										placeholder="mm"
										err={!!editErrors?.l0?.message}
										{...registerEdit('l0')}
									/>
								}
								l1={
									<Input
										id="l1"
										mini={true}
										err={!!editErrors?.l1?.message}
										{...registerEdit('l1')}
										placeholder="mm"
									/>
								}
								l2={
									<Input
										id="l2"
										mini={true}
										err={!!editErrors?.l2?.message}
										{...registerEdit('l2')}
										placeholder="mm"
									/>
								}
								l3={
									<Input
										id="l3"
										mini={true}
										err={!!editErrors?.l3?.message}
										{...registerEdit('l3')}
										placeholder="mm"
									/>
								}
								l4={
									<Input
										id="l4"
										mini={true}
										err={!!editErrors?.l4?.message}
										{...registerEdit('l4')}
										placeholder="mm"
									/>
								}
								l5={
									<Input
										id="l5"
										mini={true}
										err={!!editErrors?.l5?.message}
										{...registerEdit('l5')}
										placeholder="mm"
									/>
								}
								className="span-12"
							/>
						</div>
					</div>

					<div
						className="span-12 flex gap-md"
						style={{marginTop: '.75rem', marginBottom: '1.5rem'}}
					>
						<div className="span-4 flex gap-md align-end justify-start">
							<input
								id={activityOptions[0].value as string}
								type="checkbox"
								className="checkbox"
								{...registerEdit('gofra')}
								onChange={(e) => {
									if (e.target.checked) {
										setValueEdit('ymo1', true)
										setValueEdit('fleksa', false)
										setValueEdit('ymo2', false)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
									} else {
										setValueEdit('gofra', false)
										setValueEdit('ymo1', false)
										setValueEdit('fleksa', false)
										setValueEdit('ymo2', false)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
									}
								}}
							/>
							<p className="checkbox-label">
								{t(activityOptions[0].label as string)}
							</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input
								id={activityOptions[1].value as string}
								type="checkbox"
								className="checkbox"
								{...registerEdit('ymo1')}
								onChange={(e) => {
									if (e.target.checked) {
										setValueEdit('gofra', true)
										setValueEdit('ymo1', true)
									} else {
										setValueEdit('ymo1', true)
									}
								}}
							/>
							<p className="checkbox-label">
								{t(activityOptions[1].label as string)}
							</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input
								id={activityOptions[2].value as string}
								type="checkbox"
								className="checkbox"
								{...registerEdit('fleksa')}
								onChange={(e) => {
									if (e.target.checked) {
										setValueEdit('gofra', true)
										setValueEdit('ymo1', true)
										setValueEdit('ymo2', true)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
									} else {
										setValueEdit('fleksa', false)
										setValueEdit('ymo2', false)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
									}
								}}
							/>
							<p className="checkbox-label">
								{t(activityOptions[2].label as string)}
							</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input
								id={activityOptions[3].value as string}
								type="checkbox"
								className="checkbox"
								{...registerEdit('ymo2')}
								onChange={(e) => {
									if (e.target.checked) {
										setValueEdit('gofra', true)
										setValueEdit('ymo1', true)
										setValueEdit('fleksa', true)
										setValueEdit('ymo2', true)
									} else {
										setValueEdit('ymo2', true)
									}
								}}
							/>
							<p className="checkbox-label">
								{t(activityOptions[3].label as string)}
							</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input
								id={activityOptions[4].value as string}
								type="checkbox"
								className="checkbox"
								{...registerEdit('tikish')}
								onChange={(e) => {
									if (e.target.checked) {
										setValueEdit('gofra', true)
										setValueEdit('ymo1', true)
										setValueEdit('fleksa', true)
										setValueEdit('ymo2', true)
										setValueEdit('yelimlash', false)
									} else {
										setValueEdit('tikish', false)
									}
								}}
							/>
							<p className="checkbox-label">
								{t(activityOptions[4].label as string)}
							</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input
								id={activityOptions[5].value as string}
								type="checkbox"
								className="checkbox"
								{...registerEdit('yelimlash')}
								onChange={(e) => {
									if (e.target.checked) {
										setValueEdit('gofra', true)
										setValueEdit('ymo1', true)
										setValueEdit('fleksa', true)
										setValueEdit('ymo2', true)
										setValueEdit('tikish', false)
									} else {
										setValueEdit('yelimlash', false)
									}
								}}
							/>
							<p className="checkbox-label">
								{t(activityOptions[5].label as string)}
							</p>
						</div>
					</div>

					<div className="span-12">
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

					<Button
						style={{marginTop: 'auto'}}
						type={FIELD.SUBMIT}
						disabled={isUpdating}
					>
						Edit
					</Button>
				</Form>
			</EditModal>


		</>
	)
}

export default Index