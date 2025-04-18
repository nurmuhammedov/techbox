import {
	Card,
	EditButton,
	FilterInput,
	Pagination,
	ReactTable,
	Tab
} from 'components'
import {
	usePaginatedData,
	usePagination, useSearchParams
} from 'hooks'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {IOrderDetail} from 'interfaces/orders.interface'
import {getDate} from 'utilities/date'
import {decimalToInteger} from 'utilities/common'
import {activityOptions, companyOperationsOptions} from 'helpers/options'


const Index = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {paramsObject: {status = companyOperationsOptions[0].value, search = '', company = ''}} = useSearchParams()

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
			...status == companyOperationsOptions[0].value ? [
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
			{
				Header: t('Actions'),
				accessor: (row: IOrderDetail) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`process/${row.id}`)}/>
					</div>
				)
			}

		],
		[page, pageSize, status]
	)


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
		</>
	)
}

export default Index