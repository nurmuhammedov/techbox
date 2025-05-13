import {yupResolver} from '@hookform/resolvers/yup'
import {
	Button,
	Card, DeleteButton, DeleteModal,
	EditButton, EditModal,
	FilterInput, Form, Modal, NumberFormattedInput,
	Pagination,
	ReactTable, Select,
	Tab
} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {defectiveSchema, schema, soldDefectiveSchema, soldSchema} from 'helpers/yup'
import {
	useActions, useAdd, useData, useDetail,
	usePaginatedData,
	usePagination, useSearchParams
} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import {useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {IOrderDetail} from 'interfaces/orders.interface'
import {getDate} from 'utilities/date'
import {decimalToInteger, decimalToPrice, getSelectValue} from 'utilities/common'
import {activityOptions, statusOptions} from 'helpers/options'


const Index = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {addOrder} = useActions()
	const {
		paramsObject: {
			status = statusOptions[0].value,
			orderId = undefined,
			search = '',
			company = '',
			updateId = undefined
		},
		removeParams,
		addParams
	} = useSearchParams()
	const {data: formats = []} = useData<ISelectOption[]>('services/customers/select')


	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IOrderDetail[]>(
		status === statusOptions[3].value ? `services/sold-orders` : status === statusOptions[4].value ? `services/wasted-paper-list` : status === statusOptions[5].value ? `services/sold-wasted-paper` : `services/orders-with-detail`,
		{
			page: page,
			page_size: pageSize,
			status: status !== statusOptions[3].value ? status : null,
			search,
			company,
			not_sold: status === statusOptions[2].value ? 'True' : null
		}
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
				accessor: (row: IOrderDetail) => `${row.length}*${row.width}*${row.height}`
			},
			{
				Header: `${t('Format')} (${t('mm')})`,
				accessor: (row: IOrderDetail) => decimalToInteger(row.format?.name)
			},
			...status == statusOptions[1].value ? [
				{
					Header: t('Status'),
					accessor: (row: IOrderDetail) => t(activityOptions?.find(i => row.activity === i?.value)?.label?.toString() || '')
				}
			] : [
				{
					Header: `${t('Developed')} ${t('Count')?.toLowerCase()}`,
					accessor: (row: IOrderDetail) => row?.count_last || 0
				}
			],
			...status == statusOptions[0].value ? [
				{
					Header: t('Actions'),
					accessor: (row: IOrderDetail) => (
						<div className="flex items-start gap-lg">
							<Button
								mini={true}
								onClick={() => {
									addOrder({...row})
									navigate(`add`)
								}}
							>
								Choosing
							</Button>
							<DeleteButton id={row.id}/>
						</div>
					)
				}
			] : [
				{
					Header: t('Actions'),
					accessor: (row: IOrderDetail) => (
						<div className="flex items-start gap-lg">
							<EditButton onClick={() => navigate(`process/${row.id}`)}/>
							{
								status == statusOptions[2].value &&
								<Button mini={true} onClick={() => addParams({modal: 'edit', updateId: row.id})}>
									Sell
								</Button>
							}
						</div>
					)
				}
			]
		],
		[page, pageSize, status]
	)

	const columns2: Column<IOrderDetail>[] = useMemo(
		() => [
			{
				Header: t('Order number'),
				accessor: (row: IOrderDetail) => `#${row.order?.id}`,
				style: {
					width: '14rem',
					textAlign: 'start'
				}
			},
			{
				Header: t('Company name'),
				accessor: (row: IOrderDetail) => row.customer?.name as unknown as string
			},
			{
				Header: t('Count'),
				accessor: (row: IOrderDetail) => decimalToInteger(row.count || '')
			},
			{
				Header: t('Price'),
				accessor: (row: IOrderDetail) => decimalToPrice(row.price || '')
			},

			{
				Header: t('Total paid money'),
				accessor: (row: IOrderDetail) => decimalToPrice(row.money_paid || '')
			},
			{
				Header: t('Actions'),
				accessor: (row: IOrderDetail) => (
					<div className="flex items-start gap-lg">
						{
							status == statusOptions[3].value &&
							<>
								<Button mini={true} onClick={() => addParams({
									modal: 'return',
									updateId: row.id,
									orderId: row?.order?.id
								})}>
									Return order
								</Button>
								<Button mini={true} onClick={() => addParams({
									modal: 'defective',
									updateId: row.id,
									orderId: row?.order?.id
								})}>
									Defective product
								</Button>
							</>
						}
					</div>
				)
			}

		],
		[page, pageSize, status]
	)

	const columns3: Column<IOrderDetail>[] = useMemo(
		() => [
			...status == statusOptions[4].value ? [
				{
					Header: t('Order number'),
					accessor: (row: IOrderDetail) => `#${row.order?.id}`,
					style: {
						width: '14rem',
						textAlign: 'start'
					}
				},
				{
					Header: t('Count'),
					accessor: (row: IOrderDetail) => decimalToInteger(row.count || '')
				}
			] : [
				{
					Header: t('№'),
					accessor: (_: IOrderDetail, index: number) => (page - 1) * pageSize + (index + 1),
					style: {
						width: '3rem',
						textAlign: 'center'
					}
				},
				{
					Header: t('Price'),
					accessor: (row: IOrderDetail) => decimalToPrice(row.price || '')
				}
			],
			{
				Header: `${t('Weight')} (${t('kg')})`,
				accessor: (row: IOrderDetail) => decimalToPrice(row.weight || '')
			}
		],
		[page, pageSize, status]
	)

	const {
		handleSubmit,
		control,
		reset,
		formState: {errors}
	} = useForm({
		resolver: yupResolver(soldSchema),
		mode: 'onTouched',
		defaultValues: {
			customer: undefined,
			price: '',
			money_paid: '',
			count: ''
		}
	})

	const {
		handleSubmit: submitForm,
		control: controlForm,
		reset: resetForm,
		formState: {errors: errorsForm}
	} = useForm({
		resolver: yupResolver(schema),
		mode: 'onTouched',
		defaultValues: {
			count: ''
		}
	})

	const {
		handleSubmit: submitDefective,
		control: controlDefective,
		reset: resetDefective,
		formState: {errors: errorsDefective}
	} = useForm({
		resolver: yupResolver(defectiveSchema),
		mode: 'onTouched',
		defaultValues: {
			count: '',
			weight: ''
		}
	})

	const {
		handleSubmit: submitSoldDefective,
		control: controlSoldDefective,
		reset: resetSoldDefective,
		formState: {errors: errorsSoldDefective}
	} = useForm({
		resolver: yupResolver(soldDefectiveSchema),
		mode: 'onTouched',
		defaultValues: {
			price: '',
			weight: ''
		}
	})

	const {
		mutateAsync: add,
		isPending: isAdding
	} = useAdd('services/sold-orders')

	const {
		mutateAsync: ret,
		isPending: isRet
	} = useAdd('services/return-order')

	const {
		mutateAsync: def,
		isPending: isDef
	} = useAdd('services/adding-waste-to-paper')

	const {
		mutateAsync: soldDef,
		isPending: isSoldDef
	} = useAdd('services/sold-wasted-paper')

	const {
		data: productDetail,
		isPending: isProductDetailLoading
	} = useDetail<IOrderDetail>('services/orders/', updateId, !!updateId && status == statusOptions[2].value)

	useEffect(() => {
		if (productDetail && !isProductDetailLoading) {
			reset({
				count: String(productDetail?.count_last || productDetail?.count_after_bet || productDetail?.count_after_gluing || productDetail?.count_after_flex || productDetail?.count_after_processing || productDetail?.count_entered_leader || productDetail?.count || 0),
				price: productDetail.price,
				customer: productDetail?.customer?.id,
				money_paid: productDetail.money_paid
			})
		}
	}, [productDetail])

	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab query="status" fallbackValue={statusOptions[0].value} tabs={statusOptions}/>
			</div>
			<Card>
				{
					status !== statusOptions[4].value || status !== statusOptions[5].value && <>
						<div className="flex gap-lg" style={{padding: '.8rem .8rem .3rem .8rem'}}>
							<FilterInput
								id="company"
								query="company"
								placeholder="Company name"
							/>
							<FilterInput
								id="search"
								query="search"
								placeholder="Full name"
							/>
						</div>
					</>
				}
				{
					status === statusOptions[5].value &&
					<div style={{padding: '.5rem', display: 'flex', justifyContent: 'flex-end'}}>
						<Button onClick={() => addParams({modal: 'soldDefective'})}>
							Sold defective product
						</Button>
					</div>
				}
				<ReactTable
					columns={status == statusOptions[3].value ? columns2 : status === statusOptions[4].value || status === statusOptions[5].value ? columns3 : columns}
					data={data}
					isLoading={isLoading}
				/>
			</Card>
			<Pagination totalPages={totalPages}/>
			<DeleteModal endpoint="services/orders/" onDelete={() => refetch()}/>


			<EditModal title={`#${updateId} - ${t('Sell order')?.toLowerCase()}`}
			           style={{height: '40rem', width: '50rem'}} isLoading={isProductDetailLoading}>
				<Form onSubmit={(e) => e.preventDefault()}>
					<div className="span-4">
						<Controller
							name="customer"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									id="customer"
									label="Company name"
									options={formats}
									error={errors?.customer?.message}
									value={getSelectValue(formats, value)}
									ref={ref}
									onBlur={onBlur}
									defaultValue={getSelectValue(formats, value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>


					<div className="span-12 grid gap-xl flex-0">
						<div className="span-4">
							<Controller
								name="count"
								control={control}
								render={({field}) => (
									<NumberFormattedInput
										id="count"
										maxLength={6}
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
								name="price"
								control={control}
								render={({field}) => (
									<NumberFormattedInput
										id="price"
										maxLength={13}
										disableGroupSeparators={false}
										allowDecimals={true}
										label={`${t('Price')} (${t('Item')?.toLowerCase()})`}
										error={errors?.price?.message}
										{...field}
									/>
								)}
							/>
						</div>

						<div className="span-4">
							<Controller
								name="money_paid"
								control={control}
								render={({field}) => (
									<NumberFormattedInput
										id="money_paid"
										maxLength={13}
										disableGroupSeparators={false}
										allowDecimals={true}
										label="Total paid money"
										error={errors?.money_paid?.message}
										{...field}
									/>
								)}
							/>
						</div>


					</div>
				</Form>

				<Button
					type={FIELD.BUTTON}
					theme={BUTTON_THEME.PRIMARY}
					disabled={isAdding}
					onClick={() => {
						handleSubmit((data) =>
							add({...data, count: Number(data?.count), order: updateId})
								.then(async () => {
									reset({
										customer: undefined,
										price: '',
										money_paid: '',
										count: ''
									})
									await refetch()
									removeParams('modal')
								})
						)()
					}}
				>
					Save
				</Button>
			</EditModal>


			<Modal
				title={`#${orderId} - ${t('Return order')?.toLowerCase()}`}
				style={{height: '40rem', width: '50rem'}}
				id="return"
			>
				<Form onSubmit={(e) => e.preventDefault()}>
					<div className="span-12 grid gap-xl flex-0">
						<div className="span-12">
							<Controller
								name="count"
								control={controlForm}
								render={({field}) => (
									<NumberFormattedInput
										id="count"
										maxLength={6}
										disableGroupSeparators={false}
										allowDecimals={false}
										label="Count"
										error={errorsForm?.count?.message}
										{...field}
									/>
								)}
							/>
						</div>
					</div>
				</Form>

				<Button
					type={FIELD.BUTTON}
					theme={BUTTON_THEME.PRIMARY}
					disabled={isRet}
					onClick={() => {
						submitForm((data) =>
							ret({...data, count: Number(data?.count), sold_order: updateId})
								.then(async () => {
									resetForm({
										count: ''
									})
									await refetch()
									removeParams('modal', 'orderId', 'updateId')
								})
						)()
					}}
				>
					Return order
				</Button>
			</Modal>

			<Modal
				title={`#${orderId} - ${t('Defective product')?.toLowerCase()}`}
				style={{height: '40rem', width: '50rem'}}
				id="defective"
			>
				<Form onSubmit={(e) => e.preventDefault()}>
					<div className="span-12 grid gap-xl flex-0">
						<div className="span-12">
							<Controller
								name="count"
								control={controlDefective}
								render={({field}) => (
									<NumberFormattedInput
										id="count"
										maxLength={6}
										disableGroupSeparators={false}
										allowDecimals={false}
										label="Count"
										error={errorsDefective?.count?.message}
										{...field}
									/>
								)}
							/>
						</div>
						<div className="span-12">
							<Controller
								control={controlDefective}
								name="weight"
								render={({field}) => (
									<NumberFormattedInput
										id="weight"
										label={`${t('Weight')} (${t('kg')})`}
										disableGroupSeparators={false}
										maxLength={9}
										allowDecimals={false}
										error={errorsDefective?.weight?.message}
										{...field}
									/>
								)}
							/>
						</div>
					</div>
				</Form>

				<Button
					type={FIELD.BUTTON}
					theme={BUTTON_THEME.PRIMARY}
					disabled={isDef}
					onClick={() => {
						submitDefective((data) =>
							def({...data, count: data?.count ? Number(data?.count) : null, sold_order: updateId})
								.then(async () => {
									resetDefective({
										count: '',
										weight: ''
									})
									await refetch()
									removeParams('modal', 'orderId', 'updateId')
								})
						)()
					}}
				>
					Return order
				</Button>
			</Modal>

			<Modal
				title={`${t('Defective product')}`}
				style={{height: '40rem', width: '50rem'}}
				id="soldDefective"
			>
				<Form onSubmit={(e) => e.preventDefault()}>
					<div className="span-12 grid gap-xl flex-0">
						<div className="span-12">
							<Controller
								name="price"
								control={controlSoldDefective}
								render={({field}) => (
									<NumberFormattedInput
										id="price"
										maxLength={6}
										disableGroupSeparators={false}
										allowDecimals={false}
										label="Price"
										error={errorsSoldDefective?.price?.message}
										{...field}
									/>
								)}
							/>
						</div>
						<div className="span-12">
							<Controller
								name="weight"
								control={controlSoldDefective}
								render={({field}) => (
									<NumberFormattedInput
										id="weight"
										label={`${t('Weight')} (${t('kg')})`}
										disableGroupSeparators={false}
										maxLength={9}
										allowDecimals={false}
										error={errorsSoldDefective?.weight?.message}
										{...field}
									/>
								)}
							/>
						</div>
					</div>
				</Form>

				<Button
					type={FIELD.BUTTON}
					theme={BUTTON_THEME.PRIMARY}
					disabled={isSoldDef}
					onClick={() => {
						submitSoldDefective((data) =>
							soldDef(data).then(async () => {
								resetSoldDefective({
									price: '',
									weight: ''
								})
								await refetch()
								removeParams('modal', 'orderId', 'updateId')
							})
						)()
					}}
				>
					Sold defective product
				</Button>
			</Modal>
		</>
	)
}

export default Index