import {BUTTON_THEME} from 'constants/fields'
import {IBaseMaterialList} from 'interfaces/materials.interface'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import {Column} from 'react-table'
import {
	Button,
	Card, PageTitle,
	Pagination,
	ReactTable
} from 'components'
import {
	usePaginatedData,
	usePagination
} from 'hooks'
import {decimalToInteger} from 'utilities/common'


const Index = () => {
	const {t} = useTranslation()
	const {id} = useParams()
	const navigate = useNavigate()
	const {page, pageSize} = usePagination()

	const {
		data: dataList,
		totalPages,
		isPending: isLoading
	} = usePaginatedData<IBaseMaterialList[]>('products/all-base-material', {
		page,
		page_size: pageSize,
		warehouse: id
	})

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
				accessor: (row: IBaseMaterialList) => decimalToInteger(row.weight || '')
			}
		],
		[t, page, pageSize]
	)
	return (
		<>
			<PageTitle title="Material warehouse">
				<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
					Back
				</Button>
			</PageTitle>
			<Card>
				<ReactTable
					columns={columns}
					data={dataList}
					isLoading={isLoading}
				/>
			</Card>
			<Pagination totalPages={totalPages}/>
		</>
	)
}

export default Index