import {
	Button,
	Card,
	EditButton,
	Pagination,
	ReactTable, Tab
} from 'components'
import {
	usePaginatedData,
	usePagination, useSearchParams
} from 'hooks'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {getDate} from 'utilities/date'
import {decimalToInteger} from 'utilities/common'
import {operatorsStatusOptions} from 'helpers/options'
import {IGroupOrder} from 'interfaces/groupOrders.interface'


const Index = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {paramsObject: {status = operatorsStatusOptions[0].value}} = useSearchParams()

	const {data, totalPages, isPending: isLoading} = usePaginatedData<IGroupOrder[]>(
		`services/group-orders`,
		{
			page: page,
			page_size: pageSize,
			is_separated: status
		}
	)


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
			// {
			// 	Header: t('Order number'),
			// 	accessor: (row: IGroupOrder) => `#${row.id}`,
			// 	style: {
			// 		width: '14rem',
			// 		textAlign: 'start'
			// 	}
			// },
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
									{`${order.length}*${order.width}*${order.height}`}
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
									{order?.layer?.length || 0}
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
									{decimalToInteger(order?.count || 0)}
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
				Header: `${t('Production format')} (${t('mm')})`,
				accessor: (row: IGroupOrder) => decimalToInteger(row.separated_raw_materials_format?.format)
			},
			{
				Header: t('Actions'),
				accessor: (row: IGroupOrder) => (
					<div className="flex items-start gap-lg">
						{
							status == operatorsStatusOptions[0].value ?
								<Button
									mini={true}
									onClick={() => {
										navigate(`edit/${row.id}`)
									}}
								>
									Choosing
								</Button> :
								<EditButton onClick={() => navigate(`detail/${row.id}`)}/>
						}
					</div>
				)
			}
		],
		[page, pageSize, status]
	)


	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab query="status" fallbackValue={operatorsStatusOptions[0].value} tabs={operatorsStatusOptions}/>
			</div>
			<Card>
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