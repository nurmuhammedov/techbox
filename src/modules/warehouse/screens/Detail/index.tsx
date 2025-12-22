import {BUTTON_THEME} from 'constants/fields'
import {IBaseMaterialList} from 'interfaces/materials.interface'
import {IWarehouseDetail} from 'interfaces/warehouse.interface'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import {Column} from 'react-table'
import {Button, Card, Loader, PageTitle, Pagination, ReactTable, Tab} from 'components'
import {useDetail, usePaginatedData, usePagination} from 'hooks'
import {decimalToInteger} from 'utilities/common'
import {ISelectOption} from 'interfaces/form.interface'
import useCustomSearchParams from 'hooks/useSearchParams'
import Filter from 'components/Filter'


const Index = () => {
	const {t} = useTranslation()
	const {id} = useParams()
	const navigate = useNavigate()
	const {paramsObject: {tab = 'remained', format = '', ...rest}} = useCustomSearchParams()
	const {page, pageSize} = usePagination()

	const {
		data: dataList,
		totalPages,
		isPending: isLoading
	} = usePaginatedData<IBaseMaterialList[]>('products/all-base-material', {
		page,
		page_size: pageSize,
		warehouse: id,
		remaining: tab == 'remained',
		format_: format,
		...rest
	})

	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IWarehouseDetail>('accounts/warehouses/', id)


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
				Header: `${t('Roll')} ${t('Count')?.toLowerCase()}`,
				accessor: (row: IBaseMaterialList) => row?.count
			}
		],
		[t, page, pageSize]
	)

	if (isDetailLoading && !detail) {
		return <Loader/>
	}

	const tabOptions: ISelectOption[] = [
		{label: 'Remained materials', value: 'remained'},
		{label: 'Used materials', value: 'topcoder'}
	]

	return (
		<>
			<PageTitle style={{marginBottom: ''}} title={`${t('Material warehouse')} - ${detail?.name}`}>
				<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
					Back
				</Button>
			</PageTitle>
			<div style={{marginBottom: '.5rem'}}>
				<Tab fallbackValue={tabOptions[0]?.value} tabs={tabOptions}/>
			</div>
			<Card>
				<Filter fieldsToShow={['material', 'format']}/>
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