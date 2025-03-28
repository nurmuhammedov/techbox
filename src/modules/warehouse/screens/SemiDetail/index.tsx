import {BUTTON_THEME} from 'constants/fields'
import {activityOptions} from 'helpers/options'
import {IOrderDetail} from 'interfaces/orders.interface'
import {IWarehouseDetail} from 'interfaces/warehouse.interface'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import {Column} from 'react-table'
import {
	Button,
	Card, Loader, PageTitle,
	Pagination,
	ReactTable
} from 'components'
import {
	useDetail,
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
	} = usePaginatedData<IOrderDetail[]>('products/in-ymo-orders', {
		page,
		page_size: pageSize,
		warehouse_same_finished: id
	})

	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IWarehouseDetail>('accounts/warehouses/same-finished/', id)


	const columns: Column<IOrderDetail>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IOrderDetail, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '1.5rem',
					textAlign: 'center'
				}
			},
			// {
			// 	Header: t('Company name'),
			// 	accessor: (row: IOrderDetail) => row?.company_name
			// },
			{
				Header: t('Name'),
				accessor: (row: IOrderDetail) => row?.name
			},
			{
				Header: `${t('Sizes')} (${t('mm')})`,
				accessor: (row: IOrderDetail) => `${row.length}*${row.width}*${row.height}`
			},
			{
				Header: t('Layer'),
				accessor: (row: IOrderDetail) => row?.layer?.length || 0
			},
			{
				Header: t('Count'),
				accessor: (row: IOrderDetail) => decimalToInteger(row?.count || 0)
			},
			{
				Header: t('Corrugation'),
				accessor: (row: IOrderDetail) => decimalToInteger(row?.count_after_processing || 0)
			},
			{
				Header: t('Flex'),
				accessor: (row: IOrderDetail) => decimalToInteger(row?.count_after_flex || 0)
			},
			{
				Header: t('Status'),
				accessor: (row: IOrderDetail) => t(activityOptions?.find(i => row.activity === i?.value)?.label?.toString() || '')
			}
		],
		[page, pageSize]
	)

	if (isDetailLoading && !detail) {
		return <Loader/>
	}

	return (
		<>
			<PageTitle title={`${t('Semi-finished warehouse')} - ${detail?.name}`}>
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