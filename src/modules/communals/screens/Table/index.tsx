import {Plus} from 'assets/icons'
import {
	Button,
	Card,
	DeleteButton,
	DeleteModal,
	EditButton,
	PageTitle,
	Pagination,
	ReactTable,
	Tab
} from 'components'
import {
	usePaginatedData,
	usePagination,
	useSearchParams
} from 'hooks'
import {FC, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {ICommunalResource, ICommunalTariff, ICommunalReport} from 'interfaces/communals.interface'
import {decimalToPrice} from 'utilities/common'


const Index: FC = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()

	const communalTabs = [
		{value: 'resources', label: t('Resources')},
		{value: 'tariffs', label: t('Tariflar')},
		{value: 'reports', label: t('Hisobotlar')}
	]
	const {page, pageSize} = usePagination()
	const {paramsObject: {tab = 'resources'}} = useSearchParams()

	const endpoint = useMemo(() => {
		if (tab === 'tariffs') return 'communal/tariffs/'
		if (tab === 'reports') return 'communal/reports/'
		return 'communal/resources/'
	}, [tab])

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<any[]>(
		endpoint,
		{
			page: page,
			page_size: pageSize,
		}
	)


	const resourceColumns: Column<ICommunalResource>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: ICommunalResource, index: number) => (page - 1) * pageSize + (index + 1),
				style: {width: '3rem', textAlign: 'center'}
			},
			{
				Header: t('Name'),
				accessor: (row: ICommunalResource) => row.name
			},
			{
				Header: t('Unit'),
				accessor: (row: ICommunalResource) => row.unit_of ? t(row.unit_of) : '-'
			},
			{
				Header: t('Type'),
				accessor: (row: ICommunalResource) => t(row.type)
			},
			{
				Header: t('Actions'),
				accessor: (row: ICommunalResource) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit/${row.id}`)}/>
						<DeleteButton id={row.id}/>
					</div>
				)
			}
		],
		[t, page, pageSize, navigate]
	)

	const tariffColumns: Column<ICommunalTariff>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: ICommunalTariff, index: number) => (page - 1) * pageSize + (index + 1),
				style: {width: '3rem', textAlign: 'center'}
			},
			{
				Header: t('Resource'),
				accessor: (row: ICommunalTariff) => (typeof row.resource === 'object' ? row.resource.name : row.resource)
			},
			{
				Header: t('From value'),
				accessor: (row: ICommunalTariff) => row.from_value
			},
			{
				Header: t('To value'),
				accessor: (row: ICommunalTariff) => row.to_value || '∞'
			},
			{
				Header: t('Price'),
				accessor: (row: ICommunalTariff) => decimalToPrice(row.price)
			},
			{
				Header: t('Actions'),
				accessor: (row: ICommunalTariff) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit-tariff/${row.id}`)}/>
						<DeleteButton id={row.id} endpoint="communal/tariffs/"/>
					</div>
				)
			}
		],
		[t, page, pageSize, navigate]
	)

	const reportColumns: Column<ICommunalReport>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: ICommunalReport, index: number) => (page - 1) * pageSize + (index + 1),
				style: {width: '3rem', textAlign: 'center'}
			},
			{
				Header: t('Resource'),
				accessor: (row: ICommunalReport) => (typeof row.resource === 'object' ? row.resource.name : row.resource)
			},
			{
				Header: t('Period'),
				accessor: (row: ICommunalReport) => {
					const months = [
						t('Yanvar'), t('Fevral'), t('Mart'), t('Aprel'), t('May'), t('Iyun'),
						t('Iyul'), t('Avgust'), t('Sentabr'), t('Oktabr'), t('Noyabr'), t('Dekabr')
					];
					return (row.month && row.year) ? `${months[row.month - 1]} ${row.year}` : '-';
				}
			},
			{
				Header: t('Meter value'),
				accessor: (row: ICommunalReport) => row.meter_value
			},
			{
				Header: t('Usage'),
				accessor: (row: ICommunalReport) => row.consumption || '-'
			},
			{
				Header: t('Total price'),
				accessor: (row: ICommunalReport) => decimalToPrice(row.total_price || 0)
			},
			{
				Header: t('Amount paid'),
				accessor: (row: ICommunalReport) => decimalToPrice(row.amount_paid)
			},
			{
				Header: t('Actions'),
				accessor: (row: ICommunalReport) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit-report/${row.id}`)}/>
						<DeleteButton id={row.id} endpoint="communal/reports/"/>
					</div>
				)
			}
		],
		[t, page, pageSize, navigate]
	)

	const columns = useMemo(() => {
		if (tab === 'tariffs') return tariffColumns
		if (tab === 'reports') return reportColumns
		return resourceColumns
	}, [tab, resourceColumns, tariffColumns, reportColumns])

	return (
		<>
			<div className="flex justify-between items-center" style={{marginBottom: '1rem'}}>
				<Tab query="tab" fallbackValue="resources" tabs={communalTabs} />
				<Button icon={<Plus/>} onClick={() => navigate(`add${tab === 'resources' ? '' : `-${tab.slice(0, -1)}`}`)}>
					{t('Add')}
				</Button>
			</div>
			<Card>
				<ReactTable
					columns={columns}
					data={data}
					isLoading={isLoading}
				/>
			</Card>
			<Pagination totalPages={totalPages}/>
			<DeleteModal endpoint={endpoint} onDelete={() => refetch()}/>
		</>
	)
}

export default Index
