import {
	Button,
	Card,
	EditButton,
	FilterInput,
	Form,
	Modal,
	NumberFormattedInput,
	Pagination,
	ReactTable,
	Select,
	Tab
} from 'components'
import {
	useData,
	usePaginatedData,
	usePagination,
	useSearchParams,
	useUpdate
} from 'hooks'
import {useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {IOrderDetail} from 'interfaces/orders.interface'
import {formatDate, getDate} from 'utilities/date'
import {decimalToInteger, formatSelectOptions2, getSelectValue} from 'utilities/common'
import {activityOptions, companyOperationsOptions} from 'helpers/options'
import {Controller, useFieldArray, useForm} from 'react-hook-form'
import {ISelectOption} from 'interfaces/form.interface'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {yupResolver} from '@hookform/resolvers/yup'
import {countSchema} from 'helpers/yup'


const Index = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {
		paramsObject: {status = companyOperationsOptions[0].value, search = '', company = '', id = ''},
		addParams,
		removeParams
	} = useSearchParams()

	const {data, totalPages, isPending: isLoading} = usePaginatedData<IOrderDetail[]>(
		`/services/orders-with-detail`,
		{
			page: page,
			page_size: pageSize,
			status,
			search,
			company
		}
	)


	const {
		handleSubmit,
		control,
		reset,
		formState: {errors}
	} = useForm({
		resolver: yupResolver(countSchema),
		mode: 'onTouched',
		defaultValues: {
			data: []
		}
	})

	const {data: rolls = []} = useData<ISelectOption[]>('/services/weight-material-list-by-order', !!id, {
		order_id: id
	})


	const {
		mutateAsync: add,
		isPending: isAdding
	} = useUpdate('products/', 'base-material-update-weight', 'put')

	const {fields} = useFieldArray({
		control,
		name: 'data' as never
	})

	useEffect(() => {
		if (rolls && id) {
			reset({
				data: rolls.map((item) => ({
					id: item.value as unknown as string,
					weight: ''
				}))
			})
		}
	}, [rolls, id])

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
				accessor: (row: IOrderDetail) => `${row.width}*${row.length}${row.height ? `*${row.height}` : ''}`
			},
			{
				Header: `${t('Format')} (${t('mm')})`,
				accessor: (row: IOrderDetail) => decimalToInteger(row.format?.name)
			},
			...status == companyOperationsOptions[0].value ? [
				{
					Header: t('Status'),
					accessor: (row: IOrderDetail) => t(activityOptions?.find(i => row.activity === i?.value)?.label?.toString() || '')
				}
			] : [
				{
					Header: `${t('Developed')} ${t('Count')?.toLowerCase()}`,
					accessor: (row: IOrderDetail) => row?.count_last || 0
				},
				{
					Header: `${t('Finished date')}`,
					accessor: (row: IOrderDetail) => row?.end_date ? formatDate(row?.end_date) : ''
				}
			],
			{
				Header: t('Actions'),
				accessor: (row: IOrderDetail) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`process/${row.id}`)}/>
						<Button
							mini={true}
							onClick={() => {
								addParams({
									modal: 'count',
									id: row?.id
								})
							}}
						>Excess roll</Button>
					</div>
				)
			}

		],
		[page, pageSize, status]
	)

	// useEffect(() => {
	// 	if (!id) {
	// 		reset({
	// 			data: []
	// 		})
	// 	}
	// }, [id])


	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab query="status" fallbackValue={companyOperationsOptions[0].value} tabs={companyOperationsOptions}/>
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
					columns={columns}
					data={data}
					isLoading={isLoading}
				/>
			</Card>
			<Pagination totalPages={totalPages}/>
			<Modal
				title={`#${id}`}
				style={{height: '40rem', width: '50rem'}}
				id="count"
			>
				<Form onSubmit={(e) => e.preventDefault()}>
					<div className="span-12 grid gap-xl flex-0">
						{
							fields?.map((field, index) => {
								return (
									<div className="grid gap-lg span-12" key={field.id}>
										<div className="span-6">
											<Controller
												name={`data.${index}.id`}
												control={control}
												render={({field: {value, ref, onChange, onBlur}}) => (
													<Select
														ref={ref}
														id={`data.${index}.id`}
														label={`${t('Roll')}`}
														disabled={true}
														options={formatSelectOptions2(rolls)}
														onBlur={onBlur}
														error={errors?.data?.[index]?.id?.message}
														value={getSelectValue(formatSelectOptions2(rolls), value)}
														defaultValue={getSelectValue(formatSelectOptions2(rolls), value)}
														handleOnChange={(e) => onChange(e as string[])}
													/>
												)}
											/>
										</div>

										<div className="span-6">
											<Controller
												control={control}
												name={`data.${index}.weight`}
												render={({field}) => (
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
									</div>
								)
							})
						}

						{
							fields?.length == 0 &&
							<h1 className="h1">{t('Rolls are not available')}</h1>
						}
					</div>
				</Form>

				<Button
					type={FIELD.BUTTON}
					theme={BUTTON_THEME.PRIMARY}
					disabled={isAdding || fields?.length == 0}
					style={{marginTop: '2rem'}}
					onClick={() => {
						handleSubmit(async (data) =>
							add(data?.data)
								.then(async () => {
									reset({
										data: []
									})
									removeParams('modal')
								})
						)()
					}}
				>
					Save
				</Button>
			</Modal>
		</>
	)
}

export default Index