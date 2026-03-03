import { Button, Card, EditButton, Pagination, ReactTable, Tab } from 'components'
import { usePaginatedData, usePagination, useSearchParams } from 'hooks'
import { IOrderDetail } from 'interfaces/orders.interface'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Column } from 'react-table'
import { getDate } from 'utilities/date'
import { decimalToInteger } from 'utilities/common'
import { operatorsStatusOptions } from 'helpers/options'
import { IGroupOrder } from 'interfaces/groupOrders.interface'
import { interceptor } from 'libraries'
import { showMessage } from 'utilities/alert'


interface IProperties {
	type?: 'gofra' | 'fleksa' | 'tikish' | 'yelimlash'
}

import CorrugationPalletsTable from '../CorrugationPalletsTable'

const Index: FC<IProperties> = ({ type = 'gofra' }) => {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const { page, pageSize } = usePagination()
	const { paramsObject: { status = operatorsStatusOptions[0].value } } = useSearchParams()

	const { data, totalPages, isPending: isLoading, refetch } = usePaginatedData<IGroupOrder[]>(
		type == 'gofra' ? 'services/consecutive-orders' : 'services/group-orders',
		{
			page: page,
			page_size: pageSize,
			activity: status != operatorsStatusOptions[2].value ? type : null,
			operator: status == operatorsStatusOptions[0].value ? 'new' : status == operatorsStatusOptions[1].value ? 'operator' : 'gofra',
			pass_activity: status == operatorsStatusOptions[2].value ? type : null
		}
	)


	const columns: Column<IGroupOrder>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IGroupOrder, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '1.5rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Order number'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order: IOrderDetail, index) => (
							<div key={order.id}>
								<div>
									#{order.id}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</div>
						))
					}
				</div>
			},
			{
				Header: t('Name'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<div key={order.id}>
								<div>
									{order?.name}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</div>
						))
					}
				</div>
			},
			{
				Header: `${t('Sizes')} (${t('mm')})`,
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<div key={order.id}>
								<div>
									{`${order.width}*${order.length}${order.height ? `*${order.height}` : ''}`}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</div>
						))
					}
				</div>
			},
			{
				Header: t('Layer'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<div key={order.id}>
								<div>
									{order?.layer?.length || order?.layer_seller?.length || 0}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</div>
						))
					}
				</div>
			},
			{
				Header: t('Count'),
				accessor: (row: IGroupOrder) => <div>
					{
						row?.orders?.map((order, index) => (
							<div key={order.id}>
								<div>
									{decimalToInteger(order?.count_last || order?.count_after_bet || order?.count_after_gluing || order?.count_after_flex || order?.count_after_processing || order?.count_entered_leader || order?.count || 0)}
								</div>
								{
									row?.orders?.length !== index + 1 &&
									<br />
								}
							</div>
						))
					}
				</div>
			},
			{
				Header: t('Yub. sana'),
				accessor: (row: IGroupOrder) => getDate(row.created_at)
			},
			...(
				status == operatorsStatusOptions[2].value ? [{
					Header: t('Yak. sana'),
					accessor: (row: IGroupOrder) => getDate(row.end_date)
				}] : []
			),
			...(
				status == operatorsStatusOptions[0].value ? [{
					Header: t('Comment'),
					accessor: (row: IGroupOrder) => <div>
						{
							row?.comment || '-'
						}
					</div>
				}] : []
			),
			{
				Header: t('Actions'),
				accessor: (row: IGroupOrder) => (
					<div className="flex items-start gap-lg">
						{
							status == operatorsStatusOptions[0].value ?
								<Button
									mini={true}
									onClick={() => {
										interceptor
											.get(`services/consecutive-orders/get-order/${row.id}`)
											.then(async () => {
												showMessage('Successful', 'success')
												await refetch()
											})
									}}
								>
									Transfer to process
								</Button> : status == operatorsStatusOptions[1].value ?
									<EditButton onClick={() => navigate(`edit/${row.id}`)} /> :
									<EditButton onClick={() => navigate(`detail/${row.id}`)} />
						}
					</div>
				)
			}
		],
		[page, pageSize, status, type]
	)

	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{ marginBottom: '.5rem' }}>
				<Tab query="status" fallbackValue={operatorsStatusOptions[0].value} tabs={operatorsStatusOptions} />
			</div>
			{status == 4 ? (
				<CorrugationPalletsTable />
			) : (
				<>
					<Card>
						<ReactTable
							columns={columns}
							data={data}
							isLoading={isLoading}
						/>
					</Card>
					<Pagination totalPages={totalPages} />
				</>
			)}
		</>
	)
}

export default Index