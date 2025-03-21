import {BUTTON_THEME} from 'constants/fields'
import {activityOptions} from 'helpers/options'
import {IOrderDetail} from 'interfaces/orders.interface'
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
	} = usePaginatedData<IOrderDetail[]>('products/finished-orders', {
		page,
		page_size: pageSize,
		warehouse_finished: id
	})

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
				accessor: (row: IOrderDetail) => `${row?.width}*${row?.height}*${row?.length}`
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
				Header: t('Sewing'),
				accessor: (row: IOrderDetail) => decimalToInteger(row?.count_after_bet || 0)
			},
			{
				Header: t('Gluing'),
				accessor: (row: IOrderDetail) => decimalToInteger(row?.count_after_gluing || 0)
			},
			{
				Header: t('Status'),
				accessor: (row: IOrderDetail) => t(activityOptions?.find(i => row.activity === i?.value)?.label?.toString() || '')
			}
		],
		[page, pageSize]
	)

	return (
		<>
			<PageTitle title="Ready-made warehouse">
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