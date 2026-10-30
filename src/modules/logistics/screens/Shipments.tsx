import {Plus} from 'assets/icons'
import {Button, Card, FilterInput, PageTitle, Pagination, ReactTable, Tab} from 'components'
import {usePaginatedData, usePagination, useSearchParams} from 'hooks'
import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {dateTime, index, ShipmentBadge, PAGE_FONT} from '../helpers'
import Returns from './Returns'


type Row = Record<string, any>

// A tab is a stage of the work, so it groups the statuses that belong to it
export const STAGES: Record<string, {label: string, statuses: string}> = {
	all: {label: 'Jo‘natmalar', statuses: ''},
	planned: {label: 'Tayyorlash', statuses: 'new,packed'},
	loading: {label: 'Yuklash', statuses: 'loading_queue'},
	handover: {label: 'Haydovchiga topshirish', statuses: 'loaded'},
	road: {label: 'Yo‘lda', statuses: 'in_transit'},
	done: {label: 'Yakunlangan', statuses: 'delivered,returned,cancelled'},
	returns: {label: 'Qaytarilgan tovarlar', statuses: ''}
}

const ShipmentTable = ({stage}: {stage: string}) => {
	const navigate = useNavigate()
	const {page, pageSize} = usePagination()
	const {paramsObject: {search = ''}} = useSearchParams()

	const {data, totalPages, isPending} = usePaginatedData<Row[]>('logistics/shipments', {
		page,
		page_size: pageSize,
		search,
		status: STAGES[String(stage)]?.statuses || undefined
	})

	const columns = useMemo<Column<Row>[]>(() => [
		index(page, pageSize),
		{Header: 'Jo‘natma', accessor: (r: Row) => <b>{r.shipment_number}</b>},
		{
			Header: 'Mijoz / yuk',
			accessor: (r: Row) => (
				<div>
					<div>{r.customer?.company_name || r.customer?.fullname || '-'}</div>
					<div style={{color: '#64748b', fontSize: '1.2rem'}}>
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
		{Header: 'Holati', accessor: (r: Row) => <ShipmentBadge status={r.status}/>},
		{Header: 'Yaratildi', accessor: (r: Row) => dateTime(r.created_at)},
		{
			Header: 'Amallar',
			accessor: (r: Row) => <Button onClick={() => navigate(`${r.id}`)}>Batafsil</Button>
		}
	], [page, pageSize, navigate])

	return (
		<>
			<Card style={{marginTop: '1.2rem'}}>
				<div className="flex gap-lg" style={{padding: '.8rem'}}>
					<FilterInput id="search" query="search" placeholder="Jo‘natma raqami, mijoz yoki manzil"/>
				</div>
				<ReactTable columns={columns} data={data} isLoading={isPending}/>
			</Card>
			<Pagination totalPages={totalPages}/>
		</>
	)
}

const Shipments = () => {
	const navigate = useNavigate()
	const {paramsObject: {stage = 'all'}} = useSearchParams()
	return (
		<div style={PAGE_FONT}>
			<PageTitle title="Jo‘natmalar">
				<Button icon={<Plus/>} onClick={() => navigate('add')}>Yangi jo‘natma</Button>
			</PageTitle>
			<Tab
				query="stage"
				fallbackValue="all"
				tabs={Object.entries(STAGES).map(([value, s]) => ({value, label: s.label}))}
			/>
			{stage === 'returns'
				? <div style={{marginTop: '1.2rem'}}><Returns/></div>
				: <ShipmentTable stage={String(stage)}/>}
		</div>
	)
}

export default Shipments
