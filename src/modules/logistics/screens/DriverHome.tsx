import {Button, Loader} from 'components'
import {useData} from 'hooks'
import {useNavigate} from 'react-router-dom'
import DriverNav from '../components/DriverNav'
import {PAGE_BODY, TripBadge} from '../helpers'


type Row = Record<string, any>

const CARD = {padding: '1rem 1.25rem', background: '#fff', border: '1px solid var(--gray-pale)', borderRadius: '.75rem'}
const MUTED = {color: '#64748b', fontSize: '.875rem'}
const WEEKDAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']

const Stat = ({label, value, color}: {label: string, value: number, color: string}) => (
	<div className="flex flex-col" style={{...CARD, flex: 1, gap: '.25rem', padding: '.75rem'}}>
		<span style={MUTED}>{label}</span>
		<b style={{fontSize: '1.5rem', color}}>{value}</b>
	</div>
)

// The driver's day at a glance: what is left today, the truck, the trip on the road and the next stop
const DriverHome = () => {
	const navigate = useNavigate()
	const {data, isPending} = useData<Row>('logistics/driver/dashboard')

	if (isPending) return <Loader/>
	if (!data) {
		return (
			<div className="flex flex-col gap-md" style={PAGE_BODY}>
				<div style={CARD}>Loginingiz haydovchi yozuviga bog‘lanmagan. Logistga murojaat qiling.</div>
				<DriverNav/>
			</div>
		)
	}
	const most = Math.max(1, ...data.week.map((d: Row) => d.delivered))
	const trip = data.active_trip
	const stop = data.next_stop

	return (
		<div className="flex flex-col gap-md" style={PAGE_BODY}>
			<div className="flex flex-col" style={{gap: '.25rem'}}>
				<b style={{fontSize: '1.375rem'}}>Assalomu alaykum, {data.driver_name}!</b>
				<span style={MUTED}>Bugungi ishingiz</span>
			</div>

			<div className="flex gap-sm">
				<Stat label="Bugungi manzillar" value={data.today.total} color="#1e293b"/>
				<Stat label="Tugallangan" value={data.today.done} color="#15803d"/>
				<Stat label="Qolgan" value={data.today.left} color="#b45309"/>
			</div>

			{data.transport && (
				<div className="flex justify-between align-center" style={CARD}>
					<div className="flex flex-col">
						<b>{data.transport.model || 'Mashina'}</b>
						<span style={MUTED}>{data.transport.plate_number}</span>
					</div>
					<span style={MUTED}>{data.transport.status_display}</span>
				</div>
			)}

			{trip ? (
				<button type="button" className="flex flex-col gap-sm" onClick={() => navigate(`/driver/trips/${trip.id}`)}
					style={{...CARD, font: 'inherit', textAlign: 'left', cursor: 'pointer'}}>
					<div className="flex justify-between align-center">
						<b>Joriy reys: {trip.trip_number}</b>
						<TripBadge status={trip.status}/>
					</div>
					<span style={MUTED}>{trip.delivered_count}/{trip.stops_count} manzil · {trip.total_quantity} dona</span>
					{stop && (
						<span>Keyingi manzil: <b>{stop.factory_name || stop.customer_name}</b>{stop.factory_address ? `, ${stop.factory_address}` : ''}</span>
					)}
				</button>
			) : (
				<div style={CARD}>Hozircha sizga reys biriktirilmagan.</div>
			)}

			<div className="flex flex-col gap-sm" style={CARD}>
				<b>Oxirgi 7 kunda yetkazilgan</b>
				<div className="flex justify-between align-end" style={{height: '6rem', gap: '.5rem'}}>
					{data.week.map((d: Row) => (
						<div key={d.date} className="flex flex-col align-center justify-end" style={{flex: 1, height: '100%', gap: '.25rem'}}>
							<span style={{fontSize: '.75rem'}}>{d.delivered || ''}</span>
							<div style={{width: '100%', height: `${(d.delivered / most) * 70}%`, minHeight: '2px', background: '#2563eb', borderRadius: '.25rem'}}/>
							<span style={{...MUTED, fontSize: '.75rem'}}>{WEEKDAYS[new Date(d.date).getDay()]}</span>
						</div>
					))}
				</div>
			</div>

			{data.pending_expenses > 0 && (
				<span style={MUTED}>{data.pending_expenses} ta xarajatingiz tasdiqni kutmoqda.</span>
			)}

			<div className="flex flex-col gap-sm" style={{...CARD, background: '#fef2f2', borderColor: '#fecaca'}}>
				<b>Yo‘lda muammo bo‘ldimi?</b>
				<span style={MUTED}>Mashina buzilishi, YTH, shina teshilishi yoki tirbandlik haqida darhol xabar bering.</span>
				<Button onClick={() => navigate('/driver/incident')}>Xabar berish</Button>
			</div>

			<DriverNav/>
		</div>
	)
}

export default DriverHome
