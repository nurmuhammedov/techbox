import {
	Button,
	Card,
	EditButton,
	Pagination,
	ReactTable,
	Tab
} from 'components'
import {
	usePaginatedData,
	usePagination, useSearchParams
} from 'hooks'
import {IOrderDetail} from 'interfaces/orders.interface'
import {interceptor} from 'libraries'
import {FC, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {showMessage} from 'utilities/alert'
import {getDate} from 'utilities/date'
import {decimalToInteger} from 'utilities/common'
import {flexOperatorsStatusOptions} from 'helpers/options'


interface IProperties {
	type?: 'fleksa' | 'tikish' | 'yelimlash'
}

const Index: FC<IProperties> = ({type = 'fleksa'}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {paramsObject: {status = flexOperatorsStatusOptions[0].value}} = useSearchParams()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IOrderDetail[]>(
		'services/orders/list-for-proces',
		{
			page: page,
			page_size: pageSize,
			state: type || null,
			activity: status || null
		}
	)


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
			{
				Header: t('Company name'),
				accessor: (row: IOrderDetail) => row?.company_name
			},
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
				Header: t('Deadline'),
				accessor: (row: IOrderDetail) => row?.deadline ? getDate(row?.deadline) : null
			},
			{
				Header: t('Actions'),
				accessor: (row: IOrderDetail) => (
					<div className="flex items-start gap-lg">
						{
							status == flexOperatorsStatusOptions[0].value ?
								<Button
									mini={true}
									onClick={() => {
										interceptor
											.get(`services/orders/send-next-stag/${row.id}`)
											.then(async () => {
												showMessage('Successful', 'success')
												await refetch()
											})
									}}
								>
									Transfer to process
								</Button> :
								status == flexOperatorsStatusOptions[1].value ?
									<Button
										mini={true}
										onClick={() => {
											navigate(`edit/${row.id}`)
										}}
									>
										Choosing
									</Button> :
									<EditButton onClick={() => navigate(`detail/${row.id}`)}/>
						}
					</div>
				)
			}
		],
		[page, pageSize, status, type]
	)

	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab query="status" fallbackValue={flexOperatorsStatusOptions[0].value}
				     tabs={flexOperatorsStatusOptions}/>
			</div>
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