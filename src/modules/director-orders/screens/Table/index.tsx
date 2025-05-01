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
import {schema, soldSchema} from 'helpers/yup'
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
		paramsObject: {status = statusOptions[0].value, search = '', company = '', updateId = undefined},
		removeParams,
		addParams
	} = useSearchParams()
	const {data: formats = []} = useData<ISelectOption[]>('services/customers/select')


	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IOrderDetail[]>(
		status === statusOptions[3].value ? `services/sold-orders` : `/services/orders-with-detail`,
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
			// {
			// 	Header: t('№'),
			// 	accessor: (_: IOrderDetail, index: number) => (page - 1) * pageSize + (index + 1),
			// 	style: {
			// 		width: '3rem',
			// 		textAlign: 'center'
			// 	}
			// },
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
							<Button mini={true} onClick={() => addParams({modal: 'return', updateId: row.id})}>
								Return order
							</Button>
						}
					</div>
				)
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
		mutateAsync: add,
		isPending: isAdding
	} = useAdd('services/sold-orders')


	const {
		mutateAsync: ret,
		isPending: isRet
	} = useAdd('services/return-order')


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
				<ReactTable
					columns={status !== statusOptions[3].value ? columns : columns2}
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
				title={`#${updateId} - ${t('Return order')?.toLowerCase()}`}
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
									removeParams('modal')
								})
						)()
					}}
				>
					Return order
				</Button>
			</Modal>
		</>
	)
}

export default Index