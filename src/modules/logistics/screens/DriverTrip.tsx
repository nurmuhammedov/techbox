import {Button, Loader, PageTitle} from 'components'
import {BUTTON_THEME} from 'constants/fields'
import {useDetail} from 'hooks'
import interceptor from 'libraries/interceptor'
import {useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {showMessage} from 'utilities/alert'
import SignaturePad from '../components/SignaturePad'
import {date, dateTime, PAGE_BODY, ShipmentBadge, TripBadge} from '../helpers'


type Row = Record<string, any>

const CARD = {padding: '1rem 1.25rem', background: '#fff', border: '1px solid var(--gray-pale)', borderRadius: '.75rem'}
const MUTED = {color: '#64748b', fontSize: '.875rem'}

const Stop = ({stop, position, onDeliver, onReject}: {
	stop: Row,
	position: number,
	onDeliver: () => void,
	onReject: () => void
}) => {
	const open = stop.status === 'in_transit'
	const phone = stop.factory_phone || stop.phone
	const sent = stop.loaded_quantity ?? stop.quantity
	return (
		<div className="flex flex-col gap-sm" style={CARD}>
			<div className="flex justify-between align-center gap-md">
				<b>{position}. {stop.factory_name || stop.customer_name}</b>
				<ShipmentBadge status={stop.status}/>
			</div>
			<span>{stop.factory_address || stop.destination_address || '-'}</span>
			<span style={MUTED}>
				{[stop.customer_name, stop.order_name, `${sent} dona`].filter(Boolean).join(' · ')}
			</span>
			{(phone || stop.maps_url) && (
				<div className="flex gap-lg" style={{fontSize: '.9375rem'}}>
					{phone && <a href={`tel:${String(phone).replace(/[^\d+]/g, '')}`}>{phone}</a>}
					{stop.maps_url && <a href={stop.maps_url} target="_blank" rel="noreferrer">Xaritada ochish</a>}
				</div>
			)}
			{stop.status === 'delivered' && (
				<span style={MUTED}>
					{dateTime(stop.delivered_at)} · {stop.receiver_name}
					{stop.returned_quantity > 0 && ` · ${stop.returned_quantity} dona qaytdi`}
				</span>
			)}
			{stop.status === 'returned' && (
				<span style={MUTED}>
					{dateTime(stop.delivered_at)} · {sent} dona qaytdi{stop.delivery_comment ? ` · ${stop.delivery_comment}` : ''}
				</span>
			)}
			{open && (
				<div className="flex gap-md" style={{marginTop: '.5rem'}}>
					<Button style={{flex: 1}} onClick={onDeliver}>Yetkazildi</Button>
					<Button style={{flex: 1}} theme={BUTTON_THEME.DANGER_OUTLINE} onClick={onReject}>Qabul qilmadi</Button>
				</div>
			)}
		</div>
	)
}

const DriverTrip = () => {
	const {id} = useParams()
	const navigate = useNavigate()
	const {data: trip, isPending, refetch} = useDetail<Row>('logistics/driver/trips/', id)
	const [signature, setSignature] = useState<string | null>(null)
	const [busy, setBusy] = useState(false)

	if (isPending || !trip) return <Loader/>

	const accept = () => {
		if (!signature) return showMessage('Imzo qo‘ying', 'error')
		setBusy(true)
		interceptor.post(`logistics/driver/trips/${id}/accept`, {signature_image: signature})
			.then(() => {
				showMessage('Yuk qabul qilindi, oq yo‘l!', 'success')
				return refetch()
			})
			.finally(() => setBusy(false))
	}

	const stops: Row[] = trip.stops ?? []
	return (
		<div className="flex flex-col gap-md" style={PAGE_BODY}>
			<PageTitle>
				<Button theme={BUTTON_THEME.OUTLINE} onClick={() => navigate('/driver')}>Orqaga</Button>
			</PageTitle>

			<div className="flex flex-col gap-sm" style={CARD}>
				<div className="flex justify-between align-center gap-md">
					<b style={{fontSize: '1.125rem'}}>{trip.trip_number}</b>
					<TripBadge status={trip.status}/>
				</div>
				<span style={MUTED}>{[date(trip.planned_date), trip.plate_number].filter(Boolean).join(' · ')}</span>
				<span>{trip.stops_count} ta manzil · {trip.total_quantity} dona · {trip.delivered_count} ta yetkazildi</span>
				{trip.comment && <span style={MUTED}>{trip.comment}</span>}
			</div>

			{trip.status === 'planned' && (
				<div style={{...CARD, background: '#eff6ff', color: '#1e3a8a'}}>
					Reys hali yuklanmagan. Ombor yuklab bo‘lgach, shu yerda imzo qo‘yib qabul qilasiz.
				</div>
			)}

			{trip.status === 'loaded' && (
				<div className="flex flex-col gap-md" style={CARD}>
					<b>Yukni qabul qilish</b>
					<span style={MUTED}>Yukni sanab ko‘ring. Hammasi to‘g‘ri bo‘lsa, imzo qo‘yib yo‘lga chiqing.</span>
					<SignaturePad onChange={setSignature}/>
					<Button disabled={busy} onClick={accept}>Qabul qildim, yo‘lga chiqaman</Button>
				</div>
			)}

			<b style={{marginTop: '.5rem'}}>Manzillar</b>
			{stops.map((stop, i) => (
				<Stop
					key={stop.id}
					stop={stop}
					position={i + 1}
					onDeliver={() => navigate(`stops/${stop.id}?action=deliver`)}
					onReject={() => navigate(`stops/${stop.id}?action=reject`)}
				/>
			))}
		</div>
	)
}

export default DriverTrip
