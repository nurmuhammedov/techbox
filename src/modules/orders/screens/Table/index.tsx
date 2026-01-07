import {Button, Card, EditButton, Loader, PageTitle, Pagination, ReactTable} from 'components'
import {useDetail, usePaginatedData, usePagination, useSearchParams} from 'hooks'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import {Column} from 'react-table'
import {IOrderDetail} from 'interfaces/orders.interface'
import {getDate} from 'utilities/date'
import {decimalToInteger, decimalToPrice} from 'utilities/common'
import {IClientDetail} from 'interfaces/clients.interface'
import {Plus} from 'assets/icons'
import {BUTTON_THEME} from 'constants/fields'


const Index = () => {
	const navigate = useNavigate()
	const {id = undefined} = useParams()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {paramsObject: {search = '', company = '', ordering = ''}} = useSearchParams()

	const {data, totalPages, isPending: isLoading} = usePaginatedData<IOrderDetail[]>(
		`services/order-list-by-customer/${id}`,
		{
			page: page,
			page_size: pageSize,
			search,
			ordering,
			company
		},
		!!id
	)

	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IClientDetail>('services/customers/', id)


	const columns: Column<IOrderDetail>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IOrderDetail, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '3rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Name'),
				accessor: (row: IOrderDetail) => row.name
			},
			{
				Header: `${t('Sizes')} (${t('mm')})`,
				accessor: (row: IOrderDetail) => `${row.width}*${row.length}${row.height ? `*${row.height}` : ''}`
			},
			{
				Header: t('Layer'),
				accessor: (row: IOrderDetail) => row?.layer_count || 0
			},
			{
				Header: t('Count'),
				accessor: (row: IOrderDetail) => decimalToInteger(row.count || ''),
				dynamicFilter: 'count'
			},
			{
				Header: t('Deadline'),
				accessor: (row: IOrderDetail) => row.deadline ? getDate(row.deadline) : null,
				dynamicFilter: 'deadline'
			},
			{
				Header: `${t('Price')} (${t('Item')?.toLowerCase()})`,
				accessor: (row: IOrderDetail) => decimalToPrice(row.price),
				dynamicFilter: 'price'
			},
			{
				Header: t('Total paid money'),
				accessor: (row: IOrderDetail) => <span
					style={{color: 'var(--green-bright)'}}>{decimalToPrice(row.money_paid)}</span>
			},
			{
				Header: t('Status'),
				accessor: (row: IOrderDetail) => row,
				rowClassName: (row: IOrderDetail) => {
					switch (row.status) {
						case 'new':
							return 'rgba(255, 0, 0, 0.12)'
						case 'in_proces':
							return 'rgba(255, 170, 0, 0.08)'
						case 'finished':
							return ' rgba(0, 180, 120, 0.08)'
						default:
							return ''
					}
				},
				dynamicFilter: 'status',
				Cell: ({value: {status: value, activity}}: { value: IOrderDetail }) => (
					<span
						style={{
							color:
								value === 'new'
									? 'var(--red)'
									: value === 'in_proces'
										? 'rgb(255, 170, 0)'
										: value === 'finished'
											? 'var(--green-bright)'
											: 'rgb(160, 160, 160)',
							fontWeight: 500
						}}
					>
    {value === 'new'
	    ? t('New')
	    : value === 'in_proces'
		    ? `${t('In progress')}/${activity ? activity?.toString()?.toUpperCase() : ''}`
		    : value === 'finished'
			    ? t('Finished')
			    : '-'}
  </span>
				)
			},
			{
				Header: t('Indebtedness'),
				accessor: (row: IOrderDetail) => <span
					style={{color: row.backlog > 0 ? 'var(--red)' : 'var(--green-bright)'}}>{decimalToPrice(row.backlog)}</span>
			},
			{
				Header: t('CreatedAt'),
				accessor: (row: IOrderDetail) => getDate(row.created_at)
			},
			{
				Header: t('Actions'),
				accessor: (row: IOrderDetail) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit/${row.id}`)}/>
					</div>
				)
			}
		],
		[t, page, pageSize]
	)

	if (isDetailLoading) return <Loader/>

	return (
		<>
			<PageTitle title={detail?.company_name ? `${detail?.company_name} ${t('company orders')}` : ''}>
				<div className="flex gap-lg align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
					<Button icon={<Plus/>} onClick={() => navigate(`add`)}>
						Create order
					</Button>
				</div>
			</PageTitle>
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