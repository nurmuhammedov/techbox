import {Loader, PageTitle} from 'components'
import {usePaginatedData, useSearchParams} from 'hooks'
import {useNavigate} from 'react-router-dom'
import DriverNav from '../components/DriverNav'
import {date, PAGE_BODY, TripBadge} from '../helpers'


type Row = Record<string, any>

const CARD = {
	display: 'flex',
	flexDirection: 'column' as const,
	gap: '.5rem',
	width: '100%',
	padding: '1rem 1.25rem',
	background: '#fff',
	border: '1px solid var(--gray-pale)',
	borderRadius: '.75rem',
	font: 'inherit',
	textAlign: 'left' as const,
	cursor: 'pointer'
}
const MUTED = {color: '#64748b', fontSize: '.875rem'}

// The driver's own trips, as cards that work on a phone
const DriverTrips = () => {
	const navigate = useNavigate()
	const {paramsObject: {tab = 'active'}} = useSearchParams()
	const history = tab === 'history'
	const {data, isPending} = usePaginatedData<Row[]>('logistics/driver/trips', {tab, page: 1, page_size: 50})
	const trips: Row[] = (data as Row[]) ?? []

	return (
		<div className="flex flex-col flex-1" style={PAGE_BODY}>
			<PageTitle/>
			{isPending ? <Loader/> : trips.length === 0 ? (
				<div style={{...CARD, cursor: 'default', alignItems: 'center', padding: '3rem 1rem'}}>
					<b>{history ? 'Yakunlangan reyslar yo‘q' : 'Sizga hozircha reys biriktirilmagan'}</b>
					<span style={MUTED}>
						{history ? 'Yakunlangan reyslar shu yerda ko‘rinadi.' : 'Logist reys tuzganda u shu yerda paydo bo‘ladi.'}
					</span>
				</div>
			) : (
				<div className="flex flex-col gap-md">
					{trips.map(trip => (
						<button key={trip.id} type="button" style={CARD} onClick={() => navigate(`/driver/trips/${trip.id}`)}>
							<div className="flex justify-between align-center gap-md">
								<b style={{fontSize: '1.0625rem'}}>{trip.trip_number}</b>
								<TripBadge status={trip.status}/>
							</div>
							<span style={MUTED}>
								{[date(trip.planned_date), trip.plate_number].filter(Boolean).join(' · ')}
							</span>
							<div className="flex justify-between" style={{fontSize: '.9375rem'}}>
								<span>{trip.stops_count} ta manzil · {trip.total_quantity} dona</span>
								<span style={MUTED}>{trip.delivered_count}/{trip.stops_count} yetkazildi</span>
							</div>
						</button>
					))}
				</div>
			)}
			<DriverNav/>
		</div>
	)
}

export default DriverTrips
