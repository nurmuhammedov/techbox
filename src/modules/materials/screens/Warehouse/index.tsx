import {Plus} from 'assets/icons'
import {Button, Card, EditButton, PageTitle, Pagination, ReactTable} from 'components'
import {usePaginatedData, usePagination} from 'hooks'
import {IBaseMaterialList} from 'interfaces/materials.interface'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {decimalToInteger} from 'utilities/common'
import {getDate} from 'utilities/date'


const Index = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()

	const {data, totalPages, isPending: isLoading} = usePaginatedData<IBaseMaterialList[]>(
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
				Header: `${t('Total weight')} (${t('kg')})`,
				accessor: (row: IBaseMaterialList) => decimalToInteger(row.weight as unknown as string || '')
			},
			{
				Header: `${t('Roll')} ${t('Count')}`,
				accessor: (row: IBaseMaterialList) => row.count
			},
			{
				Header: `${t('Date')}`,
				accessor: (row: IBaseMaterialList) => getDate(row.created_at) || ''
			},
			{
				Header: t('Actions'),
				accessor: (row: IBaseMaterialList) => <div className="flex items-start gap-lg">
					<EditButton
						onClick={() => navigate(`edit/${row.id || 'detail'}?created_at=${row?.created_at}&warehouse=${row?.warehouse?.id}&format=${row?.format?.id}&material=${row?.material?.id}`)}/>
					{/*<DeleteButton id={row.id}/>*/}
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
			{/*<DeleteModal endpoint="products/base-materials/" onDelete={() => refetch()}/>*/}
		</>
	)
}

export default Index