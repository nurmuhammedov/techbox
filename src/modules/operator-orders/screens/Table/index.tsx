import {yupResolver} from '@hookform/resolvers/yup'
import {
	Button,
	Card,
	EditButton,
	EditModal,
	FileUpLoader,
	Form,
	Input,
	Modal,
	NumberFormattedInput,
	Pagination,
	ReactTable,
	Tab
} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {splitSchema, YMOOrderSchema} from 'helpers/yup'
import {useActions, useAdd, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate} from 'hooks'
import {IFIle} from 'interfaces/form.interface'
import {IOrderDetail} from 'interfaces/orders.interface'
import {useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {getDate} from 'utilities/date'
import {decimalToInteger} from 'utilities/common'
import {activityOptions, bossStatusOptions} from 'helpers/options'
import {IGroupOrder} from 'interfaces/groupOrders.interface'


const Index = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {addGroupOrder} = useActions()

	const {
		removeParams,
		addParams,
		paramsObject: {status = bossStatusOptions[0].value, updateId = undefined}
	} = useSearchParams()

	const {data, refetch, totalPages, isPending: isLoading} = usePaginatedData<IGroupOrder[]>(
		status == bossStatusOptions[2].value ? `services/consecutive-orders` : status == bossStatusOptions[1].value ? `services/consecutive-orders` : status == bossStatusOptions[3].value ? `services/orders/list-for-proces` : `services/group-orders`,
		{
			page: page,
			page_size: pageSize,
			is_separated: status != bossStatusOptions[3].value ? status : null,
			confirmed: status == bossStatusOptions[3].value ? 'not_confirmed' : null,
			activity: status == bossStatusOptions[1].value ? 'gofra' : null,
			pass_activity: status == bossStatusOptions[2].value ? 'gofra' : null
		}
	)


	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IOrderDetail>('services/orders/', updateId, !!updateId && status == bossStatusOptions[2]?.value)

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
									<br/>
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
									<br/>
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
									<br/>
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
									<br/>
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
									<br/>
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
									<br/>
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
									<br/>
								}
							</>
						))
					}
				</div>
			},
			{
				Header: `${t('Production format')}`,
				accessor: (row: IGroupOrder) => decimalToInteger(row.separated_raw_materials_format?.format)
			},
			{
				Header: t('Yub. sana'),
				accessor: (row: IGroupOrder) => getDate(row.created_at)
			},
			...(status == bossStatusOptions[2].value ? [
				{
					Header: t('Yak. sana'),
					accessor: (row: IGroupOrder) => getDate(row.end_date)
				}
			] : []),


			...(status !== bossStatusOptions[1].value && status !== bossStatusOptions[2].value ? [
				{
					Header: t('Actions'),
					accessor: (row: IGroupOrder) => (
						<div className="flex items-start gap-lg">
							{
								status == bossStatusOptions[3].value ?
									<Button
										mini={true}
										onClick={() => {
											addParams({modal: 'edit', updateId: row?.id})
										}}
									>
										Go flex
									</Button> :
									status == bossStatusOptions[0].value ?
										<Button
											mini={true}
											onClick={() => {
												navigate(`add`)
												addGroupOrder(row)
											}}
										>
											Choosing
										</Button> :
										<EditButton onClick={() => navigate(`detail/${row.id}`)}/>
							}
						</div>
					)
				}
			] : [])

		],
		[page, pageSize, status]
	)

	const {
		handleSubmit,
		control,
		reset,
		register,
		formState: {errors}
	} = useForm({
		resolver: yupResolver(splitSchema),
		mode: 'onTouched',
		defaultValues: {
			logo: undefined,
			comment: '',
			count: ''
		}
	})

	const {
		mutateAsync: add,
		isPending: isAdding
	} = useAdd('services/split-the-order')


	const orderColumns: Column<IOrderDetail>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IOrderDetail, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '1.5rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Company name'),
				accessor: (row: IOrderDetail) => row?.company_name
			},
			{
				Header: t('Name'),
				accessor: (row: IOrderDetail) => row?.name
			},
			{
				Header: `${t('Sizes')} (${t('mm')})`,
				accessor: (row: IOrderDetail) => `${row.width}*${row.length}${row.height ? `*${row.height}` : ''}`
			},
			{
				Header: t('Layer'),
				accessor: (row: IOrderDetail) => row?.layer?.length || 0
			},
			{
				Header: t('Count'),
				accessor: (row: IOrderDetail) => decimalToInteger(row?.count_last || row?.count_after_bet || row?.count_after_gluing || row?.count_after_flex || row?.count_after_processing || row?.count_entered_leader || row?.count || 0)
			},
			{
				Header: t('Deadline'),
				accessor: (row: IOrderDetail) => row?.deadline ? getDate(row?.deadline) : null
			},
			{
				Header: t('CreatedAt'),
				accessor: (row: IOrderDetail) => getDate(row.created_at)
			},
			{
				Header: t('Actions'),
				accessor: (row: IOrderDetail) => (
					<div className="flex items-start gap-lg">
						{
							status == bossStatusOptions[3].value ?
								<Button
									mini={true}
									onClick={() => {
										addParams({
											modal: 'split',
											updateId: row?.id,
											status: bossStatusOptions[3].value
										})
									}}
								>
									Go flex
								</Button> :
								<Button
									mini={true}
									onClick={() => {
										addParams({
											modal: 'edit',
											updateId: row?.id,
											status: bossStatusOptions[2].value
										})
									}}
								>
									Transfer to process
								</Button>
						}
					</div>
				)
			}
		],
		[page, pageSize, status]
	)

	const {
		mutateAsync: update,
		isPending: isUpdating
	} = useUpdate('services/orders/', updateId, 'patch')

	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		setValue: setValueEdit,
		watch: watchEdit
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			gofra: false,
			ymo1: false,
			fleksa: false,
			ymo2: false,
			tikish: false,
			yelimlash: false,
			is_last: false
		},
		resolver: yupResolver(YMOOrderSchema)
	})

	useEffect(() => {
		if (detail && updateId) {
			resetEdit({
				gofra: detail?.stages_to_passed?.includes('gofra'),
				ymo1: detail?.stages_to_passed?.includes('ymo1'),
				fleksa: detail?.stages_to_passed?.includes('fleksa'),
				ymo2: detail?.stages_to_passed?.includes('ymo2'),
				tikish: detail?.stages_to_passed?.includes('tikish'),
				yelimlash: detail?.stages_to_passed?.includes('yelimlash'),
				is_last: detail?.stages_to_passed?.includes('is_last')
			})
		}
	}, [detail, updateId])


	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab query="status" fallbackValue={bossStatusOptions[0].value} tabs={bossStatusOptions}/>
			</div>
			<Card>
				<ReactTable
					columns={(status == bossStatusOptions[3].value) ? orderColumns as unknown as never : columns as unknown as never}
					data={data as unknown as never}
					isLoading={isLoading}
				/>
			</Card>
			<Pagination totalPages={totalPages}/>
			<Modal
				title={`#${updateId} - ${t('Split order')?.toLowerCase()}`}
				style={{height: '40rem', width: '50rem'}}
				id="split"
			>
				<Form onSubmit={(e) => e.preventDefault()}>
					<div className="span-12 grid gap-xl flex-0">
						<div className="span-6">
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
						<div className="span-6">
							<Input
								id="comment"
								label={`Comment`}
								error={errors?.comment?.message}
								{...register(`comment`)}
							/>
						</div>

						<div className="span-12">
							<Controller
								name="logo"
								control={control}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<FileUpLoader
										id="logo"
										ref={ref}
										type="image"
										value={value as IFIle}
										onBlur={onBlur}
										onChange={onChange}
										label="Logo"
										error={errors?.logo?.message}
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
						handleSubmit(async (data) =>
							add({...data, count: Number(data?.count), order: updateId})
								.then(async () => {
									reset({
										logo: undefined,
										comment: '',
										count: ''
									})
									removeParams('modal')
									await refetch()
								})
						)()
					}}
				>
					Save
				</Button>
			</Modal>

			<EditModal
				isLoading={isDetailLoading && !detail}
				title={`${t('Order number')}: #${updateId}`}
				style={{height: '25rem'}}
			>
				<Form
					onSubmit={
						handleEditSubmit((data) => {
							const newData = {
								stages_to_passed: Object.keys(data).filter((key) => data[key as keyof typeof data] === true)?.reverse()
							}
							update(newData).then(async () => {
								removeParams('modal', 'updateId')
								await refetch()
							})
						})
					}
				>
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
										setValueEdit('gofra', true)
										setValueEdit('ymo1', true)
										setValueEdit('fleksa', false)
										setValueEdit('ymo2', false)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', false)
									} else {
										setValueEdit('gofra', false)
										setValueEdit('ymo1', false)
										setValueEdit('fleksa', false)
										setValueEdit('ymo2', false)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', false)
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
										setValueEdit('fleksa', false)
										setValueEdit('ymo2', false)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', false)
									} else {
										setValueEdit('ymo1', false)
										setValueEdit('fleksa', false)
										setValueEdit('ymo2', false)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', true)
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
										setValueEdit('fleksa', true)
										setValueEdit('ymo2', true)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', false)
									} else {
										setValueEdit('fleksa', false)
										setValueEdit('ymo2', false)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', false)
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
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', false)
									} else {
										setValueEdit('ymo2', false)
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', true)
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
										setValueEdit('tikish', true)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', true)
									} else {
										setValueEdit('tikish', false)
										setValueEdit('yelimlash', true)
										setValueEdit('is_last', true)
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
										setValueEdit('yelimlash', true)
										setValueEdit('is_last', true)
									} else {
										setValueEdit('tikish', true)
										setValueEdit('yelimlash', false)
										setValueEdit('is_last', true)
									}
								}}
							/>
							<p className="checkbox-label">
								{t(activityOptions[5].label as string)}
							</p>
						</div>
						<div className="span-4 flex gap-md align-end justify-start">
							<input
								id={activityOptions[6].value as string}
								type="checkbox"
								className="checkbox"
								{...registerEdit('is_last')}
								onChange={() => {
									if (watchEdit('is_last')) {
										setValueEdit('is_last', true)
									} else {
										setValueEdit('is_last', false)
									}
								}}
							/>
							<p className="checkbox-label">
								{t(activityOptions[6].label as string)}
							</p>
						</div>
					</div>

					<Button
						style={{marginTop: 'auto'}}
						type={FIELD.SUBMIT}
						disabled={isUpdating}
					>
						Transfer to process
					</Button>
				</Form>
			</EditModal>
		</>
	)
}

export default Index