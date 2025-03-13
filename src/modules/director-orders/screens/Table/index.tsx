import {
	Button,
	Card, FilterInput,
	Pagination,
	ReactTable, Tab
} from 'components'
import {
	useActions,
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
import {statusOptions} from 'helpers/options'


const Index = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {addOrder} = useActions()
	const {paramsObject: {status = statusOptions[0].value, search = '', company = ''}} = useSearchParams()

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
						</div>
					)
				}
			] : []
		],
		[page, pageSize, status]
	)


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