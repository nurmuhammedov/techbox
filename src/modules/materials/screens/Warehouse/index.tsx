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
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {Plus} from 'assets/icons'
import {IBaseMaterialList} from 'interfaces/materials.interface'
import {decimalToInteger} from 'utilities/common'


const Index = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IBaseMaterialList[]>(
		`products/base-materials`,
		{
			page: page,
			page_size: pageSize
		}
	)

	const columns: Column<IBaseMaterialList>[] = useMemo(
		() => [

			{
				Header: t('№'),
				accessor: (_: IBaseMaterialList, index: number) => ((page - 1) * pageSize) + (index + 1),
				style: {
					width: '3rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Name'),
				accessor: (row: IBaseMaterialList) => row.material?.name
			},
			{
				Header: `${t('Warehouse')}`,
				accessor: (row: IBaseMaterialList) => row.warehouse?.name || ''
			},
			{
				Header: `${t('Format')} (${t('mm')})`,
				accessor: (row: IBaseMaterialList) => decimalToInteger(row?.format?.format || '')
			},
			{
				Header: t('Count'),
				accessor: (row: IBaseMaterialList) => decimalToInteger(row.count || '')
			},
			{
				Header: `${t('Total weight')} (${t('kg')})`,
				accessor: (row: IBaseMaterialList) => decimalToInteger(row.weight || '')
			},
			{
				Header: `${t('Date')}`,
				accessor: (row: IBaseMaterialList) => row.created_at || ''
			},
			{
				Header: t('Actions'),
				accessor: (row: IBaseMaterialList) => <div className="flex items-start gap-lg">
					<EditButton onClick={() => navigate(`edit/${row.id}`)}/>
					<DeleteButton id={row.id}/>
				</div>
			}
		],
		[t, page, pageSize]
	)

	return (
		<>
			<PageTitle title={t('Material')}>
				<Button icon={<Plus/>} onClick={() => navigate(`add`)}>
					Add material
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
			<DeleteModal endpoint="products/base-materials/" onDelete={() => refetch()}/>
		</>
	)
}

export default Index