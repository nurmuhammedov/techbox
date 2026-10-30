import {Plus} from 'assets/icons'
import {Button, Card, FilterInput, PageTitle, Pagination, ReactTable} from 'components'
import {usePaginatedData, usePagination, useSearchParams} from 'hooks'
import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {dateTime, index, ShipmentBadge, PAGE_BODY} from '../helpers'
import Returns from './Returns'
import Trips from './Trips'
import WarehouseDashboard from './WarehouseDashboard'


type Row = Record<string, any>

// A stage of the work groups the statuses that belong to it
const STAGES: Record<string, string> = {
	all: '',
	planned: 'new,packed',
	loading: 'loading_queue',
	handover: 'loaded',
	road: 'in_transit',
	done: 'delivered,returned,cancelled'
}

const ShipmentTable = ({stage}: {stage: string}) => {
	const navigate = useNavigate()
	const {page, pageSize} = usePagination()
	const {paramsObject: {search = ''}} = useSearchParams()

	const {data, totalPages, isPending} = usePaginatedData<Row[]>('logistics/shipments', {
		page,
		page_size: pageSize,
		search,
		status: STAGES[stage] || undefined
	})

	const columns = useMemo<Column<Row>[]>(() => [
		index(page, pageSize),
		{Header: 'Jo‘natma', accessor: (r: Row) => <b>{r.shipment_number}</b>},
		{
			Header: 'Mijoz / yuk',
			accessor: (r: Row) => (
				<div>
					<div>{r.customer?.company_name || r.customer?.fullname || '-'}</div>
					<div style={{color: '#64748b', fontSize: '.8125rem'}}>
						{[r.sold_order?.order_name, r.dimensions].filter(Boolean).join(' · ')}
					</div>
				</div>
			)
		},
		{
			Header: 'Miqdor',
			accessor: (r: Row) => r.loaded_quantity != null && r.loaded_quantity !== r.quantity
				? `${r.loaded_quantity} / ${r.quantity} dona`
				: `${r.quantity} dona`
		},
		{Header: 'Manzil', accessor: (r: Row) => r.client_factory?.name || r.destination_address || '-'},
		{
			Header: 'Reja',
			accessor: (r: Row) => [r.planned_date, r.planned_time?.slice(0, 5)].filter(Boolean).join(' ') || '-'
		},
		{
			Header: 'Mashina / haydovchi',
			accessor: (r: Row) => [r.transport_plate_number, r.driver_name].filter(Boolean).join(' · ') || '-'
		},
		{Header: 'Reys', accessor: (r: Row) => r.trip_number || '-'},
		{Header: 'Holati', accessor: (r: Row) => <ShipmentBadge status={r.status}/>},
		{Header: 'Yaratildi', accessor: (r: Row) => dateTime(r.created_at)},
		{
			Header: 'Amallar',
			accessor: (r: Row) => <Button onClick={() => navigate(`${r.id}`)}>Batafsil</Button>
		}
	], [page, pageSize, navigate])

	return (
		<>
			<Card>
				<div className="flex gap-lg" style={{padding: '.8rem'}}>
					<FilterInput id="search" query="search" placeholder="Qidirish"/>
				</div>
				<ReactTable columns={columns} data={data} isLoading={isPending}/>
			</Card>
			<Pagination totalPages={totalPages}/>
		</>
	)
}

const Shipments = () => {
	const navigate = useNavigate()
	const {paramsObject: {stage = 'overview'}} = useSearchParams()
	const current = String(stage)
	return (
		<div className="flex flex-col flex-1" style={PAGE_BODY}>
			<PageTitle>
				{current === 'trips'
					? <Button icon={<Plus/>} onClick={() => navigate('trips/add')}>Yangi reys</Button>
					: <Button icon={<Plus/>} onClick={() => navigate('add')}>Yangi jo‘natma</Button>}
			</PageTitle>
			{current === 'overview' && <WarehouseDashboard/>}
			{current === 'returns' && <Returns/>}
			{current === 'trips' && <Trips/>}
			{current in STAGES && <ShipmentTable stage={current}/>}
		</div>
	)
}

export default Shipments
