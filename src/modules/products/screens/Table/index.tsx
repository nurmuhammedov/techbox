import {Plus} from 'assets/icons'
import {
	Button,
	Card,
	EditButton,
	PageTitle,
	Pagination,
	ReactTable
} from 'components'
import {
	usePaginatedData,
	usePagination
} from 'hooks'
import {IProductDetail} from 'interfaces/products.interface'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'


const Index = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()

	const {data, totalPages, isPending: isLoading} = usePaginatedData<IProductDetail[]>(
		'products/',
		{
			page: page,
			page_size: pageSize
		}
	)


	const columns: Column<IProductDetail>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IProductDetail, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '3rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Full name'),
				accessor: (row: IProductDetail) => row.name
			},
			{
				Header: t('Size'),
				accessor: (row: IProductDetail) => row.size
			},
			{
				Header: t('Format'),
				accessor: (row: IProductDetail) => row.format
			},
			{
				Header: t('Layers'),
				accessor: (row: IProductDetail) => row.layers
			},
			{
				Header: t('Actions'),
				accessor: (row: IProductDetail) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit/${row.id}`)}/>
					</div>
				)
			}
		],
		[t, page, pageSize]
	)

	return (
		<>
			<PageTitle title="Products">
				<Button icon={<Plus/>} onClick={() => navigate(`add`)}>
					Add product
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
		</>
	)
}

export default Index