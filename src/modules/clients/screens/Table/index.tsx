import {Plus} from 'assets/icons'
import {
	Button,
	Card,
	DeleteButton,
	DeleteModal,
	EditButton,
	PageTitle,
	Pagination,
	ReactTable
} from 'components'
import {
	usePaginatedData,
	usePagination
} from 'hooks'
import {FC, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {IClientDetail} from 'interfaces/clients.interface'


interface IProperties {
	order?: boolean
}

const Index: FC<IProperties> = ({order = false}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IClientDetail[]>(
		'services/customers',
		{
			page: page,
			page_size: pageSize
		}
	)


	const columns: Column<IClientDetail>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IClientDetail, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '3rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Company name'),
				accessor: (row: IClientDetail) => row.company_name
			},
			{
				Header: t('Full name'),
				accessor: (row: IClientDetail) => row.fullname
			},
			{
				Header: t('Phone number'),
				accessor: (row: IClientDetail) => row.phone
			},
			{
				Header: t('Partnership year'),
				accessor: (row: IClientDetail) => row.partnership_year
			},
			{
				Header: t('TIN'),
				accessor: (row: IClientDetail) => row.stir
			},
			{
				Header: t('Actions'),
				accessor: (row: IClientDetail) => (
					<div className="flex items-start gap-lg">
						{
							order ?
								<Button onClick={() => navigate(`${row.id}`)}>
									Orders
								</Button> :
								<>
									<EditButton onClick={() => navigate(`edit/${row.id}`)}/>
									<DeleteButton id={row.id}/>
								</>
						}
					</div>
				)
			}
		],
		[t, page, pageSize, order]
	)

	return (
		<>
			<PageTitle title="Clients">
				{
					order ? <Button icon={<Plus/>} onClick={() => navigate(`add`)}>
							Add order
						</Button> :
						<Button icon={<Plus/>} onClick={() => navigate(`add`)}>
							Add client
						</Button>
				}
			</PageTitle>
			<Card>
				<ReactTable
					columns={columns}
					data={data}
					isLoading={isLoading}
				/>
			</Card>
			<Pagination totalPages={totalPages}/>
			{
				!order &&
				<DeleteModal endpoint="services/customers/" onDelete={() => refetch()}/>
			}
		</>
	)
}

export default Index