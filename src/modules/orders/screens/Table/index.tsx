import {
	Button,
	Card,
	DeleteButton, DeleteModal,
	EditButton,
	Loader,
	PageTitle,
	Pagination,
	ReactTable
} from 'components'
import {
	useDetail,
	usePaginatedData,
	usePagination
} from 'hooks'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import {Column} from 'react-table'
import {IOrderDetail} from 'interfaces/orders.interface'
import {getDate} from 'utilities/date'
import {decimalToPrice} from 'utilities/common'
import {IClientDetail} from 'interfaces/clients.interface'
import {Plus} from 'assets/icons'


const Index = () => {
	const navigate = useNavigate()
	const {id = undefined} = useParams()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IOrderDetail[]>(
		`services/order-list-by-customer/${id}`,
		{
			page: page,
			page_size: pageSize
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
				Header: t('Product'),
				accessor: (row: IOrderDetail) => row.product as unknown as string
			},
			{
				Header: t('Count'),
				accessor: (row: IOrderDetail) => row.count
			},
			{
				Header: t('Deadline'),
				accessor: (row: IOrderDetail) => row.deadline ? getDate(row.deadline) : null
			},
			{
				Header: t('Price'),
				accessor: (row: IOrderDetail) => decimalToPrice(row.price)
			},
			{
				Header: t('Paid money'),
				accessor: (row: IOrderDetail) => decimalToPrice(row.money_paid)
			},
			{
				Header: t('Comment'),
				accessor: (row: IOrderDetail) => row.comment
			},
			{
				Header: t('Actions'),
				accessor: (row: IOrderDetail) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit/${row.id}`)}/>
						<DeleteButton id={row.id}/>
					</div>
				)
			}
		],
		[t, page, pageSize]
	)

	if (isDetailLoading) return <Loader screen/>

	return (
		<>
			<PageTitle title={detail?.company_name ? `${detail?.company_name} ${t('company orders')}` : ''}>
				<Button icon={<Plus/>} onClick={() => navigate(`add`)}>
					Create order
				</Button>
			</PageTitle>
			<Card>
				<ReactTable
					columns={columns}
					data={data}
					isLoading={isLoading}
				/>
			</Card>
			<Pagination totalPages={totalPages}/>
			<DeleteModal endpoint="services/orders/" onDelete={() => refetch()}/>
		</>
	)
}

export default Index