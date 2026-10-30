import {Button, Card, Pagination, ReactTable} from 'components'
import {usePaginatedData, usePagination} from 'hooks'
import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {date, index, money, TripBadge} from '../helpers'


type Row = Record<string, any>

const Trips = () => {
	const navigate = useNavigate()
	const {page, pageSize} = usePagination()
	const {data, totalPages, isPending} = usePaginatedData<Row[]>('logistics/trips', {page, page_size: pageSize})

	const columns = useMemo<Column<Row>[]>(() => [
		index(page, pageSize),
		{Header: 'Reys', accessor: (r: Row) => <b>{r.trip_number}</b>},
		{Header: 'Mashina', accessor: (r: Row) => r.plate_number || '-'},
		{Header: 'Haydovchi', accessor: (r: Row) => r.driver_name || '-'},
		{Header: 'Sana', accessor: (r: Row) => date(r.planned_date)},
		{Header: 'Manzillar', accessor: (r: Row) => `${r.delivered_count} / ${r.stops_count}`},
		{Header: 'Miqdor', accessor: (r: Row) => `${money(r.total_quantity)} dona`},
		{Header: 'Holati', accessor: (r: Row) => <TripBadge status={r.status}/>},
		{
			Header: 'Amallar',
			accessor: (r: Row) => <Button onClick={() => navigate(`trips/${r.id}`)}>Batafsil</Button>
		}
	], [page, pageSize, navigate])

	return (
		<>
			<Card>
				<ReactTable columns={columns} data={data} isLoading={isPending}/>
			</Card>
			<Pagination totalPages={totalPages}/>
		</>
	)
}

export default Trips
